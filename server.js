const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const sequelize = require('./db');

// Создаем Express приложение
const app = express();

// Используем промежуточные обработчики
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// Папка со статическими файлами
const staticPath = path.join(__dirname, 'site');
app.use(express.static(staticPath));

// Импорт и использование маршрутов для API
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'mainpage.html'));
});

// Маршрут для страницы выбора опроса
app.get('/propala', (req, res) => {
    res.sendFile(path.join(staticPath, 'propala.html'));
});

// Динамические маршруты для опросов
app.get('/propala/kto_ty_is_:survey', (req, res) => {
    const surveyName = req.params.survey;
    const surveyFilePath = path.join(staticPath, `${surveyName}.html`);

    // Проверка, существует ли файл
    if (fs.existsSync(surveyFilePath)) {
        res.sendFile(surveyFilePath);
    } else {
        res.status(404).send('Опрос не найден');
    }
});

// Обработка необработанных ошибок
app.use((err, req, res, next) => {
    logger.error(err.message, err);
    res.status(500).send('Произошла ошибка.');
});

// Синхронизация базы данных и запуск сервера
const all_ip = '0.0.0.0';
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
