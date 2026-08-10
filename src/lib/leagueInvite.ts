/**
 * Session gate + summon channel for the TNPPL league-invite dialog.
 * The dialog shows at most once per tab session, no matter which
 * trigger (home-page delay or crest ceremony) fires first.
 */
const SEEN_KEY = "sss-league-invite-seen";
export const LEAGUE_INVITE_EVENT = "sss:league-invite";

export function hasSeenLeagueInvite(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markLeagueInviteSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // storage unavailable (private mode) — the dialog just re-arms next load
  }
}

/** Ask the mounted dialog to open. No-op if already seen this session. */
export function requestLeagueInvite(): void {
  window.dispatchEvent(new Event(LEAGUE_INVITE_EVENT));
}
