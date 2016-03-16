var express = require('express');
var router = express.Router();
var models = require('../lib/sqlserver');
var async = require('async');
var emailer = require('../lib/emailer');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var request = require("request");
var cheerio = require("cheerio");


var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});
//client.set("name", "Working", redis.print);
//client.get("name", redis.print);

/* GET home page. */
var home = function(req, res, next) {
  // xhr get news.ycom
  // get redis
  var gbody = '';
  async.series([function(cb){
    client.get("page", function(err, page) {
      if (err)
        return cb();

      res.send(page);
    });
  }, function(cb){
    request({
      uri: "https://news.ycombinator.com",
    }, function(error, response, body) {
      if (error){
        console.log(error);
        return res.status(400).json({err:error});
      }
      gbody = body;
      cb();
    });
  }, function(cb){
    var scripts = `<link rel="stylesheet" type="text/css" href="http://localhost:3000/css/hn.css">
      <script src="http://localhost:3000/socket.io/socket.io.js"></script>
      <script src="http://localhost:3000/js/hn.js"></script>`;
    var page = body.replace('</body>', scripts + '</body>');
    //page = page.replace('news.css', 'https://news.ycombinator.com/news.css');
    page = page.replace('<head>', `<head><base href="https://news.ycombinator.com">`);
    //page = page.replace('src="', 'src="https://news.ycombinator.com/');
    client.set("page", page, redis.print);
    return res.send(page);
  }]);
}
router.get('/', home);
router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Socket.IO Chat' });
});
router.get('/:views', home);

module.exports = router;
