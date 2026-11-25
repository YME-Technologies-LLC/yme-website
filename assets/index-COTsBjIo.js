const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/scroll-DKtpuyLw.js","assets/bg-SY5QOzQ7.js","assets/reveal-DpUwiVIt.js","assets/reveal-CkEYf-1e.css"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,f as r,i,l as a,n as o,o as s,r as c,s as l,t as u,u as d}from"./reveal-DpUwiVIt.js";var f=`support@ymedate.com`;function p(){let e=document.querySelector(`form.notify`);if(!e)return;let t=e.querySelector(`.notify__status`),n=e=>{t&&(t.textContent=``,window.setTimeout(()=>t.textContent=e,60))},r=(e,t)=>{let r=`Notify me: YME in ${t}`,i=`Please tell me when YME comes to my city.\n\nEmail: ${e}\nCity: ${t}`;window.location.href=`mailto:${f}?subject=${encodeURIComponent(r)}&body=${encodeURIComponent(i)}`,n(`Your mail app should open with the message ready to send. If nothing opens, email ${f} with your city.`)},i=e.querySelector(`input[name="city"]`);i?.addEventListener(`input`,()=>i.setCustomValidity(``)),e.addEventListener(`submit`,async t=>{if(t.preventDefault(),i&&!i.value.trim()&&i.setCustomValidity(`Please enter your city.`),!e.reportValidity())return;let n=new FormData(e),a=String(n.get(`email`)||``).trim(),o=String(n.get(`city`)||``).trim();return r(a,o)})}function m(e,t,n,r,i,a){let o=new Float32Array(t*n),s=0;for(let r=0;r<t*n;r++){let t=e[r*4+3]/255;s+=t>.06?t**1.25:0,o[r]=s}if(s<=0)return null;let c=20251120,l=()=>(c=c*1664525+1013904223>>>0)/4294967296,u=()=>{let e=l()*s,t=0,n=o.length-1;for(;t<n;){let r=t+n>>1;o[r]<e?t=r+1:n=r}return t},d=[];for(let i=0;i<r;i++){let r=u(),i=r%t+l(),a=Math.floor(r/t)+l();d.push({x:(i-t/2)/n,y:(a-n/2)/n,r:e[r*4]/255,g:e[r*4+1]/255,b:e[r*4+2]/255,a:0})}let f=[],p=Array.from({length:7},()=>({x:l(),y:l(),r:.12+l()*.22}));for(let e=0;e<r;e++)if(l()<.55){let t=p[e%p.length],n=l()*Math.PI*2,r=t.r*Math.sqrt(-2*Math.log(Math.max(1e-6,l())))*.6;f.push({x:Math.min(1,Math.max(0,t.x+Math.cos(n)*r/a)),y:Math.min(1,Math.max(0,t.y+Math.sin(n)*r)),a:0})}else f.push({x:l(),y:l(),a:0});f.forEach(e=>e.a=Math.atan2(e.y-.42,(e.x-.5)*a)),d.forEach(e=>e.a=Math.atan2(e.y,e.x)),f.sort((e,t)=>e.a-t.a),d.sort((e,t)=>e.a-t.a);let m=Array.from({length:r},(e,t)=>t);for(let e=r-1;e>0;e--){let t=Math.floor(l()*(e+1));[m[e],m[t]]=[m[t],m[e]]}let h=new Float32Array(r*11);return m.forEach((e,t)=>{let n=f[e],a=d[e];h.set([n.x,n.y,a.x,a.y,a.r,a.g,a.b,l(),l(),l(),+(t>=r-i)],t*11)}),{count:r,data:h}}var h=`
precision highp float;
attribute vec2 aStart;   // 0..1 across the screen
attribute vec2 aTarget;  // logo space: centre 0, logo height 1
attribute vec3 aColor;   // the logo's own colour at the target
attribute vec4 aSeed;    // random, random, depth, halo flag
uniform vec2 uRes, uCenter;
uniform float uSize, uDot, uDpr, uT, uIn, uGather, uCrystal, uFade, uPulse, uGlowPass;
varying vec3 vColor;
varying float vAlpha;

