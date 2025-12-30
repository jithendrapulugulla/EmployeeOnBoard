#!/bin/bash

# Azure Deployment Script for Employee Onboarding Application
# This script deploys both backend and frontend to Azure App Service

set -e

echo "==================================="
echo "Azure Deployment Script"
echo "==================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Configuration variables
RESOURCE_GROUP="${1:-EmployeeOnboarding}"
LOCATION="${2:-eastus}"
APP_NAME="${3:-employee-onboarding}"
BACKEND_APP_NAME="${APP_NAME}-backend"
FRONTEND_APP_NAME="${APP_NAME}-frontend"
CONTAINER_REGISTRY="${4:-${APP_NAME}registry}"
DOCKER_IMAGE_BACKEND="${CONTAINER_REGISTRY}.azurecr.io/${APP_NAME}-backend:latest"
DOCKER_IMAGE_FRONTEND="${CONTAINER_REGISTRY}.azurecr.io/${APP_NAME}-frontend:latest"

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Backend App: $BACKEND_APP_NAME"
echo "  Frontend App: $FRONTEND_APP_NAME"
echo "  Container Registry: $CONTAINER_REGISTRY"

# Login to Azure
echo ""
echo "Logging into Azure..."
az login

# Create resource group if it doesn't exist
echo ""
echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" || true

# Create Container Registry if it doesn't exist
echo ""
echo "Creating container registry..."
az acr create --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_REGISTRY" --sku Basic || true

# Login to container registry
echo ""
echo "Logging into container registry..."
az acr login --name "$CONTAINER_REGISTRY"

# Build and push backend Docker image
echo ""
echo "Building backend Docker image..."
az acr build --registry "$CONTAINER_REGISTRY" --image "${APP_NAME}-backend:latest" --file backend/Dockerfile ./backend

# Build and push frontend Docker image
echo ""
echo "Building frontend Docker image..."
az acr build --registry "$CONTAINER_REGISTRY" --image "${APP_NAME}-frontend:latest" --file frontend/Dockerfile ./frontend

# Create App Service Plan if it doesn't exist
echo ""
echo "Creating App Service Plan..."
az appservice plan create --name "${APP_NAME}-plan" --resource-group "$RESOURCE_GROUP" --sku B2 --is-linux || true

# Deploy backend
echo ""
echo "Deploying backend application..."
az webapp create --resource-group "$RESOURCE_GROUP" --plan "${APP_NAME}-plan" --name "$BACKEND_APP_NAME" --deployment-container-image-name "$DOCKER_IMAGE_BACKEND" || true

# Configure backend app settings
echo ""
echo "Configuring backend application settings..."
az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$BACKEND_APP_NAME" --settings \
  WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
  DOCKER_REGISTRY_SERVER_URL="https://${CONTAINER_REGISTRY}.azurecr.io" \
  DOCKER_REGISTRY_SERVER_USERNAME=$(az acr credential show --name "$CONTAINER_REGISTRY" --query username --output tsv) \
  DOCKER_REGISTRY_SERVER_PASSWORD=$(az acr credential show --name "$CONTAINER_REGISTRY" --query "passwords[0].value" --output tsv)

# Deploy frontend
echo ""
echo "Deploying frontend application..."
az webapp create --resource-group "$RESOURCE_GROUP" --plan "${APP_NAME}-plan" --name "$FRONTEND_APP_NAME" --deployment-container-image-name "$DOCKER_IMAGE_FRONTEND" || true

# Configure frontend app settings
echo ""
echo "Configuring frontend application settings..."
az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$FRONTEND_APP_NAME" --settings \
  WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
  DOCKER_REGISTRY_SERVER_URL="https://${CONTAINER_REGISTRY}.azurecr.io" \
  DOCKER_REGISTRY_SERVER_USERNAME=$(az acr credential show --name "$CONTAINER_REGISTRY" --query username --output tsv) \
  DOCKER_REGISTRY_SERVER_PASSWORD=$(az acr credential show --name "$CONTAINER_REGISTRY" --query "passwords[0].value" --output tsv) \
  REACT_APP_API_BASE_URL="https://${BACKEND_APP_NAME}.azurewebsites.net/api"

# Enable CI/CD
echo ""
echo "Enabling continuous deployment..."
az webapp deployment container config --name "$BACKEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --enable-cd
az webapp deployment container config --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --enable-cd

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo "Backend URL: https://${BACKEND_APP_NAME}.azurewebsites.net"
echo "Frontend URL: https://${FRONTEND_APP_NAME}.azurewebsites.net"
echo "==================================="
