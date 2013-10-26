var version = 0.5;

var Telismo_DDP = DDP.connect("http://telismo.com/api");
var CallDocs = new Meteor.Collection("calls", Telismo_DDP);
Telismo_DDP.subscribe("api");
var _callbacks = [];

Telismo = {
	API : function(apiKey, apiSecret) {
		if(!(this instanceof Telismo.API))
			throw new Error("Please use the 'new' keyword when initializing a Telismo instance");

		var self = this;

		callbackHandle = CallDocs.find().observe({
			added: function (document) {
				if(!callbackHandle) return;

				if(document._id in _callbacks) {
					var callback = _callbacks[document._id];
					if(callback) callback(document);
				}
				else {
					self.callback(document);
				}
			}
		});

		this.call = function(params, callback) {
			var result = Telismo_DDP.call("api/new", params);
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

		this.calls = function() {
			return CallDocs;
		}

		this.callback = function(callData) {

		}
	},
	version: version
}