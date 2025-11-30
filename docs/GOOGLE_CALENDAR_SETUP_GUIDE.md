# Google Calendar OAuth2 Setup Guide

## Problem Diagnosis

**Error:** "Access blocked: home assistant's request is invalid"

**Root Cause:** OAuth consent screen is not properly configured in Google Cloud Console.

---

## 🔧 STEP-BY-STEP FIX

### **Step 1: Configure OAuth Consent Screen**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: **eloquent-region-465009-r3**
3. Navigate to: **APIs & Services > OAuth consent screen**

#### Configure the following:

**A. User Type:**
- Select **External** (or Internal if you have a Google Workspace)
- Click **Create**

**B. App Information:**
- **App name:** `AI Stack Calendar` (or any name you prefer)
- **User support email:** Your email address
- **Developer contact email:** Your email address
- Click **Save and Continue**

**C. Scopes:**
- Click **Add or Remove Scopes**
- Search for and add: `https://www.googleapis.com/auth/calendar`
- Click **Update** then **Save and Continue**

**D. Test Users (IMPORTANT!):**
- Click **Add Users**
- Add your Google account email address (the one you'll authorize with)
- Click **Save and Continue**

**E. Summary:**
- Review and click **Back to Dashboard**

---

### **Step 2: Verify OAuth Client Configuration**

1. Navigate to: **APIs & Services > Credentials**
2. Find your OAuth 2.0 Client ID
3. Click the edit icon (pencil)

#### Verify:
- **Application type:** Desktop app
- **Authorized redirect URIs:** Should include:
  - `http://localhost`
  - `http://localhost:8080`
  - `http://127.0.0.1`

If these are missing, add them and click **Save**.

---

### **Step 3: Enable Google Calendar API**

1. Navigate to: **APIs & Services > Library**
2. Search for **Google Calendar API**
3. Click on it and click **Enable** (if not already enabled)

---

### **Step 4: Download New Credentials (if needed)**

If you made changes:
1. Go back to **APIs & Services > Credentials**
2. Click the download icon next to your OAuth 2.0 Client ID
3. Replace the existing `google_credentials.json` file

---

## 🚀 AFTER CONFIGURATION

Once you've completed the above steps, we'll use a different authentication method:

### **Option A: Manual Browser Flow (Recommended)**

We'll use a local server that catches the OAuth redirect automatically.

### **Option B: Alternative - Use API Key Flow**

If OAuth continues to have issues, we can switch to service account authentication.

---

## ⚠️ IMPORTANT NOTES

1. **Publishing Status:** Keep your app in "Testing" mode - no need to publish
2. **Test Users:** Make sure your Google account is added as a test user
3. **Verification:** Google doesn't require app verification for testing mode
4. **Rate Limits:** Testing mode has the same API quotas as production

---

## 🔍 TROUBLESHOOTING

### "Access blocked" error:
- ✅ Check: OAuth consent screen is configured
- ✅ Check: Your email is added as a test user
- ✅ Check: Google Calendar API is enabled
- ✅ Check: Scopes include calendar access

### "redirect_uri_mismatch" error:
- ✅ Check: Authorized redirect URIs include `http://localhost`
- ✅ Check: Client type is "Desktop app"

### "invalid_client" error:
- ✅ Check: You're using the correct credentials file
- ✅ Check: Project ID matches

---

## 📞 NEED HELP?

If you're still having issues after following this guide, check:
1. Google Cloud Console > IAM & Admin > Quotas (make sure APIs are enabled)
2. Billing (some APIs require billing enabled, but Calendar API is free)
3. Organization policies (if using Google Workspace)

---

**Last Updated:** 2025-11-27
