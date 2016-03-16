var express = require('express');
var router = express.Router();
var async = require('async');
var extend = require('util')._extend;

router.get('/home', function(req, res, next) {
  var run = function(data) {
    res.render('subviews/card', data, function (err, html) {
      if (err){
        console.log(err);
        res.status(400).json(err);
        return;
      }
      res.send({title:"Card", html:html, data:{}});
    });
  }
  run();
});

module.exports = router;
