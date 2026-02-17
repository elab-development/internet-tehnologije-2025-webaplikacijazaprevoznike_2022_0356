const express = require('express');
const { auth } = require('../middlewares/auth');
const { getLocations } = require('../controllers/mapController');

const router = express.Router();

router.get('/locations', auth, getLocations);

module.exports = router;
