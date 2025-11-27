# Social Media Post Scheduler

A self-hostable web application for scheduling and publishing posts across multiple social media platforms.

## Features

- **Multi-Platform Support**: Schedule posts to Mastodon, Bluesky, Instagram, Tumblr, Misskey, and Substack
- **Unified Dashboard**: Manage all your social accounts and posts from one place
- **Smart Constraints**: Automatically enforces platform-specific character limits and media constraints
- **Flexible Scheduling**: Post immediately or schedule for a specific date and time
- **Post Retention**: Automatic cleanup of old posts based on configurable retention policy
- **Self-Hosted**: Run on your own infrastructure with SQLite or PostgreSQL

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: React, TypeScript, Vite
- **Database**: SQLite (default) or PostgreSQL
- **Authentication**: Passport.js with local strategy (email/password)
- **Scheduler**: node-cron for automated post dispatch and cleanup

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pfahlr/social-media-post-scheduler.git
   cd social-media-post-scheduler
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**

   The Prisma setup requires downloading engine binaries. If you encounter network issues, you can create the database manually:

   ```bash
   # Try running Prisma migrations
   npm run prisma:generate
   npm run prisma:migrate

   # If Prisma has issues, you can initialize the database manually
   # The schema is defined in backend/prisma/schema.prisma
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env if needed (default should work)
   ```

5. **Start the development servers**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Configuration

### Backend Environment Variables

See `backend/.env.example` for all available options:

- `DATABASE_URL`: Database connection string (default: SQLite)
- `SESSION_SECRET`: Secret for session encryption (change in production!)
- `PORT`: Backend server port (default: 3000)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:5173)
- `POST_RETENTION_DAYS`: How long to keep posts before auto-deletion (default: 30)
- `SCHEDULER_INTERVAL_SECONDS`: How often to check for scheduled posts (default: 60)

### Frontend Environment Variables

See `frontend/.env.example`:

