require('dotenv').config();
const bcrypt = require('bcrypt');
const { dbConnection } = require('../db_connection');


exports.getKids = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();
        
        const [kids] = await connection.execute('SELECT * FROM tbl_109_kids');
        
        await connection.end();
        res.status(200).send({ data: kids });
    } catch (error) {
        console.error("Error fetching kids:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


exports.createKid = async (req, res) => {
    const { kid_name, parent_email, parent_id, kid_password, kid_coins = 5, kid_tasks_done = 0 } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        const hashedPassword = await bcrypt.hash(kid_password, 10);
        
        const [result] = await connection.execute(
            'INSERT INTO tbl_109_kids (kid_name, parent_email, parent_id, kid_password, kid_coins, kid_tasks_done) VALUES (?, ?, ?, ?, ?, ?)',
            [kid_name, parent_email, parent_id, hashedPassword, kid_coins, kid_tasks_done]
        );
        
        const [rows] = await connection.execute('SELECT * FROM tbl_109_kids WHERE kid_id = ?', [result.insertId]);
        
        const kid = rows[0];
        await connection.end();
        res.status(201).send({ data: kid });
    } catch (error) {
        console.error("Error creating kid:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


exports.deleteKid = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [result] = await connection.execute('DELETE FROM tbl_109_kids WHERE kid_id = ?', [id]);
        
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


exports.updateKid = async (req, res) => {
    const { id } = req.params;
    const { kid_name, kid_coins, kid_tasks_done, kid_password } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        let hashedPassword = null;

        if (kid_password) {
            hashedPassword = await bcrypt.hash(kid_password, 10);
        }

        const [result] = await connection.execute(
            'UPDATE tbl_109_kids SET kid_name = ?, kid_coins = ?, kid_tasks_done = ?, kid_password = IFNULL(?, kid_password) WHERE kid_id = ?',
            [kid_name, kid_coins, kid_tasks_done, hashedPassword, id]
        );
        
        if (result.affectedRows === 0) {
            await connection.end();
            return res.status(404).send({ message: 'Kid not found' });
        }

        const [rows] = await connection.execute('SELECT * FROM tbl_109_kids WHERE kid_id = ?', [id]);
        const updatedKid = rows[0];
        await connection.end();
        res.status(200).send({ data: updatedKid });
    } catch (error) {
        console.error("Error updating kid:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


exports.signIn = async (req, res) => {
    const { parent_email, kid_password } = req.body;
    console.log(req.body);

    try {
        const connection = await dbConnection.createConnection();

        
        const [parentRows] = await connection.execute('SELECT user_id FROM tbl_109_users WHERE user_email = ?', [parent_email]);

        if (parentRows.length === 0) {
            return res.status(400).send({ message: 'Invalid parent email or kid password' });
        }

        const parent = parentRows[0];

        
        const [kidRows] = await connection.execute('SELECT * FROM tbl_109_kids WHERE parent_id = ?', [parent.user_id]);
        
        if (kidRows.length === 0) {
            return res.status(400).send({ message: 'Invalid parent email or kid password' });
        }

        const kid = kidRows[0];
        const isPasswordValid = await bcrypt.compare(kid_password, kid.kid_password);

        if (!isPasswordValid) {
            return res.status(400).send({ message: 'Invalid parent email or kid password' });
        }

        const { kid_password: unused, ...kidWithoutPassword } = kid;
        await connection.end();
        res.status(200).send({ data: kidWithoutPassword });
    } catch (error) {
        console.error("Error during kid signin:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.getKidsByParentId = async (req, res) => {
    const { parentId } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [kids] = await connection.execute('SELECT * FROM tbl_109_kids WHERE parent_id = ?', [parentId]);
        
        await connection.end();
        res.status(200).send({ data: kids });
    } catch (error) {
        console.error("Error fetching kids by parent ID:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};


exports.getKidById = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbConnection.createConnection();
        
        const [kid] = await connection.execute('SELECT * FROM tbl_109_kids WHERE kid_id = ?', [id]);
        
        await connection.end();
        if (kid.length === 0) {
            res.status(404).send({ message: 'Kid not found' });
        } else {
            res.status(200).send({ data: kid[0] });
        }
    } catch (error) {
        console.error("Error fetching kid by ID:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
