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

(function () {

  M.View = function () {
    var that = this;

    // Same order as a backbone view
    that.cid = M.View.uniqueId();
    that._configure(arguments[0] || {});
    that._ensureElement();
    that.initialize.apply(that, Array.prototype.slice.call(arguments));
    that.delegateEvents();
  };

  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes',
    'className', 'tagName'];

  // Cached regex to split keys for ``delegate`. (Same as backbone.js)
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  $.extend(M.View.prototype, {

    // The default `tagName` of a View's element is `"div"`.
    tagName:'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $:function (selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize:function () {
    },

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render:function () {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove:function () {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make:function (tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement:function (element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents:function (events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if ((typeof method) !== 'function') method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        var context = this;
        var bound = function () {
          method.apply(context, Array.prototype.slice.call(arguments));
        };
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, bound);
        } else {
          this.$el.delegate(selector, eventName, bound);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents:function () {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure:function (options) {
      if (this.options) options = $.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement:function () {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  M.View.extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

// Generates the unique ids for all view class instances.
  M.View.uniqueId = function () {
    M.View.uniqueId.count = M.View.uniqueId.count || 0;
    var id = "view" + M.View.uniqueId.count; // Same name convention as backbone.
    M.View.uniqueId.count += 1;
    return id;
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function () {
  };

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function (parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () {
        parent.apply(this, arguments);
      };
    }

    // Inherit class (static) properties from parent.
    $.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) $.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) $.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };


  // Helper function to get a value from as a property or as a function.
  function getValue(object, prop) {
    if (!(object && object[prop])) return null;
    return ((typeof object[prop]) === 'function') ? object[prop]() : object[prop];
  }

}());
