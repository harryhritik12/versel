# ====== Stage 1: Install Dependencies ======
FROM node:18-bullseye AS base

# Set working directory inside the container
WORKDIR /app

# Copy shared package.json and install dependencies
COPY package.json package-lock.json ./
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
RUN apt-get update && apt-get install -y libreoffice qpdf python3 python3-pip

# Install required Python dependencies
RUN pip install pdfplumber python-docx pymupdf pdf2docx

# Copy backend source files
COPY backend ./backend

# Copy React frontend build files to serve from Express
COPY --from=frontend-build /app/src/build ./backend/build

# Expose ports
EXPOSE 5000 
EXPOSE 3000  

# Start the backend server
CMD ["node", "backend/server.js"]  # Change if your entry file is different
