# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- MetaMask with Mantle Sepolia testnet configured

---

## Step 1: Deploy to GitHub (Public Repository)

### A. Initialize Git (if not already done)
```bash
cd C:\Users\lcifuentes\Downloads\AGRO-BOND
git init
git add .
git commit -m "Initial commit: AgroBond MVP for Mantle Hackathon"
```

### B. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `agro-bond`
3. Visibility: **Public** ✅
4. DO NOT initialize with README (we already have one)
5. Click "Create repository"

### C. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/agro-bond.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Frontend to Vercel

### A. Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `agro-bond` repo
4. **Framework Preset:** Next.js (auto-detected)
5. **Root Directory:** `frontend` ⚠️ IMPORTANT
6. Click "Environment Variables" and add:
   ```
   PRIVATE_KEY=YOUR_ORACLE_PRIVATE_KEY_HERE
   ```
   ⚠️ **Use a dedicated testnet wallet for production** - Never use your main wallet's private key!

7. Click "Deploy"

### B. Via Vercel CLI (Alternative)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set up and deploy: `Y`
- Which scope: (select your account)
- Link to existing project: `N`
- Project name: `agro-bond`
- Root directory: `./`
- Override settings: `N`

Add environment variable:
```bash
vercel env add PRIVATE_KEY
```
Paste your private key when prompted.

---

## Step 3: Verify Deployment

### Frontend
- Visit your Vercel URL: `https://agro-bond.vercel.app`
- Test wallet connection
- Run a full flow: Connect → Analyze → Mint → Sell

### Contracts (Already Deployed on Mantle Sepolia)
Verify on explorer: https://explorer.sepolia.mantle.xyz
- AgroBond: `0xeaeaE47163c9dd84345F2975B6817674e79F5799`
- LiquidityPool: `0x9B3788b2DD3172f64976a7c7Cb8b521BF8ddAfCB`
- Oracle: `0xcD95a0422C026f342c914293aa207fE6Cad6B8BA`

---

## Step 4: Post-Deployment Checklist

✅ GitHub repo is public and accessible  
✅ README.md displays properly on GitHub  
✅ Vercel site loads without errors  
✅ Wallet connects to Mantle Sepolia  
✅ All transactions execute successfully  
✅ No private keys in public code  

---

## Troubleshooting

**Issue:** "PRIVATE_KEY not configured" error on Vercel
**Fix:** Add environment variable in Vercel Dashboard → Settings → Environment Variables

**Issue:** "Module not found" errors
**Fix:** Ensure Vercel root directory is set to `frontend`

**Issue:** Transactions fail with "Insufficient funds"
**Fix:** Get testnet MNT from https://faucet.sepolia.mantle.xyz

---

## Security Notes

⚠️ **Never commit `.env` or `.env.local` files**  
⚠️ **Use a dedicated testnet wallet for the oracle signer**  
⚠️ **Rotate private keys if accidentally exposed**  

---

*Deployment complete! Share your Vercel URL with the hackathon judges.* 🎉
