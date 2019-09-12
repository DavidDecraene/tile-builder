/*jshint esversion: 6 */
class JQ {
    appendTo($element) {
      if ($element instanceof JQ) {
        $element = $element.$element;
      }
      this.$element.appendTo($element);
      return this;
    }

    append($element) {
      if ($element instanceof JQ) {
        $element = $element.$element;
      }
      this.$element.append($element);
      return this;
    }
  }



class DataAdapter {
  constructor(id) {
    this.id = id;
  }

  configure(options) {
    if (options.clear) {
      this.setTransparent();
    } else if(options.color) {
      this.setColor(options.color);
    } else if(options.onAction) {
      this.onAction = options.onAction;
    }
    return this;
  }

  setTransparent() {
    this.clear = true;
    this.color = undefined;
    return this;
  }

  setColor(color) {
    this.color = color;
    this.clear = false;
    return this;
  }

  doAction(data) {
    if (this.clear) {
      if (data.clear) return;
      const old = { ... data };
      data.clear = true;
      delete data.color;
      return { original: old, type: 'clear', undo : true };
    } else if(this.color) {
      if( data.color === this.color) return;
      const old = { ... data };
      data.color = this.color;
      delete data.clear;
      return { original: old, type: 'color', undo : true };
    }
    if (this.onAction) {
      return this.onAction(data);
    }
    return undefined;
  }
}
