import{g as Ft,a as Dt,r as E,u as Bt,j as e,s as Ce,c as Te,d as ue,b as Lt,m as We,e as Mt,K as Yi,f as yr,a9 as Ct,M as mr,a7 as ji,a8 as ki,h as Ve,aa as Qi,ab as wr,l as te,ac as yt,B as k,ad as Ye,ae as ei,k as xe,af as Tt,ag as br,ah as tt,ai as jt,aj as _i,R as ui,ak as ct,al as vr,am as Cr,an as jr,ao as kr,ap as Ei,aq as Zi,ar as Xi,as as Er,at as gi,au as Sr,av as Fr,_ as Si,aw as Fi,ax as hi,ay as Yt,az as li,aA as Dr,aB as Di,aC as Br,aD as Lr,aE as Mr,aF as Bi,aG as Ar,aH as zt,aI as Tr,aJ as zr,aK as Li,aL as Mi,aM as oi,aN as Ir,aO as Pr,aP as Rr}from"./index-D5e3VQGo.js";import{A as Wr,E as $r,d as Qt,a as xi,D as _t,S as De,T as Gt,L as Nr,e as Or,U as Gr,b as Ai,C as Ur,c as Hr,f as Vr}from"./dataTransformer-CpjLeh_c.js";import{v as Yr,L as ee,l as qi,C as Pe,u as Ki,F as Qr,a as _r}from"./leaflet-CJIfUZLQ.js";import{P as le,c as q,d as kt,s as ti,Y as Zr,f as Ji,ae as Xr,af as qr,ag as er,ah as Ti,ai as Kr,aj as Jr,ak as el,e as tl,$ as ni,a3 as Ut,al as ai,am as zi,an as Ht,u as qe,Z as il,T as C,C as gt,B as Me,L as tr,K as ir,N as It,O as Vt,t as Re,E as He,J as rl,Q as ll,M,m as Zt,n as Xt,j as re,F as ne,I as ae,i as se,q as qt,V as pi,G as L,v as pe,k as rr,l as ol,o as yi,p as Et,A as At,z as nl,H as lr,D as it,R as al,w as Ke,x as Je,y as et,ad as sl,U as cl}from"./Map-BY2Rqs-y.js";function dl(i){return Ft("MuiAppBar",i)}Dt("MuiAppBar",["root","positionFixed","positionAbsolute","positionSticky","positionStatic","positionRelative","colorDefault","colorPrimary","colorSecondary","colorInherit","colorTransparent","colorError","colorInfo","colorSuccess","colorWarning"]);const hl=i=>{const{color:t,position:r,classes:l}=i,o={root:["root",`color${ue(t)}`,`position${ue(r)}`]};return Lt(o,dl,l)},Ii=(i,t)=>i?`${i==null?void 0:i.replace(")","")}, ${t})`:t,pl=Ce(le,{name:"MuiAppBar",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`position${ue(r.position)}`],t[`color${ue(r.color)}`]]}})(We(({theme:i})=>({display:"flex",flexDirection:"column",width:"100%",boxSizing:"border-box",flexShrink:0,variants:[{props:{position:"fixed"},style:{position:"fixed",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0,"@media print":{position:"absolute"}}},{props:{position:"absolute"},style:{position:"absolute",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"sticky"},style:{position:"sticky",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"static"},style:{position:"static"}},{props:{position:"relative"},style:{position:"relative"}},{props:{color:"inherit"},style:{"--AppBar-color":"inherit"}},{props:{color:"default"},style:{"--AppBar-background":i.vars?i.vars.palette.AppBar.defaultBg:i.palette.grey[100],"--AppBar-color":i.vars?i.vars.palette.text.primary:i.palette.getContrastText(i.palette.grey[100]),...i.applyStyles("dark",{"--AppBar-background":i.vars?i.vars.palette.AppBar.defaultBg:i.palette.grey[900],"--AppBar-color":i.vars?i.vars.palette.text.primary:i.palette.getContrastText(i.palette.grey[900])})}},...Object.entries(i.palette).filter(Mt(["contrastText"])).map(([t])=>({props:{color:t},style:{"--AppBar-background":(i.vars??i).palette[t].main,"--AppBar-color":(i.vars??i).palette[t].contrastText}})),{props:t=>t.enableColorOnDark===!0&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)"}},{props:t=>t.enableColorOnDark===!1&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...i.applyStyles("dark",{backgroundColor:i.vars?Ii(i.vars.palette.AppBar.darkBg,"var(--AppBar-background)"):null,color:i.vars?Ii(i.vars.palette.AppBar.darkColor,"var(--AppBar-color)"):null})}},{props:{color:"transparent"},style:{"--AppBar-background":"transparent","--AppBar-color":"inherit",backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...i.applyStyles("dark",{backgroundImage:"none"})}}]}))),fl=E.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiAppBar"}),{className:o,color:d="primary",enableColorOnDark:h=!1,position:s="fixed",...a}=l,p={...l,color:d,position:s,enableColorOnDark:h},u=hl(p);return e.jsx(pl,{square:!0,component:"header",ownerState:p,elevation:4,className:Te(u.root,o,s==="fixed"&&"mui-fixed"),ref:r,...a})}),ul=q(e.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}));function gl(i){return Ft("MuiAvatar",i)}Dt("MuiAvatar",["root","colorDefault","circular","rounded","square","img","fallback"]);const xl=i=>{const{classes:t,variant:r,colorDefault:l}=i;return Lt({root:["root",r,l&&"colorDefault"],img:["img"],fallback:["fallback"]},gl,t)},yl=Ce("div",{name:"MuiAvatar",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[r.variant],r.colorDefault&&t.colorDefault]}})(We(({theme:i})=>({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:40,height:40,fontFamily:i.typography.fontFamily,fontSize:i.typography.pxToRem(20),lineHeight:1,borderRadius:"50%",overflow:"hidden",userSelect:"none",variants:[{props:{variant:"rounded"},style:{borderRadius:(i.vars||i).shape.borderRadius}},{props:{variant:"square"},style:{borderRadius:0}},{props:{colorDefault:!0},style:{color:(i.vars||i).palette.background.default,...i.vars?{backgroundColor:i.vars.palette.Avatar.defaultBg}:{backgroundColor:i.palette.grey[400],...i.applyStyles("dark",{backgroundColor:i.palette.grey[600]})}}}]}))),ml=Ce("img",{name:"MuiAvatar",slot:"Img",overridesResolver:(i,t)=>t.img})({width:"100%",height:"100%",textAlign:"center",objectFit:"cover",color:"transparent",textIndent:1e4}),wl=Ce(ul,{name:"MuiAvatar",slot:"Fallback",overridesResolver:(i,t)=>t.fallback})({width:"75%",height:"75%"});function bl({crossOrigin:i,referrerPolicy:t,src:r,srcSet:l}){const[o,d]=E.useState(!1);return E.useEffect(()=>{if(!r&&!l)return;d(!1);let h=!0;const s=new Image;return s.onload=()=>{h&&d("loaded")},s.onerror=()=>{h&&d("error")},s.crossOrigin=i,s.referrerPolicy=t,s.src=r,l&&(s.srcset=l),()=>{h=!1}},[i,t,r,l]),o}const vl=E.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiAvatar"}),{alt:o,children:d,className:h,component:s="div",slots:a={},slotProps:p={},imgProps:u,sizes:n,src:g,srcSet:f,variant:y="circular",...c}=l;let x=null;const m={...l,component:s,variant:y},B=bl({...u,...typeof p.img=="function"?p.img(m):p.img,src:g,srcSet:f}),A=g||f,j=A&&B!=="error";m.colorDefault=!j,delete m.ownerState;const S=xl(m),[W,w]=kt("img",{className:S.img,elementType:ml,externalForwardedProps:{slots:a,slotProps:{img:{...u,...p.img}}},additionalProps:{alt:o,src:g,srcSet:f,sizes:n},ownerState:m});return j?x=e.jsx(W,{...w}):d||d===0?x=d:A&&o?x=o[0]:x=e.jsx(wl,{ownerState:m,className:S.fallback}),e.jsx(yl,{as:s,className:Te(S.root,h),ref:r,...c,ownerState:m,children:x})});function Cl(i,t,r){const l=t.getBoundingClientRect(),o=r&&r.getBoundingClientRect(),d=er(t);let h;if(t.fakeTransform)h=t.fakeTransform;else{const p=d.getComputedStyle(t);h=p.getPropertyValue("-webkit-transform")||p.getPropertyValue("transform")}let s=0,a=0;if(h&&h!=="none"&&typeof h=="string"){const p=h.split("(")[1].split(")")[0].split(",");s=parseInt(p[4],10),a=parseInt(p[5],10)}return i==="left"?o?`translateX(${o.right+s-l.left}px)`:`translateX(${d.innerWidth+s-l.left}px)`:i==="right"?o?`translateX(-${l.right-o.left-s}px)`:`translateX(-${l.left+l.width-s}px)`:i==="up"?o?`translateY(${o.bottom+a-l.top}px)`:`translateY(${d.innerHeight+a-l.top}px)`:o?`translateY(-${l.top-o.top+l.height-a}px)`:`translateY(-${l.top+l.height-a}px)`}function jl(i){return typeof i=="function"?i():i}function Pt(i,t,r){const l=jl(r),o=Cl(i,t,l);o&&(t.style.webkitTransform=o,t.style.transform=o)}const kl=E.forwardRef(function(t,r){const l=ti(),o={enter:l.transitions.easing.easeOut,exit:l.transitions.easing.sharp},d={enter:l.transitions.duration.enteringScreen,exit:l.transitions.duration.leavingScreen},{addEndListener:h,appear:s=!0,children:a,container:p,direction:u="down",easing:n=o,in:g,onEnter:f,onEntered:y,onEntering:c,onExit:x,onExited:m,onExiting:B,style:A,timeout:j=d,TransitionComponent:S=Zr,...W}=t,w=E.useRef(null),D=Ji(Xr(a),w,r),U=T=>X=>{T&&(X===void 0?T(w.current):T(w.current,X))},ie=U((T,X)=>{Pt(u,T,p),Kr(T),f&&f(T,X)}),de=U((T,X)=>{const fe=Ti({timeout:j,style:A,easing:n},{mode:"enter"});T.style.webkitTransition=l.transitions.create("-webkit-transform",{...fe}),T.style.transition=l.transitions.create("transform",{...fe}),T.style.webkitTransform="none",T.style.transform="none",c&&c(T,X)}),Z=U(y),O=U(B),$=U(T=>{const X=Ti({timeout:j,style:A,easing:n},{mode:"exit"});T.style.webkitTransition=l.transitions.create("-webkit-transform",X),T.style.transition=l.transitions.create("transform",X),Pt(u,T,p),x&&x(T)}),we=U(T=>{T.style.webkitTransition="",T.style.transition="",m&&m(T)}),K=T=>{h&&h(w.current,T)},be=E.useCallback(()=>{w.current&&Pt(u,w.current,p)},[u,p]);return E.useEffect(()=>{if(g||u==="down"||u==="right")return;const T=qr(()=>{w.current&&Pt(u,w.current,p)}),X=er(w.current);return X.addEventListener("resize",T),()=>{T.clear(),X.removeEventListener("resize",T)}},[u,g,p]),E.useEffect(()=>{g||be()},[g,be]),e.jsx(S,{nodeRef:w,onEnter:ie,onEntered:Z,onEntering:de,onExit:$,onExited:we,onExiting:O,addEndListener:K,appear:s,in:g,timeout:j,...W,children:(T,{ownerState:X,...fe})=>E.cloneElement(a,{ref:D,style:{visibility:T==="exited"&&!g?"hidden":void 0,...A,...a.props.style},...fe})})});function El(i){return Ft("MuiDrawer",i)}Dt("MuiDrawer",["root","docked","paper","anchorLeft","anchorRight","anchorTop","anchorBottom","paperAnchorLeft","paperAnchorRight","paperAnchorTop","paperAnchorBottom","paperAnchorDockedLeft","paperAnchorDockedRight","paperAnchorDockedTop","paperAnchorDockedBottom","modal"]);const or=(i,t)=>{const{ownerState:r}=i;return[t.root,(r.variant==="permanent"||r.variant==="persistent")&&t.docked,t.modal]},Sl=i=>{const{classes:t,anchor:r,variant:l}=i,o={root:["root",`anchor${ue(r)}`],docked:[(l==="permanent"||l==="persistent")&&"docked"],modal:["modal"],paper:["paper",`paperAnchor${ue(r)}`,l!=="temporary"&&`paperAnchorDocked${ue(r)}`]};return Lt(o,El,t)},Fl=Ce(el,{name:"MuiDrawer",slot:"Root",overridesResolver:or})(We(({theme:i})=>({zIndex:(i.vars||i).zIndex.drawer}))),Dl=Ce("div",{shouldForwardProp:yr,name:"MuiDrawer",slot:"Docked",skipVariantsResolver:!1,overridesResolver:or})({flex:"0 0 auto"}),Bl=Ce(le,{name:"MuiDrawer",slot:"Paper",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.paper,t[`paperAnchor${ue(r.anchor)}`],r.variant!=="temporary"&&t[`paperAnchorDocked${ue(r.anchor)}`]]}})(We(({theme:i})=>({overflowY:"auto",display:"flex",flexDirection:"column",height:"100%",flex:"1 0 auto",zIndex:(i.vars||i).zIndex.drawer,WebkitOverflowScrolling:"touch",position:"fixed",top:0,outline:0,variants:[{props:{anchor:"left"},style:{left:0}},{props:{anchor:"top"},style:{top:0,left:0,right:0,height:"auto",maxHeight:"100%"}},{props:{anchor:"right"},style:{right:0}},{props:{anchor:"bottom"},style:{top:"auto",left:0,bottom:0,right:0,height:"auto",maxHeight:"100%"}},{props:({ownerState:t})=>t.anchor==="left"&&t.variant!=="temporary",style:{borderRight:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="top"&&t.variant!=="temporary",style:{borderBottom:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="right"&&t.variant!=="temporary",style:{borderLeft:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="bottom"&&t.variant!=="temporary",style:{borderTop:`1px solid ${(i.vars||i).palette.divider}`}}]}))),nr={left:"right",right:"left",top:"down",bottom:"up"};function Ll(i){return["left","right"].includes(i)}function Ml({direction:i},t){return i==="rtl"&&Ll(t)?nr[t]:t}const Al=E.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiDrawer"}),o=ti(),d=Yi(),h={enter:o.transitions.duration.enteringScreen,exit:o.transitions.duration.leavingScreen},{anchor:s="left",BackdropProps:a,children:p,className:u,elevation:n=16,hideBackdrop:g=!1,ModalProps:{BackdropProps:f,...y}={},onClose:c,open:x=!1,PaperProps:m={},SlideProps:B,TransitionComponent:A,transitionDuration:j=h,variant:S="temporary",slots:W={},slotProps:w={},...D}=l,U=E.useRef(!1);E.useEffect(()=>{U.current=!0},[]);const ie=Ml({direction:d?"rtl":"ltr"},s),Z={...l,anchor:s,elevation:n,open:x,variant:S,...D},O=Sl(Z),$={slots:{transition:A,...W},slotProps:{paper:m,transition:B,...w,backdrop:Jr(w.backdrop||{...a,...f},{transitionDuration:j})}},[we,K]=kt("root",{ref:r,elementType:Fl,className:Te(O.root,O.modal,u),shouldForwardComponentProp:!0,ownerState:Z,externalForwardedProps:{...$,...D,...y},additionalProps:{open:x,onClose:c,hideBackdrop:g,slots:{backdrop:$.slots.backdrop},slotProps:{backdrop:$.slotProps.backdrop}}}),[be,T]=kt("paper",{elementType:Bl,shouldForwardComponentProp:!0,className:Te(O.paper,m.className),ownerState:Z,externalForwardedProps:$,additionalProps:{elevation:S==="temporary"?n:0,square:!0}}),[X,fe]=kt("docked",{elementType:Dl,ref:r,className:Te(O.root,O.docked,u),ownerState:Z,externalForwardedProps:$,additionalProps:D}),[Q,_]=kt("transition",{elementType:kl,ownerState:Z,externalForwardedProps:$,additionalProps:{in:x,direction:nr[ie],timeout:j,appear:U.current}}),Se=e.jsx(be,{...T,children:p});if(S==="permanent")return e.jsx(X,{...fe,children:Se});const ye=e.jsx(Q,{..._,children:Se});return S==="persistent"?e.jsx(X,{...fe,children:ye}):e.jsx(we,{...K,children:ye})});function Tl(i,t,r=(l,o)=>l===o){return i.length===t.length&&i.every((l,o)=>r(l,t[o]))}const zl=2;function ut(i,t,r,l,o){return r===1?Math.min(i+t,o):Math.max(i-t,l)}function ar(i,t){return i-t}function Pi(i,t){const{index:r}=i.reduce((l,o,d)=>{const h=Math.abs(t-o);return l===null||h<l.distance||h===l.distance?{distance:h,index:d}:l},null)??{};return r}function Rt(i,t){if(t.current!==void 0&&i.changedTouches){const r=i;for(let l=0;l<r.changedTouches.length;l+=1){const o=r.changedTouches[l];if(o.identifier===t.current)return{x:o.clientX,y:o.clientY}}return!1}return{x:i.clientX,y:i.clientY}}function Kt(i,t,r){return(i-t)*100/(r-t)}function Il(i,t,r){return(r-t)*i+t}function Pl(i){if(Math.abs(i)<1){const r=i.toExponential().split("e-"),l=r[0].split(".")[1];return(l?l.length:0)+parseInt(r[1],10)}const t=i.toString().split(".")[1];return t?t.length:0}function Rl(i,t,r){const l=Math.round((i-r)/t)*t+r;return Number(l.toFixed(Pl(t)))}function Ri({values:i,newValue:t,index:r}){const l=i.slice();return l[r]=t,l.sort(ar)}function Wt({sliderRef:i,activeIndex:t,setActive:r}){var o,d,h;const l=Ut(i.current);(!((o=i.current)!=null&&o.contains(l.activeElement))||Number((d=l==null?void 0:l.activeElement)==null?void 0:d.getAttribute("data-index"))!==t)&&((h=i.current)==null||h.querySelector(`[type="range"][data-index="${t}"]`).focus()),r&&r(t)}function $t(i,t){return typeof i=="number"&&typeof t=="number"?i===t:typeof i=="object"&&typeof t=="object"?Tl(i,t):!1}const Wl={horizontal:{offset:i=>({left:`${i}%`}),leap:i=>({width:`${i}%`})},"horizontal-reverse":{offset:i=>({right:`${i}%`}),leap:i=>({width:`${i}%`})},vertical:{offset:i=>({bottom:`${i}%`}),leap:i=>({height:`${i}%`})}},$l=i=>i;let Nt;function Wi(){return Nt===void 0&&(typeof CSS<"u"&&typeof CSS.supports=="function"?Nt=CSS.supports("touch-action","none"):Nt=!0),Nt}function Nl(i){const{"aria-labelledby":t,defaultValue:r,disabled:l=!1,disableSwap:o=!1,isRtl:d=!1,marks:h=!1,max:s=100,min:a=0,name:p,onChange:u,onChangeCommitted:n,orientation:g="horizontal",rootRef:f,scale:y=$l,step:c=1,shiftStep:x=10,tabIndex:m,value:B}=i,A=E.useRef(void 0),[j,S]=E.useState(-1),[W,w]=E.useState(-1),[D,U]=E.useState(!1),ie=E.useRef(0),de=E.useRef(null),[Z,O]=tl({controlled:B,default:r??a,name:"Slider"}),$=u&&((v,F,I)=>{const V=v.nativeEvent||v,J=new V.constructor(V.type,V);Object.defineProperty(J,"target",{writable:!0,value:{value:F,name:p}}),de.current=F,u(J,F,I)}),we=Array.isArray(Z);let K=we?Z.slice().sort(ar):[Z];K=K.map(v=>v==null?a:Ct(v,a,s));const be=h===!0&&c!==null?[...Array(Math.floor((s-a)/c)+1)].map((v,F)=>({value:a+c*F})):h||[],T=be.map(v=>v.value),[X,fe]=E.useState(-1),Q=E.useRef(null),_=Ji(f,Q),Se=v=>F=>{var V;const I=Number(F.currentTarget.getAttribute("data-index"));zi(F.target)&&fe(I),w(I),(V=v==null?void 0:v.onFocus)==null||V.call(v,F)},ye=v=>F=>{var I;zi(F.target)||fe(-1),w(-1),(I=v==null?void 0:v.onBlur)==null||I.call(v,F)},Be=(v,F)=>{const I=Number(v.currentTarget.getAttribute("data-index")),V=K[I],J=T.indexOf(V);let R=F;if(be&&c==null){const ce=T[T.length-1];R>=ce?R=ce:R<=T[0]?R=T[0]:R=R<V?T[J-1]:T[J+1]}if(R=Ct(R,a,s),we){o&&(R=Ct(R,K[I-1]||-1/0,K[I+1]||1/0));const ce=R;R=Ri({values:K,newValue:R,index:I});let me=I;o||(me=R.indexOf(ce)),Wt({sliderRef:Q,activeIndex:me})}O(R),fe(I),$&&!$t(R,Z)&&$(v,R,I),n&&n(v,de.current??R)},ze=v=>F=>{var I;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"].includes(F.key)){F.preventDefault();const V=Number(F.currentTarget.getAttribute("data-index")),J=K[V];let R=null;if(c!=null){const ce=F.shiftKey?x:c;switch(F.key){case"ArrowUp":R=ut(J,ce,1,a,s);break;case"ArrowRight":R=ut(J,ce,d?-1:1,a,s);break;case"ArrowDown":R=ut(J,ce,-1,a,s);break;case"ArrowLeft":R=ut(J,ce,d?1:-1,a,s);break;case"PageUp":R=ut(J,x,1,a,s);break;case"PageDown":R=ut(J,x,-1,a,s);break;case"Home":R=a;break;case"End":R=s;break}}else if(be){const ce=T[T.length-1],me=T.indexOf(J),he=[d?"ArrowRight":"ArrowLeft","ArrowDown","PageDown","Home"],ve=[d?"ArrowLeft":"ArrowRight","ArrowUp","PageUp","End"];he.includes(F.key)?me===0?R=T[0]:R=T[me-1]:ve.includes(F.key)&&(me===T.length-1?R=ce:R=T[me+1])}R!=null&&Be(F,R)}(I=v==null?void 0:v.onKeyDown)==null||I.call(v,F)};mr(()=>{var v;l&&Q.current.contains(document.activeElement)&&((v=document.activeElement)==null||v.blur())},[l]),l&&j!==-1&&S(-1),l&&X!==-1&&fe(-1);const Qe=v=>F=>{var I;(I=v.onChange)==null||I.call(v,F),Be(F,F.target.valueAsNumber)},Ie=E.useRef(void 0);let Le=g;d&&g==="horizontal"&&(Le+="-reverse");const $e=({finger:v,move:F=!1})=>{const{current:I}=Q,{width:V,height:J,bottom:R,left:ce}=I.getBoundingClientRect();let me;Le.startsWith("vertical")?me=(R-v.y)/J:me=(v.x-ce)/V,Le.includes("-reverse")&&(me=1-me);let he;if(he=Il(me,a,s),c)he=Rl(he,c,a);else{const Xe=Pi(T,he);he=T[Xe]}he=Ct(he,a,s);let ve=0;if(we){F?ve=Ie.current:ve=Pi(K,he),o&&(he=Ct(he,K[ve-1]||-1/0,K[ve+1]||1/0));const Xe=he;he=Ri({values:K,newValue:he,index:ve}),o&&F||(ve=he.indexOf(Xe),Ie.current=ve)}return{newValue:he,activeIndex:ve}},Ne=ni(v=>{const F=Rt(v,A);if(!F)return;if(ie.current+=1,v.type==="mousemove"&&v.buttons===0){Fe(v);return}const{newValue:I,activeIndex:V}=$e({finger:F,move:!0});Wt({sliderRef:Q,activeIndex:V,setActive:S}),O(I),!D&&ie.current>zl&&U(!0),$&&!$t(I,Z)&&$(v,I,V)}),Fe=ni(v=>{const F=Rt(v,A);if(U(!1),!F)return;const{newValue:I}=$e({finger:F,move:!0});S(-1),v.type==="touchend"&&w(-1),n&&n(v,de.current??I),A.current=void 0,b()}),ge=ni(v=>{if(l)return;Wi()||v.preventDefault();const F=v.changedTouches[0];F!=null&&(A.current=F.identifier);const I=Rt(v,A);if(I!==!1){const{newValue:J,activeIndex:R}=$e({finger:I});Wt({sliderRef:Q,activeIndex:R,setActive:S}),O(J),$&&!$t(J,Z)&&$(v,J,R)}ie.current=0;const V=Ut(Q.current);V.addEventListener("touchmove",Ne,{passive:!0}),V.addEventListener("touchend",Fe,{passive:!0})}),b=E.useCallback(()=>{const v=Ut(Q.current);v.removeEventListener("mousemove",Ne),v.removeEventListener("mouseup",Fe),v.removeEventListener("touchmove",Ne),v.removeEventListener("touchend",Fe)},[Fe,Ne]);E.useEffect(()=>{const{current:v}=Q;return v.addEventListener("touchstart",ge,{passive:Wi()}),()=>{v.removeEventListener("touchstart",ge),b()}},[b,ge]),E.useEffect(()=>{l&&b()},[l,b]);const N=v=>F=>{var J;if((J=v.onMouseDown)==null||J.call(v,F),l||F.defaultPrevented||F.button!==0)return;F.preventDefault();const I=Rt(F,A);if(I!==!1){const{newValue:R,activeIndex:ce}=$e({finger:I});Wt({sliderRef:Q,activeIndex:ce,setActive:S}),O(R),$&&!$t(R,Z)&&$(F,R,ce)}ie.current=0;const V=Ut(Q.current);V.addEventListener("mousemove",Ne,{passive:!0}),V.addEventListener("mouseup",Fe)},G=Kt(we?K[0]:a,a,s),z=Kt(K[K.length-1],a,s)-G,H=(v={})=>{const F=ai(v),I={onMouseDown:N(F||{})},V={...F,...I};return{...v,ref:_,...V}},rt=v=>F=>{var V;(V=v.onMouseOver)==null||V.call(v,F);const I=Number(F.currentTarget.getAttribute("data-index"));w(I)},dt=v=>F=>{var I;(I=v.onMouseLeave)==null||I.call(v,F),w(-1)},Ge=(v={})=>{const F=ai(v),I={onMouseOver:rt(F||{}),onMouseLeave:dt(F||{})};return{...v,...F,...I}},_e=v=>({pointerEvents:j!==-1&&j!==v?"none":void 0});let Ze;return g==="vertical"&&(Ze=d?"vertical-rl":"vertical-lr"),{active:j,axis:Le,axisProps:Wl,dragging:D,focusedThumbIndex:X,getHiddenInputProps:(v={})=>{const F=ai(v),I={onChange:Qe(F||{}),onFocus:Se(F||{}),onBlur:ye(F||{}),onKeyDown:ze(F||{})},V={...F,...I};return{tabIndex:m,"aria-labelledby":t,"aria-orientation":g,"aria-valuemax":y(s),"aria-valuemin":y(a),name:p,type:"range",min:i.min,max:i.max,step:i.step===null&&i.marks?"any":i.step??void 0,disabled:l,...v,...V,style:{...Yr,direction:d?"rtl":"ltr",width:"100%",height:"100%",writingMode:Ze}}},getRootProps:H,getThumbProps:Ge,marks:be,open:W,range:we,rootRef:_,trackLeap:z,trackOffset:G,values:K,getThumbStyle:_e}}const Ol=i=>!i||!Ht(i);function Gl(i){return Ft("MuiSlider",i)}const Ae=Dt("MuiSlider",["root","active","colorPrimary","colorSecondary","colorError","colorInfo","colorSuccess","colorWarning","disabled","dragging","focusVisible","mark","markActive","marked","markLabel","markLabelActive","rail","sizeSmall","thumb","thumbColorPrimary","thumbColorSecondary","thumbColorError","thumbColorSuccess","thumbColorInfo","thumbColorWarning","track","trackInverted","trackFalse","thumbSizeSmall","valueLabel","valueLabelOpen","valueLabelCircle","valueLabelLabel","vertical"]),Ul=i=>{const{open:t}=i;return{offset:Te(t&&Ae.valueLabelOpen),circle:Ae.valueLabelCircle,label:Ae.valueLabelLabel}};function Hl(i){const{children:t,className:r,value:l}=i,o=Ul(i);return t?E.cloneElement(t,{className:Te(t.props.className)},e.jsxs(E.Fragment,{children:[t.props.children,e.jsx("span",{className:Te(o.offset,r),"aria-hidden":!0,children:e.jsx("span",{className:o.circle,children:e.jsx("span",{className:o.label,children:l})})})]})):null}function $i(i){return i}const Vl=Ce("span",{name:"MuiSlider",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`color${ue(r.color)}`],r.size!=="medium"&&t[`size${ue(r.size)}`],r.marked&&t.marked,r.orientation==="vertical"&&t.vertical,r.track==="inverted"&&t.trackInverted,r.track===!1&&t.trackFalse]}})(We(({theme:i})=>({borderRadius:12,boxSizing:"content-box",display:"inline-block",position:"relative",cursor:"pointer",touchAction:"none",WebkitTapHighlightColor:"transparent","@media print":{colorAdjust:"exact"},[`&.${Ae.disabled}`]:{pointerEvents:"none",cursor:"default",color:(i.vars||i).palette.grey[400]},[`&.${Ae.dragging}`]:{[`& .${Ae.thumb}, & .${Ae.track}`]:{transition:"none"}},variants:[...Object.entries(i.palette).filter(Mt()).map(([t])=>({props:{color:t},style:{color:(i.vars||i).palette[t].main}})),{props:{orientation:"horizontal"},style:{height:4,width:"100%",padding:"13px 0","@media (pointer: coarse)":{padding:"20px 0"}}},{props:{orientation:"horizontal",size:"small"},style:{height:2}},{props:{orientation:"horizontal",marked:!0},style:{marginBottom:20}},{props:{orientation:"vertical"},style:{height:"100%",width:4,padding:"0 13px","@media (pointer: coarse)":{padding:"0 20px"}}},{props:{orientation:"vertical",size:"small"},style:{width:2}},{props:{orientation:"vertical",marked:!0},style:{marginRight:44}}]}))),Yl=Ce("span",{name:"MuiSlider",slot:"Rail",overridesResolver:(i,t)=>t.rail})({display:"block",position:"absolute",borderRadius:"inherit",backgroundColor:"currentColor",opacity:.38,variants:[{props:{orientation:"horizontal"},style:{width:"100%",height:"inherit",top:"50%",transform:"translateY(-50%)"}},{props:{orientation:"vertical"},style:{height:"100%",width:"inherit",left:"50%",transform:"translateX(-50%)"}},{props:{track:"inverted"},style:{opacity:1}}]}),Ql=Ce("span",{name:"MuiSlider",slot:"Track",overridesResolver:(i,t)=>t.track})(We(({theme:i})=>({display:"block",position:"absolute",borderRadius:"inherit",border:"1px solid currentColor",backgroundColor:"currentColor",transition:i.transitions.create(["left","width","bottom","height"],{duration:i.transitions.duration.shortest}),variants:[{props:{size:"small"},style:{border:"none"}},{props:{orientation:"horizontal"},style:{height:"inherit",top:"50%",transform:"translateY(-50%)"}},{props:{orientation:"vertical"},style:{width:"inherit",left:"50%",transform:"translateX(-50%)"}},{props:{track:!1},style:{display:"none"}},...Object.entries(i.palette).filter(Mt()).map(([t])=>({props:{color:t,track:"inverted"},style:{...i.vars?{backgroundColor:i.vars.palette.Slider[`${t}Track`],borderColor:i.vars.palette.Slider[`${t}Track`]}:{backgroundColor:ji(i.palette[t].main,.62),borderColor:ji(i.palette[t].main,.62),...i.applyStyles("dark",{backgroundColor:ki(i.palette[t].main,.5)}),...i.applyStyles("dark",{borderColor:ki(i.palette[t].main,.5)})}}}))]}))),_l=Ce("span",{name:"MuiSlider",slot:"Thumb",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.thumb,t[`thumbColor${ue(r.color)}`],r.size!=="medium"&&t[`thumbSize${ue(r.size)}`]]}})(We(({theme:i})=>({position:"absolute",width:20,height:20,boxSizing:"border-box",borderRadius:"50%",outline:0,backgroundColor:"currentColor",display:"flex",alignItems:"center",justifyContent:"center",transition:i.transitions.create(["box-shadow","left","bottom"],{duration:i.transitions.duration.shortest}),"&::before":{position:"absolute",content:'""',borderRadius:"inherit",width:"100%",height:"100%",boxShadow:(i.vars||i).shadows[2]},"&::after":{position:"absolute",content:'""',borderRadius:"50%",width:42,height:42,top:"50%",left:"50%",transform:"translate(-50%, -50%)"},[`&.${Ae.disabled}`]:{"&:hover":{boxShadow:"none"}},variants:[{props:{size:"small"},style:{width:12,height:12,"&::before":{boxShadow:"none"}}},{props:{orientation:"horizontal"},style:{top:"50%",transform:"translate(-50%, -50%)"}},{props:{orientation:"vertical"},style:{left:"50%",transform:"translate(-50%, 50%)"}},...Object.entries(i.palette).filter(Mt()).map(([t])=>({props:{color:t},style:{[`&:hover, &.${Ae.focusVisible}`]:{...i.vars?{boxShadow:`0px 0px 0px 8px rgba(${i.vars.palette[t].mainChannel} / 0.16)`}:{boxShadow:`0px 0px 0px 8px ${Ve(i.palette[t].main,.16)}`},"@media (hover: none)":{boxShadow:"none"}},[`&.${Ae.active}`]:{...i.vars?{boxShadow:`0px 0px 0px 14px rgba(${i.vars.palette[t].mainChannel} / 0.16)`}:{boxShadow:`0px 0px 0px 14px ${Ve(i.palette[t].main,.16)}`}}}}))]}))),Zl=Ce(Hl,{name:"MuiSlider",slot:"ValueLabel",overridesResolver:(i,t)=>t.valueLabel})(We(({theme:i})=>({zIndex:1,whiteSpace:"nowrap",...i.typography.body2,fontWeight:500,transition:i.transitions.create(["transform"],{duration:i.transitions.duration.shortest}),position:"absolute",backgroundColor:(i.vars||i).palette.grey[600],borderRadius:2,color:(i.vars||i).palette.common.white,display:"flex",alignItems:"center",justifyContent:"center",padding:"0.25rem 0.75rem",variants:[{props:{orientation:"horizontal"},style:{transform:"translateY(-100%) scale(0)",top:"-10px",transformOrigin:"bottom center","&::before":{position:"absolute",content:'""',width:8,height:8,transform:"translate(-50%, 50%) rotate(45deg)",backgroundColor:"inherit",bottom:0,left:"50%"},[`&.${Ae.valueLabelOpen}`]:{transform:"translateY(-100%) scale(1)"}}},{props:{orientation:"vertical"},style:{transform:"translateY(-50%) scale(0)",right:"30px",top:"50%",transformOrigin:"right center","&::before":{position:"absolute",content:'""',width:8,height:8,transform:"translate(-50%, -50%) rotate(45deg)",backgroundColor:"inherit",right:-8,top:"50%"},[`&.${Ae.valueLabelOpen}`]:{transform:"translateY(-50%) scale(1)"}}},{props:{size:"small"},style:{fontSize:i.typography.pxToRem(12),padding:"0.25rem 0.5rem"}},{props:{orientation:"vertical",size:"small"},style:{right:"20px"}}]}))),Xl=Ce("span",{name:"MuiSlider",slot:"Mark",shouldForwardProp:i=>Qi(i)&&i!=="markActive",overridesResolver:(i,t)=>{const{markActive:r}=i;return[t.mark,r&&t.markActive]}})(We(({theme:i})=>({position:"absolute",width:2,height:2,borderRadius:1,backgroundColor:"currentColor",variants:[{props:{orientation:"horizontal"},style:{top:"50%",transform:"translate(-1px, -50%)"}},{props:{orientation:"vertical"},style:{left:"50%",transform:"translate(-50%, 1px)"}},{props:{markActive:!0},style:{backgroundColor:(i.vars||i).palette.background.paper,opacity:.8}}]}))),ql=Ce("span",{name:"MuiSlider",slot:"MarkLabel",shouldForwardProp:i=>Qi(i)&&i!=="markLabelActive",overridesResolver:(i,t)=>t.markLabel})(We(({theme:i})=>({...i.typography.body2,color:(i.vars||i).palette.text.secondary,position:"absolute",whiteSpace:"nowrap",variants:[{props:{orientation:"horizontal"},style:{top:30,transform:"translateX(-50%)","@media (pointer: coarse)":{top:40}}},{props:{orientation:"vertical"},style:{left:36,transform:"translateY(50%)","@media (pointer: coarse)":{left:44}}},{props:{markLabelActive:!0},style:{color:(i.vars||i).palette.text.primary}}]}))),Kl=i=>{const{disabled:t,dragging:r,marked:l,orientation:o,track:d,classes:h,color:s,size:a}=i,p={root:["root",t&&"disabled",r&&"dragging",l&&"marked",o==="vertical"&&"vertical",d==="inverted"&&"trackInverted",d===!1&&"trackFalse",s&&`color${ue(s)}`,a&&`size${ue(a)}`],rail:["rail"],track:["track"],mark:["mark"],markActive:["markActive"],markLabel:["markLabel"],markLabelActive:["markLabelActive"],valueLabel:["valueLabel"],thumb:["thumb",t&&"disabled",a&&`thumbSize${ue(a)}`,s&&`thumbColor${ue(s)}`],active:["active"],disabled:["disabled"],focusVisible:["focusVisible"]};return Lt(p,Gl,h)},Jl=({children:i})=>i,Jt=E.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiSlider"}),o=Yi(),{"aria-label":d,"aria-valuetext":h,"aria-labelledby":s,component:a="span",components:p={},componentsProps:u={},color:n="primary",classes:g,className:f,disableSwap:y=!1,disabled:c=!1,getAriaLabel:x,getAriaValueText:m,marks:B=!1,max:A=100,min:j=0,name:S,onChange:W,onChangeCommitted:w,orientation:D="horizontal",shiftStep:U=10,size:ie="medium",step:de=1,scale:Z=$i,slotProps:O,slots:$,tabIndex:we,track:K="normal",value:be,valueLabelDisplay:T="off",valueLabelFormat:X=$i,...fe}=l,Q={...l,isRtl:o,max:A,min:j,classes:g,disabled:c,disableSwap:y,orientation:D,marks:B,color:n,size:ie,step:de,shiftStep:U,scale:Z,track:K,valueLabelDisplay:T,valueLabelFormat:X},{axisProps:_,getRootProps:Se,getHiddenInputProps:ye,getThumbProps:Be,open:ze,active:Qe,axis:Ie,focusedThumbIndex:Le,range:$e,dragging:Ne,marks:Fe,values:ge,trackOffset:b,trackLeap:N,getThumbStyle:G}=Nl({...Q,rootRef:r});Q.marked=Fe.length>0&&Fe.some(oe=>oe.label),Q.dragging=Ne,Q.focusedThumbIndex=Le;const z=Kl(Q),H=($==null?void 0:$.root)??p.Root??Vl,rt=($==null?void 0:$.rail)??p.Rail??Yl,dt=($==null?void 0:$.track)??p.Track??Ql,Ge=($==null?void 0:$.thumb)??p.Thumb??_l,_e=($==null?void 0:$.valueLabel)??p.ValueLabel??Zl,Ze=($==null?void 0:$.mark)??p.Mark??Xl,lt=($==null?void 0:$.markLabel)??p.MarkLabel??ql,v=($==null?void 0:$.input)??p.Input??"input",F=(O==null?void 0:O.root)??u.root,I=(O==null?void 0:O.rail)??u.rail,V=(O==null?void 0:O.track)??u.track,J=(O==null?void 0:O.thumb)??u.thumb,R=(O==null?void 0:O.valueLabel)??u.valueLabel,ce=(O==null?void 0:O.mark)??u.mark,me=(O==null?void 0:O.markLabel)??u.markLabel,he=(O==null?void 0:O.input)??u.input,ve=qe({elementType:H,getSlotProps:Se,externalSlotProps:F,externalForwardedProps:fe,additionalProps:{...Ol(H)&&{as:a}},ownerState:{...Q,...F==null?void 0:F.ownerState},className:[z.root,f]}),Xe=qe({elementType:rt,externalSlotProps:I,ownerState:Q,className:z.rail}),ri=qe({elementType:dt,externalSlotProps:V,additionalProps:{style:{..._[Ie].offset(b),..._[Ie].leap(N)}},ownerState:{...Q,...V==null?void 0:V.ownerState},className:z.track}),mt=qe({elementType:Ge,getSlotProps:Be,externalSlotProps:J,ownerState:{...Q,...J==null?void 0:J.ownerState},className:z.thumb}),wt=qe({elementType:_e,externalSlotProps:R,ownerState:{...Q,...R==null?void 0:R.ownerState},className:z.valueLabel}),ht=qe({elementType:Ze,externalSlotProps:ce,ownerState:Q,className:z.mark}),Oe=qe({elementType:lt,externalSlotProps:me,ownerState:Q,className:z.markLabel}),bt=qe({elementType:v,getSlotProps:ye,externalSlotProps:he,ownerState:Q});return e.jsxs(H,{...ve,children:[e.jsx(rt,{...Xe}),e.jsx(dt,{...ri}),Fe.filter(oe=>oe.value>=j&&oe.value<=A).map((oe,P)=>{const vt=Kt(oe.value,j,A),ot=_[Ie].offset(vt);let je;return K===!1?je=ge.includes(oe.value):je=K==="normal"&&($e?oe.value>=ge[0]&&oe.value<=ge[ge.length-1]:oe.value<=ge[0])||K==="inverted"&&($e?oe.value<=ge[0]||oe.value>=ge[ge.length-1]:oe.value>=ge[0]),e.jsxs(E.Fragment,{children:[e.jsx(Ze,{"data-index":P,...ht,...!Ht(Ze)&&{markActive:je},style:{...ot,...ht.style},className:Te(ht.className,je&&z.markActive)}),oe.label!=null?e.jsx(lt,{"aria-hidden":!0,"data-index":P,...Oe,...!Ht(lt)&&{markLabelActive:je},style:{...ot,...Oe.style},className:Te(z.markLabel,Oe.className,je&&z.markLabelActive),children:oe.label}):null]},P)}),ge.map((oe,P)=>{const vt=Kt(oe,j,A),ot=_[Ie].offset(vt),je=T==="off"?Jl:_e;return e.jsx(je,{...!Ht(je)&&{valueLabelFormat:X,valueLabelDisplay:T,value:typeof X=="function"?X(Z(oe),P):X,index:P,open:ze===P||Qe===P||T==="on",disabled:c},...wt,children:e.jsx(Ge,{"data-index":P,...mt,className:Te(z.thumb,mt.className,Qe===P&&z.active,Le===P&&z.focusVisible),style:{...ot,...G(P),...mt.style},children:e.jsx(v,{"data-index":P,"aria-label":x?x(P):d,"aria-valuenow":Z(oe),"aria-labelledby":s,"aria-valuetext":m?m(Z(oe),P):h,value:ge[P],...bt})})},P)})]})});function eo(i){return Ft("MuiToggleButton",i)}const si=Dt("MuiToggleButton",["root","disabled","selected","standard","primary","secondary","sizeSmall","sizeMedium","sizeLarge","fullWidth"]),to=E.createContext({}),io=E.createContext(void 0);function ro(i,t){return t===void 0||i===void 0?!1:Array.isArray(t)?t.includes(i):i===t}const lo=i=>{const{classes:t,fullWidth:r,selected:l,disabled:o,size:d,color:h}=i,s={root:["root",l&&"selected",o&&"disabled",r&&"fullWidth",`size${ue(d)}`,h]};return Lt(s,eo,t)},oo=Ce(il,{name:"MuiToggleButton",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`size${ue(r.size)}`]]}})(We(({theme:i})=>({...i.typography.button,borderRadius:(i.vars||i).shape.borderRadius,padding:11,border:`1px solid ${(i.vars||i).palette.divider}`,color:(i.vars||i).palette.action.active,[`&.${si.disabled}`]:{color:(i.vars||i).palette.action.disabled,border:`1px solid ${(i.vars||i).palette.action.disabledBackground}`},"&:hover":{textDecoration:"none",backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.hoverOpacity})`:Ve(i.palette.text.primary,i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[{props:{color:"standard"},style:{[`&.${si.selected}`]:{color:(i.vars||i).palette.text.primary,backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity)}}}}},...Object.entries(i.palette).filter(Mt()).map(([t])=>({props:{color:t},style:{[`&.${si.selected}`]:{color:(i.vars||i).palette[t].main,backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette[t].main,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:Ve(i.palette[t].main,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette[t].main,i.palette.action.selectedOpacity)}}}}})),{props:{fullWidth:!0},style:{width:"100%"}},{props:{size:"small"},style:{padding:7,fontSize:i.typography.pxToRem(13)}},{props:{size:"large"},style:{padding:15,fontSize:i.typography.pxToRem(15)}}]}))),ci=E.forwardRef(function(t,r){const{value:l,...o}=E.useContext(to),d=E.useContext(io),h=wr({...o,selected:ro(t.value,l)},t),s=Bt({props:h,name:"MuiToggleButton"}),{children:a,className:p,color:u="standard",disabled:n=!1,disableFocusRipple:g=!1,fullWidth:f=!1,onChange:y,onClick:c,selected:x,size:m="medium",value:B,...A}=s,j={...s,color:u,disabled:n,disableFocusRipple:g,fullWidth:f,size:m},S=lo(j),W=D=>{c&&(c(D,B),D.defaultPrevented)||y&&y(D,B)},w=d||"";return e.jsx(oo,{className:Te(o.className,S.root,p,w),disabled:n,focusRipple:!g,ref:r,onClick:W,onChange:y,value:B,ownerState:j,"aria-pressed":x,...A,children:a})}),no=q(e.jsx("path",{d:"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"})),ao=q(e.jsx("path",{d:"M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"})),so=q(e.jsx("path",{d:"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"})),co=q(e.jsx("path",{d:"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z"})),ho=q(e.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"})),po=q(e.jsx("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"})),fo=q(e.jsx("path",{d:"M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),uo=q(e.jsx("path",{d:"M14.69 2.21 4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02"})),xt=q(e.jsx("path",{d:"M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"})),sr=q(e.jsx("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"})),St=q(e.jsx("path",{d:"m11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27z"})),go=q(e.jsx("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"})),xo=q([e.jsx("path",{d:"m12 12.9-2.13 2.09c-.56.56-.87 1.29-.87 2.07C9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07z"},"0"),e.jsx("path",{d:"m16 6-.44.55C14.38 8.02 12 7.19 12 5.3V2S4 6 4 13c0 2.92 1.56 5.47 3.89 6.86-.56-.79-.89-1.76-.89-2.8 0-1.32.52-2.56 1.47-3.5L12 10.1l3.53 3.47c.95.93 1.47 2.17 1.47 3.5 0 1.02-.31 1.96-.85 2.75 1.89-1.15 3.29-3.06 3.71-5.3.66-3.55-1.07-6.9-3.86-8.52"},"1")]),yo=q(e.jsx("path",{d:"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z"})),mo=q(e.jsx("path",{d:"M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"})),wo=q(e.jsx("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),bo=q(e.jsx("path",{d:"m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7z"})),ii=q(e.jsx("path",{d:"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9m5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9M5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5m6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5"})),vo=q(e.jsx("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"})),Co=q(e.jsx("path",{d:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"})),jo=q(e.jsx("path",{d:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3m-3 11H8v-5h8zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-1-9H6v4h12z"})),ko=q(e.jsx("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z"})),Eo=q(e.jsx("path",{d:"M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"})),So=q(e.jsx("path",{d:"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),Fo=q(e.jsx("path",{d:"M23 6H1v12h22zm-2 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),Do=q(e.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),Bo=q(e.jsx("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8"})),Lo=q(e.jsx("path",{d:"M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"})),Mo=q(e.jsx("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"})),Ao=q(e.jsx("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"})),Ni=[],Oi=[],Gi=[],Ui=[],Hi=[],Vi=[{id:"fire-stations",name:"Fire Stations",visible:!1,opacity:1,zIndex:3,type:"feature",features:Ni,metadata:{description:"Add your fire stations using the drawing tools or data import",source:"User Data",created:new Date,featureCount:Ni.length}},{id:"hospitals",name:"Medical Facilities",visible:!1,opacity:1,zIndex:2,type:"feature",features:Oi,metadata:{description:"Add hospitals and medical facilities to your map",source:"User Data",created:new Date,featureCount:Oi.length}},{id:"hydrants",name:"Fire Hydrants",visible:!1,opacity:1,zIndex:1,type:"feature",features:Gi,metadata:{description:"Map fire hydrants with flow rates and inspection data",source:"User Data",created:new Date,featureCount:Gi.length}},{id:"recent-incidents",name:"Incidents",visible:!1,opacity:1,zIndex:4,type:"feature",features:Ui,metadata:{description:"Track emergency incidents and responses",source:"User Data",created:new Date,featureCount:Ui.length}},{id:"response-zones",name:"Response Zones",visible:!1,opacity:.6,zIndex:0,type:"feature",features:Hi,metadata:{description:"Define coverage areas and response zones",source:"User Data",created:new Date,featureCount:Hi.length}}],To=({mouseCoords:i})=>{const t=te(yt),r=(l,o=5)=>l.toFixed(o);return e.jsx(le,{elevation:2,sx:{position:"absolute",bottom:16,left:16,right:16,zIndex:1e3,p:1,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)"},children:e.jsxs(k,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs(k,{children:[e.jsx(C,{variant:"caption",color:"text.secondary",children:"Mouse:"}),i?e.jsxs(C,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:[r(i.lat),", ",r(i.lng)]}):e.jsx(C,{variant:"caption",sx:{ml:1,color:"text.disabled"},children:"Move mouse over map"})]}),e.jsxs(k,{children:[e.jsx(C,{variant:"caption",color:"text.secondary",children:"Center:"}),e.jsxs(C,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:[r(t.view.center.latitude),", ",r(t.view.center.longitude)]})]}),e.jsxs(k,{children:[e.jsx(C,{variant:"caption",color:"text.secondary",children:"Zoom:"}),e.jsx(C,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:t.view.zoom.toFixed(1)})]})]})})},zo=()=>{const i=te(Ye),t={totalFeatures:0,totalMarkers:0,totalLines:0,totalPolygons:0};return i.forEach(r=>{r.visible&&(t.totalFeatures+=r.features.length,r.features.forEach(l=>{switch(l.type){case"marker":t.totalMarkers++;break;case"polyline":t.totalLines++;break;case"polygon":t.totalPolygons++;break}}))}),t.totalFeatures===0?null:e.jsxs(le,{elevation:2,sx:{position:"absolute",top:16,left:16,zIndex:1e3,p:2,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)",minWidth:200},children:[e.jsxs(C,{variant:"subtitle2",sx:{mb:1,display:"flex",alignItems:"center",gap:1},children:[e.jsx(So,{fontSize:"small"}),"Features"]}),e.jsx(k,{sx:{display:"flex",flexDirection:"column",gap:1},children:e.jsxs(k,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(gt,{size:"small",label:`${t.totalFeatures} total`,color:"primary",variant:"outlined"}),t.totalMarkers>0&&e.jsx(gt,{size:"small",label:`${t.totalMarkers} markers`,variant:"outlined"}),t.totalLines>0&&e.jsx(gt,{size:"small",label:`${t.totalLines} lines`,variant:"outlined"}),t.totalPolygons>0&&e.jsx(gt,{size:"small",label:`${t.totalPolygons} polygons`,variant:"outlined"})]})})]})},Io=({onMapReady:i,children:t})=>{const r=E.useRef(null),l=E.useRef(null),o=E.useRef(null),d=E.useRef(!1),h=E.useRef(!1),s=te(ei),a=te(yt),p=E.useCallback(i||(()=>{}),[i]);return E.useEffect(()=>{if(!r.current||l.current||d.current)return;d.current=!0,console.log("[PureLeaflet] Creating pure Leaflet map...");const u=!!s.mode,n=ee.map(r.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0,attributionControl:!0,scrollWheelZoom:!0,doubleClickZoom:!u,boxZoom:!u,keyboard:!0,dragging:!u,touchZoom:!0}),g=a.baseMaps.find(y=>y.id===a.activeBaseMap),f=ee.tileLayer((g==null?void 0:g.url)||"https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:(g==null?void 0:g.attribution)||"© OpenStreetMap contributors",maxZoom:(g==null?void 0:g.maxZoom)||19,minZoom:(g==null?void 0:g.minZoom)||1,tileSize:256,opacity:1});return o.current=f,f.addTo(n),f.on("tileload",y=>{console.log("[PureLeaflet] Tile loaded:",y.coords)}),f.on("tileerror",y=>{console.error("[PureLeaflet] Tile error:",y)}),f.on("loading",()=>{console.log("[PureLeaflet] Started loading tiles")}),f.on("load",()=>{console.log("[PureLeaflet] Finished loading all visible tiles")}),n.on("moveend",()=>{const y=n.getCenter(),c=n.getZoom();console.log(`[PureLeaflet] Map moved to: ${y.lat}, ${y.lng} at zoom ${c}`)}),setTimeout(()=>{n.getContainer()&&(n.invalidateSize(),console.log("[PureLeaflet] Map size invalidated"))},100),l.current=n,n.whenReady(()=>{if(console.log("[PureLeaflet] ✓ Map panes and coordinate system ready"),typeof window<"u"&&(window.pureLeafletMap=n,console.log("[PureLeaflet] ✓ Map exposed as window.pureLeafletMap")),!n._size||!n.getPixelOrigin()||!n.getPanes().mapPane){console.error("[PureLeaflet] Map coordinate system not properly initialized");return}d.current=!1,r.current&&p(n,r.current)}),()=>{if(l.current&&!h.current){h.current=!0,console.log("[PureLeaflet] Map cleaned up");try{l.current.remove()}catch(y){console.warn("[PureLeaflet] Error during cleanup:",y)}l.current=null,d.current=!1,h.current=!1}}},[]),E.useEffect(()=>{console.log("[PureLeafletMap] Drawing effect triggered with mode:",s.mode);const u=l.current;if(!u){console.log("[PureLeafletMap] No map instance, skipping drawing effect");return}const n=!!s.mode;console.log("[PureLeafletMap] isDrawing calculated as:",n),n?(u.doubleClickZoom.disable(),u.boxZoom.disable(),console.log("[PureLeaflet] Zoom interactions disabled for drawing mode:",s.mode)):(u.doubleClickZoom.enable(),u.boxZoom.enable(),console.log("[PureLeaflet] All map interactions enabled - drawing mode off"))},[s.mode]),E.useEffect(()=>{const u=l.current;if(!u)return;const n=a.baseMaps.find(f=>f.id===a.activeBaseMap);if(!n)return;o.current&&(u.removeLayer(o.current),console.log("[PureLeaflet] Removed old tile layer"));const g=ee.tileLayer(n.url,{attribution:n.attribution,maxZoom:n.maxZoom||19,minZoom:n.minZoom||1,tileSize:256,opacity:1});g.on("tileload",f=>{console.log("[PureLeaflet] Tile loaded:",f.coords)}),g.on("tileerror",f=>{console.error("[PureLeaflet] Tile error:",f)}),g.on("loading",()=>{console.log("[PureLeaflet] Started loading tiles")}),g.on("load",()=>{console.log("[PureLeaflet] Finished loading all visible tiles")}),o.current=g,g.addTo(u),console.log(`[PureLeaflet] Switched to base map: ${n.name}`)},[a.activeBaseMap,a.baseMaps]),e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:r,style:{width:"100%",height:"100%",minHeight:"500px",background:"transparent"},className:"pure-leaflet-map"}),t]})},Po=({map:i})=>{const t=xe(),r=te(Ye),l=E.useRef(new Map),o=s=>{try{const p=s.style.icon;if(!p)return ee.icon({iconUrl:'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23666666"/%3E%3C/svg%3E',iconSize:[24,24],iconAnchor:[12,24],popupAnchor:[0,-24]});const u={small:[20,20],medium:[30,30],large:[40,40],"extra-large":[50,50]},n=u[p.size]||u.medium;return p.url?ee.icon({iconUrl:p.url,iconSize:n,iconAnchor:p.anchor?p.anchor:[n[0]/2,n[1]],popupAnchor:p.popupAnchor?p.popupAnchor:[0,-n[1]]}):(console.warn(`[LayerManager] Icon missing URL for feature ${s.id}`),null)}catch(a){return console.warn(`[LayerManager] Error creating icon for feature ${s.id}:`,a),null}},d=s=>{let a='<div class="fire-map-popup">';return a+=`<h3>${s.title}</h3>`,a+=`<p>${s.description}</p>`,s.properties&&Object.keys(s.properties).length>0&&(a+='<div class="feature-properties">',Object.entries(s.properties).forEach(([p,u])=>{const n=p.replace(/([A-Z])/g," $1").replace(/^./,g=>g.toUpperCase());a+=`<div><strong>${n}:</strong> ${u}</div>`}),a+="</div>"),a+="</div>",a},h=s=>{try{const a=s.style;switch(s.type){case"marker":{const[p,u]=s.coordinates;if(isNaN(u)||isNaN(p))return console.warn(`[LayerManager] Invalid coordinates for feature ${s.id}: [${p}, ${u}]`),null;const n=o(s);if(!n)return console.warn(`[LayerManager] Failed to create icon for feature ${s.id}`),null;const g=ee.marker([u,p],{icon:n});try{g.bindPopup(d(s)),g.bindTooltip(s.title,{sticky:!0}),g.on("click",()=>{console.log("Feature clicked:",s.id),t(Tt(s.id))})}catch(f){console.warn(`[LayerManager] Error binding popup/tooltip for feature ${s.id}:`,f)}return g}case"polygon":{const p=s.coordinates[0].map(([n,g])=>[g,n]),u=ee.polygon(p,{color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return u.bindPopup(d(s)),u.bindTooltip(s.title,{sticky:!0}),u.on("click",()=>{console.log("Feature clicked:",s.id),t(Tt(s.id))}),u}case"polyline":{const p=s.coordinates.map(([n,g])=>[g,n]),u=ee.polyline(p,{color:a.color||"#3388ff",weight:a.weight||3,opacity:a.opacity||1});return u.bindPopup(d(s)),u.bindTooltip(s.title,{sticky:!0}),u.on("click",()=>{console.log("Feature clicked:",s.id),t(Tt(s.id))}),u}case"circle":{const[p,u,n]=s.coordinates,g=ee.circle([u,p],{radius:n,color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return g.bindPopup(d(s)),g.bindTooltip(s.title,{sticky:!0}),g.on("click",()=>{console.log("Feature clicked:",s.id),t(Tt(s.id))}),g}default:return console.warn(`[LayerManager] Unknown feature type: ${s.type}`),null}}catch(a){return console.error(`[LayerManager] Error creating feature layer for ${s.id}:`,a),null}};return E.useEffect(()=>{if(!i||!i.getContainer()){console.warn("[LayerManager] Map or container not ready, skipping layer update");return}const s=()=>{try{const a=i.getContainer();if(!a||!a.parentNode||!document.body.contains(a)){console.warn("[LayerManager] Map container not properly attached to DOM, skipping update");return}const p=i.getPanes();if(!p||!p.markerPane||!i._size||!i._pixelOrigin){console.warn("[LayerManager] Map panes or coordinate system not ready, skipping update");return}console.log("[LayerManager] Updating layers with",r.length,"layers"),[...r].sort((n,g)=>n.zIndex-g.zIndex).forEach(n=>{const g=l.current.get(n.id);if(g)try{i.removeLayer(g),l.current.delete(n.id)}catch(f){console.warn(`[LayerManager] Error removing existing layer ${n.id}:`,f)}if(n.visible&&n.features.length>0)try{const f=i.getContainer();if(!f||!f.parentNode||!document.body.contains(f)){console.warn(`[LayerManager] Map container not ready for layer ${n.id}`);return}const y=i.getPanes();if(!y||!y.markerPane){console.warn(`[LayerManager] Map panes not ready for layer ${n.id}`);return}const c=ee.layerGroup();let x=0;n.features.forEach(m=>{try{const B=h(m);B&&(c.addLayer(B),x++)}catch(B){console.warn(`[LayerManager] Error creating feature ${m.id}:`,B)}}),n.opacity!==void 0&&n.opacity!==1&&c.eachLayer(m=>{try{m instanceof ee.Marker?m.setOpacity(n.opacity):m instanceof ee.Path&&m.setStyle({opacity:n.opacity})}catch(B){console.warn("[LayerManager] Error setting opacity:",B)}}),x>0&&i.getContainer()&&(c.addTo(i),l.current.set(n.id,c),console.log(`[LayerManager] Added layer "${n.name}" with ${x}/${n.features.length} features`))}catch(f){console.error(`[LayerManager] Error creating layer ${n.id}:`,f)}})}catch(a){console.error("[LayerManager] Critical error during layer update:",a)}};i._loaded&&i.getPanes()&&i._size?s():i.whenReady(s)},[i,r,t]),E.useEffect(()=>()=>{i&&(l.current.forEach((s,a)=>{i.removeLayer(s),console.log(`[LayerManager] Cleaned up layer: ${a}`)}),l.current.clear())},[i]),null},Ro=({map:i})=>{const t=xe(),r=te(ei),l=te(Ye),o=E.useRef(null),d=E.useRef([]),h=l.find(n=>n.type==="feature"),s=E.useCallback((n,g)=>{i&&(console.log("[PureLeafletDrawTools] Adding event handler:",n),i.on(n,g),d.current.push({event:n,handler:g}))},[i]),a=E.useCallback(()=>{i&&(console.log("[PureLeafletDrawTools] Clearing all event handlers"),d.current.forEach(({event:n,handler:g})=>{i.off(n,g)}),d.current=[],i.dragging.enable(),i.doubleClickZoom.enable(),i.boxZoom.enable(),i.getContainer().style.cursor="")},[i]),p=()=>`feature_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,u=(n,g)=>{var y,c,x,m,B;let f=[];switch(g){case"marker":const j=n.getLatLng();f=[j.lng,j.lat];break;case"circle":const S=n,W=S.getLatLng(),w=S.getRadius();f=[W.lng,W.lat,w];break;case"polygon":f=[n.getLatLngs()[0].map(Z=>[Z.lng,Z.lat])];break;case"polyline":f=n.getLatLngs().map(Z=>[Z.lng,Z.lat]);break;case"rectangle":const de=n.getBounds();f=[[de.getSouthWest().lng,de.getSouthWest().lat],[de.getNorthEast().lng,de.getNorthEast().lat]];break}return{id:p(),type:g,title:`${g.charAt(0).toUpperCase()+g.slice(1)} Feature`,description:`Drawing created at ${new Date().toLocaleTimeString()}`,coordinates:f,style:{color:(y=r.options.style)==null?void 0:y.color,fillColor:(c=r.options.style)==null?void 0:c.fillColor,fillOpacity:(x=r.options.style)==null?void 0:x.fillOpacity,weight:(m=r.options.style)==null?void 0:m.weight,opacity:(B=r.options.style)==null?void 0:B.opacity},properties:{created:new Date().toISOString(),drawingMode:g},layerId:"user-drawings",created:new Date,modified:new Date}};return E.useEffect(()=>{if(!i)return;console.log("[PureLeafletDrawTools] Initializing simple drawing");const n=new ee.FeatureGroup;return i.addLayer(n),o.current=n,console.log("[PureLeafletDrawTools] Feature group created and added to map:",n),console.log("[PureLeafletDrawTools] Feature group attached to map:",i.hasLayer(n)),console.log("[PureLeafletDrawTools] Map has feature group in layers:",i.hasLayer(n)),()=>{i&&o.current&&(console.log("[PureLeafletDrawTools] Removing feature group from map"),i.removeLayer(o.current)),o.current=null}},[i,t]),E.useEffect(()=>{if(!(!i||!i.getContainer())){if(console.log("[PureLeafletDrawTools] Drawing mode changed to:",r.mode),a(),r.mode==="edit")console.log("[PureLeafletDrawTools] Activating edit mode"),i.getContainer().style.cursor="pointer",s("click",g=>{const f=g.originalEvent.target;f&&f.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Edit click on feature:",f),alert("Edit functionality - feature clicked! (Can be enhanced to show edit dialog)"))});else if(r.mode==="delete")console.log("[PureLeafletDrawTools] Activating delete mode"),i.getContainer().style.cursor="crosshair",s("click",g=>{const f=g.originalEvent.target;f&&f.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Delete click on feature:",f),i.eachLayer(y=>{if(y.getElement&&y.getElement()===f){console.log("[PureLeafletDrawTools] Deleting layer:",y);const c=y._fireEmsFeatureId;c&&(console.log("[PureLeafletDrawTools] Found feature ID for deletion:",c),t(br(c)),console.log("[PureLeafletDrawTools] Feature deleted from Redux store")),i.removeLayer(y),console.log("[PureLeafletDrawTools] Layer removed from map")}}))});else if(r.mode){console.log("[PureLeafletDrawTools] Activating simple drawing mode:",r.mode);let n=!1,g=null,f=null;const y=m=>{var B,A,j,S,W,w,D,U,ie,de,Z,O,$,we,K,be,T,X,fe,Q;if(ee.DomEvent.stopPropagation(m.originalEvent),ee.DomEvent.preventDefault(m.originalEvent),console.log("[PureLeafletDrawTools] Drawing click detected:",r.mode,m.latlng),console.log("[PureLeafletDrawTools] Current drawing options:",r.options),console.log("[PureLeafletDrawTools] Current style options:",r.options.style),r.mode==="marker"){const _=((B=r.options.style)==null?void 0:B.color)||"#3388ff";console.log("[PureLeafletDrawTools] Creating marker with color:",_);const Se=ee.divIcon({className:"colored-marker",html:`<div style="
              background-color: ${_};
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,iconSize:[25,25],iconAnchor:[12,24],popupAnchor:[1,-24]}),ye=ee.marker(m.latlng,{draggable:!0,icon:Se});if(ye.addTo(i),console.log("[PureLeafletDrawTools] Colored marker added DIRECTLY to map:",ye),o.current&&o.current.addLayer(ye),!h)return;const Be=u(ye,"marker"),{id:ze,created:Qe,modified:Ie,...Le}=Be;t(tt({layerId:h.id,feature:Le})),ye._fireEmsFeatureId=Be.id,t(jt(null))}else if(!n&&r.mode==="circle"){n=!0,g=m.latlng,console.log("[PureLeafletDrawTools] Starting circle drawing at:",m.latlng);const _={radius:100,color:((A=r.options.style)==null?void 0:A.color)||"#3388ff",fillColor:((j=r.options.style)==null?void 0:j.fillColor)||"#3388ff",fillOpacity:((S=r.options.style)==null?void 0:S.fillOpacity)||.2,weight:((W=r.options.style)==null?void 0:W.weight)||3,opacity:((w=r.options.style)==null?void 0:w.opacity)||1};console.log("[PureLeafletDrawTools] Circle options:",_),console.log("[PureLeafletDrawTools] Fill color value:",(D=r.options.style)==null?void 0:D.fillColor),f=ee.circle(m.latlng,_),f.addTo(i),console.log("[PureLeafletDrawTools] Circle started, added DIRECTLY to map:",f)}else if(n&&r.mode==="circle"){if(console.log("[PureLeafletDrawTools] Finishing circle drawing"),f){if(!h)return;const _=u(f,"circle");console.log("[PureLeafletDrawTools] Circle feature created:",_);const{id:Se,created:ye,modified:Be,...ze}=_;t(tt({layerId:h.id,feature:ze})),f._fireEmsFeatureId=_.id,console.log("[PureLeafletDrawTools] Circle feature dispatched to Redux")}t(jt(null))}else if(!n&&r.mode==="rectangle")n=!0,g=m.latlng,console.log("[PureLeafletDrawTools] Starting rectangle drawing"),f=ee.rectangle([[m.latlng.lat,m.latlng.lng],[m.latlng.lat,m.latlng.lng]],{color:((U=r.options.style)==null?void 0:U.color)||"#3388ff",fillColor:((ie=r.options.style)==null?void 0:ie.fillColor)||"#3388ff",fillOpacity:((de=r.options.style)==null?void 0:de.fillOpacity)||.2,weight:((Z=r.options.style)==null?void 0:Z.weight)||3,opacity:((O=r.options.style)==null?void 0:O.opacity)||1}),f.addTo(i),console.log("[PureLeafletDrawTools] Rectangle started, added DIRECTLY to map:",f);else if(n&&r.mode==="rectangle"){if(console.log("[PureLeafletDrawTools] Finishing rectangle drawing"),f){if(!h)return;const _=u(f,"rectangle");console.log("[PureLeafletDrawTools] Rectangle feature created:",_);const{id:Se,created:ye,modified:Be,...ze}=_;t(tt({layerId:h.id,feature:ze})),f._fireEmsFeatureId=_.id,console.log("[PureLeafletDrawTools] Rectangle feature dispatched to Redux")}t(jt(null))}else if(!n&&(r.mode==="polygon"||r.mode==="polyline"))if(f){const _=r.mode==="polygon"?f.getLatLngs()[0]:f.getLatLngs();_.push(m.latlng),r.mode,f.setLatLngs(_),console.log(`[PureLeafletDrawTools] Added point to ${r.mode}:`,m.latlng)}else{const _=[m.latlng];r.mode==="polygon"?f=ee.polygon(_,{color:(($=r.options.style)==null?void 0:$.color)||"#3388ff",fillColor:((we=r.options.style)==null?void 0:we.fillColor)||"#3388ff",fillOpacity:((K=r.options.style)==null?void 0:K.fillOpacity)||.2,weight:((be=r.options.style)==null?void 0:be.weight)||3,opacity:((T=r.options.style)==null?void 0:T.opacity)||1}):f=ee.polyline(_,{color:((X=r.options.style)==null?void 0:X.color)||"#3388ff",weight:((fe=r.options.style)==null?void 0:fe.weight)||3,opacity:((Q=r.options.style)==null?void 0:Q.opacity)||1}),f.addTo(i),console.log(`[PureLeafletDrawTools] ${r.mode} started:`,f)}},c=m=>{if(!(!n||!f||!g))switch(ee.DomEvent.stopPropagation(m.originalEvent),r.mode){case"circle":const B=g.distanceTo(m.latlng);f.setRadius(B);break;case"rectangle":const A=ee.latLngBounds([g,m.latlng]);f.setBounds(A);break}};i.dragging.disable(),i.doubleClickZoom.disable(),i.boxZoom.disable(),console.log("[PureLeafletDrawTools] Map interactions disabled for drawing");const x=m=>{if((r.mode==="polygon"||r.mode==="polyline")&&(ee.DomEvent.stopPropagation(m.originalEvent),ee.DomEvent.preventDefault(m.originalEvent),f)){if(console.log(`[PureLeafletDrawTools] Finishing ${r.mode} with double-click`),!h)return;const B=u(f,r.mode);console.log(`[PureLeafletDrawTools] ${r.mode} feature created:`,B);const{id:A,created:j,modified:S,...W}=B;t(tt({layerId:h.id,feature:W})),f._fireEmsFeatureId=B.id,console.log(`[PureLeafletDrawTools] ${r.mode} feature dispatched to Redux`),t(jt(null))}};s("click",y),s("mousemove",c),s("dblclick",x),i.getContainer().style.cursor="crosshair"}return()=>{a()}}},[r.mode,i,t,a,s]),E.useEffect(()=>()=>{a()},[a]),null},Wo=({map:i,mapContainer:t})=>{const r=xe(),l=te(Ye),o=()=>`dropped_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;return E.useEffect(()=>{if(!i||!t||!i.getContainer()){console.warn("[DragDrop] Map or container not ready for drag/drop setup");return}const d=setTimeout(()=>{const h=i.getContainer();if(!h||!h.parentNode||!document.body.contains(h)){console.warn("[DragDrop] Map container not properly attached, skipping setup");return}if(!i.getPanes()){console.warn("[DragDrop] Map panes not ready, skipping setup");return}console.log("[DragDrop] Setting up drag and drop handlers");const a=u=>{u.preventDefault(),u.dataTransfer.dropEffect="copy"},p=u=>{var n;u.preventDefault();try{const g=u.dataTransfer.getData("application/json");if(!g){console.warn("[DragDrop] No icon data found in drop event");return}const f=JSON.parse(g);console.log("[DragDrop] Dropped icon:",f);let y;try{const m=i.getContainer();if(!m||!m.parentNode)throw new Error("Map container not available or not attached");const B=i.getPanes();if(!B||!i._loaded)throw new Error("Map not fully loaded");if(!i._size||!i._pixelOrigin||!B.mapPane)throw new Error("Map coordinate system not ready - missing _size, _pixelOrigin, or mapPane");const A=m.getBoundingClientRect(),j=u.clientX-A.left,S=u.clientY-A.top;if(j<0||S<0||j>A.width||S>A.height)throw new Error("Drop coordinates are outside map bounds");try{console.log("[DragDrop] Using legacy containerPointToLatLng method");const W=ee.point(j,S);y=i.containerPointToLatLng(W),console.log("[DragDrop] Legacy coordinate conversion:",{x:j,y:S,point:{x:W.x,y:W.y},latlng:{lat:y.lat,lng:y.lng}})}catch(W){console.error("[DragDrop] Legacy conversion failed, falling back:",W),y=ee.latLng(39.8283,-98.5795)}if(!y||isNaN(y.lat)||isNaN(y.lng))throw new Error("Invalid coordinates calculated");if(Math.abs(y.lat)>90||Math.abs(y.lng)>180)throw new Error("Coordinates outside valid geographic bounds")}catch(m){console.error("[DragDrop] Error calculating coordinates:",m);try{if(y=i.getCenter(),!y||isNaN(y.lat)||isNaN(y.lng))throw new Error("Map center is invalid")}catch(B){console.error("[DragDrop] Error getting map center:",B),y={lat:39.8283,lng:-98.5795}}}console.log("[DragDrop] Icon data received:",{id:f.id,name:f.name,url:f.url?f.url.substring(0,100)+"...":"NO URL",urlLength:f.url?f.url.length:0,category:f.category,size:f.size,color:f.color});let c=l.find(m=>m.type==="feature"&&m.visible);const x={id:o(),type:"marker",title:f.name||"Dropped Icon",description:`${f.name} placed at ${new Date().toLocaleTimeString()}`,coordinates:[y.lng,y.lat],layerId:(c==null?void 0:c.id)||"pending",style:{color:f.color||"#666666",icon:{id:f.id,name:f.name,category:f.category||"custom",url:f.url,size:f.size||"medium",color:f.color||"#666666",anchor:f.anchor||[16,32],popupAnchor:f.popupAnchor||[0,-32]}},properties:{droppedAt:new Date().toISOString(),iconSource:"library",originalIcon:f},created:new Date,modified:new Date};if(console.log("[DragDrop] Created feature with icon URL:",(n=x.style.icon)!=null&&n.url?"PRESENT":"MISSING"),c)console.log("[DragDrop] Adding feature to existing layer:",c.id,c.name),r(tt({layerId:c.id,feature:x}));else{console.log('[DragDrop] No suitable layer found. Creating "Dropped Icons" layer. Available layers:',l.map(B=>({id:B.id,name:B.name,type:B.type,visible:B.visible})));const m={name:"Dropped Icons",type:"feature",visible:!0,opacity:1,zIndex:l.length,features:[],style:{defaultStyle:{color:"#DC2626",fillColor:"#DC2626",fillOpacity:.3,weight:2,opacity:1}},metadata:{description:"Icons dropped from the icon library",source:"user-interaction",created:new Date,featureCount:0}};r(_i(m)),setTimeout(()=>{const B=l,A=B.find(j=>j.name==="Dropped Icons");if(A)console.log("[DragDrop] Adding feature to newly created layer:",A.id),x.layerId=A.id,r(tt({layerId:A.id,feature:x}));else{const j=B.find(S=>S.type==="feature");j?(console.log("[DragDrop] Using first available feature layer:",j.id),r(tt({layerId:j.id,feature:x}))):console.error("[DragDrop] Failed to create or find any feature layer")}},300)}console.log("[DragDrop] Successfully created feature from dropped icon:",x.id)}catch(g){console.error("[DragDrop] Error handling drop event:",g)}};return t.addEventListener("dragover",a),t.addEventListener("drop",p),console.log("[DragDrop] Successfully set up drag and drop handlers"),()=>{t.removeEventListener("dragover",a),t.removeEventListener("drop",p),console.log("[DragDrop] Cleaned up drag and drop handlers")}},100);return()=>{clearTimeout(d)}},[i,t,r,l]),null},$o=qi.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});qi.Marker.prototype.options.icon=$o;const No=()=>{const i=xe(),t=te(yt),r=te(ei),l=te(Ye),[o,d]=E.useState(!1),[h]=E.useState(null),[s,a]=E.useState(null),p=E.useRef(null),u=t.baseMaps.find(y=>y.id===t.activeBaseMap),n=E.useCallback((y,c)=>{p.current=y,a(c),d(!0),typeof window<"u"&&(window.fireMapProInstance=y,console.log("✓ Pure Leaflet map exposed as window.fireMapProInstance"))},[]);if(ui.useEffect(()=>{i(ct(null))},[t.activeBaseMap,i]),!u)return e.jsx(k,{sx:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",bgcolor:"grey.100"},children:e.jsx(C,{variant:"h6",color:"text.secondary",children:"No base map configured"})});const g=y=>{y.preventDefault();try{const c=JSON.parse(y.dataTransfer.getData("application/json")),m=y.currentTarget.getBoundingClientRect(),B=y.clientX-m.left,A=y.clientY-m.top;if(p.current&&c){const j=p.current.containerPointToLatLng([B,A]),S=l.find(W=>W.type==="feature");if(S){const W={type:"marker",title:c.name,description:`${c.name} - Click to edit`,coordinates:[j.lng,j.lat],style:{...c,icon:c},properties:{iconCategory:c.category,droppedFrom:"icon-library"},layerId:S.id};i(tt({layerId:S.id,feature:W})),console.log("Icon placed successfully:",c.name,"at",j)}else i(ct("Please create a feature layer first to place icons"))}}catch(c){console.error("Error handling icon drop:",c),i(ct("Error placing icon on map"))}},f=y=>{y.preventDefault(),y.dataTransfer.dropEffect="copy"};return e.jsxs(k,{sx:{height:"100%",width:"100%",position:"relative",minHeight:"500px","& .leaflet-container":{height:"100% !important",width:"100% !important",position:"relative !important"}},onDrop:g,onDragOver:f,children:[e.jsxs(Io,{onMapReady:n,children:[o&&p.current&&s&&e.jsx(Po,{map:p.current}),o&&p.current&&s&&e.jsx(Ro,{map:p.current}),o&&p.current&&s&&e.jsx(Wo,{map:p.current,mapContainer:s}),o&&p.current&&!1]}),t.showCoordinates&&e.jsx(To,{mouseCoords:h}),r.options.showMeasurements&&e.jsx(zo,{}),!1,t.showGrid&&e.jsx(k,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",backgroundImage:`
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,backgroundSize:"50px 50px",zIndex:1e3}}),!o&&e.jsx(k,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",bgcolor:"rgba(255, 255, 255, 0.9)",zIndex:2e3},children:e.jsx(C,{variant:"h6",color:"text.secondary",children:"Loading map..."})})]})},Oo=()=>{const i=xe(),t=te(Ye),[r,l]=E.useState(new Set),[o,d]=E.useState(null),[h,s]=E.useState(!1),[a,p]=E.useState(null),[u,n]=E.useState({name:"",type:"feature",opacity:1,visible:!0}),g=w=>{const D=t.find(U=>U.id===w);D&&i(vr({layerId:w,visible:!D.visible}))},f=(w,D)=>{i(Cr({layerId:w,opacity:D/100}))},y=w=>{const D=new Set(r);D.has(w)?D.delete(w):D.add(w),l(D)},c=(w,D)=>{w.preventDefault(),d({mouseX:w.clientX-2,mouseY:w.clientY-4,layerId:D})},x=()=>{d(null)},m=()=>{const w={name:u.name||"New Layer",visible:u.visible,opacity:u.opacity,zIndex:t.length,type:u.type,features:[],metadata:{description:"",source:"User Created",created:new Date,featureCount:0}};i(_i(w)),s(!1),n({name:"",type:"feature",opacity:1,visible:!0})},B=w=>{const D=t.find(U=>U.id===w);D&&(n({name:D.name,type:D.type,opacity:D.opacity,visible:D.visible}),p(w)),x()},A=()=>{a&&(i(kr({layerId:a,updates:{name:u.name,type:u.type,opacity:u.opacity,visible:u.visible}})),p(null),n({name:"",type:"feature",opacity:1,visible:!0}))},j=w=>{i(jr(w)),x()},S=w=>{switch(w){case"base":return e.jsx(pi,{});case"overlay":return e.jsx(St,{});case"reference":return e.jsx(pi,{});default:return e.jsx(St,{})}},W=w=>{switch(w){case"base":return"primary";case"overlay":return"secondary";case"reference":return"info";default:return"default"}};return e.jsxs(k,{children:[e.jsxs(k,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(C,{variant:"h6",sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(St,{}),"Layers"]}),e.jsx(Me,{startIcon:e.jsx(Wr,{}),onClick:()=>s(!0),size:"small",variant:"outlined",children:"Add"})]}),e.jsx(tr,{dense:!0,children:t.map((w,D)=>e.jsxs(ui.Fragment,{children:[e.jsxs(ir,{sx:{border:"1px solid",borderColor:"divider",borderRadius:1,mb:1,bgcolor:"background.paper"},children:[e.jsx(It,{sx:{minWidth:32},children:e.jsx(fo,{sx:{cursor:"grab",color:"text.disabled"}})}),e.jsx(It,{sx:{minWidth:40},children:S(w.type)}),e.jsx(Vt,{primary:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(C,{variant:"body2",sx:{fontWeight:500},children:w.name}),e.jsx(gt,{label:w.type,size:"small",color:W(w.type),sx:{height:20,fontSize:"0.7rem"}})]}),secondary:`${w.features.length} features`}),e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(Re,{size:"small",onClick:()=>g(w.id),color:w.visible?"primary":"default",children:w.visible?e.jsx(Mo,{}):e.jsx(Ao,{})}),e.jsx(Re,{size:"small",onClick:()=>y(w.id),children:r.has(w.id)?e.jsx($r,{}):e.jsx(He,{})}),e.jsx(Re,{size:"small",onClick:U=>c(U,w.id),children:e.jsx(wo,{})})]})]}),e.jsx(rl,{in:r.has(w.id),timeout:"auto",children:e.jsxs(k,{sx:{pl:2,pr:2,pb:2},children:[e.jsxs(C,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Opacity: ",Math.round(w.opacity*100),"%"]}),e.jsx(Jt,{value:w.opacity*100,onChange:(U,ie)=>f(w.id,ie),min:0,max:100,size:"small",sx:{mb:1}}),w.metadata.description&&e.jsx(C,{variant:"caption",color:"text.secondary",children:w.metadata.description})]})})]},w.id))}),t.length===0&&e.jsx(k,{sx:{textAlign:"center",py:4},children:e.jsx(C,{variant:"body2",color:"text.secondary",children:"No layers yet. Create your first layer to get started."})}),e.jsxs(ll,{open:o!==null,onClose:x,anchorReference:"anchorPosition",anchorPosition:o!==null?{top:o.mouseY,left:o.mouseX}:void 0,children:[e.jsxs(M,{onClick:()=>o&&B(o.layerId),children:[e.jsx(It,{children:e.jsx(Qt,{fontSize:"small"})}),e.jsx(Vt,{children:"Edit Layer"})]}),e.jsxs(M,{onClick:()=>o&&j(o.layerId),children:[e.jsx(It,{children:e.jsx(xi,{fontSize:"small"})}),e.jsx(Vt,{children:"Delete Layer"})]})]}),e.jsxs(Zt,{open:h,onClose:()=>s(!1),maxWidth:"sm",fullWidth:!0,children:[e.jsx(_t,{children:"Create New Layer"}),e.jsxs(Xt,{children:[e.jsx(re,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:u.name,onChange:w=>n({...u,name:w.target.value}),sx:{mb:2}}),e.jsxs(ne,{fullWidth:!0,sx:{mb:2},children:[e.jsx(ae,{children:"Layer Type"}),e.jsxs(se,{value:u.type,label:"Layer Type",onChange:w=>n({...u,type:w.target.value}),children:[e.jsx(M,{value:"feature",children:"Feature Layer"}),e.jsx(M,{value:"overlay",children:"Overlay Layer"}),e.jsx(M,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(C,{variant:"body2",children:"Visible:"}),e.jsx(De,{checked:u.visible,onChange:w=>n({...u,visible:w.target.checked})})]})]}),e.jsxs(qt,{children:[e.jsx(Me,{onClick:()=>s(!1),children:"Cancel"}),e.jsx(Me,{onClick:m,variant:"contained",children:"Create"})]})]}),e.jsxs(Zt,{open:a!==null,onClose:()=>p(null),maxWidth:"sm",fullWidth:!0,children:[e.jsx(_t,{children:"Edit Layer"}),e.jsxs(Xt,{children:[e.jsx(re,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:u.name,onChange:w=>n({...u,name:w.target.value}),sx:{mb:2}}),e.jsxs(ne,{fullWidth:!0,sx:{mb:2},children:[e.jsx(ae,{children:"Layer Type"}),e.jsxs(se,{value:u.type,label:"Layer Type",onChange:w=>n({...u,type:w.target.value}),children:[e.jsx(M,{value:"feature",children:"Feature Layer"}),e.jsx(M,{value:"overlay",children:"Overlay Layer"}),e.jsx(M,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(C,{variant:"body2",children:"Visible:"}),e.jsx(De,{checked:u.visible,onChange:w=>n({...u,visible:w.target.checked})})]})]}),e.jsxs(qt,{children:[e.jsx(Me,{onClick:()=>p(null),children:"Cancel"}),e.jsx(Me,{onClick:A,variant:"contained",children:"Update"})]})]})]})},Go=()=>{const i=xe(),t=te(ei),r=te(Ye),[l,o]=E.useState(""),d=[{mode:"marker",icon:e.jsx(Co,{}),label:"Marker"},{mode:"polyline",icon:e.jsx(Nr,{}),label:"Line"},{mode:"polygon",icon:e.jsx(so,{}),label:"Polygon"},{mode:"circle",icon:e.jsx(vo,{}),label:"Circle"},{mode:"rectangle",icon:e.jsx(ho,{}),label:"Rectangle"}],h=n=>{const g=n===t.mode?null:n;console.log("[DrawingTools UI] Button clicked:",{clickedMode:n,currentMode:t.mode,newMode:g}),i(jt(g))},s=(n,g)=>{console.log("[DrawingTools] Style change:",{property:n,value:g}),console.log("[DrawingTools] Current style before update:",t.options.style);const f={style:{...t.options.style,[n]:g}};console.log("[DrawingTools] New options to dispatch:",f),i(Ei(f))},a=(n,g)=>{i(Ei({[n]:g}))},p=(n,g)=>{i(Zi({[n]:g}))},u=r.filter(n=>n.type==="feature");return e.jsxs(k,{children:[e.jsxs(C,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(Qt,{}),"Drawing Tools"]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:1},children:"Drawing Mode"}),e.jsxs(L,{container:!0,spacing:1,children:[d.map(({mode:n,icon:g,label:f})=>e.jsx(L,{size:6,children:e.jsx(Gt,{title:f,children:e.jsx(ci,{value:n||"",selected:t.mode===n,onClick:()=>h(n),sx:{width:"100%",height:48},size:"small",children:g})})},n)),e.jsx(L,{size:6,children:e.jsx(Gt,{title:"Edit Features",children:e.jsx(ci,{value:"edit",selected:t.mode==="edit",onClick:()=>h("edit"),sx:{width:"100%",height:48},size:"small",children:e.jsx(Qt,{})})})}),e.jsx(L,{size:6,children:e.jsx(Gt,{title:"Delete Features",children:e.jsx(ci,{value:"delete",selected:t.mode==="delete",onClick:()=>h("delete"),sx:{width:"100%",height:48},size:"small",color:"error",children:e.jsx(xi,{})})})})]})]}),u.length>0&&e.jsx(le,{sx:{p:2,mb:2},children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Target Layer"}),e.jsx(se,{value:l,label:"Target Layer",onChange:n=>o(n.target.value),children:u.map(n=>e.jsxs(M,{value:n.id,children:[n.name," (",n.features.length," features)"]},n.id))})]})}),t.mode&&t.mode!=="edit"&&t.mode!=="delete"&&e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Style Options"}),e.jsxs(k,{sx:{mb:2},children:[e.jsx(C,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Stroke Color"}),e.jsx(L,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(n=>e.jsx(L,{size:"auto",children:e.jsx(k,{sx:{width:32,height:32,backgroundColor:n,border:t.options.style.color===n?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("color",n)})},n))})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(k,{sx:{mb:2},children:[e.jsx(C,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Fill Color"}),e.jsx(L,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(n=>e.jsx(L,{size:"auto",children:e.jsx(k,{sx:{width:32,height:32,backgroundColor:n,border:t.options.style.fillColor===n?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("fillColor",n)})},n))})]}),e.jsxs(k,{sx:{mb:2},children:[e.jsxs(C,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Stroke Width: ",t.options.style.weight,"px"]}),e.jsx(Jt,{value:t.options.style.weight||3,onChange:(n,g)=>s("weight",g),min:1,max:10,step:1,size:"small"})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(k,{sx:{mb:2},children:[e.jsxs(C,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Fill Opacity: ",Math.round((t.options.style.fillOpacity||.3)*100),"%"]}),e.jsx(Jt,{value:(t.options.style.fillOpacity||.3)*100,onChange:(n,g)=>s("fillOpacity",g/100),min:0,max:100,step:5,size:"small"})]})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Drawing Options"}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.snapToGrid||!1,onChange:n=>a("snapToGrid",n.target.checked),size:"small"}),label:"Snap to Grid",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.showMeasurements||!1,onChange:n=>a("showMeasurements",n.target.checked),size:"small"}),label:"Show Measurements",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.allowEdit||!1,onChange:n=>a("allowEdit",n.target.checked),size:"small"}),label:"Allow Editing",sx:{display:"flex"}})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Map Display"}),e.jsx(pe,{control:e.jsx(De,{checked:!1,onChange:n=>p("showGrid",n.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:!0,onChange:n=>p("showCoordinates",n.target.checked),size:"small"}),label:"Show Coordinates",sx:{display:"flex"}})]}),t.mode&&e.jsxs(le,{sx:{p:2,bgcolor:"primary.light",color:"primary.contrastText"},children:[e.jsxs(C,{variant:"subtitle2",sx:{mb:1},children:["Active: ",t.mode.charAt(0).toUpperCase()+t.mode.slice(1)," Mode"]}),e.jsxs(C,{variant:"caption",children:[t.mode==="marker"&&"Click on the map to place markers",t.mode==="polyline"&&"Click points to draw a line",t.mode==="polygon"&&"Click points to draw a polygon",t.mode==="circle"&&"Click and drag to draw a circle",t.mode==="rectangle"&&"Click and drag to draw a rectangle",t.mode==="edit"&&"Click features to edit them",t.mode==="delete"&&"Click features to delete them"]})]}),u.length===0&&e.jsxs(le,{sx:{p:2,bgcolor:"warning.light",color:"warning.contrastText"},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:1},children:"No Feature Layers"}),e.jsx(C,{variant:"caption",children:"Create a feature layer first to start drawing."})]})]})},Y=(i,t,r,l,o="medium",d="#333333")=>{const h=encodeURIComponent(l);return{id:i,name:t,category:r,url:`data:image/svg+xml,${h}`,size:o,color:d,anchor:o==="small"?[12,12]:o==="large"?[20,40]:[16,32],popupAnchor:[0,o==="small"?-12:o==="large"?-40:-32]}},Uo=[Y("fire-engine","Fire Engine","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="36" height="12" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#B91C1C"/>
      
      <!-- Equipment Compartments -->
      <rect x="16" y="14" width="6" height="3" rx="0.5" fill="#991B1B"/>
      <rect x="24" y="14" width="6" height="3" fill="#991B1B"/>
      <rect x="32" y="14" width="4" height="3" fill="#991B1B"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="32" cy="26" r="3" fill="#374151"/>
      <circle cx="32" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Pump Panel -->
      <rect x="16" y="18" width="20" height="2" fill="#F59E0B"/>
      <circle cx="18" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="22" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="26" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="30" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="34" cy="19" r="0.5" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Ladder on top -->
      <rect x="16" y="11" width="20" height="1" fill="#9CA3AF"/>
      <rect x="17" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="21" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="25" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="29" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="33" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">E1</text>
    </svg>`,"large","#DC2626"),Y("ladder-truck","Ladder Truck","fire-apparatus",`<svg width="50" height="32" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="46" height="12" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#B91C1C"/>
      
      <!-- Turntable -->
      <circle cx="25" cy="18" r="4" fill="#991B1B"/>
      <circle cx="25" cy="18" r="2" fill="#374151"/>
      
      <!-- Extended Ladder -->
      <rect x="15" y="6" width="30" height="2" rx="1" fill="#9CA3AF"/>
      <rect x="16" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="20" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="24" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="28" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="32" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="36" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="40" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      
      <!-- Outriggers -->
      <rect x="0" y="20" width="6" height="1" fill="#374151"/>
      <rect x="44" y="20" width="6" height="1" fill="#374151"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="20" cy="26" r="3" fill="#374151"/>
      <circle cx="20" cy="26" r="2" fill="#6B7280"/>
      <circle cx="30" cy="26" r="3" fill="#374151"/>
      <circle cx="30" cy="26" r="2" fill="#6B7280"/>
      <circle cx="42" cy="26" r="3" fill="#374151"/>
      <circle cx="42" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Equipment Compartments -->
      <rect x="16" y="14" width="4" height="3" fill="#991B1B"/>
      <rect x="35" y="14" width="4" height="3" fill="#991B1B"/>
      <rect x="41" y="14" width="4" height="3" fill="#991B1B"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">L1</text>
    </svg>`,"large","#DC2626"),Y("water-tanker","Water Tanker","fire-apparatus",`<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#DC2626"/>
      
      <!-- Water Tank (cylindrical) -->
      <ellipse cx="28" cy="18" rx="14" ry="8" fill="#1E40AF"/>
      <ellipse cx="28" cy="16" rx="14" ry="2" fill="#3B82F6"/>
      
      <!-- Tank Support Structure -->
      <rect x="14" y="22" width="28" height="2" fill="#374151"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="24" cy="26" r="3" fill="#374151"/>
      <circle cx="24" cy="26" r="2" fill="#6B7280"/>
      <circle cx="36" cy="26" r="3" fill="#374151"/>
      <circle cx="36" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Tank Connections -->
      <rect x="40" y="17" width="2" height="3" fill="#F59E0B"/>
      <circle cx="40.5" cy="17.5" r="0.5" fill="#DC2626"/>
      <circle cx="40.5" cy="19.5" r="0.5" fill="#DC2626"/>
      
      <!-- Water Level Indicator -->
      <rect x="16" y="15" width="24" height="1" fill="#60A5FA" fill-opacity="0.7"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">T1</text>
      
      <!-- Water Capacity -->
      <text x="28" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">3000 GAL</text>
    </svg>`,"large","#1E40AF"),Y("brush-unit","Brush Unit","fire-apparatus",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="32" height="8" rx="1" fill="#059669"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="12" rx="1" fill="#047857"/>
      
      <!-- Pickup Bed with Equipment -->
      <rect x="16" y="10" width="18" height="10" rx="1" fill="#065F46"/>
      
      <!-- Water Tank in Bed -->
      <ellipse cx="25" cy="15" rx="7" ry="3" fill="#1E40AF"/>
      
      <!-- Hose Reel -->
      <circle cx="30" cy="13" r="2" fill="#374151"/>
      <circle cx="30" cy="13" r="1.5" fill="#6B7280"/>
      
      <!-- High-clearance wheels -->
      <circle cx="8" cy="24" r="4" fill="#374151"/>
      <circle cx="8" cy="24" r="3" fill="#6B7280"/>
      <circle cx="28" cy="24" r="4" fill="#374151"/>
      <circle cx="28" cy="24" r="3" fill="#6B7280"/>
      
      <!-- Brush Guards -->
      <rect x="0" y="14" width="4" height="4" rx="2" fill="#9CA3AF"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#F59E0B"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Tools on Side -->
      <rect x="17" y="11" width="1" height="6" fill="#8B5CF6"/>
      <rect x="19" y="11" width="1" height="6" fill="#8B5CF6"/>
      
      <!-- Unit Number -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">BR1</text>
    </svg>`,"large","#059669"),Y("rescue-unit","Rescue Unit","fire-apparatus",`<svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="10" width="42" height="14" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="6" width="12" height="18" rx="1" fill="#B91C1C"/>
      
      <!-- Multiple Equipment Compartments -->
      <rect x="16" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="24" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="32" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="40" y="12" width="4" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      
      <!-- Equipment Doors -->
      <rect x="17" y="13" width="4" height="6" fill="#7F1D1D"/>
      <rect x="25" y="13" width="4" height="6" fill="#7F1D1D"/>
      <rect x="33" y="13" width="4" height="6" fill="#7F1D1D"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="22" cy="26" r="3" fill="#374151"/>
      <circle cx="22" cy="26" r="2" fill="#6B7280"/>
      <circle cx="38" cy="26" r="3" fill="#374151"/>
      <circle cx="38" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Roof Equipment -->
      <rect x="16" y="9" width="26" height="1" fill="#F59E0B"/>
      <rect x="18" y="8" width="2" height="2" fill="#374151"/>
      <rect x="22" y="8" width="2" height="2" fill="#374151"/>
      <rect x="26" y="8" width="2" height="2" fill="#374151"/>
      <rect x="30" y="8" width="2" height="2" fill="#374151"/>
      <rect x="34" y="8" width="2" height="2" fill="#374151"/>
      <rect x="38" y="8" width="2" height="2" fill="#374151"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="4" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="7" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- RESCUE Text -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="2.5" font-weight="bold">RESCUE</text>
    </svg>`,"large","#DC2626"),Y("hazmat-unit","HazMat Unit","fire-apparatus",`<svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="10" width="38" height="14" rx="1" fill="#F59E0B"/>
      
      <!-- Cab -->
      <rect x="2" y="6" width="12" height="18" rx="1" fill="#D97706"/>
      
      <!-- Hazmat Equipment Compartments -->
      <rect x="16" y="12" width="8" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      <rect x="26" y="12" width="8" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      <rect x="36" y="12" width="4" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      
      <!-- Hazmat Symbols -->
      <polygon points="20,14 22,18 18,18" fill="#DC2626"/>
      <text x="20" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">!</text>
      
      <polygon points="30,14 32,18 28,18" fill="#DC2626"/>
      <circle cx="30" cy="16" r="1.5" fill="none" stroke="white" stroke-width="0.5"/>
      <path d="M29 15h2M30 14v2" stroke="white" stroke-width="0.5"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="24" cy="26" r="3" fill="#374151"/>
      <circle cx="24" cy="26" r="2" fill="#6B7280"/>
      <circle cx="36" cy="26" r="3" fill="#374151"/>
      <circle cx="36" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Air Filtration System -->
      <rect x="16" y="8" width="22" height="2" fill="#6B7280"/>
      <circle cx="18" cy="9" r="0.5" fill="#374151"/>
      <circle cx="22" cy="9" r="0.5" fill="#374151"/>
      <circle cx="26" cy="9" r="0.5" fill="#374151"/>
      <circle cx="30" cy="9" r="0.5" fill="#374151"/>
      <circle cx="34" cy="9" r="0.5" fill="#374151"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="4" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="7" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- HAZMAT Text -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="2.5" font-weight="bold">HAZMAT</text>
    </svg>`,"large","#F59E0B"),Y("command-vehicle","Command Vehicle","fire-apparatus",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Vehicle Body (SUV Style) -->
      <rect x="2" y="10" width="28" height="10" rx="2" fill="#1F2937"/>
      
      <!-- Hood -->
      <rect x="2" y="8" width="8" height="4" rx="1" fill="#374151"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="6" height="5" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Windows -->
      <rect x="11" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="17" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="23" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="22" r="3" fill="#374151"/>
      <circle cx="8" cy="22" r="2" fill="#6B7280"/>
      <circle cx="24" cy="22" r="3" fill="#374151"/>
      <circle cx="24" cy="22" r="2" fill="#6B7280"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="24" height="1.5" rx="0.5" fill="#EF4444"/>
      <rect x="6" y="6.2" width="2" height="1.1" fill="#FBBF24"/>
      <rect x="10" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="14" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="18" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="22" y="6.2" width="2" height="1.1" fill="#FBBF24"/>
      <rect x="26" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      
      <!-- Antenna -->
      <rect x="28" y="4" width="0.5" height="6" fill="#6B7280"/>
      <circle cx="28.25" cy="4" r="0.5" fill="#374151"/>
      
      <!-- Command Insignia -->
      <polygon points="16,13 18,15 16,17 14,15" fill="#FBBF24"/>
      <text x="16" y="16" text-anchor="middle" fill="black" font-family="Arial" font-size="2" font-weight="bold">C</text>
      
      <!-- Side Equipment -->
      <rect x="28" y="12" width="2" height="6" fill="#6B7280"/>
    </svg>`,"medium","#1F2937"),Y("fire-boat","Fire Boat","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Water -->
      <rect x="0" y="24" width="40" height="8" fill="#3B82F6" fill-opacity="0.6"/>
      <path d="M0 24 Q5 22 10 24 Q15 26 20 24 Q25 22 30 24 Q35 26 40 24 V32 H0 Z" fill="#1E40AF" fill-opacity="0.4"/>
      
      <!-- Boat Hull -->
      <path d="M4 20 Q2 22 2 24 H38 Q38 22 36 20 H4 Z" fill="#DC2626"/>
      
      <!-- Deck -->
      <rect x="4" y="16" width="32" height="4" rx="1" fill="#B91C1C"/>
      
      <!-- Pilot House -->
      <rect x="12" y="10" width="16" height="6" rx="1" fill="#991B1B"/>
      
      <!-- Windows -->
      <rect x="14" y="11" width="12" height="3" rx="0.5" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Water Cannons -->
      <circle cx="8" cy="18" r="2" fill="#374151"/>
      <rect x="6" y="16" width="4" height="1" fill="#6B7280"/>
      
      <circle cx="32" cy="18" r="2" fill="#374151"/>
      <rect x="30" y="16" width="4" height="1" fill="#6B7280"/>
      
      <!-- Water Streams -->
      <path d="M8 16 Q12 8 16 4" stroke="#3B82F6" stroke-width="1" fill="none"/>
      <path d="M32 16 Q28 8 24 4" stroke="#3B82F6" stroke-width="1" fill="none"/>
      
      <!-- Navigation Lights -->
      <circle cx="36" cy="14" r="1" fill="#22C55E"/>
      <circle cx="4" cy="14" r="1" fill="#EF4444"/>
      
      <!-- Radar/Antenna -->
      <rect x="19.5" y="8" width="1" height="4" fill="#6B7280"/>
      <circle cx="20" cy="8" r="1" fill="#374151"/>
      
      <!-- Life Rings -->
      <circle cx="10" cy="12" r="1.5" fill="#F97316"/>
      <circle cx="10" cy="12" r="1" fill="none" stroke="white" stroke-width="0.3"/>
      
      <circle cx="30" cy="12" r="1.5" fill="#F97316"/>
      <circle cx="30" cy="12" r="1" fill="none" stroke="white" stroke-width="0.3"/>
      
      <!-- Unit Number -->
      <text x="20" y="14" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">FB1</text>
    </svg>`,"large","#DC2626")],Ho=[Y("als-ambulance","ALS Ambulance","ems-units",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ambulance Body -->
      <rect x="2" y="8" width="32" height="16" rx="2" fill="white" stroke="#DC2626" stroke-width="1"/>
      
      <!-- Cab -->
      <rect x="2" y="10" width="12" height="10" rx="1" fill="#F3F4F6"/>
      
      <!-- Patient Compartment -->
      <rect x="16" y="10" width="18" height="10" rx="1" fill="white"/>
      
      <!-- Windshield -->
      <rect x="3" y="11" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Window -->
      <rect x="26" y="12" width="6" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="28" cy="26" r="3" fill="#374151"/>
      <circle cx="28" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Medical Cross (Large) -->
      <rect x="18" y="12" width="6" height="2" fill="#DC2626"/>
      <rect x="20" y="10" width="2" height="6" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      <rect x="24" y="6" width="8" height="1" rx="0.5" fill="#3B82F6"/>
      
      <!-- Star of Life -->
      <circle cx="30" cy="14" r="2" fill="#1E40AF"/>
      <polygon points="30,12 30.5,13.5 29.5,13.5" fill="white"/>
      <polygon points="30,16 30.5,14.5 29.5,14.5" fill="white"/>
      <polygon points="28,14 29.5,14.5 29.5,13.5" fill="white"/>
      <polygon points="32,14 30.5,13.5 30.5,14.5" fill="white"/>
      <polygon points="28.5,12.5 29.8,13.8 29,14.6" fill="white"/>
      <polygon points="31.5,15.5 30.2,14.2 31,13.4" fill="white"/>
      
      <!-- Equipment -->
      <rect x="17" y="17" width="2" height="2" fill="#6B7280"/>
      <rect x="20" y="17" width="2" height="2" fill="#6B7280"/>
      
      <!-- AMBULANCE Text -->
      <text x="18" y="8" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">AMBULANCE</text>
    </svg>`,"large","#DC2626"),Y("bls-ambulance","BLS Ambulance","ems-units",`<svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ambulance Body -->
      <rect x="2" y="8" width="30" height="16" rx="2" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Cab -->
      <rect x="2" y="10" width="10" height="10" rx="1" fill="#F3F4F6"/>
      
      <!-- Patient Compartment -->
      <rect x="14" y="10" width="18" height="10" rx="1" fill="white"/>
      
      <!-- Windshield -->
      <rect x="3" y="11" width="8" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Window -->
      <rect x="24" y="12" width="6" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="7" cy="26" r="3" fill="#374151"/>
      <circle cx="7" cy="26" r="2" fill="#6B7280"/>
      <circle cx="27" cy="26" r="3" fill="#374151"/>
      <circle cx="27" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Medical Cross -->
      <rect x="16" y="12" width="4" height="1.5" fill="#1E40AF"/>
      <rect x="17" y="10.5" width="1.5" height="4.5" fill="#1E40AF"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="6" height="1" rx="0.5" fill="#3B82F6"/>
      <rect x="22" y="6" width="6" height="1" rx="0.5" fill="#3B82F6"/>
      
      <!-- First Aid Symbol -->
      <rect x="22" y="12" width="6" height="4" rx="0.5" fill="#1E40AF"/>
      <rect x="24" y="13" width="2" height="1" fill="white"/>
      <rect x="24.5" y="12.5" width="1" height="2" fill="white"/>
      
      <!-- Equipment -->
      <rect x="15" y="17" width="1.5" height="2" fill="#6B7280"/>
      <rect x="17" y="17" width="1.5" height="2" fill="#6B7280"/>
      
      <!-- BLS Text -->
      <text x="17" y="8" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="2" font-weight="bold">BLS AMBULANCE</text>
    </svg>`,"large","#1E40AF"),Y("air-ambulance","Air Ambulance","ems-units",`<svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Rotor Disc -->
      <ellipse cx="20" cy="18" rx="18" ry="2" fill="#6B7280" fill-opacity="0.3"/>
      
      <!-- Fuselage -->
      <ellipse cx="20" cy="22" rx="12" ry="6" fill="#DC2626"/>
      
      <!-- Cockpit -->
      <ellipse cx="28" cy="22" rx="4" ry="4" fill="#B91C1C"/>
      
      <!-- Cockpit Windows -->
      <path d="M26 20 Q30 18 32 22 Q30 26 26 24 Q28 22 26 20" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Side Windows -->
      <rect x="12" y="20" width="4" height="3" rx="1" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="18" y="20" width="4" height="3" rx="1" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Landing Skids -->
      <rect x="10" y="28" width="20" height="1" rx="0.5" fill="#374151"/>
      <rect x="12" y="27" width="2" height="3" fill="#6B7280"/>
      <rect x="26" y="27" width="2" height="3" fill="#6B7280"/>
      
      <!-- Tail Boom -->
      <rect x="8" y="21" width="12" height="2" rx="1" fill="#991B1B"/>
      
      <!-- Tail Rotor -->
      <circle cx="8" cy="18" r="3" fill="#6B7280" fill-opacity="0.3"/>
      <rect x="7" y="15" width="2" height="6" fill="#374151"/>
      
      <!-- Medical Cross -->
      <rect x="18" y="20" width="4" height="1.5" fill="white"/>
      <rect x="19.25" y="19" width="1.5" height="4" fill="white"/>
      
      <!-- Star of Life -->
      <circle cx="14" cy="22" r="2" fill="white"/>
      <polygon points="14,20 14.3,21.2 13.7,21.2" fill="#1E40AF"/>
      <polygon points="14,24 14.3,22.8 13.7,22.8" fill="#1E40AF"/>
      <polygon points="12,22 13.2,22.3 13.2,21.7" fill="#1E40AF"/>
      <polygon points="16,22 14.8,21.7 14.8,22.3" fill="#1E40AF"/>
      <polygon points="12.5,20.5 13.6,21.6 13,22.2" fill="#1E40AF"/>
      <polygon points="15.5,23.5 14.4,22.4 15,21.8" fill="#1E40AF"/>
      
      <!-- Navigation Lights -->
      <circle cx="32" cy="20" r="0.5" fill="#22C55E"/>
      <circle cx="8" cy="20" r="0.5" fill="#EF4444"/>
      
      <!-- Antenna -->
      <rect x="19.5" y="16" width="0.5" height="3" fill="#6B7280"/>
      
      <!-- MEDIC Text -->
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">MEDIC 1</text>
    </svg>`,"large","#DC2626"),Y("paramedic-unit","Paramedic Unit","ems-units",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Vehicle Body -->
      <rect x="2" y="10" width="28" height="10" rx="2" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Hood/Front -->
      <rect x="2" y="8" width="8" height="4" rx="1" fill="#F3F4F6"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="6" height="5" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Windows -->
      <rect x="11" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="17" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="23" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="22" r="3" fill="#374151"/>
      <circle cx="8" cy="22" r="2" fill="#6B7280"/>
      <circle cx="24" cy="22" r="3" fill="#374151"/>
      <circle cx="24" cy="22" r="2" fill="#6B7280"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="24" height="1.5" rx="0.5" fill="#1E40AF"/>
      <rect x="6" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="10" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="14" y="6.2" width="2" height="1.1" fill="white"/>
      <rect x="18" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="22" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="26" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      
      <!-- Paramedic Cross -->
      <rect x="14" y="12" width="4" height="1.5" fill="#1E40AF"/>
      <rect x="15.25" y="11" width="1.5" height="4" fill="#1E40AF"/>
      
      <!-- Star of Life -->
      <circle cx="25" cy="13" r="1.5" fill="#1E40AF"/>
      <polygon points="25,11.5 25.2,12.4 24.8,12.4" fill="white"/>
      <polygon points="25,14.5 25.2,13.6 24.8,13.6" fill="white"/>
      <polygon points="23.5,13 24.4,13.2 24.4,12.8" fill="white"/>
      <polygon points="26.5,13 25.6,12.8 25.6,13.2" fill="white"/>
      <polygon points="24,11.8 24.8,12.6 24.4,13" fill="white"/>
      <polygon points="26,14.2 25.2,13.4 25.6,13" fill="white"/>
      
      <!-- Medical Equipment -->
      <rect x="12" y="16" width="8" height="2" fill="#6B7280"/>
      <rect x="13" y="16.2" width="1" height="1.6" fill="#EF4444"/>
      <rect x="15" y="16.2" width="1" height="1.6" fill="#22C55E"/>
      <rect x="17" y="16.2" width="1" height="1.6" fill="#3B82F6"/>
      <rect x="19" y="16.2" width="1" height="1.6" fill="#FBBF24"/>
      
      <!-- PARAMEDIC Text -->
      <text x="16" y="8" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="1.8" font-weight="bold">PARAMEDIC</text>
    </svg>`,"medium","#1E40AF")],Vo=[Y("structure-fire","Structure Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Building -->
      <rect x="6" y="16" width="16" height="10" fill="#6B7280"/>
      
      <!-- Roof -->
      <polygon points="4,16 14,8 24,16" fill="#4B5563"/>
      
      <!-- Windows -->
      <rect x="8" y="18" width="3" height="3" fill="#FCD34D"/>
      <rect x="12" y="18" width="3" height="3" fill="#F97316"/>
      <rect x="16" y="18" width="3" height="3" fill="#DC2626"/>
      <rect x="8" y="22" width="3" height="3" fill="#EF4444"/>
      <rect x="16" y="22" width="3" height="3" fill="#F59E0B"/>
      
      <!-- Door -->
      <rect x="12" y="21" width="3" height="5" fill="#7C2D12"/>
      
      <!-- Flames -->
      <path d="M8 16 Q10 12 12 16 Q14 10 16 16 Q18 12 20 16" fill="#EF4444"/>
      <path d="M9 15 Q11 11 13 15 Q15 9 17 15 Q19 11 21 15" fill="#F97316"/>
      <path d="M10 14 Q12 10 14 14 Q16 8 18 14" fill="#FBBF24"/>
      
      <!-- Smoke -->
      <ellipse cx="10" cy="6" rx="3" ry="2" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="14" cy="4" rx="4" ry="2" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="18" cy="6" rx="3" ry="2" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,"medium","#DC2626"),Y("vehicle-fire","Vehicle Fire","incident-types",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Car Body -->
      <rect x="4" y="12" width="24" height="6" rx="2" fill="#374151"/>
      
      <!-- Car Roof -->
      <rect x="8" y="8" width="16" height="6" rx="2" fill="#4B5563"/>
      
      <!-- Wheels -->
      <circle cx="10" cy="20" r="2" fill="#1F2937"/>
      <circle cx="22" cy="20" r="2" fill="#1F2937"/>
      
      <!-- Windows -->
      <rect x="10" y="9" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.3"/>
      <rect x="18" y="9" width="4" height="4" rx="0.5" fill="#F97316" fill-opacity="0.8"/>
      
      <!-- Flames from Hood -->
      <path d="M4 12 Q6 8 8 12 Q10 6 12 12" fill="#EF4444"/>
      <path d="M5 11 Q7 7 9 11 Q11 5 13 11" fill="#F97316"/>
      <path d="M6 10 Q8 6 10 10 Q12 4 14 10" fill="#FBBF24"/>
      
      <!-- Flames from Windows -->
      <path d="M18 9 Q20 5 22 9 Q24 3 26 9" fill="#EF4444"/>
      <path d="M19 8 Q21 4 23 8 Q25 2 27 8" fill="#F97316"/>
      
      <!-- Smoke -->
      <ellipse cx="8" cy="4" rx="3" ry="1.5" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="16" cy="2" rx="4" ry="1.5" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="24" cy="4" rx="3" ry="1.5" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,"medium","#F59E0B"),Y("medical-emergency","Medical Emergency","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle -->
      <circle cx="12" cy="12" r="11" fill="#059669"/>
      
      <!-- Person -->
      <circle cx="12" cy="8" r="3" fill="white"/>
      <rect x="9" y="12" width="6" height="8" rx="1" fill="white"/>
      
      <!-- Medical Cross -->
      <rect x="10" y="6" width="4" height="1.5" fill="#DC2626"/>
      <rect x="11.25" y="4.5" width="1.5" height="4.5" fill="#DC2626"/>
      
      <!-- Star of Life -->
      <circle cx="18" cy="6" r="3" fill="#1E40AF"/>
      <polygon points="18,4 18.5,5.5 17.5,5.5" fill="white"/>
      <polygon points="18,8 18.5,6.5 17.5,6.5" fill="white"/>
      <polygon points="16,6 17.5,6.5 17.5,5.5" fill="white"/>
      <polygon points="20,6 18.5,5.5 18.5,6.5" fill="white"/>
      <polygon points="16.5,4.5 17.8,5.8 17.2,6.4" fill="white"/>
      <polygon points="19.5,7.5 18.2,6.2 18.8,5.6" fill="white"/>
    </svg>`,"medium","#059669"),Y("hazmat-incident","Hazmat Incident","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Warning Diamond -->
      <polygon points="12,2 22,12 12,22 2,12" fill="#FBBF24"/>
      <polygon points="12,4 20,12 12,20 4,12" fill="#F59E0B"/>
      
      <!-- Hazmat Symbol -->
      <circle cx="12" cy="8" r="2" fill="#DC2626"/>
      <circle cx="8" cy="14" r="2" fill="#DC2626"/>
      <circle cx="16" cy="14" r="2" fill="#DC2626"/>
      
      <!-- Connecting Lines -->
      <path d="M12 10 L10 12" stroke="#DC2626" stroke-width="1"/>
      <path d="M12 10 L14 12" stroke="#DC2626" stroke-width="1"/>
      <path d="M10 14 L14 14" stroke="#DC2626" stroke-width="1"/>
      
      <!-- Warning Text -->
      <text x="12" y="18" text-anchor="middle" fill="black" font-family="Arial" font-size="6" font-weight="bold">!</text>
    </svg>`,"medium","#F59E0B"),Y("water-rescue","Water Rescue","incident-types",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Water -->
      <path d="M0 16 Q7 14 14 16 Q21 18 28 16 V24 H0 Z" fill="#3B82F6"/>
      <path d="M0 18 Q7 16 14 18 Q21 20 28 18 V24 H0 Z" fill="#1E40AF"/>
      
      <!-- Person in Water -->
      <circle cx="14" cy="14" r="2" fill="#FEF3C7"/>
      <rect x="12" y="16" width="4" height="2" rx="1" fill="#F59E0B"/>
      
      <!-- Arms Waving -->
      <rect x="10" y="12" width="1" height="3" fill="#FEF3C7" transform="rotate(-30 10.5 13.5)"/>
      <rect x="17" y="12" width="1" height="3" fill="#FEF3C7" transform="rotate(30 17.5 13.5)"/>
      
      <!-- Life Ring -->
      <circle cx="8" cy="8" r="3" fill="#F97316"/>
      <circle cx="8" cy="8" r="2" fill="none" stroke="white" stroke-width="0.5"/>
      <circle cx="8" cy="8" r="1" fill="none" stroke="#F97316" stroke-width="0.5"/>
      
      <!-- Rescue Boat -->
      <path d="M18 10 Q20 8 24 10 Q26 12 24 14 Q20 14 18 12 Z" fill="#DC2626"/>
      <rect x="20" y="8" width="2" height="2" fill="white"/>
    </svg>`,"medium","#3B82F6"),Y("wildland-fire","Wildland Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ground -->
      <rect x="0" y="22" width="28" height="6" fill="#8B5CF6"/>
      
      <!-- Trees -->
      <circle cx="8" cy="18" r="4" fill="#22C55E"/>
      <rect x="7" y="18" width="2" height="6" fill="#7C2D12"/>
      
      <circle cx="14" cy="16" r="5" fill="#16A34A"/>
      <rect x="13" y="16" width="2" height="8" fill="#7C2D12"/>
      
      <circle cx="20" cy="18" r="4" fill="#22C55E"/>
      <rect x="19" y="18" width="2" height="6" fill="#7C2D12"/>
      
      <!-- Flames -->
      <path d="M6 18 Q8 12 10 18 Q12 8 14 18 Q16 10 18 18 Q20 12 22 18" fill="#EF4444"/>
      <path d="M7 17 Q9 11 11 17 Q13 7 15 17 Q17 9 19 17 Q21 11 23 17" fill="#F97316"/>
      <path d="M8 16 Q10 10 12 16 Q14 6 16 16 Q18 8 20 16" fill="#FBBF24"/>
      
      <!-- Smoke -->
      <ellipse cx="8" cy="8" rx="4" ry="2" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="14" cy="4" rx="6" ry="2" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="20" cy="6" rx="4" ry="2" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,"medium","#22C55E")],Yo=[Y("fire-station","Fire Station","facilities",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Building Base -->
      <rect x="2" y="12" width="32" height="16" fill="#DC2626"/>
      
      <!-- Roof -->
      <polygon points="0,12 18,4 36,12" fill="#7C2D12"/>
      
      <!-- Main Bay Door -->
      <rect x="6" y="16" width="12" height="12" fill="#991B1B"/>
      <rect x="7" y="17" width="10" height="10" fill="white"/>
      <path d="M8 18 H16 M8 20 H16 M8 22 H16 M8 24 H16 M8 26 H16" stroke="#DC2626" stroke-width="0.5"/>
      
      <!-- Side Door -->
      <rect x="20" y="20" width="4" height="8" fill="#7C2D12"/>
      <circle cx="23" cy="24" r="0.3" fill="#FBBF24"/>
      
      <!-- Windows -->
      <rect x="26" y="18" width="4" height="3" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="22" width="4" height="3" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Station Number -->
      <circle cx="12" cy="10" r="3" fill="white"/>
      <text x="12" y="12" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="4" font-weight="bold">1</text>
      
      <!-- Fire Department Shield -->
      <path d="M28 8 Q30 6 32 8 Q32 10 30 12 Q28 10 28 8" fill="#FBBF24"/>
      <rect x="29" y="8" width="2" height="1" fill="#DC2626"/>
      <rect x="29.5" y="7.5" width="1" height="2" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="14" width="2" height="1" rx="0.5" fill="#EF4444"/>
      <rect x="30" y="14" width="2" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Fire Bell -->
      <circle cx="18" cy="8" r="1.5" fill="#7C2D12"/>
      <circle cx="18" cy="8" r="1" fill="#FBBF24"/>
    </svg>`,"large","#DC2626"),Y("hospital","Hospital","facilities",`<svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Building -->
      <rect x="4" y="12" width="24" height="20" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Hospital Wings -->
      <rect x="2" y="16" width="6" height="12" fill="#F3F4F6" stroke="#1E40AF" stroke-width="0.5"/>
      <rect x="24" y="16" width="6" height="12" fill="#F3F4F6" stroke="#1E40AF" stroke-width="0.5"/>
      
      <!-- Windows -->
      <rect x="6" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="10" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="14" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="18" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="22" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      
      <rect x="6" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="22" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Main Medical Cross -->
      <rect x="14" y="16" width="4" height="2" fill="#DC2626"/>
      <rect x="15" y="14" width="2" height="6" fill="#DC2626"/>
      
      <!-- Emergency Entrance -->
      <rect x="12" y="24" width="8" height="8" fill="#EF4444"/>
      <text x="16" y="28" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">EMERGENCY</text>
      
      <!-- Helipad on Roof -->
      <circle cx="16" cy="6" r="6" fill="#1E40AF"/>
      <circle cx="16" cy="6" r="4" fill="none" stroke="white" stroke-width="1"/>
      <text x="16" y="8" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">H</text>
      
      <!-- Ambulance Bay -->
      <rect x="4" y="28" width="6" height="4" fill="#FBBF24"/>
      <rect x="22" y="28" width="6" height="4" fill="#FBBF24"/>
    </svg>`,"large","#1E40AF"),Y("fire-hydrant","Fire Hydrant","facilities",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Hydrant Body -->
      <rect x="6" y="10" width="4" height="8" rx="1" fill="#F59E0B"/>
      
      <!-- Top Cap -->
      <circle cx="8" cy="10" r="2.5" fill="#DC2626"/>
      <circle cx="8" cy="10" r="1.5" fill="#FBBF24"/>
      
      <!-- Side Outlets -->
      <rect x="2" y="12" width="4" height="2" rx="1" fill="#6B7280"/>
      <rect x="10" y="12" width="4" height="2" rx="1" fill="#6B7280"/>
      
      <!-- Outlet Caps -->
      <circle cx="4" cy="13" r="1" fill="#374151"/>
      <circle cx="12" cy="13" r="1" fill="#374151"/>
      
      <!-- Chain -->
      <rect x="3.5" y="11" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="3.5" y="12.5" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="11.5" y="11" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="11.5" y="12.5" width="0.5" height="1" fill="#9CA3AF"/>
      
      <!-- Base -->
      <rect x="5" y="18" width="6" height="2" rx="1" fill="#6B7280"/>
      
      <!-- Operating Nut -->
      <polygon points="8,8 9,9 8,10 7,9" fill="#374151"/>
      
      <!-- Reflective Markers -->
      <rect x="6.5" y="11" width="3" height="0.5" fill="white"/>
      <rect x="6.5" y="15" width="3" height="0.5" fill="white"/>
      
      <!-- Flow Rating -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">1500</text>
    </svg>`,"small","#F59E0B"),Y("helipad","Helipad","facilities",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Landing Circle -->
      <circle cx="14" cy="14" r="13" fill="#1E40AF"/>
      <circle cx="14" cy="14" r="11" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="9" fill="none" stroke="white" stroke-width="1"/>
      
      <!-- Landing H -->
      <rect x="9" y="9" width="2" height="10" fill="white"/>
      <rect x="17" y="9" width="2" height="10" fill="white"/>
      <rect x="11" y="13" width="6" height="2" fill="white"/>
      
      <!-- Corner Markers -->
      <rect x="2" y="2" width="3" height="1" fill="white"/>
      <rect x="2" y="2" width="1" height="3" fill="white"/>
      
      <rect x="23" y="2" width="3" height="1" fill="white"/>
      <rect x="25" y="2" width="1" height="3" fill="white"/>
      
      <rect x="2" y="25" width="3" height="1" fill="white"/>
      <rect x="2" y="23" width="1" height="3" fill="white"/>
      
      <rect x="23" y="25" width="3" height="1" fill="white"/>
      <rect x="25" y="23" width="1" height="3" fill="white"/>
      
      <!-- Wind Direction -->
      <polygon points="14,4 15,6 14,7 13,6" fill="white"/>
      <text x="14" y="3" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">N</text>
    </svg>`,"large","#1E40AF")],fi={"fire-apparatus":Uo,"ems-units":Ho,"incident-types":Vo,facilities:Yo,prevention:[Y("fire-extinguisher","Fire Extinguisher","prevention",`<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Cylinder Body -->
        <rect x="5" y="8" width="6" height="14" rx="1" fill="#DC2626"/>
        
        <!-- Pressure Gauge -->
        <circle cx="8" cy="6" r="2" fill="#374151"/>
        <circle cx="8" cy="6" r="1.5" fill="#22C55E"/>
        
        <!-- Handle/Lever -->
        <rect x="3" y="7" width="4" height="1.5" rx="0.5" fill="#6B7280"/>
        
        <!-- Hose -->
        <path d="M3 8 Q1 10 2 12" stroke="#1F2937" stroke-width="1" fill="none"/>
        
        <!-- Nozzle -->
        <rect x="1" y="11" width="2" height="1" fill="#374151"/>
        
        <!-- Label -->
        <rect x="6" y="10" width="4" height="3" fill="white"/>
        <text x="8" y="12" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">ABC</text>
        
        <!-- Pin -->
        <rect x="3.5" y="6.5" width="1" height="1" fill="#FBBF24"/>
        <circle cx="4" cy="6" r="0.5" fill="#F59E0B"/>
        
        <!-- Base -->
        <rect x="4" y="22" width="8" height="2" rx="1" fill="#6B7280"/>
      </svg>`,"small","#DC2626"),Y("smoke-detector","Smoke Detector","prevention",`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Detector Base -->
        <circle cx="10" cy="10" r="9" fill="white" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Test Button -->
        <circle cx="10" cy="10" r="3" fill="#DC2626"/>
        <circle cx="10" cy="10" r="2" fill="#EF4444"/>
        
        <!-- LED Indicator -->
        <circle cx="6" cy="6" r="1" fill="#22C55E"/>
        
        <!-- Vents -->
        <path d="M 4 8 Q 6 6 8 8" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 12 8 Q 14 6 16 8" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 4 12 Q 6 14 8 12" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 12 12 Q 14 14 16 12" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        
        <!-- Brand Label -->
        <text x="10" y="16" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="2">SMOKE</text>
        
        <!-- Mounting Bracket -->
        <rect x="9" y="1" width="2" height="2" fill="#9CA3AF"/>
      </svg>`,"small","#6B7280"),Y("sprinkler-system","Sprinkler System","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Main Pipe -->
        <rect x="0" y="7" width="24" height="2" fill="#6B7280"/>
        
        <!-- Sprinkler Heads -->
        <circle cx="4" cy="8" r="2" fill="#DC2626"/>
        <circle cx="12" cy="8" r="2" fill="#DC2626"/>
        <circle cx="20" cy="8" r="2" fill="#DC2626"/>
        
        <!-- Deflectors -->
        <rect x="2" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        <rect x="10" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        <rect x="18" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        
        <!-- Water Spray Pattern -->
        <path d="M 4 10 Q 2 12 1 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 4 10 Q 4 12 4 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 4 10 Q 6 12 7 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <path d="M 12 10 Q 10 12 9 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 12 10 Q 12 12 12 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 12 10 Q 14 12 15 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <path d="M 20 10 Q 18 12 17 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 20 10 Q 20 12 20 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 20 10 Q 22 12 23 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <!-- Control Valve -->
        <rect x="22" y="6" width="2" height="4" fill="#F59E0B"/>
        <circle cx="23" cy="8" r="0.5" fill="#DC2626"/>
      </svg>`,"medium","#DC2626"),Y("exit-sign","Exit Sign","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Sign Background -->
        <rect x="2" y="4" width="20" height="8" rx="1" fill="#22C55E"/>
        
        <!-- Inner Frame -->
        <rect x="3" y="5" width="18" height="6" rx="0.5" fill="#DCFCE7"/>
        
        <!-- EXIT Text -->
        <text x="12" y="9" text-anchor="middle" fill="#15803D" font-family="Arial" font-size="4" font-weight="bold">EXIT</text>
        
        <!-- Arrow -->
        <polygon points="18,8 20,8.5 18,9" fill="#15803D"/>
        
        <!-- Emergency Lighting -->
        <circle cx="4" cy="2" r="1" fill="#FBBF24"/>
        <circle cx="20" cy="2" r="1" fill="#FBBF24"/>
        
        <!-- Mounting Bracket -->
        <rect x="11" y="12" width="2" height="2" fill="#6B7280"/>
        
        <!-- Power Indicator -->
        <circle cx="21" cy="5" r="0.5" fill="#22C55E"/>
      </svg>`,"medium","#22C55E"),Y("emergency-phone","Emergency Phone","prevention",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Phone Box -->
        <rect x="2" y="2" width="12" height="16" rx="1" fill="#DC2626"/>
        
        <!-- Display Window -->
        <rect x="3" y="4" width="10" height="3" fill="white"/>
        <text x="8" y="6" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">EMERGENCY</text>
        
        <!-- Handset Cradle -->
        <rect x="4" y="8" width="8" height="2" fill="#374151"/>
        
        <!-- Handset -->
        <rect x="5" y="8.5" width="6" height="1" rx="0.5" fill="#1F2937"/>
        
        <!-- Keypad -->
        <circle cx="6" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="10" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="6" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="10" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="16" r="0.8" fill="#F3F4F6"/>
        
        <!-- Direct Connect Label -->
        <rect x="3" y="17" width="10" height="1" fill="#FBBF24"/>
        
        <!-- Mounting -->
        <rect x="0" y="8" width="2" height="4" fill="#6B7280"/>
        <rect x="14" y="8" width="2" height="4" fill="#6B7280"/>
      </svg>`,"small","#DC2626"),Y("fire-alarm-panel","Fire Alarm Panel","prevention",`<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Panel Cabinet -->
        <rect x="2" y="2" width="16" height="20" rx="1" fill="#F3F4F6" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Display Header -->
        <rect x="3" y="3" width="14" height="3" fill="#DC2626"/>
        <text x="10" y="5" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">FIRE ALARM</text>
        
        <!-- Status LEDs -->
        <circle cx="5" cy="8" r="0.8" fill="#22C55E"/>
        <circle cx="8" cy="8" r="0.8" fill="#FBBF24"/>
        <circle cx="11" cy="8" r="0.8" fill="#DC2626"/>
        <circle cx="14" cy="8" r="0.8" fill="#6B7280"/>
        
        <!-- Zone Indicators -->
        <rect x="4" y="10" width="3" height="1" fill="#22C55E"/>
        <rect x="8" y="10" width="3" height="1" fill="#22C55E"/>
        <rect x="12" y="10" width="3" height="1" fill="#22C55E"/>
        
        <rect x="4" y="12" width="3" height="1" fill="#22C55E"/>
        <rect x="8" y="12" width="3" height="1" fill="#FBBF24"/>
        <rect x="12" y="12" width="3" height="1" fill="#22C55E"/>
        
        <!-- Control Buttons -->
        <rect x="4" y="15" width="2" height="1" fill="#DC2626"/>
        <rect x="7" y="15" width="2" height="1" fill="#FBBF24"/>
        <rect x="10" y="15" width="2" height="1" fill="#6B7280"/>
        <rect x="13" y="15" width="2" height="1" fill="#22C55E"/>
        
        <!-- Digital Display -->
        <rect x="4" y="17" width="11" height="2" fill="#000000"/>
        <text x="9.5" y="18.5" text-anchor="middle" fill="#22C55E" font-family="Arial" font-size="1.5">NORMAL</text>
        
        <!-- Key Switch -->
        <circle cx="16" cy="18" r="1" fill="#FBBF24"/>
        
        <!-- Backup Battery Indicator -->
        <rect x="4" y="20" width="4" height="1" fill="#22C55E"/>
        <text x="6" y="20.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1">BATT OK</text>
      </svg>`,"medium","#DC2626")],"energy-systems":[Y("power-lines","Power Lines","energy-systems",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Transmission Towers -->
        <rect x="2" y="4" width="1" height="16" fill="#6B7280"/>
        <rect x="13" y="2" width="1" height="18" fill="#6B7280"/>
        <rect x="25" y="4" width="1" height="16" fill="#6B7280"/>
        
        <!-- Tower Cross Arms -->
        <rect x="0" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="0" y="8" width="5" height="0.5" fill="#374151"/>
        <rect x="0" y="10" width="5" height="0.5" fill="#374151"/>
        
        <rect x="11" y="4" width="5" height="0.5" fill="#374151"/>
        <rect x="11" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="11" y="8" width="5" height="0.5" fill="#374151"/>
        
        <rect x="23" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="23" y="8" width="5" height="0.5" fill="#374151"/>
        <rect x="23" y="10" width="5" height="0.5" fill="#374151"/>
        
        <!-- Power Lines (sagging cables) -->
        <path d="M 3 7 Q 8 9 13 7" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 3 9 Q 8 11 13 9" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 3 11 Q 8 13 13 11" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        
        <path d="M 14 5 Q 19 7 25 5" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 14 7 Q 19 9 25 7" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 14 9 Q 19 11 25 9" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        
        <!-- Insulators -->
        <rect x="2.5" y="6.5" width="0.5" height="1" fill="#93C5FD"/>
        <rect x="13.5" y="4.5" width="0.5" height="1" fill="#93C5FD"/>
        <rect x="25.5" y="6.5" width="0.5" height="1" fill="#93C5FD"/>
        
        <!-- Danger Signs -->
        <polygon points="2,4 3,3 3,4" fill="#DC2626"/>
        <polygon points="13,2 14,1 14,2" fill="#DC2626"/>
        <polygon points="25,4 26,3 26,4" fill="#DC2626"/>
        
        <!-- High Voltage Warning -->
        <rect x="6" y="22" width="8" height="2" fill="#FBBF24"/>
        <text x="10" y="23.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5" font-weight="bold">⚡ HIGH VOLTAGE</text>
      </svg>`,"large","#1F2937"),Y("gas-lines","Gas Lines","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Underground Pipeline -->
        <rect x="0" y="12" width="28" height="3" fill="#FBBF24"/>
        
        <!-- Pipeline Markers -->
        <rect x="4" y="8" width="1" height="8" fill="#6B7280"/>
        <rect x="12" y="6" width="1" height="10" fill="#6B7280"/>
        <rect x="20" y="8" width="1" height="8" fill="#6B7280"/>
        
        <!-- Meter Stations -->
        <rect x="3" y="6" width="3" height="3" fill="#F59E0B"/>
        <rect x="11" y="4" width="3" height="3" fill="#F59E0B"/>
        <rect x="19" y="6" width="3" height="3" fill="#F59E0B"/>
        
        <!-- Shut-off Valves -->
        <circle cx="4.5" cy="7.5" r="0.8" fill="#DC2626"/>
        <circle cx="12.5" cy="5.5" r="0.8" fill="#DC2626"/>
        <circle cx="20.5" cy="7.5" r="0.8" fill="#DC2626"/>
        
        <!-- Flow Direction -->
        <polygon points="26,13 28,13.5 26,14" fill="#F59E0B"/>
        
        <!-- Gas Leak Detection -->
        <circle cx="8" cy="10" r="1" fill="#FBBF24" fill-opacity="0.5"/>
        <circle cx="16" cy="8" r="1" fill="#FBBF24" fill-opacity="0.5"/>
        
        <!-- Pressure Monitoring -->
        <rect x="24" y="10" width="2" height="2" fill="#22C55E"/>
        <circle cx="25" cy="11" r="0.5" fill="white"/>
        
        <!-- Warning Labels -->
        <rect x="2" y="16" width="6" height="2" fill="#DC2626"/>
        <text x="5" y="17.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">GAS</text>
        
        <rect x="18" y="16" width="8" height="2" fill="#DC2626"/>
        <text x="22" y="17.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.2" font-weight="bold">DANGER</text>
        
        <!-- Call Before You Dig -->
        <rect x="10" y="18" width="8" height="1" fill="#FBBF24"/>
        <text x="14" y="18.7" text-anchor="middle" fill="black" font-family="Arial" font-size="1">CALL 811</text>
      </svg>`,"large","#FBBF24"),Y("solar-panels","Solar Panels","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Solar Panel Array -->
        <rect x="2" y="8" width="24" height="10" rx="1" fill="#1E40AF"/>
        
        <!-- Individual Panel Cells -->
        <rect x="3" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="9" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="15" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="21" y="9" width="4" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        
        <rect x="3" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="9" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="15" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="21" y="13" width="4" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        
        <!-- Sun -->
        <circle cx="6" cy="4" r="2" fill="#FBBF24"/>
        
        <!-- Sun Rays -->
        <rect x="5.7" y="1" width="0.6" height="2" fill="#F59E0B"/>
        <rect x="8" y="2" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(45 8.7 2.3)"/>
        <rect x="8" y="5.4" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(-45 8.7 5.7)"/>
        <rect x="3.6" y="5.4" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(45 4.3 5.7)"/>
        <rect x="3.6" y="2" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(-45 4.3 2.3)"/>
        
        <!-- Power Inverter -->
        <rect x="23" y="4" width="4" height="3" fill="#6B7280"/>
        <rect x="24" y="5" width="2" height="1" fill="#22C55E"/>
        
        <!-- Power Output Meter -->
        <circle cx="25" cy="2" r="1" fill="#22C55E"/>
        <text x="25" y="2.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">kW</text>
        
        <!-- Electrical Connections -->
        <rect x="26" y="7" width="1" height="3" fill="#F59E0B"/>
        <rect x="25" y="10" width="3" height="1" fill="#F59E0B"/>
        
        <!-- Tilt Frame -->
        <polygon points="2,18 26,18 28,16 4,16" fill="#9CA3AF"/>
        
        <!-- Ground Mounting -->
        <rect x="6" y="18" width="2" height="2" fill="#6B7280"/>
        <rect x="20" y="18" width="2" height="2" fill="#6B7280"/>
      </svg>`,"large","#1E40AF"),Y("transformer","Transformer","energy-systems",`<svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Transformer Tank -->
        <rect x="4" y="8" width="16" height="12" rx="1" fill="#6B7280"/>
        
        <!-- Cooling Fins -->
        <rect x="2" y="10" width="1" height="8" fill="#9CA3AF"/>
        <rect x="21" y="10" width="1" height="8" fill="#9CA3AF"/>
        <rect x="2" y="12" width="1" height="4" fill="#9CA3AF"/>
        <rect x="21" y="12" width="1" height="4" fill="#9CA3AF"/>
        
        <!-- High Voltage Bushings -->
        <circle cx="8" cy="6" r="1.5" fill="#F59E0B"/>
        <circle cx="12" cy="4" r="1.5" fill="#F59E0B"/>
        <circle cx="16" cy="6" r="1.5" fill="#F59E0B"/>
        
        <!-- Low Voltage Bushings -->
        <rect x="6" y="20" width="2" height="4" fill="#374151"/>
        <rect x="11" y="20" width="2" height="4" fill="#374151"/>
        <rect x="16" y="20" width="2" height="4" fill="#374151"/>
        
        <!-- Power Rating Nameplate -->
        <rect x="6" y="10" width="12" height="6" fill="white"/>
        <text x="12" y="12" text-anchor="middle" fill="black" font-family="Arial" font-size="2" font-weight="bold">500 kVA</text>
        <text x="12" y="14" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5">25kV/480V</text>
        <text x="12" y="15.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5">3-Phase</text>
        
        <!-- Danger Signs -->
        <polygon points="5,7 6,6 6,7" fill="#DC2626"/>
        <polygon points="18,7 19,6 19,7" fill="#DC2626"/>
        
        <!-- High Voltage Warning -->
        <rect x="2" y="24" width="8" height="2" fill="#DC2626"/>
        <text x="6" y="25.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">DANGER</text>
        
        <rect x="14" y="24" width="8" height="2" fill="#DC2626"/>
        <text x="18" y="25.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.2" font-weight="bold">HIGH VOLTAGE</text>
        
        <!-- Oil Level Gauge -->
        <circle cx="20" cy="12" r="1" fill="#FBBF24"/>
        <rect x="19.5" y="11" width="1" height="2" fill="#22C55E"/>
        
        <!-- Grounding -->
        <rect x="11" y="20" width="2" height="6" fill="#22C55E"/>
        <polygon points="11,26 13,26 12,28" fill="#22C55E"/>
        
        <!-- Protective Fence Indicator -->
        <rect x="0" y="26" width="24" height="1" fill="#F59E0B"/>
        <rect x="2" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="6" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="10" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="14" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="18" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="22" y="25" width="1" height="3" fill="#F59E0B"/>
      </svg>`,"large","#6B7280"),Y("electrical-panel","Electrical Panel","energy-systems",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Panel Cabinet -->
        <rect x="2" y="2" width="12" height="16" rx="1" fill="#F3F4F6" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Main Breaker -->
        <rect x="3" y="3" width="10" height="2" fill="#1F2937"/>
        <text x="8" y="4.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">MAIN 200A</text>
        
        <!-- Circuit Breakers (ON position) -->
        <rect x="4" y="6" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="6" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="6" width="2" height="1" fill="#22C55E"/>
        
        <rect x="4" y="8" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="8" width="2" height="1" fill="#DC2626"/> <!-- One tripped breaker -->
        <rect x="10" y="8" width="2" height="1" fill="#22C55E"/>
        
        <rect x="4" y="10" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="10" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="10" width="2" height="1" fill="#FBBF24"/> <!-- One testing -->
        
        <rect x="4" y="12" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="12" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="12" width="2" height="1" fill="#22C55E"/>
        
        <!-- Circuit Labels -->
        <text x="5" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">LIGHTS</text>
        <text x="8" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">OUTLETS</text>
        <text x="11" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">HVAC</text>
        
        <!-- Panel Schedule -->
        <rect x="3" y="15" width="10" height="2" fill="white"/>
        <text x="8" y="16.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1">PANEL A</text>
        
        <!-- Emergency Disconnect -->
        <circle cx="1" cy="4" r="0.8" fill="#DC2626"/>
        <text x="1" y="4.3" text-anchor="middle" fill="white" font-family="Arial" font-size="0.8" font-weight="bold">OFF</text>
        
        <!-- Electrical Hazard Symbol -->
        <polygon points="14,6 15,5 15,6" fill="#FBBF24"/>
        <text x="14.5" y="8" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">⚡</text>
      </svg>`,"medium","#6B7280"),Y("generator","Generator","energy-systems",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Generator Housing -->
        <rect x="2" y="8" width="28" height="12" rx="2" fill="#6B7280"/>
        
        <!-- Engine Cover -->
        <rect x="4" y="10" width="12" height="8" rx="1" fill="#9CA3AF"/>
        
        <!-- Control Panel -->
        <rect x="18" y="10" width="10" height="8" rx="1" fill="#374151"/>
        
        <!-- Engine Cooling Vents -->
        <rect x="5" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="7" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="9" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="11" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="13" y="11" width="1" height="6" fill="#6B7280"/>
        
        <!-- Control Panel Display -->
        <rect x="20" y="12" width="6" height="2" fill="#000000"/>
        <text x="23" y="13.5" text-anchor="middle" fill="#22C55E" font-family="Arial" font-size="1.5" font-weight="bold">AUTO</text>
        
        <!-- Start/Stop Button -->
        <circle cx="21" cy="16" r="1" fill="#22C55E"/>
        <text x="21" y="16.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">ON</text>
        
        <!-- Emergency Stop -->
        <rect x="24" y="15" width="2" height="2" fill="#DC2626"/>
        <text x="25" y="16.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">STOP</text>
        
        <!-- Power Output Connections -->
        <rect x="28" y="12" width="2" height="4" fill="#F59E0B"/>
        <circle cx="29" cy="13" r="0.5" fill="#DC2626"/>
        <circle cx="29" cy="15" r="0.5" fill="#DC2626"/>
        
        <!-- Fuel Tank -->
        <rect x="6" y="6" width="8" height="2" rx="1" fill="#1E40AF"/>
        <rect x="7" y="6.2" width="6" height="1.6" fill="#3B82F6"/>
        
        <!-- Exhaust Stack -->
        <rect x="14" y="4" width="2" height="6" fill="#6B7280"/>
        <circle cx="15" cy="4" r="1" fill="#374151"/>
        
        <!-- Exhaust Smoke -->
        <ellipse cx="13" cy="2" rx="2" ry="1" fill="#9CA3AF" fill-opacity="0.5"/>
        <ellipse cx="17" cy="1" rx="3" ry="1" fill="#9CA3AF" fill-opacity="0.4"/>
        
        <!-- Transfer Switch Indicator -->
        <rect x="2" y="4" width="4" height="2" fill="#FBBF24"/>
        <text x="4" y="5.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.2" font-weight="bold">ATS</text>
        
        <!-- Power Rating -->
        <text x="16" y="22" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">100kW</text>
        
        <!-- Ground Connection -->
        <rect x="15" y="20" width="2" height="4" fill="#22C55E"/>
        <polygon points="15,24 17,24 16,26" fill="#22C55E"/>
      </svg>`,"large","#6B7280")],custom:[]};Object.values(fi).flat();const Qo={"fire-apparatus":e.jsx(xo,{}),"ems-units":e.jsx(yo,{}),"incident-types":e.jsx(nl,{}),facilities:e.jsx(ao,{}),prevention:e.jsx(Eo,{}),"energy-systems":e.jsx(uo,{}),custom:e.jsx(ii,{})},_o=()=>{var c;const i=te(Ye),[t,r]=E.useState("fire-apparatus"),[l,o]=E.useState("medium"),[d,h]=E.useState("#DC2626"),[s,a]=E.useState(""),p=Object.keys(fi),n=(fi[t]||[]).filter(x=>x.name.toLowerCase().includes(s.toLowerCase())),g=i.filter(x=>x.type==="feature"),f=(x,m)=>{const B={...m,size:l,color:d};x.dataTransfer.setData("application/json",JSON.stringify(B)),x.dataTransfer.effectAllowed="copy";const A=x.currentTarget.cloneNode(!0);A.style.transform="scale(1.2)",A.style.opacity="0.8",document.body.appendChild(A),x.dataTransfer.setDragImage(A,16,16),setTimeout(()=>document.body.removeChild(A),0)},y=[{name:"Fire Red",value:"#DC2626"},{name:"EMS Blue",value:"#1E40AF"},{name:"Safety Green",value:"#059669"},{name:"Warning Orange",value:"#F59E0B"},{name:"Medical Cross",value:"#EF4444"},{name:"Industrial Gray",value:"#6B7280"},{name:"Hazmat Yellow",value:"#FCD34D"},{name:"Emergency Purple",value:"#7C3AED"}];return e.jsxs(k,{children:[e.jsxs(C,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ii,{}),"Professional Icons"]}),e.jsx(re,{fullWidth:!0,size:"small",placeholder:"Search fire & EMS icons...",value:s,onChange:x=>a(x.target.value),InputProps:{startAdornment:e.jsx(rr,{position:"start",children:e.jsx(ol,{})})},sx:{mb:2}}),e.jsx(yi,{value:t,onChange:(x,m)=>r(m),variant:"scrollable",scrollButtons:"auto",sx:{mb:2,minHeight:"auto"},children:p.map(x=>e.jsx(Et,{value:x,icon:Qo[x],label:x.replace("-"," "),sx:{minHeight:"auto",py:1,fontSize:"0.75rem",textTransform:"capitalize"}},x))}),e.jsxs(le,{sx:{p:2,mb:2,bgcolor:"grey.50"},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2,fontWeight:"bold"},children:"Icon Settings"}),e.jsxs(L,{container:!0,spacing:2,children:[e.jsx(L,{size:6,children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Size"}),e.jsxs(se,{value:l,label:"Size",onChange:x=>o(x.target.value),children:[e.jsx(M,{value:"small",children:"Small (20px)"}),e.jsx(M,{value:"medium",children:"Medium (32px)"}),e.jsx(M,{value:"large",children:"Large (48px)"}),e.jsx(M,{value:"extra-large",children:"Extra Large (64px)"})]})]})}),e.jsx(L,{size:6,children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Color Theme"}),e.jsx(se,{value:d,label:"Color Theme",onChange:x=>h(x.target.value),children:y.map(x=>e.jsx(M,{value:x.value,children:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(k,{sx:{width:16,height:16,backgroundColor:x.value,borderRadius:"50%",border:"1px solid #ccc"}}),x.name]})},x.value))})]})})]})]}),e.jsxs(k,{sx:{mb:2},children:[e.jsxs(k,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsxs(C,{variant:"subtitle2",sx:{fontWeight:"bold",textTransform:"uppercase"},children:[t.replace("-"," ")," (",n.length,")"]}),e.jsx(gt,{label:`${l} • ${(c=y.find(x=>x.value===d))==null?void 0:c.name}`,size:"small",color:"primary",variant:"outlined"})]}),n.length>0?e.jsx(L,{container:!0,spacing:1,children:n.map(x=>e.jsx(L,{size:4,children:e.jsx(Gt,{title:`${x.name} - Drag to map`,children:e.jsxs(le,{sx:{p:1,textAlign:"center",cursor:"grab",transition:"all 0.2s ease","&:hover":{bgcolor:"primary.light",transform:"scale(1.05)",boxShadow:2},"&:active":{cursor:"grabbing",transform:"scale(0.95)"}},draggable:!0,onDragStart:m=>f(m,x),children:[e.jsx(k,{component:"img",src:x.url,alt:x.name,sx:{width:l==="small"?20:l==="large"?40:32,height:l==="small"?20:l==="large"?40:32,mb:.5,filter:d!==x.color?`hue-rotate(${Zo(x.color,d)}deg)`:"none"}}),e.jsx(C,{variant:"caption",sx:{display:"block",fontSize:"0.65rem",lineHeight:1.2,fontWeight:500},children:x.name})]})})},x.id))}):e.jsx(k,{sx:{textAlign:"center",py:4},children:e.jsx(C,{variant:"body2",color:"text.secondary",children:s?"No icons match your search":"No icons in this category"})})]}),g.length===0&&e.jsxs(At,{severity:"info",sx:{mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:1},children:"Create a layer first"}),e.jsx(C,{variant:"caption",children:"Go to the Layers tab and create a feature layer to place icons on the map."})]}),e.jsxs(le,{sx:{p:2,bgcolor:"info.light",color:"info.contrastText"},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:1,fontWeight:"bold"},children:"How to Use"}),e.jsxs(k,{component:"ul",sx:{pl:2,m:0,"& li":{mb:.5}},children:[e.jsx("li",{children:"Select icon size and color above"}),e.jsx("li",{children:"Drag any icon from the library"}),e.jsx("li",{children:"Drop it on the map to place a marker"}),e.jsx("li",{children:"Click the marker to edit its properties"})]})]})]})};function Zo(i,t){const r={"#DC2626":0,"#EF4444":5,"#F59E0B":45,"#FCD34D":60,"#059669":120,"#1E40AF":240,"#7C3AED":270,"#6B7280":0},l=r[i]||0;return(r[t]||0)-l}const Xo=()=>{const i=xe(),t=()=>{i(Xi())};return e.jsxs(k,{children:[e.jsxs(C,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(xt,{}),"Export"]}),e.jsxs(le,{sx:{p:2},children:[e.jsx(C,{variant:"body2",color:"text.secondary",sx:{mb:2},children:"Generate professional maps with the new export system"}),e.jsx(Me,{variant:"contained",onClick:t,startIcon:e.jsx(xt,{}),fullWidth:!0,children:"Open Export Options"})]})]})},qo=()=>{const i=xe(),t=te(yt),r=o=>{i(Er(o))},l=(o,d)=>{i(Zi({[o]:d}))};return e.jsxs(k,{children:[e.jsxs(C,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(lr,{}),"Settings"]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Base Map"}),e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Base Map"}),e.jsx(se,{value:t.activeBaseMap,label:"Base Map",onChange:o=>r(o.target.value),children:t.baseMaps.map(o=>e.jsx(M,{value:o.id,children:o.name},o.id))})]})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Display Options"}),e.jsx(pe,{control:e.jsx(De,{checked:t.showCoordinates,onChange:o=>l("showCoordinates",o.target.checked),size:"small"}),label:"Show Coordinates",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.showGrid,onChange:o=>l("showGrid",o.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}})]}),e.jsxs(le,{sx:{p:2},children:[e.jsx(C,{variant:"subtitle2",sx:{mb:2},children:"Measurement Units"}),e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:t.measurementUnits,label:"Units",onChange:o=>l("measurementUnits",o.target.value),children:[e.jsx(M,{value:"metric",children:"Metric (m, km)"}),e.jsx(M,{value:"imperial",children:"Imperial (ft, mi)"})]})]})]})]})},Ko=({mode:i})=>{const t=xe(),r=te(gi),l=[{id:"layers",label:"Layers",icon:e.jsx(St,{}),component:Oo},{id:"drawing",label:"Drawing",icon:e.jsx(Qt,{}),component:Go,disabled:i==="view"},{id:"icons",label:"Icons",icon:e.jsx(ii,{}),component:_o,disabled:i==="view"},{id:"export",label:"Export",icon:e.jsx(xt,{}),component:Xo},{id:"settings",label:"Settings",icon:e.jsx(lr,{}),component:qo}],o=(s,a)=>{t(Sr(a))},h=(l.find(s=>s.id===r.activePanel)||l[0]).component;return e.jsxs(k,{sx:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx(le,{elevation:0,sx:{borderBottom:1,borderColor:"divider"},children:e.jsx(yi,{value:r.activePanel||"layers",onChange:o,variant:"scrollable",scrollButtons:"auto",orientation:"horizontal",sx:{minHeight:48,"& .MuiTab-root":{minWidth:60,minHeight:48}},children:l.map(s=>e.jsx(Et,{value:s.id,icon:s.icon,label:s.label,disabled:s.disabled,sx:{fontSize:"0.75rem","&.Mui-selected":{color:"primary.main"}}},s.id))})}),e.jsx(k,{sx:{flex:1,overflow:"auto",p:2},children:e.jsx(h,{})})]})},Jo=()=>{const i=xe(),t=()=>{i(Fr())};return e.jsxs(Zt,{open:!0,onClose:t,maxWidth:"md",fullWidth:!0,children:[e.jsx(_t,{sx:{textAlign:"center",pb:1},children:"Welcome to Fire Map Pro"}),e.jsxs(Xt,{children:[e.jsx(C,{variant:"h6",sx:{mb:2,textAlign:"center",color:"primary.main"},children:"Professional Mapping for Fire & EMS Operations"}),e.jsxs(C,{variant:"body1",paragraph:!0,children:[e.jsx("strong",{children:"Ready to use immediately:"})," Your map is pre-loaded with fire stations, hospitals, hydrants, and recent incidents to provide instant situational awareness."]}),e.jsx(C,{variant:"body1",paragraph:!0,children:e.jsx("strong",{children:"Key Features:"})}),e.jsxs(k,{component:"ul",sx:{pl:2,mb:2},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Live Data Layers:"})," Fire stations, hospitals, hydrants, response zones"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Drawing Tools:"})," Add markers, areas, and annotations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Icon Library:"})," Professional fire & EMS symbols"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Layer Controls:"})," Toggle visibility and adjust transparency"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Export Options:"})," Generate professional maps and reports"]})]}),e.jsx(C,{variant:"body2",color:"text.secondary",sx:{textAlign:"center"},children:"Click layers in the sidebar to explore your operational data →"})]}),e.jsx(qt,{sx:{justifyContent:"center",pb:3},children:e.jsx(Me,{onClick:t,variant:"contained",size:"large",children:"Start Mapping"})})]})};class en{static async exportMap(t,r,l){console.error("[EMERGENCY DEBUG] ExportService.exportMap() STARTED"),console.error("[EMERGENCY DEBUG] Configuration received:",r);const{basic:o}=r;try{if(console.error("[EMERGENCY DEBUG] Starting export process..."),l==null||l(10,"Preparing export..."),!t)throw new Error("Map element not found");switch(l==null||l(20,"Capturing map data..."),console.error("[EMERGENCY DEBUG] Routing to format:",o.format),o.format){case"png":case"jpg":case"tiff":case"webp":console.error("[EMERGENCY DEBUG] Calling exportRasterImage"),await this.exportRasterImage(t,r,l),console.error("[EMERGENCY DEBUG] exportRasterImage completed");break;case"pdf":await this.exportPDF(t,r,l);break;case"svg":await this.exportSVG(t,r,l);break;case"eps":await this.exportEPS(t,r,l);break;case"geojson":case"kml":case"geopdf":await this.exportGISFormat(t,r,l);break;default:throw new Error(`Export format ${o.format} not supported`)}l==null||l(100,"Export completed successfully")}catch(d){throw console.error("Export failed:",d),d}}static async exportRasterImage(t,r,l){console.error("[EMERGENCY DEBUG] exportRasterImage() STARTED");const{basic:o,layout:d}=r;console.error("[EMERGENCY DEBUG] Basic config:",o),console.error("[EMERGENCY DEBUG] Layout config:",d),l==null||l(30,"Capturing map screenshot..."),console.error("[EMERGENCY DEBUG] About to capture map with html2canvas"),console.error("[EMERGENCY DEBUG] Map element:",t),console.error("[EMERGENCY DEBUG] Map element dimensions:",{width:t.offsetWidth,height:t.offsetHeight,innerHTML:t.innerHTML.substring(0,200)+"..."});const{default:h}=await Si(async()=>{const{default:n}=await import("./html2canvas.esm-CBrSDip1.js");return{default:n}},[]),s=await h(t,{useCORS:!0,allowTaint:!0,scale:o.dpi/96,backgroundColor:"#ffffff"});console.error("[EMERGENCY DEBUG] html2canvas completed, canvas size:",{width:s.width,height:s.height}),console.error("[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout"),l==null||l(60,"Processing layout elements..."),console.log("[Export] Full export configuration:",{basic:r.basic,layout:{customLayout:d.customLayout,selectedTemplate:d.selectedTemplate,elementsCount:d.elements.length,elements:d.elements}});let a=s;if(d.customLayout&&(d.selectedTemplate||d.elements.length>0)){console.log("[Export] Applying custom layout with",d.elements.length,"elements"),console.error("[EMERGENCY DEBUG] About to call applyLayoutTemplate");try{a=await this.applyLayoutTemplate(s,r),console.error("[EMERGENCY DEBUG] applyLayoutTemplate completed successfully"),console.error("[EMERGENCY DEBUG] Returned final canvas dimensions:",a.width,"x",a.height),console.error("[EMERGENCY DEBUG] Layout template applied successfully")}catch(n){throw console.error("[EMERGENCY DEBUG] applyLayoutTemplate FAILED:",n),n}}else console.log("[Export] Using basic layout - no custom elements");l==null||l(80,"Generating final image...");const p=o.format==="jpg"?"jpeg":o.format,u=o.format==="jpg"?.9:void 0;console.error("[EMERGENCY DEBUG] Final canvas before conversion:",{canvasSize:{width:a.width,height:a.height},format:p,quality:u}),console.error("[EMERGENCY DEBUG] Ready to convert canvas to blob"),a.toBlob(n=>{console.error("[EMERGENCY DEBUG] toBlob callback executed, blob size:",n==null?void 0:n.size),n?(console.error("[EMERGENCY DEBUG] Downloading blob with filename:",`${o.title||"fire-map"}.${o.format}`),this.downloadBlob(n,`${o.title||"fire-map"}.${o.format}`)):console.error("[EMERGENCY DEBUG] toBlob failed - blob is null!")},`image/${p}`,u)}static async exportPDF(t,r,l){const{basic:o,advanced:d,layout:h}=r;l==null||l(30,"Capturing map for PDF...");const{default:s}=await Si(async()=>{const{default:c}=await import("./html2canvas.esm-CBrSDip1.js");return{default:c}},[]),a=await s(t,{useCORS:!0,allowTaint:!0,scale:o.dpi/96});l==null||l(50,"Creating PDF document...");const{width:p,height:u}=this.getPaperDimensions(o.paperSize,o.orientation),n=new Or({orientation:o.orientation,unit:"mm",format:o.paperSize==="custom"?[d.customWidth,d.customHeight]:o.paperSize});l==null||l(70,"Adding elements to PDF...");const g=a.toDataURL("image/png"),f=p-20,y=a.height*f/a.width;n.addImage(g,"PNG",10,10,f,y),o.includeTitle&&o.title&&(n.setFontSize(16),n.text(o.title,p/2,y+25,{align:"center"})),o.subtitle&&(n.setFontSize(12),n.text(o.subtitle,p/2,y+35,{align:"center"})),h.customLayout&&h.elements.length>0&&await this.addLayoutElementsToPDF(n,h.elements,{width:p,height:u}),l==null||l(90,"Finalizing PDF..."),n.save(`${o.title||"fire-map"}.pdf`)}static async exportSVG(t,r,l){throw l==null||l(50,"Generating SVG..."),new Error("SVG export is not yet implemented. Please use PNG or PDF format.")}static async exportEPS(t,r,l){throw new Error("EPS export is not yet implemented. Please use PNG or PDF format.")}static async exportGISFormat(t,r,l){throw new Error("GIS format export is not yet implemented. Please use PNG or PDF format.")}static async applyLayoutTemplate(t,r){console.error("[EMERGENCY DEBUG] applyLayoutTemplate ENTRY");const{basic:l,layout:o}=r;console.error("[EMERGENCY DEBUG] Getting paper dimensions for:",l.paperSize,l.orientation);const{width:d,height:h}=this.getPaperDimensions(l.paperSize,l.orientation);console.error("[EMERGENCY DEBUG] Paper dimensions:",{width:d,height:h});const s=document.createElement("canvas"),a=s.getContext("2d",{willReadFrequently:!0}),p=d/25.4*l.dpi,u=h/25.4*l.dpi;switch(s.width=p,s.height=u,console.error("[EMERGENCY DEBUG] Layout canvas dimensions:",s.width,"x",s.height),console.error("[EMERGENCY DEBUG] Map canvas dimensions:",t.width,"x",t.height),console.error("[EMERGENCY DEBUG] Layout canvas setup complete"),a.fillStyle="#ffffff",a.fillRect(0,0,p,u),console.error("[EMERGENCY DEBUG] Layout canvas created:",{pixelSize:{width:p,height:u},paperSize:{width:d,height:h},dpi:l.dpi,mapCanvasSize:{width:t.width,height:t.height}}),console.log("[Export] Applying layout template:",o.selectedTemplate),o.selectedTemplate){case"standard":console.log("[Export] Using standard template with custom layout"),await this.applyCustomLayout(a,t,r,p,u);break;case"professional":console.log("[Export] Using professional template"),await this.applyProfessionalTemplate(a,t,r,p,u);break;case"presentation":console.log("[Export] Using presentation template"),await this.applyPresentationTemplate(a,t,r,p,u);break;case"tactical":console.log("[Export] Using tactical template"),await this.applyTacticalTemplate(a,t,r,p,u);break;default:console.log("[Export] Using custom layout with elements"),await this.applyCustomLayout(a,t,r,p,u)}return console.error("[EMERGENCY DEBUG] Layout canvas complete - returning to caller"),s}static async applyProfessionalTemplate(t,r,l,o,d){console.log("[Export] Professional template using custom layout logic"),await this.applyCustomLayout(t,r,l,o,d)}static async applyPresentationTemplate(t,r,l,o,d){console.log("[Export] Presentation template using custom layout logic"),await this.applyCustomLayout(t,r,l,o,d)}static async applyTacticalTemplate(t,r,l,o,d){console.log("[Export] Tactical template using custom layout logic"),await this.applyCustomLayout(t,r,l,o,d)}static async applyCustomLayout(t,r,l,o,d){var p,u,n,g,f,y,c,x,m,B,A,j,S,W,w,D,U,ie,de,Z,O,$,we,K,be,T,X,fe,Q,_,Se,ye,Be,ze,Qe,Ie,Le,$e,Ne,Fe,ge;console.error("[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT"),console.error("[EMERGENCY DEBUG] Canvas size:",{width:o,height:d});const{layout:h,basic:s}=l;console.error("[EMERGENCY DEBUG] Configuration received:",{layout:h,basic:s}),console.log("[Export] Layout data:",{elementsCount:h.elements.length,elements:h.elements.map(b=>({type:b.type,visible:b.visible,id:b.id}))});const a=[...h.elements].sort((b,N)=>b.zIndex-N.zIndex);console.log("[Export] Processing",a.length,"layout elements:",a.map(b=>({type:b.type,visible:b.visible})));for(const b of a){if(console.log("[Export] Processing element:",{type:b.type,visible:b.visible,position:{x:b.x,y:b.y},size:{width:b.width,height:b.height},content:b.content}),!b.visible){console.log("[Export] Skipping invisible element:",b.type);continue}const N=b.x/100*o,G=b.y/100*d,z=b.width/100*o,H=b.height/100*d;switch(console.error("[CANVAS DEBUG] Element",b.type,"position:",{x:N,y:G,w:z,h:H},"Canvas:",{width:o,height:d}),console.log("[Export] Rendering element:",b.type,"at",{x:N,y:G,w:z,h:H}),b.type){case"map":console.error("[EMERGENCY DEBUG] Drawing map canvas:",{mapCanvasSize:{width:r.width,height:r.height},drawPosition:{x:N,y:G,w:z,h:H},layoutCanvasSize:{width:t.canvas.width,height:t.canvas.height},elementPosition:{x:b.x,y:b.y,width:b.width,height:b.height}}),console.error("[EMERGENCY DEBUG] Drawing map canvas to layout"),t.drawImage(r,N,G,z,H),console.error("[EMERGENCY DEBUG] Map canvas drawn to layout canvas");break;case"title":console.log("[Export] Title element debug:",{elementContent:b.content,textAlign:(p=b.content)==null?void 0:p.textAlign,elementType:b.type}),t.fillStyle=((u=b.content)==null?void 0:u.color)||"#333333";const rt=((n=b.content)==null?void 0:n.fontSize)||Math.max(16,z*.05),dt=((g=b.content)==null?void 0:g.fontWeight)||"bold";t.font=`${dt} ${rt}px ${((f=b.content)==null?void 0:f.fontFamily)||"Arial"}`,t.textAlign=((y=b.content)==null?void 0:y.textAlign)||"left",console.log("[Export] Title canvas textAlign set to:",t.textAlign);let Ge=N;t.textAlign==="center"?Ge=N+z/2:t.textAlign==="right"&&(Ge=N+z),console.log("[Export] Title position:",{originalX:N,adjustedX:Ge,width:z,alignment:t.textAlign}),t.fillText(((c=b.content)==null?void 0:c.text)||s.title||"Untitled Map",Ge,G+rt);break;case"subtitle":console.log("[Export] Rendering subtitle:",{elementContent:b.content,basicSubtitle:s.subtitle,finalText:((x=b.content)==null?void 0:x.text)||s.subtitle||"Map Subtitle"}),t.fillStyle=((m=b.content)==null?void 0:m.color)||"#666666";const _e=((B=b.content)==null?void 0:B.fontSize)||Math.max(12,z*.04),Ze=((A=b.content)==null?void 0:A.fontWeight)||"normal";t.font=`${Ze} ${_e}px ${((j=b.content)==null?void 0:j.fontFamily)||"Arial"}`,t.textAlign=((S=b.content)==null?void 0:S.textAlign)||"left";const lt=((W=b.content)==null?void 0:W.text)||s.subtitle||"Map Subtitle";let v=N;t.textAlign==="center"?v=N+z/2:t.textAlign==="right"&&(v=N+z),console.log("[Export] Drawing subtitle text:",lt,"at position:",{x:v,y:G+_e}),console.log("[Export] Subtitle canvas state:",{fillStyle:t.fillStyle,font:t.font,textAlign:t.textAlign,canvasSize:{width:t.canvas.width,height:t.canvas.height},elementBounds:{x:N,y:G,w:z,h:H}}),t.fillText(lt,v,G+_e);break;case"text":t.fillStyle=((w=b.content)==null?void 0:w.color)||"#333333";const F=((D=b.content)==null?void 0:D.fontSize)||Math.max(12,z*.03),I=((U=b.content)==null?void 0:U.fontWeight)||"normal";t.font=`${I} ${F}px ${((ie=b.content)==null?void 0:ie.fontFamily)||"Arial"}`,t.textAlign=((de=b.content)==null?void 0:de.textAlign)||"left";const J=(((Z=b.content)==null?void 0:Z.text)||"").split(`
`),R=F*1.2;J.forEach((ke,Ee)=>{t.fillText(ke,N,G+F+Ee*R)});break;case"legend":t.strokeStyle=((O=b.content)==null?void 0:O.borderColor)||"#cccccc",t.fillStyle=(($=b.content)==null?void 0:$.backgroundColor)||"#ffffff",t.fillRect(N,G,z,H),b.showLegendBorder!==!1&&t.strokeRect(N,G,z,H),t.fillStyle=((we=b.content)==null?void 0:we.color)||"#333333";const ce=((K=b.content)==null?void 0:K.fontSize)||Math.max(12,z*.04),me=((be=b.content)==null?void 0:be.fontWeight)||"bold";t.font=`${me} ${ce}px ${((T=b.content)==null?void 0:T.fontFamily)||"Arial"}`,t.textAlign=((X=b.content)==null?void 0:X.textAlign)||"left";const he=b.legendTitle||((fe=b.content)==null?void 0:fe.text)||"Legend";t.fillText(he,N+10,G+ce+5);const ve=b.legendStyle||"standard",Xe=G+ce+20,ri=16,mt=18;ve==="detailed"?[{color:"#ff4444",label:"Fire Stations"},{color:"#4444ff",label:"Hydrants"},{color:"#44ff44",label:"EMS Units"},{color:"#ffaa44",label:"Incidents"}].forEach((Ee,pt)=>{const ft=Xe+pt*mt;ft+ri<G+H-10&&(t.fillStyle=Ee.color,t.fillRect(N+10,ft,12,12),t.strokeStyle="#333",t.strokeRect(N+10,ft,12,12),t.fillStyle="#333333",t.font=`${Math.max(10,z*.025)}px Arial`,t.fillText(Ee.label,N+28,ft+10))}):ve==="compact"&&(t.fillStyle="#333333",t.font=`${Math.max(9,z*.02)}px Arial`,t.fillText("Map elements and symbols",N+10,Xe));break;case"north-arrow":const wt=b.arrowStyle||"classic",ht=b.rotation||0,Oe=((Q=b.content)==null?void 0:Q.color)||"#333333";console.log("[Export] Rendering north arrow:",{arrowStyle:wt,rotation:ht,arrowColor:Oe,elementProperties:b,position:{x:N,y:G,w:z,h:H}}),t.strokeStyle=Oe,t.fillStyle=Oe,t.lineWidth=2;const bt=N+z/2,oe=G+H/2,P=Math.min(z,H)*.3;switch(t.save(),t.translate(bt,oe),t.rotate(ht*Math.PI/180),wt){case"classic":t.beginPath(),t.moveTo(0,-P),t.lineTo(-P/3,P/3),t.lineTo(0,0),t.lineTo(P/3,P/3),t.closePath(),t.fill(),t.beginPath(),t.moveTo(0,0),t.lineTo(0,P),t.stroke();break;case"modern":t.beginPath(),t.moveTo(0,-P),t.lineTo(-P/4,P/4),t.lineTo(0,P/8),t.lineTo(P/4,P/4),t.closePath(),t.fill();break;case"simple":t.beginPath(),t.moveTo(0,-P),t.lineTo(-P/2,P/2),t.lineTo(P/2,P/2),t.closePath(),t.fill();break;case"compass":t.fillStyle="#cc0000",t.beginPath(),t.moveTo(0,-P),t.lineTo(-P/4,0),t.lineTo(P/4,0),t.closePath(),t.fill(),t.fillStyle="#ffffff",t.strokeStyle=Oe,t.beginPath(),t.moveTo(0,P),t.lineTo(-P/4,0),t.lineTo(P/4,0),t.closePath(),t.fill(),t.stroke(),t.fillStyle=Oe,t.beginPath(),t.moveTo(-P*.7,0),t.lineTo(0,-P/4),t.lineTo(0,P/4),t.closePath(),t.fill(),t.beginPath(),t.moveTo(P*.7,0),t.lineTo(0,-P/4),t.lineTo(0,P/4),t.closePath(),t.fill();break}t.restore(),console.log("[Export] North arrow rendered, adding label"),wt!=="compass"&&(t.fillStyle=Oe,t.font=`bold ${Math.max(10,P*.6)}px Arial`,t.textAlign="center",t.fillText("N",bt,oe+P+15),console.log('[Export] North arrow "N" label drawn at:',{x:bt,y:oe+P+15}));break;case"scale-bar":const vt=b.units||"feet",ot=b.scaleStyle||"bar",je=b.divisions||4,cr=((_=l.mapView)==null?void 0:_.center)||{latitude:40},dr=((Se=l.mapView)==null?void 0:Se.zoom)||10,hr=this.calculateMetersPerPixel(dr,cr.latitude),mi=this.getScaleBarInfo(hr,vt,z*.8);t.strokeStyle=((ye=b.content)==null?void 0:ye.color)||"#333333",t.fillStyle=((Be=b.content)==null?void 0:Be.color)||"#333333",t.lineWidth=2;const Ue=G+H/2,nt=mi.pixelLength,at=N+(z-nt)/2;if(ot==="alternating"){const ke=nt/je;for(let Ee=0;Ee<je;Ee++){const pt=at+Ee*ke;t.fillStyle=Ee%2===0?"#333333":"#ffffff",t.fillRect(pt,Ue-3,ke,6),t.strokeStyle="#333333",t.strokeRect(pt,Ue-3,ke,6)}}else{ot==="bar"&&(t.fillStyle="#ffffff",t.fillRect(at,Ue-3,nt,6),t.strokeRect(at,Ue-3,nt,6)),t.strokeStyle=((ze=b.content)==null?void 0:ze.color)||"#333333",t.beginPath(),t.moveTo(at,Ue),t.lineTo(at+nt,Ue),t.stroke(),t.beginPath();for(let ke=0;ke<=je;ke++){const Ee=at+ke*nt/je;t.moveTo(Ee,Ue-5),t.lineTo(Ee,Ue+5)}t.stroke()}t.fillStyle=((Qe=b.content)==null?void 0:Qe.color)||"#333333",t.font=`${Math.max(10,H*.3)}px Arial`,t.textAlign="center",t.fillText(mi.label,at+nt/2,Ue+20);break;case"image":if((Ie=b.content)!=null&&Ie.imageSrc){const ke=((Le=b.content)==null?void 0:Le.imageFit)||"cover";await this.drawImageFromSrc(t,b.content.imageSrc,N,G,z,H,ke)}else t.strokeStyle="#cccccc",t.fillStyle="#f5f5f5",t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H),t.fillStyle="#999999",t.font=`${Math.max(12,z*.05)}px Arial`,t.textAlign="center",t.fillText("Image",N+z/2,G+H/2);break;case"shape":const wi=b.strokeColor||(($e=b.content)==null?void 0:$e.borderColor)||"#333333",st=b.fillColor||((Ne=b.content)==null?void 0:Ne.backgroundColor)||"transparent",bi=b.strokeWidth||((Fe=b.content)==null?void 0:Fe.borderWidth)||1,vi=b.shapeType||((ge=b.content)==null?void 0:ge.shapeType)||"rectangle";switch(console.log("[Export] Rendering shape:",{shapeType:vi,shapeStrokeColor:wi,shapeFillColor:st,shapeStrokeWidth:bi,elementProperties:b,position:{x:N,y:G,w:z,h:H}}),t.strokeStyle=wi,t.fillStyle=st,t.lineWidth=bi,vi){case"rectangle":st!=="transparent"&&t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H);break;case"circle":const ke=Math.min(z,H)/2,Ee=N+z/2,pt=G+H/2;t.beginPath(),t.arc(Ee,pt,ke,0,2*Math.PI),st!=="transparent"&&t.fill(),t.stroke();break;case"ellipse":const ft=N+z/2,pr=G+H/2,fr=z/2,ur=H/2;t.beginPath(),t.ellipse(ft,pr,fr,ur,0,0,2*Math.PI),st!=="transparent"&&t.fill(),t.stroke();break;case"triangle":const gr=N+z/2,xr=G,Ci=G+H;t.beginPath(),t.moveTo(gr,xr),t.lineTo(N,Ci),t.lineTo(N+z,Ci),t.closePath(),st!=="transparent"&&t.fill(),t.stroke();break;case"line":t.beginPath(),t.moveTo(N,G+H/2),t.lineTo(N+z,G+H/2),t.stroke();break;default:st!=="transparent"&&t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H);break}break;default:console.warn("[Export] Unknown element type:",b.type);break}console.error("[EMERGENCY DEBUG] Element rendered successfully:",b.type),console.log("[Export] Finished rendering element:",b.type)}console.log("[Export] Completed rendering all",a.length,"elements")}static async addLayoutElementsToPDF(t,r,l){var o,d;for(const h of r)switch(h.type){case"text":t.text(((o=h.content)==null?void 0:o.text)||"",h.x,h.y);break;case"image":(d=h.content)!=null&&d.imageSrc&&t.addImage(h.content.imageSrc,"PNG",h.x,h.y,h.width,h.height);break}}static async drawImageFromSrc(t,r,l,o,d,h,s="cover"){try{let a;r instanceof File?a=URL.createObjectURL(r):a=r;const p=new Image;return p.crossOrigin="anonymous",new Promise(u=>{p.onload=()=>{let n=l,g=o,f=d,y=h;const c=p.width/p.height,x=d/h;switch(s){case"contain":c>x?(y=d/c,g=o+(h-y)/2):(f=h*c,n=l+(d-f)/2);break;case"cover":c>x?(f=h*c,n=l-(f-d)/2):(y=d/c,g=o-(y-h)/2);break;case"fill":break;case"scale-down":p.width>d||p.height>h?c>x?(y=d/c,g=o+(h-y)/2):(f=h*c,n=l+(d-f)/2):(f=p.width,y=p.height,n=l+(d-f)/2,g=o+(h-y)/2);break}s==="cover"?(t.save(),t.beginPath(),t.rect(l,o,d,h),t.clip(),t.drawImage(p,n,g,f,y),t.restore()):t.drawImage(p,n,g,f,y),r instanceof File&&URL.revokeObjectURL(a),u()},p.onerror=()=>{console.warn("[Export] Failed to load image:",a),t.strokeStyle="#ccc",t.fillStyle="#f5f5f5",t.fillRect(l,o,d,h),t.strokeRect(l,o,d,h),t.fillStyle="#999",t.font="12px Arial",t.textAlign="center",t.fillText("Failed to load",l+d/2,o+h/2-6),t.fillText("image",l+d/2,o+h/2+6),r instanceof File&&URL.revokeObjectURL(a),u()},p.src=a})}catch(a){console.error("[Export] Error drawing image:",a)}}static getPaperDimensions(t,r){let l,o;switch(t){case"letter":l=215.9,o=279.4;break;case"a4":l=210,o=297;break;case"legal":l=215.9,o=355.6;break;case"tabloid":l=279.4,o=431.8;break;default:l=215.9,o=279.4}return r==="landscape"&&([l,o]=[o,l]),{width:l,height:o}}static calculateMetersPerPixel(t,r){const h=40075017/(256*Math.pow(2,t)),s=r*Math.PI/180;return h*Math.cos(s)}static getScaleBarInfo(t,r,l){const o=t*l;let d,h,s;switch(r){case"feet":s=3.28084,h="ft",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break;case"miles":s=621371e-9,h="mi",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"kilometers":s=.001,h="km",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"meters":default:s=1,h="m",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break}const a=o*s;let p=d[0];for(const f of d)if(f<=a*.8)p=f;else break;const n=p/s/t;let g;if(p<1)g=`${p.toFixed(1)} ${h}`;else if(p>=1e3&&(r==="feet"||r==="meters")){const f=r==="feet"?"mi":"km",c=p/(r==="feet"?5280:1e3);g=`${c.toFixed(c<1?1:0)} ${f}`}else g=`${p} ${h}`;return{pixelLength:Math.round(n),label:g}}static downloadBlob(t,r){const l=URL.createObjectURL(t),o=document.createElement("a");o.href=l,o.download=r,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(l)}}const tn=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),o=t.basic,d=te(c=>c.fireMapPro.export.configuration.layout.elements),[h,s]=E.useState(null),a=c=>x=>{const m=x.target.type==="checkbox"?x.target.checked:x.target.value;l(Fi({[c]:m}))},p=c=>{var m;const x=(m=c.target.files)==null?void 0:m[0];if(x&&x.type.startsWith("image/")){const B=new FileReader;B.onload=A=>{var S;const j=(S=A.target)==null?void 0:S.result;s(j),l(Fi({logo:x}))},B.readAsDataURL(x)}},u=()=>{console.log("[BasicExportTab] Manual apply clicked!",{title:o.title,subtitle:o.subtitle}),console.log("[BasicExportTab] Current layout elements:",d);let c=d.find(m=>m.type==="title"),x=d.find(m=>m.type==="subtitle");if(o.title)if(c)console.log("[BasicExportTab] Updating existing title element"),l(Yt({id:c.id,updates:{content:{...c.content,text:o.title}}}));else{console.log("[BasicExportTab] Creating new title element");const m={type:"title",x:10,y:5,width:80,height:8,zIndex:10,content:{text:o.title,fontSize:18,fontFamily:"Arial",fontWeight:"bold",color:"#333333",textAlign:"center"},visible:!0};l(hi(m))}if(o.subtitle)if(x)console.log("[BasicExportTab] Updating existing subtitle element"),l(Yt({id:x.id,updates:{content:{...x.content,text:o.subtitle}}}));else{console.log("[BasicExportTab] Creating new subtitle element");const m={type:"subtitle",x:10,y:15,width:80,height:6,zIndex:9,content:{text:o.subtitle,fontSize:14,fontFamily:"Arial",fontWeight:"normal",color:"#666666",textAlign:"center"},visible:!0};l(hi(m))}},n=[{value:"png",label:"PNG Image",group:"Raster Formats"},{value:"jpg",label:"JPEG Image",group:"Raster Formats"},{value:"tiff",label:"TIFF Image",group:"Raster Formats"},{value:"webp",label:"WebP Image",group:"Raster Formats"},{value:"pdf",label:"PDF Document",group:"Vector Formats"},{value:"svg",label:"SVG Vector",group:"Vector Formats"},{value:"eps",label:"EPS Vector",group:"Vector Formats"},{value:"geojson",label:"GeoJSON",group:"GIS Formats"},{value:"kml",label:"KML",group:"GIS Formats"},{value:"geopdf",label:"GeoPDF",group:"GIS Formats"}],g=[{value:96,label:"Standard (96 DPI)"},{value:150,label:"Medium (150 DPI)"},{value:300,label:"High (300 DPI)"},{value:450,label:"Very High (450 DPI)"},{value:600,label:"Ultra High (600 DPI)"}],f=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"legal",label:'Legal (8.5" × 14")'},{value:"tabloid",label:'Tabloid (11" × 17")'},{value:"a4",label:"A4 (210mm × 297mm)"},{value:"a3",label:"A3 (297mm × 420mm)"},{value:"a2",label:"A2 (420mm × 594mm)"},{value:"a1",label:"A1 (594mm × 841mm)"},{value:"a0",label:"A0 (841mm × 1189mm)"},{value:"custom",label:"Custom Size"}],y=n.reduce((c,x)=>(c[x.group]||(c[x.group]=[]),c[x.group].push(x),c),{});return i?e.jsx(k,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(L,{container:!0,spacing:3,children:[e.jsx(L,{size:12,children:e.jsx(C,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Map Information"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Map Title",value:o.title,onChange:a("title"),disabled:r,placeholder:"My Fire Department Map",helperText:"Title that will appear on the exported map"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Subtitle (optional)",value:o.subtitle,onChange:a("subtitle"),disabled:r,placeholder:"Created by Fire Prevention Division",helperText:"Optional subtitle for additional context"})}),e.jsxs(L,{size:12,children:[e.jsx(Me,{variant:"contained",color:"primary",onClick:u,disabled:r||!o.title&&!o.subtitle,sx:{mt:1},children:"Apply Title/Subtitle to Layout"}),e.jsx(C,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Click to add your title and subtitle to the Layout Designer"})]}),e.jsxs(L,{size:12,children:[e.jsx(C,{variant:"subtitle2",gutterBottom:!0,children:"Department Logo"}),e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsxs(Me,{variant:"outlined",component:"label",startIcon:e.jsx(Gr,{}),disabled:r,children:["Choose Logo",e.jsx("input",{type:"file",hidden:!0,accept:"image/*",onChange:p})]}),h&&e.jsx(vl,{src:h,variant:"rounded",sx:{width:60,height:60},children:e.jsx(sr,{})}),!h&&e.jsx(C,{variant:"body2",color:"text.secondary",children:"No logo selected"})]})]}),e.jsx(L,{size:12,children:e.jsx(it,{sx:{my:1}})}),e.jsx(L,{size:12,children:e.jsx(C,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Export Settings"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Export Format"}),e.jsx(se,{value:o.format,label:"Export Format",onChange:a("format"),children:Object.entries(y).map(([c,x])=>[e.jsx(M,{disabled:!0,sx:{fontWeight:"bold",bgcolor:"action.hover"},children:c},c),...x.map(m=>e.jsx(M,{value:m.value,sx:{pl:3},children:m.label},m.value))])})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Resolution (DPI)"}),e.jsx(se,{value:String(o.dpi),label:"Resolution (DPI)",onChange:a("dpi"),children:g.map(c=>e.jsx(M,{value:c.value,children:c.label},c.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Print Size"}),e.jsx(se,{value:o.paperSize,label:"Print Size",onChange:a("paperSize"),children:f.map(c=>e.jsx(M,{value:c.value,children:c.label},c.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Orientation"}),e.jsxs(se,{value:o.orientation,label:"Orientation",onChange:a("orientation"),children:[e.jsx(M,{value:"portrait",children:"Portrait"}),e.jsx(M,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(L,{size:12,children:e.jsx(it,{sx:{my:1}})}),e.jsxs(L,{size:12,children:[e.jsx(C,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Layout Elements"}),e.jsx(C,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"Select which elements to include in your exported map"})]}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:o.includeLegend,onChange:a("includeLegend"),disabled:r}),label:"Include Legend"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:o.includeScale,onChange:a("includeScale"),disabled:r}),label:"Include Scale Bar"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:o.includeNorth,onChange:a("includeNorth"),disabled:r}),label:"Include North Arrow"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:o.includeTitle,onChange:a("includeTitle"),disabled:r}),label:"Include Title Banner"})}),e.jsx(L,{size:12,children:e.jsx(At,{severity:"info",sx:{mt:2},children:e.jsxs(C,{variant:"body2",children:[e.jsx("strong",{children:"Quick Start:"})," Enter a title, select your preferred format (PNG for images, PDF for documents), and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs."]})})})]})}):null},rn=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),o=te(Ye),d=t.advanced,h=n=>g=>{const f=g.target.type==="checkbox"?g.target.checked:g.target.value;l(li({[n]:f}))},s=n=>g=>{const f=parseFloat(g.target.value)||0;l(li({[n]:f}))},a=n=>{const g=d.selectedLayers,f=g.includes(n)?g.filter(y=>y!==n):[...g,n];l(li({selectedLayers:f}))},p=[{value:"srgb",label:"sRGB (Default)"},{value:"adobergb",label:"Adobe RGB"},{value:"cmyk-swop",label:"CMYK SWOP (U.S.)"},{value:"cmyk-fogra",label:"CMYK FOGRA39 (Europe)"},{value:"custom",label:"Custom Profile..."}],u=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"a4",label:"A4 (210mm × 297mm)"}];return i?e.jsx(k,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(L,{container:!0,spacing:3,children:[e.jsx(L,{size:{xs:12},children:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(ii,{color:"primary"}),e.jsx(C,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Color Management"})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Color Mode"}),e.jsxs(se,{value:d.colorMode,label:"Color Mode",onChange:h("colorMode"),children:[e.jsx(M,{value:"rgb",children:"RGB (Screen)"}),e.jsx(M,{value:"cmyk",children:"CMYK (Print)"})]})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"ICC Color Profile"}),e.jsx(se,{value:d.colorProfile,label:"ICC Color Profile",onChange:h("colorProfile"),children:p.map(n=>e.jsx(M,{value:n.value,children:n.label},n.value))})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(C,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Custom Print Size"})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsx(re,{fullWidth:!0,label:"Width",type:"number",value:d.customWidth,onChange:s("customWidth"),disabled:r,inputProps:{min:1,max:100,step:.1}})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsx(re,{fullWidth:!0,label:"Height",type:"number",value:d.customHeight,onChange:s("customHeight"),disabled:r,inputProps:{min:1,max:100,step:.1}})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:d.printUnits,label:"Units",onChange:h("printUnits"),children:[e.jsx(M,{value:"in",children:"inches"}),e.jsx(M,{value:"cm",children:"centimeters"}),e.jsx(M,{value:"mm",children:"millimeters"})]})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(jo,{color:"primary"}),e.jsx(C,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Professional Print Options"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(le,{variant:"outlined",sx:{p:2},children:e.jsxs(L,{container:!0,spacing:2,children:[e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.addBleed,onChange:h("addBleed"),disabled:r}),label:"Add Bleed (0.125″)"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.showCropMarks,onChange:h("showCropMarks"),disabled:r}),label:"Show Crop Marks"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.includeColorBars,onChange:h("includeColorBars"),disabled:r}),label:"Include Color Calibration Bars"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.addRegistrationMarks,onChange:h("addRegistrationMarks"),disabled:r}),label:"Add Registration Marks"})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.embedICCProfile,onChange:h("embedICCProfile"),disabled:r}),label:"Embed ICC Profile"})})]})})}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Lo,{color:"primary"}),e.jsx(C,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Large Format Printing"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.enableTiledPrinting,onChange:h("enableTiledPrinting"),disabled:r}),label:"Enable Tiled Printing"})}),d.enableTiledPrinting&&e.jsxs(e.Fragment,{children:[e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Tile Size"}),e.jsx(se,{value:d.tileSize,label:"Tile Size",onChange:h("tileSize"),children:u.map(n=>e.jsx(M,{value:n.value,children:n.label},n.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Overlap",type:"number",value:d.tileOverlap,onChange:s("tileOverlap"),disabled:r,inputProps:{min:0,max:2,step:.25},InputProps:{endAdornment:e.jsx(rr,{position:"end",children:"inches"})}})})]}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(St,{color:"primary"}),e.jsx(C,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layer Controls"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.exportAllLayers,onChange:h("exportAllLayers"),disabled:r}),label:"Export All Visible Layers"})}),!d.exportAllLayers&&o.length>0&&e.jsxs(L,{size:{xs:12},children:[e.jsx(C,{variant:"subtitle2",gutterBottom:!0,children:"Select Layers to Export:"}),e.jsx(le,{variant:"outlined",sx:{maxHeight:200,overflow:"auto"},children:e.jsx(tr,{dense:!0,children:o.map(n=>e.jsxs(ir,{component:"button",disabled:r,children:[e.jsx(Vt,{primary:n.name,secondary:`${n.features.length} features`}),e.jsx(al,{children:e.jsx(De,{checked:d.selectedLayers.includes(n.id),onChange:()=>a(n.id),disabled:r})})]},n.id))})})]}),e.jsx(L,{size:{xs:12},children:e.jsx(At,{severity:"info",sx:{mt:2},children:e.jsxs(C,{variant:"body2",children:[e.jsx("strong",{children:"Professional Printing:"})," Use CMYK color mode and appropriate ICC profiles for commercial printing. Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages."]})})})]})}):null},ln=({configuration:i,disabled:t=!1})=>{const r=xe(),l=te(a=>a.fireMapPro.export.configuration.basic),o=[{type:"map",label:"Map Frame",icon:e.jsx(pi,{})},{type:"title",label:"Title",icon:e.jsx(Do,{})},{type:"subtitle",label:"Subtitle",icon:e.jsx(Ai,{})},{type:"legend",label:"Legend",icon:e.jsx(go,{})},{type:"north-arrow",label:"North Arrow",icon:e.jsx(bo,{})},{type:"scale-bar",label:"Scale Bar",icon:e.jsx(Fo,{})},{type:"text",label:"Text Box",icon:e.jsx(Ai,{})},{type:"image",label:"Image",icon:e.jsx(sr,{})},{type:"shape",label:"Shape",icon:e.jsx(co,{})}],d=[{id:"standard",name:"Standard",description:"Basic layout with map and legend"},{id:"professional",name:"Professional",description:"Corporate layout with sidebar"},{id:"presentation",name:"Presentation",description:"Landscape format for slides"},{id:"tactical",name:"Tactical",description:"Emergency response layout"}],h=(a,p)=>{a.dataTransfer.setData("application/json",JSON.stringify({type:"layout-element",elementType:p})),a.dataTransfer.effectAllowed="copy"},s=a=>{t||(console.log("[LayoutToolbox] Template clicked:",a),console.log("[LayoutToolbox] Basic config:",l),r(Dr(a)))};return e.jsxs(k,{sx:{p:2},children:[e.jsx(C,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Elements"}),e.jsx(L,{container:!0,spacing:1,sx:{mb:3},children:o.map(a=>e.jsx(L,{size:{xs:6},children:e.jsxs(le,{sx:{p:1,textAlign:"center",cursor:t?"default":"grab",border:1,borderColor:"divider",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:"action.hover",transform:"translateY(-2px)",boxShadow:1},"&:active":t?{}:{cursor:"grabbing",opacity:.7}},draggable:!t,onDragStart:p=>h(p,a.type),children:[e.jsx(k,{sx:{color:"primary.main",mb:.5},children:a.icon}),e.jsx(C,{variant:"caption",display:"block",children:a.label})]})},a.type))}),e.jsx(it,{sx:{my:2}}),e.jsx(C,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Templates"}),e.jsx(k,{sx:{display:"flex",flexDirection:"column",gap:1},children:d.map(a=>e.jsxs(le,{sx:{p:1.5,cursor:t?"default":"pointer",border:1,borderColor:i.layout.selectedTemplate===a.id?"primary.main":"divider",bgcolor:i.layout.selectedTemplate===a.id?"primary.50":"background.paper",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:i.layout.selectedTemplate===a.id?"primary.100":"action.hover",transform:"translateY(-1px)",boxShadow:1}},onClick:()=>s(a.id),children:[e.jsx(C,{variant:"subtitle2",sx:{fontWeight:600},children:a.name}),e.jsx(C,{variant:"caption",color:"text.secondary",children:a.description})]},a.id))}),e.jsx(k,{sx:{mt:3,p:1,bgcolor:"info.50",borderRadius:1},children:e.jsx(C,{variant:"caption",color:"info.main",children:"💡 Drag elements to the canvas or click a template to get started."})})]})},on=({width:i=800,height:t=600})=>{const r=xe(),l=E.useRef(null),{layoutElements:o,selectedElementId:d,paperSize:h}=te(j=>({layoutElements:j.fireMapPro.export.configuration.layout.elements,selectedElementId:j.fireMapPro.export.configuration.layout.selectedElementId,paperSize:j.fireMapPro.export.configuration.basic.paperSize})),s={letter:{width:8.5,height:11},legal:{width:8.5,height:14},tabloid:{width:11,height:17},a4:{width:8.27,height:11.69},a3:{width:11.69,height:16.54},custom:{width:8.5,height:11}},a=s[h]||s.letter,p=a.width/a.height,u=Math.min(t,i/p),n=u*p,g=(j,S)=>{S.stopPropagation(),r(Di(j))},f=()=>{r(Di(null))},y=(j,S,W)=>{const w=o.find(ie=>ie.id===j);if(!w)return;const D=Math.max(0,Math.min(100,w.x+S/n*100)),U=Math.max(0,Math.min(100,w.y+W/u*100));r(Yt({id:j,updates:{x:D,y:U}}))},c=j=>{j.preventDefault(),j.dataTransfer.dropEffect="copy"},x=j=>{var S;j.preventDefault();try{const W=j.dataTransfer.getData("application/json");if(!W)return;const w=JSON.parse(W);if(w.type!=="layout-element")return;const D=(S=l.current)==null?void 0:S.getBoundingClientRect();if(!D)return;const U=(j.clientX-D.left)/D.width*100,ie=(j.clientY-D.top)/D.height*100,de={type:w.elementType,x:Math.max(0,Math.min(95,U-5)),y:Math.max(0,Math.min(95,ie-5)),width:20,height:15,zIndex:o.length+1,visible:!0,content:m(w.elementType)};r(hi(de))}catch(W){console.error("Error handling drop:",W)}},m=j=>{switch(j){case"title":return{text:"Map Title",fontSize:18,textAlign:"center",color:"#333333",fontFamily:"Arial"};case"subtitle":return{text:"Map Subtitle",fontSize:14,textAlign:"center",color:"#666666",fontFamily:"Arial"};case"text":return{text:"Text Element",fontSize:12,textAlign:"left",color:"#333333",fontFamily:"Arial"};case"legend":return{text:"Legend",backgroundColor:"#ffffff",color:"#333333"};case"image":return{text:"Image Placeholder",backgroundColor:"#f5f5f5"};case"shape":return{backgroundColor:"transparent",borderColor:"#333333"};default:return{}}},B=j=>{switch(j){case"map":return"🗺️";case"title":return"📝";case"subtitle":return"📄";case"legend":return"📋";case"north-arrow":return"🧭";case"scale-bar":return"📏";case"text":return"💬";case"image":return"🖼️";case"shape":return"⬜";default:return"📦"}},A=j=>{switch(j){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(k,{sx:{display:"flex",flexDirection:"column",alignItems:"center",padding:2,height:"100%",backgroundColor:"#f5f5f5"},children:[e.jsxs(le,{ref:l,onClick:f,onDragOver:c,onDrop:x,sx:{position:"relative",width:n,height:u,backgroundColor:"white",border:"2px solid #ddd",boxShadow:"0 4px 8px rgba(0,0,0,0.1)",overflow:"hidden",cursor:"default"},children:[e.jsxs(k,{sx:{position:"absolute",top:-25,left:0,fontSize:"12px",color:"#666",fontWeight:"bold"},children:[h.toUpperCase()," (",a.width,'" × ',a.height,'")']}),e.jsxs("svg",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.1},children:[e.jsx("defs",{children:e.jsx("pattern",{id:"grid",width:n/10,height:u/10,patternUnits:"userSpaceOnUse",children:e.jsx("path",{d:`M ${n/10} 0 L 0 0 0 ${u/10}`,fill:"none",stroke:"#666",strokeWidth:"1"})})}),e.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"})]}),o.map(j=>e.jsx(nn,{element:j,isSelected:j.id===d,canvasWidth:n,canvasHeight:u,onElementClick:g,onElementDrag:y,getElementIcon:B,getElementLabel:A},j.id)),o.length===0&&e.jsxs(k,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",color:"#999"},children:[e.jsx(k,{sx:{fontSize:"48px",marginBottom:1},children:"📄"}),e.jsx(k,{sx:{fontSize:"14px"},children:"Drag elements from the toolbox to create your layout"})]})]}),e.jsxs(k,{sx:{marginTop:1,fontSize:"12px",color:"#666",textAlign:"center"},children:["Canvas: ",Math.round(n),"×",Math.round(u),"px | Zoom: ",Math.round(n/400*100),"% | Elements: ",o.length]})]})},nn=({element:i,isSelected:t,canvasWidth:r,canvasHeight:l,onElementClick:o,onElementDrag:d,getElementIcon:h,getElementLabel:s})=>{var f,y,c,x,m,B,A,j;const a=E.useRef(null),p=E.useRef(!1),u=E.useRef({x:0,y:0}),n=S=>{S.preventDefault(),S.stopPropagation(),p.current=!0,u.current={x:S.clientX,y:S.clientY};const W=D=>{if(!p.current)return;const U=D.clientX-u.current.x,ie=D.clientY-u.current.y;d(i.id,U,ie),u.current={x:D.clientX,y:D.clientY}},w=()=>{p.current=!1,document.removeEventListener("mousemove",W),document.removeEventListener("mouseup",w)};document.addEventListener("mousemove",W),document.addEventListener("mouseup",w),o(i.id,S)};if(!i.visible)return null;const g={position:"absolute",left:`${i.x}%`,top:`${i.y}%`,width:`${i.width}%`,height:`${i.height}%`,zIndex:i.zIndex,border:t?"2px solid #1976d2":"1px solid #ddd",backgroundColor:i.type==="map"?"#e3f2fd":"rgba(255,255,255,0.9)",cursor:"move",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:"#666",userSelect:"none",boxSizing:"border-box"};return e.jsxs("div",{ref:a,style:g,onMouseDown:n,onClick:S=>o(i.id,S),children:[e.jsx(k,{sx:{textAlign:"center",overflow:"hidden",padding:.5},children:(i.type==="title"||i.type==="subtitle"||i.type==="text"||i.type==="legend")&&((f=i.content)!=null&&f.text)?e.jsx(k,{sx:{fontSize:`${Math.max(8,Math.min(16,(((y=i.content)==null?void 0:y.fontSize)||12)*.8))}px`,fontFamily:((c=i.content)==null?void 0:c.fontFamily)||"Arial",color:((x=i.content)==null?void 0:x.color)||"#333",textAlign:((m=i.content)==null?void 0:m.textAlign)||(i.type==="title"?"center":"left"),fontWeight:i.type==="title"?"bold":"normal",lineHeight:1.2,wordBreak:"break-word",overflow:"hidden",textOverflow:"ellipsis",backgroundColor:i.type==="legend"?((B=i.content)==null?void 0:B.backgroundColor)||"#ffffff":"transparent",border:i.type==="legend"?"1px solid #ddd":"none",borderRadius:i.type==="legend"?"2px":"0",padding:i.type==="legend"?"2px 4px":"0",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:((A=i.content)==null?void 0:A.textAlign)==="center"?"center":((j=i.content)==null?void 0:j.textAlign)==="right"?"flex-end":"flex-start"},children:i.content.text}):e.jsxs(e.Fragment,{children:[e.jsx(k,{sx:{fontSize:"16px",marginBottom:.5},children:h(i.type)}),e.jsx(k,{sx:{fontSize:"10px",lineHeight:1},children:s(i.type)})]})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",top:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"nw-resize"}}),e.jsx("div",{style:{position:"absolute",top:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"ne-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"sw-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"se-resize"}})]})]})},an=()=>{var h,s,a,p,u,n,g,f,y;const i=xe(),{selectedElement:t,elements:r}=te(c=>{const x=c.fireMapPro.export.configuration.layout.selectedElementId,m=c.fireMapPro.export.configuration.layout.elements;return{selectedElement:x?m.find(B=>B.id===x):null,elements:m}});if(!t)return e.jsxs(k,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa"},children:[e.jsx(C,{variant:"h6",gutterBottom:!0,sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsxs(k,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",color:"#999",textAlign:"center"},children:[e.jsx(k,{sx:{fontSize:"32px",marginBottom:1},children:"🎛️"}),e.jsx(C,{variant:"body2",sx:{fontSize:"0.85rem"},children:"Select an element to edit its properties"})]})]});const l=(c,x)=>{i(Yt({id:t.id,updates:{[c]:x}}))},o=()=>{i(Br(t.id))},d=c=>{switch(c){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(k,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa",overflowY:"auto"},children:[e.jsxs(k,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1},children:[e.jsx(C,{variant:"h6",sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsx(Me,{size:"small",color:"error",startIcon:e.jsx(xi,{}),onClick:o,sx:{minWidth:"auto",px:1},children:"Del"})]}),e.jsx(C,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:d(t.type)}),e.jsxs(Ke,{defaultExpanded:!0,sx:{mb:1},children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(C,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:"Position & Size"})}),e.jsxs(et,{sx:{pt:1},children:[e.jsxs(k,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(re,{label:"X",type:"number",size:"small",value:Math.round(t.x*100)/100,onChange:c=>l("x",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(re,{label:"Y",type:"number",size:"small",value:Math.round(t.y*100)/100,onChange:c=>l("y",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(k,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(re,{label:"Width",type:"number",size:"small",value:Math.round(t.width*100)/100,onChange:c=>l("width",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(re,{label:"Height",type:"number",size:"small",value:Math.round(t.height*100)/100,onChange:c=>l("height",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(k,{sx:{marginBottom:1},children:[e.jsx(C,{gutterBottom:!0,children:"Layer Order"}),e.jsx(Jt,{value:t.zIndex,onChange:(c,x)=>l("zIndex",x),min:1,max:r.length+5,step:1,marks:!0,valueLabelDisplay:"on"})]}),e.jsx(pe,{control:e.jsx(De,{checked:t.visible,onChange:c=>l("visible",c.target.checked)}),label:"Visible"})]})]}),(t.type==="title"||t.type==="subtitle"||t.type==="text"||t.type==="legend")&&e.jsxs(Ke,{sx:{mb:1},children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(C,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:t.type==="legend"?"Legend Content":"Text Content"})}),e.jsxs(et,{sx:{pt:1},children:[e.jsx(re,{label:t.type==="legend"?"Legend Title":"Text",multiline:!0,rows:2,fullWidth:!0,size:"small",value:((h=t.content)==null?void 0:h.text)||"",onChange:c=>l("content",{...t.content,text:c.target.value}),sx:{marginBottom:1,"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsxs(k,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,marginBottom:1},children:[e.jsxs(ne,{size:"small",children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Font"}),e.jsxs(se,{value:((s=t.content)==null?void 0:s.fontFamily)||"Arial",onChange:c=>l("content",{...t.content,fontFamily:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(M,{value:"Arial",sx:{fontSize:"0.85rem"},children:"Arial"}),e.jsx(M,{value:"Times New Roman",sx:{fontSize:"0.85rem"},children:"Times"}),e.jsx(M,{value:"Helvetica",sx:{fontSize:"0.85rem"},children:"Helvetica"}),e.jsx(M,{value:"Georgia",sx:{fontSize:"0.85rem"},children:"Georgia"})]})]}),e.jsx(re,{label:"Size",type:"number",size:"small",value:((a=t.content)==null?void 0:a.fontSize)||12,onChange:c=>l("content",{...t.content,fontSize:parseInt(c.target.value)||12}),inputProps:{min:6,max:72},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(k,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1},children:[e.jsxs(ne,{size:"small",children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Align"}),e.jsxs(se,{value:((p=t.content)==null?void 0:p.textAlign)||"left",onChange:c=>l("content",{...t.content,textAlign:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(M,{value:"left",sx:{fontSize:"0.85rem"},children:"Left"}),e.jsx(M,{value:"center",sx:{fontSize:"0.85rem"},children:"Center"}),e.jsx(M,{value:"right",sx:{fontSize:"0.85rem"},children:"Right"})]})]}),e.jsx(re,{label:"Color",type:"color",size:"small",value:((u=t.content)==null?void 0:u.color)||"#000000",onChange:c=>l("content",{...t.content,color:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem",p:.5}}})]})]})]}),t.type==="map"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"Map Settings"})}),e.jsxs(et,{children:[e.jsx(pe,{control:e.jsx(De,{checked:t.showBorder!==!1,onChange:c=>l("showBorder",c.target.checked)}),label:"Show Border",sx:{marginBottom:1}}),e.jsx(re,{label:"Border Width (px)",type:"number",size:"small",fullWidth:!0,value:t.borderWidth||1,onChange:c=>l("borderWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:10},sx:{marginBottom:2}}),e.jsx(re,{label:"Border Color",type:"color",size:"small",fullWidth:!0,value:t.borderColor||"#000000",onChange:c=>l("borderColor",c.target.value)})]})]}),t.type==="legend"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"Legend Settings"})}),e.jsxs(et,{children:[e.jsx(re,{label:"Title",fullWidth:!0,size:"small",value:t.legendTitle||"Legend",onChange:c=>l("legendTitle",c.target.value),sx:{marginBottom:2}}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.legendStyle||"standard",onChange:c=>l("legendStyle",c.target.value),children:[e.jsx(M,{value:"standard",children:"Standard"}),e.jsx(M,{value:"compact",children:"Compact"}),e.jsx(M,{value:"detailed",children:"Detailed"})]})]}),e.jsx(pe,{control:e.jsx(De,{checked:t.showLegendBorder!==!1,onChange:c=>l("showLegendBorder",c.target.checked)}),label:"Show Border"})]})]}),t.type==="north-arrow"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"North Arrow Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.arrowStyle||"classic",onChange:c=>l("arrowStyle",c.target.value),children:[e.jsx(M,{value:"classic",children:"Classic"}),e.jsx(M,{value:"modern",children:"Modern"}),e.jsx(M,{value:"simple",children:"Simple"}),e.jsx(M,{value:"compass",children:"Compass"})]})]}),e.jsx(re,{label:"Rotation (degrees)",type:"number",size:"small",fullWidth:!0,value:t.rotation||0,onChange:c=>l("rotation",parseInt(c.target.value)||0),inputProps:{min:0,max:360}})]})]}),t.type==="scale-bar"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"Scale Bar Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:t.units||"feet",onChange:c=>l("units",c.target.value),children:[e.jsx(M,{value:"feet",children:"Feet"}),e.jsx(M,{value:"meters",children:"Meters"}),e.jsx(M,{value:"miles",children:"Miles"}),e.jsx(M,{value:"kilometers",children:"Kilometers"})]})]}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.scaleStyle||"bar",onChange:c=>l("scaleStyle",c.target.value),children:[e.jsx(M,{value:"bar",children:"Bar"}),e.jsx(M,{value:"line",children:"Line"}),e.jsx(M,{value:"alternating",children:"Alternating"})]})]}),e.jsx(re,{label:"Number of Divisions",type:"number",size:"small",fullWidth:!0,value:t.divisions||4,onChange:c=>l("divisions",parseInt(c.target.value)||4),inputProps:{min:2,max:10}})]})]}),t.type==="image"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"Image Settings"})}),e.jsxs(et,{children:[e.jsxs(k,{sx:{marginBottom:2},children:[e.jsx(C,{variant:"body2",sx:{mb:1,fontSize:"0.85rem",color:"#666"},children:"Upload Image File"}),e.jsx("input",{type:"file",accept:"image/*",onChange:c=>{var m;const x=(m=c.target.files)==null?void 0:m[0];x&&l("content",{...t.content,imageSrc:x})},style:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.85rem"}}),((n=t.content)==null?void 0:n.imageSrc)&&t.content.imageSrc instanceof File&&e.jsxs(C,{variant:"caption",sx:{mt:.5,display:"block",color:"#666"},children:["Selected: ",t.content.imageSrc.name]})]}),e.jsx(it,{sx:{my:2}}),e.jsx(re,{label:"Image URL (alternative to file upload)",fullWidth:!0,size:"small",value:typeof((g=t.content)==null?void 0:g.imageSrc)=="string"?t.content.imageSrc:"",onChange:c=>l("content",{...t.content,imageSrc:c.target.value}),sx:{marginBottom:2,"& .MuiInputBase-input":{fontSize:"0.85rem"}},placeholder:"https://example.com/image.jpg"}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Image Fit"}),e.jsxs(se,{value:((f=t.content)==null?void 0:f.imageFit)||"cover",onChange:c=>l("content",{...t.content,imageFit:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(M,{value:"cover",sx:{fontSize:"0.85rem"},children:"Cover"}),e.jsx(M,{value:"contain",sx:{fontSize:"0.85rem"},children:"Contain"}),e.jsx(M,{value:"fill",sx:{fontSize:"0.85rem"},children:"Fill"}),e.jsx(M,{value:"scale-down",sx:{fontSize:"0.85rem"},children:"Scale Down"})]})]}),e.jsx(re,{label:"Alt Text",fullWidth:!0,size:"small",value:((y=t.content)==null?void 0:y.altText)||"",onChange:c=>l("content",{...t.content,altText:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]})]}),t.type==="shape"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(C,{variant:"subtitle1",children:"Shape Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Shape Type"}),e.jsxs(se,{value:t.shapeType||"rectangle",onChange:c=>l("shapeType",c.target.value),children:[e.jsx(M,{value:"rectangle",children:"Rectangle"}),e.jsx(M,{value:"circle",children:"Circle"}),e.jsx(M,{value:"ellipse",children:"Ellipse"}),e.jsx(M,{value:"triangle",children:"Triangle"}),e.jsx(M,{value:"line",children:"Line"})]})]}),e.jsxs(k,{sx:{display:"flex",gap:1,marginBottom:2},children:[e.jsx(re,{label:"Fill Color",type:"color",size:"small",value:t.fillColor||"#ffffff",onChange:c=>l("fillColor",c.target.value),sx:{flex:1}}),e.jsx(re,{label:"Stroke Color",type:"color",size:"small",value:t.strokeColor||"#000000",onChange:c=>l("strokeColor",c.target.value),sx:{flex:1}})]}),e.jsx(re,{label:"Stroke Width (px)",type:"number",size:"small",fullWidth:!0,value:t.strokeWidth||1,onChange:c=>l("strokeWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:20}})]})]}),e.jsx(it,{sx:{margin:"16px 0"}}),e.jsxs(k,{sx:{fontSize:"12px",color:"#666"},children:[e.jsxs(C,{variant:"caption",display:"block",children:["Element ID: ",t.id]}),e.jsxs(C,{variant:"caption",display:"block",children:["Type: ",t.type]}),e.jsxs(C,{variant:"caption",display:"block",children:["Position: ",Math.round(t.x),"%, ",Math.round(t.y),"%"]}),e.jsxs(C,{variant:"caption",display:"block",children:["Size: ",Math.round(t.width),"% × ",Math.round(t.height),"%"]})]})]})},sn=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),o=t.layout,d=h=>{const s=h.target.value;l(Lr({pageOrientation:s,canvasWidth:s==="landscape"?520:400,canvasHeight:s==="landscape"?400:520}))};return i?e.jsxs(k,{sx:{height:"60vh",display:"flex",flexDirection:"column"},children:[e.jsxs(k,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(po,{color:"primary"}),e.jsx(C,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layout Designer"})]}),e.jsxs(L,{container:!0,spacing:2,alignItems:"center",children:[e.jsx(L,{size:{xs:12,md:4},children:e.jsxs(ne,{fullWidth:!0,size:"small",disabled:r,children:[e.jsx(ae,{children:"Page Orientation"}),e.jsxs(se,{value:o.pageOrientation,label:"Page Orientation",onChange:d,children:[e.jsx(M,{value:"portrait",children:"Portrait"}),e.jsx(M,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(L,{size:{xs:12,md:8},children:e.jsx(At,{severity:"info",sx:{py:.5},children:e.jsx(C,{variant:"caption",children:"Drag elements from the toolbox to the canvas. Select templates for quick layouts."})})})]})]}),e.jsxs(k,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[e.jsx(k,{sx:{width:200,borderRight:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:2},children:e.jsx(ln,{configuration:t,disabled:r})}),e.jsx(k,{sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",bgcolor:"grey.100",p:2,overflow:"auto"},children:e.jsx(on,{})}),e.jsx(k,{sx:{width:280,borderLeft:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:1},children:e.jsx(an,{})})]})]}):null},di=({children:i,value:t,index:r,...l})=>e.jsx("div",{role:"tabpanel",hidden:t!==r,id:`export-tabpanel-${r}`,"aria-labelledby":`export-tab-${r}`,...l,children:t===r&&e.jsx(k,{sx:{p:0},children:i})}),cn=()=>{const i=xe(),t=ti(),r=Ki(t.breakpoints.down("md")),l=te(Mr),o=te(yt),{open:d,activeTab:h,configuration:s,process:a}=l,p={basic:0,advanced:1,"layout-designer":2},u={0:"basic",1:"advanced",2:"layout-designer"},n=p[h],g=()=>{a.isExporting||i(Bi())},f=(c,x)=>{a.isExporting||i(Ar(u[x]))},y=async()=>{try{i(zt({isExporting:!0,progress:0,currentStep:"Preparing export...",error:null}));const c=document.querySelector(".leaflet-container");if(!c)throw new Error("Map element not found");const x={...s,layout:{...s.layout,elements:l.configuration.layout.elements,selectedElementId:l.configuration.layout.selectedElementId,customLayout:l.configuration.layout.customLayout},mapView:{center:o.view.center,zoom:o.view.zoom}};await en.exportMap(c,x,(m,B)=>{i(zt({isExporting:!0,progress:m,currentStep:B,error:null}))}),i(zt({isExporting:!1,progress:100,currentStep:"Export completed",success:!0})),setTimeout(()=>{i(Bi())},1500)}catch(c){i(zt({isExporting:!1,error:c instanceof Error?c.message:"Export failed",success:!1}))}};return e.jsxs(Zt,{open:d,onClose:g,maxWidth:"lg",fullWidth:!0,fullScreen:r,PaperProps:{sx:{minHeight:"80vh",maxHeight:"90vh",bgcolor:"background.default"}},children:[e.jsxs(_t,{sx:{bgcolor:"primary.main",color:"primary.contrastText",p:2,pb:0},children:[e.jsxs(k,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(k,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(xt,{}),e.jsx(C,{variant:"h6",component:"div",children:"Export Options"})]}),e.jsx(Re,{edge:"end",color:"inherit",onClick:g,disabled:a.isExporting,"aria-label":"close",children:e.jsx(Ur,{})})]}),e.jsxs(yi,{value:n,onChange:f,textColor:"inherit",indicatorColor:"secondary",variant:"fullWidth",sx:{"& .MuiTab-root":{color:"rgba(255, 255, 255, 0.7)","&.Mui-selected":{color:"white",fontWeight:600},"&:hover":{color:"white",backgroundColor:"rgba(255, 255, 255, 0.1)"}},"& .MuiTabs-indicator":{backgroundColor:"secondary.main"}},children:[e.jsx(Et,{label:"Basic",id:"export-tab-0","aria-controls":"export-tabpanel-0",disabled:a.isExporting}),e.jsx(Et,{label:"Advanced",id:"export-tab-1","aria-controls":"export-tabpanel-1",disabled:a.isExporting}),e.jsx(Et,{label:"Layout Designer",id:"export-tab-2","aria-controls":"export-tabpanel-2",disabled:a.isExporting})]})]}),e.jsxs(Xt,{sx:{p:0,overflow:"hidden"},children:[e.jsx(di,{value:n,index:0,children:e.jsx(tn,{isActive:h==="basic",configuration:s,disabled:a.isExporting})}),e.jsx(di,{value:n,index:1,children:e.jsx(rn,{isActive:h==="advanced",configuration:s,disabled:a.isExporting})}),e.jsx(di,{value:n,index:2,children:e.jsx(sn,{isActive:h==="layout-designer",configuration:s,disabled:a.isExporting})})]}),e.jsxs(qt,{sx:{p:2,borderTop:1,borderColor:"divider"},children:[e.jsx(Me,{onClick:g,disabled:a.isExporting,color:"inherit",children:"Cancel"}),e.jsx(Me,{onClick:y,disabled:a.isExporting,variant:"contained",startIcon:a.isExporting?null:e.jsx(xt,{}),sx:{minWidth:120},children:a.isExporting?`${a.progress}%`:"Export Map"})]}),a.isExporting&&e.jsx(k,{sx:{position:"absolute",bottom:80,left:16,right:16,bgcolor:"info.main",color:"info.contrastText",p:1,borderRadius:1,display:"flex",alignItems:"center",gap:1},children:e.jsx(C,{variant:"body2",children:a.currentStep})})]})},dn=()=>{const i=E.useRef(null),t=E.useRef(null),r=E.useRef(Math.random().toString(36)),l=E.useRef(0),[o,d]=E.useState([]),h=s=>{console.log(`[SimpleMapTest] ${s}`),d(a=>[...a,`${new Date().toISOString()}: ${s}`])};return E.useEffect(()=>{if(l.current++,h(`Component render #${l.current}`),!i.current){h("❌ No map container div");return}if(t.current){h(`⚠️ Map already exists (ID: ${r.current})`);return}r.current=Math.random().toString(36),h(`🗺️ Creating map with ID: ${r.current}`);try{const s=ee.map(i.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0});ee.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(s);const a=p=>{h(`✅ Click event works at ${p.latlng.lat.toFixed(4)}, ${p.latlng.lng.toFixed(4)}`)};return s.on("click",a),setTimeout(()=>{try{const p=s.getCenter(),u=s.latLngToContainerPoint(p),n=s.containerPointToLatLng(u);h(`✅ Coordinate conversion works: ${n.lat.toFixed(4)}, ${n.lng.toFixed(4)}`)}catch(p){h(`❌ Coordinate conversion failed: ${p instanceof Error?p.message:String(p)}`)}},1e3),t.current=s,h(`✅ Map created successfully (ID: ${r.current})`),()=>{h(`🧹 Cleanup called for map ID: ${r.current}`),t.current&&(t.current.remove(),t.current=null,h(`✅ Map cleaned up (ID: ${r.current})`))}}catch(s){h(`❌ Map creation failed: ${s instanceof Error?s.message:String(s)}`)}},[]),e.jsxs("div",{style:{width:"100vw",height:"100vh",position:"fixed",top:0,left:0,zIndex:9999,background:"white"},children:[e.jsxs("div",{style:{position:"absolute",top:10,left:10,zIndex:1e4,background:"white",padding:"10px",maxHeight:"300px",overflow:"auto",border:"1px solid #ccc"},children:[e.jsx("h3",{children:"Simple Map Test Results"}),e.jsx("div",{style:{fontSize:"12px",fontFamily:"monospace"},children:o.map((s,a)=>e.jsx("div",{children:s},a))}),e.jsx("button",{onClick:()=>window.location.reload(),children:"Reload Test"})]}),e.jsx("div",{ref:i,style:{width:"100%",height:"100%"}})]})},hn=({children:i})=>{const t=te(gi);return E.useEffect(()=>{const r=document.getElementById("root");r&&(r.removeAttribute("aria-hidden"),r.setAttribute("aria-label","Fire Map Pro - Emergency Management Mapping System"),r.getAttribute("role")||r.setAttribute("role","application"));const l=()=>{document.querySelectorAll('[aria-hidden="true"]').forEach(h=>{(h.id==="root"||h.closest("#root"))&&h.removeAttribute("aria-hidden")})};l();const o=new MutationObserver(l);return o.observe(document.body,{attributes:!0,attributeFilter:["aria-hidden"],subtree:!0}),()=>{o.disconnect()}},[t.sidebarOpen]),e.jsx(e.Fragment,{children:i})},Ot=320,xn=({initialMapState:i,mode:t="create",onSave:r,onExport:l})=>{const o=xe(),d=ti(),h=Ki(d.breakpoints.down("md"));E.useEffect(()=>{document.title="FireEMS Fire Map Pro"},[]);const s=te(yt),a=te(gi),p=te(Tr),u=te(zr),n=E.useRef(null),[g,f]=ui.useState(!1);E.useEffect(()=>{if(i)console.log("Loading initial map state:",i),o(Li({...s,...i}));else{console.log("Loading default fire/EMS data:",Vi);const j={view:{center:{latitude:39.8283,longitude:-98.5795},zoom:6},layers:Vi,baseMaps:s.baseMaps,activeBaseMap:s.activeBaseMap,selectedFeatures:[],drawingMode:null,drawingOptions:s.drawingOptions,exportConfig:s.exportConfig,measurementUnits:s.measurementUnits,showCoordinates:s.showCoordinates,showGrid:s.showGrid};o(Li(j))}},[]),E.useEffect(()=>{const j=()=>{try{const W=sessionStorage.getItem("fireEmsExportedData");if(W){const w=JSON.parse(W);if(console.log("Found exported data for Fire Map Pro:",w),w.toolId==="fire-map-pro"&&w.data&&w.data.length>0){const D=Vr.transformToFireMapPro(w.data);if(D.success&&D.data){if(console.log("Importing incident data to Fire Map Pro:",{layerName:D.data.layer.name,featureCount:D.data.features.length,errors:D.errors,warnings:D.warnings}),o(Ir(D.data)),D.errors.length>0||D.warnings.length>0){const U=[`Successfully imported ${D.metadata.successfulRecords} of ${D.metadata.totalRecords} incidents.`,D.errors.length>0?`${D.errors.length} errors encountered.`:"",D.warnings.length>0?`${D.warnings.length} warnings.`:""].filter(Boolean).join(" ");o(ct(U))}sessionStorage.removeItem("fireEmsExportedData")}else console.error("Failed to transform incident data:",D.errors),o(ct(`Failed to import incident data: ${D.errors.join(", ")}`))}}}catch(W){console.error("Error checking for imported data:",W),o(ct("Error importing data from Data Formatter"))}};j();const S=setTimeout(j,1e3);return()=>clearTimeout(S)},[o]),E.useEffect(()=>{const j=S=>{if(!(S.target instanceof HTMLInputElement||S.target instanceof HTMLTextAreaElement)){if(S.ctrlKey||S.metaKey)switch(S.key){case"z":S.preventDefault(),S.shiftKey?u&&o(oi()):p&&o(Mi());break;case"y":S.preventDefault(),u&&o(oi());break;case"s":S.preventDefault(),y();break;case"e":S.preventDefault(),c();break}S.key==="Escape"&&s.drawingMode}};return document.addEventListener("keydown",j),()=>document.removeEventListener("keydown",j)},[p,u,s.drawingMode,o]);const y=()=>{r?r(s):(localStorage.setItem("fireMapPro_autosave",JSON.stringify(s)),console.log("Map saved to local storage"))},c=()=>{l?l(s.exportConfig):o(Xi())},x=()=>{o(Pr())},m=()=>{var j;o(Rr()),a.fullscreen?document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen():(j=n.current)!=null&&j.requestFullscreen&&n.current.requestFullscreen()},B=()=>{o(ct(null))},A={marginLeft:!h&&a.sidebarOpen?`${Ot}px`:0,width:!h&&a.sidebarOpen?`calc(100% - ${Ot}px)`:"100%",height:a.fullscreen?"100vh":"calc(100vh - 64px)",transition:d.transitions.create(["margin","width"],{easing:d.transitions.easing.sharp,duration:d.transitions.duration.leavingScreen})};return g?e.jsxs("div",{children:[e.jsx("button",{onClick:()=>f(!1),style:{position:"fixed",top:10,right:10,zIndex:10001,padding:"10px",background:"red",color:"white"},children:"Exit Test Mode"}),e.jsx(dn,{})]}):e.jsx(hn,{children:e.jsxs(k,{ref:n,sx:{display:"flex",height:"100vh",overflow:"hidden",bgcolor:"background.default",position:a.fullscreen?"fixed":"relative",top:a.fullscreen?0:"auto",left:a.fullscreen?0:"auto",right:a.fullscreen?0:"auto",bottom:a.fullscreen?0:"auto",zIndex:a.fullscreen?1300:"auto"},role:"main","aria-label":"Fire Map Pro Application",children:[!a.fullscreen&&e.jsx(fl,{position:"fixed",sx:{zIndex:d.zIndex.drawer+1,bgcolor:"primary.main"},children:e.jsxs(sl,{children:[e.jsx(Re,{color:"inherit","aria-label":"toggle sidebar",onClick:x,edge:"start",sx:{mr:2},children:e.jsx(mo,{})}),e.jsxs(C,{variant:"h6",noWrap:!0,component:"div",sx:{flexGrow:1},children:["Fire Map Pro ",t==="edit"?"- Editing":t==="view"?"- View Only":""]}),e.jsxs(k,{sx:{display:"flex",gap:1},children:[e.jsx(Re,{color:"inherit",onClick:()=>o(Mi()),disabled:!p,title:"Undo (Ctrl+Z)",children:e.jsx(Bo,{})}),e.jsx(Re,{color:"inherit",onClick:()=>o(oi()),disabled:!u,title:"Redo (Ctrl+Y)",children:e.jsx(ko,{})}),e.jsx(Re,{color:"inherit",onClick:()=>f(!0),title:"Debug Test Mode",sx:{color:"orange"},children:e.jsx(no,{})}),t!=="view"&&e.jsx(Re,{color:"inherit",onClick:y,title:"Save (Ctrl+S)",children:e.jsx(Hr,{})}),e.jsx(Re,{color:"inherit",onClick:c,title:"Export (Ctrl+E)",children:e.jsx(xt,{})}),e.jsx(Re,{color:"inherit",onClick:m,title:"Toggle Fullscreen",children:a.fullscreen?e.jsx(Qr,{}):e.jsx(_r,{})})]})]})}),e.jsx(Al,{variant:h?"temporary":"persistent",anchor:"left",open:a.sidebarOpen,onClose:x,sx:{width:Ot,flexShrink:0,"& .MuiDrawer-paper":{width:Ot,boxSizing:"border-box",marginTop:a.fullscreen?0:"64px",height:a.fullscreen?"100vh":"calc(100vh - 64px)",borderRight:`1px solid ${d.palette.divider}`}},ModalProps:{keepMounted:!0,disablePortal:!1,hideBackdrop:!h,disableAutoFocus:!0,disableEnforceFocus:!0,disableRestoreFocus:!0},PaperProps:{"aria-hidden":!1,role:"complementary","aria-label":"Fire Map Pro Tools"},children:e.jsx(Ko,{mode:t})}),e.jsxs(k,{component:"main",sx:{flexGrow:1,position:"relative",...A},children:[e.jsx(le,{elevation:0,sx:{height:"100%",width:"100%",borderRadius:0,overflow:"hidden",position:"relative",minHeight:"500px",display:"flex",flexDirection:"column","& .leaflet-container":{background:"transparent !important",outline:"none"},"& .leaflet-tile-pane":{opacity:"1 !important",visibility:"visible !important"},"& .leaflet-tile":{opacity:"1 !important",visibility:"visible !important",display:"block !important",imageRendering:"auto",transform:"translateZ(0)",backfaceVisibility:"hidden"},"& .leaflet-layer":{opacity:"1 !important",visibility:"visible !important"}},children:e.jsx(No,{})}),a.isLoading&&e.jsx(k,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,bgcolor:"rgba(255, 255, 255, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:e.jsx(C,{variant:"h6",children:"Loading..."})})]}),a.showWelcome&&e.jsx(Jo,{}),e.jsx(cn,{}),e.jsx(cl,{open:!!a.error,autoHideDuration:6e3,onClose:B,anchorOrigin:{vertical:"bottom",horizontal:"center"},children:e.jsx(At,{onClose:B,severity:"error",sx:{width:"100%"},children:a.error})})]})})};export{xn as default};
