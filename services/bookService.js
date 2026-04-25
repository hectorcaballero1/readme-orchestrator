const axios = require('axios');
const { ms2Url } = require('../config/config');

const getBook = async (bookId, token) => {
  const res = await axios.get(`${ms2Url}/api/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const getBookOwner = async (bookId, token) => {
  const res = await axios.get(`${ms2Url}/api/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const setBookUnavailable = async (bookId, token) => {
  const res = await axios.put(
    `${ms2Url}/api/books/${bookId}/availability`,
    { available: false },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

const createTransaction = async (bookId, buyerId, sellerId, token) => {
  const res = await axios.post(
    `${ms2Url}/api/transactions`,
    { book_id: bookId, buyer_id: buyerId, seller_id: sellerId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

module.exports = { getBook, getBookOwner, setBookUnavailable, createTransaction };
