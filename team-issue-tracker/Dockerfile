FROM node:20-alpine

# Install Python and pip for ML prediction
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /usr/src/app

# Copy ML requirements and install
COPY ml/requirements.txt ./ml/
RUN pip install --no-cache-dir -r ./ml/requirements.txt --break-system-packages

# Copy backend package.json and install
COPY backend/package*.json ./backend/
WORKDIR /usr/src/app/backend
RUN npm install --production

# Copy all source
WORKDIR /usr/src/app
COPY backend ./backend
COPY ml ./ml

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PYTHON_PATH=python3

# Run the backend
WORKDIR /usr/src/app/backend
CMD [ "npm", "start" ]
