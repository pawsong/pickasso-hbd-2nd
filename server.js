'use strict';

var _ = require('lodash'),
    koa = require('koa'),
    router = require('koa-router'),
    cors = require('koa-cors'),
    bodyParser = require('koa-bodyparser'),
    http = require('http'),
    co = require('co');

var serve = require('koa-static');

var app = koa();

var ig = require('./server/instagram');

var tags = require('./server/tags');
var initialize = require('./server/init');

co(function* () {

  function* queueGen(tag) {
    var ret = yield function (done) {
      ig.tag_media_recent(tag, done);
    };

    var data = _.sortBy(ret[0], function (elem) {
      return _.parseInt(elem.created_time);
    }).map(function (elem) {

      var url = elem.type === 'video' ?
        elem.videos.standard_resolution.url :
        elem.images.standard_resolution.url;

      return {
        type: elem.type,
        url: url
      };

    });

    var minTagId = ret[1].min_tag_id;

    var MAX_QUEUE_SIZE = 20;

    if (data.length > MAX_QUEUE_SIZE) {
      data = data.slice(data.length - MAX_QUEUE_SIZE);
    }

    console.log('tag %s init length : %d', tag, data.length);

    return {
      data: data,
      minTagId: minTagId,
      MAX_QUEUE_SIZE: MAX_QUEUE_SIZE
    };
  }

  var queueMap = {};

  for (let i = 0; i < tags.length; ++i) {
    let tag = tags[i];
    queueMap[tag] = yield queueGen(tag);
  }

  // Error handling
  app.use(function* (next) {
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = 'Internal error';
      this.app.emit('error', err, this);
    }
  });

  app.on('error', function(err){
    console.error('server error', err);
    console.error(err.stack);
  });

  // Cors
  app.use(cors({
    credentials: true
  }));

  // Body Parser
  app.use(bodyParser());

  // Route to APIs
  app.use(router(app));

  app.use(serve(__dirname + '/dist'));

  // Create server
  var server = http.createServer(app.callback());
  var io = require('socket.io')(server);

  // Handle io inputs
  require('./server/io')(io, queueMap);

  // API routes
  require('./server/api')(app, io, queueMap);

  // Start server
  console.log('Listening at 3000');
  server.listen(3000);

  // Instagram initialization
  yield initialize(server);

})();