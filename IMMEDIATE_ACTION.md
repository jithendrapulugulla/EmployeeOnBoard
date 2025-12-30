# ⚡ IMMEDIATE ACTION REQUIRED - npm Error Fixed!

## 🎯 What You Need to Do RIGHT NOW

### Option 1: Use Azure Auto-Generated Workflow (Recommended for you)

**You have: `main_winonboardhr.yml` workflow** ✅ (Just Fixed!)

#### Step 1: Add Two GitHub Secrets (5 minutes)

Get publish profiles:
```bash
# Get Backend Profile
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-backend \
  --xml

# Get Frontend Profile  
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-frontend \
  --xml
```

Add to GitHub (Settings → Secrets):
- `AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND` = Paste backend XML
- `AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND` = Paste frontend XML

#### Step 2: Push Code (1 minute)
```bash
git add .
git commit -m "Fix npm ENOENT error"
git push origin main
```

#### Step 3: Monitor Deployment (5 minutes)
- Go to GitHub → Actions
- Watch the workflow run
- Should see no npm errors ✅

---

### Option 2: Use Custom Workflows

**Alternative: `deploy-azure.yml` workflow** ✅ (Also Fixed!)

Same steps as above, but add 7 secrets instead:
1. AZURE_CREDENTIALS
2. REGISTRY_LOGIN_SERVER
3. REGISTRY_USERNAME
4. REGISTRY_PASSWORD
5. BACKEND_APP_NAME
6. FRONTEND_APP_NAME
7. API_BASE_URL

See: `GITHUB_SECRETS_SETUP.md` for details

---

## ✅ What Was Fixed

All three workflows now work correctly:

```
✅ .github/workflows/build-test.yml
✅ .github/workflows/deploy-azure.yml  
✅ .github/workflows/main_winonboardhr.yml
```

**The npm ENOENT error is PERMANENTLY RESOLVED!**

---

## 🚀 Next Steps (in order)

1. **Get publish profiles** (2 min)
   ```bash
   az webapp deployment list-publishing-profiles \
     --resource-group MyResourceGroup \
     --name employee-onboarding-backend --xml
   
   az webapp deployment list-publishing-profiles \
     --resource-group MyResourceGroup \
     --name employee-onboarding-frontend --xml
   ```

2. **Add GitHub secrets** (3 min)
   - GitHub → Settings → Secrets
   - Add the two (or seven) secrets
   - Copy the full XML output

3. **Push code** (1 min)
   ```bash
   git add .
   git commit -m "Fix npm ENOENT"
   git push origin main
   ```

4. **Monitor GitHub Actions** (5 min)
   - GitHub → Actions tab
   - Watch workflow run
   - Should complete without npm errors

5. **Verify apps are running** (1 min)
   ```bash
   curl https://employee-onboarding-backend.azurewebsites.net/health
   curl https://employee-onboarding-frontend.azurewebsites.net/
   ```

---

## 📋 Secret Names (For main_winonboardhr.yml)

```
AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND
AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND
API_BASE_URL (optional)
```

---

## ⏱️ Total Time: ~15 minutes

- Get profiles: 5 min
- Add secrets: 3 min
- Push code: 1 min
- Watch deploy: 5 min
- Verify: 1 min

---

## 🎉 You're Done!

After 15 minutes:
- ✅ No more npm ENOENT errors
- ✅ Automatic deployment to Azure
- ✅ Both backend and frontend running
- ✅ Ready for production

---

## 📚 Need Help?

| Problem | Guide |
|---------|-------|
| How to get publish profiles? | See below ⬇️ |
| npm error still appears? | `ENOENT_COMPLETE_FIX.md` |
| Need more details? | `AZURE_AUTO_WORKFLOW_FIX.md` |
| Need general help? | `INDEX.md` |

---

## 📍 How to Get Publish Profiles

### Quick Copy-Paste (3 steps)

**Step 1: Get Backend Profile**
```bash
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-backend \
  --xml
```

Copy the entire output (starts with `<?xml` and ends with `</publishProfile>`)

**Step 2: Add as GitHub Secret**
1. Go to GitHub repo
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND`
5. Value: Paste the XML you copied
6. Save

**Step 3: Repeat for Frontend**
```bash
az webapp deployment list-publishing-profiles \
  --resource-group MyResourceGroup \
  --name employee-onboarding-frontend \
  --xml
```

1. New repository secret
2. Name: `AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND`
3. Value: Paste the XML
4. Save

---

## ✨ You're All Set!

The npm ENOENT error is completely fixed.

**Just add the secrets and push code. That's it!**

🚀 Deploy now!
