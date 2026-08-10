/**
 * Per-event "Moments" galleries — the media shown on each event's
 * Drift Wall page (opened from the Schedule of Events timeline).
 *
 * SAMPLE DATA: images come from picsum.photos (seeded per event so every
 * event gets its own distinct set) and videos from Google's public
 * sample-video bucket. Swap `src`/`poster` for real event media later —
 * the shape stays the same.
 */

export type MomentMedia = {
  type: "image" | "video";
  /** Full-size media shown in the viewer dialog. */
  src: string;
  /** Thumbnail poster — required for videos, shown on the wall. */
  poster?: string;
  alt: string;
};

export interface EventMoments {
  slug: string;
  kicker: string;
  title: string;
  date: string;
  lead: string;
  media: MomentMedia[];
}

/** 10 public sample clips (all verified reachable without auth). */
const SAMPLE_VIDEOS = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",
  "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4",
  "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4",
] as const;

/**
 * Build one event's gallery: 20 seeded sample images + 10 sample videos,
 * interleaved 2:1 so videos are spread evenly across the grid.
 * `videoOffset` rotates the clip order so events don't mirror each other.
 */
function buildMedia(slug: string, eventTitle: string, videoOffset: number): MomentMedia[] {
  const images: MomentMedia[] = Array.from({ length: 20 }, (_, i) => ({
    type: "image",
    src: `https://picsum.photos/seed/sss-${slug}-${i + 1}/960/720`,
    alt: `${eventTitle} — photo ${i + 1}`,
  }));

  const videos: MomentMedia[] = Array.from({ length: 10 }, (_, i) => ({
    type: "video",
    src: SAMPLE_VIDEOS[(i + videoOffset) % SAMPLE_VIDEOS.length],
    poster: `https://picsum.photos/seed/sss-${slug}-vid-${i + 1}/960/720`,
    alt: `${eventTitle} — video ${i + 1}`,
  }));

  // photo, photo, video, photo, photo, video, ...
  const mixed: MomentMedia[] = [];
  for (let i = 0; i < 10; i++) {
    mixed.push(images[i * 2], images[i * 2 + 1], videos[i]);
  }
  return mixed;
}

export const eventMoments: Record<string, EventMoments> = {
  "logo-launch": {
    slug: "logo-launch",
    kicker: "Moments · 12 Jul 2026",
    title: "Official Logo Launch",
    date: "12 · 07 · 2026 — Salem",
    lead: "Actor Karthi unveils the crest that carries the city — every frame from launch night.",
    media: buildMedia("logo-launch", "Official Logo Launch", 0),
  },
  "player-auction": {
    slug: "player-auction",
    kicker: "Moments · 04 Aug 2026",
    title: "TNPPL Player Auction",
    date: "04 · 08 · 2026 — Chennai",
    lead: "Paddle up, hands raised — the night the Smashers squad took shape, pick by pick.",
    media: buildMedia("player-auction", "TNPPL Player Auction", 5),
  },
};

/** Every event's media zipped together — the "view all" gallery opened
 *  from the Moments section. */
function zipAll(): MomentMedia[] {
  const lists = Object.values(eventMoments).map((e) => e.media);
  const longest = Math.max(...lists.map((l) => l.length));
  const mixed: MomentMedia[] = [];
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (list[i]) mixed.push(list[i]);
  }
  return mixed;
}

eventMoments.all = {
  slug: "all",
  kicker: "Moments · Road to Season 2",
  title: "All Moments",
  date: "Season 2 · 2026",
  lead: "Launch night to auction night — every photo and clip from the road to Season 2, in one place.",
  media: zipAll(),
};
