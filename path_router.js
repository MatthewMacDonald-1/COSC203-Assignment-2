const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'file-temp-uploads/' })
const pool = require('./db');
const router = express.Router();
const path = require('path');

const fs = require('node:fs');

router.get('/', async (request, response) => {
    response.redirect('/birds')
});

router.use('/birds', require('./bird-router'));
router.use('/api', require('./api-router'));

router.get('*', async (request, response) => {
    response.status(404);
    response.render('404', { title: '404 Page Not Found'});
});

module.exports = router;