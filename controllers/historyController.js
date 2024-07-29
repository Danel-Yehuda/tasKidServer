require('dotenv').config();
const { dbConnection } = require('../db_connection');

// Controller to get all history entries
exports.getHistory = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        const [history] = await connection.execute('SELECT * FROM tbl_109_history');
        await connection.end();
        res.status(200).send({ data: history });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to create a new history entry
exports.createHistory = async (req, res) => {
    const { date, kid, action, publish_task_name } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_history (date, kid, action, publish_task_name) VALUES (?, ?, ?, ?)',
            [date, kid, action, publish_task_name]
        );
        
        const [rows] = await connection.execute('SELECT * FROM tbl_109_history WHERE history_id = ?', [result.insertId]);
        
        const historyEntry = rows[0];
        await connection.end();
        res.status(201).send({ data: historyEntry });
    } catch (error) {
        console.error("Error creating history entry:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
