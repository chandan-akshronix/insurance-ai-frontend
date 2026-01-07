# Insurance AI Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY react-ui-user/package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source
COPY react-ui-user/ .
COPY admin_panel/ ./admin_panel/
RUN ln -sf /app/admin_panel /admin_panel

# Build
RUN npm run build

# Production Stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Use 'build' folder (not 'dist')
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
