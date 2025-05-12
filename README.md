# EduBridge

## Overview
This project is a web application built using Next.js, React, and Prisma. It is designed to manage programs, assignments, and user interactions.

## Tech Stack
- **Frontend**: React, Next.js
- **Backend**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma

## Features
- User authentication and authorization
- Program management
- Assignment creation and submission
- Attendance tracking
- Document uploads
- Messaging system

## Getting Started
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd my-v0-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```
   DATABASE_URL=your_database_url
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure
- `/app`: Contains the main application code.
- `/components`: Reusable UI components.
- `/prisma`: Database schema and migrations.
- `/public`: Static assets.
- `/styles`: CSS and styling files.

## API Endpoints
- `/api/programs`: Fetch and manage programs.
- `/api/assignments`: Fetch and manage assignments.
- `/api/users`: User management.

## Usage
- **User Authentication**: Users can sign up and log in to access the application.
- **Program Management**: Create, update, and delete programs.
- **Assignment Management**: Create assignments and track submissions.
- **Attendance Tracking**: Record and view attendance for programs.
- **Document Uploads**: Upload and manage documents related to programs or assignments.
- **Messaging System**: Communicate with other users through the messaging feature.

## Troubleshooting
- **Database Connection Issues**: Ensure your `DATABASE_URL` is correctly set in the `.env` file.
- **API Errors**: Check the console for error messages and ensure the API endpoints are correctly configured.
- **Frontend Issues**: Clear your browser cache or try using a different browser if you encounter rendering issues.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Submit a pull request.

## License
This project is licensed under the MIT License.
