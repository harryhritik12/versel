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

# Copy frontend source files (excluding backend)
COPY . . 

# Run the frontend build
RUN npm run build

# ====== Stage 3: Setup Backend (Node.js & Python) ======
FROM base AS backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libreoffice qpdf python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*  # Clean up

# Install required Python dependencies
RUN pip install pdfplumber python-docx pymupdf pdf2docx

# Set working directory to backend
WORKDIR /app/backend

# Copy only backend source files
COPY backend ./ 

# Ensure frontend build is available inside backend
COPY --from=frontend-build /app/build ./build

# Expose ports
EXPOSE 5000
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
