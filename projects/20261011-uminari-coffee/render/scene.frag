#version 300 es
//UMINARI COFFEE 用の写真風CGレンダラー（WebGL2 レイマーチング）
//  ?scene=0..8&w=1600&h=900 で1枚描画。tools: render/render.mjs から呼ぶ。
//  0 hero 夕日とテラス / 1 赤瓦の軒先 / 2 西向き12席 / 3 島の素材 / 4 予約席
//  5 やんばるブレンド / 6 黒糖ラテ / 7 シークヮーサーソーダ / 8 紅芋バスクチーズケーキ
precision highp float;
uniform vec2 R; uniform int S; uniform float SEED;
out vec4 O;
#define PI 3.14159265

// ---------- noise ----------
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float h31(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float vn3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec2 p){ float s=0.,a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ s+=a*vn(p); p=m*p; a*=.5; } return s; }
float fbm3(vec3 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn3(p); p*=2.03; a*=.5; } return s; }

// ---------- scene globals ----------
vec3 SUN, SUNC, SKYZ, SKYH, AMB;
float SEA = 0.0;          // sea level
bool CLOSEUP = false;     // テーブル上の物撮りモード（背景をぼかす）
float TABLE_Y = 0.72;
float GX = 0.;           // ヒーローの椅子・テーブルの横位置

