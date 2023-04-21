var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
const db = require('./config/connection');
const session = require('express-session');
const nocache = require('nocache');
//const fileUpload = require('express-fileupload');
// const handlebars = require('handlebars');
const cloudinary = require('cloudinary');
const dotenv = require("dotenv");
dotenv.config();


db.connect((err)=>{
  if(err){
    console.log("connection error");
  }else{
    console.log("database connected");
  }
})


var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({
  helpers: {

    inc: function (value, options) {

        return parseInt(value) + 1;

    },
    math: function(lvalue, operator, rvalue, options)
    {
      lvalue = parseInt(lvalue);
      rvalue = parseInt(rvalue);
          
      return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue,
      }[operator];
  },
  for: function(from, to, incr, block){
    var accum = '';
    for(var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
  },
  isEqual: (value1, value2)=>{
    return value1 == value2;
  },
  lessEqual: (value1, value2)=>{
    return value1 <= value2;
  }
},
  extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());
//app.use(cookieParser());
app.use(session({resave:false,saveUninitialized: true,secret:"key",cookie:{maxAge:600000}}));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(fileUpload());

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
