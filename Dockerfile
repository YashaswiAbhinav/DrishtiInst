FROM node:18-alpine

WORKDIR .

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]