const { defineConfig } = require('electron-vite')
const path = require('path')
const fs = require('fs')

const pagesDir = path.resolve(__dirname, 'src/renderer/pages')
const rendererInputs = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.html'))
  .reduce((inputs, file) => {
    inputs[file.replace(/\.html$/, '')] = path.join(pagesDir, file)
    return inputs
  }, {})

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
        input: rendererInputs
      }
    }
  }
})
