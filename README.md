# FitForge &mdash; Intelligent Fitness & Nutrition Ecosystem

<div align="center">

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![JWT Auth](https://img.shields.io/badge/Security-JWT_Stateless-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

**An AI-driven, full-stack fitness and nutrition platform delivering hyper-personalized workout splits, automated macronutrient meal plans, biometric tracking, and an interactive 24/7 AI health coach.**

[Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Configuration](#-configuration) • [Database Schema](#-database-schema)

</div>

---

## 📌 Overview

**FitForge** bridges the gap between static fitness apps and certified personal coaching. By synthesizing individual biometrics, dietary restrictions, equipment availability, and medical considerations, FitForge designs dynamic, goal-oriented weekly workout splits and nutrition trajectories.

Equipped with an intelligent **dual-engine architecture**, FitForge leverages the **Google Gemini Generative AI** model for real-time adaptations and intelligent conversations, accompanied by a resilient **algorithmic fallback engine** that ensures zero downtime and deterministic plan generation even in offline environments.

---

## ✨ Key Features

### 🏋️ Personalized Workout Engine
- **Split Customization:** Supports Push-Pull-Legs (PPL), Upper/Lower, and Full Body weekly splits.
- **Equipment & Restriction Aware:** Dynamically curates exercises matching gym access, dumbbells, or bodyweight-only setups while filtering out contraindicated movements based on medical limitations.
- **Adaptive Volume:** Automatically configures sets, reps, and warmup protocols tailored to specific goals (Hypertrophy, Fat Loss, Strength, General Fitness).
- **Interactive Logging:** Track completed exercises, sets, weights, and session durations with real-time completion state management.

### 🥗 Smart Nutrition & Macronutrient Planning
- **Metabolic Calibration:** Automatic calculation of Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using clinically proven biometric models.
- **Automated Macro Balancing:** Targets a calibrated 30% Protein / 40% Carbohydrates / 30% Fats macronutrient ratio across 5 balanced meal slots (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner).
- **Allergy & Diet Filtering:** Native support for Vegetarian, Vegan, Keto, Paleo, and Mediterranean preferences, with strict elimination of flagged allergens.
- **Daily Food Log:** Track meals with interactive macro progress bars against daily caloric ceilings.

### 🤖 FitAI Real-Time Virtual Coach
- **Context-Aware Chat:** Conversational AI coach with conversation persistence powered by Google Gemini.
- **Instant Advice:** Ask questions regarding exercise biomechanics, alternative recipes, injury recovery guidelines, and nutrition science.

### 📈 Holistic Health & Biometric Tracking
- **Hydration Tracker:** Visual daily water intake logging against hydration goals.
- **Sleep Quality Monitoring:** Log sleep duration, bedtime, wake-up times, and perceived restfulness scores.
- **Weight Progression & Analytics:** Historical weight tracking with interactive charts and velocity metrics.
- **PDF Report Generation:** One-click weekly export for progress reports and plan sheets using `jspdf` and `html2canvas`.

### 🔒 Enterprise-Grade Security
- **Stateless Authentication:** Secure JSON Web Tokens (JJWT) with configurable expiration and validation filters.
- **Password Protection:** Irreversible BCrypt hashing with custom salting.
- **CORS Protection:** Fine-grained origin control across development and production environments.

---

## 🏗 System Architecture

FitForge utilizes a decoupled, client-server architecture with high resilience and asynchronous processing.

```
                          ┌─────────────────────────────────────┐
                          │         React 19 Frontend           │
                          │   (Vite, Recharts, Lucide, Axios)   │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / REST (JWT)
                                             ▼
                          ┌─────────────────────────────────────┐
                          │      Spring Boot 3.3.4 (Java 21)    │
                          │  Security Filter Chain | Controllers │
                          └──────────┬──────────────────┬───────┘
                                     │                  │
                JPA / Hibernate      │                  │ WebClient (Non-blocking)
                                     ▼                  ▼
                    ┌─────────────────────┐   ┌─────────────────────────┐
                    │      MySQL 8.0      │   │   Google Gemini API     │
                    │ Relational Storage  │   │  (gemini-3.8-flash)     │
                    │ Exercise Catalog    │   └────────────┬────────────┘
                    └─────────────────────┘                │ (Fallback)
                                                           ▼
                                              ┌─────────────────────────┐
                                              │  Deterministic Fallback │
                                              │      Plan Engine        │
                                              └─────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Description |
| :--- | :--- |
| **Java 21** | LTS runtime leveraging modern language features and high-efficiency bytecode |
| **Spring Boot 3.3.4** | Production-ready enterprise framework powering the RESTful backend |
| **Spring Data JPA / Hibernate** | ORM for schema management, relational mapping, and transactional safety |
| **Spring Security 6** | Comprehensive stateless authentication and route authorization |
| **JJWT (0.12.5)** | Secure token creation, signing, and verification |
| **Spring WebFlux (WebClient)** | Reactive, non-blocking HTTP client for Gemini API communication |
| **MySQL 8.0** | Relational database engine storing user records, catalogs, and historical metrics |
| **Lombok** | Boilerplate reduction for models, builders, and DTOs |

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | Component-driven UI library leveraging the latest functional rendering model |
| **Vite 8** | High-performance build tool with instant Hot Module Replacement (HMR) |
| **React Router DOM 7** | Client-side routing with authenticated protected route guards |
| **Recharts 3** | Responsive, composable SVG charts for telemetry and progress tracking |
| **Lucide React** | Modern, lightweight icon system |
| **Axios** | Promise-based HTTP client configured with request/response interceptors |
| **Vanilla CSS3** | Custom design system with glassmorphism, responsive grids, and dark theme |
| **jsPDF & html2canvas** | Client-side dynamic PDF compilation and report generation |

---

## 📁 Repository Structure

```
FitForge/
├── fitforge-backend/                # Spring Boot REST API
│   ├── src/main/java/com/fitforge/
│   │   ├── config/                  # Web, Security & CORS configurations
│   │   ├── controller/              # REST Controllers (Auth, Workout, Nutrition, Chat, etc.)
│   │   ├── dto/                     # Data Transfer Objects & API schemas
│   │   ├── exception/               # Global exception handlers & custom errors
│   │   ├── model/                   # JPA Entities (User, Exercise, WorkoutPlan, etc.)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── security/                # JWT filters, entry points, & user details
│   │   └── service/                 # Core domain logic & AI integration
│   ├── src/main/resources/
│   │   ├── application.properties   # Database, JWT, & AI config
│   │   └── data.sql                 # Seed exercise catalog
│   └── pom.xml                      # Maven project descriptor
│
├── fitforge-frontend/               # React Single Page Application
│   ├── src/
│   │   ├── api/                     # Axios clients & API service wrappers
│   │   ├── assets/                  # Static design assets and icons
│   │   ├── components/              # Modular UI components (Dashboard, Chat, Charts, etc.)
│   │   ├── context/                 # React Context providers (AuthContext, etc.)
│   │   ├── hooks/                   # Custom application hooks
│   │   ├── pages/                   # Top-level view pages (Onboarding, Workout, Nutrition, etc.)
│   │   ├── styles/                  # Design system tokens and styling sheets
│   │   └── App.jsx                  # Main application routing and shell
│   ├── package.json                 # Frontend dependencies and scripts
│   └── vite.config.js               # Vite configuration and proxy rules
│
├── mysql_init.sql                   # MySQL initial database creation script
├── reset_mysql.bat                  # Automated MySQL credential initialization
├── START_FITFORGE.bat               # 1-Click launcher for backend + frontend
├── .gitignore                       # Git exclusion rules
└── README.md                        # Documentation
```

---

## ⚡ Quick Start

### Prerequisites
Make sure the following dependencies are installed on your machine:
- **Java Development Kit (JDK) 21** or higher
- **Apache Maven 3.9+**
- **Node.js (v18+)** & **npm**
- **MySQL Server 8.0+**

---

### Option 1: One-Click Startup (Windows)
FitForge includes ready-to-run automation scripts for rapid local deployment:

1. **Configure MySQL:** If your MySQL root account password is not `fitforge123`, run:
   ```cmd
   reset_mysql.bat
   ```
2. **Launch Application:** Double-click or run:
   ```cmd
   START_FITFORGE.bat
   ```
   *This verifies MySQL, boots the Spring Boot backend on `:8080`, installs frontend dependencies if needed, starts the Vite development server on `:5173`, and opens your browser automatically.*

---

### Option 2: Manual Step-by-Step Setup

#### 1. Database Setup
Log into your MySQL CLI or Workbench and create the database:
```sql
CREATE DATABASE IF NOT EXISTS fitforge_db;
```
*(Hibernate automatically validates and initializes all database tables upon backend startup).*

#### 2. Backend Setup
Navigate to the backend directory and launch via Maven:
```bash
cd fitforge-backend

# Set your optional Gemini API key (PowerShell)
$env:GEMINI_API_KEY="your-gemini-api-key"

# Run Spring Boot application
mvn spring-boot:run
```
The backend API will be live at `http://localhost:8080`.

#### 3. Frontend Setup
In a new terminal window, initialize and serve the client application:
```bash
cd fitforge-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Configuration & Environment Variables

FitForge operates seamlessly with default local settings, but supports granular overrides via environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://localhost:3306/fitforge_db?...` | JDBC MySQL connection string |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `fitforge123` | Database user password |
| `JWT_SECRET` | `FitForgeDevelopmentSecretKey...` | Cryptographic secret for signing tokens |
| `JWT_EXPIRATION_MS` | `86400000` (24 Hours) | Lifetime of issued authentication tokens |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini AI API authorization key |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini model tag used for generation |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:5173,http://localhost:5174` | Permitted origins for Cross-Origin requests |

---

## 📡 API Documentation

FitForge exposes structured RESTful endpoints protected by bearer token authentication.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT | Public |

### User Profile (`/api/profile`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Retrieve the authenticated user's profile | Authenticated |
| `POST` | `/api/profile` | Initial onboarding questionnaire submission | Authenticated |
| `PUT` | `/api/profile` | Update biometric parameters, goals, and targets | Authenticated |

### Workout Operations (`/api/workouts`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workouts/plan` | Fetch current weekly workout plan | Authenticated |
| `POST` | `/api/workouts/generate` | Generate fresh weekly split via AI / Algorithm | Authenticated |
| `GET` | `/api/workouts/catalog` | Search exercise library with equipment filters | Authenticated |
| `POST` | `/api/workouts/log` | Record a completed workout session | Authenticated |
| `GET` | `/api/workouts/logs` | Fetch workout history and adherence metrics | Authenticated |

### Nutrition & Meals (`/api/nutrition`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/nutrition/plan` | Retrieve current 7-day meal plan | Authenticated |
| `POST` | `/api/nutrition/generate` | Generate macro-balanced weekly meal plan | Authenticated |
| `POST` | `/api/nutrition/log` | Log an individual meal intake | Authenticated |
| `GET` | `/api/nutrition/logs/today`| Retrieve daily calorie and macronutrient breakdown | Authenticated |

### Chat & Assistant (`/api/chat`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/send` | Submit prompt to FitAI and receive answer | Authenticated |
| `GET` | `/api/chat/history` | Retrieve user's historical AI dialogue | Authenticated |

### Biometrics & Extras (`/api/extras`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/extras/water` | Log daily hydration intake | Authenticated |
| `POST` | `/api/extras/sleep` | Log sleep duration and quality | Authenticated |
| `POST` | `/api/extras/weight` | Record new scale weight entry | Authenticated |
| `GET` | `/api/extras/recipes` | Retrieve curated recipe recommendations | Authenticated |

---

## 🗄 Database Schema

The relational schema is normalized and managed through JPA entities:

- **`users`**: Base credentials, email, password hashes, registration metadata.
- **`health_profiles`**: Age, biological sex, height, weight, activity multiplier, diet type, allergies, injuries, target calories, and preferred split.
- **`exercises`**: Comprehensive exercise catalog indexed by muscle group, difficulty level, equipment required, and movement restrictions.
- **`workout_plans`**: Serialized JSON weekly workout routines linked to user profiles.
- **`workout_logs`**: Completed workout sessions, durations, and exercise completion flags.
- **`meal_plans`**: Serialized 7-day nutritional schedules with granular per-meal macro breakdowns.
- **`meal_logs`**: Timestamped meal entries tracking calories, protein, carbs, and fats consumed.
- **`water_logs` & `sleep_logs`**: Daily hydration and sleep hygiene telemetry.
- **`weight_logs`**: Historical weight snapshots for trend evaluation.
- **`chat_messages`**: Persistent conversational history between user and FitAI.

---

## 🔮 Future Roadmap

- [ ] **Wearable Integration:** Sync with Apple HealthKit, Google Fit, and Garmin smartwatches.
- [ ] **Computer Vision Form Correction:** Real-time posture and repetition feedback using MediaPipe or TensorFlow.js.
- [ ] **Social & Community Challenges:** Peer workout accountability, shared plans, and leaderboards.
- [ ] **Dockerization:** Complete `docker-compose.yml` deployment with pre-configured MySQL, Spring Boot, and NGINX containers.

---

## 🤝 Contributing

Contributions make the open-source community a place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by Tejas | Engineered with modern Java, Spring Boot, React & Google AI</sub>
</div>
