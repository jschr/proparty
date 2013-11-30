/*
 * proparty.js v0.1.0
 * http://jschr.github.com/proparty
 * MIT licensed
 *
 * Copyright (C) 2012-2013 Jordan Schroter
 */

(function (exports) {
  "use strict";

  function forEachObject (obj, fn) {
    Object.keys(obj).forEach(function (key) {
      fn(key, obj[key]);
    });
  }

  function mapObject (obj, fn) {
    var o = {};
    Object.keys(obj).forEach(function (key) {
      var result = fn(key, obj[key]);
      if (typeof result !== 'undefined') o[key] = result;
    });
    return o;
  }

  function unwrap (x, self, value) {
    return typeof x === 'function' ? x.call(self, value) : x;  
  }

  // from http://davidwalsh.name/vendor-prefix
  var prefix = (function () {
    var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('') 
        .match(/-(moz|webkit|ms|o)-/) || (styles.OLink === '' && ['', 'o'])
      )[1],
      dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  })();

  var PropartyStore = function () {
    this.store = {};
  };

  PropartyStore.prototype = {
    id: function (element) {
      var id = element.getAttribute('data-propartyid');
      if (!id) {
        id = Date.now();
        element.setAttribute('data-propartyid', id);
      }
      return id
    },
    set: function (element, ns, value) {
      var id = this.id(element);
      if (!this.store[id]) {
        this.store[id] = {};
      }
      this.store[id][ns] = value;
    },
    get: function (element, ns) {
      var id = this.id(element);
      return ns ? this.store[id][ns] : this.store[id];
    },
    clear: function (element) {
      var id = this.id(element);
      delete this.store[id];
    }
  };    

  var store = new PropartyStore();
  var uuid = 0;

  var Proparty = function (element, settings) {
    this.init(element, settings);
  };

  Proparty.prototype = {
    constructor: Proparty,

    init: function (element, settings) {
      settings = settings || {};

      this.element = element; 
      this.properties = {};
      this.transforms = {};
      this.callbacks = {};
      this.settings = {};
      this.next = [];
      this.inc = 0;
      this.uuid = uuid++;
      this.paused = false;

      if (settings) {
        this.setSettings(settings);
      }

      this.executeCallback('initialized');
    },

    setSettings: function (settings) {
      this.settings.duration = typeof settings.duration !== 'undefined' ? settings.duration : proparty.defaults.duration;
      this.settings.delay = typeof settings.delay !== 'undefined' ? settings.delay : proparty.defaults.delay;
      this.settings.initialDelay = typeof settings.initialDelay !== 'undefined' ? settings.initialDelay : proparty.defaults.initialDelay;
      this.settings.ease = typeof settings.ease !== 'undefined' ? settings.ease : proparty.defaults.ease;
      this.settings.cycle = typeof settings.cycle !== 'undefined' ? settings.cycle : proparty.defaults.cycle;
      this.settings.preserve = typeof settings.preserve !== 'undefined' ? settings.preserve : proparty.defaults.preserve;

      return this;
    },

    // convenience methods
    setDuration: function (value) { return this.setSettings({ duration: value }); },
    setDelay: function (value) { return this.setSettings({ delay: value }); },
    setCycle: function (value) { return this.setSettings({ cycle: value }); },
    setInitialDelay: function (value) { return this.setSettings({ initialDelay: value }); },
    setEase: function (value) { return this.setSettings({ ease: value }); },
    
    set: function (prop, value) {
      this.properties[prop] = value;
      return this;
    },

    transform: function (prop, value) {
      this.transforms[prop] = value;
      return this;
    },

    setWithVendor: function (prop, value) {
      this.set(prefix.css + prop, value);
      this.set(prop, value);
      return this;
    },

    setProperty: function (prop, value) {
      // ie9 will throw an error if trying to call setProperty on 
      // unsupported properties or values. 
      try {
        if (value || value === 0) {
          this.element.style.setProperty(prop, ''+value, '');        
        } else {
          this.element.style.removeProperty(prop);
        }
      } catch (e) {
        if (console && console.warn) {
          console.warn('Proparty tried setting invalid property: ' + prop + ', value:' + value);
        }  
      }
      return this;
    },

    setVendorProperty: function (prop, value) {
      this.setProperty(prefix.css + prop, value);
      this.setProperty(prop, value);
      return this;
    },

    getTransition: function (prop) {
      return prop + ' ' + (this.settings.duration / 1000 + 's') + ' ' + proparty.ease[this.settings.ease];
    },

    getTransform: function (prop, value) {
      return prop + '(' + (typeof value === 'string' ? value : value.join(',')) + ')';
    },

    getValue: function (key, value) {
      var v;
      var index = typeof value === 'function' ? 0 : this.inc,

      value = [].concat(value);

      if (typeof this.settings.cycle === 'number') {
        if (this.settings.cycle > this.inc) {
          v = unwrap(value[index % value.length], this, key);
        }
      } else if (typeof this.settings.cycle === 'boolean' && this.settings.cycle) {
        v = unwrap(value[index % value.length], this);
      } else {
        v = unwrap(value[index], this, key);
      }
    
      return v;
    },

    addCallback: function (name, fn) {
      if (typeof this.callbacks[name] === 'undefined') {
        this.callbacks[name] = [];
      }
      this.callbacks[name].push(fn);
      return this;
    },

    removeCallback: function (name, fn) {
      this.callbacks[name] = this.callbacks[name]
        .filter(function (fn) {
          return fn !== fn;
        });

      return this;
    },

    executeCallback: function (name) {
      var that = this;
      if (this.callbacks[name]) {
        this.callbacks[name].map(function (fn) {
          fn.call(that);
        });
      }
    },

    whenInitialized: function (fn) { return this.addCallback('initialized', fn); },
    
    whenStarted: function (fn) { return this.addCallback('started', fn); },

    whenPaused: function (fn) { return this.addCallback('paused', fn); },

    whenStopped: function (fn) { return this.addCallback('stopped', fn); },
    
    whenDestroyed: function (fn) { return this.addCallback('destroy', fn); },

    nextInChain: function () {
      var that = this;

      if (this.next.length) {
        var ppChain = that.next.shift()();

        ppChain
          .whenDestroyed(function () {
            if (ppChain.next.length) {
              ppChain.nextInChain();
            } else {
              // call start to get next chain but avoid callbacks
              that.nextInChain();
            }
          })
          .start();
      } else { 
        this.destroy();
      }
    },

    start: function () {
      var that = this;

      this.paused = false;

      var run = function () {
        var transformsObj = mapObject(that.transforms, that.getValue.bind(that));
        var propsObj = mapObject(that.properties, that.getValue.bind(that));

        if (!Object.keys(propsObj).length && !Object.keys(transformsObj).length) {
          that.stop();
          that.nextInChain();
          return;
        }

        var transforms = [];
        forEachObject(transformsObj, function (key, value) {
          transforms.push(that.getTransform(key, value));
        });

        var transitions = [];
        forEachObject(propsObj, function (key, value) {
          transitions.push(that.getTransition(key));
        });

        if (transforms.length) {
          transitions.push(that.getTransition(prefix.css + 'transform'));
        }

        store.set(that.element, that.uuid, transitions);

        var allTransitions = [];
        forEachObject(store.get(that.element), function (key, value) {
          Array.prototype.push.apply(allTransitions, value);
        });

        that.setVendorProperty('transform', transforms.join(' '));

        forEachObject(propsObj, that.setProperty.bind(that));

        that.setVendorProperty('transition', allTransitions.join(','));

        if (proparty.forceHardwareAcceleration) {
          that.setProperty('-webkit-backface-visibility', 'hidden');
        }

        setTimeout(function () {
          setTimeout(function () {
            if (that.paused) return;
            that.inc = (that.inc + 1) % Number.MAX_VALUE;
            run();
          }, that.settings.delay);
        }, that.settings.duration);
      };

      setTimeout(function () { 
        run(); 
      }, that.settings.initialDelay);

      that.executeCallback('started');

      // chaining endpoint 
      return {
        start: that.start.bind(that),
        pause: that.pause.bind(that),
        stop: that.stop.bind(that),
        destroy: that.destroy.bind(that)
      };
    },


    pause: function () {
      this.paused = true;
      this.executeCallback('paused');
    },
    
    stop: function () {
      this.paused = true;
      this.inc = 0;
      this.executeCallback('stopped');
    },

     chain: function (fn) {
      this.next.push(fn);
      return this;
    },

    destroy: function () {
      var that = this;
    
      this.paused = true;
      this.inc = 0;
      // execute callback before destorying callbacks
      this.executeCallback('destroy');
      
      if (!this.settings.preserve) {
        that.setVendorProperty('transform', null);
        that.setVendorProperty('transition', null);

        forEachObject(this.properties, function (key) {
          that.setProperty(key, null);
        });
      }

      if (proparty.forceHardwareAcceleration) {
        that.setProperty('-webkit-backface-visibility', null);
      }

      this.properties = {};
      this.transforms = {};
      this.callbacks = {};

      store.clear(this.element);
      // this.settings = this.setSettings(proparty.defaults);
    }
  };

  var proparty = function (sel, settings) {
    return new Proparty(proparty.select(sel), settings);
  };

  proparty.select = function (sel) {
    if (typeof sel === 'string') { 
      return document.querySelectorAll(sel)[0]; 
    } else if (sel.length) { 
      return sel[0]; 
    } else { 
      return sel; 
    }
  };

  proparty.math = {};

  proparty.math.operator = function (op) {
    return function (values) {
      values = [].concat(values);

      return values.map(function (value) {
        var match = ('' + value).match(/-?[0-9\.]+(.+)/);
        var number = parseFloat(value);
        var suffix = (match && match[1]) || '';

        return function (prop) {
          var current = parseFloat(window.getComputedStyle(this.element).getPropertyValue(prop));
          return isNaN(current) ? value : op(current, number) + suffix;
        };
      });
    };
  };

  proparty.math.add = proparty.math.operator(function (a, b) { return a + b; });
  proparty.math.subtract = proparty.math.operator(function (a, b) { return a - b; });
  proparty.math.multiply = proparty.math.operator(function (a, b) { return a * b; });
  proparty.math.divide = proparty.math.operator(function (a, b) { return a / b; });

  proparty.defaults = {
    cycle: false,
    delay: 0,
    initialDelay: 0,
    duration: 500,
    ease: 'in',
    preserve: true
  };

  // modified from move.js - https://github.com/visionmedia/move.js/blob/master/move.js#L689
  proparty.ease = {
    'in':                'ease-in',
    'out':               'ease-out',
    'in-out':            'ease-in-out',
    'linear':            'linear',
    'snap':              'cubic-bezier(0,1,.5,1)',
    'ease-in-quad':      'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
    'ease-in-cubic':     'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
    'ease-in-quart':     'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
    'ease-in-quint':     'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
    'ease-in-sine':      'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
    'ease-in-expo':      'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
    'ease-in-circ':      'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
    'ease-in-back':      'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
    'ease-out-quart':    'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
    'ease-out-quint':    'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
    'ease-out-sine':     'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
    'ease-out-expo':     'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    'ease-out-circ':     'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
    'ease-out-back':     'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
    'ease-out-quad':     'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
    'ease-out-cubic':    'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
    'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
    'ease-in-out-sine':  'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
    'ease-in-out-expo':  'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
    'ease-in-out-circ':  'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
    'ease-in-out-back':  'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
  };

  // proparty.forceHardwareAcceleration = true;

  exports.proparty = exports.pp = proparty;

}(this));
