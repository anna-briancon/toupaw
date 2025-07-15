require('dotenv').config();

module.exports = {
  mysqlUrl: process.env.MYSQL_URL,
  appPort: process.env.APP_PORT || 3000,
}; 