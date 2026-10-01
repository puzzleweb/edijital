# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies (clean install with optional deps included)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production Runtime Stage
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
