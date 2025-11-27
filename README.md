# Social Media Post Scheduler

A self-hostable web application for scheduling and publishing posts across multiple social media platforms.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [API Documentation](#api-documentation)
- [Provider System](#provider-system)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

The Social Media Post Scheduler is a comprehensive web application that allows users to manage multiple social media accounts and schedule posts across different platforms from a single interface. Built with TypeScript, it provides a type-safe, modular architecture with a plugin-based provider system for easy platform integration.

For deployment and administration, see **[DEVOPS.md](./DEVOPS.md)**.

## Features

- **Multi-Platform Support**: Schedule posts to Mastodon, Bluesky, Instagram, Tumblr, Misskey, and Substack
- **Unified Dashboard**: Manage all your social accounts and posts from one place
- **Smart Constraints**: Automatically enforces platform-specific character limits and media constraints
- **Flexible Scheduling**: Post immediately or schedule for a specific date and time
- **Post Retention**: Automatic cleanup of old posts based on configurable retention policy
- **Self-Hosted**: Run on your own infrastructure with SQLite or PostgreSQL
- **Retry Logic**: Automatic retry of failed posts with configurable max attempts
- **Draft Management**: Save drafts, clone them for different platforms
- **Media Support**: Upload and manage media files (images, videos) stored as database blobs

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│                      React SPA (TypeScript)                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/HTTPS
                               │ axios + withCredentials
┌──────────────────────────────┴──────────────────────────────────┐
│                      Express API Server                          │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Routes    │  │  Middleware  │  │   Auth (Passport)    │   │
│  │             │  │              │  │                      │   │
│  │ • Auth      │  │ • CORS       │  │ • Local Strategy     │   │
│  │ • Accounts  │  │ • Sessions   │  │ • Bcrypt             │   │
│  │ • Drafts    │  │ • Auth Check │  │ • Sessions           │   │
│  │ • Posts     │  │ • Error      │  │                      │   │
│  │ • Media     │  │              │  │                      │   │
│  └──────┬──────┘  └──────────────┘  └──────────────────────┘   │
│         │                                                         │
│  ┌──────┴────────────────────────────────────────────────────┐  │
│  │              Prisma ORM (Data Access Layer)               │  │
│  └──────┬────────────────────────────────────────────────────┘  │
│         │                                                         │
│  ┌──────┴────────────────────────────────────────────────────┐  │
│  │               Provider Plugin System                      │  │
│  │                                                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │Mastodon  │ │Bluesky   │ │Instagram │ │ Others   │    │  │
│  │  │Provider  │ │Provider  │ │Provider  │ │          │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  └──────┬────────────────────────────────────────────────────┘  │
│         │                                                         │
│  ┌──────┴────────────────────────────────────────────────────┐  │
│  │            Scheduler (node-cron)                          │  │
│  │                                                            │  │
│  │  • Dispatch scheduled posts (every minute)                │  │
│  │  • Cleanup old posts (daily at midnight)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                   Database (SQLite/PostgreSQL)                   │
│                                                                   │
│  User ──┬── SocialAccount ───┐                                  │
│         │                     │                                  │
│         ├── PostDraft ────────┼── ScheduledPost ── PostTarget   │
│         │                     │                         │        │
│         └── MediaAsset        │                   DeliveryAttempt│
│                               │                                  │
│                         SystemConfig                             │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Principles

1. **Separation of Concerns**: Clear boundaries between routing, business logic, data access, and external integrations
2. **Plugin Architecture**: Provider system allows easy addition of new social platforms
3. **Type Safety**: TypeScript throughout ensures compile-time type checking
4. **Modularity**: Each component has a single responsibility
5. **Scalability**: Designed to scale from SQLite single-user to PostgreSQL multi-user deployments

## Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma (supports SQLite and PostgreSQL)
- **Authentication**: Passport.js with passport-local strategy
- **Session Management**: express-session with cookies
- **Password Hashing**: bcrypt
- **Scheduler**: node-cron
- **HTTP Client**: axios (for provider API calls)

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: axios with credentials support
- **Styling**: Inline styles (can be extended with Tailwind CSS)

### Database

- **Development**: SQLite (file-based, no setup required)
- **Production**: PostgreSQL (recommended)
- **Schema Management**: Prisma Migrate

## Quick Start

See [DEVOPS.md](./DEVOPS.md) for detailed installation and deployment instructions.

**Quick development setup:**

```bash
# Clone repository
git clone https://github.com/pfahlr/social-media-post-scheduler.git
cd social-media-post-scheduler

# Backend setup
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# Access at http://localhost:5173
```

## Project Structure

```
social-media-post-scheduler/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── app.ts                    # Express app configuration
│   │   ├── index.ts                  # Server entry point
│   │   ├── auth/                     # Authentication logic
│   │   │   ├── passport.ts           # Passport.js configuration
│   │   │   └── types.ts              # Auth type definitions
│   │   ├── config/                   # Configuration management
│   │   │   └── env.ts                # Environment variables loader
│   │   ├── db/                       # Database client
│   │   │   └── client.ts             # Prisma client singleton
│   │   ├── middleware/               # Express middleware
│   │   │   ├── authRequired.ts       # Authentication guard
│   │   │   └── errorHandler.ts       # Global error handler
│   │   ├── providers/                # Social media provider plugins
│   │   │   ├── types.ts              # Provider interface definitions
│   │   │   ├── registry.ts           # Provider registration
│   │   │   ├── mastodonProvider.ts   # Mastodon implementation
│   │   │   ├── blueskyProvider.ts    # Bluesky stub
│   │   │   ├── instagramProvider.ts  # Instagram stub
│   │   │   ├── misskeyProvider.ts    # Misskey stub
│   │   │   ├── substackProvider.ts   # Substack stub
│   │   │   └── tumblrProvider.ts     # Tumblr stub
│   │   ├── routes/                   # API route handlers
│   │   │   ├── index.ts              # Route registration
│   │   │   ├── authRoutes.ts         # Auth endpoints
│   │   │   ├── socialAccountRoutes.ts# Social account CRUD
│   │   │   ├── draftRoutes.ts        # Draft CRUD
│   │   │   ├── mediaRoutes.ts        # Media upload/download
│   │   │   ├── scheduledPostRoutes.ts# Post scheduling
│   │   │   └── configRoutes.ts       # Config endpoint
│   │   ├── scheduler/                # Background jobs
│   │   │   ├── index.ts              # Scheduler initialization
│   │   │   └── jobs/
│   │   │       ├── dispatchScheduledPosts.ts  # Post dispatcher
│   │   │       └── cleanupOldPosts.ts         # Cleanup job
│   │   └── types/                    # Shared type definitions
│   │       └── domain.ts             # Domain model types
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example                  # Environment template
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── main.tsx                  # Application entry point
│   │   ├── App.tsx                   # Root component
│   │   ├── router/                   # Routing configuration
│   │   │   └── index.tsx             # Route definitions
│   │   ├── api/                      # API client
│   │   │   └── client.ts             # Axios client & API functions
│   │   ├── components/               # Reusable components
│   │   │   ├── Layout.tsx            # Page layout wrapper
│   │   │   ├── NavBar.tsx            # Navigation bar
│   │   │   └── ProtectedRoute.tsx    # Auth guard component
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useAuth.ts            # Authentication hook
│   │   └── pages/                    # Page components
│   │       ├── LandingPage.tsx       # Public landing page
│   │       ├── LoginPage.tsx         # Login form
│   │       ├── SignupPage.tsx        # Registration form
│   │       ├── DashboardPage.tsx     # User dashboard
│   │       ├── SocialAccountsPage.tsx# Account management
│   │       ├── PostsListPage.tsx     # Post list view
│   │       ├── PostEditorPage.tsx    # Post creation/editing
│   │       └── PostPreviewPage.tsx   # Preview & scheduling
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── CODEX/                            # Project specifications
│   ├── master_spec.yaml              # Complete specification
│   └── TASKS/                        # Task definitions
├── README.md                         # This file
├── DEVOPS.md                         # Operations guide
└── .gitignore
```

## How It Works

### 1. User Authentication Flow

```
User → Frontend (Login Form)
  ↓
  → POST /api/auth/login
    ↓
    → Passport.js validates credentials
      ↓
      → bcrypt.compare(password, hash)
        ↓
        → Session created & cookie sent
          ↓
          → User object stored in session
            ↓
            ← Response with user data
              ↓
              Frontend stores user in state
                ↓
                Redirect to /dashboard
```

**Implementation Details:**

- **Backend** (`backend/src/auth/passport.ts`):
  - Passport LocalStrategy configured with email/password
  - User lookup in database via Prisma
  - Password verification with bcrypt (cost factor 12)
  - Session serialization/deserialization

- **Frontend** (`frontend/src/hooks/useAuth.ts`):
  - Custom hook manages authentication state
  - Calls `/auth/me` on mount to restore session
  - Provides login/logout/signup functions
  - Used by ProtectedRoute to guard authenticated pages

### 2. Social Account Management

```
User adds account → Frontend form
  ↓
  → POST /api/social-accounts
    {
      providerId: 'mastodon',
      displayName: 'My Account',
      handle: '@user@mastodon.social',
      instanceUrl: 'https://mastodon.social',
      authData: { accessToken: 'xxx...' }
    }
    ↓
    → Backend validates provider exists
      ↓
      → Provider.validateAuth(authData) called
        ↓
        → Makes API call to verify credentials
          ↓
          → If valid: Store in database
            ↓
            ← Return account object
              ↓
              Frontend updates account list
```

**Key Components:**

- **Provider Interface** (`backend/src/providers/types.ts`):
  ```typescript
  interface ProviderPlugin {
    id: string;
    label: string;
    capabilities: ProviderCapabilities;
    validateAuth(authData): Promise<boolean>;
    publishPost(account, post): Promise<PublishResult>;
    normalizePostInput(draft): NormalizedPost;
  }
  ```

- **Registry** (`backend/src/providers/registry.ts`):
  - Central registry of all providers
  - `getProvider(id)` retrieves specific provider
  - `listProviders()` returns all available providers

### 3. Post Creation & Scheduling

```
User creates post → PostEditorPage
  ↓
  → User selects target accounts
    ↓
    → Frontend calculates constraints
      (most restrictive among selected providers)
      ↓
      → Shows character count, limits
        ↓
        → User clicks "Save Draft"
          ↓
          → POST /api/drafts
            {
              title: 'My Post',
              bodyText: 'Hello world...',
              postType: 'short',
              mediaAssetIds: []
            }
            ↓
            → Stored in PostDraft table
              ↓
              → Navigate to PreviewPage
                ↓
                → User chooses schedule option
                  ↓
                  → POST /api/scheduled-posts
                    {
                      postDraftId: 'uuid',
                      scheduledFor: '2024-01-15T14:00:00Z',
                      publishImmediately: false,
                      targets: [
                        { socialAccountId: 'uuid1', providerId: 'mastodon' },
                        { socialAccountId: 'uuid2', providerId: 'bluesky' }
                      ]
                    }
                    ↓
                    → Creates ScheduledPost
                      ↓
                      → Creates PostTarget for each account
                        ↓
                        → Status: 'pending'
                          ↓
                          ← Returns scheduled post
                            ↓
                            Redirect to /posts
```

**Constraint Validation:**

In `PostEditorPage.tsx`:
```typescript
const getMaxTextLength = () => {
  const selectedProviderIds = selectedAccounts.map(accId =>
    accounts.find(a => a.id === accId)?.providerId
  );

  const relevantProviders = providers.filter(p =>
    selectedProviderIds.includes(p.id)
  );

  const lengths = relevantProviders
    .map(p => p.capabilities.maxTextLength)
    .filter(l => l !== null);

  return lengths.length > 0 ? Math.min(...lengths) : null;
};
```

### 4. Post Dispatch (Scheduler)

```
Cron job triggers every minute
  ↓
  → dispatchScheduledPosts() runs
    ↓
    → Query: SELECT * FROM ScheduledPost
      WHERE status = 'pending'
        AND scheduledFor <= NOW()
      ↓
      → For each scheduled post:
        ↓
        → Update status = 'processing'
          ↓
          → For each PostTarget:
            ↓
            → Count DeliveryAttempts
              ↓
              → If attempts >= max_retries:
                  Mark as 'failed', skip
                ↓
                Else:
                  ↓
                  → Get provider from registry
                    ↓
                    → provider.normalizePostInput(draft)
                      ↓
                      → provider.publishPost(account, normalizedPost)
                        ↓
                        → Makes HTTP request to platform API
                          ↓
                          → Record DeliveryAttempt
                            ↓
                            Success: Mark PostTarget as 'success'
                            Failure: Keep as 'pending' for retry
          ↓
          → Update ScheduledPost final status
            (completed/failed based on all targets)
```

**Retry Logic:**

```typescript
// From dispatchScheduledPosts.ts
const attempts = target.deliveryAttempts.length;
const maxRetries =
  provider.capabilities.retryConfig?.maxRetries ??
  env.DEFAULT_MAX_RETRIES;

if (attempts >= maxRetries) {
  // Mark as failed permanently
  await prisma.postTarget.update({
    where: { id: target.id },
    data: {
      status: 'failed',
      errorMessage: `Max retries (${maxRetries}) exceeded`
    }
  });
} else {
  // Attempt to publish
  const result = await provider.publishPost(account, normalizedPost);

  // Record attempt
  await prisma.deliveryAttempt.create({
    data: {
      postTargetId: target.id,
      result: result.success ? 'success' : 'failure',
      errorMessage: result.errorMessage,
      providerResponse: result.rawResponse
    }
  });
}
```

### 5. Data Retention & Cleanup

```
Cron job triggers daily at midnight
  ↓
  → cleanupOldPosts() runs
    ↓
    → Query: SELECT * FROM ScheduledPost
      WHERE retentionUntil <= NOW()
      ↓
      → For each old post:
        ↓
        → Delete DeliveryAttempts
          ↓
          → Delete PostTargets
            ↓
            → Delete ScheduledPost
              ↓
              → Find orphaned PostDrafts
                (no ScheduledPosts reference them)
                ↓
                → Delete orphaned MediaAssets
                  (no PostDrafts reference them)
```

## Component Details

### Backend Components

#### Routes

**authRoutes.ts** (`backend/src/routes/authRoutes.ts`)
- `POST /auth/signup`: Create user account with bcrypt hashed password
- `POST /auth/login`: Authenticate with Passport LocalStrategy
- `POST /auth/logout`: Destroy session
- `GET /auth/me`: Get current user from session

**socialAccountRoutes.ts** (`backend/src/routes/socialAccountRoutes.ts`)
- `GET /social-accounts`: List user's connected accounts
- `POST /social-accounts`: Add account with provider validation
- `PUT /social-accounts/:id`: Update account details
- `DELETE /social-accounts/:id`: Remove account
- `GET /social-accounts/providers`: List available providers with capabilities

**draftRoutes.ts** (`backend/src/routes/draftRoutes.ts`)
- `GET /drafts`: List user's drafts
- `GET /drafts/:id`: Get specific draft
- `POST /drafts`: Create new draft
- `PUT /drafts/:id`: Update draft
- `POST /drafts/:id/clone`: Duplicate draft

**scheduledPostRoutes.ts** (`backend/src/routes/scheduledPostRoutes.ts`)
- `GET /scheduled-posts`: List posts with targets and status
- `GET /scheduled-posts/:id`: Get post with delivery attempts
- `POST /scheduled-posts`: Create scheduled post with targets
- `POST /scheduled-posts/:id/cancel`: Cancel pending post

**mediaRoutes.ts** (`backend/src/routes/mediaRoutes.ts`)
- `POST /media`: Upload file as base64, store as blob
- `GET /media/:id`: Retrieve file with correct MIME type
- `DELETE /media/:id`: Delete media file

#### Middleware

**authRequired.ts** (`backend/src/middleware/authRequired.ts`)
```typescript
export function authRequired(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

**errorHandler.ts** (`backend/src/middleware/errorHandler.ts`)
```typescript
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
```

#### Provider System

Each provider must implement:

1. **validateAuth**: Verify credentials by calling platform API
2. **publishPost**: Make API call to publish content
3. **normalizePostInput**: Enforce platform constraints
4. **capabilities**: Define limits (character count, media, etc.)

**Example - Mastodon Provider** (`backend/src/providers/mastodonProvider.ts`):
```typescript
export const mastodonProvider: ProviderPlugin = {
  id: 'mastodon',
  label: 'Mastodon',
  capabilities: {
    maxTextLength: 500,
    maxImages: 4,
    maxVideoMb: 40,
    supportedPostTypes: ['short', 'image_gallery'],
    authType: 'oauth2',
    retryConfig: { maxRetries: 3 }
  },

  async validateAuth(authData) {
    const response = await axios.get(
      `${authData.instanceUrl}/api/v1/accounts/verify_credentials`,
      { headers: { Authorization: `Bearer ${authData.accessToken}` }}
    );
    return response.status === 200;
  },

  async publishPost(account, post) {
    const response = await axios.post(
      `${account.authData.instanceUrl}/api/v1/statuses`,
      { status: post.bodyText, visibility: 'public' },
      { headers: { Authorization: `Bearer ${account.authData.accessToken}` }}
    );
    return {
      success: true,
      providerPostId: response.data.id,
      rawResponse: response.data
    };
  }
};
```

### Frontend Components

#### Pages

**DashboardPage** (`frontend/src/pages/DashboardPage.tsx`)
- Overview of accounts and upcoming posts
- Fetches accounts and posts in parallel
- Shows upcoming posts (status: 'pending')
- Quick links to manage accounts and create posts

**SocialAccountsPage** (`frontend/src/pages/SocialAccountsPage.tsx`)
- Lists all connected accounts by provider
- Add account form with provider selection
- Validates credentials via backend before saving
- Delete accounts with confirmation

**PostEditorPage** (`frontend/src/pages/PostEditorPage.tsx`)
- Real-time constraint calculation based on selected accounts
- Character counter shows remaining characters (most restrictive)
- Media upload support (base64 encoding)
- Save draft functionality
- Navigate to preview when ready

**PostPreviewPage** (`frontend/src/pages/PostPreviewPage.tsx`)
- Shows formatted post content
- Lists target accounts
- Radio buttons: "Post now" vs "Schedule for later"
- DateTime picker for scheduled posts
- Creates ScheduledPost with targets on submit

#### Hooks

**useAuth Hook** (`frontend/src/hooks/useAuth.ts`):
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    async function fetchMe() {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchMe();
  }, []);

  return { user, loading, setUser };
}
```

Used in:
- `ProtectedRoute`: Redirects to /login if not authenticated
- `NavBar`: Shows user email and logout button
- All authenticated pages

## Data Flow

### Authentication Flow

```
1. User submits login form
   → Frontend: POST /auth/login with credentials

2. Backend: Passport LocalStrategy
   → Find user by email
   → bcrypt.compare(password, user.passwordHash)
   → If valid: req.login(user)

3. Express-session
   → Creates session
   → Stores session ID in cookie
   → Session data stored server-side

4. Response
   → User object returned to frontend
   → Frontend stores in state via useAuth hook
   → Cookie automatically sent with subsequent requests

5. Subsequent requests
   → Cookie sent automatically
   → Express-session loads session
   → Passport deserializes user
   → req.user populated
   → authRequired middleware checks req.isAuthenticated()
```

### Post Publishing Flow

```
1. User creates draft
   PostEditorPage → POST /api/drafts
   → Stored in database

2. User previews
   Navigate to PostPreviewPage
   → Shows draft content
   → User selects schedule options

3. User schedules
   POST /api/scheduled-posts
   → Creates ScheduledPost (status: 'pending')
   → Creates PostTarget for each selected account
   → Calculates retentionUntil = scheduledFor + POST_RETENTION_DAYS

4. Scheduler picks up post
   Cron runs every SCHEDULER_INTERVAL_SECONDS
   → Queries pending posts where scheduledFor <= now
   → Updates status to 'processing'

5. For each target
   → Get provider from registry
   → Normalize post content for platform
   → Call provider.publishPost()
   → Record DeliveryAttempt
   → Update PostTarget status

6. Provider makes API call
   → Authenticates with platform
   → Sends post content
   → Returns success/failure

7. Update final status
   → If all targets succeed: ScheduledPost status = 'completed'
   → If any failed: ScheduledPost status = 'failed'
   → If retries pending: status stays 'processing'

8. Cleanup (after retention period)
   Daily cron job
   → Deletes posts where retentionUntil <= now
   → Cascades to PostTargets and DeliveryAttempts
   → Removes orphaned drafts and media
```

## API Documentation

See [DEVOPS.md](./DEVOPS.md) for complete API documentation including request/response examples for all endpoints.

**Endpoint Summary:**

- **Authentication**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Social Accounts**: `/api/social-accounts` (CRUD), `/api/social-accounts/providers`
- **Drafts**: `/api/drafts` (CRUD), `/api/drafts/:id/clone`
- **Scheduled Posts**: `/api/scheduled-posts` (CRUD), `/api/scheduled-posts/:id/cancel`
- **Media**: `/api/media` (upload, retrieve, delete)
- **Configuration**: `/api/config`

## Provider System

### Provider Implementation Status

- ✅ **Mastodon**: Full API integration with OAuth2 support
- ⚠️ **Bluesky**: Stub created, needs AT Protocol integration
- ⚠️ **Instagram**: Stub created, needs Facebook Graph API setup
- ⚠️ **Substack**: Stub created, needs API integration
- ⚠️ **Misskey**: Stub created, needs Misskey API integration
- ⚠️ **Tumblr**: Stub created, needs OAuth and API integration

### Adding a New Provider

1. **Create provider file** in `backend/src/providers/`:

```typescript
// twitterProvider.ts
import type { ProviderPlugin } from './types';

const capabilities = {
  maxTextLength: 280,
  maxImages: 4,
  maxVideoMb: 512,
  supportedPostTypes: ['short', 'image_gallery', 'video'],
  authType: 'oauth2',
  retryConfig: { maxRetries: 3 }
};

export const twitterProvider: ProviderPlugin = {
  id: 'twitter',
  label: 'Twitter',
  capabilities,

  async validateAuth(authData) {
    // Verify OAuth token with Twitter API
    try {
      const response = await axios.get(
        'https://api.twitter.com/2/users/me',
        { headers: { Authorization: `Bearer ${authData.accessToken}` }}
      );
      return response.status === 200;
    } catch {
      return false;
    }
  },

  normalizePostInput(postDraft) {
    let bodyText = postDraft.bodyText;
    if (bodyText.length > 280) {
      bodyText = bodyText.substring(0, 277) + '...';
    }
    return { ...postDraft, bodyText };
  },

  async publishPost(account, post) {
    try {
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: post.bodyText },
        { headers: { Authorization: `Bearer ${account.authData.accessToken}` }}
      );
      return {
        success: true,
        providerPostId: response.data.data.id,
        rawResponse: response.data
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err.message,
        rawResponse: err.response?.data
      };
    }
  }
};
```

2. **Register in registry.ts**:

```typescript
import { twitterProvider } from './twitterProvider';

const providers: Record<string, ProviderPlugin> = {
  [mastodonProvider.id]: mastodonProvider,
  [twitterProvider.id]: twitterProvider,
  // ...
};
```

3. **Test integration**:
   - Add account via frontend
   - Create and schedule post
   - Monitor scheduler logs for publishing attempts

## Development

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for TypeScript/JavaScript
- **Semicolons**: Required
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for types, interfaces, components
  - kebab-case for file names

### Development Workflow

1. Create feature branch: `git checkout -b feature/new-provider`
2. Make changes
3. Test locally
4. Commit with descriptive message
5. Push and create pull request

### Debugging

**Backend:**
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Or use VS Code debugger with .vscode/launch.json
```

**Frontend:**
```bash
# React DevTools in browser
# Chrome/Firefox React DevTools extension
```

## Deployment

See **[DEVOPS.md](./DEVOPS.md)** for comprehensive deployment instructions including:

- System requirements
- Installation steps
- Database setup (SQLite and PostgreSQL)
- Production configuration
- Process management (PM2, systemd)
- Nginx reverse proxy setup
- SSL/TLS configuration
- Monitoring and logging
- Backup and recovery strategies
- Security hardening
- Troubleshooting guide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code follows style guidelines
5. Test thoroughly
6. Submit pull request with clear description

### Provider Contributions

We welcome new provider implementations! Please:
- Follow the existing provider structure
- Implement all interface methods
- Test with real accounts
- Document any special requirements
- Update README with provider status

## License

See LICENSE file for details.

## Support

- **Documentation**: See DEVOPS.md for operations, this file for development
- **Issues**: https://github.com/pfahlr/social-media-post-scheduler/issues
- **Discussions**: Use GitHub Discussions for questions

---

**Last Updated:** 2024-11-27
