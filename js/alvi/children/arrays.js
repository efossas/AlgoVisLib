Alvi.Array2DTracer = class Array2DTracer extends Alvi.Tracer {
  static getClassName() {
    return 'Array2DTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
	  var tracer = this;
	  tracer.$table = tracer.capsule.$table = $('<div class="av-mtbl-table">');
      tracer.$container.append(tracer.$table);
    }
  }

  _notify(x, y, v) {
    this.manager.pushStep(this.capsule, {
      type: 'notify',
      x: x,
      y: y,
      v: v
    });
    return this;
  }

  _denotify(x, y) {
    this.manager.pushStep(this.capsule, {
      type: 'denotify',
      x: x,
      y: y
    });
    return this;
  }

  _select(sx, sy, ex, ey) {
    this.pushSelectingStep('select', null, arguments);
    return this;
  }

  _selectRow(x, sy, ey) {
    this.pushSelectingStep('select', 'row', arguments);
    return this;
  }

  _selectCol(y, sx, ex) {
    this.pushSelectingStep('select', 'col', arguments);
    return this;
  }

  _deselect(sx, sy, ex, ey) {
    this.pushSelectingStep('deselect', null, arguments);
    return this;
  }

  _deselectRow(x, sy, ey) {
    this.pushSelectingStep('deselect', 'row', arguments);
    return this;
  }

  _deselectCol(y, sx, ex) {
    this.pushSelectingStep('deselect', 'col', arguments);
    return this;
  }

  _separate(x, y) {
    this.manager.pushStep(this.capsule, {
      type: 'separate',
      x: x,
      y: y
    });
    return this;
  }

  _separateRow(x) {
    this._separate(x, -1);
    return this;
  }

  _separateCol(y) {
    this._separate(-1, y);
    return this;
  }

  _deseparate(x, y) {
    this.manager.pushStep(this.capsule, {
      type: 'deseparate',
      x: x,
      y: y
    });
    return this;
  }

  _deseparateRow(x) {
    this._deseparate(x, -1);
    return this;
  }

  _deseparateCol(y) {
    this._deseparate(-1, y);
    return this;
  }

  pushSelectingStep() {
    var args = Array.prototype.slice.call(arguments);
    var type = args.shift();
    var mode = args.shift();
    args = Array.prototype.slice.call(args.shift());
    var coord;
    switch (mode) {
      case 'row':
        coord = {
          x: args[0],
          sy: args[1],
          ey: args[2]
        };
        break;
      case 'col':
        coord = {
          y: args[0],
          sx: args[1],
          ex: args[2]
        };
        break;
      default:
        if (args[2] === undefined && args[3] === undefined) {
          coord = {
            x: args[0],
            y: args[1]
          };
        } else {
          coord = {
            sx: args[0],
            sy: args[1],
            ex: args[2],
            ey: args[3]
          };
        }
    }
    var step = {
      type: type
    };
    $.extend(step, coord);
    this.manager.pushStep(this.capsule, step);
  }

  processStep(step, options) {
    switch (step.type) {
      case 'notify':
        if (step.v !== undefined) {
          var $row = this.$table.find('.av-mtbl-row').eq(step.x);
          var $col = $row.find('.av-mtbl-col').eq(step.y);
          $col.text(AVTracerManagerUtil.refineByType(step.v));
        }
      case 'denotify':
      case 'select':
      case 'deselect':
        var color = step.type == 'select' || step.type == 'deselect' ? this.color.selected : this.color.notified;
        var paint = step.type == 'select' || step.type == 'notify';
        var sx = step.sx;
        var sy = step.sy;
        var ex = step.ex;
        var ey = step.ey;
        if (sx === undefined) sx = step.x;
        if (sy === undefined) sy = step.y;
        if (ex === undefined) ex = step.x;
        if (ey === undefined) ey = step.y;
        this.paintColor(sx, sy, ex, ey, color, paint);
        break;
      case 'separate':
        this.deseparate(step.x, step.y);
        this.separate(step.x, step.y);
        break;
      case 'deseparate':
        this.deseparate(step.x, step.y);
        break;
      default:
        super.processStep(step, options);
    }
  }

  setData(D) {
    this.viewX = this.viewY = 0;
    this.paddingH = 6;
    this.paddingV = 3;
    this.fontSize = 16;

    if (super.setData.apply(this, arguments)) {
      this.$table.find('.av-mtbl-row').each(function (i) {
        $(this).find('.av-mtbl-col').each(function (j) {
          $(this).text(AVTracerManagerUtil.refineByType(D[i][j]));
        });
      });
      return true;
    }

    this.$table.empty();
    for (var i = 0; i < D.length; i++) {
      var $row = $('<div class="av-mtbl-row">');
      this.$table.append($row);
      for (var j = 0; j < D[i].length; j++) {
        var $col = $('<div class="av-mtbl-col">')
          .css(this.getCellCss())
          .text(AVTracerManagerUtil.refineByType(D[i][j]));
        $row.append($col);
      }
    }
    this.resize();

    return false;
  }

  resize() {
    super.resize();

    this.refresh();
  }

  clear() {
    super.clear();

    this.clearColor();
    this.deseparateAll();
  }

  getCellCss() {
    return {
      padding: this.paddingV.toFixed(1) + 'px ' + this.paddingH.toFixed(1) + 'px',
      'font-size': this.fontSize.toFixed(1) + 'px'
    };
  }

  refresh() {
    super.refresh();

    var $parent = this.$table.parent();
    var top = $parent.height() / 2 - this.$table.height() / 2 + this.viewY;
    var left = $parent.width() / 2 - this.$table.width() / 2 + this.viewX;
    this.$table.css('margin-top', top);
    this.$table.css('margin-left', left);
  }

  mousedown(e) {
    super.mousedown(e);

    this.dragX = e.pageX;
    this.dragY = e.pageY;
    this.dragging = true;
  }

  mousemove(e) {
    super.mousemove(e);

    if (this.dragging) {
      this.viewX += e.pageX - this.dragX;
      this.viewY += e.pageY - this.dragY;
      this.dragX = e.pageX;
      this.dragY = e.pageY;
      this.refresh();
    }
  }

  mouseup(e) {
    super.mouseup(e);

    this.dragging = false;
  }

  mousewheel(e) {
    super.mousewheel(e);

    e.preventDefault();
    e = e.originalEvent;
    var delta = (e.wheelDelta !== undefined && e.wheelDelta) ||
      (e.detail !== undefined && -e.detail);
    var weight = 1.01;
    var ratio = delta > 0 ? 1 / weight : weight;
    if (this.fontSize < 4 && ratio < 1) return;
    if (this.fontSize > 40 && ratio > 1) return;
    this.paddingV *= ratio;
    this.paddingH *= ratio;
    this.fontSize *= ratio;
    this.$table.find('.mtbl-col').css(this.getCellCss());
    this.refresh();
  }

  paintColor(sx, sy, ex, ey, color, paint) {
    for (var i = sx; i <= ex; i++) {
      var $row = this.$table.find('.av-mtbl-row').eq(i);
      for (var j = sy; j <= ey; j++) {
        var $col = $row.find('.av-mtbl-col').eq(j);
        if (paint) $col.css('background', color);
        else $col.css('background', '');
      }
    }
  }

  clearColor() {
    this.$table.find('.av-mtbl-col').css('background', '');
  }

  separate(x, y) {
    this.$table.find('.av-mtbl-row').each(function (i) {
      var $row = $(this);
      if (i == x) {
        $row.after($('<div class="av-mtbl-empty-row">').attr('data-row', i))
      }
      $row.find('.av-mtbl-col').each(function (j) {
        var $col = $(this);
        if (j == y) {
          $col.after($('<div class="av-mtbl-empty-col">').attr('data-col', j));
        }
      });
    });
  }

  deseparate(x, y) {
    this.$table.find('[data-row=' + x + ']').remove();
    this.$table.find('[data-col=' + y + ']').remove();
  }

  deseparateAll() {
    this.$table.find('.av-mtbl-empty-row, .av-mtbl-empty-col').remove();
  }
}

Alvi.Array1DTracer = class Array1DTracer extends Alvi.Array2DTracer {
  static getClassName() {
    return 'Array1DTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);
  }

  _notify(idx, v) {
    super._notify(0, idx, v);
    return this;
  }

  _denotify(idx) {
    super._denotify(0, idx);
    return this;
  }

  _select(s, e) {
    if (e === undefined) {
      super._select(0, s);
    } else {
      super._selectRow(0, s, e);
    }
    return this;
  }

  _deselect(s, e) {
    if (e === undefined) {
      super._deselect(0, s);
    } else {
      super._deselectRow(0, s, e);
    }
    return this;
  }

  processStep(step, options) {
    super.processStep(step, options);
    if (this.chartTracer) {
      const newStep = $.extend(true, {}, step);
      newStep.capsule = this.chartTracer.capsule;
      newStep.s = newStep.sy;
      newStep.e = newStep.ey;
      if (newStep.s === undefined) newStep.s = newStep.y;
      delete newStep.x;
      delete newStep.y;
      delete newStep.sx;
      delete newStep.sy;
      delete newStep.ex;
      delete newStep.ey;
      this.chartTracer.processStep(newStep, options);
    }
  }

  setData(D) {
    return super.setData([D]);
  }
}
