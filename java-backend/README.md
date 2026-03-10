# Java Backend (Spring Boot)

This folder contains a Spring Boot implementation of the existing Node.js backend.

## Database

- Database used: **MongoDB** (same as the Node.js backend)
- Default URI: `mongodb://localhost:27017/auth`
- Auto index creation defaults to `false` via `MONGO_AUTO_INDEX_CREATION` to avoid startup failures from legacy index-name conflicts.

## Run

1. Copy `.env.example` values into your environment.
2. Start MongoDB.
3. Run:

```bash
mvn spring-boot:run
```

The API runs on `http://localhost:5000` by default and exposes the same core routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/clients`
- `GET/POST/PUT/DELETE /api/products`
- `GET /health`

## Optional: enable auto index creation

Set `MONGO_AUTO_INDEX_CREATION=true` only when you want Spring Data to manage indexes automatically (for fresh databases or controlled migrations).
