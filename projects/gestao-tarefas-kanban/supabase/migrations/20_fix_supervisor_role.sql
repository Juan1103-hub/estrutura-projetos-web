-- Corrige a role da Maria Santos para supervisor (estava almoxarife por erro
-- de criação inicial sem user_metadata).
UPDATE public.users
SET role = 'supervisor'
WHERE email = 'supervisor@vortice.com';
