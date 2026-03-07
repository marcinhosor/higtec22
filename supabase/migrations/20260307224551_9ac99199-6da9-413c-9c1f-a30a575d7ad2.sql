
-- Add SaaS subscription columns to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_users integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_clients integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS max_quotes_per_month integer NOT NULL DEFAULT 5;

-- Set defaults per existing plan_tier
UPDATE public.companies SET
  max_users = CASE plan_tier
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 5
    WHEN 'premium' THEN 15
    ELSE 1
  END,
  max_clients = CASE plan_tier
    WHEN 'free' THEN 20
    WHEN 'pro' THEN 100
    WHEN 'premium' THEN 9999
    ELSE 20
  END,
  max_quotes_per_month = CASE plan_tier
    WHEN 'free' THEN 5
    WHEN 'pro' THEN 50
    WHEN 'premium' THEN 9999
    ELSE 5
  END;

-- Create a function to get company usage stats
CREATE OR REPLACE FUNCTION public.get_company_usage(_company_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_count integer;
  quotes_this_month integer;
  user_count integer;
  result json;
BEGIN
  SELECT count(*) INTO client_count FROM public.clients WHERE company_id = _company_id;

  SELECT count(*) INTO quotes_this_month FROM public.quotes
  WHERE company_id = _company_id
    AND created_at >= date_trunc('month', now());

  SELECT count(*) INTO user_count FROM public.company_memberships WHERE company_id = _company_id;

  result := json_build_object(
    'client_count', client_count,
    'quotes_this_month', quotes_this_month,
    'user_count', user_count
  );

  RETURN result;
END;
$$;

-- Create function to get all companies stats for admin
CREATE OR REPLACE FUNCTION public.get_all_companies_stats()
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_master_admin(auth.uid()) THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result FROM (
    SELECT
      c.id,
      c.name,
      c.plan_tier,
      c.subscription_status,
      c.subscription_expires_at,
      c.trial_ends_at,
      c.max_users,
      c.max_clients,
      c.max_quotes_per_month,
      c.created_at,
      c.city,
      c.state,
      (SELECT count(*) FROM public.clients cl WHERE cl.company_id = c.id) as client_count,
      (SELECT count(*) FROM public.company_memberships cm WHERE cm.company_id = c.id) as user_count,
      (SELECT count(*) FROM public.quotes q WHERE q.company_id = c.id) as total_quotes,
      (SELECT count(*) FROM public.appointments a WHERE a.company_id = c.id) as total_appointments,
      (SELECT count(*) FROM public.service_executions se WHERE se.company_id = c.id) as total_executions
    FROM public.companies c
    ORDER BY c.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
