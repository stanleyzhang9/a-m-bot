
const request = require('request');

'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
    	
  		if (webhook_event.message) {
    		handleMessage(sender_psid, webhook_event.message);        
  		} else if (webhook_event.postback) {
    		handlePostback(sender_psid, webhook_event.postback);
  		}
		});

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  // i'm too lazy to fix this for a small project
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text) {
    var arr = received_message.text.split(",");
    if (arr.length == 2) {
      // write file to be read by python script
      response = {
        "text": 'I added ' + arr[0] +' to your shopping list with the maximum price of ' + arr[1]
      }
      var fs = require('fs');
      let buffer = arr[0]+'\n'+arr[1]+'\n';
      fs.writeFile("new_list", buffer, (err) => {
            if (err) throw err;
          });
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token":
    "EAActpdrZAKhQBAKKvYKIzvhGWiw4ZAwzcPzZCpQj3DwYdZBZB7z0o9GZAHIr71edE2AYeLBLmD9VNpMpTg7YWxib7Cs4ger63RLUJNgXMLWNEmctlZCBpnMfDx7afIUhK02ym9haRmp5aYtTR5Tj8IHPgGFsB2HmTvW7rOt8MB6BmuZBm4jP5dZBb" },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}



