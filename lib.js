var version = 0.5;

var Telismo_DDP = DDP.connect("http://telismo.com");
var CallDocs = new Meteor.Collection("calls", Telismo_DDP);
Telismo_DDP.subscribe("api");
var _callbacks = [];

Telismo = function(apiKey) {
	var self = this;

	Telismo_DDP.call("api/login", apiKey);

	callbackHandle = CallDocs.find().observe({
		added: function (document) {
			if(!callbackHandle) return;
			console.log(document);
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

	this.list = function() {
		var result = Telismo_DDP.call("api/list", apiKey, params);
		if(result && result.success == true) {
			return result; 
		}
		return [];
	}

	this.cancel = function(callIds) {
		var params = {id: callIds};

		try {
			var result = Telismo_DDP.call("api/cancel", apiKey, callIds);
		}
		catch(e){
			return {success: false, error:["Internal Server Error. Try again later"]}
		}
		
		return result;
	}

	this.calls = function() {
		return CallDocs;
	}

	this.callback = function(callData) {

	}

	return this;
}