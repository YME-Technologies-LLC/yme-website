var e=`#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`,t=e=>`#version 300 es
precision highp float;
#define OCT ${e?3:5}
in vec2 vUv; out vec4 o;
uniform vec2 uRes; uniform float uTime, uScroll, uTone, uCalm, uCity, uFluid, uHero;
uniform sampler2D uVel, uDye;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < OCT; i++){ s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
vec3 pal(float tone, vec3 a, vec3 b, vec3 c){ return tone < 1.0 ? mix(a, b, smoothstep(0.0, 1.0, tone)) : mix(b, c, smoothstep(1.0, 2.0, tone)); }

// defocused discs drifting at different depths
float bokeh(vec2 p, float scale, float seed, float t){
  p *= scale; vec2 id = floor(p); float s = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 c = id + vec2(x, y); float h = hash(c + seed);
    if (h < 0.62) continue;
    vec2 o2 = vec2(hash(c + seed + 3.7), hash(c + seed + 9.1));
    vec2 q = p - c - 0.5 - (o2 - 0.5) * 0.7 - 0.05 * vec2(sin(t + h * 30.0), cos(t * 0.8 + h * 20.0));
    float r = 0.13 + 0.22 * hash(c + seed + 5.5);
    float d = length(q) / r;
    s += (smoothstep(1.0, 0.82, d) * (0.55 + 0.45 * smoothstep(0.55, 0.98, d))) * (0.25 + 0.75 * hash(c + seed + 1.3)) * (0.75 + 0.25 * sin(t * 1.7 + h * 50.0));
  }
  return s;
}
// far skyline, out of focus: scattered discs of window light under a building profile, and a smeared reflection
float profile(float x){ return 0.03 + 0.19 * pow(noise(vec2(x * 9.0, 3.0)), 1.6) * (0.4 + 0.6 * noise(vec2(x * 2.3, 8.0))); }
vec3 cityLayer(vec2 q, float scale, float seed, float t, float horizon){
  vec2 g = q * scale; vec2 id = floor(g); vec3 acc = vec3(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec2 c = id + vec2(i, j);
    float h = hash(c + seed);
    if (h < 0.5) continue;
    vec2 o2 = vec2(hash(c + seed + 2.3), hash(c + seed + 7.9));
    vec2 centre = (c + 0.2 + o2 * 0.6) / scale;
    float above = centre.y - horizon;
    if (above < 0.004 || above > profile(centre.x)) continue;
    float r = (0.16 + 0.3 * hash(c + seed + 4.1)) / scale;
    float d = length(q - centre) / r;
    float disc = smoothstep(1.0, 0.7, d) * (0.6 + 0.4 * smoothstep(0.4, 0.95, d));   // soft disc with a slightly brighter rim, like a real defocused light
    vec3 warm = mix(vec3(1.0, 0.70, 0.38), vec3(1.0, 0.88, 0.70), hash(c + seed + 1.1));
    vec3 cool = mix(vec3(0.55, 0.92, 0.95), vec3(0.74, 0.60, 0.96), hash(c + seed + 5.5));
    float tw = 0.75 + 0.25 * sin(t * (0.4 + h * 1.6) + h * 40.0);
    acc += mix(warm, cool, step(0.82, hash(c + seed + 9.9))) * disc * tw * (0.25 + 0.75 * hash(c + seed + 6.2));
  }
  return acc;
}
vec3 city(vec2 uv, float aspect, float t){
  float horizon = 0.17;
  vec2 q = vec2(uv.x * aspect, uv.y);
  vec3 c = vec3(0.0);
  if (uv.y > horizon){
    c = cityLayer(q, 46.0, 3.0, t, horizon) * 0.5 + cityLayer(q, 27.0, 11.0, t, horizon) * 0.34 + cityLayer(q, 15.0, 23.0, t, horizon) * 0.2;
  } else {
    float depth = horizon - uv.y;
    float column = pow(noise(vec2(q.x * 30.0, 1.0)), 2.0) * (0.3 + 0.7 * smoothstep(0.03, 0.16, profile(q.x)));
    float shimmer = 0.4 + 0.6 * noise(vec2(q.x * 70.0, depth * 150.0 - t * 0.8));
    vec3 tint = mix(vec3(1.0, 0.74, 0.44), vec3(0.62, 0.78, 0.98), noise(vec2(q.x * 6.0, 4.0)));
    c = tint * column * shimmer * exp(-depth * 15.0) * 0.36;
  }
  c += vec3(1.0, 0.7, 0.42) * 0.06 * exp(-abs(uv.y - horizon) * 42.0);
  return c;
}
void main(){
  float aspect = uRes.x / uRes.y;
  vec2 vel = uFluid > 0.5 ? texture(uVel, vUv).xy : vec2(0.0);
  vec2 uv = vUv - vel * 0.0006;                   // the liquid bends everything behind it
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  float t = uTime * 0.045;

  // Large, very soft pools of light drifting slowly in a deep night: no cloud texture, no visible noise.
  // (The earlier fbm "aurora" read as a generated cloud render.) Pools travel against the scroll so
  // the light moves with the page; one very low-frequency field keeps them from looking geometric.
  vec3 base = pal(uTone, vec3(0.030, 0.026, 0.060), vec3(0.016, 0.022, 0.040), vec3(0.030, 0.022, 0.050));
  vec3 cA   = pal(uTone, vec3(0.36, 0.24, 0.62), vec3(0.16, 0.46, 0.54), vec3(0.40, 0.22, 0.56));  // violet / teal / violet
  vec3 cB   = pal(uTone, vec3(0.20, 0.52, 0.62), vec3(0.22, 0.40, 0.70), vec3(0.62, 0.32, 0.44));  // cyan / blue / rose
  vec3 cC   = pal(uTone, vec3(0.95, 0.62, 0.34), vec3(0.42, 0.84, 0.86), vec3(0.98, 0.64, 0.34));  // amber / cyan / amber
  float sc = uScroll * 0.55;
  float warp = noise(p * 0.9 + vec2(t * 0.6, -t * 0.4)) - 0.5;           // one octave, very low frequency
  vec2 pw = p + warp * 0.18;
  vec2 c1 = vec2(-0.55 + 0.18 * sin(t * 1.3), 0.18 + 0.12 * cos(t * 1.1));
  vec2 c2 = vec2(0.62 + 0.16 * cos(t * 0.9), -0.12 + 0.14 * sin(t * 1.2));
  vec2 c3 = vec2(0.10 + 0.3 * sin(t * 0.7 + 1.3), -0.62 + 0.1 * cos(t * 0.8));
  // pools wrap vertically as the page scrolls, so every screen has its own light
  c1.y = mod(c1.y + 0.5 + sc * 0.8, 1.9) - 0.95;
  c2.y = mod(c2.y + 0.5 + sc * 0.6, 1.9) - 0.95;
  c3.y = mod(c3.y + 0.5 + sc * 0.7, 1.9) - 0.95;
  float g1 = exp(-dot(pw - c1, pw - c1) * 2.2);
  float g2 = exp(-dot(pw - c2, pw - c2) * 2.6);
  float g3 = exp(-dot(pw - c3, pw - c3) * 4.0);
  vec3 col = base;
  col += cA * g1 * 0.2;
  col += cB * g2 * 0.16;
  col += cC * g3 * 0.06;
  col *= 0.78 + 0.22 * smoothstep(1.3, 0.2, length(p * vec2(0.8, 1.05)));   // gentle vignette

  // ---- the hero: a dark liquid in the logo's colours (cyan → teal → violet), folding slowly on itself.
  // The cursor's flow pushes and bends it hard here; it fades out as the hero scrolls away.
  if (uHero > 0.001){
    vec2 lu = vUv - vel * 0.0018;                                   // the liquid is dragged gently by the cursor's flow
    vec2 lq = vec2((lu.x - 0.5) * aspect, lu.y - 0.5) * 1.25;
    float lt = uTime * 0.035 + uScroll * 0.55;                      // drifts on its own, and with the scroll on touch screens
    vec2 w1 = vec2(fbm(lq + vec2(0.0, lt)), fbm(lq + vec2(5.2, 1.3) - lt));
    vec2 w2 = vec2(fbm(lq + 2.6 * w1 + vec2(1.7, 9.2) + lt * 0.7), fbm(lq + 2.6 * w1 + vec2(8.3, 2.8) - lt * 0.6));
    float f = fbm(lq + 2.8 * w2);
    float folds = 0.5 + 0.5 * sin(f * 11.0 + length(w2) * 6.0 - lt * 3.0);   // silky folds along the flow
    vec3 lteal = vec3(0.06, 0.32, 0.36), lcyan = vec3(0.42, 0.88, 0.92), lviolet = vec3(0.44, 0.24, 0.72);
    vec3 lc = mix(lteal, lcyan, smoothstep(0.42, 0.85, f));
    lc = mix(lc, lviolet, smoothstep(0.35, 0.95, w2.x) * 0.85);
    float body = pow(smoothstep(0.12, 0.9, f), 1.35);
    ${e?`body = min(1.0, body * 1.9);  // fewer octaves on phones: lift it to the same presence`:``}
    vec3 liquid = vec3(0.014, 0.018, 0.04) + lc * (body * 0.95 + pow(folds, 5.0) * body * 0.65);
    liquid *= 0.55 + 0.45 * smoothstep(-0.25, 0.85, lu.x);          // calmer behind the headline on the left
    col = mix(col, liquid, uHero);
  }

  if (uCity > 0.001){
    vec2 cuv = vec2(uv.x, uv.y - uScroll * 0.92);  // the skyline belongs to the first screen and scrolls away
    col += city(cuv, aspect, uTime) * uCity * (0.22 + 0.78 * smoothstep(0.15, 0.8, uv.x));
  }

  if (uFluid > 0.5) col += texture(uDye, vUv).rgb;  // the cursor's short-lived trail of light

  col = mix(col, vec3(0.03, 0.035, 0.062), uCalm);  // the 3D stage's own night colour  // steps back behind the 3D phone scene
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.012;  // dither: no banding
  o = vec4(col, 1.0);
}`,n=`#version 300 es
precision highp float; in vec2 vUv; out vec4 o;
uniform sampler2D uV, uSrc; uniform vec2 uTexel; uniform float uDt, uDiss;
void main(){ vec2 c = vUv - uDt * texture(uV, vUv).xy * uTexel; o = uDiss * texture(uSrc, c); }`,r=`#version 300 es
precision highp float; in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uPoint; uniform vec3 uColor; uniform float uRadius, uAspect;
void main(){ vec2 d = vUv - uPoint; d.x *= uAspect; o = vec4(texture(uSrc, vUv).rgb + exp(-dot(d, d) / uRadius) * uColor, 1.0); }`,i=`#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uV; uniform vec2 uTexel;
void main(){ float L = texture(uV, vUv - vec2(uTexel.x, 0)).x, R = texture(uV, vUv + vec2(uTexel.x, 0)).x,
  B = texture(uV, vUv - vec2(0, uTexel.y)).y, T = texture(uV, vUv + vec2(0, uTexel.y)).y; o = vec4(0.5 * (R - L + T - B), 0, 0, 1); }`,a=`#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uP, uD; uniform vec2 uTexel;
