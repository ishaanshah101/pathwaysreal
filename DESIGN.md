# Pathways design system: "Wayfinding"

The mark is a road running to a sun, so the product borrows its visual language
from the road: map paper, asphalt, lane lines, and the sign colours a driver
already knows how to read. This file is the short version of the rules. The
long version is the CSS in `src/styles/`.

## The idea in one paragraph

Pathways gives directions. So pages are laid out like a good road atlas:
typographic, flat, dense where it helps, with colour reserved for signs that
mean something. Nothing floats on a soft shadow. Nothing is a pill. Structure
comes from rules and type, not from stacking rounded cards.

## Type

| Role | Face | Where |
| --- | --- | --- |
| Sign lettering | Overpass (variable, 400 to 900) | Headlines, buttons, labels, all UI |
| Reading | Literata (variable, optical size) | Anything a person wrote at length: posts, Sage answers, notes, legal text. Class `.prose` |
| Small print | Overpass Mono | Kickers, dates, counts, metadata. Classes `.kicker`, `.meta` |

Headlines are weight 900, tight tracking, sentence case. Never all caps except
mono small print.

## Colour

Tokens live in `src/styles/tokens.css`. Use the tokens, not hex values, except
for signs and road, which keep literal colours so they look the same at night.

- `--paper`, `--paper-2`, `--paper-3`, `--sheet`: page, wells, raised sheet.
- `--ink`, `--ink-2`, `--ink-3`: text. `--hairline`, `--hairline-strong`: rules.
- `--sun` (the logo orange) is the single accent. `--sun-deep` for orange text.
- Sign colours: green, blue, brown, yellow, lime, red, plus ink and white.

Topic to sign colour is decided in one place: `src/lib/categories.js`.

## Building blocks (all in `src/styles/kit.css`)

- Buttons: `.btn` plus `.btn-primary` (asphalt), `.btn-sun`, `.btn-secondary`
  (ink outline), `.btn-quiet`, `.btn-danger`; sizes `.btn-sm`, `.btn-lg`;
  `.btn-go` adds the arrow. Filter chips are `.btn-chip` or a pressed `.sign`.
- Text actions: `.link-btn`, `.quiet-link`, `.tool-btn`.
- Forms: `.field > label`, `.input`, `.field-hint`, `.field-error`, `.seg`.
- Signs: `<Sign color="green">` (`src/components/kit/Sign.jsx`).
- Avatars: `<Plate name seed size>` (`src/components/kit/Plate.jsx`).
- Icons: always `<Icon as={LucideGlyph} />` (`src/components/kit/Icon.jsx`),
  which gives every icon square ends and a heavier stroke.
- Surfaces: `.panel` with `.panel-head` and `.panel-body` (ink border, for
  things that are objects: forms, menus, legends). `.card` is the quiet version.
  Lists are rows separated by `1px solid var(--hairline)`, not stacks of cards.
- Dividers: `.lane` (the dashed lane line), `.road` (a strip of asphalt).
- Feedback: `.notice notice-{info,success,warning,error}`, `.msg`, `.badge`,
  `.empty` with `.empty-title` and `.empty-body`, `.skeleton`.
- Page top inside the app: `<PageHead kicker title sub>` then content inside
  `.page` (wide) or `.page-read` (reading width).

## Rules

1. No soft drop shadows on anything in the page flow. Only floating things
   (menus, dialogs) use `var(--lift)`.
2. No pills. Corners are 3 to 8px. Avatars are rounded squares.
3. No gradients, no glass, no glow, no emoji, no sparkle icons.
4. One accent. If two things on a screen are orange, one of them is wrong.
5. Copy is plain and specific. No em dashes. Say what happens when you press.
6. Every control is at least 40px tall on a phone, and every state (loading,
   empty, error) says what happened and what to do next.
7. Dark mode comes from the tokens. Do not hard-code light colours.

## Social patterns

The signed-in app borrows its layout from social apps on purpose, so nobody has to learn where things are. The drawing stays in the house style.

- **Feed tabs.** "For you" and "Following" are tabs above the stream, with the lane-line orange under the one you are on. Topics are one row of signs under the tabs that scrolls sideways.
- **A post.** Follow sits beside the author's name. One row of actions sits under the post: Helpful (counted, and nobody can see who pressed it), Save, Share, then Connect.
- **People to learn from.** A short list beside the feed with a Follow button on each row. Verified educators and counselors come first.
- **Compose on a phone.** One orange button above the tab bar.
- **Profile.** Posts, followers and following as numbers under the name, then three tabs: Profile, Posts, Account.

All of this is styled in `src/styles/social.css`.

