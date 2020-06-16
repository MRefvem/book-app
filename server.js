'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
require('ejs');
require('dotenv').config();
// const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// app.get('/', getTasks');

// function getTasks(request, response){
//   // get all of the tasks from my database and display them on my index.ejs page
//   let sql = 'SELECT * FROM tasks;';
//   client.query(sql)
//     .then(sqlResults => {
//       let tasks = sqlResults.rows;
//       response.status(200).render('index.ejs', { myToDoTasks: tasks })
//     })
// }

// const client = new pg.Client(process.env.DATABASE_URL);
// client.on('error', err => console.log(err));
// client.connect()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`listening on ${PORT}`)
//     })
//   })

// Application Middleware
app.use(express.urlencoded({ extended: true })); // Body Parser
app.use(express.static('public')); // Serve files from 'Public'
app.set('view engine', 'ejs'); // Look in 'view' for EJS

// ROUTES
// HOME
app.get('/', (request, response) => {
  response.render('pages/index.ejs');
});
// app.get('/add', showAddForm);
// app.post('/add', addTask)
// app.get('/tasks/:task_id', getOneTask);

// function getOneTask(request, response){
//   // go to the database, get a specific task using an id and show details fo that specific task
//   // first we are going to have to get the id from the url - request.params
//   // go into the database using that url to find that task
//   // dispaly that task on its own ejs page
//   console.log('this is my request.params - hopefully this is my id:', request.params);
//   let id = params.request.id;

//   let sql = 'SELECT * FROM tasks WHERE id=$1;';
//   let safeValues = [id];

//   client.query(sql, safeValues)
//     .then(sqlResults => {
//       console.log(sqlResults.rows);
//       response.status(200).render('details.ejs', {oneTask: sqlResults.rows[0]});
//     })
// }

// function showAddForm(request, response){
//   // display the add form
//   response.status(200).send('add.ejs');
// }
// app.use('*', handleNotFound);

// function addTask(request, response){
//   // collect information from the form 
//   let {title, description, completion} = request.body;
//   console.log(formQuery);
  // let sql = 'INSTER INTO tasks (title, description, completion) VALUES ($1, $2, $3) RETURNING ID;';
  // let safeValues = [title, description, completion];

  // client.query(sql, safeValues);
  //   .then(results => {
  //     console.log(results.rows);
  //     let id=results.rows[0].id;
  //     response.redirect('/');
  //   })
// }

// SEARCHES
app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new.ejs');
});

app.post('/searches', (request, response) => {
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
        // console.log(bookArray);
        const finalBookArray = bookArray.map(book => {
          return new Book(book.volumeInfo);
        });
        // console.log(results.body.items.imageLinks);
        // console.log(finalBookArray);
          response.render('pages/searches/show.ejs', {books:finalBookArray});
      })
      .catch();
  } catch(err) {
    response.status(500).send('sorry, we messed up');
  }
});

// Constructor
function Book(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.image = info.imageLinks ? info.imageLinks : placeholderImage;
  this.title = info.title ? info.title : 'title unavailable';
  this.author = info.authors ? info.authors : 'not available';
  this.description = info.description ? info.description : 'not available';
};

// 404
// function handleNotFound(request, response){
//   response.status(404).send('sorry, this route does not exist');
// };

// Turns on Server
app.listen(PORT, () => {
  console.log(`book server, listening on ${PORT}`);
});