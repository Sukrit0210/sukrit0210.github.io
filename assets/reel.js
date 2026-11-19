

(function(root){
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>{n=clamp(n);return n*n*n*(10+n*(-15+6*n));};
  const duration=5200,quietDuration=700;
  function state(age,reduced=false){
    if(reduced)return {age,gather:1,open:age<600?0:1,reveal:age<600?0:1,words:1,push:0,ui:age<700?0:1,done:age>=quietDuration};
    return {age,gather:ease((age-100)/1700),open:ease((age-1400)/3300),reveal:ease((age-2450)/2350),
      words:ease((age-650)/500)*(1-ease((age-2800)/700)),push:ease((age-2600)/1650),ui:ease((age-4500)/700),done:age>=duration};
  }
  function transport(origin,width,height,age){const s=state(age),centre=ease(age/1350),angle=s.gather*(1-s.open)*1.9;
    const tilt=s.gather*(1-s.open)*.95;
    return {age,cx:origin.x+(width*.5-origin.x)*centre,cy:origin.y+(height*.5-origin.y)*centre,
      ox:origin.x,oy:origin.y,cos:Math.cos(angle),sin:Math.sin(angle),pitchCos:Math.cos(tilt),pitchSin:Math.sin(tilt),
      gather:s.gather,shrink:(1-s.gather*.42)*(1-s.open),open:s.open,near:Math.sin(Math.PI*s.open)*s.push*.24,
      depthScale:Math.max(240,Math.min(width,height))};}
  function map(p,target,f,out={}){const dx=p.x-f.ox,dy=p.y-f.oy,rx=dx*f.cos-dy*f.sin,ry=dx*f.sin+dy*f.cos;
    const seed=Number.isFinite(p.seed)?p.seed:0;
    const near=p.edge?0:Math.sin(seed)*f.near;
    const depth=ry*f.pitchSin/f.depthScale;
    const perspective=1/(1-.3*Math.tanh(depth*.5*f.gather*(1-f.open)/.3));
    const loft=Math.sin(seed)*14*f.gather*(1-f.open);
    out.x=f.cx+rx*(f.shrink+near)*perspective+(target.x-f.cx)*f.open;
    out.y=f.cy+(ry*f.pitchCos+loft)*f.shrink*perspective+ry*near+(target.y-f.cy)*f.open;return out;}
  function point(p,target,origin,width,height,age,out={}){return map(p,target,transport(origin,width,height,age),out);}
  function question(age,size){const enter=ease((age-600)/720),row=ease((age-780)/720);
    return {scale:1,y:0,first:enter*(1-ease((age-2770)/760)),second:row*(1-ease((age-2890)/760)),gap:size*.65,
      firstLift:(1-enter)*10,secondLift:(1-row)*10,drift:0};}
  function clock(time,start,quiet=false){return Math.max(0,time-start)*(quiet?duration/quietDuration:1);}
  root.StudyMotion={clock,clamp,ease,state,point,transport,map,question,duration,quietDuration};
})(typeof globalThis!=='undefined'?globalThis:this);

// A deterministic conduction graph built from the captured thought strands.
// Times are absolute: skipped/delayed frames never restart or re-seed an impulse.
(function(root){
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(10+t*(-15+6*t));};
  function measure(points){let length=0;points.forEach((p,i)=>{if(i)length+=Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y);p.neuralArc=length;});return Math.max(1,length);}
  function plan(threads,origin,span){
    const hubs=new Map(),paths=[];
    const register=(id,p)=>{let n=hubs.get(id);if(!n){n={id,x:0,y:0,count:0,edges:[],at:Infinity};hubs.set(id,n);}n.x+=p.x;n.y+=p.y;n.count++;};
    threads.forEach(t=>{register(t.a,t.samples[0]);register(t.b,t.samples[t.samples.length-1]);});
    hubs.forEach(n=>{n.x/=n.count;n.y/=n.count;});
    threads.forEach((t,i)=>{
      const a=hubs.get(t.a),b=hubs.get(t.b);
      const points=[{x:a.x,y:a.y,visible:true,studyU:0},...t.samples.map((p,j)=>{p.studyU=j/(t.samples.length-1);return p;}),{x:b.x,y:b.y,visible:true,studyU:1}];
      const length=measure(points),path={a,b,points,length,arm:i%2,kind:'thread',weight:230+Math.min(850,length/span*440),index:i};
      paths.push(path);a.edges.push(path);b.edges.push(path);
    });
    const seeds=[0,4,8].filter(id=>hubs.has(id)),visited=new Set();
    // Every disconnected thought cluster receives one root, then branches through its own edges.
    for(const n of hubs.values())if(!visited.has(n.id)){
      const stack=[n],component=[];while(stack.length){const a=stack.pop();if(visited.has(a.id))continue;visited.add(a.id);component.push(a.id);a.edges.forEach(e=>stack.push(e.a===a?e.b:e.a));}
      if(!component.some(id=>seeds.includes(id)))seeds.push(component[0]);
    }
    const rootNode={x:origin.x,y:origin.y,at:70};
    seeds.forEach((id,i)=>{
      const b=hubs.get(id),points=Array.from({length:13},(_,j)=>{const t=j/12;return{x:origin.x+(b.x-origin.x)*t,y:origin.y+(b.y-origin.y)*t,visible:true,seed:i,studyU:t};});
      const length=measure(points),weight=140+length/span*270;
      b.at=rootNode.at+weight;paths.push({a:rootNode,b,points,length,weight,arm:i%2,kind:'root',index:threads.length+i});
    });
    const pending=new Set(hubs.values());
    while(pending.size){let node;for(const n of pending)if(!node||n.at<node.at)node=n;pending.delete(node);
      node.edges.forEach(e=>{const other=e.a===node?e.b:e.a;if(node.at+e.weight<other.at)other.at=node.at+e.weight;});}
    let end=0;
    paths.forEach(path=>{path.reverse=path.a.at>path.b.at;path.start=Math.min(path.a.at,path.b.at);path.duration=path.weight;end=Math.max(end,path.start+path.duration);});
    const scale=1800/Math.max(1800,end);
    paths.forEach(path=>{path.start*=scale;path.duration*=scale;path.arrive=path.start+path.duration;});
    return {paths,seedCount:seeds.length,nodeCount:hubs.size,end:end*scale};
  }
  function pulse(path,age,echo=false){
    const start=path.start+(echo?path.duration+120:0),travel=(age-start)/path.duration;
    const opacity=ease((age-start)/75)*(1-ease((age-start-path.duration)/150))*(echo?.22:1);
    return{head:Math.max(0,Math.min(1,travel)),tail:Math.max(0,Math.min(1,(age-start-105)/path.duration)),opacity,reverse:echo?!path.reverse:path.reverse};
  }
  function locate(path,u,out={}){
    const points=path.points,d=Math.max(0,Math.min(1,u))*path.length;let low=0,high=points.length-1;
    while(high-low>1){const middle=(low+high)>>1;if(points[middle].neuralArc<d)low=middle;else high=middle;}
    const a=points[low],b=points[high],t=(d-a.neuralArc)/Math.max(.0001,b.neuralArc-a.neuralArc);
    out.x=a.studyX+(b.studyX-a.studyX)*t;out.y=a.studyY+(b.studyY-a.studyY)*t;out.visible=a.visible&&b.visible;return out;
  }
  root.StudyNeural={plan,pulse,locate};
})(typeof globalThis!=='undefined'?globalThis:this);

// Glyph particles keep their source cell and destination for the whole journey.
(function(root){
  const clamp=t=>Math.max(0,Math.min(1,t));
  const ease=t=>{t=clamp(t);return t*t*t*(10+t*(-15+6*t));};
  function material(p,age,out={}){
    const appear=ease((age-p.enterAt)/620),release=ease((age-p.releaseAt)/310),fly=ease((age-p.releaseAt)/1550);
    const entry=(1-appear)*ease((age-p.enterAt+100)/180)*(1-release);
    out.appear=appear;out.release=release;out.fly=fly;out.ink=appear*(1-release);
    out.dust=Math.max(entry,release*(1-ease((fly-.76)/.24)));return out;
  }
  function rise(age,line){return (1-ease((age-600-line*180)/720))*10;}
  function point(p,target,age,width,height,fit=1,out={}){
    const m=material(p,age),arc=Math.sin(Math.PI*m.fly),span=Math.min(width,height);
    const x=width/2+p.x*fit,y=height/2+(p.y+rise(age,p.line))*fit;
    const coalesce=1-m.appear,spread=span*(.055+p.random*.075);
    out.x=x+(Math.cos(p.seed)*22+p.random*12)*coalesce*fit+(target.x-x)*m.fly+Math.cos(p.seed)*spread*arc;
    out.y=y+(14+Math.sin(p.seed)*14)*coalesce*fit+(target.y-y)*m.fly-(20+p.random*65)*arc+Math.sin(p.seed*1.7)*spread*.35*arc;
    return out;
  }
  function assembly(letter,age,height,out={}){
    const begin=470+letter.line*110+letter.index*6+letter.random*80;
    const progress=ease((age-begin)/800),scatter=1-progress,dir=letter.index%2?1:-1;
    const depth=(55+letter.random*85)*scatter;
    out.progress=progress;out.opacity=ease((age-begin)/200);out.scale=1/(1-depth/420);
    out.y=dir*(Math.min(190,height*.24)*(.45+letter.random*.55))*scatter;
    return out;
  }
  root.StudyText={material,rise,point,assembly};
})(typeof globalThis!=='undefined'?globalThis:this);

/* Decorative decoding rides the existing chapter typewriter; DOM headings stay intact. */
(function(root){
  const symbols=Array.from('アイウエオカキクケサシスセタチツナニハヒミムヤユラリワ');
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)'),forced=root.matchMedia?.('(forced-colors: active)');
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  function draw(paint,heading,dest,progress,opacity,age,theme){
    const characters=heading.glyphs.reduce((n,line)=>n+line.length,0),typed=clamp(progress)*characters;
    const font=`${heading.weight} ${heading.size}px ${heading.family}`;
    const quiet=reduced?.matches||forced?.matches;
    const tick=Math.floor(Math.max(0,age)/125),band=Math.min(3,Math.max(1,characters*.16));let index=0;
    paint.save();paint.textBaseline='alphabetic';
    heading.glyphs.forEach((line,row)=>{
      for(const glyph of line){
        const delta=typed-index,slot=index++;if(!glyph.letter.trim())continue;
        const x=dest.x+heading.textOffset+glyph.x,y=dest.top+heading.baseline+row*heading.lineHeight;
        if(delta>=0){
          paint.font=font;paint.fillStyle=glyph.colour||heading.colour;paint.globalAlpha=ease(delta/.8)*opacity;
          if(paint.globalAlpha>.001)paint.fillText(glyph.letter,x,y);
        }else if(!quiet&&age>=0&&delta>-band){
          paint.font=font;const width=paint.measureText(glyph.letter).width;
          paint.font=`400 ${heading.size*.8}px 'Yu Gothic','Meiryo','Noto Sans JP',sans-serif`;
          const symbol=symbols[(slot*7+tick*3)%symbols.length],sw=paint.measureText(symbol).width;
          paint.fillStyle=theme==='dark'?'#8acbc2':'#397e99';paint.globalAlpha=(1+delta/band)*.68*opacity;
          paint.save();paint.beginPath();paint.rect(x-1,y-heading.size,width+2,heading.size*1.2);paint.clip();
          paint.fillText(symbol,x+(width-sw)/2,y);paint.restore();
        }
      }
    });
    paint.restore();
  }
  root.ChapterDecode=Object.freeze({draw});
})(typeof globalThis!=='undefined'?globalThis:this);

// Elastic strands in weightless space: pinned ends, tensile neighbours,
// soft shape memory, local pressure and damping. No rendering or allocation in step().
(function(root){
  const fixed=1/120,tension=1800,bending=650,memory=42,drag=12;
  function create(count){
    const s={count,ready:false,accumulator:0,steps:0};
    for(const key of ['x','y','vx','vy','fx','fy','gx','gy','bx','by'])s[key]=new Float64Array(count);
    s.lengths=new Float64Array(count-1);s.weights=Float64Array.from({length:count},(_,i)=>Math.sin(Math.PI*i/(count-1)));return s;
  }
  function goal(s,i,x,y,bx=x,by=y){s.gx[i]=x;s.gy[i]=y;s.bx[i]=bx;s.by[i]=by;}
  function reset(s){
    s.x.set(s.gx);s.y.set(s.gy);s.vx.fill(0);s.vy.fill(0);
    s.accumulator=0;s.steps=0;s.ready=true;
  }
  function advance(s,dt,quiet=false,pointer=null){
    if(!s.ready||quiet){reset(s);return;}
    const n=s.count,last=n-1;
    for(let i=0;i<last;i++)s.lengths[i]=Math.max(.01,Math.hypot(s.bx[i+1]-s.bx[i],s.by[i+1]-s.by[i]));
    s.accumulator+=Math.max(0,Math.min(40,dt))/1000;s.steps=0;
    while(s.accumulator+1e-10>=fixed){
      s.accumulator-=fixed;s.steps++;
      s.x[0]=s.gx[0];s.y[0]=s.gy[0];s.x[last]=s.gx[last];s.y[last]=s.gy[last];
      for(let i=0;i<n;i++){s.fx[i]=(s.gx[i]-s.x[i])*memory;s.fy[i]=(s.gy[i]-s.y[i])*memory;}
      for(let i=0;i<last;i++){
        const dx=s.x[i+1]-s.x[i],dy=s.y[i+1]-s.y[i],length=Math.max(.01,Math.hypot(dx,dy));
        const f=tension*(length-s.lengths[i])/length,fx=dx*f,fy=dy*f;
        s.fx[i]+=fx;s.fy[i]+=fy;s.fx[i+1]-=fx;s.fy[i+1]-=fy;
      }
      const decay=Math.exp(-drag*fixed);
      for(let i=1;i<last;i++){
        // Preserve a soft resting curvature rather than letting compressed
        // segments buckle into high-frequency zigzags.
        s.fx[i]+=bending*(s.x[i-1]-2*s.x[i]+s.x[i+1]-(s.bx[i-1]-2*s.bx[i]+s.bx[i+1]));
        s.fy[i]+=bending*(s.y[i-1]-2*s.y[i]+s.y[i+1]-(s.by[i-1]-2*s.by[i]+s.by[i+1]));
        if(pointer?.active){
          const dx=s.x[i]-pointer.x,dy=s.y[i]-pointer.y,distance=Math.hypot(dx,dy);
          if(distance<pointer.radius){
            const u=1-distance/pointer.radius,force=900*u*u*(3-2*u)*s.weights[i];
            if(distance>1){s.fx[i]+=dx/distance*force;s.fy[i]+=dy/distance*force;}
            else {
              const tx=s.x[i+1]-s.x[i-1],ty=s.y[i+1]-s.y[i-1],span=Math.max(1,Math.hypot(tx,ty));
              s.fx[i]+=-ty/span*force;s.fy[i]+=tx/span*force;
            }
          }
        }
        s.vx[i]=(s.vx[i]+s.fx[i]*fixed)*decay;s.vy[i]=(s.vy[i]+s.fy[i]*fixed)*decay;
        s.x[i]+=s.vx[i]*fixed;s.y[i]+=s.vy[i]*fixed;
      }
    }
    // Endpoints follow the actual square/label at render time, even on a frame
    // with less than one physics step. Interior movement propagates through the chain.
    s.x[0]=s.gx[0];s.y[0]=s.gy[0];s.x[last]=s.gx[last];s.y[last]=s.gy[last];
  }
  function sample(s,t,out={}){
    const u=Math.max(0,Math.min(1,t))*(s.count-1),a=Math.floor(u),b=Math.min(a+1,s.count-1),mix=u-a;
    const before=Math.max(0,a-1),after=Math.min(s.count-1,b+1),t2=mix*mix,t3=t2*mix;
    const x=s.x,y=s.y;
    out.x=.5*(2*x[a]+(-x[before]+x[b])*mix+(2*x[before]-5*x[a]+4*x[b]-x[after])*t2+(-x[before]+3*x[a]-3*x[b]+x[after])*t3);
    out.y=.5*(2*y[a]+(-y[before]+y[b])*mix+(2*y[before]-5*y[a]+4*y[b]-y[after])*t2+(-y[before]+3*y[a]-3*y[b]+y[after])*t3);
    out.visible=true;return out;
  }
  root.ThoughtStrings={create,goal,reset,advance,sample,parameters:{fixed,tension,bending,memory,drag}};
})(typeof globalThis!=='undefined'?globalThis:this);

// Bounded label retreat: find free space away from the pointer, without
// crossing neighbouring labels. The caller supplies the damped movement.
(function(root){
  const angles=[0,.55,-.55,1.05,-1.05,Math.PI/2,-Math.PI/2],fractions=[1,.72,.4];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function penalty(x,y,box,obstacles,index){
    let total=0;
    for(const o of obstacles){
      if(o.index===index)continue;
      const dx=box.hw+o.hw+6-Math.abs(x-o.x),dy=box.hh+o.hh+6-Math.abs(y-o.y);
      if(dx>0&&dy>0)total+=dx*dy;
    }
    return total;
  }
  function edgeDistance(x,y,box,pointer){return Math.hypot(Math.max(0,Math.abs(x-pointer.x)-box.hw),Math.max(0,Math.abs(y-pointer.y)-box.hh));}
  function pathClear(fromX,fromY,toX,toY,box,obstacles,index){
    let previous=penalty(fromX,fromY,box,obstacles,index);
    for(let j=1;j<=4;j++){
      const u=j/4,next=penalty(fromX+(toX-fromX)*u,fromY+(toY-fromY)*u,box,obstacles,index);
      if(next>.01&&next>=previous-.01)return false;
      previous=next;
    }
    return previous<.01;
  }
  function aim(base,motion,pointer,box,bounds,obstacles,index,range,reach,active,out=motion){
    const x=base.x+motion.x,y=base.y+motion.y,distance=edgeDistance(x,y,box,pointer);
    const u=clamp(distance/range,0,1),strength=active?1-u*u*(3-2*u):0;
    out.strength=strength;
    out.aimX=motion.x;out.aimY=motion.y;
    if(strength<.002){
      const bx=clamp(base.x,bounds.left,bounds.right),by=clamp(base.y,bounds.top,bounds.bottom);
      if(pathClear(x,y,bx,by,box,obstacles,index)){out.aimX=bx-base.x;out.aimY=by-base.y;}
      return out;
    }
    let dx=x-pointer.x,dy=y-pointer.y;
    if(Math.hypot(dx,dy)<2){dx=base.x-pointer.cx;dy=base.y-pointer.cy;}
    const length=Math.max(1,Math.hypot(dx,dy));dx/=length;dy/=length;
    let best=-Infinity;
    for(const angle of angles){const c=Math.cos(angle),s=Math.sin(angle),nx=dx*c-dy*s,ny=dx*s+dy*c;
      for(const fraction of fractions){
        const travel=reach*strength*fraction;
        const tx=clamp(base.x+nx*travel,bounds.left,bounds.right),ty=clamp(base.y+ny*travel,bounds.top,bounds.bottom);
        if(!pathClear(x,y,tx,ty,box,obstacles,index))continue;
        const away=edgeDistance(tx,ty,box,pointer);
        const score=away+((tx-base.x)*dx+(ty-base.y)*dy)*.14-Math.hypot(tx-base.x,ty-base.y)*.02;
        if(score>best){best=score;out.aimX=tx-base.x;out.aimY=ty-base.y;}
      }
    }
    return out;
  }
  root.ThoughtEvasion={aim,penalty};
})(typeof globalThis!=='undefined'?globalThis:this);

