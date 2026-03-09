# MHC9 Time Attendance System - AI Coding Guidelines

## Architecture Overview
This is a React TypeScript application for employee time attendance management, part of a larger MHC9 ERP system with multiple interconnected applications (Laravel backends + React frontends).

**Key Components:**
- **Frontend**: React 19.2 + TypeScript + Vite
- **Backend**: Laravel APIs (separate repositories)
- **Features**: Face recognition check-in, employee management, attendance tracking

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
- **Tailwind CSS v4**: Use utility classes extensively
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
1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to backend API URL
3. For production builds:
   - Set `homepage` in `package.json` to deployment path
   - Set `base` in `vite.config.ts` to match deployment path
   - Update `VITE_API_URL` to production URL

### Build Commands
```bash
npm run dev          # Development server
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

## Integration Points
- **Laravel Backend**: RESTful APIs with JWT authentication
- **Face Recognition**: Uses `face-api.js` for employee face registration/verification
- **File Uploads**: Employee avatars stored on backend, accessed via `REACT_APP_API_URL/uploads/`

## Error Handling
- API errors: Handle in interceptors and component try/catch blocks
- Authentication errors: Redirect to login page
- Validation errors: Display using React Hook Form error state

## Deployment Notes
- Build output goes to `build/` directory
- Configure web server for SPA routing (handle client-side routes)
- Ensure API endpoints are accessible from deployment domain
