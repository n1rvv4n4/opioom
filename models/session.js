const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Session = sequelize.define('Session', {
    sessionId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    timestamp: DataTypes.STRING,
    ip: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    name: DataTypes.STRING,
    reachedFinal: DataTypes.BOOLEAN,
    linkClicked: DataTypes.BOOLEAN,
    streaming: DataTypes.STRING
});

module.exports = Session;
