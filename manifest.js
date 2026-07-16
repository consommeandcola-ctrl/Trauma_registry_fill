(function(){
  "use strict";
  if(!("serviceWorker" in navigator))return;
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("./sw.js",{scope:"./"}).then(function(registration){
      console.info("JTDB PWA service worker registered",registration.scope);
    }).catch(function(error){
      console.warn("JTDB PWA service worker registration failed",error);
    });
  });
})();
