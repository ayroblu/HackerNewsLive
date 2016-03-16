// Navigation
// -----------
// Handles what happens when people click on the links
listoflinks = qgeta('#mainnav a')
for (var i = 0; i < listoflinks.length; ++i) {
  var l = listoflinks[i];
  var func = (function(i){
    return function(e) { changeActiveDim(listoflinks[i].parentNode) }
  })(i);
  l.onclick = func;
}
qget('.showmenu').onclick = function() {
  var show = qget('#mainnav').classList.toggle('show');
  if (show) {
    geid('main').classList.add('blur');
    var cover = geid('cover');
    cover.classList.remove('hidden');
    cover.onclick = function() {
      qget('.showmenu').onclick();
    }
    cover.classList.add('fadein');
  } else {
    geid('main').classList.remove('blur');
    var cover = geid('cover')
    cover.classList.add('hidden');
  }
}

window.changeActiveDim = function (node) {
  qget('#main').classList.add("dim");
  node.classList.add('dim');
}
window.changeActiveUnDim = function (node) {
  qget('#main').classList.remove("dim");
  node.classList.remove('dim');

  for (var i = 0; i < listoflinks.length; ++i) {
    listoflinks[i].parentNode.classList.remove('active');
  }
  node.classList.add('active');

  qget('#mainnav').classList.remove('show');
}


// Cube
// -----
qget('figure.front').onclick = function(){
  console.log('run!');
  qget('#cube').className = 'show-top';
}
qget('figure.top').onclick = function(){
  qget('#cube').className = 'show-right';
}
qget('figure.right').onclick = function(){
  qget('#cube').className = 'show-back';
}
qget('figure.back').onclick = function(){
  qget('#cube').className = 'show-bottom';
}
qget('figure.bottom').onclick = function(){
  qget('#cube').className = 'show-left';
}
qget('figure.left').onclick = function(){
  qget('#cube').className = 'show-front';
}
