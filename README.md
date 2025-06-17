# Student Progress Management System

This documentation provides an in-depth look at the Student Progress Management System project. It covers the overall architecture, core functionalities, technologies used, data flow, and key modules across both the server and client sides.

## Table of Contents
- [Overview](#overview)
- [Architecture & Technologies](#architecture--technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Server-Side Details](#server-side-details)
  - [Models](#models)
  - [Controllers](#controllers)
  - [Routes](#routes)
  - [Services](#services)
  - [Scripts & Utilities](#scripts--utilities)
- [Client-Side Details](#client-side-details)
  - [Components](#components)
  - [Styles & Themes](#styles--themes)
  - [Services & API Calls](#services--api-calls)
- [Integration Points](#integration-points)
- [Data Sync & Codeforces Integration](#data-sync--codeforces-integration)
- [Error Handling & Logging](#error-handling--logging)
- [Deployment & Environment Configuration](#deployment--environment-configuration)
- [Cron Jobs & Data Migration](#cron-jobs--data-migration)
- [Responsive Design & UI Considerations](#responsive-design--ui-considerations)


## Overview
The Student Progress Management System is a full-stack application designed to manage student information with an emphasis on tracking progress via Codeforces data. It offers functionalities for:
- Creating, updating, and viewing student profiles.
- Synchronizing contestant data from Codeforces.
- Displaying interactive charts, graphs, and heatmaps.
- Managing data migration and periodic data synchronization via cron jobs.

## Architecture & Technologies
- **Backend:** Node.js with Express, MongoDB, and Mongoose.
- **Frontend:** React with React Router, Chart.js, and Axios.
- **Data Integration:** Utilizes the Codeforces API for user rating, contest history, and submission data.
- **Environment:** Managed via dotenv (e.g., MONGO_URI).
- **Utilities & Scripts:** Includes cron jobs for scheduling and scripts for data migration.

## Project Structure
Below is a high-level view of the project’s folder structure:

```
/Users/jayant/projects/tle-project
├── client
│   ├── public
│   │   └── index.html                   // HTML template and external font/script links
│   ├── src
│   │   ├── components                   // React components (StudentTable, StudentProfile, SyncSettings, etc.)
│   │   ├── services                     // API service layers (studentService, etc.)
│   │   ├── App.js                       // Main entry point for React app, routing configuration
│   │   └── App.css                      // Global styles and media queries for responsiveness
├── server
│   ├── controllers                      // Route controllers (studentController, codeforcesController, etc.)
│   ├── models                           // Mongoose models (Student, CodeforcesData, etc.)
│   ├── routes                           // API route definitions (studentRoutes, syncRoutes, etc.)
│   ├── scripts                          // Utilities for data migration (migrateData.js)
│   ├── services                         // Service classes (syncService, codeforcesService, inactivityService, etc.)
│   ├── utils                            // Additional utilities (cronJobs.js)
│   └── server.js / app.js               // Main entry point for the Express server
├── .env                                 // Environment variables configuration
└── README.md                            // This documentation file
```

## Installation
1. Clone the repository:
   ```
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```
   cd tle-eliminators-assignment
   ```
   
4. Install dependencies for both server and client:
   - For the server:
     ```
     cd server
     npm install
     ```
   - For the client:
    ```
     cd client
     npm install
    ```

## Configuration
1. Create a .env file in the root of the server directory.
2. Add the following configuration (adjust values as needed):
```
   MONGO_URI=your_mongo_db_connection_string

   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   EMAIL_FROM=your_email@example.com
```

## Running the App
1. Start the server:
   ```
   cd server
   npm start
   ```
2. Start the client:
   ```
   cd client
   npm start
   ```

## Server-Side Details

### Models

#### Student Model:
Stores student details including basic information and fields for tracking Codeforces data, inactivity status, and reminder counts.

Key Fields:
- name, email, phone, codeforcesHandle.
- currentRating, maxRating (updated post synchronization).
- isDataSyncing, lastDataSync.
- Inactivity tracking: lastSubmissionDate, isInactive, inactivityDetectedAt, lastReminderSent.

#### CodeforcesData Model:
Captures Codeforces-related information for a student.

Key Elements:
- studentId (reference to Student).
- handle.
- userInfo: General details from Codeforces.
- contests: Array of contest objects recording rating changes (contestId, contestName, rank, etc.).
- submissions: Array of submission objects (verdict, creation time, problem details).
- Compound indexes ensure uniqueness per student and Codeforces handle.

### Controllers

#### Student Controller:
Handles student CRUD operations.

- Create: Validates uniqueness on email/handle before saving.
- Update: Checks for changes in Codeforces handle to trigger immediate sync.
- Error responses and logging for debugging.

#### Codeforces Controller:
Interfaces with Codeforces API to fetch data.

- Functions: fetchCodeforcesData, getCodeforcesData to determine if a sync is needed based on the last update.
- Handles errors and logs API fetch statuses.

### Routes
Routes are split by features:
- /api/students: CRUD operations and student list management.
- /api/codeforces: Endpoint for fetching Codeforces data.
- /api/sync: Trigger and manage data synchronization.
- /api/inactivity: Endpoints to manage and check student inactivity.
- /api/email-test: Tools for verifying email configuration.

### Services

#### syncService:
Orchestrates the synchronization process for student data by:
- Fetching Codeforces data through codeforcesService.
- Updating or creating CodeforcesData documents.
- Updating student documents with latest ratings and sync status.
- Invoking inactivity checks post sync.

#### codeforcesService:
Manages interaction with the Codeforces API:
- Methods include fetching user info, rating history, and submissions.
- fetchAllUserData combines parallel requests to improve performance.
- Implements rate limiting (delay functions) to manage API limits.

#### inactivityService:
Checks if a student is inactive based on recent submissions.
- Helps in triggering email reminders or marking a student as inactive.

### Scripts & Utilities

#### Data Migration Script (migrateData.js):
Used to migrate legacy data structures into the new schema.
- Connects to MongoDB using environment variables.
- Iterates over students and updates CodeforcesData collections.
- Logs migration status and handles errors appropriately.

#### Cron Jobs (cronJobs.js):
Schedules periodic data sync operations:
- Initialization is done after a successful MongoDB connection.
- Automates student data synchronization across multiple students.

## Client-Side Details

### Components

#### StudentTable:
Displays a list/table of students.
- Supports adding, editing, and removal.
- Offers CSV export functionality using PapaParse.
- Responsive design adjustments based on window size.

#### StudentProfile:
Presents detailed views of a student:
- Displays contest history, ratings, and interactive charts.
- Utilizes Chart.js for rating graphs and heatmaps for submission activity.
- Incorporates filtering functionality based on contest dates.

#### SyncSettings:
Interfaces to adjust synchronization settings.
- Allows manual trigger of data sync.
- Displays the status of synchronization and upcoming cron schedules.

### Styles & Themes

#### Global styles managed via App.css:
- Defines responsive behavior using media queries.
- Contains styling for navigation, buttons, charts, and layout containers.

#### Theme toggling mechanism is built-in using React Context:
- Colors and background transition properties ensure consistency.

### Services & API Calls

#### Student Service:
Wrapper for Axios API calls to interact with the Express backend.
- Includes methods: getAllStudents, getStudent, and createStudent.
- Axios interceptors are set up for logging request and response data.
- Additional client-side utilities handle date formatting (date-fns) and chart configuration.

## Integration Points

### REST API Communication:
The client leverages REST endpoints defined in the server for all CRUD, sync, and configuration operations.

### Codeforces API Integration:
The backend communicates directly with Codeforces to pull ratings, contest data, and submission logs.

### Data Sync Flow:
- A student is created/updated.
- A sync is triggered (manually or via cron).
- Codeforces data is fetched and processed.
- Student and CodeforcesData models are updated.
- Inactivity checks are performed.

## Data Sync & Codeforces Integration
Data corresponding to a student’s Codeforces performance is synced through:
- Gathering user info, rating, and contest history.
- Storing contest history and submissions in a separate CodeforcesData document.
- Conditional sync based on the time elapsed since the last update (one hour threshold).
- If the Codeforces handle changes, an immediate sync is triggered to ensure data consistency.

## Error Handling & Logging

### Server Logging:
- Verbose logging is added in middleware to track requests and errors.
- Controllers and services include try-catch blocks to handle and log potential API or database errors.

### Error Responses:
- Consistent error response structure with HTTP codes and error messages is used across the API.

## Deployment & Environment Configuration
The application uses environment variables managed by dotenv.
- MONGO_URI is critical for database connections.
- The server listens on a configurable port (default 5001) and supports CORS for client-server communication.

## Cron Jobs & Data Migration

### Cron Jobs:
- Automatically trigger synchronization jobs to ensure that student data remains updated.

## Responsive Design & UI Considerations
The client is optimized for both desktop and mobile views.
- Media queries adjust elements such as chart dimensions, table layouts, and navigation components.
- The design ensures that UI components like the heatmap, rating graphs, and tables maintain usability on smaller screens.
