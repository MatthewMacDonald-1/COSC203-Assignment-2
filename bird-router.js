const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'file-temp-uploads/' });
const pool = require('./db');
const router = express.Router();
const path = require('path');

const fs = require('node:fs');

router.get('/', async (request, response) => {
    /* conservation status from mysql */
    const db = pool.promise();
    
    /* REPLACE THE .json WITH A MYSQL DATABASE */
    const all_birds_query = `SELECT b.*, c.*, p.filename, p.photographer FROM Bird b LEFT JOIN Photos p ON b.bird_id=p.bird_id LEFT JOIN ConservationStatus c ON b.status_id=c.status_id;`;
    const [bird_data, birds_fields] = await db.query(all_birds_query);
    const birds = bird_data;
    
    // console.log(birds)
    /* bind data to the view (index.ejs) */
    response.render('index', { title: 'Birds of Aotearoa', birds: birds, filterData: await getFamilyOrderConStatus() });
});

router.get('/create', (request, response) => {    
    response.render('create', { title: 'Create new bird'});
});

router.get('/:id', async (request, response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(request.params.id)) { // checking against raw parameter as parseint can coerce values like 69a to 69 int
        response.status(404);
        response.render('404', { title: "This bird does not exist" });
        return;
    }
    // do query and return
    const db = pool.promise();
    const stmt = `SELECT b.*, c.*, p.filename, p.photographer FROM Bird b LEFT JOIN Photos p ON b.bird_id=p.bird_id LEFT JOIN ConservationStatus c ON b.status_id=c.status_id WHERE b.bird_id=?;`;
    const [bird_data, birds_fields] = await db.query(stmt, [id]);
    const bird = bird_data[0];

    if (bird == undefined) {
        response.status(404);
        response.render('404', { title: "This bird does not exist" });
        return;
    }

    response.header('Access-Control-Allow-Origin', '*');
    response.status(200);
    response.render('view-bird', { title: 'Birds of Aotearoa', bird: bird, bird_id: id });
});

router.get('/:id/update', async (request, response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(request.params.id)) { // checking against raw parameter as parseint can coerce values like 69a to 69 int
        response.status(404);
        response.render('404', { title: 'This bird does not exist'});
        return;
    }
    // do query and return
    const db = pool.promise();
    const stmt = `SELECT b.*, c.*, p.filename, p.photographer FROM Bird b LEFT JOIN Photos p ON b.bird_id=p.bird_id LEFT JOIN ConservationStatus c ON b.status_id=c.status_id WHERE b.bird_id=?;`;
    const [bird_data, birds_fields] = await db.query(stmt, [id]);
    const bird = bird_data[0];

    if (bird == undefined) {
        response.status(404);
        response.render('404', { title: "This bird does not exist" });
        return;
    }

    response.header('Access-Control-Allow-Origin', '*');
    response.status(200);
    response.render('update', { title: 'Birds of Aotearoa', bird: bird, bird_id: bird.bird_id })
});

router.post('/create', upload.single('photo_upload'), async (request, response) => {
    let raw_data = request.body;
    let image = request.file;

    const db = pool.promise();
    const stmt = "INSERT INTO Bird (primary_name, english_name, scientific_name, order_name, family, weight, length, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    let birds_id = null;

    const statQ = `Select * From ConservationStatus Where status_name=?`;
    const [rows_1, fields_1] = await db.query(statQ, [raw_data.status_name]);

    raw_data.status_id = rows_1[0].status_id;

    console.log(raw_data);

    try {
        const [rows, fields] = await db.query(stmt, [raw_data.primary_name, raw_data.english_name, raw_data.scientific_name, raw_data.order_name, raw_data.family, raw_data.weight, raw_data.length, raw_data.status_id]);
        console.log(rows);
        birds_id = rows.insertId;
    } catch (err) {
        response.header('Access-Control-Allow-Origin', '*');
        response.status(500);
        
        if (err.errno) {
            response.send(JSON.stringify({ error: "Unknown database error." }));
            // response.send(JSON.stringify(err));
            return;
        } else {
            response.send(JSON.stringify({ error: "Unknown database error." }));
            return;
        }
    }

    if (image !== undefined) {
        const fileType = image.originalname.split('.')[image.originalname.split('.').length - 1];
        const updateQ = `INSERT INTO Photos (photographer, filename, bird_id) Values (?, ?, ?);`;
        const [rows_2, fields_2] = await db.query(updateQ, [raw_data.photographer, (image.filename + '.' + fileType), birds_id]);
        uploadedImageHandler(image);
    }
    
    response.header('Access-Control-Allow-Origin', '*');
    response.status(200);
    response.redirect('/');
});

