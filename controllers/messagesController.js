require('dotenv').config();
const { dbConnection } = require('../db_connection');


exports.getMessages = async (req, res) => {
    const { id, type } = req.params;
    let query;
    if (type === 'kid') {
        query = 'SELECT message, timestamp FROM tbl_109_messages WHERE kid_id = ? AND user_id IS NULL';
    } else if (type === 'user') {
        query = 'SELECT message, timestamp FROM tbl_109_messages WHERE user_id = ?';
    } else {
        return res.status(400).send({ message: 'Invalid message type' });
    }

    try {
        const connection = await dbConnection.createConnection();
        const [messages] = await connection.execute(query, [id]);
        await connection.end();
        res.status(200).send({ data: messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


exports.createMessage = async (req, res) => {
    const { userId, kidId, message, timestamp } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        await connection.execute(
            'INSERT INTO tbl_109_messages (user_id, kid_id, message, timestamp) VALUES (?, ?, ?, ?)',
            [userId, kidId, message, timestamp]
        );
        
        await connection.end();
        res.status(201).send({ message: 'Message created successfully' });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
