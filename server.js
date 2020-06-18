'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
require('ejs');
require('dotenv').config();
const pg = require('pg');
const methodOverride = require('method-override');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application Middleware
app.use(express.urlencoded({ extended: true })); // Body Parser
app.use('/public', express.static('public')); // Serve files from 'Public'
app.set('view engine', 'ejs'); // Look in 'view' for EJS
app.use(methodOverride('_method'));

// ROUTES
// HOME
app.get('/', getHome);
app.get('/searches/new', newSearch);
app.post('/searches', searchResults);
app.get('/books/:id', getBookDetails);
app.post('/books', addBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);
app.use('*', notFound);

// deleteBook handler
function deleteBook(request, response) {
  let bookId = request.params.id;

  let sql = 'DELETE FROM books WHERE id=$1;';
  let safeValues = [bookId];

  client.query(sql, safeValues)
    .then(() => {
      response.redirect('/');
    });
}

// updateBook handler
function updateBook(request, response) {
  let bookId = request.params.id;
  let { title, author, description, isbn, image_url } = request.body;

  let sql = 'UPDATE books SET title=$1, author=$2, description=$3, isbn=$4, image_url=$5 WHERE id=$6;';
  let safeValues = [title, author, description, isbn, image_url, bookId];

  client.query(sql, safeValues)
    .then(sqlResults => {
      response.status(200).redirect(`/books/${bookId}`);
    })
    .catch();
};

// getHome handler
function getHome(request, response) {
  // get stuff from the database here
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(sqlResults => {
      let books = sqlResults.rows;
      response.status(200).render('pages/index.ejs', { bookCollection: books });
    });
};

// newSearch handler
function newSearch(request, response) {
  response.status(200).render('pages/searches/new.ejs');
};

// searchResults handler
function searchResults(request, response) {

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
};

// getBookDetails handler
function getBookDetails(request, response) {
  let id = request.params.id;
  let sql = 'SELECT * FROM books WHERE id=$1;';
  let safeValues = [id];

  client.query(sql, safeValues)
    .then(sqlResults => {
      response.status(200).render('pages/books/show.ejs', {oneBook:sqlResults.rows[0]});
    })
}

function addBook(request, response) {
  let {author, title, isbn, image, description} = request.body;
  let sql = 'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  let safeValues = [author, title, isbn, image, description];

  client.query(sql, safeValues)
    .then(sqlResults => {
      let id = sqlResults.rows[0].id;
      response.status(200).redirect(`/books/${id}`);
    });
};


// Constructor
function Book(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.image = info.imageLinks.thumbnail ? info.imageLinks.thumbnail.replace(/http:/,'https:') : placeholderImage;
  this.title = info.title ? info.title : 'No title available.';
  this.author = info.authors ? info.authors : 'No authors available.';
  this.description = info.description ? info.description : 'No description available.';
  this.isbn = info.industryIdentifiers ?  `${info.industryIdentifiers[0].type} ${info.industryIdentifiers[0].identifier}` : 'No ISBN available.';
};

// 404
function notFound(request, response){
  response.status(404).send('sorry, this route does not exist');
};

// Turns on Server - need to revert to HEROKU_POSTGRESQL_COPPER_URL
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`book server, listening on ${PORT}`);
    })
  });
