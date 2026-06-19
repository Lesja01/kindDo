# KindDo

Dreams become stories.

Production-ready MVP for a video-first dream-helping social platform.

## Brand

- Name: KindDo
- Positioning: Dreams become stories.
- Background: `#FAF8F4`
- Primary: `#FF7A59`
- Secondary: `#4ECDC4`
- Success: `#2ECC71`
- Text: `#1F2937`
- Neutral: `#6B7280`
- Font: Inter

## Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn/ui-style components
- Supabase Auth, Postgres, Realtime, Storage
- TanStack Query

## Core Flow

1. A user posts a dream with a short video.
2. Other users offer help and start a private chat.
3. The dream author chooses exactly one helper after the conversation.
4. The app assigns `helper_id` and keeps the helper chat connected to the dream.
5. After the dream is fulfilled, the author uploads a gratitude video.
6. The completed dream becomes a public gratitude story.

## Setup

1. Create a Supabase project.
2. Run all SQL files in `supabase/migrations` in numeric order in Supabase SQL editor or via the Supabase CLI.
3. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Enable Email and Google auth in Supabase.
5. Add these redirect URLs in Supabase Auth:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

6. Use Node.js 20+ and install with pnpm:

```bash
nvm install 22
nvm use 22
corepack enable
pnpm install
pnpm dev
```

Do not use the system Node.js 12 runtime or plain `npm install` for this project.

## Routes

- `/` - combined Dreams / Stories feed
- `/login` - email magic link and Google auth
- `/create` - protected dream creation
- `/dreams/[id]` - dream detail, help offer, chat link, story creation
- `/chats` and `/chats/[id]` - protected chat list and realtime chat
- `/stories` and `/stories/[id]` - gratitude story feed/detail
- `/profile` - protected profile editor
- `/profile/[id]` - public profile
- `/about` - public KindDo manifesto
- `/privacy`, `/terms`, `/safety` - trust and safety pages
