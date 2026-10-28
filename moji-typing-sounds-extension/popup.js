/**
 * Moji Typing Sounds — Popup Logic
 * Uses MojiAudio directly for preview. Settings via chrome.storage.sync.
 */
(function() {
  'use strict';

  var DEFAULTS = { moji_ext_enabled: true, moji_ext_pack: 'mechanical', moji_ext_volume: 0.80 };
  var toggleBtn = document.getElementById('toggle-btn');
  var card = document.querySelector('.popup-card');
  var packGrid = document.getElementById('pack-grid');
  var volumeSlider = document.getElementById('volume-slider');
  var volumeDisplay = document.getElementById('volume-display');
  var testBtn = document.getElementById('test-btn');
  var settings = {};

  function render() {
    if (settings.moji_ext_enabled) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-checked', 'true');
      card.classList.remove('disabled');
    } else {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-checked', 'false');
      card.classList.add('disabled');
    }
    var pills = packGrid.querySelectorAll('.pack-pill');
    for (var i = 0; i < pills.length; i++) {
      var isSelected = pills[i].dataset.pack === settings.moji_ext_pack;
      if (isSelected) {
        pills[i].classList.add('active');
        pills[i].setAttribute('aria-checked', 'true');
      } else {
        pills[i].classList.remove('active');
        pills[i].setAttribute('aria-checked', 'false');
      }
    }
    var volPercent = Math.round(settings.moji_ext_volume * 100);
    volumeSlider.value = settings.moji_ext_volume;
    volumeSlider.setAttribute('aria-valuenow', volPercent);
    volumeSlider.setAttribute('aria-valuetext', volPercent + '%');
    volumeDisplay.textContent = volPercent + '%';
  }

  function save() {
    chrome.storage.sync.set(settings);
  }

  // Toggle
  toggleBtn.addEventListener('click', function() {
    settings.moji_ext_enabled = !settings.moji_ext_enabled;
    render(); save();
  });

  // Pack selection
  packGrid.addEventListener('click', function(e) {
    var pill = e.target.closest('.pack-pill');
    if (!pill) return;
    settings.moji_ext_pack = pill.dataset.pack;
    render(); save();
    if (window.MojiAudio) window.MojiAudio.preview(settings.moji_ext_pack, settings.moji_ext_volume);
  });

  // Volume
  volumeSlider.addEventListener('input', function(e) {
    settings.moji_ext_volume = parseFloat(e.target.value);
    var volPercent = Math.round(settings.moji_ext_volume * 100);
    volumeSlider.setAttribute('aria-valuenow', volPercent);
    volumeSlider.setAttribute('aria-valuetext', volPercent + '%');
    volumeDisplay.textContent = volPercent + '%';
  });
  volumeSlider.addEventListener('change', function() { save(); });

  // Test
  testBtn.addEventListener('click', function() {
    testBtn.classList.add('playing');
    if (window.MojiAudio) window.MojiAudio.preview(settings.moji_ext_pack, settings.moji_ext_volume);
    setTimeout(function() { testBtn.classList.remove('playing'); }, 600);
  });

  // Init Settings
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(DEFAULTS, function(s) {
      settings = s;
      render();
    });
  } else {
    settings = DEFAULTS;
    render();
  }

  // ─── Practice Mode UI Logic ─────────────────────────────────
  var openPracticeBtn = document.getElementById('open-practice');
  var backToSettingsBtn = document.getElementById('back-to-settings');
  var settingsView = document.getElementById('settings-view');
  var practiceView = document.getElementById('practice-view');

  openPracticeBtn.addEventListener('click', function() {
    settingsView.style.display = 'none';
    practiceView.style.display = 'block';
    // Animate width
    document.body.style.width = '580px';
  });

  backToSettingsBtn.addEventListener('click', function() {
    // If practice is running, stop it
    if (window.MojiPractice && window.MojiPractice.getState().active) {
      window.MojiPractice.finish();
    }
    practiceView.style.display = 'none';
    settingsView.style.display = 'block';
    // Animate width back
    document.body.style.width = '380px';
  });

  // Practice Engine Wiring
  if (window.MojiPractice) {
    var pStartBtn = document.getElementById('p-start');
    var pInput = document.getElementById('p-input');
    var modePills = document.getElementById('mode-pills');
    var timePills = document.getElementById('time-pills');

    pStartBtn.addEventListener('click', function() {
      if (window.MojiPractice.getState().active) {
        window.MojiPractice.finish();
      } else {
        window.MojiPractice.start();
      }
    });

    // Play sounds during practice typing
    pInput.addEventListener('keydown', function(e) {
      if (!window.MojiPractice.getState().active) return;
      var key = e.key.toLowerCase();
      var cat = 'letter';
      if (key === ' ') cat = 'space';
      else if (key === 'backspace') cat = 'backspace';
      else if (key === 'enter') cat = 'enter';
      else if (key.length > 1) cat = 'special';
      
      if (window.MojiAudio) {
        window.MojiAudio.play(key, cat, settings.moji_ext_pack, settings.moji_ext_volume);
      }
    });

    pInput.addEventListener('input', window.MojiPractice.handleInput);

    // Click anywhere on text area to focus input
    document.getElementById('practice-text-wrap').addEventListener('click', function() {
      pInput.focus();
    });

    // Mode Selection
    modePills.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') return;
      var pills = modePills.querySelectorAll('button');
      for (var i=0; i<pills.length; i++) {
        pills[i].classList.remove('active');
        pills[i].setAttribute('aria-checked', 'false');
      }
      e.target.classList.add('active');
      e.target.setAttribute('aria-checked', 'true');
      window.MojiPractice.setMode(e.target.dataset.mode);
      if (window.MojiPractice.getState().active) window.MojiPractice.finish();
    });

    // Time Selection
    timePills.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') return;
      var pills = timePills.querySelectorAll('button');
      for (var i=0; i<pills.length; i++) {
        pills[i].classList.remove('active');
        pills[i].setAttribute('aria-checked', 'false');
      }
      e.target.classList.add('active');
      e.target.setAttribute('aria-checked', 'true');
      window.MojiPractice.setDuration(parseInt(e.target.dataset.time, 10));
      if (window.MojiPractice.getState().active) window.MojiPractice.finish();
    });
  }

  // ─── Rate Moji Dynamic CWS Reviews Navigation ────────────────
  var rateBtn = document.getElementById('rate-btn');
  if (rateBtn) {
    rateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var extId = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) ? chrome.runtime.id : '';
      var storeUrl = extId 
        ? 'https://chromewebstore.google.com/detail/' + extId + '/reviews'
        : 'https://github.com/gitz1001/moji/issues';
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: storeUrl });
      } else {
        window.open(storeUrl, '_blank');
      }
    });
  }

  // ─── User Guide Modal Logic ──────────────────────────────────
  var guideModal = document.getElementById('guide-modal');
  var guideHeaderBtn = document.getElementById('guide-header-btn');
  var guideBtn = document.getElementById('guide-btn');
  var guideCloseBtn = document.getElementById('guide-close-btn');
  var guideOkBtn = document.getElementById('guide-ok-btn');

  function openGuide() {
    if (guideModal) guideModal.style.display = 'flex';
  }
  function closeGuide() {
    if (guideModal) guideModal.style.display = 'none';
  }

  if (guideHeaderBtn) guideHeaderBtn.addEventListener('click', openGuide);
  if (guideBtn) guideBtn.addEventListener('click', openGuide);
  if (guideCloseBtn) guideCloseBtn.addEventListener('click', closeGuide);
  if (guideOkBtn) guideOkBtn.addEventListener('click', closeGuide);

  if (guideModal) {
    guideModal.addEventListener('click', function(e) {
      if (e.target === guideModal) closeGuide();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && guideModal && guideModal.style.display !== 'none') {
      closeGuide();
    }
  });

})();
