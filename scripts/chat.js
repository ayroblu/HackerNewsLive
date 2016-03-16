var socket = io();
var textbox = geid("m");
textbox.onkeydown = function(e) {
  if(event.keyCode == 13 && !event.shiftKey){
    e.preventDefault();
    return false;
  }
}
textbox.onkeyup = function(e) { 
  if (e.keyCode == 13 && !event.shiftKey) {
    socket.emit('chat message', textbox.value);
    textbox.value = '';
  } else {
    socket.emit('chat progress', textbox.value);
  }
  e.preventDefault();
}
socket.on('chat message', function(msg){
  qget('#messages').appendChild(createLi({'innerText':msg}));
});
