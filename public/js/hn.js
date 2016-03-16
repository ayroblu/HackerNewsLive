var socket = io();
var freeze = false;

socket.on('hn currentData', function(data){
  if (freeze)
    return;
  var links = document.querySelectorAll('.itemlist .title > a');
  var changes = [];
  // links length is 31, skip last one
  for (var i = 0; i < data.titles.length; ++i) {
    if (links[i].innerText != data.titles[i].t){
      //links[i].style.background="red";
      changes.push({idx: i, linkText: links[i].innerText, titleText: data.titles[i].t});
      console.log(links[i].innerText, data.titles[i].t);
    }
  }
  thing = data.rows;

  if (changes.length == 0)
    return;

  var matches = 0;
  var mapping = {};
  for (var i = 0; i < changes.length; ++i) {
    for (var k = 0; k < changes.length; ++k) {
      if (i == k || changes[k].matched)
        continue;
      if (changes[i].linkText == changes[k].titleText) {
        mapping[changes[i].idx] = changes[k].idx;
        changes[k].matched = true;
        ++matches;
      }
    }
  }
  if (mapping.length != changes.length) {
    for (var i = 0; i < changes.length; ++i) {
      if (!changes[i].matched) {
        //changes[i].idx;
        // Turn html in to nodes, and add it to the dom
        console.log("Not matched! " + changes[i].idx);
        //alert("no match!");
        (function(key){
          var itemlist = document.querySelector('.itemlist tbody');
          var params = {
            toElemString: data.rows[key*3]
          , fromEl: itemlist.children[key*3]
          , noDest: true
          , bodyEl: itemlist.parentElement
          };
          shiftElements(params);
          params = {
            toElemString: data.rows[key*3+1]
          , fromEl: itemlist.children[key*3+1]
          , noDest: true
          , bodyEl: itemlist.parentElement
          };
          shiftElements(params);
        })(changes[i].idx);
      }
    }
  }

  console.log(mapping);
  Object.keys(mapping).forEach(function(key) {
    var val = mapping[key];

    var itemlist = document.querySelector('.itemlist tbody');
    var params = {
      toElemString: data.rows[val*3]
    , fromEl: itemlist.children[key*3]
    , toEl: itemlist.children[val*3]
    , noDest: false
    , bodyEl: itemlist.parentElement
    };
    shiftElements(params);
    params = {
      toElemString: data.rows[val*3+1]
    , fromEl: itemlist.children[key*3+1]
    , toEl: itemlist.children[val*3+1]
    , noDest: false
    , bodyEl: itemlist.parentElement
    };
    shiftElements(params);
  });
});

socket.on('hn getlink', function(data){
  var frames = document.querySelectorAll('.itemlist .title > a');
  var iframe = frames[data.idx].getElementsByTagName("iframe")[0];
  var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
  iframedoc.body.innerHTML = data.body;
});
function shiftElements(params){
  //var paramsEx = {
  //  toElemString: "<tr>"
  //, fromEl: Node
  //, toEl: Node
  //, noDest: false
  //, bodyEl: Node
  //};

  //console.log("Shifting elements with params:",params);
  // Turn html in to nodes, and add it to the dom
  var tbody = document.createElement('tbody');
  tbody.innerHTML = params.toElemString;
  var tr = tbody.children[0];
  tr.classList.add('float');
  var itemlist = document.querySelector('.itemlist tbody');
  itemlist.appendChild(tr);

  // Fix for table, where left numbering width needs to line up
  for (var i = 0; i < params.fromEl.children.length; ++i){
    var bounds = params.fromEl.children[i].getBoundingClientRect();
    tr.children[i].style.width = bounds.width + "px";
  }

  // Get offset position
  var bodyRect = params.bodyEl.getBoundingClientRect(),
  elemRect = params.fromEl.getBoundingClientRect(),
  offset   = elemRect.top - bodyRect.top;

  // Set tr floating position;
  tr.style.top = offset + "px";
  if (params.noDest) {
    tr.style.marginLeft = -elemRect.right + "px";

    setTimeout(function(){
      tr.style.marginLeft = "0px";
    }, 10);
  } else {
    //tr.style.backgroundColor = "rgb(246, 246, 239)";
    //tr.style.backgroundColor = "red";

    // Add filler element in place
    var trFill = tr.cloneNode();
    trFill.style.height = tr.getBoundingClientRect().height + "px";
    trFill.style.top = offset+"px";
    trFill.style.zIndex = "0";
    itemlist.appendChild(trFill);

    // Calculate new position floating tr should be in
    elemRect = params.toEl.getBoundingClientRect();
    offset   = elemRect.top - bodyRect.top;
    tr.style.top = offset + "px";
  }
  
  // set underlying rows to new row
  setTimeout(function(){
    if (params.noDest) {
      params.fromEl.innerHTML = tr.innerHTML;// this is old html, use new
    } else {
      params.toEl.innerHTML = tr.innerHTML;
      trFill.parentElement.removeChild(trFill);
    }
    tr.parentElement.removeChild(tr);
  }, 1500);
}
function addIframe(a){
  var div = document.createElement('div');
  div.innerHTML = "<iframe class='hidden' src='"+a.href+"' frameborder=''></iframe>";
  var iframe = div.children[0];
  a.appendChild(iframe);
}
function addIframes(){
  var links = document.querySelectorAll('.itemlist .title > a');
  //links.splice(90,2);
  for (var i = 0; i < links.length; ++i) {
    setTimeout(function(link){return function(){
      addIframe(link);
    }}(links[i]), i*100);
    //socket.emit('hn getlink', {url:links[i].href, idx:i});
    links[i].onmouseover = function(e){
      // loop through links and find their iframes
      var iframe = this.querySelector("iframe");
      if (!iframe)
        return;
      for (var k = 0; k < links.length; ++k){
        var iframel = links[k].querySelector('iframe');
        if (!iframel)
          continue;
        iframel.classList.add('hidden');
      }
      iframe.classList.remove('hidden');
    }
  }
}
addIframes();
