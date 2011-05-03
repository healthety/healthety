$(function(){
  var warnings = {};
  h.getSocket().on('message', function(data){
    json = jQuery.parseJSON(data);

    // build warnings
    if(warnings[json.name] === undefined){
      warnings[json.name] = {};
    }
    if(warnings[json.name][json.host] === undefined){
      warnings[json.name][json.host] = false;
    }

    var hostname = json.host.replace(/\W/g, '_');
    if(json.value >= parseInt($('#' + json.name + ' input')[0].value)){
      if(warnings[json.name][json.host] == false){
        warnings[json.name][json.host] = true;
      }
    } else {
      if(warnings[json.name][json.host] == true){
        warnings[json.name][json.host] = false;
      }
    };

    var warn = false;
    for(var host in warnings[json.name]){
      warn = warn || warnings[json.name][host];
    };

    if(warn){
      $('#' + json.name + ' h2').css('color', 'red');
    } else {
      $('#' + json.name + ' h2').css('color', '');
    }

  });

  $('h2').live('click', function(){
    var chart = $(this).parents('li').children('.block_content');
    var chart_hidden = $(this).parents('li')
      .children('.block_content:hidden').length == 1;
    if (chart_hidden) {
      chart.show();
      chart.parent().removeClass('small');
    } else {
      chart.hide();
      chart.parent().addClass('small');
    };
  });
});

