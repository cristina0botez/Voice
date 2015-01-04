var MusicPlayer = MusicPlayer || {};

MusicPlayer.Commands = {};
MusicPlayer.Status = {};

MusicPlayer.Commands.playlistinfo = function(data) {
	$("#coverStyles").remove();
	MusicPlayer.Playlist.set(data);
}

MusicPlayer.Commands.getcover = function(data) {
	MusicPlayer.Playlist.setcover(data.file, data.cover);
}

MusicPlayer.Commands.idle = function(data) {
	for(var i =0; i<data.length; i++) {
		if(data[i][0] == "changed") {
			console.log(data);

			switch(data[i][1]) {
				case 'database':
				case 'update':
					//the database is updated
					MusicPlayer.Connection.status();
					break;

				case 'stored_playlist':
					//a stored playlist has been modified, renamed, created or deleted
					MusicPlayer.Connection.status();
					break;

				case 'playlist':
					console.log("PLAYLIST", data[i][1]);
					//the current playlist has been modified
					MusicPlayer.Connection.send("playlistinfo");
					MusicPlayer.Connection.status();
					break;

				case 'output':
					//an audio output has been enabled or disabled
					MusicPlayer.Connection.status();
					break;

				case 'sticker':
					//the sticker database has been modified.
					MusicPlayer.Connection.status();
					break;

				case 'subscription':
					//a client has subscribed or unsubscribed to a channel
					MusicPlayer.Connection.status();
					break;

				case 'message':
					//a message was received on a channel this client is subscribed to; this event is only emitted when the queue is empty
					MusicPlayer.Connection.status();
					break;

				default:
					MusicPlayer.Connection.status();
			}
		}
	}
}

MusicPlayer.Commands.status = function(data) {

	for(var i=0; i<data.length; i++) {
		MusicPlayer.Status[data[i][0]] = data[i][1];
	}

	if( MusicPlayer.Status["time"] ) MusicPlayer.Status["time"] = parseInt(MusicPlayer.Status["time"]);
								else MusicPlayer.Status["time"] = 0;

	if( MusicPlayer.Status["elapsed"] ) MusicPlayer.Status["elapsed"] = parseFloat(MusicPlayer.Status["elapsed"]);
								   else MusicPlayer.Status["elapsed"] = 0;

	if(MusicPlayer.Status["random"] && MusicPlayer.Status["random"] == "0") $("body").removeClass("random");
		else $("body").addClass("random");

	if(MusicPlayer.Status["repeat"] && MusicPlayer.Status["repeat"] == "0") $("body").removeClass("repeat");
		else $("body").addClass("repeat");

	if(MusicPlayer.Status["consume"] && MusicPlayer.Status["consume"] == "0") $("body").removeClass("consume");
		else $("body").addClass("consume");

	if(MusicPlayer.Status["single"] && MusicPlayer.Status["single"] == "0") $("body").removeClass("single");
		else $("body").addClass("single");

	MusicPlayer.Graphics.Refresh();
}
