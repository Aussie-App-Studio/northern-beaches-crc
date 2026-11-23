(function () {
  'use strict';

  var CHANNEL_ID = 'UCHANK81tcUfJrLC3d3hID1g';
  var CHANNEL_VIDEOS_URL = 'https://www.youtube.com/@northernbeacheschristianre4875/videos';
  var FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;
  var LIVE_URL = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED_URL);
  var CACHE_KEY = 'nbcrc-sermons-live-v1';
  var CACHE_MS = 15 * 60 * 1000;

  var featuredEl = document.getElementById('featured-sermon');
  var gridEl = document.getElementById('sermons-grid');
  var homeFeaturedEl = document.getElementById('home-featured-sermon');
  var homeRecentEl = document.getElementById('home-recent-sermons');
  if (!featuredEl && !gridEl && !homeFeaturedEl && !homeRecentEl) return;

  /* ---------- helpers ---------- */
  function decode(str) {
    var t = document.createElement('textarea');
    t.innerHTML = str || '';
    return t.value;
  }
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var MONTHS = { jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December' };

  function serviceDate(rawTitle, published) {
    var m = rawTitle.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+(\d{4}))?\b/i);
    var pub = new Date(published);
    if (m) {
      var yr = m[3] || (isNaN(pub) ? new Date().getFullYear() : pub.getUTCFullYear());
      return parseInt(m[1], 10) + ' ' + MONTHS[m[2].toLowerCase()] + ' ' + yr;
    }
    if (isNaN(pub)) return '';
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' }).format(pub);
  }

  function parseTitle(rawTitle) {
    var raw = decode(rawTitle).replace(/\s+/g, ' ').trim();
    var dateOnly = /^(?:(?:Worship\s+Service|Sunday\s+Service|Service|Sunday)\s+)?\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?$/i;
    if (dateOnly.test(raw)) {
      return { title: 'Sunday Worship Service', subtitle: 'Morning Worship at 58 Fisher Road', raw: raw };
    }
    var body = raw
      .replace(/^(?:Worship\s+Service|Sunday\s+Service|Service|Sunday)\s+\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?\s*[-–:]\s*/i, '')
      .replace(/^\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?\s*[-–:]\s*/i, '');
    var parts = body.split(/\s+[-–]\s+/).map(function (p) { return p.replace(/^Sermon\s*:\s*/i, '').trim(); })
      .filter(function (p) { return p && !/^Sermon(?:\s+Series)?$/i.test(p); });
    if (!parts.length) parts = [raw];
    var occasion = '';
    if (parts.length > 1 && /^(?:Baptism|Communion|Good\s+Friday|Christmas(?:\s+Day)?|Easter|Thanksgiving)\s+Service$/i.test(parts[0])) {
      occasion = parts.shift();
    }
    var meta = [];
    var scripture = /(?:\d\s+)?[A-Z][a-z]{1,14}\s+\d{1,3}\s*:\s*\d{1,3}/;
    var speaker = /^(?:[A-Z]\.?\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+)$/;
    while (parts.length > 1) {
      var last = parts[parts.length - 1];
      if (scripture.test(last) || speaker.test(last)) meta.unshift(parts.pop()); else break;
    }
    return { title: parts.join(' — '), subtitle: [occasion].concat(meta).filter(Boolean).join(' · '), raw: raw };
  }

  function excerpt(desc, raw) {
    var n = decode(desc).replace(/\s+/g, ' ').trim();
    if (!n || n.toLowerCase() === raw.toLowerCase()) return 'Sunday morning worship service at Northern Beaches Christian Reformed Church in Dee Why.';
    if (n.length <= 175) return n;
    var cut = n.slice(0, 175), sp = cut.lastIndexOf(' ');
    return (sp > 100 ? cut.slice(0, sp) : cut).trim() + '…';
  }

  function fromLive(items) {
    return items.map(function (it) {
      var id = String(it.guid || '').replace(/^yt:video:/, '');
      var p = parseTitle(it.title);
      if (!id || /^test(?:\s+[a-z0-9]{1,3})?$/i.test(p.raw)) return null;
      var published = String(it.pubDate || '').replace(' ', 'T') + 'Z';
      return {
        youtubeId: id,
        displayDate: serviceDate(p.raw, published),
        title: p.title,
        subtitle: p.subtitle,
        summary: excerpt(it.description || '', p.raw)
      };
    }).filter(Boolean);
  }

  /* ---------- rendering ---------- */
  var PLAY = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>';

  function facade(s, label) {
    return '<div class="video-facade" role="button" tabindex="0" data-youtube-id="' + esc(s.youtubeId) + '" data-title="' + esc(s.title) + '" aria-label="Play sermon: ' + esc(s.title) + '">' +
      '<img class="video-thumb" src="https://i.ytimg.com/vi/' + esc(s.youtubeId) + '/hqdefault.jpg" alt="Thumbnail for ' + esc(s.title) + '" width="480" height="360" loading="lazy">' +
      '<div class="video-overlay"><span class="video-play-btn" aria-hidden="true">' + PLAY + '</span><span class="video-play-label">' + esc(label) + '</span></div></div>';
  }

  function featuredHtml(s) {
    return facade(s, 'Watch Latest Service') +
      '<div><span class="card-badge">Latest Service &middot; ' + esc(s.displayDate) + '</span>' +
      '<h2 style="margin-top:0.7rem;font-size:1.9rem;">' + esc(s.title) + '</h2>' +
      (s.subtitle ? '<p style="font-weight:600;color:var(--navy-900);margin-bottom:0.5rem;">' + esc(s.subtitle) + '</p>' : '') +
      '<p>' + esc(s.summary) + '</p>' +
      '<div class="btn-group" style="margin-top:1rem;"><a class="btn btn-outline btn-sm" href="https://www.youtube.com/watch?v=' + esc(s.youtubeId) + '" target="_blank" rel="noopener noreferrer">Open on YouTube</a></div></div>';
  }

  function cardHtml(s) {
    return '<article class="sermon-card">' + facade(s, 'Watch Service') +
      '<div class="sermon-body"><div class="sermon-meta"><span>' + esc(s.displayDate) + '</span></div>' +
      '<h3>' + esc(s.title) + '</h3>' +
      (s.subtitle ? '<p style="font-weight:600;color:var(--navy-900);font-size:0.9rem;margin:0;">' + esc(s.subtitle) + '</p>' : '') +
      '<p style="font-size:0.92rem;">' + esc(s.summary) + '</p></div></article>';
  }

  function archiveHtml() {
    return '<article class="sermon-archive-card"><h3>Looking for Older Sermons?</h3>' +
      '<p>Our full sermon archive lives on YouTube. Open our channel and use the search box there to find a Bible passage, topic or date.</p>' +
      '<a class="btn btn-primary btn-sm" href="' + CHANNEL_VIDEOS_URL + '" target="_blank" rel="noopener noreferrer">Browse &amp; Search on YouTube</a></article>';
  }

  function setIfIdle(el, html) {
    if (!el || el.querySelector('[data-mounted="true"]')) return;
    el.innerHTML = html;
  }

  function render(list) {
    if (!list || !list.length) return;
    var key = list.slice(0, 6).map(function (s) { return s.youtubeId; }).join(',');
    if (render.last === key) return;
    render.last = key;
    setIfIdle(featuredEl, featuredHtml(list[0]));
    setIfIdle(gridEl, list.slice(1, 6).map(cardHtml).join('') + archiveHtml());
    setIfIdle(homeFeaturedEl, featuredHtml(list[0]));
    setIfIdle(homeRecentEl, list.slice(1, 4).map(cardHtml).join(''));
  }

  /* ---------- data: static baseline, then live check ---------- */
  function liveCheck() {
    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_MS) { render(cached.list); return; }
    } catch (e) { /* ignore */ }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 4000) : null;
    fetch(LIVE_URL, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || j.status !== 'ok' || !j.items) return;
        var list = fromLive(j.items);
        if (!list.length) return;
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), list: list })); } catch (e) { /* ignore */ }
        render(list);
      })
      .catch(function () { /* offline or rate-limited: keep baseline */ })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  fetch('data/sermons.json')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.sermons) render(d.sermons); })
    .catch(function () { /* keep static markup */ })
    .then(liveCheck);
})();
