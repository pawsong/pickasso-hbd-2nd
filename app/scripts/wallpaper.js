'use strict';

$(document).ready(function () {

  var WALLPAPER_LIST = [

    'webgl_video_panorama_equirectangular',
    'webgl_helpers',
    'webgl_postprocessing_dof2',
    'webgl_interactive_particles',
    'webgl_materials_cubemap_dynamic2',
    'webgl_kinect',
    'webgl_loader_json_blender',
    'webgl_materials_cubemap_balls_reflection',
    'webgl_materials_cubemap',

    'webgl_effects_vr',
    'webgl_geometry_hierarchy',
    'webgl_performance',
    'webgl_postprocessing_advanced',
    'webgl_rtt',
    'webgl_loader_ctm',

    'webgl_buffergeometry_custom_attributes_particles',
    'webgl_animation_cloth',
    'webgl_custom_attributes_particles',
    'webgl_postprocessing',
    'webgl_effects_parallaxbarrier',
    'webgl_particles_random',
    'webgl_particles_sprites',
    'webgl_postprocessing_glitch'

  ];

  var WALLPAPER_LOAD_TIME = 2 * 1000;
  var WALLPAPER_DELAY = 6 * 1000;

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

    }, WALLPAPER_LOAD_TIME);

  }, WALLPAPER_DELAY);

});