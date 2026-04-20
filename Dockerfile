# Start from official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (so Docker caches dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Tell Docker your app runs on port 3000
EXPOSE 3000

# Command to start your app
CMD ["node", "index.js"]