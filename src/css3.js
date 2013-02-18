/*!
 * HeadJS     The only script in your <HEAD>    
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 *
 * Version 0.99
 * http://headjs.com
 */
;(function(win, undefined) {
    "use strict";

    var doc = win.document,
        nav = win.navigator,

        /*
            To add a new test:

            head.feature("video", function() {
                var tag = document.createElement('video');
                return !!tag.canPlayType;
            });

            Good place to grab more tests

        /* CSS modernizer */
         el       = doc.createElement("i"),
         style    = el.style,
         prefs    = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
         domPrefs = 'Webkit Moz O ms Khtml'.split(' '),

         headVar = win.head_conf && win.head_conf.head || "head",
         api     = win[headVar];

    win.test = style;
     // Thanks Paul Irish!
    function testProps(props) {
        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }

        return false;
    }


    function testAll(prop) {
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
            props = (prop + ' ' + domPrefs.join(camel + ' ') + camel).split(' ');

        return !!testProps(props);
    }

    var tests = {
        gradient: function() {
            var s1 = 'background-image:',
                s2 = 'gradient(linear,left top,right bottom,from(#9f9),to(#fff));',
                s3 = 'linear-gradient(left top,#eee,#fff);';

            style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0,-s1.length);
            return !!style.backgroundImage;
        },

        rgba: function() {
            style.cssText = "background-color:rgba(0,0,0,0.5)";
            return !!style.backgroundColor;
        },

        opacity: function() {
            return el.style.opacity === '';
        },

        textShadow: function() {
            return style.textShadow === '';
        },

        multipleBackground: function() {
            style.cssText = "background:url(//:),url(//:),red url(//:)";
            return new RegExp("(url\\s*\\(.*?){3}").test(style.background);
        },

        boxShadow: function() {
            return testAll("boxShadow");
        },

        borderImage: function() {
            return testAll("borderImage");
        },

        borderRadius: function() {
            return testAll("borderRadius");
        },

        boxReflect: function() {
            return testAll("boxReflect");
        },

        transform: function() {
            return testAll("transform");
        },

        transition: function() {
            return testAll("transition");
        },
        touch: function () {
            return 'ontouchstart' in win;
        },
        retina: function () {
            return (win.devicePixelRatio > 1);
        },        

        /*
            font-face support. Uses browser sniffing but is synchronous.
            http://paulirish.com/2009/font-face-feature-detection/
        */
        fontface: function() {
            var browser = api.browser.name, version = api.browser.version;

            switch (browser) {
                case "ie":
                    return version >= 9;

                case "chrome":
                    return version >= 13;

                case "ff":
                    return version >= 6;

                case "ios":
                    return version >= 5;

                case "android":
                    return false;

                case "webkit":
                    return version >= 5.1;

                case "opera":
                    return version >= 10;

                default:
                    return false;
            }
        }
    };

    // queue features
    for (var key in tests) {
        if (tests[key]) {
            api.feature(key, tests[key].call(), true);
        }
    }

    // enable features at once
    api.feature();

})(window);