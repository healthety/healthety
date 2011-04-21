charts = {}
lines = {}
hosts = []
colors = [
  {
    'strokeStyle' : 'rgb(0, 255, 0)',
    'fillStyle' : 'rgba(0, 255, 0, 0.4)'
  },
  {
    'strokeStyle' : 'rgb(255, 0, 255)',
    'fillStyle' : 'rgba(255, 0, 255, 0.3)'
  }
]

// Open new socket and parse the response data into JSON
$(function() {
  socket = new io.Socket('localhost', {'port': window.location.port});
  socket.connect();
  socket.on('message', function(data){
    var obj = jQuery.parseJSON(data);
     appendToChart(obj.name, obj.value, new Date(obj.created_at), obj.host);
  });
});

function appendToChart (name, value, created_at, host) {
  if(typeof charts[name] == "undefined"){
    $('#main').append(
      '<div class="graphs"><p>' + name + ': ' +
      '<span id="' + name + '_value" class="values"></span></p>' +
      '<canvas id="chart_'+ name + 
      '" width="400" height="100"></canvas></div>'
    );
    charts[name] = new SmoothieChart(
      { minValue: 0, millisPerPixel: 100 }, 
      1000 // delay
    );
    charts[name].streamTo($('#chart_'+ name)[0]);
  }
  replaceValue(name, value, host);
  appendToLine(name, value, created_at, host);
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
        strokeStyle: colors[hosts.indexOf(host)]['strokeStyle'],
        fillStyle: colors[hosts.indexOf(host)]['fillStyle'],
        lineWidth: 3
      }
    );
  };
  
  lines[name + host].append(created_at, value);
}
