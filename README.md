# GooseRiverTechnologies

# Frontend - To run:
1. cd client
2. npm start
3. go to http://localhost:3000 in your browser


To run the new backend code ->
1. git pull origin backend - in the backend branch
2. Resolve all the conflict issues by accepting incoming changes
3. Make a .env file with these credentials to be able to use DB. This should be in the same spot as the app.js backend endpoint file.
   PGHOST=notified-datahub-server.postgres.database.azure.com
   PGUSER=notified_db_admin
   PGPASSWORD=Duckcreek2025
   PGDATABASE=notified_db
   PGPORT=5432
4. Split the terminal to have two instances
5. First - terminal do | node app.js | to run backend locally and connect to DB.
6. Second - on the other terminal just run the frontend like normal from up top
