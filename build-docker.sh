#!/bin/bash

# Build the optimized production image
echo "Building optimized Docker image..."
docker build -t ohbc-website:optimized -f Dockerfile.prod .

# Show the image size
echo -e "\nImage built successfully. Size details:"
docker images ohbc-website:optimized --format "{{.Repository}}:{{.Tag}} - Size: {{.Size}}"

echo -e "\nTo run the container:"
echo "docker run -p 3000:3000 ohbc-website:optimized"
echo -e "\nThen open http://localhost:3000 in your browser"