// ---------- SDF primitives ----------
float sdBox(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float sdRBox(vec3 p, vec3 b, float r){ return sdBox(p,b-r)-r; }
float sdCyl(vec3 p, float r, float h){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
float sdRCyl(vec3 p, float r, float h, float rr){ vec2 d=vec2(length(p.xz)-r+rr,abs(p.y)-h+rr); return min(max(d.x,d.y),0.)+length(max(d,0.))-rr; }
float sdTorus(vec3 p, vec2 t){ vec2 q=vec2(length(p.xz)-t.x,p.y); return length(q)-t.y; }
float sdEll(vec3 p, vec3 r){ float k0=length(p/r), k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
vec2 U(vec2 a, vec2 b){ return a.x<b.x?a:b; }
mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

// materials
#define M_WOOD 1.
#define M_DECK 2.
#define M_WHITE 3.
#define M_COFFEE 4.
#define M_TILE 5.
#define M_DARKWOOD 6.
#define M_LATTE 7.
#define M_GLASS 8.
#define M_SODA 9.
#define M_ICE 10.
#define M_LIME 11.
#define M_LIMEIN 12.
#define M_CAKE 13.
#define M_CAKETOP 14.
#define M_BEAN 15.
#define M_SUGAR 16.
#define M_IMO 17.
#define M_IMOIN 18.
#define M_CARD 19.
#define M_TABLE 20.
#define M_LINEN 21.
#define M_PLASTER 22.

// ---------- 家具 ----------
float chairBack(vec3 p){ // 椅子：原点=床、+zが海側（後ろから見る）
  float d=sdRBox(p-vec3(0,.45,0),vec3(.23,.022,.21),.01);           // 座面
  vec3 q=p; q.x=abs(q.x); q.z=abs(q.z);
  d=min(d,sdRBox(q-vec3(.2,.22,.18),vec3(.02,.22,.02),.008));         // 脚
  vec3 b=p-vec3(0,0,-.19);
  vec3 bq=b; bq.x=abs(bq.x);
  d=min(d,sdRBox(bq-vec3(.2,.68,0),vec3(.02,.24,.02),.008));          // 背の支柱
  d=min(d,sdRBox(b-vec3(0,.86,0),vec3(.22,.035,.018),.01));           // 背板
  d=min(d,sdRBox(b-vec3(0,.66,0),vec3(.2,.02,.012),.006));
  d=min(d,sdRBox(q-vec3(0,.3,.18),vec3(.2,.012,.012),.005));          // 貫
  return d;
}
float tableRound(vec3 p){
  float d=sdRCyl(p-vec3(0,.72,0),.34,.02,.008);
  d=min(d,sdCyl(p-vec3(0,.37,0),.03,.35));
  d=min(d,sdRCyl(p-vec3(0,.02,0),.2,.02,.01));
  return d;
}
float cupShape(vec3 p, out float liquid){ // 原点=受け皿の底
  float saucer=sdRCyl(p-vec3(0,.006,0),.075,.005,.004);
  saucer=smin(saucer,sdTorus(p-vec3(0,.011,0),vec2(.07,.004)),.006);
  vec3 c=p-vec3(0,.045,0);
  float outer=sdRCyl(c,.042,.034,.01);
  float inner=sdRCyl(c-vec3(0,.012,0),.036,.034,.008);
  float cup=max(outer,-inner);
  float handle=sdTorus((c-vec3(.052,0,0)).xzy,vec2(.018,.0045));
  handle=max(handle,-(length(c.xz)-.04));
  cup=min(cup,handle);
  liquid=sdCyl(c-vec3(0,.018,0),.035,.002);
  return min(saucer,cup);
}

// ---------- シーン（SDF） ----------
vec2 map(vec3 p){
  vec2 r=vec2(1e9,0);
  if(S==0||S==9){ // ヒーロー：テラスから夕日（9はスマホ縦）
    r=U(r,vec2(sdBox(p-vec3(0,.5,-3.5),vec3(12,.06,3.0)),M_DECK));
    vec3 g=p-vec3(GX,0,0); vec3 q=g; q.x=abs(q.x);
    r=U(r,vec2(chairBack(q-vec3(.62,.56,-.75)),M_WOOD));
    r=U(r,vec2(tableRound(g-vec3(0,.56,-.55)),M_WOOD));
    float l; r=U(r,vec2(cupShape(g-vec3(-.1,1.3,-.6),l),M_WHITE));
    r=U(r,vec2(cupShape(g-vec3(.12,1.3,-.5),l),M_WHITE));
    // 低い手すり
    float rail=sdRBox(p-vec3(0,1.1,-.45),vec3(12,.03,.04),.01);
    vec3 pp=p; pp.x=mod(pp.x+1.8,3.6)-1.8;
    rail=min(rail,sdRBox(pp-vec3(0,.82,-.45),vec3(.045,.3,.045),.01));
    r=U(r,vec2(rail,M_DARKWOOD));
  } else if(S==1){ // 赤瓦の軒先
    vec3 q=p-vec3(0,3.05,-1.2);
    float roof=sdBox(q,vec3(6,.12,1.6));
    float tiles=q.y-.12-.05*abs(sin(p.x*7.))-.02*(1.-step(.5,fract(p.z*3.3)));
    tiles=max(max(tiles,.1-q.y),sdBox(q,vec3(6,.4,1.6)));
    r=U(r,vec2(roof,M_DARKWOOD)); r=U(r,vec2(tiles,M_TILE));
    vec3 rf=p; rf.x=mod(rf.x+.3,.6)-.3; r=U(r,vec2(sdBox(rf-vec3(0,2.88,-1.2),vec3(.045,.07,1.62)),M_WOOD)); // 垂木
    r=U(r,vec2(sdBox(p-vec3(0,2.86,.38),vec3(6,.1,.05)),M_DARKWOOD)); // 鼻隠し
    vec3 c=p; c.x=abs(c.x);
    r=U(r,vec2(sdRBox(c-vec3(1.15,1.65,.3),vec3(.07,1.2,.07),.01),M_DARKWOOD));
    r=U(r,vec2(sdBox(p-vec3(0,.5,-1.5),vec3(8,.06,2.2)),M_DECK));
    r=U(r,vec2(chairBack(c-vec3(.45,.56,-.1)),M_WOOD));
  } else if(S==2){ // 西向き12席
    r=U(r,vec2(sdBox(p-vec3(0,.5,-1.6),vec3(9,.06,2.2)),M_DECK));
    r=U(r,vec2(sdBox(p-vec3(0,.3,.85),vec3(9,.05,.25)),M_DECK));
    r=U(r,vec2(sdBox(p-vec3(0,.12,1.25),vec3(9,.05,.25)),M_DECK));
    vec3 c=p; float id=clamp(floor((c.x+5.4)/0.9),0.,11.); c.x-=id*0.9-5.4+.45;
    r=U(r,vec2(chairBack(c-vec3(0,.56,-.2)),M_WOOD));
  } else { // テーブル上の物撮り
    float ze=S==3?9.:.16; r=U(r,vec2(max(p.y,p.z-ze),M_TABLE));
    float l;
    if(S==3){ // 素材のフラットレイ
      for(int i=0;i<9;i++){ float fi=float(i); vec2 o=vec2(-.13+.025*sin(fi*2.3),-.06+.03*cos(fi*1.7))+vec2(fi*.009,fi*.006);
        vec3 b=p-vec3(o.x,.0075,o.y); b.xz=rot(fi*1.3)*b.xz;
        float bean=sdEll(b,vec3(.0105,.0075,.0075));
        bean=max(bean,-sdBox(b-vec3(0,.0075,0),vec3(.011,.0012,.0011)));
        r=U(r,vec2(bean,M_BEAN)); }
      for(int i=0;i<3;i++){ float fi=float(i); vec3 s=p-vec3(-.02+fi*.035,.012,.075-fi*.012); s.xz=rot(fi*.7+.3)*s.xz;
        float sg=sdRBox(s,vec3(.016,.012,.014),.004); sg+=.0015*vn3(s*400.);
        r=U(r,vec2(sg,M_SUGAR)); }
      vec3 c1=p-vec3(.09,.026,-.05); float half1=max(length(c1)-.028,c1.y); r=U(r,vec2(half1,c1.y>-.0015&&length(c1.xz)<.025?M_LIMEIN:M_LIME));
      vec3 c2=p-vec3(.14,.024,.0); float half2=max(length(c2)-.026,c2.y); r=U(r,vec2(half2,c2.y>-.0015&&length(c2.xz)<.023?M_LIMEIN:M_LIME));
      vec3 im=p-vec3(.12,.02,.09); im.xz=rot(.5)*im.xz;
      float imo=sdEll(im,vec3(.075,.03,.032)); imo=max(imo,im.x-.05);
      r=U(r,vec2(imo,(im.x>.046)?M_IMOIN:M_IMO));
      vec3 sl=p-vec3(.0,.004,.12); float slice=sdRCyl(sl,.03,.004,.002); r=U(r,vec2(slice,M_IMOIN));
    } else if(S==4){ // 予約席のカード＋カップ
      r=U(r,vec2(cupShape(p-vec3(.09,0,.02),l),M_WHITE));
      if(l<.001) r=vec2(l,M_COFFEE);
      vec3 cd=p-vec3(-.06,0,.0); cd.xz=rot(.25)*cd.xz;
      float card=max(abs(cd.z+cd.y*.32)-.002,sdBox(cd-vec3(0,.04,0),vec3(.06,.04,.03)));
      card=min(card,max(abs(cd.z-cd.y*.32)-.002,sdBox(cd-vec3(0,.04,0),vec3(.06,.04,.03))));
      r=U(r,vec2(card,M_CARD));
    } else if(S==5||S==6){
      vec2 cp=vec2(cupShape(p,l),M_WHITE); r=U(r,cp);
      if(l<r.x) r=vec2(l,S==5?M_COFFEE:M_LATTE);
      if(S==6){ for(int i=0;i<3;i++){ float fi=float(i); vec3 s=p-vec3(-.075+fi*.013,.006,.07+fi*.005); s.xz=rot(fi)*s.xz; r=U(r,vec2(sdRBox(s,vec3(.006,.005,.005),.0015),M_SUGAR)); } }
    } else if(S==7){
      vec3 g=p-vec3(0,.075,0);
      float glass=max(sdCyl(g,.038,.075),-sdCyl(g-vec3(0,.006,0),.035,.075));
      r=U(r,vec2(glass,M_GLASS));
      vec3 lm=p-vec3(.03,.15,0); lm.xy=rot(.5)*lm.xy;
      float lime=sdCyl(lm.xzy,.018,.003);
      r=U(r,vec2(lime,abs(lm.z)<.003&&length(lm.xy)<.019?M_LIMEIN:M_LIME));
      vec3 lm2=p-vec3(-.09,.004,.05); r=U(r,vec2(sdRCyl(lm2,.02,.004,.002),M_LIMEIN));
    } else if(S==8){
      r=U(r,vec2(sdRCyl(p-vec3(0,.006,0),.1,.006,.004),M_WHITE));
      vec3 k=p-vec3(0,.012,0); k.xz=rot(1.9)*k.xz; k.x+=.04;
      float th=.42; float wedge=max(length(k.xz)-.085,max(dot(k.xz,vec2(-sin(th),cos(th))),dot(k.xz,vec2(-sin(th),-cos(th)))));
      wedge=max(wedge,abs(k.y-.025)-.025);
      wedge-=.002; wedge+=.0015*fbm3(k*300.);
      float top=k.y-.046+.004*fbm3(k*120.);
      r=U(r,vec2(wedge,top>-.003?M_CAKETOP:(length(k.xz)>.079?M_CAKETOP:M_CAKE)));
      vec3 f=p-vec3(.045,.014,-.045); f.xz=rot(.9)*f.xz; r=U(r,vec2(sdRBox(f,vec3(.075,.002,.006),.002),M_PLASTER));
    }
  }
  return r;
}
vec3 nrm(vec3 p){ vec2 e=vec2(.0004,0)*(CLOSEUP?.25:1.); return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x)); }
float shadow(vec3 ro, vec3 rd){ float res=1.,t=CLOSEUP?.002:.02; for(int i=0;i<64;i++){ float h=map(ro+rd*t).x; res=min(res,10.*h/t); t+=clamp(h,CLOSEUP?.002:.02,.4); if(res<.001||t>(CLOSEUP?1.:20.)) break; } return clamp(res,0.,1.); }
float ao(vec3 p, vec3 n){ float o=0.,s=1.,k=CLOSEUP?.15:1.; for(int i=1;i<6;i++){ float h=k*.03*float(i); o+=(h-map(p+n*h).x)*s; s*=.7; } return clamp(1.-3.*o/k,0.,1.); }

// ---------- 空 ----------
vec3 sky(vec3 rd){
  float y=max(rd.y,0.), sd=max(dot(rd,SUN),0.);
  vec3 c=mix(SKYH,SKYZ,pow(smoothstep(0.,.42,y),.55));
  c+=SUNC*(.6*pow(sd,24.)+.18*pow(sd,4.))*(1.-y)*(1.-y);
  c+=mix(SUNC,vec3(1,.85,.6),.35)*7.*smoothstep(.99955,.99975,sd);
  vec2 uv=rd.xz/(rd.y+.06);
  float cl=fbm(uv*vec2(.35,1.1)+vec2(SEED,2.));
  cl=smoothstep(.52,.86,cl)*smoothstep(.01,.1,rd.y)*smoothstep(.55,.12,rd.y);
  vec3 clc=mix(SKYZ*1.4+.04,SUNC*1.15,pow(sd,4.)*.9+.1);
  c=mix(c,clc,cl*.75);
  return c;
}

// ---------- 砂浜と海 ----------
float sand(vec2 p){ if(p.y<-.3) return -1.; return .3-.16*p.y+.02*fbm(p*.4)+.003*vn(p*30.); }
float waves(vec2 p){ float h=0.,a=1.;
  for(int i=0;i<5;i++){ float fi=float(i); vec2 d=vec2(sin(fi*1.7+.4),cos(fi*1.3)); h+=a*sin(dot(p,d)*(1.+fi*.9)+fi*2.1); a*=.6; }
  return h*.01+.02*(fbm(p*vec2(.5,1.6))-.5); }
vec3 seaNormal(vec2 p, float dist){ float e=.02+dist*.004; float s=1./(1.+dist*.06);
  float hx=waves(p+vec2(e,0))-waves(p-vec2(e,0)), hz=waves(p+vec2(0,e))-waves(p-vec2(0,e));
  return normalize(vec3(-hx/(2.*e)*s*1.4,1.,-hz/(2.*e)*s*1.4)); }

vec3 litSurface(vec3 p, vec3 n, vec3 rd, vec3 alb, float rough, float spec){
  float dif=max(dot(n,SUN),0.);
  float sh=dif>0.?shadow(p+n*.002,SUN):0.;
  float oc=ao(p,n);
  vec3 h=normalize(SUN-rd);
  float sp=pow(max(dot(n,h),0.),mix(400.,20.,rough))*spec*sh*dif;
  float fre=pow(1.-max(dot(n,-rd),0.),5.);
  vec3 skyc=sky(reflect(rd,n));
  vec3 col=alb*(SUNC*dif*sh*1.6 + AMB*(.5+.5*n.y)*oc + (SKYH*.12+SUNC*.35*max(-n.y,0.))*oc*clamp(-n.y*.5+.5,0.,1.));
  col+=SUNC*sp*2.;
  col+=skyc*fre*.25*spec*oc;
  return col;
}

vec3 woodTex(vec3 p, vec3 base, float scale){
  float g=fbm(vec2(p.x*scale*1.5+p.z*scale*.3,p.y*scale*20.+p.z*scale*30.)*1.);
  float rings=.5+.5*sin((p.x+p.z)*scale*60.+g*8.);
  return base*(.75+.35*g)*(.88+.12*rings);
}

vec3 matColor(float m, vec3 p, vec3 n, out float rough, out float spec){
  rough=.8; spec=.2;
  if(m==M_WOOD) return woodTex(p,vec3(.42,.27,.16),1.);
  if(m==M_DARKWOOD) return woodTex(p,vec3(.18,.11,.07),1.);
  if(m==M_DECK){ float plank=step(.04,fract(p.x*4.6)); return woodTex(p*vec3(.2,1,1),vec3(.36,.25,.17),1.)*(.55+.45*plank); }
  if(m==M_WHITE){ rough=.15; spec=.9; return vec3(.86,.84,.8); }
  if(m==M_COFFEE){ rough=.05; spec=1.; return vec3(.035,.018,.01); }
  if(m==M_LATTE){ rough=.6; spec=.3; vec3 q=p-vec3(0,.065,0);
    vec2 u=q.xz*38.; u.y+=.2; float heart=pow(abs(u.x),1.2)+pow(abs(u.y-sqrt(abs(u.x))*.8),2.)*1.4;
    float art=smoothstep(.75,.6,heart+.08*vn(q.xz*300.)); float rimc=smoothstep(.028,.035,length(q.xz));
    return mix(mix(vec3(.55,.33,.17),vec3(.93,.86,.74),art),vec3(.45,.26,.13),rimc); }
  if(m==M_TILE){ rough=.6; spec=.25; float v=fbm(p.xz*6.); return vec3(.62,.24,.15)*(.75+.4*v)+vec3(.05)*step(.9,vn(p.xz*40.)); }
  if(m==M_TABLE){ rough=.5; spec=.35; float pid=floor(p.z/.085); float g=fbm(vec2(p.x*9.+pid*13.,p.z*160.)); float fine=vn(vec2(p.x*40.,p.z*900.));
    vec3 w=vec3(.5,.34,.22)*(.8+.25*h21(vec2(pid,3.)))*(.72+.4*g)*(.92+.1*fine);
    float gap=smoothstep(.0012,.0,abs(fract(p.z/.085)-.5)-.4985+.0); w*=1.-.7*smoothstep(.4975,.5,abs(fract(p.z/.085)-.5));
    if(p.y<-.001) w*=.55; return w; }
  if(m==M_BEAN){ rough=.35; spec=.6; return vec3(.2,.1,.05)*(.8+.4*vn3(p*500.)); }
  if(m==M_SUGAR){ rough=.7; spec=.3; return vec3(.38,.21,.09)*(.7+.5*vn3(p*600.)); }
  if(m==M_LIME){ rough=.4; spec=.5; return vec3(.32,.58,.16)*(.8+.3*vn3(p*900.)); }
  if(m==M_LIMEIN){ rough=.3; spec=.6; vec3 q=p; float a=atan(q.z,q.x); float seg=smoothstep(.85,1.,abs(sin(a*5.))); return mix(vec3(.85,.88,.5),vec3(.95,.97,.85),seg); }
  if(m==M_IMO){ rough=.85; spec=.12; return vec3(.27,.09,.13)*(.6+.6*fbm3(p*250.)); }
  if(m==M_IMOIN){ rough=.6; spec=.25; return vec3(.5,.16,.55)*(.85+.25*vn3(p*500.)); }
  if(m==M_CAKE){ rough=.9; spec=.12; float pore=vn3(p*1400.); return vec3(.56,.33,.6)*(.82+.22*fbm3(p*300.))*(.95+.08*pore); }
  if(m==M_CAKETOP){ rough=.6; spec=.25; float b=fbm3(p*90.); return mix(vec3(.12,.06,.03),vec3(.42,.22,.1),smoothstep(.3,.7,b)); }
  if(m==M_CARD){ rough=.9; spec=.1; return vec3(.9,.87,.8); }
  if(m==M_PLASTER){ rough=.2; spec=1.; return vec3(.7,.7,.72); }
  return vec3(.5);
}

// 物撮りの背景：ぼけた海と空＋玉ぼけ
vec3 bokehBg(vec3 rd, vec2 fc){
  vec3 c;
  float hz=.12;
  if(rd.y>hz) c=mix(SKYH,SKYZ,pow(clamp((rd.y-hz)*2.,0.,1.),.6));
  else c=mix(vec3(.02,.2,.24),vec3(.1,.42,.44),smoothstep(-.1,hz,rd.y))*mix(AMB*1.6,vec3(1),.5);
  c=mix(c,vec3(.36,.28,.2)*mix(AMB*2.,vec3(1),.5),smoothstep(hz-.1,hz-.2,rd.y));  // ぼけたテラスの床
  c=mix(c,SKYH*1.0,exp(-abs(rd.y-hz)*30.)*.5);
  c+=SUNC*.25*pow(max(dot(rd,SUN),0.),6.);
  vec2 uv=fc/R.y;
  for(int k=0;k<3;k++){ float sc=7.+float(k)*5.; vec2 g=uv*sc; vec2 id=floor(g);
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){ vec2 cid=id+vec2(i,j); float rh=h21(cid+float(k)*17.+SEED);
      if(rh<.9) continue; vec2 ctr=cid+.5+.35*(vec2(h21(cid+3.),h21(cid+7.))-.5);
      float d=length(g-ctr); float rr=.35+.25*h21(cid+11.);
      float near=exp(-abs((ctr.y/sc)-(.5+hz*1.2))*9.);
      c+=SUNC*.16*near*smoothstep(rr,rr-.06,d)*(.7+.3*smoothstep(rr-.12,rr,d)); } }
  return c;
}

