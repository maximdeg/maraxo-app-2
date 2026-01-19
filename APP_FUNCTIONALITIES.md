# Maraxo App - Complete Functionality Documentation

## Application Overview

**Maraxo App** is a comprehensive medical appointment scheduling system for Dra. Mara Flamini's dermatology practice. Built with Next.js 15, TypeScript, React, and PostgreSQL, it provides a full-featured PWA (Progressive Web App) for patients to schedule, manage, and cancel appointments.

---

## Core Features

### 1. Patient Appointment Scheduling (`/agendar-visita`)

**Purpose**: Allows patients to book appointments online.

**Key Functionalities**:
- **Patient Information Collection**:
  - First name and last name (minimum 2 characters each)
  - Phone number (10-15 characters, validated format)
  - Unique phone number validation to prevent duplicates

- **Visit Type Selection**:
  - **Consulta** (Consultation): General dermatology consultation
  - **Practica** (Practice): Surgical procedures (requires practice type selection)
    - Criocirugía (Cryosurgery)
    - Electrocoagulación (Electrocoagulation)
    - Biopsia (Biopsy)

- **Consult Type Selection** (for Consulta):
  - Primera vez (First time)
  - Seguimiento (Follow-up)

- **Health Insurance Selection**:
  - Dynamic list loaded from `/api/health-insurance`
  - Different options based on visit type:
    - Consulta: Shows all except "Practica Particular"
    - Practica: Shows all except "Particular"
  - Displays pricing information when available

- **Date Selection**:
  - Calendar component with date restrictions:
    - No past dates allowed
    - Maximum 30 days in advance
    - Weekends disabled (Saturday and Sunday)
    - Holiday dates disabled
    - Real-time availability checking

- **Time Slot Selection**:
  - Dynamic time generation based on:
    - Work schedule configuration
    - Available slots for selected day
    - Existing appointments (excludes cancelled)
    - 20-minute intervals between slots
  - Automatically filters out booked times
  - Shows "No hay horarios disponibles" when no slots available

- **Form Validation**:
  - Client-side validation using Zod schema
  - Real-time error messages
  - Prevents submission until all fields valid

- **Appointment Creation**:
  - Creates or finds existing patient by phone number
  - Creates appointment with all selected details
  - Generates secure cancellation token
  - Returns appointment confirmation with cancellation link

**API Endpoints Used**:
- `POST /api/appointments/create` - Creates appointment
- `GET /api/available-times/[date]` - Fetches available time slots
- `GET /api/health-insurance` - Loads health insurance options
- `GET /api/appointments/date/[date]` - Checks existing appointments

---

### 2. Appointment Confirmation Page (`/confirmation`)

**Purpose**: Displays appointment details after successful booking.

**Key Functionalities**:
- **Appointment Details Display**:
  - Patient name and phone number
  - Visit type and sub-type (consult/practice type)
  - Appointment date (formatted in Spanish)
  - Appointment time
  - Appointment ID
  - Health insurance information

- **Important Information Sections**:
  - **Arrival Instructions**: Arrive 15 minutes early
  - **Required Documentation**:
    - For Consulta: Order or credential + copay for dermatoscope
    - For Practica: IAPOS 20 vouchers + copay, UNL + copay, or other insurance authorization
    - Previous related studies
  - **Cancellation Policy**: 24-hour advance notice required
  - **Service Types Explanation**:
    - CONSULTA: Clinical and aesthetic dermatology consultation
    - PRÁCTICA: Procedures for existing patients (biopsy, cryosurgery, electrocoagulation)
    - URGENCIAS: Emergency appointments (private only)
  - **Aesthetic Treatments List**:
    - Botulinum toxin
    - Dermapen
    - Fillers
    - Platelet-rich plasma
    - Skinbooster

- **Contact Information**:
  - Clínica María del Rosario: 342-439-3149
  - Clínica de Recreo: 342-582-2437

- **Cancellation Link**:
  - Secure token-based cancellation URL
  - Valid until 12 hours before appointment
  - Direct link to cancellation page

- **Navigation Options**:
  - Agendar Otra Cita (Schedule Another Appointment)
  - Volver al Inicio (Return Home)

**URL Parameters**:
- `patient_name`, `phone_number`, `visit_type_name`, `consult_type_name`, `practice_type_name`, `appointment_date`, `appointment_time`, `appointment_id`, `cancellation_token`

