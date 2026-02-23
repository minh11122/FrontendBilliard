# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Backend/
├── node_modules/       # Installed dependencies
├── public/             # Public static files
├── src/
│   ├── app/            # App configuration (routing, providers)
│   ├── assets/         # Images, icons, static assets
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context for global state
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Helper libraries & configs
│   ├── pages/          # Page-level components
│   ├── services/       # API calling services
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── .env                # Environment variables
├── index.html          # HTML entry file
├── package.json        # Project info & dependencies
├── tailwind.config.js  # Tailwind CSS configuration
├── vite.config.js      # Vite configuration
├── vercel.json         # Deployment configuration
└── README.md


Frontend/
├── configs/        # System & database configuration
├── controller/     # Handle request & response logic
├── middleware/     # Authentication & request middleware
├── models/         # Database models & schemas
├── routes/         # API route definitions
├── services/       # Business logic layer
├── uploads/        # Uploaded files storage
├── utils/          # Shared utility functions
├── .env            # Environment variables
├── .gitignore      # Ignored files for Git
├── index.js        # Server entry point
├── package.json    # Backend dependencies
└── package-lock.json