var express = require('express');
var router = express.Router();
var models = require('../lib/sqlserver');
var async = require('async');
var sql = require('mssql'); 
var extend = require('util')._extend;
//var filterStructure = require('../lib/filterStructure');
var parseString = require('xml2js').parseString;
//var filterInterpreter = require('../lib/filterInterpreter');

//router.post('/getfilteredengagement', function(req, res, next) {
//  var params = req.body.params[1];
//  var conditions = req.body.conditions[1];
//  var f = function(internalSelect, internalParams){
//    models.getFilteredEngagement(function(err, context) {
//      res.status(400).json({err:err});
//    }, function(recordset) {
//      res.json({data:recordset});
//    }, internalSelect, internalParams);
//  }
//  try{
//    filterInterpreter.getProfileFilter(params, conditions, f);
//  }catch(err){
//    console.log(err);
//    res.status(400).json({err:err});
//  }
//});
module.exports = router;
