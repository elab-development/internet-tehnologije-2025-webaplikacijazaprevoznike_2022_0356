const express = require('express');
const { listCountries, getCountryByCode } = require('../controllers/countriesController');

const router = express.Router();

// Public, read-only endpoints
router.get('/', listCountries);
router.get('/:code', getCountryByCode);

module.exports = router;

