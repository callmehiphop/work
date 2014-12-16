var createWorker = (function () {

  'use strict';

  function getBlob (path) {
    var template, builder;

    template = [
      'var console = {};',
      'console.log = function () {',
        'postMessage(JSON.stringify({',
          'command: "work.console.log",',
          'args: [].slice.call(arguments)',
        '}));',
      '};',
      'self.close = ' + shutdown.toString() + ';',
      'importScripts("file://' + path + '");'
    ].join('\n');

    builder = new WebKitBlobBuilder();
    builder.append([template]);

    return builder.getBlob('text/javascript');
  }

  function checkMessage (e) {
    var data;

    try {
      data = JSON.parse(e.data);
    } catch (e) {
      return console.log(e);
    }

    if (data.command === 'work.console.log') {
      console.log.apply(console, data.args);
    }
  }

  function shutdown () {
    console.log('work.close');
  }

  return function (path) {
    var blob = getBlob(path);
    var url = webkitURL.createObjectURL(blob);
    var worker = new Worker(url);

    worker.onerror = function (e) {
      console.log('Something went wrong!');
      console.log(e.message);
      shutdown();
    };

    worker.terminate = shutdown;
    worker.addEventListener('message', checkMessage, false);

    return worker;
  };

}());
