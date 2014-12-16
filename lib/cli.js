'use strict';

var meow = require('meow');
var multiline = require('multiline');
var work = require('./work');

var cli = meow({
  pkg: '../package.json',
  help: multiline.stripIndent(function () {/*
    Usage: work <file>
  */})
});

work(cli.input[0]);
