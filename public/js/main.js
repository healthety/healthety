$(function(){
  Healthety().draw();
});

var Healthety = function(){
  var minime = {};
  var charts = {};
  var values = {};
  var lines = {};
  var hosts = [];
  var socket;

  var colors = [
    "Fuchsia", "Green", "Lime", "Maroon", "Navy", "Olive", "Purple",
    "Red", "Teal"
  ];
  // flot colors. still looking for more.
  // var colors = ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"]

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
    if(hosts.indexOf(json.host) == -1) hosts.push(json.host);

    // Check if host is already known.
    if(charts[json.name] === undefined){
      $('#main').append(
        '<li id="' + json.name + '" class="widget">'+
          '<div class="value">Values: </div><div class="line_chart"></div>'+
        '</li>'
      );

      var options = {
        series: { shadowSize:  0},
        xaxis:  { mode: 'time', timeformat: "%H:%M:%S" },
        yaxis:  { min: 0 }
      };

      values[json.name] = {};
      lines[json.name] = {};

      charts[json.name] = $.plot(
        $('.widget:last').children('.line_chart'), [], options
      );
    }
    replaceValue(json);
    appendLine(json);
  };

  function replaceValue(json){
    var value = values[json.name][json.host];
    var hostname = json.host.replace(/\W/g, '_');
    if(value === undefined){
      $('#' + json.name + ' .value').append(
        '<span class="'+ hostname +'" style="color: '+ getColor(json.host) +'">'+
        '</span>'
      );
      value = values[json.name][json.host] = $('#' + json.name + ' .value span')
    }
    value.html(json.value);
  }

  function appendLine(json){
    var line = lines[json.name][json.host]
    if(line === undefined){
      line = lines[json.name][json.host] = {
        label: json.host,
        color: getColor(json.host),
        data: []
      };
    }
    line.data.push( [json.date*1000, json.value] );
    if (line.data.length >= 100){
      line.data.shift();
    }
    var data = [];
    for(var host in lines[json.name]){
      data.push(lines[json.name][host]);
    }

    charts[json.name].setData( data );
  }

  function getColor(hostname){
    return colors[hosts.indexOf(hostname)];
  }

  return minime;
}

