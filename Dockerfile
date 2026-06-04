# Multi-stage build for production-ready container
FROM registry.access.redhat.com/ubi9/php-83:latest

# Metadata
LABEL maintainer="EMEA Security Roadshow Quiz" \
      version="1.0.0" \
      description="EMEA Security Roadshow Knowledge Check."

# Set working directory
WORKDIR /opt/app-root/src

# Install system dependencies
USER root
RUN dnf install -y \
    php-json \
    && dnf clean all \
    && rm -rf /var/cache/dnf

# Copy application files
COPY --chown=1001:0 *.html ./
COPY --chown=1001:0 *.css ./
COPY --chown=1001:0 *.js ./
COPY --chown=1001:0 *.php ./
COPY --chown=1001:0 *.json ./
COPY --chown=1001:0 *.md ./
COPY --chown=1001:0 images/ ./images/

# Create data directory for leaderboard CSV
RUN mkdir -p /opt/app-root/src/data

# Set proper permissions
RUN chown -R 1001:0 /opt/app-root/src && \
    chmod -R g=u /opt/app-root/src && \
    chmod 755 /opt/app-root/src && \
    chmod 775 /opt/app-root/src/data

# Switch back to non-root user
USER 1001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Expose port
EXPOSE 8080

# Start PHP built-in server
CMD ["php", "-S", "0.0.0.0:8080", "-t", "/opt/app-root/src"]
