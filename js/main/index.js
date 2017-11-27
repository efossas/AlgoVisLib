function AlgoVisualizer(id) {
  var topMenu = new AVTopMenu(id);
  var tracerManager = new AVTracerManager(id,topMenu);
  var editor = new AVEditor(tracerManager,topMenu);

  AVDom(id,tracerManager,editor,topMenu); // initialize DOM by id

  this.state = {
	id: id,
    isLoading: false,
    editor: editor,
    tracerManager: tracerManager,
    categories: {},
    loadedScratch: null,
    wikiList: []
  }

  this.getIsLoading = () => {
    return state.isLoading;
  };

  this.setIsLoading = (loading) => {
    state.isLoading = loading;
  };

  this.getEditor = () => {
    return state.editor;
  };

  this.getCategories = () => {
    return state.categories;
  };

  this.getCategory = (name) => {
    return state.categories[name];
  };

  this.setCategories = (categories) => {
    state.categories = categories;
  };

  this.updateCategory = (name, updates) => {
    $.extend(state.categories[name], updates);
  };

  this.getTracerManager = () => {
    return state.tracerManager;
  };

  this.getLoadedScratch = () => {
    return state.loadedScratch;
  };

  this.setLoadedScratch = (loadedScratch) => {
    state.loadedScratch = loadedScratch;
  };

  this.getWikiList = () => {
    return state.wikiList;
  };

  this.setWikiList = (wikiList) => {
    state.wikiList = wikiList;
  };

  this.hasWiki = (wiki) => {
    return ~state.wikiList.indexOf(wiki);
  };

};

function AVDom(id,tracerManager,editor,topMenu) {
  var domid = '#' + id;
    
  $('.av-btn input').click((e) => {
    e.stopPropagation();
  });

  $(document).mouseup(function (e) {
    tracerManager.command('mouseup', e);
  });
  
  const minInterval = 0.1;
  const maxInterval = 10;
  const startInterval = 0.5;
  const stepInterval = 0.1;
  
  const $interval = $(domid + '-interval');
  $interval.val(startInterval);
  $interval.attr({
    max: maxInterval,
    min: minInterval,
    step: stepInterval
  });
  
  const normalize = (sec) => {
    let interval;
    let message;
    if (sec < minInterval) {
      interval = minInterval;
      message = `Interval of ${sec} seconds is too low. Setting to min allowed interval of ${minInterval} second(s).`;
    } else if (sec > maxInterval) {
      interval = maxInterval;
      message = `Interval of ${sec} seconds is too high. Setting to max allowed interval of ${maxInterval} second(s).`;
    } else {
      interval = sec;
      message = `Interval has been set to ${sec} second(s).`
    }

    return [interval, message];
  };

  $(domid + '-interval').on('change', function() {
    const [seconds, message] = normalize(Number.parseFloat($(this).val()));

    $(this).val(seconds);
    tracerManager.interval = seconds * 1000;
    console.log(message);
  });
  
  const $module_container = $(domid + '-tab_module');

  $module_container.on('mousedown', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousedown(e);
  });

  $module_container.on('mousemove', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousemove(e);
  });

  $module_container.on('DOMMouseScroll mousewheel', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousewheel(e);
  });
  
  const $btnRun = $(domid + '-btn_run');
  const $btnPause = $(domid + '-btn_pause');
  const $btnPrev = $(domid + '-btn_prev');
  const $btnNext = $(domid + '-btn_next');
  
  topMenu.disableFlowControl();
  
  $btnRun.click(() => {
    $btnPause.removeClass('av-active');
    $btnRun.addClass('av-active');
    topMenu.enableFlowControl();
    var err = editor.execute();
    if (err) {
      console.error(err);
      topMenu.resetTopMenuButtons();
    }
  });

  $btnPause.click(() => {
    $btnRun.toggleClass('av-active');
    $btnPause.toggleClass('av-active');
    if (tracerManager.isPause()) {
      tracerManager.resumeStep();
    } else {
      tracerManager.pauseStep();
    }
  });

  $btnPrev.click(() => {
    $btnRun.removeClass('av-active');
    $btnPause.addClass('av-active');
    tracerManager.pauseStep();
    tracerManager.prevStep();
  });

  $btnNext.click(() => {
    $btnRun.removeClass('av-active');
    $btnPause.addClass('av-active');
    tracerManager.pauseStep();
    tracerManager.nextStep();
  });
  
  $(window).resize(function() {
    tracerManager.resize();
  });
}

