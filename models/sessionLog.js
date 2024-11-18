const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SessionLog = sequelize.define('SessionLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ipAddress: DataTypes.STRING,
    sessionStart: DataTypes.DATE
});

module.exports = SessionLog;
