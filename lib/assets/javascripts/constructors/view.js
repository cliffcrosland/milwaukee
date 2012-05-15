/**
 * M.View:
 *
 * Lightweight Backbone.js compatible view framework that gives you 99% of the
 * good of backbone without the model/router/unerscore bloat that makes up 75%
 * of the library.
 *
 * Should you want to roll your views into backbone just change M.View to
 * Backbone.View.
 *
 */

M.View = function () {

  // Standard boilerplate for constructors
  var that = this;

  // Prevents instantiations into the window.
  if (!that instanceof M.View) {
    return new M.View(arguments);
  }

  // Standard Backbone options merged into object by default in config
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Cached regex to split keys for `delegate`. (Same as backbone.js)
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // Defaults for standard options
  that.tagName = 'div';
  that.el = null;
  that.$el = $(null);
  that.options = {};
  that.attributes = {};

  // -------------------------------------------- BACKBONE API SUPPORT
  // Provide the Backbone extend method from Jquery
  that.extend = $.extend;

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  that.initialize = function () {
    return;
  };

  // Change the view's element (`this.el` property), including event
  // re-delegation.
  that.setElement = function (element, delegate) {
    if (that.$el) that.undelegateEvents();
    that.$el = (element instanceof $) ? element : $(element);
    that.el = that.$el[0];
    if (delegate !== false) that.delegateEvents();
    return that;
  };

  // jQuery delegate for element lookup, scoped to DOM elements within the
  // current view. This should be prefered to global lookups where possible.
  that.$ = function (selector) {
    return that.$el.find(selector);
  };

  // **render** is the core function that your view should override, in order
  // to populate its element (`this.el`), with the appropriate HTML. The
  // convention is for **render** to always return `this`.
  that.render = function () {
    return that;
  };

  // Remove this view from the DOM. Note that the view isn't present in the
  // DOM by default, so calling this method may be a no-op.
  that.remove = function () {
    that.$el.remove();
    return that;
  };

  // For small amounts of DOM Elements, where a full-blown template isn't
  // needed, use **make** to manufacture elements, one at a time.
  //
  //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
  //
  that.make = function (tagName, attributes, content) {
    var el = document.createElement(tagName);
    if (attributes) $(el).attr(attributes);
    if (content) $(el).html(content);
    return el;
  };

  that.delegateEvents = function (events) {

    // Make sure we have events to work with
    if (!(events || (events = getValue(that, 'events')))) return;

    // Reset the delegation fresh
    this.undelegateEvents();

    // Start assigning events to handlers with updated bindings
    for (var key in events) {
      var method = events[key];

      // If its not a function go locate the function in this element
      if (!(typeof(method) === 'function')) method = that[events[key]];

      // Error check for undefined event handlers
      if (!method) throw new Error('Method "' + events[key] + '" does not exist');

      // Break down the binding event and selector
      var match = key.match(delegateEventSplitter),
        eventName = match[1], selector = match[2];

      // Rebind method to use "that" as this.
      method = function(){
        method.apply(that, Array.prototype.slice.call(arguments))
      };

      // Namespace the event name just like backbone.
      eventName += '.delegateEvents' + that.cid;

      // Bind to $el or delegate to a selector
      if (selector === '') {
        that.$el.bind(eventName, method);
      } else {
        that.$el.delegate(selector, eventName, method);
      }
    }
  };

  that.undelegateEvents = function () {
    that.$el.unbind('.delegateEvents' + that.cid);
  };


  // -------------------------------------------- INITIALIZATION

  // Injects the options from the initialization call
  function configure(options) {
    if (that.options) options = $.extend({}, that.options, options);
    for (var i = 0, l = viewOptions.length; i < l; i++) {
      var attr = viewOptions[i];
      if (options[attr]) that[attr] = options[attr];
    }
    that.options = options;
  }

  // Ensures we have a el and $el set at runtime by either finding it or
  // creating a default from the properties passed in.
  function ensureElement() {
    if (!that.el) {
      var attrs = getValue(that, 'attributes') || {};
      if (that.id) attrs.id = that.id;
      if (that.className) attrs['class'] = this.className;
      this.setElement(that.make(that.tagName, attrs), false);
    } else {
      this.setElement(that.el, false);
    }
  }

  // Helper function to get a value from as a property or as a function.
  function getValue(object, prop) {
    if (!(object && object[prop])) return null;
    return ((typeof object[prop]) === 'function') ? object[prop]() : object[prop];
  }


  // Same order as a backbone view
  that.cid = M.View.uniqueId();
  configure(arguments[0] || {});
  ensureElement();
  that.initialize.apply(that, Array.prototype.slice.call(arguments));
  that.delegateEvents();

};

// Generates the unique ids for all view class instances.
M.View.uniqueId = function () {
  M.View.uniqueId.count = M.View.uniqueId.count || 0;
  var id = "view" + M.View.uniqueId.count; // Same name convention as backbone.
  M.View.uniqueId.count += 1;
  return id;
};
