# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source code
COPY . .

# Set the API URL for production
ENV REACT_APP_API_URL=https://news-perspectives-backend-fait-444705.a.run.app
ENV REACT_APP_GOOGLE_API_KEY=AIzaSyCMbpCUgNl7acYkY9bwo1C4c36vWVJXqfY

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
