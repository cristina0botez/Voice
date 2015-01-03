var net = require('net');
var events = require('events');

module.exports = {
	createClient: function (settings, messageCallback) {
		var mpd = new MPDClient(messageCallback);

		mpd.settings = settings;

		return mpd;
	}
};

function MPDClient(messageCallback) {

	var self = this;
	self.messageCallback = messageCallback;
	self.isPendingConnection = false;
	self.isConnected = false;
	self.reconnect = true;

	self.sendQueue = [];
	self.receivedQueue = [];
	self.cache = "";
	self.lastCommand = "";
	self.client = null;

	self.commands = {

		"OK": function(index, name, server, protocolVer) {

			self.executing = false;

			if(protocolVer && parseFloat(protocolVer) >= 0.19) {
				console.log("Connected ", protocolVer);

				self.isPendingConnection = false;
				self.isConnected = true;
			}

			if(self.lastCommand !== "" && self.commands[self.lastCommand])
				self.commands[self.lastCommand].apply(self, [index]);

			self.prepareNextCommand();
		},

		///mpd error
		"ACK": function(index) {
			self.executing = false;

			prepareNextCommand();
		},

		///construct the mpd playlist
		"playlistinfo": function(index) {
			var playlist = [];
			var item = null;

			var data = splitResult(self.receivedQueue, index);

			for(var i=0; i<data.length; i++) {
				var key = data[i][0];
				var val = data[i][1];

				if(key == "file") {
					if(item) playlist.push(item);

					item = {};
				}

				item[key] = val;
			}

			if(item !== null) {
				playlist.push(item);
			}

			self.messageCallback.apply(this, ["playlistinfo", playlist]);
		},

		///get the player status
		"status": function(index) {
			var data = splitResult(self.receivedQueue, index);

			self.messageCallback.apply(this, ["status", data]);
		},

		///idle state ended
		"idle": function(index) {
			var data = splitResult(self.receivedQueue, index);
			self.messageCallback.apply(this, ["idle", data]);
		}
	}

	function splitResult(data, len) {
		var result = [];

		for(var i=0; i<len; i++) {
			var line = self.receivedQueue[i].split(":");
			var key = line[0].trim();
			var val = line[1].trim();

			result.push([key, val]);
		}

		return result;
	}
}

///Connect to MPD
MPDClient.prototype.connect = function() {
	var self = this;

	self.client = net.connect(self.settings.port, self.settings.address, function() {
		self.isPendingConnection = true;
		self.isConnected = false;

		console.log("MPD pending connection to", self.settings.address,"on port ",self.settings.port,". Waiting for OK message.");
	});

	///process data from MPD
	self.client.on('data', function(data) {
		self.receive.apply(self, [data.toString()])
	});

	///when mpd close the conenction
	self.client.on('end', function()
	{
		if(self.reconnect) {
			self.close();
			self.connect();
		}
	});
}

///Close the connection
MPDClient.prototype.close = function(data) {
	this.isPendingConnection = false;
	this.isConnected = false;
	this.reconnect = false;

	console.log('Disconnected from MPD.');
};

MPDClient.prototype.disconect = function(data) {
	this.client.end();
	this.close();
};


///Add a message to the receive cache and try to parse it
MPDClient.prototype.receive = function(data) {
	console.log("RECEIVE ", data);
	this.cache += data;
	this.parseCache();
};

///Add a new command in queue and tryes to send it to MPD
MPDClient.prototype.send = function(data) {
	this.sendQueue.push(data);
	this.sendNext();
};

///Send the next queued command. If the queue is empty or the connection with
///MPD is colsed it does nothing
MPDClient.prototype.sendNext = function() {
	var self = this;

	if(self.sendQueue.length > 0) {
		if(self.isConnected && (!self.executing || self.sendQueue[0] == "noidle" )) {
			self.executing = true;
			console.log("send:", self.sendQueue[0]);
			self.client.write(self.sendQueue[0].trim() + "\n");

			self.lastCommand = self.sendQueue[0].trim();
			//console.log("SENT:", self.lastCommand , ";");

			self.sendQueue.shift();
		}
	}
}

///
MPDClient.prototype.prepareNextCommand = function() {
	this.lastCommand = "";
	this.receivedQueue = [];
	this.sendNext();
}

///parse the received cache
MPDClient.prototype.parseCache = function() {
	var parts = this.cache.split("\n");

	this.cache = parts[parts.length - 1];


	for(var i = 0; i<parts.length - 1; i++)
	{
		var command = parts[i].split(" ");

		if(command[0] == "OK" || command[0] == "ACK") {
			this.receivedQueue.push(command);
		} else {
			this.receivedQueue.push(parts[i]);
		}
	}

	this.executeQueue();
}

///execute commands
MPDClient.prototype.executeQueue = function() {

	for(var i=0; i<this.receivedQueue.length; i++) {
		var command = this.receivedQueue[i];

		if(typeof command == "array" || typeof command == "object") {
			try {
				//console.log("Execute: ", command);
				this.commands[command[0]].apply(this, [i].concat(command));
			} catch(err) {
				console.log(err);
			}
		}
	}
}

