# Product Overview

AI-powered blog platform that automatically generates articles and cover images using Google Gemini AI.

## Core Features

- AI content generation using Gemini 3.1 Pro for long-form articles
- AI image generation using Gemini 2.5 Flash Image for cover images
- Intelligent image compression to Base64 for optimized storage
- Firebase Firestore for data persistence
- Admin authentication system
- Post scheduling and queue management
- Webhook integrations for post publishing
- Responsive modern UI

## User Flows

1. Admin creates posts via AI assistant (provides topic/context) or manual entry
2. AI generates research brief with key points and suggested structure
3. AI writes full article in Markdown and creates custom cover image
4. Admin reviews and edits content before publishing
5. Posts can be saved as draft, scheduled, or published immediately
6. Published posts trigger webhook notifications to integrations

## Data Model

- Users: email, role (admin/user), timestamps
- Posts: title, body (Markdown), excerpt, cover image, status, publish/schedule dates, AI flag
- Topic Queue: pending topics for batch AI generation
- Integrations: webhook URLs for post notifications

## Language

Primary language is Portuguese (Brazil) for UI and content.
