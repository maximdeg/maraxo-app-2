# Backend Test Errors - Resolution Guide

## Summary of Issues from Test Report

Based on the TestSprite backend test report, here are the main issues and their solutions:

---

## 🔴 Critical Issues Requiring Immediate Action

### 1. Database Not Seeded
**Error:** "No visit types found in seed data", "Consult type ID not found"

**Solution:**
```bash
npm run setup-db
```

This will:
- Run database migrations (create push_subscriptions table)
- Seed visit types, consult types, and practice types
- Verify database state

**Files Created:**
- `scripts/setup-database.js` - Comprehensive setup script

---

### 2. Database Migrations Not Run
**Error:** "Database table push_subscriptions does not exist"

**Solution:**
The `setup-db` script now handles this automatically. It runs:
- `database/create_push_subscriptions_table.sql`

**Manual Alternative:**
```bash
# Connect to your database and run:
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DATABASE -f database/create_push_subscriptions_table.sql
```

---

### 3. Protected Route Access Issues
**Error:** "Access to protected route failed with status 404"

**Root Cause:** 
- Test may be accessing non-existent endpoint
- Or middleware not properly handling cookie-based auth for API routes

**Solution Applied:**
- Updated middleware to check both Authorization header AND cookies for `/api/admin` routes
- This allows tests to use either authentication method

**Files Modified:**
- `middleware.ts` - Now checks cookies in addition to Authorization header

---

## 🟡 Medium Priority Issues

### 4. Work Schedule API - Missing Required Field
**Error:** "Expected 201 Created, got 400"

**Root Cause:** Test not sending required `day_of_week` field

**Solution:**
- API validation is working correctly
- Tests need to include `day_of_week` field (0-6 or day name like "Monday")
- API provides clear error messages

**No Code Changes Needed** - This is a test data issue

---

### 5. Unavailable Days API - Internal Server Error
**Error:** "Failed to create unavailable day: Internal server error"

**Possible Causes:**
- Database table doesn't exist
- Database connection issue
- Invalid date format

**Solution Applied:**
- Improved error handling to show actual error details
- API now returns error details in response

**Files Modified:**
- `app/api/unavailable-days/route.ts` - Enhanced error messages

**Verification:**
- Ensure `unavailable_days` table exists (should be in schema)
- Check database connection

---

## ✅ Issues Already Fixed

### 6. API Response Format Issues
**Status:** ✅ Fixed

- Visit types API now returns array (was object)
- Consult types API now returns array (was object)  
- Patient creation returns fields at root level AND nested

**Files Modified:**
- `app/api/visit-types/route.ts`
- `app/api/consult-types/route.ts`
- `app/api/patients/route.ts`

---

### 7. API Field Name Inconsistency
**Status:** ✅ Fixed

- Patient API now accepts both camelCase and snake_case
- Clear error messages showing both formats

**Files Modified:**
- `app/api/patients/route.ts`

---

### 8. Error Messages
**Status:** ✅ Fixed

- Push notifications API provides detailed validation errors
- Unavailable days API shows error details
- All endpoints have improved error messages

**Files Modified:**
- `app/api/push/subscribe/route.ts`
- `app/api/unavailable-days/route.ts`

---

## 📋 Step-by-Step Resolution

### Step 1: Run Database Setup
```bash
npm run setup-db
```

This single command will:
1. ✅ Create missing tables (push_subscriptions)
2. ✅ Seed all reference data (visit types, consult types, practice types)
3. ✅ Verify database state

### Step 2: Verify Database State
After running setup-db, verify:
- Visit types table has 5+ records
- Consult types table has 6+ records  
- Practice types table has 4+ records
- Push subscriptions table exists

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Re-run Tests
After database is set up, re-run TestSprite backend tests. Expected improvements:
- ✅ Visit types tests should pass
- ✅ Consult types tests should pass
- ✅ Patient creation tests should pass
- ✅ Push notifications tests should pass (if table exists)
- ✅ Appointment scheduling tests should pass

---

## 🔍 Verification Checklist

Before re-running tests, verify:

- [ ] Database migrations run successfully
- [ ] Visit types seeded (check: `SELECT COUNT(*) FROM visit_types;`)
- [ ] Consult types seeded (check: `SELECT COUNT(*) FROM consult_types;`)
- [ ] Practice types seeded (check: `SELECT COUNT(*) FROM practice_types;`)
- [ ] Push subscriptions table exists
- [ ] Development server running on port 3000
- [ ] Environment variables configured (.env file)

---

## 📝 Test-Specific Fixes

### TC001 - Patient Appointment Scheduling
- **Issue:** No visit types found
- **Fix:** Run `npm run setup-db`
- **Expected:** Should pass after seeding

### TC002 - Available Times Management  
- **Issue:** Visit types response format
- **Fix:** ✅ Already fixed - API returns array
- **Expected:** Should pass after database seeding

### TC003 - Admin Authentication
- **Issue:** 404 on protected route
- **Fix:** ✅ Middleware updated to check cookies
- **Note:** Verify test is accessing correct endpoint

### TC004 - Patient Management CRUD
- **Issue:** Missing first_name in response
- **Fix:** ✅ Already fixed - fields at root level
- **Expected:** Should pass

### TC005 - Admin Panel Management
- **Issue:** Unauthenticated access not blocked
- **Fix:** ✅ Middleware updated
- **Note:** May need to verify test expectations

### TC006 - Appointment Cancellation
- **Issue:** No visit types found
- **Fix:** Run `npm run setup-db`
- **Expected:** Should pass after seeding

### TC007 - Appointment Confirmation
- **Issue:** Consult type ID not found
- **Fix:** Run `npm run setup-db`
- **Expected:** Should pass after seeding

### TC008 - Work Schedule Management
- **Issue:** Missing day_of_week field
- **Fix:** Test needs to include required field
- **Note:** API validation is correct

### TC009 - Unavailable Days Management
- **Issue:** Internal server error
- **Fix:** ✅ Error handling improved
- **Note:** May need database table verification

### TC010 - Push Notifications
- **Issue:** Table doesn't exist
- **Fix:** Run `npm run setup-db`
- **Expected:** Should pass after migration

---

## 🚀 Quick Start

**To fix all issues:**

```bash
# 1. Run database setup (migrations + seeding)
npm run setup-db

# 2. Verify it worked (should see success messages)
# 3. Restart dev server if needed
npm run dev

# 4. Re-run TestSprite tests
```

---

## 📊 Expected Test Results After Fixes

**Before:** 0/10 tests passed (0%)

**After Database Setup:** Expected 6-8/10 tests passed (60-80%)

**Remaining failures** (if any) will likely be:
- Test data format issues (work schedule day_of_week)
- Test endpoint path mismatches
- Test expectations that need adjustment

---

## 🔧 Additional Notes

1. **Database Seeding:** The seeding script uses `ON CONFLICT DO UPDATE` so it's safe to run multiple times
2. **Migrations:** Uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
3. **API Compatibility:** All fixes maintain backward compatibility
4. **Error Messages:** All endpoints now provide detailed, actionable error messages

---

## 📞 Need Help?

If tests still fail after running `npm run setup-db`:
1. Check database connection in `.env` file
2. Verify tables exist: `\dt` in psql
3. Check seed data: `SELECT * FROM visit_types;`
4. Review test logs for specific error messages

