Package.describe({
	summary: "API handlers for the Telismo API"
});

Package.on_use(function(api) {
	api.add_files("lib.js",['server']);
	api.use(["livedata",'mongo-livedata']);
	api.export('Telismo');
});