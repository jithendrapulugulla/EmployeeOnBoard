# Azure Quick Start Configuration

Use this file to quickly set up and deploy to Azure.

## Step 1: Pre-Deployment Checklist

- [ ] Azure subscription created and logged in
- [ ] Azure CLI installed (`az --version`)
- [ ] Docker installed (`docker --version`)
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string obtained
- [ ] Email credentials ready (Gmail app password)
- [ ] GitHub repository created (for CI/CD)

## Step 2: Quick Setup Commands

### Login to Azure
```bash
az login
```

### Set Default Subscription (if you have multiple)
```bash
az account set --subscription "Your Subscription Name"
```

### Clone and Navigate to Project
```bash
cd path/to/EmployeeOnBoard
```

## Step 3: One-Command Deployment (Recommended for First-Time)

### Windows PowerShell:
```powershell
# Navigate to project root first
cd path/to/EmployeeOnBoard

# Run deployment script with your preferred settings
.\deploy-to-azure.bat "MyResourceGroup" "eastus" "employee-onboarding" "myregistry"

# Monitor the deployment
az appservice plan list --resource-group MyResourceGroup
```

### Mac/Linux:
```bash
# Navigate to project root first
cd path/to/EmployeeOnBoard

# Make script executable
chmod +x deploy-to-azure.sh

# Run deployment
./deploy-to-azure.sh "MyResourceGroup" "eastus" "employee-onboarding" "myregistry"

# Monitor the deployment
az appservice plan list --resource-group MyResourceGroup
```

## Step 4: Configure Environment Variables in Azure

After deployment, set these variables in Azure App Service:

### Backend App Service Configuration

```bash
RESOURCE_GROUP="MyResourceGroup"
BACKEND_APP="employee-onboarding-backend"

# Set all required environment variables
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --settings \
    MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/employee-onboarding" \
    JWT_SECRET="your-super-secret-jwt-key-min-32-chars" \
    EMAIL_USER="your-email@gmail.com" \
    EMAIL_PASSWORD="your-gmail-app-password" \
    NODE_ENV="production" \
    PORT="8080" \
    FRONTEND_URL="https://employee-onboarding-frontend.azurewebsites.net"
```

### Frontend App Service Configuration

```bash
FRONTEND_APP="employee-onboarding-frontend"

# Set frontend environment variables
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FRONTEND_APP" \
  --settings \
    REACT_APP_API_BASE_URL="https://employee-onboarding-backend.azurewebsites.net/api" \
    REACT_APP_ENVIRONMENT="production"
```

## Step 5: Verify Deployment Success

```bash
# Get the URLs
echo "Backend: https://$(az webapp show --resource-group MyResourceGroup --name employee-onboarding-backend --query defaultHostName -o tsv)"
echo "Frontend: https://$(az webapp show --resource-group MyResourceGroup --name employee-onboarding-frontend --query defaultHostName -o tsv)"

# Test backend health
BACKEND_URL=$(az webapp show --resource-group MyResourceGroup --name employee-onboarding-backend --query defaultHostName -o tsv)
curl "https://$BACKEND_URL/health"

# Should return: {"status":"OK","message":"Server is running"}
```

## Step 6: Set Up CI/CD (Optional but Recommended)

### Create GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:

```
AZURE_CREDENTIALS: (run this command)
REGISTRY_LOGIN_SERVER: myregistry.azurecr.io
REGISTRY_USERNAME: (from Azure Container Registry → Access Keys)
REGISTRY_PASSWORD: (from Azure Container Registry → Access Keys)
BACKEND_APP_NAME: employee-onboarding-backend
FRONTEND_APP_NAME: employee-onboarding-frontend
```

### Generate AZURE_CREDENTIALS
```bash
az ad sp create-for-rbac \
  --name "github-employee-onboarding" \
  --role contributor \
  --scopes /subscriptions/your-subscription-id \
  --json-auth
```

Copy the entire JSON output and paste as `AZURE_CREDENTIALS` secret.

### Get Container Registry Credentials
```bash
az acr credential show --name myregistry
```

Now push to your `main` branch - GitHub Actions will automatically deploy!

## Step 7: Monitor and Manage

### View Application Logs
```bash
# Backend logs
az webapp log tail --resource-group MyResourceGroup --name employee-onboarding-backend

# Frontend logs
az webapp log tail --resource-group MyResourceGroup --name employee-onboarding-frontend
```

### Restart Apps
```bash
# Restart backend
az webapp restart --resource-group MyResourceGroup --name employee-onboarding-backend

# Restart frontend
az webapp restart --resource-group MyResourceGroup --name employee-onboarding-frontend
```

### Update Environment Variables Anytime
```bash
# Update MongoDB URI
az webapp config appsettings set \
  --resource-group MyResourceGroup \
  --name employee-onboarding-backend \
  --settings MONGODB_URI="new-connection-string"
```

## Useful Azure CLI Commands Reference

```bash
# List all resource groups
az group list --output table

# List all web apps in a resource group
az webapp list --resource-group MyResourceGroup --output table

# Show web app details
az webapp show --resource-group MyResourceGroup --name employee-onboarding-backend

# Delete everything (CAUTION!)
az group delete --name MyResourceGroup --yes --no-wait
```

## Estimated Monthly Costs (with B2 plan)

- App Service Plan (B2): ~$50/month
- Container Registry (Basic): ~$5/month  
- MongoDB Atlas (Free tier): ~$0 (for small databases)
- Total: ~$55/month (approximate)

## Troubleshooting Quick Links

- **App won't start?** → Run `az webapp log tail` to see error logs
- **CORS errors?** → Check `FRONTEND_URL` is set correctly in backend
- **Can't connect to MongoDB?** → Verify IP whitelist in MongoDB Atlas
- **404 errors on frontend?** → Check nginx.conf and React routing

## Next Steps

1. Test your application at the URLs
2. Set up custom domain (optional)
3. Configure SSL certificates
4. Set up monitoring and alerts
5. Configure auto-scaling if needed
6. Set up backup strategy for MongoDB

For detailed guidance, see `AZURE_DEPLOYMENT.md`
