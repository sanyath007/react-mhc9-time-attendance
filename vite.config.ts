import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pluginChecker from 'vite-plugin-checker';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        pluginChecker({
            typescript: { tsconfigPath: "./tsconfig.app.json" },
            // eslint: {
            //     lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
            // },
            // Can also add overlay warnings/errors in the browser
            overlay: {
                initialIsOpen: false,
                // Customize the overlay warnings/errors here
            },
        }),
    ],
    base: '/',  // Set the base path for the application in production set to '/check-in/'
})
