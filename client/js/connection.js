var MusicPlayer = MusicPlayer || {};

MusicPlayer.Connection = {};

///when we receive a message from the server
MusicPlayer.Connection.onmessage = function(data)
{
	var msg = JSON.parse(data.data);

	if(msg.message) {
		if(MusicPlayer.Commands[msg.message]) {
			MusicPlayer.Commands[msg.message].apply(window, [msg.param]);
		}
	}
}

///Start the connection
MusicPlayer.Connection.start = function(callback)
{
	MusicPlayer.Connection.conn = new WebSocket('ws://127.0.0.1:8080');

	MusicPlayer.Connection.conn.onopen = function(e) {
	    callback.call();
	};

	MusicPlayer.Connection.conn.onmessage = MusicPlayer.Connection.onmessage;
}

///Send message
MusicPlayer.Connection.send = function(data)
{
	if(MusicPlayer.Connection.conn.readyState == 1) {
		MusicPlayer.Connection.conn.send(data);
	}
}

///Get song cover
MusicPlayer.Connection.getcover = function(artist, title, album, file)
{
	var data = {
		"message": "getcover",
		"params": {}
	};

	if(artist) data.params.artist = artist;
	if(title)  data.params.title = title;
	if(album)  data.params.album = album;
	if(file)   data.params.file = file;

	MusicPlayer.Connection.send(JSON.stringify(data));
}

//Get status
MusicPlayer.Connection.status = function()
{
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.play = function(songpos)
{
	MusicPlayer.Connection.send("noidle");

	if(songpos >= 0) {
		MusicPlayer.Connection.send("play " + songpos);
	} else MusicPlayer.Connection.send("play");

	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.pause = function()
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("pause");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.stop = function()
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("stop");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//seek the current song
MusicPlayer.Connection.seekcur = function(positionInSeconds)
{
	var positionInSeconds = Math.round(positionInSeconds * 100) / 100

	console.log("seek", positionInSeconds);

	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("seekcur " + parseInt(positionInSeconds));
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Load the current playlist
MusicPlayer.Connection.playlistinfo = function()
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("playlistinfo");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}


//set random mode
MusicPlayer.Connection.random = function(val)
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("random " + (val ? "1" : "0") );
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//set repeat mode
MusicPlayer.Connection.repeat = function(val)
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("repeat " + (val ? "1" : "0") );
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

$(function() {
	MusicPlayer.Connection.start(function() {
		MusicPlayer.Connection.status();

		setTimeout(function() {
			MusicPlayer.Connection.playlistinfo();
		}, 1000);
	});
});