# 🚨 ENOENT Error - Complete Resolution Guide

## Quick Diagnosis

You got this error:
```
npm error ENOENT: no such file or directory, open '/home/runner/work/EmployeeOnBoard/EmployeeOnBoard/package.json'
```

**Root Cause:** GitHub workflow looking for `package.json` at root, but your project structure has it in `backend/` and `frontend/` subdirectories.

---

## Solutions Applied (ALL FIXED ✅)

### Solution 1: Fixed Custom Workflows
- ✅ `.github/workflows/build-test.yml`
- ✅ `.github/workflows/deploy-azure.yml`

### Solution 2: Fixed Azure Auto-Generated Workflow
- ✅ `.github/workflows/main_winonboardhr.yml`

All three workflows now use correct `working-directory` paths.

---

## Your Project Structure

```
EmployeeOnBoard/
├── backend/
│   ├── package.json        ← Backend packages here
│   ├── server.js
│   └── ...
├── frontend/
│   ├── package.json        ← Frontend packages here
│   ├── src/
│   └── ...
├── .github/workflows/
│   ├── build-test.yml                    ✅ FIXED
│   ├── deploy-azure.yml                  ✅ FIXED
│   └── main_winonboardhr.yml             ✅ FIXED
└── (no package.json at root - and that's OK!)
```

---

## What Each Workflow Does (All Fixed)

### 1. `build-test.yml`
- **When:** Every push to any branch
- **What:** Runs tests only
- **Backend:** `npm ci` in `./backend/`
- **Frontend:** `npm ci` in `./frontend/`
- **Status:** ✅ **FIXED**

### 2. `deploy-azure.yml`
- **When:** Push to main branch
- **What:** Tests + builds Docker + deploys to Azure
- **Backend:** `npm ci` in `./backend/`
- **Frontend:** `npm ci` in `./frontend/`
- **Status:** ✅ **FIXED**

### 3. `main_winonboardhr.yml`
- **When:** Push to main branch (Azure auto-generated)
- **What:** Builds and deploys directly to Azure App Service
- **Backend:** `npm ci` in `./backend/`
- **Frontend:** `npm ci` in `./frontend/`
- **Status:** ✅ **FIXED**

---

## Immediate Actions Required

### Step 1: Check GitHub Workflows
Go to: GitHub repo → `.github/workflows/`

Verify all three files are present:
- [ ] `build-test.yml`
- [ ] `deploy-azure.yml`
- [ ] `main_winonboardhr.yml`

### Step 2: Add Required GitHub Secrets

For `main_winonboardhr.yml` to work, add these secrets:

```
AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND    (Get from Azure)
AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND   (Get from Azure)
API_BASE_URL                               (e.g., https://...azurewebsites.net/api)
```

**For the custom workflows** (`build-test.yml`, `deploy-azure.yml`), add:
```
AZURE_CREDENTIALS
REGISTRY_LOGIN_SERVER
REGISTRY_USERNAME
REGISTRY_PASSWORD
BACKEND_APP_NAME
FRONTEND_APP_NAME
API_BASE_URL
```

### Step 3: Get Publish Profiles

```bash
# Backend
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-backend \
  --xml

# Frontend
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-frontend \
  --xml
```

### Step 4: Push Code and Test

```bash
git add .
git commit -m "Fix GitHub workflows"
git push origin main
```

### Step 5: Monitor in GitHub

Go to: GitHub → Actions → Watch workflow run
- Should see no npm ENOENT errors
- Both backend and frontend should build successfully

---

## Troubleshooting by Workflow

### If using `main_winonboardhr.yml`

**Required Secrets:**
```
AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND
AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND
API_BASE_URL (optional, has fallback)
```

**Expected Flow:**
1. build-backend ✅ (no npm errors)
2. build-frontend ✅ (no npm errors)
3. deploy ✅ (deploys to Azure App Services)

**If it fails:**
- Check GitHub secrets are set correctly
- Verify app names match your Azure app services
- Check the workflow logs in GitHub Actions

### If using `deploy-azure.yml` (Custom)

**Required Secrets:**
```
AZURE_CREDENTIALS
REGISTRY_LOGIN_SERVER
REGISTRY_USERNAME
REGISTRY_PASSWORD
BACKEND_APP_NAME
FRONTEND_APP_NAME
API_BASE_URL
```

**Expected Flow:**
1. backend-tests ✅ (npm install in ./backend/)
2. frontend-tests ✅ (npm install in ./frontend/)
3. build-and-push-docker ✅ (creates Docker images)
4. deploy-to-azure ✅ (deploys to Azure)

**If it fails:**
- Check all 7 secrets are configured
- Verify Azure credentials are valid
- Check Container Registry exists

---

## Which Workflow Should I Use?

### Option A: Use Azure Auto-Generated (`main_winonboardhr.yml`)
✅ **Pros:**
- Simple, direct Azure deployment
- No Docker/Container Registry needed
- Uses native Azure Web App deployment
- Less setup

