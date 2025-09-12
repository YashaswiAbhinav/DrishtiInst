# Drishti Institute Learning Management System

## Overview

Drishti Institute LMS is a comprehensive online learning platform designed for Class 9-12 students focusing on science subjects (Physics, Chemistry, Mathematics, and Biology). The platform provides video-based education with features for course management, user authentication, progress tracking, and interactive learning experiences. The system is built with a modern full-stack architecture using React for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Client-side routing with state-based navigation for different application views
- **Animation**: Framer Motion for smooth transitions and interactive animations
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API structure with `/api` prefix for all endpoints
- **Middleware**: Custom logging middleware for request/response tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot reload with Vite integration for seamless development experience

### Database Layer
- **Database**: PostgreSQL for reliable, scalable data storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Migrations**: Drizzle Kit for database schema versioning and migrations
- **Connection**: Neon Database serverless connection for scalable cloud database access
- **Schema Definition**: Centralized schema definitions in shared directory for consistency

### Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Username/password authentication with planned expansion for email verification
- **Authorization**: Role-based access control for different user types (students, instructors)

### Content Management
- **Video Hosting**: Integration-ready for Google Drive video embedding
- **Course Structure**: Hierarchical organization (Courses → Subjects → Videos)
- **Progress Tracking**: User enrollment and completion tracking capabilities
- **Content Delivery**: Optimized for educational content with mobile-responsive design

### Design System
- **Color Palette**: Institute-branded blue theme with educational focus
- **Typography**: Inter font family for clean, readable text across all devices
- **Component Library**: Shadcn/ui providing accessible, customizable UI components
- **Responsive Design**: Mobile-first approach ensuring accessibility across device types
- **Educational UX**: Age-appropriate design for Class 9-12 students with clear navigation

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for scalable cloud database management
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries

### UI & Design Libraries
- **Shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Modern icon library for consistent iconography

### Development & Build Tools
- **Vite**: Next-generation frontend build tool for fast development and optimized builds
- **TypeScript**: Static type checking for enhanced code quality and developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Content & Media
- **Google Fonts**: Inter font family for consistent typography
- **Google Drive**: Video hosting and embedding capabilities (integration-ready)
- **Framer Motion**: Animation library for enhanced user interactions

### Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for form data and API contracts
- **Hookform Resolvers**: Integration layer between React Hook Form and Zod validation

### Development Environment
- **Replit**: Cloud-based development environment with integrated tooling
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Minimal web application framework for Node.js