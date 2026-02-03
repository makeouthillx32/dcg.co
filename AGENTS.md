# Agents
This document outlines the various agents—both human roles and system services—within the CMS application, detailing their identifiers, permissions, and specializations based on the Hall Monitor access control system.

## Human Agents (Roles)

### Admin (`role_admin` / `admin1`)
**Description**: Full-access users responsible for overall system management, with specialized capabilities based on assigned specializations.

**Base Permissions**:
- Dashboard and analytics access
- Profile management (read/update own)
- Notification management

**Specializations**:

#### Content Manager
- **Permissions**:
  - Create, update, delete, and publish content across the platform
  - Access content analytics and performance metrics
  - Manage content templates and advanced HTML editing
  - Content library management
- **Available Features**: Advanced content editor, content analytics dashboard, template system
- **Hidden Sections**: User management, system settings (unless multi-specialized)

#### User Manager  
- **Permissions**:
  - Create, read, update, and delete user accounts
  - Assign and modify user roles and specializations
  - Generate, revoke, and inspect invite codes
  - Access user analytics and bulk actions
  - Manage role assignments across the platform
- **Available Features**: User table, role manager, invite system, bulk user operations
- **Hidden Sections**: Content management, system settings (unless multi-specialized)

#### System Admin
- **Permissions**:
  - Full system settings access
  - System backup and maintenance operations
  - System logs and monitoring
  - All user management permissions (inherits User Manager capabilities)
  - Advanced analytics and system-wide reporting
- **Available Features**: System monitor, backup panel, log viewer, complete platform access
- **Hidden Sections**: None (full access)

### Job Coach (`role_jobcoach` / `coachx7`)
**Description**: Specialists who support clients through various coaching methodologies, with access determined by their area of expertise.

**Base Permissions**:
- Dashboard access for all job coaches
- Profile management (own profile + limited client access)
- Basic messaging and notification access

**Specializations**:

#### Career Counselor
- **Permissions**:
  - Full client profile access (view and create)
  - Schedule and manage counseling sessions
  - Access client progress tracking
  - Read training content and resources
- **Primary Actions**: Schedule sessions, update client progress, manage client profiles
- **Available Features**: Client management interface, session scheduling, progress tracking

#### Skills Trainer
- **Permissions**:
  - Create, modify, and delete training content
  - Manage training programs and curricula
  - Assign skill assessments
  - Access training analytics
- **Primary Actions**: Create training content, manage training programs, assign assessments
- **Available Features**: Content creation tools, training management system, assessment platform

#### Employment Specialist
- **Permissions**:
  - Full analytics access for employment outcomes
  - Create and manage client profiles
  - Track employment placements and outcomes
  - Generate comprehensive reports
  - Modify analytics data and settings
- **Primary Actions**: Track employment outcomes, generate reports, manage job placements
- **Available Features**: Advanced analytics, outcome reporting, placement tracking

**Shared Job Coach Features**:
- All job coaches can read training content and access basic analytics
- Session scheduling available to Career Counselors and Employment Specialists
- Client access limited to Career Counselors and Employment Specialists

### Client (`role_client` / `client7x`)
**Description**: End users who access personalized services based on their career development needs and goals.

**Base Permissions**:
- Personal dashboard access
- Profile editing and management
- Message center access
- Basic resource access

**Specializations**:

#### Job Seeker
- **Permissions**:
  - Access job search functionality
  - Apply to job postings
  - Book coaching sessions
  - Upload and manage resume
  - Track job applications
- **Available Features**: Job search portal, application tracker, resume builder, session booking
- **Primary Actions**: Apply to jobs, book coaching sessions, update resume

#### Skill Builder
- **Permissions**:
  - Enroll in courses and training programs
  - Take skill assessments
  - Track learning progress
  - Access certificates and achievements
- **Available Features**: Course catalog, progress tracker, skill assessment tools, certificate display
- **Primary Actions**: Enroll in courses, take assessments, track progress

#### Career Changer
- **Permissions**:
  - Create career transition plans
  - Access career exploration tools
  - Book specialized career coaching sessions
  - Set and track career milestones
- **Available Features**: Career explorer, transition planner, career coaching, milestone tracking
- **Primary Actions**: Create transition plans, book career coaching, explore careers

**Multi-Specialization Access**:
- Course access available to both Skill Builders and Career Changers
- Session booking available to Job Seekers and Career Changers
- Specialized content based on combination of assigned specializations

### User (`role_user` / `user0x`)
**Description**: Default authenticated users with basic platform access and limited tool availability.

**Permissions**:
- Access to public and basic-feature pages
- Limited tool access (general utilities)
- Basic profile management

