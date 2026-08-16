# Agent instructions

Global preferences live in `~/brain/memory/USER.md` and cross-project
operational truth in `~/brain/memory/MEMORY.md` (both symlinked into
`~/.hermes/memories/`). Read those first; this file only covers what is
specific to this repo.

## What this is

Marketing site for saltlashcity.com: a Vite/React SPA on Hostinger static
hosting, backed by Firebase for auth, Firestore, Storage, and Cloud
Functions.

## Working here

Hostinger auto-deploys on push to `origin/main`. Firestore and Storage
rules are in `firestore.rules` and `storage.rules` — changes there affect
live data access, so review them deliberately.

## Secrets

This repo carries SOPS-encrypted env files. Never commit plaintext.

```bash
work-secrets decrypt   # materialize .env from .env.enc
work-secrets encrypt   # fold local .env edits back into .env.enc
```
