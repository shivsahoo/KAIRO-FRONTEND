# Kairo - AI Career Simulator

A modern web application for immersive career simulation experiences. Master real-world workplace challenges and develop professional skills through role-based simulations.

## 🚀 Tech Stack

- **React 18** with **TypeScript**
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router DOM** - Navigation
- **Zustand** - State management
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **Radix UI** - Accessible primitives

## 📦 Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

## 🏃 Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Shadcn UI components
│   └── Navbar.tsx    # Navigation component
├── pages/            # Page components
│   ├── Login.tsx     # Login page
│   ├── RoleSelection.tsx  # Role selection page
│   ├── Simulation.tsx     # Simulation page
│   └── PerformanceReport.tsx  # Report page
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
└── lib/              # Utility functions
```

## 🎨 Features

- **Glass-morphism Login Page** - Modern, transparent design
- **Role Selection** - Choose from HR Executive or Business Analyst roles
- **Interactive Simulations** - Immersive career scenarios
- **Performance Reports** - Track your progress
- **Smooth Animations** - Enhanced UX with Framer Motion

## 🔧 Configuration

- **Port**: Default Vite port (5173)
- **Font**: Poppins (loaded via Google Fonts)
- **Theme**: Light theme with dark mode support

## 📝 Notes

- Make sure Node.js version 18+ is installed
- The project uses Yarn as the package manager (optional)