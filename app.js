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


// Twitter stuff.
if(process.env.CONSUMER_KEY){
	require("./configure-sample")(app);
} else{
	require("./configure")(app);
}

app.start = function(){
	app.configure();
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
	if(latLng.length == 2){
		var range = app.config.RANGE;
		app.locationFilter = [ latLng[1]-range, latLng[0]-range, latLng[1]+range, latLng[0]+range ];
	} else {
		app.locationFilter = latLng;
	}
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

	console.log('filter', filter);

	app.stream = app.T.stream('statuses/filter',filter);
	//DRS: !!! temp disable dependency on connection / socket
	io.sockets.on('connection', function (socket) {  
		console.log('connection', socket);

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
					if(socket){			  
						console.log('emit');  
				    socket.emit('tweet',  tweet);
				  }
			    
			    if(app.config.DB_STORE){
	  		    dbTweets.set(tweet.id_str, tweet);
	  		  }
			  }
			}
	 });
	});


	app.stream.on('limit', function (limitMessage) {
	  	console.error('Dave, you\'re hitting the twitter limit.');
	});

};

// Can pass user id or user name
app.get('/user/:userID', function(req, res){	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	app.getUsersTweets(res, req.params.userID);
});



app.getUsersTweets = function(res, userID){

	var options = { count: 20,trim_user:true };

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
