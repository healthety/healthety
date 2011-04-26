var http = require('http');
var io = require('socket.io');
var connect = require('connect');
var sys = require('sys');
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

httpServer = connect.createServer(
    connect.favicon()
  , connect.logger()
  , connect.static(__dirname + '/../public')
);

var connected_clients = [];

var socket = io.listen(httpServer);
socket.on('connection', function(client){
  connected_clients.push(client)
});

udpServer.on('message', function(msg, rinfo) {
  // console.log('Server got: ' + msg.toString() + ' from ' +
  //   rinfo.address + ':' + rinfo.port);
  for (var i=0; i < connected_clients.length; i++) {
    connected_clients[i].send(msg.toString());
  };
});

exports.run = function(httpPort, udpPort) {
  udpServer.bind(udpPort);
  httpServer.listen(httpPort);
  console.log('=> Listening for UDP packets on 127.0.0.1:' + udpPort);
  console.log('=> Server running at http://127.0.0.1:' + httpPort + ', Ctrl-C to stop');
}
