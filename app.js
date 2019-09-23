var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config()

// var jwt = require('express-jwt');

var jwt = require('jsonwebtoken');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//后台路由
var adminCategoriesRouter = require('./routes/admin/category');
var adminProductsRouter  = require('./routes/admin/product');
var adminPhotosRouter  = require('./routes/admin/photo');
var adminUsersRouter  = require('./routes/admin/users');


//前台接口路由
var cartsRouter = require('./routes/carts');
var ordersRouter = require('./routes/orders');


//跨域
var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//跨域
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));   //#此行代码以自带
//后台登录接口认证
app.use(function (req, res, next) {
  //不需要验证的URL
  var allowUrl = ['/admin/users/login', '/admin/users/register', '/users/login'];
  if (allowUrl.indexOf(req.url) != '-1') return next();     //js的indexOf函数：如果没有找到匹配的字符串则返回 -1

  var token;   //需要验证的URL则带上token
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  //此写法参考文档：https://github.com/auth0/express-jwt#readme 中`Multi-tenancy`的上一段。

  //token可能存在post请求和get请求
  if (!token) {
    return res.status(401).send({
      success: false,
      message: '当前接口需要认证才能访问.'
    });
  }

  //验证token是否正确
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({
        success: false,
        message: 'token过期，请重新登录'
      });
    }

    //用正则验证匹配是否是后台管理员
    var reg = /\/admin/
    if(reg.test(req.url) && !decoded.user.admin){
      return res.status(401).send({
        success: false,
        message: '当前接口是管理员接口'
      });
    }

    //将解析出来的数据存入req
    req.decoded = decoded;
    next();
  })
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

//后台路由注册
app.use('/admin/category', adminCategoriesRouter);
app.use('/admin/product', adminProductsRouter);
app.use('/admin/photo', adminPhotosRouter);
app.use('/admin/users', adminUsersRouter);

//前台路由注册
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);


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
