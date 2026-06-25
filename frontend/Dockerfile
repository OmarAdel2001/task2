# --- Build Stage ---
FROM alpine:3.19 AS builder
WORKDIR /src
COPY index.html styles.css app.js nginx.conf ./

# --- Production Stage ---
FROM nginx:1.25-alpine

# Copy static assets from builder stage
COPY --from=builder /src/index.html /usr/share/nginx/html/
COPY --from=builder /src/styles.css /usr/share/nginx/html/
COPY --from=builder /src/app.js /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY --from=builder /src/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Basic healthcheck to verify Nginx is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

