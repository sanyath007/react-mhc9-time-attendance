# MHC9 Time Attendance System - AI Coding Guidelines

## Architecture Overview
This is a React TypeScript application for employee time attendance management, part of a larger MHC9 ERP system with multiple interconnected applications (Laravel backends + React frontends).

**Key Components:**
- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Backend**: Laravel APIs (separate repositories)
- **Features**: Face recognition check-in, employee management, attendance tracking, geolocation validation

## Core Patterns & Conventions

### Authentication & API
- **JWT Authentication**: Store tokens in `localStorage` as `access_token` and user data as `auth_user`
- **API Client**: Use the configured axios instance from `src/api/index.ts`
  - Regular endpoints: Bearer token auth
  - `/api/time-attendance/` endpoints: API key auth (`VITE_API_KEY`)
- **Token Verification**: Always check token expiration before API calls using `verifyToken()` utility

### Component Structure
```
src/
├── components/
│   ├── layouts/          # Page layouts (Protected, Auth, Default)
│   ├── ui/              # Reusable UI components
│   └── App.tsx          # Main app with routing
├── pages/               # Page components (organized by feature)
├── hooks/               # Custom React hooks
├── contexts/            # React contexts (AuthContext)
├── api/                 # API client configuration
├── utils/               # Utility functions
└── lib/                 # Types and shared logic
```

### Routing & Layouts
- **Protected Routes**: Use `ProtectedLayout` (includes Navbar + Footer + gradient background)
- **Auth Routes**: Use `AuthLayout` for login/register pages
- **Public Routes**: Use `DefaultLayout` for public access
- **Route Structure**: Feature-based organization (`/attendance/*`, `/employee/*`)

### Styling
- **Tailwind CSS v3**: Use utility classes extensively
- **Responsive Design**: Always include mobile variants (`max-md:*`)
- **Conditional Classes**: Use `cn()` utility from `src/utils/tailwindcss.ts`
- **Icons**: Lucide React icons with consistent sizing
- **Color Scheme**: Blue/indigo gradients, consistent with MHC9 branding

### Forms & Validation
- **Form Library**: React Hook Form with Zod schemas
- **Validation**: Define schemas in component files or separate validation files
- **Error Handling**: Display validation errors using form state

### TypeScript
- **Strict Mode**: Enabled with comprehensive linting
- **Type Definitions**: Centralize in `src/lib/types.ts`
- **Interface Naming**: PascalCase for interfaces, camelCase for properties

## Development Workflow

### Environment Setup
1. Copy `.env` to `.env.local` and configure variables
2. Set `VITE_API_URL` to backend API URL
3. For production builds:
   - Set `homepage` in `package.json` to deployment path
   - Set `base` in `vite.config.ts` to match deployment path (e.g., '/check-in/')
   - Update `VITE_API_URL` to production URL
   - Set office coordinates: `VITE_OFFICE_LATITUDE`, `VITE_OFFICE_LONGITUDE`

### Build Commands
```bash
npm run dev          # Development server (default port 5002)
npm run build        # Production build (includes TypeScript compilation)
npm run lint         # ESLint checking
npm run preview      # Preview production build
```

### Key Files to Reference
- `src/api/index.ts` - API client with authentication interceptors
- `src/contexts/AuthContect.tsx` - Authentication context
- `src/components/layouts/Protected.tsx` - Protected route layout
- `src/lib/types.ts` - TypeScript type definitions
- `src/utils/tailwindcss.ts` - Tailwind utility function
- `src/utils/face-recognition.ts` - Face API model loading
- `src/hooks/useLocation.ts` - Geolocation utilities
- `src/hooks/useLiveLocation.ts` - Live location tracking

## Common Patterns

### API Calls
```typescript
import api from '../api';

// GET request with auth
const response = await api.get('/api/employees');

// POST with data
const result = await api.post('/api/attendance/check-in', data);
```

### Component Structure
```tsx
import { cn } from '../../utils/tailwindcss';

const MyComponent = ({ className }: { className?: string }) => (
  <div className={cn("base-classes", className)}>
    {/* Content */}
  </div>
);
```

### Responsive Design
```tsx
<div className="text-2xl max-md:text-xl p-6 max-md:p-3">
  {/* Responsive text and padding */}
</div>
```

### Authentication Checks
```tsx
import { useAuth } from '../../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  // Use authentication state
};
```

### Face Recognition Integration
```typescript
import { loadModels } from '../../utils/face-recognition';

// Load face-api.js models
loadModels(() => {
  // Models loaded, start detection
});
```

### Geolocation Validation
```typescript
import { useLiveLocation } from '../../hooks/useLiveLocation';
import { useGeolocation } from '../../hooks/useLocation';

const location = useLiveLocation();
const { calculateDistance } = useGeolocation();

const distance = calculateDistance(
  location.latitude, location.longitude,
  OFFICE_LATITUDE, OFFICE_LONGITUDE
);
```

## Integration Points
- **Laravel Backend**: RESTful APIs with JWT authentication
- **Face Recognition**: Uses `face-api.js` for employee face registration/verification
- **Geolocation**: Validates check-in distance from office coordinates
- **File Uploads**: Employee avatars stored on backend, accessed via `REACT_APP_API_URL/uploads/`

## Error Handling
- API errors: Handle in interceptors and component try/catch blocks
- Authentication errors: Redirect to login page
- Validation errors: Display using React Hook Form error state
- Face recognition errors: Alert user and retry model loading

## Deployment Notes
- Build output goes to `dist/` directory
- Configure web server for SPA routing (handle client-side routes)
- Ensure API endpoints are accessible from deployment domain
- Face recognition models served from `/models/` or `/check-in/models/` in production
