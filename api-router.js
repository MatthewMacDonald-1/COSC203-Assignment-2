const express = require('express');
const pool = require('./db');
const router = express.Router();
const path = require('path');

router.get('/', async (request, response) => {
    response.send('<h1>Welcome to the Birds of Aotearoa API</h1>')
});

router.get('/birds', async (request, response) => {
    const db = pool.promise();

    console.log(request.query);

    let values = [];
    let params = [];
    if (request.query.family != -1) {
        params.push(`b.family=?`);
        values.push(request.query.family);
    }
    if (request.query.order != -1) {
        params.push(`b.order_name=?`);
        values.push(request.query.order);
    }
    if (request.query.conservation_status != -1) {
        if (!isNaN(request.query.conservation_status)) {
            params.push(`b.status_id=?`);
            values.push(request.query.conservation_status);
        } else {
            params.push(`ConservationStatus.status_name LIKE ?`);
            values.push(`%` + request.query.conservation_status + `%`);
        }
    }
    if (request.query.search != -1) {
        let searchQ = [];
        const fields = ['b.primary_name', 'b.english_name', 'b.scientific_name', 'b.order_name', 'b.family', 'b.weight', 'b.length', 'c.status_name', 'p.photographer'];
   
        for (let i = 0; i < fields.length; i++) {
            searchQ.push(fields[i] + ` LIKE ?`);
            values.push(`%` + request.query.search + `%`);
        }
        params.push(`(` + searchQ.join(` OR `) + `)`);
    }


    let params_all = params.join(` AND `)

    const query = `SELECT b.*, c.*, p.filename, p.photographer FROM Bird b LEFT JOIN Photos p ON b.bird_id=p.bird_id LEFT JOIN ConservationStatus c ON b.status_id=c.status_id` + (params.length > 0 ? ` WHERE ` + params_all : ``) + `;`;
    console.log(query)
    const [rows, fields] = await db.query(query, values);

    response.header('Access-Control-Allow-Origin', '*');
    response.header('Content-Type', 'application/json');
    response.status(200);
    response.send(JSON.stringify(rows));
});

module.exports = router;