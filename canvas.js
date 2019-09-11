/*jshint esversion: 6 */
// jshint ignore: start
class Canvas {
  constructor(scale = 1, opts = {}) {

    this.options = { ... {
      rotation: 0,
      editor: false,
      w: 32, h: 32,
      transparent: '#fff', grid: false, createElement: false,
      x: 0, y: 0}, ... opts };
    this.scale = scale;
    this.layers = [];
    if (this.options.createElement) {
      this.$element = $('<canvas/>').attr('width', this.scale  * this.width)
        .attr('height', this.scale  * this.height);
      this.canvas = this.$element.get(0);
      this.ctx = this.canvas.getContext("2d");
      this.$element.click((e) => {
        console.log(this);
        if (!this.layer || !this.manager) { return;  }
        const pos = {
          x: Math.floor((e.pageX - this.canvas.offsetLeft) / this.scale),
          y:  Math.floor((e.pageY - this.canvas.offsetTop)  / this.scale)
        };
        const change = this.manager.adaptData(this.layer.getData(pos.x, pos.y), this.manager.tool);
        if(change) {
          change.layer = this.layer;
          change.x = pos.x;
          change.y = pos.y;
          console.log('ok');
          this.manager.onEditChange(change);
        }
        console.log(pos, this.layer.getData(pos.x, pos.y, false));
      });
    }
  }



  get width() {
    return this.options.w;
  }

  get grid() {
    return this.options.grid;
  }

  get transparentColor() {
    return this.optionstransparentw;
  }

  get height() {
    return this.options.h;
  }

  mainLayer(layer) {
    this.layer = layer;
    this.addLayer(layer);
    return this;
  }

  addLayer(layer) {
    if (Array.isArray(layer)) {
      layer.forEach(l => this.layers.push(l));
    } else {
      this.layers.push(layer);
    }
    return this;
  }

  addClass(cl) {
    this.$element.addClass(cl);
    return this;
  }

  appendTo($el) {
    this.$element.appendTo($el);
    return this;
  }

  clear() {
  const cx = this.options.x;
  const cy = this.options.y;
    this.ctx.clearRect(cx, cy, this.scale * this.width, this.scale * this.height);
  }

  getLayers() {
    return this.layers;
  }

  draw(layers) {
    if (!layers) { layers = this.getLayers(); }
    const ctx = this.ctx ;
    ctx.save();
    const cx = this.options.x;
    const cy = this.options.y;
    this.clear();
    if (!Array.isArray(layers)) {
      layers = [layers];
    }
    layers.forEach(layer => {
      const pix = layer.pix;
      for(var x =0 ; x < pix.length; x++) {
        const row = pix[x];
        if (!row) { continue; }
        for(var y = 0; y < row.length; y++) {
          const data = row[y];
          if (!data) { continue; }
          if (data.clear) {
            ctx.clearRect(cx + x * this.scale, cy + y * this.scale, this.scale, this.scale);
          } else {
            ctx.fillStyle = data.color;
            ctx.fillRect(cx + x * this.scale, cy + y * this.scale, this.scale, this.scale);
          }
        }
      }
      if (this.grid) {
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (var i = 0; i < 32; i++) {
          ctx.beginPath();
          ctx.moveTo(i * this.scale, 0);
          ctx.lineTo(i * this.scale, this.scale * this.height);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * this.scale);
          ctx.lineTo(this.scale * this.width, i * this.scale);
          ctx.stroke();
        }
      }
      ctx.restore();
    });
  }
}
