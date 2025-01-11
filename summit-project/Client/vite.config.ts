import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})*/

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow access from any device on the network
    port: 8080,        // Specify the port number (you can change this if needed)
    cors: true,
  }
})