-- Add selected_model to profiles table
ALTER TABLE public.profiles
ADD COLUMN selected_model text;
