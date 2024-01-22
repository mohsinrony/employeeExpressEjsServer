'use strict';

const express = require('express');
const path = require('path');

const app = express();

const {
  port,
  host,
  storageEngine,
  storage
} = require('./config');
const { execPath } = require('process');
const { render } = require('ejs');

const storageEnginePath = path.join(__dirname, storageEngine.folder);

const dataStoragePath = path.join(storageEnginePath, storageEngine.dataStorageFile);

const storagePath = path.join(__dirname, storage.folder);
const {createDataStorage} = require(dataStoragePath);
const dataStorage = createDataStorage(storagePath, storage.storageConfigFile);

/* dataStorage.getAll().then(data => {
  console.log(data);
}); */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pageViews'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

const menuPath = path.join(__dirname, 'menu.html');

app.get('/', (req, res) => {
  res.sendFile(menuPath);
});
app.get('/all', (req, res) => dataStorage.getAll()
.then(data => res.render('allPersons.ejs', {
  title: 'Persons',
  header: 'All persons',
  result: data
})));

app.get('/search', (req, res) => 
  dataStorage.KEYS.then(keys => 
    res.render('search.ejs', {keys})
   
  )
);

app.post('/search', async (req, res) => {
  if (!req.body) return res.sendStatus(500);
  const key = req.body.key;
  const value = req.body.searchvalue;
  const persons = await dataStorage.get(value, key);
  res.render('allPersons.ejs', {
    title: 'Search',
    header: 'Found persons',
    result: persons
  });
} );

app.get('/inputform', (req, res) => res.render('form.ejs', {
  title: 'Add person',
  header: 'Add a new person',
  action: '/input',
  id:{value: '', readonly: ''},
  firstname: {value: '', readonly: ''},
  lastname: {value: '', readonly: ''},
  department: {value: '', readonly: ''},
  salary: {value: '', readonly: ''},
}));

app.post('/input', (req, res) => {
  if (!req.body) return res.sendStatus(500);

  dataStorage.insert(req.body)
  .then(state=>sendStatusPage(res,state)) 
  .catch(error=>sendErrorPage(res,error));
  });

  app.get('/removeperson', (req, res) => 
  res.render('getPerson.ejs', { 
    
    title: 'Remove',
    header: 'Remove person',
      action: '/removeperson'
    }));

    app.post('/removeperson', (req, res) => {
      if (!req.body) return res.sendStatus(500);
      const id = req.body.id;
      dataStorage.remove(id)
      .then(state=>sendStatusPage(res,state)) 
      .catch(error=>sendErrorPage(res,error));
      }
    );




app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

function sendStatusPage(res, status, title='Status',header='Status') {
return res.render('statusPage.ejs', {
  title,
  header,
  status
});
}

function sendErrorPage(res, error, title='Error',header='Error') {
 sendStatusPage(res, error, title, header);
  }