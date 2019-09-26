/*jshint esversion: 6 */
class FileChooser extends JQ {
    constructor(name = 'File') {
      super();
      this.mimeTypes = [
        'image/jpeg',
        'image/tiff',
        'image/gif',
        'image/png',
        'image/bmp',
        'image/svg+xml',
      'image/vnd.microsoft.icon'];
      this.$element = $('<div class="input-file"></div>');
      this.$button = $('<button class="btn btn-sm btn-primary"></button>').text(name)
        .appendTo(this.$element)
        .click(() => this.selectFile());
      this.$input = $('<input type="file" style="visibility: hidden;height: 0;width: 0" class="input-ghost"/>')
        .appendTo(this.$element)
        .change(f => {
          const files = f.target.files;
          if (files && files.length) {
            const file = files[0];
            if (!file || !file.type) { return; }

            if (this.mimeTypes) {
              if (! this.mimeTypes.find(t => t === file.type)) {
                return;
              }
            }
            // this.onFileInfo.emit(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                if (this.onLoad) { this.onLoad(reader.result); }
                if (this.$preview) this.$preview.get(0).src = base64;
            };
            reader.readAsDataURL(file);
          }
        });
    }

    selectFile() {
      this.$input.click();
    }
  }
