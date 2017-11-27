Alvi.LogTracer = class LogTracer extends Alvi.Tracer {
  static getClassName() {
    return 'LogTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
	  var tracer = this;
	  tracer.$wrapper = tracer.capsule.$wrapper = $('<div class="av-wrapper">');
      tracer.$container.append(tracer.$wrapper);
    }
  }

  _print(msg) {
    this.manager.pushStep(this.capsule, {
      type: 'print',
      msg: msg
    });
    return this;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'print':
        this.print(step.msg);
        break;
    }
  }

  refresh() {
    this.scrollToEnd(Math.min(50, this.interval));
  }

  clear() {
    super.clear();

    this.$wrapper.empty();
  }

  print(message) {
    this.$wrapper.append($('<span>').append(message + '<br/>'));
  }

  scrollToEnd(duration) {
    this.$container.animate({
      scrollTop: this.$container[0].scrollHeight
    }, duration);
  }
}

