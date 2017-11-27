Alvi.Tracer = class Tracer {
  static getClassName() {
    return 'Tracer';
  }

  constructor(name,tracerManager) {
    this.module = this.constructor;

    this.color = {
      selected: '#2962ff',
      notified: '#f50057',
      visited: '#f50057',
      left: '#616161',
      default: '#bdbdbd'
    };

    this.manager = tracerManager;
    this.capsule = this.manager.allocate(this);
    $.extend(this, this.capsule);

    this.setName(name);
  }

  _setData(...args) {
    this.manager.pushStep(this.capsule, {
      type: 'setData',
      args: AVTracerManagerUtil.toJSON(args)
    });
    return this;
  }

  _clear() {
    this.manager.pushStep(this.capsule, {
      type: 'clear'
    });
    return this;
  }

  _wait(line) {
    this.manager.newStep(line);
    return this;
  }

  processStep(step, options) {
    const {
      type,
      args
    } = step;

    switch (type) {
      case 'setData':
        this.setData(...AVTracerManagerUtil.fromJSON(args));
        break;
      case 'clear':
        this.clear();
        break;
    }
  }

  setName(name) {
    // removed this
  }

  setData() {
    const data = AVTracerManagerUtil.toJSON(arguments);
    if (!this.isNew && this.lastData === data) {
      return true;
    }
    this.lastData = this.capsule.lastData = data;
    return false;
  }

  resize() {
  }

  refresh() {
  }

  clear() {
  }

  attach(tracer) {
    switch (tracer.module) {
      case Alvi.LogTracer:
        this.logTracer = tracer;
        break;
      case Alvi.ChartTracer:
        this.chartTracer = tracer;
        break;
    }
    return this;
  }

  palette(color) {
    $.extend(this.color, color);
    return this;
  }

  mousedown(e) {
  }

  mousemove(e) {
  }

  mouseup(e) {
  }

  mousewheel(e) {
  }
}

