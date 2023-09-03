------------------------------------------------------------------------------------------------------------------------
-- The "profiles" table is used to store all additional profile information which we need to store for each user.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "profiles" (
  "id" UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  "tier" VARCHAR(255) DEFAULT 'free',
  "stripeCustomerId" VARCHAR(255) DEFAULT NULL,
  "accountGithub" JSONB DEFAULT NULL,
  "createdAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "updatedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
   PRIMARY KEY (id)
);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can not directly edit, delete or select their profiles.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------------------------------------------------------------------
-- The "profiles_update_updated_at" function and trigger is used to automatically update the "updatedAt" field on each
-- operation.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION profiles_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER profiles_update_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE PROCEDURE profiles_update_updated_at();

------------------------------------------------------------------------------------------------------------------------
-- The "profiles_create_on_signup" function and trigger is used to automatically create a profile for each user in the
-- "profiles" table when they sign up.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_create_on_signup()
RETURNS trigger
LANGUAGE 'plpgsql'
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_create_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE profiles_create_on_signup();