---

### 3. Appointment Cancellation (`/cancelar-cita`)

**Purpose**: Allows patients to cancel appointments using secure token.

**Key Functionalities**:
- **Token Verification**:
  - Validates cancellation token from URL parameter
  - Checks token expiration (12 hours before appointment)
  - Verifies appointment exists and is not already cancelled
  - Displays error if cancellation no longer allowed

- **Appointment Details Display**:
  - Shows all appointment information
  - Warning message about cancellation being permanent
  - Displays cancellation deadline

- **Cancellation Process**:
  - Two-step confirmation (prevents accidental cancellation)
  - Updates appointment status to 'cancelled'
  - Prevents cancellation within 12 hours of appointment
  - Success confirmation page

- **Error Handling**:
  - Invalid/expired token
  - Appointment not found
  - Cancellation deadline passed
  - Already cancelled appointments

**API Endpoints Used**:
- `GET /api/cancel-appointment/verify?token=...` - Verifies token and fetches appointment
- `POST /api/cancel-appointment` - Cancels appointment

**Security Features**:
- JWT-based token system
- Time-based expiration
- Single-use token validation
- Appointment time validation

---

### 4. Admin Dashboard (`/admin`)

**Purpose**: Administrative interface for managing appointments and schedules.

**Key Functionalities**:
- **Calendar View**:
  - Interactive calendar component
  - Date selection for viewing appointments
  - Visual appointment indicators

- **Appointment Management**:
  - View appointments by date
  - Accordion-based appointment list
  - Appointment details display:
    - Patient information
    - Appointment date and time
    - Visit type and consult/practice type
    - Status (scheduled, cancelled, etc.)

- **Work Schedule Management**:
  - Configure working days of the week
  - Set available time slots per day
  - Mark days as unavailable
  - Custom time frames for specific dates

- **Unavailable Time Management**:
  - Block specific time slots
  - Mark entire days as unavailable
  - Confirm unavailable days

**Authentication**:
- Protected route requiring admin login
- JWT token-based authentication
- Session management

**API Endpoints Used**:
- `GET /api/appointments` - Fetch all appointments
- `GET /api/appointments/date/[date]` - Fetch appointments by date
- `GET /api/work-schedule` - Get work schedule
- `POST /api/unavailable-times` - Block time slots
- `GET /api/unavailable-days` - Get unavailable days

---

### 5. Home Page (`/`)

**Purpose**: Landing page with practice information and appointment booking CTA.

**Key Functionalities**:
- **Hero Section**:
  - Practice name and specialty
  - Call-to-action buttons for appointment booking
  - Professional image display

- **Services Section**:
  - Dermatología General (General Dermatology)
  - Dermatología Estética (Aesthetic Dermatology)
  - Cirugía Dermatológica (Dermatological Surgery)

- **PWA Install Button**:
  - Floating install button
  - Browser compatibility checking
  - Installation prompt handling

- **Navigation**:
  - Header with practice branding
  - Quick access to appointment booking
  - Footer with contact information

**Features**:
- Responsive design (mobile-first)
- Smooth animations (Framer Motion)
- SEO optimized metadata
- PWA-ready with manifest

---

## API Endpoints

### Appointment Management

#### `GET /api/appointments`
**Purpose**: Retrieve all appointments.

**Response**:
```json
{
  "appointments": [...],
  "count": number
}
```

**Includes**: Patient names, visit types, consult types, practice types.

---

#### `POST /api/appointments`
**Purpose**: Create a new appointment.

**Request Body**:
```json
{
  "patient_id": number,
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM",
  "consult_type_id": number,
  "visit_type_id": number,
  "practice_type_id": number,
  "health_insurance": string
}
```

**Response**:
```json
{
  "message": "Appointment created successfully",
  "appointment_info": {
    "id": number,
    "patient_name": string,
    "phone_number": string,
    "appointment_date": string,
    "appointment_time": string,
    "consult_type_name": string,
    "visit_type_name": string,
    "practice_type_name": string,
    "health_insurance": string,
    "cancellation_token": string
  }
}
```

**Validations**:
- Required fields check
- Date format validation
- Time format validation (HH:MM)
- Patient existence check
- Duplicate appointment prevention

---

#### `GET /api/appointments/date/[date]`
**Purpose**: Get appointments for a specific date.

