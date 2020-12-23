/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");

/** called when connection opens, sends join info to server. */

ws.onopen = function(evt) {
  console.log("open", evt);

  let data = {type: "join", name: name};
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = async function(evt) {
  // console.log("message", evt);
  let msg = JSON.parse(evt.data);
  // console.log(msg)
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  }

  else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  }

  else if (msg.type === "joke") {
    let joke = await getJoke();
    item = $(`<li><b>${msg.name} says: Wanna hear a joke?</b> ${joke}</li>`);
  }

  else {
    return console.error(`bad message: ${msg}`);
  }

  $('#messages').append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$('form').submit(async function (evt) {
  evt.preventDefault();

  let text = $("#m").val();
  let data;
  if (text.slice(0,5) === "/joke") {

    data = {type: "joke"}

  } else {
    data = {type: "chat", text: `${text}`};
  }
  ws.send(JSON.stringify(data));

  $('#m').val('');
});

async function getJoke() {
  let res = await axios({
      method: 'get',
      url: 'https://icanhazdadjoke.com/',
      headers: { 
        'Accept': 'text/plain'
      }
    });
    let joke = res.data;
    return joke;
      
  };