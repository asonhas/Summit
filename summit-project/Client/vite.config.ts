import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})*/

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow access from any device on the network
    port: 443,        // Specify the port number (you can change this if needed)
    cors: true,
    https: {
      //pfx: fs.readFileSync('./ssl/fs-summit.pfx'),
      //passphrase: '123456'

      key: fs.readFileSync('./ssl/private.key'),
      cert: fs.readFileSync('./ssl/certificate.pem'),
    }
  }
})