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

      console.log('index=%d, maxIndex=%d, queueLen=%d', index, maxIndex, queueLen);

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

  var oldElem = null;

  async.forever(function (done) {

    var obj = iQueue.next();

    if (!obj) {
      obj = {
        type: 'image',
        url: 'http://scontent-a.cdninstagram.com/hphotos-xap1/t51.2885-15/1388826_1549781818588246_826641552_n.jpg'
      };
    }

    if (obj.type === 'image') {

      async.waterfall([

        // Load
        function (callback) {

          var img = $('<img class="instagram-wrapper" src="' + obj.url + '">');
          $instaGallery.prepend(img);

          img.load(function () {
            callback(null, img);
          });

        },

        // Play
        function (elem, callback) {

          if (oldElem) {
            oldElem.remove();
          }

          oldElem = elem;

          setTimeout(callback, IMG_DELAY);
        }

      ], done);

    } else {

      async.waterfall([

        // Load
        function (callback) {

          var vid = $('<video class="instagram-wrapper" src="' + obj.url + '">');
          $instaGallery.prepend(vid);

          var rawVid = vid[0];
          rawVid.oncanplay = function() {
            callback(null, vid);
          };

        },

        // Play
        function (elem, callback) {

          if (oldElem) {
            oldElem.remove();
          }

          oldElem = elem;

          oldElem[0].play();
          oldElem.bind('ended', function () {
            callback();
          });
        }

      ], done);

    }

  }, function (err) {
    if (err) {
      console.error(err);
      return;
    }

    throw new Error('Unexpectedly terminated');
  });

});