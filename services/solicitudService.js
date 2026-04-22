const axios = require('axios');
const { ms3Url } = require('../config/config');

const createSolicitud = async (bookId, buyerId, sellerId, message, token) => {
  const res = await axios.post(
    `${ms3Url}/api/solicitudes`,
    {
      book_id: bookId,
      buyer_id: buyerId,
      seller_id: sellerId,
      messages: [{ from: buyerId, text: message, date: new Date().toISOString() }],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

const getSolicitud = async (solicitudId, token) => {
  const res = await axios.get(`${ms3Url}/api/solicitudes/${solicitudId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const updateSolicitudStatus = async (solicitudId, status, token) => {
  const res = await axios.put(
    `${ms3Url}/api/solicitudes/${solicitudId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// TODO: MS3 must implement GET /api/solicitudes?book_id=X&buyer_id=Y&status=pendiente
// Required for duplicate validation and bulk rejection on accept.
const findSolicitudes = async (params, token) => {
  const res = await axios.get(`${ms3Url}/api/solicitudes`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

module.exports = { createSolicitud, getSolicitud, updateSolicitudStatus, findSolicitudes };
