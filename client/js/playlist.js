var MusicPlayer = MusicPlayer || {};

MusicPlayer.Playlist = {};

MusicPlayer.Playlist.set = function(data)
{
	MusicPlayer.Playlist.data = data.reverse();

	$(".playlist").html("");

	for(var i=0; i<data.length; i++) {
		MusicPlayer.Connection.getcover(data[i].Artist, data[i].Title, data[i].Album, data[i].file);
		$(".playlist").append('<div id="song' + data[i].Id + '" class="cover item'+data[i].Pos+'" data-id="'+ data[i].Id +'" data-index="'+i+'"><div class="pic"></div></div>');
	}

	MusicPlayer.Graphics.Refresh();
}

MusicPlayer.Playlist.setcover = function(file, cover)
{
	for(var i=0; i<MusicPlayer.Playlist.data.length; i++) {
		if(MusicPlayer.Playlist.data[i].file == file) {
			MusicPlayer.Playlist.data[i].cover = cover;
		}
	}

	MusicPlayer.Graphics.Refresh();
}
