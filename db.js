const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('opioomdb', 'db_user', '1qaz@WSXdbNEW', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;
