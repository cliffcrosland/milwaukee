M.provide("", new function () {

  // Standard boilerplate for constructors
  var that = this;

  // -------------------------------------------- CORE LIBS

  /**
   * Create an array from the keys in an object.
   *
   * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
   *
   * @param obj {Object} Source object.
   * @param proto {Boolean} Specify true to include inherited properties.
   * @return {Array} The array of keys.
   * Source: connect-js
   */
  that.keys = function (obj, proto) {
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) || proto) {
        arr.push(key);
      }
    }
    return arr;
  };


  /**
   * For looping through Arrays and Objects.
   *
   * @param {Object} item   an Array or an Object
   * @param {Function} fn   the callback function for iteration.
   *    The function will be pass (value, [index/key], item) paramters
   * @param {Bool} proto  indicate if properties from the prototype should
   *                      be included
   *
   * This is a awesome function! Not only does it prevent errors with has
   * own property, falls back to regular iteration, and gives *scope* to each
   * iteration! Scope to each iteration is common in other languages but not
   * JS.
   */
  that.forEach = function (item, fn, proto) {
    if (!item) {
      return;
    }

    if (Object.prototype.toString.apply(item) === '[object Array]' ||
      (!(item instanceof Function) && typeof item.length == 'number')) {
      if (item.forEach) {
        item.forEach(fn);
      } else {
        for (var i = 0, l = item.length; i < l; i++) {
          fn(item[i], i, item);
        }
      }
    } else {
      for (var key in item) {
        if (proto || item.hasOwnProperty(key)) {
          fn(item[key], key, item);
        }
      }
    }
  }


}());


