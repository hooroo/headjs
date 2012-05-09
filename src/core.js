/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     Modified: v0.96

    https://github.com/itechnology/headjs
*/
; (function(win, undefined) {
    "use strict";
    
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],        
        replaceKlass = [],
        conf  = {
            width  : [240, 320, 480, 640, 767, 768, 800, 980, 1024, 1280, 1440, 1680, 1920],
            height : [240, 320, 480, 600, 768, 800, 900, 1080],
            section: "section-",
            page   : "page-",
            head   : "head"
         };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }
    
    function pushClass(name) {
        klass[klass.length] = name;
    }

    function replaceKlass(regex, replaceWith) {
        replaceKlass[replaceKlass.length] = [regex, replaceWith];
    }

    function removeClass(name) {
        var re = new RegExp("\\b" + name + "\\b");
        html.className = html.className.replace(re, '');
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }


    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.features = {};
    api.feature  = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {

            // Load class name into a variable, and modify that to avoid leaving the html
            // tag in a state of having no width/height directives.
            var className = html.className;

            for (var i = 0, l = replaceKlass.length; i < l; i++) {
              className = className.replace(replaceKlass[i][0], replaceKlass[i][1]);
            }

            className += ' ' + klass.join( ' ' );

            html.className = className;

            klass = [];
            replaceKlass = [];

            return api;
        }

        if (Object.prototype.toString.call(enabled) === '[object Function]') {
            enabled = enabled.call();
        }

        // css readable friendly  (use lowerCamelCase on feature names)
        var cssKey = key.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });

        pushClass(cssKey + '-' + enabled);
        api.features[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass(cssKey + '-false');
            removeClass(cssKey + '-true');
            api.feature();
        }

        return api;
    };

    api.feature("js", true, true);

    
    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile/.test(ua);
    
    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)        
    api.feature("mobile" ,  mobile, true);
    api.feature("desktop", !mobile, true);
    
    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua)                 || // Chrome & Firefox
         /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
         /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua)          || // Mobile Webkit
         /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua)     || // Safari & Opera
         /(msie) ([\w.]+)/.exec(ua)                               || [];


    var browser = ua[1],
        version = parseFloat(ua[2]),

    start = 0,
    stop  = 0;    
    switch(browser) {
        case 'msie':
            browser = 'ie';
            version = doc.documentMode || version;

            start = 6;
            stop  = 10;
            break;

        // Add/remove extra tests here
        case 'chrome':
            start = 13;
            stop  = 18;
            break;

        case 'firefox':
            browser = 'ff';

            start = 3;
            stop  = 11;
            break;

        case 'ipod':
        case 'ipad':
        case 'iphone':
            browser = 'ios';

            start = 3;
            stop  = 5;
            break;

        case 'android':
            start = 2;
            stop  = 4;
            break;

        case 'webkit':
            browser = 'safari';

            start = 9;
            stop  = 12;
            break;

        case 'opera':
            start = 9;
            stop  = 12;
            break;
    }
    

    // name can be used further on for various tasks, like font-face detection in css3.js
    api.browser = {
        name   : browser,
        version: version        
    };
    api.browser[browser] = true;


    // add supported, not supported classes
    var supported = ['ie', 'chrome', 'ff', 'ios-device', 'android-device', 'safari', 'opera'];
    each(supported, function(name) {
        if (name === browser) {
             pushClass(name);
        }
        else {
            // useful for targeting all but one specific browser vendor
            pushClass(name + '-false');            
        }
    });    

    
    for (var v = start; v <= stop; v++) {
        if (version >= v) {
            pushClass(browser + "-gte" + v);
        }

        if (version <= v) {
            pushClass(browser + "-lte" + v);
        }

        if (version === v) {
            pushClass(browser + "-eq" + v);
        }
    }   


    // IE lt9 specific
    if (browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }


    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(conf.section + this.slice(1, i + 1).join("-").toLowerCase());
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }
            html.id = conf.page + id.toLowerCase();

            // on root?
            if (!i) {
                pushClass(conf.section + "root");
            }
      }
    });


    // basic screen info
    api.screen = {        
        height: win.screen.height,
        width : win.screen.width
    };
    

    // viewport resolutions: w-eq320, w-lte480, w-lte1024 / h-eq600, h-lte768, h-lte1024
    function screenSize() {
        // remove earlier sizes
        replaceKlass(/ (w|w-eq|w-gte|w-lte|h|h-eq|h-gte|h-lte)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen['innerWidth'] = iw;
        api.screen['outerWidth'] = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w" + iw);

        each(conf.width, function(width) {
            if (iw >= width) {
                pushClass("w-gte" + width);
            }

            if (iw <= width) {
                pushClass("w-lte" + width);
            }

            if (iw === width) {
                pushClass("w-eq" + width);
            }
        });
        

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen['innerHeight'] = ih;
        api.screen['outerHeight'] = oh;

        // for debugging purposes, not really useful for anything else
        pushClass("h" + ih);

        each(conf.height, function(height) {
             if (ih >= height) {
                 pushClass("h-gte"  + height);
             }

            if (ih <= height) {
                 pushClass("h-lte" + height);
             }

            if (ih === height)  {
                 pushClass("h-eq" + height);
             }
        });        

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }
        
    screenSize();
    
    // Throttle navigators from triggering too many resize events
    var resizeId = 0;    
    function onResize() {
        clearTimeout(resizeId);
        resizeId = setTimeout(screenSize, 100);        
    }
    
    // Manualy attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        win.attachEvent("onresize", onResize);
    }    
})(window);
