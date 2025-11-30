FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libssl-dev \
    libffi-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .

# upgrade pip/setuptools/wheel then install requirements
# Increase timeout to 100 seconds to prevent network errors
RUN pip install --upgrade pip setuptools wheel --default-timeout=100 && \
    pip install --no-cache-dir -r requirements.txt --default-timeout=100

# Copy application code
COPY ./app ./app

# Create a non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]