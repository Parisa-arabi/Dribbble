// config.js

require('dotenv').config(); // بارگذاری متغیرهای محیطی از فایل .env

module.exports = {
  // اتصال به MongoDB
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/yourDatabaseName',

  // تنظیمات سکیوریتی یا توکن‌ها (در صورت نیاز)
  secretOrKey: process.env.SECRET_OR_KEY || 'yourSecretKey',

  // تنظیمات سرور (در صورت نیاز)
  serverPort: process.env.PORT || 5000,

  // تنظیمات دیگر (مانند ایمیل، پیامک، و غیره)
  emailService: process.env.EMAIL_SERVICE || 'yourEmailService',
  emailUser: process.env.EMAIL_USER || 'yourEmail@example.com',
  emailPass: process.env.EMAIL_PASS || 'yourEmailPassword'
};
