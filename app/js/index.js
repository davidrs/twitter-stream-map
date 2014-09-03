var GLOBAL = {};
var app = {

    // Application Constructor
    init: function() {
        console.log('app init');

        // Init views and models.
        MapView.init();  

        var socket = io.connect("http://localhost:3000/");

        socket.on("connect", function() {
            // Do stuff when we connect to the server
        });
         
        socket.on("tweet", function(tweet) {
            // Log the tweet I received
            if(MapView.mode == 'ALL'){console.log(tweet);}
            MapView.addTweet(tweet)         
        });

    }
};
