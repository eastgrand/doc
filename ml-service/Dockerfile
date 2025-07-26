FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Environment variables
ENV PORT=5000
ENV DEBUG=False
ENV PYTHONUNBUFFERED=1

# Add healthcheck to help container orchestrators
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/ping || exit 1

# Expose the port
EXPOSE 5000

# Use gunicorn as the production web server
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 "app:app" 