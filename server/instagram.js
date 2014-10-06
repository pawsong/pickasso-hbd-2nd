'use strict';

var ig = require('instagram-node').instagram();

ig.use({
  client_id: '5ba601299bfb46d5af0d0bf41c68d434',
  client_secret: 'beba1763ba0c4394a4d2a96ce0a43e7c'
});

module.exports = ig;
