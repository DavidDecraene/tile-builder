/*jshint esversion: 6 */
class TileEditor extends JQ {
  constructor($element) {
    super();
    this.onChange = new rxjs.Subject();
    this.$element = $element ? $element : $('<div/>');
  }

  loadFile(results) {

    this.canvas.layer.replace(results);
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
