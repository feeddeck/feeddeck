# Hosting

The following guide can be used to self-host FeedDeck. The set up uses a Docker
Compose file to run all FeedDeck and Supabase components. More information can
be found in the FeedDeck contributing guide and the Supabase documentation.

- [FeedDeck Contributing](https://github.com/feeddeck/feeddeck/blob/main/CONTRIBUTING.md#hosting)
- [Supabase Documentation](https://supabase.com/docs/guides/self-hosting/docker)

1. Clone the repository and switch into the `feeddeck/supabase/hosting`
   directory:

   ```sh
   git clone git@github.com:feeddeck/feeddeck.git
   cd feeddeck/supabase/hosting
   ```

2. Copy all edge functions into the correct directory:

   ```sh
   cp -r ../functions/. volumes/functions/
   ```

3. Create a `.env` file and adjust the environment variables as needed:

   ```sh
   cp .env.example .env
   ```

4. Start FeedDeck and Supabase via Docker Compose:

   ```sh
   docker compose -f docker-compose.yaml up -d --build --force-recreate
   ```

5. Check that all containers are running:

   ```sh
   docker compose ps
   ```

6. Switch into the root directory of the repository and apply all database
   migrations:

   ```sh
   cd ../..
   supabase db push --db-url postgresql://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:5432/postgres
   ```

7. Afterwards FeedDeck is available at
   [http://localhost:8080](http://localhost:8080) and the Supabase Studio at
   [http://localhost:8000](http://localhost:8000).

8. **Clean up:** To stop all Docker containers and remove all volumes, use the
   following commands:

   ```sh
   docker compose down -v
   rm -rf volumes/db/data/
   rm -rf volumes/storage/
   rm -rf volumes/functions/
   ```
