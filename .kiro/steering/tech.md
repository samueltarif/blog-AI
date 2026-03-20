# Technology Stack

## Framework & Runtime

- Next.js 15 (App Router) with TypeScript 5.9
- React 19 with React DOM 19
- Node.js 18+
- Standalone output mode for deployment

## Backend & Database

- Firebase 12.11 (Firestore, Auth)
- Google Gemini AI (@google/genai 1.17)
  - gemini-3.1-pro-preview: Long-form article generation
  - gemini-2.5-flash-image: Cover image generation
  - gemini-3-flash-preview: Research briefs with Google Search

## UI & Styling

- Tailwind CSS 4.1 with @tailwindcss/typography
- Motion 12.23 (framer-motion successor) for animations
- Lucide React for icons
- class-variance-authority + clsx + tailwind-merge for component variants

## Forms & Validation

- React Hook Form 7.71 with @hookform/resolvers
- Zod 4.3 for schema validation

## Utilities

- date-fns 4.1 with ptBR locale for date formatting
- react-markdown 10.1 for rendering Markdown content

## Development Tools

- ESLint 9.39 with Next.js config
- Firebase Tools 15.0
- TypeScript strict mode enabled

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run dev -- -p 3001   # Use alternate port

# Build & Deploy
npm run build            # Production build
npm run start            # Start production server

# Maintenance
npm run lint             # Run ESLint
npm run clean            # Clean Next.js cache
```

## Configuration Notes

- Path aliases: `@/*` maps to project root
- ESLint errors ignored during builds (ignoreDuringBuilds: true)
- TypeScript build errors NOT ignored (ignoreBuildErrors: false)
- HMR can be disabled via DISABLE_HMR env var (AI Studio optimization)
- Remote images allowed from picsum.photos
- Module resolution: bundler mode
- React strict mode enabled
