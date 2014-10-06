'use strict';

var _ = require('lodash'),
    ig = require('./instagram');

module.exports = function (app, io, queueMap) {

  // For registeration
  app.get('/instagram/tag/pickasso', function* () {

    var challenge = this.query['hub.challenge'];

    if (!challenge) {
      throw new Error('challenge required');
    }

    this.body = challenge;

  });

  // Callback
  app.post('/instagram/tag/pickasso', function* () {

    var items = this.request.body;

    if (!Array.isArray(items)) {
      throw new Error('body must be an array');
    }

    var res = [];

    var itemsLength = items.length;

    for (let i = 0; i < itemsLength; ++i) {

      let item = items[i];

      if (item.object !== 'tag') {
        continue;
      }

      let tag = item.object_id;

      let queue = queueMap[tag];

      if (!queue) {
        throw new Error('Cannot find queue');
      }

      let ret = yield function (done) {
        ig.tag_media_recent(item.object_id, {
          min_tag_id: queue.minTagId
        }, done);
      };

      // Add url data     
      let data = _.sortBy(ret[0], function (elem) {
        return _.parseInt(elem.created_time, 10);
      }).map(function (elem) {
        var url = elem.type === 'video' ?
            elem.videos.standard_resolution.url :
            elem.images.standard_resolution.url;

        return { 
          type: elem.type,
          url: url
        };
      });

      var dataLen = data.length;
      var queueLen = queue.data.length;

      var overflowLen = queueLen + dataLen - queue.MAX_QUEUE_SIZE;

      if (overflowLen > 0) {
        queue.data = queue.data.slice(overflowLen).concat(data);
      } else {
        queue.data = queue.data.concat(data);
      }

      // Store min_tag_id
      queue.minTagId = ret[1].min_tag_id;

      // Broadcast added url list
      io.emit('data', { 
        tag: tag,
        data: data
      });

    }

    this.body = 'thanks';
  
  });

};
