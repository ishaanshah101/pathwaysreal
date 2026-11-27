import {
  Newspaper, Compass, MessageSquare, UserPlus, Route, Leaf, Bookmark, BookOpen, Milestone, ShieldAlert, PenLine, CalendarPlus, User,
} from 'lucide-react';

// Every destination in the signed-in app, in one list, so the rail, the phone
// tab bar and the jump menu can never drift apart.
//
// `tone` is the colour of the pictogram plate. `phone` marks the five that fit
// on the phone tab bar; the rest stay one tap away in the top bar and menus.
export const SECTIONS = [
  { to: '/app', end: true, label: 'Feed', glyph: Newspaper, tone: 'green', phone: true, keywords: 'home posts' },
  { to: '/app/explore', label: 'Explore', glyph: Compass, tone: 'blue', phone: true, keywords: 'people mentors search directory' },
  { to: '/app/messages', label: 'Messages', glyph: MessageSquare, tone: 'ink', phone: true, keywords: 'inbox chat' },
  { to: '/app/requests', label: 'Requests', glyph: UserPlus, tone: 'white', keywords: 'connections pending' },
  { to: '/app/plan', label: 'Plan', glyph: Route, tone: 'sun', phone: true, keywords: 'deadlines checklist colleges list planner' },
  { to: '/app/sage', label: 'Sage', glyph: Leaf, tone: 'yellow', phone: true, keywords: 'ai advisor ask' },
  { to: '/app/saved', label: 'Saved', glyph: Bookmark, tone: 'lime', keywords: 'bookmarks read later' },
];

export const REFERENCE = [
  { to: '/app/glossary', label: 'Glossary', glyph: BookOpen, tone: 'brown', keywords: 'words terms definitions' },
  { to: '/app/by-grade', label: 'By grade', glyph: Milestone, tone: 'green', keywords: 'timeline what to do when' },
];

export const PROFILE = { to: '/app/profile', label: 'Your profile', glyph: User, tone: 'ink', keywords: 'account settings' };
export const MODERATION = { to: '/app/admin/moderation', label: 'Moderation', glyph: ShieldAlert, tone: 'red', keywords: 'admin reports' };

export const ACTIONS = [
  { to: '/app?compose=1', label: 'Write a post', glyph: PenLine, tone: 'green', keywords: 'new share' },
  { to: '/app/plan?add=1', label: 'Add something to my plan', glyph: CalendarPlus, tone: 'sun', keywords: 'deadline task college' },
];

export const PHONE_TABS = SECTIONS.filter((s) => s.phone);
