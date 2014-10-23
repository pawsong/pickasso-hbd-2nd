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

    var number = parseFloat(query, 10);
    return number > 0 ? number : def;
  }

  var DEBUG = getParameterByName('DEBUG', 'FALSE', true);

  // Instagram tag
  var TAG = getParameterByName('TAG', 'pickasso', true);
  var SUB_TAGS = getParameterByName('SUB_TAGS', '4983project,cakeshopseoul', true);

  // 한 이미지를 유지하고 있는 시간(ms)
  var IMG_DELAY = getParameterByName('IMG_DELAY', 1.5);

  // Queue size
  var MAX_QUEUE_SIZE = getParameterByName('MAX_QUEUE_SIZE', 20);

  var NOTI_PERIOD = getParameterByName('NOTI_PERIOD', 10);

  var INSTA_TIMEOUT = getParameterByName('INSTA_TIMEOUT', 20);
  var NO_INSTAGRAM = getParameterByName('NO_INSTAGRAM', 'FALSE', true);

  console.log('DEBUG : %s', DEBUG);
  console.log('TAG : %s', TAG);
  console.log('SUB_TAGS : %s', SUB_TAGS);
  console.log('IMG_DELAY : %f', IMG_DELAY);
  console.log('MAX_QUEUE_SIZE : %d', MAX_QUEUE_SIZE);
  console.log('NOTI_PERIOD : %d', NOTI_PERIOD);
  console.log('INSTA_TIMEOUT : %d', INSTA_TIMEOUT);
  console.log('NO_INSTAGRAM : %s', NO_INSTAGRAM);

  if (NO_INSTAGRAM === 'TRUE') {
    return;
  }

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

  [{
    type: 'image',
    link: 'https://soundcloud.com/picka-o/3dgng-bgm',
    url: '/images/products/cover07.png'
  }, {
    type: 'image',
    link: 'http://www.4983project.com/product/detail.html?product_no=185&cate_no=46&display_group=1',
    url: '/images/products/02.png'
  }, {
    type: 'image',
    link: 'http://www.4983project.com/product/detail.html?product_no=186&cate_no=46&display_group=1',
    url: '/images/products/01.png'
  }, {
    type: 'image',
    link: 'http://www.4983project.com/product/detail.html?product_no=184&cate_no=46&display_group=1',
    url: '/images/products/03.png'
  }].forEach(function (data) {
    iQueue.insert(data);
  });

  var $instaGallery = $('#instaGallery');

  var prevResult = null;

  async.forever(function (done) {

    var obj = iQueue.next();

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

        var elem, play;

        async.parallel([

          // Load
          function (cb) {

            if (obj.type === 'image') {

              elem = $('<a href="'+ obj.link +'" target="_blank">' +
                '<img class="instagram-wrapper" src="' + obj.url + '">' +
                '</a>');
              elem.css('display', 'none');
              $instaGallery.prepend(elem);

              play = function (cb) {
                elem.css('display', 'block');
                setTimeout(cb, IMG_DELAY_MILLI);
              };

              elem.find('img').load(function () {
                cb(INSTA_RESULT_OK);
              });

            } else {

              elem = $('<video class="instagram-wrapper" src="' + obj.url + '">');
              elem.css('display', 'none');
              $instaGallery.prepend(elem);

              var rawVid = elem[0];

              play = function (cb) {
                elem.css('display', 'block');
                rawVid.play();
                elem.bind('ended', function () {
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
            elem: elem,
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