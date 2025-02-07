# ====== Stage 1: Build React Frontend ======
FROM node:18-bullseye AS frontend-build

# Set working directory inside the container
WORKDIR /app/frontend

# Copy only package.json and package-lock.json first for caching
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY frontend ./

# Build React app
RUN npm run build


# ====== Stage 2: Setup Backend (Node.js) ======
FROM node:18-bullseye AS backend

# Set working directory inside the container
WORKDIR /app

# Install system dependencies (LibreOffice & qpdf)
RUN apt-get update && apt-get install -y libreoffice qpdf

# Copy backend package.json and install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy backend source files
COPY backend ./

# Copy React frontend build files to serve from Express
COPY --from=frontend-build /app/frontend/build ./frontend-build

# Expose ports
EXPOSE 5000  
EXPOSE 3000  

# Start the backend server
CMD ["node", "server.js"]  # Change "server.js" to your actual backend entry file
