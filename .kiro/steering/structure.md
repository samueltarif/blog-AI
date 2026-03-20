# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel (auth required)
│   │   ├── integrations/  # Webhook management
│   │   ├── login/         # Admin authentication
│   │   ├── posts/         # Post CRUD operations
│   │   │   ├── new/       # Create new post
│   │   │   └── [id]/edit/ # Edit existing post
│   │   └── queue/         # Topic queue management
│   ├── api/               # API routes
│   │   └── webhooks/      # Webhook dispatch endpoints
│   ├── post/              # Public post pages
│   │   └── [id]/          # Individual post view
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage (post list)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── auth-context.tsx   # Authentication context provider
│   ├── firebase.ts        # Firebase initialization
│   ├── firebase-utils.ts  # Firestore error handling
│   ├── image-utils.ts     # Image compression utilities
│   ├── utils.ts           # General utilities (cn helper)
│   └── webhook-utils.ts   # Webhook dispatch logic
├── hooks/                 # Custom React hooks
└── .kiro/                 # Kiro AI assistant configuration
    └── steering/          # AI guidance documents
```

## Architectural Patterns

### Client Components
- All admin pages use 'use client' directive
- State management with React hooks (useState, useAuth)
- Form handling with React Hook Form + Zod validation

### Server Components
- Public pages (homepage, post detail) are server components by default
- Fetch data directly in components using Firebase Admin SDK patterns

### Data Flow
1. Client components interact with Firebase client SDK
2. Firestore collections: users, posts, topic_queue, integrations
3. API routes handle server-side operations (webhook dispatch)
4. Auth context wraps admin routes for protection

### Styling Conventions
- Tailwind utility classes for all styling
- Component variants use class-variance-authority
- Motion components for animations (initial, animate, transition props)
- Responsive design with mobile-first approach

### File Naming
- Pages: kebab-case (e.g., new-post.tsx)
- Components: kebab-case (e.g., post-card.tsx)
- Utilities: kebab-case (e.g., firebase-utils.ts)
- React components: PascalCase export names

### Import Patterns
- Use `@/` path alias for imports from project root
- Firebase imports from `@/lib/firebase`
- Component imports from `@/components/`
- Utility imports from `@/lib/`

### Configuration Files
- `firebase-applet-config.json`: Firebase credentials (pre-configured)
- `firebase-blueprint.json`: Firestore schema definitions
- `.env.local`: Environment variables (Gemini API key)
- `firestore.rules`: Security rules for Firestore

## Key Conventions

- TypeScript strict mode - all files must be properly typed
- No prop-types - use TypeScript interfaces/types
- Async/await for all async operations
- Error handling with try/catch and firebase-utils helpers
- Date handling with date-fns (ptBR locale)
- Markdown content stored as strings, rendered with react-markdown
- Images stored as Base64 strings or URLs in Firestore
