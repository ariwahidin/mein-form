const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const xlsx = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.post('/inbound', (req, res) => {
    const { inboundNumber, serialNumber } = req.body;

    console.log(inboundNumber);
    console.log(serialNumber);

    // return;

    const insertSerialSql = 'INSERT INTO serial_numbers (serial_number, inbound_number) VALUES (?, ?)';
    pool.query(insertSerialSql, [serialNumber, inboundNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: results.insertId });
    });
});

router.post('/inbound/get', (req, res) => {
    const { inboundNumber, serialNumber } = req.body;

    const findInboundIdSql = 'SELECT * FROM serial_numbers WHERE inbound_number = ?';
    pool.query(findInboundIdSql, [inboundNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ data: results });
    });
});

router.post('/inbound/delete', (req, res) => {
    const { id } = req.body;
    const deleteSql = 'DELETE FROM serial_numbers WHERE id = ?';
    pool.query(deleteSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ success: true });
    });
});


router.get('/download/:inboundNumber', (req, res) => {
    const inboundNumber = req.params.inboundNumber;

    const findInboundIdSql = 'SELECT id FROM serial_numbers WHERE inbound_number = ?';
    pool.query(findInboundIdSql, [inboundNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Inbound number not found' });
        }

        const inboundId = results[0].id;
        const findSerialsSql = 'SELECT * FROM serial_numbers WHERE inbound_number = ?';
        pool.query(findSerialsSql, [inboundNumber], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const data = results.map((row, index) => ({
                No: index + 1,
                InboundNumber: row.inbound_number,
                SerialNumber: row.serial_number
            }));

            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(wb, ws, 'Serial Numbers');

            const tempDir = os.tmpdir();
            const filePath = path.join(tempDir, `${inboundNumber}_serial_numbers.xlsx`);
            xlsx.writeFile(wb, filePath);

            res.download(filePath, `${inboundNumber}_serial_numbers.xlsx`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }

                // Hapus file setelah diunduh
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting temp file:', err);
                    }
                });
            });
        });
    });
});

module.exports = router;
