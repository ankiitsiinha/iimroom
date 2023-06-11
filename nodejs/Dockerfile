# Use the Node.js 14 base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the code files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

