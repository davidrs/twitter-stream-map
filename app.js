var io = require('socket.io'),
    express = require('express');
 
// Via Express 3.x server
var app = express(),
    server = require('http').createServer(app),
    io = io.listen(server);
server.listen(3000);


// Twitter stuff.
if(process.env.CONSUMER_KEY){
	require("./configure-sample")(app);
} else{
	require("./configure")(app);
}

app.start = function(){
	app.configure();

	//geocode location if needed:
	if(app.config.TARGET_LOCATION){
		var google_geocoding = require('google-geocoding');
		console.log("GeoCode " + app.config.TARGET_LOCATION);
		google_geocoding.geocode(app.config.TARGET_LOCATION, function(err, location) {
			if( err ) {
			  console.error('Error on geocoding: ' + err);
			} else if( !location ) {
			  console.error('No geocoding result.');
			} else {
				app.config.TARGET_LAT_LNG = [location.lat , location.lng];
			  console.log('found: Latitude: ' + location.lat + ' ; Longitude: ' + location.lng);
			  app.createLocationFilter();
			}
		});	
	} else{
		app.createLocationFilter();
	}
};

app.createLocationFilter = function(){
	var latLng = app.config.TARGET_LAT_LNG;
	var range = app.config.RANGE;
	app.locationFilter = [ latLng[1]-range, latLng[0]-range, latLng[1]+range, latLng[0]+range ];
	console.log('app.locationFilter',app.locationFilter);
	app.startStream();
};

app.startStream = function(){

	// app.locationFilter =  [ '-77.13', '38.80', '-76.90', '39.02' ];// D.C
	// app.locationFilter = [ '-76.00', '45.37', '-75.30', '45.5' ]; 	// Ottawa
	var filter = {
		locations: app.locationFilter
	};

	if(app.config.TWITTER_KEYORD){
		filter.track = app.config.TWITTER_KEYORD;
		delete filter.locations;
	}

	app.stream = app.T.stream('statuses/filter',filter);
	io.sockets.on('connection', function (socket) {  
		console.log('connection', socket);
	  app.stream.on('tweet', function(tweet) {
	  	console.log('emit: '+tweet.user.name + ': ' + tweet.text);
		if(tweet.geo){// TODO: if strict geo matching deires, make config: && tweet.geo.coordinates[1] > locationFilter[0] && tweet.geo.coordinates[1] < locationFilter[2]){
				console.log('has geo');
		    socket.emit('tweet',  tweet);
		  }
	  });
	});


	app.stream.on('limit', function (limitMessage) {
	  	console.error('Dave, you\'re hitting the twitter limit.');
	});

};

// Homepage doens't do anything.
app.get('/user/:userID', function(req, res){	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	app.getUsersTweets(res, req.params.userID);
});

app.getUsersTweets = function(res, userID){
	app.T.get('statuses/user_timeline', { user_id: userID, count: 25 }, function(err, data, response) {
		console.log("Got Tweets" + data);

		res.send({tweets:data});
	});
};

app.start();


//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//
// app.T.get('search/tweets', { q: 'banana since:2011-11-11', count: 10 }, function(err, data, response) {
//   console.log(data)
// })
