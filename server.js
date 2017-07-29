const fs = require('fs');

const { Client } = require('pg');
const connectionString = 'postgresql://cedricamaya@localhost:5432/sample_db';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// wwwhisper authentication
const wwwhisper = require('connect-wwwhisper');
app.use(wwwhisper());

app.use(express.static('frontend'));
app.use(express.static('frontend/add'));

app.listen(port);
console.log('Server started at localhost:' + port);

//let data = fs.readFileSync('tanzakus.json');
//let urls = JSON.parse(data);


/**
 * "all/" route - Used to obtain all tanzakus in tanabata-tree
 *
 * hostname:[port]/all
 * @params {null} NONE
 */
app.get('/all', function(request, response) {
  response.status(200);
  
  const client = new Client({
    connectionString: connectionString,
  });

  client.connect();

  client.query('SELECT * FROM tanzakus', (err, res) => {
    let tanzakus = {};
  
    for (var i = 0; i < res.rows.length; i++)
      tanzakus[res.rows[i].title] = res.rows[i].url;

    client.end();
    response.send(tanzakus);
  });
});

app.enable('strict routing');

/**
 * "add/" route - Used to add a tanzaku to tanabata-tree
 *
 * hostname:[port]/add/[title]/[url]
 * @param {string} title - the title of the URL being added
 * @param {string} url - the URL to be added
 */
app.get('/tanzaku', addUrl);
function addUrl(request, response) {
  let title = request.query.title;
  let url = request.query.url;
  
  let reply;
  let tanzaku = {
    title: title,
    url: url
  };
  
//  urls[title] = url;
//  let tanzakuData = JSON.stringify(urls, null, 2);
  
//  fs.writeFile('tanzakus.json', tanzakuData, finished);
  
  const client = new Client({
    connectionString: connectionString,
  });

  client.connect();

  client.query('INSERT INTO tanzakus (title, url) VALUES ($1, $2)', [title, url], (err, res) => {
    if (err)
      return console.error('error with PostgreSQL database', err);
    
    client.end();
    finished();
  });
  
  
  function finished(err) {
    if (err) {
      response.status(400);
      reply = {
        tanzaku,
        message: 'tanzaku_upload_failed',
        status: 'failed'
      };
      
      response.send(reply);
      throw err;
    } else {
      console.log('tanzaku_added: ' + JSON.stringify(tanzaku));
      
      response.status(201);
      reply = {
        tanzaku,
        message: 'tanzaku_uploaded',
        status: 'success'
      };

      response.send(reply);
    }
  }
}

const meta = require('minimal-metainspector');

/**
 * "gettitle/" route - Used to obtain the title of the requested URL
 *
 * hostname:[port]/gettitle/[url]
 * @params {string} url - the requested URL to get the title from
 */
app.get('/gettitle', getTitle); 
function getTitle(request, response) {
  let url = request.query.url;
  
  // get title using 'minimal-metainspector'
  let client = new meta(url);
  let title = '';
  
  client.on('fetch', () => {
    title = client.title;
    
    response.status(200);
    reply = {
      url: url,
      title: title,
      message: 'get_title',
      status: 'success'
    };
    
    response.send(reply);
  });
  
  client.on('error', (err) => {
    response.status(400);
    reply = {
      url: url,
      title: title,
      message: 'get_title_failed',
      status: 'failed',
      err: err
    };
    
    response.send(reply);
  });

  client.fetch();
}