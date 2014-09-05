
var MapView = {
	map:null,
	locationsLayerGroup: null,
	locationMarkers: [],
	userMarkers: [],
	userTweets: [],
	userMarker:null,
	autoPopup: true,
	mode: 'ALL',

	init: function(){
		console.info('init map view');

		//create Leaflet map.
		this.resizeMap();
		this.map = L.map('map-container').setView([38.91, -77.04], 12 );

		//http://{S}tile.stamen.com/", layer, "/{Z}/{X}/{Y}
		var basemapURLs = {
			toner: 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
			watercolor: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
			davidMapBox: 'http://{s}.tiles.mapbox.com/v3/drustsmi.jcmc6oj2/{z}/{x}/{y}.png',

		}

		L.tileLayer(basemapURLs.davidMapBox, {
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		     // "attribution":  [
       //          'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ',
       //          'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
       //          'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ',
       //          'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
       //      ].join(""),
		    maxZoom: 19
		}).addTo(this.map);

		this.allTweetsLayer = L.layerGroup([]);
		this.allTweetsLayer.addTo(this.map);
		this.userTweetsLayer = L.layerGroup([]);
		this.userTweetsLayer.addTo(this.map);
		
		$('#auto-popup').on('change',function(){
			MapView.autoPopup = $('#auto-popup').is(':checked');
		});

		$('#show-all-tweets').on('click',function(){
			$(this).hide();

			MapView.mode = 'ALL';
			MapView._hideUserTweets();
			MapView._showAllTweets();
		});


		$('#map-container').on('click','.username',function(){
			$('#show-all-tweets').show();
			var uid = $(this).data('uid');
			$.get(GLOBAL.BASE_URL+'/user/'+uid).then(function(data){
				console.log('tweets', data.tweets);
				MapView._drawUsersTweets(data.tweets);
			});
			MapView.mode = 'USER';
		});

		this.resizeMap();
	},

	_drawUsersTweets: function (tweets) {
		MapView._hideAllTweets();
		_.each(tweets, function(tweet){
			console.log('add user tweets', tweet);
			MapView.addUserTweet(tweet);
		});
	},
	
//TODO: split between stream tweet and user tweet.
//TODO: colour code user tweets by time of day.

	addUserTweet: function (tweet) {
		var self = MapView;

		if(tweet.geo){
			var tmpMarker = L.circleMarker(tweet.geo.coordinates,{
			        radius: 4,
			        fillColor: self._getTimeOfDayColour(tweet.created_at),
			        color: "#666",
			        weight: 0,
			        opacity: 1,
			        fillOpacity: 0.8,})
								.bindPopup(self.createInfoWindow(tweet), {autoPan:false});

			self.userMarkers.push(tmpMarker);
			if(self.mode == 'USER'){
				self.userTweetsLayer.addLayer(tmpMarker);
				if(MapView.autoPopup){
					tmpMarker.openPopup();
				}
			}
			

			if(self.locationMarkers.length == 1){
				this.map.setView(tweet.geo.coordinates, 9 );
			}

		} else{
			console.warn('no geo? ', tweet);
		}	
	},

	createInfoWindow: function(tweet){
	return	"<span class='username button' data-uid='"+tweet.user.id_str+"'>" + tweet.user.name +'</span><br />'+
												tweet.text +'<br /><small>'+tweet.source+
												' - <a href="http://twitter.com/'+tweet.user.id_str+'/status/'+tweet.id_str+'" target="_blank">tweet</a></small>'
	},

	addTweet: function (tweet) {
		var self = MapView;

		if(tweet.geo){
			var tmpMarker = L.circleMarker(tweet.geo.coordinates,{
			        radius: 4,
			        fillColor: self._getSourceColour(tweet.source), //tweet.created_at
			        color: "#666",
			        weight: 0,
			        opacity: 1,
			        fillOpacity: 0.8,})
								.bindPopup(self.createInfoWindow(tweet), {autoPan:false});

			self.locationMarkers.push(tmpMarker);
			if(self.mode == 'ALL'){
				self.allTweetsLayer.addLayer(tmpMarker);
				if(MapView.autoPopup){
					tmpMarker.openPopup();
				}
			}
		

			if(self.locationMarkers.length == 1){
				this.map.setView(tweet.geo.coordinates, 9 );
			}

		} else{
			console.warn('no geo? ', tweet);
		}
	},

	_getTimeOfDayColour: function(createdAt){
		var tmpDate = new Date(createdAt);
		console.log(tmpDate);
		console.log(tmpDate.getHours());
		var hour = tmpDate.getHours();

		if( 10 <= hour && hour <= 17 ){	// work		
			return '#bf2';
		} else if( 19 <= hour || hour <= 7 ){ // home
			return '#7bf';
		} else{ //inbetween
			return '#aaa';			
		}
	},

	_getSourceColour: function(source){
		if(source.indexOf('iP')>-1){			
			return '#f74';
		} else if(source.indexOf('Android')>-1){			
			return '#7f5';
		} else{
			return '#58f';			
		}
	},


	_hideAllTweets: function(){
		var self = this;
		self.allTweetsLayer.eachLayer(function(marker){
			self.allTweetsLayer.removeLayer(marker);
		});
	},

	_showAllTweets: function(){
		var self = this;
		_.each(this.locationMarkers, function(marker){
			self.allTweetsLayer.addLayer(marker);
		});
	},

	_hideUserTweets: function(){
		var self = this;
		self.userTweetsLayer.eachLayer(function(marker){
			self.userTweetsLayer.removeLayer(marker);
		});
	},

	_showUserTweets: function(){
		var self = this;
		_.each(this.userMarkers, function(marker){
			self.userTweetsLayer.addLayer(marker);
		});
	},

	resizeMap: function() {
		var mapDOM = $('#map-container');
		if(mapDOM){
			var position = mapDOM.position();
			mapDOM.height(Math.max(100, $(window).height()-(50)));
		}

		if(this.map){
				this.map.invalidateSize();
		}
	},
};

$(document).delegate('#map-page', 'pageshow', function () {
	MapView.resizeMap();
});


$(window).resize(function() {
	MapView.resizeMap();
});
