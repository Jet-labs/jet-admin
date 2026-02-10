# Multi-stage build for the Jet admin application
FROM node:18-alpine

# Install required packages first (before other operations)
# Added dos2unix to fix Windows line endings in shell scripts
RUN apk add --no-cache postgresql-client openssl openssl-dev nginx shadow dos2unix

# Create nginx user/group if they don't exist (Alpine compatibility)
RUN addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true


# Create necessary nginx directories
RUN mkdir -p /etc/nginx /var/log/nginx /var/cache/nginx /run/nginx

# Set up backend first (for better layer caching of dependencies)
WORKDIR /apps/backend
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend/ .
COPY apps/backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Set up frontend
WORKDIR /apps/frontend
COPY apps/frontend/package*.json ./
RUN npm install --force
COPY apps/frontend/ .

# Configure nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script, convert line endings (Windows CRLF to Unix LF), and make it executable
COPY docker-entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Create error page directory
RUN mkdir -p /usr/share/nginx/html
RUN echo '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server Error</h1><p>Something went wrong. Please try again later.</p></body></html>' > /usr/share/nginx/html/50x.html

# Expose ports for backend API and frontend (HTTP and HTTPS)
EXPOSE 8090 80 443

# Add healthcheck for container health monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/v1/health || exit 1

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Start the backend with PM2
CMD ["npm", "run", "pm2"]