function AVEditor(tracerManager,topMenu) {
  if (!tracerManager || ! topMenu) {
    throw 'Cannot create Editor. Missing the tracerManager or topMenu';
  }
  
  this.tracerManager = tracerManager;
  this.topMenu = topMenu;

  ace.require('ace/ext/language_tools');
  const Range = ace.require("ace/range").Range;

  this.createEditor = (id) => {
    const editor = ace.edit(id);

    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });

    editor.setTheme('ace/theme/tomorrow_night_eighties');
    editor.session.setMode('ace/mode/javascript');
    editor.$blockScrolling = Infinity;

    return editor;
  };
  
  this.codeEditor = this.createEditor('code');

  // Setting data

  this.setCode = (code) => {
    this.codeEditor.setValue(code, -1);
  };

  this.setContent = (({
    code
  }) => {
    this.setCode(code);
  });

  // Clearing data

  this.clearCode = () => {
    this.codeEditor.setValue('');
  };

  this.clearContent = () => {
    this.clearCode();
  };

  this.execute = () => {
    const data = '';
    const code = this.codeEditor.getValue();
    return this.executeDataAndCode(this.tracerManager, data, code);
  };

  this.highlightLine = (lineNumber) => {
    const session = this.codeEditor.getSession();
    if (this.marker) session.removeMarker(this.marker);
    this.marker = session.addMarker(new Range(lineNumber, 0, lineNumber, Infinity), "executing", "line", true);
  };

  this.unhighlightLine = () => {
    const session = this.codeEditor.getSession();
    if (this.marker) session.removeMarker(this.marker);
  };

  this.resize = () => {
    this.codeEditor.resize();
  };
  
  // executor
  
  this.executeWithArgs = (tracerManager, code, dataLines) => {
    // all modules available to eval are obtained from window
    try {
      tracerManager.deallocateAll();
      const lines = code.split('\n');
      const newLines = [];
      lines.forEach((line, i) => {
        newLines.push(line.replace(/(.+\. *_wait *)(\( *\))/g, `$1(${i - dataLines})`));
      });
      eval(newLines.join('\n')); // removed Babel
      tracerManager.visualize();
    } catch (err) {
      return err;
    } finally {
      tracerManager.removeUnallocated();
    } 
  };

  this.executeDataAndCode = (tracerManager, algoData, algoCode) => {
    const dataLines = algoData.split('\n').length;
    return this.executeWithArgs(tracerManager, `${algoData}\n${algoCode}`, dataLines);
  };

  // listeners

  this.codeEditor.on('change', () => {
    const code = this.codeEditor.getValue();
    this.tracerManager.reset();
    this.topMenu.resetTopMenuButtons();
    this.unhighlightLine();
  });
}

function AVTopMenu(id) {
	this.id = '#' + id;
	
	const flowControlBtns = [ $(this.id + '-btn_pause'), $(this.id + '-btn_prev'), $(this.id + '-btn_next') ];
	const setFlowControlState = (isDisabled) => {
	  flowControlBtns.forEach($btn => $btn.attr('disabled', isDisabled));
	};
	
	this.enableFlowControl = () => {
	  setFlowControlState(false);
	};
	
	this.disableFlowControl = () => {
	  setFlowControlState(true);
	};
	
	this.resetTopMenuButtons = () => {
	  $(this.id + '-top-menu-buttons button').removeClass('av-active');
	  this.disableFlowControl();
	  // removed: editor.unhighlightLine();
	};
	
	this.setInterval = (val) => {
	  $(this.id + '-interval').val(interval);
	};
	
	this.activateBtnPause = () => {
	  $(this.id + '-btn_pause').addClass('av-active');
	};
	
	this.deactivateBtnPause = () => {
	  $(this.id + '-btn_pause').removeClass('av-active');
	};
}

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

var AVTracerManagerUtil = {
  refineByType: (item) => {
    switch (typeof(item)) {
      case 'number':
        return item === Infinity ? '∞' : item;
      case 'boolean':
        return item ? 'T' : 'F';
      default:
        return item === '' ? ' ' : item;
    }
  },
  fromJSON: (obj) => {
    return JSON.parse(obj, (key, value) => {
      return value === 'Infinity' ? Infinity : value;
    });
  },
  toJSON: (obj) => {
    return JSON.stringify(obj, (key, value) => {
      return value === Infinity ? 'Infinity' : value;
    });
  }
}

