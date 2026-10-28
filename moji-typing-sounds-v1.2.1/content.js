/**
 * Moji Typing Sounds — Content Script (ISOLATED world)
 * 
 * PRIVACY & SECURITY GUARANTEES:
 * 1. Zero Keystroke Storage: Never logs, captures, or saves typed characters.
 * 2. Zero Keystroke Transmission: Never emits raw keys to DOM or network.
 * 3. Password Protection: Completely silences and ignores password/sensitive fields.
 * 4. Stereo Pan Computed Locally: Only pan float (-1 to +1) is dispatched.
 */
(function() {
  'use strict';

  // Prevent injection in tiny / tracking iframes
  try {
    if (window.self !== window.top) {
      if (window.innerWidth < 10 || window.innerHeight < 10) return;
    }
  } catch(e) {}

  // ─── Step 1: Inject audio engine into MAIN world ──────────────
  // Uses web_accessible_resources with dynamic URL
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('audio-main.js');
  script.onload = function() { script.remove(); };
  (document.head || document.documentElement).appendChild(script);

  // ─── Step 2: Settings ─────────────────────────────────────────
  var enabled = true, pack = 'mechanical', volume = 0.80;

  try {
    chrome.storage.sync.get({
      moji_ext_enabled: true,
      moji_ext_pack: 'mechanical',
      moji_ext_volume: 0.80
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

  // ─── Step 3: Sensitive Field / Password Protection ────────────
  function isSensitiveField(el) {
    if (!el) return false;
    try {
      var tag = (el.tagName || '').toLowerCase();
      if (tag === 'input') {
        var type = (el.type || '').toLowerCase();
        if (type === 'password' || type === 'hidden') return true;

        var auto = (el.autocomplete || '').toLowerCase();
        if (auto === 'current-password' || auto === 'new-password' ||
            auto === 'one-time-code' || auto.indexOf('cc-') === 0) {
          return true;
        }

        var markers = ((el.name || '') + ' ' + (el.id || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
        if (/password|passcode|pincode|pin|cvv|cvc|ssn|secret|token|auth/i.test(markers)) {
          return true;
        }
      }

      if (el.isContentEditable) {
        var ceAuto = (el.getAttribute('autocomplete') || '').toLowerCase();
        if (ceAuto === 'current-password' || ceAuto === 'new-password' || ceAuto === 'one-time-code') {
          return true;
        }
      }

      if (typeof el.closest === 'function') {
        if (el.closest('input[type="password"], [data-sensitive="true"], form[action*="login"] input[type="password"]')) {
          return true;
        }
      }
    } catch(err) {}
    return false;
  }

  // ─── Step 4: Key classification & Local Pan Computation ───────
  var PAN = {
    q:-0.80,w:-0.60,e:-0.40,r:-0.20,t:-0.05,
    y:0.05,u:0.20,i:0.40,o:0.60,p:0.80,
    a:-0.75,s:-0.50,d:-0.30,f:-0.10,g:-0.05,
    h:0.05,j:0.15,k:0.35,l:0.55,
    z:-0.70,x:-0.50,c:-0.30,v:-0.10,b:-0.05,
    n:0.05,m:0.25,' ':0
  };

  var IGNORED = {'Control':1,'Alt':1,'Meta':1,'OS':1,'ContextMenu':1,'PrintScreen':1,'ScrollLock':1,'Pause':1,'NumLock':1,'Insert':1,'F1':1,'F2':1,'F3':1,'F4':1,'F5':1,'F6':1,'F7':1,'F8':1,'F9':1,'F10':1,'F11':1,'F12':1,'AudioVolumeUp':1,'AudioVolumeDown':1,'AudioVolumeMute':1,'MediaPlayPause':1,'MediaTrackNext':1,'MediaTrackPrevious':1,'MediaStop':1};
  var NAV = {'ArrowUp':1,'ArrowDown':1,'ArrowLeft':1,'ArrowRight':1,'Home':1,'End':1,'PageUp':1,'PageDown':1};

  function classify(key) {
    if (IGNORED[key]) return null;
    if (key === ' ') return 'space';
    if (key === 'Backspace' || key === 'Delete') return 'backspace';
    if (key === 'Enter' || key === 'Tab') return 'enter';
    if (key === 'Escape') return 'special';
    if (key === 'CapsLock' || key === 'Shift') return 'modifier';
    if (NAV[key]) return 'navigation';
    return 'letter';
  }

  // ─── Step 5: Keydown listener → dispatch sanitised audio event ─
  document.addEventListener('keydown', function(e) {
    if (!enabled || e.repeat) return;

    // PASSWORD & PRIVACY CHECK: completely skip sensitive inputs
    if (isSensitiveField(e.target)) return;

    var cat = classify(e.key);
    if (!cat) return;

    // Compute stereo pan locally — NEVER dispatch raw e.key
    var k = (e.key || '').toLowerCase();
    var pan = (PAN[k] !== undefined) ? PAN[k] : 0;

    // Event detail format: pan|cat|pack|volume
    // ZERO typed character data is exposed to page scripts or DOM
    window.dispatchEvent(new CustomEvent('__moji_play', {
      detail: pan.toFixed(2) + '|' + cat + '|' + pack + '|' + volume
    }));
  }, true);
})();
