# Pathways design system: "The Notebook"

Pathways was made by a student, for students, so it looks like what is in a student's backpack. The page is a desk. On it are sheets of lined paper, binder tabs, a set of highlighters, sticky notes, index cards, and a red pen for the things that matter. The logo sits on it like a sticker on a cover.

The logo and the name are unchanged. Everything else is drawn from that one idea.

## Where things live

| File | What it holds |
| --- | --- |
| `src/styles/tokens.css` | Colours, type, spacing, shadows, dark mode, and aliases for older token names |
| `src/styles/fonts.css` | Self-hosted fonts (no font CDN) |
| `src/styles/base.css` | Element defaults |
| `src/styles/kit.css` | Shared pieces: buttons, inputs, labels, sticky notes, index cards, ruled paper |
| `src/styles/site.css` | Public pages |
| `src/styles/shell.css` | The signed-in frame: top bar, binder tabs, bottom tabs |
| `src/styles/app.css`, `plan.css`, `messages.css`, `profile.css`, `auth.css` | One per area of the app |
| `src/styles/social.css` | Feed tabs, post actions, people to follow, profile numbers and tabs |

## Type

| Role | Face | Used for |
| --- | --- | --- |
| Marker | Shantell Sans (variable, 300 to 800) | Headlines, buttons, tabs, all controls |
| Reading | Andika | Anything a person wrote at length: posts, Sage answers, notes, legal text. Class `.prose` |
| Handwriting | Kalam | Short notes in the margin and your own private notes. Class `.scribble`. Never the only place something important is said |
| Typewriter | Courier Prime | Labels, dates, counts. Classes `.kicker`, `.meta` |

## Colour

| Token | Light | What it is |
| --- | --- | --- |
| `--desk` | `#eadfc6` | The page background: a kraft desk |
| `--sheet` | `#fffdf6` | Paper |
| `--ink` | `#232732` | Blue-black pen |
| `--rule` | `#c5d6e8` | The blue rules on lined paper |
| `--margin` | `#e79b98` | The red margin line |
| `--pen-red` | `#c2362b` | Red pen: counts, circled numbers, things that are late |
| `--sun` | `#e05e12` | The orange of the logo. Primary call to action only |
| `--hl-yellow`, `--hl-green`, `--hl-blue`, `--hl-pink`, `--hl-orange`, `--hl-lime` | | The highlighter set |

Dark mode is homework after dark: a darker desk and paper under a lamp. Sticky notes, highlighter, the legal pad and the notebook cover keep their own colours, and the ink tokens are re-pointed on those surfaces so whatever is written on them stays dark.

## Building blocks

- **Ruled sheet** (`.ruled`, `.post`): lined paper with a margin line and punched holes. Body text uses `--line` as its line height so it sits on the rules.
- **Index card** (`.panel`): a red line under the heading. Used for anything short.
- **Sticky note** (`.notice`, `.sticky`, toasts, your own messages): a highlighter-coloured square with a paper shadow.
- **Highlighter** (`.hl`, `.sign`, selected rows and tabs): one swipe of colour behind a few words. Topic labels are highlighter in the topic's colour.
- **Binder tabs** (`.nb-tab`): the app's navigation, one colour per section.
- **Red pen** (`.mile`, `.count`, `.scribble`): circled numbers, counts, and margin notes.
- **Composition cover** (`.band-road`, `.cover-label`): the black and white marble cover with a white label. Used for the closing section of the home page and the sign-in pages.
- **Legal pad** (`.ob-side`): the yellow pad that carries the onboarding checklist.

## Rules

1. Paper has square corners. Only things drawn by hand wobble (`--wobble`).
2. Shadows are small and real: paper lying on a desk. Nothing glows and nothing floats, apart from menus and toasts.
3. No gradients as decoration. Colour comes from highlighter, and each highlighter colour means something.
4. Orange is the logo's colour and marks the one primary action on a page.
5. Handwriting is for short notes only. Anything a person has to read is in the reading face.
6. Selected is highlighted. Pressed chips, the current tab, the open conversation, and a picked option all use the same swipe of highlighter.
7. Anything on a highlighter or sticky-note surface uses literal dark ink, so it reads the same in both themes.

## Social patterns

The signed-in app borrows its layout from social apps on purpose, so nobody has to learn where things are. The drawing stays in the notebook.

- **Feed tabs.** "For you" and "Following" are tabs above the stream, with highlighter over the one you are on. Topics are one row of labels under the tabs that scrolls sideways.
- **A post.** Follow sits beside the author's name. One row of actions sits under the post: Helpful (counted, and nobody can see who pressed it), Save, Share, then Connect.
- **People to learn from.** A short list beside the feed with a Follow button on each row. Verified educators and counselors come first.
- **Compose on a phone.** One round orange button above the tab bar.
- **Profile.** Posts, followers and following as numbers under the name, then three tabs: Profile, Posts, Account.
