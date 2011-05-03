$(function(){
  h = Healthety();
  h.draw();
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

  var colors = ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"];

  minime.draw = function(){
    socket = connect();
    socket.on('message', function(data){
      json = jQuery.parseJSON(data);
      initChart(json);
      charts[json.name].setupGrid();
      charts[json.name].draw();
    });
  };

  minime.getSocket = function(){ return socket; };

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
//       $('#main').append(
//         '<li id="' + json.name + '" class="widget"><h2>'+ json.name +
//           '</h2><input type="text" /><span class="value">: </span><div class="line_chart"></div>'+
//         '</li>'
//       );
      $('#main').append('<li id="'+ json.name +'" class="block widget">'+
        '<div class="block_head"><div class="bheadl"></div><div class="bheadr">'+
        '</div><h2>'+ json.name +'</h2><ul class="tabs value"></ul></div>'+
        '<div class="block_content tab_content"><div class="line_chart">'+
        '</div></div><div class="bendl"></div><div class="bendr"></div></li>');

      $('#main').sortable();

      var options = {
        series: { shadowSize:  0},
        xaxis:  { mode: 'time', timeformat: "%H:%M:%S" },
        yaxis:  { min: 0 },
        grid:   { color: '#666'}
      };

      values[json.name] = {};
      lines[json.name] = {};

      charts[json.name] = $.plot(
        $('.line_chart:last'), [], options
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
        '<li class="nobg '+ hostname +'"></li>'
      );
      value = values[json.name][json.host] = $('#' + json.name + ' .value li:last')
    }
    value.html('<h2 style="color: '+ getColor(json.host) +'">'+json.value+'</h2>');
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
    // line.data.push( [json.date*1000, json.value] );
    line.data.push( [(new Date()).getTime(), json.value] );

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

