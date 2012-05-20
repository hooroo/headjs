head.feature("touchable", function() {
  return 'ontouchstart' in window;
});

head.feature("positionfixed", function() {
  var control, fake, oldCssText, ret, root, test;

  var isIpad = navigator.userAgent.match(/iPad/i);
  var isIphone = navigator.userAgent.match(/iPhone/i);
  var isIpod = navigator.userAgent.match(/iPod/i);
  var isIos = isIpad || isIpod || isIphone;

  test = document.createElement("div");
  control = test.cloneNode(false);
  fake = false;
  root = document.body || (function() {
    fake = true;
    return document.documentElement.appendChild(document.createElement("body"));
  })();

  oldCssText = root.style.cssText;
  root.style.cssText = "padding:0;margin:0";
  test.style.cssText = "position:fixed;top:42px";
  root.appendChild(test);
  root.appendChild(control);
  ret = test.offsetTop !== control.offsetTop;
  root.removeChild(test);
  root.removeChild(control);
  root.style.cssText = oldCssText;
  if (fake) {
    document.documentElement.removeChild(root);
  }
  navigator.userAgent.match(/OS (\d)/i);
  return ret && (!isIos || (isIos && RegExp.$1 >= 5));
});