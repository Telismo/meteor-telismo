var version = 0.6;

var Telismo_DDP = DDP.connect("https://telismo.com");
var CallDocs = new Mongo.Collection("calls", {connection: Telismo_DDP});
Telismo_DDP.subscribe("api");
var _callbacks = [];

Telismo = function(apiKey) {
	var self = this;

	Telismo_DDP.call("api/login", apiKey);

	callbackHandle = CallDocs.find().observe({
		added: function (document) {
			if(!callbackHandle) return;
			if(document._id in _callbacks) {
				var callback = _callbacks[document._id];
				if(document.error) {
					if(callback) callback({errors: document.error, status: document.status});
				}else{
					if(callback) callback(null, document.output);
				}
			}
			else {
				if(document.error) {
					if(self.callback) self.callback({errors: document.error, status: document.status});
				}else{
					if(self.callback) self.callback(null, document);
				}
			}
		}
	});

	this.call = function(params, callback) {
		var result = Telismo_DDP.call("api/new", apiKey, params);
		if(result && result.success == true) {
			if(result.id instanceof Array) {
				for(var i = 0; i<result.id.length; i++) {
					_callbacks[result.id] = callback
				}
			}else{
				_callbacks[result.id] = callback;
			}
		}
		return result.id;
	}

	this.quote = function(params) {
		var result = Telismo_DDP.call("api/quote", apiKey, params);
		if(result && result.success == true) {
			if(result) return result;
		}
		return result.id;
	}

	this.list = function(params) {
		try {
			var result = Telismo_DDP.call("api/list", apiKey, params);
		
			if(result) {
				return result; 
			}else
				return [];
			}catch(e) {
			throw new Meteor.Error(500, 'Internal Server Error. Please try again later');
		}
	}

	this.fetch = function(id) {
		try {
			var result = Telismo_DDP.call("api/fetch", apiKey, id);

			if(result) {
				return result;
			}else
				return null;
			}catch(e) {
			throw new Meteor.Error(500, 'Internal Server Error. Please try again later');
		}
	}

	this.cancel = function(callId) {
		try {
			var result = Telismo_DDP.call("api/cancel", apiKey, callId);
		}
		catch(e){
			throw new Meteor.Error(500, 'Internal Server Error. Please try again later');
			return {success: false, error:["Internal Server Error. Try again later"]}
		}

		if(result) {
			return result;
		}else{
			throw new Meteor.Error(404, 'Error 403: API Key incorrect');
		}
	}

	this.getBalance = function() {
		try {
			var result = Telismo_DDP.call("api/balance", apiKey);
		}
		catch(e){
			throw new Meteor.Error(500, 'Telismo Internal Server Error. Please try again later');
			return {success: false, error:["Internal Server Error. Try again later"]}
		}
		
		if(result) {
			return result;
		}else{
			throw new Meteor.Error(403, 'Telismo API key not valid. Please get a new key from your telismo dashboard');
		}

	}

	this.calls = function() {
		return CallDocs;
	}

	this.callback = function(callData) {

	}

	return this;
}