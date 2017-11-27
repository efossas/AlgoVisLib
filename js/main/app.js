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

