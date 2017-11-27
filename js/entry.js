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
