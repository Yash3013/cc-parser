# Frontend - Credit Card Statement Parser

React-based frontend for the Credit Card Statement Parser application.

## Features

- 🎨 Modern, responsive UI with dark mode
- 📱 Mobile-friendly design
- 📊 Interactive analytics dashboard
- 📂 Drag-and-drop file upload
- 📈 Visual transaction analysis
- 🔄 Batch processing support

## Tech Stack

- React.js with Vite
- TailwindCSS for styling
- Lucide React for icons
- Axios for API requests

## Setup & Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Configure the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_MAX_FILE_SIZE=10485760
   REACT_APP_MAX_FILES=15
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## Build & Deployment

1. **Production build**
   ```bash
   npm run build
   ```

2. **Vercel Deployment**
   - Connect to GitHub repository
   - Configure environment variables
   - Deploy using Vercel CLI:
     ```bash
     vercel
     ```

## Component Structure

```
src/
├── App.jsx              # Main application component
├── components/          # Reusable UI components
├── services/           # API integration
└── styles/            # CSS and styling
```

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Create production build
- `npm test`: Run tests
- `npm run lint`: Lint code

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🚀 Features

- ✅ Drag-and-drop file upload
- ✅ Batch processing (10+ files simultaneously)
- ✅ Real-time parsing progress
- ✅ Smart analytics dashboard
- ✅ Side-by-side comparison
- ✅ Export to JSON/CSV
- ✅ Dark/Light mode toggle
- ✅ Fully mobile responsive
- ✅ Copy-to-clipboard functionality
- ✅ Transaction categorization

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your backend URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running Locally

Start the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building for Production

Create optimized production build:
```bash
npm run build
```

The build folder will contain optimized static files ready for deployment.

## 🧪 Running Tests

```bash
npm test
```

## 📱 Features Walkthrough

### Upload Page
- Drag and drop up to 10 PDF files
- Multi-file selection support
- Real-time file validation
- Progress indicators during parsing

### Results Page
- Comprehensive data extraction display
- Confidence scores for each field
- Copy-to-clipboard for all fields
- Transaction list with automatic categorization
- Smart insights and warnings

### Analytics Page
- Total spending across all statements
- Average spending per statement
- Category-wise breakdown
- Visual representations

### Comparison Page
- Side-by-side statement comparison
- Export all data to CSV
- Quick overview of multiple statements

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Adding New Banks

Update the supported banks list in `App.js` and connect to backend parser.

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` = your backend URL

### Deploy to Netlify

1. Build the app:
```bash
npm run build
```

2. Drag the `build/` folder to [Netlify Drop](https://app.netlify.com/drop)

3. Add environment variable in Site Settings:
   - `REACT_APP_API_URL` = your backend URL

### Deploy to GitHub Pages

1. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/cc-parser"
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

4. Deploy:
```bash
npm run deploy
```

## 🌐 Browser Support

- Chrome (recommended) - Latest 2 versions
- Firefox - Latest 2 versions
- Safari - Latest 2 versions
- Edge - Latest 2 versions
- Mobile browsers - iOS Safari, Chrome Mobile

## 🔧 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on correct port
- Check CORS configuration in backend
- Verify API URL in `.env.local`

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version`

### Styling Issues
- Rebuild Tailwind: `npx tailwindcss -i ./src/index.css -o ./dist/output.css`
- Check tailwind.config.js paths

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub or contact [your-email@example.com]

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide React for beautiful icons
- OpenAI for AI-powered parsing capabilities

---

Built with ❤️ by Yash Shah