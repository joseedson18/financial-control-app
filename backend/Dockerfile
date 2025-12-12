# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install any needed packages specified in requirements.txt
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY backend /app/backend

# Ensure package imports resolve when run as a module
ENV PYTHONPATH="/app"

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV PORT="8000"

# Run the FastAPI app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
