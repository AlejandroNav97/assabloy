'use strict';
require('dotenv').config();
const path = require('path');

const express = require('express');
const session = require('express-session');

const passport = require('passport');
require('./config/passportConfig')(passport) ; // pass passport for configuration

const app = express();

const routes = require('./routes');
const sessionStore = require('./config/promiseConnection');

const PORT = process.env.NODE_PORT;

const clientPath = path.resolve(__dirname, 'artifact'); 

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientPath))
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'hotelcountrysideapp',
    store: sessionStore,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 3600000 1 hour in milliseconds. The expiration time of the cookie to set it as a persistent cookie.
      sameSite: true
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
app.listen(PORT, () =>
  console.log(`Express API listening on http://0.0.0.0:${PORT}`)
);

function exitHandler(code, reason) {
  console.log('Received kill signal, shutting down gracefully', reason);
  process.exit();
}

app.use(function(err, req, res, next) {
  process.on('uncaughtException', exitHandler(1, 'Unexpected Error'))
  process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'))
  process.on('SIGUSR1', exitHandler(0, 'SIGUSR1'))
  process.on('SIGINT', exitHandler(0, 'SIGINT'))
})


