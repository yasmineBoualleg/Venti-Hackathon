Venti MVP backend

This is a minimal Django + DRF backend for the Venti app (student clubs + study platform).

Quick start:

1. Create and activate a virtualenv (optional but recommended).
2. Install requirements:

pip install -r requirements.txt

3. Run migrations:

python manage.py migrate

4. Create a superuser (optional):

python manage.py createsuperuser

5. Run the dev server:

python manage.py runserver

API endpoints:
- /api/users/
- /api/clubs/
- /api/posts/
- /api/messages/
- /api/events/
- /api/auth/token/ (obtain token)
- /api/auth/register/ (register new user)
btw .env example :
"SECRET_KEY=''",
"DEBUG=True",
"GOOGLE_CLIENT_ID=''",
"GOOGLE_CLIENT_SECRET=''"
# ---
# Recent Edits and Their Use (as of 2025-09-26)

# 1. Club Approval Workflow (api/views.py, api/models.py, api/serializers.py)
# - Added fields to Club model: is_active, rejected_reason, rejection_date, approved_date
#   Use: Enables admin approval/rejection of clubs, tracks status and reasons.
# - Added ClubViewSet actions: approve, reject, pending
#   Use: Admins can approve/reject clubs and see pending clubs via API endpoints.
# - Sends email notifications on approval/rejection (console backend)
#   Use: Notifies club creators of status changes.

# 2. Email Backend Settings (venti_2nd/settings.py)
# - EMAIL_BACKEND set to console, DEFAULT_FROM_EMAIL set
#   Use: All notification emails print to console for development/testing.

# 3. Serializers (api/serializers.py)
# - ClubSerializer: Added status and members_count fields
#   Use: API returns club status (active/pending) and member count for frontend display.

# 4. Migration Files (api/migrations/0002_*.py)
# - Added migration for new Club fields (rejected_reason, rejection_date, approved_date)
#   Use: Updates database schema to match new model fields.

# 5. Database Reset Steps (for migration errors)
# If you see errors like 'no such column: api_club.rejected_reason', do the following:
#   1. Delete the database: rm db.sqlite3
#   2. Delete all migration files in api/migrations/ except __init__.py
#   3. Recreate migrations: python3 manage.py makemigrations
#   4. Migrate: python3 manage.py migrate
#   5. (Re)create a superuser: python3 manage.py createsuperuser
# This will reset your dev database and fix schema mismatches.

# ---

