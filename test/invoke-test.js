var invoke = require('../lib/invoke')

// Introduce some fuzzy timing to ensure we get some out-of-order callbacks.
function delay(cb, err, data) {
  var ms = Math.floor(Math.random() * 100)

  setTimeout(function () {
    cb(err, data)
  }, ms)
}

exports['sequential function execution'] = {

    'immediately resolved': function(t) {
      invoke(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'bar')
      }).end('foo', function (data) {
        t.strictEqual(data, 'foobar')
        t.done()
      })
    }

  , 'two functions in series': function (t) {
      invoke(function (data, cb) {
        t.deepEqual(data, [])
        data.push('first')
        delay(cb, null, data)
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'first' ])
        data.push('second')
        delay(cb, null, data)
      }).end([], function (data) {
        t.deepEqual(data, ['first', 'second'])
        t.done()
      })
    }

  , 'three functions in series': function (t) {
      invoke(function (data, cb) {
        t.deepEqual(data, [])
        data.push('first')
        delay(cb, null, data)
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'first' ])
        data.push('second')
        delay(cb, null, data)
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'first', 'second' ])
        data.push('third')
        delay(cb, null, data)
      }).end([], function (data) {
        t.deepEqual(data, ['first', 'second', 'third' ])
        t.done()
      })
    }

  , 'error rescuing': function (t) {
      var errMsg = 'WTF'
      invoke(function (data, cb) {
        t.deepEqual(data, [])
        data.push('first')
        delay(cb, null, data)
      }).then(function (data, cb) {
        delay(cb, new Error(errMsg))
      }).then(function (data, cb) {
        throw new Error('This should not be executed due to error rescue')
      }).rescue(function (err) {
        t.equal(err.message, errMsg)
        t.done()
      }).end([], function (data) {
        throw new Error('This should not be executed due to error rescue')
      })
    }

}

exports['parallel function execution'] = {

    'two functions in parallel': function (t) {
      invoke(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'bar')
      }).and(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'baz')
      }).end('foo', function (data) {
        t.deepEqual(data, [ 'foobar', 'foobaz' ])
        t.done()
      })
    }

  , 'three functions in parallel': function (t) {
      invoke(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'bar')
      }).and(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'baz')
      }).and(function (data, cb) {
        delay(cb, null, data + 'bam')
        t.strictEqual(data, 'foo')
      }).end('foo', function (data) {
        t.deepEqual(data, [ 'foobar', 'foobaz', 'foobam' ])
        t.done()
      })
    }

  , 'error rescuing': function (t) {
      var errMsg = 'WTF'
      invoke(function (data, cb) {
        delay(cb, null, data + 'bar')
      }).and(function (data, cb) {
        delay(cb, new Error(errMsg))
      }).and(function (data, cb) {
        delay(cb, null, data + 'bam')
      }).rescue(function (err) {
        t.equal(err.message, errMsg)
        t.done()
      }).end('foo', function (data) {
        throw new Error('This should not be executed due to error rescue')
      })
    }
}

exports['mixed sequence and parallel function execution'] = {

    'sequence of two steps with two parallel calls in each step': function (t) {
      invoke(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'bar')
      }).and(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'baz')
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'foobar', 'foobaz' ])
        delay(cb, null, data.join(' ') + 'a')
      }).and(function (data, cb) {
        t.deepEqual(data, [ 'foobar', 'foobaz' ])
        delay(cb, null, data.join(' ') + 'b')
      }).end('foo', function (data) {
        t.deepEqual(data,[ 'foobar foobaza', 'foobar foobazb'])
        t.done()
      })
    }

  , 'sequence of three steps with mixed parallel calls': function (t) {
      invoke(function (data, cb) {
        t.strictEqual(data, 'a')
        delay(cb, null, data + 'b')
      }).and(function (data, cb) {
        t.strictEqual(data, 'a')
        delay(cb, null, data + 'c')
      }).and(function (data, cb) {
        t.strictEqual(data, 'a')
        delay(cb, null, data + 'd')
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'ab', 'ac', 'ad' ])
        delay(cb, null, data.join(' ') + ' ae')
      }).and(function (data, cb) {
        t.deepEqual(data, [ 'ab', 'ac', 'ad' ])
        delay(cb, null, data.join(' ') + ' af')
      }).then(function (data, cb) {
        t.deepEqual(data, [ 'ab ac ad ae', 'ab ac ad af' ])
        delay(cb, null, data.join(' '))
      }).end('a', function (data, cb) {
        t.strictEqual(data, 'ab ac ad ae ab ac ad af')
        t.done()
      })
    }

  , 'error rescuing': function (t) {
      var errorMsg = 'WTF'
      invoke(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, null, data + 'bar')
      }).and(function (data, cb) {
        t.strictEqual(data, 'foo')
        delay(cb, new Error(errorMsg))
      }).then(function (data, cb) {
        throw new Error('This should not be executed due to error rescue')
      }).and(function (data, cb) {
        throw new Error('This should not be executed due to error rescue')
      }).rescue(function (err) {
        t.strictEqual(err.message, errorMsg)
        t.done()
      }).end('foo', function (data) {
        throw new Error('This should not be executed due to error rescue')
      })
    }
}

exports['parallel error rescuing'] = {

  'multiple errors': function (t) {

    var errorCount = 0
      , delay = 100;

    invoke(function (data, cb) {
      setTimeout(function () { cb(new Error()) }, delay)
    }).and(function (data, cb) {
      setTimeout(function () { cb(new Error()) }, delay)
    }).and(function (data, cb) {
      setTimeout(function () { cb(new Error()) }, delay)
    }).rescue(function(err) {
      errorCount++;
      setTimeout(function () {
        t.strictEqual(errorCount, 1)
        t.done()
      }, delay * 5)
    }).end('foo', function (data) {
      throw new Error('This should not be executed due to error rescue')
    })
    
  }

}
