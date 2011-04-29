charts = {}
lines = {}
hosts = []
colors = ["Aqua", "Black", "Fuchsia", "Green", "Lime", "Maroon", "Navy", "Olive", "Purple", "Red", "Teal"]

// open new socket and parse the response data into JSON
$(function() {
  socket = new io.Socket(window.location.host.split(":")[0], {'port': window.location.port});
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
    } else if (chart_hidden){
      number.show();
      chart.show();
    };
  });
});

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
      grid: {
        fillStyle: 'white',
        strokeStyle: '#848484',
        lineWidth: 1,
        millisPerLine: 10000,
        verticalSections: 4
      }
    }, 3000 /* delay */ );
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

