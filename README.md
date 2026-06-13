# SkalpGuard

SkalpGuard is a hair & scalp health platform that lets users scan their scalp with their
phone, receive a hair‑disease detection result with a recommended treatment and severity
level, and track their history over time. An admin team manages users, roles, permissions,
scans and progress records through a web admin panel.

The repository is a **monorepo** containing two independent applications:

| Folder | Stack | Purpose |
| ------ | ----- | ------- |
| [`skalpGuardApp/`](skalpGuardApp/) | Expo / React Native (TypeScript) | Mobile app for end users (scan, results, history, profile) |
| [`skalpGuard_laravel/`](skalpGuard_laravel/) | Laravel 12 + Filament 5 + Sanctum | REST API backend **and** Filament admin panel |

```
skalpGuard/
├── skalpGuardApp/        # Expo mobile app (the client)
└── skalpGuard_laravel/   # Laravel REST API + Filament admin panel (the server)
```

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Backend — skalpGuard_laravel](#backend--skalpguard_laravel)
  - [Setup](#backend-setup)
  - [Running the backend](#running-the-backend)
  - [Admin panel](#admin-panel)
  - [Data model](#data-model)
  - [REST API reference](#rest-api-reference)
- [Mobile app — skalpGuardApp](#mobile-app--skalpguardapp)
  - [Setup](#app-setup)
  - [Running the app](#running-the-app)
  - [Connecting the app to the backend](#connecting-the-app-to-the-backend)
  - [Screens](#screens)
  - [Building with EAS](#building-with-eas)
- [End‑to‑end local workflow](#end-to-end-local-workflow)
- [Project conventions](#project-conventions)

---

## Architecture overview

```
┌─────────────────────────┐         HTTPS / JSON            ┌──────────────────────────────┐
│   skalpGuardApp (Expo)  │  ───────────────────────────▶  │   skalpGuard_laravel (API)   │
│                         │   Bearer token (Sanctum)        │                              │
│  • Auth (signup/login)  │                                 │  • /api/* REST endpoints     │
│  • Camera scan (3 imgs) │  ◀───────────────────────────  │  • Sanctum token auth        │
│  • Results & history    │      JSON + image URLs          │  • Filament admin panel      │
│  • Profile              │                                 │  • SQLite (default) storage  │
└─────────────────────────┘                                 └──────────────────────────────┘
```

- The app authenticates against the API and stores the returned **Sanctum bearer token** in
  `AsyncStorage` under the key `user_token`.
- A scan uploads **three images** (multipart) plus optional detection metadata; the API
  stores the files on the `public` disk and returns full image URLs.
- Auth is local (email + password). Firebase was removed — `firebase.ts` only contains
  no‑op stubs so any leftover imports don't crash.

---

## Prerequisites

**Backend**
- PHP **8.2+**
- [Composer](https://getcomposer.org/)
- Node.js 18+ and npm (for the Vite asset build)
- SQLite (default) — or MySQL/PostgreSQL if you reconfigure `.env`

**Mobile app**
- Node.js 18+ and npm
- [Expo CLI](https://docs.expo.dev/) (`npx expo`)
- Expo Go app on a device, or an Android/iOS emulator/simulator

---

## Backend — `skalpGuard_laravel`

Laravel 12 application exposing a token‑authenticated REST API (Laravel Sanctum) and an admin
dashboard built with [Filament 5](https://filamentphp.com/).

### Backend setup

```bash
cd skalpGuard_laravel

# Install PHP + JS dependencies, copy env, generate key, migrate, build assets
composer setup        # convenience script defined in composer.json

# --- or do it manually ---
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build

# Create the storage symlink so uploaded images are served from /storage
php artisan storage:link
```

> By default the app uses **SQLite** (`DB_CONNECTION=sqlite`). Create the database file with
> `touch database/database.sqlite` (or `New-Item database/database.sqlite` on Windows) before
> migrating, or switch `.env` to MySQL/PostgreSQL.

### Running the backend

```bash
# Full dev stack (server + queue + logs + Vite) via concurrently
composer dev

# Or just the API server
php artisan serve            # http://127.0.0.1:8000
```

A Windows helper script, [`serve.bat`](skalpGuard_laravel/serve.bat), starts `php artisan serve`
using the Herd‑bundled PHP binary.

To expose the local server to a physical device (so the Expo app can reach it), use a tunnel
such as **ngrok**:

```bash
ngrok http 8000
```

…and point the app's `BASE_URL` at the tunnel URL (see
[Connecting the app to the backend](#connecting-the-app-to-the-backend)).

### Admin panel

The Filament panel is served at **`/adminPanel`** (the root `/` redirects to
`/adminPanel/login`).

| | |
| --- | --- |
| URL | `http://127.0.0.1:8000/adminPanel` |
| Login | `/adminPanel/login` (custom login page) |

Resources managed in the panel: **Users**, **Roles**, **Permissions**, **Hair Disease
Detections** (scans), and **Progress Tracking**, plus dashboard stat widgets.

Create an admin user with Tinker if you don't have one:

```bash
php artisan tinker
>>> \App\Models\User::create(['name'=>'Admin','email'=>'admin@example.com','password'=>bcrypt('password')]);
```

### Data model

**User** (`users`)
- `name`, `email` (unique), `password` (hashed)
- `is_blocked` (bool) — blocked users cannot log in via the API
- `profile_photo` (path) → exposed as `profile_photo_url`
- `gender` (`male` | `female` | `other`, nullable)
- Relations: `roles` (many‑to‑many), `hairDiseaseDetections` (hasMany), `progressTrackings` (hasMany)
- Role/permission helpers: `hasRole($slug)`, `hasPermission($slug)`

**HairDiseaseDetection** (`hair_disease_detections`) — a "scan"
- `user_id`
- `image_1`, `image_2`, `image_3` (stored paths) → exposed as full URLs
- `detection_result`, `recommended_treatment`, `notes` (text)
- `severity_level` (`Low` | `Medium` | `High` | `Critical`)
- `detection_date`, `detection_time` (set server‑side at creation)

**Role / Permission** — RBAC tables (`roles`, `permissions`, `role_user`, `permission_role`).

**ProgressTracking** — per‑user progress records.

### REST API reference

Base path: **`/api`**. Authentication: **Laravel Sanctum** bearer tokens
(`Authorization: Bearer <token>`). All responses are JSON shaped as
`{ "success": bool, ... }`.

#### Public endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/users` | Register a new user; returns the user record **and** an auth token |
| `POST` | `/api/verify` | Verify email + password; returns user (with scans) and a fresh token |

`POST /api/users` (multipart or JSON) — fields:
`name`, `email`, `password`, `password_confirmation`, optional `profile_photo` (image ≤10 MB),
optional `gender`.

`POST /api/verify` — fields: `email`, `password`.
Returns `401` for bad credentials, `403` if the account is blocked, `404` if not found.

#### Protected endpoints (`auth:sanctum`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/user` | The currently authenticated user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/{id}` | Get a single user |
| `PUT` | `/api/users/{id}` | Update a user (name, password, `is_blocked`, gender, photo — **email is immutable**) |
| `DELETE` | `/api/users/{id}` | Delete a user |
| `POST` | `/api/scans` | Create a scan — uploads `image_1`, `image_2`, `image_3` (multipart) + optional detection metadata |
| `GET` | `/api/scans/{id}` | Get a single scan (with user info + image URLs) |
| `GET` | `/api/users/{userId}/scans` | List a user's scans, newest first |

`POST /api/scans` (multipart) — fields:
`user_id` (required), `image_1`/`image_2`/`image_3` (required images ≤10 MB),
optional `detection_result`, `recommended_treatment`, `severity_level`
(`Low`/`Medium`/`High`/`Critical`), `notes`. `detection_date`/`detection_time` are set
automatically.

> **Image serving:** uploads are stored on the `public` disk and returned as
> `asset('storage/...')` URLs. If the `public/storage` symlink isn't available (e.g. some
> shared hosts), a fallback proxy route serves them: `GET /storage-proxy/{path}`.

---

## Mobile app — `skalpGuardApp`

An [Expo](https://expo.dev/) / React Native app written in TypeScript, using **expo-router**
for file‑based navigation, the device camera (`expo-camera`) and image pickers for scans, and
`AsyncStorage` for the persisted auth token.

### App setup

```bash
cd skalpGuardApp
npm install
```

### Running the app

```bash
npx expo start        # then press a (Android), i (iOS), or w (web)

# or directly
npm run android
npm run ios
npm run web
```

### Connecting the app to the backend

The API base URL is configured in [`app/api/client.ts`](skalpGuardApp/app/api/client.ts):

```ts
const BASE_URL = 'https://<your-backend-host>/api';
```

Update this to point at your backend:
- **Emulator + local server:** `http://10.0.2.2:8000/api` (Android emulator) or
  `http://127.0.0.1:8000/api` (iOS simulator).
- **Physical device:** use your machine's LAN IP or an **ngrok** tunnel URL (recommended,
  since the committed value is an ngrok URL).

The client automatically attaches the stored bearer token (`AsyncStorage` key `user_token`)
to every request and handles JSON/error responses centrally.

### Screens

File‑based routes under [`skalpGuardApp/app/`](skalpGuardApp/app/):

**Onboarding & auth**
- `splash`, `welcome`, `auth`
- `signup-name` → `signup-gender` → `signup-password` → `signup-profile` (multi‑step signup)
- `login-password`

**Main app (tab navigator — `app/(tabs)/`)**
- `index` — home
- `scan` — capture the three scan images
- `results` — detection result, treatment, severity
- `history` — past scans
- `profile` — user profile
- `explore` — additional content

### Building with EAS

EAS is configured in [`eas.json`](skalpGuardApp/eas.json) with `development`, `preview`, and
`production` profiles (project id in `app.json` → `extra.eas.projectId`).

```bash
npx eas build --profile preview --platform android
npx eas build --profile production --platform ios
```

Android package: `com.zainsyed.SkalpGuardApp`.

---

## End‑to‑end local workflow

1. **Start the backend**
   ```bash
   cd skalpGuard_laravel
   php artisan serve
   ```
2. **Expose it** (for a physical device): `ngrok http 8000` and copy the HTTPS URL.
3. **Point the app at it:** set `BASE_URL` in `skalpGuardApp/app/api/client.ts`.
4. **Start the app:**
   ```bash
   cd skalpGuardApp
   npx expo start
   ```
5. Register a user in the app → it receives a Sanctum token → capture a scan → view results
   and history. Manage everything from the Filament panel at `/adminPanel`.

---

## Project conventions

- **Secrets are not committed.** Each sub‑project keeps its own `.gitignore`; the Laravel
  `.env`, `node_modules`, `vendor`, and build artifacts are ignored. Only `.env.example` is
  tracked — copy it to `.env` and fill in real values.
- The repo's root `.gitignore` excludes local agent state (`.claude/`) and OS files.
- Backend default storage is **SQLite**; switch via `.env` if you need a server database.

---

### License

The Laravel backend is based on the Laravel framework (MIT). Application‑specific code in this
repository is proprietary to the SkalpGuard project unless stated otherwise.
