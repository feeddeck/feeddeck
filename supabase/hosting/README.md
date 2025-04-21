# Hosting

- [FeedDeck Documentation](https://github.com/feeddeck/feeddeck/blob/main/CONTRIBUTING.md#hosting)
- [Supabase Documentation](https://supabase.com/docs/guides/self-hosting/docker)

```sh
git clone git@github.com:feeddeck/feeddeck.git
cd feeddeck/supabase/hosting

cp -a ../functions/. volumes/functions/
cp .env.example .env

docker compose -f docker-compose.yaml up --build --force-recreate
```

```sh
supabase db push --db-url postgresql://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:5432/postgres
```

- [FeedDeck](http://localhost:8080/)
- [Supabase Studio](http://localhost:8000/)
