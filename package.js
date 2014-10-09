Package.describe({
	summary: "API handlers for the Telismo API",
	version: "0.6.0",
	name: "telismo:core",
	git: "https://github.com/Telismo/meteor-telismo.git"
});

Package.on_use(function(api) {
	api.versionsFrom("METEOR@0.9.3");
	api.add_files("lib.js",['server']);
	api.use(["ddp",'mongo']);
	api.export('Telismo');
});