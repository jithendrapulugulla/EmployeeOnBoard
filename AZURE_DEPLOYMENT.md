# Azure Deployment Guide

This guide provides step-by-step instructions for deploying the Employee Onboarding Application to Microsoft Azure.

## Prerequisites

- Azure subscription (with sufficient credits for App Service, Container Registry, and MongoDB Atlas)
- Azure CLI installed ([Download here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Docker installed locally
- Node.js 18+ installed
- Git repository set up with GitHub (for CI/CD)
- MongoDB Atlas account for cloud MongoDB (since we're keeping MongoDB)

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Azure App Service Plan          │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐ ┌────────────────┐  │
│  │  Backend App   │ │ Frontend App   │  │
│  │  (Node.js)     │ │ (React/Nginx)  │  │
│  └────────────────┘ └────────────────┘  │
│         ↓                   ↓            │
└─────────────────────────────────────────┘
         │                   │
         └───────┬───────────┘
                 │
        ┌────────▼────────┐
        │  MongoDB Atlas  │
        │   (Cloud)       │
        └─────────────────┘
```

## Step 1: Prepare Your Local Environment

### 1.1 Install Azure CLI

```bash
# macOS
brew install azure-cli

# Windows (using Chocolatey)
choco install azure-cli

# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 1.2 Create MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user and get the connection string
4. Your connection string should look like:
   ```
   mongodb+srv://username:password@cluster-name.mongodb.net/employee-onboarding?retryWrites=true&w=majority
   ```

### 1.3 Prepare Email Service Credentials

You'll need SMTP credentials (e.g., from Gmail with app-specific password)

## Step 2: Configure Environment Variables

### 2.1 Backend Configuration

The backend is configured with environment-specific files:

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.azure` - Azure production

**Example Azure Production Setup:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-onboarding
PORT=8080
JWT_SECRET=your-very-secure-jwt-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=https://your-frontend-app.azurewebsites.net
```

### 2.2 Frontend Configuration

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production (Azure)

**Example Production Setup:**
```bash
REACT_APP_API_BASE_URL=https://your-backend-app.azurewebsites.net/api
REACT_APP_ENVIRONMENT=production
```

## Step 3: Deploy Using Automated Script

### Option A: Windows Users

```powershell
# Make the script executable and run it
& ".\deploy-to-azure.bat" "MyResourceGroup" "eastus" "employee-onboarding" "myregistry"
```

### Option B: Mac/Linux Users

```bash
# Make the script executable
chmod +x deploy-to-azure.sh

# Run with parameters
./deploy-to-azure.sh "MyResourceGroup" "eastus" "employee-onboarding" "myregistry"
```

**Script Parameters:**
- `RESOURCE_GROUP` - Azure resource group name (default: EmployeeOnboarding)
- `LOCATION` - Azure region (default: eastus)
- `APP_NAME` - Application name base (default: employee-onboarding)
- `CONTAINER_REGISTRY` - Container registry name (default: ${APP_NAME}registry)

### What the Script Does:

1. Creates an Azure resource group
2. Creates an Azure Container Registry
3. Builds Docker images for backend and frontend
4. Pushes images to Container Registry
5. Creates an App Service Plan
6. Deploys backend and frontend apps
7. Configures environment variables
8. Enables continuous deployment

## Step 4: Deploy Using Azure Resource Manager Template

### 4.1 Create Parameters File

Create `azure-params.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appName": {
      "value": "employee-onboarding"
    },
    "location": {
      "value": "eastus"
    },
    "containerRegistryName": {
      "value": "myregistry"
    },
    "containerRegistryUsername": {
      "value": "your-registry-username"
    },
    "containerRegistryPassword": {
      "value": "your-registry-password"
    },
    "mongodbUri": {
      "value": "mongodb+srv://username:password@cluster.mongodb.net/employee-onboarding"
    },
    "jwtSecret": {
      "value": "your-very-secure-jwt-secret"
    },
    "emailUser": {
      "value": "your-email@gmail.com"
    },
    "emailPassword": {
      "value": "your-app-specific-password"
    }
  }
}
```

### 4.2 Deploy Using Azure CLI

```bash
az login

az group create \
  --name MyResourceGroup \
  --location eastus

az deployment group create \
  --resource-group MyResourceGroup \
  --template-file azure-deploy.json \
  --parameters azure-params.json
```

## Step 5: Set Up CI/CD with GitHub Actions

### 5.1 Configure GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

```
AZURE_CREDENTIALS: (Service Principal JSON)
REGISTRY_LOGIN_SERVER: your-registry.azurecr.io
REGISTRY_USERNAME: (from Container Registry)
REGISTRY_PASSWORD: (from Container Registry)
BACKEND_APP_NAME: employee-onboarding-backend
FRONTEND_APP_NAME: employee-onboarding-frontend
```

### 5.2 Create Service Principal

```bash
az ad sp create-for-rbac \
  --name "github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --json-auth
```

Copy the output JSON and paste it as the `AZURE_CREDENTIALS` secret.

### 5.3 GitHub Actions Workflow

The workflow files are automatically created:
- `.github/workflows/build-test.yml` - Tests on every push
- `.github/workflows/deploy-azure.yml` - Deploys to Azure on main branch

## Step 6: Verify Deployment

### 6.1 Check App Services

```bash
# List all web apps
az webapp list --resource-group MyResourceGroup --query "[].name"

# Check app status
az webapp show --resource-group MyResourceGroup --name employee-onboarding-backend

# View logs
az webapp log tail --resource-group MyResourceGroup --name employee-onboarding-backend
```

### 6.2 Test Endpoints

```bash
# Test backend health
curl https://employee-onboarding-backend.azurewebsites.net/health

# Test frontend
curl https://employee-onboarding-frontend.azurewebsites.net/
```

## Step 7: Configure Custom Domain (Optional)

```bash
az webapp config hostname add \
  --resource-group MyResourceGroup \
  --webapp-name employee-onboarding-backend \
  --hostname api.yourdomain.com

az webapp config hostname add \
  --resource-group MyResourceGroup \
  --webapp-name employee-onboarding-frontend \
  --hostname yourdomain.com
```

## Step 8: Monitor and Scale

### 8.1 View Metrics

```bash
az monitor metrics list-definitions \
  --resource-group MyResourceGroup \
  --resource-type "Microsoft.Web/sites" \
  --resource employee-onboarding-backend
```

### 8.2 Scale Up

```bash
# Scale to a higher tier
az appservice plan update \
  --name employee-onboarding-plan \
  --resource-group MyResourceGroup \
  --sku P1V2
```

## Troubleshooting

### App Service Won't Start

1. Check logs:
   ```bash
   az webapp log tail --resource-group MyResourceGroup --name employee-onboarding-backend
   ```

2. Verify environment variables are set correctly:
   ```bash
   az webapp config appsettings list \
     --resource-group MyResourceGroup \
     --name employee-onboarding-backend
   ```

### CORS Issues

Update the `FRONTEND_URL` environment variable:

```bash
az webapp config appsettings set \
  --resource-group MyResourceGroup \
  --name employee-onboarding-backend \
  --settings FRONTEND_URL=https://your-frontend-url.azurewebsites.net
```

### MongoDB Connection Issues

1. Verify connection string in `MONGODB_URI`
2. Check MongoDB Atlas IP whitelist includes Azure IP ranges
3. Ensure database user has correct permissions

### Docker Image Issues

```bash
# List images in registry
az acr repository list --name myregistry

# Delete and rebuild
az acr repository delete --name myregistry --image employee-onboarding-backend:latest
az acr build --registry myregistry --image employee-onboarding-backend:latest --file backend/Dockerfile ./backend
```

## Cost Optimization Tips

1. Use **B1/B2 App Service Plans** for development/staging
2. Use **P1V2** for production with auto-scaling
3. Enable **App Service Scale Out** for auto-scaling
4. Use **Azure DevOps** for free CI/CD pipeline
5. Monitor costs with **Azure Cost Management**

## Cleanup

To delete all resources and stop incurring costs:

```bash
az group delete --name MyResourceGroup --yes --no-wait
```

## Support and Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [GitHub Actions with Azure](https://github.com/marketplace/actions/azure-login)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