vec3 render(vec3 ro, vec3 rd, vec2 fc){
  // オブジェクトのレイマーチ
  float t=CLOSEUP?.01:.05, tmax=CLOSEUP?3.:60.; vec2 h=vec2(0);
  bool hit=false;
  for(int i=0;i<220;i++){ vec3 p=ro+rd*t; h=map(p); if(h.x<.00025*t+(CLOSEUP?.00002:.0003)){ hit=true; break; } t+=h.x*.9; if(t>tmax) break; }

  if(CLOSEUP){
    if(!hit) return bokehBg(rd,fc);
    vec3 p=ro+rd*t; vec3 n=nrm(p); float rough,spec;
    if(h.y==M_GLASS){
      // ガラス：反射＋中身（ソーダ・氷・泡）を簡易屈折で
      float fre=.04+.96*pow(1.-max(dot(n,-rd),0.),5.);
      vec3 rd2=refract(rd,n,.9);
      vec3 q=p-vec3(0,.075,0);
      float lvl=.05; // 液面
      vec3 inside;
      vec3 bg=bokehBg(rd2,fc+vec2(rd2.x-rd.x,rd2.y-rd.y)*R.y*.6);
      float depth=clamp(lvl-q.y,0.,.15);
      vec3 soda=mix(vec3(.75,.88,.5),vec3(.55,.75,.3),depth*6.);
      inside=q.y<lvl?mix(bg,soda*mix(AMB*1.4,vec3(1.2),.6),.75):bg;
      vec2 bg2=vec2(atan(q.z,q.x)*9.,q.y*140.); vec2 bi=floor(bg2); vec2 bf=fract(bg2)-.5+.3*(vec2(h21(bi+1.),h21(bi+2.))-.5);
      float bub=step(.82,h21(bi+SEED))*smoothstep(.22,.12,length(bf))*step(q.y,lvl);
      inside+=bub*.35;
      float ice=smoothstep(.5,.7,fbm(vec2(atan(q.z,q.x)*1.5,q.y*14.)+3.))*step(q.y,lvl+.012)*step(-.03,q.y);
      inside=mix(inside,vec3(.92,.98,.96)*mix(AMB,vec3(1.3),.6),ice*.45);
      vec3 refl=bokehBg(reflect(rd,n),fc);
      float sp=pow(max(dot(reflect(rd,n),normalize(SUN+vec3(0,.3,0))),0.),200.);
      return mix(inside,refl,fre*.8)+SUNC*sp*3.+vec3(.08)*smoothstep(.0365,.038,length(q.xz))*smoothstep(lvl-.002,lvl+.002,q.y);
    }
    vec3 alb=matColor(h.y,p,n,rough,spec);
    return litSurface(p,n,rd,alb,rough,spec);
  }

  // 海・砂浜（高さ場）
  float tw=1e9, ts=1e9;
  if(rd.y<0.) tw=(SEA-ro.y)/rd.y;
  { float tt=.5; for(int i=0;i<160;i++){ vec3 p=ro+rd*tt; float d=p.y-sand(p.xz); if(d<.002*tt){ ts=tt; break; } tt+=max(d*.5,.01*tt); if(tt>80.) break; } }
  if(hit && t<min(tw,ts)){
    vec3 p=ro+rd*t; vec3 n=nrm(p); float rough,spec;
    vec3 alb=matColor(h.y,p,n,rough,spec);
    return litSurface(p,n,rd,alb,rough,spec);
  }
  if(ts<tw && ts<1e8){
    vec3 p=ro+rd*ts; vec2 e=vec2(.05,0);
    vec3 n=normalize(vec3(sand(p.xz-e.xy)-sand(p.xz+e.xy),2.*e.x,sand(p.xz-e.yx)-sand(p.xz+e.yx)));
    float wet=smoothstep(.12,.0,p.y-SEA);
    vec3 alb=mix(vec3(.74,.66,.54),vec3(.48,.42,.34),wet)*(.9+.15*vn(p.xz*8.));
    vec3 c=litSurface(p,n,rd,alb,.9,.15+.6*wet);
    float foam=smoothstep(.02,.0,abs(p.y-SEA-.01-.01*sin(p.x*1.5)))*.7;
    return mix(c,SUNC*.6+AMB*1.2,foam);
  }
  if(tw<1e8){
    vec3 p=ro+rd*tw; float dist=tw;
    vec3 n=seaNormal(p.xz,dist);
    float fre=.02+.98*pow(1.-max(dot(n,-rd),0.),5.);
    vec3 rr=reflect(rd,n); rr.y=abs(rr.y);
    vec3 refl=sky(rr);
    float glit=pow(max(dot(rr,SUN),0.),mix(900.,250.,clamp(dist/60.,0.,1.)));
    float depth=max(SEA-sand(p.xz),0.);
    vec3 deep=vec3(.0,.05,.08), shallow=vec3(.08,.5,.46);
    vec3 body=mix(shallow,deep,smoothstep(.0,.9,depth));
    body*=(SUNC*.5*max(SUN.y*3.,.25)+AMB*1.3);
    vec3 c=mix(body,refl,fre)+SUNC*glit*18.;
    float foam=smoothstep(.04,.0,depth)*(.6+.4*vn(p.xz*6.));
    c=mix(c,SUNC*.5+AMB*1.4,foam*.8);
    float fog=1.-exp(-dist*.006);
    return mix(c,SKYH*.9,fog*.4);
  }
  return sky(rd);
}

