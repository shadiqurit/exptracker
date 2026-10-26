# 🚀 Production Server Deployment Guide

This guide walks you through deploying the **Expense Tracker Application** on any production server (Ubuntu, Debian, Rocky Linux, AWS EC2, DigitalOcean, Hetzner, Linode, etc.).

---

## 📋 Option 1: Docker Compose Deployment (Recommended)

Docker Compose bundles MySQL 8.0, the Node.js TypeScript API, the Vue 3 Frontend, and the Nginx reverse proxy into orchestrated containers with zero manual configuration.

### Prerequisites on Your Server
- Git
- Docker & Docker Compose (`sudo apt install -y docker.io docker-compose-plugin`)

### Step-by-Step Instructions

1. **Clone the Repository to Your Server**:
   ```bash
   git clone https://github.com/DevShadiq/exptracker.git /var/www/exptracker
   cd /var/www/exptracker
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` using `nano .env` and configure your secure production passwords:
   ```env
   MYSQL_ROOT_PASSWORD=YourStrongDatabasePassword123!
   MYSQL_DATABASE=expense_tracker
   JWT_ACCESS_SECRET=your_random_access_secret_key_at_least_32_characters
   JWT_REFRESH_SECRET=your_random_refresh_secret_key_at_least_32_characters
   PORT=3006
   ```

3. **Deploy with 1-Command**:
   Make the automated deployment script executable and run it:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   Or run directly with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Deployment**:
   - Check container status: `docker compose ps`
   - View backend live logs: `docker compose logs -f backend`
   - Access web app: `http://your-server-ip`
   - Access Swagger API docs: `http://your-server-ip:3006/api/docs`

---

## 🖥️ Option 2: Native Linux VPS Deployment (PM2 + Nginx + MySQL)

For lightweight setups without Docker on an Ubuntu 22.04 / 24.04 LTS server.

### 1. Install Node.js, MySQL, PM2, and Nginx
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx mysql-server git

# Install PM2 process manager
sudo npm install -g pm2
```

### 2. Configure MySQL Database
```bash
sudo mysql
```
Inside MySQL shell:
```sql
CREATE DATABASE expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Deploy Backend API
```bash
cd /var/www/exptracker/backend

# Configure production .env
cat <<EOF > .env
NODE_ENV=production
PORT=3006
DATABASE_URL="mysql://expense_user:StrongPassword123!@localhost:3306/expense_tracker?connection_limit=10"
JWT_ACCESS_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="https://your-domain.com,http://your-domain.com"
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
DEFAULT_CURRENCY="BDT"
DEFAULT_TIMEZONE="Asia/Dhaka"
EOF

# Install dependencies and build
npm ci
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run build

# Start API with PM2 cluster mode
cd /var/www/exptracker
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Build Frontend Web Application
```bash
cd /var/www/exptracker/frontend
npm ci
npm run build
```
The compiled SPA production files will be located at `/var/www/exptracker/frontend/dist`.

### 5. Configure Nginx Web Server
Copy the pre-configured Nginx site file:
```bash
sudo cp /var/www/exptracker/nginx/exptracker-vps.conf /etc/nginx/sites-available/exptracker
```
Edit `/etc/nginx/sites-available/exptracker` and replace `your-domain.com` with your actual domain or server IP.

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/exptracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Free HTTPS / SSL with Let's Encrypt (Certbot)

To secure your domain with free automated SSL certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will automatically install the certificate, update Nginx configuration to enforce HTTPS redirection, and set up automatic renewal cron jobs.

---

## 💾 Database Backup Automation

To schedule daily automated MySQL backups:
```bash
sudo mkdir -p /var/backups/mysql

# Add cron job (runs daily at 2:00 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * mysqldump -u expense_user -p'StrongPassword123!' expense_tracker | gzip > /var/backups/mysql/expense_tracker_\$(date +\%F).sql.gz") | crontab -
```
