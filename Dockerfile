# Multi-stage Dockerfile for ApexOutreach CRM & Campaign Studio
FROM node:20-alpine AS frontend-builder
WORKDIR /app/crm_app
COPY crm_app/package*.json ./
RUN npm install
COPY crm_app/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    requests \
    beautifulsoup4 \
    pandas

# Copy project files
COPY Scrapping/ ./Scrapping/
COPY crm_backend/ ./crm_backend/
COPY hosting.py ./
COPY --from=frontend-builder /app/crm_app/dist ./crm_app/dist

ENV PORT=5005
ENV HOST=0.0.0.0
EXPOSE 5005

CMD ["python", "hosting.py", "--no-browser"]
