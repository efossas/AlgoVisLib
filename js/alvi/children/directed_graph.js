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

