require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');

const app = express();
const port = process.env.PORT || 8002;

// db Connection w/ localhost using knex
const db_localhost = {
  debug: true,
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'root',
    database : 'main_songbook'
  }
}
const db_heroku = {
  debug: false,
  client: 'pg',
  connection: {
    host : 'ec2-54-86-170-8.compute-1.amazonaws.com',
    user : 'tzmijzzjlofzfa',
    password : '92a3d93798e1191f376298538b25c1332feb089af92201be0d7687aca4ef780b',
    database : 'd9l8te8b3v1gfl'
  }
}

const db = require('knex') (db_heroku);
// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.

app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

// Controllers - aka, the db queries
const main = require('./controllers/dbfunction');
const e = require('express');

// request handlers
app.get('/', (req, res) => {
  if (!req.user) return res.status(401).json(
      { success: false, 
        message: 'Invalid user to access it.' });
    res.send('Success-' + req.user.name);
});

// validate the user credentials
app.post('/users/signin', function (req, res) {
  /*          Retrieve username and password
              Check db if it exist
              if ok generate a token and save token to db
  */
  const auser_email= req.body.email;
  const apassword = req.body.password;
  let user_email = auser_email.value;
  let password = apassword.value;
  // validate username and password if null entry
  if (!user_email || !password) {
    return res.status(400).json({
      error: true,
      message: "User Email or Password required."
    });
  }
  db("users")
    .select('*')
    .where({user_email : user_email, password : password })
    .returning('*')
    .then(response => {
      if(response.length>0){
        let item_user = response[0];
        const userData = utils.getCleanUser(item_user);
        const token = utils.generateToken(userData);
        res.json({ 
          dataExists: true,
          items: userData, 
          token: token
         })
      } else {
        res.json({
          dataExists: 'false',
          error: { 
            email: 'User Email does not Exist',
            password: 'Password does not Match'
          },
          items:[]
        })
      }
    })
    .catch(err => res.status(400).json({
        err:err,
        dbError: 'db error query (request user)'})
    )
});
app.post('/users/signup', function (req, res) {
  const auser_email= req.body.email;
  const apassword = req.body.password;
  const adisplayname= req.body.name;
  const amodel= req.body.model;
  const aprovider_id = req.body.provider;
  const ausername = req.body.username;
  let provider_model_id = req.body.model_id;
  let user_email = auser_email.value;
  let password = apassword.value;
  let username = ausername.value;
  let displayname = adisplayname.value;
  let provider_id = aprovider_id.value;
  // validate email if it exist
  db("users")
    .select('*')
    .where({user_email : user_email})
    .returning('*')
    .then(response => {
      if(response.length>0){
        res.json({
          dataExists: true,
          error: {field:"email", msg:"E-mail exist already, try again"},
        })
      } else {
        data_to_save = {
          username: username,
          password: password,
          displayname: displayname,
          user_email: user_email,
          provider_id: provider_id,
          provider_model_id: provider_model_id
        };
        db("users")
        .insert(data_to_save)
        .returning('*')
        .then(item_user => {
          // save then generate token retrieve saved data
          let user_data = {
            id: item_user.id,
            username: item_user.username,
            password: item_user.password,
            displayname: item_user.displayname,
            user_email: item_user.user_email,
            provider_id: item_user.provider_id,
            provider_model_id: item_user.provider_model_id
          };
          const userData = utils.getCleanUser(user_data);
          const token = utils.generateToken(user_data);
          res.json({ 
            dataExists: true,
            error: [],
            items: item_user, 
            token: token
          })
        })
        .catch(err => res.status(400).json({
          data: data_to_save,
          error: err,
          dbError: 'db error ('+dbname+') layout (insert data)'})
        )
      }
    })
    .catch(err => res.status(400).json({
      err:err,
      dbError: 'db error query (request user signup)'})
    )   
});
// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the userId does not match.
    if (user.id !== userData.id) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

app.get('/dbrequest', (req, res) => main.getTableData(req, res, db))

app.get('/paging', (req, res) => main.getPagingTableData(req, res, db))
app.get('/provider', (req, res) => main.getTableData(req, res, db))
app.post('/provider', (req, res) => main.postTableData(req, res, db, 'providers'))
app.put("/provider",  (req, res) => main.putTableData(req, res, db, 'providers'))
app.get("/provider/col", (req, res) => main.getTableDataByColumn(req, res, db))
app.get("/findsong", (req, res) => main.getTableSearch(req, res, db))
app.get('/genre', (req, res) => main.getTableData(req, res, db))
app.post('/genre', (req, res) => main.postTableData(req, res, db, 'genre'))
app.put("/genre",  (req, res) => main.putTableData(req, res, db, 'genre'))
app.get("/genre/col", (req, res) => main.getTableDataByColumn(req, res, db))

app.get('/songs', (req, res) => main.getJoinTableData(req, res, db, 'songs'))
app.post('/songs', (req, res) => main.postTableData(req, res, db, 'songs'))
app.put("/songs",  (req, res) => main.putTableData(req, res, db, 'songs'))
app.get("/songs/col", (req, res) => main.getTableDataByColumn(req, res, db))

app.get('/artist', (req, res) => main.getTableData(req, res, db ))
app.post('/artist', (req, res) => main.postTableData(req, res, db, 'artist'))
app.put("/artist",  (req, res) => main.putTableData(req, res, db, 'artist'))
app.get("/artist/col", (req, res) => main.getTableDataByColumn(req, res, db))

app.get('/allsongs', (req, res) => main.getTableData(req, res, db ))
app.get('/providers', (req, res) => main.getTableData(req, res, db))
app.get('/models', (req, res) => main.getTableData(req, res, db))
app.get('/allreserved', (req, res) => main.getTableData(req, res, db, 'view_reserved'))

app.post('/reserved', (req, res) => main.postTableData(req, res, db, 'reserved'))

app.delete('/api/delete', (req, res) => {
  var reqData  = req.query;
  var id = reqData.id
  var dbname = reqData.dbname
  db(dbname)
    .where('id', id)
    .del()
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error (delete) data)'})
    )
});

app.listen(port, () => {
  console.log('Server started on: ' + port);
});