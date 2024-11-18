const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const Session = require('../models/session');
const SessionLog = require('../models/sessionLog');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const getSessionsCountForLastHour = async (ip) => {
    try {
        const oneHourAgo = moment().subtract(1, 'hours').toDate();

        const sessionsCount = await SessionLog.count({
            where: {
                ipAddress: ip,
                sessionStart: {
                    [Op.gt]: oneHourAgo
                }
            }
        });

        console.log('sessionsCount:', sessionsCount);
        return sessionsCount;
    } catch (error) {
        console.error('Ошибка при подсчёте сессий:', error);
        return 0;
    }
};

exports.startSession = async (req, res) => {
console.log('startSession');
    try {
        const ip = req.clientIp;
        const sessionCount = await getSessionsCountForLastHour(ip);

        if (sessionCount >= 5) {
            logger.warn('Превышен лимит сессий для IP:', ip);
            return res.status(429).json({ message: 'Превышен лимит сессий. Пожалуйста, попробуйте позже.' });
        }

        const sessionId = uuidv4();
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        let userAgent = req.headers['user-agent'] || '';
        userAgent = userAgent.replace(/,/g, '').substring(0, 50);

        await Session.create({
            sessionId,
            timestamp,
            ip,
            userAgent,
            name: null,
            reachedFinal: false,
            linkClicked: false,
            streaming: null
        });

        await SessionLog.create({ ipAddress: ip, sessionStart: new Date() });
        logger.info('Сессия начата:', sessionId);

        res.json({ sessionId });
    } catch (error) {
        logger.error('Ошибка создания сессии:', error);
        res.status(500).json({ message: 'Ошибка создания сессии' });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { name, reachedFinal, linkClicked, streaming } = req.body;

        const session = await Session.findByPk(sessionId);

        if (!session) {
            logger.warn('Сессия не найдена:', sessionId);
            return res.sendStatus(404);
        }

        if (name) session.name = name;
        if (reachedFinal !== undefined) session.reachedFinal = reachedFinal;
        if (linkClicked !== undefined) session.linkClicked = linkClicked;
        if (streaming) session.streaming = streaming;

        await session.save();
        logger.info('Запись обновлена:', sessionId);

        res.sendStatus(200);
    } catch (error) {
        logger.error('Ошибка обновления сессии:', error);
        res.status(500).json({ message: 'Ошибка обновления сессии' });
    }
};
