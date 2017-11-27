# AlgoVisualizer Library

This is a library version of [parkjs814's Algorithm Visualizer](https://github.com/parkjs814/AlgorithmVisualizer)

The original version is coded to be a standalone complete application. This code was refactored so that you can include it as a library. That way, you can add one or multiple Algorithm Visualizers into any web page. [Academic System's Bengine project](https://github.com/academicsystems/Bengine) uses this as one of its convenient blocks.

You can see a complete example of how to use it by viewing `index.html`.

## Using The Library

In order to use the library on a web page, you need to add the following tags somewhere on the page. They load all the styles, fonts, dependencies, and the library like so:
```
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ext-language_tools.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/sigma.js/1.2.1/sigma.min.js"></script>
<script src="https://cdn.rawgit.com/jacomyal/sigma.js/master/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js"></script>

<!-- local files that you need to add to your web server. use minified versions if needed -->
<link rel="stylesheet" href="css/font-awesome.min.css">
<link rel="stylesheet" href="css/algorithm_visualizer.css">
<script src="js/algovisualizer-lib.js"></script>
```

To create a playground, you do the following:
```
<div id="ENGINEID"></div>

<script>
    new AlgorithmVisualizer("ENGINEID");
</script>
```

`ENGINEID` can be anything you want and you can place the div anywhere on your page.

## Changes To Coding Algorithms From The Original Version

First, Tracers now accept 2 arguments (name,tracerManager). You need to pass in the tracerManager connected to the instance of AlgorithmVisualizer. So you must do something like this:
```
window.Algo = new AlgorithmVisualizer("ENGINEID"); // add the instance to the window to fetch later, like a global variable

var chart = new Alvi.ChartTracer('',Algo.state.tracerManager); // here we can pass in the tracerManager when creating a new Tracer.
```

Second, all Tracers and data objects are now under the namespace `Alvi`, as you can see by example above.

## Changing The Library

All library files are in the `js/` directory. After you make any changes, run `bash load.sh` to concatenate all the javascript files into one at `js/algovisualizer-lib.js`. Important! This does not create minified versions! Create those on your own if needed.

