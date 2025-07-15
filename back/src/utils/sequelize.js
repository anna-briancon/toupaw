const { Sequelize } = require("sequelize");
const { mysqlUrl } = require("./config");

const sequelize = new Sequelize(mysqlUrl, {
  logging: false,
});

module.exports = sequelize;
