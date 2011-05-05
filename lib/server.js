var http = require('http');
var io = require('socket.io');
var connect = require('connect');
var sys = require('sys');
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

var connected_clients = [];

udpServer.on('message', function(msg, rinfo) {
  for (var i=0; i < connected_clients.length; i++) {
    connected_clients[i].send(msg.toString());
  };
});

exports.run = function(httpPort, udpPort, options) {
  udpServer.bind(udpPort);

  var httpServer = connect.createServer();

  if(
    typeof options != 'undefined' &&
    options.basicAuth &&
    options.basicAuth.user &&
    options.basicAuth.pass
  ){
    httpServer.use(connect.basicAuth(
      options.basicAuth.user, options.basicAuth.pass
    ))
  }

  httpServer
    .use(connect.favicon(__dirname + '/../public/favicon.ico'))
    .use(connect.logger())
    .use(connect.static(__dirname + '/../public'));

  var socket = io.listen(httpServer);
  socket.on('connection', function(client){
    connected_clients.push(client)
  });

  httpServer.listen(httpPort);
  console.log('=> Listening for UDP packets on 127.0.0.1:' + udpPort);
  console.log('=> Server running at http://127.0.0.1:' + httpPort + ', Ctrl-C to stop');
}
