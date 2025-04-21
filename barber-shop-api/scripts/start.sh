#!/bin/sh

# Install dependencies
pip install -r requirements.txt

# Set Python path for relative imports
export PYTHONPATH=/app

# Run database migrations
alembic upgrade head

# Start FastAPI server
cd src
uvicorn main:app --host 0.0.0.0 --port 8000
