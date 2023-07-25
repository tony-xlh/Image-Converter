# Image-Converter

Convert images files in the browser with [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview).

It can convert images in bmp, jpeg, png, tiff and pdf to images in jpeg, png, tiff and pdf. It runs purely in the browser.

You can select multiple images or load multiple images from a zip file. You can export the images one by one or in a zip file.

## Installation

1. Via CDN:

  ```html
  <script type="module">
    import { ImageConverter } from 'https://unpkg.com/batch-image-converter/dist/image-converter.js';
    window.onload = function(){
      let container = document.querySelector('#app');
      new ImageConverter(container);
    }
  </script>
  <link href="https://unpkg.com/batch-image-converter/dist/style.css" rel="stylesheet">
  ```

2. Via NPM:

  ```bash
  npm install batch-image-converter
  ```