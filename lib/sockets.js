// sockets.js
var socketio = require('socket.io')
var request = require("request");
var cheerio = require("cheerio");
var io;
var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var oldTitles = [];

function setPage(body){
  var scripts = `<link rel="stylesheet" type="text/css" href="http://localhost:3000/css/hn.css">
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="http://localhost:3000/js/hn.js"></script>`;
  var page = body.replace('</body>', scripts + '</body>');
  //page = page.replace('news.css', 'https://news.ycombinator.com/news.css');
  page = page.replace('<head>', `<head><base href="https://news.ycombinator.com">`);
  //page = page.replace('src="', 'src="https://news.ycombinator.com/');
  client.set("page", page);
}

function getListRows(body){
  var re = /<(table)\b[^>]*\bitemlist\b[^>]*>([\s\S]*?)<\/table>/g;
  var m;
  m = re.exec(body);
  var table;
  if (m) {
    table = m[2];
  } else {
    throw "Match not found in body: " + table;
  }
  var list = [];
  re = /(<tr\b[^>]*>\s*[\s\S]*?\s*<\/tr>)/g;

  do {
    m = re.exec(table);
    if (m) {
      list.push(m[1]);
    }
  } while (m);
  list.splice(90, 2);
  return list;
}
function getTitles(list){
  var titles = [];
  for (var i = 0; i < 90; i += 3) {
    var re = /<(tr)\b[^>]*>[\s\S]*<td class="title"><span class="deadmark"><\/span><a href="(.*?)">(.*?)<[\s\S]*<\/\1>/g;
    var m = re.exec(list[i]);
    if (m){
      titles.push({url:m[2], t:m[3]});
    } else {
      throw "Match not found in list: " + list[i];;
    }
  }
  return titles;
}

function refreshHn(){
  if (!io) {
    setTimeout(refreshHn,10000);
    return;
  }
  request({
    uri: "https://news.ycombinator.com",
  }, function(error, response, body) {
    if (error){
      console.log(error);
      return setTimeout(refreshHn,10000);
    }
    if (response){
      //console.log(response);
    }

    try{
      var list = getListRows(body);
      var titles = getTitles(list);

      if (oldTitles.length == 0) {
        oldTitles = titles;
      }
      var isEqual = true;
      for (var i = 0; i < titles.length; ++i) {
        if (titles[i].t != oldTitles[i].t){
          isEqual = false;
          console.log(titles[i].t + " != " + oldTitles[i].t);
          break;
        }
      }
      if (!isEqual){
        io.emit('hn currentData', {rows: list, titles: titles});
        console.log('Emit', list.length);
        oldTitles = titles;
      }
      setPage(body);
    } catch (err) {
      console.error("ERR: ", err);
    }
    setTimeout(refreshHn,10000);
  });
}
refreshHn();

module.exports.listen = function(app){
  io = socketio.listen(app)
  io.on('connection', function(socket){
    console.log('a user connected, number: ' + io.engine.clientsCount);

    socket.on('chat progress', function(msg){
      console.log('progress: ' + msg);
    });
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });

    socket.on('hn getlink', function(link){
      console.log('link: ', link);
      request({
        uri: link.url
      }, function(error, response, body) {
        if (error){
          console.log(error);
          return;
        }
        socket.emit('hn getlink', {body:body, idx:link.idx});
      });
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
  //users = io.of('/users')
  //users.on('connection', function(socket){
  //    socket.on ...
  //})

  return io
}
