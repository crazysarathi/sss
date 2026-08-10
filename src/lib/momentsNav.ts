export type MomentsEntrySide = "left" | "right";

/** Which side's "View Moments" button opened the page — drives the
 *  direction of the smash entrance. Deep links default to left. */
let entrySide: MomentsEntrySide = "left";

export function openEventMoments(slug: string, side: MomentsEntrySide) {
  entrySide = side;
  window.location.hash = `#/moments/${slug}`;
}

export function getMomentsEntrySide(): MomentsEntrySide {
  return entrySide;
}
