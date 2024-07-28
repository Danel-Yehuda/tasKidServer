require('dotenv').config();
const { dbConnection } = require('../db_connection');

// Controller to get all kids
exports.getKids = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        
        const [kids] = await connection.execute(
            'SELECT * FROM tbl_109_kids'
        );
        
        await connection.end();
        res.status(200).send({ data: kids });
    } catch (error) {
        console.error("Error fetching kids:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to create a new kid
exports.createKid = async (req, res) => {
    const { kid_name, parent_email, parent_id, kid_coins, kid_tasks_done } = req.body;
    console.log(req.body);
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_kids (kid_name, parent_email, parent_id, kid_coins, kid_tasks_done) VALUES (?, ?, ?, ?, ?)',
            [kid_name, parent_email, parent_id, kid_coins, kid_tasks_done]
        );
        
        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_kids WHERE kid_id = ?',
            [result.insertId]
        );
        
        const kid = rows[0];
        await connection.end();
        res.status(201).send({ data: kid });
    } catch (error) {
        console.error("Error creating kid:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to delete a kid by ID
exports.deleteKid = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'DELETE FROM tbl_109_kids WHERE kid_id = ?',
            [id]
        );
        
        await connection.end();
        if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Kid not found' });
        } else {
            res.status(200).send({ message: 'Kid deleted successfully' });
        }
    } catch (error) {
        console.error("Error deleting kid:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to update a kid by ID
exports.updateKid = async (req, res) => {
    const { id } = req.params;
    const { kid_name, kid_coins, kid_tasks_done } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'UPDATE tbl_109_kids SET kid_name = ?, kid_coins = ?, kid_tasks_done = ? WHERE kid_id = ?',
            [kid_name, kid_coins, kid_tasks_done, id]
        );
        
        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Kid not found' });
        }

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_kids WHERE kid_id = ?',
            [id]
        );

        const updatedKid = rows[0];
        await connection.end();
        res.status(200).send({ data: updatedKid });
    } catch (error) {
        console.error("Error updating kid:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
