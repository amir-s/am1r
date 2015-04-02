var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var cnf = require('./am1r.config.js');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: cnf.username,
        pass: cnf.password
    }
});
console.log(cnf);
var esc = function(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    var os = ('<link rel="search" type="application/opensearchdescription+xml" href="http://am1r.me/opensearch.xml" title="am1r"/>');
    var msg = querystring.unescape(req.url.substr(1));
    if (msg.trim() == '') {
        res.send(os+'Say something to AMiR!');
        return;
    }
    transporter.sendMail({
        to: cnf.to,
        subject: 'am1r.me ' + new Date(),
        text: 'Someone said: ' + msg,
    }, console.log);
    res.send(os+'You said "' + esc(msg) + "' to AMiR!");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
