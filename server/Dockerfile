# Use a lightweight Node.js runtime environment
FROM node:20-alpine
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install only production dependencies (skips local dev tools like nodemon to save space)
RUN npm install --omit=dev

# Copy all your server folders and files (controllers, routes, models, server.js)
COPY . .

# Inform Docker that the backend container listens on port 5000
EXPOSE 5000

# Start the live production Express server
CMD ["node", "server.js"]
