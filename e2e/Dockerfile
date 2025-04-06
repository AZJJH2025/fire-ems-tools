FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the files
COPY . .

# Create results directory
RUN mkdir -p test-results

# Set environment variables
ENV NODE_ENV=test
ENV BASE_URL=http://app:5000

# Command to run tests
CMD ["npx", "playwright", "test"]