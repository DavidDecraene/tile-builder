/*jshint esversion: 6 */
// jshint ignore: start


class TileSetCanvas extends JQ {
  constructor(w, h, scale = 1) {
    super();
    this.renderers = [];
    this.width = w;
    this.height = h;
    this.scale = scale;
    this.$element = $('<canvas/>')
      .attr('width', this.scale  * this.width * 32)
      .attr('height', this.scale  * this.height * 32);
    this.canvas = this.$element.get(0);
    this.ctx = this.canvas.getContext("2d");

  }

  addCanvas(x, y, canvas) {
    const clone = new Canvas(this.scale, {
      x: x * 32 * this.scale, y: y * 32 * this.scale, createElement: false
    });
    clone.ctx = this.ctx;
    clone.layers = canvas.layers;
    this.renderers.push(clone);
    return this;
  }

  draw() {
      this.renderers.forEach(cv => {
        cv.draw();
      });
  }
}


class CanvasManager {


  constructor() {
    this.toolbar = new Toolbar();
    this.lifecycle = {
      draw: true, layers: true, started: false
    };
    this.drawCanvases = [];
    this.drawImages = [];
    this.tileCanvases = [];
    this.actions= [];
    this.updateableLayers = [];
    this.tilesets = [];
    this.body = new Layer(32, 32);
    this.corner1 = new Layer(32, 32);
    this.corner2 = this.addUpdateableLayer(new RotationLayer(this.corner1));
    this.corner3 = this.addUpdateableLayer(new RotationLayer(this.corner2));
    this.corner4 = this.addUpdateableLayer(new RotationLayer(this.corner3));
    this.flatTop = new Layer(32, 32);
    this.flatRight = this.addUpdateableLayer(new RotationLayer(this.flatTop));
    this.flatBot = this.addUpdateableLayer(new RotationLayer(this.flatRight));
    this.flatLeft = this.addUpdateableLayer(new RotationLayer(this.flatBot));
    this.flatBoth = this.addUpdateableLayer(new MirrorXLayer(this.flatTop));
    this.flatBothV = this.addUpdateableLayer(new RotationLayer(this.flatBoth));
    this.outerCorner1 = new Layer(32, 32);
    this.outerCorner2 = this.addUpdateableLayer(new RotationLayer(this.outerCorner1));
    this.outerCorner3 = this.addUpdateableLayer(new RotationLayer(this.outerCorner2));
    this.outerCorner4 = this.addUpdateableLayer(new RotationLayer(this.outerCorner3));
    this.cornerSide =  this.addUpdateableLayer(new MirrorXLayer(this.outerCorner1));
    this.cornerSideUp = this.addUpdateableLayer(new RotationLayer(this.cornerSide));
    this.cornerSideRight = this.addUpdateableLayer(new RotationLayer(this.cornerSideUp));
    this.cornerSideDown = this.addUpdateableLayer(new RotationLayer(this.cornerSideRight));
    this.cornerAll = this.addUpdateableLayer(new MirrorYLayer(this.cornerSide));

    this.undo = new DataAdapter('undo');


    $('body').keyup(e => {
      const event = e.originalEvent;
      if(event.shiftKey){
        if(event.key === 'Z'){
          this.undoAction();
          return;
        }
      }
    });
    this.update = this.update.bind(this);
  }

  start() {
    if (this.lifecycle.started) { return; }
    this.lifecycle.started = true;
    this.update();
  }

  stop() {
    this.lifecycle.started = false;
    if (this.lifecycle.frame !== undefined) {
      window.cancelAnimationFrame(this.lifecycle.frame);
    }
  }

  update(timestamp) {
    if (!this.lifecycle.started) { return; }
    if(this.lifecycle.layers) {
      this.updateableLayers.forEach(l => l.update());
      this.lifecycle.layers = false;
    }
    if (this.lifecycle.draw) {
      this.drawCanvases.forEach(cv => {
        cv.draw()
      });
      this.tilesets.forEach(tileset => tileset.draw());
      this.lifecycle.draw = false;
    }
    if (this.lifecycle.images) {
      this.lifecycle.images = false;
      this.drawImages.forEach(cv => cv.update());
    }
    this.lifecycle.frame = window.requestAnimationFrame(this.update);
  }

  addUpdateableLayer(l) {
    this.updateableLayers.push(l);
    return l;
  }

  undoAction() {
    const action = this.actions.pop();
    if (action) {
      if (action.layer && action.x !== undefined && action.y !== undefined) {
        this.undo.configure(action.original);
        if(this.performAction(this.undo, action.layer, action.x, action.y, true)) {
          this.lifecycle.draw = true;
        }
      }
    }
  }