vec3 permute(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// divergence-free flow: the curl of a slowly changing noise field
vec2 curl(vec2 p){
  const float e = 0.02;
  float a = snoise(p + vec2(0.0, e)), b = snoise(p - vec2(0.0, e));
  float c = snoise(p + vec2(e, 0.0)), d = snoise(p - vec2(e, 0.0));
  return vec2(a - b, -(c - d)) / (2.0 * e);
}
float expoInOut(float t){
  if (t <= 0.0) return 0.0;
  if (t >= 1.0) return 1.0;
  return t < 0.5 ? pow(2.0, 20.0 * t - 10.0) * 0.5 : (2.0 - pow(2.0, -20.0 * t + 10.0)) * 0.5;
}
void main(){
  float aspect = uRes.x / uRes.y;
  vec2 start = aStart * uRes;
  vec2 q = aStart * vec2(aspect, 1.0) * 1.35;
  start += curl(q + vec2(uT * 0.03, -uT * 0.022)) * uRes.y * 0.018;
  start += vec2(sin(uT * 0.7 + aSeed.y * 40.0), cos(uT * 0.6 + aSeed.x * 30.0)) * uDpr * 2.5;
  vec2 rel = start - uCenter;

  // far particles set off later: the cloud draws in like a breath
  float far = clamp(length(rel) / uRes.y, 0.0, 1.3);
  float k = clamp((uGather - far * 0.26 - aSeed.y * 0.1) / 0.6, 0.0, 1.0);
  float e = mix(expoInOut(k), k < 0.5 ? 4.0 * k * k * k : 1.0 - pow(-2.0 * k + 2.0, 3.0) * 0.5, 0.45); // expo.inOut, softened

  vec2 tgt = aTarget * uSize * uPulse;
  float ang = aSeed.x * 6.2831 + uT * 0.16;
  vec2 ring = vec2(cos(ang) * 0.7, sin(ang) * 0.6) * uSize * (1.0 + 0.04 * sin(uT * 0.9 + aSeed.y * 9.0));
  float halo = aSeed.w * smoothstep(0.0, 1.0, uCrystal);
  tgt = mix(tgt, ring, halo);

  float swirl = (1.0 - e) * (1.0 - e) * (2.0 + aSeed.x * 0.8);
  vec2 p = mix(rel, tgt, e);
  float c = cos(swirl), s = sin(swirl);
  p = mat2(c, -s, s, c) * p;
  p += e * (1.0 - uCrystal) * vec2(sin(uT * 2.3 + aSeed.x * 50.0), cos(uT * 2.1 + aSeed.y * 50.0)) * uDpr * 0.7;
  vec2 pos = uCenter + p;
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);

  float depth = aSeed.z;
  float size = mix((1.2 + depth * depth * depth * 7.0) * uDpr, uDot, e);
  size = mix(size, (1.6 + aSeed.y * 1.6) * uDpr, halo);
  float twinkle = 0.65 + 0.35 * sin(uT * (1.2 + aSeed.y * 2.0) + aSeed.x * 60.0);
  float a0 = (0.06 + 0.3 * depth * depth) * twinkle * uIn * (1.0 - 0.45 * depth * depth * depth);
  float alpha = mix(a0, 0.3, e) * (1.0 + 0.9 * sin(k * 3.14159));        // brighter while it travels
  alpha *= mix(1.0 - uCrystal, 0.55 + 0.25 * twinkle, aSeed.w);           // only the halo stays
  alpha *= uFade;
  if (uGlowPass > 0.5) { size *= 3.4; alpha *= 0.06 * (1.0 - uCrystal * 0.8); }
  gl_PointSize = size;
  vColor = mix(mix(vec3(0.72, 0.9, 1.0), aColor, 0.3), aColor, e);
  vAlpha = alpha;
}`,g=`
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d) * 4.0;
  float a = exp(-r2 * 3.0) * (1.0 - smoothstep(0.7, 1.0, r2)) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`,_=`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`,v=`
