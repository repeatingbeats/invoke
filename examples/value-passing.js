#!/usr/bin/env node

var invoke = require('./../lib/invoke')

// Sequential .then functions receive the value passed by the previous step and
// pass values directly to the next step.

invoke(function (data, callback) {
  console.log(data) // "initial"
  callback(null, "first")
}).then(function (data, callback) {
  console.log(data) // "first"
  callback(null, "second")
}).then(function (data, callback) {
  console.log(data) // "second"
  callback(null, "third")
}).end("initial", function (data, callback) {
  console.log(data) // "third"
})

// Parallel .and functions receive the value passed by the previous step (here
// the initial value). The values passed by the callbacks of each function are
// aggregated into an array that is passed into the following step.

invoke(function (data, callback) {
  console.log(data) // "initial"
  callback(null, "first")
}).and(function (data, callback) {
  console.log(data) // "initial"
  callback(null, "second")
}).and(function (data, callback) {
  console.log(data) // "initial"
  callback(null, "third")
}).end("initial", function (data, callback) {
  console.log(data) // [ 'first', 'second', 'third' ] 
})
