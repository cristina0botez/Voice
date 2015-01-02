var LastFmNode = require('lastfm').LastFmNode;
var ffm = require("ffmetadata");
var mm = require('musicmetadata');
var fs = require('fs');
var request = require('request');

var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

module.exports = {
	options: {},

	setOptions: function(options) {
		this.options = options;
	},

	getCover: function (artist, title, album, file, callback) {
		var module = this;

		if(!album) {
			return;
		}

		var cover = "";

		if(fs.existsSync(module.options.coverCachePath + "/" + artist + "--" + album + ".jpg")) cover = artist + "--" + album + ".jpg";
		if(fs.existsSync(module.options.coverCachePath + "/" + artist + "--" + album + ".png")) cover = artist + "--" + album + ".png";

		if(cover != "") {
			callback(cover);
			return;
		}

		cover = artist + "--" + album;

		module.getCoverFromFile(module.options.musicPath + "/" + file, module.options.coverCachePath + "/" + cover, function(data) {
			console.log(1, data);

			if(data !== false) {
				callback(extractFilename(data));
				return;
			}

			module.getCoverFromLastFm(artist, title, module.options.coverCachePath + "/" + cover, function(data) {
				if(data !== false) {
					callback(extractFilename(data));
				}
			});
		});
	},

	getCoverFromLastFm: function(artist, title, destFileWithoutExt, callback) {
		var module = this;

		if(!module.options || !module.options["last.fm"] || !module.options["last.fm"].api_key || !module.options["last.fm"].secret) {
			callback(false);
			return;
		}

		if(!module.lastfm) module.lastfm = new LastFmNode(module.options["last.fm"]);

		var request = module.lastfm.request("track.getInfo", {
		    artist: artist,
		    track: title,
		    autocorrect: 1,
		    handlers: {
		        success: function(data) {
		        	console.log(data);
		        	if(data.track.album && data.track.album.image && data.track.album.image.length >= 4) {
			        	var images = JSON.parse( JSON.stringify(data.track.album.image) );
						var imgUrl = images[3]["#text"];
						var ext = imgUrl.split(".");
						ext = ext[ext.length - 1];

						download(imgUrl, destFileWithoutExt + "." + ext, function() {
			            	callback(destFileWithoutExt + "." + ext);
						});

		            } else {
		            	console.log(data);
		            	callback(false);
		            }
		        },
		        error: function(error) {
		            callback(false);
		        }
		    }
		});
	},

	getCoverFromFile: function(file, destFileWithoutExt, callback) {

		// check if file exists
		if(!fs.existsSync(file)) {
			callback(false);
			return;
		}

		// create a new parser from a node ReadStream
		var parser = mm( fs.createReadStream(file) );

		// listen for the metadata event
		parser.on('metadata', function (result) {
			if(result.picture && result.picture.length > 0) {
				var format = result.picture[0].format;
				var buffer = result.picture[0].data;

				fs.writeFile(destFileWithoutExt + "." + format, buffer, function(err) {
				    if(err) {
				        callback(false);
				    } else {
				        callback(destFileWithoutExt + "." + format);
				    }
				});
			} else callback(false);

		});
	}
};


function extractFilename(path) {
	var parts = path.split("/");
	return parts[parts.length - 1];
}