
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
    return Alvi.Array2D.random(1, N, min, max)[0];
  },
  randomSorted: (N, min, max)=> {
    return Alvi.Array2D.randomSorted(1, N, min, max)[0];
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

