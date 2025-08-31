# 💰 Money Software

<div align="center">
  
![Money Software Logo](./public/logo-placeholder.png)

*A modern, intuitive expense tracking and financial management application*

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Powered by React](https://img.shields.io/badge/Powered%20by-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Live Demo](#) | [Features](#-features) | [Installation](#-installation) | [API Documentation](#-api-documentation)

</div>

---

## 📸 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard Screenshot](./public/screenshots/dashboard-placeholder.png)

### Expense Management
![Expense Management Screenshot](./public/screenshots/expense-management-placeholder.png)

### Analytics & Reports
![Analytics Screenshot](./public/screenshots/analytics-placeholder.png)

</div>

## ✨ Features

- 📊 **Interactive Dashboard** - Beautiful charts and visualizations powered by Recharts
- 💳 **Expense Tracking** - Add, edit, and categorize your expenses with ease
- 📈 **Financial Analytics** - Comprehensive reports and insights into your spending patterns
- 🗓️ **Date-based Filtering** - Track expenses by date ranges and time periods
- 💱 **Currency Support** - Native support for Indian Rupee (INR) formatting
- 📱 **Responsive Design** - Seamless experience across desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with Radix UI components
- 🔍 **Smart Search** - Quickly find expenses with advanced filtering options
- 📊 **Time Series Analysis** - Track spending trends over time
- 💾 **Automatic Saving** - Real-time data persistence with MongoDB

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Styling | Tools |
|----------|---------|----------|---------|-------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | ![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat&logo=biome&logoColor=white) |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![API Routes](https://img.shields.io/badge/API%20Routes-000000?style=flat&logo=nextdotjs&logoColor=white) | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white) | ![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=flat&logo=radixui&logoColor=white) | ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white) |

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

## 📖 Usage

### Adding Expenses

![Add Expense Flow](./public/screenshots/add-expense-flow.gif)

1. Navigate to the "Add Expense" page
2. Fill in the expense details (amount, category, description, date)
3. Click "Save" to record your expense

### Viewing Reports

![Reports Overview](./public/screenshots/reports-overview.png)

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

### Example API Usage

```javascript
// Adding a new expense
const response = await fetch('/api/expenses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 500,
    category: 'Food',
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

### Adding New Categories

Expense categories can be customized in the application. The system supports dynamic category management.

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
├── 📁 models/               # Database models
├── 📁 public/               # Static assets
└── 📁 scripts/              # Build scripts
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

**Aaditya Raj Sahay**
- GitHub: [@sahay-aaditya-raj](https://github.com/sahay-aaditya-raj)
- LinkedIn: [Connect with me](https://linkedin.com/in/aaditya-raj-sahay)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React Framework for Production
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide React](https://lucide.dev/)
- Database powered by [MongoDB](https://www.mongodb.com/)

## 📈 Roadmap

- [ ] Multi-currency support
- [ ] Export functionality (PDF, CSV)
- [ ] Budget planning and alerts
- [ ] Receipt scanning with OCR
- [ ] Mobile app development
- [ ] Bank account integration
- [ ] Collaborative budgets
- [ ] Advanced analytics and ML insights

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ and ☕ by [Aaditya Raj](https://github.com/sahay-aaditya-raj)

</div>
