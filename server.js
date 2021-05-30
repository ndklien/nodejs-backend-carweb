'use strict';
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var jwt = require('jsonwebtoken');

require('dotenv').config();

var app = express();
const port = process.env.PORT || 5000;

// Call models
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const authenticateRouter = require('./routes/authentication');
const articleRouter = require('./routes/articles');
const adminRouter = require('./routes/admin');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Apply bodyParser
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB connection established suceed.");
});

// Call models router
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/auth', authenticateRouter);
app.use('/api/news', articleRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.listen(port, () => {
    console.log(`Express running on Port ${port}`);
});


const db = require('./models');
const Role = db.role;

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count ===0) {
            // Role User
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log('Error:', err);
                }

                console.log("Added 'user' to roles collection");
            });

            // Role Admin
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log('Error:', err);
                }

                console.log("Added 'admin' to roles collection");
            })
        }
    })
}

initial();