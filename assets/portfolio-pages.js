
/* The complete Side Quests document travels inside this HTML, loaded on demand. */
(() => {
  const page=document.getElementById('side-quests-page'),frame=document.getElementById('side-quests-frame');
  const payload=document.getElementById('side-quests-document');
  if(!page||!frame||!payload)return;
  const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let savedFocus=null,previousRoute='',ownedEntry=false,previousOverflow='',previousPadding='',paused=[],press=null;
  const blogRoute=hash=>hash==='#blog'||hash.startsWith('#blog/');
  let currentPage='',article='';
  const sendArticle=()=>frame.contentWindow?.postMessage({type:'blog-route',article},'*');
  function pageRoute(link){return link?.getAttribute('href')||'#side-quests';}
  let phase='closed',generation=0,finishTimer=0,instant=false;
  let waitForBlogReady=false;
  const setPhase=value=>{phase=value;page.dataset.phase=value;};
  const wakeGalaxy=()=>{window.portfolioSideQuestsOpen=false;window.dispatchEvent(new Event('inner-world-galaxy-wake'));};
  function finishClose(){
    clearTimeout(finishTimer);finishTimer=0;
    page.hidden=true;page.classList.remove('is-loading','is-ready','is-open','is-leaving','is-instant');
    frame.removeAttribute('srcdoc');frame.inert=true;
    for(const [node,inert] of paused)node.inert=inert;
    paused=[];document.body.style.overflow=previousOverflow;document.body.style.paddingRight=previousPadding;
    document.body.classList.remove('side-quests-open');setPhase('closed');
    savedFocus?.focus?.({preventScroll:true});
  }
  function reveal(token){
    if(token!==generation||phase!=='loading')return;
    setPhase('entering');page.classList.remove('is-loading');page.classList.add('is-ready');
    page.setAttribute('aria-busy','false');frame.removeAttribute('aria-hidden');
    const settle=()=>{
      if(token!==generation||phase!=='entering')return;
      setPhase('open');page.classList.add('is-open');frame.inert=false;
      // Stop the outgoing renderer only once it is fully covered.
      window.portfolioSideQuestsOpen=true;frame.focus();
    };
    if(instant)settle();else finishTimer=setTimeout(settle,900);
  }
  async function show(options={}){
    const next=blogRoute(options.route||'')?'blog':'side-quests';
    article=next==='blog'?(options.route.split('/')[1]||'home'):'';
    if(phase!=='closed'&&phase!=='leaving'){
      if(currentPage===next){if(next==='blog')sendArticle();return;}
      hide({instant:true});
    }
    currentPage=next;
    page.setAttribute('aria-label',next==='blog'?'Blog':'Side Quests');
    frame.title=next==='blog'?'Research blog':'Side Quests journey';
    if(phase==='leaving')finishClose();
    const documentSource=next==='blog'?document.getElementById('blog-document'):payload;
    const token=++generation;instant=Boolean(options.instant||motion?.matches);
    waitForBlogReady=next==='blog';
    savedFocus=document.activeElement;previousOverflow=document.body.style.overflow;previousPadding=document.body.style.paddingRight;
    paused=[...document.body.children].filter(node=>node!==page&&!['SCRIPT','STYLE'].includes(node.tagName)).map(node=>[node,node.inert]);
    for(const [node] of paused)node.inert=true;
    const gutter=Math.max(0,(window.innerWidth||0)-(document.documentElement.clientWidth||window.innerWidth||0));
    if(gutter){const padding=parseFloat(window.getComputedStyle?.(document.body).paddingRight)||0;document.body.style.paddingRight=(padding+gutter)+'px';}
    document.body.style.overflow='hidden';
    document.body.classList.add('side-quests-open');page.hidden=false;
    page.classList.toggle('is-instant',instant);page.setAttribute('aria-busy','true');
    frame.inert=true;frame.setAttribute('aria-hidden','true');setPhase('loading');
    const origin=options.origin||savedFocus;
    const bounds=origin?.getBoundingClientRect?.();
    if(bounds){page.style.setProperty('--quest-origin-x',(bounds.left+bounds.width/2)+'px');page.style.setProperty('--quest-origin-y',(bounds.top+bounds.height/2)+'px');}
    const theme=document.documentElement.dataset.theme==='light'?'light':'dark';
    const bootstrap='<script>document.documentElement.dataset.theme='+JSON.stringify(theme)+';window.__portfolioQuestEmbedded=true;window.__portfolioQuestToken='+token+';document.documentElement.dataset.questToken="'+token+'";<\/script>';
    let html;
    try {
      if(documentSource.dataset.src){
        const response=await fetch(documentSource.dataset.src);
        if(!response.ok)throw Error(response.status);
        html=await response.text();
      }else{
        html=JSON.parse(documentSource.textContent);
      }
    }catch{
      if(token!==generation)return;
      waitForBlogReady=false;
      html='<!doctype html><html><head><meta charset="utf-8"></head><body><p>This page could not be loaded.</p><button type="button" onclick="parent.postMessage({type:\'portfolio-sidequests-return\'},\'*\')">Return to portfolio</button></body></html>';
    }
    if(token!==generation||phase!=='loading')return;
    const embedded=next==='blog'?'<script>window.blogSection='+JSON.stringify(article).replaceAll('<',String.fromCharCode(92)+'u003c')+';<\/script>':'';
    frame.srcdoc=html.replace('</head>',bootstrap+embedded+'</head>');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===generation&&phase==='loading')page.classList.add('is-loading');}));
  }
  function revealWhenPaintable(token,child,section){
    Promise.race([child?.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,900))])
      .catch(()=>{}).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(section===undefined||section===article)reveal(token);
      })));
  }
  frame.addEventListener('load',()=>{
    if(phase!=='loading'||waitForBlogReady)return;
    const child=frame.contentDocument;
    if(Number(child?.documentElement?.dataset.questToken)===generation)revealWhenPaintable(generation,child);
  });
  function hide(options={}){
    if(phase==='closed'||phase==='leaving')return;
    press=null;++generation;clearTimeout(finishTimer);finishTimer=0;
    const immediately=Boolean(options.instant||instant||motion?.matches);
    frame.inert=true;setPhase('leaving');
    page.classList.remove('is-loading','is-ready','is-open');page.classList.add('is-leaving');
    wakeGalaxy();
    if(immediately)finishClose();else finishTimer=setTimeout(finishClose,420);
  }
  window.openSideQuestsPage=(options={})=>{
    // Local file/content viewers may reject history updates. Rendering must not
    // depend on that optional browser feature.
    const menu=options.origin?.closest('details.nav-jump');
    if(menu){menu.open=false;menu.querySelector('summary')?.focus({preventScroll:true});}
    const target=options.route||'#side-quests';
    if(location.hash!==target){
      previousRoute=location.pathname+location.search+location.hash;
      try{history.pushState({portfolioDepth:1},'',target);ownedEntry=true;}catch{ownedEntry=false;}
    }
    show({...options,route:target});
  };
  window.closeSideQuestsPage=(options={})=>{
    hide(options);
    const depth=history.state?.portfolioDepth;
    if(depth){ownedEntry=false;history.go(-depth);}
    else if(blogRoute(location.hash)||location.hash==='#side-quests')try{history.replaceState(null,'',previousRoute||location.pathname+location.search+'#scroll-track');}catch{}
  };
  const pageLink=target=>target?.closest?.('[data-standalone-page]');
  const modified=event=>event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0;
  const dragLimit=event=>event.pointerType==='touch'||window.innerWidth<=768?10:6;
  // Capture the actual pressed link before the model starts pointer capture.
  document.addEventListener('pointerdown',event=>{
    const link=pageLink(event.target);
    press=link?.classList.contains('portal-chip')&&!modified(event)&&event.isPrimary!==false?{link,id:event.pointerId,x:event.clientX,y:event.clientY,dragged:false,opened:false}:null;
  },true);
  document.addEventListener('pointermove',event=>{
    if(press?.id===event.pointerId&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>=dragLimit(event))press.dragged=true;
  },true);
  document.addEventListener('pointercancel',event=>{
    if(press?.id===event.pointerId)press.dragged=true;
  },true);
  document.addEventListener('pointerup',event=>{
    if(press?.id!==event.pointerId||modified(event))return;
    if(Math.hypot(event.clientX-press.x,event.clientY-press.y)>=dragLimit(event))press.dragged=true;
    if(!press.dragged){press.opened=true;window.openSideQuestsPage({origin:press.link,route:pageRoute(press.link)});}
  },true);
  document.addEventListener('click',event=>{
    const link=pageLink(event.target);
    if(modified(event)||(!link&&!press))return;
    // Only consume the paired galaxy click, not a subsequent unrelated control.
    if(!link&&!event.target?.closest?.('#world,.portal-chip'))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.detail===0)window.openSideQuestsPage({instant:true,origin:link,route:pageRoute(link)});
    else if(!press?.dragged&&!press?.opened)window.openSideQuestsPage({origin:link,route:pageRoute(link)});
    press=null;
  },true);
  const route=()=>{if(blogRoute(location.hash)||location.hash==='#side-quests')show({route:location.hash});else{ownedEntry=false;hide();}};
  window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow)return;
    if(event.data?.type==='blog-route-ready'){
      if(!waitForBlogReady||phase!=='loading'||event.data.token!==generation)return;
      if(event.data.section!==article){sendArticle();return;}
      revealWhenPaintable(generation,frame.contentDocument,event.data.section);
      return;
    }
    if(currentPage==='blog'&&event.data?.type==='blog-navigate'){
      const id=event.data.article;if(typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))return;
      const hash=id==='home'?'#blog':'#blog/'+id;
      if(hash!==location.hash)history.pushState({portfolioDepth:history.state?.portfolioDepth?history.state.portfolioDepth+1:0},'',hash);
      article=id;sendArticle();return;
    }
    if(event.data?.type==='portfolio-sidequests-return')window.closeSideQuestsPage({instant:event.data.instant});
    if(event.data?.type==='portfolio-sidequests-ready'&&!waitForBlogReady)reveal(event.data.token);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!page.hidden){event.preventDefault();window.closeSideQuestsPage({instant:true});}
  });
  const initialRoute=()=>{if(blogRoute(location.hash)||location.hash==='#side-quests'){document.getElementById('reel-skip-btn')?.click();route();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialRoute,{once:true});
  else initialRoute();
})();

