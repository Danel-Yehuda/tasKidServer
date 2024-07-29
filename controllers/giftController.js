const { dbConnection } = require('../db_connection');

exports.getGifts = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        const [gifts] = await connection.execute('SELECT * FROM tbl_109_gift');
        await connection.end();
        res.status(200).send({ data: gifts });
    } catch (error) {
        console.error("Error fetching gifts:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.createGift = async (req, res) => {
    console.log('Request body:', req.body); // Log the request body for debugging

    const { gift_name, coin_cost, user_id } = req.body;

    // Validate inputs
    if (!gift_name || coin_cost === undefined || !user_id) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'INSERT INTO tbl_109_gift (gift_name, coin_cost, user_id) VALUES (?, ?, ?)',
            [gift_name, coin_cost, user_id]
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

exports.editGift = async (req, res) => {
    const { id } = req.params;
    const { gift_name, coin_cost } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        const [result] = await connection.execute(
            'UPDATE tbl_109_gift SET gift_name = ?, coin_cost = ? WHERE gift_id = ?',
            [gift_name, coin_cost, id]
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
