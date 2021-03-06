var io = require('socket.io'),
    express = require('express');

var fs = require('fs');
var dirty = require('dirty');

// Via Express 3.x server
var app = express(),
    server = require('http').createServer(app),
    io = io.listen(server),
    port = process.env.PORT || 3000;
server.listen(port);


// Twitter stuff, use sample if loading somewhere with process.env
if(process.env.CONSUMER_KEY){
	require("./configure-sample")(app);
} else{
	require("./configure")(app);
}

app.configure();
app.allSockets=[];
io.sockets.on('connection', function (socket) {
	app.allSockets.push(socket);
});

app.start = function(){
	if(app.config.DB_STORE){
		DB_FILE = __dirname + app.config.DB_STORE;
		dbTweets = dirty(DB_FILE );
	}

	//geocode location if needed:
	if(app.config.TARGET_LOCATION){
		var google_geocoding = require('google-geocoding');
		console.log("GeoCode " + app.config.TARGET_LOCATION);
		google_geocoding.geocode(app.config.TARGET_LOCATION, function(err, location) {
			if( err ) {
			  console.error('Error on geocoding: ' + err);
			} else if( !location ) {
			  console.error('No geocoding result.');
			} else if(app.config.TARGET_LOCATION){ //make sure taget location is still set..
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
	if(latLng){
		if(latLng.length == 2){
			var range = app.config.RANGE;
			latLng[0] = Math.round(latLng[0]*1000)/1000;
			latLng[1] = Math.round(latLng[1]*1000)/1000;
			app.locationFilter = [ +latLng[1]-range, +latLng[0]-range, +latLng[1]+range, +latLng[0]+range ];
		} else {
			app.locationFilter = latLng;
		}
	}
	if(app.config.STREAM){
		app.startStream();
	}
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

	console.log('filter', filter);

	app.stream = app.T.stream('statuses/filter',filter);
  app.stream.on('tweet', function(tweet) {
  	console.log(tweet.user.name + ': ' + tweet.text);
		if(tweet.geo){
			console.log('has geo');
			if(!app.config.STRICT_GEO || app.locationFilter &&
				tweet.geo.coordinates[1] > app.locationFilter[0]
				&& tweet.geo.coordinates[1] < app.locationFilter[2]
				&& tweet.geo.coordinates[0] > app.locationFilter[1]
				&& tweet.geo.coordinates[0] < app.locationFilter[3]
				&& (tweet.geo.coordinates[1] > -82.1 || tweet.geo.coordinates[0]>48.8 //hackline for canadabounding box
				)){// TODO: if strict geo matching deires, make config: && tweet.geo.coordinates[1] > locationFilter[0] && tweet.geo.coordinates[1] < locationFilter[2]){

  			console.log('passed strict test');
					console.log('emit');
				if(app.allSockets){
					for(var i=0; i<app.allSockets.length; i++){
						app.allSockets[i].emit('tweet',  tweet);
					}
			  }

		    if(app.config.DB_STORE){
  		    dbTweets.set(tweet.id_str, tweet);
  		  }
		  }
		}
 });


	app.stream.on('limit', function (limitMessage) {
	  	console.error('Dave, you\'re hitting the twitter limit.');
	});

};


app.get('/setStreamKeyword/:keyword', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	console.log('setStreamKeyword', req.params.keyword);
	app.reset();
	app.config.TWITTER_KEYORD = req.params.keyword;
	app.start();
	res.send();
});


app.get('/setStreamLocationText/:location', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	app.reset();
	app.config.TARGET_LOCATION = req.params.location;
	app.config.STRICT_GEO = true;
	app.start();
	res.send();
});

app.get('/setStreamLocation/:lat/:lng', function(req, res){
	console.log("setStreamLocation ");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	app.reset();
	app.config.TARGET_LAT_LNG = [req.params.lat,req.params.lng];
	app.config.STRICT_GEO = true;
	app.start();
	res.send();
});

app.reset = function(){
	if(app.stream){
		console.warn('stopped stream!!');
		app.stream.stop();
	}
	app.config.STRICT_GEO = false;
	app.config.TWITTER_KEYORD= null;
	app.config.TARGET_LOCATION = null;
	app.config.TARGET_LAT_LNG = null;
};

// Can pass user id or user name
app.get('/user/:userID', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	app.getUsersTweets(res, req.params.userID);
});



app.getUsersTweets = function(res, userID){

	var options = {
		count: 20,
		trim_user: false //true gives shorter response, but no username for example.
	};

	//check if uid or uname
	if(isNaN(userID)){
		options.screen_name = userID;
		options.count = 100;
	} else{
		options.user_id = userID;
	}

	app.T.get('statuses/user_timeline', options, function(err, data, response) {
		console.log("Got Tweets for " + userID);
		res.send({tweets:data});
	});
};

app.start();


//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//
// app.T.get('search/tweets', { q: 'banana since:2011-11-11', count: 10 }, function(err, data, response) {
//   console.log(data)
// })
