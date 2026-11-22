/*
 * Applies the saved look (theme, scene wallpaper, text size, language, motion) BEFORE the first
 * paint, so no page ever flashes a fixed default image or colour while the app is loading.
 * It is a same-origin external file, so the Content-Security-Policy stays untouched (no inline
 * script). The app (src/components/App.tsx) applies the same values again after it loads.
 *
 * SCENES below must match src/lib/scenes.ts; tests/unit/themeInit.test.ts fails if they drift.
 */
(function () {
  var root = document.documentElement;
  var SCENES = {
    emerald: { photo: 39757686 },
    ink: { photo: 10989215 },
    dawn: { photo: 29609552 },
    sahara: { photo: 28829635 },
    midnight: { photo: 28849652 },
    storm: { photo: 22699879, local: true },
    lagoon: { photo: 188014, local: true },
    palm: { photo: 26562767, local: true },
    ember: { photo: 25527078, local: true },
    dew: { photo: 40401971, local: true }
  };
  var WALLPAPER_SOURCE = 'remote';
  var CDN = 'https://images.pexels.com';

  var saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('al-hidayah:settings:v1') || '{}') || {};
  } catch (error) {
    saved = {};
  }

  var theme = ['dark', 'light', 'system'].indexOf(saved.theme) >= 0 ? saved.theme : 'dark';
  var sceneId = Object.prototype.hasOwnProperty.call(SCENES, saved.scene) ? saved.scene : 'emerald';
  var size = ['small', 'default', 'large', 'extra-large'].indexOf(saved.textSize) >= 0 ? saved.textSize : 'default';
  var lang = saved.uiLanguage === 'bn' || saved.uiLanguage === 'both' ? saved.uiLanguage : 'en';
  var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var width = window.innerWidth <= 900 ? 1080 : 1920;
  var scene = SCENES[sceneId];
  var url;
  if (scene.local) url = '/wallpapers/' + sceneId + '-' + width + '.jpg';
  else if (WALLPAPER_SOURCE === 'local') url = '/wallpapers/' + sceneId + '-' + width + '.jpg';
  else url = CDN + '/photos/' + scene.photo + '/pexels-photo-' + scene.photo + '.jpeg?auto=compress&cs=tinysrgb&w=' + width;

  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.scene = sceneId;
  root.dataset.textSize = size;
  root.dataset.uiLang = lang;
  root.dataset.motion = saved.reducedMotion === true ? 'reduced' : 'full';
  root.lang = lang === 'bn' ? 'bn' : 'en';
  root.style.colorScheme = dark ? 'dark' : 'light';
  root.style.setProperty('--wall-image', 'url("' + url + '")');
})();
