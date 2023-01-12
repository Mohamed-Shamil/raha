var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars')
var app = express();
var db = require('./config/connection')
const bcrypt = require('bcrypt')
const session = require('express-session')
const swal = require('sweetalert')
const multer = require("multer")
const nocache = require('nocache');
var Handlebars = require('handlebars');
const referral = require('referral-codes')
const dotenv = require('dotenv').config();
const passport = require('passport')


// view engine setup
app.use(nocache())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'  );
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname + '/views/layout/',partialsDir:__dirname +'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:"thismysecretkey",
  saveUninitialized:false,
  cookie: {maxAge:6000000000},
  resave:false

} 
))
// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

//Register Helpers
 
Handlebars.registerHelper('isCanceled',(value)=>{
  return value == 'canceled' ? true:false
})


Handlebars.registerHelper('isDelivered',(value)=>{
  return value == 'delivered' ? true:false
})

Handlebars.registerHelper('multiply',(value1,value2)=>{
  return (parseInt(value1)*(value2))
})

Handlebars.registerHelper("inc",function(value,options){
  return(value)+1
})

Handlebars.registerHelper("stockStatus",(value)=>{
   return(value == 0 ? true:false)
})

Handlebars.registerHelper("cancel",(value)=>{
  return value == "canceled" ? true:false
})

Handlebars.registerHelper("delivered",(value)=>{
  return value == "delivered" ? true:false
})

Handlebars.registerHelper('placedOrder', (value)=>{
  return value == "placed" ?true:false
})

Handlebars.registerHelper('dispatchOrder',(value)=>{
  return value == "dispatched" ?true:false
})

Handlebars.registerHelper('shippedOrder',(value)=>{
  return value == "shipped" ?true:false
})

Handlebars.registerHelper('deliveredOrder',(value)=>{
  return value == "delivered" ?true:false
})

Handlebars.registerHelper('cancelOrder',(value)=>{
  return value == "canceled" ? true:false
})
Handlebars.registerHelper('returnRequest',(value)=>{
  return value == "return requested" ? true:false
})

Handlebars.registerHelper('returnRequested',(value)=>{
  return value == "return requested" ? true:false
})
Handlebars.registerHelper('for', function(from, to, incr, block) {
  var accum = '';
  for(var i = from; i < to; i += incr)
      accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper('walletTransaction',(value)=>{
  return value > 0 ? true:false
})
Handlebars.registerHelper('sales',(value)=>{
  return value == 'canceled' ? true : false
})
Handlebars.registerHelper('cartNum',(value)=>{
  return value != 0 ? true:false
})
Handlebars.registerHelper('checkoutCount',(value)=>{
  return value != 0 ?true:false
})

Handlebars.registerHelper('wishlistCount',(value)=>{
  return value  == {} ?true:false
})

Handlebars.registerHelper('isFound',(value)=>{
  return value == [] ?  false:true
})


db.connect((err)=>{
  if (err) console.log("Connection Error"+err);           
  else console.log("Database Connected to port 27017");
}
)

app.use('/', userRouter);
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
  err.status = ""+err.status
  res.render('error',{err});
});

module.exports = app;
