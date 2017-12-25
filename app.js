process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const stompit = require('stompit');
const settings = require("./settings");

const host = settings.host;
const QUEUE = settings.queue;
const TOPIC = settings.topic;
let client = null;

stompit.connect({ host: host, port: 61613 }, (err, _client) => {
    if(err) {
        console.error("err: ", err);
    }else {
        client = _client;
        let timer = null;
        client.subscribe({ destination: QUEUE }, (err, msg) => {
            msg.readString('UTF-8', (err, body) => {
                console.log("queue: ", body);
            });
        });
        client.subscribe({ destination: TOPIC }, (err, msg) => {
            msg.readString('UTF-8', (err, body) => {
                console.log("topic1: ", body);
            });
        });
        setTimeout(()=>{
            const event1 = client.send({ destination: QUEUE });
            event1.write(JSON.stringify({RequestKey: 'queue'}));
            event1.end();
            const event2 = client.send({ destination: TOPIC });
            event2.write(JSON.stringify({RequestKey: 'topic1'}));
            event2.end();
        }, 1000);
    }
});

process.on("SIGINT", ()=>{
    console.log("exit");
    client && client.disconnect();
});
