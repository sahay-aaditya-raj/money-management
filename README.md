# 💰 Money Software

<div align="center">



*A modern, intuitive expense tracking and financial management application*

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Powered by React](https://img.shields.io/badge/Powered%20by-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)



</div>

---

## 📸 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard Screenshot](./public/screenshot/dashboard.png)

### Add Records
![Expense Management Screenshot](./public/screenshot/newRecords.png)

### Summary
![Analytics Screenshot](./public/screenshot/summary.png)



### Print Preview
![Print Preview](./public/screenshot/printprevieww.png)

</div>

## ✨ Features

- 📊 **Interactive Dashboard** - Beautiful charts and visualizations powered by Recharts
- 💳 **Expense Tracking** - Add, edit, and categorize your expenses with ease
- 📈 **Financial Analytics** - Comprehensive reports and insights into your spending patterns
- 🗓️ **Date-based Filtering** - Track expenses by date ranges and time periods
- 💱 **Currency Support** - Native support for Indian Rupee (INR) formatting
- 📱 **Responsive Design** - Seamless experience across desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with shadcn/ui components
- 🔍 **Smart Search** - Quickly find expenses with advanced filtering options
- 📊 **Time Series Analysis** - Track spending trends over time
- 💾 **Automatic Saving** - Real-time data persistence with MongoDB

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Styling | Tools |
|----------|---------|----------|---------|-------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | ![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat&logo=biome&logoColor=white) |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![API Routes](https://img.shields.io/badge/API%20Routes-000000?style=flat&logo=nextdotjs&logoColor=white) | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white) | ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white) | ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white) |

</div>

## 🚀 Installation

### Prerequisites

- Node.js 18+ installed on your machine
- MongoDB database (local or cloud)
- Git for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahay-aaditya-raj/money-software.git
   cd money-software
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your MongoDB connection string:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action!

## 🔐 Authentication & Security

This app protects API routes with a constant server-side token and validates login using bcrypt-hashed credentials.

- Login uses fixed usernames and a shared password. In this repo, the defaults are:
  - Usernames: `user1`, `user2`, `user3`
  - Password: `12345678`
- On successful login, the server returns a constant token. The client stores it in `localStorage` and sends it via `Authorization: Bearer <token>` on API calls.
- Credentials and allowed users are defined in `lib/data.js`:
  - `USERS`: UI list (display and filters)
  - `HASHED_USERNAMES`: bcrypt hashes of allowed login usernames
  - `HASHED_PASSWORD`: bcrypt hash of the shared password

Important:
- Bcrypt hashes are salted; every generation produces a different string. That’s expected. The app uses `bcrypt.compare` for validation.
- UI users in `USERS` are separate from login permissions (`HASHED_USERNAMES`). To allow login for a user, add their username hash to `HASHED_USERNAMES`.

### Customize login users and password

1) Open `lib/data.js` and edit:
- `USERS` for UI display (e.g., rename or add values/labels)
- `HASHED_USERNAMES` to include bcrypt hashes for usernames allowed to login
- `HASHED_PASSWORD` to the bcrypt hash of your chosen password

2) Generate bcrypt hashes using the included scripts:

```powershell
# Generate username hash(es)
npm run hash:user -- <username>

# Generate password hash
npm run hash:pass -- <password>

# Generate both
npm run hash:both -- <username> <password>
```

Copy the resulting hashes into `lib/data.js`:

```js
export const HASHED_USERNAMES = [
  // existing hashes...
  "$2b$10$...yourNewUsernameHash..."
];

export const HASHED_PASSWORD = "$2b$10$...yourNewPasswordHash...";
```

3) Token location and rotation:
- The constant token is defined in `lib/auth.js` as `APP_TOKEN`.
- If you change `APP_TOKEN`, users must log in again to receive the new token.

### Use environment variables for secrets (recommended)

For production, move secrets out of source:

Add to `.env.local` (don’t commit this file):

```bash
APP_TOKEN=replace-with-a-strong-random-token
HASHED_PASSWORD=$2b$10$replace-with-your-password-hash
HASHED_USERNAMES_JSON=["$2b$10$hashForUser1","$2b$10$hashForUser2"]
```

Then, in code, read from `process.env` with fallbacks:

```js
// lib/data.js
export const HASHED_USERNAMES = (() => {
  try {
    if (process.env.HASHED_USERNAMES_JSON) {
      return JSON.parse(process.env.HASHED_USERNAMES_JSON);
    }
  } catch {}
  return [/* fallback hashes */];
})();

export const HASHED_PASSWORD = process.env.HASHED_PASSWORD || "<fallback>";

// lib/auth.js
export const APP_TOKEN = process.env.APP_TOKEN || "<fallback>";
```

