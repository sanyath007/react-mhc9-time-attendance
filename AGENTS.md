# AGENTS.md

## Commands

- `npm run dev` — Vite dev server (default port 5001)
- `npm run build` — TypeScript compile + Vite build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

No test suite exists.

## Build for Production

All four changes are required when deploying to a sub-path like `/check-in/`:

1. Set `VITE_API_URL` to production URL in `.env`
2. Set `"homepage": "https://app.mhc9dmh.com/check-in/"` in `package.json`
3. Set `basename="/check-in"` on the Router in `src/components/App.tsx`
4. Set `base: '/check-in'` in `vite.config.ts`

## API Auth

The Axios client (`src/api/index.ts`) uses **two auth schemes**:

- **Regular endpoints**: Bearer token from `localStorage.access_token`
- **`/api/time-attendance/*` endpoints**: API key via `X-API-KEY` header (`VITE_API_KEY`)

The request interceptor validates JWT expiry before sending. The response interceptor redirects to `/` on 401.

## Key Files

- `src/main.tsx` — Entry point (wraps App in AuthProvider)
- `src/components/App.tsx` — All routing
- `src/api/index.ts` — Axios instance with interceptors
- `src/contexts/AuthContect.tsx` — Auth state (note: filename has typo "Contect")
- `src/utils/tailwindcss.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/utils/face-recognition.ts` — Model loading
- `src/lib/types.ts` — All shared TypeScript types

## Face Recognition

Models live in `public/models/`. The loader in `src/utils/face-recognition.ts` prefixes the path with `check-in` in production builds (detected via `import.meta.env.DEV`). If model loading fails in prod, check this path logic.

## Conventions

- Functional components only, no class components
- Tailwind utility classes for styling; use `cn()` for conditional classes
- Mobile-first: always include `max-md:*` variants
- React Hook Form + Zod for forms
- Lucide React for icons
- Types in `src/lib/types.ts`, not scattered across files

## Related Instruction Files

- `.github/copilot-instructions.md` — Detailed coding patterns and API examples
- `GEMINI.md` — Architecture overview and file reference
