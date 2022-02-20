var express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
mu = require('./lib/utils/mongo.js');

var chatsRouter = require('./routes/chats');
var messagesRouter = require('./routes/messages');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/chats', chatsRouter);
app.use("/messages", messagesRouter);
app.use("/users", usersRouter);

module.exports = app;