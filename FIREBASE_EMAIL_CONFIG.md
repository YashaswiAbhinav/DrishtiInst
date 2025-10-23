# Firebase Email Action Configuration

## To prevent emails from going to spam, follow these steps:

### 1. Configure Custom Email Action Handler in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/drishtimukesh-fd807)
2. Navigate to **Authentication** → **Templates**
3. Click on **Email address verification** template
4. Click **Edit template**
5. In the **Action URL** field, enter: `https://drishtinstitute.com/email-action`
6. Save the template

### 2. Configure Password Reset Template

1. In the same **Templates** section
2. Click on **Password reset** template  
3. Click **Edit template**
4. In the **Action URL** field, enter: `https://drishtinstitute.com/email-action`
5. Save the template

### 3. Optional: Customize Email Templates

You can also customize the email content to make it more professional:

**Email Verification Template:**
```
Subject: Verify your email for Drishti Institute

Hi %DISPLAY_NAME%,

Welcome to Drishti Institute! Please verify your email address to complete your registration.

Click the button below to verify your email:
%LINK%

If you didn't create an account with Drishti Institute, you can safely ignore this email.

Best regards,
Drishti Institute Team
```

**Password Reset Template:**
```
Subject: Reset your Drishti Institute password

Hi %DISPLAY_NAME%,

We received a request to reset your password for your Drishti Institute account.

Click the button below to reset your password:
%LINK%

If you didn't request a password reset, you can safely ignore this email.

Best regards,
Drishti Institute Team
```

### 4. Benefits of Custom Action URLs

- **Prevents Spam**: Custom domain emails are less likely to be marked as spam
- **Professional Appearance**: Users see your domain instead of Firebase's
- **Better User Experience**: Seamless integration with your app
- **Trust Building**: Users trust emails from your domain more than generic ones
- **Custom UI**: You control the verification/reset experience

### 5. How It Works

1. User registers/requests password reset
2. Firebase sends email with your custom action URL
3. User clicks link in email
4. Your custom EmailActionHandler component processes the action
5. User sees your branded verification/reset page
6. Action is completed and user is redirected to dashboard

The custom action URL includes parameters like:
- `mode`: "verifyEmail" or "resetPassword"  
- `oobCode`: The verification/reset code
- `apiKey`: Your Firebase API key

Your EmailActionHandler component automatically processes these parameters and provides a smooth user experience.