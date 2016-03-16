var sql = require('mssql'); 
var async = require('async'); 
var mime = require('mime');
var util = require('util');
var extend = require('util')._extend;
 
//var config = {
//  user: 'CME_Admin_Global'
//  ,password: 'D@t@r@ti2014'
//  ,server: '10.10.10.19' // You can use 'localhost\\instance' to connect to named instance 
//  ,database: 'CME_NZRU'
//}
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
 
/**
 * Performs a query to select from the ConsoleAppLog, and returns the first 1000 rows its finds
 *
 * @param errres function This is the error response function, which is called if there is an error, and takes two inputs, the error and the context which can be "Connection Error", "Query Error", or "Error Handler"
 * @param res function This is the response function which is called if there is a success, and has one input, the recordset to use
 */
module.exports = {
  config: {
    user: 'CME_Admin_Global'
    ,password: 'D@t@r@ti2014'
    ,server: '10.10.10.19' // You can use 'localhost\\instance' to connect to named instance 
    ,database: 'CME_NZRU'
    ,connectionTimeout: 10000
    ,pool: {
      max: 10
    , min: 0
    , idleTimeoutMillis: 30000
    }
  }
, connect: function(errres, render, cmd, params){
    var conn = new sql.Connection(this.config, function(err) {
      if (err) {
        console.log("Connection error?: ", err);
        errres(err, "Connection Error");
        return;
      }

      // Query
      if (params)
        console.log(cmd, params);
      else
        console.log(cmd);
      var request = new sql.Request(conn);
      if (params)
        for (var k in params)
          if (params.hasOwnProperty(k))
            request.input(k, params[k].type, params[k].value);

      request.query(cmd, function(err, recordset) {
        if (err){
          console.log('query error:',err);
          errres({err:err});
          return;
        }
        render(recordset);
      });
    });
    conn.on('error', function(err) {
      console.log("Some Error: ", err);
      errres(err, "Some Error");
    });
  }
  // params: {
  //   columns: [
  // }
  //this.selectQuery({
  //  top:35
  //  distinct:true|false
  //, columns:['1'] //required
  //, table:'CME_CommInst ci' //required
  //, joins:[{type:'inner|full outer|left|right',table:'CME_CommLog cl',on:'ci.CME_CommLog=cl.CME_CommLog'}]
  //, where:{
  //    type:'and|or' || 'and'
  //  , conditions:['ci.Individual=ic.CME_I_CAR',{type:'and|or', conditions:'1=1'}] //recursive
  //  }
  //})
, selectQuery: function(params){
    if (!params || !params.columns || !Array.isArray(params.columns) || params.columns.length == 0 || !params.table || typeof params.table !== 'string')
      return {err:'Missing params, need {columns:["*"],table:"dbo.tablename"} atleast'};

    var sqlparts = ["SELECT"]

    if (params.distinct)
      sqlparts.push('DISTINCT');

    if (params.top && typeof params.top === 'number' && isInt(params.top))
      sqlparts.push('TOP ' + params.top);

    for (var i = 0; i < params.columns.length; i++) {
      if (!(typeof params.columns[i] == 'string' && params.columns[i].length > 0)){
        params.columns.splice(i, 1);
        i--;
      }
    }
    sqlparts.push(params.columns.join());//defaults to ','

    sqlparts.push("FROM " + params.table);

    if (!params.locktype)
      params.locktype = 'nolock';
    sqlparts.push("with (" + params.locktype + ')');

    if (params.joins && Array.isArray(params.joins))
      for (var i = 0; i < params.joins.length; ++i)
        if (typeof params.joins[i] == 'object' && !Array.isArray(params.joins[i]))
          //sqlparts.push(params.columns[i]);
          if (typeof params.joins[i].table == 'string'){
            if (params.joins[i].type && ['inner','full outer','left','right'].indexOf(params.joins[i].type.toLowerCase()) >= 0)
              sqlparts.push(params.joins[i].type.toUpperCase());

            sqlparts.push('JOIN ' + params.joins[i].table);

            if (typeof params.joins[i].on == 'string')
              sqlparts.push('ON ' + params.joins[i].on);
          }

    // Pass in a list, it will be concat in to string
    var whereRecur = function(o){
      if (!o.type)
        o.type = 'and';
      if (!(Array.isArray(o.conditions) && typeof o.type == 'string' && ['and','or'].indexOf(o.type.toLowerCase()) >= 0))
        return null;

      var wherelist = o.conditions.map(function(val){
        if (typeof val === 'string')
          return val;

        if (typeof val === 'object' && !Array.isArray(val)){
          return "("+whereRecur(val)+")";
        }

        return null;
      })
      for (var i = 0; i < wherelist.length; i++) {
        if (wherelist[i] == null) {         
          wherelist.splice(i, 1);
          i--;
        }
      }
      return wherelist.join(" " + o.type.toUpperCase() + " ");
    }
    if (typeof params.where == 'object'){
      var whereconditions = whereRecur(params.where)
      if (whereconditions)
        sqlparts.push("WHERE " + whereconditions);
    }

    return sqlparts.join(' ');
  }
  // params: {
  // , type: sql.Int || sql.NVarChar || sql.UniqueIdentifier
  // , value: ""
  // }
, getListOfComms: function(err, render){
    var cmd = this.selectQuery({
      top:500
    , columns:["CME_CommLog", "Name CommName"]
    , table:"rpt.CommunicationHistoryCache"
    });
    //var cmd = 'SELECT * FROM rpt.GetEventsSummaryCache';
    this.connect(err, render, cmd);
  }
}
//module.exports.select(function(err){console.log(err)}, "SELECT Top 1 imagesrc FROM HS_SavedSummaryImage with (nolock) order by [ImageNumber]", function(data){console.log(data);});
