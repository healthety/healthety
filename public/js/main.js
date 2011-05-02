$(function(){
  Healthety().draw();
});

var Healthety = function(){
  var minime = {};
  var charts = {};
  var lines = {};
  var hosts = {};
  var socket;

  var colors = [
    "Fuchsia", "Green", "Lime", "Maroon", "Navy", "Olive", "Purple",
    "Red", "Teal"
  ];

  minime.draw = function(){
    socket = connect();
    socket.on('message', function(data){
      json = jQuery.parseJSON(data);
      initChart(json);
      charts[json.name].setupGrid();
      charts[json.name].draw();
    });
  };

  function connect(){
    socket = new io.Socket(
      window.location.host.split(":")[0], {'port': window.location.port}
    );
    socket.connect();
    return socket;
  }

  function initChart(json){
    // Check if host is already known.
    if(charts[json.name] === undefined){
      $('#main').append(
        '<li class="widget"><div class="line_chart"></div></li>'
      );

      var options = {
        series: { shadowSize:  0},
        xaxis:  { mode: 'time', timeformat: "%H:%M:%S" }
      }

      lines[json.name] = {}

      charts[json.name] = $.plot(
        $('.widget:last').children('.line_chart'), [], options
      );
    }

    appendLine(json);
  };

  function appendLine(json){
    var line = lines[json.name][json.host]
    if(line === undefined){
      line = lines[json.name][json.host] = {label: json.host, data: []};
    }
    var millis = json.date*1000
    line.data.push( [millis, json.value] );
    if (line.length >= 10){
      line.shift();
    }
    var data = [];
    for(var host in lines[json.name]){
      data.push(lines[json.name][host]);
    }

    charts[json.name].setData( data );
  }

  return minime;
}

