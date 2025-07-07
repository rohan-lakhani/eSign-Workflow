<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# eSign Workflow NestJS

A simple electronic signature workflow application built with NestJS, MongoDB, and React. This application demonstrates a 3-role sequential document signing workflow.

## Features

- PDF document upload
- 3-role sequential workflow creation
- Email notifications for signature requests
- Role-based access control with JWT tokens
- Dynamic Role 3 email updates by Role 2
- Document preview and download
- Responsive React frontend

## Tech Stack

- **Backend**: NestJS, MongoDB, Mongoose
- **Frontend**: React, TailwindCSS
- **Email**: Nodemailer
- **Authentication**: JWT
- **File Storage**: Local filesystem

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd esign-workflow-nestjs
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory:
```env
# MongoDB Configuration
DATABASE_URI=mongodb://localhost:27017/esign-workflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration (optional - will use console logs if not configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Development Mode

To run both the NestJS backend and React frontend:
```bash
npm run dev
```

Or run them separately:

Backend only:
```bash
npm run start:dev
```

Frontend only (from the client directory):
```bash
cd ../esign-express/client
npm run dev
```

### Production Mode

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm run start:prod
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a PDF document
- `GET /api/documents/:id/preview` - Preview a PDF document
- `GET /api/documents/:id/download` - Download a PDF document

### Workflows
- `POST /api/workflows` - Create a new workflow
- `POST /api/workflows/:id/submit` - Submit workflow for signing
- `POST /api/workflows/:id/sign` - Sign a document (requires role auth token)
- `GET /api/workflows/:id` - Get workflow details

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

## Workflow Process

1. **Role 1** uploads a PDF and creates a workflow with:
   - Role 1 email (required)
   - Role 2 email (required)
   - Role 3 email (optional, can be set later)

2. **Submit for Signing**: The workflow is submitted and Role 1 receives an email with a signing link

3. **Role 1 Signs**: After signing, Role 2 receives an email notification

4. **Role 2 Signs**: Must provide Role 3's email before signing, then Role 3 receives notification

5. **Role 3 Signs**: Completes the workflow, all parties receive the signed document

## Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:cov
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Email Configuration

The application supports email notifications for signature requests. If SMTP credentials are not provided in the environment variables, emails will be logged to the console for development purposes.

## Project Structure

```
src/
├── auth/           # Authentication guards and strategies
├── config/         # Configuration module
├── documents/      # Document management module
├── services/       # Shared services (email, eSign)
├── utils/          # Utility functions
├── workflows/      # Workflow management module
├── app.module.ts   # Root application module
└── main.ts         # Application entry point
```

## License

This project is licensed under the ISC License.