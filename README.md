# Yorcela Showcase

## About this project
This repository is a showcase project built to demonstrate my backend practices, to show how I structure services, handle auth, and manage tooling; parts of it were authored with generative AI following my technical instructions, especially the tests (you'll find the prompt I use here `.prompts/tests-guidelines.prompt.md`).

You can use it as you want, this is free of charge.

## What’s inside
### Tech
- Dockerised apps
    - NestJS 11 and TypeScript (`strict mode`) 
    - Prisma (SQLite by default, PostgreSQL available)
    - (dev) Mailhog
- DDD, hexagonal architecture, Repository Pattern
- Request throttling, validation, and basic email (server + template) plumbing
- ESLint + Prettier, Jest with coverage targets, GitHub Action for CI
### Features
- 2 steps registrations (email -> OTP)
- Auth with access token + session-based refresh token flow
- Fully documented Swagger API (with decorators)


## Prerequisites
- Node 18+ and pnpm (see `package.json` for the pinned pnpm version)
- Docker (optional) if you want to run via `docker compose`

## Getting started
```bash
git clone git@github.com:Yorcela/nestapi-boilerplate.git
cd nestapi-boilerplate
pnpm apps:init
pnpm dev:up             # run apps in Docker
pnpm dev:local:up       # run app out Docker (need to self host everything)
```


### URLs
- 👾 [API](http://localhost:3000)
- 📄 [API Swagger](http://localhost:3000/swagger)
- 📧 [MailHog](http://localhost:8025) (catching emails)
- 🛠 [Prisma Studio](http://localhost:5555) (exploring database)


### Useful scripts
- `pnpm test:cov` – run the Jest suite with coverage
- `pnpm lint` / `pnpm lint:fix` / `pnpm format:check` – quality gate

### Environment
Edit `.env` (SQLite defaults are provided). Keep `.env.example` in sync with `pnpm dotenv:fix`. `DATABASE_PROVIDER` can be switched to `postgres`; adjust `DATABASE_URL` accordingly.