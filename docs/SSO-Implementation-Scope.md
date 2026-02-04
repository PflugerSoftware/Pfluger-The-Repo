# Azure SSO Implementation Scope
**Project:** Repository Platform (EZRA)
**Client:** Pfluger Architects
**Purpose:** Azure SSO configuration requirements
**Date:** February 4, 2026

---
## Executive Summary

The Repository platform currently uses **temporary development credentials** for internal team authentication during the beta testing phase (11 authorized users with application-level access control). This document outlines the production migration to **Azure Single Sign-On (SSO)** using **Microsoft Entra ID** (formerly Azure Active Directory), allowing Pfluger team members to log in with their existing `@pflugerarchitects.com` Microsoft 365 accounts.

**Goal:** Enable seamless login for Pfluger employees using their existing `@pflugerarchitects.com` Microsoft 365 credentials.

---

## Scope of Work

### GCS Scope

**Azure AD Configuration** - We need Azure AD configured to enable Single Sign-On for our React application hosted on Cloudflare Pages.

**Requirements:**

The application requires Azure AD authentication that supports:
- Single-page application (SPA) authentication flow
- Redirect URIs for both production (`https://repository.pflugerarchitects.com/auth/callback`) and development (`http://localhost:5173/auth/callback`) environments
- Microsoft Graph API permissions: `User.Read`, `email`, `openid`, and `profile` scopes
- Token-based authentication returning user email and display name
- Support for 11 existing `@pflugerarchitects.com` email accounts

**What We Need From You:**

To integrate Azure SSO into our application, we need:
- Application (Client) ID
- Directory (Tenant) ID
- Client Secret
- Authority URL
- Documentation of any conditional access policies, MFA requirements, or security restrictions that might affect the login flow
- Support troubleshooting Azure AD authentication errors during testing

### Pfluger Scope

**Application Development & Integration** - Pfluger development team will handle all application code changes, testing, and deployment.

**Our Responsibilities:**
- Integrate Microsoft Authentication Library (MSAL) into the React application
- Refactor authentication code to consume Azure AD tokens
- Update login UI and session management
- Configure production environment with provided Azure credentials
- Test authentication flow with all 11 users
- Deploy to production and monitor for issues
- Train end users on the new login experience

---

## Current State

### Authentication Architecture

**Frontend:** React 18 + TypeScript
**Hosting:** Cloudflare Pages (HTTPS enforced)
**Database:** Supabase (PostgreSQL with encrypted connections)
**Current Auth Method:** Temporary development credentials with session token management

**Security Measures in Place:**
- All API keys stored in environment variables (Supabase, Anthropic Claude API, Mapbox)
- Database credentials secured via environment variables (never committed to Git)
- HTTPS-only connections enforced in production
- Session tokens used (credentials not stored in browser after authentication)
- Role-based access control (admin vs researcher permissions)
- Protected routes require valid authentication session

### How It Works Now

1. **Login UI** - Email/password form (`/login` route)
2. **Credential Validation** - Application-level authentication check against authorized user list (11 users)
3. **Session Management** - Secure session tokens stored in localStorage with expiration
4. **User Lookup** - Email matched to Supabase `users` table (UUID stored for data relationships)
5. **Role System** - Three tiers: Admin, Researcher, Viewer
6. **API Security** - All sensitive API keys (Supabase, Claude AI, Mapbox) secured in environment variables

### Current Users (11 Total)

All users are pre-authorized in the application with the following structure:
```javascript
{
  username: 'email@pflugerarchitects.com',
  password: '[hashed credential]',  // Temporary development password
  name: 'Full Name',
  role: 'admin' | 'researcher'
}
```

**Authorization Levels:**
- **1 Admin** - `software@pflugerarchitects.com` (full system access, sees all research pitches)
- **10 Researchers** - Individual team members (access own pitches and public research data)
- **Public Viewer** - No login required (read-only access to published research only)

**After Azure SSO Migration:**
All users will authenticate via their existing `@pflugerarchitects.com` Microsoft 365 accounts. User roles will continue to be managed in the Supabase `users` database table.

## Desired State

### Azure SSO with Microsoft Entra ID

**Authentication Flow:**
1. User clicks "Team Sign In" button
2. Redirected to Microsoft login page (Azure AD tenant)
3. User logs in with `@pflugerarchitects.com` Microsoft 365 credentials
4. Azure AD returns authentication token
5. App validates token, extracts user email/name
6. App looks up user in Supabase `users` table by email
7. Session established, user granted access based on role

---

## Success Criteria

### Must-Have (MVP)
- [ ] All 11 existing users can log in with Microsoft 365 credentials
- [ ] User roles (admin/researcher) correctly assigned from database
- [ ] Protected routes only accessible after login
- [ ] Session persists on page refresh
- [ ] Logout clears session completely
- [ ] Unauthorized users (not in `users` table) see error message

---

## Testing Checklist

### Functional Testing
- [ ] Admin user can log in
- [ ] Researcher user can log in
- [ ] Unauthorized user (valid Azure AD, not in database) gets error
- [ ] Disabled Azure AD account cannot log in
- [ ] Session persists after page refresh
- [ ] Logout clears session
- [ ] Token refresh works automatically
- [ ] Protected routes redirect to login when not authenticated
- [ ] Roles correctly applied (admin sees all pitches, researcher sees own)

### Cross-Browser Testing
- [ ] Chrome (desktop)
- [ ] Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (macOS/iOS)

### Security Testing
- [ ] Client Secret not exposed in frontend code
- [ ] Tokens not visible in console/network tab
- [ ] HTTPS enforced in production
- [ ] XSS protection (no user input in auth flow)
- [ ] CSRF protection (MSAL handles via PKCE)

---

## Information We Need From You

Before you provide your estimate, please let us know:

1. **Azure AD Access**
   - Do you have the necessary permissions to configure App Registrations in Pfluger's Azure AD tenant?
   - Are there existing SSO applications we should be aware of for consistency?

2. **Security Policies**
   - Are there conditional access policies that might affect the authentication flow?
   - Is MFA enabled for all `@pflugerarchitects.com` accounts?
   - Are there IP restrictions or geographic limitations on Azure AD logins?

3. **User Management**
   - Since Pfluger development team doesn't have access to Azure AD, who will handle user provisioning/deprovisioning?
   - How should new employees be onboarded to the application?
   - Should we consider syncing user roles from Azure AD groups in the future?

4. **Environments**
   - Can we use a single Azure AD app registration with multiple redirect URIs (dev + production)?
   - Or do we need separate app registrations for each environment?

5. **Timeline & Constraints**
   - Are there any security review or compliance approval processes we should factor in?
   - What is your estimated timeline for configuration and testing?

---