var io = require('socket.io'),
    express = require('express');

var dirty = require('dirty');
// var DB_FILE = __dirname + '/dirtyDB/sample.db';
 var DB_FILE = __dirname + '/dirtyDB/DC-tweets.db';
var dbTweets = dirty(DB_FILE );


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
	app.replayStream();
};

app.replayStream = function(){

	io.sockets.on('connection', function (socket) {  
		console.log('connection', socket);
		var locationFilter =  [ '-77.13', '38.80', '-76.90', '39.02' ]; //dc

    // Create object that holds all projects.
    dbTweets.forEach(function (key, tweet) {
			if(tweet.id%10==0 && tweet.geo 
				&& tweet.geo.coordinates[1] > locationFilter[0] && tweet.geo.coordinates[1] < locationFilter[2]
				&& tweet.geo.coordinates[0] > locationFilter[1] && tweet.geo.coordinates[0] < locationFilter[3]){
				//console.log('has geo');		   
	  		//console.log('emit: '+tweet.user.name + ': ' + tweet.text);
	  		// TODO: create function to strip down tweet to just fields we use..
		    socket.emit('tweet',  tweet);
		  }
		});
	});
};

app.get('/user/:userID', function(req, res){	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	app.getUsersTweets(res, req.params.userID);
});

app.getUsersTweets = function(res, userID){
	app.T.get('statuses/user_timeline', { user_id: userID, count: 45 }, function(err, data, response) {
		console.log("Got Tweets" + data);

		res.send({tweets:data});
	});
};

app.start();

