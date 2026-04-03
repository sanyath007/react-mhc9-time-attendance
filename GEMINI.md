# Project: React MHC9 Time Attendance

A React-based time attendance system with integrated face recognition capabilities, designed for employee check-in and management.

## Project Overview

- **Core Functionality:** Employee registration, face registration, and automated check-in using real-time face recognition.
- **Main Technologies:**
    - **Framework:** React 19 (Vite, TypeScript)
    - **Styling:** Tailwind CSS
    - **Face Recognition:** `face-api.js`
    - **State Management:** React Context API (Auth Context)
    - **Routing:** React Router DOM
    - **API Communication:** Axios with interceptors
    - **Form Management:** React Hook Form + Zod
- **Architecture:**
    - `src/api`: Centralized API client with authentication interceptors.
    - `src/components/features`: Feature-specific components (e.g., CheckIn, EmployeeAvatar).
    - `src/components/layouts`: Page layouts (Auth, Protected, Default).
    - `src/contexts`: Global state providers (e.g., AuthProvider).
    - `src/pages`: Main application views organized by feature.
    - `src/utils`: Shared utilities for camera, face-api, image processing, and tokens.
    - `public/models`: Pre-trained models for `face-api.js`.

## Building and Running

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Commands
- `npm install`: Install project dependencies.
- `npm run dev`: Start the local development server (Vite).
- `npm run build`: Compile and minify the project for production.
- `npm run lint`: Run ESLint to identify and fix code style issues.
- `npm run preview`: Locally preview the production build.

## Development Conventions

### Coding Style
- **TypeScript:** Use strict typing for all components, hooks, and utilities.
- **Components:** Prefer functional components with React Hooks.
- **Styling:** Use Tailwind CSS utility classes. Follow mobile-first design principles where applicable.
- **API:** Use the centralized `api` instance from `src/api/index.ts` for all network requests.
- **Icons:** Use `lucide-react` for consistent iconography.

### State & Auth
- **Auth State:** Managed via `AuthProvider` in `src/contexts/AuthContect.tsx`.
- **JWT Storage:** `access_token` and `auth_user` are stored in `localStorage`.
- **Interceptors:** The API client automatically appends the `Authorization` header and handles 401 (Unauthorized) responses by redirecting to the login page.

### Face Recognition
- Models are loaded from `public/models/` using `src/utils/face-recognition.ts`.
- The application supports both SSD Mobilenet v1 and Tiny Face Detector.

## Key Files & Directories

- `src/main.tsx`: Entry point.
- `src/components/App.tsx`: Routing configuration and layout hierarchy.
- `src/api/index.ts`: Axios instance with request/response logic.
- `src/contexts/AuthContect.tsx`: Authentication logic and user state.
- `src/utils/face-recognition.ts`: Model loading and face-api initialization.
- `src/pages/CheckIn/index.tsx`: Main interface for face recognition check-in.
- `src/pages/Employee/FaceRegistration.tsx`: Interface for registering employee face data.

## Deployment Notes

- Ensure `VITE_API_URL` is set to the correct production endpoint in the `.env` file.
- If deploying to a sub-directory (e.g., `/check-in`), update the `homepage` in `package.json`, the `basename` in the Router, and the `base` option in `vite.config.ts` as specified in the `README.md`.
