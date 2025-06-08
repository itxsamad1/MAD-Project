# MediConnect - Healthcare Mobile Application

A cross-platform healthcare application built with React Native, Node.js, Express.js, and PostgreSQL.

## 🌟 Features

- Role-based authentication (Patient, Doctor, Admin)
- Appointment scheduling and management
- Real-time chat between doctors and patients
- Medical records management
- Doctor verification system
- Admin dashboard with analytics

## 📱 Frontend Technologies

- React Native
- React Navigation
- React Native Reanimated
- React Native Vector Icons
- TypeScript
- Axios

## 🔧 Backend Technologies

- Node.js
- Express.js
- PostgreSQL (via Neon)
- JWT Authentication
- bcryptjs

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mediconnect.git
cd mediconnect
```

2. Install Frontend Dependencies:
```bash
cd MediConnect
npm install
```

3. Install Backend Dependencies:
```bash
cd Backend
npm install
```

4. Set up environment variables:
- Create `.env` file in the Backend directory
- Add necessary environment variables (see `.env.example`)

5. Start the development servers:

Backend:
```bash
cd Backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd MediConnect
npm run android  # for Android
# or
npm run ios     # for iOS
```

## 📁 Project Structure

```
MediConnect/
├── Frontend/               # React Native App
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # Screen components
│   │   ├── navigation/    # Navigation configuration
│   │   ├── services/      # API services
│   │   ├── utils/        # Helper functions
│   │   └── assets/       # Images, fonts, etc.
│   └── ...
│
└── Backend/               # Node.js + Express.js Server
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Route controllers
    │   ├── middlewares/  # Custom middlewares
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   └── app.js        # Express app setup
    └── ...
```

## 👥 User Roles

### Patient
- Book appointments
- Search for doctors
- Chat with doctors
- View medical records
- Manage profile

### Doctor
- Manage appointments
- Write prescriptions
- Chat with patients
- Set availability
- View patient records

### Admin
- Verify doctors
- Manage users
- View analytics
- Send notifications
- System management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 