/* V6.14: preserve the full scene; touch gestures must reveal the greeting first. */
(() => {
  const reel = document.getElementById('intro-reel');
  const model = document.getElementById('reel-model');
  const surface = document.getElementById('reel-webgl');
  const core = document.getElementById('reel-core');
  const marker = document.getElementById('reel-cursor');
  const header = document.querySelector('.nav-wrap');
  const portfolioContent=document.getElementById('main-content');
  const introHeader=document.querySelector('.reel-header');
  const title = document.getElementById('reel-title');
  const galaxyInterface=document.getElementById('galaxy-interface');
  const galaxyTrack=document.getElementById('scroll-track');
  model.inert=true;
  galaxyTrack.inert=true;
  galaxyInterface.inert=true;
  if(portfolioContent)portfolioContent.inert=true;
  header.setAttribute('aria-hidden','true');
  // The full document has real scrollable sections beyond the galaxy.
  window.scrollTo?.({top:galaxyTrack.offsetTop||0,behavior:'instant'});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');
  canvas.style.pointerEvents = 'none';
  surface.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  // All new scenery is decorative and lives behind the existing hit targets.
  const atmosphereCanvas=document.createElement('canvas');
  atmosphereCanvas.setAttribute('aria-hidden','true');
  Object.assign(atmosphereCanvas.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'0'});
  surface.appendChild(atmosphereCanvas);
  Object.assign(canvas.style,{position:'relative',zIndex:'1'});
  const atmosphereCtx=atmosphereCanvas.getContext('2d');
  const depthCanvas=document.createElement('canvas');
  depthCanvas.setAttribute('aria-hidden','true');
  Object.assign(depthCanvas.style,{position:'absolute',inset:'0',zIndex:'0',pointerEvents:'none',filter:'blur(.7px)',opacity:'.8'});
  surface.appendChild(depthCanvas);
  const depthCtx=depthCanvas.getContext('2d');
  const detailCanvas=document.createElement('canvas');
  detailCanvas.setAttribute('aria-hidden','true');detailCanvas.setAttribute('data-layer','thought-detail');
  Object.assign(detailCanvas.style,{position:'absolute',inset:'0',zIndex:'1',pointerEvents:'none'});
  surface.appendChild(detailCanvas);
  canvas.style.zIndex='2';
  const detailCtx=detailCanvas.getContext('2d');
  const departureCanvas=document.createElement('canvas');
  departureCanvas.setAttribute('aria-hidden','true');
  Object.assign(departureCanvas.style,{position:'fixed',inset:'0',zIndex:'100',pointerEvents:'none',opacity:'0'});
  document.body.appendChild(departureCanvas);
  const departureCtx=departureCanvas.getContext('2d');
  // Keep the opening text cheap: prepare visible buffers in separate idle tasks.
  // The full-resolution departure buffer is only needed after centre activation.
  const sceneSurfaces=[[canvas,ctx,2],[atmosphereCanvas,atmosphereCtx,1],
    [depthCanvas,depthCtx,1],[detailCanvas,detailCtx,2]];
  for(const [target] of [...sceneSurfaces,[departureCanvas]])target.width=target.height=1;
  function sizeSurface(target,paint,cap) {
    const dpr=Math.min(devicePixelRatio||1,cap);
    const w=Math.round(width*dpr),h=Math.round(height*dpr);
    if(target.width!==w||target.height!==h) {
      target.width=w;target.height=h;paint?.setTransform(dpr,0,0,dpr,0,0);
      if(paint)paint.particleRgb=null;
    }
    target.style.width=width+'px';target.style.height=height+'px';
  }
  function ensureSceneSurfaces() {
    for(const [target,paint,cap] of sceneSurfaces)sizeSurface(target,paint,cap);
  }
  const duringIdle=fn=>window.requestIdleCallback?window.requestIdleCallback(fn,{timeout:250}):setTimeout(fn,80);
  function prewarmSurfaces(index=0) {
    if(phase!=='title'||index>=sceneSurfaces.length)return;
    duringIdle(()=> {
      if(phase!=='title')return;
      sizeSurface(...sceneSurfaces[index]);prewarmSurfaces(index+1);
    });
  }
  const bridgeDots=Array.from({length:3},()=> {
    const dot=document.createElement('div');dot.className='reel-bridge-dot';
    dot.setAttribute('aria-hidden','true');reel.appendChild(dot);return dot;
  });
  let bridgeOrigins=[],bridgeDotSize=8;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const smooth = n => { n = clamp(n,0,1); return n*n*(3-2*n); };
  // Pointer-driven deformation is taut and local; the independent atmosphere
  // and noise clocks keep their established slow movement.
  function thoughtInteractionRadius(){return clamp(Math.min(width,height)*.14,68,126);}
  function updateThoughtEnergy(point,target,dt){
    const tau=target>point.energy?24:38;
    point.energy+=(target-point.energy)*(reduced?1:1-Math.exp(-dt/tau));
    if(target===0&&point.energy<.001)point.energy=0;
  }
  const filmEase=n=>{n=clamp(n,0,1);return n*n*n*(10+n*(-15+6*n));};
  const addRaySpan=(bucket,a,b)=>{
    if(bucket.length&&bucket[bucket.length-1]===a)bucket[bucket.length-1]=b;
    else bucket.push(a,b);
  };
  // Keep exact per-particle alpha without allocating/parsing an RGBA colour string
  // for each speck. Restore alpha before strokes and non-particle artwork.
  const particleColors=new Map();
  function paintParticle(paint,rgb,alpha,x,y,w,h=w) {
    if(paint.particleRgb!==rgb) {
      if(!particleColors.has(rgb))particleColors.set(rgb,'rgb('+rgb+')');
      paint.fillStyle=particleColors.get(rgb);paint.particleRgb=rgb;
    }
    paint.globalAlpha=alpha;paint.fillRect(x,y,w,h);
  }
  // Value noise changes destinations gently; no jumps or repeated uniform sway.
  const noiseAt=(time,seed)=> {
    const n=Math.floor(time),t=smooth(time-n);
    const hash=k=> {const v=Math.sin(k*127.1+seed*311.7)*43758.5453;return (v-Math.floor(v))*2-1;};
    return hash(n)*(1-t)+hash(n+1)*t;
  };
  const nodes = [
    {text:'CURIOSITY',x:.40,y:.16},
    {text:'MACHINE INTELLIGENCE',x:.83,y:.24},
    {text:'IMAGINATION',x:.88,y:.56},
    {text:'EXPLORATION',x:.68,y:.83},
    {text:'SYSTEMS THINKING',x:.19,y:.78},
    {text:'PATTERN SEEKING',x:.12,y:.57},
    {text:'RESEARCH',x:.17,y:.31},
    {text:'STATISTICS',x:.57,y:.18},
    {text:'NIGHT OWL',x:.62,y:.32,ghost:true},
    {text:'A LITTLE OBSESSED',x:.80,y:.42,ghost:true},
    {text:'DETAIL FREAK',x:.79,y:.71,ghost:true},
    {text:'ONE MORE TRY',x:.37,y:.89,ghost:true},
    {text:'OVERTHINKER',x:.29,y:.65,ghost:true},
    {text:'LOST IN THOUGHT',x:.29,y:.43,ghost:true}
  ];
  let seed = 9381;
  const random = () => ((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  let width=innerWidth,height=innerHeight,phase='title',frameId=0,start=0,sceneStart=0,run=0,motionToken=null,handoffTargetsReadyAt=null;
  let px=0,py=0,pointerInside=false,pointerFine=true,dragging=false,lastX=0,lastY=0;
  let cursorX=0,cursorY=0,cursorReady=false;
  function positionCursor() {
    if(document.documentElement.classList.contains('site-pointer-ready'))return;
    marker.style.transform=`translate3d(${cursorX.toFixed(2)}px,${cursorY.toFixed(2)}px,0) translate(-50%,-50%)`;
  }
  let shiftX=0,shiftY=0,dragX=0,dragY=0,coreGrowth=0,coreVelocity=0,lastFrameTime=0;
  let currentCore={x:width/2,y:height/2,size:12},corePress=null,lastCoreActivation=-Infinity;
  let coreFollowX=0,coreFollowY=0;
  const coreFollowMotion={x:0,y:0};
  let cinemaTime=0,attention=0;
  const nodeMotion=nodes.map(()=>({x:0,y:0}));
  const evasionBoxes=nodes.map((_,index)=>({index,x:0,y:0,hw:0,hh:0}));
  evasionBoxes.push({index:-1,x:0,y:0,hw:36,hh:36});
  const evasionPointer={x:0,y:0,cx:0,cy:0};
  const evasionBounds={left:0,right:0,top:0,bottom:0};
  let transitionStart=0,handoffStart=0,handoffOrigin=null,departureParticles=[],departureEndpoints=[];
  let seedOrigin={x:width/2,y:height/2};
  const rays = [];
  const stringPointer={x:0,y:0,radius:0,active:false};
  const stringPoint={x:0,y:0};
  const particlesPerRay=224;
  let scrollIntent=0,lastScrollAt=0,touchScroll=null;
  let greetingReadTime=0,suppressCoreClick=false,wheelGreetingGesture=false;
  const labels = nodes.map((node,index) => {
    const label=document.createElement('span');
    label.className='reel-label '+(node.ghost?'is-secondary':'is-primary');
    label.textContent=node.text;
    label.style.setProperty('--i',index);
    label.style.setProperty('--arrival-delay',(node.ghost?500+index*11:250+index*20)+'ms');
    model.appendChild(label);
    return label;
  });
  let labelMetrics=[],fieldHeaderBottom=64;
  let compactLabelLayout=null;
  function measureLabels() {
    compactLabelLayout=null;
    // Read layout together, before any frame writes; all painters reuse these bounds.
    labelMetrics=labels.map((label,i)=>({w:label.offsetWidth||nodes[i].text.length*(width<600?6:9),h:label.offsetHeight||18}));
    fieldHeaderBottom=introHeader?.getBoundingClientRect().bottom||64;
  }
  nodes.forEach((node,i)=>rays.push({node,index:i,alpha:node.ghost?.075:.22}));
  // Rectangle perimeter distribution includes explicit rays to all four corners.
  for (let i=0;i<32;i++) {
    const side=Math.floor(i/8),t=(i%8)/8;
    const node = side===0?{x:t,y:0}:side===1?{x:1,y:t}:side===2?{x:1-t,y:1}:{x:0,y:1-t};
    rays.push({node,index:-1,alpha:.018+random()*.055,edge:true});
  }
  for (const ray of rays) {
    ray.string=ThoughtStrings.create(25);
    ray.particles=Array.from({length:particlesPerRay},(_,i)=>({t:(i+.5)/particlesPerRay,dx:0,dy:0,energy:0,seed:random()*Math.PI*2}));
    ray.lineBuckets=Array.from({length:6},()=>[]);
  }
  // Stable topology with its own seed: the established idle and dust motion stay intact.
  let threadSeed=62317;
  const threadRandom=()=>((threadSeed=(threadSeed*1664525+1013904223)>>>0)/4294967296);
  // Connections cross between distant ideas; there are no circular tiers or adjacent-spoke rings.
  const edgeStart=nodes.length;
  const thoughtPairs=[[6,2],[5,1],[4,0],[3,6],[0,10],[11,1],[8,4],[12,2],[7,3],
    [9,5],[1,4],[2,11],[6,9],[0,13],[3,8],[5,10],[7,2],[13,1],
    ...[[0,16],[8,24],[4,20],[12,28],[2,18],[10,26]].map(([a,b])=>[edgeStart+a,edgeStart+b])];
  const webThreads=[];
  for(const [i,[a,b]] of thoughtPairs.entries()) {
    const loose=i>=18,loop=i%5===0;
    webThreads.push({a,b,loose,loop,layer:i%4,foreground:i===2||i===5||i===10||i===14,
      string:ThoughtStrings.create(33),
      u:loose?.72+threadRandom()*.2:.92+threadRandom()*.06,
      v:loose?.72+threadRandom()*.2:.92+threadRandom()*.06,
      seed:threadRandom()*Math.PI*2,
      orientation:threadRandom()*Math.PI*2,
      bend:(i%2?-1:1)*(.13+threadRandom()*.11),
      span:.65+threadRandom()*.5,
      alpha:loose?.07+threadRandom()*.05:.17+threadRandom()*.08,
      samples:Array.from({length:65},(_,j)=>({t:j/64,x:0,y:0,dx:0,dy:0,energy:0,visible:true,seed:threadRandom()*Math.PI*2})),
      buckets:Array.from({length:6},()=>[])
    });
  }
  const foregroundThoughtThreads=webThreads.filter(thread=>thread.foreground);
  let departureWeb=[];
  const thoughtFocus=nodes.map(()=>({value:0}));
  let thoughtActive=-1,thoughtSignalAge=2000;
  function updateThoughtResponse(endpoints,dt) {
    let active=-1,best=Infinity;
    if(pointerInside&&pointerFine&&phase==='model') {
      for(let i=0;i<nodes.length;i++) {
        const p=endpoints[i],metric=labelMetrics[i];
        const distance=Math.hypot(Math.max(0,Math.abs(px-p.x)-metric.w/2),Math.max(0,Math.abs(py-p.y)-metric.h/2));
        if(distance<64&&distance<best){best=distance;active=i;}
      }
      if(coreGrowth>.65)active=-2;
    }
    if(core.classList.contains('is-armed')||core.matches(':focus-visible'))active=-2;
    if(active!==thoughtActive){thoughtActive=active;thoughtSignalAge=0;}
    else thoughtSignalAge=Math.min(2200,thoughtSignalAge+dt);
    for(let i=0;i<nodes.length;i++) {
      const linked=active>=0&&thoughtPairs.some(([a,b])=>a===active&&b===i||b===active&&a===i);
      const target=active===i?1:linked?.28:active===-2&&!nodes[i].ghost?.18:0;
      const value=SceneResponse.spring(thoughtFocus[i],'value',target,dt,35,reduced);
      labels[i].style.setProperty('--thought-focus',value.toFixed(3));
    }
  }
  function thoughtSignalClearance(x,y) {
    // Only test the already-visible foreground segments while a pulse is active.
    // The small shoulder makes the head dim and recover at actual crossings.
    const radius=3.6,maxDistance=radius*radius;
    let nearest=maxDistance;
    for(const thread of foregroundThoughtThreads) {
      if(thread.strokeOpacity<.025)continue;
      for(let level=1;level<6;level++) {
        const bucket=thread.buckets[level];
        for(let i=0;i<bucket.length;i+=2) {
          const a=bucket[i],b=bucket[i+1],ax=a.x+a.dx*.15,ay=a.y+a.dy*.15,bx=b.x+b.dx*.15,by=b.y+b.dy*.15;
          if(x<Math.min(ax,bx)-radius||x>Math.max(ax,bx)+radius||y<Math.min(ay,by)-radius||y>Math.max(ay,by)+radius)continue;
          const vx=bx-ax,vy=by-ay;
          const t=clamp(((x-ax)*vx+(y-ay)*vy)/Math.max(.001,vx*vx+vy*vy),0,1);
          const dx=x-ax-vx*t,dy=y-ay-vy*t;
          nearest=Math.min(nearest,dx*dx+dy*dy);
        }
      }
    }
    return .17+.83*smooth(Math.sqrt(nearest/maxDistance));
  }
  function drawThoughtSignals(center,endpoints,inkRgb,unfold,foreground=false) {
    if(reduced||thoughtActive===-1||thoughtSignalAge>=1700||(foreground&&thoughtActive<0))return;
    const age=thoughtSignalAge;
    ctx.save();ctx.strokeStyle=`rgb(${inkRgb})`;ctx.fillStyle=`rgb(${inkRgb})`;ctx.lineWidth=.95;
    // A single impulse runs from the hub to the thought, then branches along
    // its existing curved connections. No additional topology or cursor light.
    const trace=(sample,start,duration,strength)=>{
      const u=(age-start)/duration;if(u<=0||u>=1)return;
      const head=sample(u),tail=Math.max(0,u-.13);
      if(!head.visible)return;
      ctx.globalAlpha=Math.sin(Math.PI*u)*strength*unfold;ctx.beginPath();
      let drawing=false;
      for(let j=0;j<=6;j++) {
        const p=sample(tail+(u-tail)*j/6);
        if(!p.visible){drawing=false;continue;}
        if(drawing)ctx.lineTo(p.x,p.y);else{ctx.moveTo(p.x,p.y);drawing=true;}
      }
      ctx.stroke();
      if(!foreground)ctx.globalAlpha*=thoughtSignalClearance(head.x,head.y);
      ctx.beginPath();ctx.arc(head.x,head.y,1.15,0,Math.PI*2);ctx.fill();
    };
    if(!foreground)for(let i=0;i<nodes.length;i++) {
      if(thoughtActive!==i&&!(thoughtActive===-2&&i%2===0&&!nodes[i].ghost))continue;
      const tip=rayTip(center,endpoints[i],rays[i]);
      trace(u=>rays[i].string.ready?ThoughtStrings.sample(rays[i].string,u):({x:center.x+(tip.x-center.x)*u,y:center.y+(tip.y-center.y)*u,visible:true}),i===thoughtActive?0:i*22,680,.7);
    }
    if(thoughtActive>=0)for(const thread of webThreads) {
      if(thread.foreground!==foreground||(thread.a!==thoughtActive&&thread.b!==thoughtActive))continue;
      trace(u=>{
        const t=(thread.a===thoughtActive?u:1-u)*(thread.samples.length-1),i=Math.floor(t);
        const a=thread.samples[i],b=thread.samples[Math.min(i+1,thread.samples.length-1)],f=t-i;
        return {x:a.x+a.dx*.15+(b.x+b.dx*.15-a.x-a.dx*.15)*f,
          y:a.y+a.dy*.15+(b.y+b.dy*.15-a.y-a.dy*.15)*f,visible:a.visible&&b.visible};
      },440,920,.62);
    }
    ctx.restore();
  }
  // A separate seeded material layer follows the established curves, rather than filling
  // the canvas with uniform noise. It never adds another hit target or cursor light.
  let materialSeed=91307;
  const materialRandom=()=>((materialSeed=(materialSeed*1664525+1013904223)>>>0)/4294967296);
  const thoughtMaterial=webThreads.map((thread,i)=>({thread,
    filaments:Array.from({length:innerWidth<600?1:2},(_,j)=>({
      offset:(j?1:-1)*(8+materialRandom()*26),wave:3+materialRandom()*6,
      frequency:1.5+materialRandom()*2,phase:materialRandom()*Math.PI*2,
      depth:.3+materialRandom()*.55,alpha:.065+materialRandom()*.075,
      points:Array.from({length:65},()=>({x:0,y:0,visible:false,energy:0}))
    })),
    grains:Array.from({length:innerWidth<600?64:160},()=>({
      index:Math.floor(materialRandom()*63)+1,
      offset:(materialRandom()-.5)*(16+Math.pow(materialRandom(),2)*100),
      along:(materialRandom()-.5)*25,phase:materialRandom()*Math.PI*2,
      alpha:.04+materialRandom()*.13,size:.35+materialRandom()*.5,
      x:0,y:0,visible:false
    })),
    signals:Array.from({length:i<18?2:1},()=>({phase:materialRandom(),speed:.013+materialRandom()*.013})),
    normals:Array.from({length:65},()=>({x:0,y:0}))
  }));
  let weavePresence=0;
  const modelBranches=thoughtMaterial.flatMap((material,r)=>
    Array.from({length:innerWidth<600?1:2},(_,variant)=>({
      a:material.thread.samples,
      b:webThreads[(r+7+variant*5)%webThreads.length].samples,
      ia:9+Math.floor(materialRandom()*40),ib:9+Math.floor(materialRandom()*40),
      depth:.18+materialRandom()*.74,
      bow:(materialRandom()>.5?1:-1)*(.16+materialRandom()*.20),
      phase:materialRandom()*Math.PI*2,
      alpha:.08+materialRandom()*.085,
      speed:.018+materialRandom()*.014,
      points:Array.from({length:41},(_,i)=>({t:i/40,x:0,y:0,visible:false,energy:0,
        grainA:(materialRandom()-.5)*23,grainB:(materialRandom()-.5)*35,
        along:(materialRandom()-.5)*14,grainAlpha:.045+materialRandom()*.105
      })),
      buckets:Array.from({length:6},()=>[])
    })));
  function drawModelWeave(paint,time,center,bounds,intensity,world,fieldRadius,dustRgb,sparkRgb,dt) {
    if(phase==='bridge'||phase==='title')return;
    if(phase==='model')weavePresence=reduced?1:smooth((time-start-150)/1400);
    if(weavePresence<=0)return;
    const elapsed=reduced?0:cinemaTime*.001;
    const strength=intensity*weavePresence;
    for(const branch of modelBranches) {
      const a=branch.a[branch.ia],b=branch.b[branch.ib];
      const ahead=branch.a[branch.ia+1],behind=branch.b[branch.ib-1];
      const length=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
      const reach=Math.min(Math.min(width,height)*.16,length*.48+12);
      const la=Math.max(1,Math.hypot(ahead.x-a.x,ahead.y-a.y)),lb=Math.max(1,Math.hypot(b.x-behind.x,b.y-behind.y));
      const bend=Math.min(length,240)*branch.bow;
      const drift=reduced?0:noiseAt(elapsed*.024,branch.phase)*8*branch.depth;
      const parallaxX=shiftX*(branch.depth-.5)*.48,parallaxY=shiftY*(branch.depth-.5)*.48;
      const c1x=a.x+(ahead.x-a.x)/la*reach+nx*bend+drift;
      const c1y=a.y+(ahead.y-a.y)/la*reach+ny*bend;
      const c2x=b.x-(b.x-behind.x)/lb*reach-nx*bend*.55-drift;
      const c2y=b.y-(b.y-behind.y)/lb*reach-ny*bend*.55;
      branch.buckets.forEach(bucket=>{bucket.length=0;});
      for(const p of branch.points) {
        const t=p.t,q=1-t;
        p.x=q*q*q*a.x+3*q*q*t*c1x+3*q*t*t*c2x+t*t*t*b.x+parallaxX;
        p.y=q*q*q*a.y+3*q*q*t*c1y+3*q*t*t*c2y+t*t*t*b.y+parallaxY;
        p.visible=pointClear(p.x,p.y,bounds,center);
        const distance=Math.hypot(p.x-px,p.y-py);
        const influence=pointerInside&&phase==='model'?1-smooth(distance/fieldRadius):0;
        updateThoughtEnergy(p,influence,dt);
        if(p.visible&&p.energy>.015) {
          const point=world({x:p.x+nx*p.energy*6,y:p.y+ny*p.energy*6});
          paintParticle(paint,sparkRgb,p.energy*.37*strength,point.x,point.y,.7);
        }
        // Sparse, unequal feathering follows the connective strand, not the viewport.
        const taper=Math.sin(t*Math.PI);
        for(const offset of [p.grainA,p.grainB]) {
          const x=p.x+nx*offset*taper-ny*p.along,y=p.y+ny*offset*taper+nx*p.along;
          if(!pointClear(x,y,bounds,center))continue;
          const point=world({x,y});
          const size=.35+branch.depth*.3;
          paintParticle(paint,dustRgb,p.grainAlpha*strength*taper*(1-p.energy*.6),point.x,point.y,size);
        }
      }
      for(let i=0;i<branch.points.length-1;i++) {
        const a=branch.points[i],b=branch.points[i+1];if(!a.visible||!b.visible)continue;
        branch.buckets[Math.round((1-(a.energy+b.energy)/2)*5)].push(a,b);
      }
      for(let level=1;level<6;level++) {
        const bucket=branch.buckets[level];if(!bucket.length)continue;
        paint.strokeStyle=`rgba(${dustRgb},${branch.alpha*(level/5)*strength})`;
        paint.lineWidth=.29+branch.depth*.12;paint.beginPath();
        for(let i=0;i<bucket.length;i+=2) {
          const a=world(bucket[i]),b=world(bucket[i+1]);paint.moveTo(a.x,a.y);paint.lineTo(b.x,b.y);
        }
        paint.globalAlpha=1;paint.stroke();
      }
      // Tiny packets travel in opposed directions on near and distant branches.
      const progress=(branch.phase/(Math.PI*2)+elapsed*branch.speed)%1;
      const along=(branch.depth>.5?progress:1-progress)*39,index=Math.floor(along),fraction=along-index;
      const first=branch.points[index],second=branch.points[index+1];
      const x=first.x+(second.x-first.x)*fraction,y=first.y+(second.y-first.y)*fraction;
      if(first.energy<.15&&pointClear(x,y,bounds,center)) {
        for(let j=0;j<3;j++) {
          const packetX=x+nx*j*1.7,packetY=y+ny*j*1.7;
          if(!pointClear(packetX,packetY,bounds,center))continue;
          const point=world({x:packetX,y:packetY});
          paintParticle(paint,sparkRgb,Math.sin(progress*Math.PI)*(.35-j*.11)*strength,point.x,point.y,.9);
        }
      }
    }
  }
  const thoughtKnots=new Map();let lastKnotScan=-Infinity,lastDetailPaint=-Infinity,lastDetailTheme=null;
  function pointClear(x,y,bounds,center) {
    const dx=x-center.x,dy=y-center.y;
    return dx*dx+dy*dy>28*28&&labelClear(x,y,bounds);
  }
  function labelClear(x,y,bounds) {
    // Exact rectangle checks, narrowed to the labels sharing a 64px spatial cell.
    // Every grain remains present; there is no coarser approximation of its position.
    let grid=bounds.grid;
    if(!grid) {
      grid=bounds.grid=new Map();
      for(const b of bounds) {
        for(let gx=Math.floor((b.x-b.w)/64);gx<=Math.floor((b.x+b.w)/64);gx++)
          for(let gy=Math.floor((b.y-b.h)/64);gy<=Math.floor((b.y+b.h)/64);gy++) {
            const key=gx*65536+gy;
            if(!grid.has(key))grid.set(key,[]);
            grid.get(key).push(b);
          }
      }
    }
    const nearby=grid.get(Math.floor(x/64)*65536+Math.floor(y/64));
    if(nearby)for(const b of nearby)if(Math.abs(x-b.x)<b.w&&Math.abs(y-b.y)<b.h)return false;
    return true;
  }
  function updateThoughtKnots(time,ready) {
    if(!ready||time-lastKnotScan<900)return;
    lastKnotScan=time;thoughtKnots.forEach(knot=>{knot.target=0;});
    const grid=new Map();
    let found=0;
    for(let r=0;r<18;r++)for(let i=4;i<61;i+=4) {
      const p=webThreads[r].samples[i];if(!p.visible)continue;
      const gx=Math.floor(p.x/18),gy=Math.floor(p.y/18);
      for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++) {
        const neighbours=grid.get(x+','+y);if(!neighbours)continue;
        for(const other of neighbours) {
          if(other.r===r||Math.hypot(p.x-other.p.x,p.y-other.p.y)>12||found>=10)continue;
          const key=other.r+':'+r;
          if(thoughtKnots.get(key)?.target)continue;
          let knot=thoughtKnots.get(key);
          if(!knot) {
            knot={a:other.p,b:p,energy:0,target:1,phase:materialRandom()*Math.PI*2,
              grains:Array.from({length:32},()=>({
                x:(materialRandom()-.5)*28,y:(materialRandom()-.5)*10,
                alpha:.06+materialRandom()*.21,size:.35+materialRandom()*.65
              }))};
            thoughtKnots.set(key,knot);
          }
          knot.a=other.p;knot.b=p;knot.target=1;found++;
        }
      }
      const key=gx+','+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push({r,p});
    }
  }
  function drawThoughtDetail(time,center,endpoints,dt) {
    const dark=document.documentElement?.getAttribute('data-theme')==='dark';
    // The slow material layer is cached between paints; the main interaction stays on RAF.
    if(time===lastDetailPaint&&dark===lastDetailTheme)return;
    dt=clamp(time-lastDetailPaint,1,100);lastDetailPaint=time;lastDetailTheme=dark;
    const paint=detailCtx;paint.clearRect(0,0,width,height);
    if(phase==='title'||phase==='gone')return;
    const arrival=reduced?1:smooth((time-sceneStart-230)/1000);
    if(arrival<=0)return;
    const departing=phase==='question'||phase==='handoff',age=time-transitionStart;
    const departure=departing?1-smooth((age-100)/1150):1;
    if(departure<=0)return;
    const gather=departing?smooth(age/2200):0,scale=1-gather*.38;
    const origin=departing?handoffOrigin:center;
    const cx=origin.x+(width/2-origin.x)*gather,cy=origin.y+(height/2-origin.y)*gather;
    const world=p=>({x:cx+(p.x-origin.x)*scale,y:cy+(p.y-origin.y)*scale});
    const dustRgb=dark?'132,174,155':'56,91,139',sparkRgb=dark?'234,241,234':'27,82,153';
    const bounds=labelMetrics.map((metric,i)=>({x:endpoints[i].x,y:endpoints[i].y,w:metric.w/2+11,h:metric.h/2+9}));
    const elapsed=reduced?0:cinemaTime*.001;
    const fieldRadius=thoughtInteractionRadius();
    const intensity=arrival*departure*(1-attention*.12);
    drawModelWeave(paint,time,center,bounds,intensity,world,fieldRadius,dustRgb,sparkRgb,dt);
    for(const material of thoughtMaterial) {
      const samples=material.thread.samples,normals=material.normals;
      for(let i=0;i<samples.length;i++) {
        const before=samples[Math.max(0,i-1)],after=samples[Math.min(64,i+1)];
        const vx=after.x-before.x,vy=after.y-before.y,length=Math.max(1,Math.hypot(vx,vy));
        normals[i].x=-vy/length;normals[i].y=vx/length;
      }
      for(const filament of material.filaments) {
        paint.strokeStyle=`rgba(${dustRgb},${filament.alpha*intensity})`;
        paint.lineWidth=.32+filament.depth*.17;paint.beginPath();
        const drift=reduced?0:noiseAt(elapsed*.035,filament.phase)*4;
        for(let i=0;i<samples.length;i++) {
          const p=samples[i],normal=normals[i],t=i/64;
          const taper=Math.sin(t*Math.PI);
          const wave=Math.sin(t*Math.PI*2*filament.frequency+filament.phase+elapsed*.075);
          const offset=(filament.offset+wave*filament.wave)*taper;
          const x=p.x+normal.x*offset+shiftX*(filament.depth-.5)*.18+drift;
          const y=p.y+normal.y*offset+shiftY*(filament.depth-.5)*.18;
          const f=filament.points[i];f.x=x;f.y=y;
          f.visible=i>1&&i<63&&pointClear(x,y,bounds,center);
          const distance=Math.hypot(x-px,y-py);
          const influence=pointerInside&&phase==='model'?1-smooth(distance/fieldRadius):0;
          updateThoughtEnergy(f,influence,dt);
          if(i>0&&f.visible&&filament.points[i-1].visible&&f.energy<.30) {
            const a=world(filament.points[i-1]),b=world(f);
            paint.moveTo(a.x,a.y);paint.lineTo(b.x,b.y);
          }
          if(f.visible&&f.energy>.015) {
            const point=world({x:x+normal.x*f.energy*5,y:y+normal.y*f.energy*5});
            paintParticle(paint,sparkRgb,f.energy*.34*intensity,point.x,point.y,.65);
          }
        }
        paint.globalAlpha=1;paint.stroke();
      }
      for(const grain of material.grains) {
        const p=samples[grain.index],normal=normals[grain.index];
        const flutter=reduced?0:Math.sin(elapsed*.19+grain.phase)*2.4;
        grain.x=p.x+normal.x*(grain.offset+flutter)-normal.y*grain.along;
        grain.y=p.y+normal.y*(grain.offset+flutter)+normal.x*grain.along;
        grain.visible=pointClear(grain.x,grain.y,bounds,center);
        if(!grain.visible)continue;
        const distance=Math.hypot(grain.x-px,grain.y-py);
        const influence=pointerInside&&phase==='model'?1-smooth(distance/fieldRadius):0;
        const point=world({x:grain.x+normal.x*influence*3,y:grain.y+normal.y*influence*3});
        paintParticle(paint,dustRgb,grain.alpha*intensity*(1-influence*.5),point.x,point.y,grain.size);
      }
      for(const signal of material.signals) {
        const t=(signal.phase+elapsed*signal.speed)%1,index=Math.floor(t*63)+1;
        const a=samples[index],b=samples[index+1],fraction=t*63-Math.floor(t*63);
        const x=a.x+(b.x-a.x)*fraction,y=a.y+(b.y-a.y)*fraction;
        if(!pointClear(x,y,bounds,center)||a.energy>.12)continue;
        const point=world({x,y}),edgeFade=Math.sin(t*Math.PI);
        paintParticle(paint,sparkRgb,edgeFade*.48*intensity,point.x,point.y,1.05);
      }
    }
    updateThoughtKnots(time,phase==='model'&&arrival>.9);
    thoughtKnots.forEach((knot,key)=> {
      const distance=Math.hypot(knot.a.x-knot.b.x,knot.a.y-knot.b.y);
      const target=knot.target*(1-smooth(distance/28));
      knot.energy+=(target-knot.energy)*(reduced?1:1-Math.exp(-dt/700));
      if(knot.energy<.005&&knot.target===0){thoughtKnots.delete(key);return;}
      const x=(knot.a.x+knot.b.x)/2,y=(knot.a.y+knot.b.y)/2;
      const still=reduced?1:.86+.14*Math.sin(elapsed*.35+knot.phase);
      for(const grain of knot.grains) {
        const gx=x+grain.x,gy=y+grain.y;if(!pointClear(gx,gy,bounds,center))continue;
        const p=world({x:gx,y:gy});
        paintParticle(paint,sparkRgb,grain.alpha*knot.energy*intensity*still,p.x,p.y,grain.size);
      }
      if(pointClear(x,y,bounds,center)) {
        const p=world({x,y});paintParticle(paint,sparkRgb,knot.energy*intensity*.6,p.x,p.y,1.4);
      }
    });
    paint.globalAlpha=1;
  }
  // A separate seed keeps the established graph and transition particles intact.
  let atmosphereSeed=27183;
  const atmosphereRandom=()=>((atmosphereSeed=(atmosphereSeed*1664525+1013904223)>>>0)/4294967296);
  const motes=Array.from({length:innerWidth<600?320:720},()=>({
    u:atmosphereRandom(),v:atmosphereRandom(),depth:.18+atmosphereRandom()*.82,
    seed:atmosphereRandom()*Math.PI*2,dx:0,dy:0
  }));
  let atmosphereTheme=null,atmosphereSprites=null;
  const atmosphereCache=new Map();
  function makeAtmosphereSprite(color,alpha,vignette=false) {
    const texture=document.createElement('canvas');texture.width=texture.height=256;
    const paint=texture.getContext('2d');
    const gradient=paint.createRadialGradient(128,128,vignette?38:0,128,128,128);
    gradient.addColorStop(0,`rgba(${color},${vignette?0:alpha})`);
    gradient.addColorStop(.45,`rgba(${color},${vignette?alpha*.1:alpha*.42})`);
    gradient.addColorStop(1,`rgba(${color},${vignette?alpha:0})`);
    paint.fillStyle=gradient;paint.fillRect(0,0,256,256);
    return texture;
  }
  function makeCloudTexture(color,seed) {
    // Broad low-frequency density suggests smoke without outlined cloud forms.
    const resolution=128;
    const texture=document.createElement('canvas');texture.width=texture.height=resolution;
    const paint=texture.getContext('2d'),pixels=paint.createImageData(resolution,resolution);
    const rgb=color.split(',').map(Number);
    const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+seed*19.3)*43758.5453;return n-Math.floor(n);};
    const lattice=Array.from({length:32*32},(_,i)=>hash(i%32,Math.floor(i/32)));
    const noise=(x,y)=> {
      const ix=Math.floor(x),iy=Math.floor(y),sx=smooth(x-ix),sy=smooth(y-iy);
      const i=iy*32+ix;
      return (lattice[i]*(1-sx)+lattice[i+1]*sx)*(1-sy)+(lattice[i+32]*(1-sx)+lattice[i+33]*sx)*sy;
    };
    const densityAt=(u,v)=> {
      return noise(u*1.7+3,v*1.9+5)*.86+noise(u*4+10,v*4+2)*.14;
    };
    for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++) {
      const u=x/(resolution-1),v=y/(resolution-1);
      const density=densityAt(u,v);
      const mask=Math.pow(Math.max(0,1-Math.pow((u-.5)*2,2)-Math.pow((v-.5)*2,2)),1.8);
      const i=(y*resolution+x)*4;
      pixels.data[i]=rgb[0];pixels.data[i+1]=rgb[1];pixels.data[i+2]=rgb[2];
      pixels.data[i+3]=Math.round((.22+density*.78)*mask*58);
    }
    paint.putImageData(pixels,0,0);
    return texture;
  }
  function prepareAtmosphere(dark) {
    if(atmosphereTheme!==dark) {
      atmosphereTheme=dark;
      atmosphereSprites=atmosphereCache.get(dark);
      if(atmosphereSprites)return;
      atmosphereSprites={
        cool:makeAtmosphereSprite(dark?'47,99,113':'95,136,180',.10),
        warm:makeAtmosphereSprite(dark?'78,121,101':'228,204,172',.055),
        pearl:makeAtmosphereSprite(dark?'135,183,165':'255,252,244',dark?.05:.12),
        vignette:makeAtmosphereSprite(dark?'0,0,0':'34,57,85',dark?.30:.075,true),
        cloud:makeCloudTexture(dark?'63,91,107':'140,167,192',23),
        cloudLight:makeCloudTexture(dark?'112,150,139':'248,243,230',71)
      };
      atmosphereCache.set(dark,atmosphereSprites);
    }
  }
  function drawAtmosphere(time,center,dt) {
    const paint=atmosphereCtx;if(!paint)return;
    paint.clearRect(0,0,width,height);
    if(phase!=='model'&&phase!=='question'&&phase!=='handoff'&&(phase!=='bridge'||time-transitionStart<900))return;
    const dark=document.documentElement?.getAttribute('data-theme')==='dark';
    prepareAtmosphere(dark);
    const elapsed=reduced?0:cinemaTime/1000;
    const arrival=reduced?1:smooth((time-(sceneStart-340))/1100);
    const departure=phase==='handoff'?1-smooth((time-handoffStart)/1700):phase==='question'?1-.2*smooth((time-transitionStart)/1000):1;
    const strength=arrival*departure;
    const pointer=pointerInside&&pointerFine&&phase==='model'&&!reduced;
    const haze=(sprite,x,y,w,h,alpha)=> {
      paint.globalAlpha=alpha*strength;paint.drawImage(sprite,x-w/2,y-h/2,w,h);
    };
    const breath=reduced?1:.93+Math.sin(elapsed*.36)*.07;
    const span=Math.min(width,height);
    haze(atmosphereSprites.cool,width*.5,height*.5,span*1.7*breath,span*1.4*breath,.55);
    for(let i=0;i<3;i++) {
      const nx=reduced?0:noiseAt(elapsed*.055,i+181);
      const ny=reduced?0:noiseAt(elapsed*.045,i+221);
      const x=width*(.22+i*.28)+nx*width*.055;
      const y=height*(i%2?.68:.3)+ny*height*.05;
      haze(i===1?atmosphereSprites.warm:atmosphereSprites.pearl,x,y,width*.90,height*.85,.28);
    }
    const weather=reduced?.55:.5+.5*Math.sin(elapsed*.037+.4);
    // Oversized overlapping veils drift independently of the cursor.
    for(let i=0;i<7;i++) {
      const wind=reduced?0:noiseAt(elapsed*.028,i+321);
      const cloudX=width*(-.06+i*.19)+wind*width*.09;
      const cloudY=height*(i%2?.73:.24)+(reduced?0:Math.sin(elapsed*.026+i)*height*.045);
      haze(i%2?atmosphereSprites.cloudLight:atmosphereSprites.cloud,cloudX,cloudY,width*1.12,height*1.08,.30+weather*.10);
    }
    // Ambient dust stays soft; only dust created from the spokes receives emphasis.
    paint.fillStyle=dark?'rgb(144,177,161)':'rgb(56,91,139)';
    for(let i=0;i<motes.length;i++) {
      const mote=motes[i],depth=mote.depth;
      const driftX=reduced?0:Math.sin(elapsed*(.023+depth*.024)+mote.seed)*18*depth;
      const driftY=reduced?0:Math.cos(elapsed*(.019+depth*.015)+mote.seed)*12*depth;
      const baseX=mote.u*width+driftX;
      const baseY=mote.v*height+driftY;
      const dx=baseX-px,dy=baseY-py,distance=Math.hypot(dx,dy);
      const influence=pointer?1-smooth(distance/180):0;
      const displacement=18*depth*influence*(1-attention)/Math.max(20,distance);
      const nearCore=1-smooth(Math.hypot(baseX-center.x,baseY-center.y)/240);
      const gather=attention*nearCore*.22;
      const follow=reduced?1:1-Math.exp(-dt/700);
      mote.dx+=(dx*displacement+(center.x-baseX)*gather-mote.dx)*follow;
      mote.dy+=(dy*displacement+(center.y-baseY)*gather-mote.dy)*follow;
      const x=baseX+mote.dx,y=baseY+mote.dy;
      const alpha=(.05+depth*.17)*strength;
      if(depth>.86&&i%3===0) {
        haze(atmosphereSprites.pearl,x,y,14+depth*8,14+depth*8,.5);
      }
      paint.globalAlpha=alpha*(depth>.86?.30:1);
      const size=.45+depth*1.1;
      paint.fillRect(x,y,size,size);
    }
    paint.globalAlpha=strength;
    paint.drawImage(atmosphereSprites.vignette,0,0,width,height);
    // The faint smoke needs no cursor-centred cutout, which looked like a spotlight.
    paint.globalAlpha=1;
  }
  function measure() {
    if((width!==innerWidth||height!==innerHeight)&&(phase==='question'||phase==='handoff')){finish();return;}
    if(width!==innerWidth||height!==innerHeight){
      rays.forEach(ray=>ray.string.ready=false);webThreads.forEach(thread=>thread.string.ready=false);
    }
    width=innerWidth;height=innerHeight;
    if(phase!=='title')ensureSceneSurfaces();
    else prewarmSurfaces();
    if(phase==='question'||phase==='handoff')sizeSurface(departureCanvas,departureCtx,2);
    lastDetailPaint=-Infinity;
    measureLabels();
    // The little anchor emerges where the final word was, then drifts to the hub.
    const word=title.querySelector('.reel-ellipsis i:nth-child(2)')||title.querySelector('em');
    const bounds=word?.getBoundingClientRect();
    seedOrigin=bounds&&bounds.width>0?{x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2}:{x:width*.61,y:height*.57};
    reel.style.setProperty('--seed-offset-x',(seedOrigin.x-width/2)+'px');
    reel.style.setProperty('--seed-offset-y',(seedOrigin.y-height/2)+'px');
    core.style.setProperty('--cube-expanded-size','44px');
    core.style.setProperty('--cube-rest-size','12px');
    draw(performance.now(),false);
  }
  function positions(time,dt) {
    const elapsed=cinemaTime/1000*2;
    const arrival=phase==='bridge'?0:smooth((time-start)/600);
    const cameraX=reduced?0:noiseAt(elapsed*.035,401)*10*arrival*(1-attention*.8);
    const cameraY=reduced?0:noiseAt(elapsed*.03,419)*7*arrival*(1-attention*.8);
    const driftX=reduced?0:noiseAt(elapsed*.30,17)*11*arrival*(1-attention*.75);
    const driftY=reduced?0:noiseAt(elapsed*.26,29)*9*arrival*(1-attention*.75);
    const center=phase==='bridge'?bridgeAnchor(time):corePress?{x:corePress.x,y:corePress.y}:{x:width*.5+shiftX+driftX+coreFollowX+cameraX,y:height*.5+shiftY+driftY+coreFollowY+cameraY};
    const margin=width<600?18:Math.min(64,width*.045);
    const headerBottom=fieldHeaderBottom;
    const fieldTop=Math.max(88,headerBottom+24),fieldBottom=height-(height<500?24:48);
    const compactLayout={
      0:{x:.28,y:.15},1:{x:.65,y:.25},2:{x:.78,y:.56},3:{x:.69,y:.82},
      4:{x:.30,y:.76},5:{x:.24,y:.51},6:{x:.23,y:.33},7:{x:.72,y:.15},
      8:{x:.65,y:.34},9:{x:.69,y:.43},10:{x:.73,y:.67},11:{x:.35,y:.92},
      12:{x:.28,y:.63},13:{x:.27,y:.42}
    };
    const endpoints=rays.map((ray,index)=> {
      const sway=reduced?0:noiseAt(elapsed*.75*(.24+(index%5)*.017),index+41);
      const swayY=reduced?0:noiseAt(elapsed*.75*(.21+(index%7)*.013),index+97);
      if(ray.edge) return {x:ray.node.x*width+shiftX*.15+sway*6+cameraX,y:ray.node.y*height+shiftY*.15+swayY*6+cameraY};
      const label=labels[ray.index];
      const w=labelMetrics[ray.index].w;
      const left=w/2+margin,right=width-w/2-margin,top=fieldTop,bottom=Math.max(top+24,fieldBottom);
      const layout=(width<600||height<500)?compactLayout[ray.index]:ray.node;
      const baseX=clamp(layout.x*width+shiftX*.25+sway*14*(1-attention*.7)+cameraX,left,right);
      const layoutY=(width<600||height<500)?top+layout.y*(bottom-top):layout.y*height;
      const baseY=clamp(layoutY+shiftY*.25+swayY*11*(1-attention*.7)+cameraY,top,bottom);
      return {x:baseX,y:baseY};
    });
    if(width<600||height<500) {
      // Stable slots are packed only after a size/font change. Repacking every frame
      // made labels switch sides and pulled their attached threads across the scene.
      if(!compactLabelLayout) {
        const gap=10,restCenter={x:width/2,y:height/2};
        const placed=[{x:restCenter.x-58,y:restCenter.y-58,w:116,h:116}];
        const slots=[];
        for(let i=0;i<nodes.length;i++) {
          const metric=labelMetrics[i],w=metric.w,h=metric.h,layout=compactLayout[i];
          const minX=w/2+margin+8,maxX=width-w/2-margin-8,minY=fieldTop+h/2+8,maxY=Math.max(minY,fieldBottom-h/2-8);
          const cx=n=>clamp(n,minX,maxX),cy=n=>clamp(n,minY,maxY);
          const desired={x:cx(layout.x*width),y:cy(fieldTop+layout.y*(fieldBottom-fieldTop))};
          const clear=(x,y)=>placed.every(box=>x+w/2+gap<=box.x||x-w/2>=box.x+box.w+gap||y+h/2+gap<=box.y||y-h/2>=box.y+box.h+gap);
          let best=clear(desired.x,desired.y)?desired:null;
          if(!best) {
            const xs=[desired.x,minX,maxX,...placed.flatMap(box=>[cx(box.x-w/2-gap),cx(box.x+box.w+w/2+gap)])];
            const ys=[desired.y,minY,maxY,...placed.flatMap(box=>[cy(box.y-h/2-gap),cy(box.y+box.h+h/2+gap)])];
            let cost=Infinity;
            for(const y of ys)for(const x of xs) {
              const score=(x-desired.x)**2+(y-desired.y)**2;
              if(score<cost&&clear(x,y)){best={x,y};cost=score;}
            }
          }
          best=best||desired;slots.push(best);
          placed.push({x:best.x-w/2,y:best.y-h/2,w,h});
        }
        const bounds=placed.slice(1);
        const motion=bounds.map(box=>({
          x:Math.min(height<500?6:16,Math.max(0,Math.min(box.x-margin,width-margin-box.x-box.w)-4)),
          y:Math.min(height<500?5:12,Math.max(0,Math.min(box.y-fieldTop,fieldBottom-box.y-box.h)-4))
        }));
        // Each neighbour pair reserves clearance on its separating axis. The other
        // axis remains free, so even tightly spaced labels have individual motion.
        for(let i=0;i<bounds.length;i++)for(let j=0;j<i;j++) {
          const a=bounds[i],b=bounds[j];
          const gapX=Math.max(a.x-(b.x+b.w),b.x-(a.x+a.w));
          const gapY=Math.max(a.y-(b.y+b.h),b.y-(a.y+a.h));
          const axis=gapX>gapY?'x':'y',room=Math.max(0,((axis==='x'?gapX:gapY)-4)/2);
          motion[i][axis]=Math.min(motion[i][axis],room);
          motion[j][axis]=Math.min(motion[j][axis],room);
        }
        compactLabelLayout={slots,motion,
          minX:Math.min(...bounds.map((b,i)=>b.x-motion[i].x)),maxX:Math.max(...bounds.map((b,i)=>b.x+b.w+motion[i].x)),
          minY:Math.min(...bounds.map((b,i)=>b.y-motion[i].y)),maxY:Math.max(...bounds.map((b,i)=>b.y+b.h+motion[i].y))};
      }
      // Independent continuous trajectories deform the threads without switching
      // label slots. Directional motion room keeps text and the greeting readable.
      const layout=compactLabelLayout;
      const dx=clamp(center.x-coreFollowX-width/2,margin-layout.minX,width-margin-layout.maxX);
      const dy=clamp(center.y-coreFollowY-height/2,fieldTop-layout.minY,fieldBottom-layout.maxY);
      for(let i=0;i<nodes.length;i++) {
        const amp=layout.motion[i],lively=1-attention*.45;
        const ox=reduced?0:noiseAt(elapsed*(.25+(i%5)*.035),i+941)*amp.x*lively;
        const oy=reduced?0:noiseAt(elapsed*(.23+(i%7)*.029),i+1087)*amp.y*lively;
        endpoints[i].x=layout.slots[i].x+dx+ox;endpoints[i].y=layout.slots[i].y+dy+oy;
      }
    }
    // Retreat is applied after the stable layout, so narrow screens retain the
    // same elastic response. Each thread remains attached to its moving thought.
    const compact=width<600||height<500;
    const active=pointerInside&&pointerFine&&phase==='model'&&!reduced;
    evasionPointer.x=px;evasionPointer.y=py;evasionPointer.cx=width/2;evasionPointer.cy=height/2;
    for(let i=0;i<nodes.length;i++) {
      const box=evasionBoxes[i],metric=labelMetrics[i],base=endpoints[i],motion=nodeMotion[i];
      box.hw=metric.w/2;box.hh=metric.h/2;
      box.x=clamp(base.x+motion.x,box.hw+margin,width-box.hw-margin);
      box.y=clamp(base.y+motion.y,fieldTop,fieldBottom);
      motion.x=box.x-base.x;motion.y=box.y-base.y;
    }
    evasionBoxes[nodes.length].x=center.x;evasionBoxes[nodes.length].y=center.y;
    for(let i=0;i<nodes.length;i++) {
      const box=evasionBoxes[i],base=endpoints[i],motion=nodeMotion[i];
      evasionBounds.left=box.hw+margin;evasionBounds.right=width-box.hw-margin;
      evasionBounds.top=fieldTop;evasionBounds.bottom=fieldBottom;
      ThoughtEvasion.aim(base,motion,evasionPointer,box,evasionBounds,evasionBoxes,i,compact?112:156,compact?40:64,active&&!labels[i].matches(':focus-visible'));
      const previousX=box.x,previousY=box.y,overlap=ThoughtEvasion.penalty(previousX,previousY,box,evasionBoxes,i);
      const tau=motion.strength>.002?70:120;
      SceneResponse.spring(motion,'x',motion.aimX,dt,tau,reduced);
      SceneResponse.spring(motion,'y',motion.aimY,dt,tau,reduced);
      let x=clamp(base.x+motion.x,evasionBounds.left,evasionBounds.right),y=clamp(base.y+motion.y,fieldTop,fieldBottom);
      // Curving inertia must not carry a thought through its neighbours.
      if(ThoughtEvasion.penalty(x,y,box,evasionBoxes,i)>Math.max(.05,overlap+.05)) {
        x=previousX;y=previousY;motion.xVelocity=motion.yVelocity=0;
      }
      motion.x=x-base.x;motion.y=y-base.y;box.x=x;box.y=y;
      base.x=x;base.y=y;
      labels[i].classList.toggle('is-near',!nodes[i].ghost&&active&&Math.hypot(x-px,y-py)<64);
    }
    return {center,endpoints};
  }
  function bridgeAnchor(time) {
    const travel=filmEase((time-transitionStart-460)/1150),bend=Math.sin(travel*Math.PI);
    return {x:seedOrigin.x+(width/2-seedOrigin.x)*travel+bend*16,
      y:seedOrigin.y+(height/2-seedOrigin.y)*travel-bend*22};
  }
  function rayTip(center,end,ray) {
    const vx=end.x-center.x,vy=end.y-center.y,length=Math.max(1,Math.hypot(vx,vy));
    let clearance=0;
    if(ray.index>=0) {
      const metric=labelMetrics[ray.index];
      const halfWidth=metric.w/2+9,halfHeight=metric.h/2+7;
      clearance=Math.min(halfWidth/Math.max(.001,Math.abs(vx/length)),halfHeight/Math.max(.001,Math.abs(vy/length)));
    }
    const extent=Math.max(0,1-clearance/length);
    return {x:center.x+vx*extent,y:center.y+vy*extent};
  }
  function strokeThoughtThread(thread,inkRgb,lineWidth,inkGain=1) {
    for(let level=1;level<6;level++) {
      const bucket=thread.buckets[level];if(!bucket.length)continue;
      ctx.strokeStyle=`rgba(${inkRgb},${thread.strokeOpacity*(level/5)*inkGain})`;
      ctx.lineWidth=lineWidth;ctx.beginPath();
      for(let i=0;i<bucket.length;i+=2) {
        const a=bucket[i],b=bucket[i+1];
        ctx.moveTo(a.x+a.dx*.15,a.y+a.dy*.15);
        ctx.lineTo(b.x+b.dx*.15,b.y+b.dy*.15);
      }
      ctx.globalAlpha=1;ctx.stroke();
    }
  }
  function drawWeb(time,center,endpoints,radius,unfold,dt) {
    const inkRgb=document.documentElement?.getAttribute('data-theme')==='dark'?'74,222,128':'27,82,153';
    // The form supplies soft rest positions, not fixed frame-by-frame positions.
    // A local pull and tensile neighbours move the interior independently.
    const anchor={x:center.x-coreFollowX,y:center.y-coreFollowY};
    const tips=endpoints.map((end,i)=>rayTip(anchor,end,rays[i]));
    const labelBounds=labelMetrics.map((metric,i)=>({x:endpoints[i].x,y:endpoints[i].y,w:metric.w/2+8,h:metric.h/2+6}));
    for(const thread of webThreads) {
      const a=tips[thread.a],b=tips[thread.b];
      const entrance=reduced?1:smooth((time-sceneStart-160-thread.layer*75)/750);
      const u=thread.u*entrance,v=thread.v*entrance;
      const ax=anchor.x+(a.x-anchor.x)*u,ay=anchor.y+(a.y-anchor.y)*u;
      const bx=anchor.x+(b.x-anchor.x)*v,by=anchor.y+(b.y-anchor.y)*v;
      const vx=bx-ax,vy=by-ay,length=Math.max(1,Math.hypot(vx,vy)),nx=-vy/length,ny=vx/length;
      const breath=reduced?0:noiseAt(cinemaTime*.0001,thread.seed)*9*(1-attention*.8);
      const span=Math.min(width,height),bow=span*thread.bend*entrance;
      let knots;
      if(thread.loop) {
        // A loose fold doubles back through the field, like a half-formed thought.
        const angle=thread.orientation,c=Math.cos(angle),s=Math.sin(angle);
        const fold=(x,y)=>({x:anchor.x+(x*c-y*s)*span*thread.span*entrance+nx*breath,
          y:anchor.y+(x*s+y*c)*span*thread.span*entrance+ny*breath});
        knots=[{x:ax,y:ay},fold(-.20,.015),fold(.07,-.24),fold(.26,.035),fold(-.08,.16),{x:bx,y:by}];
      } else {
        // Unequal bends create crossing S-curves rather than a patterned mesh.
        knots=[{x:ax,y:ay},
          {x:ax+vx*.24+nx*bow,y:ay+vy*.24+ny*bow},
          {x:ax+vx*.53-nx*bow*.55+nx*breath,y:ay+vy*.53-ny*bow*.55+ny*breath},
          {x:ax+vx*.78+nx*bow*.26,y:ay+vy*.78+ny*bow*.26},
          {x:bx,y:by}];
      }
      thread.buckets.forEach(bucket=>{bucket.length=0;});
      for(const p of thread.samples) {
        const along=p.t*(knots.length-1),segment=Math.min(knots.length-2,Math.floor(along));
        const t=along-segment,t2=t*t,t3=t2*t;
        const k0=knots[Math.max(0,segment-1)],k1=knots[segment],k2=knots[segment+1],k3=knots[Math.min(knots.length-1,segment+2)];
        const curve=axis=>.5*((2*k1[axis])+(-k0[axis]+k2[axis])*t+
          (2*k0[axis]-5*k1[axis]+4*k2[axis]-k3[axis])*t2+(-k0[axis]+3*k1[axis]-3*k2[axis]+k3[axis])*t3);
        p.baseX=curve('x');p.baseY=curve('y');
      }
      for(let i=0;i<thread.string.count;i++){
        const p=thread.samples[i*2],distance=Math.hypot(p.baseX-anchor.x,p.baseY-anchor.y);
        const pull=(1-smooth(distance/(span*.34)))*.42*Math.sin(Math.PI*i/(thread.string.count-1));
        ThoughtStrings.goal(thread.string,i,p.baseX+coreFollowX*pull,p.baseY+coreFollowY*pull,p.baseX,p.baseY);
      }
      ThoughtStrings.advance(thread.string,dt,reduced||entrance<.995,stringPointer);
      for(const p of thread.samples) {
        ThoughtStrings.sample(thread.string,p.t,stringPoint);p.x=stringPoint.x;p.y=stringPoint.y;
        p.visible=labelClear(p.x,p.y,labelBounds);
        const dx=p.x-px,dy=p.y-py,distance=Math.hypot(dx,dy);
        const influence=pointerInside&&phase==='model'?1-smooth(distance/radius):0;
        updateThoughtEnergy(p,influence,dt);
        const noise=reduced?0:Math.sin(time*.0016+p.seed)*2.5;
        const repel=1/Math.max(18,distance);
        SceneResponse.spring(p,'dx',(dx*repel*10+nx*noise)*p.energy,dt,30,reduced);
        SceneResponse.spring(p,'dy',(dy*repel*10+ny*noise)*p.energy,dt,30,reduced);
        if(p.visible&&p.energy>.015) {
          const size=.65+p.energy*.65;
          paintParticle(ctx,inkRgb,p.energy*.58*entrance*unfold,p.x+p.dx,p.y+p.dy,size);
        }
      }
      for(let i=0;i<thread.samples.length-1;i++) {
        const a=thread.samples[i],b=thread.samples[i+1];
        if(!a.visible||!b.visible)continue;
        const level=Math.round((1-(a.energy+b.energy)/2)*5);
        thread.buckets[level].push(a,b);
      }
      const focus=Math.max(thoughtFocus[thread.a]?.value||0,thoughtFocus[thread.b]?.value||0);
      thread.strokeOpacity=thread.alpha*entrance*unfold*(1+focus*1.6);
      if(!thread.foreground)strokeThoughtThread(thread,inkRgb,.55);
    }
  }
  function draw(time,schedule=true) {
    frameId=0;
    // The typed reel is DOM/CSS. Its fully hidden model needs no scene simulation.
    if (!ctx || phase==='title' || phase==='gone' || document.hidden) return;
    ctx.particleRgb=null;
    // Departure owns its captured geometry; avoid updating hidden live-model geometry.
    if(phase==='question'||phase==='handoff'){
      lastFrameTime=time;drawDeparture(time,time-transitionStart,document.documentElement.getAttribute('data-theme')==='dark'?'74,222,128':'27,82,153');
      if(schedule&&phase!=='gone')frameId=requestAnimationFrame(draw);return;
    }
    const parallaxX=pointerInside?(px/width-.5)*14:0;
    const parallaxY=pointerInside?(py/height-.5)*10:0;
    const dt=clamp(time-lastFrameTime,1,40);lastFrameTime=time;
    if(phase==='model'&&pointerInside&&pointerFine) {
      const response=reduced?1:1-Math.exp(-dt/18);
      cursorX+=(px-cursorX)*response;cursorY+=(py-cursorY)*response;
      positionCursor();
    }
    const coreDistance=pointerInside?Math.hypot(px-currentCore.x,py-currentCore.y):Infinity;
    const focused=core.matches(':focus-visible')||core.classList.contains('is-armed');
    const targetAttention=!reduced&&phase==='model'?(focused?1:1-smooth((coreDistance-35)/200)):0;
    attention+=(targetAttention-attention)*(1-Math.exp(-dt/160));
    if(!reduced&&(phase==='model'||phase==='question'||phase==='handoff'))cinemaTime+=dt*(1-attention*.78);
    reel.classList.toggle('is-attentive',attention>.55);
    const follow=reduced?1:1-Math.exp(-dt/65);
    shiftX+=(dragX+parallaxX-shiftX)*follow;
    shiftY+=(dragY+parallaxY-shiftY)*follow;
    let followTargetX=0,followTargetY=0,holdFollow=false;
    if(pointerInside&&pointerFine&&phase==='model'&&!reduced&&!corePress) {
      const dx=px-width/2,dy=py-height/2,distance=Math.hypot(dx,dy);
      const gap=Math.max(width<600?100:200,Math.min(width,height)*.32);
      const travel=Math.max(0,distance-gap);
      if(distance>0) {
        followTargetX=clamp(dx/distance*travel,-width*.18,width*.18);
        followTargetY=clamp(dy/distance*travel,-height*.16,height*.16);
      }
      if(Math.hypot(px-currentCore.x,py-currentCore.y)<80) {followTargetX=coreFollowX;followTargetY=coreFollowY;holdFollow=true;}
    }
    if(!corePress) {
      // A measured velocity-preserving follow keeps the directional reach.
      // Near the hit target the follow is held, so it cannot run away from a click.
      coreFollowMotion.x=coreFollowX;coreFollowMotion.y=coreFollowY;
      const followTau=pointerInside?110:85;
      coreFollowX=clamp(SceneResponse.spring(coreFollowMotion,'x',followTargetX,dt,followTau,reduced||holdFollow),-width*.18,width*.18);
      coreFollowY=clamp(SceneResponse.spring(coreFollowMotion,'y',followTargetY,dt,followTau,reduced||holdFollow),-height*.16,height*.16);
      coreFollowMotion.x=coreFollowX;coreFollowMotion.y=coreFollowY;
    }
    const {center,endpoints}=positions(time,dt);
    stringPointer.x=px;stringPointer.y=py;stringPointer.radius=thoughtInteractionRadius();
    stringPointer.active=pointerInside&&pointerFine&&phase==='model'&&!reduced;
    updateThoughtResponse(endpoints,dt);
    const departing=phase==='question'||phase==='handoff';
    const questionAge=departing?time-transitionStart:0;
    core.style.transform=`translate3d(${center.x}px,${center.y}px,0) translate(-50%,-50%)`;
    const distance=pointerInside?Math.hypot(px-center.x,py-center.y):Infinity;
    const approachRadius=width<600?140:220;
    let targetGrowth=phase==='model'?1-smooth((distance-22)/(approachRadius-22)):0;
    if(phase==='model'&&(core.matches(':focus-visible')||core.classList.contains('is-armed')))targetGrowth=1;
    // Critically damped motion carries velocity through interrupted approaches.
    // The square settles without an elastic overshoot or a sudden hover-size jump.
    if(!corePress) {
      if(reduced||core.matches(':focus-visible')) {coreGrowth=targetGrowth;coreVelocity=0;}
      else {
        const tau=75,delta=coreGrowth-targetGrowth,c=coreVelocity+delta/tau;
        const decay=Math.exp(-dt/tau);
        coreGrowth=targetGrowth+(delta+c*dt)*decay;
        coreVelocity=(coreVelocity-c*dt/tau)*decay;
        if(coreGrowth<0||coreGrowth>1) {coreGrowth=clamp(coreGrowth,0,1);coreVelocity=0;}
      }
    }
    const coreSize=corePress?corePress.size:12+(44-12)*coreGrowth;
    currentCore={x:center.x,y:center.y,size:coreSize};
    reel.classList.toggle('cursor-on-core',phase==='model'&&pointerInside&&pointerFine&&Math.abs(cursorX-center.x)<=coreSize/2+2&&Math.abs(cursorY-center.y)<=coreSize/2+2);
    core.style.setProperty('--core-scale',String(coreSize/44));
    core.style.setProperty('--core-greeting-opacity',smooth((coreGrowth-.50)/.38).toFixed(3));
    core.style.setProperty('--core-greeting-follow',smooth((coreGrowth-.64)/.30).toFixed(3));
    // Count visible animation frames, not a timer that can expire in a hidden tab.
    if(phase==='model'&&core.classList.contains('is-armed')&&coreGrowth>=.94) {
      greetingReadTime=Math.min(450,greetingReadTime+dt);
    }
    // The 48px hit target already contains the complete 12–44px visual square.
    if(!departing)drawAtmosphere(time,center,dt);
    // This layer uses the previous frame's smooth thread geometry. Keeping it on its
    // own canvas preserves depth and avoids redrawing the smoke or touching hit areas.
    if(!departing)drawThoughtDetail(time,center,endpoints,dt);
    ctx.clearRect(0,0,width,height);
    depthCtx.clearRect(0,0,width,height);
    const dark=document.documentElement?.getAttribute('data-theme')==='dark';
    const inkRgb=dark?'74,222,128':'27,82,153';
    if(phase==='bridge') {
      const age=time-transitionStart;
      const merge=filmEase(age/460),travel=filmEase((age-460)/1150);
      const bend=Math.sin(travel*Math.PI);
      bridgeDots.forEach((dot,i)=> {
        const origin=bridgeOrigins[i]||{x:seedOrigin.x+(i-1)*18,y:seedOrigin.y};
        const x=i===1?seedOrigin.x+(width/2-seedOrigin.x)*travel+bend*16:origin.x+(seedOrigin.x-origin.x)*merge;
        const y=i===1?seedOrigin.y+(height/2-seedOrigin.y)*travel-bend*22:origin.y+(seedOrigin.y-origin.y)*merge;
        const size=i===1?bridgeDotSize+(12-bridgeDotSize)*travel:bridgeDotSize;
        dot.style.borderRadius=(i===1?(1-travel)*50:50)+'%';
        dot.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${size/bridgeDotSize})`;
        dot.style.opacity=i===1?'1':String(1-smooth((merge-.65)/.35));
        dot.style.setProperty('--dot-ink-weight',(i===1?smooth((travel-.25)/.65)*100:0).toFixed(2)+'%');
      });
      for(let i=0;i<240;i++) {
        const drift=filmEase((age-440-(i%24)*2)/1150);
        const arc=Math.sin(drift*Math.PI);
        const x=seedOrigin.x+(width/2-seedOrigin.x)*drift+Math.sin(i*1.7)*22*arc;
        const y=seedOrigin.y+(height/2-seedOrigin.y)*drift-arc*(12+(i%30)*.8)+Math.cos(i*2.3)*8*arc;
        ctx.fillStyle=`rgba(${inkRgb},${arc*(.2+(i%5)*.035)})`;
        const size=.65+(i%4)*.2;
        ctx.fillRect(x,y,size,size);
      }
      // Fine trailing wisps share the travelling anchor's path, without a light halo.
      if(age>460)for(let strand=0;strand<3;strand++) {
        const tail=.13+strand*.035,head=travel;
        ctx.strokeStyle=`rgba(${inkRgb},${Math.sin(travel*Math.PI)*(.07-strand*.015)})`;
        ctx.lineWidth=.45;ctx.beginPath();
        for(let j=0;j<=18;j++) {
          const t=clamp(head-tail+tail*j/18,0,1),arc=Math.sin(t*Math.PI);
          const x=seedOrigin.x+(width/2-seedOrigin.x)*t+arc*(16+(strand-1)*9);
          const y=seedOrigin.y+(height/2-seedOrigin.y)*t-arc*(22+(strand-1)*7);
          if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // The field begins forming before arrival, then continues on the same clock.
      if(age<1040) {
        if(schedule)frameId=requestAnimationFrame(draw);
        return;
      }
    }
    if(departing) {
      drawDeparture(time,questionAge,inkRgb);
      if(schedule)frameId=requestAnimationFrame(draw);
      return;
    }
    const unfold=reduced?1:smooth((time-sceneStart)/725);
    const sceneAlpha=1;
    const radius=thoughtInteractionRadius();
    const graphCtx=ctx;
    drawWeb(time,center,endpoints,radius,unfold,dt);
    for(let r=0;r<rays.length;r++) {
      const ray=rays[r],end=endpoints[r];
      const ctx=ray.edge||ray.node.ghost?depthCtx:graphCtx;
      if(ray.index>=0) {
        const label=labels[ray.index];
        label.style.transform=`translate3d(${end.x}px,${end.y}px,0) translate(-50%,-50%)`;
      }
      const distant=ray.edge||ray.node.ghost;
      const focus=thoughtFocus[ray.index]?.value||0;
      const lineAlpha=ray.alpha*(1+focus*1.8);
      const rayUnfold=reduced?1:smooth((time-sceneStart-(distant?300+(r%7)*15:50+(r%7)*20))/(distant?550:700));
      const tip=rayTip(center,end,ray);
      const vx=(tip.x-center.x)*rayUnfold,vy=(tip.y-center.y)*rayUnfold;
      for(let i=0;i<ray.string.count;i++){
        const t=i/(ray.string.count-1);
        ThoughtStrings.goal(ray.string,i,center.x+vx*t,center.y+vy*t);
      }
      ThoughtStrings.advance(ray.string,dt,reduced||rayUnfold<.995,stringPointer);
      const length=Math.max(1,Math.hypot(vx,vy));
      const nx=-vy/length,ny=vx/length;
      const cursorNear=pointerInside&&phase==='model'&&rayNearPointer(ray,radius);
      // Untouched rays are continuous strokes, not 224 separate line fragments.
      // A disturbed ray keeps its particles until all energy has settled.
      ctx.globalAlpha=1;
      if(!cursorNear&&!ray.disturbed) {
        ctx.strokeStyle=`rgba(${inkRgb},${lineAlpha*unfold*sceneAlpha})`;ctx.lineWidth=distant?.55:.7;
        ctx.beginPath();raySpan(ctx,ray,0,1);ctx.stroke();
        continue;
      }
      let remainingEnergy=0;
      ray.lineBuckets.forEach(bucket=>{bucket.length=0;});
      // Break only local fragments, so dust follows the cursor across the whole canvas.
      for(let i=0;i<ray.particles.length;i++) {
        const p=ray.particles[i];
        const streamProgress=p.t;
        ThoughtStrings.sample(ray.string,streamProgress,stringPoint);
        const x=stringPoint.x,y=stringPoint.y;
        const dx=x-px,dy=y-py,distanceSquared=dx*dx+dy*dy;
        const a=i/ray.particles.length,b=(i+1)/ray.particles.length;
        if((!pointerInside||phase!=='model'||distanceSquared>=radius*radius)&&p.energy<.001) {
          p.energy=p.dx=p.dy=p.dxVelocity=p.dyVelocity=0;addRaySpan(ray.lineBuckets[5],a,b);continue;
        }
        const dist=Math.sqrt(distanceSquared);
        const influence=pointerInside&&phase==='model'?1-smooth(dist/radius):0;
        updateThoughtEnergy(p,influence,dt);
        remainingEnergy=Math.max(remainingEnergy,p.energy);
        const noise=reduced?0:Math.sin(time*.0018+p.seed)*3;
        const repel=1/Math.max(18,dist);
        const targetX=(dx*repel*12+nx*noise)*p.energy;
        const targetY=(dy*repel*12+ny*noise)*p.energy;
        SceneResponse.spring(p,'dx',targetX,dt,30,reduced);
        SceneResponse.spring(p,'dy',targetY,dt,30,reduced);
        addRaySpan(ray.lineBuckets[Math.round((1-p.energy)*5)],a,b);
        if(p.energy>.015) {
          const size=.7+1.0*p.energy;
          paintParticle(graphCtx,inkRgb,p.energy*(ray.edge?.62:.8)*unfold*sceneAlpha,x+p.dx,y+p.dy,size);
          paintParticle(graphCtx,inkRgb,p.energy*.27*unfold*sceneAlpha,x-p.dx*.6+nx*12*p.energy,y-p.dy*.6+ny*12*p.energy,.7);
        }
      }
      ray.disturbed=remainingEnergy>.001;
      if(!ray.disturbed)ray.particles.forEach(p=>{p.energy=p.dx=p.dy=p.dxVelocity=p.dyVelocity=0;});
      // Batch equal-opacity fragments into at most five strokes per ray.
      for(let level=1;level<6;level++) {
        const bucket=ray.lineBuckets[level];if(!bucket.length)continue;
        ctx.strokeStyle=`rgba(${inkRgb},${lineAlpha*(level/5)*unfold*sceneAlpha})`;ctx.lineWidth=distant?.55:.7;ctx.beginPath();
        for(let i=0;i<bucket.length;i+=2) {
          raySpan(ctx,ray,bucket[i],bucket[i+1]);
        }
        ctx.globalAlpha=1;ctx.stroke();
      }
    }
    drawThoughtSignals(center,endpoints,inkRgb,unfold);
    // Draw the near bundle once, between the two depths of the existing signal.
    const nearInk=dark?'143,236,188':'27,82,153';
    for(const thread of foregroundThoughtThreads)strokeThoughtThread(thread,nearInk,.58,1.53);
    drawThoughtSignals(center,endpoints,nearInk,unfold,true);
    graphCtx.globalAlpha=1;
    if(schedule) frameId=requestAnimationFrame(draw);
  }

  function raySpan(paint,ray,from,to){
    const s=ray.string,steps=Math.max(1,Math.ceil((to-from)*(s.count-1)*2));
    ThoughtStrings.sample(s,from,stringPoint);paint.moveTo(stringPoint.x,stringPoint.y);
    for(let i=1;i<=steps;i++){
      ThoughtStrings.sample(s,from+(to-from)*i/steps,stringPoint);paint.lineTo(stringPoint.x,stringPoint.y);
    }
  }
  function rayNearPointer(ray,radius){
    const s=ray.string;
    for(let i=0;i<s.count-1;i++){
      const dx=s.x[i+1]-s.x[i],dy=s.y[i+1]-s.y[i],length=dx*dx+dy*dy;
      const t=clamp(((px-s.x[i])*dx+(py-s.y[i])*dy)/Math.max(.001,length),0,1);
      if(Math.hypot(px-s.x[i]-dx*t,py-s.y[i]-dy*t)<radius)return true;
    }
    return false;
  }


  let flightSnapshot=null,studyPalette=null,studyNeuralPlan=null,studyFilaments=[];
  const studyPoint={x:0,y:0},studyTail={x:0,y:0},studyArmPoint={x:0,y:0};
  function stopQuestionMotion(){
    flightSnapshot=null;studyNeuralPlan=null;studyFilaments=[];prepareQuestionMotion.active=null;
    [...reel.querySelectorAll('.question-word')].forEach(word=>word.style.opacity='0');
  }
  function warmQuestionMotion(){
    if(reduced)return;
    const prepare=()=>{if(phase==='model'&&!prepareQuestionMotion.active)prepareQuestionMotion(true);};
    duringIdle(prepare);
    document.fonts?.ready.then(()=>{if(phase==='model'){prepareQuestionMotion.active=null;duringIdle(prepare);}});
  }
  function prepareQuestionMotion(warm=false){
    const strong=reel.querySelector('.reel-panel strong');
    const style=window.getComputedStyle(strong),size=Math.max(22,Math.min(38,width*.028));
    departureCtx.font=`${style.fontWeight||500} ${size}px ${style.fontFamily||'Arial,sans-serif'}`;
    const words=['Curious','what that','actually','looks like?'];
    const widths=words.map(word=>departureCtx.measureText(word).width),space=departureCtx.measureText(' ').width+size*.08;
    const line1=widths[0]+space+widths[1],line2=widths[2]+space+widths[3],maximum=Math.max(line1,line2);
    const fit=Math.min(1,(width-48)/maximum);
    const m={width,height,size,fit,words,widths,space,font:departureCtx.font,rows:[],groups:Array.from({length:4},()=>[])};
    if(!reduced&&(warm||!window.studySkipMotion))prepareQuestionDust(m);
    prepareQuestionMotion.active=m;
  }
  function prepareQuestionDust(m){
    const resolution=2,step=4,padding=8;
    for(let line=0;line<2;line++){
      const first=line*2,total=m.widths[first]+m.space+m.widths[first+1];
      const w=Math.ceil((total+padding*2)*resolution),h=Math.ceil(m.size*2.4*resolution);
      const source=document.createElement('canvas');source.width=w;source.height=h;
      const c=source.getContext('2d');c.setTransform(resolution,0,0,resolution,0,0);c.font=m.font;c.textBaseline='middle';c.fillStyle='#fff';
      c.fillText(m.words[first],padding,h/resolution/2);c.fillText(m.words[first+1],padding+m.widths[first]+m.space,h/resolution/2);
      const pixels=c.getImageData(0,0,w,h).data,working=document.createElement('canvas');working.width=w;working.height=h;
      const row={source,working,ctx:working.getContext('2d'),width:w,height:h,line,y:(line?1:-1)*m.size*.65,cells:[],letters:[]};
      const starts=[];
      for(let word=first;word<first+2;word++){
        const offset=padding+(word===first?0:m.widths[first]+m.space);
        for(let j=0;j<m.words[word].length;j++)starts.push((offset+c.measureText(m.words[word].slice(0,j)).width)*resolution);
      }
      starts.forEach((x,index)=>{
        const left=index===0?0:Math.floor(x),right=index===starts.length-1?w:Math.floor(starts[index+1]);
        const hash=Math.sin((index+1)*17.13+line*43.7)*43758.5453;
        row.letters.push({sx:left,sw:right-left,index,line,random:hash-Math.floor(hash),frame:{}});
      });
      for(let sy=0;sy<h;sy+=step)for(let sx=0;sx<w;sx+=step){
        let sum=0,xsum=0,ysum=0;const cw=Math.min(step,w-sx),ch=Math.min(step,h-sy);
        for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const alpha=pixels[((sy+y)*w+sx+x)*4+3]/255;sum+=alpha;xsum+=(x+.5)*alpha;ysum+=(y+.5)*alpha;}
        if(sum<.025)continue;
        const hash=Math.sin(sx*12.9898+sy*78.233+line*43.7)*43758.5453,random=hash-Math.floor(hash),u=(sx+cw/2)/w;
        const cell={sx,sy,cw,ch,line,random,seed:random*Math.PI*2,
          x:(sx+xsum/sum-w/2)/resolution,y:(sy+ysum/sum-h/2)/resolution+row.y,
          enterAt:600+line*180+u*120+random*100,releaseAt:2770+line*120+u*260+random*100,
          arm:(row.cells.length+line)%2,u:.12+random*.78,size:Math.max(.35,Math.sqrt(sum)/resolution*.82),frame:{},bucket:row.cells.length%4};
        row.cells.push(cell);m.groups[cell.bucket].push(cell);
      }
      m.rows.push(row);
    }
    window.studyTextSummary={letters:m.rows.reduce((n,row)=>n+row.letters.length,0),grains:m.rows.reduce((n,row)=>n+row.cells.length,0),rows:2,rasterReads:2};
  }
  const textPoint={x:0,y:0},textTail={x:0,y:0};
  function drawQuestionAssembly(paint,age,m,ink){
    // Spatial letter assembly inspired by Chris Bolson's demo, driven by our clock.
    // Crops come from the full shaped text raster, so the final baseline has no font swap.
    for(const row of m.rows){
      const c=row.ctx;c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,row.width,row.height);c.drawImage(row.source,0,0);
      c.globalCompositeOperation='source-in';c.fillStyle=ink;c.fillRect(0,0,row.width,row.height);c.globalCompositeOperation='source-over';
      for(const letter of row.letters){const f=StudyText.assembly(letter,age,height,letter.frame);if(f.opacity<.001)continue;
        const x=(letter.sx+letter.sw/2-row.width/2)/2*m.fit,y=row.y*m.fit;
        paint.save();paint.translate(width/2+x,height/2+y+f.y);paint.scale(f.scale,f.scale);paint.globalAlpha=f.opacity;
        paint.drawImage(row.working,letter.sx,0,letter.sw,row.height,-letter.sw/4*m.fit,-row.height/4*m.fit,letter.sw/2*m.fit,row.height/2*m.fit);paint.restore();
      }
    }
    paint.globalAlpha=1;
  }
  function drawQuestionMaterial(paint,age,m,colors,targets,dark,quiet){
    const ink=dark?'#eaf1ea':'#102a4d';
    if(quiet){
      paint.font=m.font;paint.fillStyle=ink;paint.textAlign='left';paint.textBaseline='middle';paint.globalAlpha=1;
      for(let line=0;line<2;line++){const a=line*2,total=m.widths[a]+m.space+m.widths[a+1];paint.save();paint.translate(width/2,height/2);paint.scale(m.fit,m.fit);
        paint.fillText(m.words[a],-total/2,(line?1:-1)*m.size*.65);paint.fillText(m.words[a+1],-total/2+m.widths[a]+m.space,(line?1:-1)*m.size*.65);paint.restore();}
      return;
    }
    if(age<1640){drawQuestionAssembly(paint,age,m,ink);return;}
    const stable=age<=2770;
    for(const row of m.rows){
      const c=row.ctx;c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,row.width,row.height);c.drawImage(row.source,0,0);
      let hasInk=stable;c.globalCompositeOperation='destination-out';c.fillStyle='#000';
      if(!stable)for(const p of row.cells){const f=StudyText.material(p,age,p.frame);if(f.ink>.001)hasInk=true;
        c.globalAlpha=1-f.ink;if(c.globalAlpha>.001)c.fillRect(p.sx,p.sy,p.cw,p.ch);}
      if(hasInk){
        c.globalAlpha=1;c.globalCompositeOperation='source-in';c.fillStyle=ink;c.fillRect(0,0,row.width,row.height);c.globalCompositeOperation='source-over';
        paint.globalAlpha=1;const w=row.width/2*m.fit,h=row.height/2*m.fit;
        paint.drawImage(row.working,width/2-w/2,height/2+(row.y+StudyText.rise(age,row.line))*m.fit-h/2,w,h);
      }
    }
    if(stable){paint.globalAlpha=1;return;}
    const mix=StudyMotion.ease((age-2770)/600),start=dark?[234,241,234]:[16,42,77];
    const palette=colors.dustEnd.map(rgb=>'rgb('+rgb.map((v,i)=>(start[i]+(v-start[i])*mix).toFixed(2)).join(',')+')');
    for(let bucket=0;bucket<4;bucket++){
      paint.fillStyle=palette[bucket];paint.strokeStyle=palette[bucket];paint.lineWidth=.55;
      for(const p of m.groups[bucket]){
        const f=p.frame;if(!f||f.dust<.002)continue;
        const target=studyArmTarget(p.arm,p.u,studyArmPoint)||studyTarget(p,p.bucket,targets);
        StudyText.point(p,target,age,width,height,m.fit,textPoint);
        const size=p.size*m.fit*(1+Math.sin(Math.PI*f.fly)*.45);
        paint.globalAlpha=f.dust*(dark?.9:.84);paint.fillRect(textPoint.x-size/2,textPoint.y-size/2,size,size);
        if(p.random>.965){
          const energy=mix*Math.sin(Math.PI*f.fly),radius=2+energy*4;
          paint.globalAlpha=f.dust*energy*(dark?.68:.35);paint.drawImage(colors.dustGlows[bucket],textPoint.x-radius,textPoint.y-radius,radius*2,radius*2);
        }
        paint.globalAlpha=f.dust*(dark?.9:.84);
        if(p.random>.94&&f.fly>.02&&f.fly<.92){
          StudyText.point(p,target,age-24,width,height,m.fit,textTail);paint.globalAlpha*=.35;
          paint.beginPath();paint.moveTo(textTail.x,textTail.y);paint.lineTo(textPoint.x,textPoint.y);paint.stroke();}
      }
    }
    paint.globalAlpha=1;
  }
  function captureStudyMind(){
    const shot=document.createElement('canvas');shot.width=Math.round(width);shot.height=Math.round(height);
    const p=shot.getContext('2d');
    for(const layer of [atmosphereCanvas,depthCanvas,detailCanvas,canvas])if(layer.width>1){p.globalAlpha=Number(layer.style.opacity)||1;p.drawImage(layer,0,0,width,height);}
    labels.forEach((label,i)=>{const point=departureEndpoints[i];if(!point)return;const style=window.getComputedStyle(label);
      p.font=style.font||`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;p.fillStyle=style.color;p.globalAlpha=Number(style.opacity)||.5;
      p.textAlign='center';p.textBaseline='middle';p.fillText(label.textContent,point.x,point.y);});p.globalAlpha=1;
    return shot;
  }
  function prepareStudyDetails(){
    studyNeuralPlan=StudyNeural.plan(departureWeb,handoffOrigin,Math.max(240,Math.min(width,height)));
    studyFilaments=thoughtMaterial.map((m,i)=>({arm:i%2,alpha:m.filaments[0].alpha*.48,
      points:m.filaments[0].points.filter((_,j)=>j%2===0).map((p,j)=>({...p,studyU:j/32,seed:i*.73}))}));
    window.studyNeuralSummary={paths:studyNeuralPlan.paths.length,roots:studyNeuralPlan.seedCount,nodes:studyNeuralPlan.nodeCount,end:studyNeuralPlan.end};
  }
  function studyColors(dark,mix){
    if(studyPalette?.dark!==dark){
      const sprite=document.createElement('canvas');sprite.width=sprite.height=32;const c=sprite.getContext('2d');
      const g=c.createRadialGradient(16,16,0,16,16,16),rgb=dark?'183,244,214':'38,113,174';
      g.addColorStop(0,`rgba(${rgb},.85)`);g.addColorStop(.18,`rgba(${rgb},.3)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,32,32);
      studyPalette={dark,start:dark?[74,222,128]:[27,82,153],
        end:dark?[[172,208,255],[194,176,255],[232,201,248],[255,219,184]]:[[36,91,184],[37,130,142],[123,95,160],[237,134,56]],sprite};
    }
    if(!studyPalette.dustEnd){
      // Same blue, violet/rose and warm core families, with stronger colour while letters dissolve.
      studyPalette.dustEnd=dark?[[118,167,255],[178,139,245],[225,158,226],[255,193,133]]:[[36,91,184],[62,127,160],[142,91,153],[220,132,50]];
      studyPalette.dustGlows=studyPalette.dustEnd.map(rgb=>{
        const sprite=document.createElement('canvas');sprite.width=sprite.height=24;const p=sprite.getContext('2d'),g=p.createRadialGradient(12,12,0,12,12,12),ink=rgb.join(',');
        g.addColorStop(0,`rgba(${ink},.9)`);g.addColorStop(.2,`rgba(${ink},.3)`);g.addColorStop(1,`rgba(${ink},0)`);p.fillStyle=g;p.fillRect(0,0,24,24);return sprite;
      });
    }
    // Four continuous colour mixes per frame, rather than visible 21-step palette changes.
    studyPalette.colors=studyPalette.end.map(rgb=>'rgb('+rgb.map((v,i)=>(studyPalette.start[i]+(v-studyPalette.start[i])*mix).toFixed(2)).join(',')+')');
    return studyPalette;
  }
  const neuralHead={x:0,y:0},neuralTail={x:0,y:0};
  function neuralTextClear(x,y,mask){return 1-(1-StudyMotion.ease(Math.hypot((x-width/2)/Math.min(width*.43,300),(y-height/2)/90)))*mask*.84;}
  function drawStudyNeural(paint,age,frame,targets,colors,textMask,dark){
    if(!studyNeuralPlan||age>2400)return;
    const quietFade=1-StudyMotion.ease((age-1750)/650);
    for(const path of studyNeuralPlan.paths){
      // Existing thread samples are already projected by the base strand pass.
      for(let j=0;j<path.points.length;j++){
        const p=path.points[j];if(path.kind==='thread'&&j>0&&j<path.points.length-1)continue;
        const target=path.kind==='thread'?studyArmTarget(path.arm,p.studyU,studyArmPoint):null;
        StudyMotion.map(p,target||studyTarget(p,path.index*19+j,targets),frame,studyPoint);p.studyX=studyPoint.x;p.studyY=studyPoint.y;
      }
      for(let echo=0;echo<(path.index%4===0?2:1);echo++){
        const pulse=StudyNeural.pulse(path,age,!!echo);if(pulse.opacity<.001||pulse.head===pulse.tail)continue;
        // A continuous head and three soft trail bands avoid whole-segment on/off flicker.
        for(let band=0;band<3;band++){
          const from=pulse.tail+(pulse.head-pulse.tail)*band/3,to=pulse.tail+(pulse.head-pulse.tail)*(band+1)/3;
          paint.beginPath();let started=false;
          for(let j=0;j<=5;j++){
            const u=from+(to-from)*j/5;StudyNeural.locate(path,pulse.reverse?1-u:u,neuralTail);
            if(!neuralTail.visible){started=false;continue;}
            if(started)paint.lineTo(neuralTail.x,neuralTail.y);else{paint.moveTo(neuralTail.x,neuralTail.y);started=true;}
          }
          paint.lineWidth=band===2?1.05:.8;paint.globalAlpha=pulse.opacity*quietFade*(.12+band*.17);
          paint.strokeStyle=dark?'#b7f4d6':'#337caf';paint.stroke();
        }
        StudyNeural.locate(path,pulse.reverse?1-pulse.head:pulse.head,neuralHead);
        if(neuralHead.visible){
          const alpha=pulse.opacity*quietFade*neuralTextClear(neuralHead.x,neuralHead.y,textMask.first),size=echo?5:9;
          paint.globalAlpha=alpha*.76;paint.drawImage(colors.sprite,neuralHead.x-size,neuralHead.y-size,size*2,size*2);
          paint.fillStyle=dark?'#e0fff0':'#175fa1';paint.globalAlpha=alpha*.86;paint.beginPath();paint.arc(neuralHead.x,neuralHead.y,echo?.65:1.05,0,Math.PI*2);paint.fill();
        }
      }
      // One restrained synaptic glint when a signal reaches its branching point.
      const arrived=age-path.arrive,energy=StudyMotion.ease(arrived/65)*(1-StudyMotion.ease((arrived-65)/270))*quietFade;
      if(energy>.001){const p=path.points[path.reverse?0:path.points.length-1],a=energy*neuralTextClear(p.studyX,p.studyY,textMask.first),r=7+energy*3;
        paint.globalAlpha=a*.62;paint.drawImage(colors.sprite,p.studyX-r,p.studyY-r,r*2,r*2);
        paint.globalAlpha=a*.85;paint.fillStyle=dark?'#cef8e5':'#286ca6';paint.beginPath();paint.arc(p.studyX,p.studyY,.8+energy*.65,0,Math.PI*2);paint.fill();}
    }
    paint.globalAlpha=1;
  }
  function studyTarget(p,index,targets){
    if(p.studyTargetId==null&&targets.length){const target=targets[index%targets.length];p.studyTargetId=target.id;p.studyTarget=target;p.studyPrimary=index<targets.length;}
    return window.innerWorldGalaxyProjection?.[p.studyTargetId]||p.studyTarget||{x:width/2,y:height/2};
  }
  function studyArmTarget(arm,u,out){
    const guide=window.studyGalaxyArms?.[arm];if(!guide?.length)return null;
    const f=StudyMotion.clamp(u)*(guide.length-1),i=Math.floor(f),a=guide[i],b=guide[Math.min(guide.length-1,i+1)],t=f-i;
    if(!a.visible||!b.visible)return null;out.x=a.x+(b.x-a.x)*t;out.y=a.y+(b.y-a.y)*t;return out;
  }
  let handoffThread=[];
  function captureHandoffThread(ray,tip){
    handoffThread=Array.from({length:49},(_,i)=>{
      const t=i/48;
      const q=ray.string.ready?ThoughtStrings.sample(ray.string,t):{x:handoffOrigin.x+(tip.x-handoffOrigin.x)*t,y:handoffOrigin.y+(tip.y-handoffOrigin.y)*t};
      return {x:q.x,y:q.y};
    });
  }
  function drawHandoffPulse(paint,age,cx,cy,colors){
    if(!handoffThread.length||age>4600)return;
    const inward=age<950;
    const progress=inward?1-StudyMotion.ease(age/950):StudyMotion.ease((age-950)/3500);
    const opacity=inward?StudyMotion.ease(age/140):1-StudyMotion.ease((age-3850)/750);
    paint.save();paint.strokeStyle=colors.colors[0];paint.lineCap='round';
    let previous=null;
    for(let i=0;i<=12;i++){
      const u=StudyMotion.clamp(progress+(inward?1:-1)*(1-i/12)*.17);
      let x,y;
      if(inward){
        const n=u*48,j=Math.floor(n),a=handoffThread[j],b=handoffThread[Math.min(48,j+1)],f=n-j;
        x=a.x+(b.x-a.x)*f+cx-handoffOrigin.x;y=a.y+(b.y-a.y)*f+cy-handoffOrigin.y;
      }else{
        const arm=studyArmTarget(0,u*.43,studyArmPoint);if(!arm)continue;
        const join=StudyMotion.ease(u/.25);
        x=cx+(arm.x-cx)*join;y=cy+(arm.y-cy)*join;
      }
      if(previous){paint.globalAlpha=opacity*(i/12)*.86;paint.lineWidth=.5+i/12*.85;paint.beginPath();paint.moveTo(previous.x,previous.y);paint.lineTo(x,y);paint.stroke();}
      if(i===12){paint.globalAlpha=opacity*.8;paint.drawImage(colors.sprite,x-5,y-5,10,10);}
      previous={x,y};
    }
    paint.restore();
  }
  function drawDeparture(time,age,inkRgb){
    const paint=departureCtx,dark=document.documentElement.getAttribute('data-theme')==='dark';
    const quiet=reduced||window.studySkipMotion,state=StudyMotion.state(age,quiet);
    window.studyFlightAge=quiet?age*StudyMotion.duration/StudyMotion.quietDuration:age;
    if(!flightSnapshot&&age<30)flightSnapshot=captureStudyMind();
    if(!prepareQuestionMotion.active||prepareQuestionMotion.active.width!==width||prepareQuestionMotion.active.height!==height||(!quiet&&!prepareQuestionMotion.active.rows.length))prepareQuestionMotion();
    if(state.done){finish();return;}
    paint.setTransform(Math.min(devicePixelRatio||1,2),0,0,Math.min(devicePixelRatio||1,2),0,0);
    paint.clearRect(0,0,width,height);
    const origin=handoffOrigin||{x:width/2,y:height/2,size:44};
    const centre=StudyMotion.ease(age/1300),cx=origin.x+(width/2-origin.x)*centre,cy=origin.y+(height/2-origin.y)*centre;
    // Reveal the real, live galaxy from its nucleus out through a soft atmospheric veil.
    const edge=Math.hypot(width,height)*.64;
    const veil=paint.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,edge));
    const rgb=dark?'7,9,11':'244,248,250';
    veil.addColorStop(0,`rgba(${rgb},${1-StudyMotion.ease((state.reveal-.02)/.8)})`);
    veil.addColorStop(.48,`rgba(${rgb},${1-StudyMotion.ease((state.reveal-.12)/.82)})`);
    veil.addColorStop(1,`rgba(${rgb},${1-state.reveal})`);paint.fillStyle=veil;paint.globalAlpha=1;paint.fillRect(0,0,width,height);
    if(flightSnapshot&&age<680){paint.globalAlpha=1-StudyMotion.ease((age-80)/600);paint.drawImage(flightSnapshot,0,0,width,height);}
    paint.globalAlpha=1;
    if(!quiet&&state.reveal<1){const drift=StudyMotion.ease(age/4200);paint.globalAlpha=(1-state.reveal)*.22;paint.drawImage(atmosphereCanvas,-width*drift*.018,-height*drift*.01,width*(1+drift*.036),height*(1+drift*.02));paint.globalAlpha=1;}
    const targets=window.innerWorldGalaxyTargets||[];
    const colors=studyColors(dark,StudyMotion.ease((age-1400)/2600));
    // The captured thought particles become the live galaxy stars, with no random re-seeding.
    const scratch=studyPoint,tail=studyTail,flightFrame=StudyMotion.transport(origin,width,height,age),tailFrame=StudyMotion.transport(origin,width,height,Math.max(0,age-32));
    const textMask=StudyMotion.question(age,prepareQuestionMotion.active.size);
    const trailEnvelope=StudyMotion.ease((age-1700)/550)*(1-StudyMotion.ease((age-4200)/500));
    if(!quiet)for(let bucket=0;bucket<4;bucket++){
      paint.fillStyle=colors.colors[bucket];
      for(let i=bucket;i<departureParticles.length;i+=4){
      const p=departureParticles[i],target=studyTarget(p,i,targets);
      StudyMotion.map(p,target,flightFrame,scratch);
      const duplicate=!p.studyPrimary,fade=duplicate?1-StudyMotion.ease((age-3900)/1100):1-StudyMotion.ease((age-4550)/650);
      const textZone=1-StudyMotion.ease(Math.hypot((scratch.x-width/2)/Math.min(width*.43,300),(scratch.y-height/2)/90));
      paint.globalAlpha=(p.edge?.21:.44)*fade*(1-textZone*textMask.first*.82);

      const near=i%89===0&&!p.edge?Math.sin(Math.PI*state.open)*state.push:0;
      const size=(p.edge?.6:.9)+Math.sin(Math.PI*state.open)*(i%13===0?.8:.12)+near*3;
      paint.fillRect(scratch.x-size/2,scratch.y-size/2,size,size);
      if(near>.001){const alpha=paint.globalAlpha;paint.globalAlpha=alpha*near*.4;const r=4+near*8;paint.drawImage(colors.sprite,scratch.x-r,scratch.y-r,r*2,r*2);paint.globalAlpha=alpha;}
      if((i%37===0||i%89===0)&&trailEnvelope>.001){
        StudyMotion.map(p,target,tailFrame,tail);
        paint.strokeStyle=colors.colors[i%4];paint.lineWidth=.65;paint.globalAlpha*=.5*trailEnvelope;
        paint.beginPath();paint.moveTo(tail.x,tail.y);paint.lineTo(scratch.x,scratch.y);paint.stroke();
      }
    }
    }
    // Each captured thought strand resolves onto a real projected galaxy arm.
    const threadFade=1-StudyMotion.ease((age-2450)/2000);
    if(threadFade>0&&!quiet){
      for(let i=0;i<departureWeb.length;i++){
        const thread=departureWeb[i];paint.beginPath();let started=false;
        thread.samples.forEach((p,j)=>{
          if(!p.visible){p.studyVisible=false;started=false;return;}
          const u=j/Math.max(1,thread.samples.length-1);
          const target=studyArmTarget(i%2,u,studyArmPoint)||studyTarget(p,i*13+j,targets);
          StudyMotion.map(p,target,flightFrame,scratch);
          p.studyX=scratch.x;p.studyY=scratch.y;p.studyVisible=true;
          if(started)paint.lineTo(scratch.x,scratch.y);else{paint.moveTo(scratch.x,scratch.y);started=true;}
        });
        paint.globalAlpha=(thread.alpha*.85+.014)*threadFade;
        paint.strokeStyle=colors.colors[i%4];paint.lineWidth=.55;paint.stroke();
      }
      // Original fine filaments retain the thought material between the brighter paths.
      const filamentFade=StudyMotion.ease(age/300)*(1-StudyMotion.ease((age-1800)/1600));
      for(const filament of studyFilaments){paint.beginPath();let started=false;
        for(const p of filament.points){if(!p.visible){started=false;continue;}
          const target=studyArmTarget(filament.arm,p.studyU,studyArmPoint)||studyTarget(p,filament.arm,targets);
          StudyMotion.map(p,target,flightFrame,scratch);if(started)paint.lineTo(scratch.x,scratch.y);else{paint.moveTo(scratch.x,scratch.y);started=true;}}
        paint.lineWidth=.4;paint.globalAlpha=filament.alpha*filamentFade;paint.strokeStyle=colors.colors[filament.arm];paint.stroke();}
      drawStudyNeural(paint,age,flightFrame,targets,colors,textMask,dark);
    }
    if(!quiet)drawHandoffPulse(paint,age,cx,cy,colors);
    // Preserve the square's identity as it compresses into the galaxy nucleus.
    if(age<1100&&!quiet){
      const collapse=StudyMotion.ease((age-160)/900),press=1-Math.sin(Math.min(1,age/180)*Math.PI)*.1;
      const side=(origin.size||44)*(1-collapse)*press+3*collapse;
      paint.globalAlpha=1-StudyMotion.ease((age-580)/520);paint.fillStyle=dark?'#eaf1ea':'#102a4d';
      paint.save();paint.translate(cx,cy);paint.rotate(collapse*.13);paint.fillRect(-side/2,-side/2,side,side);
      if(age<200){paint.globalAlpha*=1-StudyMotion.ease(age/200);paint.fillStyle=dark?'#07090b':'#f4f8fa';paint.textAlign='center';paint.font='600 8px Arial,sans-serif';paint.fillText('OH, HI',0,-1);paint.fillText('THERE!',0,8);}
      paint.restore();
    }
    // A quiet warm centre carries the square into the galaxy without a full-screen flash.
    const warmth=StudyMotion.ease((age-700)/1600)*(1-StudyMotion.ease((age-3350)/1300));
    if(warmth>.001){const radius=Math.min(width,height)*(.018+state.open*.075),g=paint.createRadialGradient(cx,cy,0,cx,cy,radius);
      g.addColorStop(0,`rgba(255,190,100,${warmth*(dark?.28:.15)})`);g.addColorStop(1,'rgba(255,190,100,0)');paint.fillStyle=g;paint.globalAlpha=1;paint.fillRect(cx-radius,cy-radius,radius*2,radius*2);}
    drawQuestionMaterial(paint,age,prepareQuestionMotion.active,colors,targets,dark,quiet);
  }

  function requestFrame() { if(!frameId && phase!=='gone') frameId=requestAnimationFrame(draw); }
  function enterModel() {
    if(phase!=='title'&&phase!=='bridge')return;
    ensureSceneSurfaces();
    if(phase!=='bridge')sceneStart=performance.now();
    phase='model';reel.querySelector('.question-accessible').textContent='';start=performance.now();
    scrollIntent=0;lastScrollAt=0;touchScroll=null;cursorReady=false;
    resetGreetingInteraction();
    cinemaTime=attention=0;
    title.querySelector('.is-current')?.classList.remove('is-current');
    bridgeDots.forEach(dot=>dot.style.opacity='0');
    title.inert=true;title.setAttribute('aria-hidden','true');
    reel.classList.remove('phase-bridge');reel.classList.add('phase-model');model.inert=false;
    warmQuestionMotion();requestFrame();
  }
  function enterBridge() {
    if(phase!=='title')return;
    ensureSceneSurfaces();
    title.querySelector('.is-current')?.classList.remove('is-current');
    const dotElements=title.querySelectorAll('.reel-ellipsis i');
    bridgeOrigins=Array.from(dotElements,element=> {
      const b=element.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2};
    });
    const bounds=(dotElements[1]||title.querySelector('em'))?.getBoundingClientRect();
    if(bounds&&bounds.width>0) {
      bridgeDotSize=clamp(bounds.width,4,12);
      seedOrigin={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};
      reel.style.setProperty('--seed-offset-x',(seedOrigin.x-width/2)+'px');
      reel.style.setProperty('--seed-offset-y',(seedOrigin.y-height/2)+'px');
    }
    phase='bridge';transitionStart=performance.now();sceneStart=transitionStart+1240;
    title.inert=true;title.setAttribute('aria-hidden','true');
    bridgeDots.forEach(dot=>{dot.style.width=dot.style.height=bridgeDotSize+'px';});
    reel.classList.add('phase-bridge');
    // Replace the original dots in the same task so there is no blank frame.
    draw(transitionStart,false);requestFrame();
    const token=run;
    setTimeout(()=>{if(token===run&&phase==='bridge')reel.classList.add('anchor-travel');},460);
    setTimeout(()=>{if(token===run&&phase==='bridge')enterModel();},1610);
  }
  function finish() {
    stopQuestionMotion();
    if(phase==='gone')return;
    phase='gone';run++;window.studyFlight=false;window.dispatchEvent(new Event('study-transition-end'));
    window.innerWorldMotion?.complete(motionToken);motionToken=null;
    reel.classList.remove('has-dot-cursor');marker.classList.remove('is-visible');
    departureCanvas.style.opacity='0';departureCtx.clearRect(0,0,width,height);
    atmosphereCtx.clearRect(0,0,width,height);
    depthCtx.clearRect(0,0,width,height);
    detailCtx.clearRect(0,0,width,height);
    cancelAnimationFrame(frameId);frameId=0;
    document.body.classList.remove('reel-active','reel-dark','reel-handoff');
    document.body.classList.add('galaxy-arrived');
    galaxyTrack.inert=false;galaxyInterface.inert=false;
    reel.classList.add('is-gone');reel.inert=true;reel.setAttribute('aria-hidden','true');
    model.inert=true;header.inert=false;
    header.removeAttribute('aria-hidden');
    if(portfolioContent)portfolioContent.inert=false;
    window.dispatchEvent?.(new Event('inner-world-galaxy-wake'));
    document.getElementById('model-return').focus({preventScroll:true});
  }
  function skipIntro(event) {
    event?.preventDefault();
    if(phase==='gone')return;
    reel.classList.add('is-skipped');
    finish();
  }
  function reopen() {
    if(phase!=='gone')return;
    stopQuestionMotion();
    window.scrollTo?.({top:galaxyTrack.offsetTop||0,behavior:'instant'});
    run++;if(introHeader)introHeader.inert=false;reel.querySelector('.question-accessible').textContent='';window.studyFlight=false;reel.classList.remove('study-flight');reel.style.removeProperty('--study-reveal');phase='model';start=sceneStart=performance.now();
    scrollIntent=0;lastScrollAt=0;touchScroll=null;cursorReady=false;
    resetGreetingInteraction();
    cinemaTime=attention=0;reel.classList.remove('is-attentive');
    document.body.classList.remove('reel-handoff','galaxy-arrived');document.body.classList.add('reel-active');header.inert=true;
    header.setAttribute('aria-hidden','true');
    if(portfolioContent)portfolioContent.inert=true;
    galaxyTrack.inert=true;galaxyInterface.inert=true;
    reel.inert=false;reel.removeAttribute('aria-hidden');
    reel.classList.remove('is-skipped','is-gone','phase-bridge','phase-question','phase-handoff');reel.classList.add('phase-model');
    model.inert=false;core.classList.remove('is-armed');coreGrowth=coreVelocity=0;corePress=null;
    departureCanvas.style.opacity='0';departureCtx.clearRect(0,0,width,height);
    coreFollowX=coreFollowY=0;nodeMotion.forEach(m=>{m.x=m.y=m.xVelocity=m.yVelocity=0;});
    coreFollowMotion.x=coreFollowMotion.y=coreFollowMotion.xVelocity=coreFollowMotion.yVelocity=0;
    rays.forEach(ray=>ray.string.ready=false);webThreads.forEach(thread=>thread.string.ready=false);
    thoughtActive=-1;thoughtSignalAge=2200;thoughtFocus.forEach(m=>{m.value=m.valueVelocity=0;});
    transitionStart=handoffStart=0;handoffOrigin=null;departureParticles=[];departureEndpoints=[];
    departureWeb=[];
    reel.style.setProperty('--question-reveal','0');
    motes.forEach(mote=>{mote.dx=mote.dy=0;});
    rays.forEach(ray=>{ray.disturbed=false;ray.particles.forEach(p=>{p.energy=p.dx=p.dy=p.dxVelocity=p.dyVelocity=0;});});
    window.innerWorldGalaxyTargets=[];
    window.dispatchEvent?.(new Event('inner-world-galaxy-wake'));
    webThreads.forEach(thread=>thread.samples.forEach(p=>{p.energy=p.dx=p.dy=p.dxVelocity=p.dyVelocity=0;}));
    thoughtMaterial.forEach(material=>material.filaments.forEach(f=>f.points.forEach(p=>{p.energy=0;})));
    thoughtKnots.clear();lastKnotScan=-Infinity;
    weavePresence=0;modelBranches.forEach(branch=>branch.points.forEach(p=>{p.energy=0;}));
    lastDetailPaint=-Infinity;
    pointerInside=false;
    model.tabIndex=-1;model.focus({preventScroll:true});
    warmQuestionMotion();requestFrame();
  }
  function resetGreetingInteraction() {
    greetingReadTime=0;suppressCoreClick=false;wheelGreetingGesture=false;
    core.classList.remove('is-armed');
  }
  function continueToGalaxy(event) {
    if(phase!=='model')return;
    const touch=event.pointerType==='touch'||(event.detail>0&&matchMedia('(hover:none)').matches);
    if(touch||event.greetingRequired) {
      if(!core.classList.contains('is-armed')) {
        core.classList.add('is-armed');greetingReadTime=0;requestFrame();return;
      }
      // A second action can continue only after both greeting lines have resolved.
      if(greetingReadTime<450)return;
    }
    motionToken=window.innerWorldMotion?.begin('reel',()=>finish())||null;handoffTargetsReadyAt=null;
    sizeSurface(departureCanvas,departureCtx,2);
    handoffOrigin={...currentCore};transitionStart=performance.now();
    reel.style.setProperty('--question-reveal',reduced?'1':'0');
    departureCanvas.style.opacity='1';
    const {endpoints}=positions(transitionStart,16);
    captureHandoffThread(rays[0],endpoints[0]);
    departureEndpoints=endpoints.slice(0,nodes.length);
    departureParticles=rays.flatMap((ray,r)=> {
      const vx=endpoints[r].x-handoffOrigin.x,vy=endpoints[r].y-handoffOrigin.y;
      const length=Math.max(1,Math.hypot(vx,vy));
      return ray.particles.map(p=>{
        const q=ray.string.ready?ThoughtStrings.sample(ray.string,p.t,stringPoint):{x:handoffOrigin.x+vx*p.t,y:handoffOrigin.y+vy*p.t};
        return {
        x:q.x+p.dx,
        y:q.y+p.dy,
        scatterX:-vy/length*Math.sin(p.seed)*(4+p.t*12),
        scatterY:vx/length*Math.sin(p.seed)*(4+p.t*12),
        endX:endpoints[r].x,endY:endpoints[r].y,t:p.t,seed:p.seed,edge:ray.edge,alpha:ray.alpha
      };});
    });
    departureWeb=webThreads.map(thread=>({a:thread.a,b:thread.b,alpha:thread.alpha,samples:thread.samples.map(p=>({...p,x:p.x+p.dx*.15,y:p.y+p.dy*.15}))}));
    // The curved threads share the same gathering and galaxy release as the spokes.
    departureWeb.forEach(thread=>thread.samples.forEach(p=> {
      if(!p.visible)return;
      departureParticles.push({x:p.x+p.dx,y:p.y+p.dy,scatterX:Math.sin(p.seed)*9,scatterY:Math.cos(p.seed)*9,
        endX:p.x,endY:p.y,t:p.t,seed:p.seed,edge:true,alpha:thread.alpha,web:true});
    }));
    prepareStudyDetails();
    phase='question';if(introHeader)introHeader.inert=true;reel.querySelector('.question-accessible').textContent='Curious what that actually looks like?';pointerInside=false;core.classList.remove('is-armed');
    dragging=false;corePress=null;touchScroll=null;
    reel.classList.remove('has-dot-cursor');
    reel.classList.remove('phase-model');reel.classList.add('phase-question');model.inert=true;
    marker.classList.remove('is-visible');
    const pointerActivation=event.type?.startsWith('pointer')||['mouse','touch','pen'].includes(event.pointerType);
    window.studySkipMotion=reduced||(event.detail===0&&!pointerActivation);
    drawDeparture(transitionStart,0,document.documentElement?.getAttribute('data-theme')==='dark'?'74,222,128':'27,82,153');
    ++run;window.studyFlight=true;window.studyFlightStart=transitionStart;window.studyFlightAge=0;
    reel.classList.add('study-flight');window.dispatchEvent(new Event('study-transition-start'));
    window.dispatchEvent(new Event('inner-world-galaxy-wake'));requestFrame();
  }
  model.addEventListener('pointermove',event=> {
    if(phase!=='model')return;
    const bounds=model.getBoundingClientRect();px=event.clientX-bounds.left;py=event.clientY-bounds.top;
    if(!cursorReady&&event.pointerType!=='touch') {cursorX=px;cursorY=py;cursorReady=true;positionCursor();}
    pointerInside=true;
    pointerFine=event.pointerType!=='touch';
    marker.classList.toggle('is-visible',event.pointerType!=='touch');
    reel.classList.toggle('has-dot-cursor',event.pointerType!=='touch');
    if(touchScroll&&event.pointerType==='touch'&&touchScroll.pointerId===event.pointerId&&!corePress) {
      const up=touchScroll.y-py,side=Math.abs(px-touchScroll.x);
      if(performance.now()-start>=250&&up>=64&&up>side*1.25) {
        // Consume this swipe: holding the finger down cannot advance twice.
        touchScroll=null;dragging=false;
        continueToGalaxy({detail:0,pointerType:'touch'});return;
      }
    }
    if(dragging) {
      dragX=clamp(dragX+(px-lastX)*.18,-20,20);dragY=clamp(dragY+(py-lastY)*.18,-16,16);
      lastX=px;lastY=py;
    }
    requestFrame();
  },{passive:true});
  model.addEventListener('pointerleave',()=> {pointerInside=false;cursorReady=false;marker.classList.remove('is-visible');reel.classList.remove('has-dot-cursor');});
  reel.addEventListener('wheel',event=> {
    if(phase==='gone'||event.ctrlKey)return;
    event.preventDefault();
    if(phase!=='model'||corePress||performance.now()-start<250)return;
    if(event.deltaY<=0||Math.abs(event.deltaX||0)>Math.abs(event.deltaY)) {scrollIntent=0;return;}
    const now=performance.now();
    if(now-lastScrollAt>220) {scrollIntent=0;wheelGreetingGesture=false;}
    lastScrollAt=now;
    if(wheelGreetingGesture)return;
    scrollIntent+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);
    if(scrollIntent>=64) {
      scrollIntent=0;
      // Consume the whole wheel burst, including momentum. A fresh gesture
      // can continue only after the expanded greeting has been readable.
      wheelGreetingGesture=true;
      continueToGalaxy({detail:0,pointerType:'mouse',greetingRequired:true});
    }
  },{passive:false});
  model.addEventListener('pointerdown',event=> {
    if(phase!=='model')return;
    suppressCoreClick=false;
    const bounds=model.getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
    if(event.pointerType!=='touch') {cursorX=x;cursorY=y;positionCursor();}
    touchScroll=null;
    const half=Math.max(48,currentCore.size)/2+4;
    if(Math.abs(x-currentCore.x)<=half&&Math.abs(y-currentCore.y)<=half) {
      corePress={...currentCore,pointerId:event.pointerId,downX:x,downY:y};
      dragging=false;model.setPointerCapture(event.pointerId);event.preventDefault();
      return;
    }
    if(event.target.closest('button'))return;
    if(event.pointerType==='touch')touchScroll={x,y,pointerId:event.pointerId};
    dragging=true;lastX=event.clientX;lastY=event.clientY;
    model.setPointerCapture(event.pointerId);
  });
  const release=event=> {
    touchScroll=null;
    dragging=false;
    if(corePress&&corePress.pointerId===event.pointerId) {
      const press=corePress;
      const bounds=model.getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
      const half=Math.max(48,press.size)/2+10;
      corePress=null;
      if(event.type!=='pointercancel'&&Math.abs(x-press.x)<=half&&Math.abs(y-press.y)<=half&&Math.hypot(x-press.downX,y-press.downY)<16) {
        suppressCoreClick=true;lastCoreActivation=performance.now();continueToGalaxy(event);
      }
      model.releasePointerCapture?.(event.pointerId);
    }
    if(event.pointerType==='touch')pointerInside=false;
  };
  model.addEventListener('pointerup',release);model.addEventListener('pointercancel',release);
  core.addEventListener('click',event=> {
    if(event.detail>0&&(suppressCoreClick||performance.now()-lastCoreActivation<450)) {
      suppressCoreClick=false;return;
    }
    continueToGalaxy(event);
  });
  document.getElementById('model-return').addEventListener('click',reopen);
  document.querySelectorAll('[data-replay]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();location.reload();}));
  // Explicit navigation can leave the reel without trapping the full site's links.
  document.getElementById('reel-skip-btn')?.addEventListener('click',skipIntro);
  document.querySelector('.skip-link')?.addEventListener('click',finish);
  introHeader?.querySelectorAll('a[href="#about"],a[href="#contact"]').forEach(link=>link.addEventListener('click',finish));
  window.addEventListener('resize',measure,{passive:true});
  document.fonts?.ready.then(measureLabels);
  document.addEventListener('visibilitychange',requestFrame);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(phase==='question'||phase==='handoff'))finish();});
  header.inert=true;measure();
  // Continue from the opening title's clock, even if the main scripts arrived later.
  const typeComplete=Number(title.getAttribute('data-type-complete'))||3331;
  if(reduced)enterModel();else {
    if(!title.dataset.typingStarted){
(() => {
  const title = document.getElementById('reel-title');
  if (title.dataset.typingStarted || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const reel = title.closest('.intro-reel');
  title.dataset.typingStarted = String(performance.now());
  let caret;
  for (const letter of title.querySelectorAll('[data-type-at]')) {
    setTimeout(() => {
      if (reel.inert || title.inert) return;
      letter.classList.add('is-typed');
      caret?.classList.remove('is-current');
      caret = letter.textContent === '.' ? null : letter;
      caret?.classList.add('is-current');
    }, Number(letter.dataset.typeAt));
  }
})();

    }
    const remaining=Number(title.dataset.typingStarted)+typeComplete-performance.now();
    // Generate the cached fog during the still reading beat, not during dot travel.
    setTimeout(()=>{if(phase==='title')prepareAtmosphere(document.documentElement?.getAttribute('data-theme')==='dark');},Math.max(0,remaining+120));
    setTimeout(enterBridge,Math.max(0,remaining+650));
  }
})();

/* V7.3 heading optics: event-driven, one shared decorative Canvas, no idle loop. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const records=[],active=new Set(),pending=new Set();let film=null,paint=null,frame=0,last=0,keyboard=false,themeCache=null;
  const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*t*(10+t*(-15+6*t));};
  const rgba=(rgb,a)=>`rgba(${rgb.join(',')},${a})`;
  function palette(){const dark=document.documentElement.getAttribute('data-theme')==='dark';if(themeCache?.dark===dark)return themeCache;
    const tones=dark?[[133,185,255],[196,157,255],[255,205,139],[239,246,255]]:[[46,104,193],[123,89,161],[201,129,49],[94,139,187]];
    const glows=tones.map(rgb=>{const c=document.createElement('canvas');c.width=c.height=24;const p=c.getContext('2d'),g=p.createRadialGradient(12,12,0,12,12,12);g.addColorStop(0,rgba(rgb,.85));g.addColorStop(.2,rgba(rgb,.22));g.addColorStop(1,rgba(rgb,0));p.fillStyle=g;p.fillRect(0,0,24,24);return c;});
    return themeCache={dark,tones,glows};}
  function permitted(){return !reduced.matches&&!forced.matches&&!document.hidden&&!keyboard&&!document.body.classList.contains('reel-active')&&!document.body.classList.contains('chapter-travelling')&&!document.getElementById('drawer')?.classList.contains('open');}
  function eligible(r){if(!permitted()||r.node.hidden||r.node.closest('[inert], [hidden]'))return false;const row=r.node.closest('.sequence-item');if(row&&!row.classList.contains('sequence-ready'))return false;
    const b=r.node.getBoundingClientRect();if(!(b.width>0&&b.height>0&&b.bottom>0&&b.top<innerHeight))return false;for(const parent of r.cache?.clips||[]){const c=parent.getBoundingClientRect();if(b.bottom<=c.top||b.top>=c.bottom||b.right<=c.left||b.left>=c.right)return false;}return true;}
  function surface(){if(film)return true;film=document.createElement('canvas');film.className='heading-optics-film';film.setAttribute('aria-hidden','true');film.setAttribute('role','presentation');document.body.appendChild(film);paint=film.getContext('2d');if(!paint){film.remove();film=null;return false;}resizeFilm();return true;}
  function resizeFilm(){if(!film)return;const dpr=Math.min(devicePixelRatio||1,1.5);film.width=Math.round(innerWidth*dpr);film.height=Math.round(innerHeight*dpr);paint.setTransform(dpr,0,0,dpr,0,0);}
  function prepare(r){const b=r.node.getBoundingClientRect(),s=getComputedStyle(r.node),size=parseFloat(s.fontSize)||32,line=parseFloat(s.lineHeight)||size*1.2;
    if(r.cache&&Math.abs(r.cache.w-b.width)<.5&&Math.abs(r.cache.h-b.height)<.5)return r.cache;
    const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,b.width),h=Math.max(line,b.height),mask=document.createElement('canvas'),coat=document.createElement('canvas');
    mask.width=coat.width=Math.ceil(w*dpr);mask.height=coat.height=Math.ceil(h*dpr);const c=mask.getContext('2d'),q=coat.getContext('2d');
    if(!c||!q)return null;const font=`${s.fontStyle||'normal'} ${s.fontWeight||500} ${size}px ${s.fontFamily||'sans-serif'}`;c.setTransform(dpr,0,0,dpr,0,0);c.font=font;c.textBaseline='alphabetic';c.fillStyle='#fff';
    const fm=c.measureText('Mg'),ascent=fm.fontBoundingBoxAscent??size*.8,descent=fm.fontBoundingBoxDescent??size*.2,glyphs=[];
    let usedRange=false;
    if(document.createRange&&document.createTreeWalker){
      const walk=document.createTreeWalker(r.ink,4);let text;try{while((text=walk.nextNode()))for(let i=0;i<text.textContent.length;i++){
        const ch=text.textContent[i],range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);const a=range.getBoundingClientRect();range.detach?.();if(!a.width||!ch.trim())continue;
        const letter=s.textTransform==='uppercase'?ch.toUpperCase():ch;glyphs.push({letter,x:a.left-b.left,y:a.top-b.top+(a.height-ascent-descent)/2+ascent,width:a.width,colour:getComputedStyle(text.parentElement||r.ink).color});}
        usedRange=glyphs.length>0;}catch(_){glyphs.length=0;}
    }
    if(!usedRange){let x=parseFloat(s.paddingLeft)||0,y=(line-ascent-descent)/2+ascent;const left=x,right=w-(parseFloat(s.paddingRight)||0),spacing=parseFloat(s.letterSpacing)||0;
      let text=r.ink.textContent.trim().replace(/\s+/g,' ');if(s.textTransform==='uppercase')text=text.toUpperCase();
      for(const word of text.split(' ')){const width=c.measureText(word).width+spacing*word.length;if(x>left&&x+width>right){x=left;y+=line;}
        let prefix='';for(const letter of word){const gx=x+c.measureText(prefix).width+spacing*prefix.length;glyphs.push({letter,x:gx,y,width:c.measureText(letter).width});prefix+=letter;}x+=width+c.measureText(' ').width;}
    }
    if(!usedRange){const accent=r.ink.querySelector?.('.chapter-accent');if(accent){const count=accent.textContent.replace(/\s/g,'').length,colour=getComputedStyle(accent).color;glyphs.slice(-count).forEach(g=>g.colour=colour);}}
    for(const g of glyphs)c.fillText(g.letter,g.x,g.y);
    const x0=Math.min(...glyphs.map(g=>g.x)),x1=Math.max(...glyphs.map(g=>g.x+g.width));
    const clips=[];for(let parent=r.node.parentElement;parent&&parent!==document.body;parent=parent.parentElement){const style=getComputedStyle(parent);if(/hidden|clip|auto|scroll/.test((style.overflowX||'')+' '+(style.overflowY||'')))clips.push(parent);}
    const cache={w,h,dpr,font,size,line,ascent,descent,mask,coat,c:q,glyphs,x0,x1,colour:s.color,stars:[],clips};q.setTransform(dpr,0,0,dpr,0,0);
    if(r.kind==='project'&&glyphs.length){
      const pixels=c.getImageData(0,0,mask.width,mask.height).data;
      for(let i=0;i<8;i++){const g=glyphs[Math.floor((i+.5)/8*glyphs.length)],random=(Math.sin(i*37.71+r.ink.textContent.length)*43758.5453)%1,seed=Math.abs(random),px=Math.round((g.x+g.width*.48)*dpr);let py=Math.min(mask.height-1,Math.floor((g.y+descent)*dpr));
        for(;py>Math.max(0,(g.y-ascent)*dpr);py--)if(pixels[(py*mask.width+Math.min(mask.width-1,px))*4+3]>90)break;
        cache.stars.push({x:px/dpr,y:py/dpr,dx:(i%2?1:-1)*(18+seed*24),dy:-12-seed*24,delay:70+seed*150,duration:650+seed*280,size:.65+seed*.8,seed,index:i});}
    }
    return r.cache=cache;
  }
  function clearRecord(r){r.node.classList.remove('optical-carry','optical-fire');r.motion=null;r.hover=false;r.pointer.alpha=0;active.delete(r);}
  function clearAll(){cancelAnimationFrame(frame);frame=0;active.forEach(clearRecord);active.clear();if(paint)paint.clearRect(0,0,innerWidth,innerHeight);if(film)film.style.visibility='hidden';}
  function wake(){if(!frame&&active.size)frame=requestAnimationFrame(render);}
  function play(r,stars=r.kind==='project'){
    if(!eligible(r)||!surface())return false;const m=prepare(r);if(!m?.glyphs.length)return false;
    if(active.size>=2&&!active.has(r)){const oldest=[...active].find(x=>!x.hover)||[...active][0];clearRecord(oldest);}
    const now=performance.now();if(!r.motion||now-r.motion.start>850){r.motion={start:now,duration:980,stars};r.node.classList.add('optical-fire');}
    r.played=true;active.add(r);film.style.visibility='visible';wake();return true;
  }
  function flush(){if(!permitted())return;for(const r of pending){if(!r.visible){pending.delete(r);continue;}if(r.played){pending.delete(r);continue;}
      if(r.kind==='project'&&fine.matches)continue;if(active.size>=2)break;if(play(r))pending.delete(r);}}
  function glyphMask(m,age,lift){const c=m.c;c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,m.w,m.h);
    if(lift){c.font=m.font;c.fillStyle='#fff';c.textBaseline='alphabetic';for(const g of m.glyphs){const u=(g.x-m.x0)/Math.max(1,m.x1-m.x0),wave=Math.sin(Math.PI*clamp((age-100-u*340)/330));c.fillText(g.letter,g.x,g.y-wave*1.65);}}
    else c.drawImage(m.mask,0,0,m.w,m.h);
  }
  function reflection(out,m,b,age,tones,lift){const u=ease(age/980),span=m.x1-m.x0;
    for(let band=0;band<3;band++){
      glyphMask(m,age,lift);const c=m.c,head=m.x0-span*.65+u*span*2.3-band*18,width=band===0?Math.max(76,Math.min(170,span*.55)):10;
      const g=c.createLinearGradient(head-width,0,head+width,m.h*.35);g.addColorStop(0,rgba(tones[0],0));
      if(band===0){g.addColorStop(.36,rgba(tones[0],.38));g.addColorStop(.48,rgba(tones[3],.88));g.addColorStop(.56,rgba(tones[1],.52));g.addColorStop(.66,rgba(tones[2],.25));}
      else g.addColorStop(.5,rgba(tones[band===1?1:2],band===1?.44:.34));g.addColorStop(1,rgba(tones[2],0));
      c.globalCompositeOperation='source-in';c.fillStyle=g;c.fillRect(0,0,m.w,m.h);c.globalCompositeOperation='source-over';out.globalAlpha=1;out.drawImage(m.coat,b.left,b.top,m.w,m.h);
    }
  }
  function refract(out,r,m,b,tones){const p=r.pointer;if(p.alpha<.002)return;glyphMask(m,0,false);const c=m.c,radius=Math.min(112,Math.max(64,m.size*2.7)),g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
    g.addColorStop(0,rgba(tones[3],.76));g.addColorStop(.28,rgba(tones[0],.46));g.addColorStop(.65,rgba(tones[1],.2));g.addColorStop(1,rgba(tones[1],0));
    c.globalCompositeOperation='source-in';c.fillStyle=g;c.fillRect(0,0,m.w,m.h);c.globalCompositeOperation='source-over';out.globalAlpha=p.alpha;out.drawImage(m.coat,b.left+.45,b.top-.35,m.w,m.h);
    out.globalAlpha=p.alpha*.28;out.drawImage(m.coat,b.left-.45,b.top+.35,m.w,m.h);out.globalAlpha=1;
  }
  function starPoint(p,t){const u=ease(t);return{x:p.x+p.dx*u+Math.sin(Math.PI*u)*(p.index%2?5:-5),y:p.y+p.dy*u-Math.sin(Math.PI*u)*(6+p.seed*7)};}
  function stars(out,m,b,age,tones,glows){let moving=false;for(const p of m.stars){const t=(age-p.delay)/p.duration;if(t<0){moving=true;continue;}if(t>=1)continue;moving=true;
      const a=starPoint(p,t),tail=starPoint(p,Math.max(0,t-.065)),alpha=ease(t/.12)*(1-ease((t-.62)/.38)),rgb=tones[p.index%3],size=p.size*(1+Math.sin(Math.PI*t)*.35);
      out.globalAlpha=alpha*.36;out.strokeStyle=rgba(rgb,1);out.lineWidth=.55;out.beginPath();out.moveTo(b.left+tail.x,b.top+tail.y);out.lineTo(b.left+a.x,b.top+a.y);out.stroke();
      out.globalAlpha=alpha*.58;const radius=p.index===0?6:3.5;out.drawImage(glows[p.index%3],b.left+a.x-radius,b.top+a.y-radius,radius*2,radius*2);
      out.globalAlpha=alpha;out.fillStyle=rgba(p.index===0?tones[3]:rgb,1);out.fillRect(b.left+a.x-size/2,b.top+a.y-size/2,size,size);
    }out.globalAlpha=1;return moving;}
  function render(time){frame=0;if(!permitted()){clearAll();return;}const dt=Math.min(40,Math.max(1,last?time-last:16));last=time;
    paint.clearRect(0,0,innerWidth,innerHeight);let again=false;const pal=palette();
    for(const r of [...active]){if(!eligible(r)){clearRecord(r);continue;}const m=prepare(r);if(!m){clearRecord(r);continue;}const b=r.node.getBoundingClientRect(),age=r.motion?time-r.motion.start:Infinity,entering=age<980;
      paint.save();for(const parent of m.clips){const c=parent.getBoundingClientRect();paint.beginPath();paint.rect(c.left,c.top,c.width,c.height);paint.clip();}
      const p=r.pointer,k=1-Math.exp(-dt/62),goal=r.hover?1:0;p.x+=(p.tx-p.x)*k;p.y+=(p.ty-p.y)*k;p.alpha+=(goal-p.alpha)*(1-Math.exp(-dt/72));
      const settling=Math.abs(p.tx-p.x)+Math.abs(p.ty-p.y)>.12||Math.abs(p.alpha-goal)>.003;
      if(!r.hover&&p.alpha<.002&&!entering&&age>=1200){paint.restore();clearRecord(r);continue;}
      const lift=entering&&r.kind!=='project';r.node.classList.toggle('optical-carry',lift);
      if(lift){paint.font=m.font;paint.textBaseline='alphabetic';paint.fillStyle=m.colour;paint.globalAlpha=1;
        for(const g of m.glyphs){const u=(g.x-m.x0)/Math.max(1,m.x1-m.x0),wave=Math.sin(Math.PI*clamp((age-100-u*340)/330));paint.fillStyle=g.colour||m.colour;paint.fillText(g.letter,b.left+g.x,b.top+g.y-wave*1.65);}}
      if(entering)reflection(paint,m,b,age,pal.tones,lift);
      refract(paint,r,m,b,pal.tones);const emitting=r.motion?.stars?stars(paint,m,b,age,pal.tones,pal.glows):false;
      again=again||entering||settling||emitting||(!r.hover&&(age<1200||p.alpha>=.002));paint.restore();
    }
    if(!active.size){film.style.visibility='hidden';flush();}else if(again)wake();
  }
  function register(node,kind){if(!node||node.dataset.opticalReady||!node.childNodes)return null;
    const ink=document.createElement('span');ink.className='optical-ink';while(node.firstChild)ink.appendChild(node.firstChild);node.appendChild(ink);node.dataset.opticalReady='true';
    const r={node,ink,kind,played:false,visible:false,cache:null,motion:null,hover:false,pointer:{x:0,y:0,tx:0,ty:0,alpha:0}};records.push(r);
    node.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||!fine.matches)return;keyboard=false;const b=node.getBoundingClientRect();r.pointer.x=r.pointer.tx=e.clientX-b.left;r.pointer.y=r.pointer.ty=e.clientY-b.top;r.hover=true;if(!play(r))r.hover=false;});
    node.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!fine.matches||!r.hover)return;const b=node.getBoundingClientRect();r.pointer.tx=e.clientX-b.left;r.pointer.ty=e.clientY-b.top;wake();});
    const leave=()=>{r.hover=false;wake();};node.addEventListener('pointerleave',leave);node.addEventListener('pointercancel',leave);
    return r;
  }
  document.querySelectorAll('#main-content h2.section-title').forEach(n=>register(n,'section'));
  // Individual project titles remain ordinary text; optics belong to section headings.
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries){const r=records.find(x=>x.node===entry.target);if(!r)continue;r.visible=entry.isIntersecting;if(r.visible&&!r.played)pending.add(r);else if(!r.visible){pending.delete(r);clearRecord(r);}}flush();if(active.size)wake();else if(paint){paint.clearRect(0,0,innerWidth,innerHeight);film.style.visibility='hidden';}},{threshold:.55}):null;
  records.forEach(r=>observer?.observe(r.node));
  function revisit(){flush();if(active.size)wake();}
  if(typeof MutationObserver==='function'){
    const changed=new MutationObserver(revisit);changed.observe(document.body,{attributes:true,attributeFilter:['class']});
    records.forEach(r=>{changed.observe(r.node,{attributes:true,attributeFilter:['class']});const parent=r.node.closest('article');if(parent)changed.observe(parent,{attributes:true,attributeFilter:['class','hidden','inert']});});
    const theme=new MutationObserver(()=>{themeCache=null;records.forEach(r=>r.cache=null);revisit();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  window.addEventListener('portfolio-timeline-arrival',e=>{const node=e.detail?.row?.querySelector('h4');let r=records.find(r=>r.node===node);if(!r)r=register(node,'timeline');if(r){r.visible=true;play(r,false);}});
  window.addEventListener('study-transition-end',()=>requestAnimationFrame(revisit));
  window.addEventListener('scroll',()=>{if(active.size)wake();},{passive:true});
  window.addEventListener('resize',()=>{clearAll();records.forEach(r=>r.cache=null);resizeFilm();flush();},{passive:true});
  document.fonts?.ready.then(()=>{records.forEach(r=>r.cache=null);revisit();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAll();else revisit();});
  document.addEventListener('keydown',e=>{if(['Tab','Enter',' '].includes(e.key)){keyboard=true;clearAll();}},true);
  reduced.addEventListener?.('change',()=>{clearAll();if(!reduced.matches)flush();});forced.addEventListener?.('change',()=>{clearAll();if(!forced.matches)flush();});
  window.headingOptics={get stats(){return{registered:records.length,active:active.size,scheduled:!!frame,particles:[...active].reduce((n,r)=>n+(r.cache?.stars.length||0),0)};}};
})();

/* The About introduction resolves on each chapter visit, then hands the reading rhythm to its prose. */
(() => {
  const prose=document.querySelector('.about-reading .reading-prose');
  const lead=prose?.querySelector('.reading-lead');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
  if(!lead?.childNodes||!lead.textContent.trim()||reduced.matches||forced.matches||typeof IntersectionObserver!=='function')return;
  const ink=document.createElement('span');ink.className='thought-ink';
  while(lead.firstChild)ink.appendChild(lead.firstChild);
  lead.appendChild(ink);
  const followers=[...prose.children].filter(n=>n!==lead);

  const symbols=Array.from('アイウエオカキクケサシスセタチツナニハヒミムヤユラリワ');
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*n*(10+n*(-15+6*n));};
  let frame=0,started=0,played=false,visible=false,film=null,paint=null,layout=null,observer=null;
  function cleanup(){
    cancelAnimationFrame(frame);frame=0;film?.remove();film=paint=layout=null;
    lead.classList.remove('thought-decoding','thought-waiting');lead.style.removeProperty('--thought-border');prose.classList.remove('thought-staged');
    followers.forEach(n=>{n.classList.remove('thought-follow');n.style.removeProperty('--thought-follow');});
  }
  function finish(){played=true;cleanup();}
  function arm(){
    cleanup();played=false;
    if(reduced.matches||forced.matches){finish();return;}
    lead.classList.add('thought-waiting');prose.classList.add('thought-staged');
    followers.forEach(node=>node.classList.add('thought-follow'));
  }
  arm();
  function allowed(){
    const body=document.body.classList;
    if(document.hidden||reduced.matches||forced.matches||body.contains('reel-active')||body.contains('chapter-travelling')||lead.closest('[inert], [hidden]'))return false;
    const chapter=lead.closest('.reading-chapter');
    return !chapter?.classList.contains('scroll-reveal')||chapter.classList.contains('is-visible');
  }
  function measure(){
    const b=lead.getBoundingClientRect(),s=getComputedStyle(lead);
    const size=parseFloat(s.fontSize)||20,line=parseFloat(s.lineHeight)||size*1.65,dpr=Math.min(devicePixelRatio||1,2);
    if(b.width<20||b.height<1)return null;
    film=document.createElement('canvas');film.className='thought-film';film.setAttribute('aria-hidden','true');film.setAttribute('role','presentation');
    film.width=Math.ceil(b.width*dpr);film.height=Math.ceil(b.height*dpr);
    film.style.width=b.width+'px';film.style.height=b.height+'px';
    lead.appendChild(film);paint=film.getContext('2d');if(!paint)return null;
    paint.setTransform(dpr,0,0,dpr,0,0);
    const font=`${s.fontWeight||400} ${size}px ${s.fontFamily||'sans-serif'}`;
    paint.font=font;paint.textBaseline='alphabetic';
    const fm=paint.measureText('Mg'),ascent=fm.fontBoundingBoxAscent??size*.8,descent=fm.fontBoundingBoxDescent??size*.2;
    const glyphs=[];
    // Browser glyph ranges preserve the existing wrapping, kerning and line breaks.
    if(document.createRange&&document.createTreeWalker){
      try{
        const walk=document.createTreeWalker(ink,4);let text;
        while((text=walk.nextNode())){const ts=getComputedStyle(text.parentElement||ink),glyphFont=`${ts.fontWeight||s.fontWeight||400} ${size}px ${s.fontFamily||'sans-serif'}`;
          for(let i=0;i<text.textContent.length;i++){
          const letter=text.textContent[i];if(!letter.trim())continue;
          const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);const a=range.getBoundingClientRect();range.detach?.();
          if(a.width>0)glyphs.push({letter,x:a.left-b.left,y:a.top-b.top+(a.height-ascent-descent)/2+ascent,width:a.width,colour:ts.color||s.color,font:glyphFont});
        }}
      }catch(_){glyphs.length=0;}
    }
    // Native Canvas / older DOM fallback; the live browser normally uses ranges.
    if(!glyphs.length){
      const left=(parseFloat(s.paddingLeft)||0)+(parseFloat(s.borderLeftWidth)||0),right=b.width-(parseFloat(s.paddingRight)||0);
      const text=ink.textContent,emphasis=[];let from=0;
      for(const node of ink.querySelectorAll('.warm-word')){const start=text.indexOf(node.textContent,from),ts=getComputedStyle(node);if(start<0)continue;
        emphasis.push({start,end:start+node.textContent.length,colour:ts.color||s.color,font:`${ts.fontWeight||500} ${size}px ${s.fontFamily||'sans-serif'}`});from=start+node.textContent.length;}
      let x=left,y=(line-ascent-descent)/2+ascent;
      for(const match of text.matchAll(/\S+/g)){const word=match[0],style=emphasis.find(run=>match.index>=run.start&&match.index<run.end);
        paint.font=style?.font||font;
        const w=paint.measureText(word).width;if(x>left&&x+w>right){x=left;y+=line;}
        let prefix='';for(const letter of word){glyphs.push({letter,x:x+paint.measureText(prefix).width,y,width:paint.measureText(letter).width,colour:style?.colour||s.color,font:style?.font||font});prefix+=letter;}
        x+=w+paint.measureText(' ').width;
      }
    }
    if(!glyphs.length)return null;
    const lines=[];
    glyphs.forEach(g=>{let row=lines.find(r=>Math.abs(r.y-g.y)<2);if(!row){row={y:g.y,glyphs:[]};lines.push(row);}row.glyphs.push(g);});
    lines.sort((a,b)=>a.y-b.y);
    lines.forEach((row,index)=>{row.index=index;row.left=Math.min(...row.glyphs.map(g=>g.x));row.right=Math.max(...row.glyphs.map(g=>g.x+g.width));});
    const dark=document.documentElement.getAttribute('data-theme')==='dark';
    const pulse=document.createElement('canvas');pulse.width=12;pulse.height=64;const q=pulse.getContext('2d');
    const g=q.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.42,dark?'rgba(117,173,255,.5)':'rgba(45,115,173,.5)');
    g.addColorStop(.72,dark?'rgba(145,250,192,.95)':'rgba(49,148,157,.9)');g.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g;q.fillRect(5,0,2,64);
    lead.style.setProperty('--thought-border',(parseFloat(s.borderLeftWidth)||2)+'px');
    return{width:b.width,height:b.height,size,font,colour:s.color,lines,pulse,dark,duration:800+(lines.length-1)*210};
  }
  function draw(age){
    const m=layout;paint.clearRect(0,0,m.width,m.height);paint.textBaseline='alphabetic';
    const tick=Math.floor(age/95);
    for(const row of m.lines){
      const front=Math.min(1.12,Math.max(0,(age-100-row.index*210)/600)),span=Math.max(1,row.right-row.left);
      row.glyphs.forEach((g,index)=>{
        const u=(g.x-row.left)/span,delta=front-u;
        if(delta>=0){paint.font=g.font||m.font;paint.fillStyle=g.colour||m.colour;paint.globalAlpha=ease(delta/.07);paint.fillText(g.letter,g.x,g.y);}
        else if(delta>-.16&&age>row.index*210){
          const symbol=symbols[(index*7+row.index*11+tick*3)%symbols.length];
          paint.font=`400 ${m.size*.82}px 'Yu Gothic','Meiryo','Noto Sans JP',sans-serif`;
          paint.fillStyle=m.dark?'#8acbc2':'#397e99';paint.globalAlpha=(1+delta/.16)*.64;
          const w=paint.measureText(symbol).width;
          paint.save();paint.beginPath();paint.rect(g.x-1,g.y-m.size,g.width+2,m.size*1.2);paint.clip();
          paint.fillText(symbol,g.x+(g.width-w)/2,g.y);paint.restore();
        }
      });
    }
    const travel=ease(age/m.duration),fade=ease(age/100)*(1-ease((age-m.duration+120)/120));
    paint.globalAlpha=fade;paint.drawImage(m.pulse,-5,travel*(m.height+32)-48,12,64);paint.globalAlpha=1;
  }
  function render(time){
    frame=0;
    if(!allowed()){finish();return;}
    const b=lead.getBoundingClientRect();if(b.bottom<=0||b.top>=innerHeight){finish();return;}
    const age=time-started,leadEnd=layout.duration*1.35,bodyAt=leadEnd+320;
    if(age<leadEnd)draw(age/1.35);
    else{lead.classList.remove('thought-decoding');if(film)film.style.visibility='hidden';}
    followers.forEach((node,i)=>node.style.setProperty('--thought-follow',ease((age-bodyAt-i*130)/440).toFixed(4)));
    if(age>=bodyAt+(followers.length-1)*130+440){finish();return;}
    frame=requestAnimationFrame(render);
  }
  function tryStart(){
    if(played||frame||!allowed())return;
    if(lead.getBoundingClientRect().bottom<=0){finish();return;}
    const b=lead.getBoundingClientRect();
    const intersection=Math.max(0,Math.min(innerHeight,b.bottom)-Math.max(0,b.top));
    if(!visible&&intersection<Math.min(b.height,innerHeight)*.35)return;
    try{
      layout=measure();if(!layout){finish();return;}
      played=true;started=performance.now();lead.classList.remove('thought-waiting');lead.classList.add('thought-decoding');
      draw(0);frame=requestAnimationFrame(render);
    }catch(_){finish();}
  }
  observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(!visible&&frame)finish();else tryStart();
  },{threshold:.35});observer.observe(lead);
  if(typeof MutationObserver==='function'){
    const changes=new MutationObserver(tryStart);
    changes.observe(document.body,{attributes:true,attributeFilter:['class']});
    const chapter=lead.closest('.reading-chapter');if(chapter)changes.observe(chapter,{attributes:true,attributeFilter:['class']});
    new MutationObserver(()=>{if(played)finish();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  window.addEventListener('portfolio-chapter-enter',event=>{
    if(event.detail?.target!==document.getElementById('about'))return;
    if(event.detail.motion===false){finish();return;}
    // Synchronous: hide the complete English lead before the chapter becomes visible.
    arm();
  });
  window.addEventListener('portfolio-chapter-ready',event=>{
    if(event.detail?.target===document.getElementById('about'))tryStart();
  });
  window.addEventListener('study-transition-end',tryStart);
  window.addEventListener('scroll',()=>{if(!played)tryStart();},{passive:true});
  window.addEventListener('resize',()=>{if(frame)finish();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&played)finish();else tryStart();});
  document.addEventListener('focusin',event=>{if(prose.contains?.(event.target))finish();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches)finish();});forced.addEventListener?.('change',()=>{if(forced.matches)finish();});
  document.fonts?.ready.then(()=>{if(frame)finish();});
})();

/* Native credential disclosures: hover preview on a mouse, persistent open on activation. */
(() => {
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  let active=null;
  function clearTouch(){
    if(!active)return;
    active.entry.classList.remove('is-touch-active');active.list.classList.remove('has-touch-credential');active=null;
  }
  function selectTouch(row){
    clearTouch();
    const entry=row.closest?.('.credential-entry'),list=row.closest?.('.certification-list');
    if(!entry||!list)return;
    entry.classList.add('is-touch-active');list.classList.add('has-touch-credential');active={row,entry,list};
  }
  document.querySelectorAll('.credential-row').forEach(row=>{
    const summary=row.querySelector('summary');if(!summary)return;let pinned=false,lastPointer='';
    row.addEventListener('pointerdown',event=>{lastPointer=event.pointerType||'';});
    row.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches){clearTouch();row.open=true;}});
    row.addEventListener('pointerleave',()=>{if(!pinned&&!row.matches(':focus-within'))row.open=false;});
    summary.addEventListener('click',event=>{
      event.preventDefault();pinned=!pinned;row.open=pinned;
      const touch=event.detail!==0&&(event.pointerType==='touch'||lastPointer==='touch'||!fine.matches);
      if(touch&&pinned)selectTouch(row);else if(active?.row===row||event.detail===0)clearTouch();
      lastPointer='';
    });
    row.addEventListener('focusin',()=>{row.open=true;});
    row.addEventListener('focusout',event=>{if(!pinned&&!row.contains(event.relatedTarget))row.open=false;});
    row.addEventListener('keydown',event=>{if(event.key==='Escape'){clearTouch();pinned=false;summary.focus({preventScroll:true});row.open=false;}});
  });
  document.addEventListener('pointerdown',event=>{if(active&&!active.list.contains(event.target))clearTouch();},{passive:true});
  document.addEventListener('keydown',event=>{if(['Tab','Enter',' ','Escape'].includes(event.key))clearTouch();});
  document.querySelectorAll('.credential-ledger').forEach(ledger=>ledger.addEventListener('toggle',()=>{if(!ledger.open&&active&&ledger.contains(active.row))clearTouch();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTouch();});
})();

/* Blended circle and sticky controls share one finite, time-based animation loop. */
(() => {
  if(!document.body||typeof document.elementFromPoint!=='function')return;
  const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)'),
    reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
  const root=document.documentElement,host=document.createElement('span'),face=document.createElement('span'),hotspot=document.createElement('span');
  const ready=()=>root.classList.toggle('site-pointer-ready',fine.matches&&!forced.matches);ready();
  host.className='site-cursor';host.setAttribute('aria-hidden','true');host.setAttribute('role','presentation');
  face.className='site-cursor-face';hotspot.className='site-cursor-hotspot';host.appendChild(face);host.appendChild(hotspot);document.body.appendChild(host);
  const controlSelector='a[href],button,summary,[role="button"],[role="switch"],.portal-chip',
    nativeSelector='iframe,input,textarea,select,[contenteditable="true"],[data-native-cursor]',
    dotSelector='#reel-core,#theme-btn,#inner-theme-btn,#galaxy-zoom-controls button,.drawer-close';
  const magnets=new Map();let magnet=null;
  let active=false,frame=0,last=0,x=0,y=0,faceX=0,faceY=0,previousX=0,previousY=0,previousTime=0,vx=0,vy=0,angle=0,
    offsetX=0,offsetY=0,scaleX=1,scaleY=1,hover=null,bounds=null,refresh=false,pressed=false,dragSurface=false,dragging=false,downX=0,downY=0;
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  function releaseMagnet(){if(magnet){magnet.tx=magnet.ty=0;magnet=null;}}
  function clearMagnets(){for(const r of magnets.values()){r.el.classList.remove('pointer-magnetic');r.el.style.removeProperty('--pointer-magnet-x');r.el.style.removeProperty('--pointer-magnet-y');}magnets.clear();magnet=null;}
  function hide(){
    active=false;cancelAnimationFrame(frame);frame=0;last=previousTime=0;
    vx=vy=offsetX=offsetY=angle=0;scaleX=scaleY=1;pressed=dragSurface=dragging=false;hover=bounds=null;clearMagnets();
    root.classList.remove('has-site-cursor');host.classList.remove('is-visible','is-control','is-dragging','is-pressed','is-dot-only','is-core');
  }
  function selectMagnet(target){
    releaseMagnet();if(!target)return;
    // Never translate a projected card: its arrow alone receives the magnetic nudge.
    const moving=target.classList.contains('portal-chip');
    let el=target.querySelector(moving?'.portal-arrow':'.micro-label-window,.micro-arrow,.skill-label');
    if(!el&&!moving&&target.matches?.('button,summary'))el=target;
    if(!el)return;
    let record=magnets.get(el);if(!record){record={el,x:0,y:0,vx:0,vy:0,tx:0,ty:0,limit:moving?2.5:4.5};magnets.set(el,record);el.classList.add('pointer-magnetic');}
    magnet=record;
  }
  function classify(target){
    if(!target||target.closest?.(nativeSelector)){hide();return false;}
    const dotOnly=!!target.closest?.(dotSelector);
    host.classList.toggle('is-dot-only',dotOnly);host.classList.toggle('is-core',!!target.closest?.('#reel-core'));
    const next=dotOnly?null:target.closest?.(controlSelector)||null;
    if(next!==hover){hover=next;selectMagnet(hover);bounds=hover?.getBoundingClientRect();}
    else if(refresh)bounds=hover?.getBoundingClientRect();
    refresh=false;host.classList.toggle('is-control',!!hover&&!dragging);return true;
  }
  function wake(){if(active&&!frame)frame=requestAnimationFrame(draw);}
  function spring(r,key,velocity,target,dt){
    const w=19,damping=.72,a=w*damping,b=w*Math.sqrt(1-damping*damping),d=r[key]-target,v=r[velocity],e=Math.exp(-a*dt),c=Math.cos(b*dt),s=Math.sin(b*dt);
    r[key]=target+e*(d*c+(v+a*d)/b*s);r[velocity]=e*(v*c-(a*v+w*w*d)/b*s);
    if(Math.abs(r[key]-target)<.012&&Math.abs(r[velocity])<.04){r[key]=target;r[velocity]=0;}
  }
  function updateMagnets(dt,immediate){
    let settling=false;
    for(const r of magnets.values()){
      if(immediate){r.x=r.y=r.vx=r.vy=0;}else{spring(r,'x','vx',r.tx,dt);spring(r,'y','vy',r.ty,dt);}
      r.el.style.setProperty('--pointer-magnet-x',r.x.toFixed(3)+'px');r.el.style.setProperty('--pointer-magnet-y',r.y.toFixed(3)+'px');
      const moving=Math.abs(r.x-r.tx)+Math.abs(r.y-r.ty)>.012||Math.abs(r.vx)+Math.abs(r.vy)>.04;settling=settling||moving;
      if(r!==magnet&&!moving){r.el.classList.remove('pointer-magnetic');r.el.style.removeProperty('--pointer-magnet-x');r.el.style.removeProperty('--pointer-magnet-y');magnets.delete(r.el);}
    }
    return settling;
  }
  function draw(time){
    frame=0;if(!active||document.hidden||!fine.matches||forced.matches){hide();return;}
    if(refresh&&!classify(document.elementFromPoint(x,y)))return;
    const dt=clamp(last?time-last:1000/60,1,40);last=time;
    const immediate=reduced.matches,k=immediate?1:1-Math.exp(-dt/65),follow=immediate?1:1-Math.exp(-dt/70);
    let tx=0,ty=0,hoverStretch=0,targetAngle=angle;
    if(bounds&&hover&&!dragging&&!immediate){
      const moving=hover.classList.contains('portal-chip'),dx=x-(bounds.left+bounds.width/2),dy=y-(bounds.top+bounds.height/2),limit=moving?9:24;
      tx=clamp(-dx*(moving ? .16 : .72),-limit,limit);ty=clamp(-dy*(moving ? .16 : .72),-limit,limit);
      const distance=Math.hypot(dx,dy);hoverStretch=Math.pow(Math.min(.7,distance/100),3)*.9;
      if(distance>2)targetAngle=Math.atan2(dy,dx)*180/Math.PI;
      if(magnet&&!pressed){magnet.tx=clamp(dx*.16,-magnet.limit,magnet.limit);magnet.ty=clamp(dy*.16,-magnet.limit,magnet.limit);}
    }else if(magnet){magnet.tx=magnet.ty=0;}
    const speed=Math.hypot(vx,vy),stretch=immediate?0:Math.min(hover ? .22 : .42,speed*.15);
    if((!hover||dragging)&&speed>.04)targetAngle=Math.atan2(vy,vx)*180/Math.PI;
    const base=pressed&&!dragging ? .84 : 1,targetX=immediate?1:dragging?1.24+stretch:base+stretch+hoverStretch,
      targetY=immediate?1:dragging ? .70 : base-stretch*.5-hoverStretch*.3;
    faceX+=(x-faceX)*follow;faceY+=(y-faceY)*follow;
    offsetX+=(tx-offsetX)*k;offsetY+=(ty-offsetY)*k;scaleX+=(targetX-scaleX)*k;scaleY+=(targetY-scaleY)*k;
    const turn=((targetAngle-angle+540)%360)-180;angle=immediate?0:((angle+turn*k+180)%360+360)%360-180;
    hotspot.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%)`;
    face.style.transform=`translate3d(${(faceX+offsetX).toFixed(3)}px,${(faceY+offsetY).toFixed(3)}px,0) translate(-50%,-50%) rotate(${angle.toFixed(2)}deg) scale(${scaleX.toFixed(4)},${scaleY.toFixed(4)})`;
    vx*=immediate?0:Math.exp(-dt/65);vy*=immediate?0:Math.exp(-dt/65);
    const uiSettling=updateMagnets(dt/1000,immediate);
    const settling=Math.abs(x-faceX)+Math.abs(y-faceY)>.02||Math.abs(tx-offsetX)+Math.abs(ty-offsetY)>.015||Math.abs(targetX-scaleX)+Math.abs(targetY-scaleY)>.002||Math.abs(vx)+Math.abs(vy)>.003||Math.abs(turn)>.1||uiSettling;
    if(!immediate&&settling)wake();else last=0;
  }
  function move(event){
    if(event.pointerType==='touch'||!fine.matches||forced.matches||document.hidden){hide();return;}
    if(!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
    const now=performance.now(),fresh=!active;x=event.clientX;y=event.clientY;
    if(!classify(pressed?(document.elementFromPoint(x,y)||event.target):event.target))return;
    if(pressed&&dragSurface&&!dragging&&Math.hypot(x-downX,y-downY)>5){dragging=true;releaseMagnet();host.classList.add('is-dragging');host.classList.remove('is-control');}
    if(!fresh&&previousTime){const dt=clamp(now-previousTime,4,60);vx=clamp((x-previousX)/dt,-5,5);vy=clamp((y-previousY)/dt,-5,5);}
    previousX=x;previousY=y;previousTime=now;
    if(fresh){active=true;faceX=x;faceY=y;offsetX=offsetY=0;scaleX=scaleY=1;angle=0;hotspot.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;root.classList.add('has-site-cursor');host.classList.add('is-visible');}
    wake();
  }
  document.addEventListener('pointermove',move,{passive:true,capture:true});
  document.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'){hide();return;}move(event);if(!active||event.button>0)return;
    pressed=true;downX=x;downY=y;
    dragSurface=!!event.target.closest?.('#world,#qualities-world,.portal-chip,.contact-model,.contact-model-2d')||
      (!!event.target.closest?.('#reel-model')&&!event.target.closest?.('#reel-core'));
    host.classList.add('is-pressed');if(magnet)magnet.tx=magnet.ty=0;wake();
  },{passive:true,capture:true});
  function release(){if(!active)return;pressed=dragSurface=dragging=false;host.classList.remove('is-dragging','is-pressed');refresh=true;wake();}
  document.addEventListener('pointerup',release,{passive:true,capture:true});document.addEventListener('pointercancel',hide,{passive:true,capture:true});
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide();},{passive:true});
  document.addEventListener('scroll',()=>{if(active){refresh=true;wake();}},{passive:true,capture:true});
  document.addEventListener('keydown',event=>{if(['Tab','Enter',' ','Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key))hide();},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});document.addEventListener('contextmenu',hide);
  window.addEventListener('blur',hide);window.addEventListener('resize',()=>{if(active){refresh=true;wake();}},{passive:true});
  fine.addEventListener?.('change',()=>{ready();if(!fine.matches)hide();});forced.addEventListener?.('change',()=>{ready();if(forced.matches)hide();});
  reduced.addEventListener?.('change',()=>{if(active){vx=vy=0;wake();}});
})();

