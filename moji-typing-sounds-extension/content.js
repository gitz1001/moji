/**
 * Moji Typing Sounds — Content Script (ISOLATED world)
 * 1. Injects audio-main.js into page's MAIN world via <script> tag
 * 2. Detects keystrokes and dispatches events to MAIN world
 * 3. Reads settings from chrome.storage.sync
 */
(function() {
  'use strict';

  // ─── Step 1: Inject audio engine into MAIN world ──────────────
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('audio-main.js');
  script.onload = function() { script.remove(); };
  (document.head || document.documentElement).appendChild(script);

  // ─── Step 2: Settings ─────────────────────────────────────────
  var enabled = true, pack = 'mechanical', volume = 0.65;

  try {
    chrome.storage.sync.get({
      moji_ext_enabled: true,
      moji_ext_pack: 'mechanical',
      moji_ext_volume: 0.65
    }, function(s) {
      if (s) {
        enabled = s.moji_ext_enabled;
        pack = s.moji_ext_pack;
        volume = s.moji_ext_volume;
      }
    });
    chrome.storage.onChanged.addListener(function(changes) {
      if (changes.moji_ext_enabled) enabled = changes.moji_ext_enabled.newValue;
      if (changes.moji_ext_pack) pack = changes.moji_ext_pack.newValue;
      if (changes.moji_ext_volume) volume = changes.moji_ext_volume.newValue;
    });
  } catch(e) {}

  // ─── Step 3: Key classification ───────────────────────────────
  var IGNORED = {'Control':1,'Alt':1,'Meta':1,'OS':1,'ContextMenu':1,'PrintScreen':1,'ScrollLock':1,'Pause':1,'NumLock':1,'Insert':1,'F1':1,'F2':1,'F3':1,'F4':1,'F5':1,'F6':1,'F7':1,'F8':1,'F9':1,'F10':1,'F11':1,'F12':1,'AudioVolumeUp':1,'AudioVolumeDown':1,'AudioVolumeMute':1,'MediaPlayPause':1,'MediaTrackNext':1,'MediaTrackPrevious':1,'MediaStop':1};
  var NAV = {'ArrowUp':1,'ArrowDown':1,'ArrowLeft':1,'ArrowRight':1,'Home':1,'End':1,'PageUp':1,'PageDown':1};

  function classify(e) {
    var key = e.key;
    if (IGNORED[key] || e.repeat) return null;
    if (key === ' ') return 'space';
    if (key === 'Backspace' || key === 'Delete') return 'backspace';
    if (key === 'Enter' || key === 'Tab') return 'enter';
    if (key === 'Escape') return 'special';
    if (key === 'CapsLock' || key === 'Shift') return 'modifier';
    if (NAV[key]) return 'navigation';
    return 'letter';
  }

  // ─── Step 4: Keydown listener → dispatch to MAIN world ───────
  document.addEventListener('keydown', function(e) {
    if (!enabled) return;
    var cat = classify(e);
    if (!cat) return;
    // Send to MAIN world via CustomEvent on a shared DOM element
    window.dispatchEvent(new CustomEvent('__moji_play', {
      detail: e.key.toLowerCase() + '|' + cat + '|' + pack + '|' + volume
    }));
  }, true);
})();
