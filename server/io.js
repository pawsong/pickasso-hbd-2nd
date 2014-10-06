'use strict';

module.exports = function(io, queueMap) {

  var tags = Object.keys(queueMap);

  io.on('connection', function (socket) {
    
    tags.forEach(function (tag) {
      socket.emit('init', {
        tag: tag,
        data: queueMap[tag].data
      });
    });
 
  });

};
