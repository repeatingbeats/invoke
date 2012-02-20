# invoke.js

__invoke__ is a dead simple asynchronous flow control micro-library for node.js. Sequential (__.then__) and parallel (__.and__) async functions can be chained into simple steps:

    invoke(function (data, callback) {
      // I'm an async function!
    }).and(function (data, callback) {
      // I am too! I execute in parallel with the first function.
    }).then(function (data, callback) {
      // I run after both of the parallel functions have called back. Their results
      // are passed to me as an array via the data arg.
    }).rescue(function (err) {
      // I'll be invoked if any functions in the call chain call back with an error.
    }).end(initialData, function (data) {
     // Calling .end initiates invocation of the set of chained steps. The final result
     // is passed to this callback.
    });


## Why?

Because I can.

This library is an experiment in flow control, chained APIs, and minimal JS syntax (yes, I skipped all those semi-colons on purpose).

## Usage

__invoke__ can be installed via npm:

    npm install invoke

The API is exposed as a single function that generates a chainable Invocable object.

    var invoke = require('invoke');

    invoke(function (data, callback) {
      somethingAsync(function (err, results) {
        callback(err, results);
      });
    }).then(function (data, callback) {
      // and so forth

Chainable methods on an Invocable:

### then(func)

Adds a function as a sequential step. This function will not be invoked until all previous steps have called back, and later steps will not be invoked until this function calls back.

#### func is invoked with:

* data - The result of the previous step. This is an arbitrary value if the previous step was sequential, or an array of arbitrary values if the previous step was parallel.
* callback(err, results) - Function to be invoked once with either an error or the results of this step.

### and(func)

Adds a function as a parallel step. This function will not be invoked in parallel with any other functions chained with __.and__ immediately before or immediately after this __.and__ call.

#### func is invoked with:

* data - The result of the previous step. This is an arbitrary value if the previous step was sequential, or an array of arbitrary values if the previous step was parallel.
* callback(err, results) - Function to be invoked once with either an error or the results of this step.

### rescue(func)

Adds an error handler. This function will be invoked once if any function in the call chain calls back with an error.

#### func is invoked with

* err - The error.

### end(initialValue, callback)

Adds a final callback and initiates invocation of the function steps defined in the chain. __initialValue__ is the initial value passed as the first argument into the first function step.

#### callback is invoked with

* data - The result of the previous (final) step. This is an arbitrary value if the previous step was sequential, or an array of arbitrary values if the previous step was parallel.

## License

invoke.js is MIT licensed. See LICENSE.