Security notes:
- Don’t expose secrets to the client (avoid `NEXT_PUBLIC_*` for tokens/hashes).
- On logout, the app clears local caches (token and cached expenses) to prevent stale access.

## 📖 Usage

### Adding Expenses

1. Navigate to the "Add Expense" page
2. Fill in the expense details (amount, category, description, date)
3. Click "Save" to record your expense

### Viewing Reports

- **Summary View**: Get a quick overview of your spending
- **Time Series**: Analyze spending patterns over time
- **Category Breakdown**: See which categories consume most of your budget
- **Range Analysis**: Compare spending across different time periods

## 🔧 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Retrieve all expenses |
| `POST` | `/api/expenses` | Create a new expense |
| `GET` | `/api/summary` | Get expense summary |
| `GET` | `/api/reports/time-series` | Get time series data |
| `GET` | `/api/reports/range-breakdown` | Get range breakdown |
| `GET` | `/api/reports/available-years` | Get available years |

All requests to protected endpoints must include the token:

```http
Authorization: Bearer <token>
```

### Example API Usage

```javascript
// Adding a new expense
const response = await fetch('/api/expenses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token_v1') || ''}`
  },
  body: JSON.stringify({
    amount: 500,
    category: 'food',
    description: 'Lunch at restaurant',
    date: '2025-08-31'
  })
});
```

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the theme by modifying:

- `tailwind.config.js` - Main configuration
- `app/globals.css` - Global styles
- `components/ui/` - Individual component styles

### 🏷️ Managing Categories and Users

The application uses a centralized data management system for categories and users. All data is managed through the `lib/data.js` file.

#### Adding New Categories

To add new expense categories:

1. Open `lib/data.js`
2. Add your new category to the `CATEGORIES` array:
   ```javascript
   export const CATEGORIES = [
     { value: "basic", label: "Basic" },
     { value: "bills", label: "Bills" },
     { value: "food", label: "Food" },
     { value: "travel", label: "Travel" }, // ← Add new category here
     // ... other categories
   ];
   ```
3. Restart your development server
4. The new category will automatically appear in all dropdowns

#### Adding New Users

To add new users to the system (UI display):

1. Open `lib/data.js`
2. Add your new user to the `USERS` array:
   ```javascript
   export const USERS = [
     { value: "user1", label: "User 1" },
     { value: "user2", label: "User 2" },
     { value: "user3", label: "User 3" },
     { value: "newuser", label: "New User" }, // ← Add new user here
     // ... other users
   ];
   ```
3. To allow login for a new user, generate a bcrypt hash of the username and add it to `HASHED_USERNAMES`.
4. Restart your development server

#### Data Structure

Each category and user object has:
- `value`: Used for database storage and internal logic
- `label`: Displayed in the user interface

The system also provides utility functions:
- `getCategoryLabel(value)` - Get display label for a category
- `getUserLabel(value)` - Get display label for a user
- `isValidCategory(value)` - Check if a category is valid
- `isValidUser(value)` - Check if a user is valid

## 📊 Project Structure

```
money-software/
├── 📁 app/                  # Next.js app directory
│   ├── 📄 page.js           # Main dashboard
│   ├── 📄 layout.js         # Root layout
│   ├── 📁 add/              # Add expense page
│   ├── 📁 api/              # API routes
│   │   ├── 📁 expenses/     # Expense endpoints
│   │   ├── 📁 reports/      # Report endpoints
│   │   └── 📁 summary/      # Summary endpoints
│   └── 📁 summary/          # Summary page
├── 📁 components/           # Reusable components
│   └── 📁 ui/               # UI components
├── 📁 lib/                  # Utility functions
│   ├── 📄 data.js           # ⭐ Centralized categories and users configuration
│   ├── 📄 auth.js           # Auth helpers (token, validation)
│   ├── 📄 db.js             # Database connection utilities
│   ├── 📄 format.js         # Data formatting functions
│   └── 📄 utils.js          # General utility functions
├── 📁 models/               # Database models
├── 📁 public/               # Static assets
└── 📁 scripts/              # Build/helper scripts (seed, hash generator)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Quality

- Run `npm run lint` to check code quality
- Run `npm run format` to format code
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aaditya Raj**
- GitHub: [@sahay-aaditya-raj](https://github.com/sahay-aaditya-raj)
- LinkedIn: [Connect with me](https://linkedin.com/in/aaditya-raj-sahay)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React Framework for Production
- UI Components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide React](https://lucide.dev/)
- Database powered by [MongoDB](https://www.mongodb.com/)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ and ☕ by [Aaditya Raj](https://github.com/sahay-aaditya-raj)

</div>
