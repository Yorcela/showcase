# Yorcela Showcase

## About this project
This repository is a portfolio-style codebase meant to show how I structure services, handle auth (access + refresh tokens in session), and manage tooling.

It is a NestJS backend starter that shows a clean architecture setup with authentication: username/password login, access tokens, and refresh tokens stored in the session. This is a showcase project built to demonstrate my backend practices; parts of it were authored with generative AI following my technical instructions.

## What’s inside
- NestJS 11, TypeScript, Prisma (SQLite by default, PostgreSQL optional) - All Dockerised
- Auth with access token + session-based refresh token flow
- Request throttling, validation, and basic email plumbing
- ESLint + Prettier, Jest with coverage targets, Husky-equivalent GitHub Action for CI

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


### Useful URLs
- 👾 [API](http://localhost:3000)
- 📄 [API Swagger](http://localhost:3000/swagger)
- 📧 [MailHog](http://localhost:8025) (catching emails)
- 🛠 [Prisma Studio](http://localhost:5555) (exploring database)


### Useful scripts
- `pnpm test:cov` – run the Jest suite with coverage
- `pnpm lint` / `pnpm lint:fix` / `pnpm format:check` – quality gate

### Environment
Edit `.env` (SQLite defaults are provided). Keep `.env.example` in sync with `pnpm dotenv:fix`. `DATABASE_PROVIDER` can be switched to `postgres`; adjust `DATABASE_URL` accordingly.