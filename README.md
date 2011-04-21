# Healthety

Healthety is a realtime and easy to setup monitoring framework built on Node.

### Installation

First of all you need to install [Node](https://github.com/joyent/node/wiki/Installation) and the packet manager [npm](https://github.com/isaacs/npm#readme).

Then install Healthety by running:

    npm install healthety

### Instructions

    var server = require('healthety');
    server.run(
      8124, // http server port
      41234 // UDP server port
    );
