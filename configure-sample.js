var Twit = require('twit');

module.exports = function (app) {
// heorku config vars:
// https://devcenter.heroku.com/articles/getting-started-with-nodejs#define-config-vars

	app.configure = function(){
		app.config = {


			// Sample Canadabounding box:			
			API_BASE_URL: 'http://localhost:3000/',
			TARGET_LOCATION: null, 			//'washington d.c',
			TARGET_LAT_LNG: [ -141.002701,  43.51019, -52.620201, 83.110619],//[36.6,77], 	// lat lng, only used if TARGET_LOCATION is null. can be point or box.
			TWITTER_KEYORD: null, 			// keyword to filter or null
			RANGE: 0.5, // +- value to add to lat,lng to get location Filter.

			DB_STORE: null, 		//'DC-tweets.db' //if filename provided tweets willbe stored for future replay / analysis
			STRICT_GEO: true, 	// we will manually filter to bounds, because twitter isn't perfect.



			// Sample keyword settings:
			// API_BASE_URL: 'http://localhost:3000/',
			// TARGET_LOCATION: null, 			//'washington d.c',
			// TARGET_LAT_LNG: [],//[36.6,77], 	// lat lng, only used if TARGET_LOCATION is null. can be point or box.
			// TWITTER_KEYORD: 'Canada, Ottawa, Toronto, Vancouver, Montreal, Nova Scotia, Ontario, Winnipeg, Halifax, Calgary, Edmonton', 			// keyword to filter or null
			// RANGE: 0.5, // +- value to add to lat,lng to get location Filter.

			// DB_STORE: null, 		//'DC-tweets.db' //if filename provided tweets willbe stored for future replay / analysis
			// STRICT_GEO: false, 	// we will manually filter to bounds, because twitter isn't perfect.

		};
		app.T = new Twit({
		    consumer_key:         process.env.CONSUMER_KEY,
		  	consumer_secret:      process.env.CONSUMER_SECRET,
			 	access_token:         process.env.ACCESS_TOKEN,
			 	access_token_secret:  process.env.ACCESS_TOKEN_SECRET
		});
	};	
};
