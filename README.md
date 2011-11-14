# Healthety

Healthety is a realtime and easy to setup monitoring framework built on Node.

The server listens to a given port for UDP packets and streams these information  via WebSockets to the fontend.

## Installation

First of all you need to install [Node](https://github.com/joyent/node/wiki/Installation) and the packet manager [npm](https://github.com/isaacs/npm#readme).

Then install Healthety by running:

    $ npm install healthety

## Usage

    var server = require('healthety');
    server.run(
      8124, // http server port
      41234 // UDP server port
    );

Open http://localhost:8124 in your browser.

To report data you can use our worker. Currently there is a [Ruby](https://github.com/healthety/ruby_worker) and [PHP](https://github.com/healthety/php_worker) worker. We'll publish very soon a JavaScript worker library.

## Basic Auth

Optional you can use basic auth to protect your reports.

    var server = require('healthety');
    server.run(
      8124, // http server port
      41234, // UDP server port,
      {basicAuth: {user: 'admin', pass: 'secret'}}
    );

## Other Features

You can specify the time frame by adding snake case chart name plus '_frame' and
value in seconds. I know, lousy description... Example for set 'Load Average' chart time frame to 5minutes:

     your.healthety.server.com/?load_average_frame=300000

It is also possible to display warnings when given limits are exceeded. Example for setting limits for 'Memory' chart to 12000:

    your.healthety.server.com/?memory=12000

To shorten the host names in legend provide 'cut_off' parameter:

    your.healthety.server.com/?cut_off=.example.com

## Other installation methods and monitoring

We can provide [Chef](https://github.com/opscode/chef) and [Monit](http://mmonit.com/monit/) recipes. They are not polished and thus not published, but we could give it to you if you promise not to show anyone.
