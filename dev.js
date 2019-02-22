const webpack = require('webpack');
// const spawn = require('cross-spawn');
const chokidar = require('chokidar');
const { fork } = require('child_process');
const browserSync = require('browser-sync');

const clientWebpackConfig = require('./webpack.client.js');
const serverWebpackConfig = require('./webpack.server');


const clientCompiler = webpack(clientWebpackConfig);
const serverCompiler = webpack(serverWebpackConfig);

let serverProcess;
let fileWatcher;
let bs;


const callbackGenerator = (title, excutor) => {
  return (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(`${info.errors}\n`);
    }

    if (stats.hasWarnings()) {
      console.warn(`${title} script warinings: \n${info.warnings}\n`);
    }
    console.log(`${title} srcipt compile result:\n ${stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true, // Shows colors in the console
    })}\n`);
    if (excutor && typeof excutor === 'function') {
      excutor();
    }
  };
};

const startProcess = () => {
//   const proc = spawn('node', ['dist/server/index.js'], { stdio: 'inherit' });
  const proc = fork('dist/server/index.js', { stdio: 'inherit' });
  proc.on('message', (message) => {
    if (message === 'ready') {
      if (!bs) {
        bs = browserSync.create();
        bs.init({
          ui: false,
          open: true,
          browser: 'google chrome',
          proxy: 'localhost:3000',
          port: 5000,
        });
      } else {
        bs.reload();
      }
    }
  });
  proc.on('close', (code, signal) => {
    if (code !== null) {
      process.exit(code);
    }
    if (signal) {
      if (signal === 'SIGKILL') {
        process.exit(137);
      }
      // tslint:disable-next-line
      console.log(`got signal ${signal}, exiting`);
      process.exit(signal === 'SIGINT' ? 0 : 1);
    }
    process.exit(0);
  });
  proc.on('error', (err) => {
    // tslint:disable-next-line
    console.error(err);
    process.exit(1);
  });
  return proc;
};


function wrapper() {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (fileWatcher) {
    fileWatcher.close();
  }
  if (bs) {
    bs.exit();
  }
}

process.on('SIGINT', wrapper);
process.on('SIGTERM', wrapper);
process.on('exit', wrapper);

const watchFile = () => {
  // eslint-disable-next-line
  const _fileWatcher = chokidar.watch(['core', 'src', './server.js'], {
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
    cwd: '.',
    ignoreInitial: true,
  });
  _fileWatcher
    .on('add', () => {
      runCompilerAndServe();
    })
    .on('change', () => {
      runCompilerAndServe();
    })
    .on('unlink', () => {
      runCompilerAndServe();
    })
    .on('addDir', () => {
      runCompilerAndServe();
    })
    // .on('addDir', path => console.log(`Directory ${path} has been added`))
    .on('unlinkDir', () => {
      runCompilerAndServe();
    })
    .on('error', error => console.error(`Watcher error: ${error}`));
  return _fileWatcher;
};


const clientCallback = callbackGenerator('client', () => {
  serverCompiler.run(serverCallback);
});

const serverCallback = callbackGenerator('server', () => {
  if (!serverProcess) { // start server process
    serverProcess = startProcess();
  } else { // restart server process
    serverProcess.removeAllListeners('close');
    serverProcess.kill();
    serverProcess = startProcess();
  }
  if (!fileWatcher) { // watch file
    fileWatcher = watchFile();
  }
});

const runCompilerAndServe = () => {
  clientCompiler.run(clientCallback);
};

runCompilerAndServe();