precision mediump float;
uniform vec2 uRes, uCenter;
uniform float uSize, uGlow;
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = (px - uCenter) / uSize;
  vec2 e = d * vec2(0.95, 1.12);
  float g = (exp(-dot(e, e) * 3.2) * 0.75 + exp(-dot(e, e) * 9.0) * 0.5) * uGlow;
  vec3 teal = vec3(0.12, 0.42, 0.46), cyan = vec3(0.45, 0.93, 0.97), violet = vec3(0.6, 0.3, 0.86);
  vec3 col = mix(teal, cyan, smoothstep(-0.5, 0.5, d.x - d.y));
  col = mix(col, violet, smoothstep(0.1, 0.8, d.x + d.y));
  gl_FragColor = vec4(col * g * 0.42, 0.0);
}`,y={inOutExpo:e=>e<=0?0:e>=1?1:e<.5?2**(20*e-10)/2:(2-2**(-20*e+10))/2,inOutPower3:e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,outPower3:e=>1-(1-e)**3},b=e=>Math.min(1,Math.max(0,e)),x=(e,t,n)=>b((e-t)/n),S=(e,t,n)=>e+(t-e)*n,C={cloudIn:.5,gather:.5,gatherDur:2.2,crystal:2.7,crystalDur:.6,pulse:3,text:3.3,leave:5.3,leaveDur:1.2};function w(e,t,n,r){let i=Math.round(320*e.naturalHeight/e.naturalWidth),a=document.createElement(`canvas`);a.width=320,a.height=i;let o=a.getContext(`2d`,{willReadFrequently:!0});if(!o)return null;o.drawImage(e,0,0,320,i);try{return m(o.getImageData(0,0,320,i).data,320,i,t,n,r)}catch{return null}}function T(){if(typeof Worker!=`function`||typeof OffscreenCanvas!=`function`)return null;let e;try{e=new Worker(new URL(`/assets/intro-particles.worker-CgMTzl0v.js`,``+import.meta.url),{type:`module`})}catch{return null}return{run:t=>new Promise(n=>{let r=t=>{window.clearTimeout(i),e.terminate(),n(t)},i=window.setTimeout(()=>r(null),3e3);e.onmessage=e=>r(e.data?.data?{count:t.count,data:e.data.data}:null),e.onerror=()=>r(null),e.postMessage(t)}),stop:()=>e.terminate()}}var E=()=>new Promise(e=>{let t=new MessageChannel;t.port1.onmessage=()=>{t.port1.close(),e()},t.port2.postMessage(0)});async function D(e,t,n){let r=e.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,powerPreference:`high-performance`});if(!r)return null;let i=(e,t)=>{let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n},a=[[h,g],[_,v]],o=[];for(let[e,t]of a){let n=i(r.VERTEX_SHADER,e);await E();let a=i(r.FRAGMENT_SHADER,t);await E(),o.push([n,a])}let s=o.map(([e,t])=>{let n=r.createProgram();return r.attachShader(n,e),r.attachShader(n,t),r.linkProgram(n),n});if(await E(),!(o.every(([e,t])=>r.getShaderParameter(e,r.COMPILE_STATUS)&&r.getShaderParameter(t,r.COMPILE_STATUS))&&s.every(e=>r.getProgramParameter(e,r.LINK_STATUS)))||r.isContextLost())return null;let[c,l]=s;await E();let u=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,u),r.bufferData(r.ARRAY_BUFFER,t.data,r.STATIC_DRAW);let d=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,d),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let f=[`aStart`,`aTarget`,`aColor`,`aSeed`].map(e=>r.getAttribLocation(c,e)),p=[2,2,3,4],m=r.getAttribLocation(l,`p`),y=(e,t)=>Object.fromEntries(t.map(t=>[t,r.getUniformLocation(e,t)])),b=y(c,[`uRes`,`uCenter`,`uSize`,`uDot`,`uDpr`,`uT`,`uIn`,`uGather`,`uCrystal`,`uFade`,`uPulse`,`uGlowPass`]),x=y(l,[`uRes`,`uCenter`,`uSize`,`uGlow`]),S=()=>{e.width=Math.round(window.innerWidth*n),e.height=Math.round(window.innerHeight*n),r.viewport(0,0,e.width,e.height)};S(),r.disable(r.DEPTH_TEST),r.enable(r.BLEND),r.blendFunc(r.ONE,r.ONE);let C=(i,a=!1)=>{r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT);let o=i.size*n;if((i.glow>.002||a)&&(r.useProgram(l),r.bindBuffer(r.ARRAY_BUFFER,d),f.forEach(e=>e>=0&&r.disableVertexAttribArray(e)),r.enableVertexAttribArray(m),r.vertexAttribPointer(m,2,r.FLOAT,!1,0,0),r.uniform2f(x.uRes,e.width,e.height),r.uniform2f(x.uCenter,i.cx*n,i.cy*n),r.uniform1f(x.uSize,o*i.pulse),r.uniform1f(x.uGlow,i.glow),r.drawArrays(r.TRIANGLES,0,3),r.disableVertexAttribArray(m)),i.fade<=.002&&!a)return;r.useProgram(c),r.bindBuffer(r.ARRAY_BUFFER,u);let s=0;f.forEach((e,t)=>{e>=0&&(r.enableVertexAttribArray(e),r.vertexAttribPointer(e,p[t],r.FLOAT,!1,44,s)),s+=p[t]*4}),r.uniform2f(b.uRes,e.width,e.height),r.uniform2f(b.uCenter,i.cx*n,i.cy*n),r.uniform1f(b.uSize,o),r.uniform1f(b.uDot,o*1.75*Math.sqrt(.62/t.count)),r.uniform1f(b.uDpr,n),r.uniform1f(b.uT,i.t),r.uniform1f(b.uIn,i.cin),r.uniform1f(b.uGather,i.gather),r.uniform1f(b.uCrystal,i.crystal),r.uniform1f(b.uFade,i.fade),r.uniform1f(b.uPulse,i.pulse),i.crystal<1&&(r.uniform1f(b.uGlowPass,1),r.drawArrays(r.POINTS,0,Math.floor(t.count/4))),r.uniform1f(b.uGlowPass,0),r.drawArrays(r.POINTS,0,t.count)};return C({cx:0,cy:0,size:100,t:0,cin:0,gather:0,crystal:0,fade:0,pulse:1,glow:0},!0),await E(),r.clear(r.COLOR_BUFFER_BIT),r.isContextLost()?null:{resize:S,draw:e=>C(e),release:()=>r.getExtension(`WEBGL_lose_context`)?.loseContext()}}function O(e,t,n){let r=e.getContext(`2d`);if(!r)return null;let i=document.createElement(`canvas`);i.width=i.height=32;let a=i.getContext(`2d`),o=a.createRadialGradient(16,16,0,16,16,16);o.addColorStop(0,`rgba(255,255,255,1)`),o.addColorStop(.35,`rgba(255,255,255,0.45)`),o.addColorStop(1,`rgba(255,255,255,0)`),a.fillStyle=o,a.fillRect(0,0,32,32);let s=()=>{e.width=Math.round(window.innerWidth*n),e.height=Math.round(window.innerHeight*n)};s();let c=t.data;return{resize:s,release:()=>{e.width=e.height=0},draw(a){let o=e.width,s=e.height,l=a.size*n;r.globalCompositeOperation=`source-over`,r.clearRect(0,0,o,s),r.globalCompositeOperation=`lighter`;let u=a.cx*n,d=a.cy*n,f=l*2.2*Math.sqrt(.62/t.count);for(let e=0;e<t.count;e++){let t=e*11,p=c[t+10]*a.crystal,m=c[t]*o+Math.sin(a.t*.4+c[t+1]*9)*s*.02-u,h=c[t+1]*s+Math.cos(a.t*.35+c[t]*9)*s*.02-d,g=Math.min(1.3,Math.hypot(m,h)/s),_=b((a.gather-g*.26-c[t+8]*.1)/.6),v=y.inOutExpo(_),x=c[t+7]*6.2831+a.t*.16,C=S(c[t+2]*l*a.pulse,Math.cos(x)*.7*l,p),w=S(c[t+3]*l*a.pulse,Math.sin(x)*.6*l,p),T=(1-v)*(1-v)*2.2,E=S(m,C,v),D=S(h,w,v),O=u+E*Math.cos(T)-D*Math.sin(T),k=d+E*Math.sin(T)+D*Math.cos(T),A=c[t+9],j=S((.08+.3*A*A)*a.cin,.6,v)*S(1-a.crystal,.6,c[t+10])*a.fade;if(j<.01)continue;let M=S((1.4+A*A*4)*n,f,v)*2;r.globalAlpha=Math.min(1,j),r.drawImage(i,O-M/2,k-M/2,M,M)}if(r.globalAlpha=1,a.gather>0&&a.fade>0){r.globalCompositeOperation=`source-atop`;let e=r.createLinearGradient(u-l*.5,d+l*.5,u+l*.5,d-l*.5);e.addColorStop(0,`rgba(60,110,115,0.9)`),e.addColorStop(.5,`rgba(140,200,215,0.6)`),e.addColorStop(1,`rgba(150,240,245,0.5)`),r.fillStyle=e,r.globalAlpha=.6*b(a.gather*1.4),r.fillRect(0,0,o,s),r.globalAlpha=1}}}}function k(){let e=document.documentElement,t=document.getElementById(`intro`);if(!t)return;let n=e.classList.contains(`intro-play`),r=Array.from(document.querySelectorAll(`.skip-link, #site-header, #mobile-menu, .page`)),i=!1,c=()=>{},u=()=>{if(i)return;i=!0;let n=t.contains(document.activeElement);if(r.forEach(e=>e.removeAttribute(`inert`)),t.hidden=!0,n){let e=document.getElementById(`main`);e?.setAttribute(`tabindex`,`-1`),e?.focus({preventScroll:!0})}e.classList.remove(`intro-play`,`intro-leaving`),e.classList.add(`intro-done`,`intro-landed`),s(),c();try{localStorage.setItem(`yme-intro`,`1`)}catch{try{sessionStorage.setItem(`yme-intro`,`1`)}catch{}}};if(!n){t.hidden=!0,e.classList.add(`intro-done`);return}r.forEach(e=>e.setAttribute(`inert`,``));let d=t.querySelector(`.intro__line`),f=t.querySelector(`.intro__tag`);if(f){let e=f.textContent??``;f.textContent=``,Array.from(e).forEach((e,t)=>{let n=document.createElement(`span`);n.className=`intro__ch`,n.style.setProperty(`--i`,String(t)),n.textContent=e===` `?`\xA0`:e,f.appendChild(n)})}let p=t.querySelector(`.intro__write`);if(d&&p){let e=p.cloneNode(!0);e.className=`intro__write intro__glint`,d.appendChild(e)}let m=t.querySelectorAll(`.intro__tag .intro__ch`).length/2||17,h=t.querySelector(`.intro__logo`),g=t.querySelector(`.intro__canvas`),_=()=>window.innerWidth,v=()=>window.innerHeight,b=()=>_()<700,k=()=>Math.round(Math.min(270,Math.max(150,Math.min(_()*.46,v()*.3)))),A=()=>({x:_()/2,y:v()*(b()?.4:.42)}),j=h&&h.naturalWidth?h.naturalWidth/h.naturalHeight:640/553,M=()=>{let e=A(),t=k(),n=t*j;h&&(h.style.width=`${n}px`,h.style.height=`${t}px`,h.style.left=`${e.x-n/2}px`,h.style.top=`${e.y-t/2}px`),d&&(d.style.top=`${e.y+t*.5+Math.max(22,t*.14)}px`)};M();let N=document.querySelector(`.brand__mark`),P=()=>{let e=N?.getBoundingClientRect(),t=A(),n=k();return!e||!e.width?{x:44-t.x,y:38-t.y,k:30/n}:{x:e.left+e.width/2-t.x,y:e.top+e.height/2-t.y,k:e.height/n}},F=Math.min(2,window.devicePixelRatio||1),I=null,L=g?T():null,R=async()=>{if(!g||!h||!h.naturalWidth)return;let e={url:h.currentSrc||h.src,count:b()||l?4e3:12e3,haloCount:b()?60:110,aspect:_()/v()},t=L&&await L.run(e)||w(h,e.count,e.haloCount,e.aspect);if(t&&(await E(),I=await D(g,t,F),!I)){let e=document.createElement(`canvas`);e.className=g.className,e.setAttribute(`aria-hidden`,`true`),g.replaceWith(e);let t=w(h,1400,40,_()/v());I=t?O(e,t,Math.min(F,1.5)):null}},z=!1,B=[document.fonts?.load?.(`italic 500 40px "Cormorant Garamond"`),document.fonts?.ready].filter(Boolean);Promise.all(B).then(()=>z=!0,()=>z=!0),window.setTimeout(()=>z=!0,2500),o();let V=!1,H=!1,U=null,W=()=>U??(U=(async()=>{for(let e of a())await E(),await Promise.resolve(e()).catch(()=>void 0)})()),G=new Promise(e=>{if(!h)return e(!1);if(h.complete&&h.naturalWidth)return e(!0);h.addEventListener(`load`,()=>(h.decode?h.decode().catch(()=>void 0):Promise.resolve()).then(()=>e(!0)),{once:!0}),h.addEventListener(`error`,()=>e(!1),{once:!0})});(async()=>{await G&&(M(),await R().catch(()=>void 0)),L?.stop(),I||t.classList.add(`intro--plain`),c=()=>I?.release(),V=!0,await W(),await E(),H=!0})(),window.setTimeout(()=>{H=!0,W()},1600),window.addEventListener(`resize`,()=>{M(),I?.resize()});let K=!1,q=()=>{i||K||(K=!0,e.classList.add(`intro-leaving`,`intro-landed`),t.classList.add(`is-skipping`),window.setTimeout(u,1250))};document.getElementById(`intro-skip`)?.addEventListener(`click`,q);let J=performance.now(),Y=0,X={wm:!1,fill:!1,letters:!1,sweep:!1,leave:!1,landed:!1},Z=n=>{if(i)return;let r=Math.min(.05,(n-J)/1e3);J=n;let a=!H||!V&&Y>=C.gather-.05,o=!z&&Y>=C.text&&!X.wm;a||o||K||(Y+=r);let s=A(),c=x(Y,C.gather,C.gatherDur),l=y.inOutPower3(x(Y,C.crystal,C.crystalDur)),d=x(Y,C.pulse,.6),f=1+.03*Math.sin(d*Math.PI)*(d>0&&d<1),p=x(Y,C.leave,C.leaveDur),g=(y.inOutPower3(x(Y,C.gather+.6,C.gatherDur))*(.55+.25*Math.sin(Math.min(1,l)*Math.PI))-.18*l)*(1-x(Y,C.leave,.5));if(I?.draw({cx:s.x,cy:s.y,size:k(),t:Y,cin:y.outPower3(x(Y,0,C.cloudIn)),gather:c,crystal:l,pulse:f,glow:g*(1+.4*Math.sin(d*Math.PI)*(d>0&&d<1)),fade:1-x(Y,C.leave,.45)}),h){let e=I?y.inOutPower3(x(Y,C.crystal,C.crystalDur*.9)):y.inOutPower3(x(Y,.8,1.6)),t=P(),n=y.inOutExpo(x(Y,C.leave,C.leaveDur*.92)),r=S(1,t.k,n)*f;h.style.opacity=String(e),h.style.transform=`translate3d(${t.x*n}px, ${t.y*n}px, 0) scale(${r})`}let _=C.text;!X.wm&&Y>=_&&(X.wm=!0,t.classList.add(`is-wm`)),!X.fill&&Y>=_+.45&&(X.fill=!0,t.classList.add(`is-fill`)),!X.letters&&Y>=_+.55&&(X.letters=!0,t.classList.add(`is-letters`)),!X.sweep&&Y>=_+.55+m*.04+.25&&(X.sweep=!0,t.classList.add(`is-sweep`)),!X.leave&&Y>=C.leave&&(X.leave=!0,t.classList.add(`is-leaving`),e.classList.add(`intro-leaving`)),!X.landed&&p>=.9&&(X.landed=!0,e.classList.add(`intro-landed`)),p>=1?u():requestAnimationFrame(Z)};requestAnimationFrame(e=>{J=e,requestAnimationFrame(Z)}),window.setTimeout(()=>!K&&q(),11e3)}function A(){let e=document.querySelectorAll(`video[data-bgvideo]`);if(!e.length)return;let t=navigator.connection;if(!document.documentElement.classList.contains(`motion-ok`)||t?.saveData)return;let n=window.matchMedia(`(max-width: 899px)`).matches,r=new IntersectionObserver(e=>{e.forEach(e=>{let t=e.target;e.isIntersecting?t.play().catch(()=>void 0):t.pause()})},{rootMargin:`25% 0px`}),i=()=>e.forEach(e=>{let t=e.dataset,i=n&&t.webmSm?t.webmSm:t.webm,a=n&&t.mp4Sm?t.mp4Sm:t.mp4;[[i,`video/webm`],[a,`video/mp4`]].forEach(([t,n])=>{if(!t)return;let r=document.createElement(`source`);r.src=t,r.type=n,e.appendChild(r)}),e.preload=`auto`,e.addEventListener(`playing`,()=>e.closest(`.bgvideo`)?.classList.add(`is-playing`),{once:!0}),e.load(),r.observe(e)}),a=()=>{let e=window.requestIdleCallback;e?e(i,{timeout:2500}):setTimeout(i,600)};document.readyState===`complete`?a():window.addEventListener(`load`,a,{once:!0})}function j(){document.querySelectorAll(`[data-film]`).forEach(e=>{let t=e.querySelector(`video`),n=e.querySelector(`.film__cover`);t&&n&&(e.classList.add(`is-enhanced`),t.controls=!1,t.tabIndex=-1,n.addEventListener(`click`,()=>{e.classList.add(`is-playing`),t.controls=!0,t.tabIndex=0,t.muted=!1,t.play().catch(()=>{}),t.focus()}),t.addEventListener(`ended`,()=>{let r=document.activeElement===t;e.classList.remove(`is-playing`),t.controls=!1,t.tabIndex=-1,r&&n.focus()}))})}r(),k(),e(),u(),j(),A(),p();var M=document.querySelector(`.hero`);if(M&&t){let e=!1,t=()=>{e=!1;let t=Math.min(1,Math.max(0,window.scrollY/Math.max(1,M.offsetHeight)));M.style.setProperty(`--sy`,t.toFixed(3))};window.addEventListener(`scroll`,()=>{e||window.scrollY>M.offsetHeight*1.2||(e=!0,requestAnimationFrame(t))},{passive:!0})}var N=!1;[`wheel`,`touchstart`,`keydown`,`pointerdown`].forEach(e=>window.addEventListener(e,()=>N=!0,{once:!0,passive:!0})),(d?i:c)(()=>{t&&n(()=>import(`./scroll-DKtpuyLw.js`).then(e=>e.initScroll(()=>N)),__vite__mapDeps([0,1,2,3]))});