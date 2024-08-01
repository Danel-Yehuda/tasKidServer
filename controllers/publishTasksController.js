require('dotenv').config();
const { dbConnection } = require('../db_connection');
const { sendSms } = require('../smsService');


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
    const { publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId, kidId } = req.body;
    console.log(req.body);
    try {
        const connection = await dbConnection.createConnection();

        // Check if a task with the given name exists for the user
        const [existingTasks] = await connection.execute(
            'SELECT * FROM tbl_109_tasks WHERE task_name = ? AND user_id = ?',
            [publish_task_name, userId]
        );

        if (existingTasks.length === 0) {
            // No existing task with the given name found
            await connection.end();
            return res.status(400).send({ message: 'No existing task with the given name found.' });
        }

        // Insert new publish task
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_publish_tasks (publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, user_id, kid_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId, kidId]
        );

        // Fetch the newly created publish task
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

        
        const [userRows] = await connection.execute('SELECT parent_id, phone FROM tbl_109_kids k JOIN tbl_109_users u ON k.parent_id = u.user_id WHERE k.kid_id = ?', [kidId]);
        if (userRows.length === 0) {
            await connection.end();
            return res.status(404).send({ message: 'User not found for the given kid ID' });
        }
        const user = userRows[0];
        const userId = user.parent_id;
        const userPhone = user.phone;

        
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

        
        let message;
        if (publish_task_status === 2) {
            message = `Kid ${kidName} has started the task "${updatedTask.publish_task_name}" at ${timestamp.toLocaleString()}`;
        } else if (publish_task_status === 3) {
            message = `Kid ${kidName} has completed the task "${updatedTask.publish_task_name}" at ${timestamp.toLocaleString()}`;
        }

        if (message && userPhone) {
            await sendSms(userPhone, message);
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

        
        const [rows] = await connection.execute('SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?', [id]);
        const approvedTask = rows[0];

        
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

        
        const [kidRows] = await connection.execute('SELECT * FROM tbl_109_kids WHERE kid_name = ?', [approvedTask.publish_task_assigned_to]);
        const kid = kidRows[0];
        console.log(kid);
        const updatedCoins = kid.kid_coins + approvedTask.publish_task_coins;
        const updatedTasksDone = kid.kid_tasks_done + 1;
        await connection.execute('UPDATE tbl_109_kids SET kid_coins = ?, kid_tasks_done = ? WHERE kid_id = ?', 
            [updatedCoins, updatedTasksDone, kid.kid_id]);

        
        const message = `Congratulations! Your task -${approvedTask.publish_task_name}- has been approved and you earned ${approvedTask.publish_task_coins} coins!`;

        
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

exports.updateTaskColor = async (req, res) => {
    const { id } = req.params;
    const { color } = req.body;

    try {
        const connection = await dbConnection.createConnection();
        const [result] = await connection.execute(
            'UPDATE tbl_109_publish_tasks SET color = ? WHERE publish_task_id = ?',
            [color, id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Publish task not found' });
        }

        const [rows] = await connection.execute('SELECT * FROM tbl_109_publish_tasks WHERE publish_task_id = ?', [id]);
        const updatedTask = rows[0];

        await connection.end();
        res.status(200).send({ data: updatedTask });
    } catch (error) {
        console.error('Error updating task color:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
};