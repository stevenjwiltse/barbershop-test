# Use a slim Python base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start the FastAPI app
CMD ["sh", "scripts/start.sh"]