void main(){ float L = texture(uP, vUv - vec2(uTexel.x, 0)).x, R = texture(uP, vUv + vec2(uTexel.x, 0)).x,
  B = texture(uP, vUv - vec2(0, uTexel.y)).x, T = texture(uP, vUv + vec2(0, uTexel.y)).x; o = vec4((L + R + B + T - texture(uD, vUv).x) * 0.25, 0, 0, 1); }`,o=`#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uP, uV; uniform vec2 uTexel;
void main(){ float L = texture(uP, vUv - vec2(uTexel.x, 0)).x, R = texture(uP, vUv + vec2(uTexel.x, 0)).x,
  B = texture(uP, vUv - vec2(0, uTexel.y)).x, T = texture(uP, vUv + vec2(0, uTexel.y)).x; o = vec4(texture(uV, vUv).xy - vec2(R - L, T - B), 0, 1); }`,s=1.17,c=1.35,l=1.3,u=0,d=0;function f(e){d=e}function p(n){let r=document.createElement(`canvas`);r.className=`bg`,r.setAttribute(`aria-hidden`,`true`);let i=r.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:n.lite?`low-power`:`high-performance`});if(!i)return!1;let a=t=>{let n=(e,t)=>{let n=i.createShader(e);if(i.shaderSource(n,t),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw Error(i.getShaderInfoLog(n)||`shader`);return n},r=i.createProgram();if(i.attachShader(r,n(i.VERTEX_SHADER,e)),i.attachShader(r,n(i.FRAGMENT_SHADER,t)),i.bindAttribLocation(r,0,`p`),i.linkProgram(r),!i.getProgramParameter(r,i.LINK_STATUS))throw Error(i.getProgramInfoLog(r)||`link`);let a=new Map;return{pr:r,u:e=>(a.has(e)||a.set(e,i.getUniformLocation(r,e)),a.get(e))}},o=i.getExtension(`KHR_parallel_shader_compile`),f,p=!1;f=(()=>{let r=(e,t)=>{let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n},a=i.createProgram(),o=r(i.VERTEX_SHADER,e),s=r(i.FRAGMENT_SHADER,t(n.lite));i.attachShader(a,o),i.attachShader(a,s),i.bindAttribLocation(a,0,`p`),i.linkProgram(a);let c=new Map;return{pr:a,u:e=>(c.has(e)||c.set(e,i.getUniformLocation(a,e)),c.get(e))}})();let _=()=>{if(p)return!0;if(o&&!i.getProgramParameter(f.pr,o.COMPLETION_STATUS_KHR))return!1;if(!i.getProgramParameter(f.pr,i.LINK_STATUS))throw Error(`bg shader`);return p=!0,!0};if(!o)try{_()}catch{return!1}i.bindBuffer(i.ARRAY_BUFFER,i.createBuffer()),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),i.STATIC_DRAW),i.enableVertexAttribArray(0),i.vertexAttribPointer(0,2,i.FLOAT,!1,0,0);let v=null,y=n.fluid?i.getExtension(`EXT_color_buffer_float`)?`float`:n.touch&&i.getExtension(`EXT_color_buffer_half_float`)?`half float`:``:``,b=!!y,x=!1,S=n.fluid?y?`not built yet`:`off: no float or half-float render targets`:`off (not asked for)`,C=()=>{if(x)return;x=!0;let e=[];for(let t of n.touch?[!1,!0]:[!1])try{v=g(i,a,t),S=`on (${y}${t?`, RGBA targets`:``})`;return}catch(t){v=null,e.push(String(t?.message||t))}S=`off: ${e.join(` / `)}`};b&&!n.touch&&C();let w=n.lite?.34:.5,T=!1,E=()=>{let e=Math.max(2,Math.min(n.lite?520:1280,Math.round(window.innerWidth*w))),t=Math.max(2,Math.round(e*window.innerHeight/window.innerWidth));(e!==r.width||t!==r.height)&&(r.width=e,r.height=t,T=!1)};E(),window.addEventListener(`resize`,E),document.body.prepend(r),document.documentElement.classList.add(`has-bg`);let D=document.querySelector(`.how`),O=document.querySelector(`#events`),k=document.querySelector(`#film`),A=!!D,j=A?0:.55,M=()=>{if(!A||!D||!O)return .55;let e=window.innerHeight,t=t=>Math.min(1,Math.max(0,1-t.getBoundingClientRect().top/e)),n=t(D),r=t(O),i=k?t(k):0;return n+r-i*.55},N=document.querySelector(`.hero`),P=()=>{if(!N)return 0;let e=N.offsetHeight||window.innerHeight,t=1-Math.min(1,Math.max(0,window.scrollY/(e*.9)));return t*t*(3-2*t)},F={x:.5,y:.5,px:.5,py:.5,moved:!1,tap:!1,hue:0};v&&!n.touch&&window.addEventListener(`pointermove`,e=>{e.pointerType!==`touch`&&(F.x=e.clientX/window.innerWidth,F.y=1-e.clientY/window.innerHeight,F.moved=!0)},{passive:!0});let I=P(),L=null;if(n.touch){let e=e=>{F.x=e.clientX/window.innerWidth,F.y=1-e.clientY/window.innerHeight};window.addEventListener(`touchstart`,t=>{let n=t.touches[0];!n||I<=.01||(b&&C(),v?(e(n),F.px=F.x,F.py=F.y,F.tap=!0,R?.(`fluid ${S}`)):(L??(L=m()),L.at(n.clientX,n.clientY,!0),R?.(`fluid ${S} · soft glow under the finger instead`)))},{passive:!0}),window.addEventListener(`touchmove`,t=>{let n=t.touches[0];!n||I<=.01||(v?(e(n),F.moved=!0):L?.at(n.clientX,n.clientY,!1))},{passive:!0}),window.addEventListener(`touchend`,()=>L?.release(),{passive:!0}),window.addEventListener(`touchcancel`,()=>L?.release(),{passive:!0})}let R=new URLSearchParams(location.search).get(`debug`)===`1`?h():null;R?.(`bg ${n.lite?`lite`:`full`} · touch ${n.touch?`yes`:`no`} · fluid ${S}`);let z=performance.now(),B=0,V=!0,H=z,U=e=>{if(!V||(requestAnimationFrame(U),B++,n.lite&&B%2))return;let t=Math.min(.033,(e-z)/1e3);if(z=e,v){if(F.tap){F.tap=!1;let e=(.05+.05*P())*s;v.splat(F.x,F.y,0,0,[.36*e,.7*e,.86*e])}if(F.moved){let e=F.x-F.px,t=F.y-F.py,r=Math.hypot(e,t);if(r>4e-4&&r<.4){F.hue+=r*6;let i=.5+.5*Math.sin(F.hue),a=P(),o=Math.min(.3-.15*a,(.07+r*2.4)*(1-.5*a)),l=9e3*(1-.2*a);n.touch&&(o*=s,l*=c),v.splat(F.x,F.y,e*l,t*l,[(.3+.28*i)*o,(.86-.5*i)*o,(.9-.1*i)*o])}F.px=F.x,F.py=F.y,F.moved=!1}v.active()&&v.step(t,P(),n.touch?l:1)}I=P(),u+=(d-u)*.08,j+=(M()-j)*.06;let a=!1;try{a=_()}catch{V=!1,r.remove(),document.documentElement.classList.remove(`has-bg`);return}if(!a)return;let o=n.lite&&d>.999&&u>.998&&P()===0&&!(v&&v.active());o&&T||(T=o,o&&(u=1),i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,r.width,r.height),i.useProgram(f.pr),i.uniform2f(f.u(`uRes`),r.width,r.height),i.uniform1f(f.u(`uTime`),(e-H)/1e3),i.uniform1f(f.u(`uScroll`),window.scrollY/window.innerHeight),i.uniform1f(f.u(`uTone`),j),i.uniform1f(f.u(`uCalm`),u),i.uniform1f(f.u(`uCity`),0),i.uniform1f(f.u(`uHero`),P()),i.uniform1f(f.u(`uFluid`),+!!v),v&&(i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,v.vel()),i.uniform1i(f.u(`uVel`),0),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,v.dye()),i.uniform1i(f.u(`uDye`),1)),i.drawArrays(i.TRIANGLES,0,3))};return requestAnimationFrame(U),document.addEventListener(`visibilitychange`,()=>{V=!document.hidden,V&&(z=performance.now(),requestAnimationFrame(U))}),r.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),V=!1,document.documentElement.classList.remove(`has-bg`)}),!0}function m(){let e=document.createElement(`div`);e.className=`bg-touch`,e.setAttribute(`aria-hidden`,`true`),e.style.cssText=`position:fixed;left:0;top:0;z-index:0;width:180px;height:180px;margin:-90px 0 0 -90px;border-radius:50%;pointer-events:none;opacity:0;will-change:transform,opacity;transition:opacity 0.7s ease-out;background:radial-gradient(closest-side,rgba(150,236,240,0.57),rgba(110,170,215,0.27) 48%,rgba(130,90,205,0.11) 74%,rgba(130,90,205,0) 100%);mix-blend-mode:screen`,document.querySelector(`canvas.bg`)?.after(e);let t=0,n=!1;return{at(r,i,a){n=!0,e.style.transform=`translate3d(${r.toFixed(1)}px, ${i.toFixed(1)}px, 0) scale(${a?.8:1})`,e.style.transition=`opacity 0.12s ease-out`,e.style.opacity=`1`,window.clearTimeout(t),t=window.setTimeout(()=>this.release(),900)},release(){n&&(n=!1,e.style.transition=`opacity 0.7s ease-out`,e.style.opacity=`0`)}}}function h(){let e=document.createElement(`div`);e.style.cssText=`position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,0.72);color:#9ff;font:12px/1.35 ui-monospace,monospace;pointer-events:none;white-space:pre-wrap`,document.body.appendChild(e);let t=[];return n=>{t.push(n),e.textContent=t.slice(-4).join(`
