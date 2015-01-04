var ws = require("nodejs-websocket");
var mpd = require("./src/mpd");
var audioMetaData = require("./src/audioMetaData");
var fs = require('fs');

//load settings
if (!fs.existsSync("settings.json")) {
    console.log("ERROR: file 'settings.json' is not present");
    process.exit(1);
}

var fs = require('fs');
var defaultSettings = JSON.parse(fs.readFileSync('defaults.json', 'utf8'));
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

for(i in settings) {
    defaultSettings[i] = settings[i];
}

audioMetaData.setOptions(settings.audioMetaData);

//start the ws server
var server = ws.createServer(function (conn)
{
	MPDProxy(conn);
}).listen( defaultSettings.websockets.port );



///the mpd proxy
function MPDProxy(conn) {
    var client = mpd.createClient(defaultSettings.mpd, function() {
   		conn.sendText( JSON.stringify({"message": arguments[0], "param": arguments[1] }) );
    });

    client.connect();

    conn.on("text", function (str) {

        ///json messages
        if(str[0] == "{" && str[str.length-1] == "}") {

            try {
                var message = JSON.parse(str);
            } catch (err) {
                console.log(str, "is not a valid JSON message");
            }

            switch(message.message) {
                case 'getcover':
                    audioMetaData.getCover(message.params.artist, message.params.title, message.params.album, message.params.file, function(cover) {
                        conn.sendText( JSON.stringify({"message": "getcover", "param": {file: message.params.file, cover: cover} }) );
                    });

                    break;

                default:
                    console.log("Unknown JSON message:", message.message);
            }

            return;
        }

        //plain text message
        var command = str.split(" ");
        switch(command[0]) {
            case 'playlistinfo':
            case 'status':
            case 'play':
            case 'stop':
            case 'pause':
            case 'seekcur':
            case 'idle':
            case 'noidle':
            case 'random':
            case 'repeat':
                client.send(str);
                break;

            default:
                console.log("Unknown text message:", command[0]);
        }
    });

    conn.on("close", function (code, reason) {
        client.disconect();
        console.log("Connection closed")
    });
}