# 🚀 Deploy Captain Whiskers to Vercel

## Quick Deploy (2 minutes)

### Step 1: Go to Vercel Dashboard
Open: **https://vercel.com/new**

### Step 2: Import from GitHub
1. Sign in with GitHub if not already
2. Click "Import Git Repository"
3. Select: `pbathuri/LABLAB-Hackathon` (or your repo name)

### Step 3: Configure Project
Set these options:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_ARC_RPC_URL` | `https://testnet-rpc.arc.dev` |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | `5042002` |
| `NEXT_PUBLIC_ARCSCAN_URL` | `https://testnet.arcscan.io` |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` (or leave empty for now) |

### Step 5: Deploy!
Click **"Deploy"** button 🎉

---

## Your Deployed URLs

After deployment, you'll get:
- **Production URL**: `https://captain-whiskers-xxx.vercel.app`
- **Preview URLs**: For each commit

---

## Alternative: Vercel CLI Deploy

If you prefer command line:

```bash
# 1. Login to Vercel
vercel login

# 2. Navigate to frontend
cd apps/frontend

# 3. Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name? captain-whiskers
# - Directory? ./
# - Overwrite settings? N

# 4. For production
vercel --prod
```

---

## After Deployment

1. **Copy your Vercel URL** (e.g., `https://captain-whiskers.vercel.app`)
2. **Add to your hackathon submission**
3. **Test the live site**
4. **Record your demo video**

---

## Hackathon Submission Checklist

✅ Frontend deployed on Vercel
✅ Landing page working
✅ Dashboard accessible
✅ Captain Whiskers mascot animated
✅ Mobile responsive design
✅ Arc testnet integration ready

---

## Quick Links

- **GitHub Repo**: https://github.com/pbathuri/LABLAB-Hackathon
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Arc Testnet Explorer**: https://testnet.arcscan.io

Good luck! 🐱‍🚀
