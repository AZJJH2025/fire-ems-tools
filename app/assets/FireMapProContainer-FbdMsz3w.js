import{g as Ft,a as Dt,r as k,u as Bt,j as e,s as Ce,c as Ae,d as ge,b as Mt,m as $e,e as Lt,K as Qi,f as yr,a9 as Ct,M as wr,a7 as ji,a8 as Ei,h as Ve,aa as _i,ab as br,l as te,ac as mt,B as E,ad as Ye,ae as ei,k as xe,af as At,ag as vr,ah as tt,ai as jt,aj as Zi,R as gi,ak as ct,al as Cr,am as jr,an as Er,ao as kr,ap as ki,aq as Xi,ar as qi,as as Sr,at as ui,au as Fr,av as Dr,_ as Si,aw as Fi,ax as hi,ay as Yt,az as li,aA as Br,aB as Di,aC as Mr,aD as Lr,aE as Tr,aF as Bi,aG as Ar,aH as zt,aI as zr,aJ as Ir,aK as Mi,aL as Li,aM as oi,aN as Pr,aO as Rr,aP as $r}from"./index-BruVrwSS.js";import{v as Wr,L as ee,l as Ki,C as Pe,u as Ji,F as Nr,a as Or}from"./leaflet-BsQknkKa.js";import{P as le,c as q,d as Et,s as ti,Y as Ur,f as er,ae as Gr,af as Hr,ag as tr,ah as Ti,ai as Vr,aj as Yr,ak as Qr,e as _r,$ as ni,a3 as Ut,al as ai,am as Ai,an as Gt,u as qe,Z as Zr,T as j,C as ut,B as Le,L as ir,K as rr,N as It,O as Ht,t as Re,E as He,J as Xr,Q as qr,M as T,m as Qt,n as _t,j as re,F as ne,I as ae,i as se,q as Zt,V as pi,G as L,v as pe,k as lr,l as Kr,o as xi,p as kt,A as Tt,z as Jr,H as or,D as it,R as el,w as Ke,x as Je,y as et,ad as tl,U as il}from"./Map-Bjtc5Yi9.js";import{A as rl,E as ll,d as Xt,a as mi,D as qt,S as De,T as Vt,L as ol,e as nl,U as al,b as zi,C as sl,c as cl}from"./Timeline-C4FaetLn.js";function dl(i){return Ft("MuiAppBar",i)}Dt("MuiAppBar",["root","positionFixed","positionAbsolute","positionSticky","positionStatic","positionRelative","colorDefault","colorPrimary","colorSecondary","colorInherit","colorTransparent","colorError","colorInfo","colorSuccess","colorWarning"]);const hl=i=>{const{color:t,position:r,classes:l}=i,n={root:["root",`color${ge(t)}`,`position${ge(r)}`]};return Mt(n,dl,l)},Ii=(i,t)=>i?`${i==null?void 0:i.replace(")","")}, ${t})`:t,pl=Ce(le,{name:"MuiAppBar",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`position${ge(r.position)}`],t[`color${ge(r.color)}`]]}})($e(({theme:i})=>({display:"flex",flexDirection:"column",width:"100%",boxSizing:"border-box",flexShrink:0,variants:[{props:{position:"fixed"},style:{position:"fixed",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0,"@media print":{position:"absolute"}}},{props:{position:"absolute"},style:{position:"absolute",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"sticky"},style:{position:"sticky",zIndex:(i.vars||i).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"static"},style:{position:"static"}},{props:{position:"relative"},style:{position:"relative"}},{props:{color:"inherit"},style:{"--AppBar-color":"inherit"}},{props:{color:"default"},style:{"--AppBar-background":i.vars?i.vars.palette.AppBar.defaultBg:i.palette.grey[100],"--AppBar-color":i.vars?i.vars.palette.text.primary:i.palette.getContrastText(i.palette.grey[100]),...i.applyStyles("dark",{"--AppBar-background":i.vars?i.vars.palette.AppBar.defaultBg:i.palette.grey[900],"--AppBar-color":i.vars?i.vars.palette.text.primary:i.palette.getContrastText(i.palette.grey[900])})}},...Object.entries(i.palette).filter(Lt(["contrastText"])).map(([t])=>({props:{color:t},style:{"--AppBar-background":(i.vars??i).palette[t].main,"--AppBar-color":(i.vars??i).palette[t].contrastText}})),{props:t=>t.enableColorOnDark===!0&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)"}},{props:t=>t.enableColorOnDark===!1&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...i.applyStyles("dark",{backgroundColor:i.vars?Ii(i.vars.palette.AppBar.darkBg,"var(--AppBar-background)"):null,color:i.vars?Ii(i.vars.palette.AppBar.darkColor,"var(--AppBar-color)"):null})}},{props:{color:"transparent"},style:{"--AppBar-background":"transparent","--AppBar-color":"inherit",backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...i.applyStyles("dark",{backgroundImage:"none"})}}]}))),fl=k.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiAppBar"}),{className:n,color:d="primary",enableColorOnDark:p=!1,position:s="fixed",...o}=l,c={...l,color:d,position:s,enableColorOnDark:p},f=hl(c);return e.jsx(pl,{square:!0,component:"header",ownerState:c,elevation:4,className:Ae(f.root,n,s==="fixed"&&"mui-fixed"),ref:r,...o})}),gl=q(e.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}));function ul(i){return Ft("MuiAvatar",i)}Dt("MuiAvatar",["root","colorDefault","circular","rounded","square","img","fallback"]);const xl=i=>{const{classes:t,variant:r,colorDefault:l}=i;return Mt({root:["root",r,l&&"colorDefault"],img:["img"],fallback:["fallback"]},ul,t)},ml=Ce("div",{name:"MuiAvatar",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[r.variant],r.colorDefault&&t.colorDefault]}})($e(({theme:i})=>({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:40,height:40,fontFamily:i.typography.fontFamily,fontSize:i.typography.pxToRem(20),lineHeight:1,borderRadius:"50%",overflow:"hidden",userSelect:"none",variants:[{props:{variant:"rounded"},style:{borderRadius:(i.vars||i).shape.borderRadius}},{props:{variant:"square"},style:{borderRadius:0}},{props:{colorDefault:!0},style:{color:(i.vars||i).palette.background.default,...i.vars?{backgroundColor:i.vars.palette.Avatar.defaultBg}:{backgroundColor:i.palette.grey[400],...i.applyStyles("dark",{backgroundColor:i.palette.grey[600]})}}}]}))),yl=Ce("img",{name:"MuiAvatar",slot:"Img",overridesResolver:(i,t)=>t.img})({width:"100%",height:"100%",textAlign:"center",objectFit:"cover",color:"transparent",textIndent:1e4}),wl=Ce(gl,{name:"MuiAvatar",slot:"Fallback",overridesResolver:(i,t)=>t.fallback})({width:"75%",height:"75%"});function bl({crossOrigin:i,referrerPolicy:t,src:r,srcSet:l}){const[n,d]=k.useState(!1);return k.useEffect(()=>{if(!r&&!l)return;d(!1);let p=!0;const s=new Image;return s.onload=()=>{p&&d("loaded")},s.onerror=()=>{p&&d("error")},s.crossOrigin=i,s.referrerPolicy=t,s.src=r,l&&(s.srcset=l),()=>{p=!1}},[i,t,r,l]),n}const vl=k.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiAvatar"}),{alt:n,children:d,className:p,component:s="div",slots:o={},slotProps:c={},imgProps:f,sizes:a,src:u,srcSet:g,variant:m="circular",...h}=l;let x=null;const y={...l,component:s,variant:m},D=bl({...f,...typeof c.img=="function"?c.img(y):c.img,src:u,srcSet:g}),M=u||g,v=M&&D!=="error";y.colorDefault=!v,delete y.ownerState;const F=xl(y),[I,w]=Et("img",{className:F.img,elementType:yl,externalForwardedProps:{slots:o,slotProps:{img:{...f,...c.img}}},additionalProps:{alt:n,src:u,srcSet:g,sizes:a},ownerState:y});return v?x=e.jsx(I,{...w}):d||d===0?x=d:M&&n?x=n[0]:x=e.jsx(wl,{ownerState:y,className:F.fallback}),e.jsx(ml,{as:s,className:Ae(F.root,p),ref:r,...h,ownerState:y,children:x})});function Cl(i,t,r){const l=t.getBoundingClientRect(),n=r&&r.getBoundingClientRect(),d=tr(t);let p;if(t.fakeTransform)p=t.fakeTransform;else{const c=d.getComputedStyle(t);p=c.getPropertyValue("-webkit-transform")||c.getPropertyValue("transform")}let s=0,o=0;if(p&&p!=="none"&&typeof p=="string"){const c=p.split("(")[1].split(")")[0].split(",");s=parseInt(c[4],10),o=parseInt(c[5],10)}return i==="left"?n?`translateX(${n.right+s-l.left}px)`:`translateX(${d.innerWidth+s-l.left}px)`:i==="right"?n?`translateX(-${l.right-n.left-s}px)`:`translateX(-${l.left+l.width-s}px)`:i==="up"?n?`translateY(${n.bottom+o-l.top}px)`:`translateY(${d.innerHeight+o-l.top}px)`:n?`translateY(-${l.top-n.top+l.height-o}px)`:`translateY(-${l.top+l.height-o}px)`}function jl(i){return typeof i=="function"?i():i}function Pt(i,t,r){const l=jl(r),n=Cl(i,t,l);n&&(t.style.webkitTransform=n,t.style.transform=n)}const El=k.forwardRef(function(t,r){const l=ti(),n={enter:l.transitions.easing.easeOut,exit:l.transitions.easing.sharp},d={enter:l.transitions.duration.enteringScreen,exit:l.transitions.duration.leavingScreen},{addEndListener:p,appear:s=!0,children:o,container:c,direction:f="down",easing:a=n,in:u,onEnter:g,onEntered:m,onEntering:h,onExit:x,onExited:y,onExiting:D,style:M,timeout:v=d,TransitionComponent:F=Ur,...I}=t,w=k.useRef(null),S=er(Gr(o),w,r),U=A=>X=>{A&&(X===void 0?A(w.current):A(w.current,X))},ie=U((A,X)=>{Pt(f,A,c),Vr(A),g&&g(A,X)}),de=U((A,X)=>{const fe=Ti({timeout:v,style:M,easing:a},{mode:"enter"});A.style.webkitTransition=l.transitions.create("-webkit-transform",{...fe}),A.style.transition=l.transitions.create("transform",{...fe}),A.style.webkitTransform="none",A.style.transform="none",h&&h(A,X)}),Z=U(m),O=U(D),W=U(A=>{const X=Ti({timeout:v,style:M,easing:a},{mode:"exit"});A.style.webkitTransition=l.transitions.create("-webkit-transform",X),A.style.transition=l.transitions.create("transform",X),Pt(f,A,c),x&&x(A)}),we=U(A=>{A.style.webkitTransition="",A.style.transition="",y&&y(A)}),K=A=>{p&&p(w.current,A)},be=k.useCallback(()=>{w.current&&Pt(f,w.current,c)},[f,c]);return k.useEffect(()=>{if(u||f==="down"||f==="right")return;const A=Hr(()=>{w.current&&Pt(f,w.current,c)}),X=tr(w.current);return X.addEventListener("resize",A),()=>{A.clear(),X.removeEventListener("resize",A)}},[f,u,c]),k.useEffect(()=>{u||be()},[u,be]),e.jsx(F,{nodeRef:w,onEnter:ie,onEntered:Z,onEntering:de,onExit:W,onExited:we,onExiting:O,addEndListener:K,appear:s,in:u,timeout:v,...I,children:(A,{ownerState:X,...fe})=>k.cloneElement(o,{ref:S,style:{visibility:A==="exited"&&!u?"hidden":void 0,...M,...o.props.style},...fe})})});function kl(i){return Ft("MuiDrawer",i)}Dt("MuiDrawer",["root","docked","paper","anchorLeft","anchorRight","anchorTop","anchorBottom","paperAnchorLeft","paperAnchorRight","paperAnchorTop","paperAnchorBottom","paperAnchorDockedLeft","paperAnchorDockedRight","paperAnchorDockedTop","paperAnchorDockedBottom","modal"]);const nr=(i,t)=>{const{ownerState:r}=i;return[t.root,(r.variant==="permanent"||r.variant==="persistent")&&t.docked,t.modal]},Sl=i=>{const{classes:t,anchor:r,variant:l}=i,n={root:["root",`anchor${ge(r)}`],docked:[(l==="permanent"||l==="persistent")&&"docked"],modal:["modal"],paper:["paper",`paperAnchor${ge(r)}`,l!=="temporary"&&`paperAnchorDocked${ge(r)}`]};return Mt(n,kl,t)},Fl=Ce(Qr,{name:"MuiDrawer",slot:"Root",overridesResolver:nr})($e(({theme:i})=>({zIndex:(i.vars||i).zIndex.drawer}))),Dl=Ce("div",{shouldForwardProp:yr,name:"MuiDrawer",slot:"Docked",skipVariantsResolver:!1,overridesResolver:nr})({flex:"0 0 auto"}),Bl=Ce(le,{name:"MuiDrawer",slot:"Paper",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.paper,t[`paperAnchor${ge(r.anchor)}`],r.variant!=="temporary"&&t[`paperAnchorDocked${ge(r.anchor)}`]]}})($e(({theme:i})=>({overflowY:"auto",display:"flex",flexDirection:"column",height:"100%",flex:"1 0 auto",zIndex:(i.vars||i).zIndex.drawer,WebkitOverflowScrolling:"touch",position:"fixed",top:0,outline:0,variants:[{props:{anchor:"left"},style:{left:0}},{props:{anchor:"top"},style:{top:0,left:0,right:0,height:"auto",maxHeight:"100%"}},{props:{anchor:"right"},style:{right:0}},{props:{anchor:"bottom"},style:{top:"auto",left:0,bottom:0,right:0,height:"auto",maxHeight:"100%"}},{props:({ownerState:t})=>t.anchor==="left"&&t.variant!=="temporary",style:{borderRight:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="top"&&t.variant!=="temporary",style:{borderBottom:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="right"&&t.variant!=="temporary",style:{borderLeft:`1px solid ${(i.vars||i).palette.divider}`}},{props:({ownerState:t})=>t.anchor==="bottom"&&t.variant!=="temporary",style:{borderTop:`1px solid ${(i.vars||i).palette.divider}`}}]}))),ar={left:"right",right:"left",top:"down",bottom:"up"};function Ml(i){return["left","right"].includes(i)}function Ll({direction:i},t){return i==="rtl"&&Ml(t)?ar[t]:t}const Tl=k.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiDrawer"}),n=ti(),d=Qi(),p={enter:n.transitions.duration.enteringScreen,exit:n.transitions.duration.leavingScreen},{anchor:s="left",BackdropProps:o,children:c,className:f,elevation:a=16,hideBackdrop:u=!1,ModalProps:{BackdropProps:g,...m}={},onClose:h,open:x=!1,PaperProps:y={},SlideProps:D,TransitionComponent:M,transitionDuration:v=p,variant:F="temporary",slots:I={},slotProps:w={},...S}=l,U=k.useRef(!1);k.useEffect(()=>{U.current=!0},[]);const ie=Ll({direction:d?"rtl":"ltr"},s),Z={...l,anchor:s,elevation:a,open:x,variant:F,...S},O=Sl(Z),W={slots:{transition:M,...I},slotProps:{paper:y,transition:D,...w,backdrop:Yr(w.backdrop||{...o,...g},{transitionDuration:v})}},[we,K]=Et("root",{ref:r,elementType:Fl,className:Ae(O.root,O.modal,f),shouldForwardComponentProp:!0,ownerState:Z,externalForwardedProps:{...W,...S,...m},additionalProps:{open:x,onClose:h,hideBackdrop:u,slots:{backdrop:W.slots.backdrop},slotProps:{backdrop:W.slotProps.backdrop}}}),[be,A]=Et("paper",{elementType:Bl,shouldForwardComponentProp:!0,className:Ae(O.paper,y.className),ownerState:Z,externalForwardedProps:W,additionalProps:{elevation:F==="temporary"?a:0,square:!0}}),[X,fe]=Et("docked",{elementType:Dl,ref:r,className:Ae(O.root,O.docked,f),ownerState:Z,externalForwardedProps:W,additionalProps:S}),[Q,_]=Et("transition",{elementType:El,ownerState:Z,externalForwardedProps:W,additionalProps:{in:x,direction:ar[ie],timeout:v,appear:U.current}}),Se=e.jsx(be,{...A,children:c});if(F==="permanent")return e.jsx(X,{...fe,children:Se});const me=e.jsx(Q,{..._,children:Se});return F==="persistent"?e.jsx(X,{...fe,children:me}):e.jsx(we,{...K,children:me})});function Al(i,t,r=(l,n)=>l===n){return i.length===t.length&&i.every((l,n)=>r(l,t[n]))}const zl=2;function gt(i,t,r,l,n){return r===1?Math.min(i+t,n):Math.max(i-t,l)}function sr(i,t){return i-t}function Pi(i,t){const{index:r}=i.reduce((l,n,d)=>{const p=Math.abs(t-n);return l===null||p<l.distance||p===l.distance?{distance:p,index:d}:l},null)??{};return r}function Rt(i,t){if(t.current!==void 0&&i.changedTouches){const r=i;for(let l=0;l<r.changedTouches.length;l+=1){const n=r.changedTouches[l];if(n.identifier===t.current)return{x:n.clientX,y:n.clientY}}return!1}return{x:i.clientX,y:i.clientY}}function Kt(i,t,r){return(i-t)*100/(r-t)}function Il(i,t,r){return(r-t)*i+t}function Pl(i){if(Math.abs(i)<1){const r=i.toExponential().split("e-"),l=r[0].split(".")[1];return(l?l.length:0)+parseInt(r[1],10)}const t=i.toString().split(".")[1];return t?t.length:0}function Rl(i,t,r){const l=Math.round((i-r)/t)*t+r;return Number(l.toFixed(Pl(t)))}function Ri({values:i,newValue:t,index:r}){const l=i.slice();return l[r]=t,l.sort(sr)}function $t({sliderRef:i,activeIndex:t,setActive:r}){var n,d,p;const l=Ut(i.current);(!((n=i.current)!=null&&n.contains(l.activeElement))||Number((d=l==null?void 0:l.activeElement)==null?void 0:d.getAttribute("data-index"))!==t)&&((p=i.current)==null||p.querySelector(`[type="range"][data-index="${t}"]`).focus()),r&&r(t)}function Wt(i,t){return typeof i=="number"&&typeof t=="number"?i===t:typeof i=="object"&&typeof t=="object"?Al(i,t):!1}const $l={horizontal:{offset:i=>({left:`${i}%`}),leap:i=>({width:`${i}%`})},"horizontal-reverse":{offset:i=>({right:`${i}%`}),leap:i=>({width:`${i}%`})},vertical:{offset:i=>({bottom:`${i}%`}),leap:i=>({height:`${i}%`})}},Wl=i=>i;let Nt;function $i(){return Nt===void 0&&(typeof CSS<"u"&&typeof CSS.supports=="function"?Nt=CSS.supports("touch-action","none"):Nt=!0),Nt}function Nl(i){const{"aria-labelledby":t,defaultValue:r,disabled:l=!1,disableSwap:n=!1,isRtl:d=!1,marks:p=!1,max:s=100,min:o=0,name:c,onChange:f,onChangeCommitted:a,orientation:u="horizontal",rootRef:g,scale:m=Wl,step:h=1,shiftStep:x=10,tabIndex:y,value:D}=i,M=k.useRef(void 0),[v,F]=k.useState(-1),[I,w]=k.useState(-1),[S,U]=k.useState(!1),ie=k.useRef(0),de=k.useRef(null),[Z,O]=_r({controlled:D,default:r??o,name:"Slider"}),W=f&&((C,B,P)=>{const V=C.nativeEvent||C,J=new V.constructor(V.type,V);Object.defineProperty(J,"target",{writable:!0,value:{value:B,name:c}}),de.current=B,f(J,B,P)}),we=Array.isArray(Z);let K=we?Z.slice().sort(sr):[Z];K=K.map(C=>C==null?o:Ct(C,o,s));const be=p===!0&&h!==null?[...Array(Math.floor((s-o)/h)+1)].map((C,B)=>({value:o+h*B})):p||[],A=be.map(C=>C.value),[X,fe]=k.useState(-1),Q=k.useRef(null),_=er(g,Q),Se=C=>B=>{var V;const P=Number(B.currentTarget.getAttribute("data-index"));Ai(B.target)&&fe(P),w(P),(V=C==null?void 0:C.onFocus)==null||V.call(C,B)},me=C=>B=>{var P;Ai(B.target)||fe(-1),w(-1),(P=C==null?void 0:C.onBlur)==null||P.call(C,B)},Be=(C,B)=>{const P=Number(C.currentTarget.getAttribute("data-index")),V=K[P],J=A.indexOf(V);let $=B;if(be&&h==null){const ce=A[A.length-1];$>=ce?$=ce:$<=A[0]?$=A[0]:$=$<V?A[J-1]:A[J+1]}if($=Ct($,o,s),we){n&&($=Ct($,K[P-1]||-1/0,K[P+1]||1/0));const ce=$;$=Ri({values:K,newValue:$,index:P});let ye=P;n||(ye=$.indexOf(ce)),$t({sliderRef:Q,activeIndex:ye})}O($),fe(P),W&&!Wt($,Z)&&W(C,$,P),a&&a(C,de.current??$)},ze=C=>B=>{var P;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"].includes(B.key)){B.preventDefault();const V=Number(B.currentTarget.getAttribute("data-index")),J=K[V];let $=null;if(h!=null){const ce=B.shiftKey?x:h;switch(B.key){case"ArrowUp":$=gt(J,ce,1,o,s);break;case"ArrowRight":$=gt(J,ce,d?-1:1,o,s);break;case"ArrowDown":$=gt(J,ce,-1,o,s);break;case"ArrowLeft":$=gt(J,ce,d?1:-1,o,s);break;case"PageUp":$=gt(J,x,1,o,s);break;case"PageDown":$=gt(J,x,-1,o,s);break;case"Home":$=o;break;case"End":$=s;break}}else if(be){const ce=A[A.length-1],ye=A.indexOf(J),he=[d?"ArrowRight":"ArrowLeft","ArrowDown","PageDown","Home"],ve=[d?"ArrowLeft":"ArrowRight","ArrowUp","PageUp","End"];he.includes(B.key)?ye===0?$=A[0]:$=A[ye-1]:ve.includes(B.key)&&(ye===A.length-1?$=ce:$=A[ye+1])}$!=null&&Be(B,$)}(P=C==null?void 0:C.onKeyDown)==null||P.call(C,B)};wr(()=>{var C;l&&Q.current.contains(document.activeElement)&&((C=document.activeElement)==null||C.blur())},[l]),l&&v!==-1&&F(-1),l&&X!==-1&&fe(-1);const Qe=C=>B=>{var P;(P=C.onChange)==null||P.call(C,B),Be(B,B.target.valueAsNumber)},Ie=k.useRef(void 0);let Me=u;d&&u==="horizontal"&&(Me+="-reverse");const We=({finger:C,move:B=!1})=>{const{current:P}=Q,{width:V,height:J,bottom:$,left:ce}=P.getBoundingClientRect();let ye;Me.startsWith("vertical")?ye=($-C.y)/J:ye=(C.x-ce)/V,Me.includes("-reverse")&&(ye=1-ye);let he;if(he=Il(ye,o,s),h)he=Rl(he,h,o);else{const Xe=Pi(A,he);he=A[Xe]}he=Ct(he,o,s);let ve=0;if(we){B?ve=Ie.current:ve=Pi(K,he),n&&(he=Ct(he,K[ve-1]||-1/0,K[ve+1]||1/0));const Xe=he;he=Ri({values:K,newValue:he,index:ve}),n&&B||(ve=he.indexOf(Xe),Ie.current=ve)}return{newValue:he,activeIndex:ve}},Ne=ni(C=>{const B=Rt(C,M);if(!B)return;if(ie.current+=1,C.type==="mousemove"&&C.buttons===0){Fe(C);return}const{newValue:P,activeIndex:V}=We({finger:B,move:!0});$t({sliderRef:Q,activeIndex:V,setActive:F}),O(P),!S&&ie.current>zl&&U(!0),W&&!Wt(P,Z)&&W(C,P,V)}),Fe=ni(C=>{const B=Rt(C,M);if(U(!1),!B)return;const{newValue:P}=We({finger:B,move:!0});F(-1),C.type==="touchend"&&w(-1),a&&a(C,de.current??P),M.current=void 0,b()}),ue=ni(C=>{if(l)return;$i()||C.preventDefault();const B=C.changedTouches[0];B!=null&&(M.current=B.identifier);const P=Rt(C,M);if(P!==!1){const{newValue:J,activeIndex:$}=We({finger:P});$t({sliderRef:Q,activeIndex:$,setActive:F}),O(J),W&&!Wt(J,Z)&&W(C,J,$)}ie.current=0;const V=Ut(Q.current);V.addEventListener("touchmove",Ne,{passive:!0}),V.addEventListener("touchend",Fe,{passive:!0})}),b=k.useCallback(()=>{const C=Ut(Q.current);C.removeEventListener("mousemove",Ne),C.removeEventListener("mouseup",Fe),C.removeEventListener("touchmove",Ne),C.removeEventListener("touchend",Fe)},[Fe,Ne]);k.useEffect(()=>{const{current:C}=Q;return C.addEventListener("touchstart",ue,{passive:$i()}),()=>{C.removeEventListener("touchstart",ue),b()}},[b,ue]),k.useEffect(()=>{l&&b()},[l,b]);const N=C=>B=>{var J;if((J=C.onMouseDown)==null||J.call(C,B),l||B.defaultPrevented||B.button!==0)return;B.preventDefault();const P=Rt(B,M);if(P!==!1){const{newValue:$,activeIndex:ce}=We({finger:P});$t({sliderRef:Q,activeIndex:ce,setActive:F}),O($),W&&!Wt($,Z)&&W(B,$,ce)}ie.current=0;const V=Ut(Q.current);V.addEventListener("mousemove",Ne,{passive:!0}),V.addEventListener("mouseup",Fe)},G=Kt(we?K[0]:o,o,s),z=Kt(K[K.length-1],o,s)-G,H=(C={})=>{const B=ai(C),P={onMouseDown:N(B||{})},V={...B,...P};return{...C,ref:_,...V}},rt=C=>B=>{var V;(V=C.onMouseOver)==null||V.call(C,B);const P=Number(B.currentTarget.getAttribute("data-index"));w(P)},dt=C=>B=>{var P;(P=C.onMouseLeave)==null||P.call(C,B),w(-1)},Ue=(C={})=>{const B=ai(C),P={onMouseOver:rt(B||{}),onMouseLeave:dt(B||{})};return{...C,...B,...P}},_e=C=>({pointerEvents:v!==-1&&v!==C?"none":void 0});let Ze;return u==="vertical"&&(Ze=d?"vertical-rl":"vertical-lr"),{active:v,axis:Me,axisProps:$l,dragging:S,focusedThumbIndex:X,getHiddenInputProps:(C={})=>{const B=ai(C),P={onChange:Qe(B||{}),onFocus:Se(B||{}),onBlur:me(B||{}),onKeyDown:ze(B||{})},V={...B,...P};return{tabIndex:y,"aria-labelledby":t,"aria-orientation":u,"aria-valuemax":m(s),"aria-valuemin":m(o),name:c,type:"range",min:i.min,max:i.max,step:i.step===null&&i.marks?"any":i.step??void 0,disabled:l,...C,...V,style:{...Wr,direction:d?"rtl":"ltr",width:"100%",height:"100%",writingMode:Ze}}},getRootProps:H,getThumbProps:Ue,marks:be,open:I,range:we,rootRef:_,trackLeap:z,trackOffset:G,values:K,getThumbStyle:_e}}const Ol=i=>!i||!Gt(i);function Ul(i){return Ft("MuiSlider",i)}const Te=Dt("MuiSlider",["root","active","colorPrimary","colorSecondary","colorError","colorInfo","colorSuccess","colorWarning","disabled","dragging","focusVisible","mark","markActive","marked","markLabel","markLabelActive","rail","sizeSmall","thumb","thumbColorPrimary","thumbColorSecondary","thumbColorError","thumbColorSuccess","thumbColorInfo","thumbColorWarning","track","trackInverted","trackFalse","thumbSizeSmall","valueLabel","valueLabelOpen","valueLabelCircle","valueLabelLabel","vertical"]),Gl=i=>{const{open:t}=i;return{offset:Ae(t&&Te.valueLabelOpen),circle:Te.valueLabelCircle,label:Te.valueLabelLabel}};function Hl(i){const{children:t,className:r,value:l}=i,n=Gl(i);return t?k.cloneElement(t,{className:Ae(t.props.className)},e.jsxs(k.Fragment,{children:[t.props.children,e.jsx("span",{className:Ae(n.offset,r),"aria-hidden":!0,children:e.jsx("span",{className:n.circle,children:e.jsx("span",{className:n.label,children:l})})})]})):null}function Wi(i){return i}const Vl=Ce("span",{name:"MuiSlider",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`color${ge(r.color)}`],r.size!=="medium"&&t[`size${ge(r.size)}`],r.marked&&t.marked,r.orientation==="vertical"&&t.vertical,r.track==="inverted"&&t.trackInverted,r.track===!1&&t.trackFalse]}})($e(({theme:i})=>({borderRadius:12,boxSizing:"content-box",display:"inline-block",position:"relative",cursor:"pointer",touchAction:"none",WebkitTapHighlightColor:"transparent","@media print":{colorAdjust:"exact"},[`&.${Te.disabled}`]:{pointerEvents:"none",cursor:"default",color:(i.vars||i).palette.grey[400]},[`&.${Te.dragging}`]:{[`& .${Te.thumb}, & .${Te.track}`]:{transition:"none"}},variants:[...Object.entries(i.palette).filter(Lt()).map(([t])=>({props:{color:t},style:{color:(i.vars||i).palette[t].main}})),{props:{orientation:"horizontal"},style:{height:4,width:"100%",padding:"13px 0","@media (pointer: coarse)":{padding:"20px 0"}}},{props:{orientation:"horizontal",size:"small"},style:{height:2}},{props:{orientation:"horizontal",marked:!0},style:{marginBottom:20}},{props:{orientation:"vertical"},style:{height:"100%",width:4,padding:"0 13px","@media (pointer: coarse)":{padding:"0 20px"}}},{props:{orientation:"vertical",size:"small"},style:{width:2}},{props:{orientation:"vertical",marked:!0},style:{marginRight:44}}]}))),Yl=Ce("span",{name:"MuiSlider",slot:"Rail",overridesResolver:(i,t)=>t.rail})({display:"block",position:"absolute",borderRadius:"inherit",backgroundColor:"currentColor",opacity:.38,variants:[{props:{orientation:"horizontal"},style:{width:"100%",height:"inherit",top:"50%",transform:"translateY(-50%)"}},{props:{orientation:"vertical"},style:{height:"100%",width:"inherit",left:"50%",transform:"translateX(-50%)"}},{props:{track:"inverted"},style:{opacity:1}}]}),Ql=Ce("span",{name:"MuiSlider",slot:"Track",overridesResolver:(i,t)=>t.track})($e(({theme:i})=>({display:"block",position:"absolute",borderRadius:"inherit",border:"1px solid currentColor",backgroundColor:"currentColor",transition:i.transitions.create(["left","width","bottom","height"],{duration:i.transitions.duration.shortest}),variants:[{props:{size:"small"},style:{border:"none"}},{props:{orientation:"horizontal"},style:{height:"inherit",top:"50%",transform:"translateY(-50%)"}},{props:{orientation:"vertical"},style:{width:"inherit",left:"50%",transform:"translateX(-50%)"}},{props:{track:!1},style:{display:"none"}},...Object.entries(i.palette).filter(Lt()).map(([t])=>({props:{color:t,track:"inverted"},style:{...i.vars?{backgroundColor:i.vars.palette.Slider[`${t}Track`],borderColor:i.vars.palette.Slider[`${t}Track`]}:{backgroundColor:ji(i.palette[t].main,.62),borderColor:ji(i.palette[t].main,.62),...i.applyStyles("dark",{backgroundColor:Ei(i.palette[t].main,.5)}),...i.applyStyles("dark",{borderColor:Ei(i.palette[t].main,.5)})}}}))]}))),_l=Ce("span",{name:"MuiSlider",slot:"Thumb",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.thumb,t[`thumbColor${ge(r.color)}`],r.size!=="medium"&&t[`thumbSize${ge(r.size)}`]]}})($e(({theme:i})=>({position:"absolute",width:20,height:20,boxSizing:"border-box",borderRadius:"50%",outline:0,backgroundColor:"currentColor",display:"flex",alignItems:"center",justifyContent:"center",transition:i.transitions.create(["box-shadow","left","bottom"],{duration:i.transitions.duration.shortest}),"&::before":{position:"absolute",content:'""',borderRadius:"inherit",width:"100%",height:"100%",boxShadow:(i.vars||i).shadows[2]},"&::after":{position:"absolute",content:'""',borderRadius:"50%",width:42,height:42,top:"50%",left:"50%",transform:"translate(-50%, -50%)"},[`&.${Te.disabled}`]:{"&:hover":{boxShadow:"none"}},variants:[{props:{size:"small"},style:{width:12,height:12,"&::before":{boxShadow:"none"}}},{props:{orientation:"horizontal"},style:{top:"50%",transform:"translate(-50%, -50%)"}},{props:{orientation:"vertical"},style:{left:"50%",transform:"translate(-50%, 50%)"}},...Object.entries(i.palette).filter(Lt()).map(([t])=>({props:{color:t},style:{[`&:hover, &.${Te.focusVisible}`]:{...i.vars?{boxShadow:`0px 0px 0px 8px rgba(${i.vars.palette[t].mainChannel} / 0.16)`}:{boxShadow:`0px 0px 0px 8px ${Ve(i.palette[t].main,.16)}`},"@media (hover: none)":{boxShadow:"none"}},[`&.${Te.active}`]:{...i.vars?{boxShadow:`0px 0px 0px 14px rgba(${i.vars.palette[t].mainChannel} / 0.16)`}:{boxShadow:`0px 0px 0px 14px ${Ve(i.palette[t].main,.16)}`}}}}))]}))),Zl=Ce(Hl,{name:"MuiSlider",slot:"ValueLabel",overridesResolver:(i,t)=>t.valueLabel})($e(({theme:i})=>({zIndex:1,whiteSpace:"nowrap",...i.typography.body2,fontWeight:500,transition:i.transitions.create(["transform"],{duration:i.transitions.duration.shortest}),position:"absolute",backgroundColor:(i.vars||i).palette.grey[600],borderRadius:2,color:(i.vars||i).palette.common.white,display:"flex",alignItems:"center",justifyContent:"center",padding:"0.25rem 0.75rem",variants:[{props:{orientation:"horizontal"},style:{transform:"translateY(-100%) scale(0)",top:"-10px",transformOrigin:"bottom center","&::before":{position:"absolute",content:'""',width:8,height:8,transform:"translate(-50%, 50%) rotate(45deg)",backgroundColor:"inherit",bottom:0,left:"50%"},[`&.${Te.valueLabelOpen}`]:{transform:"translateY(-100%) scale(1)"}}},{props:{orientation:"vertical"},style:{transform:"translateY(-50%) scale(0)",right:"30px",top:"50%",transformOrigin:"right center","&::before":{position:"absolute",content:'""',width:8,height:8,transform:"translate(-50%, -50%) rotate(45deg)",backgroundColor:"inherit",right:-8,top:"50%"},[`&.${Te.valueLabelOpen}`]:{transform:"translateY(-50%) scale(1)"}}},{props:{size:"small"},style:{fontSize:i.typography.pxToRem(12),padding:"0.25rem 0.5rem"}},{props:{orientation:"vertical",size:"small"},style:{right:"20px"}}]}))),Xl=Ce("span",{name:"MuiSlider",slot:"Mark",shouldForwardProp:i=>_i(i)&&i!=="markActive",overridesResolver:(i,t)=>{const{markActive:r}=i;return[t.mark,r&&t.markActive]}})($e(({theme:i})=>({position:"absolute",width:2,height:2,borderRadius:1,backgroundColor:"currentColor",variants:[{props:{orientation:"horizontal"},style:{top:"50%",transform:"translate(-1px, -50%)"}},{props:{orientation:"vertical"},style:{left:"50%",transform:"translate(-50%, 1px)"}},{props:{markActive:!0},style:{backgroundColor:(i.vars||i).palette.background.paper,opacity:.8}}]}))),ql=Ce("span",{name:"MuiSlider",slot:"MarkLabel",shouldForwardProp:i=>_i(i)&&i!=="markLabelActive",overridesResolver:(i,t)=>t.markLabel})($e(({theme:i})=>({...i.typography.body2,color:(i.vars||i).palette.text.secondary,position:"absolute",whiteSpace:"nowrap",variants:[{props:{orientation:"horizontal"},style:{top:30,transform:"translateX(-50%)","@media (pointer: coarse)":{top:40}}},{props:{orientation:"vertical"},style:{left:36,transform:"translateY(50%)","@media (pointer: coarse)":{left:44}}},{props:{markLabelActive:!0},style:{color:(i.vars||i).palette.text.primary}}]}))),Kl=i=>{const{disabled:t,dragging:r,marked:l,orientation:n,track:d,classes:p,color:s,size:o}=i,c={root:["root",t&&"disabled",r&&"dragging",l&&"marked",n==="vertical"&&"vertical",d==="inverted"&&"trackInverted",d===!1&&"trackFalse",s&&`color${ge(s)}`,o&&`size${ge(o)}`],rail:["rail"],track:["track"],mark:["mark"],markActive:["markActive"],markLabel:["markLabel"],markLabelActive:["markLabelActive"],valueLabel:["valueLabel"],thumb:["thumb",t&&"disabled",o&&`thumbSize${ge(o)}`,s&&`thumbColor${ge(s)}`],active:["active"],disabled:["disabled"],focusVisible:["focusVisible"]};return Mt(c,Ul,p)},Jl=({children:i})=>i,Jt=k.forwardRef(function(t,r){const l=Bt({props:t,name:"MuiSlider"}),n=Qi(),{"aria-label":d,"aria-valuetext":p,"aria-labelledby":s,component:o="span",components:c={},componentsProps:f={},color:a="primary",classes:u,className:g,disableSwap:m=!1,disabled:h=!1,getAriaLabel:x,getAriaValueText:y,marks:D=!1,max:M=100,min:v=0,name:F,onChange:I,onChangeCommitted:w,orientation:S="horizontal",shiftStep:U=10,size:ie="medium",step:de=1,scale:Z=Wi,slotProps:O,slots:W,tabIndex:we,track:K="normal",value:be,valueLabelDisplay:A="off",valueLabelFormat:X=Wi,...fe}=l,Q={...l,isRtl:n,max:M,min:v,classes:u,disabled:h,disableSwap:m,orientation:S,marks:D,color:a,size:ie,step:de,shiftStep:U,scale:Z,track:K,valueLabelDisplay:A,valueLabelFormat:X},{axisProps:_,getRootProps:Se,getHiddenInputProps:me,getThumbProps:Be,open:ze,active:Qe,axis:Ie,focusedThumbIndex:Me,range:We,dragging:Ne,marks:Fe,values:ue,trackOffset:b,trackLeap:N,getThumbStyle:G}=Nl({...Q,rootRef:r});Q.marked=Fe.length>0&&Fe.some(oe=>oe.label),Q.dragging=Ne,Q.focusedThumbIndex=Me;const z=Kl(Q),H=(W==null?void 0:W.root)??c.Root??Vl,rt=(W==null?void 0:W.rail)??c.Rail??Yl,dt=(W==null?void 0:W.track)??c.Track??Ql,Ue=(W==null?void 0:W.thumb)??c.Thumb??_l,_e=(W==null?void 0:W.valueLabel)??c.ValueLabel??Zl,Ze=(W==null?void 0:W.mark)??c.Mark??Xl,lt=(W==null?void 0:W.markLabel)??c.MarkLabel??ql,C=(W==null?void 0:W.input)??c.Input??"input",B=(O==null?void 0:O.root)??f.root,P=(O==null?void 0:O.rail)??f.rail,V=(O==null?void 0:O.track)??f.track,J=(O==null?void 0:O.thumb)??f.thumb,$=(O==null?void 0:O.valueLabel)??f.valueLabel,ce=(O==null?void 0:O.mark)??f.mark,ye=(O==null?void 0:O.markLabel)??f.markLabel,he=(O==null?void 0:O.input)??f.input,ve=qe({elementType:H,getSlotProps:Se,externalSlotProps:B,externalForwardedProps:fe,additionalProps:{...Ol(H)&&{as:o}},ownerState:{...Q,...B==null?void 0:B.ownerState},className:[z.root,g]}),Xe=qe({elementType:rt,externalSlotProps:P,ownerState:Q,className:z.rail}),ri=qe({elementType:dt,externalSlotProps:V,additionalProps:{style:{..._[Ie].offset(b),..._[Ie].leap(N)}},ownerState:{...Q,...V==null?void 0:V.ownerState},className:z.track}),yt=qe({elementType:Ue,getSlotProps:Be,externalSlotProps:J,ownerState:{...Q,...J==null?void 0:J.ownerState},className:z.thumb}),wt=qe({elementType:_e,externalSlotProps:$,ownerState:{...Q,...$==null?void 0:$.ownerState},className:z.valueLabel}),ht=qe({elementType:Ze,externalSlotProps:ce,ownerState:Q,className:z.mark}),Oe=qe({elementType:lt,externalSlotProps:ye,ownerState:Q,className:z.markLabel}),bt=qe({elementType:C,getSlotProps:me,externalSlotProps:he,ownerState:Q});return e.jsxs(H,{...ve,children:[e.jsx(rt,{...Xe}),e.jsx(dt,{...ri}),Fe.filter(oe=>oe.value>=v&&oe.value<=M).map((oe,R)=>{const vt=Kt(oe.value,v,M),ot=_[Ie].offset(vt);let je;return K===!1?je=ue.includes(oe.value):je=K==="normal"&&(We?oe.value>=ue[0]&&oe.value<=ue[ue.length-1]:oe.value<=ue[0])||K==="inverted"&&(We?oe.value<=ue[0]||oe.value>=ue[ue.length-1]:oe.value>=ue[0]),e.jsxs(k.Fragment,{children:[e.jsx(Ze,{"data-index":R,...ht,...!Gt(Ze)&&{markActive:je},style:{...ot,...ht.style},className:Ae(ht.className,je&&z.markActive)}),oe.label!=null?e.jsx(lt,{"aria-hidden":!0,"data-index":R,...Oe,...!Gt(lt)&&{markLabelActive:je},style:{...ot,...Oe.style},className:Ae(z.markLabel,Oe.className,je&&z.markLabelActive),children:oe.label}):null]},R)}),ue.map((oe,R)=>{const vt=Kt(oe,v,M),ot=_[Ie].offset(vt),je=A==="off"?Jl:_e;return e.jsx(je,{...!Gt(je)&&{valueLabelFormat:X,valueLabelDisplay:A,value:typeof X=="function"?X(Z(oe),R):X,index:R,open:ze===R||Qe===R||A==="on",disabled:h},...wt,children:e.jsx(Ue,{"data-index":R,...yt,className:Ae(z.thumb,yt.className,Qe===R&&z.active,Me===R&&z.focusVisible),style:{...ot,...G(R),...yt.style},children:e.jsx(C,{"data-index":R,"aria-label":x?x(R):d,"aria-valuenow":Z(oe),"aria-labelledby":s,"aria-valuetext":y?y(Z(oe),R):p,value:ue[R],...bt})})},R)})]})});function eo(i){return Ft("MuiToggleButton",i)}const si=Dt("MuiToggleButton",["root","disabled","selected","standard","primary","secondary","sizeSmall","sizeMedium","sizeLarge","fullWidth"]),to=k.createContext({}),io=k.createContext(void 0);function ro(i,t){return t===void 0||i===void 0?!1:Array.isArray(t)?t.includes(i):i===t}const lo=i=>{const{classes:t,fullWidth:r,selected:l,disabled:n,size:d,color:p}=i,s={root:["root",l&&"selected",n&&"disabled",r&&"fullWidth",`size${ge(d)}`,p]};return Mt(s,eo,t)},oo=Ce(Zr,{name:"MuiToggleButton",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:r}=i;return[t.root,t[`size${ge(r.size)}`]]}})($e(({theme:i})=>({...i.typography.button,borderRadius:(i.vars||i).shape.borderRadius,padding:11,border:`1px solid ${(i.vars||i).palette.divider}`,color:(i.vars||i).palette.action.active,[`&.${si.disabled}`]:{color:(i.vars||i).palette.action.disabled,border:`1px solid ${(i.vars||i).palette.action.disabledBackground}`},"&:hover":{textDecoration:"none",backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.hoverOpacity})`:Ve(i.palette.text.primary,i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[{props:{color:"standard"},style:{[`&.${si.selected}`]:{color:(i.vars||i).palette.text.primary,backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette.text.primary,i.palette.action.selectedOpacity)}}}}},...Object.entries(i.palette).filter(Lt()).map(([t])=>({props:{color:t},style:{[`&.${si.selected}`]:{color:(i.vars||i).palette[t].main,backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette[t].main,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:Ve(i.palette[t].main,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:Ve(i.palette[t].main,i.palette.action.selectedOpacity)}}}}})),{props:{fullWidth:!0},style:{width:"100%"}},{props:{size:"small"},style:{padding:7,fontSize:i.typography.pxToRem(13)}},{props:{size:"large"},style:{padding:15,fontSize:i.typography.pxToRem(15)}}]}))),ci=k.forwardRef(function(t,r){const{value:l,...n}=k.useContext(to),d=k.useContext(io),p=br({...n,selected:ro(t.value,l)},t),s=Bt({props:p,name:"MuiToggleButton"}),{children:o,className:c,color:f="standard",disabled:a=!1,disableFocusRipple:u=!1,fullWidth:g=!1,onChange:m,onClick:h,selected:x,size:y="medium",value:D,...M}=s,v={...s,color:f,disabled:a,disableFocusRipple:u,fullWidth:g,size:y},F=lo(v),I=S=>{h&&(h(S,D),S.defaultPrevented)||m&&m(S,D)},w=d||"";return e.jsx(oo,{className:Ae(n.className,F.root,c,w),disabled:a,focusRipple:!u,ref:r,onClick:I,onChange:m,value:D,ownerState:v,"aria-pressed":x,...M,children:o})}),no=q(e.jsx("path",{d:"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"})),ao=q(e.jsx("path",{d:"M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"})),so=q(e.jsx("path",{d:"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"})),co=q(e.jsx("path",{d:"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z"})),ho=q(e.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"})),po=q(e.jsx("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"})),fo=q(e.jsx("path",{d:"M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),go=q(e.jsx("path",{d:"M14.69 2.21 4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02"})),xt=q(e.jsx("path",{d:"M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"})),cr=q(e.jsx("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"})),St=q(e.jsx("path",{d:"m11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27z"})),uo=q(e.jsx("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"})),xo=q([e.jsx("path",{d:"m12 12.9-2.13 2.09c-.56.56-.87 1.29-.87 2.07C9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07z"},"0"),e.jsx("path",{d:"m16 6-.44.55C14.38 8.02 12 7.19 12 5.3V2S4 6 4 13c0 2.92 1.56 5.47 3.89 6.86-.56-.79-.89-1.76-.89-2.8 0-1.32.52-2.56 1.47-3.5L12 10.1l3.53 3.47c.95.93 1.47 2.17 1.47 3.5 0 1.02-.31 1.96-.85 2.75 1.89-1.15 3.29-3.06 3.71-5.3.66-3.55-1.07-6.9-3.86-8.52"},"1")]),mo=q(e.jsx("path",{d:"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z"})),yo=q(e.jsx("path",{d:"M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"})),wo=q(e.jsx("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),bo=q(e.jsx("path",{d:"m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7z"})),ii=q(e.jsx("path",{d:"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9m5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9M5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5m6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5"})),vo=q(e.jsx("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"})),Co=q(e.jsx("path",{d:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"})),jo=q(e.jsx("path",{d:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3m-3 11H8v-5h8zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-1-9H6v4h12z"})),Eo=q(e.jsx("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z"})),ko=q(e.jsx("path",{d:"M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"})),So=q(e.jsx("path",{d:"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),Fo=q(e.jsx("path",{d:"M23 6H1v12h22zm-2 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),Do=q(e.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),Bo=q(e.jsx("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8"})),Mo=q(e.jsx("path",{d:"M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"})),Lo=q(e.jsx("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"})),To=q(e.jsx("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"})),Ni=[],Oi=[],Ui=[],Gi=[],Hi=[],Vi=[{id:"fire-stations",name:"Fire Stations",visible:!1,opacity:1,zIndex:3,type:"feature",features:Ni,metadata:{description:"Add your fire stations using the drawing tools or data import",source:"User Data",created:new Date,featureCount:Ni.length}},{id:"hospitals",name:"Medical Facilities",visible:!1,opacity:1,zIndex:2,type:"feature",features:Oi,metadata:{description:"Add hospitals and medical facilities to your map",source:"User Data",created:new Date,featureCount:Oi.length}},{id:"hydrants",name:"Fire Hydrants",visible:!1,opacity:1,zIndex:1,type:"feature",features:Ui,metadata:{description:"Map fire hydrants with flow rates and inspection data",source:"User Data",created:new Date,featureCount:Ui.length}},{id:"recent-incidents",name:"Incidents",visible:!1,opacity:1,zIndex:4,type:"feature",features:Gi,metadata:{description:"Track emergency incidents and responses",source:"User Data",created:new Date,featureCount:Gi.length}},{id:"response-zones",name:"Response Zones",visible:!1,opacity:.6,zIndex:0,type:"feature",features:Hi,metadata:{description:"Define coverage areas and response zones",source:"User Data",created:new Date,featureCount:Hi.length}}],Yi={fire:{category:"fire",color:"#dc2626",icon:"fire"},"structure fire":{category:"fire",color:"#dc2626",icon:"fire"},"vehicle fire":{category:"fire",color:"#ff6600",icon:"fire"},wildfire:{category:"fire",color:"#ff4444",icon:"fire"},medical:{category:"medical",color:"#22c55e",icon:"medical"},ems:{category:"medical",color:"#22c55e",icon:"medical"},cardiac:{category:"medical",color:"#ef4444",icon:"medical"},respiratory:{category:"medical",color:"#3b82f6",icon:"medical"},rescue:{category:"rescue",color:"#f59e0b",icon:"rescue"},"vehicle accident":{category:"rescue",color:"#f59e0b",icon:"rescue"},hazmat:{category:"hazmat",color:"#8b5cf6",icon:"hazmat"},alarm:{category:"alarm",color:"#6b7280",icon:"alarm"},"false alarm":{category:"alarm",color:"#9ca3af",icon:"alarm"}},Ao=(i,t)=>{const r={fire:`data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(t)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EF%3C/text%3E%3C/svg%3E`,medical:`data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(t)}"/%3E%3Cpath d="M11 8h2v8h-2v-8zM8 11h8v2H8v-2z" fill="white"/%3E%3C/svg%3E`,rescue:`data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(t)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3ER%3C/text%3E%3C/svg%3E`,hazmat:`data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(t)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EH%3C/text%3E%3C/svg%3E`,alarm:`data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(t)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E`};return r[i]||r.fire};class zo{static transformToFireMapPro(t,r={toolId:"fire-map-pro"}){const l=[],n=[],d=[];let p=0,s=0;t.forEach((c,f)=>{try{const a=c["Incident ID"]||c.incidentId||c.id,u=parseFloat(c.Latitude||c.latitude||c.lat),g=parseFloat(c.Longitude||c.longitude||c.lng||c.lon);if(!a){l.push(`Row ${f+1}: Missing Incident ID`),s++;return}if(isNaN(u)||isNaN(g)){l.push(`Row ${f+1}: Invalid or missing coordinates`),s++;return}const m=c["Incident Type"]||c.incidentType||c.type||"Unknown",h=c["Incident Date"]||c.incidentDate||c.date,x=c["Incident Time"]||c.incidentTime||c.time,y=c.Address||c.address||"",D=c.City||c.city||"",M=c.State||c.state||"",v=c.Priority||c.priority||"",F=c.Station||c.station||"",I=c["Response Category"]||c.responseCategory||"",w=m.toLowerCase(),S=Yi[w]||Yi.fire,U={id:`incident-${a}`,type:"marker",title:`${m} - ${a}`,description:`${m} incident${y?` at ${y}`:""}${D?`, ${D}`:""}${M?`, ${M}`:""}`,coordinates:[g,u],style:{color:S.color,icon:{id:`${S.icon}-icon`,name:S.icon,category:S.category,url:Ao(S.icon,S.color),size:"medium",color:S.color,anchor:[12,24],popupAnchor:[0,-24]}},properties:{incidentId:a,incidentType:m,incidentDate:h,incidentTime:x,address:y,city:D,state:M,priority:v,station:F,responseCategory:I,coordinates:{latitude:u,longitude:g},fullAddress:[y,D,M].filter(Boolean).join(", "),dateTime:h&&x?`${h} ${x}`:h||"",displayText:`${m}${v?` (${v})`:""}${F?` - Station ${F}`:""}`},layerId:"imported-incidents",created:new Date,modified:new Date};d.push(U),p++,h||n.push(`Row ${f+1}: Missing incident date`),!y&&!D&&n.push(`Row ${f+1}: Missing address information`)}catch(a){l.push(`Row ${f+1}: ${a instanceof Error?a.message:"Unknown error"}`),s++}});const o={id:"imported-incidents",name:`Imported Incidents (${d.length})`,visible:!0,opacity:1,zIndex:1e3,type:"feature",features:d,style:{defaultStyle:{color:"#dc2626",fillColor:"#dc2626",fillOpacity:.7,weight:2,opacity:1}},metadata:{description:`Incident data imported from Data Formatter - ${d.length} incidents`,source:"Data Formatter",created:new Date,featureCount:d.length,bounds:d.length>0?this.calculateBounds(d):void 0}};return{success:l.length===0||p>0,data:{layer:o,features:d},errors:l,warnings:n,metadata:{totalRecords:t.length,successfulRecords:p,skippedRecords:s}}}static transformToResponseTimeAnalyzer(t,r={toolId:"response-time-analyzer"}){const l=[],n=[],d=[];let p=0,s=0;return t.forEach((o,c)=>{try{const f=o["Incident ID"]||o.incidentId||o.id,a=o["Incident Date"]||o.incidentDate||o.date;if(!f){l.push(`Row ${c+1}: Missing Incident ID`),s++;return}if(!a){l.push(`Row ${c+1}: Missing Incident Date`),s++;return}const u={incidentId:String(f),incidentDate:String(a),incidentTime:o["Incident Time"]||o.incidentTime||o.time,dispatchTime:o["Dispatch Time"]||o.dispatchTime,enRouteTime:o["En Route Time"]||o.enRouteTime,arrivalTime:o["Arrival Time"]||o.arrivalTime||o["On Scene Time"],clearTime:o["Clear Time"]||o.clearTime,latitude:parseFloat(o.Latitude||o.latitude),longitude:parseFloat(o.Longitude||o.longitude),incidentType:o["Incident Type"]||o.incidentType||o.type,respondingUnit:o.Station||o.station||o.unit,address:o.Address||o.address,city:o.City||o.city,state:o.State||o.state,zipCode:o["Zip Code"]||o.zipCode,priority:o.Priority||o.priority};d.push(u),p++}catch(f){l.push(`Row ${c+1}: ${f instanceof Error?f.message:"Unknown error"}`),s++}}),{success:l.length===0||p>0,data:d,errors:l,warnings:n,metadata:{totalRecords:t.length,successfulRecords:p,skippedRecords:s}}}static calculateBounds(t){const r=t.filter(d=>d.type==="marker").map(d=>d.coordinates);if(r.length===0)return;const l=r.map(d=>d[1]),n=r.map(d=>d[0]);return{north:Math.max(...l),south:Math.min(...l),east:Math.max(...n),west:Math.min(...n)}}static validateDataForTool(t,r){if(!t||t.length===0)return{compatible:!1,missingFields:r.requiredFields,availableOptionalFields:[]};const l=Object.keys(t[0]),n=r.requiredFields.filter(p=>!l.includes(p)),d=r.optionalFields?r.optionalFields.filter(p=>l.includes(p)):[];return{compatible:n.length===0,missingFields:n,availableOptionalFields:d}}}const Io=({mouseCoords:i})=>{const t=te(mt),r=(l,n=5)=>l.toFixed(n);return e.jsx(le,{elevation:2,sx:{position:"absolute",bottom:16,left:16,right:16,zIndex:1e3,p:1,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)"},children:e.jsxs(E,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs(E,{children:[e.jsx(j,{variant:"caption",color:"text.secondary",children:"Mouse:"}),i?e.jsxs(j,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:[r(i.lat),", ",r(i.lng)]}):e.jsx(j,{variant:"caption",sx:{ml:1,color:"text.disabled"},children:"Move mouse over map"})]}),e.jsxs(E,{children:[e.jsx(j,{variant:"caption",color:"text.secondary",children:"Center:"}),e.jsxs(j,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:[r(t.view.center.latitude),", ",r(t.view.center.longitude)]})]}),e.jsxs(E,{children:[e.jsx(j,{variant:"caption",color:"text.secondary",children:"Zoom:"}),e.jsx(j,{variant:"caption",sx:{ml:1,fontFamily:"monospace"},children:t.view.zoom.toFixed(1)})]})]})})},Po=()=>{const i=te(Ye),t={totalFeatures:0,totalMarkers:0,totalLines:0,totalPolygons:0};return i.forEach(r=>{r.visible&&(t.totalFeatures+=r.features.length,r.features.forEach(l=>{switch(l.type){case"marker":t.totalMarkers++;break;case"polyline":t.totalLines++;break;case"polygon":t.totalPolygons++;break}}))}),t.totalFeatures===0?null:e.jsxs(le,{elevation:2,sx:{position:"absolute",top:16,left:16,zIndex:1e3,p:2,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)",minWidth:200},children:[e.jsxs(j,{variant:"subtitle2",sx:{mb:1,display:"flex",alignItems:"center",gap:1},children:[e.jsx(So,{fontSize:"small"}),"Features"]}),e.jsx(E,{sx:{display:"flex",flexDirection:"column",gap:1},children:e.jsxs(E,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(ut,{size:"small",label:`${t.totalFeatures} total`,color:"primary",variant:"outlined"}),t.totalMarkers>0&&e.jsx(ut,{size:"small",label:`${t.totalMarkers} markers`,variant:"outlined"}),t.totalLines>0&&e.jsx(ut,{size:"small",label:`${t.totalLines} lines`,variant:"outlined"}),t.totalPolygons>0&&e.jsx(ut,{size:"small",label:`${t.totalPolygons} polygons`,variant:"outlined"})]})})]})},Ro=({onMapReady:i,children:t})=>{const r=k.useRef(null),l=k.useRef(null),n=k.useRef(null),d=k.useRef(!1),p=k.useRef(!1),s=te(ei),o=te(mt),c=k.useCallback(i||(()=>{}),[i]);return k.useEffect(()=>{if(!r.current||l.current||d.current)return;d.current=!0,console.log("[PureLeaflet] Creating pure Leaflet map...");const f=!!s.mode,a=ee.map(r.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0,attributionControl:!0,scrollWheelZoom:!0,doubleClickZoom:!f,boxZoom:!f,keyboard:!0,dragging:!f,touchZoom:!0}),u=o.baseMaps.find(m=>m.id===o.activeBaseMap),g=ee.tileLayer((u==null?void 0:u.url)||"https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:(u==null?void 0:u.attribution)||"© OpenStreetMap contributors",maxZoom:(u==null?void 0:u.maxZoom)||19,minZoom:(u==null?void 0:u.minZoom)||1,tileSize:256,opacity:1});return n.current=g,g.addTo(a),g.on("tileload",m=>{console.log("[PureLeaflet] Tile loaded:",m.coords)}),g.on("tileerror",m=>{console.error("[PureLeaflet] Tile error:",m)}),g.on("loading",()=>{console.log("[PureLeaflet] Started loading tiles")}),g.on("load",()=>{console.log("[PureLeaflet] Finished loading all visible tiles")}),a.on("moveend",()=>{const m=a.getCenter(),h=a.getZoom();console.log(`[PureLeaflet] Map moved to: ${m.lat}, ${m.lng} at zoom ${h}`)}),setTimeout(()=>{a.getContainer()&&(a.invalidateSize(),console.log("[PureLeaflet] Map size invalidated"))},100),l.current=a,a.whenReady(()=>{if(console.log("[PureLeaflet] ✓ Map panes and coordinate system ready"),typeof window<"u"&&(window.pureLeafletMap=a,console.log("[PureLeaflet] ✓ Map exposed as window.pureLeafletMap")),!a._size||!a.getPixelOrigin()||!a.getPanes().mapPane){console.error("[PureLeaflet] Map coordinate system not properly initialized");return}d.current=!1,r.current&&c(a,r.current)}),()=>{if(l.current&&!p.current){p.current=!0,console.log("[PureLeaflet] Map cleaned up");try{l.current.remove()}catch(m){console.warn("[PureLeaflet] Error during cleanup:",m)}l.current=null,d.current=!1,p.current=!1}}},[]),k.useEffect(()=>{console.log("[PureLeafletMap] Drawing effect triggered with mode:",s.mode);const f=l.current;if(!f){console.log("[PureLeafletMap] No map instance, skipping drawing effect");return}const a=!!s.mode;console.log("[PureLeafletMap] isDrawing calculated as:",a),a?(f.doubleClickZoom.disable(),f.boxZoom.disable(),console.log("[PureLeaflet] Zoom interactions disabled for drawing mode:",s.mode)):(f.doubleClickZoom.enable(),f.boxZoom.enable(),console.log("[PureLeaflet] All map interactions enabled - drawing mode off"))},[s.mode]),k.useEffect(()=>{const f=l.current;if(!f)return;const a=o.baseMaps.find(g=>g.id===o.activeBaseMap);if(!a)return;n.current&&(f.removeLayer(n.current),console.log("[PureLeaflet] Removed old tile layer"));const u=ee.tileLayer(a.url,{attribution:a.attribution,maxZoom:a.maxZoom||19,minZoom:a.minZoom||1,tileSize:256,opacity:1});u.on("tileload",g=>{console.log("[PureLeaflet] Tile loaded:",g.coords)}),u.on("tileerror",g=>{console.error("[PureLeaflet] Tile error:",g)}),u.on("loading",()=>{console.log("[PureLeaflet] Started loading tiles")}),u.on("load",()=>{console.log("[PureLeaflet] Finished loading all visible tiles")}),n.current=u,u.addTo(f),console.log(`[PureLeaflet] Switched to base map: ${a.name}`)},[o.activeBaseMap,o.baseMaps]),e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:r,style:{width:"100%",height:"100%",minHeight:"500px",background:"transparent"},className:"pure-leaflet-map"}),t]})},$o=({map:i})=>{const t=xe(),r=te(Ye),l=k.useRef(new Map),n=s=>{try{const c=s.style.icon;if(!c)return ee.icon({iconUrl:'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23666666"/%3E%3C/svg%3E',iconSize:[24,24],iconAnchor:[12,24],popupAnchor:[0,-24]});const f={small:[20,20],medium:[30,30],large:[40,40],"extra-large":[50,50]},a=f[c.size]||f.medium;return c.url?ee.icon({iconUrl:c.url,iconSize:a,iconAnchor:c.anchor?c.anchor:[a[0]/2,a[1]],popupAnchor:c.popupAnchor?c.popupAnchor:[0,-a[1]]}):(console.warn(`[LayerManager] Icon missing URL for feature ${s.id}`),null)}catch(o){return console.warn(`[LayerManager] Error creating icon for feature ${s.id}:`,o),null}},d=s=>{let o='<div class="fire-map-popup">';return o+=`<h3>${s.title}</h3>`,o+=`<p>${s.description}</p>`,s.properties&&Object.keys(s.properties).length>0&&(o+='<div class="feature-properties">',Object.entries(s.properties).forEach(([c,f])=>{const a=c.replace(/([A-Z])/g," $1").replace(/^./,u=>u.toUpperCase());o+=`<div><strong>${a}:</strong> ${f}</div>`}),o+="</div>"),o+="</div>",o},p=s=>{try{const o=s.style;switch(s.type){case"marker":{const[c,f]=s.coordinates;if(isNaN(f)||isNaN(c))return console.warn(`[LayerManager] Invalid coordinates for feature ${s.id}: [${c}, ${f}]`),null;const a=n(s);if(!a)return console.warn(`[LayerManager] Failed to create icon for feature ${s.id}`),null;const u=ee.marker([f,c],{icon:a});try{u.bindPopup(d(s)),u.bindTooltip(s.title,{sticky:!0}),u.on("click",()=>{console.log("Feature clicked:",s.id),t(At(s.id))})}catch(g){console.warn(`[LayerManager] Error binding popup/tooltip for feature ${s.id}:`,g)}return u}case"polygon":{const c=s.coordinates[0].map(([a,u])=>[u,a]),f=ee.polygon(c,{color:o.color||"#3388ff",fillColor:o.fillColor||o.color||"#3388ff",fillOpacity:o.fillOpacity||.2,weight:o.weight||3,opacity:o.opacity||1});return f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t(At(s.id))}),f}case"polyline":{const c=s.coordinates.map(([a,u])=>[u,a]),f=ee.polyline(c,{color:o.color||"#3388ff",weight:o.weight||3,opacity:o.opacity||1});return f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t(At(s.id))}),f}case"circle":{const[c,f,a]=s.coordinates,u=ee.circle([f,c],{radius:a,color:o.color||"#3388ff",fillColor:o.fillColor||o.color||"#3388ff",fillOpacity:o.fillOpacity||.2,weight:o.weight||3,opacity:o.opacity||1});return u.bindPopup(d(s)),u.bindTooltip(s.title,{sticky:!0}),u.on("click",()=>{console.log("Feature clicked:",s.id),t(At(s.id))}),u}default:return console.warn(`[LayerManager] Unknown feature type: ${s.type}`),null}}catch(o){return console.error(`[LayerManager] Error creating feature layer for ${s.id}:`,o),null}};return k.useEffect(()=>{if(!i||!i.getContainer()){console.warn("[LayerManager] Map or container not ready, skipping layer update");return}const s=()=>{try{const o=i.getContainer();if(!o||!o.parentNode||!document.body.contains(o)){console.warn("[LayerManager] Map container not properly attached to DOM, skipping update");return}const c=i.getPanes();if(!c||!c.markerPane||!i._size||!i._pixelOrigin){console.warn("[LayerManager] Map panes or coordinate system not ready, skipping update");return}console.log("[LayerManager] Updating layers with",r.length,"layers"),[...r].sort((a,u)=>a.zIndex-u.zIndex).forEach(a=>{const u=l.current.get(a.id);if(u)try{i.removeLayer(u),l.current.delete(a.id)}catch(g){console.warn(`[LayerManager] Error removing existing layer ${a.id}:`,g)}if(a.visible&&a.features.length>0)try{const g=i.getContainer();if(!g||!g.parentNode||!document.body.contains(g)){console.warn(`[LayerManager] Map container not ready for layer ${a.id}`);return}const m=i.getPanes();if(!m||!m.markerPane){console.warn(`[LayerManager] Map panes not ready for layer ${a.id}`);return}const h=ee.layerGroup();let x=0;a.features.forEach(y=>{try{const D=p(y);D&&(h.addLayer(D),x++)}catch(D){console.warn(`[LayerManager] Error creating feature ${y.id}:`,D)}}),a.opacity!==void 0&&a.opacity!==1&&h.eachLayer(y=>{try{y instanceof ee.Marker?y.setOpacity(a.opacity):y instanceof ee.Path&&y.setStyle({opacity:a.opacity})}catch(D){console.warn("[LayerManager] Error setting opacity:",D)}}),x>0&&i.getContainer()&&(h.addTo(i),l.current.set(a.id,h),console.log(`[LayerManager] Added layer "${a.name}" with ${x}/${a.features.length} features`))}catch(g){console.error(`[LayerManager] Error creating layer ${a.id}:`,g)}})}catch(o){console.error("[LayerManager] Critical error during layer update:",o)}};i._loaded&&i.getPanes()&&i._size?s():i.whenReady(s)},[i,r,t]),k.useEffect(()=>()=>{i&&(l.current.forEach((s,o)=>{i.removeLayer(s),console.log(`[LayerManager] Cleaned up layer: ${o}`)}),l.current.clear())},[i]),null},Wo=({map:i})=>{const t=xe(),r=te(ei),l=te(Ye),n=k.useRef(null),d=k.useRef([]),p=l.find(a=>a.type==="feature"),s=k.useCallback((a,u)=>{i&&(console.log("[PureLeafletDrawTools] Adding event handler:",a),i.on(a,u),d.current.push({event:a,handler:u}))},[i]),o=k.useCallback(()=>{i&&(console.log("[PureLeafletDrawTools] Clearing all event handlers"),d.current.forEach(({event:a,handler:u})=>{i.off(a,u)}),d.current=[],i.dragging.enable(),i.doubleClickZoom.enable(),i.boxZoom.enable(),i.getContainer().style.cursor="")},[i]),c=()=>`feature_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,f=(a,u)=>{var m,h,x,y,D;let g=[];switch(u){case"marker":const v=a.getLatLng();g=[v.lng,v.lat];break;case"circle":const F=a,I=F.getLatLng(),w=F.getRadius();g=[I.lng,I.lat,w];break;case"polygon":g=[a.getLatLngs()[0].map(Z=>[Z.lng,Z.lat])];break;case"polyline":g=a.getLatLngs().map(Z=>[Z.lng,Z.lat]);break;case"rectangle":const de=a.getBounds();g=[[de.getSouthWest().lng,de.getSouthWest().lat],[de.getNorthEast().lng,de.getNorthEast().lat]];break}return{id:c(),type:u,title:`${u.charAt(0).toUpperCase()+u.slice(1)} Feature`,description:`Drawing created at ${new Date().toLocaleTimeString()}`,coordinates:g,style:{color:(m=r.options.style)==null?void 0:m.color,fillColor:(h=r.options.style)==null?void 0:h.fillColor,fillOpacity:(x=r.options.style)==null?void 0:x.fillOpacity,weight:(y=r.options.style)==null?void 0:y.weight,opacity:(D=r.options.style)==null?void 0:D.opacity},properties:{created:new Date().toISOString(),drawingMode:u},layerId:"user-drawings",created:new Date,modified:new Date}};return k.useEffect(()=>{if(!i)return;console.log("[PureLeafletDrawTools] Initializing simple drawing");const a=new ee.FeatureGroup;return i.addLayer(a),n.current=a,console.log("[PureLeafletDrawTools] Feature group created and added to map:",a),console.log("[PureLeafletDrawTools] Feature group attached to map:",i.hasLayer(a)),console.log("[PureLeafletDrawTools] Map has feature group in layers:",i.hasLayer(a)),()=>{i&&n.current&&(console.log("[PureLeafletDrawTools] Removing feature group from map"),i.removeLayer(n.current)),n.current=null}},[i,t]),k.useEffect(()=>{if(!(!i||!i.getContainer())){if(console.log("[PureLeafletDrawTools] Drawing mode changed to:",r.mode),o(),r.mode==="edit")console.log("[PureLeafletDrawTools] Activating edit mode"),i.getContainer().style.cursor="pointer",s("click",u=>{const g=u.originalEvent.target;g&&g.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Edit click on feature:",g),alert("Edit functionality - feature clicked! (Can be enhanced to show edit dialog)"))});else if(r.mode==="delete")console.log("[PureLeafletDrawTools] Activating delete mode"),i.getContainer().style.cursor="crosshair",s("click",u=>{const g=u.originalEvent.target;g&&g.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Delete click on feature:",g),i.eachLayer(m=>{if(m.getElement&&m.getElement()===g){console.log("[PureLeafletDrawTools] Deleting layer:",m);const h=m._fireEmsFeatureId;h&&(console.log("[PureLeafletDrawTools] Found feature ID for deletion:",h),t(vr(h)),console.log("[PureLeafletDrawTools] Feature deleted from Redux store")),i.removeLayer(m),console.log("[PureLeafletDrawTools] Layer removed from map")}}))});else if(r.mode){console.log("[PureLeafletDrawTools] Activating simple drawing mode:",r.mode);let a=!1,u=null,g=null;const m=y=>{var D,M,v,F,I,w,S,U,ie,de,Z,O,W,we,K,be,A,X,fe,Q;if(ee.DomEvent.stopPropagation(y.originalEvent),ee.DomEvent.preventDefault(y.originalEvent),console.log("[PureLeafletDrawTools] Drawing click detected:",r.mode,y.latlng),console.log("[PureLeafletDrawTools] Current drawing options:",r.options),console.log("[PureLeafletDrawTools] Current style options:",r.options.style),r.mode==="marker"){const _=((D=r.options.style)==null?void 0:D.color)||"#3388ff";console.log("[PureLeafletDrawTools] Creating marker with color:",_);const Se=ee.divIcon({className:"colored-marker",html:`<div style="
              background-color: ${_};
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,iconSize:[25,25],iconAnchor:[12,24],popupAnchor:[1,-24]}),me=ee.marker(y.latlng,{draggable:!0,icon:Se});if(me.addTo(i),console.log("[PureLeafletDrawTools] Colored marker added DIRECTLY to map:",me),n.current&&n.current.addLayer(me),!p)return;const Be=f(me,"marker"),{id:ze,created:Qe,modified:Ie,...Me}=Be;t(tt({layerId:p.id,feature:Me})),me._fireEmsFeatureId=Be.id,t(jt(null))}else if(!a&&r.mode==="circle"){a=!0,u=y.latlng,console.log("[PureLeafletDrawTools] Starting circle drawing at:",y.latlng);const _={radius:100,color:((M=r.options.style)==null?void 0:M.color)||"#3388ff",fillColor:((v=r.options.style)==null?void 0:v.fillColor)||"#3388ff",fillOpacity:((F=r.options.style)==null?void 0:F.fillOpacity)||.2,weight:((I=r.options.style)==null?void 0:I.weight)||3,opacity:((w=r.options.style)==null?void 0:w.opacity)||1};console.log("[PureLeafletDrawTools] Circle options:",_),console.log("[PureLeafletDrawTools] Fill color value:",(S=r.options.style)==null?void 0:S.fillColor),g=ee.circle(y.latlng,_),g.addTo(i),console.log("[PureLeafletDrawTools] Circle started, added DIRECTLY to map:",g)}else if(a&&r.mode==="circle"){if(console.log("[PureLeafletDrawTools] Finishing circle drawing"),g){if(!p)return;const _=f(g,"circle");console.log("[PureLeafletDrawTools] Circle feature created:",_);const{id:Se,created:me,modified:Be,...ze}=_;t(tt({layerId:p.id,feature:ze})),g._fireEmsFeatureId=_.id,console.log("[PureLeafletDrawTools] Circle feature dispatched to Redux")}t(jt(null))}else if(!a&&r.mode==="rectangle")a=!0,u=y.latlng,console.log("[PureLeafletDrawTools] Starting rectangle drawing"),g=ee.rectangle([[y.latlng.lat,y.latlng.lng],[y.latlng.lat,y.latlng.lng]],{color:((U=r.options.style)==null?void 0:U.color)||"#3388ff",fillColor:((ie=r.options.style)==null?void 0:ie.fillColor)||"#3388ff",fillOpacity:((de=r.options.style)==null?void 0:de.fillOpacity)||.2,weight:((Z=r.options.style)==null?void 0:Z.weight)||3,opacity:((O=r.options.style)==null?void 0:O.opacity)||1}),g.addTo(i),console.log("[PureLeafletDrawTools] Rectangle started, added DIRECTLY to map:",g);else if(a&&r.mode==="rectangle"){if(console.log("[PureLeafletDrawTools] Finishing rectangle drawing"),g){if(!p)return;const _=f(g,"rectangle");console.log("[PureLeafletDrawTools] Rectangle feature created:",_);const{id:Se,created:me,modified:Be,...ze}=_;t(tt({layerId:p.id,feature:ze})),g._fireEmsFeatureId=_.id,console.log("[PureLeafletDrawTools] Rectangle feature dispatched to Redux")}t(jt(null))}else if(!a&&(r.mode==="polygon"||r.mode==="polyline"))if(g){const _=r.mode==="polygon"?g.getLatLngs()[0]:g.getLatLngs();_.push(y.latlng),r.mode,g.setLatLngs(_),console.log(`[PureLeafletDrawTools] Added point to ${r.mode}:`,y.latlng)}else{const _=[y.latlng];r.mode==="polygon"?g=ee.polygon(_,{color:((W=r.options.style)==null?void 0:W.color)||"#3388ff",fillColor:((we=r.options.style)==null?void 0:we.fillColor)||"#3388ff",fillOpacity:((K=r.options.style)==null?void 0:K.fillOpacity)||.2,weight:((be=r.options.style)==null?void 0:be.weight)||3,opacity:((A=r.options.style)==null?void 0:A.opacity)||1}):g=ee.polyline(_,{color:((X=r.options.style)==null?void 0:X.color)||"#3388ff",weight:((fe=r.options.style)==null?void 0:fe.weight)||3,opacity:((Q=r.options.style)==null?void 0:Q.opacity)||1}),g.addTo(i),console.log(`[PureLeafletDrawTools] ${r.mode} started:`,g)}},h=y=>{if(!(!a||!g||!u))switch(ee.DomEvent.stopPropagation(y.originalEvent),r.mode){case"circle":const D=u.distanceTo(y.latlng);g.setRadius(D);break;case"rectangle":const M=ee.latLngBounds([u,y.latlng]);g.setBounds(M);break}};i.dragging.disable(),i.doubleClickZoom.disable(),i.boxZoom.disable(),console.log("[PureLeafletDrawTools] Map interactions disabled for drawing");const x=y=>{if((r.mode==="polygon"||r.mode==="polyline")&&(ee.DomEvent.stopPropagation(y.originalEvent),ee.DomEvent.preventDefault(y.originalEvent),g)){if(console.log(`[PureLeafletDrawTools] Finishing ${r.mode} with double-click`),!p)return;const D=f(g,r.mode);console.log(`[PureLeafletDrawTools] ${r.mode} feature created:`,D);const{id:M,created:v,modified:F,...I}=D;t(tt({layerId:p.id,feature:I})),g._fireEmsFeatureId=D.id,console.log(`[PureLeafletDrawTools] ${r.mode} feature dispatched to Redux`),t(jt(null))}};s("click",m),s("mousemove",h),s("dblclick",x),i.getContainer().style.cursor="crosshair"}return()=>{o()}}},[r.mode,i,t,o,s]),k.useEffect(()=>()=>{o()},[o]),null},No=({map:i,mapContainer:t})=>{const r=xe(),l=te(Ye),n=()=>`dropped_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;return k.useEffect(()=>{if(!i||!t||!i.getContainer()){console.warn("[DragDrop] Map or container not ready for drag/drop setup");return}const d=setTimeout(()=>{const p=i.getContainer();if(!p||!p.parentNode||!document.body.contains(p)){console.warn("[DragDrop] Map container not properly attached, skipping setup");return}if(!i.getPanes()){console.warn("[DragDrop] Map panes not ready, skipping setup");return}console.log("[DragDrop] Setting up drag and drop handlers");const o=f=>{f.preventDefault(),f.dataTransfer.dropEffect="copy"},c=f=>{var a;f.preventDefault();try{const u=f.dataTransfer.getData("application/json");if(!u){console.warn("[DragDrop] No icon data found in drop event");return}const g=JSON.parse(u);console.log("[DragDrop] Dropped icon:",g);let m;try{const y=i.getContainer();if(!y||!y.parentNode)throw new Error("Map container not available or not attached");const D=i.getPanes();if(!D||!i._loaded)throw new Error("Map not fully loaded");if(!i._size||!i._pixelOrigin||!D.mapPane)throw new Error("Map coordinate system not ready - missing _size, _pixelOrigin, or mapPane");const M=y.getBoundingClientRect(),v=f.clientX-M.left,F=f.clientY-M.top;if(v<0||F<0||v>M.width||F>M.height)throw new Error("Drop coordinates are outside map bounds");try{console.log("[DragDrop] Using legacy containerPointToLatLng method");const I=ee.point(v,F);m=i.containerPointToLatLng(I),console.log("[DragDrop] Legacy coordinate conversion:",{x:v,y:F,point:{x:I.x,y:I.y},latlng:{lat:m.lat,lng:m.lng}})}catch(I){console.error("[DragDrop] Legacy conversion failed, falling back:",I),m=ee.latLng(39.8283,-98.5795)}if(!m||isNaN(m.lat)||isNaN(m.lng))throw new Error("Invalid coordinates calculated");if(Math.abs(m.lat)>90||Math.abs(m.lng)>180)throw new Error("Coordinates outside valid geographic bounds")}catch(y){console.error("[DragDrop] Error calculating coordinates:",y);try{if(m=i.getCenter(),!m||isNaN(m.lat)||isNaN(m.lng))throw new Error("Map center is invalid")}catch(D){console.error("[DragDrop] Error getting map center:",D),m={lat:39.8283,lng:-98.5795}}}console.log("[DragDrop] Icon data received:",{id:g.id,name:g.name,url:g.url?g.url.substring(0,100)+"...":"NO URL",urlLength:g.url?g.url.length:0,category:g.category,size:g.size,color:g.color});let h=l.find(y=>y.type==="feature"&&y.visible);const x={id:n(),type:"marker",title:g.name||"Dropped Icon",description:`${g.name} placed at ${new Date().toLocaleTimeString()}`,coordinates:[m.lng,m.lat],layerId:(h==null?void 0:h.id)||"pending",style:{color:g.color||"#666666",icon:{id:g.id,name:g.name,category:g.category||"custom",url:g.url,size:g.size||"medium",color:g.color||"#666666",anchor:g.anchor||[16,32],popupAnchor:g.popupAnchor||[0,-32]}},properties:{droppedAt:new Date().toISOString(),iconSource:"library",originalIcon:g},created:new Date,modified:new Date};if(console.log("[DragDrop] Created feature with icon URL:",(a=x.style.icon)!=null&&a.url?"PRESENT":"MISSING"),h)console.log("[DragDrop] Adding feature to existing layer:",h.id,h.name),r(tt({layerId:h.id,feature:x}));else{console.log('[DragDrop] No suitable layer found. Creating "Dropped Icons" layer. Available layers:',l.map(D=>({id:D.id,name:D.name,type:D.type,visible:D.visible})));const y={name:"Dropped Icons",type:"feature",visible:!0,opacity:1,zIndex:l.length,features:[],style:{defaultStyle:{color:"#DC2626",fillColor:"#DC2626",fillOpacity:.3,weight:2,opacity:1}},metadata:{description:"Icons dropped from the icon library",source:"user-interaction",created:new Date,featureCount:0}};r(Zi(y)),setTimeout(()=>{const D=l,M=D.find(v=>v.name==="Dropped Icons");if(M)console.log("[DragDrop] Adding feature to newly created layer:",M.id),x.layerId=M.id,r(tt({layerId:M.id,feature:x}));else{const v=D.find(F=>F.type==="feature");v?(console.log("[DragDrop] Using first available feature layer:",v.id),r(tt({layerId:v.id,feature:x}))):console.error("[DragDrop] Failed to create or find any feature layer")}},300)}console.log("[DragDrop] Successfully created feature from dropped icon:",x.id)}catch(u){console.error("[DragDrop] Error handling drop event:",u)}};return t.addEventListener("dragover",o),t.addEventListener("drop",c),console.log("[DragDrop] Successfully set up drag and drop handlers"),()=>{t.removeEventListener("dragover",o),t.removeEventListener("drop",c),console.log("[DragDrop] Cleaned up drag and drop handlers")}},100);return()=>{clearTimeout(d)}},[i,t,r,l]),null},Oo=Ki.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});Ki.Marker.prototype.options.icon=Oo;const Uo=()=>{const i=xe(),t=te(mt),r=te(ei),l=te(Ye),[n,d]=k.useState(!1),[p]=k.useState(null),[s,o]=k.useState(null),c=k.useRef(null),f=t.baseMaps.find(m=>m.id===t.activeBaseMap),a=k.useCallback((m,h)=>{c.current=m,o(h),d(!0),typeof window<"u"&&(window.fireMapProInstance=m,console.log("✓ Pure Leaflet map exposed as window.fireMapProInstance"))},[]);if(gi.useEffect(()=>{i(ct(null))},[t.activeBaseMap,i]),!f)return e.jsx(E,{sx:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",bgcolor:"grey.100"},children:e.jsx(j,{variant:"h6",color:"text.secondary",children:"No base map configured"})});const u=m=>{m.preventDefault();try{const h=JSON.parse(m.dataTransfer.getData("application/json")),y=m.currentTarget.getBoundingClientRect(),D=m.clientX-y.left,M=m.clientY-y.top;if(c.current&&h){const v=c.current.containerPointToLatLng([D,M]),F=l.find(I=>I.type==="feature");if(F){const I={type:"marker",title:h.name,description:`${h.name} - Click to edit`,coordinates:[v.lng,v.lat],style:{...h,icon:h},properties:{iconCategory:h.category,droppedFrom:"icon-library"},layerId:F.id};i(tt({layerId:F.id,feature:I})),console.log("Icon placed successfully:",h.name,"at",v)}else i(ct("Please create a feature layer first to place icons"))}}catch(h){console.error("Error handling icon drop:",h),i(ct("Error placing icon on map"))}},g=m=>{m.preventDefault(),m.dataTransfer.dropEffect="copy"};return e.jsxs(E,{sx:{height:"100%",width:"100%",position:"relative",minHeight:"500px","& .leaflet-container":{height:"100% !important",width:"100% !important",position:"relative !important"}},onDrop:u,onDragOver:g,children:[e.jsxs(Ro,{onMapReady:a,children:[n&&c.current&&s&&e.jsx($o,{map:c.current}),n&&c.current&&s&&e.jsx(Wo,{map:c.current}),n&&c.current&&s&&e.jsx(No,{map:c.current,mapContainer:s}),n&&c.current&&!1]}),t.showCoordinates&&e.jsx(Io,{mouseCoords:p}),r.options.showMeasurements&&e.jsx(Po,{}),!1,t.showGrid&&e.jsx(E,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",backgroundImage:`
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,backgroundSize:"50px 50px",zIndex:1e3}}),!n&&e.jsx(E,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",bgcolor:"rgba(255, 255, 255, 0.9)",zIndex:2e3},children:e.jsx(j,{variant:"h6",color:"text.secondary",children:"Loading map..."})})]})},Go=()=>{const i=xe(),t=te(Ye),[r,l]=k.useState(new Set),[n,d]=k.useState(null),[p,s]=k.useState(!1),[o,c]=k.useState(null),[f,a]=k.useState({name:"",type:"feature",opacity:1,visible:!0}),u=w=>{const S=t.find(U=>U.id===w);S&&i(Cr({layerId:w,visible:!S.visible}))},g=(w,S)=>{i(jr({layerId:w,opacity:S/100}))},m=w=>{const S=new Set(r);S.has(w)?S.delete(w):S.add(w),l(S)},h=(w,S)=>{w.preventDefault(),d({mouseX:w.clientX-2,mouseY:w.clientY-4,layerId:S})},x=()=>{d(null)},y=()=>{const w={name:f.name||"New Layer",visible:f.visible,opacity:f.opacity,zIndex:t.length,type:f.type,features:[],metadata:{description:"",source:"User Created",created:new Date,featureCount:0}};i(Zi(w)),s(!1),a({name:"",type:"feature",opacity:1,visible:!0})},D=w=>{const S=t.find(U=>U.id===w);S&&(a({name:S.name,type:S.type,opacity:S.opacity,visible:S.visible}),c(w)),x()},M=()=>{o&&(i(kr({layerId:o,updates:{name:f.name,type:f.type,opacity:f.opacity,visible:f.visible}})),c(null),a({name:"",type:"feature",opacity:1,visible:!0}))},v=w=>{i(Er(w)),x()},F=w=>{switch(w){case"base":return e.jsx(pi,{});case"overlay":return e.jsx(St,{});case"reference":return e.jsx(pi,{});default:return e.jsx(St,{})}},I=w=>{switch(w){case"base":return"primary";case"overlay":return"secondary";case"reference":return"info";default:return"default"}};return e.jsxs(E,{children:[e.jsxs(E,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(j,{variant:"h6",sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(St,{}),"Layers"]}),e.jsx(Le,{startIcon:e.jsx(rl,{}),onClick:()=>s(!0),size:"small",variant:"outlined",children:"Add"})]}),e.jsx(ir,{dense:!0,children:t.map((w,S)=>e.jsxs(gi.Fragment,{children:[e.jsxs(rr,{sx:{border:"1px solid",borderColor:"divider",borderRadius:1,mb:1,bgcolor:"background.paper"},children:[e.jsx(It,{sx:{minWidth:32},children:e.jsx(fo,{sx:{cursor:"grab",color:"text.disabled"}})}),e.jsx(It,{sx:{minWidth:40},children:F(w.type)}),e.jsx(Ht,{primary:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(j,{variant:"body2",sx:{fontWeight:500},children:w.name}),e.jsx(ut,{label:w.type,size:"small",color:I(w.type),sx:{height:20,fontSize:"0.7rem"}})]}),secondary:`${w.features.length} features`}),e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(Re,{size:"small",onClick:()=>u(w.id),color:w.visible?"primary":"default",children:w.visible?e.jsx(Lo,{}):e.jsx(To,{})}),e.jsx(Re,{size:"small",onClick:()=>m(w.id),children:r.has(w.id)?e.jsx(ll,{}):e.jsx(He,{})}),e.jsx(Re,{size:"small",onClick:U=>h(U,w.id),children:e.jsx(wo,{})})]})]}),e.jsx(Xr,{in:r.has(w.id),timeout:"auto",children:e.jsxs(E,{sx:{pl:2,pr:2,pb:2},children:[e.jsxs(j,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Opacity: ",Math.round(w.opacity*100),"%"]}),e.jsx(Jt,{value:w.opacity*100,onChange:(U,ie)=>g(w.id,ie),min:0,max:100,size:"small",sx:{mb:1}}),w.metadata.description&&e.jsx(j,{variant:"caption",color:"text.secondary",children:w.metadata.description})]})})]},w.id))}),t.length===0&&e.jsx(E,{sx:{textAlign:"center",py:4},children:e.jsx(j,{variant:"body2",color:"text.secondary",children:"No layers yet. Create your first layer to get started."})}),e.jsxs(qr,{open:n!==null,onClose:x,anchorReference:"anchorPosition",anchorPosition:n!==null?{top:n.mouseY,left:n.mouseX}:void 0,children:[e.jsxs(T,{onClick:()=>n&&D(n.layerId),children:[e.jsx(It,{children:e.jsx(Xt,{fontSize:"small"})}),e.jsx(Ht,{children:"Edit Layer"})]}),e.jsxs(T,{onClick:()=>n&&v(n.layerId),children:[e.jsx(It,{children:e.jsx(mi,{fontSize:"small"})}),e.jsx(Ht,{children:"Delete Layer"})]})]}),e.jsxs(Qt,{open:p,onClose:()=>s(!1),maxWidth:"sm",fullWidth:!0,children:[e.jsx(qt,{children:"Create New Layer"}),e.jsxs(_t,{children:[e.jsx(re,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:f.name,onChange:w=>a({...f,name:w.target.value}),sx:{mb:2}}),e.jsxs(ne,{fullWidth:!0,sx:{mb:2},children:[e.jsx(ae,{children:"Layer Type"}),e.jsxs(se,{value:f.type,label:"Layer Type",onChange:w=>a({...f,type:w.target.value}),children:[e.jsx(T,{value:"feature",children:"Feature Layer"}),e.jsx(T,{value:"overlay",children:"Overlay Layer"}),e.jsx(T,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(j,{variant:"body2",children:"Visible:"}),e.jsx(De,{checked:f.visible,onChange:w=>a({...f,visible:w.target.checked})})]})]}),e.jsxs(Zt,{children:[e.jsx(Le,{onClick:()=>s(!1),children:"Cancel"}),e.jsx(Le,{onClick:y,variant:"contained",children:"Create"})]})]}),e.jsxs(Qt,{open:o!==null,onClose:()=>c(null),maxWidth:"sm",fullWidth:!0,children:[e.jsx(qt,{children:"Edit Layer"}),e.jsxs(_t,{children:[e.jsx(re,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:f.name,onChange:w=>a({...f,name:w.target.value}),sx:{mb:2}}),e.jsxs(ne,{fullWidth:!0,sx:{mb:2},children:[e.jsx(ae,{children:"Layer Type"}),e.jsxs(se,{value:f.type,label:"Layer Type",onChange:w=>a({...f,type:w.target.value}),children:[e.jsx(T,{value:"feature",children:"Feature Layer"}),e.jsx(T,{value:"overlay",children:"Overlay Layer"}),e.jsx(T,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(j,{variant:"body2",children:"Visible:"}),e.jsx(De,{checked:f.visible,onChange:w=>a({...f,visible:w.target.checked})})]})]}),e.jsxs(Zt,{children:[e.jsx(Le,{onClick:()=>c(null),children:"Cancel"}),e.jsx(Le,{onClick:M,variant:"contained",children:"Update"})]})]})]})},Ho=()=>{const i=xe(),t=te(ei),r=te(Ye),[l,n]=k.useState(""),d=[{mode:"marker",icon:e.jsx(Co,{}),label:"Marker"},{mode:"polyline",icon:e.jsx(ol,{}),label:"Line"},{mode:"polygon",icon:e.jsx(so,{}),label:"Polygon"},{mode:"circle",icon:e.jsx(vo,{}),label:"Circle"},{mode:"rectangle",icon:e.jsx(ho,{}),label:"Rectangle"}],p=a=>{const u=a===t.mode?null:a;console.log("[DrawingTools UI] Button clicked:",{clickedMode:a,currentMode:t.mode,newMode:u}),i(jt(u))},s=(a,u)=>{console.log("[DrawingTools] Style change:",{property:a,value:u}),console.log("[DrawingTools] Current style before update:",t.options.style);const g={style:{...t.options.style,[a]:u}};console.log("[DrawingTools] New options to dispatch:",g),i(ki(g))},o=(a,u)=>{i(ki({[a]:u}))},c=(a,u)=>{i(Xi({[a]:u}))},f=r.filter(a=>a.type==="feature");return e.jsxs(E,{children:[e.jsxs(j,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(Xt,{}),"Drawing Tools"]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:1},children:"Drawing Mode"}),e.jsxs(L,{container:!0,spacing:1,children:[d.map(({mode:a,icon:u,label:g})=>e.jsx(L,{size:6,children:e.jsx(Vt,{title:g,children:e.jsx(ci,{value:a||"",selected:t.mode===a,onClick:()=>p(a),sx:{width:"100%",height:48},size:"small",children:u})})},a)),e.jsx(L,{size:6,children:e.jsx(Vt,{title:"Edit Features",children:e.jsx(ci,{value:"edit",selected:t.mode==="edit",onClick:()=>p("edit"),sx:{width:"100%",height:48},size:"small",children:e.jsx(Xt,{})})})}),e.jsx(L,{size:6,children:e.jsx(Vt,{title:"Delete Features",children:e.jsx(ci,{value:"delete",selected:t.mode==="delete",onClick:()=>p("delete"),sx:{width:"100%",height:48},size:"small",color:"error",children:e.jsx(mi,{})})})})]})]}),f.length>0&&e.jsx(le,{sx:{p:2,mb:2},children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Target Layer"}),e.jsx(se,{value:l,label:"Target Layer",onChange:a=>n(a.target.value),children:f.map(a=>e.jsxs(T,{value:a.id,children:[a.name," (",a.features.length," features)"]},a.id))})]})}),t.mode&&t.mode!=="edit"&&t.mode!=="delete"&&e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Style Options"}),e.jsxs(E,{sx:{mb:2},children:[e.jsx(j,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Stroke Color"}),e.jsx(L,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(a=>e.jsx(L,{size:"auto",children:e.jsx(E,{sx:{width:32,height:32,backgroundColor:a,border:t.options.style.color===a?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("color",a)})},a))})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(E,{sx:{mb:2},children:[e.jsx(j,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Fill Color"}),e.jsx(L,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(a=>e.jsx(L,{size:"auto",children:e.jsx(E,{sx:{width:32,height:32,backgroundColor:a,border:t.options.style.fillColor===a?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("fillColor",a)})},a))})]}),e.jsxs(E,{sx:{mb:2},children:[e.jsxs(j,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Stroke Width: ",t.options.style.weight,"px"]}),e.jsx(Jt,{value:t.options.style.weight||3,onChange:(a,u)=>s("weight",u),min:1,max:10,step:1,size:"small"})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(E,{sx:{mb:2},children:[e.jsxs(j,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Fill Opacity: ",Math.round((t.options.style.fillOpacity||.3)*100),"%"]}),e.jsx(Jt,{value:(t.options.style.fillOpacity||.3)*100,onChange:(a,u)=>s("fillOpacity",u/100),min:0,max:100,step:5,size:"small"})]})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Drawing Options"}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.snapToGrid||!1,onChange:a=>o("snapToGrid",a.target.checked),size:"small"}),label:"Snap to Grid",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.showMeasurements||!1,onChange:a=>o("showMeasurements",a.target.checked),size:"small"}),label:"Show Measurements",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.options.allowEdit||!1,onChange:a=>o("allowEdit",a.target.checked),size:"small"}),label:"Allow Editing",sx:{display:"flex"}})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Map Display"}),e.jsx(pe,{control:e.jsx(De,{checked:!1,onChange:a=>c("showGrid",a.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:!0,onChange:a=>c("showCoordinates",a.target.checked),size:"small"}),label:"Show Coordinates",sx:{display:"flex"}})]}),t.mode&&e.jsxs(le,{sx:{p:2,bgcolor:"primary.light",color:"primary.contrastText"},children:[e.jsxs(j,{variant:"subtitle2",sx:{mb:1},children:["Active: ",t.mode.charAt(0).toUpperCase()+t.mode.slice(1)," Mode"]}),e.jsxs(j,{variant:"caption",children:[t.mode==="marker"&&"Click on the map to place markers",t.mode==="polyline"&&"Click points to draw a line",t.mode==="polygon"&&"Click points to draw a polygon",t.mode==="circle"&&"Click and drag to draw a circle",t.mode==="rectangle"&&"Click and drag to draw a rectangle",t.mode==="edit"&&"Click features to edit them",t.mode==="delete"&&"Click features to delete them"]})]}),f.length===0&&e.jsxs(le,{sx:{p:2,bgcolor:"warning.light",color:"warning.contrastText"},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:1},children:"No Feature Layers"}),e.jsx(j,{variant:"caption",children:"Create a feature layer first to start drawing."})]})]})},Y=(i,t,r,l,n="medium",d="#333333")=>{const p=encodeURIComponent(l);return{id:i,name:t,category:r,url:`data:image/svg+xml,${p}`,size:n,color:d,anchor:n==="small"?[12,12]:n==="large"?[20,40]:[16,32],popupAnchor:[0,n==="small"?-12:n==="large"?-40:-32]}},Vo=[Y("fire-engine","Fire Engine","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626")],Yo=[Y("als-ambulance","ALS Ambulance","ems-units",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1E40AF")],Qo=[Y("structure-fire","Structure Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#22C55E")],_o=[Y("fire-station","Fire Station","facilities",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF")],fi={"fire-apparatus":Vo,"ems-units":Yo,"incident-types":Qo,facilities:_o,prevention:[Y("fire-extinguisher","Fire Extinguisher","prevention",`<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280")],custom:[]};Object.values(fi).flat();const Zo={"fire-apparatus":e.jsx(xo,{}),"ems-units":e.jsx(mo,{}),"incident-types":e.jsx(Jr,{}),facilities:e.jsx(ao,{}),prevention:e.jsx(ko,{}),"energy-systems":e.jsx(go,{}),custom:e.jsx(ii,{})},Xo=()=>{var h;const i=te(Ye),[t,r]=k.useState("fire-apparatus"),[l,n]=k.useState("medium"),[d,p]=k.useState("#DC2626"),[s,o]=k.useState(""),c=Object.keys(fi),a=(fi[t]||[]).filter(x=>x.name.toLowerCase().includes(s.toLowerCase())),u=i.filter(x=>x.type==="feature"),g=(x,y)=>{const D={...y,size:l,color:d};x.dataTransfer.setData("application/json",JSON.stringify(D)),x.dataTransfer.effectAllowed="copy";const M=x.currentTarget.cloneNode(!0);M.style.transform="scale(1.2)",M.style.opacity="0.8",document.body.appendChild(M),x.dataTransfer.setDragImage(M,16,16),setTimeout(()=>document.body.removeChild(M),0)},m=[{name:"Fire Red",value:"#DC2626"},{name:"EMS Blue",value:"#1E40AF"},{name:"Safety Green",value:"#059669"},{name:"Warning Orange",value:"#F59E0B"},{name:"Medical Cross",value:"#EF4444"},{name:"Industrial Gray",value:"#6B7280"},{name:"Hazmat Yellow",value:"#FCD34D"},{name:"Emergency Purple",value:"#7C3AED"}];return e.jsxs(E,{children:[e.jsxs(j,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ii,{}),"Professional Icons"]}),e.jsx(re,{fullWidth:!0,size:"small",placeholder:"Search fire & EMS icons...",value:s,onChange:x=>o(x.target.value),InputProps:{startAdornment:e.jsx(lr,{position:"start",children:e.jsx(Kr,{})})},sx:{mb:2}}),e.jsx(xi,{value:t,onChange:(x,y)=>r(y),variant:"scrollable",scrollButtons:"auto",sx:{mb:2,minHeight:"auto"},children:c.map(x=>e.jsx(kt,{value:x,icon:Zo[x],label:x.replace("-"," "),sx:{minHeight:"auto",py:1,fontSize:"0.75rem",textTransform:"capitalize"}},x))}),e.jsxs(le,{sx:{p:2,mb:2,bgcolor:"grey.50"},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2,fontWeight:"bold"},children:"Icon Settings"}),e.jsxs(L,{container:!0,spacing:2,children:[e.jsx(L,{size:6,children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Size"}),e.jsxs(se,{value:l,label:"Size",onChange:x=>n(x.target.value),children:[e.jsx(T,{value:"small",children:"Small (20px)"}),e.jsx(T,{value:"medium",children:"Medium (32px)"}),e.jsx(T,{value:"large",children:"Large (48px)"}),e.jsx(T,{value:"extra-large",children:"Extra Large (64px)"})]})]})}),e.jsx(L,{size:6,children:e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Color Theme"}),e.jsx(se,{value:d,label:"Color Theme",onChange:x=>p(x.target.value),children:m.map(x=>e.jsx(T,{value:x.value,children:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(E,{sx:{width:16,height:16,backgroundColor:x.value,borderRadius:"50%",border:"1px solid #ccc"}}),x.name]})},x.value))})]})})]})]}),e.jsxs(E,{sx:{mb:2},children:[e.jsxs(E,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsxs(j,{variant:"subtitle2",sx:{fontWeight:"bold",textTransform:"uppercase"},children:[t.replace("-"," ")," (",a.length,")"]}),e.jsx(ut,{label:`${l} • ${(h=m.find(x=>x.value===d))==null?void 0:h.name}`,size:"small",color:"primary",variant:"outlined"})]}),a.length>0?e.jsx(L,{container:!0,spacing:1,children:a.map(x=>e.jsx(L,{size:4,children:e.jsx(Vt,{title:`${x.name} - Drag to map`,children:e.jsxs(le,{sx:{p:1,textAlign:"center",cursor:"grab",transition:"all 0.2s ease","&:hover":{bgcolor:"primary.light",transform:"scale(1.05)",boxShadow:2},"&:active":{cursor:"grabbing",transform:"scale(0.95)"}},draggable:!0,onDragStart:y=>g(y,x),children:[e.jsx(E,{component:"img",src:x.url,alt:x.name,sx:{width:l==="small"?20:l==="large"?40:32,height:l==="small"?20:l==="large"?40:32,mb:.5,filter:d!==x.color?`hue-rotate(${qo(x.color,d)}deg)`:"none"}}),e.jsx(j,{variant:"caption",sx:{display:"block",fontSize:"0.65rem",lineHeight:1.2,fontWeight:500},children:x.name})]})})},x.id))}):e.jsx(E,{sx:{textAlign:"center",py:4},children:e.jsx(j,{variant:"body2",color:"text.secondary",children:s?"No icons match your search":"No icons in this category"})})]}),u.length===0&&e.jsxs(Tt,{severity:"info",sx:{mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:1},children:"Create a layer first"}),e.jsx(j,{variant:"caption",children:"Go to the Layers tab and create a feature layer to place icons on the map."})]}),e.jsxs(le,{sx:{p:2,bgcolor:"info.light",color:"info.contrastText"},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:1,fontWeight:"bold"},children:"How to Use"}),e.jsxs(E,{component:"ul",sx:{pl:2,m:0,"& li":{mb:.5}},children:[e.jsx("li",{children:"Select icon size and color above"}),e.jsx("li",{children:"Drag any icon from the library"}),e.jsx("li",{children:"Drop it on the map to place a marker"}),e.jsx("li",{children:"Click the marker to edit its properties"})]})]})]})};function qo(i,t){const r={"#DC2626":0,"#EF4444":5,"#F59E0B":45,"#FCD34D":60,"#059669":120,"#1E40AF":240,"#7C3AED":270,"#6B7280":0},l=r[i]||0;return(r[t]||0)-l}const Ko=()=>{const i=xe(),t=()=>{i(qi())};return e.jsxs(E,{children:[e.jsxs(j,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(xt,{}),"Export"]}),e.jsxs(le,{sx:{p:2},children:[e.jsx(j,{variant:"body2",color:"text.secondary",sx:{mb:2},children:"Generate professional maps with the new export system"}),e.jsx(Le,{variant:"contained",onClick:t,startIcon:e.jsx(xt,{}),fullWidth:!0,children:"Open Export Options"})]})]})},Jo=()=>{const i=xe(),t=te(mt),r=n=>{i(Sr(n))},l=(n,d)=>{i(Xi({[n]:d}))};return e.jsxs(E,{children:[e.jsxs(j,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(or,{}),"Settings"]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Base Map"}),e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Base Map"}),e.jsx(se,{value:t.activeBaseMap,label:"Base Map",onChange:n=>r(n.target.value),children:t.baseMaps.map(n=>e.jsx(T,{value:n.id,children:n.name},n.id))})]})]}),e.jsxs(le,{sx:{p:2,mb:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Display Options"}),e.jsx(pe,{control:e.jsx(De,{checked:t.showCoordinates,onChange:n=>l("showCoordinates",n.target.checked),size:"small"}),label:"Show Coordinates",sx:{mb:1,display:"flex"}}),e.jsx(pe,{control:e.jsx(De,{checked:t.showGrid,onChange:n=>l("showGrid",n.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}})]}),e.jsxs(le,{sx:{p:2},children:[e.jsx(j,{variant:"subtitle2",sx:{mb:2},children:"Measurement Units"}),e.jsxs(ne,{fullWidth:!0,size:"small",children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:t.measurementUnits,label:"Units",onChange:n=>l("measurementUnits",n.target.value),children:[e.jsx(T,{value:"metric",children:"Metric (m, km)"}),e.jsx(T,{value:"imperial",children:"Imperial (ft, mi)"})]})]})]})]})},en=({mode:i})=>{const t=xe(),r=te(ui),l=[{id:"layers",label:"Layers",icon:e.jsx(St,{}),component:Go},{id:"drawing",label:"Drawing",icon:e.jsx(Xt,{}),component:Ho,disabled:i==="view"},{id:"icons",label:"Icons",icon:e.jsx(ii,{}),component:Xo,disabled:i==="view"},{id:"export",label:"Export",icon:e.jsx(xt,{}),component:Ko},{id:"settings",label:"Settings",icon:e.jsx(or,{}),component:Jo}],n=(s,o)=>{t(Fr(o))},p=(l.find(s=>s.id===r.activePanel)||l[0]).component;return e.jsxs(E,{sx:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx(le,{elevation:0,sx:{borderBottom:1,borderColor:"divider"},children:e.jsx(xi,{value:r.activePanel||"layers",onChange:n,variant:"scrollable",scrollButtons:"auto",orientation:"horizontal",sx:{minHeight:48,"& .MuiTab-root":{minWidth:60,minHeight:48}},children:l.map(s=>e.jsx(kt,{value:s.id,icon:s.icon,label:s.label,disabled:s.disabled,sx:{fontSize:"0.75rem","&.Mui-selected":{color:"primary.main"}}},s.id))})}),e.jsx(E,{sx:{flex:1,overflow:"auto",p:2},children:e.jsx(p,{})})]})},tn=()=>{const i=xe(),t=()=>{i(Dr())};return e.jsxs(Qt,{open:!0,onClose:t,maxWidth:"md",fullWidth:!0,children:[e.jsx(qt,{sx:{textAlign:"center",pb:1},children:"Welcome to Fire Map Pro"}),e.jsxs(_t,{children:[e.jsx(j,{variant:"h6",sx:{mb:2,textAlign:"center",color:"primary.main"},children:"Professional Mapping for Fire & EMS Operations"}),e.jsxs(j,{variant:"body1",paragraph:!0,children:[e.jsx("strong",{children:"Ready to use immediately:"})," Your map is pre-loaded with fire stations, hospitals, hydrants, and recent incidents to provide instant situational awareness."]}),e.jsx(j,{variant:"body1",paragraph:!0,children:e.jsx("strong",{children:"Key Features:"})}),e.jsxs(E,{component:"ul",sx:{pl:2,mb:2},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Live Data Layers:"})," Fire stations, hospitals, hydrants, response zones"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Drawing Tools:"})," Add markers, areas, and annotations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Icon Library:"})," Professional fire & EMS symbols"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Layer Controls:"})," Toggle visibility and adjust transparency"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Export Options:"})," Generate professional maps and reports"]})]}),e.jsx(j,{variant:"body2",color:"text.secondary",sx:{textAlign:"center"},children:"Click layers in the sidebar to explore your operational data →"})]}),e.jsx(Zt,{sx:{justifyContent:"center",pb:3},children:e.jsx(Le,{onClick:t,variant:"contained",size:"large",children:"Start Mapping"})})]})};class rn{static async exportMap(t,r,l){console.error("[EMERGENCY DEBUG] ExportService.exportMap() STARTED"),console.error("[EMERGENCY DEBUG] Configuration received:",r);const{basic:n}=r;try{if(console.error("[EMERGENCY DEBUG] Starting export process..."),l==null||l(10,"Preparing export..."),!t)throw new Error("Map element not found");switch(l==null||l(20,"Capturing map data..."),console.error("[EMERGENCY DEBUG] Routing to format:",n.format),n.format){case"png":case"jpg":case"tiff":case"webp":console.error("[EMERGENCY DEBUG] Calling exportRasterImage"),await this.exportRasterImage(t,r,l),console.error("[EMERGENCY DEBUG] exportRasterImage completed");break;case"pdf":await this.exportPDF(t,r,l);break;case"svg":await this.exportSVG(t,r,l);break;case"eps":await this.exportEPS(t,r,l);break;case"geojson":case"kml":case"geopdf":await this.exportGISFormat(t,r,l);break;default:throw new Error(`Export format ${n.format} not supported`)}l==null||l(100,"Export completed successfully")}catch(d){throw console.error("Export failed:",d),d}}static async exportRasterImage(t,r,l){console.error("[EMERGENCY DEBUG] exportRasterImage() STARTED");const{basic:n,layout:d}=r;console.error("[EMERGENCY DEBUG] Basic config:",n),console.error("[EMERGENCY DEBUG] Layout config:",d),l==null||l(30,"Capturing map screenshot..."),console.error("[EMERGENCY DEBUG] About to capture map with html2canvas"),console.error("[EMERGENCY DEBUG] Map element:",t),console.error("[EMERGENCY DEBUG] Map element dimensions:",{width:t.offsetWidth,height:t.offsetHeight,innerHTML:t.innerHTML.substring(0,200)+"..."});const{default:p}=await Si(async()=>{const{default:a}=await import("./html2canvas.esm-CBrSDip1.js");return{default:a}},[]),s=await p(t,{useCORS:!0,allowTaint:!0,scale:n.dpi/96,backgroundColor:"#ffffff"});console.error("[EMERGENCY DEBUG] html2canvas completed, canvas size:",{width:s.width,height:s.height}),console.error("[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout"),l==null||l(60,"Processing layout elements..."),console.log("[Export] Full export configuration:",{basic:r.basic,layout:{customLayout:d.customLayout,selectedTemplate:d.selectedTemplate,elementsCount:d.elements.length,elements:d.elements}});let o=s;if(d.customLayout&&(d.selectedTemplate||d.elements.length>0)){console.log("[Export] Applying custom layout with",d.elements.length,"elements"),console.error("[EMERGENCY DEBUG] About to call applyLayoutTemplate");try{o=await this.applyLayoutTemplate(s,r),console.error("[EMERGENCY DEBUG] applyLayoutTemplate completed successfully"),console.error("[EMERGENCY DEBUG] Returned final canvas dimensions:",o.width,"x",o.height),console.error("[EMERGENCY DEBUG] Layout template applied successfully")}catch(a){throw console.error("[EMERGENCY DEBUG] applyLayoutTemplate FAILED:",a),a}}else console.log("[Export] Using basic layout - no custom elements");l==null||l(80,"Generating final image...");const c=n.format==="jpg"?"jpeg":n.format,f=n.format==="jpg"?.9:void 0;console.error("[EMERGENCY DEBUG] Final canvas before conversion:",{canvasSize:{width:o.width,height:o.height},format:c,quality:f}),console.error("[EMERGENCY DEBUG] Ready to convert canvas to blob"),o.toBlob(a=>{console.error("[EMERGENCY DEBUG] toBlob callback executed, blob size:",a==null?void 0:a.size),a?(console.error("[EMERGENCY DEBUG] Downloading blob with filename:",`${n.title||"fire-map"}.${n.format}`),this.downloadBlob(a,`${n.title||"fire-map"}.${n.format}`)):console.error("[EMERGENCY DEBUG] toBlob failed - blob is null!")},`image/${c}`,f)}static async exportPDF(t,r,l){const{basic:n,advanced:d,layout:p}=r;l==null||l(30,"Capturing map for PDF...");const{default:s}=await Si(async()=>{const{default:h}=await import("./html2canvas.esm-CBrSDip1.js");return{default:h}},[]),o=await s(t,{useCORS:!0,allowTaint:!0,scale:n.dpi/96});l==null||l(50,"Creating PDF document...");const{width:c,height:f}=this.getPaperDimensions(n.paperSize,n.orientation),a=new nl({orientation:n.orientation,unit:"mm",format:n.paperSize==="custom"?[d.customWidth,d.customHeight]:n.paperSize});l==null||l(70,"Adding elements to PDF...");const u=o.toDataURL("image/png"),g=c-20,m=o.height*g/o.width;a.addImage(u,"PNG",10,10,g,m),n.includeTitle&&n.title&&(a.setFontSize(16),a.text(n.title,c/2,m+25,{align:"center"})),n.subtitle&&(a.setFontSize(12),a.text(n.subtitle,c/2,m+35,{align:"center"})),p.customLayout&&p.elements.length>0&&await this.addLayoutElementsToPDF(a,p.elements,{width:c,height:f}),l==null||l(90,"Finalizing PDF..."),a.save(`${n.title||"fire-map"}.pdf`)}static async exportSVG(t,r,l){throw l==null||l(50,"Generating SVG..."),new Error("SVG export is not yet implemented. Please use PNG or PDF format.")}static async exportEPS(t,r,l){throw new Error("EPS export is not yet implemented. Please use PNG or PDF format.")}static async exportGISFormat(t,r,l){throw new Error("GIS format export is not yet implemented. Please use PNG or PDF format.")}static async applyLayoutTemplate(t,r){console.error("[EMERGENCY DEBUG] applyLayoutTemplate ENTRY");const{basic:l,layout:n}=r;console.error("[EMERGENCY DEBUG] Getting paper dimensions for:",l.paperSize,l.orientation);const{width:d,height:p}=this.getPaperDimensions(l.paperSize,l.orientation);console.error("[EMERGENCY DEBUG] Paper dimensions:",{width:d,height:p});const s=document.createElement("canvas"),o=s.getContext("2d",{willReadFrequently:!0}),c=d/25.4*l.dpi,f=p/25.4*l.dpi;switch(s.width=c,s.height=f,console.error("[EMERGENCY DEBUG] Layout canvas dimensions:",s.width,"x",s.height),console.error("[EMERGENCY DEBUG] Map canvas dimensions:",t.width,"x",t.height),console.error("[EMERGENCY DEBUG] Layout canvas setup complete"),o.fillStyle="#ffffff",o.fillRect(0,0,c,f),console.error("[EMERGENCY DEBUG] Layout canvas created:",{pixelSize:{width:c,height:f},paperSize:{width:d,height:p},dpi:l.dpi,mapCanvasSize:{width:t.width,height:t.height}}),console.log("[Export] Applying layout template:",n.selectedTemplate),n.selectedTemplate){case"standard":console.log("[Export] Using standard template with custom layout"),await this.applyCustomLayout(o,t,r,c,f);break;case"professional":console.log("[Export] Using professional template"),await this.applyProfessionalTemplate(o,t,r,c,f);break;case"presentation":console.log("[Export] Using presentation template"),await this.applyPresentationTemplate(o,t,r,c,f);break;case"tactical":console.log("[Export] Using tactical template"),await this.applyTacticalTemplate(o,t,r,c,f);break;default:console.log("[Export] Using custom layout with elements"),await this.applyCustomLayout(o,t,r,c,f)}return console.error("[EMERGENCY DEBUG] Layout canvas complete - returning to caller"),s}static async applyProfessionalTemplate(t,r,l,n,d){console.log("[Export] Professional template using custom layout logic"),await this.applyCustomLayout(t,r,l,n,d)}static async applyPresentationTemplate(t,r,l,n,d){console.log("[Export] Presentation template using custom layout logic"),await this.applyCustomLayout(t,r,l,n,d)}static async applyTacticalTemplate(t,r,l,n,d){console.log("[Export] Tactical template using custom layout logic"),await this.applyCustomLayout(t,r,l,n,d)}static async applyCustomLayout(t,r,l,n,d){var c,f,a,u,g,m,h,x,y,D,M,v,F,I,w,S,U,ie,de,Z,O,W,we,K,be,A,X,fe,Q,_,Se,me,Be,ze,Qe,Ie,Me,We,Ne,Fe,ue;console.error("[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT"),console.error("[EMERGENCY DEBUG] Canvas size:",{width:n,height:d});const{layout:p,basic:s}=l;console.error("[EMERGENCY DEBUG] Configuration received:",{layout:p,basic:s}),console.log("[Export] Layout data:",{elementsCount:p.elements.length,elements:p.elements.map(b=>({type:b.type,visible:b.visible,id:b.id}))});const o=[...p.elements].sort((b,N)=>b.zIndex-N.zIndex);console.log("[Export] Processing",o.length,"layout elements:",o.map(b=>({type:b.type,visible:b.visible})));for(const b of o){if(console.log("[Export] Processing element:",{type:b.type,visible:b.visible,position:{x:b.x,y:b.y},size:{width:b.width,height:b.height},content:b.content}),!b.visible){console.log("[Export] Skipping invisible element:",b.type);continue}const N=b.x/100*n,G=b.y/100*d,z=b.width/100*n,H=b.height/100*d;switch(console.error("[CANVAS DEBUG] Element",b.type,"position:",{x:N,y:G,w:z,h:H},"Canvas:",{width:n,height:d}),console.log("[Export] Rendering element:",b.type,"at",{x:N,y:G,w:z,h:H}),b.type){case"map":console.error("[EMERGENCY DEBUG] Drawing map canvas:",{mapCanvasSize:{width:r.width,height:r.height},drawPosition:{x:N,y:G,w:z,h:H},layoutCanvasSize:{width:t.canvas.width,height:t.canvas.height},elementPosition:{x:b.x,y:b.y,width:b.width,height:b.height}}),console.error("[EMERGENCY DEBUG] Drawing map canvas to layout"),t.drawImage(r,N,G,z,H),console.error("[EMERGENCY DEBUG] Map canvas drawn to layout canvas");break;case"title":console.log("[Export] Title element debug:",{elementContent:b.content,textAlign:(c=b.content)==null?void 0:c.textAlign,elementType:b.type}),t.fillStyle=((f=b.content)==null?void 0:f.color)||"#333333";const rt=((a=b.content)==null?void 0:a.fontSize)||Math.max(16,z*.05),dt=((u=b.content)==null?void 0:u.fontWeight)||"bold";t.font=`${dt} ${rt}px ${((g=b.content)==null?void 0:g.fontFamily)||"Arial"}`,t.textAlign=((m=b.content)==null?void 0:m.textAlign)||"left",console.log("[Export] Title canvas textAlign set to:",t.textAlign);let Ue=N;t.textAlign==="center"?Ue=N+z/2:t.textAlign==="right"&&(Ue=N+z),console.log("[Export] Title position:",{originalX:N,adjustedX:Ue,width:z,alignment:t.textAlign}),t.fillText(((h=b.content)==null?void 0:h.text)||s.title||"Untitled Map",Ue,G+rt);break;case"subtitle":console.log("[Export] Rendering subtitle:",{elementContent:b.content,basicSubtitle:s.subtitle,finalText:((x=b.content)==null?void 0:x.text)||s.subtitle||"Map Subtitle"}),t.fillStyle=((y=b.content)==null?void 0:y.color)||"#666666";const _e=((D=b.content)==null?void 0:D.fontSize)||Math.max(12,z*.04),Ze=((M=b.content)==null?void 0:M.fontWeight)||"normal";t.font=`${Ze} ${_e}px ${((v=b.content)==null?void 0:v.fontFamily)||"Arial"}`,t.textAlign=((F=b.content)==null?void 0:F.textAlign)||"left";const lt=((I=b.content)==null?void 0:I.text)||s.subtitle||"Map Subtitle";let C=N;t.textAlign==="center"?C=N+z/2:t.textAlign==="right"&&(C=N+z),console.log("[Export] Drawing subtitle text:",lt,"at position:",{x:C,y:G+_e}),console.log("[Export] Subtitle canvas state:",{fillStyle:t.fillStyle,font:t.font,textAlign:t.textAlign,canvasSize:{width:t.canvas.width,height:t.canvas.height},elementBounds:{x:N,y:G,w:z,h:H}}),t.fillText(lt,C,G+_e);break;case"text":t.fillStyle=((w=b.content)==null?void 0:w.color)||"#333333";const B=((S=b.content)==null?void 0:S.fontSize)||Math.max(12,z*.03),P=((U=b.content)==null?void 0:U.fontWeight)||"normal";t.font=`${P} ${B}px ${((ie=b.content)==null?void 0:ie.fontFamily)||"Arial"}`,t.textAlign=((de=b.content)==null?void 0:de.textAlign)||"left";const J=(((Z=b.content)==null?void 0:Z.text)||"").split(`
`),$=B*1.2;J.forEach((Ee,ke)=>{t.fillText(Ee,N,G+B+ke*$)});break;case"legend":t.strokeStyle=((O=b.content)==null?void 0:O.borderColor)||"#cccccc",t.fillStyle=((W=b.content)==null?void 0:W.backgroundColor)||"#ffffff",t.fillRect(N,G,z,H),b.showLegendBorder!==!1&&t.strokeRect(N,G,z,H),t.fillStyle=((we=b.content)==null?void 0:we.color)||"#333333";const ce=((K=b.content)==null?void 0:K.fontSize)||Math.max(12,z*.04),ye=((be=b.content)==null?void 0:be.fontWeight)||"bold";t.font=`${ye} ${ce}px ${((A=b.content)==null?void 0:A.fontFamily)||"Arial"}`,t.textAlign=((X=b.content)==null?void 0:X.textAlign)||"left";const he=b.legendTitle||((fe=b.content)==null?void 0:fe.text)||"Legend";t.fillText(he,N+10,G+ce+5);const ve=b.legendStyle||"standard",Xe=G+ce+20,ri=16,yt=18;ve==="detailed"?[{color:"#ff4444",label:"Fire Stations"},{color:"#4444ff",label:"Hydrants"},{color:"#44ff44",label:"EMS Units"},{color:"#ffaa44",label:"Incidents"}].forEach((ke,pt)=>{const ft=Xe+pt*yt;ft+ri<G+H-10&&(t.fillStyle=ke.color,t.fillRect(N+10,ft,12,12),t.strokeStyle="#333",t.strokeRect(N+10,ft,12,12),t.fillStyle="#333333",t.font=`${Math.max(10,z*.025)}px Arial`,t.fillText(ke.label,N+28,ft+10))}):ve==="compact"&&(t.fillStyle="#333333",t.font=`${Math.max(9,z*.02)}px Arial`,t.fillText("Map elements and symbols",N+10,Xe));break;case"north-arrow":const wt=b.arrowStyle||"classic",ht=b.rotation||0,Oe=((Q=b.content)==null?void 0:Q.color)||"#333333";console.log("[Export] Rendering north arrow:",{arrowStyle:wt,rotation:ht,arrowColor:Oe,elementProperties:b,position:{x:N,y:G,w:z,h:H}}),t.strokeStyle=Oe,t.fillStyle=Oe,t.lineWidth=2;const bt=N+z/2,oe=G+H/2,R=Math.min(z,H)*.3;switch(t.save(),t.translate(bt,oe),t.rotate(ht*Math.PI/180),wt){case"classic":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/3,R/3),t.lineTo(0,0),t.lineTo(R/3,R/3),t.closePath(),t.fill(),t.beginPath(),t.moveTo(0,0),t.lineTo(0,R),t.stroke();break;case"modern":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,R/4),t.lineTo(0,R/8),t.lineTo(R/4,R/4),t.closePath(),t.fill();break;case"simple":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/2,R/2),t.lineTo(R/2,R/2),t.closePath(),t.fill();break;case"compass":t.fillStyle="#cc0000",t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.fillStyle="#ffffff",t.strokeStyle=Oe,t.beginPath(),t.moveTo(0,R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.stroke(),t.fillStyle=Oe,t.beginPath(),t.moveTo(-R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill(),t.beginPath(),t.moveTo(R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill();break}t.restore(),console.log("[Export] North arrow rendered, adding label"),wt!=="compass"&&(t.fillStyle=Oe,t.font=`bold ${Math.max(10,R*.6)}px Arial`,t.textAlign="center",t.fillText("N",bt,oe+R+15),console.log('[Export] North arrow "N" label drawn at:',{x:bt,y:oe+R+15}));break;case"scale-bar":const vt=b.units||"feet",ot=b.scaleStyle||"bar",je=b.divisions||4,dr=((_=l.mapView)==null?void 0:_.center)||{latitude:40},hr=((Se=l.mapView)==null?void 0:Se.zoom)||10,pr=this.calculateMetersPerPixel(hr,dr.latitude),yi=this.getScaleBarInfo(pr,vt,z*.8);t.strokeStyle=((me=b.content)==null?void 0:me.color)||"#333333",t.fillStyle=((Be=b.content)==null?void 0:Be.color)||"#333333",t.lineWidth=2;const Ge=G+H/2,nt=yi.pixelLength,at=N+(z-nt)/2;if(ot==="alternating"){const Ee=nt/je;for(let ke=0;ke<je;ke++){const pt=at+ke*Ee;t.fillStyle=ke%2===0?"#333333":"#ffffff",t.fillRect(pt,Ge-3,Ee,6),t.strokeStyle="#333333",t.strokeRect(pt,Ge-3,Ee,6)}}else{ot==="bar"&&(t.fillStyle="#ffffff",t.fillRect(at,Ge-3,nt,6),t.strokeRect(at,Ge-3,nt,6)),t.strokeStyle=((ze=b.content)==null?void 0:ze.color)||"#333333",t.beginPath(),t.moveTo(at,Ge),t.lineTo(at+nt,Ge),t.stroke(),t.beginPath();for(let Ee=0;Ee<=je;Ee++){const ke=at+Ee*nt/je;t.moveTo(ke,Ge-5),t.lineTo(ke,Ge+5)}t.stroke()}t.fillStyle=((Qe=b.content)==null?void 0:Qe.color)||"#333333",t.font=`${Math.max(10,H*.3)}px Arial`,t.textAlign="center",t.fillText(yi.label,at+nt/2,Ge+20);break;case"image":if((Ie=b.content)!=null&&Ie.imageSrc){const Ee=((Me=b.content)==null?void 0:Me.imageFit)||"cover";await this.drawImageFromSrc(t,b.content.imageSrc,N,G,z,H,Ee)}else t.strokeStyle="#cccccc",t.fillStyle="#f5f5f5",t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H),t.fillStyle="#999999",t.font=`${Math.max(12,z*.05)}px Arial`,t.textAlign="center",t.fillText("Image",N+z/2,G+H/2);break;case"shape":const wi=b.strokeColor||((We=b.content)==null?void 0:We.borderColor)||"#333333",st=b.fillColor||((Ne=b.content)==null?void 0:Ne.backgroundColor)||"transparent",bi=b.strokeWidth||((Fe=b.content)==null?void 0:Fe.borderWidth)||1,vi=b.shapeType||((ue=b.content)==null?void 0:ue.shapeType)||"rectangle";switch(console.log("[Export] Rendering shape:",{shapeType:vi,shapeStrokeColor:wi,shapeFillColor:st,shapeStrokeWidth:bi,elementProperties:b,position:{x:N,y:G,w:z,h:H}}),t.strokeStyle=wi,t.fillStyle=st,t.lineWidth=bi,vi){case"rectangle":st!=="transparent"&&t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H);break;case"circle":const Ee=Math.min(z,H)/2,ke=N+z/2,pt=G+H/2;t.beginPath(),t.arc(ke,pt,Ee,0,2*Math.PI),st!=="transparent"&&t.fill(),t.stroke();break;case"ellipse":const ft=N+z/2,fr=G+H/2,gr=z/2,ur=H/2;t.beginPath(),t.ellipse(ft,fr,gr,ur,0,0,2*Math.PI),st!=="transparent"&&t.fill(),t.stroke();break;case"triangle":const xr=N+z/2,mr=G,Ci=G+H;t.beginPath(),t.moveTo(xr,mr),t.lineTo(N,Ci),t.lineTo(N+z,Ci),t.closePath(),st!=="transparent"&&t.fill(),t.stroke();break;case"line":t.beginPath(),t.moveTo(N,G+H/2),t.lineTo(N+z,G+H/2),t.stroke();break;default:st!=="transparent"&&t.fillRect(N,G,z,H),t.strokeRect(N,G,z,H);break}break;default:console.warn("[Export] Unknown element type:",b.type);break}console.error("[EMERGENCY DEBUG] Element rendered successfully:",b.type),console.log("[Export] Finished rendering element:",b.type)}console.log("[Export] Completed rendering all",o.length,"elements")}static async addLayoutElementsToPDF(t,r,l){var n,d;for(const p of r)switch(p.type){case"text":t.text(((n=p.content)==null?void 0:n.text)||"",p.x,p.y);break;case"image":(d=p.content)!=null&&d.imageSrc&&t.addImage(p.content.imageSrc,"PNG",p.x,p.y,p.width,p.height);break}}static async drawImageFromSrc(t,r,l,n,d,p,s="cover"){try{let o;r instanceof File?o=URL.createObjectURL(r):o=r;const c=new Image;return c.crossOrigin="anonymous",new Promise(f=>{c.onload=()=>{let a=l,u=n,g=d,m=p;const h=c.width/c.height,x=d/p;switch(s){case"contain":h>x?(m=d/h,u=n+(p-m)/2):(g=p*h,a=l+(d-g)/2);break;case"cover":h>x?(g=p*h,a=l-(g-d)/2):(m=d/h,u=n-(m-p)/2);break;case"fill":break;case"scale-down":c.width>d||c.height>p?h>x?(m=d/h,u=n+(p-m)/2):(g=p*h,a=l+(d-g)/2):(g=c.width,m=c.height,a=l+(d-g)/2,u=n+(p-m)/2);break}s==="cover"?(t.save(),t.beginPath(),t.rect(l,n,d,p),t.clip(),t.drawImage(c,a,u,g,m),t.restore()):t.drawImage(c,a,u,g,m),r instanceof File&&URL.revokeObjectURL(o),f()},c.onerror=()=>{console.warn("[Export] Failed to load image:",o),t.strokeStyle="#ccc",t.fillStyle="#f5f5f5",t.fillRect(l,n,d,p),t.strokeRect(l,n,d,p),t.fillStyle="#999",t.font="12px Arial",t.textAlign="center",t.fillText("Failed to load",l+d/2,n+p/2-6),t.fillText("image",l+d/2,n+p/2+6),r instanceof File&&URL.revokeObjectURL(o),f()},c.src=o})}catch(o){console.error("[Export] Error drawing image:",o)}}static getPaperDimensions(t,r){let l,n;switch(t){case"letter":l=215.9,n=279.4;break;case"a4":l=210,n=297;break;case"legal":l=215.9,n=355.6;break;case"tabloid":l=279.4,n=431.8;break;default:l=215.9,n=279.4}return r==="landscape"&&([l,n]=[n,l]),{width:l,height:n}}static calculateMetersPerPixel(t,r){const p=40075017/(256*Math.pow(2,t)),s=r*Math.PI/180;return p*Math.cos(s)}static getScaleBarInfo(t,r,l){const n=t*l;let d,p,s;switch(r){case"feet":s=3.28084,p="ft",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break;case"miles":s=621371e-9,p="mi",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"kilometers":s=.001,p="km",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"meters":default:s=1,p="m",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break}const o=n*s;let c=d[0];for(const g of d)if(g<=o*.8)c=g;else break;const a=c/s/t;let u;if(c<1)u=`${c.toFixed(1)} ${p}`;else if(c>=1e3&&(r==="feet"||r==="meters")){const g=r==="feet"?"mi":"km",h=c/(r==="feet"?5280:1e3);u=`${h.toFixed(h<1?1:0)} ${g}`}else u=`${c} ${p}`;return{pixelLength:Math.round(a),label:u}}static downloadBlob(t,r){const l=URL.createObjectURL(t),n=document.createElement("a");n.href=l,n.download=r,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(l)}}const ln=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),n=t.basic,d=te(h=>h.fireMapPro.export.configuration.layout.elements),[p,s]=k.useState(null),o=h=>x=>{const y=x.target.type==="checkbox"?x.target.checked:x.target.value;l(Fi({[h]:y}))},c=h=>{var y;const x=(y=h.target.files)==null?void 0:y[0];if(x&&x.type.startsWith("image/")){const D=new FileReader;D.onload=M=>{var F;const v=(F=M.target)==null?void 0:F.result;s(v),l(Fi({logo:x}))},D.readAsDataURL(x)}},f=()=>{console.log("[BasicExportTab] Manual apply clicked!",{title:n.title,subtitle:n.subtitle}),console.log("[BasicExportTab] Current layout elements:",d);let h=d.find(y=>y.type==="title"),x=d.find(y=>y.type==="subtitle");if(n.title)if(h)console.log("[BasicExportTab] Updating existing title element"),l(Yt({id:h.id,updates:{content:{...h.content,text:n.title}}}));else{console.log("[BasicExportTab] Creating new title element");const y={type:"title",x:10,y:5,width:80,height:8,zIndex:10,content:{text:n.title,fontSize:18,fontFamily:"Arial",fontWeight:"bold",color:"#333333",textAlign:"center"},visible:!0};l(hi(y))}if(n.subtitle)if(x)console.log("[BasicExportTab] Updating existing subtitle element"),l(Yt({id:x.id,updates:{content:{...x.content,text:n.subtitle}}}));else{console.log("[BasicExportTab] Creating new subtitle element");const y={type:"subtitle",x:10,y:15,width:80,height:6,zIndex:9,content:{text:n.subtitle,fontSize:14,fontFamily:"Arial",fontWeight:"normal",color:"#666666",textAlign:"center"},visible:!0};l(hi(y))}},a=[{value:"png",label:"PNG Image",group:"Raster Formats"},{value:"jpg",label:"JPEG Image",group:"Raster Formats"},{value:"tiff",label:"TIFF Image",group:"Raster Formats"},{value:"webp",label:"WebP Image",group:"Raster Formats"},{value:"pdf",label:"PDF Document",group:"Vector Formats"},{value:"svg",label:"SVG Vector",group:"Vector Formats"},{value:"eps",label:"EPS Vector",group:"Vector Formats"},{value:"geojson",label:"GeoJSON",group:"GIS Formats"},{value:"kml",label:"KML",group:"GIS Formats"},{value:"geopdf",label:"GeoPDF",group:"GIS Formats"}],u=[{value:96,label:"Standard (96 DPI)"},{value:150,label:"Medium (150 DPI)"},{value:300,label:"High (300 DPI)"},{value:450,label:"Very High (450 DPI)"},{value:600,label:"Ultra High (600 DPI)"}],g=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"legal",label:'Legal (8.5" × 14")'},{value:"tabloid",label:'Tabloid (11" × 17")'},{value:"a4",label:"A4 (210mm × 297mm)"},{value:"a3",label:"A3 (297mm × 420mm)"},{value:"a2",label:"A2 (420mm × 594mm)"},{value:"a1",label:"A1 (594mm × 841mm)"},{value:"a0",label:"A0 (841mm × 1189mm)"},{value:"custom",label:"Custom Size"}],m=a.reduce((h,x)=>(h[x.group]||(h[x.group]=[]),h[x.group].push(x),h),{});return i?e.jsx(E,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(L,{container:!0,spacing:3,children:[e.jsx(L,{size:12,children:e.jsx(j,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Map Information"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Map Title",value:n.title,onChange:o("title"),disabled:r,placeholder:"My Fire Department Map",helperText:"Title that will appear on the exported map"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Subtitle (optional)",value:n.subtitle,onChange:o("subtitle"),disabled:r,placeholder:"Created by Fire Prevention Division",helperText:"Optional subtitle for additional context"})}),e.jsxs(L,{size:12,children:[e.jsx(Le,{variant:"contained",color:"primary",onClick:f,disabled:r||!n.title&&!n.subtitle,sx:{mt:1},children:"Apply Title/Subtitle to Layout"}),e.jsx(j,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Click to add your title and subtitle to the Layout Designer"})]}),e.jsxs(L,{size:12,children:[e.jsx(j,{variant:"subtitle2",gutterBottom:!0,children:"Department Logo"}),e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsxs(Le,{variant:"outlined",component:"label",startIcon:e.jsx(al,{}),disabled:r,children:["Choose Logo",e.jsx("input",{type:"file",hidden:!0,accept:"image/*",onChange:c})]}),p&&e.jsx(vl,{src:p,variant:"rounded",sx:{width:60,height:60},children:e.jsx(cr,{})}),!p&&e.jsx(j,{variant:"body2",color:"text.secondary",children:"No logo selected"})]})]}),e.jsx(L,{size:12,children:e.jsx(it,{sx:{my:1}})}),e.jsx(L,{size:12,children:e.jsx(j,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Export Settings"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Export Format"}),e.jsx(se,{value:n.format,label:"Export Format",onChange:o("format"),children:Object.entries(m).map(([h,x])=>[e.jsx(T,{disabled:!0,sx:{fontWeight:"bold",bgcolor:"action.hover"},children:h},h),...x.map(y=>e.jsx(T,{value:y.value,sx:{pl:3},children:y.label},y.value))])})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Resolution (DPI)"}),e.jsx(se,{value:String(n.dpi),label:"Resolution (DPI)",onChange:o("dpi"),children:u.map(h=>e.jsx(T,{value:h.value,children:h.label},h.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Print Size"}),e.jsx(se,{value:n.paperSize,label:"Print Size",onChange:o("paperSize"),children:g.map(h=>e.jsx(T,{value:h.value,children:h.label},h.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Orientation"}),e.jsxs(se,{value:n.orientation,label:"Orientation",onChange:o("orientation"),children:[e.jsx(T,{value:"portrait",children:"Portrait"}),e.jsx(T,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(L,{size:12,children:e.jsx(it,{sx:{my:1}})}),e.jsxs(L,{size:12,children:[e.jsx(j,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Layout Elements"}),e.jsx(j,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"Select which elements to include in your exported map"})]}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:n.includeLegend,onChange:o("includeLegend"),disabled:r}),label:"Include Legend"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:n.includeScale,onChange:o("includeScale"),disabled:r}),label:"Include Scale Bar"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:n.includeNorth,onChange:o("includeNorth"),disabled:r}),label:"Include North Arrow"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:n.includeTitle,onChange:o("includeTitle"),disabled:r}),label:"Include Title Banner"})}),e.jsx(L,{size:12,children:e.jsx(Tt,{severity:"info",sx:{mt:2},children:e.jsxs(j,{variant:"body2",children:[e.jsx("strong",{children:"Quick Start:"})," Enter a title, select your preferred format (PNG for images, PDF for documents), and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs."]})})})]})}):null},on=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),n=te(Ye),d=t.advanced,p=a=>u=>{const g=u.target.type==="checkbox"?u.target.checked:u.target.value;l(li({[a]:g}))},s=a=>u=>{const g=parseFloat(u.target.value)||0;l(li({[a]:g}))},o=a=>{const u=d.selectedLayers,g=u.includes(a)?u.filter(m=>m!==a):[...u,a];l(li({selectedLayers:g}))},c=[{value:"srgb",label:"sRGB (Default)"},{value:"adobergb",label:"Adobe RGB"},{value:"cmyk-swop",label:"CMYK SWOP (U.S.)"},{value:"cmyk-fogra",label:"CMYK FOGRA39 (Europe)"},{value:"custom",label:"Custom Profile..."}],f=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"a4",label:"A4 (210mm × 297mm)"}];return i?e.jsx(E,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(L,{container:!0,spacing:3,children:[e.jsx(L,{size:{xs:12},children:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(ii,{color:"primary"}),e.jsx(j,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Color Management"})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Color Mode"}),e.jsxs(se,{value:d.colorMode,label:"Color Mode",onChange:p("colorMode"),children:[e.jsx(T,{value:"rgb",children:"RGB (Screen)"}),e.jsx(T,{value:"cmyk",children:"CMYK (Print)"})]})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"ICC Color Profile"}),e.jsx(se,{value:d.colorProfile,label:"ICC Color Profile",onChange:p("colorProfile"),children:c.map(a=>e.jsx(T,{value:a.value,children:a.label},a.value))})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(j,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Custom Print Size"})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsx(re,{fullWidth:!0,label:"Width",type:"number",value:d.customWidth,onChange:s("customWidth"),disabled:r,inputProps:{min:1,max:100,step:.1}})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsx(re,{fullWidth:!0,label:"Height",type:"number",value:d.customHeight,onChange:s("customHeight"),disabled:r,inputProps:{min:1,max:100,step:.1}})}),e.jsx(L,{size:{xs:12,md:4},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:d.printUnits,label:"Units",onChange:p("printUnits"),children:[e.jsx(T,{value:"in",children:"inches"}),e.jsx(T,{value:"cm",children:"centimeters"}),e.jsx(T,{value:"mm",children:"millimeters"})]})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(jo,{color:"primary"}),e.jsx(j,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Professional Print Options"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(le,{variant:"outlined",sx:{p:2},children:e.jsxs(L,{container:!0,spacing:2,children:[e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.addBleed,onChange:p("addBleed"),disabled:r}),label:"Add Bleed (0.125″)"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.showCropMarks,onChange:p("showCropMarks"),disabled:r}),label:"Show Crop Marks"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.includeColorBars,onChange:p("includeColorBars"),disabled:r}),label:"Include Color Calibration Bars"})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.addRegistrationMarks,onChange:p("addRegistrationMarks"),disabled:r}),label:"Add Registration Marks"})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.embedICCProfile,onChange:p("embedICCProfile"),disabled:r}),label:"Embed ICC Profile"})})]})})}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Mo,{color:"primary"}),e.jsx(j,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Large Format Printing"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.enableTiledPrinting,onChange:p("enableTiledPrinting"),disabled:r}),label:"Enable Tiled Printing"})}),d.enableTiledPrinting&&e.jsxs(e.Fragment,{children:[e.jsx(L,{size:{xs:12,md:6},children:e.jsxs(ne,{fullWidth:!0,disabled:r,children:[e.jsx(ae,{children:"Tile Size"}),e.jsx(se,{value:d.tileSize,label:"Tile Size",onChange:p("tileSize"),children:f.map(a=>e.jsx(T,{value:a.value,children:a.label},a.value))})]})}),e.jsx(L,{size:{xs:12,md:6},children:e.jsx(re,{fullWidth:!0,label:"Overlap",type:"number",value:d.tileOverlap,onChange:s("tileOverlap"),disabled:r,inputProps:{min:0,max:2,step:.25},InputProps:{endAdornment:e.jsx(lr,{position:"end",children:"inches"})}})})]}),e.jsx(L,{size:{xs:12},children:e.jsx(it,{sx:{my:2}})}),e.jsx(L,{size:{xs:12},children:e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(St,{color:"primary"}),e.jsx(j,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layer Controls"})]})}),e.jsx(L,{size:{xs:12},children:e.jsx(pe,{control:e.jsx(Pe,{checked:d.exportAllLayers,onChange:p("exportAllLayers"),disabled:r}),label:"Export All Visible Layers"})}),!d.exportAllLayers&&n.length>0&&e.jsxs(L,{size:{xs:12},children:[e.jsx(j,{variant:"subtitle2",gutterBottom:!0,children:"Select Layers to Export:"}),e.jsx(le,{variant:"outlined",sx:{maxHeight:200,overflow:"auto"},children:e.jsx(ir,{dense:!0,children:n.map(a=>e.jsxs(rr,{component:"button",disabled:r,children:[e.jsx(Ht,{primary:a.name,secondary:`${a.features.length} features`}),e.jsx(el,{children:e.jsx(De,{checked:d.selectedLayers.includes(a.id),onChange:()=>o(a.id),disabled:r})})]},a.id))})})]}),e.jsx(L,{size:{xs:12},children:e.jsx(Tt,{severity:"info",sx:{mt:2},children:e.jsxs(j,{variant:"body2",children:[e.jsx("strong",{children:"Professional Printing:"})," Use CMYK color mode and appropriate ICC profiles for commercial printing. Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages."]})})})]})}):null},nn=({configuration:i,disabled:t=!1})=>{const r=xe(),l=te(o=>o.fireMapPro.export.configuration.basic),n=[{type:"map",label:"Map Frame",icon:e.jsx(pi,{})},{type:"title",label:"Title",icon:e.jsx(Do,{})},{type:"subtitle",label:"Subtitle",icon:e.jsx(zi,{})},{type:"legend",label:"Legend",icon:e.jsx(uo,{})},{type:"north-arrow",label:"North Arrow",icon:e.jsx(bo,{})},{type:"scale-bar",label:"Scale Bar",icon:e.jsx(Fo,{})},{type:"text",label:"Text Box",icon:e.jsx(zi,{})},{type:"image",label:"Image",icon:e.jsx(cr,{})},{type:"shape",label:"Shape",icon:e.jsx(co,{})}],d=[{id:"standard",name:"Standard",description:"Basic layout with map and legend"},{id:"professional",name:"Professional",description:"Corporate layout with sidebar"},{id:"presentation",name:"Presentation",description:"Landscape format for slides"},{id:"tactical",name:"Tactical",description:"Emergency response layout"}],p=(o,c)=>{o.dataTransfer.setData("application/json",JSON.stringify({type:"layout-element",elementType:c})),o.dataTransfer.effectAllowed="copy"},s=o=>{t||(console.log("[LayoutToolbox] Template clicked:",o),console.log("[LayoutToolbox] Basic config:",l),r(Br(o)))};return e.jsxs(E,{sx:{p:2},children:[e.jsx(j,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Elements"}),e.jsx(L,{container:!0,spacing:1,sx:{mb:3},children:n.map(o=>e.jsx(L,{size:{xs:6},children:e.jsxs(le,{sx:{p:1,textAlign:"center",cursor:t?"default":"grab",border:1,borderColor:"divider",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:"action.hover",transform:"translateY(-2px)",boxShadow:1},"&:active":t?{}:{cursor:"grabbing",opacity:.7}},draggable:!t,onDragStart:c=>p(c,o.type),children:[e.jsx(E,{sx:{color:"primary.main",mb:.5},children:o.icon}),e.jsx(j,{variant:"caption",display:"block",children:o.label})]})},o.type))}),e.jsx(it,{sx:{my:2}}),e.jsx(j,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Templates"}),e.jsx(E,{sx:{display:"flex",flexDirection:"column",gap:1},children:d.map(o=>e.jsxs(le,{sx:{p:1.5,cursor:t?"default":"pointer",border:1,borderColor:i.layout.selectedTemplate===o.id?"primary.main":"divider",bgcolor:i.layout.selectedTemplate===o.id?"primary.50":"background.paper",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:i.layout.selectedTemplate===o.id?"primary.100":"action.hover",transform:"translateY(-1px)",boxShadow:1}},onClick:()=>s(o.id),children:[e.jsx(j,{variant:"subtitle2",sx:{fontWeight:600},children:o.name}),e.jsx(j,{variant:"caption",color:"text.secondary",children:o.description})]},o.id))}),e.jsx(E,{sx:{mt:3,p:1,bgcolor:"info.50",borderRadius:1},children:e.jsx(j,{variant:"caption",color:"info.main",children:"💡 Drag elements to the canvas or click a template to get started."})})]})},an=({width:i=800,height:t=600})=>{const r=xe(),l=k.useRef(null),{layoutElements:n,selectedElementId:d,paperSize:p}=te(v=>({layoutElements:v.fireMapPro.export.configuration.layout.elements,selectedElementId:v.fireMapPro.export.configuration.layout.selectedElementId,paperSize:v.fireMapPro.export.configuration.basic.paperSize})),s={letter:{width:8.5,height:11},legal:{width:8.5,height:14},tabloid:{width:11,height:17},a4:{width:8.27,height:11.69},a3:{width:11.69,height:16.54},custom:{width:8.5,height:11}},o=s[p]||s.letter,c=o.width/o.height,f=Math.min(t,i/c),a=f*c,u=(v,F)=>{F.stopPropagation(),r(Di(v))},g=()=>{r(Di(null))},m=(v,F,I)=>{const w=n.find(ie=>ie.id===v);if(!w)return;const S=Math.max(0,Math.min(100,w.x+F/a*100)),U=Math.max(0,Math.min(100,w.y+I/f*100));r(Yt({id:v,updates:{x:S,y:U}}))},h=v=>{v.preventDefault(),v.dataTransfer.dropEffect="copy"},x=v=>{var F;v.preventDefault();try{const I=v.dataTransfer.getData("application/json");if(!I)return;const w=JSON.parse(I);if(w.type!=="layout-element")return;const S=(F=l.current)==null?void 0:F.getBoundingClientRect();if(!S)return;const U=(v.clientX-S.left)/S.width*100,ie=(v.clientY-S.top)/S.height*100,de={type:w.elementType,x:Math.max(0,Math.min(95,U-5)),y:Math.max(0,Math.min(95,ie-5)),width:20,height:15,zIndex:n.length+1,visible:!0,content:y(w.elementType)};r(hi(de))}catch(I){console.error("Error handling drop:",I)}},y=v=>{switch(v){case"title":return{text:"Map Title",fontSize:18,textAlign:"center",color:"#333333",fontFamily:"Arial"};case"subtitle":return{text:"Map Subtitle",fontSize:14,textAlign:"center",color:"#666666",fontFamily:"Arial"};case"text":return{text:"Text Element",fontSize:12,textAlign:"left",color:"#333333",fontFamily:"Arial"};case"legend":return{text:"Legend",backgroundColor:"#ffffff",color:"#333333"};case"image":return{text:"Image Placeholder",backgroundColor:"#f5f5f5"};case"shape":return{backgroundColor:"transparent",borderColor:"#333333"};default:return{}}},D=v=>{switch(v){case"map":return"🗺️";case"title":return"📝";case"subtitle":return"📄";case"legend":return"📋";case"north-arrow":return"🧭";case"scale-bar":return"📏";case"text":return"💬";case"image":return"🖼️";case"shape":return"⬜";default:return"📦"}},M=v=>{switch(v){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(E,{sx:{display:"flex",flexDirection:"column",alignItems:"center",padding:2,height:"100%",backgroundColor:"#f5f5f5"},children:[e.jsxs(le,{ref:l,onClick:g,onDragOver:h,onDrop:x,sx:{position:"relative",width:a,height:f,backgroundColor:"white",border:"2px solid #ddd",boxShadow:"0 4px 8px rgba(0,0,0,0.1)",overflow:"hidden",cursor:"default"},children:[e.jsxs(E,{sx:{position:"absolute",top:-25,left:0,fontSize:"12px",color:"#666",fontWeight:"bold"},children:[p.toUpperCase()," (",o.width,'" × ',o.height,'")']}),e.jsxs("svg",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.1},children:[e.jsx("defs",{children:e.jsx("pattern",{id:"grid",width:a/10,height:f/10,patternUnits:"userSpaceOnUse",children:e.jsx("path",{d:`M ${a/10} 0 L 0 0 0 ${f/10}`,fill:"none",stroke:"#666",strokeWidth:"1"})})}),e.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"})]}),n.map(v=>e.jsx(sn,{element:v,isSelected:v.id===d,canvasWidth:a,canvasHeight:f,onElementClick:u,onElementDrag:m,getElementIcon:D,getElementLabel:M},v.id)),n.length===0&&e.jsxs(E,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",color:"#999"},children:[e.jsx(E,{sx:{fontSize:"48px",marginBottom:1},children:"📄"}),e.jsx(E,{sx:{fontSize:"14px"},children:"Drag elements from the toolbox to create your layout"})]})]}),e.jsxs(E,{sx:{marginTop:1,fontSize:"12px",color:"#666",textAlign:"center"},children:["Canvas: ",Math.round(a),"×",Math.round(f),"px | Zoom: ",Math.round(a/400*100),"% | Elements: ",n.length]})]})},sn=({element:i,isSelected:t,canvasWidth:r,canvasHeight:l,onElementClick:n,onElementDrag:d,getElementIcon:p,getElementLabel:s})=>{var g,m,h,x,y,D,M,v;const o=k.useRef(null),c=k.useRef(!1),f=k.useRef({x:0,y:0}),a=F=>{F.preventDefault(),F.stopPropagation(),c.current=!0,f.current={x:F.clientX,y:F.clientY};const I=S=>{if(!c.current)return;const U=S.clientX-f.current.x,ie=S.clientY-f.current.y;d(i.id,U,ie),f.current={x:S.clientX,y:S.clientY}},w=()=>{c.current=!1,document.removeEventListener("mousemove",I),document.removeEventListener("mouseup",w)};document.addEventListener("mousemove",I),document.addEventListener("mouseup",w),n(i.id,F)};if(!i.visible)return null;const u={position:"absolute",left:`${i.x}%`,top:`${i.y}%`,width:`${i.width}%`,height:`${i.height}%`,zIndex:i.zIndex,border:t?"2px solid #1976d2":"1px solid #ddd",backgroundColor:i.type==="map"?"#e3f2fd":"rgba(255,255,255,0.9)",cursor:"move",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:"#666",userSelect:"none",boxSizing:"border-box"};return e.jsxs("div",{ref:o,style:u,onMouseDown:a,onClick:F=>n(i.id,F),children:[e.jsx(E,{sx:{textAlign:"center",overflow:"hidden",padding:.5},children:(i.type==="title"||i.type==="subtitle"||i.type==="text"||i.type==="legend")&&((g=i.content)!=null&&g.text)?e.jsx(E,{sx:{fontSize:`${Math.max(8,Math.min(16,(((m=i.content)==null?void 0:m.fontSize)||12)*.8))}px`,fontFamily:((h=i.content)==null?void 0:h.fontFamily)||"Arial",color:((x=i.content)==null?void 0:x.color)||"#333",textAlign:((y=i.content)==null?void 0:y.textAlign)||(i.type==="title"?"center":"left"),fontWeight:i.type==="title"?"bold":"normal",lineHeight:1.2,wordBreak:"break-word",overflow:"hidden",textOverflow:"ellipsis",backgroundColor:i.type==="legend"?((D=i.content)==null?void 0:D.backgroundColor)||"#ffffff":"transparent",border:i.type==="legend"?"1px solid #ddd":"none",borderRadius:i.type==="legend"?"2px":"0",padding:i.type==="legend"?"2px 4px":"0",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:((M=i.content)==null?void 0:M.textAlign)==="center"?"center":((v=i.content)==null?void 0:v.textAlign)==="right"?"flex-end":"flex-start"},children:i.content.text}):e.jsxs(e.Fragment,{children:[e.jsx(E,{sx:{fontSize:"16px",marginBottom:.5},children:p(i.type)}),e.jsx(E,{sx:{fontSize:"10px",lineHeight:1},children:s(i.type)})]})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",top:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"nw-resize"}}),e.jsx("div",{style:{position:"absolute",top:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"ne-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"sw-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"se-resize"}})]})]})},cn=()=>{var p,s,o,c,f,a,u,g,m;const i=xe(),{selectedElement:t,elements:r}=te(h=>{const x=h.fireMapPro.export.configuration.layout.selectedElementId,y=h.fireMapPro.export.configuration.layout.elements;return{selectedElement:x?y.find(D=>D.id===x):null,elements:y}});if(!t)return e.jsxs(E,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa"},children:[e.jsx(j,{variant:"h6",gutterBottom:!0,sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsxs(E,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",color:"#999",textAlign:"center"},children:[e.jsx(E,{sx:{fontSize:"32px",marginBottom:1},children:"🎛️"}),e.jsx(j,{variant:"body2",sx:{fontSize:"0.85rem"},children:"Select an element to edit its properties"})]})]});const l=(h,x)=>{i(Yt({id:t.id,updates:{[h]:x}}))},n=()=>{i(Mr(t.id))},d=h=>{switch(h){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(E,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa",overflowY:"auto"},children:[e.jsxs(E,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1},children:[e.jsx(j,{variant:"h6",sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsx(Le,{size:"small",color:"error",startIcon:e.jsx(mi,{}),onClick:n,sx:{minWidth:"auto",px:1},children:"Del"})]}),e.jsx(j,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:d(t.type)}),e.jsxs(Ke,{defaultExpanded:!0,sx:{mb:1},children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(j,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:"Position & Size"})}),e.jsxs(et,{sx:{pt:1},children:[e.jsxs(E,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(re,{label:"X",type:"number",size:"small",value:Math.round(t.x*100)/100,onChange:h=>l("x",parseFloat(h.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(re,{label:"Y",type:"number",size:"small",value:Math.round(t.y*100)/100,onChange:h=>l("y",parseFloat(h.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(E,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(re,{label:"Width",type:"number",size:"small",value:Math.round(t.width*100)/100,onChange:h=>l("width",parseFloat(h.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(re,{label:"Height",type:"number",size:"small",value:Math.round(t.height*100)/100,onChange:h=>l("height",parseFloat(h.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(E,{sx:{marginBottom:1},children:[e.jsx(j,{gutterBottom:!0,children:"Layer Order"}),e.jsx(Jt,{value:t.zIndex,onChange:(h,x)=>l("zIndex",x),min:1,max:r.length+5,step:1,marks:!0,valueLabelDisplay:"on"})]}),e.jsx(pe,{control:e.jsx(De,{checked:t.visible,onChange:h=>l("visible",h.target.checked)}),label:"Visible"})]})]}),(t.type==="title"||t.type==="subtitle"||t.type==="text"||t.type==="legend")&&e.jsxs(Ke,{sx:{mb:1},children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(j,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:t.type==="legend"?"Legend Content":"Text Content"})}),e.jsxs(et,{sx:{pt:1},children:[e.jsx(re,{label:t.type==="legend"?"Legend Title":"Text",multiline:!0,rows:2,fullWidth:!0,size:"small",value:((p=t.content)==null?void 0:p.text)||"",onChange:h=>l("content",{...t.content,text:h.target.value}),sx:{marginBottom:1,"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsxs(E,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,marginBottom:1},children:[e.jsxs(ne,{size:"small",children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Font"}),e.jsxs(se,{value:((s=t.content)==null?void 0:s.fontFamily)||"Arial",onChange:h=>l("content",{...t.content,fontFamily:h.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(T,{value:"Arial",sx:{fontSize:"0.85rem"},children:"Arial"}),e.jsx(T,{value:"Times New Roman",sx:{fontSize:"0.85rem"},children:"Times"}),e.jsx(T,{value:"Helvetica",sx:{fontSize:"0.85rem"},children:"Helvetica"}),e.jsx(T,{value:"Georgia",sx:{fontSize:"0.85rem"},children:"Georgia"})]})]}),e.jsx(re,{label:"Size",type:"number",size:"small",value:((o=t.content)==null?void 0:o.fontSize)||12,onChange:h=>l("content",{...t.content,fontSize:parseInt(h.target.value)||12}),inputProps:{min:6,max:72},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(E,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1},children:[e.jsxs(ne,{size:"small",children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Align"}),e.jsxs(se,{value:((c=t.content)==null?void 0:c.textAlign)||"left",onChange:h=>l("content",{...t.content,textAlign:h.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(T,{value:"left",sx:{fontSize:"0.85rem"},children:"Left"}),e.jsx(T,{value:"center",sx:{fontSize:"0.85rem"},children:"Center"}),e.jsx(T,{value:"right",sx:{fontSize:"0.85rem"},children:"Right"})]})]}),e.jsx(re,{label:"Color",type:"color",size:"small",value:((f=t.content)==null?void 0:f.color)||"#000000",onChange:h=>l("content",{...t.content,color:h.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem",p:.5}}})]})]})]}),t.type==="map"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"Map Settings"})}),e.jsxs(et,{children:[e.jsx(pe,{control:e.jsx(De,{checked:t.showBorder!==!1,onChange:h=>l("showBorder",h.target.checked)}),label:"Show Border",sx:{marginBottom:1}}),e.jsx(re,{label:"Border Width (px)",type:"number",size:"small",fullWidth:!0,value:t.borderWidth||1,onChange:h=>l("borderWidth",parseInt(h.target.value)||1),inputProps:{min:0,max:10},sx:{marginBottom:2}}),e.jsx(re,{label:"Border Color",type:"color",size:"small",fullWidth:!0,value:t.borderColor||"#000000",onChange:h=>l("borderColor",h.target.value)})]})]}),t.type==="legend"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"Legend Settings"})}),e.jsxs(et,{children:[e.jsx(re,{label:"Title",fullWidth:!0,size:"small",value:t.legendTitle||"Legend",onChange:h=>l("legendTitle",h.target.value),sx:{marginBottom:2}}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.legendStyle||"standard",onChange:h=>l("legendStyle",h.target.value),children:[e.jsx(T,{value:"standard",children:"Standard"}),e.jsx(T,{value:"compact",children:"Compact"}),e.jsx(T,{value:"detailed",children:"Detailed"})]})]}),e.jsx(pe,{control:e.jsx(De,{checked:t.showLegendBorder!==!1,onChange:h=>l("showLegendBorder",h.target.checked)}),label:"Show Border"})]})]}),t.type==="north-arrow"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"North Arrow Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.arrowStyle||"classic",onChange:h=>l("arrowStyle",h.target.value),children:[e.jsx(T,{value:"classic",children:"Classic"}),e.jsx(T,{value:"modern",children:"Modern"}),e.jsx(T,{value:"simple",children:"Simple"}),e.jsx(T,{value:"compass",children:"Compass"})]})]}),e.jsx(re,{label:"Rotation (degrees)",type:"number",size:"small",fullWidth:!0,value:t.rotation||0,onChange:h=>l("rotation",parseInt(h.target.value)||0),inputProps:{min:0,max:360}})]})]}),t.type==="scale-bar"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"Scale Bar Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Units"}),e.jsxs(se,{value:t.units||"feet",onChange:h=>l("units",h.target.value),children:[e.jsx(T,{value:"feet",children:"Feet"}),e.jsx(T,{value:"meters",children:"Meters"}),e.jsx(T,{value:"miles",children:"Miles"}),e.jsx(T,{value:"kilometers",children:"Kilometers"})]})]}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Style"}),e.jsxs(se,{value:t.scaleStyle||"bar",onChange:h=>l("scaleStyle",h.target.value),children:[e.jsx(T,{value:"bar",children:"Bar"}),e.jsx(T,{value:"line",children:"Line"}),e.jsx(T,{value:"alternating",children:"Alternating"})]})]}),e.jsx(re,{label:"Number of Divisions",type:"number",size:"small",fullWidth:!0,value:t.divisions||4,onChange:h=>l("divisions",parseInt(h.target.value)||4),inputProps:{min:2,max:10}})]})]}),t.type==="image"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"Image Settings"})}),e.jsxs(et,{children:[e.jsxs(E,{sx:{marginBottom:2},children:[e.jsx(j,{variant:"body2",sx:{mb:1,fontSize:"0.85rem",color:"#666"},children:"Upload Image File"}),e.jsx("input",{type:"file",accept:"image/*",onChange:h=>{var y;const x=(y=h.target.files)==null?void 0:y[0];x&&l("content",{...t.content,imageSrc:x})},style:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.85rem"}}),((a=t.content)==null?void 0:a.imageSrc)&&t.content.imageSrc instanceof File&&e.jsxs(j,{variant:"caption",sx:{mt:.5,display:"block",color:"#666"},children:["Selected: ",t.content.imageSrc.name]})]}),e.jsx(it,{sx:{my:2}}),e.jsx(re,{label:"Image URL (alternative to file upload)",fullWidth:!0,size:"small",value:typeof((u=t.content)==null?void 0:u.imageSrc)=="string"?t.content.imageSrc:"",onChange:h=>l("content",{...t.content,imageSrc:h.target.value}),sx:{marginBottom:2,"& .MuiInputBase-input":{fontSize:"0.85rem"}},placeholder:"https://example.com/image.jpg"}),e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{sx:{fontSize:"0.85rem"},children:"Image Fit"}),e.jsxs(se,{value:((g=t.content)==null?void 0:g.imageFit)||"cover",onChange:h=>l("content",{...t.content,imageFit:h.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(T,{value:"cover",sx:{fontSize:"0.85rem"},children:"Cover"}),e.jsx(T,{value:"contain",sx:{fontSize:"0.85rem"},children:"Contain"}),e.jsx(T,{value:"fill",sx:{fontSize:"0.85rem"},children:"Fill"}),e.jsx(T,{value:"scale-down",sx:{fontSize:"0.85rem"},children:"Scale Down"})]})]}),e.jsx(re,{label:"Alt Text",fullWidth:!0,size:"small",value:((m=t.content)==null?void 0:m.altText)||"",onChange:h=>l("content",{...t.content,altText:h.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]})]}),t.type==="shape"&&e.jsxs(Ke,{children:[e.jsx(Je,{expandIcon:e.jsx(He,{}),children:e.jsx(j,{variant:"subtitle1",children:"Shape Settings"})}),e.jsxs(et,{children:[e.jsxs(ne,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(ae,{children:"Shape Type"}),e.jsxs(se,{value:t.shapeType||"rectangle",onChange:h=>l("shapeType",h.target.value),children:[e.jsx(T,{value:"rectangle",children:"Rectangle"}),e.jsx(T,{value:"circle",children:"Circle"}),e.jsx(T,{value:"ellipse",children:"Ellipse"}),e.jsx(T,{value:"triangle",children:"Triangle"}),e.jsx(T,{value:"line",children:"Line"})]})]}),e.jsxs(E,{sx:{display:"flex",gap:1,marginBottom:2},children:[e.jsx(re,{label:"Fill Color",type:"color",size:"small",value:t.fillColor||"#ffffff",onChange:h=>l("fillColor",h.target.value),sx:{flex:1}}),e.jsx(re,{label:"Stroke Color",type:"color",size:"small",value:t.strokeColor||"#000000",onChange:h=>l("strokeColor",h.target.value),sx:{flex:1}})]}),e.jsx(re,{label:"Stroke Width (px)",type:"number",size:"small",fullWidth:!0,value:t.strokeWidth||1,onChange:h=>l("strokeWidth",parseInt(h.target.value)||1),inputProps:{min:0,max:20}})]})]}),e.jsx(it,{sx:{margin:"16px 0"}}),e.jsxs(E,{sx:{fontSize:"12px",color:"#666"},children:[e.jsxs(j,{variant:"caption",display:"block",children:["Element ID: ",t.id]}),e.jsxs(j,{variant:"caption",display:"block",children:["Type: ",t.type]}),e.jsxs(j,{variant:"caption",display:"block",children:["Position: ",Math.round(t.x),"%, ",Math.round(t.y),"%"]}),e.jsxs(j,{variant:"caption",display:"block",children:["Size: ",Math.round(t.width),"% × ",Math.round(t.height),"%"]})]})]})},dn=({isActive:i,configuration:t,disabled:r=!1})=>{const l=xe(),n=t.layout,d=p=>{const s=p.target.value;l(Lr({pageOrientation:s,canvasWidth:s==="landscape"?520:400,canvasHeight:s==="landscape"?400:520}))};return i?e.jsxs(E,{sx:{height:"60vh",display:"flex",flexDirection:"column"},children:[e.jsxs(E,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(po,{color:"primary"}),e.jsx(j,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layout Designer"})]}),e.jsxs(L,{container:!0,spacing:2,alignItems:"center",children:[e.jsx(L,{size:{xs:12,md:4},children:e.jsxs(ne,{fullWidth:!0,size:"small",disabled:r,children:[e.jsx(ae,{children:"Page Orientation"}),e.jsxs(se,{value:n.pageOrientation,label:"Page Orientation",onChange:d,children:[e.jsx(T,{value:"portrait",children:"Portrait"}),e.jsx(T,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(L,{size:{xs:12,md:8},children:e.jsx(Tt,{severity:"info",sx:{py:.5},children:e.jsx(j,{variant:"caption",children:"Drag elements from the toolbox to the canvas. Select templates for quick layouts."})})})]})]}),e.jsxs(E,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[e.jsx(E,{sx:{width:200,borderRight:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:2},children:e.jsx(nn,{configuration:t,disabled:r})}),e.jsx(E,{sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",bgcolor:"grey.100",p:2,overflow:"auto"},children:e.jsx(an,{})}),e.jsx(E,{sx:{width:280,borderLeft:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:1},children:e.jsx(cn,{})})]})]}):null},di=({children:i,value:t,index:r,...l})=>e.jsx("div",{role:"tabpanel",hidden:t!==r,id:`export-tabpanel-${r}`,"aria-labelledby":`export-tab-${r}`,...l,children:t===r&&e.jsx(E,{sx:{p:0},children:i})}),hn=()=>{const i=xe(),t=ti(),r=Ji(t.breakpoints.down("md")),l=te(Tr),n=te(mt),{open:d,activeTab:p,configuration:s,process:o}=l,c={basic:0,advanced:1,"layout-designer":2},f={0:"basic",1:"advanced",2:"layout-designer"},a=c[p],u=()=>{o.isExporting||i(Bi())},g=(h,x)=>{o.isExporting||i(Ar(f[x]))},m=async()=>{try{i(zt({isExporting:!0,progress:0,currentStep:"Preparing export...",error:null}));const h=document.querySelector(".leaflet-container");if(!h)throw new Error("Map element not found");const x={...s,layout:{...s.layout,elements:l.configuration.layout.elements,selectedElementId:l.configuration.layout.selectedElementId,customLayout:l.configuration.layout.customLayout},mapView:{center:n.view.center,zoom:n.view.zoom}};await rn.exportMap(h,x,(y,D)=>{i(zt({isExporting:!0,progress:y,currentStep:D,error:null}))}),i(zt({isExporting:!1,progress:100,currentStep:"Export completed",success:!0})),setTimeout(()=>{i(Bi())},1500)}catch(h){i(zt({isExporting:!1,error:h instanceof Error?h.message:"Export failed",success:!1}))}};return e.jsxs(Qt,{open:d,onClose:u,maxWidth:"lg",fullWidth:!0,fullScreen:r,PaperProps:{sx:{minHeight:"80vh",maxHeight:"90vh",bgcolor:"background.default"}},children:[e.jsxs(qt,{sx:{bgcolor:"primary.main",color:"primary.contrastText",p:2,pb:0},children:[e.jsxs(E,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(E,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(xt,{}),e.jsx(j,{variant:"h6",component:"div",children:"Export Options"})]}),e.jsx(Re,{edge:"end",color:"inherit",onClick:u,disabled:o.isExporting,"aria-label":"close",children:e.jsx(sl,{})})]}),e.jsxs(xi,{value:a,onChange:g,textColor:"inherit",indicatorColor:"secondary",variant:"fullWidth",sx:{"& .MuiTab-root":{color:"rgba(255, 255, 255, 0.7)","&.Mui-selected":{color:"white",fontWeight:600},"&:hover":{color:"white",backgroundColor:"rgba(255, 255, 255, 0.1)"}},"& .MuiTabs-indicator":{backgroundColor:"secondary.main"}},children:[e.jsx(kt,{label:"Basic",id:"export-tab-0","aria-controls":"export-tabpanel-0",disabled:o.isExporting}),e.jsx(kt,{label:"Advanced",id:"export-tab-1","aria-controls":"export-tabpanel-1",disabled:o.isExporting}),e.jsx(kt,{label:"Layout Designer",id:"export-tab-2","aria-controls":"export-tabpanel-2",disabled:o.isExporting})]})]}),e.jsxs(_t,{sx:{p:0,overflow:"hidden"},children:[e.jsx(di,{value:a,index:0,children:e.jsx(ln,{isActive:p==="basic",configuration:s,disabled:o.isExporting})}),e.jsx(di,{value:a,index:1,children:e.jsx(on,{isActive:p==="advanced",configuration:s,disabled:o.isExporting})}),e.jsx(di,{value:a,index:2,children:e.jsx(dn,{isActive:p==="layout-designer",configuration:s,disabled:o.isExporting})})]}),e.jsxs(Zt,{sx:{p:2,borderTop:1,borderColor:"divider"},children:[e.jsx(Le,{onClick:u,disabled:o.isExporting,color:"inherit",children:"Cancel"}),e.jsx(Le,{onClick:m,disabled:o.isExporting,variant:"contained",startIcon:o.isExporting?null:e.jsx(xt,{}),sx:{minWidth:120},children:o.isExporting?`${o.progress}%`:"Export Map"})]}),o.isExporting&&e.jsx(E,{sx:{position:"absolute",bottom:80,left:16,right:16,bgcolor:"info.main",color:"info.contrastText",p:1,borderRadius:1,display:"flex",alignItems:"center",gap:1},children:e.jsx(j,{variant:"body2",children:o.currentStep})})]})},pn=()=>{const i=k.useRef(null),t=k.useRef(null),r=k.useRef(Math.random().toString(36)),l=k.useRef(0),[n,d]=k.useState([]),p=s=>{console.log(`[SimpleMapTest] ${s}`),d(o=>[...o,`${new Date().toISOString()}: ${s}`])};return k.useEffect(()=>{if(l.current++,p(`Component render #${l.current}`),!i.current){p("❌ No map container div");return}if(t.current){p(`⚠️ Map already exists (ID: ${r.current})`);return}r.current=Math.random().toString(36),p(`🗺️ Creating map with ID: ${r.current}`);try{const s=ee.map(i.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0});ee.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(s);const o=c=>{p(`✅ Click event works at ${c.latlng.lat.toFixed(4)}, ${c.latlng.lng.toFixed(4)}`)};return s.on("click",o),setTimeout(()=>{try{const c=s.getCenter(),f=s.latLngToContainerPoint(c),a=s.containerPointToLatLng(f);p(`✅ Coordinate conversion works: ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`)}catch(c){p(`❌ Coordinate conversion failed: ${c instanceof Error?c.message:String(c)}`)}},1e3),t.current=s,p(`✅ Map created successfully (ID: ${r.current})`),()=>{p(`🧹 Cleanup called for map ID: ${r.current}`),t.current&&(t.current.remove(),t.current=null,p(`✅ Map cleaned up (ID: ${r.current})`))}}catch(s){p(`❌ Map creation failed: ${s instanceof Error?s.message:String(s)}`)}},[]),e.jsxs("div",{style:{width:"100vw",height:"100vh",position:"fixed",top:0,left:0,zIndex:9999,background:"white"},children:[e.jsxs("div",{style:{position:"absolute",top:10,left:10,zIndex:1e4,background:"white",padding:"10px",maxHeight:"300px",overflow:"auto",border:"1px solid #ccc"},children:[e.jsx("h3",{children:"Simple Map Test Results"}),e.jsx("div",{style:{fontSize:"12px",fontFamily:"monospace"},children:n.map((s,o)=>e.jsx("div",{children:s},o))}),e.jsx("button",{onClick:()=>window.location.reload(),children:"Reload Test"})]}),e.jsx("div",{ref:i,style:{width:"100%",height:"100%"}})]})},fn=({children:i})=>{const t=te(ui);return k.useEffect(()=>{const r=document.getElementById("root");r&&(r.removeAttribute("aria-hidden"),r.setAttribute("aria-label","Fire Map Pro - Emergency Management Mapping System"),r.getAttribute("role")||r.setAttribute("role","application"));const l=()=>{document.querySelectorAll('[aria-hidden="true"]').forEach(p=>{(p.id==="root"||p.closest("#root"))&&p.removeAttribute("aria-hidden")})};l();const n=new MutationObserver(l);return n.observe(document.body,{attributes:!0,attributeFilter:["aria-hidden"],subtree:!0}),()=>{n.disconnect()}},[t.sidebarOpen]),e.jsx(e.Fragment,{children:i})},Ot=320,yn=({initialMapState:i,mode:t="create",onSave:r,onExport:l})=>{const n=xe(),d=ti(),p=Ji(d.breakpoints.down("md"));k.useEffect(()=>{document.title="FireEMS Fire Map Pro"},[]);const s=te(mt),o=te(ui),c=te(zr),f=te(Ir),a=k.useRef(null),[u,g]=gi.useState(!1);k.useEffect(()=>{if(i)console.log("Loading initial map state:",i),n(Mi({...s,...i}));else{console.log("Loading default fire/EMS data:",Vi);const v={view:{center:{latitude:39.8283,longitude:-98.5795},zoom:6},layers:Vi,baseMaps:s.baseMaps,activeBaseMap:s.activeBaseMap,selectedFeatures:[],drawingMode:null,drawingOptions:s.drawingOptions,exportConfig:s.exportConfig,measurementUnits:s.measurementUnits,showCoordinates:s.showCoordinates,showGrid:s.showGrid};n(Mi(v))}},[]),k.useEffect(()=>{const v=()=>{try{const I=sessionStorage.getItem("fireEmsExportedData");if(I){const w=JSON.parse(I);if(console.log("Found exported data for Fire Map Pro:",w),w.toolId==="fire-map-pro"&&w.data&&w.data.length>0){const S=zo.transformToFireMapPro(w.data);if(S.success&&S.data){if(console.log("Importing incident data to Fire Map Pro:",{layerName:S.data.layer.name,featureCount:S.data.features.length,errors:S.errors,warnings:S.warnings}),n(Pr(S.data)),S.errors.length>0||S.warnings.length>0){const U=[`Successfully imported ${S.metadata.successfulRecords} of ${S.metadata.totalRecords} incidents.`,S.errors.length>0?`${S.errors.length} errors encountered.`:"",S.warnings.length>0?`${S.warnings.length} warnings.`:""].filter(Boolean).join(" ");n(ct(U))}sessionStorage.removeItem("fireEmsExportedData")}else console.error("Failed to transform incident data:",S.errors),n(ct(`Failed to import incident data: ${S.errors.join(", ")}`))}}}catch(I){console.error("Error checking for imported data:",I),n(ct("Error importing data from Data Formatter"))}};v();const F=setTimeout(v,1e3);return()=>clearTimeout(F)},[n]),k.useEffect(()=>{const v=F=>{if(!(F.target instanceof HTMLInputElement||F.target instanceof HTMLTextAreaElement)){if(F.ctrlKey||F.metaKey)switch(F.key){case"z":F.preventDefault(),F.shiftKey?f&&n(oi()):c&&n(Li());break;case"y":F.preventDefault(),f&&n(oi());break;case"s":F.preventDefault(),m();break;case"e":F.preventDefault(),h();break}F.key==="Escape"&&s.drawingMode}};return document.addEventListener("keydown",v),()=>document.removeEventListener("keydown",v)},[c,f,s.drawingMode,n]);const m=()=>{r?r(s):(localStorage.setItem("fireMapPro_autosave",JSON.stringify(s)),console.log("Map saved to local storage"))},h=()=>{l?l(s.exportConfig):n(qi())},x=()=>{n(Rr())},y=()=>{var v;n($r()),o.fullscreen?document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen():(v=a.current)!=null&&v.requestFullscreen&&a.current.requestFullscreen()},D=()=>{n(ct(null))},M={marginLeft:!p&&o.sidebarOpen?`${Ot}px`:0,width:!p&&o.sidebarOpen?`calc(100% - ${Ot}px)`:"100%",height:o.fullscreen?"100vh":"calc(100vh - 64px)",transition:d.transitions.create(["margin","width"],{easing:d.transitions.easing.sharp,duration:d.transitions.duration.leavingScreen})};return u?e.jsxs("div",{children:[e.jsx("button",{onClick:()=>g(!1),style:{position:"fixed",top:10,right:10,zIndex:10001,padding:"10px",background:"red",color:"white"},children:"Exit Test Mode"}),e.jsx(pn,{})]}):e.jsx(fn,{children:e.jsxs(E,{ref:a,sx:{display:"flex",height:"100vh",overflow:"hidden",bgcolor:"background.default",position:o.fullscreen?"fixed":"relative",top:o.fullscreen?0:"auto",left:o.fullscreen?0:"auto",right:o.fullscreen?0:"auto",bottom:o.fullscreen?0:"auto",zIndex:o.fullscreen?1300:"auto"},role:"main","aria-label":"Fire Map Pro Application",children:[!o.fullscreen&&e.jsx(fl,{position:"fixed",sx:{zIndex:d.zIndex.drawer+1,bgcolor:"primary.main"},children:e.jsxs(tl,{children:[e.jsx(Re,{color:"inherit","aria-label":"toggle sidebar",onClick:x,edge:"start",sx:{mr:2},children:e.jsx(yo,{})}),e.jsxs(j,{variant:"h6",noWrap:!0,component:"div",sx:{flexGrow:1},children:["Fire Map Pro ",t==="edit"?"- Editing":t==="view"?"- View Only":""]}),e.jsxs(E,{sx:{display:"flex",gap:1},children:[e.jsx(Re,{color:"inherit",onClick:()=>n(Li()),disabled:!c,title:"Undo (Ctrl+Z)",children:e.jsx(Bo,{})}),e.jsx(Re,{color:"inherit",onClick:()=>n(oi()),disabled:!f,title:"Redo (Ctrl+Y)",children:e.jsx(Eo,{})}),e.jsx(Re,{color:"inherit",onClick:()=>g(!0),title:"Debug Test Mode",sx:{color:"orange"},children:e.jsx(no,{})}),t!=="view"&&e.jsx(Re,{color:"inherit",onClick:m,title:"Save (Ctrl+S)",children:e.jsx(cl,{})}),e.jsx(Re,{color:"inherit",onClick:h,title:"Export (Ctrl+E)",children:e.jsx(xt,{})}),e.jsx(Re,{color:"inherit",onClick:y,title:"Toggle Fullscreen",children:o.fullscreen?e.jsx(Nr,{}):e.jsx(Or,{})})]})]})}),e.jsx(Tl,{variant:p?"temporary":"persistent",anchor:"left",open:o.sidebarOpen,onClose:x,sx:{width:Ot,flexShrink:0,"& .MuiDrawer-paper":{width:Ot,boxSizing:"border-box",marginTop:o.fullscreen?0:"64px",height:o.fullscreen?"100vh":"calc(100vh - 64px)",borderRight:`1px solid ${d.palette.divider}`}},ModalProps:{keepMounted:!0,disablePortal:!1,hideBackdrop:!p,disableAutoFocus:!0,disableEnforceFocus:!0,disableRestoreFocus:!0},PaperProps:{"aria-hidden":!1,role:"complementary","aria-label":"Fire Map Pro Tools"},children:e.jsx(en,{mode:t})}),e.jsxs(E,{component:"main",sx:{flexGrow:1,position:"relative",...M},children:[e.jsx(le,{elevation:0,sx:{height:"100%",width:"100%",borderRadius:0,overflow:"hidden",position:"relative",minHeight:"500px",display:"flex",flexDirection:"column","& .leaflet-container":{background:"transparent !important",outline:"none"},"& .leaflet-tile-pane":{opacity:"1 !important",visibility:"visible !important"},"& .leaflet-tile":{opacity:"1 !important",visibility:"visible !important",display:"block !important",imageRendering:"auto",transform:"translateZ(0)",backfaceVisibility:"hidden"},"& .leaflet-layer":{opacity:"1 !important",visibility:"visible !important"}},children:e.jsx(Uo,{})}),o.isLoading&&e.jsx(E,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,bgcolor:"rgba(255, 255, 255, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:e.jsx(j,{variant:"h6",children:"Loading..."})})]}),o.showWelcome&&e.jsx(tn,{}),e.jsx(hn,{}),e.jsx(il,{open:!!o.error,autoHideDuration:6e3,onClose:D,anchorOrigin:{vertical:"bottom",horizontal:"center"},children:e.jsx(Tt,{onClose:D,severity:"error",sx:{width:"100%"},children:o.error})})]})})};export{yn as default};
