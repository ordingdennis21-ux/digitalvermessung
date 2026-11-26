"use strict";
document.getElementById('y').textContent=new Date().getFullYear();

// Menü
const nav=document.getElementById('nav'),mb=document.getElementById('menuBtn');
mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');mb.setAttribute('aria-expanded',false)}));

// Formular
document.getElementById('form').addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target);
  const body='Name: '+f.get('name')+'\nUnternehmen: '+f.get('firma')+'\nE-Mail: '+f.get('email')+'\nTelefon: '+f.get('tel')+'\nLeistung: '+f.get('leistung')+'\n\n'+f.get('nachricht');
  location.href='mailto:info@digitalevermessung.de?subject='+encodeURIComponent('Projektanfrage: '+f.get('leistung'))+'&body='+encodeURIComponent(body);
});


// Hero: Ein Gebäude wird Punkt für Punkt gescannt, eingefärbt nach Höhe
(function(){
  const c=document.getElementById('cloud'),x=c.getContext('2d');
  const stateEl=document.getElementById('scanState'),countEl=document.getElementById('scanCount');
  const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const W=1.7,H=1.3,D=.85,R=.45,TOP=H+R;
  const NB=14,B=Array.from({length:NB},()=>[]);
  const ramp=t=>{const h=235-t*235;return 'hsl('+h.toFixed(0)+' 92% '+(52+t*6).toFixed(0)+'%)'};
  const COL=B.map((_,i)=>ramp(i/(NB-1)));
  let total=0;
  const add=(a,b,d,j)=>{j=j||.012;const y=b+(rnd()-.5)*j;const k=Math.max(0,Math.min(NB-1,Math.floor(y/TOP*NB)));B[k].push(a+(rnd()-.5)*j,y,d+(rnd()-.5)*j);total++};
  const win=(u,v)=>{ // Fensterraster über drei Geschosse
    const col=((u+W)/(2*W))*7,fr=col-Math.floor(col);
    const row=v/H*3,fv=row-Math.floor(row);
    return fr>.3&&fr<.7&&fv>.32&&fv<.78;
  };
  for(let i=0;i<9000;i++){const u=(rnd()*2-1)*W,v=rnd()*H;
    if(!win(u,v)&&!(Math.abs(u+W*.14)<.14&&v<.36)) add(u,v,D);
    if(!win(u,v)) {if(rnd()<.7) add(u,v,-D)}
    else if(rnd()<.25) add(u,v,D-.05); // Fensterlaibung, dünn
  }
  for(let i=0;i<3600;i++){const d=(rnd()*2-1)*D,v=rnd()*TOP;
    if(v>H+R*(1-Math.abs(d)/D)) continue;
    const fv=(v/H*3)%1; if(v<H&&Math.abs(d)<.22&&fv>.32&&fv<.78) continue;
    add(W,v,d);add(-W,v,d);}
  for(let i=0;i<6000;i++){const u=(rnd()*2-1)*(W+.07),d=(rnd()*2-1)*(D+.07);add(u,H+R*(1-Math.abs(d)/D)+.015,d)}
  for(let k=0;k<3;k++){ // Gesimse zwischen den Geschossen
    for(let i=0;i<500;i++) add((rnd()*2-1)*W,H*(k+1)/3,D+.03,.02);}
  for(let i=0;i<900;i++){ // Außentreppe an der Giebelseite
    const t=rnd(),w=rnd()*.34; add(W+.06+w,t*H*.66,-D*.7+t*1.2,.02);
    if(rnd()<.5) add(W+.06+(rnd()<.5?0:.34),t*H*.66+.16,-D*.7+t*1.2,.015);}
  for(const [tx,tz] of [[-2.5,.9],[2.75,-.2],[-2.2,-1.3]]){ // Bäume
    for(let i=0;i<520;i++){const a=rnd()*6.283,b=Math.acos(rnd()*2-1),r=.42*Math.cbrt(rnd());
      add(tx+r*Math.sin(b)*Math.cos(a),.95+r*Math.cos(b)*1.15,tz+r*Math.sin(b)*Math.sin(a),.03);}
    for(let i=0;i<70;i++) add(tx,rnd()*.6,tz,.05);}
  for(let i=0;i<5200;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*3.6;if(rnd()<r/4)continue;add(Math.cos(a)*r,0,Math.sin(a)*r*.75,.01)}

  let w,h,dpr,t0=null,vis=true;
  const fmt=n=>n.toLocaleString('de-DE');
  function size(){dpr=Math.min(devicePixelRatio||1,2);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
  const X0=-3.7,X1=3.7,SCAN=5200;
  function draw(t){
    if(t0===null) t0=t; const el=t-t0;
    x.clearRect(0,0,w,h);
    const prog=still?1:Math.min(1,el/SCAN);
    const front=X0+(X1-X0)*prog;
    const ang=.58+(still?0:Math.sin(el*.00016)*.32),ca=Math.cos(ang),sa=Math.sin(ang);
    const tilt=.3,ct=Math.cos(tilt),st=Math.sin(tilt);
    const s=Math.min(w/6.3,h/3.7);
    let shown=0;const hot=[];
    for(let k=0;k<NB;k++){
      const a=B[k];x.fillStyle=COL[k];
      for(let i=0;i<a.length;i+=3){
        const px0=a[i]; if(px0>front) continue; shown++;
        const X=px0*ca-a[i+2]*sa,Z=px0*sa+a[i+2]*ca;
        const Y=a[i+1]*ct-Z*st,Zz=a[i+1]*st+Z*ct;
        const q=6/(6+Zz),sx=w*.5+X*s*q,sy=h*.74-Y*s*q;
        if(prog<1&&front-px0<.05){hot.push(sx,sy);continue}
        const r=1.25*q; x.fillRect(sx,sy,r,r);
      }
    }
    x.fillStyle='#fff';
    for(let i=0;i<hot.length;i+=2) x.fillRect(hot[i],hot[i+1],2,2);
    if(prog<1){countEl.textContent=fmt(shown*40)+' Punkte'}
    else{stateEl.textContent='Scan abgeschlossen';countEl.textContent=fmt(total*40)+' Punkte'}
    if(!still&&vis) requestAnimationFrame(draw);
  }
  new IntersectionObserver(e=>{const v=e[0].isIntersecting;if(v&&!vis&&!still){vis=true;requestAnimationFrame(draw)}vis=v}).observe(c);
  addEventListener('resize',()=>{size();if(still)requestAnimationFrame(draw)});
  size();requestAnimationFrame(draw);
})();
