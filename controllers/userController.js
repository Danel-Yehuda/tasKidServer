require('dotenv').config();
const bcrypt = require('bcrypt');
const { dbConnection } = require('../db_connection');

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const connection = await dbConnection.createConnection();
        const hashedPassword = await bcrypt.hash(password, 10);

        const [rows] = await connection.execute(
            'INSERT INTO tbl_109_users (user_fname, user_lname, user_email, user_password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        await connection.end();
        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send({ message: 'Email already registered!' });
        } else {
            console.error("Error during signup:", error);
            res.status(500).send({ message: 'Internal server error' });
        }
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await dbConnection.createConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM tbl_109_users WHERE user_email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.user_password);

        if (!isPasswordValid) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        await connection.end();
        res.status(200).send({ message: 'User signed in successfully!' });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
