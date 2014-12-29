twitter-stream-map
==================

A configurable map to show realtime stream of tweets.
Demo: http://rawgit.com/davidrs/twitter-stream-map/master/app/index.html

Prerequisites
=============

- node
- npm
- twitter API account


Setup
=====

1. rename `configure.sample.js` to `configure.js`
2. update the twitter api key and any other configure options.
3. in command line cd to this directory and run `npm install`
4. run `node app`
5. update anywhere in `/app/*` that points to `http://blooming-shelf-8455.herokuapp.com` to point to `http://localhost:3000/`
6. open `/app/index.html` in a browser and watch the map.


TODO:
=====

- add a legend: colour coding is device type, then if you click on a user it is colour coded by time of day.
- add more explination.
