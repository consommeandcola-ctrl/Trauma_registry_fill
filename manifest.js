(function(){
  "use strict";
  var registration=null;
  var refreshing=false;

  function byId(id){return document.getElementById(id)}
  function setStatus(message,kind){
    var status=byId("updateStatus");
    if(!status)return;
    status.textContent=message||"";
    status.className="status"+(kind?" "+kind:"");
  }
  function activate(worker){
    if(worker)worker.postMessage({type:"SKIP_WAITING"});
  }
  function watchInstalling(worker){
    if(!worker)return;
    worker.addEventListener("statechange",function(){
      if(worker.state==="installed"&&navigator.serviceWorker.controller){
        setStatus("更新を適用中…","ok");
        activate(worker);
      }
    });
  }

  async function registerServiceWorker(){
    if(!("serviceWorker" in navigator)){
      setStatus("この環境では自動更新を利用できません。","warn");
      return;
    }
    try{
      registration=await navigator.serviceWorker.register("./sw.js",{scope:"./"});
      console.info("JTDB PWA service worker registered",registration.scope);
      if(registration.waiting)setStatus("更新があります。ボタンを押して適用できます。","warn");
      registration.addEventListener("updatefound",function(){watchInstalling(registration.installing)});
    }catch(error){
      console.warn("JTDB PWA service worker registration failed",error);
      setStatus("更新機能の準備に失敗しました。","error");
    }
  }

  async function updateApp(){
    var button=byId("updateAppBtn");
    if(button)button.disabled=true;
    setStatus("最新版を確認中…","");
    try{
      if(!("serviceWorker" in navigator)){
        location.reload();
        return;
      }
      registration=registration||await navigator.serviceWorker.getRegistration("./")||await navigator.serviceWorker.register("./sw.js",{scope:"./"});
      await registration.update();
      if(registration.waiting){
        setStatus("更新を適用中…","ok");
        activate(registration.waiting);
        return;
      }
      if(registration.installing){
        setStatus("更新を取得中…","");
        watchInstalling(registration.installing);
        return;
      }
      setStatus("最新版です。画面を再読込します。","ok");
      location.reload();
    }catch(error){
      setStatus("更新確認に失敗しました: "+error.message,"error");
      if(button)button.disabled=false;
    }
  }

  if("serviceWorker" in navigator){
    navigator.serviceWorker.addEventListener("controllerchange",function(){
      if(refreshing)return;
      refreshing=true;
      setStatus("最新版を表示します…","ok");
      location.reload();
    });
  }
  document.addEventListener("DOMContentLoaded",function(){
    var button=byId("updateAppBtn");
    if(button)button.addEventListener("click",updateApp);
  });
  window.addEventListener("load",registerServiceWorker);
})();
