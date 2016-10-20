var feeder = io('http://localhost:3000/feed');

var feedData = [], i;

feeder.on('storeFeed', function(arrFeed) {
  feedData = arrFeed || [];
  i = setInterval(function() {
    feeder.emit('feed_updates', Date.now())
  }, 10000);
});

feeder.on('updateFeed', function(arrFeed) {
  if (arrFeed.length) {
    feedData = feedData.concat(arrFeed);
  }
});

feeder.on('stopPolling', function() {
  clearInterval(i);
});
