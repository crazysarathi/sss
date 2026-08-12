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
} as const;

export const navLinks = [
  { label: "The League", href: "#tnppl" },
  { label: "The Crest", href: "#reveal" },
  { label: "The Identity", href: "#identity" },
  { label: "Events", href: "#events" },
  { label: "Moments", href: "#moments" },
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
    "India's only state-owned, franchise-based pickleball league — organised by the Tamil Nadu Pickleball Association and recognised by SDAT. Season 2 brings 12 franchise teams and 168 players — 36 women, 36 men 50+ and 96 men's open — split into two pools of six, chasing a ₹36,00,000 prize pool. Every squad fields 14 players, and Salem now has a team in the fight.",
  stats: [
    { value: 12, suffix: "", label: "Franchise Teams" },
    { value: 168, suffix: "", label: "Players" },
    { value: 36, prefix: "₹", suffix: "L", label: "Prize Pool" },
    { value: 14, suffix: "", label: "Players Per Squad" },
  ],
  keyItems: [
    { icon: "trophy", title: "Season 2 Tournament", detail: "17 – 20 September 2026" },
    { icon: "users", title: "The Field", detail: "12 teams · 168 players" },
    {
      icon: "map-pin",
      title: "Venue",
      detail: "Express Avenue Mall, Central Atrium",
      /** Opens the venue in Google Maps. */
      href: "https://www.google.com/maps/search/?api=1&query=Express+Avenue+Mall%2C+Royapettah%2C+Chennai",
    },
  ],
} as const;

export const crestReveal = {
  kicker: "The Crest",
  title: "Relive the reveal",
  lead: "On 12 July 2026, our crest was unveiled to Salem. Serve the ball to relive the moment.",
  unveiledBy: {
    label: "Unveiled by",
    name: "Actor Karthi",
    date: "12 · 07 · 2026",
  },
  unveilCta: "SLIDE TO SERVE",
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
  /** Label on the per-event "view moments" button in the timeline. */
  momentsCta: "View Moments",
  items: [
    {
      id: "logo-launch",
      day: "12",
      month: "JUL",
      title: "Official Logo Launch",
      detail: "Crest unveiled by actor Karthi · Salem",
      tag: "Done ✓",
      status: "done" as const,
    },
    {
      id: "player-auction",
      day: "04",
      month: "AUG",
      title: "Grand Player Auction & Press Meet",
      detail: "Live auction at a 5-star hotel — the Smashers squad takes shape",
      tag: "Done ✓",
      status: "done" as const,
    },
    {
      id: "season-2-tournament",
      day: "17–20",
      month: "SEP",
      title: "TNPPL Season 2 — Tournament",
      detail: "Express Avenue Mall, Central Atrium · 12 teams · 2 pools of 6",
      tag: "League · 4 Days",
      status: "upcoming" as const,
    },
  ],
} as const;

export type EventItem = (typeof events.items)[number];

export const program = {
  kicker: "Our Programs",
  title: "Moments that made us",
  lead: "Auction night, the squad reveal, front-page ink — relive the programs that carried Salem into Season 2.",
  note: "More moments dropping all season — follow along on Instagram.",
  /** Hyperlink under the gallery — opens the all-events moments page. */
  viewAllCta: "View all moments",
  items: [
    {
      key: "reveal",
      tag: "Squad · 14/14",
      title: "Team Reveal",
      caption: "The full Season 2 roster, locked and loaded — openers to AB50s.",
    },
    {
      key: "launch",
      tag: "Chennai",
      title: "League Launch",
      caption: "TNPPL Season 2 takes the stage with TNPA, SDAT and Cavin's.",
    },
    {
      key: "owners",
      tag: "TNPPL · Season 2",
      title: "Launch Night",
      caption: "Franchise owners and league officials open the season together.",
    },
    {
      key: "press",
      tag: "Dinakaran · Pg 11",
      title: "In The Press",
      caption: "Salem's franchise makes the morning paper — 05.08.26.",
    },
    {
      key: "crest",
      tag: "12 · 07 · 2026",
      title: "Crest Unveiling",
      caption: "Actor Karthi reveals the crest that carries the city.",
    },
  ],
  stats: [
    { value: 14, suffix: "", label: "Players Signed" },
    { value: 5, suffix: "", label: "Programs Held" },
    { value: 1, suffix: "", label: "City United" },
  ],
} as const;

export type ProgramItem = (typeof program.items)[number];

export const community = {
  kicker: "Community Event",
  title: "Pickle & Pilates",
  venue: "Forest Hills Country Club",
  /** Opens the venue in Google Maps. */
  venueHref:
    "https://www.google.com/maps/search/?api=1&query=Forest+Hills+Country+Club%2C+Salem%2C+Tamil+Nadu",
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
