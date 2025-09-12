# ---- Runtime stage (Nginx) ----
FROM nginx:1.27-alpine

# SPA-friendly nginx config with caching for hashed assets
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    # Gzip/basic perf
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    
    # Cache hashed assets for a year
    location ~* ^/assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    location ~* \\.(?:woff2?|ttf|otf|eot|png|jpg|jpeg|gif|webp|avif|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Everything else: serve index.html (SPA fallback)
    location / {
        try_files \$uri /index.html;
    }
}
EOF

# Copy build output (make sure to run npm run build locally first)
COPY ./dist /usr/share/nginx/html

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

EXPOSE 80
