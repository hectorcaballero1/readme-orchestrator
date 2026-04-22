const axios = require('axios');
const { ms1Url } = require('../config/config');

const getUser = async (userId, token) => {
  const res = await axios.get(`${ms1Url}/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

module.exports = { getUser };
