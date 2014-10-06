'use strict';

$(document).ready(function () {

  // 한 이미지를 유지하고 있는 시간(ms)
  var IMG_DELAY = 5 * 1000;

  // Queue size
  var MAX_QUEUE_SIZE = 20;

  // Make queue
  function generateQueue () {

    var queue = [];
    var index = -1;
    var maxIndex = -1;

    function reset () {
      queue = [];
      index = -1;
      maxIndex = -1;
    }

    function insert (data) {

      console.log('[insert] new data inserted');

      var overflowLen = queue.length + data.length - MAX_QUEUE_SIZE;

      if (overflowLen > 0) {
        maxIndex = Math.max(maxIndex - overflowLen, -1);
        queue = queue.slice(overflowLen).concat(data);
      } else {
        queue = queue.concat(data);
      }

      index = maxIndex;

    }

    function empty() {
      return queue.length === 0;
    }

    function next () {

      var queueLen = queue.length;

      if (queueLen === 0) {
        return null;
      }

      index = index + 1;

      if (index >= queue.length) {
        index = 0;
      }

      if (index > maxIndex) {
        maxIndex = index;
      }

      console.log('[next] index=%d, maxIndex=%d, queueLen=%d', index, maxIndex, queueLen);

      return queue[index];
    }

    return {
      reset: reset,
      insert: insert,
      empty: empty,
      next: next
    };

  }

  var queueMap = {
    pickasso: generateQueue(),
    pickassotest: generateQueue()
  };

  // Socket IO job
  var socket = io('http://1.234.4.209:3000');

  function ioHandler (init) {

    return function (payload) {

      if (!payload.tag) {
        console.error('Cannot find tag');
        return;
      }

      var queue = queueMap[payload.tag];

      if (!queue) {
        console.error('Cannot find queue');
        return;
      }

      if (init) {
        queue.reset();
      }

      queue.insert(payload.data);
    };

  }

  socket.on('connect', function(){

    console.log('connected');

    socket.on('init', ioHandler(true));
    socket.on('data', ioHandler(false));

  });

  var iQueue = queueMap.pickassotest;

  var $instaGallery = $('#instaGallery');

  var prevResult = null;

  async.forever(function (done) {

    var obj = iQueue.next();

    if (!obj) {
      obj = {
        type: 'image',
        url: 'http://scontent-a.cdninstagram.com/hphotos-xap1/t51.2885-15/1388826_1549781818588246_826641552_n.jpg'
      };
    }

    async.parallel({

      // Play current obj
      current: function (callback) {
        if (!prevResult) {
          return callback();
        }

        prevResult.play(callback);
      },

      // Load next obj
      next: function (callback) {

        var prevElem, play;

        if (obj.type === 'image') {

          prevElem = $('<img class="instagram-wrapper" src="' + obj.url + '">');
          $instaGallery.prepend(prevElem);

          play = function (cb) {
            setTimeout(cb, IMG_DELAY);
          };

          prevElem.load(function () {
            callback(null, {
              elem: prevElem,
              play: play
            });
          });

        } else {

          prevElem = $('<video class="instagram-wrapper" src="' + obj.url + '">');
          $instaGallery.prepend(prevElem);

          var rawVid = prevElem[0];

          play = function (cb) {
            rawVid.play();
            prevElem.bind('ended', function () {
              cb();
            });
          };

          rawVid.oncanplay = function () {
            callback(null, {
              elem: prevElem,
              play: play
            });
          };

        }
      }
    }, function (err, results) {
      if (err) {
        return done(err);
      }

      if (prevResult) {
        prevResult.elem.remove();
      }

      prevResult = results.next;

      done();

    });

  }, function (err) {
    if (err) {
      console.error(err);
      return;
    }

    throw new Error('Unexpectedly terminated');
  });

});