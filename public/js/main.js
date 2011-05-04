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

  var colors = ['#edc240', '#afd8f8', '#cb4b4b', '#4da74d', '#9440ed',
    '#3366CC', '#66FF99', '#CC66CC'];

  minime.draw = function(){
    socket = connect();
    socket.on('message', function(data){
      json = jQuery.parseJSON(data);
      initChart(json);
    });
    setInterval(function(){
      // clean up values
      for(var name in lines){
        // ((new Date()).getTime()-300000)
        for(var host in lines[name]){
          for(var value in lines[name][host]['data']){
            var ref = ((new Date()).getTime()-300000);
            if(
              lines[name][host]['data'][value][0] < ref
            ){
              lines[name][host]['data'].shift();
            }
          }
        }

        // collect in array
        var data = [];
        for(var host in lines[name]){
          data.push(lines[name][host]);
        }

        // set and draw
        charts[name].setData( data );
        charts[name].setupGrid();
        charts[name].draw();
      };

      // write legend
      $('.legend').html('');
      for(var i in hosts){
        $('.legend').append('<li style="color:'+ colors[i] +'">'+ hosts[i] +'</li>')
      }

    }, 500);
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
      $('#widgets').append('<li id="'+ json.name +'"><div class="header"><h2>' +
      json.name +'</h2><div class="values"></div><div class="clear"></div>' +
      '</div><div class="container"><div class="line_chart"></div></div></li>');

      $('#widgets').sortable();

      var options = {
        series: { shadowSize:  0},
        xaxis:  { mode: 'time', timeformat: "%H:%M:%S" },
        yaxis:  { min: 0 },
        grid:   { color: '#666'},
        legend: { show: false }
      };

      values[json.name] = {};
      lines[json.name] = {};

      charts[json.name] = $.plot($('.line_chart:last'), [], options);
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
      value = values[json.name][json.host] = $('#'+json.name+' .value li:last ');
      value.css('color', getColor(json.host)).css('font-size', '20px');
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
    // line.data.push( [json.date*1000, json.value] );
    line.data.push( [(new Date()).getTime(), json.value] );


  }

  function getColor(hostname){
    return colors[hosts.indexOf(hostname)];
  }

  return minime;
}

