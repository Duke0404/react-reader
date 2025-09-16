# React Reader

A Progressive Web Application (PWA) for reading PDF documents with advanced accessibility features including bionic reading, text-to-speech, and translation support.

## ✨ Features

- **📱 Progressive Web App** - Works offline, installable on any device
- **👁️ Bionic Reading** - Enhances focus and reading speed
- **🔊 Text-to-Speech** - Neural and system voice synthesis
- **🌐 Translation** - Real-time translation to multiple languages
- **🎨 Color Modes** - Multiple themes for visual comfort
- **📊 Reading Progress** - Track your reading across devices
- **☁️ Optional Sync** - Synchronize library with self-hosted backend
- **♿ WCAG 2.1 Compliant** - Full accessibility support

## 🚀 Quick Start

### Try it Online
Visit the live demo at [https://Duke0404.github.io/react-reader](https://Duke0404.github.io/react-reader)

### Run Locally

#### Prerequisites
- Node.js 18+ and npm
- Git

#### 1. Clone and Setup
```bash
git clone https://github.com/duke0404/react-reader.git
cd react-reader
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend Connection (Optional)
For synchronization and enhanced features, connect to a React Reader backend:

1. Click the settings icon in the dashboard
2. Enter your backend URL (e.g., `https://localhost:3443`)
3. Create an account or login

### Supported Backends
- [React Reader Backend](https://github.com/duke0404/react-reader-backend) - Official self-hosted backend
- Or use the app fully offline without any backend

## 📦 Building for Production

### Build the App
```bash
npm run build
```
The built files will be in the `dist/` directory.

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Self-Host
Serve the contents of the `dist/` directory with any static web server:

```bash
# Example with Python
cd dist
python -m http.server 8000

# Example with Node.js
npx serve dist
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run pretty` - Format code with Prettier
- `npm run deploy` - Deploy to GitHub Pages

### Project Structure
```
react-reader/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Business logic
│   ├── db/            # IndexedDB integration
│   └── routes/        # Page routes
├── public/            # Static assets
└── dist/              # Production build
```

### Key Technologies
- **React 18** with TypeScript
- **TanStack Router** for client-side routing
- **PDF.js** for PDF rendering
- **React Aria** for accessibility
- **Dexie.js** for IndexedDB
- **Vite** for build tooling
- **PWA** using Workbox

## 🔐 Privacy & Security

- All data is stored locally in your browser
- No tracking or analytics
- Backend connection is optional
- HTTPS enforced for backend communication
- PDF rendering in sandboxed environment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/duke0404/react-reader/issues).

## 📚 Documentation

For detailed documentation and API reference, see the [thesis document](https://github.com/duke0404/react-reader/wiki).
