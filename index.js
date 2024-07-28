const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const publishTasksRoutes = require('./routes/publishTasksRoutes');
<<<<<<< HEAD
const giftRoutes = require('./routes/giftRoutes');

=======
const kidsRoutes = require('./routes/kidsRoutes');
>>>>>>> 62ddeeee1fefbbdfede9240fa9f19ceafdf51e8b
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
app.use('/api/tasks', taskRoutes);
app.use('/api/publish-tasks', publishTasksRoutes);
app.use('/api/kids', kidsRoutes);
//app.use('/api/gift-shop', giftRoutes);


app.listen(PORT, () => {
    console.log(`TasKids server is running on port ${PORT}`);
});
