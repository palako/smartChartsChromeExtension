//tealium universal tag - utag.15 ut4.0.201304121251, Copyright 2013 Tealium.com Inc. All Rights Reserved.
window.optimizely=window.optimizely||[];(function(){var o=document.createElement('script');o.type='text/javascript';o.async=true;o.src="//cdn.optimizely.com/js/212899983.js";var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(o,s);})();try{(function(id,loader,u){try{u=utag.o[loader].sender[id]={}}catch(e){u=utag.sender[id]};u.ev={'view':1,'link':1};u.EVENT_VALUE="";u.map={};u.extend=[];u.send=function(a,b,c,d,e,f){if(u.ev[a]||typeof u.ev.all!="undefined"){for(d in utag.loader.GV(u.map)){if(typeof b[d]!="undefined"&&b[d]!=""){e=u.map[d].split(",");for(f=0;f<e.length;f++){u[e[f]]=b[d];}}}
if(u.EVENT_NAME){window.optimizely.push(['trackEvent',u.EVENT_NAME,u.EVENT_VALUE.replace(".","")]);}}}
try{utag.o[loader].loader.LOAD(id)}catch(e){utag.loader.LOAD(id)}})('15','haymarket.pistonheads');}catch(e){}