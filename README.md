## Frontend – Product Management Admin (React + Vite)

This is the React + TypeScript frontend for the product management app.  
It provides an authenticated admin dashboard for managing products, users, cart, and orders.

### Tech stack

- **Framework**: React 19 + React Router 7
- **Build tool**: Vite 7
- **State / data fetching**: @tanstack/react-query
- **Styling**: Tailwind CSS 4 + utility components

### 1. Install dependencies

From the `frontend` directory:

```bash
npm install
```

### 2. Environment configuration

The frontend uses `VITE_APP_API_URL` to know where the backend API is running.  
Create a `.env` file in `frontend`:

```bash
VITE_APP_API_URL=http://localhost:3000
```

Notes:

- The frontend HTTP client (`src/lib/http.ts`) uses `VITE_APP_API_URL` and calls the backend under `/api` (e.g. `http://localhost:3000/api`).
- Make sure this matches the backend `PORT` and host.

### 3. Running the frontend

**Development (with HMR):**

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

**Production build:**

```bash
npm run build
```

This outputs static assets into `dist/`.  
You can preview the built app locally with:

```bash
npm run preview
```

### 4. App structure (high level)

- `src/auth` – login, signup, `AuthContext` (stores JWT + current user), and `ProtectedRoute`.
- `src/layout/AppLayout.tsx` – main shell with sidebar navigation and header.
- `src/products` – product list, detail, and form for admins.
- `src/users` – user management (list/create/edit/delete, change roles) for admin users.
- `src/cart`, `src/orders` – cart and orders pages.
- `src/lib/http.ts` – Axios instance with base URL and auth header injection.
- `src/components/ui` – small reusable UI components (button, card, input, toast, etc.).

### 5. Authentication & roles

- On successful login/signup, the backend returns `{ accessToken, user }`.  
- The frontend stores `accessToken` in `localStorage` under `auth_token` and keeps `user` in context.
- Admin users (`role === 'admin'`) see additional navigation to **Users** and have access to admin-only actions (user management, product management).

### 6. Linting

From `frontend`:

```bash
npm run lint
```

Fix any reported issues before committing or deploying.

### 7. Running full stack locally

1. Start MySQL and ensure the backend is configured and running on `http://localhost:3000` (see backend README).
2. In `frontend/.env`, set `VITE_APP_API_URL=http://localhost:3000`.
3. Run the backend: `cd backend && npm run start:dev`.
4. Run the frontend: `cd frontend && npm run dev`.
5. Open `http://localhost:5173` in your browser and log in with the seeded admin credentials.

