# Stage 1: Compile the React code
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configurations first to take advantage of Docker layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of your frontend code files
COPY . .

# Environment variables that point the React code to our production AWS Load Balancer
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Compile the React application into optimized static assets inside the /dist folder
RUN npm run build

# Stage 2: Serve the compiled static files using Nginx
FROM nginx:alpine

# Copy the compiled assets from Stage 1 into Nginx's public HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# CRITICAL TEACHER/INTERVIEW POINT: Overwrite Nginx configuration 
# This tells Nginx to redirect all sub-routes (like /profile or /admin) back to index.html.
# Without this, refreshing any sub-page on your React app will trigger a 404 Not Found error.
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
