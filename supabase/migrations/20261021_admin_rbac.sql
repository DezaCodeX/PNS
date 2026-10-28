-- Admin authentication and RBAC have been removed from this project.
-- If you want to fully clean the connected Supabase database, run the following
-- statements against the target database.

DROP TRIGGER IF EXISTS managed_images_updated_at ON public.managed_images;
DROP TRIGGER IF EXISTS admin_groups_updated_at ON public.admin_groups;
DROP TRIGGER IF EXISTS admin_users_updated_at ON public.admin_users;

DROP FUNCTION IF EXISTS public.admin_touch_updated_at();

DROP TABLE IF EXISTS public.managed_images CASCADE;
DROP TABLE IF EXISTS public.admin_audit_events CASCADE;
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_user_permissions CASCADE;
DROP TABLE IF EXISTS public.admin_user_groups CASCADE;
DROP TABLE IF EXISTS public.admin_group_permissions CASCADE;
DROP TABLE IF EXISTS public.admin_permissions CASCADE;
DROP TABLE IF EXISTS public.admin_groups CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;

DROP TYPE IF EXISTS public.permission_effect CASCADE;
DROP TYPE IF EXISTS public.admin_user_status CASCADE;
