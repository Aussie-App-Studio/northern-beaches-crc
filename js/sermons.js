(function () {
  'use strict';

  const SERMONS = [
    {
      date: '2026-11-08',
      displayDate: '8 November 2026',
      title: 'Love of the Word',
      scripture: 'Luke 24:13-27',
      series: 'The 5 Loves',
      speaker: 'Pastor Ben Peletier',
      youtubeId: 'uGTuR4CsQqY',
      note: 'Morning worship service exploring how all of Scripture points to Jesus Christ.'
    },
    {
      date: '2026-11-01',
      displayDate: '1 November 2026',
      title: 'The Love of God (Week 1)',
      scripture: '1 John 4:7-21',
      series: 'The 5 Loves',
      speaker: 'Pastor Ben Peletier',
      youtubeId: '4LoqQi1sxIg',
      note: 'Opening message in The 5 Loves series — grounding the life of the church in God’s love.'
    },
    {
      date: '2026-10-25',
      displayDate: '25 October 2026',
      title: 'Sunday Worship Service — 25 October 2026',
      scripture: '',
      series: 'Sunday Services',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'O-EZ7FzASzU',
      note: 'Full Sunday morning worship gathering at 58 Fisher Road, Dee Why.'
    },
    {
      date: '2026-10-18',
      displayDate: '18 October 2026',
      title: 'Sunday Worship Service — 18 October 2026',
      scripture: '',
      series: 'Sunday Services',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'VJdwKPJRLYI',
      note: 'Full Sunday morning worship gathering at 58 Fisher Road, Dee Why.'
    },
    {
      date: '2026-10-11',
      displayDate: '11 October 2026',
      title: 'Faithful, Not Compromising',
      scripture: 'Revelation 2:12-17',
      series: 'Sunday Services',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'VLvdJm-W0M0',
      note: 'Encouragement to hold fast to Christ’s name and truth without compromise.'
    },
    {
      date: '2026-10-04',
      displayDate: '4 October 2026',
      title: "The Gospel Ain't No Snake Oil",
      scripture: '',
      series: 'Questions & Topics',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'ePpe8CHpgKw',
      note: 'Addressing real questions about the truth and integrity of the Christian gospel.'
    },
    {
      date: '2026-09-27',
      displayDate: '27 September 2026',
      title: 'What Does Israel Mean to Us Today?',
      scripture: '',
      series: 'Questions & Topics',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'ImoWycHFBjE',
      note: 'Exploring biblical theology on Israel and God’s promises in the gospel.'
    },
    {
      date: '2026-09-20',
      displayDate: '20 September 2026',
      title: 'Battle of the Sexes',
      scripture: 'Genesis 3:8-19 & Galatians 3:27-29',
      series: 'Questions & Topics',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'ZxPn2OQkdQ4',
      note: 'How the Fall broke human harmony and how Christ restores dignity and unity.'
    },
    {
      date: '2026-08-30',
      displayDate: '30 August 2026',
      title: 'The Hardest Part',
      scripture: 'Luke 18:18-30',
      series: 'Sunday Services',
      speaker: 'Northern Beaches CRC',
      youtubeId: 'CGxBUmohdaY',
      note: 'Jesus’ encounter with the rich ruler and what is possible only with God.'
    },
    {
      date: '2026-08-23',
      displayDate: '23 August 2026',
      title: "Living in Our New-Found Freedom",
      scripture: '',
      series: 'Sunday Services',
      speaker: 'K. Degan (Guest Speaker)',
      youtubeId: 'NANOfeKjpFo',
      note: 'What does it look like for God’s people to live in their new-found freedom?'
    },
    {
      date: '2026-08-09',
      displayDate: '9 August 2026',
      title: 'Pulling Your Hair Out',
      scripture: 'Nehemiah 13',
      series: 'Nehemiah',
      speaker: 'Northern Beaches CRC',
      youtubeId: '',
      transcriptUrl: 'assets/docs/nehemiah-13-transcript.pdf',
      note: 'Audio recording was unavailable for this service; the full readable sermon transcript PDF is available below.'
    }
  ];

  const grid = document.getElementById('sermons-grid');
  const searchInput = document.getElementById('sermon-search');
  const filterButtons = document.querySelectorAll('.filter-pill');
  const countEl = document.getElementById('sermon-count');
  const emptyState = document.getElementById('sermons-empty');
  const resetBtn = document.getElementById('reset-sermons');

  if (!grid) return;

  let activeSeries = 'All';
  let searchQuery = '';

  const renderSermons = () => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = SERMONS.filter((s) => {
      const matchesSeries = activeSeries === 'All' || s.series === activeSeries;
      if (!matchesSeries) return false;
      if (!q) return true;
      const haystack = `${s.title} ${s.scripture} ${s.series} ${s.speaker} ${s.displayDate} ${s.note}`.toLowerCase();
      return haystack.includes(q);
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${SERMONS.length} recent messages`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    grid.innerHTML = filtered
      .map((s) => {
        const mediaHtml = s.youtubeId
          ? `
            <div class="video-facade" role="button" tabindex="0" data-youtube-id="${s.youtubeId}" data-title="${escapeAttr(s.title)}" aria-label="Play sermon video: ${escapeAttr(s.title)}">
              <img class="video-thumb" src="https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg" alt="Video thumbnail for ${escapeAttr(s.title)}" loading="lazy" width="480" height="360">
              <div class="video-overlay">
                <span class="video-play-btn" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                </span>
                <span class="video-play-label">Watch Service</span>
              </div>
            </div>
          `
          : `
            <div class="sermon-placeholder">
              <span class="card-badge card-badge--amber">Transcript Available</span>
              <h4 style="color:#ffffff; margin:0.25rem 0 0;">${escapeHtml(s.title)}</h4>
              <p style="font-size:0.86rem; color:rgba(255,255,255,0.78); margin:0;">No audio recorded on this Sunday — read the full sermon transcript PDF.</p>
            </div>
          `;

        const actionHtml = s.transcriptUrl
          ? `<div class="card-footer"><a class="btn btn-outline btn-sm" href="${s.transcriptUrl}" target="_blank" rel="noopener noreferrer">Download Transcript (PDF)</a></div>`
          : `<div class="card-footer"><a class="text-link" href="https://www.youtube.com/watch?v=${s.youtubeId}" target="_blank" rel="noopener noreferrer">Open on YouTube</a></div>`;

        return `
          <article class="sermon-card">
            ${mediaHtml}
            <div class="sermon-body">
              <div class="sermon-meta">
                <span class="card-badge">${escapeHtml(s.series)}</span>
                <span>${escapeHtml(s.displayDate)}</span>
              </div>
              <h3 style="margin:0.25rem 0 0.15rem;">${escapeHtml(s.title)}</h3>
              ${s.scripture ? `<p style="font-weight:600; color:var(--navy-900); margin:0 0 0.35rem; font-size:0.93rem;">${escapeHtml(s.scripture)} &middot; ${escapeHtml(s.speaker)}</p>` : `<p style="font-weight:600; color:var(--navy-900); margin:0 0 0.35rem; font-size:0.93rem;">${escapeHtml(s.speaker)}</p>`}
              <p style="font-size:0.92rem; margin:0 0 0.5rem;">${escapeHtml(s.note)}</p>
              ${actionHtml}
            </div>
          </article>
        `;
      })
      .join('');
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      activeSeries = btn.dataset.series || 'All';
      renderSermons();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderSermons();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeSeries = 'All';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      filterButtons.forEach((b) => {
        const isAll = (b.dataset.series || '') === 'All';
        b.classList.toggle('is-active', isAll);
        b.setAttribute('aria-pressed', String(isAll));
      });
      renderSermons();
    });
  }

  renderSermons();

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
