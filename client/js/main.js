var MusicPlayer = MusicPlayer || {};


MusicPlayer.Graphics = {};
MusicPlayer.Graphics.GenerateStyles = function()
{
	if(MusicPlayer.Playlist && MusicPlayer.Playlist.data && $("#coverStyles").length == 0) {
		var style = '<style id="coverStyles">';

		var deg = 0;
		var degStep = parseInt(90 / MusicPlayer.Playlist.data.length);

		for(var i = 0; i<MusicPlayer.Playlist.data.length; i++) {
			style += '.cover.item' + i + '{ left: calc( 75% - 100px ); transform: rotate('+deg+'deg); }';
			deg += degStep;
		}

		style += '</style>';
		$("body").append(style);
	}

};

MusicPlayer.Graphics.Refresh = function()
{
	MusicPlayer.Graphics.GenerateStyles();

	var w = $(window).width();
	var h = $(window).height();

	var top = ( h - 200 ) / 2;

	$("#mainCover").css({
		top:  top,
		left: ( w/2 - 200 ) / 2
	});

	var list = $($(".playlist .cover").get().reverse());

	list.each(function() {

		var index = $(this).attr("data-index");
		if(MusicPlayer.Playlist.data[index].cover) {
			var prop = "url('covers/" + MusicPlayer.Playlist.data[index].cover + "')";
			$(this).find(".pic").css("background-image", prop);
		}
	});

	if(MusicPlayer.Status && MusicPlayer.Status.songid) {
		var songid = MusicPlayer.Status.songid;
		var current = $(".playlist .cover.current");

		if(current.length == 0 || current.attr("data-id") != songid) {
			var next = $("#song" + songid);

			var w = $(window).width()/2;

			var endCoverTransition = function(event) {
				$(".playing .song").html(next.clone());
				$(".playing .cover").removeAttr("style").removeAttr("id").removeClass("rotated").attr("class", "cover");

				var index = next.attr("data-index");

				var sec = MusicPlayer.Playlist.data[index].Time;
				var min = parseInt(sec/60);

				$(".playing .artist").html(MusicPlayer.Playlist.data[index].Artist);
				$(".playing .title").html(MusicPlayer.Playlist.data[index].Title);
				$(".time .total").html(formatTime(min, sec - min*60));

				next.addClass("hide");

				$(this).off( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

				return false;
			}

			next.on( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

			next.addClass("current");

			current.removeClass("hide");
			setTimeout(function() { current.removeClass("current") } , 3 );

			$(".playing .song").html("");
		}
	}

	if(MusicPlayer.Status && MusicPlayer.Status.state) {
		$(".controls").attr("class", "controls " + MusicPlayer.Status.state);
	}

	if(MusicPlayer.Status && MusicPlayer.Status.time) {
		var sec = MusicPlayer.Status.time;
		var min = parseInt(sec/60);

		$(".time .elapsed").html(formatTime(min, sec - min*60));
	}
};

function formatTime(m, s) {
	var result;

	if(m <= 9) {
		m = "0" + (m+"");
	}

	if(s <= 9) {
		s = "0" + (s+"");
	}

	return m + ":" + s;
};

$(function() {

	$(window).resize(function() {
		MusicPlayer.Graphics.Refresh();
	}).resize();

	$(".controls .pause").click(function() {
		MusicPlayer.Connection.send("pause");
		MusicPlayer.Connection.send("status");
	});

	$(".controls .play").click(function() {
		MusicPlayer.Connection.send("play");
		MusicPlayer.Connection.send("status");
	});

	$(".controls .stop").click(function() {
		MusicPlayer.Connection.send("stop");
		MusicPlayer.Connection.send("status");
	});

	setInterval(function() {
		MusicPlayer.Connection.send("status");
	}, 1000);
});
