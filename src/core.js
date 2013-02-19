/*!
 * HeadJS     The only script in your <HEAD>    
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 *
 * Version 0.99
 * http://headjs.com
 */
; (function (win, undefined) {
    "use strict";

    // gt, gte, lt, lte, eq breakpoints would have been more simple to write as ['gt','gte','lt','lte','eq']
    // but then we would have had to loop over the collection on each resize() event,
    // a simple object with a direct access to true/false is therefore much more efficient

    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            screens   : [240, 320, 480, 640, 767, 768, 800, 980, 1003, 1023, 1024, 1280, 1440], // 1003 is a special case added just for IE at 1024 with permanent scrollbar
            height    : [240, 320, 480, 600, 700, 768],
            screensCss: { "gt": true, "gte": true, "lt": true, "lte": true, "eq": true },
            browsers  : [
                          { ie     : { min: 6, max: 10 } }
                       //,{ chrome : { min: 8, max: 24 } }
                       //,{ ff     : { min: 3, max: 19 } }
                       //,{ ios    : { min: 3, max:  6 } }
                       //,{ android: { min: 2, max:  4 } }
                       //,{ webkit : { min: 9, max: 12 } }
                       //,{ opera  : { min: 9, max: 12 } }
                        ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            section   : "-section",
            page      : "-page",
            head      : "head"
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
    var api = win[conf.head] = function () {
        api.ready.apply(null, arguments);
    };

    api.features = {};
    api.feature = function (key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += ' ' + klass.join(' ');
            klass = [];
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

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|midp/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)        
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);
    api.feature("touch"  , 'ontouchstart' in win, true);

    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
         /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
         /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
         /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
         /(msie) ([\w.]+)/.exec(ua) || [];


    var browser = ua[1],
        version = parseFloat(ua[2]);    
    
    switch (browser) {
        case 'msie':
            browser = 'ie';
            version = doc.documentMode || version;
            break;

        case 'firefox':
            browser = 'ff';
            break;

        case 'ipod':
        case 'ipad':
        case 'iphone':
            browser = 'ios';
            break;

        case 'webkit':
            browser = 'safari';
            break;
    }
    

    // name can be used further on for various tasks, like font-face detection in css3.js
    api.browser = {
        name   : browser,
        version: version        
    };
    api.browser[browser] = true;


    // Browser vendor and version
    api.browser = {
        name   : browser,
        version: version
    };
    api.browser[browser] = true;

    // TODO: CHECK SUPPORTED BROWSERS - HOOROO
    // add supported, not supported classes
    var supported = ['ie', 'chrome', 'ff', 'ios', 'android', 'safari', 'opera'];
    each(supported, function(name) {
        if (name === browser) {
             pushClass(name);
            pushClass(name + '-true');
        }
        else {
            pushClass(name + '-false');            
        }
    });    

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {            
            if (browser === key) {
                pushClass(key);

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss["gt"])
                            pushClass("gt-" + key + v);

                        if (conf.browserCss["gte"])
                            pushClass("gte-" + key + v);
        }
                    
                    else if (version < v) {
                        if (conf.browserCss["lt"])
                            pushClass("lt-" + key + v);
                        
                        if (conf.browserCss["lte"])
                            pushClass("lte-" + key + v);
        }

                    else if (version === v) {
                        if (conf.browserCss["lte"])
                            pushClass("lte-" + key + v);
                        
                        if (conf.browserCss["eq"])
                            pushClass("eq-" + key + v);

                        if (conf.browserCss["gte"])
                            pushClass("gte-" + key + v);
                    }
                }
            }
            else {
                pushClass('no-' + key);
            }
        }
    }

    // IE lt9 specific
    if (browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function (el) {
            doc.createElement(el);
        });
    }


    // TODO: RETROFIT SASS FILES WITH PAGE ID - HOOROO
    // CSS "router"
    each(loc.pathname.split("/"), function (el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(this.slice(1, i + 1).join("-").toLowerCase() + conf.section);
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }

            html.id = id.toLowerCase() + conf.page;

            // on root?
            if (!i) {
                pushClass("root" + conf.section);
            }
        }
    });


    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w|w-eq|w-gt|w-gte|w-lt|w-lte|h|h-eq|h-gt|h-gte|h-lt|h-lte|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;
        
        api.screen['innerWidth'] = iw;
        api.screen['outerWidth'] = ow;
        
        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.screens, function (width) {
            if (iw > width) {
                if (conf.screensCss["gt"])
                    pushClass("w-gt" + width);
                
                if (conf.screensCss["gte"])
                    pushClass("w-gte" + width);
            }

            else if (iw < width) {
                if (conf.screensCss["lt"])
                    pushClass("w-lt" + width);
                
                if (conf.screensCss["lte"])
                    pushClass("w-lte" + width);
            }

            else if (iw === width) {
                if (conf.screensCss["lte"])
                    pushClass("w-lte" + width);

                if (conf.screensCss["eq"])
                    pushClass("w-eq" + width);

                if (conf.screensCss["gte"])
                    pushClass("w-gte" + width);
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
             if (ih > height) {
                 pushClass("h-gt"  + height);
                 pushClass("h-gte" + height);
             }

            else if (ih < height) {
                pushClass("h-lt"  + height);
                pushClass("h-lte" + height);
             }

            else if (ih === height) {
                 pushClass("h-lte" + height);
                 pushClass("h-eq"  + height);
                 pushClass("h-gte" + height);
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
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 100);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        win.attachEvent("onresize", onResize);
    }
})(window);
