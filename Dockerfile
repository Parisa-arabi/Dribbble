# Use the official Node.js 18-alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install python3 and build tools
RUN npm install


# Copy the rest of your application's code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application

CMD cd backend && node app.js