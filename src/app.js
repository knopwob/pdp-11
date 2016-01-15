var UI = require('ui');
var Vibe = require('ui/vibe');
var Light = require('ui/light');
var ajax = require('ajax');
var Wakeup = require('wakeup');

var url = "http://pushdis.herokuapp.com/api/messages?channels=foo";

var splash_card = new UI.Card({
      title: "PDP-11",
      subtile: "Fetching new messages ..."
});

function update() {

  splash_card.show();
  var last_update = Math.floor(localStorage.getItem('last_update'));
 

  if (last_update) {
    url = url +  "&created_at_min=" + last_update;
  }
  console.log("requesting: " + url);
ajax(
  {
    url: url,
    type: 'json',
    async: false,
    cache: false,
  },
   handle_request_answer,
   handle_request_error
  );
  
  schedule_wakeup(60);
  localStorage.setItem('last_update', Math.floor(Date.now() / 1000));
  splash_card.hide();

}

function schedule_wakeup(in_seconds) {
      Wakeup.schedule(
  {
    time: Date.now() / 1000 + in_seconds,
    data: { scheduled_in_seconds: in_seconds },
   },
      wakeup_error_handler);
}

function wakeup_error_handler(e) {
  console.log("wakeup error: " + e.error);
  if (e.failed) {
    if (e.error == 'range') {
      schedule_wakeup(e.data.scheduled_in_seconds + 60);
    }
  }
}


function handle_request_answer(data, status, request) {

  console.log("new data: " + data);
  var messages = data.messages;
  
  for (var i = 0; i < messages.length; i++) {
    Vibe.vibrate('short');
    var m = messages[i];
    var notify_card = new UI.Card({
      title: m.title,
      subtitle: m.subtitle
    });
    notify_card.show();
  }
}

function handle_request_error(error, status, request) {
  console.log("request error: " + error);
}


update();