/*jshint esversion: 6 */
// jshint ignore: start
class ImageLoader extends JQ {
    constructor(options) {
      super();
      this.options = { ... {
        x: 0, y: 0,
        clearColor: '#fff'
      }, ... options };
      this.clearColor = tinycolor(this.options.clearColor).toHexString();
      this.$element = $('<div class="image-loader"></div>');
      this.canvas = $('<canvas style="display: none"/>').appendTo(this.$element).get(0);
      this.img = new Image();
      this.img.onload = () => {

        const w = this.canvas.width = this.img.width; // this.options.w ? Math.min(this.options.w, this.img.width) : this.img.width;
        const h = this.canvas.height = this.img.height; // this.options.h ? Math.min(this.options.h, this.img.height) :this.img.height;
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
        const result = [];
        for(let x = 0; x < w; x++) {
          const row = result[x] = [];
          for (let y = 0; y < h; y++) {

            const data = ctx.getImageData(x + this.options.x, y + this.options.y, 1, 1).data;
            var [ r, g, b, a] = data;
            if (a) {
              const colr = tinycolor({ r, g, b }).toHexString();
              if (colr === this.clearColor) {
                row[y] = { clear: true };

              } else {
                row[y] = { color: colr };
              }
            }
          }
        }
        if (this.onLoad) {
          this.onLoad(result);
        }
      }
      this.$img = $('<img style="display: none"/>').appendTo(this.$element);
      this.fileChooser =  new FileChooser().appendTo(this);
      this.fileChooser.onLoad = (data) => {
        this.img.src = data;
      };
    }


  }

  class ImageExporter {
    canvasToPng(canvas, img) {
      const url = canvas.toDataURL();
      if (!img) {
          img = document.createElement('img');
          document.body.appendChild(img);
      }
      img.src = url;
      return img;
    }
        /**
         * var downloadImage = function(data, filename) {
              var a = document.createElement('a');
              a.href = data;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
          };
         */
  }
