/*jshint esversion: 6 */
class Layer {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.pix = [];
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

  rotate(layer) {
    const mat = [];
    const N = this.height;
    for(let i=0; i< this.width; i++) {
      mat[i] = [];
      for(let j=0;j<this.height; j++) {
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
