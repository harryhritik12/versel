# ====== Stage 1: Install Dependencies ======
FROM node:18-bullseye AS base

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# ====== Stage 2: Build React Frontend ======
FROM base AS frontend-build

# Copy frontend source files
COPY src ./src

# Build the frontend
RUN npm run build

# ====== Stage 3: Setup Backend (Node.js & Python) ======
FROM base AS backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libreoffice qpdf python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*  # Clean up

# Install required Python dependencies
RUN pip install pdfplumber python-docx pymupdf pdf2docx

# Copy all source files (including backend)
COPY . .

# Ensure React frontend build is available in backend
RUN mv src/build backend/build

# Expose ports
EXPOSE 5000
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/server.js"]
