const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoute = require('./routes/user');

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    console.log("middleware")
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

app.use(userRoute);

mongoose
    .connect('mongodb://localhost/myapp', {useUnifiedTopology: true})
    .then(result => {
        console.log('Connected!');
        const server = app.listen(8081,()=>console.log('server is running on 8081'));
    })
    .catch(err => console.log(err));