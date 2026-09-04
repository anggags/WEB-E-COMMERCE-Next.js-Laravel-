#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Tokoo Deploy Script — Run on VPS after cloning the repo
# Usage: bash docker/scripts/deploy.sh yourdomain.com
# ============================================================

DOMAIN="${1:?Usage: bash deploy.sh yourdomain.com}"
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
DB_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}▸ $1${NC}"; }
err() { echo -e "${RED}✘ $1${NC}" >&2; exit 1; }

# --- 1. System update + Docker install ---
log "Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  log "Docker installed. You may need to log out/in for group changes."
fi

if ! command -v docker compose &>/dev/null; then
  log "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
fi

# --- 2. Create production env files ---
log "Configuring environment files..."

# Backend .env
sed -i \
  -e "s|APP_KEY=.*|APP_KEY=$(php -r "echo 'base64:'.base64_encode(random_bytes(32));" 2>/dev/null || echo 'CHANGE_ME')|" \
  -e "s|APP_URL=.*|APP_URL=https://$DOMAIN|" \
  -e "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" \
  -e "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" \
  -e "s|SESSION_DOMAIN=.*|SESSION_DOMAIN=.$DOMAIN|" \
  -e "s|MAIL_FROM_ADDRESS=.*|MAIL_FROM_ADDRESS=hello@$DOMAIN|" \
  -e "s|APP_MAINTENANCE_DRIVER=.*|APP_MAINTENANCE_DRIVER=database|" \
  backend/.env.production

# Docker .env
cat > .env.docker <<EOF
DOMAIN=$DOMAIN
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DB_DATABASE=tokoo
DB_USERNAME=tokoo
DB_PASSWORD=$DB_PASSWORD
EOF

log "Environment files configured."
log "DB password: $DB_PASSWORD"
log "Save this password securely!"

# --- 3. Build & start ---
log "Building and starting containers..."
docker compose build --no-cache
docker compose up -d

# --- 4. Wait for MySQL ---
log "Waiting for MySQL to be ready..."
sleep 10

# --- 5. Laravel setup ---
log "Running Laravel migrations..."
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache
docker compose exec backend php artisan storage:link

# --- 6. Seed admin user ---
log "Creating admin user..."
docker compose exec backend php artisan tinker --execute="
\App\Models\User::updateOrCreate(
    ['email' => 'admin@$DOMAIN'],
    ['name' => 'Admin', 'password' => bcrypt('password'), 'role' => 'admin', 'email_verified_at' => now()]
);
echo 'Admin created: admin@$DOMAIN / password\n';
"

# --- 7. SSL with Certbot ---
log "Setting up SSL..."
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "admin@$DOMAIN" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" 2>/dev/null || log "SSL setup skipped — run manually after DNS points to this server."

# --- 8. Enable SSL in nginx (if cert exists) ---
if docker compose run --rm certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  log "SSL certificate found. Updating nginx config..."
  sed -i \
    -e "s/# listen 443 ssl/http2;/listen 443 ssl http2;/" \
    -e "s/# ssl_certificate.*/ssl_certificate \/etc\/letsencrypt\/live\/$DOMAIN\/fullchain.pem;/" \
    -e "s/# ssl_certificate_key.*/ssl_certificate_key \/etc\/letsencrypt\/live\/$DOMAIN\/privkey.pem;/" \
    -e "s/# include \/etc\/letsencrypt/options-ssl-nginx.conf;/include \/etc\/letsencrypt\/options-ssl-nginx.conf;/" \
    -e "s/# ssl_dhparam.*/ssl_dhparam \/etc\/letsencrypt\/ssl-dhparams.pem;/" \
    docker/nginx/default.conf
  docker compose exec nginx nginx -s reload
fi

# --- Done ---
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Tokoo Deployed Successfully!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Domain:     https://$DOMAIN"
echo "  Admin:      https://$DOMAIN/admin"
echo "  Admin User: admin@$DOMAIN"
echo "  Admin Pass: password"
echo ""
echo "  ⚠ Change admin password after first login!"
echo "  ⚠ Update MIDTRANS keys in backend/.env.production"
echo "  ⚠ Point your domain DNS to this server's IP"
echo ""
