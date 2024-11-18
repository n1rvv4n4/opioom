const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const fs = require('fs');
const path = require('path');

// Импорт логгера
const logger = require('./utils/logger');

// Подключение к базе данных
const sequelize = require('./db'); // путь к вашему файлу конфигурации sequelize

// Создаем Express приложение
const app = express();

// Используем промежуточные обработчики
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// Импорт и использование маршрутов
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// Обработка необработанных ошибок
app.use((err, req, res, next) => {
    logger.error(err.message, err);
    res.status(500).send('Something failed.');
});

// Синхронизация базы данных и запуск сервера

const all_ip = '0.0.0.0'
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const serverIP = config.serverIP;
const ServerPort = config.ServerPort;

sequelize.sync()
    .then(() => {
        logger.info('База данных синхронизирована');
        app.listen(ServerPort, all_ip, () => {
            logger.info(`Сервер запущен на ${all_ip}:${ServerPort}`);
        });
    })
    .catch((error) => {
        logger.error('Ошибка синхронизации базы данных:', error);
    });
