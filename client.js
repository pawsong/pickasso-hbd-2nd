var connect = require('connect');
var app = connect()
  .use(connect.static('dist'));

require('http').createServer(app)
  .listen(3100)
  .on('listening', function () {
    console.log('Started connect web server on http://localhost:3100');
  });

