var UglifyJS = require("uglify-js"); // js concatter
var fs = require('fs');
var concat = require('concat-files');

module.exports = function(){
  try{
    var result = UglifyJS.minify([
      "scripts/custom/polyfills.js"
    //, "scripts/custom/progressbar.min.js"
    , "scripts/custom/page.min.js"
    , "scripts/custom/list.min.js"
    //, "scripts/custom/highcharts-standalone-framework.js"
    //, "scripts/custom/highcharts.js"
    //, "scripts/custom/highcharts-exporting.js"
    , "scripts/custom/async.min.js"
    , "scripts/helper.js"
    , "scripts/header.js"
    //, "scripts/menu.js"
    , "scripts/index.js"
    , "scripts/routes.js"
    ], {
      //compress: {disable:true}
      output: {beautify: process.env.DEBUG ? true : false}
      //outSourceMap: "script.js.map",
    });
  }catch(err) {
    console.log(err);
    console.log(err.stack);
  }
  fs.writeFile("public/js/script.js", result.code, function(err) {
    if(err)
      return console.log(err);
    console.log("script written");
  }); 
  //fs.writeFile("public/js/script.js.map", result.map, function(err) {
  //  if(err)
  //    return console.log(err);
  //}); 
}
