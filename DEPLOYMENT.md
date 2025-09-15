# 🚀 Deployment Guide - Tourist Safety System

## Production Deployment Checklist

### 📋 Pre-Deployment Requirements

**System Requirements:**
- Python 3.8+ with pip
- Node.js 16+ with npm
- PostgreSQL 12+ database
- SSL certificates for HTTPS
- Domain name (optional)

**Environment Setup:**
- Production server (Linux/Windows)
- Reverse proxy (Nginx recommended)
- Process manager (PM2 for Node.js, systemd for Python)
- Firewall configuration

### 🐍 Backend Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and PostgreSQL
sudo apt install python3 python3-pip postgresql postgresql-contrib

# Create database
sudo -u postgres createdb tourist_safety_db
sudo -u postgres createuser tourist_user
sudo -u postgres psql -c "ALTER USER tourist_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tourist_safety_db TO tourist_user;"
```

#### 2. Application Setup
```bash
# Clone repository
git clone <repository-url>
cd "SIH (Tourist App)"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirement.txt

# Install production server
pip install gunicorn
```

#### 3. Environment Configuration
Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://tourist_user:secure_password@localhost/tourist_safety_db

# Security
SECRET_KEY=your-super-secret-key-here
ADMIN_PASSWORD_HASH=hashed-password

# CORS Origins (production domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Keys (if needed)
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### 4. Database Migration
```bash
# Run the application once to create tables
python main.py
# Tables will be auto-created via SQLAlchemy
```

#### 5. Production Server
Create `gunicorn.conf.py`:
```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
```

Start with Gunicorn:
```bash
gunicorn main:app -c gunicorn.conf.py
```

#### 6. Systemd Service
Create `/etc/systemd/system/tourist-api.service`:
```ini
[Unit]
Description=Tourist Safety API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/SIH (Tourist App)
Environment=PATH=/path/to/SIH (Tourist App)/venv/bin
ExecStart=/path/to/SIH (Tourist App)/venv/bin/gunicorn main:app -c gunicorn.conf.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable tourist-api
sudo systemctl start tourist-api
```

### ⚛️ Frontend Deployment

#### 1. Build Production Bundle
```bash
cd front

# Install dependencies
npm install

# Build for production
npm run build
```

#### 2. Nginx Configuration
Create `/etc/nginx/sites-available/tourist-safety`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend
    location / {
        root /path/to/SIH (Tourist App)/front/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Proxy
    location /ws/ {
        proxy_pass http://localhost:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/tourist-safety /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 🔒 Security Configuration

#### 1. Firewall Setup
```bash
# UFW Firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 2. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 3. Database Security
```bash
# PostgreSQL security
sudo nano /etc/postgresql/12/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/12/main/pg_hba.conf
# Ensure proper authentication methods
```

### 📊 Monitoring & Logging

#### 1. Application Logs
```bash
# View API logs
sudo journalctl -u tourist-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 2. Health Checks
Create monitoring script:
```bash
#!/bin/bash
# health-check.sh
curl -f http://localhost:8000/ || systemctl restart tourist-api
```

Add to crontab:
```bash
*/5 * * * * /path/to/health-check.sh
```

### 🔄 Backup Strategy

#### 1. Database Backup
```bash
# Daily backup script
#!/bin/bash
pg_dump tourist_safety_db > /backups/tourist_db_$(date +%Y%m%d).sql
find /backups -name "tourist_db_*.sql" -mtime +7 -delete
```

#### 2. Application Backup
```bash
# Backup application files
tar -czf /backups/tourist_app_$(date +%Y%m%d).tar.gz /path/to/SIH\ \(Tourist\ App\)
```

### 🚀 CI/CD Pipeline (Optional)

#### GitHub Actions Example
```yaml
name: Deploy Tourist Safety App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/SIH\ \(Tourist\ App\)
            git pull origin main
            source venv/bin/activate
            pip install -r requirement.txt
            cd front && npm install && npm run build
            sudo systemctl restart tourist-api
            sudo systemctl reload nginx
```

### 📱 Mobile App Deployment

#### PWA Configuration
The React app is already configured as a PWA. For mobile deployment:

1. **App Store Deployment** (using Capacitor):
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npx cap run ios
npx cap run android
```

2. **Play Store Requirements**:
- App signing key
- Privacy policy
- App screenshots
- Store listing

### 🔧 Performance Optimization

#### 1. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_tourists_tourist_id ON tourists(tourist_id);
CREATE INDEX idx_tourist_locations_tourist_id ON tourist_locations(tourist_id);
CREATE INDEX idx_tourist_locations_last_updated ON tourist_locations(last_updated);
```

#### 2. Caching Strategy
```python
# Redis caching (optional)
pip install redis
# Add caching to frequently accessed data
```

#### 3. CDN Setup
- Use CloudFlare or AWS CloudFront
- Cache static assets
- Enable compression

### 📋 Post-Deployment Checklist

- [ ] Backend API accessible via HTTPS
- [ ] Frontend loads correctly
- [ ] Database connections working
- [ ] WebSocket connections functional
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Error logging active
- [ ] Performance monitoring
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Environment variables secure

### 🆘 Troubleshooting

**Common Issues:**

1. **502 Bad Gateway**
   - Check if backend service is running
   - Verify proxy configuration

2. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify connection string
   - Check firewall rules

3. **WebSocket Connection Failed**
   - Verify Nginx WebSocket proxy config
   - Check if WebSocket endpoint is accessible

4. **CORS Errors**
   - Update ALLOWED_ORIGINS in backend
   - Check Nginx headers configuration

### 📞 Support Contacts

- **Technical Support**: tech@tourist-safety.gov.in
- **Emergency Hotline**: 1363
- **System Admin**: admin@tourist-safety.gov.in

---

**Deployment completed successfully! 🎉**

Your Tourist Safety System is now live and ready to serve tourists safely.