- `VITE_API_URL`: Backend API URL (default: http://localhost:3000/api)

## Usage

### 1. Create an Account

1. Navigate to the app in your browser
2. Click "Sign Up" and create an account with email/password

### 2. Connect Social Accounts

1. Go to "Accounts" in the navigation
2. Click "Add Account"
3. Select a provider and fill in the required information:
   - **Mastodon**: Requires instance URL and access token
   - **Other providers**: Currently stubbed - see "Provider Implementation" below

### 3. Create and Schedule Posts

1. Click "New Post" in the navigation
2. Write your post content
3. Select target accounts
4. The editor will show character limits based on your selected platforms
5. Click "Preview & Schedule"
6. Choose to post immediately or schedule for later
7. Confirm and your post will be queued

### 4. Monitor Posts

- View all scheduled and past posts in the "Posts" section
- See delivery status for each target account
- Cancel pending posts if needed

## Provider Implementation Status

### Fully Implemented
- ✅ **Mastodon**: Full API integration with OAuth2 support

### Stubbed (Requires Implementation)
- ⚠️ **Bluesky**: Stub created, needs AT Protocol integration
- ⚠️ **Instagram**: Stub created, needs Facebook Graph API setup
- ⚠️ **Substack**: Stub created, needs API integration
- ⚠️ **Misskey**: Stub created, needs Misskey API integration
- ⚠️ **Tumblr**: Stub created, needs OAuth and API integration

To implement a provider, see `backend/src/providers/mastodonProvider.ts` as a reference and create similar implementations in the respective provider files.

## Project Structure

```
social-media-post-scheduler/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── providers/       # Social media platform integrations
│   │   ├── scheduler/       # Cron jobs for post dispatch and cleanup
│   │   ├── middleware/      # Auth and error handling middleware
│   │   ├── auth/            # Passport.js configuration
│   │   ├── config/          # Environment configuration
│   │   └── db/              # Prisma client
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages/routes
│   │   ├── components/      # Reusable React components
│   │   ├── api/             # API client and type definitions
│   │   ├── hooks/           # Custom React hooks
│   │   └── router/          # React Router configuration
│   └── package.json
└── CODEX/
    ├── master_spec.yaml     # Complete project specification
    └── TASKS/               # Task definitions
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: User accounts (email/password auth)
- **SocialAccount**: Connected social media accounts
- **PostDraft**: Draft posts before scheduling
- **ScheduledPost**: Posts scheduled for publishing
- **PostTarget**: Individual delivery targets (one per account per post)
- **DeliveryAttempt**: Tracks each publishing attempt with retry logic
- **MediaAsset**: Uploaded media files (images, videos) stored as blobs
- **SystemConfig**: System-level configuration

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Social Accounts
- `GET /api/social-accounts` - List user's connected accounts
- `POST /api/social-accounts` - Add new account
- `PUT /api/social-accounts/:id` - Update account details
- `DELETE /api/social-accounts/:id` - Remove account
- `GET /api/social-accounts/providers` - List available providers

### Drafts
- `GET /api/drafts` - List user's drafts
- `GET /api/drafts/:id` - Get specific draft
- `POST /api/drafts` - Create new draft
- `PUT /api/drafts/:id` - Update draft
- `POST /api/drafts/:id/clone` - Clone existing draft

### Scheduled Posts
- `GET /api/scheduled-posts` - List user's scheduled posts
- `GET /api/scheduled-posts/:id` - Get specific post with delivery details
- `POST /api/scheduled-posts` - Create new scheduled post
- `POST /api/scheduled-posts/:id/cancel` - Cancel pending post

### Media
- `POST /api/media` - Upload media file (base64 encoded)
- `GET /api/media/:id` - Retrieve media file
- `DELETE /api/media/:id` - Delete media file

### Configuration
- `GET /api/config` - Get public configuration values

## Scheduler Jobs

The application runs two automated jobs:

1. **Post Dispatch** (runs every minute by default)
   - Checks for posts that are due to be published
   - Attempts to publish to each target account
   - Implements retry logic with configurable max attempts
   - Updates post and target statuses

2. **Cleanup** (runs daily at midnight)
   - Deletes posts past their retention date
   - Removes orphaned drafts and media assets

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use a strong `SESSION_SECRET`
3. Configure PostgreSQL for better performance:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
4. Set appropriate `CORS_ORIGIN` to your frontend domain
5. Consider using environment-specific settings for retry counts and retention

### Database Migration

```bash
cd backend
npx prisma migrate deploy
```

### Building for Production

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
# Serve the dist/ folder with your web server
# Or configure backend to serve it
```

### Docker Deployment

A `docker-compose.yml` can be created for containerized deployment. The application is designed to run as a single process with SQLite or connect to an external PostgreSQL database.

## Development

### Adding a New Provider

1. Create a new provider file in `backend/src/providers/` (e.g., `twitterProvider.ts`)
2. Implement the `ProviderPlugin` interface:
   ```typescript
   export interface ProviderPlugin {
     id: string;
     label: string;
     capabilities: ProviderCapabilities;
     validateAuth(authData): Promise<boolean>;
     normalizePostInput(postDraft): NormalizedPost;
     publishPost(socialAccount, normalizedPost): Promise<PublishResult>;
   }
   ```
3. Register the provider in `backend/src/providers/registry.ts`
4. Test with the frontend

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

### Prisma Migration Issues

If you encounter issues with Prisma downloading engine binaries (403 errors), you can:

1. Set environment variables:
   ```bash
   export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
   ```

2. Or manually create the SQLite database with the schema from `backend/prisma/schema.prisma`

### CORS Errors

Make sure `CORS_ORIGIN` in backend `.env` matches your frontend URL exactly.

### Session/Authentication Issues

1. Check that `SESSION_SECRET` is set
2. Verify cookies are being sent (withCredentials: true)
3. Ensure both frontend and backend are on the same domain or CORS is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please use the GitHub issue tracker.

## Roadmap

See `CODEX/master_spec.yaml` for the complete feature roadmap and specifications.

### Planned Features
- Email verification and password reset
- Team/organization accounts
- Engagement analytics
- Webhook support
- External storage (S3/MinIO) for media
- More provider integrations
- Post templates
- Bulk scheduling
- Content calendar view
