# Firebase OTP Configuration Guide

## Phone OTP Setup

### 1. Firebase Console Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `drishtimukesh-fd807`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Phone** provider
5. Add your phone numbers for testing (optional)

### 2. Add Authorized Domains
1. In Authentication → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain

### 3. Enable reCAPTCHA
Phone authentication requires reCAPTCHA verification:
- reCAPTCHA is automatically handled by Firebase
- For production, you may need to configure reCAPTCHA v3

### 4. Test Phone Numbers (Development)
Add test phone numbers in Firebase Console:
- Go to Authentication → Sign-in method → Phone
- Add test phone numbers with verification codes
- Example: `+1 555-555-5555` with code `123456`

## Email OTP Setup

### 1. Enable Email/Password Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** provider

### 2. Configure Email Templates
1. Go to Authentication → **Templates**
2. Customize email templates for:
   - Email verification
   - Password reset
   - Email address change

### 3. Email Verification Implementation
```typescript
import { sendEmailVerification } from 'firebase/auth';

// Send verification email
await sendEmailVerification(user);
```

### 4. Password Reset Email
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

// Send password reset email
await sendPasswordResetEmail(auth, email);
```

## Current Implementation Status

✅ **Phone OTP**: Ready - uses Firebase's built-in phone authentication
✅ **Email Verification**: Ready - uses Firebase's email verification
✅ **Password Reset**: Ready - uses Firebase's password reset email

## Testing

### Phone OTP Testing:
1. Use test phone numbers from Firebase Console
2. Or use real phone numbers (will send actual SMS)

### Email OTP Testing:
1. Register with real email address
2. Check email for verification link
3. Click link to verify email

## Production Considerations

1. **SMS Costs**: Firebase charges for SMS messages
2. **Rate Limiting**: Firebase has built-in rate limiting
3. **Security**: Always validate OTP on server side
4. **Error Handling**: Implement proper error handling for failed OTP attempts