**Response**:
```json
{
  "appointments": [...]
}
```

---

#### `POST /api/appointments/create`
**Purpose**: Create appointment with patient (creates patient if doesn't exist).

**Request Body**:
```json
{
  "first_name": string,
  "last_name": string,
  "phone_number": string,
  "visit_type_id": number,
  "consult_type_id": number,
  "practice_type_id": number,
  "health_insurance": string,
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM"
}
```

**Response**:
```json
{
  "is_existing_patient": boolean,
  "appointment_info": {...}
}
```

---

### Available Times

#### `GET /api/available-times`
**Purpose**: Get all available time slots configuration.

**Response**: Array of available slots with day of week.

---

#### `GET /api/available-times/[date]`
**Purpose**: Get available time slots for a specific date.

**Response**:
```json
{
  "availableSlots": {
    "start_time": "HH:MM",
    "end_time": "HH:MM"
  },
  "appointmentTimes": ["HH:MM", ...],
  "date": "YYYY-MM-DD",
  "type": "default_schedule" | "custom_schedule"
}
```

**Logic**:
1. Checks for custom unavailable time frames
2. Checks if day is marked as unavailable
3. Falls back to default schedule for day of week
4. Excludes already booked times
5. Returns error if day is not a working day

---

#### `POST /api/available-times`
**Purpose**: Create a new available time slot.

**Request Body**:
```json
{
  "work_schedule_id": number,
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "is_available": boolean
}
```

---

### Unavailable Times

#### `POST /api/unavailable-times`
**Purpose**: Block a specific time slot on a date.

**Request Body**:
```json
{
  "selectedDate": Date,
  "start_time": "HH:MM",
  "end_time": "HH:MM"
}
```

**Features**:
- Prevents duplicate entries
- Stores in `unavailable_time_frames` table

---

#### `GET /api/unavailable-times?date=YYYY-MM-DD`
**Purpose**: Get unavailable time slots for a date.

**Response**: Array of unavailable time frames.

---

### Work Schedule

#### `GET /api/work-schedule`
**Purpose**: Get work schedule configuration.

**Response**: Array of work schedule entries with day of week and working status.

---

#### `POST /api/work-schedule`
**Purpose**: Create or update work schedule entry.

**Request Body**:
```json
{
  "day_of_week": string,
  "is_working_day": boolean
}
```

**Features**:
- Unique constraint on day_of_week
- Returns 409 Conflict if day already exists

---

### Appointment Cancellation

#### `POST /api/cancel-appointment`
**Purpose**: Cancel an appointment using token.

**Request Body**:
```json
{
  "token": string
}
```

**Validations**:
- Token verification
- Cancellation deadline check (12 hours before)
- Appointment existence check

**Response**:
```json
{
  "success": boolean,
  "message": string,
  "appointmentId": number
}
```

---

#### `GET /api/cancel-appointment/verify?token=...`
**Purpose**: Verify cancellation token and get appointment details.

**Response**:
```json
{
  "appointment": {
    "id": number,
    "appointment_date": string,
    "appointment_time": string,
    "status": string,
    "first_name": string,
    "last_name": string,
    "phone_number": string,
    "visit_type_name": string,
    "consult_type_name": string,
    "practice_type_name": string
  }
}
```

---

### Patient Management

#### `GET /api/patients`
**Purpose**: Get all patients.

**Response**: Array of patient objects.

---

#### `GET /api/patients/[id]`
**Purpose**: Get patient by ID.

**Response**: Patient object with all details.

---

#### `POST /api/patients`
**Purpose**: Create a new patient.

**Request Body**:
```json
{
  "first_name": string,
  "last_name": string,
  "phone_number": string
}
```

**Features**:
- Unique phone number constraint
- Automatic timestamp management

---

### Lookup Data

#### `GET /api/consult-types`
**Purpose**: Get all consultation types.

**Response**: Array of consult type objects.

---

#### `GET /api/visit-types`
**Purpose**: Get all visit types.

**Response**: Array of visit type objects.

---

#### `GET /api/health-insurance`
**Purpose**: Get all health insurance options.

**Response**: Array of health insurance objects with name, price, and notes.

---

### Authentication

#### `POST /api/auth/login`
**Purpose**: Admin login.

**Request Body**:
```json
{
  "email": string,
  "password": string
}
```

**Response**:
```json
{
  "token": string,
  "user": {
    "id": number,
    "email": string,
    "full_name": string,
    "role": string
  }
}
```

**Security**:
- Password hashing with bcrypt (12 rounds)
- JWT token generation (24h expiration)
- Secure cookie storage

---

#### `POST /api/auth/logout`
**Purpose**: Admin logout.

**Response**: Success message.

---

#### `POST /api/auth/forgot-password`
**Purpose**: Request password reset.

**Request Body**:
```json
{
  "email": string
}
```

**Features**:
- Generates secure reset token
- Sends email with reset link
- Token expires in 1 hour

---

#### `POST /api/auth/reset-password`
**Purpose**: Reset password with token.

**Request Body**:
```json
{
  "token": string,
  "newPassword": string
}
```

---

#### `GET /api/auth/verify`
**Purpose**: Verify authentication token.

**Response**: User information if valid.

---

### Push Notifications

#### `POST /api/push/subscribe`
**Purpose**: Subscribe to push notifications.

**Request Body**:
```json
{
  "subscription": {
    "endpoint": string,
    "keys": {
      "p256dh": string,
      "auth": string
    }
  },
  "userAgent": string,
  "timestamp": string
}
```

**Features**:
- Stores subscription in database
- Updates existing subscription if endpoint exists
- VAPID key validation

---

#### `POST /api/push/unsubscribe`
**Purpose**: Unsubscribe from push notifications.

**Request Body**:
```json
{
  "subscription": {...}
}
```

---

#### `POST /api/push/send`
**Purpose**: Send push notification to subscribers.

**Request Body**:
```json
{
  "title": string,
  "body": string,
  "data": object
}
```

---

## Database Schema

### Core Tables

#### `patients`
- `id` (SERIAL PRIMARY KEY)
- `first_name` (VARCHAR(255) NOT NULL)
- `last_name` (VARCHAR(255) NOT NULL)
- `phone_number` (VARCHAR(20) UNIQUE NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indexes**: `phone_number`

---

#### `appointments`
- `id` (SERIAL PRIMARY KEY)
- `patient_id` (INTEGER NOT NULL, FK → patients.id)
- `appointment_date` (DATE NOT NULL)
- `appointment_time` (TIME WITHOUT TIME ZONE NOT NULL)
- `consult_type_id` (INTEGER, FK → consult_types.id)
- `visit_type_id` (INTEGER, FK → visit_types.id)
- `practice_type_id` (INTEGER, FK → practice_types.id)
- `health_insurance` (VARCHAR(255))
- `notes` (TEXT)
- `status` (VARCHAR(50) DEFAULT 'scheduled')
- `cancellation_token` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indexes**: `appointment_date`, `patient_id`

**Status Values**: 'scheduled', 'cancelled', 'completed'

---

#### `work_schedule`
- `id` (SERIAL PRIMARY KEY)
- `day_of_week` (VARCHAR(10) NOT NULL, UNIQUE)
- `is_working_day` (BOOLEAN DEFAULT TRUE NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Days**: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday

---

#### `available_slots`
- `id` (SERIAL PRIMARY KEY)
- `work_schedule_id` (INTEGER NOT NULL, FK → work_schedule.id)
- `start_time` (TIME WITHOUT TIME ZONE NOT NULL)
- `end_time` (TIME WITHOUT TIME ZONE NOT NULL)
- `is_available` (BOOLEAN DEFAULT TRUE NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Purpose**: Defines available time ranges for each day of week.

---

#### `unavailable_time_frames`
- `id` (SERIAL PRIMARY KEY)
- `workday_date` (DATE NOT NULL)
- `start_time` (TIME WITHOUT TIME ZONE NOT NULL)
- `end_time` (TIME WITHOUT TIME ZONE NOT NULL)
- `work_schedule_id` (INTEGER, FK → work_schedule.id)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Purpose**: Blocks specific time slots on specific dates.

---

#### `unavailable_days`
- `id` (SERIAL PRIMARY KEY)
- `unavailable_date` (DATE NOT NULL, UNIQUE)
- `is_confirmed` (BOOLEAN DEFAULT FALSE)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Purpose**: Marks entire days as unavailable.

---

### Lookup Tables

#### `consult_types`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) UNIQUE NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Default Values**:
- Initial Consultation
- Follow-up
- Check-up
- Emergency Consultation

---

#### `visit_types`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) UNIQUE NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Default Values**:
- In-Person
- Online
- Phone Call

**Application Values**:
- Consulta (ID: 1)
- Practica (ID: 2)

---

#### `practice_types`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) UNIQUE NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Default Values**:
- '' (empty, ID: 0)
- Criocirugía (ID: 1)
- Electrocoagulación (ID: 2)
- Biopsia (ID: 3)

---

#### `users`
- `id` (SERIAL PRIMARY KEY)
- `full_name` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password` (VARCHAR(255) NOT NULL) - bcrypt hashed
- `role` (VARCHAR(50) DEFAULT 'admin')
- `reset_token` (VARCHAR(255))
- `reset_token_expires` (TIMESTAMP WITH TIME ZONE)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Purpose**: Admin user authentication.

---

#### `push_subscriptions`
- `id` (SERIAL PRIMARY KEY)
- `endpoint` (TEXT UNIQUE NOT NULL)
- `p256dh_key` (TEXT)
- `auth_key` (TEXT)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Purpose**: Stores PWA push notification subscriptions.

---

## Authentication & Security

### JWT Token System

**Purpose**: Secure authentication for admin panel.

**Implementation**:
- Secret key from `JWT_SECRET` environment variable (minimum 32 characters)
- 24-hour token expiration
- Token stored in HTTP-only cookies
- Token verification on protected routes

**Token Payload**:
```json
{
  "id": number,
  "email": string,
  "role": string,
  "full_name": string,
  "iat": number,
  "exp": number
}
```

---

### Cancellation Token System

**Purpose**: Secure, time-limited appointment cancellation links.

**Implementation**:
- JWT-based tokens
- Expires 12 hours before appointment time
- Contains appointment ID, patient ID, phone, date, and time
- Single-use validation
- Prevents cancellation within 12 hours of appointment

**Token Generation**:
```typescript
generateCancellationToken({
  appointmentId: string,
  patientId: string,
  patientPhone: string,
  appointmentDate: string,
  appointmentTime: string
}): string
```

**Token Verification**:
```typescript
verifyCancellationToken(token: string): CancellationTokenPayload | null
```

**Cancellation Validation**:
```typescript
isCancellationAllowed(appointmentDate: string, appointmentTime: string): boolean
```

---

### Password Security

**Implementation**:
- bcrypt hashing with 12 salt rounds
- Secure password reset tokens (32-byte random)
- 1-hour reset token expiration
- Email-based password reset flow

---

### Route Protection

**Middleware** (`middleware.ts`):
- Protects `/admin/*` routes
- Protects `/api/admin/*` routes
- Validates JWT tokens
- Adds user info to request headers

**Protected Routes**:
- Admin dashboard (`/admin`)
- Admin API endpoints (`/api/admin/*`)
- Appointment modification (PUT/DELETE on `/api/appointments/*`)

**Public Routes**:
- Appointment creation (POST `/api/appointments/create`)
- Appointment viewing (GET `/api/appointments`)
- Available times (GET `/api/available-times/*`)

---

## Push Notifications (PWA)

### Service Worker Integration

**Purpose**: Enable offline functionality and push notifications.

**Features**:
- Service worker registration
- Push subscription management
- Notification display
- Background sync capabilities

---

### Push Notification Service

**Location**: `lib/push-notifications.ts`

**Key Methods**:
- `initialize()`: Initialize push service
- `requestPermission()`: Request notification permission
- `subscribe()`: Subscribe to push notifications
- `unsubscribe()`: Unsubscribe from push notifications
- `sendAppointmentReminder()`: Send appointment reminder
- `sendAppointmentConfirmation()`: Send confirmation notification
- `sendAppointmentCancellation()`: Send cancellation notification

**Notification Types**:
1. **Appointment Reminder**: Sent before appointment
2. **Appointment Confirmation**: Sent after booking
3. **Appointment Cancellation**: Sent after cancellation

**Notification Features**:
- Custom icons and badges
- Action buttons (View, Cancel, Reschedule)
- Vibration patterns
- Deep linking to app pages
- Persistent notifications

---

### VAPID Keys

**Purpose**: Authenticate push notification server.

**Configuration**:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Public key for client
- `VAPID_PRIVATE_KEY`: Private key for server (not exposed)

---

## Components

### Patient-Facing Components

#### `AppointmentForm` (`components/agendar-visita/AppointmentForm.tsx`)

**Purpose**: Main appointment booking form.

**Features**:
- Multi-step form with conditional fields
- Real-time validation
- Dynamic time slot loading
- Health insurance filtering based on visit type
- Date restrictions (30 days max, no weekends/holidays)
- Form state management with React Hook Form
- Zod schema validation

**State Management**:
- Form state: React Hook Form
- Date selection: Local state
- Available times: React Query
- Health insurance: React Query

---

#### `AvailableTimesComponentImproved` (`components/agendar-visita/AvailableTimesComponentImproved.tsx`)

**Purpose**: Displays and manages available time slots.

**Features**:
- Fetches available slots for selected date
- Generates 20-minute interval time slots
- Filters out booked appointments
- Loading states
- Error handling
- Memoized calculations for performance

**Time Generation Logic**:
1. Get start_time and end_time from available slots
2. Calculate total minutes in range
3. Generate slots at 20-minute intervals
4. Filter out existing appointment times
5. Display as selectable options

---

#### `FooterRoot` (`components/agendar-visita/FooterRoot.tsx`)

**Purpose**: Footer component with contact information.

**Features**:
- Contact phone numbers
- Practice information
- Responsive design

---

### Admin Components

#### `AccordionComponent` (`components/admin/AccordionComponent.tsx`)

**Purpose**: Main admin interface with calendar and appointments.

**Features**:
- Calendar date selection
- Appointment list by date
- Accordion-based UI
- Real-time data fetching

---

#### `AccordionItemList` (`components/admin/AccordionItemList.tsx`)

**Purpose**: Displays appointments for selected date.

**Features**:
- Appointment cards
- Patient information display
- Appointment details
- Status indicators

---

#### `DialogComponent` (`components/admin/DialogComponent.tsx`)

**Purpose**: Dialog for managing unavailable times.

**Features**:
- Add unavailable time slots
- Date selection
- Time range selection
- Form validation

---

#### `SelectTimeComponent` (`components/admin/SelectTimeComponent.tsx`)

**Purpose**: Time selection component for admin.

**Features**:
- Time picker interface
- Available/unavailable status
- Visual indicators

---

#### `AppointmentCard` (`components/admin/AppointmentCard.tsx`)

**Purpose**: Individual appointment display card.

**Features**:
- Patient information
- Appointment details
- Status badge
- Action buttons

---

#### `LoginDialog` (`components/admin/LoginDialog.tsx`)

**Purpose**: Admin login modal.

**Features**:
- Email/password authentication
- Error handling
- Token storage
- Redirect on success

---

#### `ProtectedRoute` (`components/admin/ProtectedRoute.tsx`)

**Purpose**: Route protection wrapper.

**Features**:
- Token verification
- Redirect to login if unauthorized
- Loading states

---

### UI Components (Shadcn UI)

**Location**: `components/ui/`

**Components**:
- `Button`: Styled button component
- `Input`: Form input field
- `Select`: Dropdown select
- `Calendar`: Date picker
- `Dialog`: Modal dialog
- `Accordion`: Collapsible content
- `Popover`: Popover menu
- `Label`: Form label
- `Form`: Form wrapper with validation
- `Toaster`: Toast notification system (Sonner)

---

## Utilities & Services

### Database Connection (`lib/db.ts`)

**Purpose**: PostgreSQL database connection and query execution.

**Features**:
- Connection pooling
- Query execution with parameterized statements
- Error handling
- Environment-based configuration

**Configuration**:
- `DATABASE_URL`: PostgreSQL connection string

---

### Validation (`lib/validation.ts`)

**Purpose**: Shared validation schemas and functions.

**Features**:
- Zod schemas for form validation
- Reusable validation rules
- Type-safe validation

---

### Cancellation Token (`lib/cancellation-token.ts`)

**Purpose**: Secure appointment cancellation token management.

**Key Functions**:
- `generateCancellationToken()`: Create secure token
- `verifyCancellationToken()`: Verify and decode token
- `isTokenExpired()`: Check token expiration
- `isCancellationAllowed()`: Validate cancellation timing
- `getCancellationExpirationTime()`: Calculate expiration
- `generateCancellationUrl()`: Create cancellation URL

---

### Authentication (`lib/auth.ts`)

**Purpose**: User authentication and password management.

**Key Functions**:
- `hashPassword()`: Hash password with bcrypt
- `verifyPassword()`: Verify password against hash
- `generateToken()`: Create JWT token
- `verifyToken()`: Verify JWT token
- `authenticateUser()`: Authenticate login credentials
- `generateResetToken()`: Create password reset token
- `sendPasswordResetEmail()`: Send reset email
- `resetPasswordWithToken()`: Reset password
- `getUserById()`: Get user information

---

### Actions (`lib/actions.ts`)

**Purpose**: Server-side data fetching functions.

**Key Functions**:
- `getAvailableTimesByDate()`: Fetch available times for date
- Other data fetching utilities

---

### Rate Limiting (`lib/rate-limit.ts`)

**Purpose**: API rate limiting to prevent abuse.

**Features**:
- Request rate limiting
- IP-based tracking
- Configurable limits

---

## PWA Features

### Manifest (`public/manifest.json`)

**Purpose**: PWA configuration.

**Features**:
- App name and description
- Icons for all sizes
- Theme colors
- Display mode (standalone)
- Start URL
- Orientation settings

---

### Service Worker (`public/sw.js`)

**Purpose**: Offline functionality and caching.

**Features**:
- Static asset caching
- API response caching
- Offline fallback
- Background sync
- Push notification handling

---

### Icons

**Location**: `public/icons/`

**Sizes**:
- 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 192x192, 384x384, 512x512
- Apple touch icons
- Safari pinned tab icon
- Splash screens for iOS

**Format**: SVG and PNG

---

## Time Management System

### Work Schedule Configuration

**Purpose**: Define working days and hours.

**Structure**:
1. **Work Schedule**: Days of week marked as working/non-working
2. **Available Slots**: Time ranges for each working day
3. **Unavailable Time Frames**: Specific blocked time slots
4. **Unavailable Days**: Entire days marked unavailable

---

### Time Slot Generation

**Algorithm**:
1. Get work schedule for selected date's day of week
2. Check if day is marked as unavailable
3. Get available slots for that day
4. Check for custom unavailable time frames
5. Generate 20-minute intervals within available slots
6. Filter out existing appointments
7. Return available time slots

**Time Interval**: 20 minutes between appointments

**Example**:
- Available: 09:00 - 12:00
- Generated slots: 09:00, 09:20, 09:40, 10:00, 10:20, ..., 11:40

---

### Date Restrictions

**Rules**:
- No past dates
- Maximum 30 days in advance
- Weekends disabled (Saturday, Sunday)
- Holidays disabled (configurable list)
- Unavailable days disabled

---

## Form Validation

### Client-Side Validation (Zod)

**Schema**: `formSchema` in `AppointmentForm.tsx`

**Validations**:
- `first_name`: Minimum 2 characters
- `last_name`: Minimum 2 characters
- `phone_number`: 10-15 characters, regex pattern
- `visit_type`: Required selection
- `appointment_date`: Must be today or future, within 30 days
- `consult_type`: Required if visit_type is Consulta
- `practice_type`: Required if visit_type is Practica
- `health_insurance`: Required selection
- `appointment_time`: Required selection

**Error Messages**: Spanish language, user-friendly

---

### Server-Side Validation

**API Endpoints**:
- Date format validation
- Time format validation (HH:MM)
- Required fields check
- Patient existence check
- Duplicate appointment prevention
- Business logic validation (cancellation deadlines, etc.)

---

## Error Handling

### Client-Side

**Features**:
- Form validation errors
- API error handling
- Loading states
- Error messages in Spanish
- Toast notifications (Sonner)
- Graceful fallbacks

---

### Server-Side

**Features**:
- Try-catch blocks
- Database error handling
- Validation error responses
- HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 409: Conflict
  - 500: Internal Server Error

**Error Response Format**:
```json
{
  "error": "Error message",
  "details": "Additional information"
}
```

---

## Testing

### Test Files

**Location**: `tests/`

**Test Types**:
- API endpoint tests
- Time selection logic tests
- Time generation tests
- Time synchronization tests
- Security tests
- Integration tests
- Stress tests

**Testing Framework**: Vitest

**Test Scripts**:
- `npm test`: Run all tests
- `npm run test:run`: Run tests once
- `npm run test:coverage`: Generate coverage report
- `npm run test:security`: Run security tests
- `npm run test:time-selection`: Run time selection tests
- `npm run test:time-selection:stress`: Stress test time selection

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# VAPID Keys (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Google Site Verification (optional)
GOOGLE_SITE_VERIFICATION=your-verification-code
```

---

## Deployment Considerations

### Production Checklist

1. **Environment Variables**: All required variables set
2. **Database**: PostgreSQL database configured and migrated
3. **JWT Secret**: Strong, unique secret (32+ characters)
4. **Email**: Email service configured for password reset
5. **VAPID Keys**: Generated and configured for push notifications
6. **HTTPS**: Required for PWA and push notifications
7. **Service Worker**: Registered and working
8. **Icons**: All icon sizes generated and uploaded
9. **Database Indexes**: All indexes created for performance
10. **Rate Limiting**: Configured to prevent abuse

---

## Security Best Practices

### Implemented

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token generation and verification
3. **HTTPS**: Required for production
4. **Input Validation**: Client and server-side validation
5. **SQL Injection Prevention**: Parameterized queries
6. **XSS Prevention**: React's built-in escaping
7. **CSRF Protection**: SameSite cookies
8. **Rate Limiting**: API rate limiting
9. **Token Expiration**: Time-limited tokens
10. **Secure Headers**: Next.js default security headers

---

## Performance Optimizations

### Implemented

1. **React Query**: Caching and stale-while-revalidate
2. **Memoization**: useMemo and useCallback for expensive operations
3. **Code Splitting**: Next.js automatic code splitting
4. **Image Optimization**: Next.js Image component with Cloudinary
5. **Database Indexes**: Indexed columns for fast queries
6. **Connection Pooling**: PostgreSQL connection pooling
7. **Static Generation**: Static pages where possible
8. **Lazy Loading**: Dynamic imports for non-critical components

---

## Future Enhancements (Potential)

1. **Email Notifications**: Send confirmation/cancellation emails
2. **SMS Notifications**: Text message reminders
3. **Multi-language Support**: English/Spanish toggle
4. **Patient Portal**: Patient login and appointment history
5. **Recurring Appointments**: Schedule recurring visits
6. **Waitlist**: Join waitlist for cancelled appointments
7. **Analytics Dashboard**: Appointment statistics and reports
8. **Export Functionality**: Export appointments to CSV/PDF
9. **Calendar Integration**: Google Calendar/Outlook sync
10. **Telemedicine**: Video consultation integration

---

## Implementation Notes for AI

### Key Implementation Patterns

1. **API Routes**: Next.js App Router API routes in `app/api/`
2. **Server Components**: Default, use 'use client' only when needed
3. **Client Components**: Marked with 'use client' directive
4. **Form Handling**: React Hook Form with Zod validation
5. **State Management**: React Query for server state, local state for UI
6. **Styling**: Tailwind CSS with Shadcn UI components
7. **Database**: PostgreSQL with parameterized queries
8. **Authentication**: JWT tokens in HTTP-only cookies
9. **Error Handling**: Try-catch with proper HTTP status codes
10. **Type Safety**: TypeScript interfaces for all data structures

### File Organization

- `app/`: Next.js App Router pages and API routes
- `components/`: React components (UI, admin, patient-facing)
- `lib/`: Utility functions and services
- `database/`: SQL schema and migration files
- `public/`: Static assets (icons, manifest, service worker)
- `tests/`: Test files
- `scripts/`: Utility scripts (setup, generation)

### Common Patterns

**API Route Pattern**:
```typescript
export async function GET(request: NextRequest) {
  try {
    // Validation
    // Database query
    // Response
  } catch (error) {
    // Error handling
  }
}
```

**Component Pattern**:
```typescript
"use client";

export default function Component() {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

**Form Pattern**:
```typescript
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});

async function onSubmit(values: SchemaType) {
  // Submit logic
}
```

---

## Conclusion

This application is a comprehensive medical appointment scheduling system with:
- Full CRUD operations for appointments
- Secure authentication and authorization
- PWA capabilities with push notifications
- Flexible work schedule management
- Time slot generation and management
- Secure cancellation system
- Admin dashboard
- Responsive, mobile-first design
- Comprehensive validation and error handling
- Type-safe TypeScript implementation

All functionalities are production-ready and follow Next.js 15 and React best practices.

