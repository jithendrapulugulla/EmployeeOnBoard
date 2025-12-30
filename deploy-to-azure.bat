@echo off
REM Azure Deployment Script for Windows (PowerShell)
REM This script deploys both backend and frontend to Azure App Service

setlocal enabledelayedexpansion

echo ===================================
echo Azure Deployment Script
echo ===================================

REM Check if Azure CLI is installed
az version >nul 2>&1
if errorlevel 1 (
    echo Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
    exit /b 1
)

REM Configuration variables
set RESOURCE_GROUP=%1
if "!RESOURCE_GROUP!"=="" set RESOURCE_GROUP=EmployeeOnboarding

set LOCATION=%2
if "!LOCATION!"=="" set LOCATION=eastus

set APP_NAME=%3
if "!APP_NAME!"=="" set APP_NAME=employee-onboarding

set BACKEND_APP_NAME=!APP_NAME!-backend
set FRONTEND_APP_NAME=!APP_NAME!-frontend
set CONTAINER_REGISTRY=%4
if "!CONTAINER_REGISTRY!"=="" set CONTAINER_REGISTRY=!APP_NAME!registry

echo Configuration:
echo   Resource Group: !RESOURCE_GROUP!
echo   Location: !LOCATION!
echo   Backend App: !BACKEND_APP_NAME!
echo   Frontend App: !FRONTEND_APP_NAME!
echo   Container Registry: !CONTAINER_REGISTRY!

REM Login to Azure
echo.
echo Logging into Azure...
call az login

REM Create resource group
echo.
echo Creating resource group...
call az group create --name "!RESOURCE_GROUP!" --location "!LOCATION!"

REM Create Container Registry
echo.
echo Creating container registry...
call az acr create --resource-group "!RESOURCE_GROUP!" --name "!CONTAINER_REGISTRY!" --sku Basic

REM Login to container registry
echo.
echo Logging into container registry...
call az acr login --name "!CONTAINER_REGISTRY!"

REM Build and push Docker images
echo.
echo Building backend Docker image...
call az acr build --registry "!CONTAINER_REGISTRY!" --image "!APP_NAME!-backend:latest" --file backend/Dockerfile ./backend

echo.
echo Building frontend Docker image...
call az acr build --registry "!CONTAINER_REGISTRY!" --image "!APP_NAME!-frontend:latest" --file frontend/Dockerfile ./frontend

REM Create App Service Plan
echo.
echo Creating App Service Plan...
call az appservice plan create --name "!APP_NAME!-plan" --resource-group "!RESOURCE_GROUP!" --sku B2 --is-linux

REM Deploy backend
echo.
echo Deploying backend application...
call az webapp create --resource-group "!RESOURCE_GROUP!" --plan "!APP_NAME!-plan" --name "!BACKEND_APP_NAME!" --deployment-container-image-name "!CONTAINER_REGISTRY!.azurecr.io/!APP_NAME!-backend:latest"

REM Configure backend
echo.
echo Configuring backend application settings...
for /f "tokens=*" %%i in ('az acr credential show --name "!CONTAINER_REGISTRY!" --query username --output tsv') do set ACR_USER=%%i
for /f "tokens=*" %%i in ('az acr credential show --name "!CONTAINER_REGISTRY!" --query "passwords[0].value" --output tsv') do set ACR_PASS=%%i

call az webapp config appsettings set --resource-group "!RESOURCE_GROUP!" --name "!BACKEND_APP_NAME!" --settings ^
  WEBSITES_ENABLE_APP_SERVICE_STORAGE=false ^
  DOCKER_REGISTRY_SERVER_URL="https://!CONTAINER_REGISTRY!.azurecr.io" ^
  DOCKER_REGISTRY_SERVER_USERNAME="!ACR_USER!" ^
  DOCKER_REGISTRY_SERVER_PASSWORD="!ACR_PASS!"

REM Deploy frontend
echo.
echo Deploying frontend application...
call az webapp create --resource-group "!RESOURCE_GROUP!" --plan "!APP_NAME!-plan" --name "!FRONTEND_APP_NAME!" --deployment-container-image-name "!CONTAINER_REGISTRY!.azurecr.io/!APP_NAME!-frontend:latest"

REM Configure frontend
echo.
echo Configuring frontend application settings...
call az webapp config appsettings set --resource-group "!RESOURCE_GROUP!" --name "!FRONTEND_APP_NAME!" --settings ^
  WEBSITES_ENABLE_APP_SERVICE_STORAGE=false ^
  DOCKER_REGISTRY_SERVER_URL="https://!CONTAINER_REGISTRY!.azurecr.io" ^
  DOCKER_REGISTRY_SERVER_USERNAME="!ACR_USER!" ^
  DOCKER_REGISTRY_SERVER_PASSWORD="!ACR_PASS!" ^
  REACT_APP_API_BASE_URL="https://!BACKEND_APP_NAME!.azurewebsites.net/api"

REM Enable CI/CD
echo.
echo Enabling continuous deployment...
call az webapp deployment container config --name "!BACKEND_APP_NAME!" --resource-group "!RESOURCE_GROUP!" --enable-cd
call az webapp deployment container config --name "!FRONTEND_APP_NAME!" --resource-group "!RESOURCE_GROUP!" --enable-cd

echo.
echo ===================================
echo Deployment Complete!
echo ===================================
echo Backend URL: https://!BACKEND_APP_NAME!.azurewebsites.net
echo Frontend URL: https://!FRONTEND_APP_NAME!.azurewebsites.net
echo ===================================

endlocal
