!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else this[name] = definition()
}('invoke', function () {

  function Invocable(fn) {
    this._curr = this._root = new InvocableStep(fn)
  }

  Invocable.prototype = {

    // Adds a function to be executed in sequence
    then: function (fn) {
      this._curr = this._curr.child(fn)

      return this
    }

    // Adds a function to be executed in parallel
  , and: function (fn) {
      this._curr.sibling(fn)

      return this
    }

    // Adds an error handler
  , rescue: function (fn) {
      this._rescue = fn

      return this
    }

    // Closes a set of invokable steps and initiates execution.
    // initial is passed as the data argument of functions in the
    // first step.
  , end: function (initial, cb) {
      this._root.exec(initial, this._rescue, cb)
    }
  }

  function InvocableStep(fn) {
    this._next = null
    this._fns = [ fn ]
    this._err = null
  }

  InvocableStep.prototype = {

    // Adds a new child function to be executed after this step.
    child: function (fn) {
      return this._next = new InvocableStep(fn)
    }

    // Adds a sibling function to this step.
  , sibling: function (fn) {
      this._fns.push(fn)
    }

    // Executes all functions in this step in parallel, then moves
    // on to the next step.
  , exec: function (passed, rescue, cb) {
      var i
        , len = this._fns.length
        , results = []
        , completed = 0
        , self = this

      function parallel(index, fn) {
        return function () {
          fn(passed, function (err, data) {

            // Bail if another sibling function in this step errored.
            if (self._err) return

            if (err) {
              self._err = err
              return rescue(err)
            }

            // If we have more than one function in parallel, pass an
            // array of results to the next step. Otherwise just pass
            // the result directly.
            (len === 1) ? results = data : results[index] = data
            if (++completed === len) {
              self._next ? self._next.exec(results, rescue, cb)
                         : cb(results)
            }
          })
        }
      }

      for (i = 0; i < len; i++) parallel(i, this._fns[i])()
    }
  }


  return function (fn) {
    return new Invocable(fn)
  }
})
