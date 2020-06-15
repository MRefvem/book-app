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
app.use(express.urlencoded({extended: true})); // Body Parser
app.use(express.static('public')); // Serve files from 'Public'
app.use('view engine', 'ejs'); // Look in 'view' for EJS

app.listen(PORT, () => {
  console.log(`book server, listening on ${PORT}`);
})