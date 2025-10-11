# Drishti Institute - Production Deployment Guide

## Prerequisites
- Node.js 18+
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate
- Domain name

## Environment Setup

### 1. Update .env file with production values:
```bash
# Google Drive API Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/production/drive-api-file.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_production_folder_id

# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=your_production_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# Razorpay Configuration (Production)
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id

# Course Pricing (in INR)
CLASS_9_PRICE=2999
CLASS_10_PRICE=3999
CLASS_11_PRICE=4999
CLASS_12_PRICE=5999

# Server Configuration
PORT=5001
HOST=0.0.0.0
NODE_ENV=production
```

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Install PM2 (if not installed)
```bash
npm install -g pm2
```

### 4. Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Nginx
Create `/etc/nginx/sites-available/drishti-institute`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:5001;
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
```

### 6. Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/drishti-institute /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Security Checklist
- [ ] SSL certificate installed
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Environment variables secured
- [ ] Google Drive service account permissions set correctly
- [ ] Firebase security rules configured
- [ ] Razorpay webhook endpoints secured

## Monitoring
```bash
# Check application status
pm2 status

# View logs
pm2 logs drishti-institute

# Monitor resources
pm2 monit
```

## Backup Strategy
- [ ] Database backups (Firebase/Firestore)
- [ ] Environment configuration backup
- [ ] Google Drive service account key backup
- [ ] SSL certificates backup

## Domain Configuration
1. Point your domain A record to server IP
2. Configure DNS for www subdomain
3. Set up SSL certificate (Let's Encrypt recommended)
4. Test HTTPS redirect

## Post-Deployment Testing
- [ ] User registration works
- [ ] Payment integration works
- [ ] Course enrollment works
- [ ] Video streaming works
- [ ] Mobile responsiveness
- [ ] SSL certificate valid
- [ ] Performance optimization