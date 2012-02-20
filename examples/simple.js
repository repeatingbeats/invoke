#!/usr/bin/env node

var invoke = require('./../lib/invoke')
  , start

// Parallel execution of three slow async functions
start = Date.now()

invoke(function (data, callback) {
  setTimeout(callback, 100)
}).and(function (data, callback) {
  setTimeout(callback, 200)
}).and(function (data, callback) {
  setTimeout(callback, 300)
}).rescue(function (err) {
  console.error(err)
}).end(null, function (data) {
  console.log('Parallel execution took: ' + (Date.now() - start))
})

// Sequence execution of three slow async functions
start = Date.now()

invoke(function (data, callback) {
  setTimeout(callback, 100)
}).then(function (data, callback) {
  setTimeout(callback, 200)
}).then(function (data, callback) {
  setTimeout(callback, 300)
}).rescue(function (err) {
  console.error(err)
}).end(null, function (data) {
  console.log('Sequence execution took: ' + (Date.now() - start))
})
