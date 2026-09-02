/**
 * Moji Typing Sounds — Background Service Worker
 * Minimal — just sets defaults on install.
 * Audio is handled directly by content scripts now.
 */

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      moji_ext_enabled: true,
      moji_ext_pack: 'mechanical',
      moji_ext_volume: 0.65
    });
  }
});
