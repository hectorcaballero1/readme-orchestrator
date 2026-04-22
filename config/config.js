require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8004,
  jwtSecret: process.env.JWT_SECRET,
  ms1Url: process.env.MS1_URL || 'http://localhost:8001',
  ms2Url: process.env.MS2_URL || 'http://localhost:8002',
  ms3Url: process.env.MS3_URL || 'http://localhost:8003',
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'ReadMe <onboarding@resend.dev>',
};
