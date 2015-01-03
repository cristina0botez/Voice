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
MusicPlayer.Connection.status = function(artist, title, album, file)
{
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.play = function(artist, title, album, file)
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("play");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.pause = function(artist, title, album, file)
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("pause");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

//Get status
MusicPlayer.Connection.stop = function(artist, title, album, file)
{
	MusicPlayer.Connection.send("noidle");
	MusicPlayer.Connection.send("stop");
	MusicPlayer.Connection.send("status");
	MusicPlayer.Connection.send("idle");
}

$(function() {
	MusicPlayer.Connection.start(function() {
		MusicPlayer.Connection.send("playlistinfo");
		MusicPlayer.Connection.status();
	});
});