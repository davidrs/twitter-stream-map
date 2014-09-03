var Twit = require('twit');

module.exports = function (app) {

	app.configure = function(){
		app.config = {
			API_BASE_URL: 'http://localhost:3000/',
			TARGET_LOCATION:'washington dc',
			TARGET_LAT_LNG: [36.6,77], 	// lat lng, only used if TARGET_LOCATION is null
			TWITTER_KEYORD: null, 			// keyword to filter or null
			RANGE: 0.5, // +- value to add to lat,lng to get location Filter.
		};
		app.T = new Twit({
		    consumer_key:         'xxxxxxxxxx',
		  	consumer_secret:      'xxxxxxxxxx',
			 	access_token:         'xxxxxxxxxx',
			 	access_token_secret:  'xxxxxxxxxx'
		});
	};	
};
