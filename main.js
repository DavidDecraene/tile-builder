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
    this.updateableLayers = [];
    this.tilesets = [];
    this.colorSwatches = [];
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

  addUpdateableLayer(l) {
    this.updateableLayers.push(l);
    return l;
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

  addTileCanvas(... layers) {
    const canvas = new Canvas(2);
    layers.forEach(arg => canvas.addLayer(arg));
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
    this.updateableLayers.forEach(l => l.update());
  }

  drawAllCanvases() {
    this.drawCanvases.forEach(cv => {
      cv.draw()
    });
    this.tilesets.forEach(tileset => tileset.draw());
  }

  updateAllImages() {
    this.drawImages.forEach(cv => cv.update());
  }

}

function createSwatch($par, col){
  col.color = "#eee";
  const r = $('<div/>').appendTo($par);
  $('<input type="radio" name="toolOption">').attr('value', col.id).appendTo(r);
  const $sw = $('<div class="col-swatch"></div>').attr('id', col.id).appendTo(r)
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
  		$sw.css('backgroundColor', col.color);
  	}
  });

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
  stage.setFullTile(new Canvas(15, { id: 'full-tile', grid: true,  createElement: true }).appendTo($('#full-tile')).mainLayer(stage.body));
  stage.addCanvases(new Canvas(15, { id: 'corner', grid: true, w: 16, h: 16,  createElement: true }).appendTo($('#inner-corner-tile')).addLayer(stage.body).mainLayer(stage.corner1));
  stage.addCanvases(new Canvas(15, { id: 'outer-corner', grid: true, w: 16, h: 16,  createElement: true }).appendTo($('#outer-corner-tile')).addLayer(stage.body).mainLayer(stage.outerCorner1));
  stage.addCanvases(new Canvas(15, { id: 'flat-top', grid: true, w: 16, h: 16,  createElement: true }).appendTo($('#flat-top-tile')).addLayer(stage.body).mainLayer(stage.flatTop));
  const fullTile = stage.addTileCanvas(stage.fullTile.layers);
  const c1 = stage.addTileCanvas(stage.body, stage.corner1);
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

  stage.eraser.$element = $('#eraser');
  stage.colorSwatches.forEach(col => {
    createSwatch($tools, col);
  });
  const tileset = new TileSetCanvas(9, 5, 2).appendTo($tileset);
  const terrainTiles = new TileSetCanvas(9, 5, 2).appendTo($terrain);
  tileset.addCanvas(0, 0, fullTile);
  tileset.addCanvas(2, 0, c1);
  tileset.addCanvas(4, 0, c2);
  tileset.addCanvas(6, 0, c3);
  tileset.addCanvas(8, 0, c4);
  tileset.addCanvas(0, 2, outerCorner);
  tileset.addCanvas(2, 2, cornerSide);
  tileset.addCanvas(4, 2, cornerAll);
  tileset.addCanvas(6, 2, flatTop);
  tileset.addCanvas(8, 2, flatBoth);
  tileset.addCanvas(0, 4, cornerOpposite);
  tileset.addCanvas(2, 4, tCorner);
  tileset.addCanvas(4, 4, fCorner);
  tileset.addCanvas(6, 4, cornerBend);
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
  stage.tilesets.push(tileset);
  stage.tilesets.push(terrainTiles);
  stage.updateAllLayers();
  stage.drawAllCanvases();
  stage.updateAllImages();

    const iLoader = new ImageLoader({w: 32, h: 32}).appendTo($('body'));
    iLoader.onLoad = (results) => {
      console.log(results);
      stage.body.replace(new Array2D(results).values);
      stage.drawAllCanvases();
    };

    $('#export').click(() => {
      new ImageExporter().canvasToPng(tileset.canvas, $('#exportResult').get(0));
    });

});
