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

# Create new content (requires full JSON payload - see API examples)
curl -X POST http://localhost:3000/api/contents -H "Content-Type: application/json" -d '{...}'

# Update content
curl -X PUT http://localhost:3000/api/contents/[id] -H "Content-Type: application/json" -d '{...}'

# Delete content
curl -X DELETE http://localhost:3000/api/contents/[id]

# Excel template download
curl http://localhost:3000/api/excel/template -o template.xlsx

# Excel upload
curl -X POST http://localhost:3000/api/excel/upload -F "file=@content.xlsx"
```

## Architecture

### Overview
すいすい (Speed Reading Gorilla) is a Next.js 15 web application for Japanese language learners to practice speed reading. It tracks reading time, measures comprehension through quizzes, and generates color-coded QR codes based on performance.

### Key Components

#### Frontend Structure
- **App Router**: Uses Next.js App Router (src/app/)
- **Layout**: Glassmorphism design with animations (src/components/Layout.js)
- **Reading Flow**: Content preview prevention → timed reading → comprehension quiz → results
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
- Excel import/export functionality

### Database Schema
```prisma
Content {
  id, title, level, levelCode
  text (with {{IMAGE:id}} placeholders)
  images (JSON array of Base64 images)
  questions → Question[] → QuestionOption[]
}
```

### Key Libraries
- **PDF Generation**: pdfmake for result sheets
- **QR Codes**: qrcode library with custom colors
- **Screenshots**: html2canvas for visual captures
- **Excel Processing**: xlsx for import/export
- **Styling**: Tailwind CSS v4 with custom glassmorphism
- **Cookie Storage**: js-cookie for client preferences

### Important Implementation Details

#### Next.js 15 Compatibility
- All API routes use `await params` for dynamic segments
- Proper async handling in route handlers
- No custom next.config.mjs modifications needed

#### Image System
- Images uploaded as Base64 with automatic compression
- Placeholder syntax: `{{IMAGE:image_id}}` in text content
- Maximum 800x600px, 80% quality optimization
- Images displayed inline within reading content

#### Japanese Language Support
- Noto Sans JP font for readability
- Ruby text utilities for furigana (src/lib/ruby-utils.js)
- Proper UTF-8 handling throughout
- Support for vertical text reading modes

#### Content Management
- Search, filter, sort capabilities in reading library
- Pagination (9 items per page)
- Grid/list view toggle
- No content preview to ensure reading measurement accuracy
- Excel bulk import with validation

### Security Considerations
- Basic password authentication for admin
- No user data stored (stateless reading sessions)
- Environment variables for database connection
- Input validation on all API endpoints
- CORS handling for API routes

### Common Tasks

#### Adding New Content
1. Navigate to /admin (password: gorira)
2. Use the form or upload Excel template
3. Images will be automatically compressed and converted to Base64

#### Modifying Question Types
Questions support multiple choice format with explanations. To add new question types, modify:
- Database schema in schema.prisma
- API handlers in app/api/contents/
- Question components in app/test/[id]/

#### Customizing Result Display
Result calculation and display logic is in:
- app/test/[id]/page.js for result processing
- components/ResultDisplay.js for UI rendering
- QR code colors defined by score thresholds

### Environment Setup
Required environment variables (.env.local):
```
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
```