router.delete('/:id/delete', async (request, response) => {

    const db = pool.promise();
    try {
        const deleteEntry = `DELETE FROM Photos WHERE bird_id=?; DELETE FROM Bird WHERE bird_id=?`;
        const [rows, fields] = await db.query(deleteEntry, [parseInt(request.params.id, 10), parseInt(request.params.id, 10)]);
        // console.log(rows);
    } catch (err) {
        // do nothing
        console.log(err);
    }
    console.log("success")
    response.header('Access-Control-Allow-Origin', '*');
    response.status(204);
    response.send();
});

router.post('/edit', upload.single('photo_upload'), async (request, response) => {
    let raw_data = request.body;
    let image = request.file;

    if (isNaN(raw_data.bird_id)) {
        response.status(404);
        response.send("<h1>404 Page Not Found</h1>");
        return;
    }

    const db = pool.promise();

    const statQ = `Select * From ConservationStatus Where status_name=?`;
    const [rows_1, fields_1] = await db.query(statQ, [raw_data.status_name]);

    raw_data['status_id'] = rows_1[0].status_id;

    const stmt = `UPDATE Bird SET bird_id=?, primary_name=?, english_name=?, scientific_name=?, order_name=?, family=?, weight=?, length=?, status_id=? WHERE bird_id=?;`;
    const [rows, fields] = await db.query(stmt, [raw_data.bird_id, raw_data.primary_name, raw_data.english_name, raw_data.scientific_name, raw_data.order_name, raw_data.family, raw_data.weight, raw_data.length, raw_data.status_id, raw_data.bird_id]);

    const updateIQ = `UPDATE Photos SET photographer=? WHERE bird_id=?;`;
    const [rows_3, fields_3] = await db.query(updateIQ, [raw_data.photographer, raw_data.bird_id]);

    if (image !== undefined) {
        const fileType = image.originalname.split('.')[image.originalname.split('.').length - 1];

        const [rowC, fieldC] = await db.query(`SELECT * FROM Photos WHERE bird_id=?`, [raw_data.bird_id]);

        if (rowC.length > 0) {
            const updateQ = `UPDATE Photos SET photographer=?, filename=? WHERE bird_id=?;`;
            const [rows_2, fields_2] = await db.query(updateQ, [raw_data.photographer, (image.filename + '.' + fileType), raw_data.bird_id]);
        } else { // If there is no entry for this bird create one
            const insertQ = `INSERT INTO Photos (photographer, filename, bird_id) VALUES (?, ?, ?);`;
            const [rows_2, fields_2] = await db.query(insertQ, [raw_data.photographer, (image.filename + '.' + fileType), raw_data.bird_id]);
        }
        uploadedImageHandler(image);
    } // put the image in the correct place

    response.header('Access-Control-Allow-Origin', '*');
    response.status(200);
    response.redirect('/');
});

function uploadedImageHandler(imageFile) {
    const fileType = imageFile.originalname.split('.')[imageFile.originalname.split('.').length - 1];

    const raw_upload_file = fs.readFileSync(path.join(__dirname, 'file-temp-uploads', imageFile.filename), { encoding: 'binary' });
    
    fs.writeFile(path.join(__dirname, 'public', 'images', imageFile.filename + '.' + fileType), raw_upload_file, 'binary', (err) => {
        if (err) throw err
    }); // write file to new location

    fs.unlinkSync(path.join(__dirname, 'file-temp-uploads', imageFile.filename)); // delete upload temp file
}

async function getFamilyOrderConStatus() {
    const db = pool.promise();
    const familyOrderQ = `SELECT Bird.order_name, Bird.family FROM Bird;`;
    const consStatusQ = `SELECT c.status_name FROM ConservationStatus c`;

    const [consStatusRows, fields1] = await db.query(consStatusQ);
    const [orderFamilyRows, fields2] = await db.query(familyOrderQ);

    let data = {
        'ConservationStatus': consStatusRows,
        'orders': [],
        'familys': []
    };

    for (let i = 0; i < orderFamilyRows.length; i++) {
        if (!data.orders.includes(orderFamilyRows[i].order_name)) {
            data.orders.push(orderFamilyRows[i].order_name);
        }
        if (!data.familys.includes(orderFamilyRows[i].family)) {
            data.familys.push(orderFamilyRows[i].family);
        }
    }

    data.orders.sort();
    data.familys.sort();

    return data;
}

module.exports = router;