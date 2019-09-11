/*jshint esversion: 6 */
class JQ {
    appendTo($element) {
      $element.append(this.$element);
      return this;
    }

    append($element) {
      this.$element.append($element);
      return this;
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
