var Model = require('./db/models');

var clients = {};

var union = function(/*arrays*/) {
  var args = [].slice.call(arguments), result = [];
  args.forEach(function(arg) {
    arg.forEach(function(e) {
      if (result.indexOf(e) === -1) { result.push(e); }
    });
  });
  return result;
};

var flatten = function(array, shallow) {
	var result = [];
	if (shallow) {
		array.forEach(function(e) {
			result = result.concat(e);
		});
	}
	else {
			array.forEach(function(e) {
			if (typeof e === 'object' && e.hasOwnProperty('length'))
				result = result.concat(flatten(e));
			else
				result = result.concat(e);
		});
	}
	return result;
}

module.exports = function(server) {
  var io = require('socket.io')(server);
  var feed = io.of('/feed');

  feed.on('connection', function(client) {

    client.on('feed_updates', function(time) {
      var feed_sources = [];
      Model.Donor.findById(clients[client.id], function(err, donor) {
        if (err) { throw err; }
        if (donor) {
          for (var i = 0; i < donor.following.length; i++) {
            (function(orgID, idx) {
              Model.Organization.findById(orgID, function(err, org) {
                feed_sources[idx] = org.feed.filter(function(item) {
                  return item.created_date > time;
                });
                if (feed_sources.length === donor.following.length) {
                  client.emit('updateFeed', flatten(feed_sources));
                }
              });
            })(donor.following[i], i)
          }
        }
        else {
          Model.Organization.findById(clients[client.id], function(err, org) {
            if (err) throw err;
            if (org) {
              var orgFeed = org.feed.filter(function(item) {
                return item.created_date > time && item.user !== org.name;
              });
              client.emit('updateFeed', orgFeed);
            }
          });
        }
      });
    });

    client.on('getFeed', function(token) {
      clients[client.id] = token;
      var feed_sources = [];
      Model.Donor.findById(token, function(err, donor) {
        if (err) { throw err; }
        if (donor) {
          for (var i = 0; i < donor.following.length; i++) {
            (function(orgID, idx) {
              Model.Organization.findById(orgID, function(err, org) {
                feed_sources[idx] = org.feed;
                if (feed_sources.length === donor.following.length) {
                  client.emit('storeFeed', flatten(feed_sources));
                }
              });
            })(donor.following[i], i)
          }
        }
        else {
          Model.Organization.findById(token, function(err, org) {
            if (err) throw err;
            if (org) {
              // for (var i = 0; i < org.followers.length; i++) {
              //   (function(donorID, idx) {
              //     Model.Donor.findById(donorID, function(err, donor) {
              //       feed_sources[idx] = donor.feed;
              //       if (feed_sources.length === org.followers.length) {
              //         client.emit('storeFeed', flatten(feed_sources));
              //       }
              //     });
              //   })(org.followers[i], i)
              // }
              var orgFeed = org.feed.filter(function(item) {
                return item.user !== org.name;
              }).sort(function(item1, item2) {
                return new Date(item2.created_date) - new Date(item1.created_date);
              });
              client.emit('storeFeed', orgFeed);
            }
          });
        }
      });
    });

    //this is an organization or donor action
    client.on('disconnect', function() {
      delete clients[client.id];
      client.emit('stopPolling');
    });

    //this is a donor action
    client.on('follow', function(donorID, orgID) {
      var now = new Date();
      Model.Organization.findById(orgID, function(err, org) {
        if (err) throw err;
        else {
          if (org.followers.indexOf(donorID) === -1) {
            Model.Donor.findById(donorID, function(err, donor) {
              if (err) throw err;
              if (donor) {
                if (donor.following.indexOf(orgID) === -1) {
                  org.followers.push(donorID);
                  org.feed.push({
                    user: donor.name.first + " " + donor.name.last,
                    message: "started following you",
                    created_date: now
                  });
                  donor.following.push(orgID);
                  donor.feed.push({
                    user: donor.name.first + " " + donor.name.last,
                    message: 'started following ' + org.name,
                    created_date: now
                  });
                  org.save(function(err) {
                    if (err) throw err;
                    donor.save(function(err, updatedDonor) {
                      if (err) throw err;
                      else {
                      }
                    });
                  });
                }
              }
            });
          }
        }
      });
    });

    //this is a donor action
    client.on('donation', function(donorID, projectID, amount) {
      var now = new Date();
      Model.Project.findById(projectID, function(err, project) {
      if (err) throw err;
      if (project) {
        Model.Donor.findById(donorID, function(err, donor) {
          if (err) throw err;
          if (donor) {
            donor.feed.push({
              user: donor.name.first + " " + donor.name.last,
              message: "Donated $" + amount + " to " + project.title,
              created_date: now
            });
            donor.save(function(err) {
              Model.Organization.findById(project._org, function(err, org) {
                if (err) throw err;
                if (org) {
                  org.feed.push({
                    user: donor.name.first + " " + donor.name.last,
                    message: "Donated $" + amount + " to " + project.title,
                    created_date: now
                  });
                  org.save();
                }
              });
            });
          }
        });
       }
     });
    });

    //donor action
    client.on('endorsement', function(donorID, orgID) {
      var now = new Date();
      Model.Donor.findById(donorID, function(err, donor) {
        if (err) throw err;
        if (donor) {
          Model.Organization.findById(orgID, function(err, org) {
            if (err) throw err;
            if (org) {
              donor.feed.push({
                user: donor.name.first + " " + donor.name.last,
                message: 'endorsed' + org.name,
                created_date: now
              });
              donor.save(function() {
                org.feed.push({
                  user: donor.name.first + " " + donor.name.last,
                  message: "endorsed you",
                  created_date: now
                });
                org.save();
              });
            }
          });
        }
      });
    });

    //donor or org action
    client.on('profile_update', function(username) {
      Model.Donor.findOne({ username: username }, function(err, donor) {
        if (err) { throw err; }
        if (donor) {
          donor.feed.push({
            user: donor.name.first + " " + donor.name.last,
            message: 'updated profile information',
            attachment: '',
            created_date: new Date()
          });
          donor.save();
        }
        else {
          Model.Organization.findOne({ username: username }, function(err, org) {
            if (err) throw err;
            if (org) {
              org.feed.push({
                user: org.name,
                message: 'updated profile information',
                attachment: '',
                created_date: new Date()
              });
              org.save();
            }
          });
        }
      });
    });

  });

  return feed;
};
