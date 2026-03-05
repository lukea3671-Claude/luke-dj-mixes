import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://mixes.lukeanderson.au';
const AUDIO_BASE = SITE_URL + '/audio';

// Parse duration strings like "3h 45m", "51m 36s", "1h 23m 45s" to seconds
function parseDuration(d: string): number {
  let secs = 0;
  const h = d.match(/(\d+)h/);
  const m = d.match(/(\d+)m/);
  const s = d.match(/(\d+)s/);
  if (h) secs += parseInt(h[1]) * 3600;
  if (m) secs += parseInt(m[1]) * 60;
  if (s) secs += parseInt(s[1]);
  return secs;
}

// Format seconds to HH:MM:SS for iTunes
function formatItunesDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Parse "September 2018" to RFC 2822 date
function parseDate(d: string): string {
  const months: Record<string, string> = {
    'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
    'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
    'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec',
  };
  // Handle "February 2023 (2)" → "February 2023"
  const clean = d.replace(/\s*\(\d+\)/, '');
  const parts = clean.split(' ');
  const month = months[parts[0]] || 'Jan';
  const year = parts[1] || '2024';
  return `01 ${month} ${year} 00:00:00 +0000`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const mixes = await getCollection('mixes');
  const sorted = mixes.sort((a, b) => b.data.mixNumber - a.data.mixNumber); // newest first

  const items = sorted.map((mix) => {
    const d = mix.data;
    const slug = mix.id.replace(/\.md$/, '');
    const secs = parseDuration(d.duration);
    const sizeBytes = Math.round(d.fileSizeMb * 1024 * 1024);
    const genres = d.genres.slice(0, 3).map((g: { name: string }) => g.name).join(', ');
    const description = `${d.duration} DJ mix — ${d.trackCount} tracks across ${genres}. ${d.bpm} BPM, key of ${d.musicalKey}. Free streaming with AI-generated liner notes at ${SITE_URL}/mix/${slug}`;

    return `    <item>
      <title>${escapeXml(d.title)}</title>
      <link>${SITE_URL}/mix/${slug}</link>
      <guid isPermaLink="true">${SITE_URL}/mix/${slug}</guid>
      <pubDate>${parseDate(d.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      <enclosure url="${AUDIO_BASE}/${slug}.mp3" length="${sizeBytes}" type="audio/mpeg" />
      <itunes:duration>${formatItunesDuration(secs)}</itunes:duration>
      <itunes:episode>${d.mixNumber}</itunes:episode>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Luke's Mixes</title>
    <link>${SITE_URL}</link>
    <description>DJ mixes spanning 2018-2025. Dance, house, electronic, and everything in between. Free streaming with AI-generated liner notes.</description>
    <language>en-au</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <itunes:author>Luke Anderson</itunes:author>
    <itunes:owner>
      <itunes:name>Luke Anderson</itunes:name>
    </itunes:owner>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Music" />
    <itunes:category text="Leisure">
      <itunes:category text="Music" />
    </itunes:category>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
