var MusicPlayer = MusicPlayer || {};


MusicPlayer.Graphics = {};
MusicPlayer.Graphics.GenerateStyles = function()
{
	if(MusicPlayer.Playlist && MusicPlayer.Playlist.data && $("#coverStyles").length == 0) {
		var style = '<style id="coverStyles">';

		var deg = 0;
		var degStep = parseInt(360 / MusicPlayer.Playlist.data.length);
		var totalItems = MusicPlayer.Playlist.data.length;

		for(var i = 0; i<totalItems; i++) {
			var rad = deg * (Math.PI / 180);
			var x = parseInt(300 * Math.cos (rad));
        	var y = parseInt(300 * Math.sin (rad));

        	var randDeg = Math.random() * 360;
        	var sign = " + ";
        	if(Math.random() > 0.5) sign = " - ";

        	var randX = sign + "200px" + sign + parseInt(Math.random() * 35) + "%";
        	var randY = parseInt(Math.random() * 40);

			style +=
'	.playlist .cover.item' + i + '{' +
'		left: calc( 75% - 100px );' +
'		transform: rotate(' + (deg) + 'deg);' +
'		-webkit-transform: rotate(' + (deg) + 'deg);' +
'	}' +

'	.playlist .cover.played.item' + i + '{' +
'		z-index: ' + i + ';' +
'	}' +

'	body.repeat .cover.item' + i + '{' +
'		left: calc( 50% - 100px - ' + x + 'px);' +
'		top: calc( 50% - 75px - ' + y + 'px);' +
'		transform: rotate(' + deg + 'deg)  scale(0.6);' +
'		-webkit-transform: rotate(' + deg + 'deg)  scale(0.6);' +
'		z-index: 1000;' +
'	}'+

'	body.random .cover.item' + i + '{' +
'		left: calc( 50% - 100px ' + randX+');' +
'		top: calc( 50% - 200px + ' + randY+'%);' +
'		transform: rotate(' + randDeg + 'deg)  scale(0.6);' +
'		-webkit-transform: rotate(' + randDeg + 'deg)  scale(0.6);' +
'	}';

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

	if(MusicPlayer.Status && MusicPlayer.Status.songid && MusicPlayer.Playlist && MusicPlayer.Playlist.data) {
		var songid = MusicPlayer.Status.songid;
		var current = $(".playlist .cover.current");

		if(current.length == 0 || current.attr("data-id") != songid) {
			var next = $("#song" + songid);
			var w = $(window).width()/2;
			var index = next.attr("data-index");

			var sec = MusicPlayer.Playlist.data[index].Time;
			var min = parseInt(sec/60);

			$(".playing .artist").html(MusicPlayer.Playlist.data[index].Artist);
			$(".playing .title").html(MusicPlayer.Playlist.data[index].Title);
			$(".time .total").html(formatTime(min, sec - min*60));

			var endCoverTransition = function(event) {
				$(".playing .song").html(next.clone());
				$(".playing .cover").removeAttr("style").removeAttr("id").removeClass("rotated").attr("class", "cover");

				next.addClass("hide");

				$(this).off( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

				return false;
			}

			next.on( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

			next.addClass("current");

			current.removeClass("hide");
			setTimeout(function() {
				current.removeClass("current");

				for(var i = 0; i<MusicPlayer.Playlist.data.length; i++) {
					if(i < parseInt(MusicPlayer.Status.song)) $(".playlist .cover.item"+i).addClass("played");
													  	 else $(".playlist .cover.item"+i).removeClass("played");
				}
			} , 3 );

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
