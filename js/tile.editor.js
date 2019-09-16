/*jshint esversion: 9 */
class TileEditor extends JQ {
  constructor($element, options) {
    super();
    this.options = {   ... {}, ... options    };
    this.onChange = new rxjs.Subject();
    this.$element = $element ? $element : $('<div/>');
  }

  bounds(dimension) {
    this.dimension = dimension;
    return this;
  }

  loadFile(results) {

    this.canvas.layer.replace(results, this.dimension);
    if (this.canvas.manager) {
      this.canvas.manager.lifecycle.layers = true;
      this.canvas.manager.lifecycle.draw = true;
    }
    this.onChange.next({ 'type': 'file' });
  }

  useCanvas(canvas) {
    this.loader = new ImageLoader({w: canvas.layer.width, h: canvas.layer.height}).appendTo(this.$element);
    this.loader.onLoad = this.loadFile.bind(this);
    console.log(canvas);
    this.canvas = canvas;
    canvas.appendTo(this.$element);
    return this;
  }
}
