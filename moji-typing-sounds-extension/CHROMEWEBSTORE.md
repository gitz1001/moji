# Chrome Web Store Listing — Moji Typing Sounds

> Last Updated: 2026-10-28

## Store Listing

**Extension Name** [REQUIRED]
Moji Typing Sounds

**Short Description** [REQUIRED]
ASMR typing sounds on every website. 10 synthesized sound packs. Zero-latency, works offline.

**Detailed Description** [REQUIRED]
Moji Typing Sounds plays satisfying ASMR keystroke sounds every time you type — on any website, in any text field. All sounds are synthesized in real-time using the Web Audio API, so there are no audio files to download and zero latency.

FEATURES
— 10 unique sound packs: Mechanical, Cute, Silent Rhythm, Arcade, Nature, Coach, Typewriter, Thock, Bubble, and Laser
— Stereo panning: each key is spatially positioned across the keyboard for an immersive experience
— Adjustable volume slider (0–100%)
— Built-in Practice Mode with WPM tracking, accuracy stats, and multiple test modes (words, sentences, code, numbers, symbols)
— One-click enable/disable toggle
— Test Sound button to preview packs instantly
— Works entirely offline — no servers, no network calls
— Lightweight: no audio files bundled, all sounds generated in real-time

HOW TO USE
1. Install the extension and click the Moji icon in your toolbar
2. Toggle sounds on/off with the switch at the top
3. Choose your favorite sound pack from the grid
4. Adjust volume with the slider
5. Click "Test Sound" to preview your selection
6. Start typing on any website — you'll hear sounds on every keystroke
7. Try Practice Mode to improve your typing speed and accuracy

PRIVACY
Moji Typing Sounds stores only your preferences (enabled state, selected pack, volume level) using Chrome's built-in sync storage. No personal data is collected, no browsing history is tracked, and no data is sent to external servers. Your preferences sync across your Chrome devices via your Google account.

CREDITS
Built with ❤️ by Edgar • https://edgarr.dev

SUPPORT
Report issues or request features at: https://github.com/gitz1001/moji/issues

**Category** [REQUIRED]
Fun

**Single Purpose** [REQUIRED]
Plays synthesized ASMR typing sounds on every keystroke across all websites.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |

### Screenshot Notes
1. Screenshot 1: Show the popup with sound pack grid visible and "Mechanical" selected, volume at 65%
2. Screenshot 2: Show Practice Mode in action with live WPM/Accuracy stats
3. Screenshot 3: Show the extension icon in the toolbar with the popup open on a real website (e.g., Google Docs)


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Saves the user's preferences (enabled/disabled state, selected sound pack, volume level) so settings persist across browser sessions and sync across devices via the user's Google account. |
| `<all_urls>` (content_scripts matches) | content_scripts | The extension's core function is playing typing sounds on every website. The content script must be injected into all pages to detect keystrokes in text fields and trigger audio playback. No page content is read or modified — the script only listens for keydown events. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | No | No | — | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | No | No | — | No |
| Website content | No | No | — | No |

**Note:** `chrome.storage.sync` is used to store user preferences (enabled state, sound pack name, volume level). This data is synced via Google's infrastructure as part of Chrome's built-in sync mechanism. Only three key-value pairs are stored — no personal or sensitive data.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [REQUIRED]
<!-- TODO: Host at https://gitz1001.github.io/moji/privacy-policy or similar -->


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
<!-- TODO: Fill in your developer/publisher name -->

**Contact Email** [REQUIRED]
<!-- TODO: Fill in a monitored email address -->

**Support URL / Email** [RECOMMENDED]
https://github.com/gitz1001/moji/issues

**Homepage URL** [RECOMMENDED]
https://edgarr.dev


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.2.1 | 2026-10-28 | Security & Privacy hardening: zero raw key DOM dispatch, password & sensitive field muting, removed external Google Fonts for 100% offline popup, use_dynamic_url anti-fingerprinting, cached audio noise buffer, full ARIA accessible controls. | Ready for Submission |
| 1.2.0 | 2026-10-28 | 10 synthesized sound packs, practice mode, volume control. | Draft |


## Review Notes

### Security & Privacy Guarantees
- Zero keystrokes stored or transmitted: Audio events carry only local stereo pan float and sound category.
- Password protection: Automatically silences and ignores `input[type="password"]`, credential, and financial input fields.
- 100% offline: All audio is procedurally synthesized with Web Audio API. Zero external scripts, fonts, or network requests.

### Known Limitations
- Extension cannot play sounds on `chrome://` pages, `chrome-extension://` pages, or the Chrome Web Store itself (Chrome security restriction, not a bug). Refreshing open tabs is required after initial install.

### Rejection History
<!-- None yet -->
