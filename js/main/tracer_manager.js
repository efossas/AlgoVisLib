function AVTracerManager(id,topMenu) {  
  this.id = '#' + id;
  this.timer = null;
  this.pause = false;
  this.capsules = [];
  this.interval = 500;
  
  this.topMenu = topMenu;

  this.add = function(tracer) {

    const $container = $('<section class="module_wrapper">');
    $(this.id + '-tab_module').append($container); /// .module_container must exist

    const capsule = {
      module: tracer.module,
      tracer,
      allocated: true,
      defaultName: null,
      $container,
      isNew: true
    };

    this.capsules.push(capsule);
    return capsule;
  };

  this.allocate = function(newTracer) {
    let selectedCapsule = null;
    let count = 0;

    $.each(this.capsules, (i, capsule) => {
      if (capsule.module === newTracer.module) {
        count++;
        if (!capsule.allocated) {
          capsule.tracer = newTracer;
          capsule.allocated = true;
          capsule.isNew = false;
          selectedCapsule = capsule;
          return false;
        }
      }
    });

    if (selectedCapsule === null) {
      count++;
      selectedCapsule = this.add(newTracer);
    }

    const className = newTracer.module.getClassName();
    selectedCapsule.defaultName = `${className} ${count}`;
    selectedCapsule.order = this.order++;
    return selectedCapsule;
  };

  this.deallocateAll = function() {
    this.order = 0;
    this.reset();
    $.each(this.capsules, (i, capsule) => {
      capsule.allocated = false;
    });
  };

  this.removeUnallocated = function() {
    let changed = false;

    this.capsules = $.grep(this.capsules, (capsule) => {
      let removed = !capsule.allocated;

      if (capsule.isNew || removed) {
        changed = true;
      }
      if (removed) {
        capsule.$container.remove();
      }

      return !removed;
    });

    if (changed) {
      this.place();
    }
  };

  this.place = function() {
    const {
      capsules
    } = this;

    $.each(capsules, (i, capsule) => {
      let width = 100;
      let height = (100 / capsules.length);
      let top = height * capsule.order;

      capsule.$container.css({
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`
      });

      capsule.tracer.resize();
    });
  };

  this.resize = function() {
    this.command('resize');
  },

  this.isPause = function() {
    return this.pause;
  };

  this.setInterval = function(interval) {
    this.topMenu.setInterval(interval);
  };

  this.reset = function() {
    this.traces = [];
    this.traceIndex = -1;
    this.stepCnt = 0;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.command('clear');
  };

  this.pushStep = function(capsule, step) {
    if (this.stepCnt++ > 1e6) throw "Tracer's stack overflow";
    let len = this.traces.length;
    if (len == 0) len += this.newStep();
    const last = this.traces[len - 1];
    last.push($.extend(step, {
      capsule
    }));
  };

  this.newStep = function(line = -1) {
    let len = this.traces.length;
    if (len > 0 && ~line) {
      this.traces[len - 1].push(line);
    }
    return this.traces.push([]);
  };

  this.pauseStep = function() {
    if (this.traceIndex < 0) return;
    this.pause = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.topMenu.activateBtnPause();
  };

  this.resumeStep = function() {
    this.pause = false;
    this.step(this.traceIndex + 1);
    this.topMenu.deactivateBtnPause();
  };

  this.step = function(i, options = {}) {
    const tracer = this;

    if (isNaN(i) || i >= this.traces.length || i < 0) return;

    this.traceIndex = i;
    const trace = this.traces[i];
    trace.forEach((step) => {
      if (typeof step === 'number') {
        // app.getEditor().highlightLine(step);
        return;
      }
      step.capsule.tracer.processStep(step, options);
    });

    if (!options.virtual) {
      this.command('refresh');
    }

    if (this.pause) return;

    this.timer = setTimeout(() => {
      if (!tracer.nextStep(options)) {
        this.topMenu.resetTopMenuButtons();
      }
    }, this.interval);
  };

  this.prevStep = function(options = {}) {
    this.command('clear');

    const finalIndex = this.traceIndex - 1;
    if (finalIndex < 0) {
      this.traceIndex = -1;
      this.command('refresh');
      return false;
    }

    for (let i = 0; i < finalIndex; i++) {
      this.step(i, $.extend(options, {
        virtual: true
      }));
    }

    this.step(finalIndex);
    return true;
  };

  this.nextStep = function(options = {}) {
    const finalIndex = this.traceIndex + 1;
    if (finalIndex >= this.traces.length) {
      this.traceIndex = this.traces.length - 1;
      return false;
    }

    this.step(finalIndex, options);
    return true;
  };

  this.visualize = function() {
    this.traceIndex = -1;
    this.resumeStep();
  },

  this.command = function(...args) {
    const functionName = args.shift();
    $.each(this.capsules, (i, capsule) => {
      if (capsule.allocated) {
        capsule.tracer.module.prototype[functionName].apply(capsule.tracer, args);
      }
    });
  };

  this.findOwner = function(container) {
    let selectedCapsule = null;
    $.each(this.capsules, (i, capsule) => {
      if (capsule.$container[0] === container) {
        selectedCapsule = capsule;
        return false;
      }
    });
    return selectedCapsule.tracer;
  };
};