  performAction(action, layer, x, y, restore) {
    if (x === undefined || y === undefined || layer === undefined) {
      return;
    }
    const data = layer.getData(x, y);
    if (!action) {
      action = this.toolbar.selection.action;
    }
    if (!action) { return; }
    const event = action.doAction(data);
    if (event) {
      event.layer = layer;
      event.x = x;
      event.y = y;
      if (!restore && event.undo) {
        this.addUndoAction(event);
      }
    }
    return event;
  }

  addUndoAction(ev) {
    if (ev) {
      this.actions.push(ev);
      this.lifecycle.draw = true;
    }
  }

  addTileEditor(editor) {
    this.addCanvases(editor.canvas);
    editor.onChange.subscribe((_ev) => {

      this.lifecycle.draw = true;
    });
    return editor;
  }

  addTileCanvas(... layers) {
    const canvas = new Canvas(2);
    layers.forEach(arg => canvas.addLayer(arg));
  //  this.addCanvases(canvas);
    this.tileCanvases.push(canvas);
    return canvas;
  }

  addCanvases(canvases) {
    if (!canvases) { return; }
    if (!Array.isArray(canvases)) { canvases = [ canvases]; }
    canvases.forEach(cv => {
      cv.manager = this;
      this.drawCanvases.push(cv);
      if (cv.image) {
        this.drawImages.push(cv.image);
      }
    });
  }

}


