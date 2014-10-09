'use strict';

$(document).ready(function () {

  function getParameterByName(name, def, str) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);

    if (results === null) {
      return def;
    }

    var query = decodeURIComponent(results[1].replace(/\+/g, ' '));

    if (str === true) {
      return query;
    }

    var number = parseInt(query, 10);
    return number > 0 ? number : def;
  }

  var DEBUG = getParameterByName('DEBUG', 'FALSE', true);

  // Instagram tag
  var TAG = getParameterByName('TAG', 'pickasso', true);
  var SUB_TAGS = getParameterByName('SUB_TAGS', '4983project,cakeshopseoul', true);

  // 한 이미지를 유지하고 있는 시간(ms)
  var IMG_DELAY = getParameterByName('IMG_DELAY', 15);

  // Queue size
  var MAX_QUEUE_SIZE = getParameterByName('MAX_QUEUE_SIZE', 20);

  var NOTI_PERIOD = getParameterByName('NOTI_PERIOD', 10);

  var INSTA_TIMEOUT = getParameterByName('INSTA_TIMEOUT', 20);
  var NO_INSTAGRAM = getParameterByName('NO_INSTAGRAM', 'FALSE', true);

  console.log('DEBUG : %s', DEBUG);
  console.log('TAG : %s', TAG);
  console.log('SUB_TAGS : %s', SUB_TAGS);
  console.log('IMG_DELAY : %d', IMG_DELAY);
  console.log('MAX_QUEUE_SIZE : %d', MAX_QUEUE_SIZE);
  console.log('NOTI_PERIOD : %d', NOTI_PERIOD);
  console.log('INSTA_TIMEOUT : %d', INSTA_TIMEOUT);
  console.log('NO_INSTAGRAM : %s', NO_INSTAGRAM);

  if (NO_INSTAGRAM === 'TRUE') {
    return;
  }

  var SUB_TAG_LIST = SUB_TAGS.split(',');
  var IMG_DELAY_MILLI = IMG_DELAY * 1000;

  var DEBUG_MODE = DEBUG === 'TRUE';

  var INSTA_TIMEOUT_MILLI = INSTA_TIMEOUT * 1000;

  // Make queue
  function generateQueue () {

    var queue = [];
    var index = 0;

    function reset () {
      queue = [];
      index = 0;
    }

    function insert (data) {

      if (DEBUG_MODE) { console.log('[insert] new data inserted'); }

      var overflowLen = queue.length + data.length - MAX_QUEUE_SIZE;

      if (overflowLen > 0) {
        queue = queue.slice(overflowLen).concat(data);
      } else {
        queue = queue.concat(data);
      }

      index = queue.length;

    }

    function empty() {
      return queue.length === 0;
    }

    function next () {

      var queueLen = queue.length;

      if (queueLen === 0) {
        return null;
      }

      index = index - 1;

      if (index < 0) {
        index = queueLen - 1;
      }

      if (DEBUG_MODE) { console.log('[next] index=%d, queueLen=%d', index, queueLen); }

      return queue[index];
    }

    return {
      reset: reset,
      insert: insert,
      empty: empty,
      next: next
    };

  }

  var iQueue = generateQueue();

  // Socket IO job
  var socket = io('http://1.234.4.209:3000');

  function ioHandler (payload) {

    var tag = payload.tag;

    if (!tag) {
      console.error('Cannot find tag');
      return;
    }

    if (payload.init) {
      if (tag !== TAG) {
        return;
      }

      if (DEBUG_MODE) { console.log('Initialize ...'); }

      iQueue.reset();
    }

    if (tag !== TAG && -1 === SUB_TAG_LIST.indexOf(tag)) {
      return;
    }

    iQueue.insert(payload.data);

  }

  socket.on('connect', function(){

    if (DEBUG_MODE) { console.log('connected'); }

    socket.on('init', ioHandler);
    socket.on('data', ioHandler);

  });

  var $instaGallery = $('#instaGallery');

  var prevResult = null;

  var notiCounter = 0;

  async.forever(function (done) {

    var obj;

    if (notiCounter < NOTI_PERIOD) {

      obj = iQueue.next();

      notiCounter++;

    } else {

      obj = {
        type: 'image',
        url: '/images/noti2.jpg'
      };

      notiCounter = 0;

    }

    if (!obj) {
      obj = {
        type: 'image',
        url: '/images/logo.jpg'
      };
    }

    var INSTA_RESULT_OK = -1;
    var INSTA_RESULT_TIMEOUT = -2;

    async.parallel({

      // Play current obj
      current: function (callback) {

        if (!prevResult) {
          return callback();
        }

        async.parallel([

          // Play
          function (cb) {
            prevResult.play(function () {
              cb(INSTA_RESULT_OK);
            });
          },

          // Timeout
          function (cb) {
            setTimeout(function () {
              cb(INSTA_RESULT_TIMEOUT);
            }, INSTA_TIMEOUT_MILLI);
          }

        ], function (err) {

          if (err === INSTA_RESULT_TIMEOUT) {
            if (DEBUG_MODE) { console.error('current timeout'); }
          }

          callback();

        });

      },

      // Load next obj
      next: function (callback) {

        var prevElem, play;

        async.parallel([

          // Load
          function (cb) {

            if (obj.type === 'image') {

              prevElem = $('<img class="instagram-wrapper" src="' + obj.url + '">');
              $instaGallery.prepend(prevElem);

              play = function (cb) {
                setTimeout(cb, IMG_DELAY_MILLI);
              };

              prevElem.load(function () {
                cb(INSTA_RESULT_OK);
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
                cb(INSTA_RESULT_OK);
              };

            }

          },

          // Timeout
          function (cb) {
            setTimeout(function () {
              cb(INSTA_RESULT_TIMEOUT);
            }, INSTA_TIMEOUT_MILLI);
          }

        ], function (err) {

          if (err === INSTA_RESULT_TIMEOUT) {
            if (DEBUG_MODE) { console.error('next timeout'); }

            play = function (cb) {
              cb();
            };

          }

          callback(null, {
            elem: prevElem,
            play: play
          });

        });

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