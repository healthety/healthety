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

  var colors = ["#0063ed", "#d44105", "#81e439", "#efb100", "#8f46f1",
                "#ce4176", "#52cffa", "#ffd528"];

  minime.draw = function(){
    $('#wrapper').append('<div id="legend"></div>');

    socket = connect();
    socket.on('message', function(data){
      json = jQuery.parseJSON(data);
      initChart(json);
    });

    setInterval(function(){
      // clean up values
      for(var name in lines){
        var threshold = getThreshold(name);
        for(var host in lines[name]){
          for(var value in lines[name][host]['data']){
            if(
              lines[name][host]['data'][value][0] < threshold
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
      $('#legend').html('');
      for(var i in hosts){
        var cut_off = $(document).getUrlParam('cut_off')
        $('#legend').append(
          '<span style="color:'+ colors[i] +'">'+ hosts[i].replace(cut_off, '') +'</span>'
        );
      }

      $('#legend > span').sortElements(function(a, b){
          return $(a).text() > $(b).text() ? 1 : -1;
      });

      $.each($('.header'), function(idx, elm){
        $('.values > span', elm).sortElements(function(a, b){
            return $(a).attr('class') > $(b).attr('class') ? 1 : -1;
        })
      });

    }, 500);
  };

  minime.getSocket = function(){ return socket; };

  function connect(){
    socket = io.connect(
      window.location.host.split(":")[0], {'port': window.location.port}
    );
    //socket.connect();
    return socket;
  }

  function initChart(json){
    if(hosts.indexOf(json.host) == -1) {
      hosts.push(json.host);
    }
    var widget = json.name.replace(/_/, ' ');

    // Check if host is already known.
    if(charts[json.name] === undefined){
      $('#widgets').append('<li id="'+ json.name +'"><div class="header"><h2>' +
      widget +'</h2><div class="values"></div><div class="clear"></div>' +
      '</div><div class="container"><div class="line_chart"></div></div></li>');

      $('#widgets').sortable();
      $('#widgets').disableSelection();

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
      $('#' + json.name + ' .values').append(
        '<span class="'+ hostname +'"></span>'
      );
      value = values[json.name][json.host] = $('#'+json.name+' .values span:last ');
      value.css('color', getColor(json.host));
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

  function getThreshold(name){
    var custom = $(document).getUrlParam(name+'_frame');
    var threshold;
    if(custom == null){
      threshold = 300000;
    } else {
      threshold = parseInt(custom) * 60*1000;
    }
    return (new Date()).getTime() - threshold;
  }

  return minime;
}

