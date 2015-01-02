var audioMetaData = require('../src/audioMetaData');
var fs = require('fs');
var assert = require('assert')

var hasSettings = false;

if (fs.existsSync("../settings.json")) {
	var settings = JSON.parse(fs.readFileSync('../settings.json', 'utf8'));

	if(settings.audioMetaData) {
		audioMetaData.setOptions(settings.audioMetaData);
		hasSettings = true;
	}
}

suite('audioMetaData', function(){

	suite('Covers', function(){
		suite('.getCoverFromFile()', function(){
			setup(function(){
				//remove existing file
				if(fs.existsSync("./test_cover.jpg")) fs.unlinkSync("./test_cover.jpg");
			});

			test("should get covers from mp3 files", function(done) {
				audioMetaData.getCoverFromFile("./test_cover.mp3", "./test_cover", function(path) {
					assert.equal("./test_cover.jpg", path);
					assert.equal(true, fs.existsSync("./test_cover.jpg"));

					done();
				});
			});

			test("should not get covers from invalid mp3 files", function(done) {
				audioMetaData.getCoverFromFile("./test_cover_invalid.mp3", "./test_cover", function(path) {
					assert.equal(false, path);

					done();
				});
			});

			test("should not get covers from mp3 files without cover", function(done) {
				audioMetaData.getCoverFromFile("./test_nocover.mp3", "./test_uncover", function(path) {
					assert.equal(false, path);

					done();
				});
			});
		});

		if(hasSettings) {
			suite('.getCoverFromLastFm()', function() {
				setup(function(){
					//remove existing file
					if(fs.existsSync("./test_cover.jpg")) fs.unlinkSync("./test_cover.jpg");
					if(fs.existsSync("./test_cover.png")) fs.unlinkSync("./test_cover.png");
				});

				test("should get covers from a valid track name", function(done) {
					audioMetaData.getCoverFromLastFm("Pink Floyd", "Mother", "./test_cover", function(path) {
						assert.equal("./test_cover.png", path);
						assert.equal(true, fs.existsSync("./test_cover.png"));

						done();
					});
				});

				test("should get covers from a mispelled track name", function(done) {
					audioMetaData.getCoverFromLastFm("Pink Floyd", "Mather", "./test_cover", function(path) {
						assert.equal("./test_cover.png", path);
						assert.equal(true, fs.existsSync("./test_cover.png"));

						done();
					});
				});

				test("should not get covers from invalid data", function(done) {
					audioMetaData.getCoverFromLastFm("axza@", "bbb", "./test_cover", function(path) {
						assert.equal(false, path);
						assert.equal(false, fs.existsSync("./test_cover.png"));

						done();
					});
				});
			});
		}
	});
});