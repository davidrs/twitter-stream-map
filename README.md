twitter-stream-map
==================

A configurable map to show users tweets or a stream of tweets.
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
6. open `/app/index.html` in a browser and watch the map.


TODO:
=====

- add a legend: colour coding is device type, then if you click on a user it is colour coded by time of day.
- add more explination.
- add documentation for `find-people.js` and `replay.js`
