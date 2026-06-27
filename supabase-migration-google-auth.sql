-- =============================================
-- MIGRATION — Connexion / inscription Google
-- À exécuter UNE FOIS dans Supabase → SQL Editor
-- =============================================
-- Met à jour le trigger de création de profil pour qu'il gère les comptes
-- Google (given_name / family_name / name / picture) en plus de l'email/mdp.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'given_name',
      split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ' ', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'family_name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- (Le trigger on_auth_user_created existe déjà, pas besoin de le recréer.)

-- Optionnel : compléter les profils Google déjà créés avant cette migration
-- (noms/avatars vides). Décommentez puis exécutez si nécessaire :
--
-- update public.profiles p
-- set
--   first_name = coalesce(p.first_name, u.raw_user_meta_data->>'given_name', split_part(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ' ', 1)),
--   last_name  = coalesce(p.last_name,  u.raw_user_meta_data->>'family_name'),
--   avatar_url = coalesce(p.avatar_url, u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
-- from auth.users u
-- where u.id = p.id
--   and (p.first_name is null or p.avatar_url is null);
