FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    git \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pytest pytest-cov coverage xmlrunner

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p data/test data/incidents data/stations

# Setup test database
RUN python setup_test_database.py --db-path=test_fire_ems.db

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=testing
ENV DATABASE_URL=sqlite:///test_fire_ems.db

# Expose port for application
EXPOSE 5000

# Set the entrypoint
ENTRYPOINT ["python"]
CMD ["run_all_tests.py", "--simplified"]