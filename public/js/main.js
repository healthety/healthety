charts = {}
lines = {}
hosts = []
colors = ["Aqua", "Fuchsia", "Gray", "Green", "Lime", "Maroon", "Navy", "Olive", "Purple", "Red", "Silver", "Teal", "White", "Yellow"]

// Open new socket and parse the response data into JSON
$(function() {
  socket = new io.Socket(window.location.host.split(":")[0], {'port': window.location.port});
  socket.connect();
  socket.on('message', function(data){
    var obj = jQuery.parseJSON(data);
     appendToChart(obj.name, obj.value, new Date(obj.created_at), obj.host);
  });
});

function appendToChart (name, value, created_at, host) {
  if(typeof charts[name] == "undefined"){
    $('#main').append(
      '<div class="widgets ' + name + '"><p>' + name + ': ' +
      '<span id="' + name + '_value" class="values"></span></p>' +
      '<canvas id="'+ name +
      '_chart" width="1600" height="400"></canvas></div>'
    );
    charts[name] = new SmoothieChart({
      fps: 30,
      millisPerPixel: 100,
      minValue: 0,
      grid: {
        strokeStyle: '#555555',
        lineWidth: 1,
        millisPerLine: 10000,
        verticalSections: 4
      }
    }, 1000 /* delay */ );
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