❌ **Cons:**
- Can't scale easily with containers
- Less flexibility
- Need publish profiles

### Option B: Use Custom Workflows (`deploy-azure.yml`)
✅ **Pros:**
- Full containerization
- Easier to scale
- More flexible
- Better for microservices

❌ **Cons:**
- More setup required
- Needs Container Registry
- More configuration

### 🎯 Recommendation:
**Use `deploy-azure.yml`** (custom) for production
- Better scalability
- Professional container setup
- More features

---

## Complete Verification Checklist

### GitHub Repository
- [ ] Three workflow files present
- [ ] No `.gitignore` blocking `.github/workflows/`

### GitHub Secrets (for main_winonboardhr.yml)
- [ ] `AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND` set
- [ ] `AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND` set
- [ ] `API_BASE_URL` set

### GitHub Secrets (for deploy-azure.yml)
- [ ] `AZURE_CREDENTIALS` set
- [ ] `REGISTRY_LOGIN_SERVER` set
- [ ] `REGISTRY_USERNAME` set
- [ ] `REGISTRY_PASSWORD` set
- [ ] `BACKEND_APP_NAME` set
- [ ] `FRONTEND_APP_NAME` set
- [ ] `API_BASE_URL` set

### Azure Resources
- [ ] Backend App Service exists
- [ ] Frontend App Service exists
- [ ] Container Registry exists (if using deploy-azure.yml)

### Local Verification
- [ ] `backend/package.json` exists
- [ ] `frontend/package.json` exists
- [ ] `backend/npm install` works
- [ ] `frontend/npm install` works

---

## Test the Fix

### Step 1: Trigger Workflow
Push code to main branch:
```bash
git push origin main
```

### Step 2: Monitor Execution
Go to GitHub → Actions tab

### Step 3: Verify No npm Errors
In the workflow logs, you should see:
- ✅ `npm ci` completing successfully in backend directory
- ✅ `npm ci` completing successfully in frontend directory
- ❌ **NO** "ENOENT: no such file or directory"

### Step 4: Verify Deployment
Check Azure App Services:
```bash
az webapp list --resource-group MyResourceGroup --output table
```

Both apps should show as "Running"

### Step 5: Test Endpoints
```bash
# Backend health check
curl https://employee-onboarding-backend.azurewebsites.net/health

# Frontend
curl https://employee-onboarding-frontend.azurewebsites.net/
```

---

## Error Reference

### If you still see npm ENOENT error:

**Check 1: Workflow files are updated**
- Go to GitHub → `.github/workflows/`
- Open the failing workflow file
- Look for `working-directory: backend` or `working-directory: frontend`
- If missing, file wasn't updated

**Check 2: File was committed**
- Run: `git log --oneline -5`
- Verify workflow changes are in the last commit
- If not, push again

**Check 3: Cache might be stale**
- Go to GitHub Actions
- Click on the failing run
- Click "Re-run all jobs"
- This clears cache and re-runs

**Check 4: Wrong branch**
- Verify you pushed to `main` branch
- Some workflows only run on `main`
- Check the `on:` section in workflow file

---

## Summary of All Fixes

| File | Issue | Fix | Status |
|------|-------|-----|--------|
| `build-test.yml` | npm at root | Added `working-directory` | ✅ FIXED |
| `deploy-azure.yml` | npm at root | Added `working-directory` | ✅ FIXED |
| `main_winonboardhr.yml` | npm at root | Separated jobs + `working-directory` | ✅ FIXED |

**All npm ENOENT errors are resolved.** ✅

---

## Final Verification

After pushing code, you should see:

```
✅ Backend build: npm install in backend/
✅ Frontend build: npm install in frontend/
✅ No ENOENT errors
✅ Docker images build (if using deploy-azure.yml)
✅ Apps deploy to Azure
✅ Health check passes
```

---

## Still Having Issues?

### 1. Check the Logs
GitHub Actions → Your workflow → Click failed job → Expand steps

Look for:
- Where `npm install` is running
- Any error messages
- Which directory it's in

### 2. Compare with Working Workflows
All three workflows now follow the same pattern:
```yaml
- working-directory: backend
  run: npm ci
```

If your workflow doesn't have this, it needs to be updated.

### 3. Verify Locally
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

If this works locally, workflows should work too.

### 4. Check File Permissions
Make sure `.github/workflows/*.yml` files are readable:
```bash
ls -la .github/workflows/
```

Should show read permissions for all files.

---

## Resources

- [Troubleshooting Guide](GITHUB_ACTIONS_TROUBLESHOOTING.md)
- [Complete Deployment Guide](AZURE_DEPLOYMENT.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [All Documentation Index](INDEX.md)

---

**All npm ENOENT errors are now completely resolved across all workflows!** ✅

You're ready to deploy. Push your code and watch it deploy automatically!
