# DevOps & Administration Guide

This guide provides detailed instructions for deploying, configuring, and administering the Social Media Post Scheduler application.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Management](#database-management)
- [Running the Application](#running-the-application)
- [Production Deployment](#production-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Maintenance Tasks](#maintenance-tasks)

## System Requirements

### Hardware Requirements

**Minimum (Development/Small Deployments)**
- CPU: 2 cores
- RAM: 2 GB
- Storage: 10 GB (SQLite database grows with media uploads)

**Recommended (Production)**
- CPU: 4+ cores
- RAM: 4+ GB
- Storage: 50+ GB SSD (depending on media volume)

### Software Requirements

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher
- **Database**: 
  - SQLite 3.x (included with Node.js, for small deployments)
  - PostgreSQL 13+ (recommended for production)
- **Operating System**: 
  - Linux (Ubuntu 20.04+, Debian 11+, RHEL 8+)
  - macOS 12+
  - Windows Server 2019+ (not recommended for production)

### Network Requirements

- **Ports**:
  - 3000 (backend API, configurable)
  - 5173 (frontend dev server, production uses static files)
  - 5432 (PostgreSQL, if using external database)
- **Outbound Access**:
  - HTTPS (443) to social media APIs
  - npm registry (npmjs.com) for package installation

## Installation

### 1. Install Node.js

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**RHEL/CentOS:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

**macOS:**
```bash
brew install node@20
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show v9.x.x or higher
```

### 2. Clone the Repository

```bash
git clone https://github.com/pfahlr/social-media-post-scheduler.git
cd social-media-post-scheduler
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

If you encounter Prisma engine download issues:
```bash
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Database Setup

#### Option A: SQLite (Development/Small Deployments)

SQLite requires no additional setup. The database file will be created automatically.

```bash
cd ../backend
cp .env.example .env
# Edit .env and ensure DATABASE_URL=file:./dev.db
```

#### Option B: PostgreSQL (Recommended for Production)

**Install PostgreSQL:**

Ubuntu/Debian:
```bash
sudo apt-get install postgresql postgresql-contrib
```

RHEL/CentOS:
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create Database and User:**
```bash
sudo -u postgres psql

CREATE DATABASE social_scheduler;
CREATE USER scheduler_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE social_scheduler TO scheduler_user;
\q
```

**Configure PostgreSQL Authentication:**

Edit `/etc/postgresql/<version>/main/pg_hba.conf` (or similar path):
```
# Add this line for local connections
local   social_scheduler    scheduler_user                     md5
host    social_scheduler    scheduler_user    127.0.0.1/32     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 6. Initialize the Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# If migrations fail, try with environment variable:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run prisma:migrate
```

## Configuration

### Backend Environment Variables

Create and edit `backend/.env`:

```bash
cd backend
cp .env.example .env
nano .env  # or vim, vi, etc.
```

**Essential Variables:**

```bash
# Environment
NODE_ENV=production  # development, test, or production

# Server
PORT=3000

# Database
DATABASE_URL=postgresql://scheduler_user:your_secure_password@localhost:5432/social_scheduler
# Or for SQLite: DATABASE_URL=file:./production.db

# Security
SESSION_SECRET=<generate-a-strong-random-string-here>

# CORS
CORS_ORIGIN=https://yourdomain.com
# For development: CORS_ORIGIN=http://localhost:5173

# Post Management
POST_RETENTION_DAYS=30
SCHEDULER_INTERVAL_SECONDS=60
DEFAULT_MAX_RETRIES=3

# Features
ENABLE_SCHEDULER=true
ENABLE_REGISTRATION=true  # Set to false to disable new signups
```

**Generate Secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

Create and edit `frontend/.env`:

```bash
cd frontend
cp .env.example .env
nano .env
```

```bash
# Production API URL
VITE_API_URL=https://api.yourdomain.com/api

# Development API URL
# VITE_API_URL=http://localhost:3000/api
```

### Provider-Specific Configuration

Providers may require additional environment variables. Add them to `backend/.env`:

```bash
# Mastodon (example)
PROVIDER_MASTODON_DEFAULT_INSTANCE=https://mastodon.social

# Instagram
PROVIDER_INSTAGRAM_APP_ID=your_app_id
PROVIDER_INSTAGRAM_APP_SECRET=your_app_secret

# Add other provider credentials as needed
```

## Database Management

### Running Migrations

```bash
cd backend

# Development - creates migration and applies it
npm run prisma:migrate

# Production - applies existing migrations only
npx prisma migrate deploy
```

### Viewing Database

```bash
# Open Prisma Studio (GUI)
npx prisma studio
```

### Database Backup

**SQLite:**
```bash
# Backup
cp backend/production.db backend/backup-$(date +%Y%m%d-%H%M%S).db

# Restore
cp backend/backup-20240115-120000.db backend/production.db
```

**PostgreSQL:**
```bash
# Backup
pg_dump -U scheduler_user social_scheduler > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore
psql -U scheduler_user social_scheduler < backup-20240115-120000.sql
```

### Database Maintenance

**Vacuum (PostgreSQL):**
```bash
psql -U scheduler_user -d social_scheduler -c "VACUUM ANALYZE;"
```

**Optimize (SQLite):**
```bash
sqlite3 backend/production.db "VACUUM; ANALYZE;"
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access: http://localhost:5173

### Production Mode

#### Option 1: Simple Deployment (Backend serves frontend)

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Move built files to backend:**
```bash
mkdir -p ../backend/public
cp -r dist/* ../backend/public/
```

**Update backend/src/app.ts** to serve static files (add before error handler):
```typescript
import path from 'path';

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
```

**Build and run backend:**
```bash
cd backend
npm run build
npm start
```

Access: http://localhost:3000

#### Option 2: Separate Frontend Server

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend (with nginx or similar):**
```bash
cd frontend
npm run build
# Serve dist/ folder with your web server
```

### Using Process Managers

#### PM2 (Recommended)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start Application:**
```bash
cd backend
pm2 start npm --name "scheduler-api" -- start

# Or with custom config
pm2 start ecosystem.config.js
```

**Create `backend/ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'social-scheduler-api',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/social-media-post-scheduler/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/scheduler/err.log',
    out_file: '/var/log/scheduler/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

**PM2 Commands:**
```bash
pm2 list              # List all processes
pm2 logs              # View logs
pm2 restart all       # Restart all apps
pm2 stop all          # Stop all apps
pm2 delete all        # Remove all apps
pm2 startup           # Generate startup script
pm2 save              # Save current process list
```

#### systemd (Linux)

Create `/etc/systemd/system/social-scheduler.service`:

```ini
[Unit]
Description=Social Media Post Scheduler API
After=network.target postgresql.service

[Service]
Type=simple
User=scheduler
WorkingDirectory=/opt/social-media-post-scheduler/backend
Environment=NODE_ENV=production
EnvironmentFile=/opt/social-media-post-scheduler/backend/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable social-scheduler
sudo systemctl start social-scheduler
sudo systemctl status social-scheduler
```

**View logs:**
```bash
sudo journalctl -u social-scheduler -f
```

## Production Deployment

### Nginx Reverse Proxy

**Install Nginx:**
```bash
sudo apt-get install nginx  # Ubuntu/Debian
sudo yum install nginx      # RHEL/CentOS
```

**Configure `/etc/nginx/sites-available/scheduler`:**

```nginx
# Backend API
upstream scheduler_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/scheduler-access.log;
    error_log /var/log/nginx/scheduler-error.log;

    # Proxy settings
    location / {
        proxy_pass http://scheduler_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend (if serving separately)
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /opt/social-media-post-scheduler/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable and reload:**
```bash
sudo ln -s /etc/nginx/sites-available/scheduler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificates (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Firewall Configuration

**UFW (Ubuntu/Debian):**
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

**firewalld (RHEL/CentOS):**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Monitoring & Logging

### Application Logs

**PM2 Logs:**
```bash
pm2 logs                           # All logs
pm2 logs social-scheduler-api      # Specific app
pm2 logs --lines 100               # Last 100 lines
pm2 flush                          # Clear logs
```

**systemd Logs:**
```bash
journalctl -u social-scheduler -f              # Follow logs
journalctl -u social-scheduler --since today   # Today's logs
journalctl -u social-scheduler -n 100          # Last 100 lines
```

### Log Rotation

Create `/etc/logrotate.d/social-scheduler`:

```
/var/log/scheduler/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 scheduler scheduler
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Checks

**Create health check endpoint** in `backend/src/routes/index.ts`:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

**Monitor with curl:**
```bash
curl http://localhost:3000/health
```

**Setup automated monitoring** with systemd timer or cron:

```bash
# /etc/cron.d/scheduler-health
*/5 * * * * root curl -f http://localhost:3000/health || systemctl restart social-scheduler
```

### Performance Monitoring

**Install PM2 Plus (optional):**
```bash
pm2 install pm2-server-monit
pm2 link <secret> <public>  # Get keys from pm2.io
```

**Monitor with htop:**
```bash
sudo apt-get install htop
htop
```

**Database monitoring:**
```bash
# PostgreSQL
psql -U scheduler_user -d social_scheduler -c "SELECT * FROM pg_stat_activity;"

# Check table sizes
psql -U scheduler_user -d social_scheduler -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## Backup & Recovery

### Automated Backup Script

Create `/opt/scripts/backup-scheduler.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/social-scheduler"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
if [ "$DB_TYPE" = "postgresql" ]; then
    pg_dump -U scheduler_user social_scheduler | gzip > $BACKUP_DIR/db-$TIMESTAMP.sql.gz
else
    cp /opt/social-media-post-scheduler/backend/production.db $BACKUP_DIR/db-$TIMESTAMP.db
    gzip $BACKUP_DIR/db-$TIMESTAMP.db
fi

# Backup environment files
tar -czf $BACKUP_DIR/env-$TIMESTAMP.tar.gz \
    /opt/social-media-post-scheduler/backend/.env \
    /opt/social-media-post-scheduler/frontend/.env

# Delete old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Log
echo "Backup completed: $TIMESTAMP" >> /var/log/scheduler-backup.log
```

**Schedule with cron:**
```bash
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup-scheduler.sh
```

### Disaster Recovery

**Full restoration:**

```bash
# 1. Stop application
pm2 stop all
# or
sudo systemctl stop social-scheduler

# 2. Restore database
gunzip -c /backup/social-scheduler/db-20240115-020000.sql.gz | \
    psql -U scheduler_user social_scheduler

# 3. Restore environment files
tar -xzf /backup/social-scheduler/env-20240115-020000.tar.gz -C /

# 4. Start application
pm2 start all
# or
sudo systemctl start social-scheduler

# 5. Verify
curl http://localhost:3000/health
```

## Security

### Security Checklist

- [ ] Use strong SESSION_SECRET
- [ ] Enable HTTPS/TLS in production
- [ ] Set NODE_ENV=production
- [ ] Disable registration if not needed (ENABLE_REGISTRATION=false)
- [ ] Use PostgreSQL with strong passwords
- [ ] Enable firewall (only ports 80, 443, 22)
- [ ] Keep Node.js and npm packages updated
- [ ] Run application as non-root user
- [ ] Implement rate limiting (see below)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Rate Limiting

Add to `backend/src/app.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
```

Install:
```bash
npm install express-rate-limit
```

### Update Packages

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### User Management

**Disable registration** in production:
```bash
# In backend/.env
ENABLE_REGISTRATION=false
```

**Create users manually** via database:
```bash
cd backend
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 12, (err, hash) => {
  console.log('INSERT INTO User (id, email, passwordHash, createdAt, updatedAt) VALUES');
  console.log(\`('\${require('crypto').randomUUID()}', 'admin@example.com', '\${hash}', datetime('now'), datetime('now'));\`);
});
"
```

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs
# or
journalctl -u social-scheduler -n 50
```

**Common issues:**

1. **Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

2. **Database connection failed:**
```bash
# Test PostgreSQL connection
psql -U scheduler_user -d social_scheduler -c "SELECT 1;"

# Check credentials in .env
cat backend/.env | grep DATABASE_URL
```

3. **Permission errors:**
```bash
# Fix ownership
sudo chown -R scheduler:scheduler /opt/social-media-post-scheduler

# Fix permissions
chmod 755 /opt/social-media-post-scheduler/backend
chmod 600 /opt/social-media-post-scheduler/backend/.env
```

### Scheduler Not Running Posts

**Check scheduler is enabled:**
```bash
cat backend/.env | grep ENABLE_SCHEDULER
```

**Check scheduler logs:**
```bash
pm2 logs | grep -i "scheduler"
```

**Manually trigger dispatch:**
```bash
cd backend
node -e "
const { runDispatchScheduledPostsJob } = require('./dist/scheduler/jobs/dispatchScheduledPosts');
runDispatchScheduledPostsJob().then(() => console.log('Done'));
"
```

### High Memory Usage

**Check memory usage:**
```bash
pm2 monit
# or
htop
```

**Restart application:**
```bash
pm2 restart all
```

**Set memory limits in PM2:**
```javascript
// ecosystem.config.js
{
  max_memory_restart: '500M'
}
```

### Database Issues

**SQLite locked:**
```bash
# Check for processes accessing the database
lsof | grep production.db

# Kill if necessary
```

**PostgreSQL connection pool exhausted:**
```bash
# Check active connections
psql -U scheduler_user -d social_scheduler -c "SELECT count(*) FROM pg_stat_activity;"

# Restart application
pm2 restart all
```

## Maintenance Tasks

### Daily
- Monitor logs for errors
- Check disk space
- Verify backups completed

### Weekly
- Review failed posts
- Check database size
- Review system resource usage

### Monthly
- Update npm packages
- Review and clean old media assets
- Optimize database
- Security audit

### Quarterly
- Review provider integrations
- Update documentation
- Disaster recovery drill
- Performance review

### Commands

**Check disk space:**
```bash
df -h
```

**Check database size:**
```bash
# PostgreSQL
psql -U scheduler_user -d social_scheduler -c "
  SELECT pg_size_pretty(pg_database_size('social_scheduler'));
"

# SQLite
ls -lh backend/production.db
```

**Clean old posts manually:**
```bash
cd backend
node -e "
const { runCleanupOldPostsJob } = require('./dist/scheduler/jobs/cleanupOldPosts');
runCleanupOldPostsJob().then(() => console.log('Cleanup done'));
"
```

**Vacuum database:**
```bash
# PostgreSQL
psql -U scheduler_user -d social_scheduler -c "VACUUM FULL ANALYZE;"

# SQLite
sqlite3 backend/production.db "VACUUM;"
```

## Support

For issues not covered here:
- Check application logs
- Review GitHub issues: https://github.com/pfahlr/social-media-post-scheduler/issues
- Check Prisma documentation for database issues
- Review Node.js/npm documentation

---

**Last Updated:** 2024-11-27
