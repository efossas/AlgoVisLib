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
      eval(Babel.transform(newLines.join('\n'), {presets: ['es2015']}).code);
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