**Available Tools**:
- Timesheet Calculator
- Punch Card Maker
- General productivity tools

## System Agents (API Services)

### Calendar & Scheduling System (`/api/schedule`)
**Purpose**: Comprehensive calendar management for client-coach interactions
**Capabilities**:
- Business schedule retrieval by week and day
- Calendar event creation, updating, and deletion
- Multi-role calendar access (clients, coaches, admins)
- Integration with business location data
- Support for recurring events and patterns

**Database Integration**:
- `calendar_events` table with role-based access
- `client_coach_assignments` for relationship management
- `dim_calendar` for business day calculations
- `coach_daily_reports` for KRC compliance reporting

### Weather Service (`/api/Weather`)
**Purpose**: External weather data integration for location-based services
**Capabilities**:
- Real-time weather data retrieval via WeatherAPI
- Location-based weather queries
- Error handling and fallback responses
- Environment variable configuration for API keys

### Product & Catalog Management (`/api/catalog`, `/api/products`)
**Purpose**: E-commerce and product management functionality
**Capabilities**:
- Hierarchical catalog management (Sections → Subsections → Products)
- Full category tree retrieval
- Product CRUD operations
- Shop section data management

**Database Structure**:
- `Main_Sections` for top-level categories
- `Sub_Sections` for nested organization
- `Products` with pricing and categorization

### Profile Management (`/api/profile`)
**Purpose**: User profile and role management
**Capabilities**:
- Profile data retrieval and updates
- Avatar and contact information management
- Role-based data access
- Integration with authentication system

## Frontend Tools (UI Agents)

### PunchCardMaker (`/components/tools/PunchCardMaker`)
**Purpose**: Generate printable time-tracking punch cards
**Features**:
- Multiple template selection (4 available templates)
- Customizable punch card quantity
- Live template preview
- PDF generation and download
- Grid-based layout for efficient printing

**User Access**: Available to all authenticated users

### TimesheetCalculator (`/components/tools/timesheet-calculator`)
**Purpose**: Multi-week timesheet calculation and pay computation
**Features**:
- Multi-week timesheet management
- Dynamic time entry with multiple formats (decimal, colon-separated)
- Automatic pay calculation based on hourly rates
- Week-to-week copying functionality
- Comprehensive totaling across all weeks
- Export and save capabilities

**User Access**: Available to all authenticated users, particularly useful for coaches logging hours

### CalendarBox (`/components/CalenderBox`)
**Purpose**: Visual calendar interface with role-based event display
**Features**:
- Monthly calendar grid with responsive design
- Event filtering based on user role and permissions
- Color-coded event types
- Hover details and click interactions
- Integration with calendar API services

**Access Control**: Events displayed based on user role and calendar permissions

### Tool Placeholders (tool-1, tool-2)
**Purpose**: Extensible framework for future feature development
**Architecture**: Modular component system for rapid feature addition
**Configuration**: Managed through `lib/toolsConfig.ts` for easy expansion

## Role-Based Access Control (Hall Monitor System)

### Access Control Architecture
The platform implements a sophisticated role-based access control system through "Hall Monitors" that determine user permissions based on:

1. **Base Role**: Admin, Job Coach, Client, or User
2. **Specializations**: Specific expertise areas within each role
3. **Context**: Situational permissions based on relationships (e.g., coach-client assignments)

### Permission Levels
- **Resource-Action Model**: Each permission defined by resource (e.g., 'clients', 'content') and action (e.g., 'create', 'read', 'update', 'delete')
- **Specialization-Based**: Enhanced permissions granted through role specializations
- **Contextual**: Dynamic permissions based on user relationships and data ownership

### Navigation and UI Customization
- **Dynamic Navigation**: Menu items generated based on user role and specializations
- **Hidden Sections**: Interface elements hidden based on access level
- **Custom Fields**: Additional form fields and options enabled by specializations
- **Feature Flags**: Granular control over feature availability

## Integration and Data Flow

### Authentication Integration
All agents integrate with Supabase authentication and the profiles table for role determination, ensuring consistent access control across the platform.

### Database Relationships
- **Profiles Table**: Central user management with role assignments
- **Specializations**: Many-to-many relationship enabling flexible role capabilities
- **Calendar System**: Role-aware event management with client-coach relationships
- **Audit Trail**: Comprehensive logging for all agent actions and system changes

### API Security
- Row Level Security (RLS) disabled for simplified access control
- Application-level permissions through Hall Monitor system
- Input validation and error handling across all API endpoints
- Environment variable management for external service integration

---

*Last updated: June 8, 2025*
*This document reflects the current Hall Monitor access control implementation and should be updated as new agents or specializations are added to the system.*