`)}}function g(e,t,s=!1){let c=window.innerWidth/window.innerHeight,l=Math.round(96*c),u=Math.round(240*c),d=[],f=()=>{e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,null);for(let t of d)e.deleteTexture(t.tex),t.fbo&&e.deleteFramebuffer(t.fbo);d.length=0},p=(t,n,r,i)=>{let a=e.createTexture();d.push({tex:a,fbo:null}),e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,r,t,n,0,i,e.HALF_FLOAT,null);let o=e.createFramebuffer();d[d.length-1].fbo=o,e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,a,0);let s=e.checkFramebufferStatus(e.FRAMEBUFFER);if(s!==e.FRAMEBUFFER_COMPLETE)throw f(),Error(`render target 0x${r.toString(16)} incomplete (0x${s.toString(16)})`);return e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),{tex:a,fbo:o,w:t,h:n}},m=(e,t,n,r)=>{let i={read:p(e,t,n,r),write:p(e,t,n,r),swap(){let e=i.read;i.read=i.write,i.write=e}};return i},h=s?m(l,96,e.RGBA16F,e.RGBA):m(l,96,e.RG16F,e.RG),g=m(u,240,e.RGBA16F,e.RGBA),_=s?m(l,96,e.RGBA16F,e.RGBA):m(l,96,e.R16F,e.RED),v=s?p(l,96,e.RGBA16F,e.RGBA):p(l,96,e.R16F,e.RED),y=(()=>{try{return{advect:t(n),splat:t(r),div:t(i),press:t(a),grad:t(o)}}catch(e){throw f(),e}})(),b=(t,n)=>(e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,n),t),x=t=>{e.bindFramebuffer(e.FRAMEBUFFER,t.fbo),e.viewport(0,0,t.w,t.h),e.drawArrays(e.TRIANGLES,0,3)},S=0;return{vel:()=>h.read.tex,dye:()=>g.read.tex,active:()=>S>.02,splat(t,n,r,i,a){S=1,e.useProgram(y.splat.pr),e.uniform1f(y.splat.u(`uAspect`),c),e.uniform2f(y.splat.u(`uPoint`),t,n),e.uniform1i(y.splat.u(`uSrc`),b(0,h.read.tex)),e.uniform3f(y.splat.u(`uColor`),r,i,0),e.uniform1f(y.splat.u(`uRadius`),.0016),x(h.write),h.swap(),e.uniform1i(y.splat.u(`uSrc`),b(0,g.read.tex)),e.uniform3f(y.splat.u(`uColor`),a[0],a[1],a[2]),e.uniform1f(y.splat.u(`uRadius`),.0011),x(g.write),g.swap()},step(t,n=0,r=1){S*=.985;let i=[1/l,1/96];e.useProgram(y.advect.pr),e.uniform2f(y.advect.u(`uTexel`),i[0],i[1]),e.uniform1f(y.advect.u(`uDt`),t),e.uniform1i(y.advect.u(`uV`),b(0,h.read.tex)),e.uniform1i(y.advect.u(`uSrc`),b(0,h.read.tex)),e.uniform1f(y.advect.u(`uDiss`),.982-.03*n),x(h.write),h.swap(),e.uniform1i(y.advect.u(`uV`),b(0,h.read.tex)),e.uniform1i(y.advect.u(`uSrc`),b(1,g.read.tex));let a=.955-.035*n;e.uniform1f(y.advect.u(`uDiss`),r===1?a:1-(1-a)/r),x(g.write),g.swap(),e.useProgram(y.div.pr),e.uniform2f(y.div.u(`uTexel`),i[0],i[1]),e.uniform1i(y.div.u(`uV`),b(0,h.read.tex)),x(v),e.useProgram(y.press.pr),e.uniform2f(y.press.u(`uTexel`),i[0],i[1]),e.uniform1i(y.press.u(`uD`),b(1,v.tex));for(let t=0;t<12;t++)e.uniform1i(y.press.u(`uP`),b(0,_.read.tex)),x(_.write),_.swap();e.useProgram(y.grad.pr),e.uniform2f(y.grad.u(`uTexel`),i[0],i[1]),e.uniform1i(y.grad.u(`uP`),b(0,_.read.tex)),e.uniform1i(y.grad.u(`uV`),b(1,h.read.tex)),x(h.write),h.swap()}}}export{p as initBackground,f as setBackgroundCalm};