# Database instructions

- Start with <code>docker compose up -d</code>
- To access MySQL use <code>docker exec -it cosc203mysql mysql -u root -p --default-character-set=utf8mb4</code> in your command prompt. I used Windows PowerShell.
- To setup and populate the database use the sql files found in [sql/](sql/).

# Running Web Server

- Use <code>npm install</code> then <code>npm run start</code>

# Notice

If you host this online change the MySQL password to something more secure then 'password'.