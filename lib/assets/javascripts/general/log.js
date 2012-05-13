/* Log.js
 * Provides basic logging and tracing support in a robust way across browsers.
 */
function log(message) {
  if (window.console && window.console.log) {
    window.console.log(message)
  }
}

function trace(message){
  if(window.console && window.console.trace){
    window.console.trace(message);
  } else {
    //Try to fallback to a log
    log(message);
  }
}

function l(message) {
  log(message);
}

function t(message){
  trace(message);
}


