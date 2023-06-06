const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql');
dotenv.config();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : false}));

// Create connection to local database
const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password : '',
    database: 'oasis'
});

// Create connection to online database
// const db = mysql.createConnection({
//     host : 'db4free.net',
//     port : 3306,
//     user: 'mariefherv',
//     password : 'Password!',
//     database: 'oasis_db'
// });

// Connect to MySQL Database
db.connect((err) => {
    err? console.log("Unable to connect to MySQL")
    :
    console.log('Connected to MySQL database')
})

module.exports = db; //export connection

// for user routes
const userRoutes = require('./routes/userRoutes')
app.use('/user', userRoutes);

// for post routes
const postRoutes = require('./routes/postRoutes')
app.use('/post', postRoutes);

// for contact routes
const contactRoutes = require('./routes/contactRoutes')
app.use('/contact', contactRoutes);

// for therapist routes
const therapistRoutes = require('./routes/therapistRoutes')
app.use('/therapist', therapistRoutes);

// for booking routes
const bookingRoutes = require('./routes/bookingRoutes')
app.use('/booking', bookingRoutes);

// for notification routes
const notificationRoutes = require('./routes/notificationRoutes')
app.use('/notifications', notificationRoutes);

// for admin routes
const adminRoutes = require('./routes/adminRoutes')
app.use('/admin', adminRoutes);

app.listen(port,()=>console.log(`API is running on localhost:${process.env.PORT}`))