$(document).ready(function() {
  const $stageBody = $('.stage-body');
  const $previews = $('.previews');
  const $tools = $('.tools');
  const $terrain = $('.terrain');
  const $tileset = $('.tileset');
  const stage = new CanvasManager();
  for (var x = 0; x < 32; x++) {
    for (var y = 0; y < 32; y++){
      stage.body.pixel(x, y, "green");
    }
  }

  [
    [0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [1, 1], [1, 2], [2, 1]
  ].forEach(corner => {
    stage.corner1.transparent(corner[0], corner[1]);
  });
  for(let x = 0; x < 32; x++) {
    for (let y= 0; y < 3; y++) {
      stage.outerCorner1.transparent(x, y);
      stage.flatTop.transparent(x, y);
      stage.cornerSide.transparent(x, y);
    }
  }
  for(let x = 0; x < 3; x++) {
    for (let y= 3; y < 32; y++) {
      stage.outerCorner1.transparent(x, y);
      stage.cornerSide.transparent(x, y);
    }
  }
  [[3, 4], [3, 3], [4, 3]].forEach(pix => {
    stage.outerCorner1.transparent(pix[0], pix[1]);
    stage.cornerSide.transparent(pix[0], pix[1]);
  });
  stage.addTileEditor(new TileEditor($('#full-tile'))
    .useCanvas(new Canvas(15, {  grid: true,  createElement: true }).mainLayer(stage.body)));
  stage.addTileEditor(new TileEditor($('#outer-corner-tile'))
    .useCanvas(new Canvas(15, { grid: true, w: 16, h: 16,  createElement: true }).addLayer(stage.body).mainLayer(stage.outerCorner1)));
  stage.addTileEditor(new TileEditor($('#inner-corner-tile'))
    .useCanvas(new Canvas(15, { grid: true, w: 16, h: 16,  createElement: true }).addLayer(stage.body).mainLayer(stage.corner1)));
  stage.addTileEditor(new TileEditor($('#flat-top-tile'))
    .useCanvas(new Canvas(15, { grid: true, w: 16, h: 16,  createElement: true }).addLayer(stage.body).mainLayer(stage.flatTop)));
  const fullTile = stage.addTileCanvas(stage.body);
  const innerCorner1 = stage.addTileCanvas(stage.body, stage.corner1);
  const innerCorner2 = stage.addTileCanvas(stage.body, stage.corner2);
  const innerCorner3 = stage.addTileCanvas(stage.body, stage.corner3);
  const innerCorner4 = stage.addTileCanvas(stage.body, stage.corner4);
  const c2 = stage.addTileCanvas(stage.body, stage.corner1, stage.corner2);
  const c2Bot = stage.addTileCanvas(stage.body, stage.corner3, stage.corner4);
  const c3 = stage.addTileCanvas(stage.body, stage.corner1, stage.corner2, stage.corner3);
  const c4 = stage.addTileCanvas(stage.body, stage.corner1, stage.corner2, stage.corner3, stage.corner4);
  const outerCorner = stage.addTileCanvas(stage.body, stage.outerCorner1);
  const outerCorner2 = stage.addTileCanvas(stage.body, stage.outerCorner2);
  const outerCorner3 = stage.addTileCanvas(stage.body, stage.outerCorner3);
  const outerCorner4 = stage.addTileCanvas(stage.body, stage.outerCorner4);
  const cornerSide = stage.addTileCanvas(stage.body, stage.cornerSide);
  const cornerSideDown = stage.addTileCanvas(stage.body, stage.cornerSideDown);
  const cornerAll = stage.addTileCanvas(stage.body, stage.cornerAll);
  const flatTop = stage.addTileCanvas(stage.body, stage.flatTop);
  const flatRight = stage.addTileCanvas(stage.body, stage.flatRight);
  const flatBot = stage.addTileCanvas(stage.body, stage.flatBot);
  const flatLeft = stage.addTileCanvas(stage.body, stage.flatLeft);
  const flatBoth = stage.addTileCanvas(stage.body, stage.flatBoth);
  const flatBothV = stage.addTileCanvas(stage.body, stage.flatBothV);
  const cornerOpposite = stage.addTileCanvas(stage.body, stage.corner1, stage.corner3);
  const tCorner = stage.addTileCanvas(stage.body, stage.flatTop, stage.corner4, stage.corner3);
  const fCorner = stage.addTileCanvas(stage.body, stage.flatTop, stage.corner4);
  const cornerBend = stage.addTileCanvas(stage.body, stage.outerCorner1, stage.corner3);
  const toolbar = stage.toolbar.appendTo($tools);
  toolbar.addButton(new IconButton(new DataAdapter('eraser').setTransparent(), 'fas fa-eraser'));
  toolbar.addButton(new IconButton(new DataAdapter('pen'), 'fas fa-pen'));
  toolbar.addButton(new IconButton(new DataAdapter('picker').configure({
    onAction: (data) => {
      if (!data.color) { return; }
      const pen = toolbar.getButton('pen');
      pen.action.setColor(data.color);
      toolbar.selectButton(pen);
    }
  }), 'fas fa-eye-dropper'));
  for (let i = 0 ; i < 8 ; i++) {
    toolbar.addButton(new ColorSwatch(new DataAdapter('color'+i)));
  }
  const tileset = new TileSetCanvas(14, 1, 2).appendTo($tileset);
  const terrainTiles = new TileSetCanvas(10, 5, 2).appendTo($terrain);
  tileset.addCanvas(0, 0, fullTile);
  tileset.addCanvas(1, 0, innerCorner1);
  tileset.addCanvas(2, 0, c2);
  tileset.addCanvas(3, 0, c3);
  tileset.addCanvas(4, 0, c4);
  tileset.addCanvas(5, 0, outerCorner);
  tileset.addCanvas(6, 0, cornerSide);
  tileset.addCanvas(7, 0, cornerAll);
  tileset.addCanvas(8, 0, flatTop);
  tileset.addCanvas(9, 0, flatBoth);
  tileset.addCanvas(10, 0, cornerOpposite);
  tileset.addCanvas(11, 0, tCorner);
  tileset.addCanvas(12, 0, fCorner);
  tileset.addCanvas(13, 0, cornerBend);
  terrainTiles.addCanvas(0, 0, outerCorner);
  terrainTiles.addCanvas(1, 0, flatTop);
  terrainTiles.addCanvas(2, 0, outerCorner2);
  terrainTiles.addCanvas(0, 1, flatLeft);
  terrainTiles.addCanvas(1, 1, fullTile);
  terrainTiles.addCanvas(2, 1, flatRight);
  terrainTiles.addCanvas(0, 2, outerCorner4);
  terrainTiles.addCanvas(1, 2, c2Bot);
  terrainTiles.addCanvas(2, 2, outerCorner3);
  terrainTiles.addCanvas(1, 3, flatBothV);
  terrainTiles.addCanvas(1, 4, cornerSideDown);
  terrainTiles.addCanvas(5, 0, innerCorner3);
  terrainTiles.addCanvas(6, 0, flatBot);
  terrainTiles.addCanvas(7, 0, innerCorner4);
  terrainTiles.addCanvas(7, 1, flatLeft);
  terrainTiles.addCanvas(5, 1, flatRight);
  terrainTiles.addCanvas(5, 2, innerCorner2);
  terrainTiles.addCanvas(6, 2, flatTop);
  terrainTiles.addCanvas(7, 2, innerCorner1);
  terrainTiles.addCanvas(5, 3, fullTile);
  terrainTiles.addCanvas(6, 3, fullTile);
  terrainTiles.addCanvas(7, 3, fullTile);
  stage.tilesets.push(tileset);
  stage.tilesets.push(terrainTiles);
  stage.start();

    $('#export').click(() => {
      new ImageExporter().canvasToPng(tileset.canvas, $('#exportResult').get(0));
    });

});
