$(function(){
  Healthety().draw();
});

var Healthety = function(){
  var minime = {};
  var charts = {};
  var lines = {};
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

      lines[json.name] = [ [json.date, json.value] ];
      charts[json.name] = $.plot(
        $('.widget:last').children('.line_chart'), [], {}
      );
    }

    appendLine(json);
  };

  function appendLine(json){
    lines[json.name].push( [json.date, json.value] );
    if (lines[json.name].length >= 20) lines[json.name].shift();

    charts[json.name].setData( [lines[json.name] ] );
  }

  return minime;
}

// OLD

charts = {}
lines = {}
hosts = []
colors = [
  "Fuchsia", "Green", "Lime", "Maroon", "Navy", "Olive", "Purple",
  "Red", "Teal"
]

// open new socket and parse the response data into JSON
var onload = function() {
  socket = new io.Socket(
    window.location.host.split(":")[0],
    {'port': window.location.port}
  );
  socket.connect();
  socket.on('message', function(data){
    var obj = jQuery.parseJSON(data);
    appendToChart(obj.name, obj.value, new Date(obj.created_at), obj.host);
  });
  $('.widgets').live('click', function(){
    var name = $(this).children('input[type=hidden]')[0].value;
    var number = $($('#' + name + '_value')[0]);
    var chart = $($('#' + name + '_chart')[0]);
    var number_hidden = $('#' + name + '_value:hidden').length == 1;
    var chart_hidden = $('#' + name + '_chart:hidden').length == 1;
    if(!number_hidden && !chart_hidden){
      number.hide();
    } else if (number_hidden){
      number.show();
      chart.hide();
      $(this).width(450);
    } else if (chart_hidden){
      number.show();
      chart.show();
      $(this).css('width', '');
    };
  });
}

function appendToChart (name, value, created_at, host) {
  if(typeof charts[name] == "undefined"){
    $('#main').append(
      '<li class="widgets ' + name + '"><input type="hidden" value="' + name +
      '"><p><h2>' + name + ': ' +
      '<span id="' + name + '_value" class="values"></span></h2></p>' +
      '<canvas id="'+ name +
      '_chart" width="1600" height="200"></canvas></li>'
    );
    $( "#main" ).sortable();

    charts[name] = new SmoothieChart({
      fps: 30,
      millisPerPixel: 100,
      minValue: 0,
      resetBounds: false,
      grid: {
        fillStyle: 'white',
        strokeStyle: '#848484',
        lineWidth: 0.7,
        millisPerLine: 60000, // every minute a line
        verticalSections: 4
      },
      labels: {
        fillStyle: '#333'
      }
    });
    charts[name].streamTo($('#' + name + '_chart')[0]);
  }
  updateLegend();
  replaceValue(name, value, host);
  appendToLine(name, value, created_at, host);
}

function updateLegend(){
  $('#legend').html('');
  for(i=0; i < hosts.length; i++){
    $('#legend').append('<span style="color:' + colors[i] + '">' + hosts[i] + "  </span>");
  }
}

function replaceValue(name, value, host) {
  $('#' + name + '_value').html(value);
}

function appendToLine (name, value, created_at, host) {
  if (typeof lines[name+host] == 'undefined') {
    if(hosts.indexOf(host) == -1) hosts.push(host);

    lines[name + host] = new TimeSeries();

    charts[name].addTimeSeries(
      lines[name + host],
      {
        strokeStyle: colors[hosts.indexOf(host)],
        lineWidth: 3
      }
    );
  };

  lines[name + host].append(created_at, value);
}

