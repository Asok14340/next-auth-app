# Auth Flow Pro

A modern authentication flow built with React, Vite, Express, and Shadcn UI.

## Tech Stack
- Frontend: React, Vite, Shadcn UI, Tailwind CSS
- Backend: Express, Passport.js (Google/GitHub OAuth), Drizzle ORM
- Database: PostgreSQL

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd auth-flow-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file based on `.env.example` and add your credentials.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Deployment
This project is configured for deployment on **Vercel**.
- The `api` directory handles serverless functions for the backend.
- `vercel.json` routes requests correctly.
