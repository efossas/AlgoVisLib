/*
    Dependencies:
    
    // jQuery -> $	
    // used for general coding
	<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>

    // Ace Editor -> ace
    // used for the code editor
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js"></script>
    
    // Ace Editor Language Tools
    // used for the code editor
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ext-language_tools.js"></script>
    
    // Babel -> Babel	
    // used to convert user code to ecmascript5
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js"></script>
    
    // Sigmajs -> sigma
    // used for Graph tracers
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sigma.js/1.2.1/sigma.min.js"></script>

    // Sigmajs -> sigma
    // used to extend Graph tracers
    <script src="https://cdn.rawgit.com/jacomyal/sigma.js/master/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes.js"></script>
    
    // Chartjs -> Chart
    // used for Chart tracers
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js"></script>	
*/

/*
	Function Constructors:
	
		AlgoVisualizer - The Main App, it creates one of the following:
			AVTopMenu
			AVEditor
			AVDOM
			AVTracerManager
			
		AVTracerManagerUtil - This is created & used by each Tracer
	
	Alvi:
	
		Tracer
			Array2DTracer
			Array1DTracer
			Chart Tracer
			DirectedGraphConstructTracer
			DirectedGraphTracer
			CoordinateSystemTracer
			UndirectedGraphTracer
			WeightedDirectedGraphTracer
			WeightedUndirectedGraphTracer
		
		Integer
		Array1D
		Array2D
		CoordinateSystems
		DirectedGraph
		UndirectedGraph
		WeightedDirectedGraph
		WeightedUndirectedGraph
*/

'use strict';

var Alvi = {};

Alvi.Integer = {
  random: (min, max) => {
    return (Math.random() * (max - min + 1) | 0) + min;
  }	
};

Alvi.Array2D = {
  random: (N, M, min, max) => {
    if (!N) N = 10;
    if (!M) M = 10;
    if (min === undefined) min = 1;
    if (max === undefined) max = 9;
    var D = [];
    for (var i = 0; i < N; i++) {
      D.push([]);
      for (var j = 0; j < M; j++) {
        D[i].push(Alvi.Integer.random(min, max));
      }
    }
    return D;
  },
  randomSorted: (N, M, min, max) => {
    return random(N, M, min, max).map(function (arr) {
      return arr.sort(function (a, b) {
        return a - b;
      });
    });
  }
};

Alvi.Array1D = {
  random: (N, min, max) => {
    return Array2D.random(1, N, min, max)[0];
  },
  randomSorted: (N, min, max)=> {
    return Array2D.randomSorted(1, N, min, max)[0];
  }
};

Alvi.CoordinateSystems = {
  random: (N, min, max) => {
    if (!N) N = 7;
    if (!min) min = 1;
    if (!max) max = 10;
    var C = new Array(N);
    for (var i = 0; i < N; i++) C[i] = new Array(2);
    for (var i = 0; i < N; i++)
      for (var j = 0; j < C[i].length; j++)
        C[i][j] = Alvi.Integer.random(min, max);
    return C;
  }
};

Alvi.DirectedGraph = {
  random: (N, ratio) => {
    if (!N) N = 5;
    if (!ratio) ratio = .3;
    var G = new Array(N);
    for (var i = 0; i < N; i++) {
      G[i] = new Array(N);
      for (var j = 0; j < N; j++) {
        if (i != j) {
          G[i][j] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
        }
      }
    }
    return G;
  }
};

Alvi.UndirectedGraph = {
  random: (N, ratio) => {
    if (!N) N = 5;
    if (!ratio) ratio = .3;
    var G = new Array(N);
    for (var i = 0; i < N; i++) G[i] = new Array(N);
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        if (i > j) {
          G[i][j] = G[j][i] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
        }
      }
    }
    return G;
  }
};

Alvi.WeightedDirectedGraph = {
  random: (N, ratio, min, max) => {
    if (!N) N = 5;
    if (!ratio) ratio = .3;
    if (!min) min = 1;
    if (!max) max = 5;
    var G = new Array(N);
    for (var i = 0; i < N; i++) {
      G[i] = new Array(N);
      for (var j = 0; j < N; j++) {
        if (i != j && (Math.random() * (1 / ratio) | 0) == 0) {
          G[i][j] = Alvi.Integer.random(min, max);
        }
      }
    }
    return G;
  }
};

