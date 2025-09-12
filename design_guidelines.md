# Drishti Institute LMS Design Guidelines

## Design Approach
**System-Based Approach**: Utilizing a clean, educational-focused design system prioritizing functionality and accessibility for students across different age groups (Class 9-12). Drawing inspiration from successful educational platforms like Khan Academy and Coursera.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Institute Blue: 220 85% 45% (main brand color)
- Deep Blue: 220 90% 35% (darker variant)
- Light Blue: 220 60% 92% (backgrounds)

**Supporting Colors:**
- White: 0 0% 100% (primary background)
- Gray Text: 220 15% 25% (primary text)
- Light Gray: 220 10% 96% (secondary backgrounds)
- Success Green: 140 70% 45% (enrolled status)
- Warning Orange: 35 85% 55% (notifications)

### B. Typography
**Primary Font**: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- UI Elements: 500 weight

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-medium
- Body Text: text-base font-normal
- Captions: text-sm text-gray-600

### C. Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: mb-8, mb-12
- Card spacing: gap-4, gap-6
- Container max-width: max-w-7xl

### D. Component Library

**Navigation:**
- Top navbar: Clean white background with institute logo and user profile
- Sidebar: Collapsible navigation for dashboard sections
- Breadcrumbs: For course → subject → video navigation

**Cards:**
- Course cards: Clean white cards with subtle shadow, rounded corners (rounded-lg)
- Video cards: Thumbnail preview with play icon overlay
- Dashboard widgets: Announcement cards with blue accent borders

**Forms:**
- Input fields: border-gray-300 with blue focus states
- Buttons: Primary blue (bg-blue-600), secondary outline variants
- Registration form: Multi-step with progress indicator

**Data Display:**
- Course listings: Grid layout (3-4 columns on desktop)
- Video lists: Organized by subject with expandable sections
- Enrollment status: Clear visual indicators

**Video Player:**
- Custom controls with institute branding
- Username watermark overlay
- Fullscreen disabled, download disabled

### E. Page-Specific Designs

**Welcome Page:**
- Hero section with institute imagery and "Get Started" CTA
- Sections for institute info, founder details, topper highlights
- Mobile app promotion banner
- Clean, professional layout representing educational excellence

**Dashboard:**
- Widget-based layout: announcements, enrolled courses, popular courses
- Quick navigation to recently watched videos
- Progress indicators for course completion

**Courses Page:**
- Class-wise organization (9, 10, 11, 12)
- Subject breakdown within each class
- Clear enrollment status indicators

**Authentication:**
- Clean, centered forms with institute branding
- OTP verification modal overlays
- Password recovery flow with clear instructions

### Images
**Hero Image**: Professional educational setting or institute building as background for welcome page hero section
**Course Thumbnails**: Subject-specific icons or illustrations for Physics, Chemistry, Math, Biology
**Founder Image**: Professional headshot for "About Sir" section
**Student Images**: Success story photos for topper highlights section

No large hero images recommended - focus on clean, functional design that prioritizes content accessibility over visual drama.