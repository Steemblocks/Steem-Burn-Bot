# Use official Node.js LTS (Long Term Support) image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production && \
    npm cache clean --force

# Copy application files
COPY steem_burn_bot.js ./

# Don't copy config.json - it should be mounted as volume
# This prevents accidentally baking credentials into the image

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production

# Run the bot
CMD ["node", "steem_burn_bot.js"]
