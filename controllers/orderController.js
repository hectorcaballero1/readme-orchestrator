const { getBook, setBookUnavailable, createTransaction } = require('../services/bookService');
const { getUser } = require('../services/userService');
const {
  createSolicitud,
  getSolicitud,
  updateSolicitudStatus,
  findSolicitudes,
} = require('../services/solicitudService');
const {
  sendNewRequestNotification,
  sendRequestAcceptedNotification,
  sendRequestRejectedNotification,
} = require('../services/emailService');

const createOrder = async (req, res) => {
  const { book_id, message } = req.body;
  const buyerId = req.userId;
  const token = req.token;

  if (!book_id || !message) {
    return res.status(400).json({ error: 'book_id y message son requeridos' });
  }

  let book;
  try {
    book = await getBook(book_id, token);
  } catch {
    return res.status(502).json({ error: 'Error al obtener el libro' });
  }

  if (!book || !book.active) {
    return res.status(400).json({ error: 'El libro no existe o no está activo' });
  }
  if (!book.available) {
    return res.status(400).json({ error: 'El libro no está disponible' });
  }

  const sellerId = book.user_id;

  if (String(buyerId) === String(sellerId)) {
    return res.status(400).json({ error: 'No puedes solicitar tu propio libro' });
  }

  try {
    await getUser(buyerId, token);
  } catch {
    return res.status(502).json({ error: 'Error al validar el comprador' });
  }

  // TODO: depends on MS3 implementing GET /api/solicitudes?book_id&buyer_id&status
  try {
    const existing = await findSolicitudes({ book_id, buyer_id: buyerId, status: 'pendiente' }, token);
    const list = Array.isArray(existing) ? existing : existing?.data ?? [];
    if (list.length > 0) {
      return res.status(409).json({ error: 'Ya tienes una solicitud pendiente para este libro' });
    }
  } catch {
    // If MS3 doesn't support filtered queries yet, skip duplicate check
  }

  let solicitud;
  try {
    solicitud = await createSolicitud(book_id, buyerId, sellerId, message, token);
  } catch {
    return res.status(502).json({ error: 'Error al crear la solicitud' });
  }

  try {
    const seller = await getUser(sellerId, token);
    const buyer = await getUser(buyerId, token);
    await sendNewRequestNotification({
      sellerEmail: seller.email,
      sellerName: seller.name,
      buyerName: buyer.name,
      bookTitle: book.title,
    });
  } catch {
    // Email failure is non-blocking
  }

  return res.status(201).json({ data: solicitud, message: 'Solicitud creada exitosamente' });
};

const acceptOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const token = req.token;

  let solicitud;
  try {
    solicitud = await getSolicitud(id, token);
  } catch {
    return res.status(502).json({ error: 'Error al obtener la solicitud' });
  }

  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

  if (String(solicitud.seller_id) !== String(userId)) {
    return res.status(403).json({ error: 'Solo el vendedor puede aceptar esta solicitud' });
  }
  if (solicitud.status !== 'pendiente') {
    return res.status(400).json({ error: 'Solo se pueden aceptar solicitudes pendientes' });
  }

  let updated;
  try {
    updated = await updateSolicitudStatus(id, 'aceptada', token);
  } catch {
    return res.status(502).json({ error: 'Error al actualizar el estado de la solicitud' });
  }

  try {
    await createTransaction(solicitud.book_id, solicitud.buyer_id, solicitud.seller_id, token);
  } catch {
    return res.status(502).json({ error: 'Error al registrar la transacción' });
  }

  try {
    await setBookUnavailable(solicitud.book_id, token);
  } catch {
    return res.status(502).json({ error: 'Error al actualizar disponibilidad del libro' });
  }

  // Bulk reject other pending requests for the same book
  // TODO: depends on MS3 implementing GET /api/solicitudes?book_id&status
  try {
    const others = await findSolicitudes({ book_id: solicitud.book_id, status: 'pendiente' }, token);
    const list = Array.isArray(others) ? others : others?.data ?? [];
    const rejectPromises = list
      .filter((s) => String(s._id || s.id) !== String(id))
      .map((s) => updateSolicitudStatus(s._id || s.id, 'rechazada', token).catch(() => {}));
    await Promise.all(rejectPromises);

    // Nice-to-have: notify rejected buyers
    const book = await getBook(solicitud.book_id, token).catch(() => null);
    const seller = await getUser(solicitud.seller_id, token).catch(() => null);
    if (book && seller) {
      await Promise.all(
        list
          .filter((s) => String(s._id || s.id) !== String(id))
          .map(async (s) => {
            const buyer = await getUser(s.buyer_id, token).catch(() => null);
            if (buyer?.email) {
              await sendRequestRejectedNotification({
                buyerEmail: buyer.email,
                buyerName: buyer.name,
                sellerName: seller.name,
                bookTitle: book.title,
              }).catch(() => {});
            }
          })
      );
    }
  } catch {
    // Bulk rejection is best-effort; don't fail the main flow
  }

  // Notify accepted buyer
  try {
    const buyer = await getUser(solicitud.buyer_id, token);
    const book = await getBook(solicitud.book_id, token);
    const seller = await getUser(solicitud.seller_id, token);
    await sendRequestAcceptedNotification({
      buyerEmail: buyer.email,
      buyerName: buyer.name,
      sellerName: seller.name,
      bookTitle: book.title,
    });
  } catch {
    // Email failure is non-blocking
  }

  return res.json({ data: updated, message: 'Solicitud aceptada' });
};

const rejectOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const token = req.token;

  let solicitud;
  try {
    solicitud = await getSolicitud(id, token);
  } catch {
    return res.status(502).json({ error: 'Error al obtener la solicitud' });
  }

  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

  if (String(solicitud.seller_id) !== String(userId)) {
    return res.status(403).json({ error: 'Solo el vendedor puede rechazar esta solicitud' });
  }
  if (solicitud.status !== 'pendiente') {
    return res.status(400).json({ error: 'Solo se pueden rechazar solicitudes pendientes' });
  }

  let updated;
  try {
    updated = await updateSolicitudStatus(id, 'rechazada', token);
  } catch {
    return res.status(502).json({ error: 'Error al actualizar el estado de la solicitud' });
  }

  try {
    const buyer = await getUser(solicitud.buyer_id, token);
    const book = await getBook(solicitud.book_id, token);
    const seller = await getUser(solicitud.seller_id, token);
    await sendRequestRejectedNotification({
      buyerEmail: buyer.email,
      buyerName: buyer.name,
      sellerName: seller.name,
      bookTitle: book.title,
    });
  } catch {
    // Email failure is non-blocking
  }

  return res.json({ data: updated, message: 'Solicitud rechazada' });
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const token = req.token;

  let solicitud;
  try {
    solicitud = await getSolicitud(id, token);
  } catch {
    return res.status(502).json({ error: 'Error al obtener la solicitud' });
  }

  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

  if (String(solicitud.buyer_id) !== String(userId)) {
    return res.status(403).json({ error: 'Solo el comprador puede cancelar esta solicitud' });
  }
  if (solicitud.status !== 'pendiente') {
    return res.status(400).json({ error: 'Solo se pueden cancelar solicitudes pendientes' });
  }

  let updated;
  try {
    updated = await updateSolicitudStatus(id, 'cancelada', token);
  } catch {
    return res.status(502).json({ error: 'Error al actualizar el estado de la solicitud' });
  }

  return res.json({ data: updated, message: 'Solicitud cancelada' });
};

module.exports = { createOrder, acceptOrder, rejectOrder, cancelOrder };