mat3 camLook(vec3 ro, vec3 ta){ vec3 f=normalize(ta-ro), r=normalize(cross(vec3(0,1,0),f)), u=cross(f,r); return mat3(r,u,f); }

vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }

void main(){
  vec3 ro, ta; float fl=1.7;
  if(S==0){ SUN=normalize(vec3(0,.03,1)); SUNC=vec3(1.,.48,.2); SKYZ=vec3(.03,.17,.25); SKYH=vec3(1.,.52,.32); AMB=vec3(.16,.16,.2);
    ro=vec3(0,1.75,-4.6); ta=vec3(0,3.75,10.); fl=1.35; GX=2.55; }
  else if(S==9){ SUN=normalize(vec3(0,.03,1)); SUNC=vec3(1.,.48,.2); SKYZ=vec3(.03,.17,.25); SKYH=vec3(1.,.52,.32); AMB=vec3(.16,.16,.2);
    ro=vec3(0,1.75,-5.2); ta=vec3(0,4.6,10.); fl=1.75; GX=0.; }
  else if(S==1){ SUN=normalize(vec3(-.25,.07,1)); SUNC=vec3(1.,.58,.3); SKYZ=vec3(.08,.28,.4); SKYH=vec3(1.,.64,.44); AMB=vec3(.22,.22,.26);
    ro=vec3(0,1.55,-2.4); ta=vec3(0,1.6,8.); fl=1.25; }
  else if(S==2){ SUN=normalize(vec3(.15,.1,1)); SUNC=vec3(1.,.66,.38); SKYZ=vec3(.1,.34,.5); SKYH=vec3(.98,.72,.52); AMB=vec3(.22,.23,.27);
    ro=vec3(-5.2,1.8,-3.); ta=vec3(1.5,.9,4.); fl=1.45; }
  else { CLOSEUP=true; SUN=normalize(vec3(-.5,.55,.9)); SUNC=vec3(1.,.82,.62); SKYZ=vec3(.25,.55,.7); SKYH=vec3(.95,.86,.75); AMB=vec3(.32,.34,.38);
    if(S==3){ ro=vec3(.02,.42,-.02); ta=vec3(.02,0,.015); fl=1.9; SUN=normalize(vec3(-.6,.7,.4)); }
    else if(S==4){ SUN=normalize(vec3(.1,.18,1)); SUNC=vec3(1.,.6,.32); SKYZ=vec3(.1,.28,.38); SKYH=vec3(1.,.66,.46); AMB=vec3(.2,.2,.24);
      ro=vec3(0,.16,-.34); ta=vec3(.01,.045,0); fl=2.2; }
    else if(S==7){ ro=vec3(0,.16,-.36); ta=vec3(0,.085,0); fl=2.3; }
    else if(S==8){ ro=vec3(.02,.13,-.27); ta=vec3(.01,.03,0); fl=2.3; }
    else { ro=vec3(0,.2,-.24); ta=vec3(0,.035,0); fl=2.4; } }
  mat3 ca=camLook(ro,ta);
  vec3 col=vec3(0);
  // 2x2 スーパーサンプリング
  for(int sy=0;sy<2;sy++) for(int sx=0;sx<2;sx++){
    vec2 fc=gl_FragCoord.xy+(vec2(sx,sy)+.5)/2.-.5;
    vec2 uv=(2.*fc-R)/R.y;
    vec3 rd=ca*normalize(vec3(uv,fl));
    col+=render(ro,rd,fc);
  }
  col/=4.;
  col=aces(col*(CLOSEUP?1.0:.62));
  col=pow(col,vec3(1./2.2));
  vec2 q=gl_FragCoord.xy/R;
  col*=.82+.18*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.18);           // ビネット
  col+=(h21(gl_FragCoord.xy+SEED*91.)-.5)*.035;                 // フィルムグレイン
  O=vec4(col,1);
}
