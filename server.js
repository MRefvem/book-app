'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
require('ejs');
require('dotenv').config();
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application Middleware
app.use(express.urlencoded({ extended: true })); // Body Parser
app.use(express.static('public')); // Serve files from 'Public'
app.set('view engine', 'ejs'); // Look in 'view' for EJS

// ROUTES
// HOME
app.get('/', getHome);
app.get('/searches/new', newSearch);
app.post('/searches', searchResults);
app.use('*', notFound);

// getHome handler
function getHome(request, response) {
  // get stuff from the database here
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(sqlResults => {
      let books = sqlResults.rows;
      console.log('our books', books);
      response.status(200).render('pages/index.ejs', { bookCollection: books });
    });
};

// newSearch handler
function newSearch(request, response) {
  response.status(200).render('pages/searches/new.ejs');
};

// searchResults handler
function searchResults(request, response) {
  try {
    let query = request.body.search[0];
    let titleOrAuthor = request.body.search[1];
  
    const numPerPage = 10;
  
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  
    const queryParams = {
      maxResults: numPerPage
    }
  
    if(titleOrAuthor === 'title'){
      url+= `+intitle:${query}`;
    } else if(titleOrAuthor === 'author'){
      url+= `+inauthor:${query}`;
    };
  
    superagent.get(url)
      .query(queryParams)
      .then(results => {
        let bookArray = results.body.items;
        const finalBookArray = bookArray.map(book => {
          return new Book(book.volumeInfo);
        });
          response.render('pages/searches/show.ejs', {books:finalBookArray});
      })
      .catch();
  } catch(err) {
    response.status(500).send('sorry, we messed up');
  };
};


// Constructor
function Book(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.image = info.imageLinks ? info.imageLinks : placeholderImage;
  this.title = info.title ? info.title : 'title unavailable';
  this.author = info.authors ? info.authors : 'not available';
  this.description = info.description ? info.description : 'not available';
};

// 404
function notFound(request, response){
  response.status(404).send('sorry, this route does not exist');
};

// Turns on Server
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`book server, listening on ${PORT}`);
    })
  });
  