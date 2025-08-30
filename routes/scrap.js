const express = require('express');
const { all } = require('../controllers/scrap');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const router = express.Router();

// router.get('/all', isAuthenticated, all);
router.get('/all', all);

module.exports = router;