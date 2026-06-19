# KindDo Release Checklist

Use this before any public test or production release.

## 1. Core Flow QA

- [ ] New user can sign up with email.
- [ ] New user can sign in with Google.
- [ ] User can edit profile: name, avatar, bio, age, location, social links.
- [ ] User can create a public dream with photo or video.
- [ ] User can create a private dream and it does not appear in the public feed.
- [ ] Public dream appears on the main feed.
- [ ] Another user can offer help and open a chat.
- [ ] Dream author can choose a helper from chat.
- [ ] Dream/task status updates after helper selection.
- [ ] Chat realtime updates work for sender and receiver.
- [ ] Dream author can mark a task completed.
- [ ] Dream author can publish a gratitude story.
- [ ] Story appears in the stories feed and detail page.

## 2. Supabase Security

- [ ] Private dreams are visible only to the author.
- [ ] Chats are visible only to `user_1` and `user_2`.
- [ ] Messages can be created only by chat participants.
- [ ] Dream tasks can be created, edited, deleted, and completed only by the dream author.
- [ ] Helper can be selected only by the dream author.
- [ ] Storage buckets do not allow unexpected file types.
- [ ] Supabase migrations are applied through `009_helper_selection.sql`.

## 3. Content Safety

- [ ] Verify dream reports can be sent.
- [ ] Verify story reports can be sent.
- [ ] Verify profile reports can be sent.
- [ ] Admin/manual process exists for removing unsafe content from Supabase.
- [ ] Public pages do not expose emails or private auth data.

## 4. Legal And Trust Pages

- [ ] Verify `/privacy` content.
- [ ] Verify `/terms` content.
- [ ] Verify `/safety` content.
- [ ] Login and public pages link to privacy/terms/safety.
- [ ] Pages mention that users should not share sensitive personal data publicly.

## 5. Media Upload QA

- [ ] Photo upload works for dreams.
- [ ] Video upload works for dreams.
- [ ] Photo upload works for gratitude stories.
- [ ] Video upload works for gratitude stories.
- [ ] Upload errors are understandable.
- [ ] Large file behavior is acceptable.
- [ ] Empty media submission is blocked.

## 6. Mobile UI QA

- [ ] iPhone Safari: feed, create, chat, story, profile.
- [ ] Android Chrome: feed, create, chat, story, profile.
- [ ] Bottom navigation is always visible and does not cover forms.
- [ ] Long names do not break layout.
- [ ] Long locations do not break layout.
- [ ] Long dream descriptions do not overlap UI.
- [ ] Photo cards do not show video play icon.
- [ ] Filters are usable on a small screen.

## 7. Production Configuration

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set.
- [ ] Supabase Auth Site URL points to production domain.
- [ ] Google OAuth redirect URLs include production callback.
- [ ] Storage buckets exist: `dream-videos`, `story-videos`, `avatars`.
- [ ] Realtime is enabled for messages.
- [ ] Environment variables are not committed.

## 8. Verification Commands

- [x] TypeScript passes:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

- [x] Production build passes before real release:

```bash
pnpm build
```

## 9. Launch Readiness

- [ ] Database backup exists.
- [ ] Rollback plan exists.
- [ ] First test users are known.
- [ ] Feedback channel is ready.
- [ ] Known limitations are written down.
