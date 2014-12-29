var GLOBAL = {
    // BASE_URL: "http://blooming-shelf-8455.herokuapp.com"
   BASE_URL: "http://localhost:3000"
};

// If the git hosted version, then use heroku app.
if(window.location.origin.indexOf('rawgit')>-1){
    GLOBAL.BASE_URL = "http://blooming-shelf-8455.herokuapp.com";
}


// this call will draw tweets for a specific user, can paste it into browser console:
// window.MapView.getUsersTweets('davidrustsmith');

var app = {

    // Application Constructor
    init: function() {
        console.log('app init');

        // Init views and models.
        MapView.init();


        var socket = io.connect(GLOBAL.BASE_URL+'/');

        socket.on("connect", function() {
            // Do stuff when we connect to the server
            console.log('connet');
       });

        socket.on("tweet", function(tweet) {
            // Log the tweet I received
            if(MapView.mode == 'ALL'){console.log(tweet);}
            MapView.addTweet(tweet);
        });

        this.createRoutes();
    },

    // route used for shareable link
    createRoutes: function(){
        var self = this;
        Finch.route(':word', function(res){
            if(res.word){
                console.log('word', res.word);
                MapView._hideUserTweets();
                MapView.getUsersTweets(self.quickHash(res.word, -4));
            }
        });

        Finch.listen();
    },

    quickHash: function(str, shift){
        var userHash = '';
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          chr = String.fromCharCode(chr + shift);
          userHash  += chr;
        }
        return userHash;
    }
};
