/** Mirrors `--ease-emphasized` in app.css: the one arrival curve in the app. */
export const MOTION_EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Routine entrances: headers, sections, cards. */
export const MOTION_DURATION = 0.4;
/** Feedback and state changes: toggles, menus, exits. */
export const MOTION_DURATION_FAST = 0.2;
export const STAGGER_DELAY = 0.04;
export const STAGGER_CAP = 11;
/** Distance an entrance rises from. Small, so it reads as settling, not travelling. */
export const MOTION_RISE = 14;
