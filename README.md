# LibMS - Library Management System

A comprehensive library management solution featuring a dual-interface approach with a web-based admin dashboard and mobile application for students.

## Project Overview

The Library Management System (LibMS) is designed to replace and improve upon existing library software by providing:
- **Web-based Admin Dashboard** - Full-featured library administration interface
- **Mobile Application** - Student-focused library services and book management
- **Modern Architecture** - Built with scalable technologies and best practices

##  Repository Structure

```
LibMS/
├── mobile_app/           # Flutter mobile application for students
├── react_app/            # React web dashboard for library administration  
├── backend/              # Node.js/Express API server
└── README.md             # This file
```

## Mobile App (Flutter)

**Path:** `./mobile_app/`

### Structure
```
mobile_app/
├── .vscode/              # VS Code configuration
├── android/              # Android platform files
├── assets/               # Images, fonts, and other assets
├── ios/                  # iOS platform files
├── lib/                  # Main Flutter application code
│   ├── config/           # App configuration files
│   ├── models/           # Data models and entities
│   ├── screens/          # UI screens and pages
│   ├── services/         # API services and business logic
│   ├── styles/           # Theme and styling
│   ├── widgets/          # Reusable UI components
│   └── main.dart         # App entry point
├── linux/                # Linux platform files
├── macos/                # macOS platform files
├── web/                  # Web platform files
├── windows/              # Windows platform files
├── .gitignore
├── .metadata
├── analysis_options.yaml # Dart analysis configuration
├── pubspec.lock          # Dependency lock file
└── pubspec.yaml          # Flutter dependencies and metadata
```

### Features
- Book search and discovery
- Personal borrowing history
- Reservation system
- Digital resource access
- Push notifications for due dates
- Profile management

## React App (Admin Dashboard)

**Path:** `./react_app/`

### Structure
```
react_app/
├── public/               # Static assets and HTML template
├── src/                  # React application source code
│   ├── components/       # Reusable React components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Main application pages
│   ├── services/         # API integration services
│   ├── App.css           # Main application styles
│   ├── App.js            # Root React component
│   ├── App.test.js       # Application tests
│   ├── index.css         # Global styles
│   ├── index.js          # React app entry point
│   ├── logo.svg          # Application logo
│   ├── reportWebVitals.js # Performance monitoring
│   └── setupTests.js     # Test configuration
├── .gitignore
├── .postcssrc.json       # PostCSS configuration
├── package-lock.json     # NPM lock file
├── package.json          # NPM dependencies and scripts
├── postcss.config.js     # PostCSS setup
└── tailwind.config.js    # Tailwind CSS configuration
```

### Features
- Student management system
- Staff & role management
- Book cataloging and inventory
- Borrowing and reservations tracking
- Notification system
- Ban management
- Comprehensive reporting
- Data export/import functionality

## 🔧 Backend (Node.js/Express)

**Path:** `./backend/`

### Structure
```
backend/
├── config/               # Database and app configuration
├── controllers/          # Route controllers and business logic
├── middleware/           # Custom middleware functions
├── models/               # Database models and schemas
├── routes/               # API route definitions
├── utils/                # Utility functions and helpers
├── .env                  # Environment variables (not in repo)
├── .gitignore
├── init-test.js          # Database initialization tests
├── package-lock.json     # NPM lock file
├── package.json          # NPM dependencies and scripts
├── seedAdmin.js          # Admin user seeding script
├── seedRoles.js          # User roles seeding script
└── server.js             # Express server entry point
```

### Key Features
- RESTful API architecture
- Role-based authentication system
- Database integration with seeding scripts
- Middleware for security and validation
- Comprehensive error handling

## 🚀 Getting Started
The system is deployed at : https://library-management-system-umber-ten.vercel.app
OPTIONAL: for fast results, load https://lms-backend-zjt1.onrender.com first, then
open the link above. (you can close this once it has loaded)
## 🧪 Testing

The project includes comprehensive testing strategies:
- **Unit & Integration Testing** by development team
- **User Acceptance Testing** with library staff
- **Student Testing** of mobile application
- **RFID Integration Testing**

Testing documentation is provided for both applications with structured test scenarios.

## 👥 Development Team

- **Aymen Seray**
- **Rosa Aouiguer** 
- **Ayoub Saci**
- **Mouadh Bourezg**

**Supervisors:** Dr. Brahimi, Ms. Hamdoune

##  Technology Stack

- **Frontend (Web):** React.js, Tailwind CSS
- **Frontend (Mobile):** Flutter/Dart
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT-based role authentication
- **Additional:** RFID integration support

## Documentation

Comprehensive documentation includes:
- Testing scenarios and validation procedures
- Stakeholder meeting records
- Feedback documentation from library staff and students
- System architecture and database schema diagrams

##  Contributing

This project was developed as part of an academic group project with continuous stakeholder engagement and iterative feedback incorporation.

##  Support

For questions or support, please contact the development team or supervisors listed above.
