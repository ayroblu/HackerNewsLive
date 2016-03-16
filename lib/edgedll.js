var edge = require('edge');

var helloWorld = edge.func(function () {/*
  async (input) => { 
    string path = System.IO.Directory.GetCurrentDirectory();
    return ".NET Welcomes " + input.ToString() + ", cwd: " + path; 
  }
*/});
var helloStayinFront = edge.func('lib/ConvertImage.cs');

helloWorld('JavaScript', function (error, result) {
    if (error) throw error;
    console.log(result);
});
helloStayinFront('SELECT 1', function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    console.log(result);
});
