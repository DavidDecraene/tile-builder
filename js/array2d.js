/*jshint esversion: 6 */

class Array2D {
   constructor(values) {
     this.values = values ? values : [];
   }

   getData(x, y, genData) {
     let row = this.values[x];
     if (!row) {
       if (!genData) { return undefined; }
       row = this.values[x] = [];
     }
     let data = row[y];
     if (!data) {
       if (!genData) { return undefined; }
       data = row[y] = genData();
     }
     return data;
   }

   setData(x, y, data) {
     let row = this.values[x];
     if (!row) {
       row = this.values[x] = [];
     }
     row[y] = data;
   }

   overwriteValues(arr) {
     if (arr instanceof Array2D) { arr = arr.values; }
     if (arr) { this.values = arr; }
     return this;
   }

   rotate(target = this) {
     //const x = Math.floor(n/ 2);
     //const y = n - 1;
     // Consider all squares one by one
     const h = this.values.length;

     for (var x = 0; x < h / 2; x++)
     {
         // Consider elements in group of 4 in
         // current square
         for (var y = x; y < h-x-1; y++)
         {
             // store current cell in temp variable
             const temp = this.getData(x, y);

             // move values from right to top
             target.setData(x, y, this.getData(y, h-1-x));

             // move values from bottom to right
             target.setData(y, h-1-x, this.getData(h-1-x, h-1-y));

             // move values from left to bottom
             target.setData(h-1-x, h-1-y, this.getData(h-1-y, x));

             // assign temp to left
             target.setData(h-1-y, x, temp);
         }
     }
     return target;
   }

   splice(dx = 0, dy = 0, w = 32, h = 32) {
     const result = new Array2D();
     const arr = this.values;
     const dw = Math.min(dx + w, arr.length);
     for(let x = dx; x < dw; x++) {
       const row = arr[x];
       const dh = Math.min(dy + h, row.length);
       for(let y = dy; y < dh; y++) {
         result.setData(x - dx, y - dy, row[y]);
       }
     }
     return result;
   }



   replace(pix) {
     if (pix instanceof Array2D) { pix = pix.values; }
     for(let i=0; i< pix.length; i++) {
       const row = pix[i];
       for(let j = 0; j < row.length; j++) {
         this.setData(i, j, row[j]);
       }
     }
   }

   slice(w, h) {
     const arr = this.values;
     const map = new Map();
     for(let x = 0; x < arr.length; x++) {
       const oldRow = arr[x];
       if (!oldRow) { continue; }
       const xCoord = Math.floor(x / w);
       for (let y = 0; y < oldRow.length; y++) {
         const oldCell = oldRow[y];
         if (oldCell === undefined) { continue; }
         const yCoord = Math.floor(y / h);
         const sCoord = xCoord + '_' + yCoord;
         let newArr = map.get(sCoord);
         if (!newArr) {
           newArr = { v : new Array2D(), x: xCoord, y: yCoord  };
           map.set(sCoord, newArr);
         }
         newArr.v.setData(x % w, y % h, oldCell);
       }
     }
     return Array.from(map.values()).sort((a, b) => {
       const r = a.x - b.x;
       if (r !== 0) { return r; }
       return a.y - b.y;
     }).map(av => av.v);
   }
 }
