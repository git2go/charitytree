var feeder = io('http://127.0.0.1:4000/feed');
// var feeder = io('http://54.213.164.135/feed');

var feedData = [], i;

feeder.on('storeFeed', function(arrFeed) {
  console.log('Get Feed triggered: ', arrFeed);
  feedData = arrFeed || [];
  i = setInterval(function() {
    feeder.emit('feed_updates', new Date());
  }, 10000);
});

feeder.on('updateFeed', function(arrFeed) {
  console.log('updateFeed being called');
  if (arrFeed.length) {
    console.log('Got new updates');
    feedData = feedData.concat(arrFeed);
  }
});

feeder.on('stopPolling', function() {
  clearInterval(i);
});
