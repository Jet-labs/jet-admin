FROM node:18-alpine

# Install postgres-client for database health checks
RUN apk add --no-cache postgresql-client openssl openssl-dev

WORKDIR /app

COPY package*.json ./

RUN npm install



COPY . .

COPY prisma ./prisma/

RUN npx prisma generate

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 8090

# ENTRYPOINT ["./docker-entrypoint.sh"]
CMD [ "npm", "run", "pm2" ]