Alvi.WeightedDirectedGraph = {
  random: (N, ratio, min, max) => {
    if (!N) N = 5;
    if (!ratio) ratio = .3;
    if (!min) min = 1;
    if (!max) max = 5;
    var G = new Array(N);
    for (var i = 0; i < N; i++) G[i] = new Array(N);
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        if (i > j && (Math.random() * (1 / ratio) | 0) == 0) {
          G[i][j] = G[j][i] = Alvi.Integer.random(min, max);
        }
      }
    }
    return G;
  }
};

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
Alvi.ChartTracer = class ChartTracer extends Alvi.Tracer {
  static getClassName() {
    return 'ChartTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
      var tracer = this;
      tracer.$wrapper = tracer.capsule.$wrapper = $('<canvas class="av-mchrt-chart">');
      tracer.$container.append(tracer.$wrapper);
      tracer.chart = tracer.capsule.chart = new Chart(tracer.$wrapper, {
        type: 'bar',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          animation: false,
          legend: false,
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  setData(C) {
    if (super.setData.apply(this, arguments)) {
      this.chart.config.data.datasets[0].data = C;
      this.chart.update();
      return true;
    }

    var color = [];
    for (var i = 0; i < C.length; i++) color.push(this.color.default);
    this.chart.config.data = {
      labels: C.map(String),
      datasets: [{
        backgroundColor: color,
        data: C
      }]
    };
    this.chart.update();
  }

  _notify(s, v) {
    this.manager.pushStep(this.capsule, {
      type: 'notify',
      s: s,
      v: v
    });
    return this;
  }

  _denotify(s) {
    this.manager.pushStep(this.capsule, {
      type: 'denotify',
      s: s
    });
    return this;
  }

  _select(s, e) {
    this.manager.pushStep(this.capsule, {
      type: 'select',
      s: s,
      e: e
    });
    return this;
  }

  _deselect(s, e) {
    this.manager.pushStep(this.capsule, {
      type: 'deselect',
      s: s,
      e: e
    });
    return this;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'notify':
        if (step.v !== undefined) {
          this.chart.config.data.datasets[0].data[step.s] = step.v;
          this.chart.config.data.labels[step.s] = step.v.toString();
        }
      case 'denotify':
      case 'select':
      case 'deselect':
        let color = step.type == 'notify' ? this.color.notified : step.type == 'select' ? this.color.selected : this.color.default;
        if (step.e !== undefined)
          for (var i = step.s; i <= step.e; i++)
            this.chart.config.data.datasets[0].backgroundColor[i] = color;
        else
          this.chart.config.data.datasets[0].backgroundColor[step.s] = color;
        this.chart.update();
        break;
      default:
        super.processStep(step, options);
    }
  }

  resize() {
    super.resize();

    this.chart.resize();
  }

  clear() {
    super.clear();

    const data = this.chart.config.data;
    if (data.datasets.length) {
      const backgroundColor = data.datasets[0].backgroundColor;
      for (let i = 0; i < backgroundColor.length; i++) {
        backgroundColor[i] = this.color.default;
      }
      this.chart.update();
    }
  }
}

Alvi.DirectedGraphTracer = class DirectedGraphTracer extends Alvi.Tracer {
  static getClassName() {
    return 'DirectedGraphTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
	  var tracer = this;
	  tracer.s = tracer.capsule.s = new sigma({
	    renderer: {
	      container: tracer.$container[0],
	      type: 'canvas'
	    },
	    settings: {
	      minArrowSize: 8,
	      defaultEdgeType: 'arrow',
	      maxEdgeSize: 2.5,
	      labelThreshold: 4,
	      font: 'Roboto',
	      defaultLabelColor: '#fff',
	      zoomMin: 0.6,
	      zoomMax: 1.2,
	      skipErrors: true,
	      minNodeSize: .5,
	      maxNodeSize: 12,
	      labelSize: 'proportional',
	      labelSizeRatio: 1.3,
	      funcLabelsDef(node, context, settings) {
	        tracer.drawLabel(node, context, settings);
	      },
	      funcHoversDef(node, context, settings, next) {
	        tracer.drawOnHover(node, context, settings, next);
	      },
	      funcEdgesArrow(edge, source, target, context, settings) {
	        var color = tracer.getColor(edge, source, target, settings);
	        tracer.drawArrow(edge, source, target, color, context, settings);
	      }
	    }
	  });
	  sigma.plugins.dragNodes(tracer.s, tracer.s.renderers[0]);
	  tracer.graph = tracer.capsule.graph = tracer.s.graph;
	}
  }

  _setTreeData(G, root) {
    this.manager.pushStep(this.capsule, {
      type: 'setTreeData',
      arguments: arguments
    });
    return this;
  }

  _visit(target, source) {
    this.manager.pushStep(this.capsule, {
      type: 'visit',
      target: target,
      source: source
    });
    return this;
  }

  _leave(target, source) {
    this.manager.pushStep(this.capsule, {
      type: 'leave',
      target: target,
      source: source
    });
    return this;
  }

  _setNodePositions(positions) {
    this.manager.pushStep(this.capsule, {
      type: 'setNodePositions',
      positions: positions
    });
    return this;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'setTreeData':
        this.setTreeData.apply(this, step.arguments);
        break;
      case 'setNodePositions':
        $.each(this.graph.nodes(), (i, node) => {
          if (i >= step.positions.length) return false;
          const position = step.positions[i];
          node.x = position.x;
          node.y = position.y;
        });
        break;
      case 'visit':
      case 'leave':
        var visit = step.type == 'visit';
        var targetNode = this.graph.nodes(this.n(step.target));
        var color = visit ? this.color.visited : this.color.left;
        targetNode.color = color;
        if (step.source !== undefined) {
          var edgeId = this.e(step.source, step.target);
          var edge = this.graph.edges(edgeId);
          edge.color = color;
          this.graph.dropEdge(edgeId).addEdge(edge);
        }
        if (this.logTracer) {
          var source = step.source;
          if (source === undefined) source = '';
          this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
        }
        break;
      default:
        super.processStep(step, options);
    }
  }

  setTreeData(G, root, undirected) {
    var tracer = this;

    root = root || 0;
    var maxDepth = -1;

    var chk = new Array(G.length);
    var getDepth = function (node, depth) {
      if (chk[node]) throw "the given graph is not a tree because it forms a circuit";
      chk[node] = true;
      if (maxDepth < depth) maxDepth = depth;
      for (var i = 0; i < G[node].length; i++) {
        if (G[node][i]) getDepth(i, depth + 1);
      }
    };
    getDepth(root, 1);

    if (this.setData(G, undirected)) return true;

    var place = function (node, x, y) {
      var temp = tracer.graph.nodes(tracer.n(node));
      temp.x = x;
      temp.y = y;
    };

    var wgap = 1 / (maxDepth - 1);
    var dfs = function (node, depth, top, bottom) {
      place(node, top + bottom, depth * wgap);
      var children = 0;
      for (var i = 0; i < G[node].length; i++) {
        if (G[node][i]) children++;
      }
      var vgap = (bottom - top) / children;
      var cnt = 0;
      for (var i = 0; i < G[node].length; i++) {
        if (G[node][i]) dfs(i, depth + 1, top + vgap * cnt, top + vgap * ++cnt);
      }
    };
    dfs(root, 0, 0, 1);

    this.refresh();
  }

  setData(G, undirected) {
    if (super.setData.apply(this, arguments)) return true;
    this.graph.clear();
    const nodes = [];
    const edges = [];
    const unitAngle = 2 * Math.PI / G.length;
    let currentAngle = 0;
    for (let i = 0; i < G.length; i++) {
      currentAngle += unitAngle;
      nodes.push({
        id: this.n(i),
        label: '' + i,
        x: .5 + Math.sin(currentAngle) / 2,
        y: .5 + Math.cos(currentAngle) / 2,
        size: 1,
        color: this.color.default,
        weight: 0
      });

      if (undirected) {
        for (let j = 0; j <= i; j++) {
          const value = G[i][j] || G[j][i];
          if (value) {
            edges.push({
              id: this.e(i, j),
              source: this.n(i),
              target: this.n(j),
              color: this.color.default,
              size: 1,
              weight: AVTracerManagerUtil.refineByType(value)
            });
          }
        }
      } else {
        for (let j = 0; j < G[i].length; j++) {
          if (G[i][j]) {
            edges.push({
              id: this.e(i, j),
              source: this.n(i),
              target: this.n(j),
              color: this.color.default,
              size: 1,
              weight: AVTracerManagerUtil.refineByType(G[i][j])
            });
          }
        }
      }
    }

    this.graph.read({
      nodes: nodes,
      edges: edges
    });
    this.s.camera.goTo({
      x: 0,
      y: 0,
      angle: 0,
      ratio: 1
    });
    this.refresh();

    return false;
  }

  resize() {
    super.resize();

    this.s.renderers[0].resize();
    this.refresh();
  }

  refresh() {
    super.refresh();

    this.s.refresh();
  }

  clear() {
    super.clear();

    this.clearGraphColor();
    this.refresh();
  }

  clearGraphColor() {
    var tracer = this;

    this.graph.nodes().forEach(function (node) {
      node.color = tracer.color.default;
    });
    this.graph.edges().forEach(function (edge) {
      edge.color = tracer.color.default;
    });
  }

  n(v) {
    return 'n' + v;
  }

  e(v1, v2) {
    return 'e' + v1 + '_' + v2;
  }

  getColor(edge, source, target, settings) {
    var color = edge.color,
      edgeColor = settings('edgeColor'),
      defaultNodeColor = settings('defaultNodeColor'),
      defaultEdgeColor = settings('defaultEdgeColor');
    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    return color;
  }

  drawLabel(node, context, settings) {
    var fontSize,
      prefix = settings('prefix') || '',
      size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
    settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    context.textAlign = 'center';
    context.fillText(
      node.label,
      Math.round(node[prefix + 'x']),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  }

  drawArrow(edge, source, target, color, context, settings) {
    var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1,
      tSize = target[prefix + 'size'],
      sX = source[prefix + 'x'],
      sY = source[prefix + 'y'],
      tX = target[prefix + 'x'],
      tY = target[prefix + 'y'],
      angle = Math.atan2(tY - sY, tX - sX),
      dist = 3;
    sX += Math.sin(angle) * dist;
    tX += Math.sin(angle) * dist;
    sY += -Math.cos(angle) * dist;
    tY += -Math.cos(angle) * dist;
    var aSize = Math.max(size * 2.5, settings('minArrowSize')),
      d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
      aX = sX + (tX - sX) * (d - aSize - tSize) / d,
      aY = sY + (tY - sY) * (d - aSize - tSize) / d,
      vX = (tX - sX) * aSize / d,
      vY = (tY - sY) * aSize / d;

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  }

  drawOnHover(node, context, settings, next) {
    var tracer = this;

    context.setLineDash([5, 5]);
    var nodeIdx = node.id.substring(1);
    this.graph.edges().forEach(function (edge) {
      var ends = edge.id.substring(1).split("_");
      if (ends[0] == nodeIdx) {
        var color = '#0ff';
        var source = node;
        var target = tracer.graph.nodes('n' + ends[1]);
        tracer.drawArrow(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      } else if (ends[1] == nodeIdx) {
        var color = '#ff0';
        var source = tracer.graph.nodes('n' + ends[0]);
        var target = node;
        tracer.drawArrow(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      }
    });
  }
}

Alvi.CoordinateSystemTracer = class CoordinateSystemTracer extends Alvi.DirectedGraphTracer {
  static getClassName() {
    return 'CoordinateSystemTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
	  this.s.settings({
        defaultEdgeType: 'def',
        funcEdgesDef(edge, source, target, context, settings) {
          var color = this.getColor(edge, source, target, settings);
          this.drawEdge(edge, source, target, color, context, settings);
        }
      });
    }
  }

  setData(C) {
    if (Tracer.prototype.setData.apply(this, arguments)) return true;

    this.graph.clear();
    var nodes = [];
    var edges = [];
    for (var i = 0; i < C.length; i++)
      nodes.push({
        id: this.n(i),
        x: C[i][0],
        y: C[i][1],
        label: '' + i,
        size: 1
      });
    this.graph.read({
      nodes: nodes,
      edges: edges
    });
    this.s.camera.goTo({
      x: 0,
      y: 0,
      angle: 0,
      ratio: 1
    });
    this.refresh();

    return false;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'visit':
      case 'leave':
        var visit = step.type == 'visit';
        var targetNode = this.graph.nodes(this.n(step.target));
        var color = visit ? this.color.visited : this.color.left;
        targetNode.color = color;
        if (step.source !== undefined) {
          var edgeId = this.e(step.source, step.target);
          if (this.graph.edges(edgeId)) {
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          } else {
            this.graph.addEdge({
              id: this.e(step.target, step.source),
              source: this.n(step.source),
              target: this.n(step.target),
              size: 1
            });
          }
        }
        if (this.logTracer) {
          var source = step.source;
          if (source === undefined) source = '';
          this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
        }
        break;
      default:
        super.processStep(step, options);
    }
  }

  e(v1, v2) {
    if (v1 > v2) {
      var temp = v1;
      v1 = v2;
      v2 = temp;
    }
    return 'e' + v1 + '_' + v2;
  }

  drawOnHover(node, context, settings, next) {
    var tracer = this;

    context.setLineDash([5, 5]);
    var nodeIdx = node.id.substring(1);
    this.graph.edges().forEach(function (edge) {
      var ends = edge.id.substring(1).split("_");
      if (ends[0] == nodeIdx) {
        var color = '#0ff';
        var source = node;
        var target = tracer.graph.nodes('n' + ends[1]);
        tracer.drawEdge(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      } else if (ends[1] == nodeIdx) {
        var color = '#0ff';
        var source = tracer.graph.nodes('n' + ends[0]);
        var target = node;
        tracer.drawEdge(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      }
    });
  }

  drawEdge(edge, source, target, color, context, settings) {
    var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  }
}

Alvi.UndirectedGraphTracer = class UndirectedGraphTracer extends Alvi.DirectedGraphTracer {
  static getClassName() {
    return 'UndirectedGraphTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew){
      var tracer = this;
      tracer.s.settings({
        defaultEdgeType: 'def',
        funcEdgesDef(edge, source, target, context, settings) {
          var color = tracer.getColor(edge, source, target, settings);
          tracer.drawEdge(edge, source, target, color, context, settings);
        }
      });
    }
  }

  setTreeData(G, root) {
    return super.setTreeData(G, root, true);
  }

  setData(G) {
    return super.setData(G, true);
  }

  e(v1, v2) {
    if (v1 > v2) {
      var temp = v1;
      v1 = v2;
      v2 = temp;
    }
    return 'e' + v1 + '_' + v2;
  }

  drawOnHover(node, context, settings, next) {
    var tracer = this;

    context.setLineDash([5, 5]);
    var nodeIdx = node.id.substring(1);
    this.graph.edges().forEach(function (edge) {
      var ends = edge.id.substring(1).split("_");
      if (ends[0] == nodeIdx) {
        var color = '#0ff';
        var source = node;
        var target = tracer.graph.nodes('n' + ends[1]);
        tracer.drawEdge(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      } else if (ends[1] == nodeIdx) {
        var color = '#0ff';
        var source = tracer.graph.nodes('n' + ends[0]);
        var target = node;
        tracer.drawEdge(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      }
    });
  }

  drawEdge(edge, source, target, color, context, settings) {
    var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  }
}

Alvi.WeightedDirectedGraphTracer = class WeightedDirectedGraphTracer extends Alvi.DirectedGraphTracer {
  static getClassName() {
    return 'WeightedDirectedGraphTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    if (this.isNew) {
      var tracer = this;
      tracer.s.settings({
        edgeLabelSize: 'proportional',
        defaultEdgeLabelSize: 20,
        edgeLabelSizePowRatio: 0.8,
        funcLabelsDef(node, context, settings) {
          tracer.drawNodeWeight(node, context, settings);
          tracer.drawLabel(node, context, settings);
        },
        funcHoversDef(node, context, settings) {
          tracer.drawOnHover(node, context, settings, tracer.drawEdgeWeight);
        },
        funcEdgesArrow(edge, source, target, context, settings) {
          var color = tracer.getColor(edge, source, target, settings);
          tracer.drawArrow(edge, source, target, color, context, settings);
          tracer.drawEdgeWeight(edge, source, target, color, context, settings);
        }
      });
    }
  }

  _weight(target, weight) {
    this.manager.pushStep(this.capsule, {
      type: 'weight',
      target: target,
      weight: weight
    });
    return this;
  }

  _visit(target, source, weight) {
    this.manager.pushStep(this.capsule, {
      type: 'visit',
      target: target,
      source: source,
      weight: weight
    });
    return this;
  }

  _leave(target, source, weight) {
    this.manager.pushStep(this.capsule, {
      type: 'leave',
      target: target,
      source: source,
      weight: weight
    });
    return this;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'weight':
        var targetNode = this.graph.nodes(this.n(step.target));
        if (step.weight !== undefined) targetNode.weight = AVTracerManagerUtil.refineByType(step.weight);
        break;
      case 'visit':
      case 'leave':
        var visit = step.type == 'visit';
        var targetNode = this.graph.nodes(this.n(step.target));
        var color = visit ? step.weight === undefined ? this.color.selected : this.color.visited : this.color.left;
        targetNode.color = color;
        if (step.weight !== undefined) targetNode.weight = AVTracerManagerUtil.refineByType(step.weight);
        if (step.source !== undefined) {
          var edgeId = this.e(step.source, step.target);
          var edge = this.graph.edges(edgeId);
          edge.color = color;
          this.graph.dropEdge(edgeId).addEdge(edge);
        }
        if (this.logTracer) {
          var source = step.source;
          if (source === undefined) source = '';
          this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
        }
        break;
      default:
        super.processStep(step, options);
    }
  }

  clear() {
    super.clear();

    this.clearWeights();
  }

  clearWeights() {
    this.graph.nodes().forEach(function (node) {
      node.weight = 0;
    });
  }

  drawEdgeWeight(edge, source, target, color, context, settings) {
    if (source == target)
      return;

    var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

    if (size < settings('edgeLabelThreshold'))
      return;

    if (0 === settings('edgeLabelSizePowRatio'))
      throw '"edgeLabelSizePowRatio" must not be 0.';

    var fontSize,
      x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
      y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
      dX = target[prefix + 'x'] - source[prefix + 'x'],
      dY = target[prefix + 'y'] - source[prefix + 'y'],
      angle = Math.atan2(dY, dX);

    fontSize = (settings('edgeLabelSize') === 'fixed') ?
      settings('defaultEdgeLabelSize') :
    settings('defaultEdgeLabelSize') *
    size *
    Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

    context.save();

    if (edge.active) {
      context.font = [
        settings('activeFontStyle'),
        fontSize + 'px',
        settings('activeFont') || settings('font')
      ].join(' ');

      context.fillStyle = color;
    } else {
      context.font = [
        settings('fontStyle'),
        fontSize + 'px',
        settings('font')
      ].join(' ');

      context.fillStyle = color;
    }

    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    context.translate(x, y);
    context.rotate(angle);
    context.fillText(
      edge.weight,
      0,
      (-size / 2) - 3
    );

    context.restore();
  }

  drawNodeWeight(node, context, settings) {
    var fontSize,
      prefix = settings('prefix') || '',
      size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
    settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    context.textAlign = 'left';
    context.fillText(
      node.weight,
      Math.round(node[prefix + 'x'] + size * 1.5),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  }
}

Alvi.WeightedUndirectedGraphTracer = class WeightedUndirectedGraphTracer extends Alvi.WeightedDirectedGraphTracer {
  static getClassName() {
    return 'WeightedUndirectedGraphTracer';
  }

  constructor(name,tracerManager) {
    super(name,tracerManager);

    this.e = UndirectedGraphTracer.prototype.e;
    this.drawOnHover = UndirectedGraphTracer.prototype.drawOnHover;
    this.drawEdge = UndirectedGraphTracer.prototype.drawEdge;

    if (this.isNew) {
        var tracer = this;
        tracer.s.settings({
        defaultEdgeType: 'def',
        funcEdgesDef(edge, source, target, context, settings) {
          var color = tracer.getColor(edge, source, target, settings);
          tracer.drawEdge(edge, source, target, color, context, settings);
          tracer.drawEdgeWeight(edge, source, target, color, context, settings);
        }
      });
    }
  }

  setTreeData(G, root) {
    return super.setTreeData(G, root, true);
  }

  setData(G) {
    return super.setData(G, true);
  }

  drawEdgeWeight(edge, source, target, color, context, settings) {
    var prefix = settings('prefix') || '';
    if (source[prefix + 'x'] > target[prefix + 'x']) {
      var temp = source;
      source = target;
      target = temp;
    }
    WeightedDirectedGraphTracer.prototype.drawEdgeWeight.call(this, edge, source, target, color, context, settings);
  }
}

Alvi.DirectedGraphConstructTracer = class DirectedGraphConstructTracer extends Alvi.Tracer {
  static getClassName() {
    return 'DirectedGraphConstructTracer';
  }

  constructor(name, tracerManager, nodePlacement = null) {
    super(name,tracerManager);
    this.nodePlacement = nodePlacement;
    this.nodeCollection = [];
    if (this.isNew) {
	    var tracer = this;
        tracer.s = tracer.capsule.s = new sigma({
        renderer: {
          container: tracer.$container[0],
          type: 'canvas'
        },
        settings: {
          minArrowSize: 8,
          defaultEdgeType: 'arrow',
          maxEdgeSize: 2.5,
          labelThreshold: 4,
          font: 'Roboto',
          defaultLabelColor: '#fff',
          zoomMin: 0.6,
          zoomMax: 1.2,
          skipErrors: true,
          minNodeSize: .5,
          maxNodeSize: 12,
          labelSize: 'proportional',
          labelSizeRatio: 1.3,
          funcLabelsDef(node, context, settings) {
            tracer.drawLabel(node, context, settings);
          },
          funcHoversDef(node, context, settings, next) {
            tracer.drawOnHover(node, context, settings, next);
          },
          funcEdgesArrow(edge, source, target, context, settings) {
            var color = tracer.getColor(edge, source, target, settings);
            tracer.drawArrow(edge, source, target, color, context, settings);
          }
        }
      });
      sigma.plugins.dragNodes(tracer.s, tracer.s.renderers[0]);
      tracer.graph = tracer.capsule.graph = tracer.s.graph;
    }
  }

  _addRoot(root) {
    this.manager.pushStep(this.capsule, {
      type: 'addRoot',
      arguments: arguments
    });
    return this;
  }

  _addNode(element, parentElement = null) {
    this.manager.pushStep(this.capsule, {
      type: 'addNode',
      arguments: arguments
    });
    return this;
  }

  _findNode(val) {
    var idToFind = this.n(val);
    var G = this.nodeCollection;
    var result = null;
    for (let i = 0; i < G.length; i++) {
      if(G[i].id === idToFind) {
        result = G[i];
        break;
      }
    }
    return result;
  }

  _visit(target, source) {
    this.manager.pushStep(this.capsule, {
      type: 'visit',
      target: target,
      source: source
    });
    return this;
  }

  _leave(target, source) {
    this.manager.pushStep(this.capsule, {
      type: 'leave',
      target: target,
      source: source
    });
    return this;
  }

  _setNodePositions(positions) {
    this.manager.pushStep(this.capsule, {
      type: 'setNodePositions',
      positions: positions
    });
    return this;
  }
  
  _clearTraversal() {
    this.manager.pushStep(this.capsule, {
      type: 'clear'
    });
    return this;
  }

  processStep(step, options) {
    switch (step.type) {
      case 'clear':
        this.clear.apply(this);
        break;
      case 'setNodePositions':
        $.each(this.graph.nodes(), (i, node) => {
          if (i >= step.positions.length) return false;
          const position = step.positions[i];
          node.x = position.x;
          node.y = position.y;
        });
        break;
      case 'addRoot':
        this.addRoot.apply(this, step.arguments);
        break;
      case 'addNode':
        this.addNode.apply(this, step.arguments);
        break;
      case 'visit':
      case 'leave':
        var visit = step.type == 'visit';
        var nodeObject = this._findNode(step.target);
        nodeObject.visited = visit;
        nodeObject.isNew = false;
        var targetNode = this.graph.nodes(this.n(step.target));
        var color = visit ? this.color.visited : this.color.left;
        if(targetNode) {
          targetNode.color = color;
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          }
        }
        if (this.logTracer) {
          var source = step.source;
          if (source === undefined) source = '';
          this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
        }
        break;
      default:
        super.processStep(step, options);
    }
  }

  addRoot(root) {
    if(this.rootObject) throw 'Root for this graph is already added';
    this.rootObject = this.createGraphNode(root);
    this.drawGraph(this.rootObject.level);
  }

  addNode(node, parent) {
    var nodeObject = this.createGraphNode(node, parent)
    this.drawGraph(nodeObject.level);
  }

  createGraphNode(node, parent) {
    var nodeObject = this.nodeConstruct(node);
    var parentObject = this._findNode(parent);
    if (parentObject) {
      nodeObject.parent = parentObject;
      nodeObject.level = parentObject.level + 1;
      if (this.nodePlacement === null) {
        parentObject.children.push(nodeObject);
      } else if (this.nodePlacement === 0) {
        var isSpliced = false;
        var insertIndex = 0;
        if (parentObject.children.length > 0) {
          for(let i = 0; i < parentObject.children.length; i++) {
            var child = parentObject.children[i];
            if(child.originalVal > node) {
              isSpliced = true;
              break;
            }
            insertIndex++;
          }
        }
        if(isSpliced) {
          parentObject.children.splice(insertIndex, 0, nodeObject);
        } else {
          parentObject.children.push(nodeObject);
        }
      }
    }
    this.nodeCollection.push(nodeObject);
    return nodeObject;
  }

  nodeConstruct(val) {
    var nodeObject = {
      id: this.n(val),
      originalVal: val,
      isNew: true,
      visited: false,
      children: [],
      level: 1,
      parent: null
    }
    return nodeObject;
  }
  
  drawGraph(nodeLevel) {
    const nodes = [];
    const edges = [];
    var tracer = this;

    var arrangeChildNodes = function(node, offsetWidth) {
      if(node.children.length > 1){
        var midPoint = Math.floor(node.children.length / 2);
        for (let i = 0; i < node.children.length; i++) {
          if (i===midPoint) {
            offsetWidth += (node.children.length % 2 === 0 ? 1 : 0);
            addGraphNode(node, offsetWidth);
          }
          offsetWidth = arrangeChildNodes(node.children[i], offsetWidth);
          addEdge(node, node.children[i]);
        } 
      } else {
        if (node.children.length === 0) {        
          offsetWidth += 1;
        } else {
          offsetWidth = arrangeChildNodes(node.children[0], offsetWidth);
          addEdge(node, node.children[0]);
        }
        addGraphNode(node, offsetWidth);
      }
      return offsetWidth;
    };

    var addGraphNode = function (node, calculatedX) {
      var color = getColor(node.isNew, node.visited, tracer.color);
      nodes.push({
        id: node.id,
        label: '' + node.originalVal,
        x: calculatedX,
        y: node.level - 1,
        size: 1,
        color: color,
        weight: 0
      });
    };

    var addEdge = function (node, childNode) {
      var color = getColor(node.visited && childNode.isNew, node.visited && childNode.visited, tracer.color);
      edges.push({
        id: tracer.e(node.originalVal, childNode.originalVal),
        source: node.id,
        target: childNode.id,
        color: color,
        size: 1,
        weight: AVTracerManagerUtil.refineByType(childNode.originalVal)
      });
    };

    var getColor = function (isNew, isVisited, colorPalete) {
      return isNew ? colorPalete.selected :
              (isVisited ? colorPalete.visited : colorPalete.default);
    };
    arrangeChildNodes(this.rootObject, 0);
    
    this.graph.clear();
    this.graph.read({
      nodes: nodes,
      edges: edges
    });
    this.s.camera.goTo({
      x: 0,
      y: nodeLevel,
      angle: 0,
      ratio: 1
    });
    this.refresh();

    return false;
  }

  resize() {
    super.resize();

    this.s.renderers[0].resize();
    this.refresh();
  }

  refresh() {
    super.refresh();

    this.s.refresh();
  }

  clear() {
    super.clear();

    this.clearGraphColor();
    this.refresh();
  }

  clearGraphColor() {
    var tracer = this;
    this.nodeCollection.forEach(function(node){
      node.visited = node.isNew = false;
    });
    
    this.graph.nodes().forEach(function (node) {
      node.color = tracer.color.default;
    });
    this.graph.edges().forEach(function (edge) {
      edge.color = tracer.color.default;
    });
  }

  n(v) {
    return 'n' + v;
  }

  e(v1, v2) {
    return 'e' + v1 + '_' + v2;
  }

  getColor(edge, source, target, settings) {
    var color = edge.color,
      edgeColor = settings('edgeColor'),
      defaultNodeColor = settings('defaultNodeColor'),
      defaultEdgeColor = settings('defaultEdgeColor');
    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    return color;
  }

  drawLabel(node, context, settings) {
    var fontSize,
      prefix = settings('prefix') || '',
      size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
    settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    context.textAlign = 'center';
    context.fillText(
      node.label,
      Math.round(node[prefix + 'x']),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  }

  drawArrow(edge, source, target, color, context, settings) {
    var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1,
      tSize = target[prefix + 'size'],
      sX = source[prefix + 'x'],
      sY = source[prefix + 'y'],
      tX = target[prefix + 'x'],
      tY = target[prefix + 'y'],
      angle = Math.atan2(tY - sY, tX - sX),
      dist = 3;
    sX += Math.sin(angle) * dist;
    tX += Math.sin(angle) * dist;
    sY += -Math.cos(angle) * dist;
    tY += -Math.cos(angle) * dist;
    var aSize = Math.max(size * 2.5, settings('minArrowSize')),
      d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
      aX = sX + (tX - sX) * (d - aSize - tSize) / d,
      aY = sY + (tY - sY) * (d - aSize - tSize) / d,
      vX = (tX - sX) * aSize / d,
      vY = (tY - sY) * aSize / d;

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  }

  drawOnHover(node, context, settings, next) {
    var tracer = this;

    context.setLineDash([5, 5]);
    var nodeIdx = node.id.substring(1);
    this.graph.edges().forEach(function (edge) {
      var ends = edge.id.substring(1).split("_");
      if (ends[0] == nodeIdx) {
        var color = '#0ff';
        var source = node;
        var target = tracer.graph.nodes('n' + ends[1]);
        tracer.drawArrow(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      } else if (ends[1] == nodeIdx) {
        var color = '#ff0';
        var source = tracer.graph.nodes('n' + ends[0]);
        var target = node;
        tracer.drawArrow(edge, source, target, color, context, settings);
        if (next) next(edge, source, target, color, context, settings);
      }
    });
  }
}

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


// directed_graph does this...
sigma.canvas.labels.def = function (node, context, settings) {
  var func = settings('funcLabelsDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.hovers.def = function (node, context, settings) {
  var func = settings('funcHoversDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.edges.def = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesDef');
  if (func) {
    func(edge, source, target, context, settings);
  }
};
sigma.canvas.edges.arrow = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesArrow');
  if (func) {
    func(edge, source, target, context, settings);
  }
};
