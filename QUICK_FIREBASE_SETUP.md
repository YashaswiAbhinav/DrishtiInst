# Quick Firebase Setup for Phone OTP

## Step 1: Enable Phone Authentication
1. Go to: https://console.firebase.google.com/project/drishtimukesh-fd807/authentication/providers
2. Click on **Phone** provider
3. Click **Enable** toggle
4. Click **Save**

## Step 2: Add Test Phone Numbers (for development)
1. In the same Phone provider settings
2. Scroll down to **Phone numbers for testing**
3. Add test numbers:
   - Phone: `+91 9999999999` → Code: `123456`
   - Phone: `+1 5555555555` → Code: `654321`
4. Click **Save**

## Step 3: Add Authorized Domains
1. Go to: https://console.firebase.google.com/project/drishtimukesh-fd807/authentication/settings
2. Scroll to **Authorized domains**
3. Add: `localhost` (if not already present)
4. Add your production domain when ready

## Step 4: Test Phone OTP
1. Use test phone numbers: `+91 9999999999`
2. Enter test OTP: `123456`
3. For real phone numbers, actual SMS will be sent

## Current Implementation Status
✅ Phone OTP sending
✅ OTP verification
✅ Error handling with recaptcha reset
✅ Email verification on registration
✅ Login retry logic for dashboard redirect

## Test Flow
1. Register with phone number: `+91 9999999999`
2. Enter OTP: `123456`
3. User should be logged in and redirected to dashboard