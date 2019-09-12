/*jshint esversion: 6 */

class Toolbar extends JQ {
  constructor() {
    super();
    this.$element = $('<div class="toolbar"/>');
    this.buttons = [];
    this.selection = undefined;
    this.idMap = new Map();
  }

  selectButton(btn) {
    if (this.selection === btn) { return; }
    if (this.selection) {
      this.selection.setActive(false);
    }
    this.selection = btn;
    btn.setActive();
  }

  getButton(id) {
    return this.idMap.get(id);
  }

  addButton(btn) {
    this.idMap.set(btn.id, btn);
    if (!this.selection) {
      this.selectButton(btn);
    }
    btn.onSelect = () => {
      this.selectButton(btn);
    };
    btn.appendTo(this);
  }
}


class ToolbarButton extends JQ {
    constructor(action) {
      super();
      this.id = action.id;
      this.action = action;
      this.$element = $('<button class="btn btn-sm toolbarButton"/>').click(e => {
        this.select();
      }).attr('id', action.id);
    }

    setActive(state = true) {
      this.$element.toggleClass('active selected', state);
    }

    select() {
      if (this.onSelect) { this.onSelect(this); }
    }
}

class IconButton extends ToolbarButton {
  constructor(action, icon) {
    super(action);
    this.$element.addClass('btn-primary');
    $('<i></i>').addClass(icon).appendTo(this.$element);
  }
}

class ColorSwatch extends ToolbarButton {
  constructor(action, color = '#eee') {
    super(action);
    action.color = color;
    this.$colorPicker = this.$element.addClass('col-swatch').attr('id', action.id)
      .contextmenu(e => {
        e.preventDefault();
        this.$colorPicker.trigger('rightclick');
      })
      .css('backgroundColor', action.color).ColorPicker({
      eventName: 'rightclick',
    	color: action.color,
    	onChange: (hsb, hex, rgb) => {
        action.color = '#' + hex;
    		this.$colorPicker.css('backgroundColor', action.color);
    	}
    });
  }
}
