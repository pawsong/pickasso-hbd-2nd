'use strict';

$(document).ready(function () {

  var WALLPAPER_LOAD_TIME = 20 * 1000;
  var WALLPAPER_DELAY = 60 * 1000;

  var WALLPAPER_NUM = 2;

  var wallpaperIdx = 1;

  function createWallpaperElement() {

    var elem = $('<iframe class="wallpaper" src="wallpapers/wallpaper' + wallpaperIdx + '.html"></iframe>');

    elem
      .css('position', 'absolute')
      .css('width', '100%')
      .css('height', '100%');

    return elem;

  }

  // Initialize
  var element = $('body');

  var curWallpaper = createWallpaperElement();
  var nextWallpaper = null;

  element.prepend(curWallpaper);

  // Start loop
  setInterval(function () {

    // Find wallpaper to use
    wallpaperIdx = wallpaperIdx >= WALLPAPER_NUM ? 1 : + wallpaperIdx + 1;

    // Load next wallpaper
    nextWallpaper = createWallpaperElement();
    element.prepend(nextWallpaper);

    // wait for loading...
    setTimeout(function () {

      // Use next wallpaper
      curWallpaper.remove();
      curWallpaper = nextWallpaper;
      nextWallpaper = null;

    }, WALLPAPER_LOAD_TIME);

  }, WALLPAPER_DELAY);

});