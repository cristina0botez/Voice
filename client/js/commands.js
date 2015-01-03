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

MusicPlayer.Commands.status = function(data) {

	for(var i=0; i<data.length; i++) {
		MusicPlayer.Status[data[i][0]] = data[i][1];
	}

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
