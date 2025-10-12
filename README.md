# Vite/NextUI and Express/SQLite3/Sequelize (ViNESS) Full Stack Template

This template has been refactored to separate concerns between app initialization, server bootstrap, routing, controllers, and database configuration.

## Install dependencies

```sh
npm install
# or
yarn install
```

## Environment

- PORT: server port (default 5000)
- DB_PATH: sqlite path (default ./backend/database.sqlite)
- ALLOW_DANGEROUS_FLUSH: set to `true` to enable `/flush` endpoint (disabled by default)

## Run (production)

```sh
npm run build && npm run start
# or
yarn build && yarn start
```

## Develop

```sh
npm run dev
# or
yarn dev
```

## Run with Docker

```sh
docker build -t viness .
docker run -p 3000:3000 -p 5000:5000 viness
```
