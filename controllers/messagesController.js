require('dotenv').config();
const { dbConnection } = require('../db_connection');

// Controller to get messages by kid ID
exports.getMessages = async (req, res) => {
    const { kidId } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        const [messages] = await connection.execute('SELECT message FROM tbl_109_messages WHERE kid_id = ?', [kidId]);
        await connection.end();
        res.status(200).send(messages.map(row => row.message));
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to create a new message entry
exports.createMessage = async (req, res) => {
    const { kidId, message } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        await connection.execute(
            'INSERT INTO tbl_109_messages (kid_id, message) VALUES (?, ?)',
            [kidId, message]
        );
        
        await connection.end();
        res.status(201).send({ message: 'Message created successfully' });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
