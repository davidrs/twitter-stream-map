// this code is for trying to find people to warn.
var MIN_GEO_RATIO = 0.2;
var SEED_USER = 'davidrustsmith';

var io = require('socket.io'),
    express = require('express');

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
  //app.getListOfFollowers();
  app.getListOfUsersKeyword('blogger');
  app.getListOfUsersKeyword('journalist');
  app.getListOfUsersKeyword('writer');
  app.getListOfUsersKeyword('privacy');
};


app.getListOfUsersKeyword = function(keyword){
  // followers/list
  // SEED_USER
  app.T.get('users/search', {q: keyword, count: 20, page:3}, function(err, data, response) {
    console.log("Got Users matching keyword " + keyword);
    var users = data;
    for(var i = 0 ; i< users.length; i++){
      console.log(keyword +' data.screen_name', users[i].screen_name);
      app.getUsersTweets(users[i].screen_name);
    }
  });
};


app.getListOfFollowers = function(){
  //or try followers/ids
  app.T.get('followers/list', {
      screen_name: SEED_USER,
      cursor: 1404233261892044800,
      count:90
    }, function(err, data, response) {
    console.log("Got Followers  for " + SEED_USER);
    console.log('data.next_cursor', data.next_cursor);
    var users = data.users;
    for(var i = 0 ; i< users.length; i++){
      console.log('data.screen_name', users[i].screen_name);
      app.getUsersTweets(users[i].screen_name);
    }
  });
};

app.getUsersTweets = function(userID){

  var options = { count: 40, trim_user:true };

  //check if uid or uname
  if(isNaN(userID)){
    options.screen_name = userID;
    options.count = 100;
  } else{
    options.user_id = userID;
  }

  app.T.get('statuses/user_timeline', options, function(err, data, response) {
    console.log("Got Tweets for " + userID);
    if(err && err.message){
      console.error('error ',err);
      //process.exit(1);
    }
    app.checkForGeo(data, userID);
  });
};

app.checkForGeo = function(tweets, userID){
  var numWithGeo = 0;
  //console.log('checkForGeo tweets for ' + userID);
  //console.log('tweets', tweets);
  if(tweets){
    for(var i = 0 ; i<tweets.length; i++){
      if(tweets[i].geo){
        numWithGeo++;
      }
    }
    if((numWithGeo / tweets.length) > MIN_GEO_RATIO || numWithGeo > 5){
      console.log('\n\nMap them: ' + userID + ' : ' + (numWithGeo / tweets.length));
    }
  }
};



app.start();
