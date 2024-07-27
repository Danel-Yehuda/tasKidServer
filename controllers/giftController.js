require('dotenv').config();
const { dbConnection } = require('../db_connection');


exports.getGifts = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        const [gifts] = await connection.execute(
            'SELECT * FROM tbl_109_gift'
        );

        await connection.end();
        res.status(200).send({ data: gifts });
    } catch (error) {
        console.error("Error fetching gifts:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.createGift = async (req, res) => {
    const { gift_id, user_id, gift_name, coin_cost } = req.body;
    console.log(req.body);
    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'INSERT INTO tbl_109_gift (gift_id, user_id, gift_name, coin_cost VALUES (?, ?, ?, ?)',
            [gift_id, user_id, gift_name, coin_cost]
        );

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_gift WHERE gift_id = ?',
            [result.insertId]
        );

        const gift = rows[0];
        await connection.end();
        res.status(201).send({ data: gift });
    } catch (error) {
        console.error("Error creating gift:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.deleteGift = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'DELETE FROM tbl_109_gift WHERE gift_id = ?',
            [id]
        );

        await connection.end();
        if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Gift not found' });
        } else {
            res.status(200).send({ message: 'Gift deleted successfully' });
        }
    } catch (error) {
        console.error("Error deleting gift:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.updatePublishTask = async (req, res) => {
    const { id } = req.params;
    const { gift_name, coin_cost } = req.body;
    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'UPDATE tbl_109_gift SET gift_name = ?, coin_cost = ? WHERE gift_id = ?',
            [gift_name, coin_cost, gift_id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Gift not found' });
        }

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_gift WHERE gift_id = ?',
            [id]
        );

        const updatedGift = rows[0];
        await connection.end();
        res.status(200).send({ data: updatedGift });
    } catch (error) {
        console.error("Error updating gift:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};