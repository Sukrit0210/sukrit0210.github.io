
    // ================================================================

    // THEME ENGINE
    // ================================================================
    let currentTheme = (() => { try { const saved = localStorage.getItem('theme'); return saved === 'light' || saved === 'dark' ? saved : 'dark'; } catch (_) { return 'dark'; } })();
    /* V7_7_RESPONSE_START */
// Shared response for the thought field and galaxy. Exact critical damping
// preserves velocity when a gesture reverses and behaves equally at 60/90/120 Hz.
(function(root){
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>{n=clamp(n);return n*n*n*(10+n*(-15+6*n));};
  function spring(state,key,target,dt,tau=120,quiet=false){
    const velocity=key+'Velocity';
    if(!Number.isFinite(state[key]))state[key]=target;
    if(quiet){state[key]=target;state[velocity]=0;return target;}
    dt=Math.max(0,Math.min(80,dt));
    const delta=state[key]-target,c=(state[velocity]||0)+delta/tau,decay=Math.exp(-dt/tau);
    state[key]=target+(delta+c*dt)*decay;
    state[velocity]=((state[velocity]||0)-c*dt/tau)*decay;
    if(Math.abs(state[key]-target)<.00001&&Math.abs(state[velocity])<.000001){state[key]=target;state[velocity]=0;}
    return state[key];
  }
  function impulse(age,start,duration=680){
    const u=(age-start)/duration;
    return u<=0||u>=1?0:Math.sin(Math.PI*u)**2;
  }
  function square(age,side,span){
    const expand=ease(age/480),dissolve=ease((age-300)/740);
    return {side:side+(Math.min(164,span*.23)-side)*expand,opacity:1-dissolve,
      dust:Math.sin(Math.PI*dissolve),spread:dissolve};
  }
  root.SceneResponse={clamp,ease,spring,impulse,square};
})(typeof globalThis!=='undefined'?globalThis:this);

    /* V7_7_RESPONSE_END */
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-btn');
    const innerThemeBtn = document.getElementById('inner-theme-btn');

    const themePalette = {
      light: {
        coreGlowInner: 'rgba(37, 99, 235, 0.16)',
        coreGlowMid: 'rgba(59, 130, 246, 0.05)',
        coreGlowOuter: 'rgba(250, 247, 242, 0)',
        nebulaGas1: 'rgba(59, 130, 246, 0.06)',
        nebulaGas2: 'rgba(147, 197, 253, 0.02)',
        galaxyRings: 'rgba(29, 78, 216, 0.32)',
        starDust: '#1d4ed8',
        starDustAlt: '#2563eb',
        starCoreHot: '#1e40af',
        starCoreWhite: '#ffffff',
        constellationLine: 'rgba(37, 99, 235, 0.38)',
        portalRing: 'rgba(29, 78, 216, 0.85)',
        portalRingHover: '#1d4ed8',
        portalCore: '#1d4ed8',
        portalCoreHover: '#2563eb',
        portalLabel: '#0f2b48',
        portalLabelHover: '#1d4ed8',
        spikeColor: 'rgba(29, 78, 216, 0.60)'
      },
      dark: {
        coreGlowInner: 'rgba(74, 222, 128, 0.18)',
        coreGlowMid: 'rgba(56, 189, 248, 0.05)',
        coreGlowOuter: 'rgba(7, 9, 11, 0)',
        nebulaGas1: 'rgba(74, 222, 128, 0.06)',
        nebulaGas2: 'rgba(56, 189, 248, 0.02)',
        galaxyRings: 'rgba(74, 222, 128, 0.30)',
        starDust: '#6ee7b7',
        starDustAlt: '#38bdf8',
        starCoreHot: '#4ade80',
        starCoreWhite: '#ffffff',
        constellationLine: 'rgba(74, 222, 128, 0.35)',
        portalRing: 'rgba(74, 222, 128, 0.75)',
        portalRingHover: '#4ade80',
        portalCore: '#4ade80',
        portalCoreHover: '#ffffff',
        portalLabel: '#c2d4c5',
        portalLabelHover: '#ffffff',
        spikeColor: 'rgba(74, 222, 128, 0.60)'
      }
    };

    // Galaxy-only colour spectrum: interface accents and the inner world keep
    // their established palettes. Warm colour is concentrated near the nucleus.
    const galaxySpectrum = {
      light: {
        ground:'#f4f8fa',
        sky:['#1b5299','#387c8c','#746697'],
        stars:['#1b5299','#25828e','#7b5fa0','#ed8638'],
        bright:'#205ac1', starlight:'#fff4c2',
        gas:['27,82,153','43,133,146','125,91,153','244,147,48'],
        core:'rgba(255,190,73,.28)', mid:'rgba(235,110,45,.105)',
        halo:'rgba(66,125,173,.16)',
        haze:['81,132,186','73,149,157','154,118,170'],hazeStrength:.035
      },
      dark: {
        sky:['#a8c8ff','#cec3ef','#e7e8ff'],
        stars:['#acd0ff','#c2b0ff','#e8c9f8','#ffdbb8'],
        bright:'#f1f5ff',
        gas:['59,105,235','113,81,194','166,126,214','213,154,110'],
        core:'rgba(231,187,150,.27)', mid:'rgba(143,117,211,.095)',
        halo:'rgba(129,167,255,.20)',
        haze:['67,94,177','110,76,156','150,101,126'],hazeStrength:.050
      }
    };

    function applyTheme(theme) {
      currentTheme = theme;
      const dark = theme === 'dark';
      for (const button of [themeBtn, innerThemeBtn]) {
        button.setAttribute('aria-checked', String(dark));
        button.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      }
      if(root.getAttribute('data-theme')!==theme)root.setAttribute('data-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (_) {}
    }
    applyTheme(currentTheme);
    function syncGalaxyTheme() {
      const declared=root.getAttribute('data-theme');
      if((declared==='light'||declared==='dark')&&declared!==currentTheme)applyTheme(declared);
    }

    themeBtn.addEventListener('click', () => {
      applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });


    innerThemeBtn.addEventListener('click', () => applyTheme(currentTheme === 'light' ? 'dark' : 'light'));
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }, { passive: true });
    });

    // ================================================================
    // ACCESSIBLE MODAL DIALOG & KEYBOARD FOCUS TRAP
    // ================================================================
    const researchData = {
      "manifestos": {
            "kicker": "01 / NLP · NOVEMBER 2025",
            "title": "Text Mining Indian Election Manifestos",
            "intro": "A reproducible Python pipeline exploring the 2024 election manifestos of BJP, Congress, CPI(M), and TMC.",
            "points": [
                  "Extracted, cleaned and structured PDF text into full and balanced paragraph-level datasets.",
                  "Assigned weak keyword-based policy labels across economy, employment, health, education, welfare, governance and infrastructure.",
                  "Compared party-wise and policy-wise sentiment using positive and negative lexicon counts.",
                  "Compared LDA and NMF using NPMI coherence, topic diversity and topic stability. NMF produced more coherent, diverse and stable topics for this corpus.",
                  "Created visualizations and a detailed report covering sentiment trends, policy labels, topic words and topic distributions."
            ]
      },
      "markets": {
            "kicker": "02 / TIME SERIES · JULY 2024",
            "title": "Indian Stock Market Signals",
            "intro": "A collaborative study of official NSE records for 40 Indian companies over 2014–2024.",
            "points": [
                  "Explored ten years of company data to compare patterns across groups of stocks.",
                  "Developed ARIMA, Holt–Winters, support vector regression and LSTM forecasting models.",
                  "Collaborators: Agneebha Ghosh, Siddhartha Biswas and Sneha Barman."
            ]
      },
      "research": {
            "kicker": "03 / SUMMER RESEARCH · JUNE–AUGUST 2024",
            "title": "Refining Image Classification",
            "intro": "Research internship at the University of Calcutta under Dr. Sugata Sen Roy, Department of Statistics.",
            "points": [
                  "Trained a multinomial logistic regression model on high-dimensional grayscale image data using scikit-learn.",
                  "Evaluated accuracy, precision, recall and F1 scores, supported by classification reports and confusion matrices.",
                  "Plotted misclassified images to investigate errors for label 6 and applied statistical tests to explore labels 0 and 6.",
                  "Retrained after merging similar labels. Reported metrics improved for the revised label setup."
            ]
      },
      "insurance": {
            "kicker": "04 / APPLIED STATISTICS · B.SC. PROJECT",
            "title": "Understanding Insurance Costs",
            "intro": "An undergraduate regression project in R at Asutosh College, advised by Oindrila Bose.",
            "points": [
                  "Studied how age, BMI and smoking status relate to medical insurance costs.",
                  "Investigated which personal characteristics were most strongly associated with premiums.",
                  "Developed actuarial tables to relate annual premiums to anticipated treatment costs."
            ]
      },
      "movies": {
            "kicker": "05 / LINEAR MODELING · SEPTEMBER 2021",
            "title": "What Makes a Movie Popular?",
            "intro": "A project completed as part of a Coursera course in linear regression and modeling.",
            "points": [
                  "Explored movie attributes and audience and critic ratings from Rotten Tomatoes and IMDb.",
                  "Used exploratory analysis, linear modeling and prediction to investigate patterns in movie popularity."
            ]
      }
};

    let lastActiveElement = null;

    function openDrawer(key) {
      const data = researchData[key];
      if (!data) return;
      if(!document.getElementById('drawer').classList.contains('open'))lastActiveElement = document.activeElement;
      document.getElementById('drawer-kicker').textContent = data.kicker;
      document.getElementById('drawer-title').textContent = data.title;
      document.getElementById('drawer-intro').textContent = data.intro;
      const list = document.getElementById('drawer-points');
      list.innerHTML = data.points.map((p,i) => `<li style="margin-bottom:8px;--detail-order:${i};">${p}</li>`).join('');
      
      const drawer = document.getElementById('drawer');
      const backdrop = document.getElementById('backdrop');
      drawer.dataset.tone=key==='manifestos'?'blue':key==='insurance'||key==='movies'?'warm':'teal';
      drawer.inert=false;drawer.setAttribute('aria-hidden','false');
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      drawer.focus();
    }

    function closeDrawer() {
      const drawer = document.getElementById('drawer');
      const backdrop = document.getElementById('backdrop');
      drawer.classList.remove('open');
      drawer.inert=true;drawer.setAttribute('aria-hidden','true');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    }

    document.addEventListener('keydown', e => {
      const drawer = document.getElementById('drawer');
      if (!drawer.classList.contains('open')) return;

      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === drawer) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    const emailBtn = document.getElementById('copy-email-btn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        const email = 'sukritr0210@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          const original = emailBtn.textContent;
          emailBtn.textContent = 'COPIED TO CLIPBOARD ✓';
          setTimeout(() => {
            emailBtn.textContent = original;
          }, 2000);
        }).catch(() => {
          window.location.href = 'mailto:' + email;
        });
      });
    }

    // ================================================================
    // PROCEDURAL 3D GENERATION & PARTICLE SYNTHESIS ENGINE
    // HIGH-DPI SHARP RENDERING & UNCLUTTERED STAGE-AWARE PORTALS
    // ================================================================
    const canvas = document.getElementById('world');
    const ctx = canvas.getContext('2d', { alpha: true });
    const track = document.getElementById('scroll-track');
    const galaxyNote = document.getElementById('galaxy-note');
    const fieldNotes = new Map(Array.from(galaxyNote.querySelectorAll('[data-field-note]'), note=>[note.dataset.fieldNote,note]));
    let activeFieldNote = fieldNotes.get('overview');
    function showGalaxyFieldNote(href) {
      const note = fieldNotes.get(href)||fieldNotes.get('overview');
      if(note===activeFieldNote)return;
      activeFieldNote.classList.remove('is-current');
      note.classList.add('is-current');
      activeFieldNote=note;
    }
    const hudOverlay = document.getElementById('hud-overlay');
    const brackets = document.getElementById('brackets');
    const telOrbit = document.getElementById('tel-orbit');
    const hudStageLabel = document.getElementById('hud-stage-label');
    const hudZoomLabel = document.getElementById('hud-zoom-label');
    const qualitiesScene = document.getElementById('qualities-scene');
    const qualitiesCanvas = document.getElementById('qualities-world');
    const qualitiesCtx = qualitiesCanvas.getContext('2d', { alpha: true });
    const qualitiesTrigger = document.getElementById('qualities-trigger');
    const qualitiesPrompt = document.getElementById('qualities-prompt');
    const qualitiesAction = document.getElementById('qualities-action');
    const qualitiesInsight = document.getElementById('qualities-insight');
    const qualitiesButtons = [...document.querySelectorAll('.qualities-point')];
    const qualities = [
      { x:-1.82, y: .38, z: .30, note:'CURIOSITY · Asking what the data has not answered yet.' },
      { x:-1.10, y:1.55, z:-.25, note:'RIGOR · Testing an idea before trusting its pattern.' },
      { x: 1.10, y:1.52, z: .24, note:'IMAGINATION · Seeing a new route through a hard problem.' },
      { x: 1.82, y:-.42, z:-.18, note:'PERSISTENCE · Staying with the problem until it becomes clear.' },
      { x: 1.02, y:-1.51, z: .31, note:'SYSTEMS THINKING · Connecting methods, evidence, and impact.' },
      { x:-1.30, y:-1.38, z:-.32, note:'INQUIRY · Letting each result lead to a better question.' }
    ];
    let qualitiesYaw = 0, qualitiesPitch = 0;
    let qualitiesDrag = false, qualitiesMoved = false, qualitiesLastX = 0, qualitiesLastY = 0;
    let qualitiesActivated = false, qualitiesInteractive = false;
    let qualitiesSelected = -1;
    let qualitiesBurstStart = 0;
    let qualityWidths = [];

    qualitiesButtons.forEach((button, index) => button.addEventListener('click', () => {
      qualitiesSelected = index;
      qualitiesButtons.forEach((item, itemIndex) => item.classList.toggle('is-selected', itemIndex === index));
      const [word, note] = qualities[index].note.split(' · ');
      qualitiesInsight.innerHTML = `<span>${word}</span> · ${note}`;
      qualitiesInsight.classList.add('is-visible');
    }));
    qualitiesTrigger.addEventListener('click', () => {
      if (qualitiesActivated) return;
      qualitiesActivated = true;
      qualitiesBurstStart = performance.now();
      qualitiesScene.classList.add('is-activated');
      qualitiesPrompt.textContent = 'Curious what that actually looks like?';
      qualitiesAction.textContent = 'FOLLOW THE SIGNAL ↓';
      qualitiesInsight.innerHTML = '<span>THE ANSWER IS IN THE PATTERN.</span> FOLLOW IT INTO THE GALAXY.';
      qualitiesInsight.classList.add('is-visible');
      window.setTimeout(() => {
        const position = Math.max(0, Math.min(1, (window.scrollY - trackTop) / trackHeight));
        if (position < .64) window.scrollTo({ top: trackTop + trackHeight * .70, behavior:'smooth' });
      }, 1050);
    });
    qualitiesCanvas.addEventListener('pointerdown', event => {
      qualitiesDrag = true;
      qualitiesMoved = false;
      qualitiesLastX = event.clientX;
      qualitiesLastY = event.clientY;
      qualitiesCanvas.classList.add('dragging');
      qualitiesCanvas.setPointerCapture?.(event.pointerId);
    });
    qualitiesCanvas.addEventListener('pointermove', event => {
      if (!qualitiesDrag) return;
      const dx = event.clientX - qualitiesLastX;
      const dy = event.clientY - qualitiesLastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) qualitiesMoved = true;
      if (event.pointerType !== 'touch' || Math.abs(dx) > Math.abs(dy)) {
        qualitiesYaw = Math.max(-.58, Math.min(.58, qualitiesYaw + dx * .006));
        qualitiesPitch = Math.max(-.30, Math.min(.30, qualitiesPitch + dy * .004));
      }
      qualitiesLastX = event.clientX;
      qualitiesLastY = event.clientY;
    });
    const releaseQualitiesDrag = event => {
      qualitiesDrag = false;
      qualitiesCanvas.classList.remove('dragging');
      try { qualitiesCanvas.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    qualitiesCanvas.addEventListener('pointerup', releaseQualitiesDrag);
    qualitiesCanvas.addEventListener('pointercancel', releaseQualitiesDrag);

    let rw = window.innerWidth, rh = window.innerHeight;
    let trackTop = 0, trackHeight = 1;
    let rawScrollY = window.scrollY;
    let smoothProgress = 0, targetProgress = 0;
    
    // User manual drag rotation offsets & velocities
    let stage2Orbit = 0, stage2Pitch = 0;
    let galaxyLookX=0,galaxyLookY=0,galaxyLookTargetX=0,galaxyLookTargetY=0;
    let dragVelX = 0, dragVelY = 0;
    
    let isDragging = false, lastX = 0, lastY = 0, startX = 0, startY = 0, startTime = 0;
    let isHorizontalGesture = false;
    let hoveredTarget = null;
    let isMobile = window.innerWidth <= 768;

    let isCanvasVisible = true;
    let animationFrameId = null;

    function requestGalaxyFrame() {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(renderGalaxyFrame);
    }
    function renderGalaxyFrame(time) {
      animationFrameId = null;
      loop(time);
    }
    const canvasObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          requestGalaxyFrame();
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.01 });

    if (track) canvasObserver.observe(track);

    // Astronomical Star Catalog
    const STAR_COUNT = isMobile ? 240 : 480;
    const galaxyStars = new Float32Array(STAR_COUNT * 6); // [x, y, z, size, type, phase]

    const rnd = i => {
      let v = Math.sin(i * 127.3 + 47.17) * 43758.5453;
      return v - Math.floor(v);
    };

    for (let i = 0; i < STAR_COUNT; i++) {
      let x, y, z, size, type;
      const phase = rnd(i + 311) * Math.PI * 2;

      if (i < STAR_COUNT * 0.28) {
        // DENSE GALACTIC BULGE
        const u = rnd(i * 3 + 1) * Math.PI * 2;
        const v = Math.acos(rnd(i * 3 + 2) * 2 - 1);
        const rad = Math.pow(rnd(i * 3 + 3), 1.8) * 0.95;
        x = Math.sin(v) * Math.cos(u) * rad;
        y = (Math.cos(v) * rad) * 0.45;
        z = Math.sin(v) * Math.sin(u) * rad;
        size = 1.0 + rnd(i + 45) * 1.5;
        type = 0; // Bulge Core
      } else {
        // SPIRAL ARMS
        const armIndex = i % 2;
        const armOffset = armIndex * Math.PI;
        const dist = 0.45 + Math.pow(rnd(i + 17), 1.2) * 2.85;
        const theta = armOffset + dist * 1.45;

        const scatter = 0.26 * Math.sqrt(dist);
        const sx = (rnd(i + 52) - 0.5) * scatter;
        const sy = (rnd(i + 68) - 0.5) * (scatter * 0.35);
        const sz = (rnd(i + 84) - 0.5) * scatter;

        x = Math.cos(theta) * dist + sx;
        y = sy + (dist * 0.04);
        z = Math.sin(theta) * dist + sz;
        size = 0.8 + rnd(i + 92) * 1.35;
        type = 1; // Arm Population
      }

      const idx = i * 6;
      galaxyStars[idx] = x;
      galaxyStars[idx + 1] = y;
      galaxyStars[idx + 2] = z;
      galaxyStars[idx + 3] = size;
      galaxyStars[idx + 4] = type;
      galaxyStars[idx + 5] = phase;
    }

    // A seeded stellar material: smoke, dark seams and fine stars are baked once,
    // then projected with the same camera as the live stars and destination portals.
    const galaxyMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const GALAXY_REFERENCE_DISTANCE=5.6,GALAXY_DEFAULT_DISTANCE=GALAXY_REFERENCE_DISTANCE/1.1;
    const galaxyCamera={distance:GALAXY_DEFAULT_DISTANCE,targetDistance:GALAXY_DEFAULT_DISTANCE,focusX:0,focusY:0,focusZ:0,
      targetX:0,targetY:0,targetZ:0,frameX:0,frameY:0,selected:null};
    const GALAXY_MIN_DISTANCE=3.8,GALAXY_MAX_DISTANCE=7.2;
    const openingStarProjection=Array.from({length:STAR_COUNT},(_,id)=>({id,x:0,y:0,visible:false}));
    window.innerWorldGalaxyProjection=openingStarProjection;
    const galaxyStarRadii=Float64Array.from({length:STAR_COUNT},(_,i)=>Math.hypot(galaxyStars[i*6],galaxyStars[i*6+2]));
    const galaxyStarTints=Uint8Array.from(galaxyStarRadii,(radius,i)=>radius<.9?(i%4===0?3:2):radius<1.9?(i%3?1:2):(i%4?0:1));

    const galaxyMaterial = {light:[], dark:[]};
    const galaxyMaterialOverview={light:[],dark:[]};
    const scatteredNebulaMaterial={light:[],dark:[]};
    const stellarAssociationMaterial={light:[],dark:[]};
    const materialPending = {light:false, dark:false};
    const galaxySky = {light:null,dark:null};
    const galaxySkyFrame={theme:null,x:0,y:0,extent:0,alpha:0};
    function buildGalaxySky(theme, start=0, tile=null, count=4000) {
      if(!tile){tile=document.createElement('canvas');tile.width=tile.height=1024;}
      const paint=tile.getContext('2d'),dark=theme==='dark';
      const spectrum=galaxySpectrum[theme];
      if(start===0) {
        // Broad colour veils span the sky behind the projected galaxy. They
        // are baked once per theme, so no blur or gradients run every frame.
        const veils=[[-.05,.20,0],[.44,-.06,1],[1.02,.25,0],
          [.05,.92,1],[.52,1.03,0],[1.00,.90,2],[.52,.49,2]];
        paint.save();paint.scale(1,.86);
        for(const [u,v,colour] of veils) {
          const x=u*1024,y=v*1024/.86,radius=620;
          const gas=spectrum.haze[colour],a=spectrum.hazeStrength;
          const wash=paint.createRadialGradient(x,y,0,x,y,radius);
          wash.addColorStop(0,`rgba(${gas},${a})`);
          wash.addColorStop(.42,`rgba(${gas},${a*.58})`);
          wash.addColorStop(1,`rgba(${gas},0)`);
          paint.fillStyle=wash;paint.fillRect(x-radius,y-radius,radius*2,radius*2);
        }
        paint.restore();
      }
      for(let i=start;i<Math.min(start+count,24000);i++) {
        paint.fillStyle=spectrum.sky[i%3];
        const size=.45+rnd(i+11301)*.8;
        paint.globalAlpha=(dark?.18:.12)+rnd(i+13101)*(dark?.46:.32);
        paint.fillRect(rnd(i+14303)*1024,rnd(i+16703)*1024,size,size);
      }
      paint.globalAlpha=1;return tile;
    }
    function* buildGalaxyPatchSteps(theme, variant) {
      const tile = document.createElement('canvas');
      tile.width=384; tile.height=192;
      const paint=tile.getContext('2d');
      // Higher-resolution cached material resolves finer structure during approach.
      paint.scale(1.5,1.5);
      const dark=theme==='dark';
      const spectrum=galaxySpectrum[theme];
      const zone=variant<2?3:variant<4?2:0;
      const gas=spectrum.gas[zone];
      const warm=spectrum.gas[zone===3?2:1];
      const grain=spectrum.stars[zone];
      const seed=9000+variant*937;
      // Pigment collects along uneven channels in the existing light-mode
      // grain. These marks are baked into the same tile and orbit with it.
      const inkLanes=dark?null:new Float32Array(256*3);
      const inkPigment=zone===3?'#a65640':'#26346f';
      if(inkLanes)for(let x=0;x<256;x++) {
        const j=x*3;
        inkLanes[j]=-12+Math.sin(x*.043+variant*.77)*5.6+Math.sin(x*.097+variant)*1.6;
        inkLanes[j+1]=16+Math.sin(x*.057+1.6+variant*.82)*6.3;
        inkLanes[j+2]=.44+.56*Math.pow(.5+.5*Math.sin(x*.062+variant*1.8),1.6);
      }
      // Several irregular eddies form a translucent ribbon, with empty seams
      // between them. No full-screen blur, colour filter or video texture.
      for(let k=0;k<60;k++) {
        const x=20+rnd(seed+k*7)*216;
        const ridge=64+Math.sin(x*.027+variant)*13;
        const y=ridge+(rnd(seed+k*7+1)-.5)*64;
        const radius=20+rnd(seed+k*7+2)*34;
        const fade=Math.sin(Math.PI*x/256);
        const g=paint.createRadialGradient(x,y,0,x,y,radius);
        g.addColorStop(0,`rgba(${k%3?gas:warm},${fade*(dark?.105:(zone===3?.048:.068))})`);
        g.addColorStop(.42,`rgba(${gas},${fade*(dark?.044:.030)})`);
        g.addColorStop(1,`rgba(${gas},0)`);
        paint.fillStyle=g;paint.fillRect(x-radius,y-radius,radius*2,radius*2);
      }
      paint.fillStyle=grain;
      yield;
      for(let k=0;k<11000;k++) {
        // Yield before each bounded slice; preserve the exact paint order.
        if(k>0&&k%512===0)yield;
        const x=rnd(seed+k*11+310)*256;
        const ridge=64+Math.sin(x*.027+variant)*13;
        const spread=(rnd(seed+k*11+311)+rnd(seed+k*11+312)-1)*54;
        const y=ridge+spread;
        // A broken, sinuous gap keeps the luminous band from becoming a blob.
        const seam=64+Math.sin(x*.041+variant*.8)*9;
        if(Math.abs(y-seam)<3+rnd(seed+k+44)*3)continue;
        const edge=Math.pow(Math.sin(Math.PI*x/256),.65);
        paint.globalAlpha=edge*(dark?.55:.52)*(1-Math.abs(spread)/62);
        // Mix neighbouring stellar populations rather than colouring solid bands.
        paint.fillStyle=k%5?spectrum.stars[zone]:spectrum.stars[zone===3?2:1];
        if(inkLanes) {
          const j=Math.floor(x)*3;
          const offset=Math.min(Math.abs(spread-inkLanes[j]),Math.abs(spread-inkLanes[j+1]));
          const weight=(1-offset/5.6)*inkLanes[j+2];
          if(weight>.12+rnd(seed+k+627)*.63) {
            paint.fillStyle=inkPigment;
            paint.globalAlpha*=1+weight*.36;
          }
        }
        const size=.35+rnd(seed+k+90)*.65;
        paint.fillRect(x,y,size,size);
      }
      yield;
      // Narrow molecular channels cut through the material instead of painting
      // dark strokes over it. The theme background shows through these tiny gaps.
      paint.save();paint.globalCompositeOperation='destination-out';
      paint.strokeStyle='rgba(0,0,0,.32)';paint.lineCap='round';
      for(let lane=0;lane<7;lane++) {
        paint.lineWidth=.8+rnd(seed+lane+1903)*1.65;paint.beginPath();
        for(let step=0;step<=38;step++) {
          const x=12+step/38*232;
          const ridge=64+Math.sin(x*.027+variant)*13;
          const y=ridge+(lane-3)*7.5+Math.sin(x*.042+lane*1.7)*4.5;
          if(step===0)paint.moveTo(x,y);else paint.lineTo(x,y);
        }
        paint.stroke();
      }
      paint.restore();
      // Dust braids break into short filaments along the outer blue arms.
      if(zone===0){
        paint.save();paint.lineWidth=.42;paint.lineCap='round';
        paint.strokeStyle=dark?'#c7d4ff':spectrum.stars[0];
        for(let i=0;i<18;i++){
          const x=26+rnd(seed+2091+i)*182, side=(i%2?1:-1);
          const y=64+Math.sin(x*.027+variant)*13+side*(8+rnd(seed+2731+i)*9);
          const length=5+rnd(seed+2991+i)*11;
          paint.globalAlpha=.14+rnd(seed+3011+i)*.19;
          paint.beginPath();paint.moveTo(x,y);
          paint.quadraticCurveTo(x+length*.5,y+side*1.7,x+length,y+Math.cos(x*.027+variant)*length*.35);paint.stroke();
        }
        paint.restore();
      }
      // Sharper stellar knots sit in the same cached material as the fine dust.
      for(let k=0;k<320;k++) {
        const x=16+rnd(seed+k*17+610)*224;
        const ridge=64+Math.sin(x*.027+variant)*13;
        const y=ridge+(rnd(seed+k*17+611)+rnd(seed+k*17+612)-1)*31;
        const seam=64+Math.sin(x*.041+variant*.8)*9;
        if(Math.abs(y-seam)<5)continue;
        paint.globalAlpha=Math.sin(Math.PI*x/256)*(.56+rnd(seed+k+170)*.38);
        paint.fillStyle=k%4?spectrum.stars[zone]:(spectrum.starlight||spectrum.bright);
        const size=.85+rnd(seed+k+390)*1.2;
        paint.fillRect(x,y,size,size);
      }
      paint.globalAlpha=1;
      return tile;
    }
    function buildScatteredNebula(theme,variant) {
      const tile=document.createElement('canvas');tile.width=tile.height=256;
      const paint=tile.getContext('2d'),spectrum=galaxySpectrum[theme];
      const seed=64101+variant*719,zone=variant<2?0:variant<4?1:variant===4?2:3;
      // Unstructured overlapping filaments fade well before the texture edge.
      // Gas and sparse embedded stars are baked once; no live blur is required.
      for(let k=0;k<36;k++) {
        const u=rnd(seed+k*7),angle=rnd(seed+k*7+1)*Math.PI*2;
        const spread=Math.sqrt(u)*61;
        const x=128+Math.cos(angle)*spread*1.12,y=128+Math.sin(angle)*spread*.71;
        const radius=22+rnd(seed+k*7+2)*43,fade=1-u*.7;
        const gas=spectrum.gas[k%5?zone:(zone===3?2:1)];
        const g=paint.createRadialGradient(x,y,0,x,y,radius);
        g.addColorStop(0,`rgba(${gas},${fade*.063})`);
        g.addColorStop(.38,`rgba(${gas},${fade*.027})`);
        g.addColorStop(1,`rgba(${gas},0)`);
        paint.fillStyle=g;paint.fillRect(x-radius,y-radius,radius*2,radius*2);
      }
      for(let k=0;k<340;k++) {
        const angle=rnd(seed+k*11+401)*Math.PI*2,radius=Math.sqrt(rnd(seed+k*11+402))*83;
        const x=128+Math.cos(angle)*radius,y=128+Math.sin(angle)*radius*.64;
        paint.fillStyle=k%7?spectrum.stars[zone]:spectrum.bright;
        paint.globalAlpha=(1-radius/104)*(k%19?.12:.38);
        const size=k%19?.35+rnd(seed+k+803)*.45:1.0;
        paint.fillRect(x,y,size,size);
      }
      paint.globalAlpha=1;return tile;
    }
    function buildStellarAssociation(theme,variant) {
      const tile=document.createElement('canvas');tile.width=tile.height=128;
      const paint=tile.getContext('2d'),spectrum=galaxySpectrum[theme],dark=theme==='dark';
      const seed=91001+variant*1093,zone=variant<2?3:variant<4?2:0;
      // Irregular, nested stellar nurseries, with transparent space between knots.
      const pockets=Array.from({length:5},(_,i)=>{
        const a=rnd(seed+i*13)*Math.PI*2,r=10+rnd(seed+i*13+1)*23;
        return {x:64+Math.cos(a)*r,y:64+Math.sin(a)*r*.65};
      });
      for(let i=0;i<pockets.length;i++) {
        const knot=pockets[i],gas=spectrum.gas[zone],radius=13+rnd(seed+i+23)*10;
        const veil=paint.createRadialGradient(knot.x,knot.y,0,knot.x,knot.y,radius);
        veil.addColorStop(0,`rgba(${gas},${dark?.16:.09})`);
        veil.addColorStop(.4,`rgba(${gas},${dark?.07:.035})`);veil.addColorStop(1,`rgba(${gas},0)`);
        paint.fillStyle=veil;paint.fillRect(knot.x-radius,knot.y-radius,radius*2,radius*2);
      }
      for(let i=0;i<860;i++) {
        const knot=pockets[i%5],r=Math.pow(rnd(seed+i*7+101),1.35)*18;
        const a=rnd(seed+i*7+102)*Math.PI*2;
        paint.fillStyle=i%11?spectrum.stars[zone]:(spectrum.starlight||spectrum.bright);
        paint.globalAlpha=(1-r/23)*(dark?.70:.58);
        const size=.38+rnd(seed+i+701)*.95;
        paint.fillRect(knot.x+Math.cos(a)*r,knot.y+Math.sin(a)*r*.7,size,size);
      }
      paint.globalAlpha=1;return tile;
    }
    function prepareGalaxyMaterial(theme) {
      if(materialPending[theme] || galaxySky[theme])return;
      materialPending[theme]=true;
      const schedule=task=>window.requestIdleCallback
        ? window.requestIdleCallback(task,{timeout:250}) : window.setTimeout(task,16);
      let sky=null,skyIndex=0,skyDone=false,patchesDone=false;
      const complete=()=>{
        if(!skyDone||!patchesDone)return;
        materialPending[theme]=false;prepareGalaxyMaterial(theme==='light'?'dark':'light');
      };
      const nextSky=()=>{
        sky=buildGalaxySky(theme,skyIndex,sky,1000);skyIndex+=1000;
        // Publish uniform full-height sky from the first bounded slice, instead
        // of leaving a sparse placeholder until all cloud textures are finished.
        galaxySky[theme]=sky;
        if(theme===currentTheme)scheduleChapterSeam();
        if(skyIndex<24000)schedule(nextSky);
        else {skyDone=true;complete();}
      };
      const next=()=>{
        const variant=galaxyMaterial[theme].length,steps=buildGalaxyPatchSteps(theme,variant);
        const step=()=>{
          const result=steps.next();
          if(!result.done){schedule(step);return;}
          const resolved=result.value;
          // Separate texture families into their own tasks; publish a complete variant.
          schedule(()=>{
            const overview=document.createElement('canvas');overview.width=256;overview.height=128;
            overview.getContext('2d').drawImage(resolved,0,0,256,128);
            schedule(()=>{
              const nebula=buildScatteredNebula(theme,variant);
              schedule(()=>{
                const association=buildStellarAssociation(theme,variant);
                galaxyMaterial[theme].push(resolved);galaxyMaterialOverview[theme].push(overview);
                scatteredNebulaMaterial[theme].push(nebula);stellarAssociationMaterial[theme].push(association);
                if(galaxyMaterial[theme].length<6)schedule(next);
                else {patchesDone=true;complete();}
              });
            });
          });
        };
        schedule(step);
      };
      schedule(nextSky);
      schedule(()=>{galaxyLuminousAssets(theme);schedule(next);});
    }
    prepareGalaxyMaterial(currentTheme);

    // One shared profile keeps the ribbons, grains and knots on the same arms.
    function galaxyArmFork(radius) {
      return smoothstep(1.10,2.92,radius);
    }
    function galaxyKnotPhase(radius) {
      return (radius-.25)*8.9;
    }
    function placeGalaxyArmPoint(out,arm,radius,cross,height,branched,twist=0) {
      let radialOffset=0;
      if(arm===0) {
        const spread=galaxyArmFork(radius);
        radialOffset=spread*(branched?.65:-.06);
        cross=cross*(1-spread*(branched?.48:.28))+spread*(branched?.17:-.06);
        height+=spread*(branched?.20:-.05);
      }else {
        radius+=Math.sin(galaxyKnotPhase(radius))*.083;
      }
      const angle=arm*Math.PI+radius*1.45+twist;
      const cos=Math.cos(angle),sin=Math.sin(angle);
      out.x=cos*(radius+radialOffset)-sin*cross;
      out.y=height;
      out.z=sin*(radius+radialOffset)+cos*cross;
      out.angle=angle;
      return out;
    }
    const armSeedPoint={};
    const DUST_COUNT=isMobile?5600:15600;
    const galacticDust=new Float32Array(DUST_COUNT*5);
    const dustBins=Array.from({length:4},()=>[]);
    for(let i=0;i<DUST_COUNT;i++) {
      // Dense nucleus, arm strands, broad shoulders and a diffuse disc share
      // one spatial catalogue. Empty channels survive between these populations.
      const population=i%10;
      const nucleus=population<2,disc=population>=7;
      const radius=nucleus?Math.pow(rnd(i+701),.72)*1.32
        :.15+Math.pow(rnd(i+701),.94)*(disc?3.4:3.12);
      const spread=(rnd(i+907)+rnd(i+1103)-1)*(.16+radius*.29);
      const j=i*5;
      const height=(rnd(i+1901)+rnd(i+1913)-1)*(.12+radius*.10);
      if(nucleus||disc) {
        const angle=rnd(i+809)*Math.PI*2;
        galacticDust[j]=Math.cos(angle)*radius-Math.sin(angle)*spread;
        galacticDust[j+1]=height;
        galacticDust[j+2]=Math.sin(angle)*radius+Math.cos(angle)*spread;
      }else {
        const point=placeGalaxyArmPoint(armSeedPoint,i%2,radius,spread,height,rnd(i+853)>.65,(rnd(i+823)-.5)*.20);
        galacticDust[j]=point.x;galacticDust[j+1]=point.y;galacticDust[j+2]=point.z;
      }
      galacticDust[j+3]=.40+rnd(i+2207)*.75;
      const mix=rnd(i+2711);
      const colour=radius<1.25?(mix<.30?3:mix<.68?2:1)
        :radius<2.35?(mix<.08?3:mix<.49?2:mix<.82?1:0)
        :(mix<.66?0:mix<.88?1:2);
      galacticDust[j+4]=colour;
      dustBins[colour].push(i);
    }
    // Partition once: each grain is projected once, independent of colour count.
    const GALAXY_BASE_DUST=isMobile?4300:10800;
    const galaxyDustGroups=dustBins.map(bin=>new Uint16Array(bin.filter(i=>i<GALAXY_BASE_DUST)));
    const galaxyFineDustGroups=dustBins.map(bin=>new Uint16Array(bin.filter(i=>i>=GALAXY_BASE_DUST)));
    const studyArmGuides=Array.from({length:2},()=>Array.from({length:40},()=>({x:0,y:0,visible:false})));
    window.studyGalaxyArms=studyArmGuides;
    // Uneven knots down two arms, plus wisps on their outer edges.
    const galacticRibbons=Array.from({length:80},(_,i)=>{
      const radius=.19+(i%40)/39*3.0;
      const arm=i<40?0:1,branched=arm===0&&i%3===1;
      const mix=rnd(i+4311);
      const band=radius<1.05?0:radius<2.2?(mix<.16?0:2):(mix<.23?2:4);
      const height=(rnd(i+3201)-.5)*.13;
      const point=placeGalaxyArmPoint({},arm,radius,0,height,branched);
      const tip=placeGalaxyArmPoint({},arm,radius+.08,0,height,branched);
      const separation=arm===0?galaxyArmFork(radius):0;
      const taper=branched?smoothstep(2.70,3.2,radius):0;
      const knot=arm===1?(.5-.5*Math.cos(galaxyKnotPhase(radius))):0;
      const knotMix=arm===1?smoothstep(.65,1.18,radius):0;
      return {...point,tipX:tip.x,tipY:tip.y,tipZ:tip.z,
        width:(.58+radius*.22)*(1-separation*(branched?.28:.09)-.14*taper+knotMix*(knot*.14-.12)),
        thickness:(.60+rnd(i+4207)*.32)*(1-separation*(branched?.41:.12)+knotMix*(knot*.22-.15)),
        variant:band+i%2,opacity:.83*(1-.24*taper+knotMix*(knot*.43-.19))};
    });
    // Larger, translucent wisps carry the colour into the disc. These use the
    // same six cached textures, not new full-screen blur or live gradients.
    for(let i=0;i<(isMobile?14:28);i++) {
      const radius=.35+Math.pow(rnd(i+51001),.6)*2.65;
      const angle=i*2.399963+radius*.5;
      const tint=rnd(i+51007),band=radius<1.3?0:tint<.16?0:tint<.68?2:4;
      galacticRibbons.push({x:Math.cos(angle)*radius,
        y:(rnd(i+51009)-.5)*.45,z:Math.sin(angle)*radius,angle,
        width:1.15+rnd(i+51011)*.85,thickness:.9+rnd(i+51013)*.65,
        variant:band+i%2,opacity:.24});
    }
    // A seeded irregular shell puts quiet colour around, behind and between
    // the arms. There is no paired upper/lower arrangement or extra hit target.
    const scatteredNebula=Array.from({length:isMobile?8:16},(_,i)=>{
      const angle=rnd(i+72001)*Math.PI*2,radius=2.0+rnd(i+72003)*1.65;
      return {x:Math.cos(angle)*radius,y:(rnd(i+72007)-.5)*4.7,
        z:Math.sin(angle)*radius*.52,angle:rnd(i+72009)*Math.PI*2,
        width:1.65+rnd(i+72011)*1.4,thickness:1.15+rnd(i+72013)*1.15,
        variant:i%6,opacity:.14+rnd(i+72017)*.065};
    });
    // Very quiet off-disc veils extend the volume vertically. Heights, lateral
    // offsets and depths differ, so they never form mirrored rows or a halo ring.
    for(let i=0;i<(isMobile?4:8);i++) {
      const side=i%4<2?1:-1;
      scatteredNebula.push({x:(rnd(i+76001)-.5)*5.2,
        y:side*(1.45+rnd(i+76003)*1.05),z:(rnd(i+76007)-.5)*3.0,
        angle:rnd(i+76009)*Math.PI*2,width:2.0+rnd(i+76011)*1.1,
        thickness:1.40+rnd(i+76013)*.75,variant:i%5,
        opacity:.072+rnd(i+76017)*.035,offDisc:true});
    }
    const farStars=Array.from({length:isMobile?150:350},(_,i)=>({
      x:rnd(i+5501),y:rnd(i+6701),size:.35+rnd(i+8101)*.7,
      alpha:.12+rnd(i+8901)*.32,depth:.25+rnd(i+9201)*.75
    }));

    // Star-forming regions have real spatial anchors, not screen-space decoration.
    const stellarAssociations=Array.from({length:isMobile?22:44},(_,i)=>{
      const core=i<(isMobile?4:8),radius=core?.12+rnd(i+95003)*.95:.72+rnd(i+95007)*2.45;
      const height=(rnd(i+95017)-.5)*(core?.44:.38),angle=rnd(i+95011)*Math.PI*2;
      const point=core?{x:Math.cos(angle)*radius,y:height,z:Math.sin(angle)*radius,angle}
        :placeGalaxyArmPoint({},i%2,radius,0,height,i%4===0,(rnd(i+95013)-.5)*.24);
      const variant=(radius<1.15?0:radius<2.15?2:4)+i%2;
      return {...point,variant,width:(core?.30:.36)+rnd(i+95023)*.30,phase:rnd(i+95029)*Math.PI*2};
    });
    /* V7_7_ATMOSPHERE_START */
    // V7.7: seeded world-space atmosphere, sharing the existing perspective
    // camera. The disc's idle spin is separated from the surrounding sky.
    const SPACE_STAR_COUNT=24000,SPACE_STAR_STRIDE=4;
    const spatialSkyStars=new Float32Array(SPACE_STAR_COUNT*SPACE_STAR_STRIDE);
    const spatialSkyBins=Array.from({length:12},()=>[]);
    for(let i=0;i<SPACE_STAR_COUNT;i++){
      const layer=i%3,radius=13+layer*14+rnd(i+121003)*12;
      const azimuth=rnd(i+121019)*Math.PI*2,vertical=rnd(i+121021)*2-1;
      const horizontal=Math.sqrt(1-vertical*vertical),j=i*SPACE_STAR_STRIDE;
      spatialSkyStars[j]=Math.cos(azimuth)*horizontal*radius;
      spatialSkyStars[j+1]=vertical*radius;
      spatialSkyStars[j+2]=Math.sin(azimuth)*horizontal*radius;
      spatialSkyStars[j+3]=.50+rnd(i+121031)*.7;
      const tint=i%17===0?3:i%3,brightness=i%19===0?2:i%4===0?1:0;
      spatialSkyBins[tint*3+brightness].push(i);
    }
    const spatialSkyIndex=spatialSkyBins.map(bin=>new Uint16Array(bin));
    const spatialSkyOpacity={dark:[.24,.40,.65],light:[.19,.29,.47]};
    const spatialNearStars=Array.from({length:160},(_,i)=>{
      const radius=4.8+rnd(i+123007)*5.6,vertical=rnd(i+123011)*2-1;
      const azimuth=rnd(i+123017)*Math.PI*2,horizontal=Math.sqrt(1-vertical*vertical);
      return {x:Math.cos(azimuth)*horizontal*radius,y:vertical*radius,
        z:Math.sin(azimuth)*horizontal*radius,size:.65+rnd(i+123023)*.55,
        phase:rnd(i+123029)*Math.PI*2,tint:i%3,spike:i%17===0};
    });
    // A separate luminous deep-sky population fills the space away from the
    // disc. Jittered equal-area directions cover the entire surrounding volume;
    // these points never inherit the spiral's orbital paths.
    const DISTANT_LIGHT_COUNT=1056;
    const spatialDistantLights=Array.from({length:DISTANT_LIGHT_COUNT},(_,i)=>{
      // Keep the original 640 anchors, then add another full-sky population.
      const outer=i>=960;
      const sample=outer?i-960:i<640?i:i-640,population=outer?96:i<640?640:320;
      const vertical=1-2*(sample+.5)/population,horizontal=Math.sqrt(1-vertical*vertical);
      const angle=i*2.399963+(rnd(i+131003)-.5)*.16;
      const radius=15+(i%3)*11+rnd(i+131009)*10;
      return {x:Math.cos(angle)*horizontal*radius,y:vertical*radius,
        z:Math.sin(angle)*horizontal*radius,size:(outer?1.2:.73)+rnd(i+131017)*.55,
        phase:rnd(i+131021)*Math.PI*2,speed:.65+rnd(i+131027)*.7,
        tint:i%11===0?2:i%2,beacon:outer?i%4===0:i%13===0};
    });
    // A distributed index subset gives mobile the whole sky, not one hemisphere.
    const spatialDistantMobileIndex=Uint16Array.from({length:DISTANT_LIGHT_COUNT/2},(_,i)=>i*2);
    // Deep-sky banks occupy the surrounding volume, with extra high-latitude
    // anchors for the open sky above the disc. These are not constellation lines.
    const deepSkyVeils=Array.from({length:64},(_,i)=>{
      const vertical=i<40?1-2*(i+.5)/40:.18+rnd(i+143003)*.53;
      const horizontal=Math.sqrt(1-vertical*vertical),angle=i*2.399963+(rnd(i+143009)-.5)*.24;
      const radius=23+rnd(i+143013)*19;
      return {x:Math.cos(angle)*horizontal*radius,y:vertical*radius,
        z:Math.sin(angle)*horizontal*radius,width:6+rnd(i+143019)*6,
        aspect:.30+rnd(i+143021)*.27,angle:rnd(i+143027)*Math.PI*2,
        phase:rnd(i+143029)*Math.PI*2,opacity:.36+rnd(i+143033)*.16,
        variant:i%13===0?5:i%4===0?4:i%2,cluster:i%5===0,q:{},tip:{}};
    });
    const visibleDeepSkyVeils=[],deepSkyPoint={},deepSkyView={};
    const spatialClouds=Array.from({length:20},(_,i)=>{
      const azimuth=i*2.399963,radius=3.8+rnd(i+125003)*3.8;
      return {x:Math.cos(azimuth)*radius,y:(rnd(i+125009)-.5)*7.2,
        z:Math.sin(azimuth)*radius*.78-1.3,width:3.1+rnd(i+125017)*2.5,
        thickness:1.7+rnd(i+125021)*1.7,angle:rnd(i+125027)*Math.PI*2,
        phase:rnd(i+125033)*Math.PI*2,variant:i%6,
        opacity:.10+rnd(i+125039)*.07,q:{},tip:{}};
    });
    // Small, distant associations bring granular detail into the quiet space
    // around the arms. They share the existing baked stellar textures.
    const spatialStellarKnots=Array.from({length:14},(_,i)=>{
      const angle=rnd(i+127003)*Math.PI*2,radius=3.6+rnd(i+127009)*3.3;
      return {x:Math.cos(angle)*radius,y:(rnd(i+127013)-.5)*6.1,
        z:Math.sin(angle)*radius*.70-1.4,size:.28+rnd(i+127019)*.40,
        variant:i%6,phase:rnd(i+127021)*Math.PI*2,q:{}};
    });
    const spatialNearScratch={},spatialNearPoint={},spatialCloudPoint={};
    const spatialDistantScratch={},spatialDistantPoint={},spatialDistantView={};
    const spatialFarView={},spatialNearView={},spatialCloudView={};
    const visibleSpatialClouds=[];
    // Substructure follows the actual spiral in x/y/z. A little vertical spread
    // keeps the strands resolved when looking almost along the galactic plane.
    const ARM_DETAIL_COUNT=3200,ARM_LANE_SEGMENTS=64;
    const galaxyArmDetail=new Float32Array(ARM_DETAIL_COUNT*5);
    const galaxyArmFlowParams=new Float32Array(ARM_DETAIL_COUNT*4);
    const galaxyArmFrame=new Float32Array(ARM_DETAIL_COUNT*3);
    const galaxyArmDepthBand=new Uint8Array(ARM_DETAIL_COUNT);
    const galaxyArmDetailBins=Array.from({length:4},()=>[]);
    for(let i=0;i<ARM_DETAIL_COUNT;i++){
      const strand=i%12,arm=Math.floor(strand/6),r=.26+Math.pow(rnd(i+133003),.83)*2.92;
      const cross=(strand%6-2.5)*.042+Math.sin(r*9+strand)*.016+(rnd(i+133009)-.5)*.030;
      const height=(strand%3-1)*.045+Math.sin(r*6+strand)*.025+(rnd(i+133013)-.5)*.035;
      const point=placeGalaxyArmPoint(armSeedPoint,arm,r,cross,height,strand%6>=4,Math.sin(r*5+strand)*.014);
      const j=i*5;
      galaxyArmDetail[j]=point.x;galaxyArmDetail[j+1]=point.y;galaxyArmDetail[j+2]=point.z;
      galaxyArmDetail[j+3]=.35+rnd(i+133021)*.45;
      const colour=r<1.1?(i%3?3:2):r<2.1?(i%3?2:1):(i%4?0:1);
      galaxyArmDetail[j+4]=colour;galaxyArmDetailBins[colour].push(i);
      const f=i*4;
      galaxyArmFlowParams[f]=(r-.26)/2.92;
      galaxyArmFlowParams[f+1]=.70+rnd(i+139003)*.55;
      galaxyArmFlowParams[f+2]=(rnd(i+133009)-.5)*.030;
      galaxyArmFlowParams[f+3]=(rnd(i+133013)-.5)*.035;
    }
    const galaxyArmDetailIndex=galaxyArmDetailBins.map(bin=>new Uint16Array(bin));
    const galaxyArmLanes=Array.from({length:6},(_,i)=>{
      const arm=Math.floor(i/3),lane=i%3,points=new Float32Array((ARM_LANE_SEGMENTS+1)*3);
      for(let s=0;s<=ARM_LANE_SEGMENTS;s++){
        const r=.36+s/ARM_LANE_SEGMENTS*2.78;
        const cross=(lane-1)*.085+Math.sin(r*7+i*1.3)*.024+Math.sin(r*15+i*.63)*.018;
        const height=(lane-1)*.031+Math.sin(r*4+i)*.025;
        const p=placeGalaxyArmPoint(armSeedPoint,arm,r,cross,height,lane===2);
        points[s*3]=p.x;points[s*3+1]=p.y;points[s*3+2]=p.z;
      }
      const chunks=[];
      for(let start=1+i%3;start<ARM_LANE_SEGMENTS;start+=7+i%2){
        chunks.push({start,end:Math.min(ARM_LANE_SEGMENTS,start+3+Math.round(rnd(i*71+start+137003)*2)),
          width:.65+rnd(i*71+start+137009)*.5,opacity:.50+rnd(i*71+start+137013)*.5});
      }
      return {points,index:i,chunks};
    });
    const galaxyCompactArmKnots=Array.from({length:24},(_,i)=>{
      const arm=Math.floor(i/12),r=.48+(i%12)/11*2.56+(rnd(i+135003)-.5)*.07;
      const p=placeGalaxyArmPoint({},arm,r,0,(rnd(i+135013)-.5)*.19,i%3===1,(rnd(i+135009)-.5)*.055);
      return {...p,phase:rnd(i+135023)*Math.PI*2,width:.12+rnd(i+135019)*.15,
        variant:(r<1.1?0:r<2.1?2:4)+i%2,q:{}};
    });
    const ZOOM_GRAIN_COUNT=2400;
    const galaxyZoomGrains=new Float32Array(ZOOM_GRAIN_COUNT*4);
    const galaxyZoomBins=Array.from({length:10},()=>[]);
    for(let i=0;i<ZOOM_GRAIN_COUNT;i++){
      const knot=galaxyCompactArmKnots[i%24],sequence=Math.floor(i/24),tier=sequence%2;
      const width=knot.width,j=i*4;
      let along,across;
      if(tier===0) {
        // The first reveal resolves each association into three uneven pockets.
        const lobe=sequence/2%3,angle=rnd(i+141003)*Math.PI*2;
        const spread=Math.pow(rnd(i+141009),1.35)*width*.23;
        along=(lobe-1)*width*.32+Math.cos(angle)*spread;
        across=(lobe===1?.14:-.08)*width+Math.sin(angle)*spread*.72;
      }else {
        // Close up, two narrow veils wind through the pockets along the arm.
        const t=rnd(i+141003)*2-1;
        along=t*width*.78;
        across=width*(Math.sin(t*2.7+knot.phase)*.14+(sequence%4===1?.15:-.13)+(rnd(i+141009)-.5)*.10);
      }
      const cos=Math.cos(knot.angle),sin=Math.sin(knot.angle);
      galaxyZoomGrains[j]=knot.x+cos*across-sin*along;
      galaxyZoomGrains[j+1]=knot.y+(rnd(i+141013)-.5)*.05+across*.16;
      galaxyZoomGrains[j+2]=knot.z+sin*across+cos*along;
      const spark=rnd(i+141023)>.947;
      galaxyZoomGrains[j+3]=.25+rnd(i+141019)*.28+(spark?.26:0);
      const colour=spark?4:knot.variant<2?3:knot.variant<4?2:0;
      galaxyZoomBins[colour*2+tier].push(i);
    }
    const galaxyZoomIndex=galaxyZoomBins.map(bin=>new Uint16Array(bin));
    const armLaneScratch={},armDetailScratch={},armFlowScratch={},zoomDetailScratch={};
    function galaxyDepthWeight(distance,camZ,cloud=false){
      const depth=Math.max(-1,Math.min(1,(camZ-distance)/2.7));
      return cloud?.96+depth*.16:.98+depth*.10;
    }
    function galaxyZoomDetail(camZ){
      const t=Math.max(0,Math.min(1,(GALAXY_DEFAULT_DISTANCE-camZ)/(GALAXY_DEFAULT_DISTANCE-GALAXY_MIN_DISTANCE)));
      return t*t*(3-2*t);
    }
    function galaxyArmFlowPosition(i,time,out={}){
      const j=i*5;
      if(i%5!==0||galaxyMotion.matches){
        out.x=galaxyArmDetail[j];out.y=galaxyArmDetail[j+1];out.z=galaxyArmDetail[j+2];out.opacity=1;return out;
      }
      const f=i*4,t=(galaxyArmFlowParams[f]+Math.max(0,time)*.0000016*galaxyArmFlowParams[f+1])%1;
      const strand=i%12,arm=Math.floor(strand/6),r=.26+t*2.92;
      const cross=(strand%6-2.5)*.042+Math.sin(r*9+strand)*.016+galaxyArmFlowParams[f+2];
      const height=(strand%3-1)*.045+Math.sin(r*6+strand)*.025+galaxyArmFlowParams[f+3];
      placeGalaxyArmPoint(out,arm,r,cross,height,strand%6>=4,Math.sin(r*5+strand)*.014);
      // The few grains that reach a strand end disappear before wrapping, then
      // emerge gently at its beginning. No per-frame randomness or respawn flash.
      out.opacity=smoothstep(0,.035,t)*(1-smoothstep(.965,1,t));return out;
    }
    const nucleusDust=Array.from({length:104},(_,i)=>{
      const arm=i%2,r=.07+.96*(i>>1)/51,phase=r*19+arm*2.9;
      const point=placeGalaxyArmPoint({},arm,r,(rnd(31703+i)-.5)*.09,.027*Math.sin(phase)+(rnd(31789+i)-.5)*.038,false);
      return {...point,strength:.24+.76*Math.pow(.5+.5*Math.sin(phase),2),knot:i%11===0};
    });
    const dustTiles={};
    function drawNucleusDust(unit,camZ,orbit,pitch,alpha){
      const edge=1-smoothstep(.08,.43,Math.abs(Math.sin(pitch)));if(edge<.001)return;
      let tile=dustTiles[currentTheme];
      if(!tile){
        tile=document.createElement('canvas');tile.width=tile.height=48;
        const p=tile.getContext('2d'),g=p.createRadialGradient(24,24,0,24,24,24);
        const rgb=currentTheme==='light'?'102,68,82':'39,23,41';
        g.addColorStop(0,'rgba('+rgb+',.85)');g.addColorStop(.5,'rgba('+rgb+',.36)');g.addColorStop(1,'rgba('+rgb+',0)');
        p.fillStyle=g;p.fillRect(0,0,48,48);dustTiles[currentTheme]=tile;
      }
      ctx.save();
      const glow=galaxyLuminousAssets(currentTheme).motes[2];
      for(const p of nucleusDust){
        const q=project3D(p.x,p.y,p.z,unit,camZ,orbit,pitch,armLaneScratch);
        const front=smoothstep(.01,.32,camZ-q.dist);if(!q.visible||!front)continue;
        const w=q.pers*.13,h=q.pers*.043;
        ctx.globalAlpha=alpha*edge*front*p.strength*.48;ctx.drawImage(tile,q.x-w/2,q.y-h/2,w,h);
        if(p.knot){
          const k=project3D(p.x,p.y+(p.z>0?.046:-.046),p.z,unit,camZ,orbit,pitch,armLaneScratch);
          ctx.globalAlpha=alpha*edge*front*.78;ctx.drawImage(glow,k.x-h/2,k.y-h/2,h,h);
        }
      }
      ctx.restore();
    }
    function drawGalaxyArmLanes(unit,camZ,orbit,pitch,alpha){
      const dark=currentTheme==='dark';ctx.save();
      const laneInk=dark?'#07090b':galaxySpectrum.light.ground;
      const silhouette=dark?'#1b1325':'#735a7e';
      const edgeOn=1-smoothstep(.12,.48,Math.abs(Math.sin(pitch)));
      ctx.lineCap='round';
      const width=Math.max(.7,Math.min(2.3,unit/camZ*.010));
      for(const lane of galaxyArmLanes){
        for(const chunk of lane.chunks){
          let previousX=0,previousY=0,connected=false,crossing=0;ctx.beginPath();
          for(let s=chunk.start;s<=chunk.end;s++){
            const j=s*3,q=project3D(lane.points[j],lane.points[j+1],lane.points[j+2],unit,camZ,orbit,pitch,armLaneScratch);
            if(!q.visible||q.dist<.8){connected=false;continue;}
            if(connected){ctx.moveTo(previousX,previousY);ctx.lineTo(q.x,q.y);}
            previousX=q.x;previousY=q.y;connected=true;
            if(edgeOn>0&&s<15)crossing=Math.max(crossing,smoothstep(.045,.36,camZ-q.dist)*(1-smoothstep(7,15,s)));
          }
          // A feathered, fragmented negative-space cut, not a continuous wire.
          const strength=alpha*chunk.opacity*(dark?1:1.15);
          ctx.strokeStyle=laneInk;
          ctx.lineWidth=width*chunk.width*1.7;ctx.globalAlpha=strength*.055;ctx.stroke();
          ctx.lineWidth=Math.max(.45,width*chunk.width*.56);ctx.globalAlpha=strength*.14;ctx.stroke();
          const frontShadow=edgeOn*crossing;
          if(frontShadow>.01) {
            ctx.strokeStyle=silhouette;ctx.lineWidth=width*chunk.width*1.45;
            ctx.globalAlpha=strength*frontShadow*.12;ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
    function drawGalaxyArmDetails(unit,camZ,orbit,pitch,alpha,time=0){
      const dark=currentTheme==='dark',spectrum=galaxySpectrum[currentTheme];
      const limit=isMobile?1600:ARM_DETAIL_COUNT;ctx.save();
      for(let group=0;group<4;group++){
        const indices=galaxyArmDetailIndex[group];
        // Project each grain once, then batch its cached screen coordinates into
        // three depth bands. Close grains stay more defined than the far arm.
        for(const i of indices){
          if(i>=limit)continue;
          galaxyArmDepthBand[i]=255;
          const p=galaxyArmFlowPosition(i,time,armFlowScratch),j=i*5;
          const q=project3D(p.x,p.y,p.z,unit,camZ,orbit,pitch,armDetailScratch);
          if(!q.visible||q.dist<.6||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
          const size=Math.max(.34,Math.min(1.05,galaxyArmDetail[j+3]*q.pers*.005))*Math.sqrt(p.opacity);
          const k=i*3;galaxyArmFrame[k]=q.x;galaxyArmFrame[k+1]=q.y;galaxyArmFrame[k+2]=size;
          galaxyArmDepthBand[i]=q.dist>camZ+.7?0:q.dist<camZ-.7?2:1;
        }
        ctx.fillStyle=spectrum.stars[group];
        for(let band=0;band<3;band++){
          ctx.globalAlpha=alpha*(dark?.72:.60)*galaxyDepthWeight(camZ+(1-band)*2,camZ);ctx.beginPath();
          for(const i of indices){
            if(i>=limit||galaxyArmDepthBand[i]!==band)continue;
            const k=i*3,size=galaxyArmFrame[k+2];if(size<.04)continue;
            ctx.rect(galaxyArmFrame[k]-size/2,galaxyArmFrame[k+1]-size/2,size,size);
          }
          ctx.fill();
        }
      }
      const tiles=stellarAssociationMaterial[currentTheme];
      // Interleaving the two arms gives mobile an even subset of compact knots.
      for(let n=0;n<(isMobile?12:24);n++){
        const knot=galaxyCompactArmKnots[isMobile?n*2:n],tile=tiles[knot.variant];if(!tile)continue;
        const q=project3D(knot.x,knot.y,knot.z,unit,camZ,orbit,pitch,knot.q);
        if(!q.visible||q.dist<.7)continue;
        const size=Math.max(8,Math.min(isMobile?44:68,knot.width*q.pers));
        if(q.x< -size||q.x>rw+size||q.y< -size||q.y>rh+size)continue;
        ctx.globalAlpha=alpha*q.depthAlpha*(dark?.78:.63)*galaxyDepthWeight(q.dist,camZ);
        ctx.drawImage(tile,q.x-size/2,q.y-size*.36,size,size*.72);
      }
      ctx.restore();
    }
    function drawGalaxyZoomDetails(unit,camZ,orbit,pitch,alpha){
      const detail=galaxyZoomDetail(camZ);if(detail<.002)return;
      const spectrum=galaxySpectrum[currentTheme],dark=currentTheme==='dark';
      const limit=isMobile?1200:ZOOM_GRAIN_COUNT;ctx.save();
      for(let bucket=0;bucket<galaxyZoomIndex.length;bucket++){
        const tier=bucket%2,spark=bucket>=8;
        const reveal=spark?smoothstep(.28,.94,detail):tier?smoothstep(.16,.91,detail):detail;
        if(reveal<.002)continue;
        ctx.fillStyle=spark?(spectrum.starlight||spectrum.bright):spectrum.stars[Math.floor(bucket/2)];
        ctx.globalAlpha=alpha*reveal*(dark?.84:.70);ctx.beginPath();
        for(const i of galaxyZoomIndex[bucket]){
          if(i>=limit)continue;const j=i*4;
          const q=project3D(galaxyZoomGrains[j],galaxyZoomGrains[j+1],galaxyZoomGrains[j+2],unit,camZ,orbit,pitch,zoomDetailScratch);
          if(!q.visible||q.dist<.6||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
          const size=Math.max(.18,Math.min(spark?1.12:.86,galaxyZoomGrains[j+3]*q.pers*(spark?.0048:.0034)));
          ctx.rect(q.x-size/2,q.y-size/2,size,size);
        }
        ctx.fill();
      }
      ctx.restore();
    }
    function spatialAtmosphereView(orbit,pitch,time,near,out={}){
      // Actual perspective changes with zoom and focus. Angular response is
      // quieter at distance; the main disc's autonomous spin does not turn the sky.
      const reduced=galaxyMotion.matches,clock=reduced?0:time;
      const factor=near?.64:.19;
      out.orbit=(orbit-galaxyDriftState.orbit)*factor+clock*(near?.000003:.000001);
      out.pitch=(pitch-galaxyDriftState.pitch)*(near?.58:.22);
      return out;
    }
    function spatialCloudPosition(cloud,time,out={}){
      const t=galaxyMotion.matches?0:time*.000024;
      out.x=cloud.x+Math.sin(t+cloud.phase)*.11;
      out.y=cloud.y+Math.sin(t*.71+cloud.phase)*.14;
      out.z=cloud.z+Math.cos(t*.59+cloud.phase)*.09;
      return out;
    }
    function spatialNearPosition(star,time,out={}){
      const t=galaxyMotion.matches?0:time*.000045;
      out.x=star.x+Math.sin(t*.67+star.phase)*.10;
      out.y=star.y+Math.sin(t+star.phase)*.16;
      out.z=star.z+Math.cos(t*.53+star.phase)*.12;
      return out;
    }
    function spatialDistantPosition(star,time,out={}){
      const t=galaxyMotion.matches?0:time*.000018*star.speed;
      out.x=star.x+Math.sin(t*.73+star.phase)*.22;
      out.y=star.y+Math.sin(t+star.phase)*.24;
      out.z=star.z+Math.cos(t*.61+star.phase)*.17;
      return out;
    }
    function drawSpatialSky(unit,camZ,orbit,pitch,alpha,time){
      const spectrum=galaxySpectrum[currentTheme],dark=currentTheme==='dark';
      const view=spatialAtmosphereView(orbit,pitch,time,false,spatialFarView);
      const limit=isMobile?11200:SPACE_STAR_COUNT;
      setGalaxyProjection(view.orbit,view.pitch);
      const halfWidth=rw*.5,halfHeight=rh*.5,frameX=galaxyCamera.frameX,frameY=galaxyCamera.frameY;
      ctx.save();
      // Twelve paths: four colours and three brightness bands. No per-star
      // gradients, Canvas allocations or coordinate objects in the frame loop.
      for(let bucket=0;bucket<12;bucket++){
        const brightness=bucket%3,tint=Math.floor(bucket/3);
        ctx.fillStyle=spectrum.stars[tint];
        ctx.globalAlpha=alpha*spatialSkyOpacity[currentTheme][brightness];
        ctx.beginPath();
        const indices=spatialSkyIndex[bucket];
        for(let n=0;n<indices.length;n++){
          const i=indices[n];
          if(i>=limit)break;
          const j=i*SPACE_STAR_STRIDE;
          // Same projection as project3D, without unused per-star depth alpha.
          const x=spatialSkyStars[j],y=spatialSkyStars[j+1],z=spatialSkyStars[j+2];
          const rx=x*cosO+z*sinO,rz1=-x*sinO+z*cosO;
          const ry=y*cosP-rz1*sinP,distance=camZ-(y*sinP+rz1*cosP);
          if(distance<=.14)continue;
          const perspective=unit/distance;
          const screenX=halfWidth+(rx-frameX)*perspective,screenY=halfHeight-(ry-frameY)*perspective;
          if(screenX< -2||screenX>rw+2||screenY< -2||screenY>rh+2)continue;
          const depth=Math.max(.62,Math.min(1.5,perspective*.032));
          const size=Math.max(.42,Math.min(1.3,spatialSkyStars[j+3]*depth));
          ctx.rect(screenX-size*.5,screenY-size*.5,size,size);
        }
        ctx.fill();
      }
      ctx.restore();
    }
    function drawSpatialDistantLights(unit,camZ,orbit,pitch,alpha,time){
      const dark=currentTheme==='dark',spectrum=galaxySpectrum[currentTheme];
      const assets=galaxyLuminousAssets(currentTheme);
      const view=spatialAtmosphereView(orbit,pitch,time,false,spatialDistantView);
      const count=isMobile?spatialDistantMobileIndex.length:spatialDistantLights.length;
      const clock=galaxyMotion.matches?0:time;
      ctx.save();
      for(let i=0;i<count;i++){
        const star=spatialDistantLights[isMobile?spatialDistantMobileIndex[i]:i];
        const p=spatialDistantPosition(star,clock,spatialDistantPoint);
        const q=project3D(p.x,p.y,p.z,unit,camZ,view.orbit,view.pitch,spatialDistantScratch);
        if(!q.visible||q.dist<3||q.x< -12||q.x>rw+12||q.y< -12||q.y>rh+12)continue;
        const apparent=.78+Math.min(.48,q.pers*.013);
        const size=Math.min(star.beacon?1.8:1.45,star.size*apparent*(star.beacon?1.2:1));
        const colour=dark?spectrum.stars[star.tint===2?3:star.tint===1?2:0]
          :spectrum.stars[star.tint===2?3:star.tint];
        const breath=galaxyMotion.matches?1:.91+Math.sin(clock*.00024*star.speed+star.phase)*.09;
        const fade=Math.max(0,Math.min(1,(q.dist-3)/3));
        const glow=size*(star.beacon?13:10);
        ctx.globalAlpha=alpha*fade*breath*(dark?.72:.54);
        ctx.drawImage(assets.motes[star.tint],q.x-glow/2,q.y-glow/2,glow,glow);
        ctx.globalAlpha=Math.min(1,alpha*fade*breath*(dark?1.14:.92));
        ctx.fillStyle=dark?'#f0f3ff':colour;
        ctx.beginPath();ctx.arc(q.x,q.y,size*.61,0,Math.PI*2);ctx.fill();
        if(star.beacon){
          ctx.globalAlpha=alpha*fade*breath*(dark?.39:.31);ctx.strokeStyle=colour;ctx.lineWidth=.55;
          ctx.beginPath();ctx.moveTo(q.x-size*2.5,q.y);ctx.lineTo(q.x+size*2.5,q.y);
          ctx.moveTo(q.x,q.y-size*1.9);ctx.lineTo(q.x,q.y+size*1.9);ctx.stroke();
        }
      }
      ctx.restore();
    }
    function drawDeepSkyVeils(unit,camZ,orbit,pitch,alpha,time){
      const dark=currentTheme==='dark',gas=scatteredNebulaMaterial[currentTheme];
      const grains=stellarAssociationMaterial[currentTheme],starFields=galaxyMaterialOverview[currentTheme];
      const view=spatialAtmosphereView(orbit,pitch,time,false,deepSkyView);
      const visible=visibleDeepSkyVeils;visible.length=0;
      for(let n=0;n<(isMobile?32:deepSkyVeils.length);n++){
        const cloud=deepSkyVeils[isMobile?n*2:n],p=spatialCloudPosition(cloud,time,deepSkyPoint);
        const q=project3D(p.x,p.y,p.z,unit,camZ,view.orbit,view.pitch,cloud.q);
        if(!q.visible||q.dist<4)continue;
        cloud.drawWidth=Math.min(rw*(isMobile?.80:.48),cloud.width*q.pers);
        cloud.drawHeight=Math.min(rh*.24,cloud.drawWidth*cloud.aspect);
        const extent=Math.hypot(cloud.drawWidth,cloud.drawHeight)*.68;
        if(q.x< -extent||q.x>rw+extent||q.y< -extent||q.y>rh+extent)continue;
        const tip=project3D(p.x+Math.cos(cloud.angle),p.y+Math.sin(cloud.angle),p.z,
          unit,camZ,view.orbit,view.pitch,cloud.tip);
        cloud.rotation=tip.visible?Math.atan2(tip.y-q.y,tip.x-q.x):cloud.angle;
        visible.push(cloud);
      }
      visible.sort((a,b)=>b.q.dist-a.q.dist);ctx.save();
      for(const cloud of visible){
        const tile=gas[cloud.variant];if(!tile)continue;
        const q=cloud.q,w=cloud.drawWidth,h=cloud.drawHeight;
        const strength=alpha*cloud.opacity*(dark?.96:.72);
        ctx.save();ctx.translate(q.x,q.y);ctx.rotate(cloud.rotation);
        ctx.globalAlpha=strength;ctx.drawImage(tile,-w/2,-h/2,w,h);
        const secondary=gas[cloud.variant===5?4:cloud.variant===4?1:(cloud.variant+1)%2];
        if(secondary){
          ctx.save();ctx.translate(w*.16,-h*.12);ctx.rotate(.34);
          ctx.globalAlpha=strength*.55;ctx.drawImage(secondary,-w*.37,-h*.40,w*.86,h*.80);ctx.restore();
        }
        // Baked fine-star pockets add structure to each wisp without projecting
        // thousands of extra grains or creating new blur/texture surfaces.
        const field=starFields[cloud.variant===5?0:cloud.variant===4?2:4+cloud.variant%2];
        if(field){
          ctx.globalAlpha=alpha*(dark?.24:.18);
          ctx.drawImage(field,-w*.45,-h*.40,w*.90,h*.80);
        }
        const stars=grains[cloud.variant];
        if(stars){
          ctx.globalAlpha=alpha*(dark?.20:.15);
          ctx.drawImage(stars,-w*.23,-h*.20,w*.46,h*.53);
          if(cloud.cluster){
            const size=Math.min(isMobile?34:48,w*.16);
            ctx.globalAlpha=alpha*(dark?.32:.24);
            ctx.drawImage(stars,w*.19-size/2,h*.13-size/2,size,size);
          }
        }
        ctx.restore();
      }
      ctx.restore();
    }
    function drawSpatialNebula(unit,camZ,orbit,pitch,alpha,time){
      const tiles=scatteredNebulaMaterial[currentTheme],dark=currentTheme==='dark';
      const view=spatialAtmosphereView(orbit,pitch,time,true,spatialCloudView);
      const visible=visibleSpatialClouds;visible.length=0;
      const count=isMobile?11:spatialClouds.length;
      for(let i=0;i<count;i++){
        const cloud=spatialClouds[i],p=spatialCloudPosition(cloud,time,spatialCloudPoint);
        const q=project3D(p.x,p.y,p.z,unit,camZ,view.orbit,view.pitch,cloud.q);
        // Fade through the near plane; a nearby wisp never becomes a full-screen veil.
        if(!q.visible||q.dist<1.4)continue;
        const width=Math.min(rw*.70,cloud.width*q.pers);
        const height=Math.min(rh*.50,cloud.thickness*q.pers);
        if(q.x< -width||q.x>rw+width||q.y< -height||q.y>rh+height)continue;
        cloud.drawWidth=width;cloud.drawHeight=height;visible.push(cloud);
      }
      visible.sort((a,b)=>b.q.dist-a.q.dist);
      ctx.save();
      for(const cloud of visible){
        const tile=tiles[cloud.variant];if(!tile)continue;
        const p=spatialCloudPosition(cloud,time,spatialCloudPoint),q=cloud.q;
        const tip=project3D(p.x+Math.cos(cloud.angle)*.3,p.y+Math.sin(cloud.angle)*.3,p.z,
          unit,camZ,view.orbit,view.pitch,cloud.tip);
        const turn=tip.visible?Math.atan2(tip.y-q.y,tip.x-q.x):cloud.angle;
        const nearFade=Math.max(0,Math.min(1,(q.dist-1.4)/2));
        ctx.save();ctx.translate(q.x,q.y);ctx.rotate(turn);
        ctx.globalAlpha=alpha*cloud.opacity*nearFade*(dark?1.05:.72);
        ctx.drawImage(tile,-cloud.drawWidth/2,-cloud.drawHeight/2,cloud.drawWidth,cloud.drawHeight);
        ctx.restore();
      }
      // Resolved star-forming knots sit behind the disc rather than on labels.
      const knots=stellarAssociationMaterial[currentTheme];
      const knotCount=isMobile?7:spatialStellarKnots.length;
      for(let i=0;i<knotCount;i++){
        const knot=spatialStellarKnots[i],tile=knots[knot.variant];if(!tile)continue;
        const q=project3D(knot.x,knot.y,knot.z,unit,camZ,view.orbit,view.pitch,knot.q);
        if(!q.visible||q.dist<2.2)continue;
        const size=Math.min(isMobile?54:88,knot.size*q.pers);
        if(q.x< -size||q.x>rw+size||q.y< -size||q.y>rh+size)continue;
        const breath=galaxyMotion.matches?1:.95+Math.sin(time*.00012+knot.phase)*.05;
        ctx.globalAlpha=alpha*q.depthAlpha*breath*(dark?.29:.23);
        ctx.drawImage(tile,q.x-size/2,q.y-size/2,size,size);
      }
      ctx.restore();
    }
    const foregroundFlyby={clock:0,nextAt:6300,index:-1,sequence:0,startedAt:0,returnIndex:-1,returnedAt:0};
    const FLYBY_DURATION=2240;
    const flybyPoint={},flybyTail={};
    function updateForegroundFlyby(unit,camZ,view,time,dt,count) {
      const flight=foregroundFlyby;
      if(galaxyMotion.matches){flight.index=-1;flight.returnIndex=-1;flight.nextAt=flight.clock+6300;return null;}
      flight.clock+=dt;
      if(flight.index>=0) {
        if(flight.clock-flight.startedAt<FLYBY_DURATION)return flight;
        flight.returnIndex=flight.index;flight.returnedAt=flight.clock;flight.index=-1;
        flight.nextAt=flight.clock+10800+rnd(flight.sequence+157003)*6100;
      }
      if(flight.clock<flight.nextAt)return null;
      const candidates=Math.ceil(count/17);
      for(let n=0;n<candidates;n++) {
        // Borrow a luminous star whose ordinary position is outside the shot.
        const index=((flight.sequence*3+n)%candidates)*17;
        const p=spatialNearPosition(spatialNearStars[index],time,spatialNearPoint);
        const q=project3D(p.x,p.y,p.z,unit,camZ,view.orbit,view.pitch,spatialNearScratch);
        if(q.visible&&q.dist>=1.3&&q.x>-rw*.2&&q.x<rw*1.2&&q.y>-rh*.2&&q.y<rh*1.2)continue;
        flight.index=index;flight.startedAt=flight.clock;
        flight.side=flight.sequence%2===0?1:-1;
        flight.y=.20+rnd(flight.sequence+157007)*.07;
        flight.span=.37+rnd(flight.sequence+157009)*.13;
        flight.sequence++;
        // Capture the camera basis once. The flyby follows this path in world
        // space even if the visitor changes their view during the pass.
        flight.frameX=galaxyCamera.frameX;flight.frameY=galaxyCamera.frameY;
        flight.width=rw/unit;flight.height=rh/unit;flight.distance=camZ;
        flight.cosOrbit=cosO;flight.sinOrbit=sinO;flight.cosPitch=cosP;flight.sinPitch=sinP;
        return flight;
      }
      flight.nextAt=flight.clock+1450;
      return null;
    }
    function foregroundFlybyPosition(flight,t,out) {
      const arc=Math.sin(Math.PI*t),depth=4.30-2.52*arc;
      const u=-.07+.235*arc,v=flight.y+flight.span*t;
      const x=flight.frameX+(u-.5)*flight.side*flight.width*depth;
      const y=flight.frameY-(v-.5)*flight.height*depth;
      const z=flight.distance-depth;
      const behindPitch=z*flight.cosPitch-y*flight.sinPitch;
      out.x=x*flight.cosOrbit-behindPitch*flight.sinOrbit;
      out.y=y*flight.cosPitch+z*flight.sinPitch;
      out.z=x*flight.sinOrbit+behindPitch*flight.cosOrbit;
      return out;
    }
    function drawSpatialNearStars(unit,camZ,orbit,pitch,alpha,time,dt=0){
      const dark=currentTheme==='dark',spectrum=galaxySpectrum[currentTheme];
      const assets=galaxyLuminousAssets(currentTheme);
      const view=spatialAtmosphereView(orbit,pitch,time,true,spatialNearView);
      const count=isMobile?80:spatialNearStars.length,clock=galaxyMotion.matches?0:time;
      const flight=updateForegroundFlyby(unit,camZ,view,clock,dt,count);
      const progress=flight?(flight.clock-flight.startedAt)/FLYBY_DURATION:0;
      ctx.save();
      for(let i=0;i<count;i++){
        const star=spatialNearStars[i];
        const flying=flight?.index===i;
        const p=flying?foregroundFlybyPosition(flight,progress,flybyPoint):spatialNearPosition(star,clock,spatialNearPoint);
        const q=project3D(p.x,p.y,p.z,unit,camZ,view.orbit,view.pitch,spatialNearScratch);
        if(!q.visible||q.dist<1.3||q.x< -10||q.x>rw+10||q.y< -10||q.y>rh+10)continue;
        let fade=flying?smoothstep(1.30,1.85,q.dist):Math.max(0,Math.min(1,(q.dist-1.3)/1.6));
        if(flying)fade*=smoothstep(.06,.24,progress)*(1-smoothstep(.76,.96,progress));
        else if(i===foregroundFlyby.returnIndex)fade*=smoothstep(0,260,foregroundFlyby.clock-foregroundFlyby.returnedAt);
        const size=Math.max(.65,Math.min(flying?3.15:1.65,star.size*q.pers*(flying?.0135:.010)));
        const tint=dark?spectrum.stars[star.tint]:spectrum.stars[[0,1,3][star.tint]];
        const breath=galaxyMotion.matches?1:.94+Math.sin(clock*.00038+star.phase)*.06;
        if(flying&&fade>.02) {
          const previous=foregroundFlybyPosition(flight,Math.max(0,progress-.04),flybyPoint);
          const tail=project3D(previous.x,previous.y,previous.z,unit,camZ,view.orbit,view.pitch,flybyTail);
          if(tail.visible) {
            const dx=tail.x-q.x,dy=tail.y-q.y;
            const reach=Math.min(1,24/Math.max(1,Math.hypot(dx,dy)));
            ctx.strokeStyle=tint;ctx.globalAlpha=alpha*fade*.26;ctx.lineWidth=.65;
            ctx.beginPath();ctx.moveTo(q.x+dx*reach,q.y+dy*reach);ctx.lineTo(q.x,q.y);ctx.stroke();
          }
        }
        ctx.globalAlpha=alpha*fade*breath*(flying?.82:dark?.52:.43);
        const glow=size*(flying?11:10);
        ctx.drawImage(assets.motes[star.tint],q.x-glow/2,q.y-glow/2,glow,glow);
        ctx.globalAlpha=alpha*fade*breath*(flying?.97:dark?.88:.73);ctx.fillStyle=tint;
        ctx.beginPath();ctx.arc(q.x,q.y,size*.6,0,Math.PI*2);ctx.fill();
        if(star.spike){
          ctx.globalAlpha=alpha*fade*.25;ctx.strokeStyle=tint;ctx.lineWidth=.5;
          ctx.beginPath();ctx.moveTo(q.x-size*2.6,q.y);ctx.lineTo(q.x+size*2.6,q.y);
          ctx.moveTo(q.x,q.y-size*1.7);ctx.lineTo(q.x,q.y+size*1.7);ctx.stroke();
        }
      }
      ctx.restore();
    }

    /* V7_7_ATMOSPHERE_END */
    // Frame-local views reuse stable records; sorting never replaces world anchors.
    const stellarDrawRecords=stellarAssociations.map(cluster=>({cluster,q:{},tip:{},y:0}));
    const visibleStellarRecords=[];
    const ribbonDrawRecords=galacticRibbons.map(cloud=>({cloud,q:{},tip:{}}));
    const visibleRibbonRecords=[];
    const foregroundRibbonRecords=[];
    const galaxyCoreProjection={};
    const scatterDrawRecords=scatteredNebula.map(cloud=>({cloud,q:{},tip:{}}));
    function drawStellarAssociations(unit,camZ,orbit,pitch,alpha,time) {
      const tiles=stellarAssociationMaterial[currentTheme],dark=currentTheme==='dark';
      const clock=galaxyMotion.matches?0:time*.00012;
      const resolved=visibleStellarRecords;resolved.length=0;
      for(const record of stellarDrawRecords) {
        const {cluster}=record;
        const y=cluster.y+Math.sin(clock+cluster.phase)*.025;
        const q=project3D(cluster.x,y,cluster.z,unit,camZ,orbit,pitch,record.q);
        if(!q.visible||q.x< -100||q.x>rw+100||q.y< -100||q.y>rh+100)continue;
        record.y=y;resolved.push(record);
      }
      resolved.sort((a,b)=>b.q.dist-a.q.dist);
      for(const {cluster,q,y,tip:tipRecord} of resolved) {
        const tile=tiles[cluster.variant];if(!tile)continue;
        const tip=project3D(cluster.x-Math.sin(cluster.angle)*.08,y,
          cluster.z+Math.cos(cluster.angle)*.08,unit,camZ,orbit,pitch,tipRecord);
        if(!tip.visible)continue;
        const size=Math.min(isMobile?80:118,cluster.width*q.pers);
        ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.atan2(tip.y-q.y,tip.x-q.x));
        ctx.globalAlpha=alpha*q.depthAlpha*(dark?.86:.68)*galaxyDepthWeight(q.dist,camZ);
        ctx.drawImage(tile,-size/2,-size/2,size,size);ctx.restore();
      }
    }
    function drawGalaxyRibbon(record,opacity) {
      const {q,tile,rotation,width,thickness}=record;
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(rotation);ctx.globalAlpha=opacity;
      ctx.drawImage(tile,-width/2,-thickness/2,width,thickness);ctx.restore();
    }
    function drawGalacticMaterial(unit,camZ,orbit,pitch,alpha,time,flowTime,core) {
      const dark=currentTheme==='dark',spectrum=galaxySpectrum[currentTheme];
      prepareGalaxyMaterial(currentTheme);
      // Keep the full cached material at the normal 1.1x view as well as close
      // approaches; only zoomed-out views need the lower-resolution atlas.
      const tiles=camZ<=GALAXY_DEFAULT_DISTANCE+.18?galaxyMaterial[currentTheme]:galaxyMaterialOverview[currentTheme];
      // The surrounding sky now lives in world coordinates. The old flat atlas
      // remains cached only for the reading-area continuation below the scene.
      // Quiet nebula sits behind the main stellar material so it cannot veil
      // the galaxy's stars, dust seams, section labels or hover highlights.
      const scatterTiles=scatteredNebulaMaterial[currentTheme];
      for(const record of scatterDrawRecords) {
        const {cloud}=record;
        const tile=scatterTiles[cloud.variant];if(!tile)continue;
        const q=project3D(cloud.x,cloud.y,cloud.z,unit,camZ,orbit,pitch,record.q);
        if(!q.visible||q.x< -260||q.x>rw+260||q.y< -220||q.y>rh+220)continue;
        const tip=project3D(cloud.x+Math.cos(cloud.angle)*.10,cloud.y+Math.sin(cloud.angle)*.10,
          cloud.z,unit,camZ,orbit,pitch,record.tip);
        const rotation=tip.visible?Math.atan2(tip.y-q.y,tip.x-q.x):cloud.angle;
        const width=Math.min(isMobile?230:410,cloud.width*q.pers);
        const height=Math.min(isMobile?180:290,cloud.thickness*q.pers);
        ctx.save();ctx.translate(q.x,q.y);ctx.rotate(rotation);
        ctx.globalAlpha=alpha*q.depthAlpha*cloud.opacity*(dark?1:.80)*galaxyDepthWeight(q.dist,camZ,true);
        ctx.drawImage(tile,-width/2,-height/2,width,height);ctx.restore();
      }
      // Sort the handful of cloud ribbons, rather than thousands of grains.
      const clouds=visibleRibbonRecords;clouds.length=0;
      for(const record of ribbonDrawRecords) {
        const {cloud}=record;
        const q=project3D(cloud.x,cloud.y,cloud.z,unit,camZ,orbit,pitch,record.q);
        if(!q.visible||q.x< -250||q.x>rw+250||q.y< -250||q.y>rh+250)continue;
        clouds.push(record);
      }
      clouds.sort((a,b)=>b.q.dist-a.q.dist);
      const foreground=foregroundRibbonRecords;foreground.length=0;
      const pitchThickness=.58+Math.abs(Math.sin(pitch))*.42;
      for(const record of clouds) {
        const {cloud,q,tip:tipRecord}=record;
        const tile=tiles[cloud.variant];if(!tile)continue;
        const tip=project3D(cloud.tipX??cloud.x-Math.sin(cloud.angle)*.08,cloud.tipY??cloud.y,
          cloud.tipZ??cloud.z+Math.cos(cloud.angle)*.08,unit,camZ,orbit,pitch,tipRecord);
        if(!tip.visible)continue;
        const width=Math.min(isMobile?210:340,cloud.width*q.pers);
        const thickness=Math.min(isMobile?125:185,cloud.thickness*q.pers)*pitchThickness;
        const opacity=alpha*q.depthAlpha*(dark?.78:.9)*cloud.opacity*galaxyDepthWeight(q.dist,camZ,true);
        record.tile=tile;record.rotation=Math.atan2(tip.y-q.y,tip.x-q.x);
        record.width=width;record.thickness=thickness;
        const gap=camZ-q.dist;
        let near=gap>0?1:0;
        // Only blend a ribbon twice when it crosses the core's depth plane
        // and could cover the sprite. Other ribbons keep their single draw.
        if(Math.abs(gap)<.16) {
          const reach=(width+thickness)*.5;
          if(Math.abs(q.x-core.x)<reach+core.radius*.5&&Math.abs(q.y-core.y)<reach+core.radius*.25)
            near=smoothstep(-.16,.16,gap);
        }
        if(near<1)drawGalaxyRibbon(record,opacity*(1-near));
        if(near>0){record.frontOpacity=opacity*near;foreground.push(record);}
      }
      drawGalaxyLuminousCore(core.x,core.y,core.radius,alpha,pitch);
      for(const record of foreground)drawGalaxyRibbon(record,record.frontOpacity);
      drawGalaxyArmLanes(unit,camZ,orbit,pitch,alpha);
      drawNucleusDust(unit,camZ,orbit,pitch,alpha);
      drawStellarAssociations(unit,camZ,orbit,pitch,alpha,time);
      drawGalaxyArmDetails(unit,camZ,orbit,pitch,alpha,flowTime);
      // Fine, fully spatial dust stays crisp through drag, pitch and fly-through.
      // Four cached index groups batch the spectrum without per-grain effects.
      // The extra spatial grains fade in as the visitor approaches. The overview
      // retains its previous projection budget, while both use the richer atlas.
      const fineDetail=Math.max(0,Math.min(1,(5.6-camZ)/1.6));
      for(let layer=0;layer<2;layer++) {
       const detailAlpha=layer?fineDetail:1;if(detailAlpha<.005)continue;
       const groups=layer?galaxyFineDustGroups:galaxyDustGroups;
       for(let group=0;group<4;group++) {
        ctx.beginPath();ctx.fillStyle=spectrum.stars[group];
        ctx.globalAlpha=alpha*(dark?.88:.78)*detailAlpha;
        const indices=groups[group];
        for(let n=0;n<indices.length;n++) {
          const i=indices[n];
          // The same projection matrix, without allocating an object per grain.
          // project3D above has already refreshed these cached trigonometric terms.
          const j=i*5,x=galacticDust[j],y=galacticDust[j+1],z=galacticDust[j+2];
          const rx=x*cosO+z*sinO,rz1=-x*sinO+z*cosO;
          const ry=y*cosP-rz1*sinP,rz=y*sinP+rz1*cosP;
          const distance=camZ-rz;if(distance<=.42)continue;
          const pers=unit/distance,sx=rw*.5+(rx-galaxyCamera.frameX)*pers,sy=rh*.5-(ry-galaxyCamera.frameY)*pers;
          if(sx<0||sx>rw||sy<0||sy>rh)continue;
          const size=Math.min(1.8,Math.max(.45,galacticDust[j+3]*pers*.006));
          ctx.rect(sx,sy,size,size);
        }
        ctx.fill();
       }
      }
      drawGalaxyZoomDetails(unit,camZ,orbit,pitch,alpha);
      ctx.globalAlpha=alpha;
    }


    // Concentric Orbit Rings
    const GALAXY_RINGS = [1.15, 1.85, 2.55, 3.25];
    const RING_SEGMENTS = isMobile ? 48 : 64;
    const ringGeometries = GALAXY_RINGS.map((r, ri) => {
      const y = (ri - 1.5) * 0.08;
      const pts = new Float32Array((RING_SEGMENTS + 1) * 3);
      for (let s = 0; s <= RING_SEGMENTS; s++) {
        const theta = (s / RING_SEGMENTS) * Math.PI * 2;
        pts[s * 3] = Math.cos(theta) * r;
        pts[s * 3 + 1] = y;
        pts[s * 3 + 2] = Math.sin(theta) * r;
      }
      return pts;
    });

    const ringProjection=ringGeometries.map(()=>Array.from({length:RING_SEGMENTS+1},()=>({})));

    // Luminous motes inhabit the same world volume and camera as the galaxy.
    // Seeded anchors and continuous motion avoid jumps, rebirths and per-frame noise.
    function makeLuminousMote(i) {
      const phase=rnd(i+82103)*Math.PI*2;
      const radius=.28+Math.pow(rnd(i+82109),.64)*3.5;
      const angle=phase+radius*1.35;
      const airborne=i%5<2;
      return {x:Math.cos(angle)*radius,y:(rnd(i+82117)-.5)*(airborne?3.6:.55),
        z:Math.sin(angle)*radius,radius,angle,trail:i%3===0,phase,speed:.65+rnd(i+82123)*.70,
        reach:.20+rnd(i+82129)*.43,depth:.24+rnd(i+82131)*.36,
        size:.75+rnd(i+82139)*.65,colour:i%3,spike:i%13===0};
    }
    const luminousMotes=Array.from({length:isMobile?126:288},(_,i)=>makeLuminousMote(i));
    const extraLightLuminousMotes=Array.from({length:isMobile?63:144},(_,i)=>makeLuminousMote(i+luminousMotes.length));
    const luminousMoteCatalog={dark:luminousMotes,light:luminousMotes.concat(extraLightLuminousMotes)};
    const luminousAssets={light:null,dark:null};
    function galaxyLuminousAssets(theme) {
      if(luminousAssets[theme])return luminousAssets[theme];
      const dark=theme==='dark';
      const colours=dark?['164,202,255','215,188,249','255,218,176']:['40,102,208','39,143,159','244,143,55'];
      const motes=colours.map(rgb=>{
        const tile=document.createElement('canvas');tile.width=tile.height=48;
        const paint=tile.getContext('2d'),halo=paint.createRadialGradient(24,24,0,24,24,24);
        halo.addColorStop(0,`rgba(${rgb},${dark?.85:.65})`);
        halo.addColorStop(.10,`rgba(${rgb},${dark?.52:.32})`);
        halo.addColorStop(.32,`rgba(${rgb},${dark?.14:.07})`);
        halo.addColorStop(1,`rgba(${rgb},0)`);
        paint.fillStyle=halo;paint.fillRect(0,0,48,48);return tile;
      });
      const core=document.createElement('canvas');core.width=core.height=256;
      const paint=core.getContext('2d'),glow=paint.createRadialGradient(128,128,0,128,128,128);
      if(dark) {
        glow.addColorStop(0,'rgba(255,244,215,.88)');
        glow.addColorStop(.12,'rgba(255,223,181,.68)');
        glow.addColorStop(.36,'rgba(219,166,207,.28)');
        glow.addColorStop(.70,'rgba(127,126,213,.07)');
      } else {
        glow.addColorStop(0,'rgba(255,255,243,1)');
        glow.addColorStop(.065,'rgba(255,251,216,1)');
        glow.addColorStop(.15,'rgba(255,225,139,.96)');
        glow.addColorStop(.26,'rgba(255,177,83,.80)');
        glow.addColorStop(.43,'rgba(228,125,64,.53)');
        glow.addColorStop(.59,'rgba(180,81,49,.26)');
        glow.addColorStop(.81,'rgba(206,107,66,.08)');
      }
      glow.addColorStop(1,'rgba(128,149,207,0)');
      paint.fillStyle=glow;paint.fillRect(0,0,256,256);
      luminousAssets[theme]={motes,core};return luminousAssets[theme];
    }
    function luminousMotePosition(mote,time,reduced=galaxyMotion.matches,out={}) {
      const t=reduced?0:time*.00013*mote.speed/(.7+mote.radius*.22);
      const angle=mote.angle+t;
      const radius=mote.radius+Math.sin(t*.6+mote.phase)*mote.reach*.18;
      out.x=Math.cos(angle)*radius;
      out.y=mote.y+Math.sin(t*.79+mote.phase*1.7)*mote.depth;
      out.z=Math.sin(angle)*radius;return out;
    }
    function drawGalaxyLuminousCore(x,y,radius,alpha,pitch) {
      const tile=galaxyLuminousAssets(currentTheme).core;
      // A compact, tilted nucleus preserves the broken seams of the larger cloud.
      const width=radius*.96,height=width*(.25+Math.abs(Math.sin(pitch))*.25);
      ctx.save();ctx.globalAlpha=alpha*(currentTheme==='dark'?.78:.74);
      ctx.drawImage(tile,x-width/2,y-height/2,width,height);ctx.restore();
    }
    const motePositionScratch={},moteProjectionScratch={},motePreviousScratch={},moteTailScratch={};
    function drawLuminousMotes(unit,camZ,orbit,pitch,alpha,time) {
      const dark=currentTheme==='dark',assets=galaxyLuminousAssets(currentTheme);
      const spectrum=galaxySpectrum[currentTheme];
      ctx.save();
      for(const mote of luminousMoteCatalog[currentTheme]) {
        const tint=spectrum.stars[dark?mote.colour:[0,1,3][mote.colour]];
        const p=luminousMotePosition(mote,time,galaxyMotion.matches,motePositionScratch),q=project3D(p.x,p.y,p.z,unit,camZ,orbit,pitch,moteProjectionScratch);
        if(!q.visible||q.x<-14||q.x>rw+14||q.y<-14||q.y>rh+14)continue;
        const pulse=galaxyMotion.matches?1:.90+Math.sin(time*.00065+mote.phase)*.10;
        const size=Math.max(.8,Math.min(2.2,mote.size*q.pers*.0065));
        if(mote.trail&&!galaxyMotion.matches) {
          const previous=luminousMotePosition(mote,time-190,galaxyMotion.matches,motePreviousScratch);
          const tail=project3D(previous.x,previous.y,previous.z,unit,camZ,orbit,pitch,moteTailScratch);
          if(tail.visible&&Math.hypot(q.x-tail.x,q.y-tail.y)>.6) {
            ctx.globalAlpha=alpha*q.depthAlpha*(dark?.26:.22);
            ctx.strokeStyle=tint;ctx.lineWidth=size*.55;
            ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(q.x,q.y);ctx.stroke();
          }
        }
        const glow=size*12;
        ctx.globalAlpha=alpha*q.depthAlpha*pulse*(dark?.76:.80);
        ctx.drawImage(assets.motes[mote.colour],q.x-glow/2,q.y-glow/2,glow,glow);
        ctx.globalAlpha=Math.min(1,alpha*q.depthAlpha*pulse*(dark?1.2:1.08));
        ctx.fillStyle=dark?spectrum.bright:tint;
        ctx.beginPath();ctx.arc(q.x,q.y,size*.72,0,Math.PI*2);ctx.fill();
        if(!dark&&mote.spike) {ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(q.x-size*.12,q.y-size*.12,size*.33,0,Math.PI*2);ctx.fill();}
        if(mote.spike) {
          ctx.globalAlpha=alpha*q.depthAlpha*pulse*(dark?.52:.46);
          ctx.strokeStyle=dark?spectrum.bright:tint;ctx.lineWidth=.55;
          ctx.beginPath();ctx.moveTo(q.x-size*3,q.y);ctx.lineTo(q.x+size*3,q.y);
          ctx.moveTo(q.x,q.y-size*2);ctx.lineTo(q.x,q.y+size*2);ctx.stroke();
        }
      }ctx.restore();
    }

    // The central About portal is the focus of the fly-through.
    const sectionPortals = [
      { x:  0.00, y:  0.00, z:  1.35, mobile:[0,0,1.35], label:"ABOUT", href:"#about" },
      { x:  2.70, y:  0.65, z: -0.70, mobile:[1.9,.35,-.3], label:"BACKGROUND", href:"#education" },
      { x:  1.75, y: -1.30, z: -1.00, mobile:[1.1,-1,-1.2], label:"SKILLS", href:"#skills" },
      { x: -1.80, y: -1.20, z: -0.80, mobile:[-1.1,-1,-1.2], label:"PROJECTS", href:"#projects" },
      { x: -2.90, y:  1.35, z: -0.40, mobile:[-1.9,.35,-.3], label:"CONTACT", href:"#contact" },
      { x: -0.15, y:  1.65, z: -1.10, mobile:[0,1.30,-1.05], label:"EXPERIENCE", href:"#experience" },
      { x:  2.10, y: -0.55, z:  1.50, mobile:[0,2.55,.65], label:"SIDE QUESTS", href:"#side-quests", page:true },
      { x:-2.1,y:.95,z:1.75,mobile:[-1.25,-2.2,1.2],label:"BLOG",href:"#blog",page:true }
    ];
    function portalWorldPosition(portal) {
      return isMobile ? {x:portal.mobile[0],y:portal.mobile[1],z:portal.mobile[2]} : portal;
    }

    // A broad, sparse 3D scaffold gives the dense galaxy a navigable scale.
    const galaxyScaffold=Array.from({length:isMobile?72:150},(_,i)=>({
      x:(rnd(i*7+20101)-.5)*7.8,y:(rnd(i*7+20102)-.5)*3.8,
      z:(rnd(i*7+20103)-.5)*3.6,size:.65+rnd(i+21011)*1.1
    }));
    const scaffoldLinks=[];
    const scaffoldLinkKeys=new Set();
    galaxyScaffold.forEach((point,i)=>{
      const neighbours=galaxyScaffold.map((other,j)=>({j,d:(point.x-other.x)**2+(point.y-other.y)**2+(point.z-other.z)**2}))
        .filter(other=>other.j!==i&&other.d<3.3).sort((a,b)=>a.d-b.d).slice(0,3);
      for(const {j} of neighbours) {
        const key=Math.min(i,j)+':'+Math.max(i,j);
        if(!scaffoldLinkKeys.has(key)){scaffoldLinkKeys.add(key);scaffoldLinks.push([i,j]);}
      }
    });
    const scaffoldProjection=galaxyScaffold.map(()=>({}));
    // Keep the complete spatial topology for section hover and shower paths,
    // while drawing fewer background threads in the resting galaxy.
    const ambientScaffoldLinks=scaffoldLinks.filter(([a,b])=>rnd(a*151+b+129007)>.55);
    function drawGalaxyScaffold(unit,camZ,orbit,pitch,alpha) {
      const points=scaffoldProjection;
      for(let i=0;i<galaxyScaffold.length;i++){const p=galaxyScaffold[i];project3D(p.x,p.y,p.z,unit,camZ,orbit,pitch,points[i]);}
      ctx.strokeStyle=themePalette[currentTheme].constellationLine;
      ctx.lineWidth=isMobile?.6:.7;
      const resting=currentTheme==='dark'?.42:.38;
      // One ambient path and one ownership group per section.
      for(let group=-1;group<sectionPortals.length;group++) {
        ctx.globalAlpha=alpha*resting*(group<0?1-constellationFocus*.22:sectionGlow[group]*.32);
        if(ctx.globalAlpha<.001)continue;
        ctx.beginPath();
        for(const [a,b] of group<0?ambientScaffoldLinks:scaffoldLinks) {
          if(group>=0&&scaffoldOwners[a]!==group&&scaffoldOwners[b]!==group)continue;
          const p=points[a],q=points[b];
          if(!p.visible||!q.visible||p.dist<.7||q.dist<.7)continue;
          ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
        }
        ctx.stroke();
      }
      ctx.fillStyle=themePalette[currentTheme].starDustAlt;
      for(let i=0;i<points.length;i++) {
        const q=points[i];
        if(!q.visible||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
        ctx.globalAlpha=alpha*q.depthAlpha*.68*(1-constellationFocus*.20+sectionGlow[scaffoldOwners[i]]*.25);
        const radius=Math.min(2.4,galaxyScaffold[i].size*(.65+q.pers*.002));
        ctx.beginPath();ctx.arc(q.x,q.y,radius,0,Math.PI*2);ctx.fill();
      }
    }

    // Each section borrows stars from the same spatial field. No local badge
    // outline: uneven branches overlap the larger web and share its scale.
    const scaffoldOwners=galaxyScaffold.map(star=>{
      let owner=0,best=Infinity;
      sectionPortals.forEach((portal,i)=>{
        const p=portalWorldPosition(portal);
        const d=(star.x-p.x)**2+(star.y-p.y)**2+(star.z-p.z)**2;
        if(d<best){best=d;owner=i;}
      });return owner;
    });
    const discoveryShapes={
      pair:[[-.11,-.018,-.03],[.115,.037,.044]],
      trio:[[-.12,-.045,.035],[.02,.049,-.022],[.145,-.015,.065]],
      fork:[[-.21,-.05,.035],[-.018,.012,0],[.19,.115,-.065],[.155,-.077,.12]]
    };
    const discoveryProfiles=[
      {shape:'pair',variant:0,tint:3,halo:2,turn:.63},
      {shape:'fork',variant:4,tint:0,halo:0,turn:.98},
      {shape:'fork',variant:3,tint:1,halo:1,turn:1.96},
      {shape:'pair',variant:2,tint:2,halo:1,turn:2.78},
      {shape:'pair',variant:5,tint:1,halo:0,turn:1.41},
      {shape:'trio',variant:1,tint:3,halo:2,turn:2.30},
      {shape:'fork',variant:2,tint:2,halo:1,turn:3.36},
      {shape:'pair',variant:1,tint:0,halo:0,turn:.35}
    ];
    function buildConstellationDiscovery(points,distances,span,index) {
      const profile=discoveryProfiles[index];
      let node=0,score=Infinity;
      const goal=Math.min(1.14,span*(.40+index%3*.07));
      for(let i=1;i<points.length;i++) {
        const difference=Math.abs(distances[i]-goal);
        if(difference<score){score=difference;node=i;}
      }
      const [x,y,z]=points[node];
      const angle=Math.atan2(z,x)+profile.turn,cos=Math.cos(angle),sin=Math.sin(angle);
      const offsets=discoveryShapes[profile.shape].map(([u,v,w])=>[
        x+u*cos-w*sin,y+v+.055,z+u*sin+w*cos
      ]);
      return {profile,node,offsets,arrival:distances[node]/span*680,projection:offsets.map(()=>({}))};
    }
    const sectionConstellations=sectionPortals.map((portal,index)=>{
      const anchor=portalWorldPosition(portal);
      const stars=galaxyScaffold.map((p,i)=>({p,i,d:(p.x-anchor.x)**2+(p.y-anchor.y)**2+(p.z-anchor.z)**2}))
        .filter(s=>scaffoldOwners[s.i]===index).sort((a,b)=>a.d-b.d).slice(0,isMobile?9:17);
      const points=[[0,0,0],...stars.map(({p})=>[p.x-anchor.x,p.y-anchor.y,p.z-anchor.z])];
      const edges=[],keys=new Set();
      const add=(a,b)=>{const key=Math.min(a,b)+':'+Math.max(a,b);if(!keys.has(key)){keys.add(key);edges.push([a,b]);}};
      // A growing tree produces long forks and asymmetric triangles rather
      // than a closed perimeter. Topology is prepared once, never per frame.
      for(let i=1;i<points.length;i++) {
        let near=0,best=Infinity;
        for(let j=0;j<i;j++) {
          const d=points[i].reduce((n,v,k)=>n+(v-points[j][k])**2,0);
          if(d<best){best=d;near=j;}
        }add(near,i);
      }
      for(let i=2;i<Math.min(points.length,8);i+=2)add(0,i);
      for(const [a,b] of scaffoldLinks) {
        const pa=stars.findIndex(s=>s.i===a)+1,pb=stars.findIndex(s=>s.i===b)+1;
        if(pa&&pb&&rnd(a+b+44001)>.58)add(pa,pb);
      }
      const signalDistance=points.map(()=>Infinity);signalDistance[0]=0;
      // Propagation follows the prepared graph, including its forks. Distances
      // are in world space, so orbiting never changes the branch arrival order.
      for(let pass=0;pass<points.length;pass++)for(const [a,b] of edges) {
        const length=Math.hypot(...points[a].map((value,k)=>value-points[b][k]));
        signalDistance[b]=Math.min(signalDistance[b],signalDistance[a]+length);
        signalDistance[a]=Math.min(signalDistance[a],signalDistance[b]+length);
      }
      const signalSpan=Math.max(1,...signalDistance);
      const discovery=buildConstellationDiscovery(points,signalDistance,signalSpan,index);
      return {points,edges,signalDistance,signalSpan,projection:points.map(()=>({})),discovery};
    });
    const sectionConnections=[[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1],[1,5],[5,2],[5,3],[0,6],[2,6],[3,6]];
    const sectionGlow=new Float32Array(sectionPortals.length);
    const sectionAttentionAge=sectionPortals.map(()=>2200);
    let sectionAttentionIndex=-1;
    let constellationFocus=0;
    const constellationHalos={light:null,dark:null};
    const renderedConstellations=[];
    function constellationHalo() {
      if(constellationHalos[currentTheme])return constellationHalos[currentTheme];
      const tile=document.createElement('canvas');tile.width=tile.height=64;
      const paint=tile.getContext('2d'),dark=currentTheme==='dark';
      const rgb=dark?'74,222,128':'37,99,235';
      const glow=paint.createRadialGradient(32,32,0,32,32,32);
      glow.addColorStop(0,`rgba(${rgb},${dark?.75:.55})`);
      glow.addColorStop(.16,`rgba(${rgb},${dark?.32:.20})`);
      glow.addColorStop(.50,`rgba(${rgb},${dark?.065:.04})`);
      glow.addColorStop(1,`rgba(${rgb},0)`);
      paint.fillStyle=glow;paint.fillRect(0,0,64,64);
      constellationHalos[currentTheme]=tile;return tile;
    }
    let exploredOrbit=false,exploredZoom=false,viewCandidate='',viewSince=0;
    function settledViewNote(pitch,time){
      const settled=!isDragging&&Math.abs(dragVelX)+Math.abs(dragVelY)<.0015&&Math.abs(galaxyCamera.distance-galaxyCamera.targetDistance)<.035;
      const key=settled&&exploredZoom&&galaxyCamera.distance<GALAXY_DEFAULT_DISTANCE-.25?'core':
        settled&&exploredOrbit&&Math.abs(Math.sin(pitch))<.23?'edge':'';
      if(key!==viewCandidate){viewCandidate=key;viewSince=time;}
      return key&&time-viewSince>550?key:'overview';
    }
    function updateConstellationHover(dt,pitch,time) {
      const hovered=sectionPortals.findIndex(portal=>hoveredTarget?.label===portal.label);
      const selected=sectionPortals.findIndex(portal=>galaxyCamera.selected===portal.href);
      const focused=portalChips.indexOf(document.activeElement);
      const active=focused>=0&&document.activeElement.matches(':focus-visible')?focused:hovered>=0?hovered:selected;
      if(active!==sectionAttentionIndex){if(active>=0)sectionAttentionAge[active]=0;sectionAttentionIndex=active;}
      for(let i=0;i<sectionAttentionAge.length;i++)sectionAttentionAge[i]=Math.min(2400,sectionAttentionAge[i]+Math.max(0,Math.min(40,dt)));
      if(active<0||active===selected||sectionAttentionAge[active]>=100)showGalaxyFieldNote(sectionPortals[active]?.href||settledViewNote(pitch,time));
      const ease=galaxyMotion.matches?1:1-Math.exp(-dt/110);
      for(let i=0;i<sectionPortals.length;i++) {
        const target=hoveredTarget?.label===sectionPortals[i].label||galaxyCamera.selected===sectionPortals[i].href?1:0;
        sectionGlow[i]+=(target-sectionGlow[i])*ease;
      }
      constellationFocus=Math.max(...sectionGlow);
    }
    // Open chains drawn between existing stars extend beyond the local hubs.
    const scatteredConstellations=Array.from({length:isMobile?2:3},(_,i)=>{
      let current=Math.floor(rnd(i+31103)*galaxyScaffold.length);
      const ids=[current],edges=[];
      for(let j=0;j<4;j++) {
        const p=galaxyScaffold[current];
        const candidates=galaxyScaffold.map((q,k)=>({k,d:(p.x-q.x)**2+(p.y-q.y)**2+(p.z-q.z)**2}))
          .filter(s=>!ids.includes(s.k)&&s.d>1.3&&s.d<5.5).sort((a,b)=>a.d-b.d);
        if(!candidates.length)break;
        current=candidates[Math.min(candidates.length-1,Math.floor(rnd(i*31+j+33001)*5))].k;
        edges.push([ids.length-1,ids.length]);ids.push(current);
      }
      return {points:ids.map(k=>galaxyScaffold[k]),edges,projection:ids.map(()=>({}))};
    });
    function drawScatteredConstellations(unit,camZ,orbit,pitch,alpha) {
      const palette=themePalette[currentTheme];
      ctx.save();ctx.lineWidth=.55;ctx.strokeStyle=palette.constellationLine;
      for(const group of scatteredConstellations) {
        const points=group.projection;for(let i=0;i<group.points.length;i++){const p=group.points[i];project3D(p.x,p.y,p.z,unit,camZ,orbit,pitch,points[i]);}
        ctx.globalAlpha=alpha*.40;ctx.beginPath();
        for(const [a,b] of group.edges) {
          const p=points[a],q=points[b];
          if(!p.visible||!q.visible||p.dist<.7||q.dist<.7)continue;
          ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
        }
        ctx.stroke();ctx.fillStyle=palette.starDustAlt;
        for(let j=0;j<points.length;j++) {
          const q=points[j];if(!q.visible||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
          ctx.globalAlpha=alpha*q.depthAlpha*(j%3===0?.85:.52);
          ctx.beginPath();ctx.arc(q.x,q.y,j%3===0?1.25:.8,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.restore();
    }
    // Inter-section paths bend at real stars, avoiding a rigid polygon.
    const sectionBridges=sectionConnections.map(([a,b],i)=>{
      const p=portalWorldPosition(sectionPortals[a]),q=portalWorldPosition(sectionPortals[b]);
      const t=.38+rnd(i+45101)*.24;
      const x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t,z=p.z+(q.z-p.z)*t;
      return galaxyScaffold.reduce((best,s)=>{
        const d=(s.x-x)**2+(s.y-y)**2+(s.z-z)**2;
        return d<best.d?{p:s,d}:best;
      },{p:galaxyScaffold[0],d:Infinity}).p;
    });
    function drawSectionConnections(coords,alpha,time,unit,camZ,orbit,pitch) {
      const palette=themePalette[currentTheme];ctx.save();
      sectionConnections.forEach(([a,b],i)=>{
        const p=coords[a],q=coords[b],star=sectionBridges[i];
        const m=project3D(star.x,star.y,star.z,unit,camZ,orbit,pitch);
        if(!p.visible||!q.visible||!m.visible||Math.min(p.dist,q.dist,m.dist)<.7)return;
        const strength=Math.max(sectionGlow[a],sectionGlow[b]);
        ctx.strokeStyle=palette.constellationLine;
        ctx.globalAlpha=alpha*.53*(1-constellationFocus*.20);ctx.lineWidth=.55;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(m.x,m.y);ctx.lineTo(q.x,q.y);ctx.stroke();
        if(strength>.001){ctx.strokeStyle=palette.portalRingHover;ctx.globalAlpha=alpha*strength*.32;ctx.lineWidth=.55+strength*.2;ctx.stroke();}
        if(strength>.01) {
          const owner=sectionAttentionIndex===a||sectionAttentionIndex===b?sectionAttentionIndex:sectionGlow[a]>=sectionGlow[b]?a:b;
          const travel=galaxyMotion.matches?.43:(sectionAttentionAge[owner]-360)/1120;
          if(travel<0||travel>1)return;
          const t=owner===a?travel:1-travel;
          const u=t<.5?t*2:(t-.5)*2,from=t<.5?p:m,to=t<.5?m:q;
          const x=from.x+(to.x-from.x)*u,y=from.y+(to.y-from.y)*u;
          ctx.globalAlpha=alpha*strength*.45;ctx.drawImage(constellationHalo(),x-7,y-7,14,14);
          ctx.fillStyle=palette.portalCoreHover;ctx.beginPath();ctx.arc(x,y,.85,0,Math.PI*2);ctx.fill();
        }
      });ctx.restore();
    }
    function drawConstellationDiscovery(pattern,anchor,age,unit,camZ,orbit,pitch,alpha) {
      const detail=pattern.discovery,profile=detail.profile;
      const reduced=galaxyMotion.matches,elapsed=age-detail.arrival;
      const envelope=reduced?.62:smoothstep(0,300,elapsed)*(1-smoothstep(720,1430,elapsed));
      const intensity=alpha*envelope;
      const center=pattern.projection[detail.node];
      if(intensity<.008||!center.visible||center.dist<.72||center.x< -100||center.x>rw+100||center.y< -100||center.y>rh+100)return;
      const spectrum=galaxySpectrum[currentTheme],dark=currentTheme==='dark';
      const tile=stellarAssociationMaterial[currentTheme][profile.variant];
      const size=Math.min(isMobile?66:94,center.pers*.37);
      const points=detail.projection;
      for(let i=0;i<detail.offsets.length;i++) {
        const [x,y,z]=detail.offsets[i];
        project3D(anchor.x+x,anchor.y+y,anchor.z+z,unit,camZ,orbit,pitch,points[i]);
      }
      ctx.save();
      if(tile) {
        ctx.globalAlpha=intensity*center.depthAlpha*(dark?.66:.58);
        ctx.drawImage(tile,center.x-size/2,center.y-size*.35,size,size*.7);
      }
      if(profile.shape==='fork'&&points.every(q=>q.visible&&q.dist>.72)) {
        const [stem,joint,upper,lower]=points;
        ctx.strokeStyle=spectrum.stars[profile.tint];ctx.lineWidth=.86;ctx.lineCap='round';
        ctx.globalAlpha=intensity*.76;ctx.beginPath();
        ctx.moveTo(stem.x,stem.y);
        ctx.quadraticCurveTo((stem.x+joint.x)*.5,(stem.y+joint.y)*.5-3,joint.x,joint.y);
        ctx.quadraticCurveTo((upper.x+joint.x)*.5,joint.y,upper.x,upper.y);
        ctx.moveTo(joint.x,joint.y);
        ctx.quadraticCurveTo(joint.x+(lower.x-stem.x)*.35,joint.y,lower.x,lower.y);
        ctx.stroke();
      }
      const glow=galaxyLuminousAssets(currentTheme).motes[profile.halo];
      for(let i=0;i<points.length;i++) {
        const q=points[i];if(!q.visible||q.dist<.72)continue;
        const rise=reduced?1:smoothstep(i*74,i*74+265,elapsed);
        if(rise<.006)continue;
        const light=intensity*rise*q.depthAlpha,halo=Math.min(24,10+q.pers*.047);
        ctx.globalAlpha=light*.84;ctx.drawImage(glow,q.x-halo/2,q.y-halo/2,halo,halo);
        ctx.fillStyle=dark?spectrum.bright:spectrum.stars[profile.tint];
        ctx.globalAlpha=light;ctx.beginPath();ctx.arc(q.x,q.y,i===0?1.95:1.38,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
    function drawSectionConstellation(index,unit,camZ,orbit,pitch,alpha) {
      const anchor=portalWorldPosition(sectionPortals[index]),pattern=sectionConstellations[index];
      const strength=sectionGlow[index],palette=themePalette[currentTheme];
      const points=pattern.projection;
      for(let i=0;i<pattern.points.length;i++){const [x,y,z]=pattern.points[i];project3D(anchor.x+x,anchor.y+y,anchor.z+z,unit,camZ,orbit,pitch,points[i]);}
      renderedConstellations.push({index,points,edges:pattern.edges,signalDistance:pattern.signalDistance,signalSpan:pattern.signalSpan});
      if(strength>.012)drawConstellationDiscovery(pattern,anchor,sectionAttentionAge[index],unit,camZ,orbit,pitch,alpha*strength);
      ctx.save();ctx.strokeStyle=palette.constellationLine;
      ctx.globalAlpha=alpha*.68*(1-constellationFocus*.20);ctx.lineWidth=.6;ctx.beginPath();
      for(const [a,b] of pattern.edges) {
        const p=points[a],q=points[b];
        if(!p.visible||!q.visible||Math.min(p.dist,q.dist)<.7)continue;
        ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
      }ctx.stroke();
      if(strength>.001){
        const age=sectionAttentionAge[index];
        ctx.strokeStyle=palette.portalRingHover;ctx.lineWidth=.6+strength*.25;
        for(const [a,b] of pattern.edges) {
          const p=points[a],q=points[b];if(!p.visible||!q.visible||Math.min(p.dist,q.dist)<.7)continue;
          const da=pattern.signalDistance[a],db=pattern.signalDistance[b];
          const start=Math.min(da,db)/pattern.signalSpan*680;
          const lit=galaxyMotion.matches?1:SceneResponse.ease((age-start)/300);
          ctx.globalAlpha=alpha*strength*.48*lit;
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
          if(galaxyMotion.matches)continue;
          const u=(age-start)/480;if(u<=0||u>=1)continue;
          const from=da<=db?p:q,to=da<=db?q:p,x=from.x+(to.x-from.x)*u,y=from.y+(to.y-from.y)*u;
          ctx.globalAlpha=alpha*strength*Math.sin(Math.PI*u)*.9;
          ctx.fillStyle=palette.portalCoreHover;ctx.beginPath();ctx.arc(x,y,1.25,0,Math.PI*2);ctx.fill();
        }
      }
      for(let i=1;i<points.length;i++) {
        const q=points[i];if(!q.visible||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
        const arrived=galaxyMotion.matches?1:SceneResponse.ease((sectionAttentionAge[index]-pattern.signalDistance[i]/pattern.signalSpan*680)/300);
        if(strength>.01){const size=14+strength*6;ctx.globalAlpha=alpha*strength*.7*arrived;ctx.drawImage(constellationHalo(),q.x-size/2,q.y-size/2,size,size);}
        ctx.globalAlpha=alpha*q.depthAlpha*(.55+strength*.4);
        ctx.fillStyle=strength>.5?palette.portalCoreHover:palette.starDustAlt;
        ctx.beginPath();ctx.arc(q.x,q.y,(i%4===0?1.3:.85)+strength*.3,0,Math.PI*2);ctx.fill();
      }ctx.restore();
    }

    // Camera distance alone controls scale; hover never pretends a card is nearer.
    function galaxyCardDepthScale(distance,mobile,reduced) {
      if(reduced||!Number.isFinite(distance))return 1;
      const low=mobile?.96:.92,high=mobile?1.06:1.10;
      return Math.max(low,Math.min(high,1+(5.6-distance)*(mobile?.025:.045)));
    }

    // Projected anchors may leave the viewport; their cards stay docked inside the usable sky.
    function galaxyCardCanShow(point,opacity) {
      return opacity>=.02&&point.visible&&Number.isFinite(point.x)&&Number.isFinite(point.y);
    }

    const renderedPortals = [];
    const portalLabelMetrics=Array.from({length:sectionPortals.length},()=>({mobile:null,width:0,height:0,x:NaN,y:NaN,box:null,edge:null}));
    const portalLayer = document.getElementById('portal-layer');
    const portalChips = sectionPortals.map((portal, index) => {
      const link = document.createElement('a');
      const arrow = document.createElement('span');
      link.className = 'portal-chip';
      link.href = portal.href;
      const previewId=fieldNotes.get(portal.href)?.querySelector('p')?.getAttribute('id');
      if(previewId)link.setAttribute('aria-describedby',previewId);
      if(portal.page){link.setAttribute('aria-label',`Open ${portal.label} journey`);link.setAttribute('data-standalone-page',portal.href.slice(1));}
      link.draggable = false;
      link.dataset.primary = index === 0 ? 'true' : 'false';
      link.textContent = portal.label;
      arrow.className = 'portal-arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      link.appendChild(arrow);
      link.hidden = true;
      link.addEventListener('click',event=>{
        if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        // Page cards retain the browser's trusted anchor activation. A previous
        // canvas click must never suppress a new page tap or keyboard activation.
        if(portal.page){
          const dragged=galaxyPagePress?.dragged&&event.detail!==0;
          if(dragged||window.openSideQuestsPage)event.preventDefault();
          if(!dragged)window.openSideQuestsPage?.({route:portal.href});
          galaxyPagePress=null;suppressGalaxyClick=false;return;
        }
        if(suppressGalaxyClick&&event.detail!==0){event.preventDefault();suppressGalaxyClick=false;return;}
        event.preventDefault();
        suppressGalaxyClick=false;activateGalaxyPortal(portal,true,event.detail!==0);
      });
      link.addEventListener('pointerenter', () => hoveredTarget = { label: portal.label });
      link.addEventListener('pointerleave', () => hoveredTarget = null);
      link.addEventListener('focus', () => hoveredTarget = {label:portal.label});
      link.addEventListener('blur', () => {if(hoveredTarget?.label===portal.label)hoveredTarget=null;});
      portalLayer.appendChild(link);
      return link;
    });

    // One small projected cube opens into a radial map. Its lines retract
    // into the same core before the existing galaxy is revealed on scroll.
    function drawQualities(time) {
      qualitiesCtx.clearRect(0, 0, rw, rh);
      const cx = rw * .5, cy = rh * .5;
      const dark = currentTheme === 'dark';
      const accent = dark ? '114,233,154' : '27,82,153';
      const unfold = smoothstep(.17, .31, smoothProgress);
      const scrollExit = smoothstep(.49, .67, smoothProgress);
      const clickExit = qualitiesBurstStart ? smoothstep(0, 1, (time - qualitiesBurstStart) / 1850) : 0;
      const exit = Math.max(scrollExit, clickExit);
      const visible = (1 - exit) * Math.min(1, .42 + unfold * .58);
      const anchors = isMobile
        ? [[.17,.31],[.32,.23],[.71,.24],[.84,.34],[.73,.66],[.22,.66]]
        : [[.15,.40],[.29,.24],[.72,.23],[.85,.39],[.73,.70],[.25,.70]];
      const yaw = qualitiesYaw + Math.sin(time * .00031) * .11;
      const pitch = qualitiesPitch + Math.cos(time * .00028) * .07;
      const perspective = ({x,y,z}) => {
        const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
        const rz = z * Math.cos(yaw) - x * Math.sin(yaw);
        const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
        const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
        const size = (isMobile ? 13 : 16) / (1 - depth * .018);
        return {x:cx + rx * size, y:cy - ry * size};
      };
      qualitiesCtx.save();
      qualitiesCtx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const angle = i * 2.39996 + .27;
        const distance = Math.min(rw, rh) * (.19 + (i % 4) * .045) * unfold * (1 - exit);
        qualitiesCtx.beginPath();
        qualitiesCtx.moveTo(cx, cy);
        qualitiesCtx.lineTo(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance);
        qualitiesCtx.strokeStyle = `rgba(${accent},${visible * .075})`;
        qualitiesCtx.stroke();
      }
      anchors.forEach(([ax,ay], index) => {
        const button = qualitiesButtons[index];
        const halfWidth = Math.max(36, (qualityWidths[index] || 84) / 2);
        const x = Math.max(halfWidth + 12, Math.min(rw - halfWidth - 12, rw * ax));
        const y = Math.max(isMobile ? 174 : 148, Math.min(rh - (isMobile ? 156 : 133), rh * ay));
        const labelGap = isMobile ? 16 : 25;
        const stop = Math.max(0, 1 - labelGap / Math.hypot(x - cx, y - cy));
        const revealX = cx + (x - cx) * stop * unfold * (1 - exit);
        const revealY = cy + (y - cy) * stop * unfold * (1 - exit);
        const active = qualitiesSelected === index;
        const lineAlpha = (active ? .63 : .28) * visible;
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.style.opacity = (visible * (active ? 1 : .80)).toFixed(3);
        qualitiesCtx.beginPath();
        qualitiesCtx.moveTo(cx,cy);
        qualitiesCtx.lineTo(revealX,revealY);
        qualitiesCtx.strokeStyle = `rgba(${accent},${lineAlpha})`;
        qualitiesCtx.stroke();
        const dotRadius = active ? 3.2 : 2.1;
        qualitiesCtx.beginPath();
        qualitiesCtx.arc(revealX,revealY,dotRadius,0,Math.PI*2);
        qualitiesCtx.fillStyle = `rgba(${accent},${Math.min(1,visible * (active ? 1 : .65))})`;
        qualitiesCtx.fill();
        for (let mote = 1; mote <= 3; mote++) {
          const t = ((mote * .247 + time * .000018 * (index % 2 ? -1 : 1)) % 1 + 1) % 1;
          qualitiesCtx.beginPath();
          qualitiesCtx.arc(cx + (revealX - cx) * t, cy + (revealY - cy) * t, mote === 2 ? 1.4 : .8, 0, Math.PI * 2);
          qualitiesCtx.fillStyle = `rgba(${accent},${visible * .29})`;
          qualitiesCtx.fill();
        }
      });
      for (let i = 0; i < 38; i++) {
        const angle = i * 2.39996;
        const radius = 28 + Math.sqrt(i) * 13;
        const drift = (time * .000022 * (i % 3 + 1)) % 1;
        const spread = (1 - exit) * (.5 + .5 * unfold) + exit * (1 + drift * 2);
        qualitiesCtx.beginPath();
        qualitiesCtx.arc(cx + Math.cos(angle) * radius * spread, cy + Math.sin(angle) * radius * spread, i % 7 === 0 ? 1.7 : .8, 0, Math.PI * 2);
        qualitiesCtx.fillStyle = `rgba(${accent},${(.13 + exit * .35) * (1 - scrollExit)})`;
        qualitiesCtx.fill();
      }
      const vertices = [
        {x:-1,y:-1,z:-1},{x:1,y:-1,z:-1},{x:1,y:1,z:-1},{x:-1,y:1,z:-1},
        {x:-1,y:-1,z:1},{x:1,y:-1,z:1},{x:1,y:1,z:1},{x:-1,y:1,z:1}
      ].map(perspective);
      const cubeSize = 1 + exit * exit * Math.max(rw,rh) / 44;
      qualitiesCtx.translate(cx,cy);
      qualitiesCtx.scale(cubeSize,cubeSize);
      qualitiesCtx.translate(-cx,-cy);
      qualitiesCtx.lineWidth = Math.max(.06,1 / cubeSize);
      [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b]) => {
        qualitiesCtx.beginPath();
        qualitiesCtx.moveTo(vertices[a].x,vertices[a].y);
        qualitiesCtx.lineTo(vertices[b].x,vertices[b].y);
        qualitiesCtx.strokeStyle = `rgba(${accent},${.42 + exit * .25})`;
        qualitiesCtx.stroke();
      });
      const coreSide = isMobile ? 10 : 12;
      qualitiesCtx.fillStyle = dark ? '#72e99a' : '#1b5299';
      qualitiesCtx.fillRect(cx - coreSide / 2, cy - coreSide / 2, coreSide, coreSide);
      qualitiesCtx.restore();
    }

    let galaxyChromeRects=[],galaxyCardCeiling=Infinity,galaxyCardFloor=64;
    let galaxyChromeScrollY=0,galaxyHeaderEdge=64;
    function measureGalaxyChrome() {
      const origin=canvas.parentElement?.getBoundingClientRect()||{left:0,top:0};
      const navBox=document.querySelector('.nav-pill')?.getBoundingClientRect();
      galaxyHeaderEdge=navBox?.height?navBox.bottom-origin.top+14:64;
      galaxyCardFloor=Math.max(64,galaxyHeaderEdge);
      galaxyChromeScrollY=typeof window==='undefined'?0:(window.scrollY||0);
      const returnBox=document.getElementById('model-return')?.getBoundingClientRect();
      galaxyCardCeiling=returnBox?.height?returnBox.top-origin.top-14:Infinity;
      const selectors=['.nav-pill','#theme-btn','#galaxy-note','#galaxy-zoom-controls','#model-return','#hud-stage-label','#tel-orbit'];
      galaxyChromeRects=selectors.map(selector=> {
        const element=document.querySelector(selector),box=element?.getBoundingClientRect();
        if(!box?.width||!box.height)return null;
        // The note's entrance moves 14px; reserve its whole short travel too.
        const lift=selector==='#galaxy-note'?14:0;
        return {kind:selector,x:box.left-origin.left-8,y:box.top-origin.top-8-lift,width:box.width+16,height:box.height+16+lift};
      }).filter(Boolean);
    }
    // Fixed header bounds move in canvas coordinates as the taller scene scrolls.
    // Other controls belong to the scene and retain their local positions.
    function syncGalaxyScrollChrome(scrollY) {
      const delta=scrollY-galaxyChromeScrollY;if(!Number.isFinite(delta)||!delta)return;
      galaxyChromeScrollY=scrollY;galaxyHeaderEdge+=delta;galaxyCardFloor=Math.max(64,galaxyHeaderEdge);
      galaxyChromeRects.forEach(box=>{if(box.kind==='.nav-pill'||box.kind==='#theme-btn')box.y+=delta;});
    }
    if('ResizeObserver' in window) {
      const chromeObserver=new ResizeObserver(measureGalaxyChrome);
      ['.nav-pill','#theme-btn','#galaxy-note','#galaxy-zoom-controls','#model-return'].forEach(selector=>{
        const element=document.querySelector(selector);if(element)chromeObserver.observe(element);
      });
    }
    document.fonts?.ready.then(()=>{portalLabelMetrics.forEach(metric=>{metric.width=0;});measureGalaxyChrome();});

    function measure() {
      syncGalaxyTheme();
      const stageBounds=canvas.parentElement?.getBoundingClientRect();
      rw = stageBounds?.width || window.innerWidth;
      rh = stageBounds?.height || window.innerHeight;
      isMobile = rw <= 768;
      trackTop = track.offsetTop;
      trackHeight = Math.max(1, track.offsetHeight - rh);

      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const pixelWidth=Math.round(rw*dpr),pixelHeight=Math.round(rh*dpr);
      const resized=canvas.width!==pixelWidth||canvas.height!==pixelHeight;
      if(resized){canvas.width=pixelWidth;canvas.height=pixelHeight;}
      canvas.style.width = rw + 'px';
      canvas.style.height = rh + 'px';
      if(qualitiesCanvas.width!==pixelWidth||qualitiesCanvas.height!==pixelHeight){
        qualitiesCanvas.width=pixelWidth;qualitiesCanvas.height=pixelHeight;
      }
      qualitiesCanvas.style.width = rw + 'px';
      qualitiesCanvas.style.height = rh + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      qualitiesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      qualityWidths = qualitiesButtons.map(button => button.offsetWidth);
      if(resized)portalLabelMetrics.forEach(metric=>{metric.width=0;metric.height=0;metric.x=metric.y=NaN;metric.vx=metric.vy=0;metric.box=null;});
      measureGalaxyChrome();
    }
    measure();

    function enterQualities() {
      window.scrollTo({ top: trackTop + trackHeight * .34, behavior:'smooth' });
    }

    let resizeRafId = null;
    function refreshGalaxyViewport() {
      resizeRafId=null;measure();rawScrollY=window.scrollY;
      const bounds=canvas.getBoundingClientRect();
      isCanvasVisible=bounds.bottom>0&&bounds.top<window.innerHeight;
      if(animationFrameId){cancelAnimationFrame(animationFrameId);animationFrameId=null;}
      lastGalaxyTime=0;
      if(!document.hidden&&isCanvasVisible&&!window.portfolioSideQuestsOpen)loop(performance.now());
    }
    function scheduleGalaxyViewportRefresh() {
      if(resizeRafId)return;
      resizeRafId = requestAnimationFrame(() => {
        refreshGalaxyViewport();
      });
    }
    window.addEventListener('resize',scheduleGalaxyViewportRefresh,{passive:true});
    if('ResizeObserver' in window)new ResizeObserver(scheduleGalaxyViewportRefresh).observe(canvas.parentElement);
    if(typeof MutationObserver==='function')new MutationObserver(scheduleGalaxyViewportRefresh)
      .observe(root,{attributes:true,attributeFilter:['data-theme']});

    window.addEventListener('scroll', () => {
      rawScrollY = window.scrollY;
      syncGalaxyScrollChrome(rawScrollY);
    }, { passive: true });

    function smoothstep(min, max, value) {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    }

    // PURE 3D PERSPECTIVE CAMERA PROJECTION
    let cachedOrbit=NaN,cachedPitch=NaN,cosO=1,sinO=0,cosP=1,sinP=0;
    function setGalaxyProjection(currentOrbit, currentPitch) {
      if (currentOrbit!==cachedOrbit) {cachedOrbit=currentOrbit;cosO=Math.cos(currentOrbit);sinO=Math.sin(currentOrbit);}
      if (currentPitch!==cachedPitch) {cachedPitch=currentPitch;cosP=Math.cos(currentPitch);sinP=Math.sin(currentPitch);}
    }
    function project3D(x, y, z, unit, camZ, currentOrbit, currentPitch, out={}) {
      setGalaxyProjection(currentOrbit,currentPitch);

      // 1. Yaw rotation (orbit)
      const rx = x * cosO + z * sinO;
      const rz1 = -x * sinO + z * cosO;

      // 2. Pitch rotation
      const ry = y * cosP - rz1 * sinP;
      const rz = y * sinP + rz1 * cosP;

      // 3. Real camera perspective distance
      const distFromCam = camZ - rz;

      if (distFromCam <= 0.14) {
        out.x=out.y=out.pers=out.depthAlpha=0;out.visible=false;return out;
      }

      const pers = unit / distFromCam;
      const depthAlpha = Math.min(1, Math.max(0, (distFromCam - 0.14) / 0.35));

      out.x=rw*.5+(rx-galaxyCamera.frameX)*pers;
      out.y=rh*.5-(ry-galaxyCamera.frameY)*pers;
      out.visible=true;out.pers=pers;out.dist=distFromCam;out.depthAlpha=depthAlpha;
      return out;
    }

    function drawDiffractionSpike(x, y, radius, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = isMobile ? 1.4 : 1.3;
      ctx.beginPath();
      ctx.moveTo(x - radius * 2.8, y);
      ctx.lineTo(x + radius * 2.8, y);
      ctx.moveTo(x, y - radius * 1.7);
      ctx.lineTo(x, y + radius * 1.7);
      ctx.stroke();
      ctx.restore();
    }

    function galaxyCardBottomLimit() {
      const measured=typeof galaxyCardCeiling==='number'&&Number.isFinite(galaxyCardCeiling)?galaxyCardCeiling:rh-(isMobile?86:142);
      // Cards belong to the first screen; the lower quarter is atmospheric sky only.
      const viewport=typeof window==='undefined'?rh:Math.min(window.innerHeight||rh,window.visualViewport?.height||rh);
      return Math.min(rh-12,viewport-24,measured);
    }
    function galaxyCardTopLimit() {
      return typeof galaxyCardFloor==='number'&&Number.isFinite(galaxyCardFloor)?Math.max(64,galaxyCardFloor):64;
    }
    // All labels solve against the same projected frame, then follow a critically damped spring.
    // No candidate-slot hopping or frame-order feedback from already moved cards.
    function settleGalaxyCards(targets,occupied,dt,reduced=false) {
      const top=galaxyCardTopLimit(),bottom=galaxyCardBottomLimit();
      const clamp=(p)=>{p.x=Math.max(12,Math.min(rw-p.width-12,p.x));p.y=Math.max(top+p.height/2,Math.min(bottom-p.height/2,p.y));};
      const separation=isMobile?18:26;
      const solved=targets.map(t=>({x:t.x,y:t.y,width:t.width,height:t.height}));solved.forEach(clamp);
      for(let pass=0;pass<5;pass++) {
        for(let i=0;i<solved.length;i++)for(let j=i+1;j<solved.length;j++) {
          const a=solved[i],b=solved[j],sx=(a.width+b.width)/2+separation,sy=(a.height+b.height)/2+separation;
          let dx=(a.x+a.width/2-b.x-b.width/2)/sx,dy=(a.y-b.y)/sy;
          const distance=Math.hypot(dx,dy);if(distance>=1)continue;
          if(distance<.001){dx=i%2?-.7:.7;dy=-.7;}
          const length=Math.max(.001,Math.hypot(dx,dy)),strength=(1-Math.min(1,distance))*.48;
          a.x+=dx/length*sx*strength;b.x-=dx/length*sx*strength;
          a.y+=dy/length*sy*strength;b.y-=dy/length*sy*strength;
        }
        for(const p of solved)for(const box of occupied) {
          if(p.x+p.width+8<=box.x||p.x>=box.x+box.width+8||p.y+p.height/2+8<=box.y||p.y-p.height/2>=box.y+box.height+8)continue;
          // Fixed chrome has a stable escape direction; labels never alternate sides of it.
          if(box.kind==='#galaxy-note')p.y=box.y-p.height/2-8;
          else if(box.kind==='#galaxy-zoom-controls')p.x=box.x-p.width-8;
        }
        solved.forEach(clamp);
      }
      // On narrow phones, retain floating goals inside two legal bands.
      // Assignment follows the projected anchors with hysteresis; the same spring
      // still renders every card. This is only needed by the seven-card page map.
      if(isMobile&&rw<=430&&sectionPortals.some(portal=>portal.page)&&targets.length>6){
        const gap=10,band=(rw-24-gap)/2,n=solved.length,maxRows=Math.ceil(n/2);
        const note=occupied.find(box=>box.kind==='#galaxy-note'),zoom=occupied.find(box=>box.kind==='#galaxy-zoom-controls');
        const safeTop=zoom?Math.max(top,zoom.y+zoom.height+8):top,safeBottom=note?Math.min(bottom,note.y-8):bottom;
        if(safeBottom-safeTop>=Math.max(...solved.map(p=>p.height))*maxRows+gap*(maxRows-1)&&solved.every(p=>p.width<=band)){
          let best=null,bestCost=Infinity;
          for(let mask=0;mask<(1<<n);mask++){
            let left=0,cost=0;const sides=[];
            for(let i=0;i<n;i++){
              const side=(mask>>i)&1;sides.push(side);if(!side)left++;
              const low=12+side*(band+gap),high=low+band-solved[i].width,x=Math.max(low,Math.min(high,targets[i].x));
              cost+=(x-targets[i].x)**2;
              const prior=targets[i].metrics.compactLane;if(prior!==undefined&&prior!==side)cost+=1600;
            }
            if(left>maxRows||n-left>maxRows)continue;
            if(cost<bestCost){bestCost=cost;best=sides;}
          }
          for(let side=0;side<2;side++){
            const rows=solved.map((p,i)=>({p,i})).filter(r=>best[r.i]===side).sort((a,b)=>targets[a.i].y-targets[b.i].y||a.i-b.i);
            let edge=safeTop;
            for(const {p,i} of rows){const low=12+side*(band+gap);p.x=Math.max(low,Math.min(low+band-p.width,targets[i].x));p.y=Math.max(edge+p.height/2,Math.min(safeBottom-p.height/2,targets[i].y));edge=p.y+p.height/2+gap;targets[i].metrics.compactLane=side;}
            edge=safeBottom;for(let j=rows.length-1;j>=0;j--){const p=rows[j].p;p.y=Math.min(p.y,edge-p.height/2);edge=p.y-p.height/2-gap;}
          }
        }
      }
      const seconds=Math.max(0,Math.min(50,dt))/1000,omega=14,decay=Math.exp(-omega*seconds);
      return solved.map((goal,i)=>{
        const memory=targets[i].metrics;
        if(reduced||!Number.isFinite(memory.x)||!Number.isFinite(memory.y)) {
          memory.x=goal.x;memory.y=goal.y;memory.vx=memory.vy=0;
        }else for(const [axis,velocity] of [['x','vx'],['y','vy']]) {
          const error=memory[axis]-goal[axis],v=memory[velocity]||0,j=v+omega*error;
          memory[axis]=goal[axis]+(error+j*seconds)*decay;
          memory[velocity]=(v-omega*j*seconds)*decay;
        }
        const actual={x:memory.x,y:memory.y,width:goal.width,height:goal.height};clamp(actual);
        if(actual.x!==memory.x)memory.vx=0;if(actual.y!==memory.y)memory.vy=0;
        memory.x=actual.x;memory.y=actual.y;return actual;
      });
    }

    function getPortalAtCoords(clientX, clientY, rect=canvas.getBoundingClientRect()) {
      if(chapterJourney)return null;
      const cx=clientX-rect.left,cy=clientY-rect.top;
      // Labels occupy the front layer; branches behind them must not steal clicks.
      for(const p of renderedPortals) {
        const box=p.labelRect;
        if(box&&cx>=box.x&&cx<=box.x+box.width&&cy>=box.y&&cy<=box.y+box.height)return {...p,card:true};
      }
      for(const p of renderedPortals) {
        if(Math.hypot(cx-p.x,cy-p.y)<=Math.max(34,p.r))return p;
      }
      // Resolve the nearest star before any filament, then the nearest filament.
      // Broad overlapping branches remain usable regardless of drawing order.
      let nearest=null,best=11;
      for(const group of renderedConstellations) {
        for(const p of group.points) {
          const d=Math.hypot(cx-p.x,cy-p.y);
          if(p.visible&&d<best){best=d;nearest=sectionPortals[group.index];}
        }
      }
      if(nearest)return nearest;
      best=6;
      for(const group of renderedConstellations) {
        for(const [a,b] of group.edges) {
          const p=group.points[a],q=group.points[b];if(!p.visible||!q.visible)continue;
          const dx=q.x-p.x,dy=q.y-p.y,length=dx*dx+dy*dy;
          if(length<1)continue;
          const t=Math.max(0,Math.min(1,((cx-p.x)*dx+(cy-p.y)*dy)/length));
          const d=Math.hypot(cx-p.x-t*dx,cy-p.y-t*dy);
          if(d<best){best=d;nearest=sectionPortals[group.index];}
        }
      }
      return nearest;
    }

    function navigateToSection(href) {
      if (!href) return;
      const el = document.querySelector(href);
      if (el) {
        const hold=window.backgroundScrollAnchor?.(el)??window.projectScrollAnchor?.(el);
        if(Number.isFinite(hold))window.scrollTo({top:hold,behavior:'smooth'});
        else el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // A short-lived bridge uses the actual selected constellation, not a second galaxy.
    let chapterJourney=null,chapterSeamDeparture=0,galaxyReturnContext=null;
    const worldMotion=window.innerWorldMotion={active:null,serial:0,
      begin(kind,cancel){const previous=this.active;this.active=null;previous?.cancel();const token={id:++this.serial,kind,cancel};this.active=token;return token;},
      complete(token){if(this.active===token)this.active=null;},
      cancel(){const active=this.active;this.active=null;active?.cancel();}};
    function captureGalaxyContext() {
      const rect=canvas.getBoundingClientRect();
      if(rect.bottom<=0||rect.top>=window.innerHeight)return;
      galaxyReturnContext={camera:{...galaxyCamera},orbit:stage2Orbit,pitch:stage2Pitch,
        drift:{...galaxyDriftState},look:[galaxyLookX,galaxyLookY,galaxyLookTargetX,galaxyLookTargetY]};
    }
    function restoreGalaxyContext() {
      const saved=galaxyReturnContext;if(!saved)return false;
      Object.assign(galaxyCamera,saved.camera);Object.assign(galaxyDriftState,saved.drift);
      stage2Orbit=saved.orbit;stage2Pitch=saved.pitch;dragVelX=dragVelY=0;
      [galaxyLookX,galaxyLookY,galaxyLookTargetX,galaxyLookTargetY]=saved.look;
      lastGalaxyTime=0;hoveredTarget=null;syncGalaxyZoomControls();
      return true;
    }
    const chapterEase=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
    // Zero acceleration at each end gives the falling / gathering camera a softer settle.
    const chapterFlow=n=>{n=Math.max(0,Math.min(1,n));return n*n*n*(10+n*(-15+6*n));};
    const chapterEnter=n=>1-Math.pow(1-Math.max(0,Math.min(1,n)),3);
    function measureChapterHeading(target,paint,width) {
      const style=window.getComputedStyle?.(target);
      const size=parseFloat(style?.fontSize)||12,weight=style?.fontWeight||'700';
      const family=style?.fontFamily||'"JetBrains Mono", monospace';
      const spacing=parseFloat(style?.letterSpacing)||0;
      const lineHeight=parseFloat(style?.lineHeight)||size*1.6;
      const textOffset=parseFloat(style?.paddingLeft)||(window.innerWidth<=768?20:26);
      const bulletSize=parseFloat(style?.getPropertyValue?.('--chapter-bullet-size'))||(window.innerWidth<=768?8:10);
      width=Math.max(1,width-textOffset);
      let text=target.textContent.trim();
      if(!style||style.textTransform==='uppercase')text=text.toUpperCase();
      paint.font=`${weight} ${size}px ${family}`;
      const measure=text=>paint.measureText(text).width+Math.max(0,text.length-1)*spacing;
      const lines=[];let line='';
      for(const word of text.split(/\s+/)) {
        const candidate=line?line+' '+word:word;
        if(line&&measure(candidate)>width){lines.push(line);line=word;}else line=candidate;
      }if(line)lines.push(line);
      const accent=target.querySelector?.('.chapter-accent'),accentText=accent?.textContent||'';
      const accentAt=accentText?text.lastIndexOf(accentText):-1,accentColour=accent?window.getComputedStyle(accent).color:null;
      let lineCursor=0;
      const glyphs=lines.map(line=>{
        const lineAt=text.indexOf(line,lineCursor);lineCursor=lineAt+line.length;
        let prefix='',index=0;return [...line].map(letter=>{
          prefix+=letter;
          const x=paint.measureText(prefix).width-paint.measureText(letter).width+spacing*index++;
          const at=lineAt+index-1;
          return {letter,x,colour:accentAt>=0&&at>=accentAt&&at<accentAt+accentText.length?accentColour:null};
        });
      });
      const metrics=paint.measureText('Mg');
      const ascent=metrics.fontBoundingBoxAscent??size*.8,descent=metrics.fontBoundingBoxDescent??size*.2;
      const baseline=(lineHeight-ascent-descent)/2+ascent;
      return {size,weight,family,lineHeight,textOffset,bulletSize,baseline,lines,glyphs,maxWidth:Math.max(...lines.map(measure)),
        dividerStart:measure(lines.at(-1)||'')+12,colour:style?.color||themePalette[currentTheme].portalRingHover};
    }
    function openChapterDirect(href,quietFocus=false) {
      captureGalaxyContext();finishChapterJourney(false);
      const target=document.querySelector(href);if(!target)return;
      revealChapter(target,false);
      const hold=window.backgroundScrollAnchor?.(target)??window.projectScrollAnchor?.(target);
      if(Number.isFinite(hold))window.scrollTo({top:hold,behavior:'instant'});
      else target.scrollIntoView({behavior:'instant'});
      if(!target.hasAttribute?.('tabindex'))target.setAttribute?.('tabindex','-1');
      target.classList.toggle('chapter-pointer-focus',quietFocus);
      target.focus?.({preventScroll:true});
      window.dispatchEvent(new CustomEvent('portfolio-chapter-ready',{detail:{target}}));
    }
    function revealChapter(target,motion=true) {
      window.dispatchEvent(new CustomEvent('portfolio-chapter-enter',{detail:{target,motion}}));
      target.classList.add('is-visible');
      const group=target.nextElementSibling;
      group?.classList.add('is-visible');
      group?.querySelectorAll('.scroll-reveal').forEach(node=>node.classList.add('is-visible'));
      return group;
    }
    function finishChapterJourney(commit=false,focus=false,quietFocus=true) {
      const state=chapterJourney;if(!state)return;
      chapterJourney=null;worldMotion.complete(state.motionToken);cancelAnimationFrame(state.frame);
      if(commit&&!state.committed)commitChapterJourney(state);
      state.overlay.remove();state.snapshot.width=state.snapshot.height=1;
      document.body.classList.remove('chapter-travelling');
      for(const node of [state.target,state.group,...(state.arrivalNodes||[])]) {
        node?.classList.remove('chapter-arrival');node?.style.removeProperty('--chapter-arrive');
      }
      state.group?.classList.remove('chapter-stagger');
      if(focus&&state.committed) {
        if(!state.target.hasAttribute('tabindex'))state.target.setAttribute('tabindex','-1');
        state.target.classList.toggle('chapter-pointer-focus',quietFocus);
        state.target.focus({preventScroll:true});
      }
      if(state.committed)window.dispatchEvent(new CustomEvent('portfolio-chapter-ready',{detail:{target:state.target}}));
    }
    function commitChapterJourney(state) {
      // Commit semantic navigation independently of animation completion events.
      state.committed=true;
      state.group=revealChapter(state.target);
      state.arrivalNodes=state.group?.classList.contains('reading-chapter')?[...state.group.children]:[];
      if(state.arrivalNodes.length) {
        state.group.classList.add('chapter-stagger');
        state.arrivalNodes.forEach(node=>{node.classList.add('chapter-arrival');node.style.setProperty('--chapter-arrive','0');});
      }
      for(const node of [state.target,state.group]) {
        node?.style.setProperty('--chapter-arrive',node===state.target?'1':'0');node?.classList.add('chapter-arrival');
      }
      const hold=window.backgroundScrollAnchor?.(state.target)??window.projectScrollAnchor?.(state.target);
      const top=Number.isFinite(hold)?hold:Math.max(0,state.target.getBoundingClientRect().top+window.scrollY-state.headingInset);
      window.scrollTo({top,behavior:'instant'});
      const box=state.target.getBoundingClientRect();
      state.destination={x:box.left,top:box.top,y:box.top+box.height/2,width:box.width,dividerStart:state.dividerStart};
      state.target.style.setProperty('--chapter-arrive','0');
    }
    function chapterJourneyPhase(state,elapsed) {
      const t=state.timing;
      return {particle:Math.min(1,elapsed/t.gatherEnd),
        gather:chapterFlow((elapsed/t.gatherEnd-.35)/.65),
        bullet:chapterFlow((elapsed-(t.gatherEnd-100))/220),
        typing:Math.max(0,Math.min(1,(elapsed-t.typeStart)/(t.typeEnd-t.typeStart))),
        heading:chapterFlow((elapsed-t.typeEnd)/160),
        content:chapterEnter((elapsed-t.contentStart)/(state.duration-t.contentStart))};
    }
    const chapterCameraProgress=progress=>chapterFlow((progress-.30)/.70);
    function chapterParticlePosition(star,progress,destination,cameraDistance=star.cameraTravel||0) {
      const heading=destination.heading;
      const bulletSize=heading?.bulletSize||10;
      const bulletX=destination.x+bulletSize/2;
      const bulletY=(destination.top??destination.y)+(heading?.lineHeight||20)/2;
      // One world-space curve, with a following camera. No intermediate landing,
      // stop, or return segment: the stars keep descending while the view follows.
      const flow=chapterFlow((progress-star.delay)/(1-star.delay)),u=1-flow;
      const endX=bulletX+(star.slotX||0)*bulletSize;
      const endY=bulletY+cameraDistance+(star.slotY||0)*bulletSize;
      const descent=endY-star.y;
      const c1x=star.x+star.fallX*.7,c1y=star.y+descent*(.22+star.depth*.06);
      const c2x=endX+(star.x-endX)*.13+star.bend*.1,c2y=star.y+descent*(.86-star.depth*.04);
      const x=u*u*u*star.x+3*u*u*flow*c1x+3*u*flow*flow*c2x+flow*flow*flow*endX;
      const worldY=u*u*u*star.y+3*u*u*flow*c1y+3*u*flow*flow*c2y+flow*flow*flow*endY;
      return {x,y:worldY-cameraDistance*chapterCameraProgress(progress),worldY,
        fall:flow,gather:chapterFlow((flow-.28)/.72)};
    }
    function drawChapterJourney(state,progress) {
      const paint=state.paint,w=state.width,h=state.height,dest=state.destination;
      const dark=state.theme==='dark',spectrum=galaxySpectrum[state.theme];
      const elapsed=progress*state.duration,t=state.timing,phase=chapterJourneyPhase(state,elapsed);
      paint.clearRect(0,0,w,h);
      const veil=1-chapterFlow((elapsed-t.commitAt)/(t.gatherEnd-t.commitAt));
      const zoom=1+chapterFlow(elapsed/t.gatherEnd)*.028;
      const cameraDistance=h*1.08,cameraFollow=chapterCameraProgress(phase.particle);
      if(veil>.001) {
        paint.globalAlpha=veil;
        paint.fillStyle=dark?'#07090b':spectrum.ground;paint.fillRect(0,0,w,h);
        const origin=state.points[0]||{x:w/2,y:h/2};
        paint.save();paint.translate(origin.x,origin.y-cameraDistance*cameraFollow);
        const stage=state.stageRect;
        paint.scale(zoom,zoom);paint.drawImage(state.snapshot,stage.left-origin.x,stage.top-origin.y,stage.width,stage.height);paint.restore();
      }
      const flare=chapterEase(elapsed/100)*(1-chapterEase((elapsed-120)/220));
      paint.globalAlpha=flare*(dark?.42:.35);paint.strokeStyle=themePalette[state.theme].portalRingHover;
      paint.lineWidth=.8;paint.beginPath();
      for(const [a,b] of state.edges) {
        const p=state.points[a],q=state.points[b];if(!p?.visible||!q?.visible)continue;
        paint.moveTo(p.x,p.y);paint.lineTo(q.x,q.y);
      }paint.stroke();
      // A signal branches from the selected star before that constellation
      // becomes the established shower. The chapter keeps its open layout.
      if(elapsed<900&&state.signalDistance)for(const [a,b] of state.edges) {
        const p=state.points[a],q=state.points[b];if(!p?.visible||!q?.visible)continue;
        const da=state.signalDistance[a],db=state.signalDistance[b];
        const start=Math.min(da,db)/state.signalSpan*240,u=(elapsed-start)/420;
        if(u<=0||u>=1)continue;
        const from=da<=db?p:q,to=da<=db?q:p;
        const anchor=state.points[0]||{x:w/2,y:h/2};
        const x=anchor.x+(from.x+(to.x-from.x)*u-anchor.x)*zoom;
        const y=anchor.y+(from.y+(to.y-from.y)*u-anchor.y)*zoom-cameraDistance*cameraFollow;
        paint.globalAlpha=Math.sin(Math.PI*u)*veil*.8;
        paint.fillStyle=themePalette[state.theme].portalCoreHover;
        paint.beginPath();paint.arc(x,y,1.65,0,Math.PI*2);paint.fill();
      }
      const hub=state.points[0],ring=SceneResponse.impulse(elapsed,0,580);
      if(hub?.visible&&ring>.001){
        paint.globalAlpha=ring*.6*veil;paint.strokeStyle=themePalette[state.theme].portalRingHover;paint.lineWidth=.8;
        paint.beginPath();paint.arc(hub.x,hub.y-cameraDistance*cameraFollow,(8+elapsed*.07)*zoom,0,Math.PI*2);paint.stroke();
      }
      dest.heading=state.heading;
      const presence=(.72+flare*.28)*(1-phase.bullet);
      if(presence>.001)for(const star of state.stars) {
        const p=chapterParticlePosition(star,phase.particle,dest,cameraDistance);
        const tailMs=(state.mobile?110:150)*(.85+star.depth*.5);
        const tail=chapterParticlePosition(star,Math.max(0,phase.particle-tailMs/t.gatherEnd),dest,cameraDistance);
        const length=Math.hypot(p.x-tail.x,p.y-tail.y);
        const colour=star.main?spectrum.bright:spectrum.stars[star.colour];
        if(length>.5) {
          // A transparent tail and crisp luminous head read as meteors, not ribbons.
          const trail=paint.createLinearGradient(tail.x,tail.y,p.x,p.y);
          trail.addColorStop(0,`rgba(${star.trailRgb},0)`);
          trail.addColorStop(.7,`rgba(${star.trailRgb},.35)`);trail.addColorStop(1,colour);
          paint.globalAlpha=presence*(1-phase.gather*.88);
          paint.strokeStyle=trail;paint.lineWidth=star.radius*(star.main?1.2:.8);paint.lineCap='round';
          const mid=chapterParticlePosition(star,Math.max(0,phase.particle-tailMs/t.gatherEnd*.5),dest,cameraDistance);
          paint.beginPath();paint.moveTo(tail.x,tail.y);
          paint.quadraticCurveTo(2*mid.x-(tail.x+p.x)/2,2*mid.y-(tail.y+p.y)/2,p.x,p.y);paint.stroke();
        }
        paint.globalAlpha=presence*(dark?.4:.22)*(1-phase.gather);
        const haloSize=star.lead?30:star.main?22:14;
        paint.drawImage(state.halo,p.x-haloSize/2,p.y-haloSize/2,haloSize,haloSize);
        const morph=star.lead?chapterFlow((p.fall-.86)/.14):0;
        const leadPresence=star.lead?1-phase.bullet:presence;
        paint.globalAlpha=leadPresence*(1-morph);
        paint.fillStyle=phase.gather>.7?state.heading.colour:colour;
        paint.beginPath();paint.arc(p.x,p.y,star.radius*(1-phase.gather*.4)*(1+flare*(star.lead?.25:0)),0,Math.PI*2);paint.fill();
        if(star.lead&&morph>.001) {
          const size=star.radius*2+(state.heading.bulletSize-star.radius*2)*morph;
          paint.globalAlpha=leadPresence*morph;paint.fillStyle=state.heading.colour;
          paint.fillRect(p.x-size/2,p.y-size/2,size,size);
        }
      }
      const heading=state.heading,bullet=heading.bulletSize;
      paint.globalAlpha=phase.bullet*(1-phase.heading);paint.fillStyle=heading.colour;
      paint.fillRect(dest.x,dest.top+heading.lineHeight/2-bullet/2,bullet,bullet);
      // Decorative Canvas typing leaves the full, accessible heading in the DOM.
      // Its measured layout never changes, including when a mobile title wraps.
      paint.font=`${heading.weight} ${heading.size}px ${heading.family}`;
      paint.textBaseline='alphabetic';
      const baseline=heading.baseline;
      ChapterDecode.draw(paint,heading,dest,phase.typing,1-phase.heading,elapsed-t.typeStart,state.theme);
      paint.globalAlpha=1;
    }
    function startChapterJourney(href) {
      const target=document.querySelector(href);
      const index=sectionPortals.findIndex(portal=>portal.href===href);
      const constellation=renderedConstellations.find(group=>group.index===index);
      finishChapterJourney(false);
      // Missing geometry, reduced motion, or an offscreen galaxy use normal routing.
      if(galaxyMotion.matches){openChapterDirect(href,true);return;}
      if(!target||!constellation||document.hidden||
          document.body.classList.contains('reel-active')) {navigateToSection(href);return;}
      const rect=canvas.getBoundingClientRect();
      if(rect.bottom<=0||rect.top>=window.innerHeight) {navigateToSection(href);return;}
      captureGalaxyContext();
      const mobile=window.innerWidth<=768,w=window.innerWidth,h=window.innerHeight;
      const ratio=Math.min(window.devicePixelRatio||1,mobile?1.25:1.5);
      const snapshot=document.createElement('canvas');snapshot.width=Math.round(rw*ratio);snapshot.height=Math.round(rh*ratio);
      snapshot.getContext('2d').drawImage(canvas,0,0,snapshot.width,snapshot.height);
      const overlay=document.createElement('canvas');overlay.className='chapter-flight';overlay.setAttribute('aria-hidden','true');
      overlay.width=Math.round(w*ratio);overlay.height=Math.round(h*ratio);
      const paint=overlay.getContext('2d');paint.scale(ratio,ratio);document.body.appendChild(overlay);
      const points=constellation.points.map(p=>({...p,x:p.x+rect.left,y:p.y+rect.top}));
      const portal=renderedPortals.find(p=>p.href===href),labelBox=portal?.labelRect;
      const headingInset=mobile?88:100,headingBox=target.getBoundingClientRect();
      const heading=measureChapterHeading(target,paint,headingBox.width);
      const dividerStart=heading.dividerStart;
      const characters=heading.glyphs.reduce((total,line)=>total+line.length,0);
      const gatherEnd=mobile?1460:1650;
      const timing={commitAt:mobile?280:340,showerEnd:gatherEnd,gatherEnd,typeStart:gatherEnd+100};
      timing.typeEnd=timing.typeStart+Math.max(780,Math.min(2200,characters*(mobile?88:96)));
      timing.contentStart=timing.typeEnd+180;
      const state={target,group:null,overlay,paint,snapshot,width:w,height:h,mobile,theme:currentTheme,stageRect:rect,dividerStart,heading,
        halo:constellationHalo(),points,edges:constellation.edges,signalDistance:constellation.signalDistance,signalSpan:constellation.signalSpan,name:sectionPortals[index].label,
        label:{x:labelBox?labelBox.x+rect.left+20:w*.5,y:labelBox?labelBox.y+rect.top+labelBox.height/2:h*.5},
        destination:{x:headingBox.left,top:headingInset,y:headingInset+headingBox.height/2,width:headingBox.width,dividerStart,heading},headingInset,
        start:performance.now(),timing,duration:timing.contentStart+(mobile?540:600),frame:0,committed:false,stars:[],arrivalNodes:[]};
      const visible=points.filter(p=>p.visible&&p.x>=-30&&p.x<=w+30&&p.y>=-30&&p.y<=h+30);
      // Only this constellation generates the shower; bounded satellites add depth.
      visible.forEach((p,i)=>{
        const count=mobile?4:6;
        for(let j=0;j<count;j++) {
          if(state.stars.length>=(mobile?64:96))break;
          const seed=60101+index*313+i*17+j*7;
          const x=p.x+(j?rnd(seed)*16-8:0),y=p.y+(j?rnd(seed+1)*16-8:0);
          const fallY=Math.max(36,Math.min(h*(.32+rnd(seed+3)*.22),h*.90-y));
          const fallX=Math.min(0,Math.max(12,x-fallY*(.26+rnd(seed+8)*.10))-x);
          const tint=j===0?galaxySpectrum[currentTheme].bright:galaxySpectrum[currentTheme].stars[i%4];
          state.stars.push({x,y,fallX,fallY,cameraTravel:h*1.08,
            trailRgb:tint.slice(1).match(/.{2}/g).map(value=>parseInt(value,16)).join(','),
            delay:.035+rnd(seed+2)*.20,lane:rnd(seed+3),depth:rnd(seed+4),
            bend:(rnd(seed+5)-.5)*(mobile?38:94),lift:8+rnd(seed+6)*24,
            settle:j===0&&i%3===0,radius:j===0?1.65:.55+rnd(seed+7)*.55,main:j===0,colour:i%4});
        }
      });
      const columns=Math.ceil(Math.sqrt(state.stars.length)),rows=Math.ceil(state.stars.length/columns);
      state.stars.forEach((star,index)=>{star.slotX=((index%columns)+.5)/columns-.5;star.slotY=(Math.floor(index/columns)+.5)/rows-.5;});
      if(state.stars.length){state.stars[0].lead=true;state.stars[0].slotX=state.stars[0].slotY=0;state.stars[0].radius=mobile?2:2.5;}
      state.motionToken=worldMotion.begin('chapter',()=>finishChapterJourney(false));
      chapterJourney=state;document.body.classList.add('chapter-travelling');
      const frame=time=>{
        if(chapterJourney!==state)return;
        const progress=Math.min(1,Math.max(0,(time-state.start)/state.duration));
        const elapsed=progress*state.duration,phase=chapterJourneyPhase(state,elapsed);
        if(elapsed>=state.timing.commitAt&&!state.committed)commitChapterJourney(state);
        state.group?.style.setProperty('--chapter-arrive',phase.content.toFixed(4));
        state.arrivalNodes.forEach((node,index)=>{
          const delay=index*70;
          const arrive=chapterEnter((elapsed-state.timing.contentStart-delay)/(state.duration-state.timing.contentStart-delay));
          node.style.setProperty('--chapter-arrive',arrive.toFixed(4));
        });
        if(state.committed)state.target.style.setProperty('--chapter-arrive',phase.heading.toFixed(4));
        drawChapterJourney(state,progress);
        if(progress>=1){finishChapterJourney(false,true);return;}
        state.frame=requestAnimationFrame(frame);
      };
      drawChapterJourney(state,0);state.frame=requestAnimationFrame(frame);
    }

    // Carry the finished scene edge below the model, then settle into its sky.
    // The live 1.25-screen scene itself is never masked or dimmed.
    let chapterAtmosphere=null,chapterSeamFrame=0,chapterAtmosphereTheme='',chapterSeamLastTime=0;
    const chapterAtmosphereCache={};
    let chapterEdgeLayer=null,edgeGradient=null,taperGradient=null;
    function chapterAtmosphereHeight() {
      return Math.round(Math.max(isMobile?200:240,Math.min(isMobile?300:420,(window.innerHeight||rh)*.5)));
    }
    function chapterAtmosphereVisible() {
      const top=trackTop+rh-(window.scrollY||0);
      return top<(window.innerHeight||rh)+80&&top+chapterAtmosphereHeight()>-80;
    }
    function paintChapterAtmosphere() {
      if(document.hidden||window.portfolioSideQuestsOpen||!chapterAtmosphere||!chapterAtmosphereVisible())return;
      const height=chapterAtmosphereHeight(),ratio=Math.min(window.devicePixelRatio||1,1.25);
      const pixelWidth=Math.round(rw*ratio),pixelHeight=Math.round(height*ratio);
      if(chapterAtmosphere.width!==pixelWidth||chapterAtmosphere.height!==pixelHeight){
        chapterAtmosphere.width=pixelWidth;chapterAtmosphere.height=pixelHeight;taperGradient=null;
      }
      chapterAtmosphere.style.height=height+'px';
      const paint=chapterAtmosphere.getContext('2d');paint.setTransform(ratio,0,0,ratio,0,0);
      paint.clearRect(0,0,rw,height);
      const ground=currentTheme==='light'?galaxySpectrum.light.ground:'#07090b';
      paint.fillStyle=ground;paint.fillRect(0,0,rw,height);
      const atlas=galaxySky[currentTheme];
      if(atlas){
        const frame=galaxySkyFrame,aligned=frame.theme===currentTheme&&frame.extent>0;
        const extent=aligned?frame.extent:Math.max(rw,rh)+32;
        const x=aligned?frame.x:(rw-extent)/2;
        const y=(aligned?frame.y:(rh-extent)/2)-rh;
        paint.globalAlpha=aligned?frame.alpha:(currentTheme==='dark'?.70:.60);
        paint.drawImage(atlas,x,y,extent,extent);
        const edge=y+extent;
        if(edge<height){
          // Mirror at the atlas edge on tall portrait viewports; its colour stays
          // continuous rather than jumping to the opposite end of the texture.
          paint.save();paint.translate(0,2*edge);paint.scale(1,-1);
          paint.drawImage(atlas,x,y,extent,extent);paint.restore();
        }
      }else{
        paint.globalAlpha=.28;paint.drawImage(chapterAtmosphereTexture(currentTheme),0,0,rw,height);
      }
      // An atlas alone misses the nebula, glow and dust already composited into
      // the scene. Reflect a shallow final-frame band at the physical edge and
      // crossfade it into the continuing sky. All copying stays in drawImage;
      // there is no per-frame pixel readback and no fade over the actual model.
      const edgeHeight=Math.min(height,Math.round(Math.max(96,Math.min(160,height*.48))));
      if(!chapterEdgeLayer)chapterEdgeLayer=document.createElement('canvas');
      if(chapterEdgeLayer.width!==pixelWidth||chapterEdgeLayer.height!==Math.round(edgeHeight*ratio)){
        chapterEdgeLayer.width=pixelWidth;chapterEdgeLayer.height=Math.round(edgeHeight*ratio);edgeGradient=null;
      }
      const edgePaint=chapterEdgeLayer.getContext('2d');
      edgePaint.setTransform(ratio,0,0,ratio,0,0);edgePaint.globalAlpha=1;
      edgePaint.globalCompositeOperation='source-over';edgePaint.fillStyle=ground;
      edgePaint.fillRect(0,0,rw,edgeHeight);
      const sourceHeight=Math.min(canvas.height,Math.round(edgeHeight*canvas.height/rh));
      edgePaint.save();edgePaint.translate(0,edgeHeight);edgePaint.scale(1,-1);
      edgePaint.drawImage(canvas,0,canvas.height-sourceHeight,canvas.width,sourceHeight,0,0,rw,edgeHeight);
      edgePaint.restore();edgePaint.save();edgePaint.globalCompositeOperation='destination-in';
      if(!edgeGradient){
      const edgeBlend=edgePaint.createLinearGradient(0,0,0,edgeHeight);
      edgeBlend.addColorStop(0,'rgba(0,0,0,1)');edgeBlend.addColorStop(.12,'rgba(0,0,0,1)');
      edgeBlend.addColorStop(.65,'rgba(0,0,0,.28)');edgeBlend.addColorStop(1,'rgba(0,0,0,0)');
      edgeGradient=edgeBlend;
      }
      edgePaint.fillStyle=edgeGradient;edgePaint.fillRect(0,0,rw,edgeHeight);edgePaint.restore();
      paint.globalAlpha=1;paint.drawImage(chapterEdgeLayer,0,0,rw,edgeHeight);
      // Carry a handful of fixed stars into the margins below the reflected band.
      for(let i=0;i<36;i++){
        const x=(i%2?1:0)*rw+(i%2?-1:1)*rnd(9811+i)*rw*.17;
        const y=height*(.14+.78*rnd(9863+i));
        paint.globalAlpha=.30*Math.min(1,y/edgeHeight);
        paint.fillStyle=galaxySpectrum[currentTheme].sky[i%3];
        const size=i%7===0?1.5:.85;paint.fillRect(x,y,size,size);
      }
      paint.globalAlpha=1;
      paint.save();paint.globalCompositeOperation='destination-in';
      if(!taperGradient){
      const taper=paint.createLinearGradient(0,0,0,height);
      taper.addColorStop(0,'rgba(0,0,0,1)');taper.addColorStop(.10,'rgba(0,0,0,1)');
      taper.addColorStop(.40,'rgba(0,0,0,.46)');taper.addColorStop(.72,'rgba(0,0,0,.07)');taper.addColorStop(1,'rgba(0,0,0,0)');
      taperGradient=taper;
      }
      paint.fillStyle=taperGradient;paint.fillRect(0,0,rw,height);paint.restore();
      chapterAtmosphereTheme=currentTheme;
    }
    function chapterAtmosphereTexture(theme) {
      if(chapterAtmosphereCache[theme])return chapterAtmosphereCache[theme];
      const tile=document.createElement('canvas');tile.width=1024;tile.height=1024;
      const paint=tile.getContext('2d'),dark=theme==='dark',spectrum=galaxySpectrum[theme];
      for(let i=0;i<9;i++) {
        const x=rnd(i+67103)*1024,y=rnd(i+67109)*900,radius=110+rnd(i+67117)*210;
        const haze=paint.createRadialGradient(x,y,0,x,y,radius);
        haze.addColorStop(0,`rgba(${spectrum.haze[i%3]},${dark?.10:.05})`);haze.addColorStop(1,`rgba(${spectrum.haze[i%3]},0)`);
        paint.fillStyle=haze;paint.fillRect(0,0,1024,1024);
      }
      for(let i=0;i<1600;i++) {
        const x=rnd(i+69101)*1024,y=rnd(i+71103)*1024;
        paint.globalAlpha=(.1+rnd(i+73109)*.4)*(1-y/1280);
        paint.fillStyle=spectrum.sky[i%3];const size=i%47===0?1.3:.35+rnd(i+75107)*.6;
        paint.fillRect(x,y,size,size);
      }
      paint.globalAlpha=1;chapterAtmosphereCache[theme]=tile;return tile;
    }
    function chapterScrollFade(current,target,dt,reduced=false) {
      if(reduced)return target;
      const next=current+(target-current)*(1-Math.exp(-Math.max(1,Math.min(50,dt))/95));
      return Math.abs(target-next)<.0004?target:next;
    }
    function updateChapterSeam(time) {
      chapterSeamFrame=0;if(!chapterAtmosphere)return;
      chapterSeamDeparture=0;
      const controls=document.getElementById('galaxy-interface');
      if(controls&&document.body.classList.contains('galaxy-arrived'))controls.inert=Boolean(chapterJourney);
      canvas.parentElement.style.removeProperty('--chapter-departure');
      paintChapterAtmosphere();
      chapterSeamLastTime=0;
    }
    function scheduleChapterSeam() {if(!chapterSeamFrame){chapterSeamLastTime=0;chapterSeamFrame=requestAnimationFrame(updateChapterSeam);}}
    function installChapterMotion() {
      chapterAtmosphere=document.createElement('canvas');chapterAtmosphere.className='chapter-atmosphere';
      chapterAtmosphere.width=1024;chapterAtmosphere.height=1024;chapterAtmosphere.setAttribute('aria-hidden','true');
      document.getElementById('main-content').prepend(chapterAtmosphere);updateChapterSeam();
      window.addEventListener('scroll',scheduleChapterSeam,{passive:true});
      window.addEventListener('resize',()=>{finishChapterJourney(true);scheduleChapterSeam();},{passive:true});
      // User input always takes over; no scroll lock or uninterruptible timeline.
      window.addEventListener('wheel',()=>finishChapterJourney(false),{passive:true});
      window.addEventListener('touchstart',()=>finishChapterJourney(false),{passive:true});
      window.addEventListener('pointerdown',()=>finishChapterJourney(false),{passive:true});
      window.addEventListener('keydown',event=>{if(['Escape','Tab','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))finishChapterJourney(false,true,false);});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)finishChapterJourney(true);});
      document.addEventListener('click',event=>{
        const beginning=event.target.closest?.('a[href="#scroll-track"]');
        if(beginning&&galaxyReturnContext&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey) {
          event.preventDefault();finishChapterJourney(false);restoreGalaxyContext();
          window.scrollTo({top:trackTop,behavior:galaxyMotion.matches||event.detail===0?'instant':'smooth'});
          if(event.detail===0)zoomResetButton.focus?.({preventScroll:true});
          scheduleChapterSeam();return;
        }
        if(chapterJourney&&!event.target.closest('.portal-chip, #world'))finishChapterJourney(false);
      });
      galaxyMotion.addEventListener?.('change',()=>{if(galaxyMotion.matches)finishChapterJourney(true);scheduleChapterSeam();});
      if('MutationObserver' in window)new MutationObserver(()=>{finishChapterJourney(true);scheduleChapterSeam();})
        .observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    }

    // Camera controls remain independent of document scroll and rendering density.
    const zoomInButton=document.getElementById('galaxy-zoom-in');
    const zoomOutButton=document.getElementById('galaxy-zoom-out');
    const zoomResetButton=document.getElementById('galaxy-zoom-reset');
    const zoomStatus=document.getElementById('galaxy-zoom-status');
    let lastZoomControlState='';
    function syncGalaxyZoomControls() {
      const key=galaxyCamera.targetDistance.toFixed(3)+':'+(galaxyCamera.selected||'');
      if(key===lastZoomControlState)return;
      lastZoomControlState=key;
      zoomInButton.disabled=galaxyCamera.targetDistance<=GALAXY_MIN_DISTANCE+.001;
      zoomOutButton.disabled=galaxyCamera.targetDistance>=GALAXY_MAX_DISTANCE-.001;
      portalChips.forEach((chip,i)=>{
        const selected=galaxyCamera.selected===sectionPortals[i].href;
        chip.dataset.approached=String(selected);
        chip.setAttribute('aria-label',`Open ${sectionPortals[i].label}${sectionPortals[i].page?' journey':''}`);
      });
    }
    function updateGalaxyCamera(dt) {
      for(const [key,target] of [['distance','targetDistance'],['focusX','targetX'],['focusY','targetY'],['focusZ','targetZ']]) {
        SceneResponse.spring(galaxyCamera,key,galaxyCamera[target],dt,key==='distance'?100:120,galaxyMotion.matches);
      }
      galaxyCamera.distance=Math.max(GALAXY_MIN_DISTANCE,Math.min(GALAXY_MAX_DISTANCE,galaxyCamera.distance));
    }
    function frameGalaxyCamera(orbit,pitch) {
      const x=galaxyCamera.focusX,y=galaxyCamera.focusY,z=galaxyCamera.focusZ;
      galaxyCamera.frameX=x*Math.cos(orbit)+z*Math.sin(orbit);
      const depth=-x*Math.sin(orbit)+z*Math.cos(orbit);
      galaxyCamera.frameY=y*Math.cos(pitch)-depth*Math.sin(pitch);
    }
    // Real dragging releases a destination, retaining zoom and easing back to
    // the galaxy's origin. The same orbit controls work before and after approach.
    function releaseGalaxyFocus() {
      const c=galaxyCamera;
      c.selected=null;c.targetDistance=c.distance;
      c.targetX=c.targetY=c.targetZ=0;
      dragVelX=dragVelY=0;
      galaxyLookTargetX=galaxyLookX;galaxyLookTargetY=galaxyLookY;
      if(galaxyMotion.matches)updateGalaxyCamera(0);
      zoomStatus.textContent='Free galaxy orbit.';syncGalaxyZoomControls();
    }
    function galaxyApproachReady() {
      return Math.abs(galaxyCamera.distance-galaxyCamera.targetDistance)<.045&&
        Math.hypot(galaxyCamera.focusX-galaxyCamera.targetX,galaxyCamera.focusY-galaxyCamera.targetY,galaxyCamera.focusZ-galaxyCamera.targetZ)<.045;
    }
    function activateGalaxyPortal(hit,direct=false,cinematic=true) {
      if(!hit?.href)return;
      const destination=sectionPortals.find(portal=>portal.href===hit.href);
      if(direct&&destination?.page){window.openSideQuestsPage?.({instant:!cinematic,route:destination.href});return;}
      if(direct){if(cinematic)startChapterJourney(hit.href);else openChapterDirect(hit.href);return;}
      // Stars and filaments only approach. A section opens exclusively through
      // its front-layer card, never by repeating a constellation click.
      if(galaxyCamera.selected===hit.href)return;
      const portal=sectionPortals.find(p=>p.href===hit.href);if(!portal)return;
      const p=portalWorldPosition(portal);
      galaxyCamera.selected=hit.href;galaxyCamera.targetDistance=4.25;
      galaxyCamera.targetX=p.x;galaxyCamera.targetY=p.y;galaxyCamera.targetZ=p.z;
      dragVelX=dragVelY=0;galaxyLookTargetX=galaxyLookTargetY=0;
      zoomStatus.textContent=`Approaching ${portal.label}.`;
      if(galaxyMotion.matches)updateGalaxyCamera(0);
      syncGalaxyZoomControls();
    }
    function adjustGalaxyZoom(delta) {
      exploredZoom=true;
      galaxyCamera.targetDistance=Math.max(GALAXY_MIN_DISTANCE,Math.min(GALAXY_MAX_DISTANCE,galaxyCamera.targetDistance+delta));
      zoomStatus.textContent=`Galaxy zoom ${(5.6/galaxyCamera.targetDistance).toFixed(1)} times.`;
      if(galaxyMotion.matches)updateGalaxyCamera(0);
      syncGalaxyZoomControls();
    }
    function resetGalaxyView(immediate=false) {
      exploredOrbit=exploredZoom=false;viewCandidate="";
      galaxyReturnContext=null;
      galaxyCamera.targetDistance=GALAXY_DEFAULT_DISTANCE;galaxyCamera.targetX=galaxyCamera.targetY=galaxyCamera.targetZ=0;
      galaxyCamera.selected=null;stage2Orbit=stage2Pitch=dragVelX=dragVelY=0;
      galaxyLookX=galaxyLookY=galaxyLookTargetX=galaxyLookTargetY=0;
      if(immediate||galaxyMotion.matches) {
        galaxyCamera.distance=GALAXY_DEFAULT_DISTANCE;galaxyCamera.focusX=galaxyCamera.focusY=galaxyCamera.focusZ=0;
        galaxyCamera.frameX=galaxyCamera.frameY=0;
        for(const key of ['distance','focusX','focusY','focusZ'])galaxyCamera[key+'Velocity']=0;
      }
      zoomStatus.textContent='Galaxy view reset to 1.1 times.';syncGalaxyZoomControls();
    }
    zoomInButton.addEventListener('click',()=>adjustGalaxyZoom(-.45));
    zoomOutButton.addEventListener('click',()=>adjustGalaxyZoom(.45));
    zoomResetButton.addEventListener('click',()=>resetGalaxyView());
    syncGalaxyZoomControls();

    // Smooth random waypoints, previously used here, are replaced by a steady turn.
    // Advance only by rendered time: returning to the tab cannot jump the model.
    const galaxyDriftState={clock:0,orbit:0,pitch:0,rate:1};
    function updateGalaxyDrift(dt) {
      if(galaxyMotion.matches)return galaxyDriftState;
      const elapsed=Math.max(0,Math.min(40,dt));
      const holding=chapterJourney||isDragging||hoveredTarget||(galaxyCamera.selected&&!galaxyApproachReady());
      const previous=galaxyDriftState.rate,target=holding?0:1,tau=holding?160:650;
      const decay=Math.exp(-elapsed/tau);
      galaxyDriftState.rate=target+(previous-target)*decay;
      // Exact integral of the speed envelope: hover/release never jumps and
      // the steady, one-direction orbit keeps the same cruising speed.
      const travel=target*elapsed+(previous-target)*tau*(1-decay);
      galaxyDriftState.clock+=travel;
      galaxyDriftState.orbit+=travel*.000055*(isMobile?.8:1);
      galaxyDriftState.pitch=0;
      return galaxyDriftState;
    }

    let lastRenderedProgress = -1;
    let lastGalaxyTime=0;
    const galaxyFrameMeter=(()=>{
      if(!/(?:[?&])fps=1(?:&|$)/.test(window.location?.search||''))return null;
      const readout=document.createElement('output');
      readout.id='galaxy-fps';readout.setAttribute('aria-label','Galaxy frame timing');
      readout.style.cssText='position:fixed;right:16px;top:112px;z-index:10000;padding:9px 12px;background:var(--bg);color:var(--ink);font:12px/1.5 monospace;pointer-events:none;white-space:pre;';
      readout.textContent='Galaxy FPS: waiting for visible frames';document.body.appendChild(readout);
      let previous=0,lastReport=0;const intervals=[],paints=[];
      function reset(){previous=0;lastReport=0;intervals.length=paints.length=0;}
      document.addEventListener('visibilitychange',reset);
      return {reset,record(time,paintMs){
        if(!previous){previous=time;lastReport=time;return;}
        const gap=time-previous;previous=time;
        // Visibility and offscreen resets remove idle time; real visible stalls count.
        if(gap<=0)return;
        intervals.push(gap);paints.push(paintMs);
        if(intervals.length>120){intervals.shift();paints.shift();}
        if(time-lastReport<1000)return;
        lastReport=time;
        const sorted=[...intervals].sort((a,b)=>a-b);
        const mean=intervals.reduce((sum,n)=>sum+n,0)/intervals.length;
        const paint=paints.reduce((sum,n)=>sum+n,0)/paints.length;
        const p95=sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)];
        window.galaxyFrameStats={fps:1000/mean,meanFrameMs:mean,p95FrameMs:p95,meanRenderMs:paint,samples:intervals.length};
        readout.textContent=`GALAXY: ${(1000/mean).toFixed(0)} FPS\nFrame: ${mean.toFixed(1)} ms · p95: ${p95.toFixed(1)} ms\nRender CPU: ${paint.toFixed(1)} ms`;
      }};
    })();
    window.addEventListener('inner-world-galaxy-wake', () => {
      if(!window.studyFlight&&!document.body.classList.contains('galaxy-arrived'))resetGalaxyView(true);
      measure();
      lastGalaxyTime=0;
      requestGalaxyFrame();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) requestGalaxyFrame();
    });
    let lastStudyUI=null;
    function loop(time) {
      syncGalaxyTheme();
      const framePaintStart=galaxyFrameMeter?performance.now():0;
      if(window.portfolioSideQuestsOpen){
        galaxyFrameMeter?.reset();lastGalaxyTime=0;return;
      }
      const reelActive=document.body.classList.contains('reel-active');
      const inFlight=Boolean(window.studyFlight);
      if (document.hidden || (reelActive && !inFlight && window.innerWorldGalaxyTargets?.length)) {
        galaxyFrameMeter?.reset();
        return;
      }
      const galaxyDt=lastGalaxyTime?Math.max(1,Math.min(40,time-lastGalaxyTime)):1000/60;
      lastGalaxyTime=time;
      if (!isCanvasVisible) {
        galaxyFrameMeter?.reset();
        return;
      }

      targetProgress = Math.max(0, Math.min(1, (rawScrollY - trackTop) / trackHeight));
      smoothProgress += (targetProgress - smoothProgress) * (1-Math.pow(isMobile?.68:.72,galaxyDt/(1000/60)));
      if (qualitiesActivated && targetProgress < .12) {
        qualitiesActivated = false;
        qualitiesBurstStart = 0;
        qualitiesSelected = -1;
        qualitiesScene.classList.remove('is-activated');
        qualitiesButtons.forEach(button => button.classList.remove('is-selected'));
        qualitiesPrompt.textContent = 'OH, HI THERE.';
        qualitiesAction.textContent = 'DRAG TO EXPLORE · SELECT A QUALITY · CLICK THE CORE';
        qualitiesInsight.classList.remove('is-visible');
      }
      const galaxyProgress = .45; // Keep one framing; scrolling reveals the portfolio, not another galaxy stage.
      const qualitiesAlpha = 0; // Replaced by the automatic Canvas opening reel.
      const galaxyAlpha = 1;
      if(qualitiesScene.style.opacity!=='0')qualitiesScene.style.opacity='0';
      if(canvas.style.opacity!=='1')canvas.style.opacity='1';
      if(canvas.style.pointerEvents!=='auto')canvas.style.pointerEvents='auto';
      if(portalLayer.style.opacity!=='1')portalLayer.style.opacity='1';
      if(portalLayer.inert)portalLayer.inert=false;
      const canExploreQualities = qualitiesAlpha > .48 && smoothProgress < .54;
      if (canExploreQualities !== qualitiesInteractive) {
        qualitiesInteractive = canExploreQualities;
        qualitiesScene.classList.toggle('is-interactive', canExploreQualities);
        qualitiesScene.inert = !canExploreQualities;
        qualitiesScene.setAttribute('aria-hidden', String(!canExploreQualities));
      }
      if (qualitiesAlpha > .01) drawQualities(time);

      // Celestial idle orbital drift
      const motionTime=galaxyMotion.matches?0:time;
      const idleDrift=updateGalaxyDrift(galaxyDt);
      const atmosphereTime=galaxyMotion.matches?0:galaxyDriftState.clock;
      const ambientOrbit = idleDrift.orbit;
      const ambientPitch = idleDrift.pitch;

      // Apply drag momentum glide across the full galaxy journey.
      if (!isDragging) {
        const decay=Math.exp(-galaxyDt/240),travel=240/(1000/60)*(1-decay);
        stage2Orbit+=dragVelX*travel;
        stage2Pitch=Math.max(-.65,Math.min(.65,stage2Pitch+dragVelY*travel));
        dragVelX*=decay;dragVelY*=decay;
        if(Math.abs(dragVelX)<.000001)dragVelX=0;
        if(Math.abs(dragVelY)<.000001||Math.abs(stage2Pitch)>=.65)dragVelY=0;
      }

      // The opening film resolves directly into the galaxy, then the About fly-through.

      const flightAge=inFlight?Math.max(0,time-window.studyFlightStart):0;
      // The reel owns a fully opaque veil until the first nonzero reveal.
      // Keep its live star/arm targets and camera moving even while paint is covered.
      const paintGalaxy=!reelActive||(inFlight&&StudyMotion.state(flightAge,window.studySkipMotion).reveal>0);
      if(inFlight){
        window.studyFlightAge=StudyMotion.clock(time,window.studyFlightStart,window.studySkipMotion);
        const t=Math.max(0,Math.min(1,(window.studyFlightAge-1000)/3800)),q=t*t*t*(10+t*(-15+6*t));
        galaxyCamera.distance=6.8+(GALAXY_DEFAULT_DISTANCE-6.8)*q;
        galaxyCamera.targetDistance=galaxyCamera.distance;
      }else updateGalaxyCamera(galaxyDt);
      const camZ = galaxyCamera.distance;
      const zoomEase = Math.max(0,Math.min(1,(5.6-camZ)/(5.6-GALAXY_MIN_DISTANCE)));
      const baseAlpha = 0.45 + smoothstep(0.06, 0.30, galaxyProgress) * 0.32 + zoomEase * 0.23;

      // Mobile Perspective Pitch: Tilts the galaxy ~26 deg on portrait so it opens widely
      const mobileDefaultPitch = isMobile ? -0.58 : -0.50;

      const effectiveUserOrbit = stage2Orbit;
      const effectiveUserPitch = stage2Pitch;

      const lookEase=1-Math.pow(.94,galaxyDt/(1000/60));
      galaxyLookX+=((galaxyMotion.matches?0:galaxyLookTargetX)-galaxyLookX)*lookEase;
      galaxyLookY+=((galaxyMotion.matches?0:galaxyLookTargetY)-galaxyLookY)*lookEase;
      const curOrbit = effectiveUserOrbit + ambientOrbit + galaxyLookX;
      const curPitch = effectiveUserPitch + ambientPitch + galaxyLookY + mobileDefaultPitch;
      frameGalaxyCamera(curOrbit,curPitch);

      if (Math.abs(smoothProgress - lastRenderedProgress) > 0.0005) {
        lastRenderedProgress = smoothProgress;
        
        const noteAlpha = smoothstep(0.21, 0.39, galaxyProgress) * (1 - smoothstep(0.88, 0.99, galaxyProgress));
        galaxyNote.style.opacity = noteAlpha.toFixed(3);
        galaxyNote.style.transform = `translate3d(0, ${(1 - noteAlpha) * 14}px, 0)`;

        const hudProgress = smoothstep(0.18, 0.32, galaxyProgress) * (1 - smoothstep(0.88, 0.99, galaxyProgress));
        hudOverlay.style.opacity = hudProgress.toFixed(3);
        brackets.style.opacity = hudProgress.toFixed(3);

        hudStageLabel.textContent = 'GALAXY // EXPLORE';
      }

      const zoomReadout=`ZOOM: ${(5.6/camZ).toFixed(1)}X`;
      if(hudZoomLabel.textContent!==zoomReadout)hudZoomLabel.textContent=zoomReadout;

      const orbitReadout=`ORBIT: ${curOrbit.toFixed(2)} RAD`;
      if(telOrbit.textContent!==orbitReadout)telOrbit.textContent=orbitReadout;

      if (galaxyAlpha < .005) {
        portalChips.forEach(chip => chip.hidden = true);
        requestGalaxyFrame();
        return;
      }

      const stage2TargetRadius = isMobile 
          ? Math.min(rw * 0.49, Math.min(rh,window.innerHeight||rh) * 0.62) 
        : Math.min(rw * 0.46, Math.min(rh,window.innerHeight||rh) * 0.57);
      const unit = (stage2TargetRadius * 5.6) / 3.25;
      if(reelActive)for(let arm=0;arm<2;arm++)for(let j=0;j<40;j++){
        const cloud=galacticRibbons[arm*40+j],p=project3D(cloud.x,cloud.y,cloud.z,unit,camZ,curOrbit,curPitch),q=studyArmGuides[arm][j];
        q.x=p.x;q.y=p.y;q.visible=p.visible;
      }


      updateConstellationHover(galaxyDt,curPitch,time);
      const palette = themePalette[currentTheme];
      const spectrum=galaxySpectrum[currentTheme];
      if (paintGalaxy) {
        ctx.clearRect(0, 0, rw, rh);
        // Both themes own their opaque backdrop to match the adjoining chapter.
        ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
        ctx.fillStyle=currentTheme==='light'?spectrum.ground:'#07090b';
        ctx.fillRect(0,0,rw,rh);ctx.restore();
        ctx.save();
        drawSpatialSky(unit,camZ,curOrbit,curPitch,baseAlpha,atmosphereTime);
        drawDeepSkyVeils(unit,camZ,curOrbit,curPitch,baseAlpha,atmosphereTime);
        drawSpatialDistantLights(unit,camZ,curOrbit,curPitch,baseAlpha,atmosphereTime);
        drawSpatialNebula(unit,camZ,curOrbit,curPitch,baseAlpha,atmosphereTime);

        // 1. Core Bulge Glow
        const origin=project3D(0,0,0,unit,camZ,curOrbit,curPitch,galaxyCoreProjection);
        const cx = origin.visible?origin.x:rw*.5;
        const cy = origin.visible?origin.y:rh*.5;
        const coreRadius = stage2TargetRadius * (isMobile ? (0.45 + zoomEase * 0.55) : (0.60 + zoomEase * 0.70));
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        coreGrad.addColorStop(0, spectrum.core);
        coreGrad.addColorStop(0.35, spectrum.mid);
        coreGrad.addColorStop(1, palette.coreGlowOuter);
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, 0, rw, rh);

        ctx.globalAlpha = baseAlpha;

        // 2. Mottled spiral material, distant sky and sharply resolved spatial dust.
        origin.x=cx;origin.y=cy;origin.radius=coreRadius;
        drawGalacticMaterial(unit,camZ,curOrbit,curPitch,baseAlpha,motionTime,atmosphereTime,origin);
        drawGalaxyScaffold(unit,camZ,curOrbit,curPitch,baseAlpha);
        drawScatteredConstellations(unit,camZ,curOrbit,curPitch,baseAlpha);

        // 3. Fine orbital traces sit behind the stellar material in the distance.
        ctx.lineWidth = isMobile ? .8 : .7;
        ctx.strokeStyle = palette.galaxyRings;
        for (let ri = 0; ri < ringGeometries.length; ri++) {
          const ringPts=ringGeometries[ri],projected=ringProjection[ri];
          for(let s=0;s<=RING_SEGMENTS;s++)project3D(ringPts[s*3],ringPts[s*3+1],ringPts[s*3+2],unit,camZ,curOrbit,curPitch,projected[s]);
          for(let side=0;side<2;side++) {
            ctx.globalAlpha=baseAlpha*(side?.46:.18)*(.38+.62*smoothstep(.04,.30,Math.abs(Math.sin(curPitch))));
            ctx.beginPath();let previous=null;
            for(let s=0;s<=RING_SEGMENTS;s++) {
              const q=projected[s];
              const front=q.visible&&q.dist<camZ;
              if(q.visible&&previous&&front===Boolean(side)) {
                ctx.moveTo(previous.x,previous.y);ctx.lineTo(q.x,q.y);
              }
              previous=q.visible?q:null;
            }
            ctx.stroke();
          }
        }
      }
      const openingTargets = window.innerWorldGalaxyTargets || (window.innerWorldGalaxyTargets = []);
      const exportOpeningStars = reelActive;
      if (exportOpeningStars) openingTargets.length = 0;
      // 4. Realistic Stellar Population
      for (let i = 0; i < STAR_COUNT; i++) {
        const idx = i * 6;
        const q = project3D(
          galaxyStars[idx],
          galaxyStars[idx + 1],
          galaxyStars[idx + 2],
          unit,
          camZ,
          curOrbit,
          curPitch,
          openingStarProjection[i]
        );
        if (q.visible) {
          if (exportOpeningStars && openingTargets.length < 480 && q.x > 0 && q.x < rw && q.y > 0 && q.y < rh) {
            openingTargets.push(openingStarProjection[i]);
          }
          if (!paintGalaxy) continue;
          const phase = galaxyStars[idx + 5];
          const twinkle = 0.85 + Math.sin(motionTime * 0.0011 + phase) * 0.15;
          const starSize = Math.min(4.2, Math.max(isMobile ? 0.65 : 0.55, galaxyStars[idx + 3] * (q.pers * 0.0042) * twinkle));

          ctx.globalAlpha = Math.min(1,baseAlpha*q.depthAlpha*twinkle*galaxyDepthWeight(q.dist,camZ));
          const radius=galaxyStarRadii[i],tint=galaxyStarTints[i];
          ctx.fillStyle=currentTheme==='light'&&radius<.8
            ?(i%5===0?spectrum.starlight:spectrum.stars[3])
            :(i%5===0?spectrum.bright:spectrum.stars[tint]);

          ctx.beginPath();
          ctx.arc(q.x, q.y, starSize, 0, Math.PI * 2);
          ctx.fill();

          if (starSize > 1.8) {
            ctx.fillStyle = spectrum.halo;
            ctx.beginPath();
            ctx.arc(q.x, q.y, starSize * 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (paintGalaxy) {
        // A few bright beacons punctuate the granular field without a wall of bloom.
        for(let i=0;i<STAR_COUNT;i+=47) {
          const q=openingStarProjection[i];
          if(!q.visible||q.x<0||q.x>rw||q.y<0||q.y>rh)continue;
          const r=Math.min(2.3,Math.max(.85,q.pers*.008));
          ctx.globalAlpha=baseAlpha*q.depthAlpha*.65;
          ctx.strokeStyle=spectrum.stars[0];ctx.lineWidth=.6;
          ctx.beginPath();ctx.moveTo(q.x-r*3,q.y);ctx.lineTo(q.x+r*3,q.y);
          ctx.moveTo(q.x,q.y-r*3);ctx.lineTo(q.x,q.y+r*3);ctx.stroke();
          ctx.fillStyle=spectrum.bright;ctx.fillRect(q.x-.6,q.y-.6,1.2,1.2);
        }

        drawLuminousMotes(unit,camZ,curOrbit,curPitch,baseAlpha,motionTime);
        drawSpatialNearStars(unit,camZ,curOrbit,curPitch,baseAlpha,atmosphereTime,galaxyDt);
      }

      // 5. Constellation Link Filaments (Fades in cleanly with Stage 2)
      const portalCoords = sectionPortals.map(portal => {
        const p=portalWorldPosition(portal);
        return project3D(p.x,p.y,p.z,unit,camZ,curOrbit,curPitch);
      });

      const constellationAlpha = smoothstep(0.18, 0.35, galaxyProgress);
      if(paintGalaxy&&constellationAlpha>.01)drawSectionConnections(portalCoords,baseAlpha*constellationAlpha,motionTime,unit,camZ,curOrbit,curPitch);

      // ========================================================
      // 6. PORTALS & DIFFRACTION SPIKES (100% UNCLUTTERED STAGE 1)
      // Only reveals when scrolling into Stage 2 so headline is pristine!
      // ========================================================
      renderedPortals.length = 0;
      renderedConstellations.length=0;
      const portalBloom = smoothstep(0.18, 0.35, galaxyProgress);
      const chipOpacity = portalBloom;
      const studyUI=window.studyFlight?String(smoothstep(4500,5200,window.studyFlightAge)):document.body.classList.contains('galaxy-arrived')?'1':'0';
      if(studyUI!==lastStudyUI){lastStudyUI=studyUI;document.documentElement.style.setProperty('--study-ui',studyUI);}
      const occupied=typeof galaxyChromeRects==='undefined'?[]:galaxyChromeRects;
      const cardTargets=[];
      portalChips.forEach((chip,i)=>{
        const q=portalCoords[i];chip.hidden=!galaxyCardCanShow(q,chipOpacity);
        if(chip.hidden)return;
        const metrics=portalLabelMetrics[i],portal=sectionPortals[i];
        if(metrics.mobile!==isMobile||!metrics.width) {
          metrics.mobile=isMobile;
          metrics.width=chip.offsetWidth||portal.label.length*(isMobile?6.6:7.2)+(isMobile?44:72);
          metrics.height=chip.offsetHeight||(isMobile?48:46);
        }
        const targetScale=galaxyCardDepthScale(q.dist,isMobile,galaxyMotion.matches);
        const scale=galaxyMotion.matches?1:Number.isFinite(metrics.scale)?metrics.scale+(targetScale-metrics.scale)*(1-Math.exp(-galaxyDt/140)):targetScale;
        metrics.scale=scale;
        const width=metrics.width*scale,height=metrics.height*scale;
        if(galaxyCardBottomLimit()-galaxyCardTopLimit()<height){chip.hidden=true;metrics.box=null;return;}
        // The horizontal offset changes continuously rather than flipping the card's anchor.
        const side=smoothstep(rw*.56,rw*.84,q.x);
        const x=q.x+24-side*(width+48);
        const offset=isMobile&&i===4?-36:(rh<500&&i===4?25:(rw<1000&&i===3?30:0));
        const targetOpacity=sectionGlow[i]>.5||galaxyMotion.matches?1:Math.max(isMobile?.95:.89,Math.min(1,1-(q.dist-5.3)*.025));
        const depthOpacity=SceneResponse.spring(metrics,'depthOpacity',targetOpacity,galaxyDt,120,galaxyMotion.matches);
        cardTargets.push({chip,metrics,x,y:q.y+offset,width,height,scale,depthOpacity});
      });
      const cardPositions=settleGalaxyCards(cardTargets,occupied,galaxyDt,galaxyMotion.matches);
      cardTargets.forEach(({chip,metrics,width,height,scale,depthOpacity},i)=>{
        const position=cardPositions[i];
        metrics.box={x:position.x,y:position.y-height/2,width,height};metrics.edge=false;
        chip.classList.remove('is-edge');chip.classList.add('is-visible');
        chip.style.transformOrigin='left center';
        const landing=window.studyFlight?smoothstep(4450+i*80,5000+i*40,window.studyFlightAge):1;chip.style.setProperty('--portal-landing-opacity',(chipOpacity*landing*depthOpacity).toFixed(3));chip.style.translate=`${position.x}px ${position.y+(1-landing)*10}px`;
        chip.style.transform=`translateY(-50%) scale(${scale.toFixed(4)}) perspective(700px) rotateX(var(--micro-rx,0deg)) rotateY(var(--micro-ry,0deg))`;
      });

      if (paintGalaxy && portalBloom > 0.01) {
        ctx.globalAlpha = portalBloom;

        for (let i = 0; i < sectionPortals.length; i++) {
          const portal = sectionPortals[i];
          const q = portalCoords[i];
          if (!q.visible) continue;

          const isAbout = (i === 0);
          const hitRadius = Math.max(isMobile ? 44 : 32, 28 * (q.pers * 0.005));
          const chip=portalChips[i],metrics=portalLabelMetrics[i];
          if(!chip.hidden && (metrics.mobile!==isMobile||!metrics.width)) {
            metrics.mobile=isMobile;
            metrics.width=chip.offsetWidth || portal.label.length*(isMobile?6.6:7.2)+(isMobile?44:72);
            metrics.height=chip.offsetHeight || (isMobile?44:46);
          }
          const edge=q.x>rw-(isMobile?152:205);
          const labelRect=chip.hidden?null:metrics.box;
          renderedPortals.push({x:q.x,y:q.y,r:hitRadius,href:portal.href,label:portal.label,labelRect});

          const isHovered = hoveredTarget && hoveredTarget.label === portal.label;
          const pulse = Math.sin(motionTime * 0.002 + i * 1.5) * 1.6;

          // Satellite stars form a designed, glowing constellation for each section.
          drawSectionConstellation(i,unit,camZ,curOrbit,curPitch,portalBloom);

          // Small stellar hubs: hover adds a quiet halo, no target rings.
          ctx.save();
          const strength=sectionGlow[i],size=(isAbout?26:18)+strength*12;
          ctx.globalAlpha=portalBloom*(.26+strength*.5);
          ctx.drawImage(constellationHalo(),q.x-size/2,q.y-size/2,size,size);
          if(strength>.01){
            ctx.globalAlpha=portalBloom*strength*.38;ctx.strokeStyle=palette.portalRingHover;ctx.lineWidth=.7;
            ctx.beginPath();ctx.arc(q.x,q.y,8+strength*3,0,Math.PI*2);ctx.stroke();
          }
          ctx.globalAlpha=portalBloom;
          ctx.fillStyle=strength>.3?palette.portalCoreHover:palette.portalCore;
          ctx.beginPath();ctx.arc(q.x,q.y,(isAbout?2.8:2.1)+strength*.6,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=palette.starCoreWhite;
          ctx.beginPath();ctx.arc(q.x,q.y,isAbout?1.2:.85,0,Math.PI*2);ctx.fill();
          ctx.restore();

          // Accessible DOM chips carry the destination names above the canvas.
        }
      }

      if (paintGalaxy) {
        ctx.restore();
        paintChapterAtmosphere();
        galaxyFrameMeter?.record(time,performance.now()-framePaintStart);
      }
      requestGalaxyFrame();
    }

    requestGalaxyFrame();

    // ================================================================
    // HIGH-SPEED TOUCH & DRAG ROUTER WITH GLIDE INERTIA
    // ================================================================
    const ROTATION_SENSITIVITY = 0.0045;
    const PITCH_SENSITIVITY = isMobile ? 0.0032 : 0.0035;

    let suppressGalaxyClick=false,hasGalaxyDragged=false,lastDragTime=0,galaxyPagePress=null;
    function beginGalaxyDrag(e,captureTarget=canvas) {
      if(e.button>0||e.isPrimary===false)return;
      isDragging = true;hasGalaxyDragged=false;
      startX = lastX = e.clientX;startY = lastY = e.clientY;
      startTime = lastDragTime = performance.now();isHorizontalGesture = false;
      dragVelX = dragVelY = 0;
      hoveredTarget=null;
      try { captureTarget.setPointerCapture(e.pointerId); } catch(err) {}
      canvas.classList.add('dragging');canvas.style.cursor='grabbing';
    }
    canvas.addEventListener('pointerdown',beginGalaxyDrag);
    // A label is part of the model, so desktop dragging can start there too.
    portalLayer.addEventListener('pointerdown',e=>{
      const chip=e.target.closest('.portal-chip');
      if(!chip||e.button>0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      if(sectionPortals[portalChips.indexOf(chip)]?.page){
        galaxyPagePress={chip,pointerId:e.pointerId,x:e.clientX,y:e.clientY,dragged:false};
        suppressGalaxyClick=false;hasGalaxyDragged=false;
        if(!isMobile&&e.pointerType!=='touch'){
          chip.focus({preventScroll:true});beginGalaxyDrag(e,chip);
        }
        return;
      }
      if(isMobile||e.pointerType==='touch')return;
      e.preventDefault();chip.focus({preventScroll:true});beginGalaxyDrag(e);
    });

    function moveGalaxyPointer(e) {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const totalDx = Math.abs(e.clientX - startX);
        const totalDy = Math.abs(e.clientY - startY);
        const wasOrbiting=hasGalaxyDragged;

        if (!isHorizontalGesture && totalDx > 6 && totalDx > totalDy) {
          isHorizontalGesture = true;
        }

        if(Math.hypot(totalDx,totalDy)>(isMobile?10:6))hasGalaxyDragged=true;
        if (hasGalaxyDragged && (isHorizontalGesture || !isMobile)) {
          if(galaxyCamera.selected)releaseGalaxyFocus();
          exploredOrbit=true;
          const deltaOrbit = (wasOrbiting?dx:e.clientX-startX) * ROTATION_SENSITIVITY;
          const deltaPitch = (wasOrbiting?dy:e.clientY-startY) * PITCH_SENSITIVITY;

          const now=performance.now(),elapsed=Math.max(4,Math.min(40,now-lastDragTime||1000/60));
          const velocityScale=(1000/60)/elapsed;
          const velocityEase=wasOrbiting?1-Math.exp(-elapsed/38):1;
          dragVelX+=(Math.max(-.05,Math.min(.05,deltaOrbit*velocityScale))-dragVelX)*velocityEase;
          dragVelY+=(Math.max(-.035,Math.min(.035,deltaPitch*velocityScale))-dragVelY)*velocityEase;
          lastDragTime=now;

          stage2Orbit += deltaOrbit;
          stage2Pitch = Math.max(-0.65, Math.min(0.65, stage2Pitch + deltaPitch));
        }

        lastX = e.clientX;
        lastY = e.clientY;
      }

      const lookRect=isDragging?null:canvas.getBoundingClientRect();
      if(lookRect&&e.pointerType!=='touch') {
        galaxyLookTargetX=((e.clientX-lookRect.left)/rw-.5)*.07;
        galaxyLookTargetY=((e.clientY-lookRect.top)/rh-.5)*.04;
      }
      hoveredTarget = isDragging?null:getPortalAtCoords(e.clientX, e.clientY,lookRect);
      canvas.style.cursor = isDragging?'grabbing':(hoveredTarget?'pointer':'grab');
    }
    canvas.addEventListener('pointermove',moveGalaxyPointer);
    portalLayer.addEventListener('pointermove',e=>{
      if(galaxyPagePress?.pointerId===e.pointerId&&isDragging)moveGalaxyPointer(e);
    });

    function endGalaxyPointer(e) {
      if(performance.now()-lastDragTime>110)dragVelX=dragVelY=0;
      const press=galaxyPagePress;
      if(press?.pointerId===e.pointerId){
        try { press.chip.releasePointerCapture(e.pointerId); } catch(err) {}
        press.dragged=hasGalaxyDragged||Math.hypot(e.clientX-press.x,e.clientY-press.y)>=(isMobile?10:6);
        isDragging=false;suppressGalaxyClick=false;
        canvas.classList.remove('dragging');canvas.style.cursor='grab';
        // The subsequent native click opens the anchor, unless this was a drag.
        return;
      }
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      canvas.classList.remove('dragging');
      suppressGalaxyClick=true;canvas.style.cursor='grab';
      if (isDragging) {
        isDragging = false;
        const moveDist = Math.hypot(e.clientX - startX, e.clientY - startY);
        const elapsed = performance.now() - startTime;

        if (!hasGalaxyDragged && moveDist < (isMobile?10:6) && elapsed < 550) {
          const hit = getPortalAtCoords(e.clientX, e.clientY);
          if (hit) {
            activateGalaxyPortal(hit,hit.card===true);
          }
        }
      }
    }
    canvas.addEventListener('pointerup',endGalaxyPointer);
    portalLayer.addEventListener('pointerup',e=>{
      if(galaxyPagePress?.pointerId===e.pointerId)endGalaxyPointer(e);
    });

    canvas.addEventListener('pointerleave',()=>{galaxyLookTargetX=0;galaxyLookTargetY=0;hoveredTarget=null;});

    canvas.addEventListener('pointercancel', e => {
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      isDragging = false;hasGalaxyDragged=false;suppressGalaxyClick=true;
      dragVelX=dragVelY=0;canvas.style.cursor='grab';
      canvas.classList.remove('dragging');
    });
    portalLayer.addEventListener('pointercancel',e=>{
      if(galaxyPagePress?.pointerId!==e.pointerId)return;
      try { galaxyPagePress.chip.releasePointerCapture(e.pointerId); } catch(err) {}
      galaxyPagePress.dragged=true;isDragging=false;suppressGalaxyClick=false;
      dragVelX=dragVelY=0;canvas.classList.remove('dragging');canvas.style.cursor='grab';
    });

    canvas.addEventListener('click', e => {
      if(suppressGalaxyClick&&e.detail!==0){suppressGalaxyClick=false;return;}
      suppressGalaxyClick=false;
      const hit = getPortalAtCoords(e.clientX, e.clientY);
      if (hit) {
        activateGalaxyPortal(hit,hit.card===true,e.detail!==0);
      }
    });



    // Compact reading compass: preserves navigation while showing where the visitor is.
    const navWrap = document.querySelector('.nav-wrap');
    const navPill = document.querySelector('.nav-pill');
    const navJump = document.getElementById('nav-jump');
    const navCurrent = document.getElementById('nav-current');
    const navOutline = document.getElementById('nav-outline-progress');
    const navOutlineFill = document.getElementById('nav-outline-fill');
    const navSectionLinks = [...document.querySelectorAll('.nav-links a')];
    let outlineLength = 0;
    let currentProgress = 0;
    const progressStops = [
      ['about', 'ABOUT'],
      ['education', 'BACKGROUND'],
      ['experience', 'EXPERIENCE'],
      ['skills', 'SKILLS'],
      ['projects', 'PROJECTS'],
      ['contact', 'CONTACT']
    ];
    function shapeReadingOutline() {
      // The SVG is inside the pill's border box. Measure its own viewport so
      // the outline cannot acquire a cream gutter when the capsule resizes.
      const { width: w, height: h } = navOutline.getBoundingClientRect();
      const edge = 1.5, right = w - edge, bottom = h - edge;
      const radius = (h - edge * 2) / 2, middle = w / 2;
      const path = `M ${middle} ${edge} H ${right - radius} A ${radius} ${radius} 0 0 1 ${right} ${edge + radius} V ${bottom - radius} A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom} H ${edge + radius} A ${radius} ${radius} 0 0 1 ${edge} ${bottom - radius} V ${edge + radius} A ${radius} ${radius} 0 0 1 ${edge + radius} ${edge} H ${middle}`;
      navOutline.setAttribute('viewBox', `0 0 ${w} ${h}`);
      navOutlineFill.setAttribute('d', path);
      outlineLength = navOutlineFill.getTotalLength();
      navOutlineFill.style.strokeDasharray = `${(outlineLength * currentProgress).toFixed(2)} ${outlineLength + 2}`;
      navOutlineFill.style.strokeDashoffset = '0';
    }
    if ('ResizeObserver' in window) new ResizeObserver(shapeReadingOutline).observe(navOutline);
    else window.addEventListener('resize', shapeReadingOutline, { passive: true });
    shapeReadingOutline();
    let navSizeAnimation=null,navThemeAnimation=null,navGhost=null,navGhostAnimation=null;
    const navContentAnimations=new Map();
    const navMotionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
    function clearNavigationMorph() {
      navSizeAnimation?.cancel();navThemeAnimation?.cancel();navGhostAnimation?.cancel();
      navSizeAnimation=navThemeAnimation=navGhostAnimation=null;
      navGhost?.remove();navGhost=null;
      navContentAnimations.forEach(animation=>animation.cancel());navContentAnimations.clear();
    }
    function setNavigationCompact(compact) {
      if(navWrap.classList.contains('is-compact')===compact)return;
      const animated=!navMotionPreference.matches&&!root.classList.contains('micro-keyboard')&&typeof navPill.animate==='function';
      const before=navPill.getBoundingClientRect(),beforeTheme=themeBtn.getBoundingClientRect();
      const links=document.querySelector('.nav-links'),oldLinks=links?.getBoundingClientRect();
      clearNavigationMorph();
      // The outgoing text is decorative; real navigation switches immediately.
      if(animated&&compact&&oldLinks?.width&&typeof links.cloneNode==='function') {
        navGhost=links.cloneNode(true);navGhost.setAttribute('aria-hidden','true');navGhost.inert=true;
        navGhost.classList.add('nav-morph-ghost');
        navGhost.querySelectorAll?.('a,button,[tabindex]').forEach(node=>node.setAttribute('tabindex','-1'));
        navGhost.style.cssText=`position:fixed;left:${oldLinks.left}px;top:${oldLinks.top}px;width:${oldLinks.width}px;height:${oldLinks.height}px;margin:0;z-index:101;pointer-events:none;display:flex;`;
        document.body.appendChild(navGhost);
        const ghost=navGhost;navGhostAnimation=ghost.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],{duration:160,easing:'ease-out'});
        navGhostAnimation.onfinish=()=>{ghost.remove();if(navGhost===ghost)navGhost=null;};
      }
      navWrap.classList.toggle('is-compact',compact);
      window.updateThemeDock?.();
      if(!animated)return;
      const after=navPill.getBoundingClientRect();
      const morphTiming={duration:440,easing:'cubic-bezier(.22,1,.36,1)'};
      if(Math.abs(before.width-after.width)>.5) {
        navSizeAnimation=navPill.animate([{width:`${before.width}px`},{width:`${after.width}px`}],morphTiming);
      }
      // The capsule's starting width changes the switch's position in its new slot.
      const dockStart=themeBtn.getBoundingClientRect();
      const dockX=beforeTheme.left-dockStart.left,dockY=beforeTheme.top-dockStart.top;
      if(Math.hypot(dockX,dockY)>1) {
        navThemeAnimation=themeBtn.animate([{translate:`${dockX}px ${dockY}px`},{translate:'0px 0px'}],morphTiming);
      }
      const content=compact?[document.querySelector('.brand'),navCurrent,navJump]:[document.querySelector('.brand'),links,document.querySelector('.status-badge')];
      content.filter(Boolean).forEach(element=>{
        if(typeof element.animate!=='function')return;
        const animation=element.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,delay:compact?70:100,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
        navContentAnimations.set(element,animation);animation.onfinish=()=>{if(navContentAnimations.get(element)===animation)navContentAnimations.delete(element);};
      });
    }
    navMotionPreference.addEventListener?.('change',()=>{if(navMotionPreference.matches)clearNavigationMorph();});
    window.addEventListener?.('resize',clearNavigationMorph,{passive:true});

    let navFrame = 0;
    function updateReadingCompass() {
      navFrame = 0;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight - trackTop);
      const galaxyScroll = Math.max(0, window.scrollY - trackTop);
      const percent = Math.max(0, Math.min(100, galaxyScroll / maxScroll * 100));
      // Keep the full row throughout the galaxy; the reading compass belongs
      // to the portfolio chapters, not a second galaxy scroll frame.
      const compactBefore=navWrap.classList.contains('is-compact');
      const inChapters=document.getElementById('about').getBoundingClientRect().top<=window.innerHeight*.42+(compactBefore?24:-12);
      setNavigationCompact(inChapters);
      if (!inChapters && window.innerWidth > 800) navJump.open = false;
      currentProgress = percent / 100;
      navOutlineFill.style.strokeDasharray = `${(outlineLength * currentProgress).toFixed(2)} ${outlineLength + 2}`;
      let current = 'GALAXY', currentId = '';
      for (const [id, label] of progressStops) {
        if (document.getElementById(id).getBoundingClientRect().top <= window.innerHeight * 0.42) { current = label; currentId = id; }
      }
      if (!currentId) current = 'GALAXY';
      navCurrent.textContent = current;
      navSectionLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleReadingCompass() {
      if (!navFrame) navFrame = requestAnimationFrame(updateReadingCompass);
    }
    window.addEventListener('scroll', scheduleReadingCompass, { passive: true });
    window.addEventListener('resize', scheduleReadingCompass, { passive: true });
    window.addEventListener('project-story-layout', scheduleReadingCompass);
    navJump.addEventListener('click', event => {
      if (event.target.closest('a')) navJump.open = false;
    });
    document.addEventListener('click', event => {
      if (!navJump.contains(event.target)) navJump.open = false;
    });
    scheduleReadingCompass();

    // Domain filters retain the actual study nodes and their research drawers.
    function installProjectFilters() {
      const grid=document.getElementById('project-grid');
      if(!grid)return;
      const buttons=[...grid.querySelectorAll('[data-project-filter]')];
      const cards=[...grid.querySelectorAll('[data-project-domain]')];
      const counter=document.getElementById('project-study-count');
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      const animations=new Map();
      let active='all';
      buttons.forEach(button=>button.addEventListener('click',()=>{
        const domain=button.dataset.projectFilter;
        if(domain===active)return;
        active=domain;grid.dataset.filter=domain;
        buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
        const visible=cards.filter(card=>domain==='all'||card.dataset.projectDomain.split(' ').includes(domain));
        cards.forEach(card=>{
          animations.get(card)?.cancel();animations.delete(card);
          const show=visible.includes(card);
          card.hidden=!show;card.inert=!show;
          card.classList.toggle('is-filter-last',domain!=='all'&&visible.length%2===1&&card===visible.at(-1));
          if(show) {
            card.classList.add('is-visible');
            if(!reduced.matches&&!card.dataset.sequenceItem&&typeof card.animate==='function') {
              const animation=card.animate([{opacity:.4},{opacity:1}],{duration:180,easing:'ease-out'});
              animations.set(card,animation);
              animation.onfinish=()=>{if(animations.get(card)===animation)animations.delete(card);};
            }
          }
        });
        counter.textContent=`${visible.length} of ${cards.length} studies`;
      }));
    }
    installProjectFilters();

    // The ray reaches each node at the same scroll threshold as its entry reveal.
    function timelineRayFrame(travel,firstRead,stride,centres) {
      if(centres.length<2)return {head:centres[0]||0,length:0,opacity:0,index:0};
      travel=Math.max(0,travel);stride=Math.max(1,stride);firstRead=Math.max(1,firstRead);
      const ease=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
      let index=0,head=centres[0],opacity=travel>0?1:0;
      if(travel<=firstRead) {
        const t=ease(travel/firstRead);head=centres[0]+(centres[1]-centres[0])*t;
        if(travel===firstRead)index=1;
      } else {
        index=Math.min(centres.length-1,1+Math.floor((travel-firstRead)/stride));
        const at=firstRead+(index-1)*stride;
        if(index<centres.length-1)head=centres[index]+(centres[index+1]-centres[index])*ease((travel-at)/stride);
        else {head=centres[index];opacity=1-ease((travel-at)/(stride*.35));}
      }
      const length=Math.min(44,Math.max(0,head-centres[0]));
      return {head,length,opacity:opacity*Math.min(1,length/8),index};
    }

    // Hold the original Background composition while its records accumulate.
    function installBackgroundHold() {
      if(typeof ResizeObserver!=='function'||typeof requestAnimationFrame!=='function')return;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
      const heading=document.getElementById('education'),section=document.querySelector('.background-reading');
      const records=section?.querySelector('.background-records'),timeline=records?.querySelector('.reading-timeline');
      if(!heading||!section||!records||!timeline)return;
      const rows=[...timeline.children];if(rows.length<2)return;
      const certifications=records.querySelector('.certifications');
      const parent=heading.parentNode,track=document.createElement('div'),pin=document.createElement('div');
      track.className='background-scroll-track';pin.className='background-scroll-pin';
      track.style.marginTop=window.getComputedStyle(heading).marginTop;
      parent.insertBefore(track,heading);track.appendChild(pin);pin.append(heading,section);
      const tail=document.createElement('div');tail.className='background-certification-tail';
      if(certifications){parent.insertBefore(tail,track.nextSibling);tail.appendChild(certifications);}
      track.classList.add('is-background-held');timeline.dataset.backgroundHeld='true';
      rows.forEach(row=>{row.dataset.sequenceItem='true';row.classList.add('sequence-item');});
      let frameId=0,needsMeasure=true,disabled=false,start=0,stride=1,firstRead=0,run=0,viewHeight=0,geometry=[],previousHeight=0,rayCentres=[],energized=-1;
      const clamp=value=>Math.max(0,Math.min(1,value));
      const ease=value=>{const t=clamp(value);return t*t*(3-2*t);};
      const localTop=(node,ancestor)=>{let y=0;for(let current=node;current&&current!==ancestor;current=current.offsetParent)y+=current.offsetTop||0;return y;};
      const notifyLayout=()=>window.dispatchEvent?.(new Event('background-story-layout'));
      function restore() {
        if(disabled)return;
        disabled=true;cancelAnimationFrame(frameId);sizes.disconnect();
        rows.forEach(row=>row.classList.add('sequence-ready'));
        delete timeline.dataset.backgroundHeld;
        records.style.height='';timeline.style.removeProperty('--background-timeline-pan');
        ['--timeline-ray-left','--timeline-ray-y','--timeline-ray-length','--timeline-ray-opacity'].forEach(key=>timeline.style.removeProperty(key));
        rows.forEach(row=>row.classList.remove('timeline-energized'));
        parent.insertBefore(heading,track);parent.insertBefore(section,track);
        if(certifications)records.appendChild(certifications);
        tail.remove();track.remove();
        delete window.backgroundScrollAnchor;notifyLayout();
      }
      function measure() {
        needsMeasure=false;if(disabled)return;
        const nav=document.querySelector('.nav-wrap');
        const top=Math.max(80,(nav?.getBoundingClientRect().bottom||80)+16);
        const stageHeight=innerHeight-top-24;
        const bottom=parseFloat(window.getComputedStyle(section).paddingBottom)||0;
        viewHeight=stageHeight-localTop(records,pin)-bottom;
        // Keep the ordinary accessible document when a short screen cannot fit it.
        if(viewHeight<140){restore();return;}
        pin.style.top=top+'px';pin.style.height=stageHeight+'px';records.style.height=viewHeight+'px';
        geometry=rows.map(row=>({top:row.offsetTop,bottom:row.offsetTop+row.offsetHeight}));
        rayCentres=rows.map((row,index)=>{
          const dot=window.getComputedStyle(row,'::before');
          const extra=dot.boxSizing==='border-box'?0:['borderTopWidth','borderBottomWidth','paddingTop','paddingBottom'].reduce((sum,key)=>sum+(parseFloat(dot[key])||0),0);
          return row.offsetTop+(parseFloat(dot.top)||(index?32:14))+((parseFloat(dot.height)||11)+extra)/2;
        });
        const rail=window.getComputedStyle(timeline,'::before');
        timeline.style.setProperty('--timeline-ray-left',((parseFloat(rail.left)||6)+(parseFloat(rail.width)||1.5)/2)+'px');
        stride=Math.max(360,innerHeight*.65,...rows.map(row=>row.offsetHeight*.85));
        firstRead=Math.max(80,stride*.22,Math.max(0,geometry[0].bottom-viewHeight)+80);
        run=firstRead+(rows.length-2)*stride+stride*.65+Math.min(180,innerHeight*.2);
        const height=stageHeight+run;track.style.height=height+'px';
        start=track.getBoundingClientRect().top+window.scrollY-top;
        if(height!==previousHeight){previousHeight=height;notifyLayout();}
      }
      function render() {
        frameId=0;if(disabled)return;
        if(needsMeasure)measure();if(disabled)return;
        const travel=Math.max(0,window.scrollY-start);
        rows[0].classList.add('sequence-ready');
        let pan=Math.max(0,geometry[0].bottom-viewHeight)*ease(travel/firstRead);
        for(let index=1;index<rows.length;index++) {
          const at=firstRead+(index-1)*stride;
          if(travel<at)break;
          rows[index].classList.add('sequence-ready');
          const before=Math.max(0,geometry[index-1].bottom-viewHeight);
          const after=Math.max(0,geometry[index].bottom-viewHeight);
          pan=before+(after-before)*ease((travel-at)/(stride*.55));
        }
        timeline.style.setProperty('--background-timeline-pan',(-pan).toFixed(2)+'px');
        const ray=timelineRayFrame(travel,firstRead,stride,rayCentres);
        timeline.style.setProperty('--timeline-ray-y',(ray.head-ray.length).toFixed(2)+'px');
        timeline.style.setProperty('--timeline-ray-length',ray.length.toFixed(2)+'px');
        timeline.style.setProperty('--timeline-ray-opacity',ray.opacity.toFixed(3));
        const node=travel>0?ray.index:-1;
        if(energized!==node){energized=node;rows.forEach((row,index)=>row.classList.toggle('timeline-energized',index===node));if(node>=0)window.dispatchEvent(new CustomEvent('portfolio-timeline-arrival',{detail:{row:rows[node],index:node}}));}
      }
      function schedule(){if(!disabled&&!frameId)frameId=requestAnimationFrame(render);}
      function resize(){needsMeasure=true;schedule();}
      const sizes=new ResizeObserver(resize);[heading,section,timeline].forEach(node=>sizes.observe(node));
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize,{passive:true});
      certifications?.addEventListener('toggle',notifyLayout);
      document.fonts?.ready.then(resize);
      reduced.addEventListener?.('change',event=>{if(event.matches)restore();});
      window.backgroundScrollAnchor=target=>{
        if(disabled||target!==heading)return undefined;
        if(needsMeasure)measure();if(disabled)return undefined;
        rows.forEach((row,index)=>row.classList.toggle('sequence-ready',index===0));
        timeline.style.setProperty('--background-timeline-pan','0px');
        timeline.style.setProperty('--timeline-ray-opacity','0');energized=-1;rows.forEach(row=>row.classList.remove('timeline-energized'));
        return Math.max(0,start);
      };
      measure();render();
    }
    installBackgroundHold();

    /* V7_3_PROJECT_STACK_START */
    // Natural document scrolling carries each project over the previous sheet.
    function projectStackPose(nextTop,top,height) {
      const n=Math.max(0,Math.min(1,(height-(nextTop-top))/Math.max(1,height)));
      const cover=n*n*(3-2*n);
      return {scale:1-cover*.026,y:-cover*5,tilt:-cover*.35};
    }
    function installProjectsHold() {
      const grid=document.getElementById('project-grid'),heading=document.getElementById('projects');
      if(!grid||!heading||typeof ResizeObserver!=='function')return;
      const cards=[...grid.querySelectorAll('[data-project-domain]')];if(!cards.length)return;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
      const wideViewport=matchMedia('(min-width: 801px)');
      const stage=document.createElement('div');stage.className='project-stack-stage';
      grid.appendChild(stage);cards.forEach(card=>stage.appendChild(card));
      grid.classList.add('reference-project-stack');grid.dataset.projectsHeld='true';
      cards.forEach((card,i)=>{card.dataset.sequenceItem='true';card.classList.add('sequence-item','sequence-ready');card.style.setProperty('--stack-layer',String(i+1));});
      let frame=0,dirty=true,visible=cards,stickTops=[],stacked=false,animate=false,inView=true,top=110,lastMode='';
      let toolbarTop=0,lastHeight=0;
      const notify=()=>window.dispatchEvent(new Event('project-story-layout'));
      function measure(){
        dirty=false;visible=cards.filter(card=>!card.hidden);
        const nav=document.querySelector('.nav-pill')?.getBoundingClientRect();
        const toolbar=grid.querySelector('.project-toolbar');
        const headerBottom=Math.max(72,nav?.bottom||72);
        toolbarTop=headerBottom+12;
        top=toolbarTop+(toolbar?.offsetHeight||0)+16;
        const available=innerHeight-top-32-Math.min(3,visible.length-1)*7;
        animate=!reduced.matches&&!forced.matches;
        stacked=animate&&wideViewport.matches&&visible.length>1&&available>240&&visible.every(card=>card.offsetHeight<=available);
        const mode=stacked?'stack':animate?'reveal':'flow';grid.dataset.stackMode=mode;
        stickTops=visible.map((card,i)=>top+Math.min(i,3)*7);
        visible.forEach((card,i)=>card.style.setProperty('--project-stick-top',stickTops[i]+'px'));
        lastHeight=visible.at(-1)?.offsetHeight||0;
        if(mode!==lastMode){lastMode=mode;notify();}
      }
      function render(){
        frame=0;if(dirty)measure();
        if(!animate)return;
        const boxes=stacked?visible.map(card=>card.getBoundingClientRect()):[];
        if(stacked){
          // The final visible sheet and its toolbar leave the viewport together.
          const lastNaturalTop=stage.getBoundingClientRect().bottom-lastHeight;
          const release=Math.min(0,lastNaturalTop-stickTops.at(-1));
          grid.style.setProperty('--project-toolbar-top',(toolbarTop+release)+'px');
        }
        const stageTop=stacked?0:stage.getBoundingClientRect().top;
        const viewportHeight=innerHeight;
        const poses=visible.map((card,i)=>{
          if(stacked){
            return i<visible.length-1?projectStackPose(boxes[i+1].top,stickTops[i],card.offsetHeight):{scale:1,y:0,tilt:0};
          }
          // Keep each card in document flow so its title and action can scroll into view.
          const cardTop=stageTop+card.offsetTop;
          const entry=Math.max(0,Math.min(1,(viewportHeight-cardTop)/Math.min(160,viewportHeight*.25)));
          const remaining=1-entry*entry*(3-2*entry);
          return {scale:1-.015*remaining,y:10*remaining,tilt:0};
        });
        visible.forEach((card,i)=>{
          const pose=poses[i];
          card.style.setProperty('--stack-scale',pose.scale.toFixed(4));
          card.style.setProperty('--stack-y',pose.y.toFixed(2)+'px');
          card.style.setProperty('--stack-tilt',pose.tilt.toFixed(3)+'deg');
        });
      }
      function schedule(){if(!frame&&(inView||dirty))frame=requestAnimationFrame(render);}
      function resize(){dirty=true;schedule();}
      const sizes=new ResizeObserver(resize);[grid,heading,...cards].forEach(node=>sizes.observe(node));
      if(typeof MutationObserver==='function')new MutationObserver(resize).observe(grid,{subtree:true,attributes:true,attributeFilter:['hidden']});
      if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);if(inView)schedule();},{rootMargin:'120px'}).observe(grid);
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize,{passive:true});
      window.addEventListener('background-story-layout',resize);document.fonts?.ready.then(resize);
      reduced.addEventListener?.('change',resize);forced.addEventListener?.('change',resize);
      grid.addEventListener('click',event=>{
        if(!event.target.closest?.('[data-project-filter]'))return;
        resize();
        const nav=document.querySelector('.nav-pill')?.getBoundingClientRect();
        const y=grid.getBoundingClientRect().top+window.scrollY-Math.max(84,(nav?.bottom||72)+12);
        window.scrollTo({top:Math.max(0,y),behavior:'instant'});
      });
      grid.addEventListener('focusin',event=>{
        const card=event.target.closest?.('[data-project-domain]');if(!card||card.hidden)return;
        if(dirty)measure();
        if(!stacked||!document.documentElement.classList.contains('micro-keyboard'))return;
        // Read a covered card from its natural document slot when reached by Tab.
        const y=stage.getBoundingClientRect().top+window.scrollY+card.offsetTop-top;
        window.scrollTo({top:Math.max(0,y),behavior:'instant'});schedule();
      });
      window.projectScrollAnchor=target=>{
        if(target!==heading)return undefined;if(dirty)measure();
        const nav=document.querySelector('.nav-pill')?.getBoundingClientRect();
        return Math.max(0,heading.getBoundingClientRect().top+window.scrollY-Math.max(88,(nav?.bottom||72)+20));
      };
      measure();render();
    }
    installProjectsHold();

    /* V7_3_PROJECT_STACK_END */

    // Cumulative reading: start with one entry, then retain each revealed entry.
    function installReadingSequences() {
      if(typeof requestAnimationFrame!=='function')return;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      if(reduced.matches)return;
      const timeline=document.querySelector('.background-reading .reading-timeline');
      const grid=document.getElementById('project-grid');
      const groups=[timeline,grid].filter(container=>container&&!container.dataset?.backgroundHeld&&!container.dataset?.projectsHeld).map(container=>({container,
        items:container===timeline?[...timeline.children]:[...container.querySelectorAll('[data-project-domain]')]}));
      const items=groups.flatMap(group=>group.items);
      if(!items.length)return;
      let thresholds=[],frameId=0,needsMeasure=false,disabled=false;
      const reveal=node=>{
        if(node.classList.contains('sequence-ready'))return;
        node.classList.add('sequence-ready');
      };
      const documentTop=node=>{let top=0;for(let current=node;current;current=current.offsetParent)top+=current.offsetTop||0;return top;};
      items.forEach(node=>{node.dataset.sequenceItem='true';node.classList.add('sequence-item');});
      function measure() {
        needsMeasure=false;thresholds=[];
        const nav=document.querySelector('.nav-wrap');
        const top=Math.max(80,(nav?.getBoundingClientRect().bottom||80)+16);
        const interval=Math.min(160,innerHeight*.22);
        groups.forEach(group=>{
          const visible=group.items.filter(node=>!node.hidden);
          if(!visible.length)return;
          reveal(visible[0]);
          const arrival=documentTop(visible[0])-top;
          visible.slice(1).forEach((node,index)=>thresholds.push({node,
            at:Math.max(arrival+(index+1)*interval,documentTop(node)-innerHeight*.78)}));
        });
      }
      function render() {
        frameId=0;if(disabled)return;
        if(needsMeasure)measure();
        thresholds.forEach(entry=>{if(window.scrollY>=entry.at)reveal(entry.node);});
      }
      function schedule(){if(!disabled&&!frameId)frameId=requestAnimationFrame(render);}
      function resize(){needsMeasure=true;schedule();}
      const sizes=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
      groups.forEach(group=>sizes?.observe(group.container));
      const mutations=typeof MutationObserver==='function'&&grid?new MutationObserver(resize):null;
      mutations?.observe(grid,{subtree:true,attributes:true,attributeFilter:['hidden']});
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize,{passive:true});
      window.addEventListener('background-story-layout',resize);
      document.fonts?.ready.then(resize);
      document.addEventListener('focusin',event=>{
        const node=event.target.closest?.('[data-sequence-item]');if(node&&!node.hidden)reveal(node);
      });
      reduced.addEventListener?.('change',event=>{
        if(!event.matches)return;
        items.forEach(reveal);disabled=true;cancelAnimationFrame(frameId);sizes?.disconnect();mutations?.disconnect();
      });
      measure();render();
    }
    installReadingSequences();

    installChapterMotion();

    // V7.2 feedback layer: event-driven, finite animations; no additional render loop.
    function installGlassInteractions() {
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
      const running=new Map(), controls=[];
      const animate=(element,frames,options)=>{
        running.get(element)?.cancel();running.delete(element);
        if(reduced.matches||root.classList.contains('micro-keyboard')||typeof element.animate!=='function')return;
        const animation=element.animate(frames,options);running.set(element,animation);
        animation.onfinish=()=>{if(running.get(element)===animation)running.delete(element);};
        return animation;
      };
      document.addEventListener('keydown',event=>{if(['Tab','Enter',' ','PageDown','PageUp','Home','End','ArrowDown','ArrowUp'].includes(event.key))root.classList.add('micro-keyboard');},true);
      document.addEventListener('pointerdown',()=>root.classList.remove('micro-keyboard'),true);
      function glass(element,tone='blue') {
        if(!element||element.classList.contains('micro-glass'))return;
        element.classList.add('micro-glass');element.dataset.tone=tone;
        const film=document.createElement('span');film.className='micro-sheen-clip';film.setAttribute('aria-hidden','true');
        const sheen=document.createElement('span');sheen.className='micro-sheen';film.appendChild(sheen);element.appendChild(film);
        const state={element,frame:0,ripple:null,rippleAnimation:null};controls.push(state);
        const clearRipple=()=>{state.rippleAnimation?.cancel();state.rippleAnimation=null;state.ripple?.remove();state.ripple=null;};
        const reset=()=>{
          if(state.frame)cancelAnimationFrame(state.frame);state.frame=0;
          element.classList.remove('is-glass-lit');element.style.setProperty('--micro-rx','0deg');element.style.setProperty('--micro-ry','0deg');
        };
        state.reset=reset;state.clearRipple=clearRipple;
        element.addEventListener('pointerenter',event=>{if(fine.matches&&!reduced.matches&&event.pointerType!=='touch')element.classList.add('is-glass-lit');});
        element.addEventListener('pointermove',event=>{
          if(!fine.matches||reduced.matches||event.pointerType==='touch')return;
          state.x=event.clientX;state.y=event.clientY;
          if(state.frame)return;
          state.frame=requestAnimationFrame(()=>{
            state.frame=0;const rect=element.getBoundingClientRect();if(!rect.width||!rect.height)return;
            const x=Math.max(0,Math.min(rect.width,state.x-rect.left)),y=Math.max(0,Math.min(rect.height,state.y-rect.top));
            element.style.setProperty('--micro-x',`${x}px`);element.style.setProperty('--micro-y',`${y}px`);
            if(element.classList.contains('portal-chip')) {
              element.style.setProperty('--micro-rx',`${((.5-y/rect.height)*3.6).toFixed(2)}deg`);
              element.style.setProperty('--micro-ry',`${((x/rect.width-.5)*3.6).toFixed(2)}deg`);
            }
          });
        },{passive:true});
        element.addEventListener('pointerleave',reset);element.addEventListener('pointercancel',()=>{reset();clearRipple();});
        element.addEventListener('pointerdown',event=>{
          if(event.button!==0||reduced.matches||element.classList.contains('nav-pill'))return;
          clearRipple();const rect=element.getBoundingClientRect(),size=Math.max(rect.width,rect.height)*2.1;
          if(!size||typeof element.animate!=='function')return;
          const ripple=document.createElement('span');ripple.className='micro-ripple';ripple.setAttribute('aria-hidden','true');
          ripple.style.cssText=`width:${size}px;height:${size}px;left:${event.clientX-rect.left-size/2}px;top:${event.clientY-rect.top-size/2}px;`;
          film.appendChild(ripple);state.ripple=ripple;
          state.rippleAnimation=ripple.animate([{opacity:.8,transform:'scale(.15)'},{opacity:0,transform:'scale(1)'}],{duration:580,easing:'cubic-bezier(.16,1,.3,1)'});
          state.rippleAnimation.onfinish=clearRipple;
        });
      }
      const tones=['blue','teal','teal','warm','blue','warm','warm'];
      document.querySelectorAll('.portal-chip').forEach((element,i)=>glass(element,tones[i]));
      document.querySelectorAll('.identity-social-link').forEach((element,i)=>glass(element,['blue','teal','warm'][i%3]));
      document.querySelectorAll('#main-content .inspect-btn').forEach(element=>{
        const text=element.textContent.trim(),arrow=text.endsWith('↗');
        element.textContent='';const label=document.createElement('span');label.textContent=arrow?text.slice(0,-1).trim():text;element.appendChild(label);
        if(arrow){const glyph=document.createElement('span');glyph.className='micro-arrow';glyph.textContent='↗';glyph.setAttribute('aria-hidden','true');element.appendChild(glyph);}
        const domain=element.closest('[data-project-domain]')?.dataset.projectDomain||'ml';
        glass(element,domain==='inference'?'warm':domain.includes('ml')?'teal':'blue');
      });
      glass(document.querySelector('.nav-pill'));
      glass(document.getElementById('model-return'),'teal');
      glass(document.getElementById('galaxy-note'),'warm');
      document.querySelectorAll('.nav-links > a,.nav-jump-panel > a').forEach(link=>{
        const label=link.textContent.trim();link.setAttribute('aria-label',label);link.textContent='';
        const windowEl=document.createElement('span');windowEl.className='micro-label-window';windowEl.setAttribute('aria-hidden','true');
        const stack=document.createElement('span');stack.className='micro-label-stack';
        for(let i=0;i<2;i++){const copy=document.createElement('span');copy.textContent=label;stack.appendChild(copy);}
        windowEl.appendChild(stack);link.appendChild(windowEl);
      });
      function markerFor(host,className,selector) {
        if(!host)return;
        const marker=document.createElement('span');marker.className=className;marker.setAttribute('aria-hidden','true');host.appendChild(marker);
        let last='',hovered=null,frame=0,shown=false;
        const render=()=>{
          frame=0;const target=hovered||host.querySelector(selector),rect=host.getBoundingClientRect();
          if(!target||!rect.width||!rect.height){running.get(marker)?.cancel();marker.style.opacity='0';shown=false;last='';return;}
          const to=target.getBoundingClientRect(),x=to.left-rect.left,y=to.top-rect.top;
          const key=[x,y,to.width,to.height].join(':');if(last===key)return;
          const from=marker.getBoundingClientRect();running.get(marker)?.cancel();
          marker.style.width=`${to.width}px`;marker.style.height=`${to.height}px`;marker.style.transform=`translate(${x}px,${y}px)`;marker.style.opacity='1';
          if(shown&&to.width&&to.height)animate(marker,[
            {transform:`translate(${from.left-rect.left}px,${from.top-rect.top}px) scale(${from.width/to.width},${from.height/to.height})`},
            {transform:`translate(${x}px,${y}px) scale(1,1)`}
          ],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});
          last=key;shown=true;host.classList.add('has-glass-marker');
        };
        const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
        host.querySelectorAll('a,button').forEach(link=>{
          if(className!=='micro-nav-marker')return;
          link.addEventListener('pointerenter',()=>{if(fine.matches){hovered=link;schedule();}});
        });
        host.addEventListener('pointerleave',()=>{hovered=null;schedule();});
        new MutationObserver(schedule).observe(host,{subtree:true,attributes:true,attributeFilter:['aria-current','aria-pressed']});
        if('ResizeObserver' in window)new ResizeObserver(()=>{last='';schedule();}).observe(host);
        document.fonts?.ready.then(()=>{last='';schedule();});
        reduced.addEventListener?.('change',()=>{running.get(marker)?.cancel();last='';schedule();});schedule();
      }
      markerFor(document.querySelector('.nav-links'),'micro-nav-marker','a[aria-current="location"]');
      markerFor(document.querySelector('.project-filters'),'micro-filter-marker','button[aria-pressed="true"]');
      const count=document.getElementById('project-study-count');
      if(count)new MutationObserver(()=>animate(count,[{transform:'translateY(6px)',opacity:.45},{transform:'translateY(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'})).observe(count,{childList:true,characterData:true,subtree:true});
      document.querySelectorAll('#project-grid .bento-card').forEach(card=>{
        const track=document.createElement('span');track.className='micro-dossier-track';track.setAttribute('aria-hidden','true');
        const ray=document.createElement('span');ray.className='micro-dossier-ray';track.appendChild(ray);card.insertBefore(track,card.lastElementChild);
        card.addEventListener('pointerenter',()=>{if(fine.matches&&!reduced.matches)card.classList.add('is-dossier-lit');});
        card.addEventListener('pointerleave',()=>card.classList.remove('is-dossier-lit'));
      });
      const note=document.getElementById('galaxy-note');
      new MutationObserver(()=>{
        if(document.body.classList.contains('galaxy-arrived')&&!reduced.matches)note.classList.add('is-glass-lit');else note.classList.remove('is-glass-lit');
      }).observe(document.body,{attributes:true,attributeFilter:['class']});
      reduced.addEventListener?.('change',()=>{if(reduced.matches){running.forEach(a=>a.cancel());running.clear();controls.forEach(s=>{s.reset();s.clearRipple();});}});
    }
    installGlassInteractions();
    function installNeomorphicFeedback() {
      document.querySelectorAll('#galaxy-zoom-controls button,#main-content .inspect-btn,#model-return').forEach(control=>{
        control.classList.add('neo-control');
        const depth=document.createElement('span');depth.className='neo-depth';depth.setAttribute('aria-hidden','true');control.appendChild(depth);
        control.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')control.classList.add('is-neo-pressed');});
        const release=()=>control.classList.remove('is-neo-pressed');
        control.addEventListener('keyup',release);control.addEventListener('blur',release);control.addEventListener('pointercancel',release);
      });
    }
    installNeomorphicFeedback();

    // Retain the same switch node and listeners while changing its header slot.
    function installThemeDock() {
      const desktop=window.matchMedia('(min-width:1101px)');
      let detached=null,frame=0;
      function update() {
        frame=0;const next=desktop.matches&&!navWrap.classList.contains('is-compact');
        if(next===detached)return;
        const focused=document.activeElement===themeBtn;
        detached=next;navWrap.classList.toggle('is-theme-detached',next);
        if(next)navWrap.appendChild(themeBtn);else navPill.insertBefore(themeBtn,navOutline);
        if(focused)themeBtn.focus({preventScroll:true});
        measureGalaxyChrome();
      }
      const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
      new MutationObserver(schedule).observe(navWrap,{attributes:true,attributeFilter:['class']});
      desktop.addEventListener?.('change',schedule);
      window.updateThemeDock=update;
      update();
    }
    installThemeDock();

    // Finite, event-driven Skills feedback. The galaxy and reel keep their own controllers.
    function installThemedSkills() {
      const panel=document.querySelector('.skills-reactive');
      if(!panel) return;
      const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
      const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
      let frame=0,last=0,visible=true;
      const workNames={manifestos:'Manifesto study',markets:'Market forecasting',research:'Research internship',insurance:'Insurance study'};
      const groups=Array.from(panel.querySelectorAll('.skill-category')).filter(category=>category.querySelector('.skill-reactive')).map(category=>{
        const buttons=Array.from(category.querySelectorAll('.skill-reactive'));
        const grains=Array.from(category.querySelectorAll('.skill-grain')).map(el=>{
          const x=+el.dataset.x,y=+el.dataset.y;
          return {el,x,y,tx:x,ty:y,vx:0,vy:0,bx:x,by:y};
        });
        const work=category.querySelector('.skill-work'),thread=category.querySelector('.skill-thread');
        const heading=category.querySelector('.skill-heading-text');
        const label=heading.textContent;
        heading.setAttribute('aria-hidden','true'); heading.textContent='';
        const words=label.split(' ');
        words.forEach((word,wi)=>{
          const wordEl=document.createElement('span'); wordEl.style.whiteSpace='nowrap';
          for(const char of word){const letter=document.createElement('span');letter.className='skill-letter';letter.textContent=char;letter.setAttribute('aria-hidden','true');wordEl.appendChild(letter);}
          heading.appendChild(wordEl);
          if(wi<words.length-1){const space=document.createElement('span');space.textContent=' ';space.setAttribute('aria-hidden','true');heading.appendChild(space);}
        });
        const s={category,buttons,grains,work,thread,path:thread.querySelector('path'),head:thread.querySelector('circle'),heading,
          trace:category.querySelector('.skill-orbit-trace'),sparks:Array.from(category.querySelectorAll('.skill-orbit-spark')),energy:null,
          selected:null,signal:null,animations:[],drag:null};
        buttons.forEach((el,i)=>{
          el.tabIndex=i===0?0:-1;
          el._skillPose={el,x:0,y:0,vx:0,vy:0,tx:0,ty:0};
        });
        return s;
      });
      const immediate=()=>motion.matches||document.documentElement.classList.contains('micro-keyboard');
      const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
      // Closed-form critically damped spring: stable at 30, 60 and 120 Hz.
      function spring(p,key,vkey,target,dt) {
        const w=19,d=p[key]-target,j=p[vkey]+w*d,e=Math.exp(-w*dt);
        p[key]=target+(d+j*dt)*e; p[vkey]=(p[vkey]-w*j*dt)*e;
        if(Math.abs(p[key]-target)<.015&&Math.abs(p[vkey])<.025){p[key]=target;p[vkey]=0;}
        return Math.abs(p[key]-target)>.015||Math.abs(p[vkey])>.025;
      }
      function skillPoint(mode,i,n) {
        const u=i/(n-1),x=12+276*u;
        if(mode==='wave')return {x,y:32+Math.sin(u*Math.PI*4)*17};
        if(mode==='fit')return {x,y:52-40*u+Math.sin(i*2.4)*4};
        if(mode==='text'){const a=i*2.399,c=i%3;return {x:53+c*94+Math.cos(a)*(7+(i%5)*2),y:32+Math.sin(a)*(7+(i%4)*2)};}
        if(mode==='table')return {x:25+(i%8)*35,y:12+Math.floor(i/8)*13};
        return {x,y:32+Math.sin(u*8+i%3)*14*Math.sin(u*Math.PI)};
      }
      function cancelDecorations(s){s.animations.forEach(a=>a.cancel());s.animations=[];}
      function release(s){
        if(s.drag){const d=s.drag;s.drag=null;if(d.el.hasPointerCapture?.(d.id))d.el.releasePointerCapture(d.id);}
        s.buttons.forEach(b=>{b._skillPose.tx=0;b._skillPose.ty=0;});
      }
      function paint(s,instant=false,dt=0,now=0){
        let unsettled=false;
        s.grains.forEach(p=>{
          if(instant){p.x=p.tx;p.y=p.ty;p.vx=p.vy=0;}
          else {const x=spring(p,'x','vx',p.tx,dt),y=spring(p,'y','vy',p.ty,dt);unsettled=x||y||unsettled;}
          p.el.setAttribute('transform','translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')');
        });
        if(s.energy!==null){
          const t=instant?1:clamp((now-s.energy)/820,0,1),e=Math.sin(Math.PI*t);
          s.category.style.setProperty('--skill-energy',(e*.23).toFixed(3));
          if(s.trace){s.trace.style.opacity=String(e*.8);s.trace.style.strokeDashoffset=String(1-t);}
          s.sparks.forEach((spark,i)=>{
            const u=clamp((t-i*.12)/(1-i*.12),0,1),v=1-u;
            spark.setAttribute('cx',v*v*v*12+3*v*v*u*70+3*v*u*u*208+u*u*u*288);
            spark.setAttribute('cy',v*v*v*43+3*v*v*u*4+3*v*u*u*6+u*u*u*25);
            spark.style.opacity=String(Math.max(0,e)*(i?.7:1));
          });
          if(t<1)unsettled=true;else s.energy=null;
        }
        s.buttons.forEach(b=>{const p=b._skillPose;
          if(instant){p.x=p.tx=0;p.y=p.ty=0;p.vx=p.vy=0;}
          else{const x=spring(p,'x','vx',p.tx,dt),y=spring(p,'y','vy',p.ty,dt);unsettled=x||y||unsettled;}
          b.style.setProperty('--skill-x',p.x.toFixed(2)+'px');b.style.setProperty('--skill-y',p.y.toFixed(2)+'px');
          b.style.setProperty('--skill-tilt',(p.x*.16).toFixed(2)+'deg');
        });
        if(s.signal){
          const t=instant?1:clamp((now-s.signal.start)/650,0,1),v=1-Math.pow(1-t,3),a=1-v;
          const q=s.signal;
          const x=a*a*a*q.x+3*a*a*v*q.cx+3*a*v*v*q.ex+v*v*v*q.ex;
          const y=a*a*a*q.y+3*a*a*v*q.y+3*a*v*v*q.ey+v*v*v*q.ey;
          s.head.setAttribute('cx',x);s.head.setAttribute('cy',y);
          s.path.style.strokeDashoffset=String(1-v);
          s.thread.style.opacity=instant?'0':String(Math.sin(Math.PI*t)*.9);
          s.work.classList.toggle('is-arrived',t>=.85);
          if(t<1)unsettled=true;else{s.signal=null;s.thread.style.opacity='0';}
        }
        return unsettled;
      }
      function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
      function tick(now){frame=0;const dt=Math.min(.05,Math.max(.001,last?(now-last)/1000:1/60));last=now;
        if(!visible||document.hidden){stop();return;}
        let active=false;groups.forEach(s=>{active=paint(s,false,dt,now)||active;});
        if(active)frame=requestAnimationFrame(tick);else last=0;
      }
      function wake(){if(immediate()||!visible||document.hidden){groups.forEach(s=>paint(s,true));return;}
        if(!frame){last=0;frame=requestAnimationFrame(tick);}
      }
      function animateLabels(s,b){
        cancelDecorations(s);
        if(immediate()||!visible||document.hidden||!b.animate)return;
        const mini=b.querySelector('.skill-mini');
        if(mini?.animate)s.animations.push(mini.animate([
          {transform:'translateY(-50%) rotate(0) scale(1)'},
          {transform:'translateY(-50%) rotate(-6deg) scale(1.06,.94)',offset:.34},
          {transform:'translateY(-50%) rotate(2deg) scale(.99,1.01)',offset:.7},
          {transform:'translateY(-50%) rotate(0) scale(1)'}
        ],{duration:480,easing:'cubic-bezier(.23,1,.32,1)'}));
        const sheen=b.querySelector('.skill-glass-sheen');
        s.animations.push(sheen.animate([{transform:'translateX(-110%)',opacity:0},{opacity:.5,offset:.3},{transform:'translateX(110%)',opacity:0}],{duration:470,easing:'cubic-bezier(.23,1,.32,1)'}));
        s.heading.querySelectorAll('.skill-letter').forEach((letter,i)=>s.animations.push(letter.animate(
          [{transform:'translateY(0)',color:'var(--accent)'},{transform:'translateY(-2px)',offset:.45},{transform:'translateY(0)',color:'inherit'}],
          {duration:260,delay:i*8,easing:'cubic-bezier(.23,1,.32,1)'})));
      }
      function measureSignal(s,b){
        const a=s.category.getBoundingClientRect(),r=b.getBoundingClientRect(),e=s.work.getBoundingClientRect();
        const x=r.left-a.left+r.width*.55,y=r.bottom-a.top,ex=e.left-a.left+3,ey=e.top-a.top+e.height/2;
        s.thread.setAttribute('viewBox','0 0 '+a.width+' '+a.height);
        s.path.setAttribute('d','M'+x+' '+y+' C'+(x+35)+' '+y+' '+ex+' '+ey+' '+ex+' '+ey);
        s.signal={x,y,cx:x+35,ex,ey,start:performance.now()};
      }
      function select(s,b){
        const changed=s.selected!==b;
        s.selected=b;s.buttons.forEach(button=>{button.setAttribute('aria-pressed',button===b?'true':'false');button.tabIndex=button===b?0:-1;});
        s.work.dataset.work=b.dataset.skillWork||'';
        s.work.querySelector('span').textContent=workNames[s.work.dataset.work]||'Explore projects';
        if(changed){
          s.grains.forEach((p,i)=>{const q=skillPoint(b.dataset.skillMode,i,s.grains.length);p.tx=q.x;p.ty=q.y;});
          s.work.classList.remove('is-arrived');s.energy=performance.now();measureSignal(s,b);animateLabels(s,b);wake();
        }
        if(immediate())settle();
      }
      groups.forEach(s=>{
        s.buttons.forEach(b=>{
          let rect=null;
          const measure=()=>{const r=b.getBoundingClientRect(),p=b._skillPose;rect={left:r.left-p.x,top:r.top-p.y,width:r.width,height:r.height};};
          b.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&fine.matches){measure();select(s,b);}});
          b.addEventListener('pointermove',e=>{
            const p=b._skillPose;
            if(s.drag&&s.drag.el===b){if(e.pointerId!==s.drag.id)return;
              const dx=e.clientX-s.drag.x,dy=e.clientY-s.drag.y;
              s.drag.moved=s.drag.moved||Math.hypot(dx,dy)>4;
              p.tx=clamp(dx*.3,-12,12);p.ty=clamp(dy*.3,-9,9);wake();return;
            }
            if(e.pointerType==='touch'||!fine.matches||immediate())return;
            if(!rect)measure();p.tx=clamp((e.clientX-rect.left-rect.width/2)*.06,-5,5);p.ty=clamp((e.clientY-rect.top-rect.height/2)*.1,-3,3);wake();
          });
          b.addEventListener('pointerleave',()=>{rect=null;if(!s.drag){b._skillPose.tx=b._skillPose.ty=0;wake();}});
          b.addEventListener('pointerdown',e=>{
            if(e.button!==0||e.pointerType==='touch'||!fine.matches||immediate())return;
            release(s);s.drag={el:b,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture?.(e.pointerId);select(s,b);
          });
          const end=e=>{if(s.drag?.el===b&&s.drag.id===e.pointerId){release(s);wake();}};
          b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end);
          b.addEventListener('click',()=>select(s,b));
          b.addEventListener('focus',()=>select(s,b));
          b.addEventListener('keydown',e=>{
            const keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];
            if(!keys.includes(e.key))return;e.preventDefault();document.documentElement.classList.add('micro-keyboard');
            let i=s.buttons.indexOf(b);if(e.key==='Home')i=0;else if(e.key==='End')i=s.buttons.length-1;
            else i=(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+s.buttons.length)%s.buttons.length;
            release(s);cancelDecorations(s);s.buttons[i].focus();select(s,s.buttons[i]);paint(s,true);
          });
        });
        s.work.addEventListener('click',()=>{if(s.work.dataset.work)openDrawer(s.work.dataset.work);else navigateToSection('#projects');});
      });
      function settle(){stop();groups.forEach(s=>{release(s);cancelDecorations(s);paint(s,true);});}
      motion.addEventListener?.('change',settle);
      document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
      if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
        visible=entries.some(e=>e.isIntersecting);if(!visible)settle();
      },{rootMargin:'80px'}).observe(panel);
      const resize=()=>{groups.forEach(s=>{if(s.signal&&s.selected)measureSignal(s,s.selected);});wake();};
      if('ResizeObserver' in window)new ResizeObserver(resize).observe(panel);
      else window.addEventListener('resize',resize,{passive:true});
    }
    installThemedSkills();

    // Finite pigment/foil responses for the quiet supporting content and theme controls.
    function installArtisticPolish() {
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
      const running=new Map();
      const immediate=()=>reduced.matches||document.documentElement.classList.contains('micro-keyboard')||document.hidden;
      function animate(el,frames,options){
        if(!el)return;running.get(el)?.cancel();running.delete(el);
        if(immediate()||typeof el.animate!=='function')return;
        const a=el.animate(frames,options);running.set(el,a);
        a.onfinish=()=>{if(running.get(el)===a)running.delete(el);};return a;
      }
      function cancelWithin(host){running.forEach((a,el)=>{if(host.contains(el)){a.cancel();running.delete(el);}});}
      function bindSurface(el,play){
        el.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)play();});
        el.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')play();});
      }
      document.querySelectorAll('.proficiency-tier,.proficiency-additional').forEach(tier=>{
        const ray=tier.querySelector('.tier-ray'),beacon=tier.querySelector('.tier-beacon');
        bindSurface(tier,()=>{
          animate(ray,[{opacity:0,transform:'scaleX(.06)'},{opacity:.9,offset:.25},{opacity:0,transform:'scaleX(1)'}],{duration:480,easing:'cubic-bezier(.23,1,.32,1)'});
          animate(beacon,[{transform:'translateX(0) rotate(0) scale(1)'},{transform:'translateX(7px) rotate(45deg) scale(1.2,.85)',offset:.4},{transform:'translateX(0) rotate(90deg) scale(1)'}],{duration:480,easing:'cubic-bezier(.4,-.3,.6,1.3)'});
        });
        tier.querySelectorAll('.proficiency-tool').forEach(tool=>{
          const foil=document.createElement('span');foil.className='proficiency-reflection';foil.setAttribute('aria-hidden','true');tool.appendChild(foil);
          bindSurface(tool,()=>animate(foil,[{opacity:0,transform:'translateX(-110%)'},{opacity:.8,offset:.35},{opacity:0,transform:'translateX(110%)'}],{duration:460,easing:'cubic-bezier(.23,1,.32,1)'}));
        });
      });
      document.querySelectorAll('.credential-ledger').forEach(details=>{
        const entries=Array.from(details.querySelectorAll('.credential-entry'));
        entries.forEach(entry=>{
          const foil=entry.querySelector('.credential-foil'),check=entry.querySelector('.credential-sigil path + path');
          bindSurface(entry,()=>{
            animate(foil,[{opacity:0,transform:'translateX(-100%)'},{opacity:.9,offset:.4},{opacity:0,transform:'translateX(100%)'}],{duration:560,easing:'cubic-bezier(.23,1,.32,1)'});
            animate(check,[{strokeDashoffset:1,opacity:.2},{strokeDashoffset:0,opacity:1}],{duration:360,easing:'cubic-bezier(.23,1,.32,1)'});
          });
        });
        details.addEventListener('toggle',()=>{
          cancelWithin(details);if(!details.open)return;
          entries.forEach((entry,i)=>animate(entry,[{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,delay:i*28,easing:'cubic-bezier(.23,1,.32,1)'}));
          animate(details.querySelector('.certification-count'),[{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
        });
      });
      const svgNS='http://www.w3.org/2000/svg';
      const svgNode=(tag,attrs)=>{const el=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el;};
      const art=svgNode('svg',{class:'theme-cosmos',viewBox:'0 0 56 44','aria-hidden':'true',focusable:'false'});
      const rings=[svgNode('ellipse',{class:'theme-orbit',cx:28,cy:22,rx:23,ry:8}),svgNode('ellipse',{class:'theme-orbit',cx:28,cy:22,rx:19,ry:11})];
      rings.forEach(ring=>art.appendChild(ring));
      const stars=Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;const star=svgNode('circle',{class:'theme-dust',cx:28+Math.cos(a)*18,cy:22+Math.sin(a)*12,r:i%3===0?1.3:.85});art.appendChild(star);return star;});
      innerThemeBtn.appendChild(art);
      function orbit(full=false){
        cancelWithin(art);const dark=document.documentElement.getAttribute('data-theme')==='dark',direction=dark?1:-1;
        rings.forEach((ring,i)=>animate(ring,[{opacity:0,transform:'rotate('+(-35+i*65)+'deg) scale(.72)'},{opacity:full?.75:.3,offset:.3},{opacity:0,transform:'rotate('+((direction*65)+i*60)+'deg) scale(1.02)'}],{duration:full?620:420,easing:'cubic-bezier(.23,1,.32,1)'}));
        stars.forEach((star,i)=>{
          const angle=i*Math.PI*2/7,reach=full?5:2;
          animate(star,[{opacity:0,transform:'translate(0,0) scale(.7)'},{opacity:full?.95:.4,offset:.25},{opacity:0,transform:'translate('+(Math.cos(angle)*reach)+'px,'+(Math.sin(angle)*reach)+'px) scale(.5)'}],{duration:full?560:380,delay:full?i*18:0,easing:'cubic-bezier(.23,1,.32,1)'});
        });
      }
      innerThemeBtn.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&fine.matches)orbit();});
      // Existing click listeners apply the palette synchronously before this decorative response.
      innerThemeBtn.addEventListener('click',event=>{if(event.detail===0||immediate()){cancelWithin(art);return;}orbit(true);});
      const cancelAll=()=>{running.forEach(a=>a.cancel());running.clear();};
      reduced.addEventListener?.('change',()=>{if(reduced.matches)cancelAll();});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAll();});
      document.addEventListener('keydown',event=>{if(['Tab','Enter',' ','ArrowDown','ArrowUp','Home','End'].includes(event.key))cancelAll();},true);
    }
    installArtisticPolish();

    window.addEventListener('study-transition-start',()=>{resetGalaxyView(true);galaxyCamera.distance=galaxyCamera.targetDistance=6.8;lastGalaxyTime=0;});
    window.addEventListener('study-transition-end',()=>{galaxyCamera.distance=galaxyCamera.targetDistance=GALAXY_DEFAULT_DISTANCE;lastGalaxyTime=0;root.style.setProperty('--study-ui','1');});







    // Let each chapter and card enter once as the reader reaches it.
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealTargets = [...document.querySelectorAll('.section-title, .reading-chapter, .bento-card, .end-chapter')].filter(node=>!node.dataset.sequenceItem&&!node.classList.contains('background-reading'));
      revealTargets.forEach(target => {
        target.classList.add('scroll-reveal');
        if (target.classList.contains('bento-card') && target.parentElement.classList.contains('bento-grid') && !target.parentElement.classList.contains('project-stack')) {
          const cardIndex = [...target.parentElement.children].indexOf(target);
          target.style.setProperty('--reveal-delay', `${Math.min(cardIndex, 3) * 70}ms`);
        }
      });
      document.documentElement.classList.add('js-motion');
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
      revealTargets.forEach(target => revealObserver.observe(target));
    }

    // Compile this offscreen graph only when the visitor approaches Contact.
    if ('IntersectionObserver' in window) {
      const contactWarmup = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        contactWarmup.disconnect();
        initializeContactModel();
      }, { rootMargin:'320px 0px' });
      contactWarmup.observe(document.querySelector('.contact-art'));
    } else {
      window.addEventListener('inner-world-galaxy-wake',initializeContactModel,{once:true});
    }

    // A self-contained WebGL neural graph: colored nodes and links in real 3D space.
    function initializeContactModel() {
      const modelCanvas = document.getElementById('contact-model');
      const art = modelCanvas.parentElement;
      let gl;
      try { gl = modelCanvas.getContext('webgl', { alpha:true, antialias:true, powerPreference:'low-power' }); }
      catch (_) { startCanvasFallback(); return; }
      if (!gl) { startCanvasFallback(); return; }

      const vertexSource = `
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aColor;
        attribute float aSize;
        uniform float uYaw, uPitch, uAspect, uDpr, uMode, uPulse;
        varying vec3 vColor;
        varying float vDepth;
        void main() {
          float cy=cos(uYaw), sy=sin(uYaw), cp=cos(uPitch), sp=sin(uPitch);
          vec3 p=vec3(cy*aPosition.x+sy*aPosition.z,aPosition.y,-sy*aPosition.x+cy*aPosition.z);
          p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
          vColor=aColor;
          vDepth=clamp((p.z+1.2)/2.4,0.0,1.0);
          float depth=3.7-p.z;
          gl_Position=vec4(p.x*2.6/uAspect,p.y*2.6,-1.02*(p.z-3.7)-0.2,depth);
          gl_PointSize=uMode>0.5 ? aSize*uDpr*(3.7/depth)*(1.0+0.18*uPulse) : 1.0;
        }`;
      const fragmentSource = `
        precision mediump float;
        varying vec3 vColor;
        varying float vDepth;
        uniform float uMode, uPulse;
        void main() {
          if (uMode>0.5) {
            float radius=length(gl_PointCoord-vec2(0.5));
            float halo=1.0-smoothstep(0.13,0.5,radius);
            float core=1.0-smoothstep(0.02,0.19,radius);
            vec3 color=mix(vColor,vec3(1.0),core*0.46);
            gl_FragColor=vec4(color,halo*(0.68+0.25*vDepth+0.07*uPulse));
          } else {
            gl_FragColor=vec4(vColor,0.19+0.29*vDepth+0.12*uPulse);
          }
        }`;
      function shader(type, source) {
        const item=gl.createShader(type);
        gl.shaderSource(item,source);
        gl.compileShader(item);
        return gl.getShaderParameter(item,gl.COMPILE_STATUS) ? item : null;
      }
      const vs=shader(gl.VERTEX_SHADER,vertexSource), fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
      if (!vs || !fs) { startCanvasFallback(); return; }
      const program=gl.createProgram();
      gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { startCanvasFallback(); return; }

      const palette=[
        [.10,.46,.98], // electric blue
        [.55,.32,.96], // violet
        [.05,.77,.80], // cyan
        [.98,.33,.58], // coral
        [.99,.64,.25]  // warm amber
      ];
      const nodes=[], goldenAngle=Math.PI*(3-Math.sqrt(5));
      for (let i=0;i<92;i++) {
        const y=1-2*(i+.5)/92, radial=Math.sqrt(1-y*y), theta=i*goldenAngle;
        nodes.push({p:[Math.cos(theta)*radial,y,Math.sin(theta)*radial],c:palette[i%palette.length],s:i%13===0?12:8});
      }
      const outerCount=nodes.length;
      for (let i=0;i<24;i++) {
        const y=1-2*(i+.5)/24, radial=Math.sqrt(1-y*y), theta=i*goldenAngle+0.8;
        nodes.push({p:[Math.cos(theta)*radial*.47,y*.47,Math.sin(theta)*radial*.47],c:palette[(i+2)%palette.length],s:i%5===0?11:7});
      }
      nodes.push({p:[0,0,0],c:[.98,.96,1],s:18});
      const coreIndex=nodes.length-1;
      const pointData=[], lineData=[];
      const addVertex=(out,node)=>out.push(...node.p,...node.c,node.s);
      nodes.forEach(node=>addVertex(pointData,node));
      const edges=new Set();
      function connect(a,b) {
        if (a===b) return;
        const key=a<b?`${a}:${b}`:`${b}:${a}`;
        if (edges.has(key)) return;
        edges.add(key); addVertex(lineData,nodes[a]); addVertex(lineData,nodes[b]);
      }
      const distance=(a,b)=>a.p.reduce((sum,x,k)=>sum+(x-b.p[k])**2,0);
      for (let i=0;i<outerCount;i++) {
        const nearest=[];
        for (let j=0;j<outerCount;j++) if (i!==j) nearest.push([distance(nodes[i],nodes[j]),j]);
        nearest.sort((a,b)=>a[0]-b[0]);
        nearest.slice(0,3).forEach(pair=>connect(i,pair[1]));
      }
      for (let i=outerCount;i<coreIndex;i++) {
        const nearest=[];
        for (let j=0;j<outerCount;j++) nearest.push([distance(nodes[i],nodes[j]),j]);
        nearest.sort((a,b)=>a[0]-b[0]);
        connect(i,nearest[0][1]);
        connect(i,outerCount+(i-outerCount+1)%24);
        if (i%3===0) connect(i,coreIndex);
      }
      function makeBuffer(data) {
        const buffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
        return buffer;
      }
      const lineBuffer=makeBuffer(lineData), pointBuffer=makeBuffer(pointData);
      gl.useProgram(program);
      const positionLoc=gl.getAttribLocation(program,'aPosition'), colorLoc=gl.getAttribLocation(program,'aColor'), sizeLoc=gl.getAttribLocation(program,'aSize');
      [positionLoc,colorLoc,sizeLoc].forEach(loc=>gl.enableVertexAttribArray(loc));
      const yawLoc=gl.getUniformLocation(program,'uYaw'), pitchLoc=gl.getUniformLocation(program,'uPitch');
      const aspectLoc=gl.getUniformLocation(program,'uAspect'), dprLoc=gl.getUniformLocation(program,'uDpr');
      const modeLoc=gl.getUniformLocation(program,'uMode'), pulseLoc=gl.getUniformLocation(program,'uPulse');
      function bind(buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.vertexAttribPointer(positionLoc,3,gl.FLOAT,false,28,0);
        gl.vertexAttribPointer(colorLoc,3,gl.FLOAT,false,28,12);
        gl.vertexAttribPointer(sizeLoc,1,gl.FLOAT,false,28,24);
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0,0,0,0);

      let yaw=.48, pitch=.22, momentum=0, pulse=0, dragging=false, lastX=0, lastY=0, downX=0, downY=0, visible=false, frame=0;
      const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
      function resizeModel() {
        const rect=modelCanvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
        const width=Math.max(1,Math.round(rect.width*dpr)), height=Math.max(1,Math.round(rect.height*dpr));
        if (modelCanvas.width!==width || modelCanvas.height!==height) { modelCanvas.width=width; modelCanvas.height=height; }
        gl.viewport(0,0,width,height);
        requestModelFrame();
      }
      function drawModel() {
        frame=0;
        if (!visible || document.hidden) return;
        if (!motionPreference.matches && !dragging) { yaw+=.0016+momentum; momentum*=.94; pulse*=.94; }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform1f(yawLoc,yaw); gl.uniform1f(pitchLoc,pitch);
        gl.uniform1f(aspectLoc,modelCanvas.width/modelCanvas.height);
        gl.uniform1f(dprLoc,Math.min(window.devicePixelRatio||1,2));
        gl.uniform1f(pulseLoc,pulse);
        bind(lineBuffer); gl.uniform1f(modeLoc,0); gl.drawArrays(gl.LINES,0,lineData.length/7);
        bind(pointBuffer); gl.uniform1f(modeLoc,1); gl.drawArrays(gl.POINTS,0,pointData.length/7);
        if (!motionPreference.matches) frame=requestAnimationFrame(drawModel);
      }
      function requestModelFrame() { if (visible && !frame && !document.hidden) frame=requestAnimationFrame(drawModel); }
      function triggerPulse() { pulse=motionPreference.matches ? 0.45 : 1; requestModelFrame(); }
      modelCanvas.addEventListener('pointerdown',event=>{
        dragging=true; lastX=downX=event.clientX; lastY=downY=event.clientY; momentum=0;
        modelCanvas.classList.add('is-dragging'); modelCanvas.setPointerCapture(event.pointerId);
      });
      modelCanvas.addEventListener('pointermove',event=>{
        if (!dragging) return;
        const dx=event.clientX-lastX, dy=event.clientY-lastY;
        yaw+=dx*.012; pitch=Math.max(-1.2,Math.min(1.2,pitch+dy*.012));
        momentum=dx*.00025; lastX=event.clientX; lastY=event.clientY; requestModelFrame();
      });
      modelCanvas.addEventListener('pointerup',event=>{
        if (Math.hypot(event.clientX-downX,event.clientY-downY)<7) triggerPulse();
        dragging=false; modelCanvas.classList.remove('is-dragging');
      });
      modelCanvas.addEventListener('pointercancel',()=>{ dragging=false; modelCanvas.classList.remove('is-dragging'); });
      modelCanvas.addEventListener('keydown',event=>{
        if (event.key==='Enter' || event.key===' ') { event.preventDefault(); triggerPulse(); return; }
        const turn={ArrowLeft:-.2,ArrowRight:.2,ArrowUp:0,ArrowDown:0};
        if (!(event.key in turn)) return;
        event.preventDefault(); yaw+=turn[event.key];
        if (event.key==='ArrowUp') pitch=Math.max(-1.2,pitch-.2);
        if (event.key==='ArrowDown') pitch=Math.min(1.2,pitch+.2);
        requestModelFrame();
      });
      modelCanvas.addEventListener('webglcontextlost',event=>{ event.preventDefault(); if (frame) cancelAnimationFrame(frame); frame=0; startCanvasFallback(); });
      if ('ResizeObserver' in window) new ResizeObserver(resizeModel).observe(modelCanvas);
      else window.addEventListener('resize',resizeModel,{passive:true});
      if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{
        visible=entries[0].isIntersecting;
        if (visible) { resizeModel(); requestModelFrame(); }
        else if (frame) { cancelAnimationFrame(frame); frame=0; }
      },{threshold:.02}).observe(art);
      else { visible=true; resizeModel(); }
      document.addEventListener('visibilitychange',()=>{ if (!document.hidden) requestModelFrame(); });
      motionPreference.addEventListener?.('change',requestModelFrame);
    }

    // Software renderer for browsers that disable WebGL, using the same 3D interaction.
    function startCanvasFallback() {
      const art=document.querySelector('.contact-art');
      if (art.dataset.canvasFallbackStarted) return;
      art.dataset.canvasFallbackStarted='true';
      art.classList.add('no-webgl');
      const canvas2d=document.getElementById('contact-model-2d');
      const ctx2d=canvas2d.getContext('2d',{alpha:true});
      if (!ctx2d) { art.classList.add('no-canvas'); return; }

      const colors=[[26,111,248],[139,82,247],[11,192,204],[247,78,139],[249,162,57]];
      const nodes=[], edges=[], goldenAngle=Math.PI*(3-Math.sqrt(5));
      for (let i=0;i<76;i++) {
        const y=1-2*(i+.5)/76, ring=Math.sqrt(1-y*y), angle=i*goldenAngle;
        nodes.push({p:[Math.cos(angle)*ring,y,Math.sin(angle)*ring],color:i%5,size:i%13===0?4.6:3.2});
      }
      const outerCount=nodes.length;
      for (let i=0;i<18;i++) {
        const y=1-2*(i+.5)/18, ring=Math.sqrt(1-y*y), angle=i*goldenAngle+.8;
        nodes.push({p:[Math.cos(angle)*ring*.47,y*.47,Math.sin(angle)*ring*.47],color:(i+2)%5,size:i%5===0?5:3.8});
      }
      nodes.push({p:[0,0,0],color:1,size:8});
      const coreIndex=nodes.length-1, seen=new Set();
      function connect(a,b) {
        const key=a<b?`${a}:${b}`:`${b}:${a}`;
        if (a===b || seen.has(key)) return;
        seen.add(key); edges.push([a,b]);
      }
      const distance=(a,b)=>a.p.reduce((sum,x,k)=>sum+(x-b.p[k])**2,0);
      for (let i=0;i<outerCount;i++) {
        const nearest=[];
        for (let j=0;j<outerCount;j++) if (i!==j) nearest.push([distance(nodes[i],nodes[j]),j]);
        nearest.sort((a,b)=>a[0]-b[0]);
        nearest.slice(0,3).forEach(pair=>connect(i,pair[1]));
      }
      for (let i=outerCount;i<coreIndex;i++) {
        const nearest=[];
        for (let j=0;j<outerCount;j++) nearest.push([distance(nodes[i],nodes[j]),j]);
        nearest.sort((a,b)=>a[0]-b[0]);
        connect(i,nearest[0][1]);
        connect(i,outerCount+(i-outerCount+1)%18);
        if (i%3===0) connect(i,coreIndex);
      }

      let yaw=.48, pitch=.22, momentum=0, pulse=0, dragging=false, lastX=0, lastY=0, downX=0, downY=0, visible=false, frame=0;
      const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
      const rgba=(color,alpha)=>`rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
      function resizeFallback() {
        const rect=canvas2d.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
        canvas2d.width=Math.max(1,Math.round(rect.width*dpr));
        canvas2d.height=Math.max(1,Math.round(rect.height*dpr));
        ctx2d.setTransform(dpr,0,0,dpr,0,0);
        requestFallbackFrame();
      }
      function project(point,width,height) {
        const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
        const x=cy*point[0]+sy*point[2], z=-sy*point[0]+cy*point[2];
        const y=cp*point[1]-sp*z, depth=sp*point[1]+cp*z;
        const scale=height*1.3/(3.7-depth);
        return {x:width/2+x*scale,y:height/2-y*scale,z:depth,scale:3.7/(3.7-depth)};
      }
      function drawFallback() {
        frame=0;
        if (!visible || document.hidden) return;
        if (!motionPreference.matches && !dragging) { yaw+=.0016+momentum; momentum*=.94; pulse*=.94; }
        const dpr=Math.min(window.devicePixelRatio||1,2), width=canvas2d.width/dpr, height=canvas2d.height/dpr;
        ctx2d.clearRect(0,0,width,height);
        const points=nodes.map(node=>project(node.p,width,height));
        const sortedEdges=edges.map(edge=>({edge,z:(points[edge[0]].z+points[edge[1]].z)/2})).sort((a,b)=>a.z-b.z);
        sortedEdges.forEach(({edge,z})=>{
          const a=points[edge[0]], b=points[edge[1]], color=colors[nodes[edge[0]].color];
          ctx2d.beginPath(); ctx2d.moveTo(a.x,a.y); ctx2d.lineTo(b.x,b.y);
          ctx2d.strokeStyle=rgba(color,.12+.17*(z+1)/2+.08*pulse);
          ctx2d.lineWidth=.7+Math.max(0,z)*.35; ctx2d.stroke();
        });
        const ordered=points.map((point,index)=>({point,index})).sort((a,b)=>a.point.z-b.point.z);
        ordered.forEach(({point,index})=>{
          const node=nodes[index], color=colors[node.color], radius=node.size*point.scale*(1+.18*pulse);
          const halo=ctx2d.createRadialGradient(point.x,point.y,0,point.x,point.y,radius*2.4);
          halo.addColorStop(0,rgba(color,.7)); halo.addColorStop(.28,rgba(color,.42)); halo.addColorStop(1,rgba(color,0));
          ctx2d.fillStyle=halo; ctx2d.beginPath(); ctx2d.arc(point.x,point.y,radius*2.4,0,Math.PI*2); ctx2d.fill();
          ctx2d.fillStyle=rgba(color,.72+.22*(point.z+1)/2);
          ctx2d.beginPath(); ctx2d.arc(point.x,point.y,Math.max(1.4,radius*.58),0,Math.PI*2); ctx2d.fill();
          if (index===coreIndex || node.size>4.4) {
            ctx2d.fillStyle='rgba(255,255,255,.8)'; ctx2d.beginPath(); ctx2d.arc(point.x,point.y,Math.max(1,radius*.2),0,Math.PI*2); ctx2d.fill();
          }
        });
        if (pulse>.03) {
          const center=points[coreIndex];
          ctx2d.beginPath(); ctx2d.arc(center.x,center.y,18+29*(1-pulse),0,Math.PI*2);
          ctx2d.strokeStyle=rgba(colors[1],.35*pulse); ctx2d.lineWidth=1.2; ctx2d.stroke();
        }
        if (!motionPreference.matches) frame=requestAnimationFrame(drawFallback);
      }
      function requestFallbackFrame() { if (visible && !frame && !document.hidden) frame=requestAnimationFrame(drawFallback); }
      function triggerPulse() { pulse=motionPreference.matches ? .45 : 1; requestFallbackFrame(); }
      canvas2d.addEventListener('pointerdown',event=>{
        dragging=true; lastX=downX=event.clientX; lastY=downY=event.clientY; momentum=0;
        canvas2d.classList.add('is-dragging'); canvas2d.setPointerCapture?.(event.pointerId);
      });
      canvas2d.addEventListener('pointermove',event=>{
        if (!dragging) return;
        const dx=event.clientX-lastX, dy=event.clientY-lastY;
        yaw+=dx*.012; pitch=Math.max(-1.2,Math.min(1.2,pitch+dy*.012));
        momentum=dx*.00025; lastX=event.clientX; lastY=event.clientY; requestFallbackFrame();
      });
      canvas2d.addEventListener('pointerup',event=>{
        if (Math.hypot(event.clientX-downX,event.clientY-downY)<7) triggerPulse();
        dragging=false; canvas2d.classList.remove('is-dragging');
      });
      canvas2d.addEventListener('pointercancel',()=>{ dragging=false; canvas2d.classList.remove('is-dragging'); });
      canvas2d.addEventListener('keydown',event=>{
        if (event.key==='Enter' || event.key===' ') { event.preventDefault(); triggerPulse(); return; }
        const turn={ArrowLeft:-.2,ArrowRight:.2,ArrowUp:0,ArrowDown:0};
        if (!(event.key in turn)) return;
        event.preventDefault(); yaw+=turn[event.key];
        if (event.key==='ArrowUp') pitch=Math.max(-1.2,pitch-.2);
        if (event.key==='ArrowDown') pitch=Math.min(1.2,pitch+.2);
        requestFallbackFrame();
      });
      if ('ResizeObserver' in window) new ResizeObserver(resizeFallback).observe(canvas2d);
      else window.addEventListener('resize',resizeFallback,{passive:true});
      if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{
        visible=entries[0].isIntersecting;
        if (visible) { resizeFallback(); requestFallbackFrame(); }
        else if (frame) { cancelAnimationFrame(frame); frame=0; }
      },{threshold:.02}).observe(art);
      else { visible=true; resizeFallback(); }
      document.addEventListener('visibilitychange',()=>{ if (!document.hidden) requestFallbackFrame(); });
      motionPreference.addEventListener?.('change',requestFallbackFrame);
    }
  