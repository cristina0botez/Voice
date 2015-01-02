var MusicPlayer = MusicPlayer || {};


MusicPlayer.Graphics = {};
MusicPlayer.Graphics.Refresh = function() 
{
	var w = $(window).width();
	var h = $(window).height();

	var top = ( h - 200 ) / 2;

	$("#mainCover").css({
		top:  top,
		left: ( w/2 - 200 ) / 2
	});

	var list = $($(".playlist .cover").get().reverse());
	var deg = 0;

	list.each(function() {

		if( !$(this).is(".rotated") ) {

			$(this).addClass("rotated").css({
				transform: "rotate(" + deg + "deg)"
			}).attr({
				"data-transform": "rotate(" + deg + "deg)"
			});
		}

		var index = $(this).attr("data-index");
		if(MusicPlayer.Playlist.data[index].cover) {
			var prop = "url('covers/" + MusicPlayer.Playlist.data[index].cover + "')";
			$(this).find(".pic").css("background-image", prop);
		}

		deg += 4;
	});

	if(MusicPlayer.Status && MusicPlayer.Status.songid) {
		var songid = MusicPlayer.Status.songid;
		var current = $(".playlist .cover.current");

		if(current.length == 0 || current.attr("data-id") != songid) {
			var next = $("#song" + songid);

			var w = $(window).width()/2;
			var r = w * 1.5  - 100;

			var endCoverTransition = function(event) {
				$(".playing .song").html(next.clone());
				$(".playing .cover").removeAttr("style").removeAttr("id").removeClass("rotated");

				var index = next.attr("data-index");

				var sec = MusicPlayer.Playlist.data[index].Time;
				var min = parseInt(sec/60);

				$(".playing .artist").html(MusicPlayer.Playlist.data[index].Artist);
				$(".playing .title").html(MusicPlayer.Playlist.data[index].Title);
				$(".time .total").html(formatTime(min, sec - min*60));

				next.addClass("current");

				$(this).off( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

				return false;
			}

			next.on( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', endCoverTransition);

			next.css({
				right: r - 10,
				transform: "rotate(0deg)"
			});

			current.removeClass("current");
			setTimeout(function() {
				current.css({
					right: "calc(25% - 100px)",
					transform: current.attr("data-transform"),
				})
			}, 3);

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
}

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
