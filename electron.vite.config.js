const { defineConfig } = require('electron-vite')
const react = require('@vitejs/plugin-react').default
const path = require('path')

module.exports = defineConfig({
  main: {
    entry: 'main.js',
    build: {
      rollupOptions: {
        input: 'main.js'
      }
    }
  },
  preload: {
    entry: 'src/main/preload.js',
    build: {
      rollupOptions: {
        input: 'src/main/preload.js'
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/renderer/pages/auth.html')
        }
      }
    },
    plugins: [react()]
  }
})
