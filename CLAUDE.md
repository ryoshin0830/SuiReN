# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database setup/migrations
npx prisma generate
npx prisma db push

# Seed initial data
node scripts/seed.js
```

### Testing API Endpoints
```bash
# Get all contents
curl http://localhost:3000/api/contents

# Get specific content
curl http://localhost:3000/api/contents/[id]

# Create new content (see README for full JSON examples)
curl -X POST http://localhost:3000/api/contents -H "Content-Type: application/json" -d '{...}'

# Update content
curl -X PUT http://localhost:3000/api/contents/[id] -H "Content-Type: application/json" -d '{...}'

# Delete content
curl -X DELETE http://localhost:3000/api/contents/[id]
```

## Architecture

### Overview
­´êé (Speed Reading Gorilla) is a Next.js 15 web application for Japanese language learners to practice speed reading. It tracks reading time, measures comprehension through quizzes, and generates color-coded QR codes based on performance.

### Key Components

#### Frontend Structure
- **App Router**: Uses Next.js App Router (src/app/)
- **Layout**: Glassmorphism design with animations (src/components/Layout.js)
- **Reading Flow**: Content preview prevention ’ timed reading ’ comprehension quiz ’ results
- **Admin Interface**: Password-protected content management at /admin (password: gorira)

#### Data Flow
1. **Content Storage**: PostgreSQL via Prisma ORM
2. **Image Handling**: Base64 encoding with compression, stored in JSON fields
3. **Reading Tracking**: Measures time and scroll behavior (src/lib/reading-tracker.js)
4. **Results**: QR codes colored by score (Red <70%, Blue 70-80%, Green >80%)

#### API Design
- RESTful endpoints at /api/contents/*
- Supports full CRUD operations
- Transaction support for complex updates
- Base64 image support with placeholder system ({{IMAGE:id}})

### Database Schema
```prisma
Content {
  id, title, level, levelCode
  text (with {{IMAGE:id}} placeholders)
  images (JSON array of Base64 images)
  questions ’ Question[] ’ QuestionOption[]
}
```

### Key Libraries
- **State Management**: Zustand for global state
- **PDF Generation**: pdfmake for result sheets
- **QR Codes**: qrcode library with custom colors
- **Screenshots**: html2canvas for visual captures
- **Styling**: Tailwind CSS v4 with custom glassmorphism

### Important Implementation Details

#### Next.js 15 Compatibility
- All API routes use `await params` for dynamic segments
- Proper async handling in route handlers

#### Image System
- Images uploaded as Base64 with automatic compression
- Placeholder syntax: `{{IMAGE:image_id}}` in text content
- Maximum 800x600px, 80% quality optimization

#### Japanese Language Support
- Noto Sans JP font for readability
- Ruby text utilities for furigana (src/lib/ruby-utils.js)
- Proper UTF-8 handling throughout

#### Content Management
- Search, filter, sort capabilities in reading library
- Pagination (9 items per page)
- Grid/list view toggle
- No content preview to ensure reading measurement accuracy

### Security Considerations
- Basic password authentication for admin
- No user data stored (stateless reading sessions)
- Environment variables for database connection
- Input validation on all API endpoints