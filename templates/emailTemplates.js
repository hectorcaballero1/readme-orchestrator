const newRequest = ({ buyerName, bookTitle }) => ({
  subject: `ReadMe: Nueva solicitud para tu libro '${bookTitle}'`,
  html: `
    <p>Hola,</p>
    <p><strong>${buyerName}</strong> está interesado en tu libro <strong>'${bookTitle}'</strong>.</p>
    <p>Ingresa a ReadMe para ver la solicitud y responder.</p>
  `,
});

const requestAccepted = ({ sellerName, bookTitle }) => ({
  subject: `ReadMe: ¡Tu solicitud fue aceptada!`,
  html: `
    <p>Hola,</p>
    <p><strong>${sellerName}</strong> aceptó tu solicitud para el libro <strong>'${bookTitle}'</strong>.</p>
    <p>Coordinen la entrega a través del hilo de mensajes.</p>
  `,
});

const requestRejected = ({ sellerName, bookTitle }) => ({
  subject: `ReadMe: Solicitud rechazada`,
  html: `
    <p>Hola,</p>
    <p><strong>${sellerName}</strong> rechazó tu solicitud para el libro <strong>'${bookTitle}'</strong>.</p>
    <p>Puedes seguir explorando otros libros en ReadMe.</p>
  `,
});

module.exports = { newRequest, requestAccepted, requestRejected };
