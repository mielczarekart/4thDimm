# Hello World TypeScript Project (Vite)

This project was scaffolded using Vite with the vanilla TypeScript template.

## Requirements
- Node.js >= 20.19.0 or >= 22.12.0

## Getting Started

1. **Upgrade Node.js**
   - The current Node.js version is too old for Vite 7+. Please upgrade Node.js to at least v20.19.0.
   - On Ubuntu/Linux, you can upgrade Node.js with:
     ```bash
     sudo npm cache clean -f
     sudo npm install -g n
     sudo n stable
     # Or for a specific version:
     sudo n 20.19.0
     ```
   - Restart your terminal after upgrading.

2. **Run the Dev Server**
   ```bash
   npm run dev
   ```

3. **View Your App**
   - Open the provided local URL in your browser (usually http://localhost:5173).

## Project Structure
- `index.html`: Main HTML file
- `src/main.ts`: TypeScript entry point
- `src/style.css`: Stylesheet

## Notes
- If you see engine warnings, upgrade Node.js as described above.
- For more info, see [Vite documentation](https://vitejs.dev/).
