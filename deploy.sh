#!/bin/bash

# EMEA Security Roadshow Quiz - Deployment Script
# This script helps deploy the quiz to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}EMEA Security Roadshow Quiz - Deployment${NC}"
echo "=========================================="
echo ""

# Check if podman is available
if ! command -v podman &> /dev/null; then
    echo -e "${RED}Error: Podman is not installed${NC}"
    exit 1
fi

# Function to build the image
build_image() {
    echo -e "${YELLOW}Building container image...${NC}"
    podman build -t security-quiz:latest .
    echo -e "${GREEN}✓ Image built successfully${NC}"
    echo ""
}

# Function to run locally
run_local() {
    echo -e "${YELLOW}Starting container locally...${NC}"

    # Stop existing container if running
    podman stop security-quiz 2>/dev/null || true
    podman rm security-quiz 2>/dev/null || true

    # Run new container
    podman run -d \
        --name security-quiz \
        -p 8080:8080 \
        security-quiz:latest

    echo -e "${GREEN}✓ Container started${NC}"
    echo ""
    echo "Access the quiz at: http://localhost:8080"
    echo "View logs: podman logs -f security-quiz"
    echo "Stop: podman stop security-quiz"
    echo ""
}

# Function to deploy to OpenShift
deploy_openshift() {
    echo -e "${YELLOW}Deploying to OpenShift...${NC}"

    if ! command -v oc &> /dev/null; then
        echo -e "${RED}Error: oc CLI is not installed${NC}"
        exit 1
    fi

    # Check if logged in
    if ! oc whoami &> /dev/null; then
        echo -e "${RED}Error: Not logged in to OpenShift${NC}"
        echo "Run: oc login"
        exit 1
    fi

    echo "Current project: $(oc project -q)"
    read -p "Deploy to this project? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi

    # Create app from Dockerfile
    oc new-app . --name=security-quiz --strategy=docker || echo "App already exists"

    # Expose route
    oc expose svc/security-quiz || echo "Route already exists"

    # Get route
    ROUTE=$(oc get route security-quiz -o jsonpath='{.spec.host}')

    echo -e "${GREEN}✓ Deployed to OpenShift${NC}"
    echo ""
    echo "Access the quiz at: https://${ROUTE}"
    echo "View logs: oc logs -f deployment/security-quiz"
    echo ""
}

# Function to tag for registry
tag_image() {
    echo -e "${YELLOW}Tagging image for registry...${NC}"
    read -p "Enter registry URL (e.g., quay.io/username): " REGISTRY

    podman tag security-quiz:latest ${REGISTRY}/security-quiz:latest
    podman tag security-quiz:latest ${REGISTRY}/security-quiz:1.0.0

    echo -e "${GREEN}✓ Image tagged${NC}"
    echo ""
    echo "Push with:"
    echo "  podman push ${REGISTRY}/security-quiz:latest"
    echo "  podman push ${REGISTRY}/security-quiz:1.0.0"
    echo ""
}

# Main menu
echo "Choose deployment option:"
echo "  1) Build container image"
echo "  2) Run locally (port 8080)"
echo "  3) Deploy to OpenShift"
echo "  4) Tag for container registry"
echo "  5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        build_image
        ;;
    2)
        build_image
        run_local
        ;;
    3)
        deploy_openshift
        ;;
    4)
        build_image
        tag_image
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Done!${NC}"
