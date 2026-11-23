#!/usr/bin/env node
/**
 * Fetches Northern Beaches CRC's public YouTube channel RSS feed (no API key
 * or channel login required) and writes data/sermons.json for static builds
 * and fallback rendering.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHANNEL_ID = 'UCHANK81tcUfJrLC3d3hID1g';
const CHANNEL_URL = 'https://www.youtube.com/@northernbeacheschristianre4875';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const MAX_ITEMS = 12;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.resolve(__dirname, '..', 'data', 'sermons.json');

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function formatSydneyDate(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney'
  }).format(d);
}

const MONTHS = {
  jan: 'January', january: 'January',
  feb: 'February', february: 'February',
  mar: 'March', march: 'March',
  apr: 'April', april: 'April',
  may: 'May',
  jun: 'June', june: 'June',
  jul: 'July', july: 'July',
  aug: 'August', august: 'August',
  sep: 'September', sept: 'September', september: 'September',
  oct: 'October', october: 'October',
  nov: 'November', november: 'November',
  dec: 'December', december: 'December'
};

function resolveServiceDate(cleanRawTitle, publishedIso) {
  const m = cleanRawTitle.match(/\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+(\d{4}))?\b/i);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthName = MONTHS[m[2].toLowerCase()];
    const pubDate = new Date(publishedIso);
    const fallbackYear = Number.isNaN(pubDate.getTime()) ? new Date().getFullYear() : pubDate.getUTCFullYear();
    const year = m[3] || String(fallbackYear);
    if (monthName && day >= 1 && day <= 31) {
      return `${day} ${monthName} ${year}`;
    }
  }
  return formatSydneyDate(publishedIso);
}

function parseSermonTitle(rawTitle) {
  const cleanRaw = decodeEntities(rawTitle).replace(/\s+/g, ' ').trim();

  // If the entire YouTube title is just a date/service label (e.g. "Sunday 18 October" or "4 Oct 2026")
  const dateOnlyRe = /^(?:(?:Worship\s+Service|Sunday\s+Service|Service|Sunday)\s+)?\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?$/i;
  if (dateOnlyRe.test(cleanRaw)) {
    return {
      title: 'Sunday Worship Service',
      subtitle: 'Morning Worship at 58 Fisher Road',
      rawTitle: cleanRaw
    };
  }

  // Strip leading service + date prefix when actual sermon info follows
  let body = cleanRaw
    .replace(/^(?:Worship\s+Service|Sunday\s+Service|Service|Sunday)\s+\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?\s*[-–:]\s*/i, '')
    .replace(/^\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?\s*[-–:]\s*/i, '')
    .trim();

  let parts = body
    .split(/\s+[-–]\s+/)
    .map((p) => p.replace(/^Sermon\s*:\s*/i, '').trim())
    .filter((p) => p && !/^Sermon(?:\s+Series)?$/i.test(p));

  if (parts.length === 0) {
    parts = [cleanRaw];
  }

  let occasion = '';
  if (parts.length > 1 && /^(?:Baptism|Communion|Good\s+Friday|Christmas(?:\s+Day)?|Easter|Thanksgiving)\s+Service$/i.test(parts[0])) {
    occasion = parts.shift();
  }

  const meta = [];
  const scriptureRe = /(?:\d\s+)?[A-Z][a-z]{1,14}\s+\d{1,3}\s*:\s*\d{1,3}/;
  const speakerRe = /^(?:[A-Z]\.?\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+)$/;

  // Peel trailing speaker or Bible passage into subtitle metadata when a title remains
  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (scriptureRe.test(last) || speakerRe.test(last)) {
      meta.unshift(parts.pop());
    } else {
      break;
    }
  }

  const subtitleParts = [occasion, ...meta].filter(Boolean);
  return {
    title: parts.join(' — '),
    subtitle: subtitleParts.join(' · '),
    rawTitle: cleanRaw
  };
}

function buildExcerpt(rawDesc, cleanRawTitle) {
  const normalized = decodeEntities(rawDesc).replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.toLowerCase() === cleanRawTitle.toLowerCase()) {
    return 'Sunday morning worship service at Northern Beaches Christian Reformed Church in Dee Why.';
  }
  const maxLen = 175;
  if (normalized.length <= maxLen) return normalized;
  const cut = normalized.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function parseFeedXml(xmlText) {
  const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entryMatches
    .map((entryXml) => {
      const pick = (tag) => {
        const m = entryXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return m ? m[1].trim() : '';
      };

      const youtubeId = pick('yt:videoId');
      const published = pick('published');
      const rawTitle = pick('title');
      const rawDescription = pick('media:description');

      const parsed = parseSermonTitle(rawTitle);
      if (!youtubeId || /^test(?:\s+[a-z0-9]{1,3})?$/i.test(parsed.rawTitle)) {
        return null;
      }

      const displayDate = resolveServiceDate(parsed.rawTitle, published);
      const summary = buildExcerpt(rawDescription, parsed.rawTitle);

      return {
        youtubeId,
        published,
        displayDate,
        title: parsed.title,
        subtitle: parsed.subtitle,
        rawTitle: parsed.rawTitle,
        summary,
        url: `https://www.youtube.com/watch?v=${youtubeId}`
      };
    })
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

async function main() {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'NBCRC-Website-Sync/1.0' }
  });
  if (!res.ok) {
    throw new Error(`YouTube RSS fetch failed with HTTP ${res.status}`);
  }
  const xmlText = await res.text();
  const sermons = parseFeedXml(xmlText);
  if (sermons.length === 0) {
    throw new Error('Parsed 0 sermons from YouTube RSS feed.');
  }

  const payload = {
    channelId: CHANNEL_ID,
    channelUrl: CHANNEL_URL,
    feedUrl: FEED_URL,
    updatedAt: new Date().toISOString(),
    sermons
  };

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Synced ${sermons.length} sermons to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
