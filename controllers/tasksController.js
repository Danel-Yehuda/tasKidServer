require('dotenv').config();
const { dbConnection } = require('../db_connection');

exports.createTask = async (req, res) => {
    const { taskName } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_tasks (task_name) VALUES (?)',
            [taskName]
        );
        
        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_tasks WHERE task_id = ?',
            [result.insertId]
        );
        
        const task = rows[0];
        await connection.end();
        res.status(201).send({ data: task });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        
        const [tasks] = await connection.execute(
            'SELECT * FROM tbl_109_tasks'
        );
        
        await connection.end();
        res.status(200).send({ data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute(
            'DELETE FROM tbl_109_tasks WHERE task_id = ?',
            [taskId]
        );
        
        await connection.end();
        
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Task not found' });
        }
        
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


