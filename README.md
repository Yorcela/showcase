# Yorcela Showcase

## About this project
This repository is a showcase project built to demonstrate my backend practices, to show how I structure services, handle auth, and manage tooling; parts of it were authored with generative AI following my technical instructions, especially the tests (you'll find the prompt I use here `.prompts/tests-guidelines.prompt.md`).

> You can use it as you want, this is free of charge.

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
- Node 20+ and pnpm (see `package.json` for the pinned pnpm version)
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


### Test coverage results (2025/12/06)
>I used AI to generate all the unit tests that I reviewed afterwards

File                                           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------------------------|---------|----------|---------|---------|-------------------
All files                                      |   98.09 |    90.96 |   97.35 |   98.21 |                   
 core/ports/email-provider                     |     100 |       80 |     100 |     100 |                   
  email-provider.error.ts                      |     100 |       80 |     100 |     100 | 52                
 core/ports/template-renderder                 |     100 |      100 |     100 |     100 |                   
  template-renderder.error.ts                  |     100 |      100 |     100 |     100 |                   
 infrastructure/email-provider/mailhog         |     100 |      100 |     100 |     100 |                   
  mailhog.adapter.ts                           |     100 |      100 |     100 |     100 |                   
  mailhog.error.ts                             |     100 |      100 |     100 |     100 |                   
 infrastructure/http/cookies                   |     100 |       75 |     100 |     100 |                   
  cookie.config.ts                             |     100 |       75 |     100 |     100 | 12,27             
 infrastructure/orm                            |     100 |      100 |     100 |     100 |                   
  orm.repo-tokens.registry.ts                  |     100 |      100 |     100 |     100 |                   
  orm.repositories.ts                          |     100 |      100 |     100 |     100 |                   
  orm.tokens.ts                                |     100 |      100 |     100 |     100 |                   
 infrastructure/orm/prisma                     |     100 |      100 |     100 |     100 |                   
  prisma-uow.adapter.ts                        |     100 |      100 |     100 |     100 |                   
  prisma.registry.ts                           |     100 |      100 |     100 |     100 |                   
  prisma.service.ts                            |     100 |      100 |     100 |     100 |                   
 infrastructure/security/argon2                |     100 |      100 |     100 |     100 |                   
  password-hash.adapter.ts                     |     100 |      100 |     100 |     100 |                   
 infrastructure/template-renderer/handlebars   |     100 |    87.17 |     100 |     100 |                   
  handlebars.adapter.ts                        |     100 |    87.17 |     100 |     100 | 146-147,149-152   
 modules/auth/application/decorators           |     100 |      100 |     100 |     100 |                   
  current-user.decorator.ts                    |     100 |      100 |     100 |     100 |                   
 modules/auth/application/services             |   90.74 |     87.5 |     100 |   90.81 |                   
  account-verification.service.ts              |     100 |      100 |     100 |     100 |                   
  auth-tokens.service.ts                       |   84.37 |    83.33 |     100 |   84.74 | 87-97,135,140     
  email.service.ts                             |     100 |      100 |     100 |     100 |                   
 modules/auth/application/usecases             |   98.36 |     90.9 |     100 |   98.14 |                   
  auth.usecase.ts                              |     100 |      100 |     100 |     100 |                   
  register.usecase.ts                          |   97.36 |     87.5 |     100 |   97.05 | 68                
 modules/auth/domain/entities                  |   97.97 |      100 |   94.44 |    97.8 |                   
  access-token.entity.ts                       |     100 |      100 |     100 |     100 |                   
  auth.entity.ts                               |     100 |      100 |     100 |     100 |                   
  email-verification.entity.ts                 |     100 |      100 |     100 |     100 |                   
  otp.entity.ts                                |     100 |      100 |     100 |     100 |                   
  refresh-token.entity.ts                      |   96.29 |      100 |   88.88 |      96 | 62                
  session.entity.ts                            |      96 |      100 |   88.88 |   95.65 | 57                
 modules/auth/domain/errors                    |    97.8 |      100 |   96.15 |    97.8 |                   
  abstract.error.ts                            |     100 |      100 |     100 |     100 |                   
  login.error.ts                               |     100 |      100 |     100 |     100 |                   
  password.error.ts                            |     100 |      100 |     100 |     100 |                   
  register.error.ts                            |   94.87 |      100 |   91.66 |   94.87 | 64-65             
  registry.errors.ts                           |     100 |      100 |     100 |     100 |                   
 modules/auth/domain/services                  |     100 |      100 |     100 |     100 |                   
  otp-generator.service.ts                     |     100 |      100 |     100 |     100 |                   
 modules/auth/domain/success                   |     100 |      100 |     100 |     100 |                   
  abstract.success.ts                          |     100 |      100 |     100 |     100 |                   
  login.success.ts                             |     100 |      100 |     100 |     100 |                   
  password.success.ts                          |     100 |      100 |     100 |     100 |                   
  register.success.ts                          |     100 |      100 |     100 |     100 |                   
  registry.success.ts                          |     100 |      100 |     100 |     100 |                   
 modules/auth/infrastructure/repository/prisma |     100 |      100 |     100 |     100 |                   
 shared/core/success                           |     100 |      100 |     100 |     100 |                   
  app.success.ts                               |     100 |      100 |     100 |     100 |                   
  registry.success.ts                          |     100 |      100 |     100 |     100 |                   
 shared/interfaces/http                        |     100 |     92.3 |     100 |     100 |                   
  error.filter.ts                              |     100 |    86.66 |     100 |     100 | 25                
  response.interceptor.ts                      |     100 |      100 |     100 |     100 |                   
  skip-response.decorator.ts                   |     100 |      100 |     100 |     100 |                   
 shared/modules/config                         |    95.9 |    72.72 |   92.98 |   98.76 |                   
  app.config.ts                                |    95.9 |    72.72 |   92.98 |   98.76 | 130               
 shared/modules/email                          |     100 |      100 |     100 |     100 |                   
  email.service.ts                             |     100 |      100 |     100 |     100 |                   
 shared/modules/sanitizer                      |   97.36 |    90.47 |     100 |   96.66 |                   
  email.sanitizer.ts                           |     100 |      100 |     100 |     100 |                   
  global.interceptor.ts                        |     100 |      100 |     100 |     100 |                   
  sanitizer.abstract.ts                        |   94.44 |    85.71 |     100 |   93.33 | 25                
 shared/pipes                                  |     100 |      100 |     100 |     100 |                   
  abstract.pipe.ts                             |     100 |      100 |     100 |     100 |                   
  cuid.pipe.ts                                 |     100 |      100 |     100 |     100 |                   
  email.pipe.ts                                |     100 |      100 |     100 |     100 |                   
  global.pipe.ts                               |     100 |      100 |     100 |     100 |                   
  hex-token.pipe.ts                            |     100 |      100 |     100 |     100 |                   
  jwt.pipe.ts                                  |     100 |      100 |     100 |     100 |                   
 shared/types                                  |     100 |      100 |     100 |     100 |                   
  cuid2.type.ts                                |     100 |      100 |     100 |     100 |                   
  hashed-token.type.ts                         |     100 |      100 |     100 |     100 |                   
  jwt.type.ts                                  |     100 |      100 |     100 |     100 |                   
  secured-token.type.ts                        |     100 |      100 |     100 |     100 |                   
 shared/utils                                  |   97.67 |    88.88 |     100 |   97.56 |                   
  front-url-template.utils.ts                  |   95.45 |    85.71 |     100 |      95 | 19                
  regex-builder.utils.ts                       |     100 |     87.5 |     100 |     100 | 16                
  response.utils.ts                            |     100 |      100 |     100 |     100 |                   
 shared/validators                             |   98.94 |    93.18 |     100 |   98.75 |                   
  abstract.validator.ts                        |   97.87 |     90.9 |     100 |    97.5 | 52                
  cuid.validator.ts                            |     100 |      100 |     100 |     100 |                   
  email.validator.ts                           |     100 |      100 |     100 |     100 |                   
  hex-token.validator.ts                       |     100 |      100 |     100 |     100 |                   
  jwt.validator.ts                             |     100 |      100 |     100 |     100 |                   



Test Suites: 85 passed, 85 total  
Tests:       344 passed, 344 total  
Time:        23.996 s