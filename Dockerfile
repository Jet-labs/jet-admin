# Multi-stage build for the restaurant admin application
FROM node:18-alpine

# Build frontend
WORKDIR /apps/frontend
COPY apps/frontend/package*.json ./
RUN npm install --force
COPY apps/frontend/ .

# Install required packages
RUN apk add --no-cache postgresql-client openssl openssl-dev nginx

# Set up backend
WORKDIR /apps/backend
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend/ .
COPY apps/backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Configure nginx
RUN mkdir -p /etc/nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script from its new location and make it executable
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose ports for backend API and frontend
EXPOSE 8090 80

# Create startup script
# RUN echo '#!/bin/sh\nnginx\ncd /apps/backend && npm run pm2' > /apps/start.sh
# RUN chmod +x /apps/start.sh

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Change CMD to:
CMD ["npm", "run", "pm2"]
