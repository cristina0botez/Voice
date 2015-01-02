var MusicPlayer = MusicPlayer || {};

MusicPlayer.Commands = {};
MusicPlayer.Status = {};

MusicPlayer.Commands.playlistinfo = function(data) {
	MusicPlayer.Playlist.set(data);
}

MusicPlayer.Commands.getcover = function(data) {
	MusicPlayer.Playlist.setcover(data.file, data.cover);
}

MusicPlayer.Commands.status = function(data) {
	for(var i=0; i<data.length; i++) {
		MusicPlayer.Status[data[i][0]] = data[i][1];
	}

	MusicPlayer.Graphics.Refresh();
}
