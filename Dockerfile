# Stage 1: Build the frontend
FROM node:20 AS frontend
WORKDIR /app/client

# Copy only the frontend's package.json and package-lock.json
COPY client/package*.json ./

# Install frontend dependencies and build the frontend
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Build the backend
FROM node:20 AS backend
WORKDIR /app/server

# Copy the backend's package.json and package-lock.json from the root
COPY package*.json /app/

# Install backend dependencies using the root `package.json`
RUN npm install

# Copy backend code and frontend build output
COPY server /app/server
COPY --from=frontend /app/client/dist /app/server/dist/client

# Compile the backend TypeScript code
RUN npm run build

# Expose the server port
EXPOSE 3000

# Run the compiled backend code
CMD ["node", "/app/server/dist/index.js"]
