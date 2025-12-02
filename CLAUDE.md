# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clevio is a Next.js kindergarten website with dynamic content management. It uses a unique template-based approach where an HTML template (`src/templates/home.html`) is rendered dynamically with data injected via a client-side React component (`ThemeBinder`).

## Key Architecture

### Template-Based System
- **Template File**: `src/templates/home.html` - Raw HTML template from GramenTheme
- **ThemeBinder**: `src/components/home/ThemeBinder.tsx` - Client component that injects JSON data into HTML template
- **Content Data**: `data/content.json` - All website content (text, images, URLs) stored as JSON
- **Type Safety**: `src/types/content.ts` - TypeScript interfaces for content structure

### Content Management
- **Admin Dashboard**: `/admin` route with form inputs and file uploaders (base64 conversion)
- **API Endpoint**: `PUT /api/content` - Updates content.json with optional n8n webhook sync
- **Authentication**: Simple cookie-based session system using environment variables

### Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Access Points
- **Public Site**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Login Page**: `http://localhost:3000/login`

### Content Structure
All website content is managed through `data/content.json` with the following main sections:
- `branding` - Site name, logo, contact info, social media
- `navigation` - Main menu items
- `hero` - Hero section content and media
- `programs` - Kindergarten program listings
- `about` - About section with stats and features
- `testimonials` - Parent testimonials
- `blog` - News and articles
- `contact` - Contact information
- `footer` - Footer content and links

### Authentication Environment Variables
```
ADMIN_EMAIL=admin@clevio.id
ADMIN_PASSWORD=clevio123
AUTH_SECRET=ganti-dengan-string-random
```

### n8n Integration
Optional webhook sync for automated workflows:
```
N8N_SYNC_WEBHOOK=https://workflow.n8n.cloud/webhook/xxx
```

### Important Files
- `src/lib/content.ts` - Helper functions for reading/writing content JSON
- `src/lib/auth.ts` - Authentication utilities
- `src/components/home/HomePage.tsx` - Main page component
- `src/components/admin/AdminDashboard.tsx` - Admin interface
- `public/assets/` - Static CSS/JS assets from original theme

### Development Notes
- The ThemeBinder component manipulates the DOM directly to inject data
- Images are stored as base64 strings in the JSON for simplicity
- The original HTML template structure is preserved - only content is replaced
- All styling comes from the original theme assets in `public/assets/`