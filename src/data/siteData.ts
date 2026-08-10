/**
 * Single source of truth for all Salem Super Smashers site content.
 * Copy preserved from the original sss.botify.in website.
 */

export const INSTAGRAM_URL =
  "https://www.instagram.com/salemsupersmashers?igsh=d2l6YmlhMGZpM3hn";

export const INSTAGRAM_HANDLE = "@salemsupersmashers";

export const site = {
  name: "Salem Super Smashers",
  shortName: "SSS",
  tagline: "Salem's own pickleball franchise — built by the city, for the city.",
  league: "TNPPL Season 2",
  leagueFull: "Tamil Nadu Pickleball Premier League",
  year: "2026",
  hashtag: "#SmashersAreHere",
  poweredBy: { label: "botify.in", url: "https://botify.in" },
} as const;

export const navLinks = [
  { label: "The League", href: "#tnppl" },
  { label: "The Crest", href: "#reveal" },
  { label: "The Identity", href: "#identity" },
  { label: "Events", href: "#events" },
] as const;

export const hero = {
  eyebrow: "You are cordially invited to join",
  titleLines: ["SALEM", "SUPER SMASHERS"],
  tagline:
    "Salem's own pickleball franchise — built by the city, for the city.",
  taglineCont:
    "Now entering the arena of TNPPL Season 2, Tamil Nadu's premier pickleball league.",
  chips: ["Est. 2026", "Salem · Tamil Nadu", "Pickleball", "TNPPL Season 2"],
  ticker:
    "SALEM SUPER SMASHERS ✦ TNPPL SEASON 2 ✦ PICKLEBALL ✦ FOLLOW @SALEMSUPERSMASHERS ✦ ",
  primaryCta: { label: "Follow us on Instagram", href: INSTAGRAM_URL },
  secondaryCta: { label: "Explore the Invite", href: "#tnppl" },
} as const;

export const liveStrip = {
  badge: "NOW IN THE LEAGUE",
  line: "TNPPL Season 2 · 2026 · Tamil Nadu Pickleball Premier League",
  hashtag: "#SmashersAreHere",
} as const;

export const tnppl = {
  kicker: "Our Upcoming League",
  title: "TNPPL Season 2",
  lead: "The Salem Super Smashers take the court in the Tamil Nadu Pickleball Premier League — and you're invited to follow every smash.",
  cardTitle: "Tamil Nadu Pickleball Premier League",
  cardBody:
    "India's only state-owned, franchise-based pickleball league — organised by the Tamil Nadu Pickleball Association and recognised by SDAT. Season 1 set the benchmark with 16 franchise teams, 160 players and a ₹7,00,000 prize pool. Season 2 is bigger — and Salem now has a team in the fight.",
  stats: [
    { value: 16, suffix: "", label: "Franchise Teams" },
    { value: 160, suffix: "", label: "Players" },
    { value: 7, prefix: "₹", suffix: "L", label: "S1 Prize Pool" },
    { value: 1, suffix: "L+", label: "Players in India" },
  ],
  keyItems: [
    { icon: "gavel", title: "Player Auction", detail: "4 August 2026" },
    { icon: "trophy", title: "Season 2 Tournament", detail: "17 – 20 September 2026" },
    { icon: "map-pin", title: "Venue", detail: "Express Avenue Mall, Central Atrium" },
  ],
} as const;

export const crestReveal = {
  kicker: "The Crest",
  title: "Relive the reveal",
  lead: "On 12 July 2026, our crest was unveiled to Salem. Tap to relive the moment.",
  unveiledBy: {
    label: "Unveiled by",
    name: "Actor Karthi",
    date: "12 · 07 · 2026",
  },
  unveilCta: "TAP TO UNVEIL",
  postTitleLines: ["THE CREST", "IS HERE."],
  postSub: "Twin paddles, one ball, and the hills we call home.",
  replayLabel: "Replay reveal",
} as const;

export const identity = {
  kicker: "The Identity",
  title: "Every mark has a meaning",
  lead: "The Smashers crest is built from four ideas that define who we are on and off the court.",
  items: [
    {
      no: "01",
      key: "paddles",
      title: "The Twin Paddles",
      body: "Two paddles crossed as one — doubles at heart. Partnership, trust, and the swing that answers every serve.",
    },
    {
      no: "02",
      key: "ball",
      title: "The Ball",
      body: "Front and centre, mid-flight. The next point is always the only point — and we play it to smash.",
    },
    {
      no: "03",
      key: "mountain",
      title: "The Mountain",
      body: "The hills of Salem rise beneath the paddles — our home ground, our grit, and the heights we climb for.",
    },
    {
      no: "04",
      key: "storm",
      title: "The 'S' Storm",
      body: "Look closer — the paddle faces rain tiny S's. Speed. Strength. Spirit. Salem. Stitched into every strike.",
    },
  ],
} as const;

export type IdentityItem = (typeof identity.items)[number];

export const events = {
  kicker: "Road to Season 2",
  title: "Schedule of Events",
  items: [
    {
      day: "12",
      month: "JUL",
      title: "Official Logo Launch",
      detail: "Crest unveiled by actor Karthi · Salem",
      tag: "Done ✓",
      status: "done" as const,
    },
    {
      day: "04",
      month: "AUG",
      title: "TNPPL Player Auction",
      detail: "The Smashers squad takes shape",
      tag: "Auction",
      status: "upcoming" as const,
    },
    {
      day: "17–20",
      month: "SEP",
      title: "TNPPL Season 2 — Tournament",
      detail: "Express Avenue Mall, Central Atrium",
      tag: "League",
      status: "upcoming" as const,
    },
  ],
} as const;

export type EventItem = (typeof events.items)[number];

export const community = {
  kicker: "Community Event",
  title: "Pickle & Pilates",
  venue: "Forest Hills Country Club",
  note: "Coming soon — dates will be announced soon",
} as const;

export const instagram = {
  title: "Every smash, first on Instagram",
  sub: "Squad reveals, auction updates, match days and behind-the-scenes — follow @salemsupersmashers so you never miss a moment.",
  highlights: ["Squad reveals", "Auction updates", "Match days", "Behind-the-scenes"],
  cta: "Follow @salemsupersmashers",
  url: INSTAGRAM_URL,
} as const;

export const join = {
  kicker: "Be Part of It",
  title: "Join the movement",
  lead: "Register for tournament updates, squad news, and first access to the official jersey drop.",
  roles: [
    { value: "fan", label: "A fan / supporter" },
    { value: "player", label: "A player" },
    { value: "sponsor", label: "A sponsor / partner" },
    { value: "volunteer", label: "A volunteer" },
  ],
  cta: "Count Me In",
  successNote: "🎉 You're in! Watch your inbox for Smashers updates.",
  venues: [
    { icon: "mountain", label: "Home Ground · Salem" },
    { icon: "trophy", label: "TNPPL Season 2 · Sept 17–20" },
    { icon: "map-pin", label: "Express Avenue Mall, Chennai" },
  ],
} as const;

export const footer = {
  name: "SALEM SUPER SMASHERS",
  instagramLabel: "Follow us on Instagram",
  copyright: "© 2026 Salem Super Smashers · TNPPL Season 2",
  poweredByPrefix: "Proudly powered by",
} as const;
