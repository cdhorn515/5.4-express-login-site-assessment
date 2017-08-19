var express = require('express');
var mustacheExpress = require('mustache-express');
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var parseurl = require('parseurl');

var app = express();

//database of users
var users = [
  {'username': 'Christina',
   'password': 'codingrocks'},
  {'username': 'Sami',
   'password': '12345'},
  {'username': 'Sera',
   'password': '67890'}
];

//view engine
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extend: false
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

//session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
//check to see if we have a user and if pathname is not login
app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;
  if (!req.session.user && pathname != '/login'){
    res.redirect('/login');
  } else {
    next();
  }
});

//checking for views object, if there isn't one assigns value to 0
app.use(function(req, res, next){
  var views = req.session.views;
  if (!views) {
    views = req.session.views = {};
  }
  var pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) +1;

  next();
});

app.get('/', function(req,res){
res.render('index');
});

app.get('/login', function(req, res){
  var context = {
    next: req.query.next
  };
  res.render('login', context);
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;

//check username against input on form
var person = users.find(function(user){
  return user.username === username;
});


if (person && person.password === password) {
  req.session.user = person;
} else if (req.session.user) {
  delete req.session.user;
}

if (req.session.user) {
  var context = {
    username: req.session.user.username,
    views: req.session.views
  };
  res.render('index', context);
} else {
  res.redirect('/login');
}
});

app.post('/', function (req, res){
  var context = {
    username: req.session.user.username,
    views: req.session.views
  };
  res.render('index', context);
});

app.get('/logout', function (req, res){
  res.render('logout');
});

app.listen(3000, function(){
  console.log("app started successfully!");
});
