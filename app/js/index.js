var GLOBAL = {
    BASE_URL: "http://blooming-shelf-8455.herokuapp.com"
   // BASE_URL: "http://localhost:3000"
};

//MapView.getUsersTweets(uid); //is critical call.

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

        this.createRoutes();
    },

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
