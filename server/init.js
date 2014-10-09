'use strict';

var tags = require('./tags');
var ig = require('./instagram');

module.exports = function* (server) {

  var ret = yield function (done) {
    ig.subscriptions(done);
  };

  var subscriptions = ret[0];

  var remaining = ret[1];
  var limit = ret[2];

  console.log('remaining: %d', remaining);
  console.log('limit: %d', limit);

  var tagMap = {};

  tags.forEach(function (tag) {
    tagMap[tag] = false;
  });

  for (let i = 0; i < subscriptions.length; ++i) {

    let subscription = subscriptions[i];
    if (subscription.object !== 'tag') {
      continue;
    }

    let tag = subscription.object_id;
  
    if (tagMap[tag] === false) {
      tagMap[tag] = true;
    }

    console.log('Now subscribing %s tag ...', tag);
    
  }

  function* subscribe(tag) {
    console.log('subscribe tag %s', tag);
    return yield function (done) {
      ig.add_tag_subscription(tag,
          'http://1.234.4.209:3000/instagram/tag/pickasso', done);
    }
  }

  var keys = Object.keys(tags);

  for (let i = 0; i < tags.length; ++i) {
    let tag = tags[i];
    if (tagMap[tag] === false) {
      ret = yield subscribe(tag);
      console.log(ret);
    }
  }

};
