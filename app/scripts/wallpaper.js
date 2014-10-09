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

  var WALLPAPER_LOAD_TIME = getParameterByName('WALLPAPER_LOAD_TIME', 5);
  var WALLPAPER_DELAY = getParameterByName('WALLPAPER_DELAY', 10);
  var LOW_PERFORMANCE = getParameterByName('LOW_PERFORMANCE', 'FALSE', true);

  console.log('WALLPAPER_LOAD_TIME : %d', WALLPAPER_LOAD_TIME);
  console.log('WALLPAPER_DELAY : %d', WALLPAPER_DELAY);
  console.log('LOW_PERFORMANCE : %s', LOW_PERFORMANCE);

  var WALLPAPER_LOAD_TIME_MILLI = WALLPAPER_LOAD_TIME * 1000;
  var WALLPAPER_DELAY_MILLI = WALLPAPER_DELAY * 1000;

  var WALLPAPER_LIST;

  if (LOW_PERFORMANCE === 'TRUE') {

    WALLPAPER_LIST = [

      'webgl_video_panorama_equirectangular', // yes
      'webgl_helpers', //yes
//    'webgl_postprocessing_dof2', // no
      'webgl_interactive_particles', // yes
//    'webgl_materials_cubemap_dynamic2', // no
      'webgl_kinect', // yes
//    'webgl_loader_json_blender', // no
      'webgl_materials_cubemap_balls_reflection', // yes
      'webgl_materials_cubemap', // yes

      'webgl_geometry_hierarchy', // yes
//    'webgl_performance', // no
//    'webgl_postprocessing_advanced', // no
      'webgl_rtt', // yes
//    'webgl_loader_ctm', // no

      'webgl_buffergeometry_custom_attributes_particles', // yes
      'webgl_animation_cloth', // yes
      'webgl_particles_random', // yes
      'webgl_postprocessing_glitch' // yes

    ];

  } else {

    WALLPAPER_LIST = [

      'webgl_video_panorama_equirectangular', // yes
      'webgl_helpers', //yes
      'webgl_postprocessing_dof2', // no
      'webgl_interactive_particles', // yes
      'webgl_materials_cubemap_dynamic2', // no
      'webgl_kinect', // yes
      'webgl_loader_json_blender', // no
      'webgl_materials_cubemap_balls_reflection', // yes
      'webgl_materials_cubemap', // yes

      'webgl_geometry_hierarchy', // yes
      'webgl_performance', // no
      'webgl_postprocessing_advanced', // no
      'webgl_rtt', // yes
      'webgl_loader_ctm', // no

      'webgl_buffergeometry_custom_attributes_particles', // yes
      'webgl_animation_cloth', // yes
      'webgl_particles_random', // yes
      'webgl_postprocessing_glitch' // yes

    ];

  }

  var WALLPAPER_NUM = WALLPAPER_LIST.length;

  var wallpaperIdx = 0;

  function createWallpaperElement() {

    var elem = $('<iframe class="wallpaper" src="wallpapers/' + WALLPAPER_LIST[wallpaperIdx] + '.html"></iframe>');

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
    wallpaperIdx++;
    if (wallpaperIdx >= WALLPAPER_NUM) {
      wallpaperIdx = 0;
    }

    // Load next wallpaper
    nextWallpaper = createWallpaperElement();
    element.prepend(nextWallpaper);

    // wait for loading...
    setTimeout(function () {

      // Use next wallpaper
      curWallpaper.remove();
      curWallpaper = nextWallpaper;
      nextWallpaper = null;

    }, WALLPAPER_LOAD_TIME_MILLI);

  }, WALLPAPER_DELAY_MILLI);

});