const express = require('express');
const router = express.Router();
const { startSession, updateSession } = require('../controllers/sessionController');

router.get('/startSession', startSession);
router.post('/updateSession/:sessionId', updateSession);

module.exports = router;
