FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev musl-dev giflib-dev pixman-dev libjpeg-turbo-dev freetype-dev openssl openssl-dev
ENV HUSKY=0 CI=1
RUN corepack enable
COPY package.json pnpm-lock.yaml ./

FROM base AS deps
ARG PNPM_FROZEN=true
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  sh -lc 'if [ "$PNPM_FROZEN" = "true" ]; then pnpm install --frozen-lockfile; else pnpm install --no-frozen-lockfile; fi'

FROM base AS dev
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 3000
CMD ["pnpm","run","dev"]

FROM dev AS development

FROM deps AS build
COPY . .
RUN pnpm run prod:build

FROM base AS production-deps
ARG PNPM_FROZEN=true
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  sh -lc 'if [ "$PNPM_FROZEN" = "true" ]; then pnpm install --frozen-lockfile --prod; else pnpm install --no-frozen-lockfile --prod; fi'

FROM node:20-alpine AS production
RUN apk add --no-cache cairo jpeg pango giflib pixman libjpeg-turbo freetype
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/package.json ./package.json
COPY --from=production-deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/dist ./dist
COPY tools/docker/entrypoint.sh ./entrypoint.sh
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 && chmod +x /app/entrypoint.sh && mkdir -p uploads && chown -R nestjs:nodejs /app
USER nestjs
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm","start"]
