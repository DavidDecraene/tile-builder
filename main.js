/*jshint esversion: 6 */
// jshint ignore: start



class CanvasImage {
  constructor(canvas, $image) {
    this.canvas = canvas;
    this.$image = $image;
  }

  update (){
    this.canvas.toPng(this.$image.get(0));
  }
}

class DataAdapter {
  constructor(id) {
    this.id = id;
  }

  setTransparent() {
    this.clear = true;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }
}

class TileSetCanvas {
  constructor(w, h, scale = 1) {
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

  appendTo($el) {
    this.$element.appendTo($el);
    return this;
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
        console.log(cv);
        cv.draw();
      });
  }
}


class CanvasManager {


  constructor() {
    this.drawCanvases = [];
    this.drawImages = [];
    this.tileCanvases = [];
    this.actions= [];
    this.colorSwatches = [];
    this.body = new Layer(32, 32);
    this.corner1 = new Layer(32, 32);
    this.corner2 = new Layer(32, 32);
    this.corner3 = new Layer(32, 32);
    this.corner4 = new Layer(32, 32);
    this.flatTop = new Layer(32, 32);
    this.flatBoth = new Layer(32, 32);
    this.cornerTop = new Layer(32, 32);
    this.cornerSide = new Layer(32, 32);
    this.cornerAll = new Layer(32, 32);
    this.eraser = new DataAdapter('eraser').setTransparent();
    this.tool = this.eraser;
    for (let i = 0 ; i < 8 ; i++) {
      this.colorSwatches.push(new DataAdapter('color'+i));
    }

    $('body').keyup(e => {
      const event = e.originalEvent;
      if(event.shiftKey){
        if(event.key === 'Z'){
          this.undoAction();
          return;
        }
      }
    });
  }

  undoAction() {
    const action = this.actions.pop();
    if (action) {
      if (action.layer && action.x !== undefined && action.y !== undefined) {
        const data = action.layer.getData(action.x, action.y);
          console.log(action, 'pop', data);
        if(this.adaptData(data, action.original)) {
          console.log(data);
          this.drawAllCanvases();
        }
      }
    }
  }

  adaptData(data, action) {
    if (!data || !action) return;
    if (action.clear) {
      if (data.clear) return;
      const old = { ... data };
      data.clear = true;
      delete data.color;
      return { original: old };
    } else if(action.color) {
      if( data.color === action.color) return;
      const old = { ... data };
      data.color = action.color;
      delete data.clear;
      return { original: old };
    }

  }

  onEditChange(ev) {
    console.log('draw');
    if (ev) this.actions.push(ev);
    this.drawAllCanvases();
  }


  setFullTile(canvas) {
    this.fullTile = canvas;
    this.addCanvases(canvas);
    return canvas;
  }

  addTileCanvas(canvas) {
  //  this.addCanvases(canvas);
    this.tileCanvases.push(canvas);
    return canvas;
  }

  addCanvases(canvases) {
    if (!Array.isArray(canvases)) { canvases = [ canvases]; }
    canvases.forEach(cv => {
      cv.manager = this;
      this.drawCanvases.push(cv);
      if (cv.image) {
        this.drawImages.push(cv.image);
      }
    });
  }



  updateAllLayers() {
    this.corner1.rotate(this.corner2);
    this.corner2.rotate(this.corner3);
    this.corner3.rotate(this.corner4);
    this.cornerTop.mirrorXAxis(this.cornerSide);
    this.cornerSide.mirrorYAxis(this.cornerAll);
    this.flatTop.mirrorXAxis(this.flatBoth);
  }

  drawAllCanvases() {
    this.drawCanvases.forEach(cv => {
      cv.draw()
    });
    if (this.tileset) this.tileset.draw();
  }

  updateAllImages() {
    this.drawImages.forEach(cv => cv.update());
  }

}

function createSwatch($par, col){
  col.color = "#eee";
  const r = $('<div/>').appendTo($par);
  $('<input type="radio" name="toolOption">').attr('value', col.id).appendTo(r);
  $('<div class="col-swatch"></div>').attr('id', col.id).appendTo(r)
    .css('backgroundColor', col.color).ColorPicker({
  	color: col.color,
  	onShow: function (colpkr) {
  		//$(colpkr).fadeIn(500);
  	//	return false;
  	},
  	onHide: function (colpkr) {
  		$(colpkr).fadeOut(500);
  		return false;
  	},
  	onChange: function (hsb, hex, rgb) {
      col.color = '#' + hex;
  		col.$element.css('backgroundColor', col.color);
  	}
  });

}

$(document).ready(function() {
  const $stageBody = $('.stage-body');
  const $previews = $('.previews');
  const $tools = $('.tools');
  const $tileset = $('.images');
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
      stage.cornerTop.transparent(x, y);
      stage.flatTop.transparent(x, y);
      stage.cornerSide.transparent(x, y);
    }
  }
  for(let x = 0; x < 3; x++) {
    for (let y= 3; y < 32; y++) {
      stage.cornerTop.transparent(x, y);
      stage.cornerSide.transparent(x, y);
    }
  }
  [[3, 4], [3, 3], [4, 3]].forEach(pix => {
    stage.cornerTop.transparent(pix[0], pix[1]);
    stage.cornerSide.transparent(pix[0], pix[1]);
  });
  stage.setFullTile(new Canvas(15, { id: 'full-tile', grid: true }).appendTo($('#full-tile')).mainLayer(stage.body));
  stage.addCanvases(new Canvas(15, { id: 'corner', grid: true, w: 16, h: 16 }).appendTo($('#inner-corner-tile')).addLayer(stage.body).mainLayer(stage.corner1));
  stage.addCanvases(new Canvas(15, { id: 'outer-corner', grid: true, w: 16, h: 16 }).appendTo($('#outer-corner-tile')).addLayer(stage.body).mainLayer(stage.cornerTop));
  stage.addCanvases(new Canvas(15, { id: 'flat-top', grid: true, w: 16, h: 16 }).appendTo($('#flat-top-tile')).addLayer(stage.body).mainLayer(stage.flatTop));
  const fTile = stage.addTileCanvas(new Canvas(2).addLayer(stage.fullTile.layers));
  const c1 = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.corner1]));
  const c2 = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.corner1, stage.corner2]));
  const c3 = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.corner1, stage.corner2, stage.corner3]));
  const c4 = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.corner1, stage.corner2, stage.corner3, stage.corner4]));
  const outerCorner = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.cornerTop]));
  const cornerSide = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.cornerSide]));
  const cornerAll = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.cornerAll]));
  const flatTop = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.flatTop]));
  const flatBoth = stage.addTileCanvas(new Canvas(2).addLayer([stage.body, stage.flatBoth]));

  stage.eraser.$element = $('#eraser');
  stage.colorSwatches.forEach(col => {
    createSwatch($tools, col);
  });
  stage.updateAllLayers();
  stage.drawAllCanvases();
  stage.updateAllImages();
  const tileset = new TileSetCanvas(9, 9, 2).appendTo($tileset);
  tileset.addCanvas(0, 0, fTile);
  tileset.addCanvas(2, 0, c1);
  tileset.addCanvas(4, 0, c2);
  tileset.addCanvas(6, 0, c3);
  tileset.addCanvas(8, 0, c4);
  tileset.addCanvas(0, 2, outerCorner);
  tileset.addCanvas(2, 2, cornerSide);
  tileset.addCanvas(4, 2, cornerAll);
  tileset.addCanvas(6, 2, flatTop);
  tileset.addCanvas(8, 2, flatBoth);
  tileset.draw();
  stage.tileset = tileset;
});
