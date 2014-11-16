var GLOBAL = {
   // BASE_URL: "http://blooming-shelf-8455.herokuapp.com"
    BASE_URL: "http://localhost:3000"
};
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
            MapView.addTweet(tweet)         
        });

    }
};
