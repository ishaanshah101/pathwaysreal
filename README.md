# Pathways

**Real guidance from people who have been there.**

Pathways is a free website where high school students get honest, firsthand guidance about college and careers from verified mentors such as college students, professors and admissions counselors. It gives every student the kind of advice that is usually only available to people who can afford a private counselor, no matter their background or zip code.

Live site: [pathways.uno](https://pathways.uno)

Built by Ishaan Shah, a sophomore at The Athenian School in Danville, California, as an entry for the 2026 Congressional App Challenge.

## What it does

- **Feed and posts:** students and mentors share real experiences about applications, majors, internships and careers, without reposts, short-form video or engagement-bait algorithms.
- **Explore:** search for people and posts by school, field or interest.
- **One-on-one messaging:** students connect directly with mentors. Students always send the first message, and there are no group chats.
- **Verified mentors:** every mentor is checked by a human against their institution's public directory before they can be contacted.
- **Sage:** an AI college and career advisor. Anyone can try one free question per day, and the full version is an optional subscription. Everything else on Pathways is free.
- **Safety tools:** blocking, reporting, rate limits, AI-assisted moderation and an admin review queue. Pathways is for users 13 and older.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS and shadcn/ui (Radix) components
- **Backend:** [Base44](https://base44.com), which provides the database entities, authentication and serverless backend functions
- **Payments:** Stripe Checkout and Customer Portal for the Sage subscription
- **AI:** Base44's LLM integration, used for Sage and for content moderation

## Project structure

```
src/
  pages/            Public pages (Home, How It Works, Sage, FAQ, Safety, Privacy, Terms)
  pages/app/        Signed-in app (Feed, Explore, Messages, Requests, Sage chat, Profile, admin moderation)
  components/       Shared UI, layout, onboarding and Sage components
  api/              Base44 SDK client
base44/
  entities/         Data model (Profile, Post, Message, Connection, Report, Subscription and more)
  functions/        Backend functions (posting, messaging, connections, Sage, Stripe webhooks)
  config.jsonc      Base44 project config
```

Almost every write goes through a backend function running with service-role access, so the browser can never set sensitive fields such as a user's verified status, age flag or subscription status.

## Running it locally

You need [Node.js](https://nodejs.org) 18 or newer.

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/ishaanshah101/pathwaysreal.git
   cd pathwaysreal
   npm install
   ```

2. Install the Base44 CLI:

   ```bash
   npm install -g base44@latest
   ```

3. Start the local backend and frontend together:

   ```bash
   base44 dev
   ```

   Then open the frontend URL that the command prints.

### Frontend only

To run just the frontend against a hosted Base44 backend, create a `.env.local` file in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

Then run:

```bash
npm run dev
```

and open the local URL that Vite prints.

### Secrets

API keys are never stored in this repository. The Sage subscription needs four secrets set in the Base44 dashboard (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SAGE_MONTHLY` and `STRIPE_PRICE_SAGE_YEARLY`). The rest of the app runs without them.

## Contact

Questions, feedback or safety reports: [ishaan@pathways.uno](mailto:ishaan@pathways.uno)
