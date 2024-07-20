const userRoutes = require('./routes/userRoutes');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('TasKids is up!');
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`TasKids server is running on port ${PORT}`);
});
