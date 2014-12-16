'use strict';

var path = require('path');
var phantom = require('phantom');
var Promise = require('bluebird');

function createBrowser () {
  return new Promise(function (resolve) {
    phantom.create(resolve);
  });
}

function createPage (browser) {
  return new Promise(function (resolve) {
    browser.createPage(resolve);
  });
}

function openPage (page) {
  return new Promise(function (resolve) {
    var clientUrl = path.normalize(__dirname + '/../static/client.html');

    page.open(clientUrl, function () {
      resolve(page);
    });
  });
}

function log (msg) {
  // lolgrossbutwhatevs
  if (msg === 'work.close') {
    process.exit();
  }

  console.log(msg);
}

function createWorker (workerPath, page) {
  return new Promise(function (resolve) {
    page.onConsoleMessage(log);
    page.evaluate(function (wp) {
      // this function exists in /static/client.js
      return createWorker(wp);
    }, resolve, workerPath);
  });
}

module.exports = function (workerPath) {
  var callback;

  if (!workerPath) {
    return Promise.reject();
  }

  workerPath = path.resolve(workerPath);
  callback = createWorker.bind(null, workerPath);

  return createBrowser()
    .then(createPage)
    .then(openPage)
    .then(callback);
};
