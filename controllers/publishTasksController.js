require('dotenv').config();
const { dbConnection } = require('../db_connection');

// Controller to get all publish tasks
exports.getPublishTasks = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        
        const [publishTasks] = await connection.execute(
            'SELECT * FROM tbl_109_publish_tasks'
        );
        
        await connection.end();
        res.status(200).send({ data: publishTasks });
    } catch (error) {
        console.error("Error fetching publish tasks:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Controller to create a new publish task
exports.createPublishTask = async (req, res) => {
    const { publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId } = req.body;
    console.log(req.body);
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_publish_tasks (publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, userId]
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
    const { publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'UPDATE tbl_109_publish_tasks SET publish_task_name = ?, publish_task_status = ?, publish_task_coins = ?, publish_task_deadline = ?, publish_task_assigned_to = ? WHERE publish_task_id = ?',
            [publish_task_name, publish_task_status, publish_task_coins, publish_task_deadline, publish_task_assigned_to, publish_task_id]
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
