/*jshint esversion: 9 */
class Layer {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.offset = {  x: 0, y: 0 };
    this.pix = [];
  }

  getValues() {
    return this.pix;
  }

  useOffSet(x, y) {
    this.offset.x = x;
    this.offset.y = y;
    return this;
  }

  getData(x, y, create = true) {
    let row = this.pix[x];
    if (!row) {
      if (!create) { return undefined; }
      row = this.pix[x] = [];
    }
    let data = row[y];
    if (!data) {
      if (!create) { return undefined; }
      data = row[y] = { };
    }
    return data;
  }

  setData(x, y, data) {
    let row = this.pix[x];
    if (!row) {
      row = this.pix[x] = [];
    }
    row[y] = data;
  }

  pixel(x, y, color) {
    this.getData(x, y).color = color;
  }

  transparent(x, y) {
    const data = this.getData(x, y);
    data.clear = true;
    delete data.color;
  }

  replace(pix, dimension) {
    const opts = { ... { x: 0, y: 0, w: this.width, h: this.height, dx: 0, dy: 0 }, ... dimension };
    const w = Math.min(pix.length, opts.x + opts.w);
    for(let i=opts.x; i< w; i++) {
      const row = pix[i];
      const h = Math.min(row.length, opts.y + opts.h);
      for(let j = opts.y; j < h; j++) {
        this.setData(i - opts.dx, j - opts.dy, row[j]);
      }
    }
  }


  mirrorXAxis(layer) {
    // if horizontal: from 0 to 15 == from 31 to 16
    // { x: 0, y: 0, }
    const mat = [];
    for(let i=0; i< this.width; i++) {
      mat[i] = [];
      for(let j=0;j<this.height / 2; j++) {
        mat[i][this.height-j-1] = mat[i][j] = this.getData(i, j, false);
      }
    }
    if (!layer) { layer = new Layer(this.width, this.height); }
    layer.pix = mat;
    return layer;
  }

  mirrorYAxis(layer) {
    // if horizontal: from 0 to 15 == from 31 to 16
    // { x: 0, y: 0, }
    const mat = [];
    for(let i=0; i< this.width / 2; i++) {
      mat[i] = [];
      mat[this.height-i-1] = [];
      for(let j=0;j<this.height; j++) {
        mat[this.height-i-1][j] = mat[i][j] = this.getData(i, j, false);
      }
    }
    if (!layer) { layer = new Layer(this.width, this.height); }
    layer.pix = mat;
    return layer;
  }

  flip(layer, horizontal) {

  }

  translate(x, y, layer) {
    if (!layer) { layer = new CopyLayer(this); }
    layer.useOffSet(x + layer.offset.x, y + layer.offset.y);
    return layer;
  }

  rotate(layer) {
    const mat = [];
    const N = this.width;
    for(let i=0; i< this.height; i++) {
      mat[i] = [];
      for(let j=0;j<this.width; j++) {
        mat[i][j] = this.getData(i, j, false);
      }
    }
    //const x = Math.floor(n/ 2);
    //const y = n - 1;
    if (!layer) { layer = new Layer(this.width, this.height); }
    // Consider all squares one by one
    for (var x = 0; x < N / 2; x++)
    {
        // Consider elements in group of 4 in
        // current square
        for (var y = x; y < N-x-1; y++)
        {
            // store current cell in temp variable
            const temp = mat[x][y];

            // move values from right to top
            mat[x][y] = mat[y][N-1-x];

            // move values from bottom to right
            mat[y][N-1-x] = mat[N-1-x][N-1-y];

            // move values from left to bottom
            mat[N-1-x][N-1-y] = mat[N-1-y][x];

            // assign temp to left
            mat[N-1-y][x] = temp;
        }
    }
    layer.pix = mat;
    return layer;
  }

}

class CopyLayer extends Layer {

  constructor(parent) {
    super(parent.width, parent.height);
    this.parent = parent;
  }

  getValues() {
    return this.parent.getValues();
  }

}

class RotationLayer extends Layer {
  constructor(parent) {
    super(parent.width, parent.height);
    this.parent = parent;
  }

  update() {
    this.parent.rotate(this);
  }
}

/**

class MirrorYLayer extends Layer {
  constructor(parent) {
    super(parent.width, parent.height);
    this.parent = parent;
  }

  update() {
    this.parent.mirrorYAxis(this);
  }
}

class MirrorXLayer extends Layer {
  constructor(parent) {
    super(parent.width, parent.height);
    this.parent = parent;
  }

  update() {
    this.parent.mirrorXAxis(this);
  }
} */
