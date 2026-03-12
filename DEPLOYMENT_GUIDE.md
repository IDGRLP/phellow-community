# InkApp Development Environment - Offline Deployment Guide

This guide provides step-by-step instructions for deploying the InKaPP development environment to a
VM with limited or no internet access.

## Prerequisites

### On Customer VM

- Docker installed and running (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- Sufficient disk space (~5GB for images + source code)
- Verify: `docker --version && docker compose version`

## Overview

The development environment requires:

- **4 Docker images** (pre-built and transferred)
- **Source code** (for hot-reload development)
- **Configuration files** (.env, docker-compose, samples)

## Part 1: Preparation (On Your Machine)

### Step 1: Build All Required Docker Images

```bash
# Navigate to project directory
cd /path/to/inkapp

# Build main application (development target)
docker build --target development -t inkapp-app:dev .

# Build OIDC mock server
docker build -f docker/oidc-mock.Dockerfile -t inkapp-oidc-mock:dev .

# Pull PostgreSQL image
docker pull postgres:17

# Pull Mockoon CLI image
docker pull mockoon/cli:latest

# Verify all images exist
docker images | grep -E "inkapp|postgres|mockoon"
```

Expected output:

```
inkapp-app           dev      [IMAGE_ID]   [SIZE]   [TIME]
inkapp-oidc-mock     dev      [IMAGE_ID]   [SIZE]   [TIME]
postgres             17       [IMAGE_ID]   [SIZE]   [TIME]
mockoon/cli          latest   [IMAGE_ID]   [SIZE]   [TIME]
```

### Step 2: Export Docker Images to Tar Files

```bash
# Create directory for exports
mkdir -p docker-images-export
cd docker-images-export

# Export main application image (~1-1.5GB)
docker save inkapp-app:dev -o inkapp-app-dev.tar

# Export OIDC mock image (~100-200MB)
docker save inkapp-oidc-mock:dev -o inkapp-oidc-mock-dev.tar

# Export PostgreSQL image (~400-500MB)
docker save postgres:17 -o postgres-17.tar

# Export Mockoon CLI image (~200-300MB)
docker save mockoon/cli:latest -o mockoon-cli-latest.tar

# Verify exports and check sizes
ls -lh *.tar

# Expected total: ~2-2.5GB
du -sh .
```

### Step 3: Create Deployment Package

```bash
# Go back to project root
cd ..

# Create deployment package directory
mkdir -p inkapp-deployment-package

# Copy all necessary files
cp -r src inkapp-deployment-package/
cp -r static inkapp-deployment-package/
cp -r samples inkapp-deployment-package/
cp -r scripts inkapp-deployment-package/          # includes dev-entrypoint.sh
cp -r drizzle inkapp-deployment-package/
cp -r messages inkapp-deployment-package/
cp -r patches inkapp-deployment-package/
cp -r project.inlang inkapp-deployment-package/

# Copy configuration files
cp docker-compose.development.yml inkapp-deployment-package/
cp package.json inkapp-deployment-package/
cp pnpm-lock.yaml inkapp-deployment-package/
cp vite.config.ts inkapp-deployment-package/
cp svelte.config.js inkapp-deployment-package/
cp tsconfig.json inkapp-deployment-package/
cp drizzle.config.ts inkapp-deployment-package/

# Copy or create .env.development file
cp .env.development inkapp-deployment-package/
# OR create from template if needed:
# cp .env.development.example inkapp-deployment-package/.env.development

# Copy this deployment guide
cp DEPLOYMENT_GUIDE.md inkapp-deployment-package/

# Copy docker images
cp docker-images-export/*.tar inkapp-deployment-package/
```

### Step 4: Create Transfer Archive

**Option A: Single Compressed Archive (Recommended)**

```bash
# Create compressed archive (~1-1.5GB compressed)
tar -czf inkapp-deployment-complete.tar.gz inkapp-deployment-package/

# Verify archive
ls -lh inkapp-deployment-complete.tar.gz
```

**Option B: Separate Archives (If file size is an issue)**

```bash
# Archive source code and configs separately
tar -czf inkapp-source.tar.gz \
    --exclude='inkapp-deployment-package/*.tar' \
    inkapp-deployment-package/

# Keep docker images as separate tar files
cp docker-images-export/*.tar .
```

## Part 2: Transfer to Customer VM

Choose one of the following transfer methods:

### Method 1: Physical Media (USB/External Drive)

```bash
# Copy to USB drive
cp inkapp-deployment-complete.tar.gz /Volumes/USB_DRIVE/
# OR
cp inkapp-source.tar.gz /Volumes/USB_DRIVE/
cp docker-images-export/*.tar /Volumes/USB_DRIVE/

# Safely eject USB drive
# Transport to customer site
```

### Method 2: Limited Network Transfer (SCP)

```bash
# Transfer complete archive
scp inkapp-deployment-complete.tar.gz user@customer-vm:/home/user/

# OR transfer separate files
scp inkapp-source.tar.gz user@customer-vm:/home/user/
scp docker-images-export/*.tar user@customer-vm:/home/user/
```

### Method 3: Split Archive (For very limited transfer capacity)

```bash
# Split into smaller chunks (e.g., 500MB each)
split -b 500M inkapp-deployment-complete.tar.gz inkapp-part-

# Transfer individual parts
# On VM, reassemble:
cat inkapp-part-* > inkapp-deployment-complete.tar.gz
```

## Part 3: Installation on Customer VM

### Step 1: Extract Deployment Package

```bash
# SSH to customer VM
ssh user@customer-vm

# Create project directory
mkdir -p ~/inkapp
cd ~/inkapp

# Extract complete archive
tar -xzf ~/inkapp-deployment-complete.tar.gz
cd inkapp-deployment-package/

# OR if using separate archives:
tar -xzf ~/inkapp-source.tar.gz
# (tar files are already extracted)
```

### Step 2: Load Docker Images

```bash
# Load main application image
docker load -i inkapp-app-dev.tar
echo "✓ Main app image loaded"

# Load OIDC mock image
docker load -i inkapp-oidc-mock-dev.tar
echo "✓ OIDC mock image loaded"

# Load PostgreSQL image
docker load -i postgres-17.tar
echo "✓ PostgreSQL image loaded"

# Load Mockoon CLI image
docker load -i mockoon-cli-latest.tar
echo "✓ Mockoon image loaded"

# Verify all images are loaded
docker images | grep -E "inkapp|postgres|mockoon"
```

You should see:

```
inkapp-app           dev      [IMAGE_ID]   [SIZE]   [TIME]
inkapp-oidc-mock     dev      [IMAGE_ID]   [SIZE]   [TIME]
postgres             17       [IMAGE_ID]   [SIZE]   [TIME]
mockoon/cli          latest   [IMAGE_ID]   [SIZE]   [TIME]
```

### Step 3: Configure Environment

```bash
# Edit .env.development file with customer-specific settings
nano .env.development
```

**Key variables to configure:**

```bash
# Database
POSTGRES_USER=phellow
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=phellow_dev
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://phellow:CHANGE_THIS_PASSWORD@db:5432/phellow_dev

# FHIR Server (if not using mockoon)
# PUBLIC_FHIR_BASE_URL=https://customer-fhir-server.com/fhir

# OAuth/OIDC (if not using mock)
# PUBLIC_AUTH_ISSUER=https://customer-auth-server.com
# PUBLIC_AUTH_CLIENT_ID=customer-client-id
# OAUTH_CLIENT_SECRET=customer-secret

# Application
PUBLIC_BASE_URL=http://localhost:5173
NODE_ENV=development
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X in nano)

### Step 4: Start Services

```bash
# Start all services in detached mode
docker compose -f docker-compose.development.yml up -d

# Monitor startup logs
docker compose -f docker-compose.development.yml logs -f
```

**Wait for all services to be healthy:**

- Database: PostgreSQL ready for connections
- Mockoon: API mock server running
- OIDC Mock: Authentication mock ready
- Migration: Database migrations completed
- Web: Vite dev server running on port 5173

Press `Ctrl+C` to stop following logs.

### Step 5: Verify Installation

```bash
# Check service status
docker compose -f docker-compose.development.yml ps

# All services should show "Up" or "Exit 0" (for migrate)
# Expected output:
# NAME                  STATUS          PORTS
# inkapp-app-dev        Up             0.0.0.0:5173->5173/tcp
# inkapp-db-dev         Up (healthy)   0.0.0.0:5432->5432/tcp
# inkapp-mockoon-dev    Up (healthy)   0.0.0.0:3000->3000/tcp
# inkapp-oidc-dev       Up (healthy)   0.0.0.0:8080->8080/tcp
# inkapp-migrate-dev    Exit 0

# Test database connection
docker compose -f docker-compose.development.yml exec db \
    psql -U phellow -d phellow_dev -c "SELECT version();"

# Test web application
curl http://localhost:5173

# Check Mockoon API
curl http://localhost:3000/health

# Check OIDC mock
curl http://localhost:8080/.well-known/openid-configuration
```

## Part 4: Usage

### Access the Application

Open browser and navigate to:

- **Application**: http://localhost:5173 (or http://VM_IP:5173)
- **Mockoon API**: http://localhost:3000
- **OIDC Mock**: http://localhost:8080

### Development Commands

```bash
# View logs
docker compose -f docker-compose.development.yml logs -f web

# View specific service logs
docker compose -f docker-compose.development.yml logs -f db

# Restart a service
docker compose -f docker-compose.development.yml restart web

# Stop all services
docker compose -f docker-compose.development.yml down

# Stop and remove volumes (WARNING: deletes database data)
docker compose -f docker-compose.development.yml down -v

# Start services again
docker compose -f docker-compose.development.yml up -d
```

### Hot Reload

The development environment supports hot reload:

- Edit files in `src/` directory
- Changes automatically reflected in browser
- No need to restart containers

### Dependency Changes

Dependencies are managed via a named Docker volume and auto-synced on container startup:

- After adding/removing packages (updating `pnpm-lock.yaml`), just restart the web service:
  `docker compose -f docker-compose.development.yml restart web`
- No image rebuild is needed — the entrypoint script detects lockfile changes and runs
  `pnpm install`
- To force a clean reinstall: `docker volume rm inkapp-dev_web_node_modules` then start again

## Troubleshooting

### Services Won't Start

```bash
# Check logs for specific service
docker compose -f docker-compose.development.yml logs db
docker compose -f docker-compose.development.yml logs web

# Check if ports are already in use
sudo netstat -tlnp | grep -E "5173|5432|3000|8080"

# Verify .env.development exists
ls -la .env.development
cat .env.development
```

### Database Connection Issues

```bash
# Check database is running
docker compose -f docker-compose.development.yml ps db

# Check database logs
docker compose -f docker-compose.development.yml logs db

# Manually connect to database
docker compose -f docker-compose.development.yml exec db \
    psql -U phellow -d phellow_dev

# Run migrations manually
docker compose -f docker-compose.development.yml run --rm migrate
```

### Migration Fails

```bash
# Check migration logs
docker compose -f docker-compose.development.yml logs migrate

# Verify migration files exist
ls -la drizzle/

# Manually run migration
docker compose -f docker-compose.development.yml run --rm migrate
```

### Application Won't Load

```bash
# Check web service logs
docker compose -f docker-compose.development.yml logs -f web

# Check if source files are properly mounted
docker compose -f docker-compose.development.yml exec web ls -la src/

# Verify all dependencies installed
docker compose -f docker-compose.development.yml exec web pnpm list

# Force dependency reinstall (clear the named volume)
docker compose -f docker-compose.development.yml down
docker volume rm inkapp-dev_web_node_modules
docker compose -f docker-compose.development.yml up -d

# Rebuild base image if needed (e.g. Node.js version change)
docker compose -f docker-compose.development.yml up -d --build web
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :5173
sudo lsof -i :5432

# Kill the process or change port in docker-compose.development.yml
# Example: Change "5173:5173" to "5174:5173" for external port 5174
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up unused Docker resources (if safe to do)
docker system prune -a

# Remove old/unused images
docker images
docker rmi [IMAGE_ID]
```

### Container Keeps Restarting

```bash
# Check logs for error messages
docker compose -f docker-compose.development.yml logs [service-name]

# Check container exit code
docker compose -f docker-compose.development.yml ps -a

# Inspect container
docker inspect inkapp-app-dev
```

## Maintenance

### Updating Images

When you have new versions:

1. Build new images on your machine
2. Export new tar files
3. Transfer to customer VM
4. Stop services: `docker compose -f docker-compose.development.yml down`
5. Load new images: `docker load -i new-image.tar`
6. Start services: `docker compose -f docker-compose.development.yml up -d`

> **Note**: For dependency-only changes (no Node.js or system-level changes), you do **not** need to
> rebuild and transfer images. Just update `package.json` and `pnpm-lock.yaml` in the source code —
> the container will auto-install new dependencies on next startup.

### Backup Database

```bash
# Backup database
docker compose -f docker-compose.development.yml exec db \
    pg_dump -U phellow phellow_dev > backup.sql

# Restore database
cat backup.sql | docker compose -f docker-compose.development.yml exec -T db \
    psql -U phellow -d phellow_dev
```

### Clean Restart

```bash
# Stop all services
docker compose -f docker-compose.development.yml down

# Remove all data (WARNING: deletes database)
docker compose -f docker-compose.development.yml down -v

# Start fresh
docker compose -f docker-compose.development.yml up -d
```

## File Sizes Reference

- `inkapp-app:dev` image: ~1-1.5GB
- `inkapp-oidc-mock:dev` image: ~100-200MB
- `postgres:17` image: ~400-500MB
- `mockoon/cli:latest` image: ~200-300MB
- Source code + configs: ~100-200MB
- **Total transfer size (compressed)**: ~1.5-2GB

## Security Notes

1. **Change default passwords** in `.env.development`
2. **Firewall rules**: Only expose necessary ports
3. **HTTPS**: Use reverse proxy (nginx/traefik) for production access
4. **Database backups**: Regular backups of `postgres_dev_data` volume
5. **Update regularly**: Plan for periodic image updates

## Support

For issues during deployment:

1. Check logs: `docker compose -f docker-compose.development.yml logs`
2. Verify all images loaded: `docker images`
3. Check service health: `docker compose -f docker-compose.development.yml ps`
4. Review this troubleshooting section

## Quick Reference Commands

```bash
# Start everything
docker compose -f docker-compose.development.yml up -d

# Stop everything
docker compose -f docker-compose.development.yml down

# View logs
docker compose -f docker-compose.development.yml logs -f

# Restart web service
docker compose -f docker-compose.development.yml restart web

# Check status
docker compose -f docker-compose.development.yml ps

# Clean restart (keeps data)
docker compose -f docker-compose.development.yml restart

# Nuclear option (deletes all data)
docker compose -f docker-compose.development.yml down -v && \
docker compose -f docker-compose.development.yml up -d
```
