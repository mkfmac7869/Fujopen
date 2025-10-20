# Firebase Hosting Deployment Guide

This guide will help you deploy your Fujairah Open Championship portal to Firebase Hosting.

## Prerequisites

✅ Firebase CLI is already installed globally on your system.

## Step 1: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with your Google account.

## Step 2: Initialize Firebase Project (First Time Only)

If you haven't created a Firebase project yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Copy your project ID

Then update `.firebaserc` file with your project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

OR run the interactive initialization:

```bash
firebase init hosting
```

Select:
- Use an existing project (choose your project)
- Public directory: `out`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`
- Don't overwrite existing files

## Step 3: Build Your Project

```bash
npm run build
```

This will create an `out` folder with your static site.

## Step 4: Deploy to Firebase

```bash
firebase deploy --only hosting
```

OR use the combined script:

```bash
npm run deploy
```

This will build and deploy in one command.

## Step 5: Access Your Site

After deployment, Firebase will provide you with:
- **Hosting URL**: `https://your-project-id.web.app`
- **Custom Domain** (optional): Configure in Firebase Console

## Important Notes

- ✅ Your site is configured for **static export** (SSG)
- ✅ All 6 languages are supported
- ✅ All routes are pre-rendered
- ✅ Firebase Hosting serves from the `out` folder
- ⚠️ Dynamic API routes won't work in static export (use Firebase Functions if needed)

## Troubleshooting

### If build fails:
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### If deployment fails:
```bash
# Check Firebase login
firebase login --reauth

# Check project
firebase projects:list
```

## Continuous Deployment

To set up automatic deployments from GitHub:

1. Install GitHub Actions in your repository
2. Add Firebase service account key to GitHub Secrets
3. Create `.github/workflows/firebase-hosting.yml`

Firebase will provide this file when you run:
```bash
firebase init hosting:github
```

## Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify and connect your domain
4. Firebase will automatically provision SSL certificate

---

**Your site is now ready for Firebase Hosting! 🚀**

