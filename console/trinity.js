'use strict';
/* The stage picture is intentionally still. No WebGL loop, no particle redraw, no flicker. */
window.Trinity=(function(){
  function place(){
    const center=document.getElementById('stage-center');
    if(!center)return;
    const labels=center.querySelectorAll('.slot-label');
    const w=center.clientWidth||1,h=center.clientHeight||1;
    const spots=[[w*0.46,18],[w*0.18,h*0.58],[w*0.68,h*0.58]];
    labels.forEach((n,i)=>{
      const s=spots[i]||spots[0];
      const lw=n.offsetWidth||120;
      const x=i===0?s[0]:Math.max(8,s[0]-lw/2);
      n.style.transform='translate('+Math.round(x)+'px,'+Math.round(s[1])+'px)';
    });
  }
  return {
    init(){place();window.addEventListener('resize',place);},
    set(){},
    pulse(){},
    focus(){},
    step(){},
    state(){return {webgl:false,points:0};}
  };
})();
