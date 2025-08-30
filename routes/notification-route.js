const express = require('express');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const {NotificationController } = require('../controllers/notification-controller.js')

const router = express.Router();

router.get('/', isAuthenticated, NotificationController.prototype.getNotify);

router.patch('/updateAll', isAuthenticated, NotificationController.prototype.updateNotify);

module.exports = router;