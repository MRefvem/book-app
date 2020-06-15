'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
require('ejs');
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application Middleware
app.use(express.urlencoded({ extended: true })); // Body Parser
app.use(express.static('public')); // Serve files from 'Public'
app.set('view engine', 'ejs'); // Look in 'view' for EJS

// ROUTES
// HOME
app.get('/hello', (request, response) => {
  response.render('pages/index.ejs');
});

app.listen(PORT, () => {
  console.log(`book server, listening on ${PORT}`);
});