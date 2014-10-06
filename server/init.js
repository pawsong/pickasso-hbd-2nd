'use strict';

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

  var tags = {
    'pickasso': false,
    'pickassotest': false
  };

  for (let i = 0; i < subscriptions.length; ++i) {

    let subscription = subscriptions[i];
    if (subscription.object !== 'tag') {
      continue;
    }

    let tag = subscription.object_id;
  
    if (tags[tag] === false) {
      tags[tag] = true;
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

  for (let i = 0; i < keys.length; ++i) {
    let tag = keys[i];
    if (tags[tag] === false) {
      ret = yield subscribe(tag);
      console.log(ret);
    }
  }

};
