const { Resend } = require('resend');
const { resendApiKey, emailFrom } = require('../config/config');
const templates = require('../templates/emailTemplates');

let resend;
const getResend = () => {
  if (!resend) resend = new Resend(resendApiKey);
  return resend;
};

const sendEmail = (to, { subject, html }) =>
  getResend().emails.send({ from: emailFrom, to, subject, html });

const sendNewRequestNotification = ({ sellerEmail, buyerName, bookTitle }) =>
  sendEmail(sellerEmail, templates.newRequest({ buyerName, bookTitle }));

const sendRequestAcceptedNotification = ({ buyerEmail, sellerName, bookTitle }) =>
  sendEmail(buyerEmail, templates.requestAccepted({ sellerName, bookTitle }));

const sendRequestRejectedNotification = ({ buyerEmail, sellerName, bookTitle }) =>
  sendEmail(buyerEmail, templates.requestRejected({ sellerName, bookTitle }));

module.exports = {
  sendNewRequestNotification,
  sendRequestAcceptedNotification,
  sendRequestRejectedNotification,
};
