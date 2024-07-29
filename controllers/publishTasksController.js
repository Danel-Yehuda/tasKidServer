require('dotenv').config();
const { dbConnection } = require('../db_connection');
const axios = require('axios');

// Controller to get all publish tasks
exports.getPublishTasks = async (req, res) => {
    const { userId, kidId } = req.query;
    let query = 'SELECT * FROM tbl_109_publish_tasks WHERE approve != 1';
    let params = [];

    if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
    } else if (kidId) {
        query += ' AND kid_id = ?';
        params.push(kidId);
    }

    try {
        const connection = await dbConnection.createConnection();
        const [publishTasks] = await connection.execute(query, params);
        await connection.end();
        res.status(200).send({ data: publishTasks });
    } catch (error) {
        console.error("Error fetching publish tasks:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.createPublishTask = async (req, res) => {
    const { publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId, kidId} = req.body;
    console.log(req.body);
    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'INSERT INTO tbl_109_publish_tasks (publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, user_id, kid_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId, kidId]
        );

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?',
            [result.insertId]
        );

        const publishTask = rows[0];
        await connection.end();
        res.status(201).send({ data: publishTask });
    } catch (error) {
        console.error("Error creating publish task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to delete a publish task by ID
exports.deletePublishTask = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'DELETE FROM tbl_109_publish_tasks WHERE publish_task_id = ?',
            [id]
        );
        
        await connection.end();
        if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Publish task not found' });
        } else {
            res.status(200).send({ message: 'Publish task deleted successfully' });
        }
    } catch (error) {
        console.error("Error deleting publish task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to update a publish task by ID
exports.updatePublishTask = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const { publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'UPDATE tbl_109_publish_tasks SET publish_task_name = ?, publish_task_status = ?, publish_task_coins = ?, publish_task_deadline = ?, publish_task_assigned_to = ? WHERE publish_task_id = ?',
            [publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, id]
        );
        
        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Publish task not found' });
        }

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?',
            [id]
        );

        const updatedTask = rows[0];
        await connection.end();
        res.status(200).send({ data: updatedTask });
    } catch (error) {
        console.error("Error updating publish task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.updatePublishTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { publish_task_status, kidId, kidName } = req.body;
    const timestamp = new Date();
    try {
        const connection = await dbConnection.createConnection();

        // Fetch the user ID based on the kid ID
        const [userRows] = await connection.execute('SELECT parent_id FROM tbl_109_kids WHERE kid_id = ?', [kidId]);
        if (userRows.length === 0) {
            await connection.end();
            return res.status(404).send({ message: 'User not found for the given kid ID' });
        }
        const userId = userRows[0].parent_id;
        
        // Update the task status
        const [result] = await connection.execute(
            'UPDATE tbl_109_publish_tasks SET publish_task_status = ? WHERE publish_task_id = ?',
            [publish_task_status, id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Publish task not found' });
        }

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?',
            [id]
        );

        const updatedTask = rows[0];

        // Send messages to user based on task status
        let message;
        if (publish_task_status === 2) {
            message = `Kid ${kidName} has started the task "${updatedTask.publish_task_name}" at ${timestamp.toLocaleString()}`;
        } else if (publish_task_status === 3) {
            message = `Kid ${kidName} has completed the task "${updatedTask.publish_task_name}" at ${timestamp.toLocaleString()}`;
        }

        if (message) {
            await connection.execute(
                'INSERT INTO tbl_109_messages (user_id, kid_id, message, timestamp) VALUES (?, ?, ?, ?)',
                [userId, kidId, message, timestamp]
            );
        }

        await connection.end();
        res.status(200).send({ data: updatedTask });
    } catch (error) {
        console.error("Error updating publish task status:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.approveTask = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();

        const [result] = await connection.execute(
            'UPDATE tbl_109_publish_tasks SET approve = 1, publish_task_status = 3 WHERE publish_task_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Publish task not found' });
        }

        // Get the updated task
        const [rows] = await connection.execute('SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?', [id]);
        const approvedTask = rows[0];

        // Create a history entry for task approval
        const historyEntry = {
            date: new Date().toISOString().split('T')[0],
            kid: approvedTask.publish_task_assigned_to,
            action: 'Approved',
            publish_task_name: approvedTask.publish_task_name
        };
        await connection.execute(
            'INSERT INTO tbl_109_history (date, kid, action, publish_task_name) VALUES (?, ?, ?, ?)',
            [historyEntry.date, historyEntry.kid, historyEntry.action, historyEntry.publish_task_name]
        );

        // Update kid's coins
        const [kidRows] = await connection.execute('SELECT * FROM tbl_109_kids WHERE kid_name = ?', [approvedTask.publish_task_assigned_to]);
        const kid = kidRows[0];
        const updatedCoins = kid.kid_coins + approvedTask.publish_task_coins;
        await connection.execute('UPDATE tbl_109_kids SET kid_coins = ? WHERE kid_id = ?', [updatedCoins, kid.kid_id]);

        // Send a message to the kid
        const message = `Congratulations! Your task -${approvedTask.publish_task_name}- has been approved and you earned ${approvedTask.publish_task_coins} coins!`;
        await sendMessage(kid.kid_id, message);

        // Create a message entry in the database
        await connection.execute(
            'INSERT INTO tbl_109_messages (kid_id, message) VALUES (?, ?)',
            [kid.kid_id, message]
        );

        await connection.end();
        res.status(200).send({ data: approvedTask });
    } catch (error) {
        console.error("Error approving task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

async function sendMessage(kidId, message) {
    try {
        await axios.post('https://external-api-for-messaging.com/send', {
            kidId,
            message
        });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}