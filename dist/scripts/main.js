"use strict";$(document).ready(function(){function n(){var n=$('<iframe class="wallpaper" src="wallpapers/wallpaper'+o+'.html"></iframe>');return n.css("position","absolute").css("width","100%").css("height","100%"),n}var e=2e4,t=6e4,r=2,o=1,a=$("body"),c=n(),i=null;a.prepend(c),setInterval(function(){o=o>=r?1:+o+1,i=n(),a.prepend(i),setTimeout(function(){c.remove(),c=i,i=null},e)},t)}),$(document).ready(function(){function n(){function n(){a=[],c=-1,i=-1}function e(n){var e=a.length+n.length-r;e>0?(i=Math.max(i-e,-1),a=a.slice(e).concat(n)):a=a.concat(n),c=i}function t(){return 0===a.length}function o(){var n=a.length;return 0===n?null:(c+=1,c>=a.length&&(c=0),c>i&&(i=c),console.log("index=%d, maxIndex=%d, queueLen=%d",c,i,n),a[c])}var a=[],c=-1,i=-1;return{reset:n,insert:e,empty:t,next:o}}function e(n){return function(e){if(!e.tag)return void console.error("Cannot find tag");var t=o[e.tag];return t?(n&&t.reset(),void t.insert(e.data)):void console.error("Cannot find queue")}}var t=5e3,r=20,o={pickasso:n(),pickassotest:n()},a=io("http://1.234.4.209:3000");a.on("connect",function(){console.log("connected"),a.on("init",e(!0)),a.on("data",e(!1))});var c=o.pickassotest,i=$("#instaGallery"),l=null;async.forever(function(n){var e=c.next();e||(e={type:"image",url:"http://scontent-a.cdninstagram.com/hphotos-xap1/t51.2885-15/1388826_1549781818588246_826641552_n.jpg"}),"image"===e.type?async.waterfall([function(n){var t=$('<img class="instagram-wrapper" src="'+e.url+'">');i.prepend(t),t.load(function(){n(null,t)})},function(n,e){l&&l.remove(),l=n,setTimeout(e,t)}],n):async.waterfall([function(n){var t=$('<video class="instagram-wrapper" src="'+e.url+'">');i.prepend(t);var r=t[0];r.oncanplay=function(){n(null,t)}},function(n,e){l&&l.remove(),l=n,l[0].play(),l.bind("ended",function(){e()})}],n)},function(n){if(n)return void console.error(n);throw new Error("Unexpectedly terminated")})});