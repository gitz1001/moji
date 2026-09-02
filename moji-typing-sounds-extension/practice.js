/**
 * Moji Practice Engine — Typing test inside the popup.
 * Tracks WPM, accuracy, consistency. Privacy-first: never stores typed text.
 */
(function() {
  'use strict';

  // ─── Word Lists ──────────────────────────────────────────────
  var WORDS = {
    common: 'the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us'.split(' '),
    medium: 'between change point place problem different important world help through government system hand high begin small number again seem might large ask group need help turn start show learn every change state begin move work national give life thought day each tell place program try leave want point call system small come different hand last school which never begin large number'.split(' '),
    code: 'function return const let var if else for while do switch case break continue class extends import export default async await try catch throw new this super yield delete typeof instanceof void true false null undefined console log error warn map filter reduce forEach find some every includes push pop shift'.split(' '),
    numbers: '0 1 2 3 4 5 6 7 8 9 10 20 30 40 50 60 70 80 90 100 123 456 789 1000 2024 3141 2718 1618 42 7 13 21 34 55 89 144 233 377 610 987'.split(' '),
    symbols: '( ) { } [ ] < > ; : , . ! ? @ # $ % ^ & * + = - _ / \\ | ~ ` " \' => -> :: && || == != <= >= += -= *= /='.split(' ')
  };

  var SENTENCES = [
    'the quick brown fox jumps over the lazy dog',
    'pack my box with five dozen liquor jugs',
    'how vexingly quick daft zebras jump',
    'the five boxing wizards jump quickly',
    'sphinx of black quartz judge my vow',
    'two driven jocks help fax my big quiz',
    'a quick movement of the enemy will jeopardize five gunboats',
    'we promptly judged antique ivory buckles for the next prize',
    'crazy frederick bought many very exquisite opal jewels',
    'sixty zippers were quickly picked from the woven jute bag',
    'the job requires extra pluck and zeal from every young wage earner',
    'jaded zombies acted quaintly but kept driving their oxen forward',
    'all questions asked by five watched experts amaze the judge',
    'jack quietly moved up front and seized the big ball of wax'
  ];

  // ─── State ───────────────────────────────────────────────────
  var state = {
    active: false,
    mode: 'words',       // words, sentences, code, numbers, symbols
    duration: 30,        // seconds
    targetWords: [],
    currentWordIdx: 0,
    currentInput: '',
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    startTime: 0,
    elapsed: 0,
    timer: null,
    keyIntervals: [],
    lastKeyTime: 0,
    results: null
  };

  // ─── Generate Text ───────────────────────────────────────────
  function generateWords(mode, count) {
    if (mode === 'sentences') {
      var shuffled = SENTENCES.slice().sort(function() { return Math.random() - 0.5; });
      var text = shuffled.slice(0, 4).join(' ');
      return text.split(' ');
    }
    var pool = WORDS[mode] || WORDS.common;
    var words = [];
    for (var i = 0; i < count; i++) {
      words.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return words;
  }

  // ─── Render ──────────────────────────────────────────────────
  function renderTarget() {
    var container = document.getElementById('practice-text');
    if (!container) return;
    container.innerHTML = '';

    var visibleStart = Math.max(0, state.currentWordIdx - 2);
    var visibleEnd = Math.min(state.targetWords.length, visibleStart + 20);

    for (var i = visibleStart; i < visibleEnd; i++) {
      var wordEl = document.createElement('span');
      wordEl.className = 'p-word';
      if (i < state.currentWordIdx) wordEl.classList.add('p-word--done');
      if (i === state.currentWordIdx) wordEl.classList.add('p-word--active');

      var word = state.targetWords[i];
      if (i === state.currentWordIdx) {
        for (var c = 0; c < word.length; c++) {
          var charEl = document.createElement('span');
          charEl.className = 'p-char';
          charEl.textContent = word[c];
          if (c < state.currentInput.length) {
            charEl.classList.add(state.currentInput[c] === word[c] ? 'p-char--correct' : 'p-char--wrong');
          } else if (c === state.currentInput.length) {
            charEl.classList.add('p-char--cursor');
          }
          wordEl.appendChild(charEl);
        }
        // Extra chars typed beyond word length
        for (var x = word.length; x < state.currentInput.length; x++) {
          var extraEl = document.createElement('span');
          extraEl.className = 'p-char p-char--extra';
          extraEl.textContent = state.currentInput[x];
          wordEl.appendChild(extraEl);
        }
      } else {
        wordEl.textContent = word;
      }
      container.appendChild(wordEl);

      if (i < visibleEnd - 1) {
        var spaceEl = document.createElement('span');
        spaceEl.className = 'p-space';
        spaceEl.textContent = ' ';
        container.appendChild(spaceEl);
      }
    }
  }

  function renderStats() {
    var wpmEl = document.getElementById('p-wpm');
    var accEl = document.getElementById('p-acc');
    var timeEl = document.getElementById('p-time');
    if (!wpmEl) return;

    var elapsed = state.elapsed || 0;
    var minutes = elapsed / 60;
    var wpm = minutes > 0 ? Math.round((state.correctChars / 5) / minutes) : 0;
    var acc = state.totalChars > 0 ? Math.round((state.correctChars / state.totalChars) * 100) : 100;
    var remaining = Math.max(0, state.duration - elapsed);
    var min = Math.floor(remaining / 60);
    var sec = Math.floor(remaining % 60);

    wpmEl.textContent = wpm;
    accEl.textContent = acc + '%';
    timeEl.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;

    // Progress bar
    var bar = document.getElementById('p-progress');
    if (bar) bar.style.width = ((elapsed / state.duration) * 100) + '%';
  }

  function renderResults() {
    var el = document.getElementById('practice-results');
    var textEl = document.getElementById('practice-text-wrap');
    if (!el || !textEl) return;

    textEl.style.display = 'none';
    el.style.display = 'flex';

    var r = state.results;
    document.getElementById('r-wpm').textContent = r.wpm;
    document.getElementById('r-acc').textContent = r.accuracy + '%';
    document.getElementById('r-chars').textContent = r.correctChars + '/' + r.totalChars;
    document.getElementById('r-consistency').textContent = r.consistency + '%';
  }

  // ─── Timer ───────────────────────────────────────────────────
  function tick() {
    if (!state.active) return;
    state.elapsed = (Date.now() - state.startTime) / 1000;
    renderStats();
    if (state.elapsed >= state.duration) {
      finish();
    }
  }

  // ─── Start / Stop / Finish ───────────────────────────────────
  function start() {
    state.active = true;
    state.targetWords = generateWords(state.mode, 80);
    state.currentWordIdx = 0;
    state.currentInput = '';
    state.correctChars = 0;
    state.totalChars = 0;
    state.errors = 0;
    state.startTime = Date.now();
    state.elapsed = 0;
    state.keyIntervals = [];
    state.lastKeyTime = 0;
    state.results = null;

    var el = document.getElementById('practice-results');
    var textEl = document.getElementById('practice-text-wrap');
    if (el) el.style.display = 'none';
    if (textEl) textEl.style.display = 'block';

    var startBtn = document.getElementById('p-start');
    if (startBtn) { startBtn.textContent = 'Restart'; startBtn.classList.add('active'); }

    state.timer = setInterval(tick, 100);
    renderTarget();
    renderStats();

    // Focus the hidden input
    var input = document.getElementById('p-input');
    if (input) { input.value = ''; input.focus(); }
  }

  function finish() {
    state.active = false;
    if (state.timer) { clearInterval(state.timer); state.timer = null; }

    var minutes = state.elapsed / 60;
    var wpm = minutes > 0 ? Math.round((state.correctChars / 5) / minutes) : 0;
    var acc = state.totalChars > 0 ? Math.round((state.correctChars / state.totalChars) * 100) : 100;

    // Consistency from key intervals
    var consistency = 100;
    if (state.keyIntervals.length > 2) {
      var avg = state.keyIntervals.reduce(function(a,b){return a+b;},0) / state.keyIntervals.length;
      var variance = state.keyIntervals.reduce(function(a,b){return a + Math.pow(b-avg,2);},0) / state.keyIntervals.length;
      var stddev = Math.sqrt(variance);
      var cv = avg > 0 ? stddev / avg : 1;
      consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    }

    state.results = { wpm: wpm, accuracy: acc, correctChars: state.correctChars, totalChars: state.totalChars, consistency: consistency, duration: state.duration, mode: state.mode };

    var startBtn = document.getElementById('p-start');
    if (startBtn) { startBtn.textContent = 'Try Again'; startBtn.classList.remove('active'); }

    renderResults();
    saveResult(state.results);
  }

  // ─── Save Results (local only) ──────────────────────────────
  function saveResult(r) {
    try {
      chrome.storage.local.get({ moji_practice_history: [] }, function(data) {
        var history = data.moji_practice_history || [];
        history.push({ date: Date.now(), wpm: r.wpm, accuracy: r.accuracy, consistency: r.consistency, duration: r.duration, mode: r.mode });
        if (history.length > 100) history = history.slice(-100);
        chrome.storage.local.set({ moji_practice_history: history });
      });
    } catch(e) {}
  }

  // ─── Input Handler ───────────────────────────────────────────
  function handleInput(e) {
    if (!state.active) return;

    var input = e.target;
    var val = input.value;

    // Track key intervals
    var now = Date.now();
    if (state.lastKeyTime > 0) {
      var interval = now - state.lastKeyTime;
      if (interval < 2000) state.keyIntervals.push(interval);
    }
    state.lastKeyTime = now;

    // Check for space (word complete)
    if (val.endsWith(' ')) {
      var typed = val.trim();
      var target = state.targetWords[state.currentWordIdx];

      // Count chars
      state.totalChars += target.length;
      for (var i = 0; i < target.length; i++) {
        if (i < typed.length && typed[i] === target[i]) state.correctChars++;
      }

      state.currentWordIdx++;
      state.currentInput = '';
      input.value = '';

      if (state.currentWordIdx >= state.targetWords.length) {
        finish();
        return;
      }
    } else {
      state.currentInput = val;
    }

    renderTarget();
  }

  // ─── Public API ──────────────────────────────────────────────
  window.MojiPractice = {
    start: start,
    finish: finish,
    setMode: function(mode) { state.mode = mode; },
    setDuration: function(dur) { state.duration = dur; },
    handleInput: handleInput,
    getState: function() { return state; }
  };
})();
