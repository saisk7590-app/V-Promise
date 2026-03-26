# V-Promise Internal Staff Login

Minimal Express + PostgreSQL API and Expo React Native app to demo role-based login/navigation for internal staff.

## Prerequisites
- Node.js (LTS) and npm/yarn
- PostgreSQL with existing `car_marketplace_db`, `roles`, `users` tables
- Ngrok (for tunneling backend to mobile)
- Expo CLI (`npm i -g expo-cli`) or `npx expo`

## Backend (v-promise-api)
1. Install deps:
   ```bash
   cd v-promise-api
   npm install
   ```
2. Create `.env` in `v-promise-api`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_NAME=car_marketplace_db
   ```
3. Start server:
   ```bash
   npm run dev
   ```
   Health check: `http://localhost:5000/health`

### Insert a test user
Generate a bcrypt hash (example command):
```bash
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('password123',10).then(console.log)"
```
Then insert:
```sql
INSERT INTO users (name, email, password, role_id)
VALUES ('Test Admin', 'admin@example.com', '<PASTE_HASH>', 1);
```
Repeat with role_id 2/3/4 to test other roles.

### Ngrok (to expose backend to phone)
```bash
ngrok http 5000
```
Copy the HTTPS forwarding URL; you will place it in the frontend `api.js`.

## Frontend (v-promise-app)
1. Install deps (inside `v-promise-app`):
   ```bash
   npm install
   ```
2. Update backend URL: edit `src/services/api.js` and replace `http://YOUR_NGROK_URL` with your ngrok URL (include protocol, no trailing slash).
3. Start Expo:
   ```bash
   npm start
   ```
   Open with Expo Go on your phone (same ngrok URL bypasses different Wi-Fi).

## Testing the flow
1. Ensure backend is running and reachable via ngrok.
2. Create at least one user per role with bcrypt-hashed passwords.
3. In Expo app, log in with the test user.
4. Successful login routes you to the screen matching the user role:
   - Admin ? AdminScreen
   - Intake Executive ? IntakeScreen
   - Vehicle Inspector ? InspectorScreen
   - Salesperson ? SalesScreen

## Project Structure
```
v-promise
+-- v-promise-api
¦   +-- src
¦   ¦   +-- config/db.js
¦   ¦   +-- controllers/authController.js
¦   ¦   +-- routes/authRoutes.js
¦   ¦   +-- server.js
¦   +-- package.json
+-- v-promise-app
¦   +-- src
¦   ¦   +-- screens
¦   ¦   ¦   +-- LoginScreen.js
¦   ¦   ¦   +-- AdminScreen.js
¦   ¦   ¦   +-- IntakeScreen.js
¦   ¦   ¦   +-- InspectorScreen.js
¦   ¦   ¦   +-- SalesScreen.js
¦   ¦   ¦   +-- _BaseScreen.js
¦   ¦   +-- navigation/AppNavigator.js
¦   ¦   +-- services/api.js
¦   +-- App.js
+-- README.md
```

## Notes
- Backend returns `{ success: true, role: "<role_name>" }` on valid credentials, otherwise `{ success: false, message: "Invalid credentials" }`.
- Navigation uses role strings to route; ensure DB role names match exactly the seeded values.
# V-Promise

