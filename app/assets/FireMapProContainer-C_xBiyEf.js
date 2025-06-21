import{j as e,g as qt,a as Zt,r as z,u as Kt,s as Le,c as Jt,b as ei,m as ti,a9 as Ti,d as ii,h as he,e as Ii,k as q,l as Y,aa as Re,B as m,R as li,ab as Li,ac as Ri,ad as Pi,ae as Wi,af as Gi,ag as Hi,ah as Ui,ai as It,aj as ri,ak as ni,al as Ke,am as Ni,an as oi,ao as Oi,ap as $i,_ as Lt,aq as Rt,ar as Xe,as as Se,at as $e,au as Vi,av as Pt,aw as Yi,ax as Qi,ay as _i,az as Wt,aA as Xi,aB as je,aC as qi,aD as Zi,aE as Gt,aF as Ht,aG as Ve,aH as Ut,aI as Ce,aJ as Ki,aK as Ji}from"./index-CBLmr-ib.js";import{E as el,D as De,T as Be,U as tl,a as Nt,C as il,b as ll}from"./dataTransformer-Bu2Ze4qd.js";import{S as Me,E as pe,A as rl,a as nl,M as ol,D as al,b as sl}from"./A11yProvider-5NaBLQ7s.js";import{c as W,T as u,P as $,u as ai}from"./Typography-2C6iVcR8.js";import{c as cl,B as K}from"./Button-a4HCbeZC.js";import{A as hl,D as Je,S as Z,a as dl}from"./Delete-Be4DDNLx.js";import{b as xl,L as si,l as ci,m as Ee,n as ke,C as hi,g as J,o as fl,M as b,T as P,F as H,I as U,e as N,f as V,h as et,i as ge,A as ye,k as di,D as oe,p as pl,E as gl,q as ul}from"./Settings-C4So_X2J.js";import{E as ie,g as yl,D as Ae,a as ze,b as Te,c as Ie,G as v,I as xi,S as ml,F as wl,f as vl,h as bl,C as ee,A as le,d as re,e as ne}from"./jspdf.es.min-BhwjZDjM.js";import{M as qe}from"./Map-CpY0-VRq.js";import{T as jl}from"./Timeline-BTg6ZmdF.js";import{S as Cl}from"./Security-0nJqR7eX.js";import{L as El}from"./LocalFireDepartment-DCptVao1.js";import{u as fi,L as Ot,F as Fl,a as Bl}from"./leaflet-BgyAKENc.js";const kl=W(e.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}));function Sl(l){return qt("MuiAvatar",l)}Zt("MuiAvatar",["root","colorDefault","circular","rounded","square","img","fallback"]);const Dl=l=>{const{classes:t,variant:n,colorDefault:i}=l;return ei({root:["root",n,i&&"colorDefault"],img:["img"],fallback:["fallback"]},Sl,t)},Ml=Le("div",{name:"MuiAvatar",slot:"Root",overridesResolver:(l,t)=>{const{ownerState:n}=l;return[t.root,t[n.variant],n.colorDefault&&t.colorDefault]}})(ti(({theme:l})=>({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:40,height:40,fontFamily:l.typography.fontFamily,fontSize:l.typography.pxToRem(20),lineHeight:1,borderRadius:"50%",overflow:"hidden",userSelect:"none",variants:[{props:{variant:"rounded"},style:{borderRadius:(l.vars||l).shape.borderRadius}},{props:{variant:"square"},style:{borderRadius:0}},{props:{colorDefault:!0},style:{color:(l.vars||l).palette.background.default,...l.vars?{backgroundColor:l.vars.palette.Avatar.defaultBg}:{backgroundColor:l.palette.grey[400],...l.applyStyles("dark",{backgroundColor:l.palette.grey[600]})}}}]}))),Al=Le("img",{name:"MuiAvatar",slot:"Img",overridesResolver:(l,t)=>t.img})({width:"100%",height:"100%",textAlign:"center",objectFit:"cover",color:"transparent",textIndent:1e4}),zl=Le(kl,{name:"MuiAvatar",slot:"Fallback",overridesResolver:(l,t)=>t.fallback})({width:"75%",height:"75%"});function Tl({crossOrigin:l,referrerPolicy:t,src:n,srcSet:i}){const[r,c]=z.useState(!1);return z.useEffect(()=>{if(!n&&!i)return;c(!1);let d=!0;const h=new Image;return h.onload=()=>{d&&c("loaded")},h.onerror=()=>{d&&c("error")},h.crossOrigin=l,h.referrerPolicy=t,h.src=n,i&&(h.srcset=i),()=>{d=!1}},[l,t,n,i]),r}const Il=z.forwardRef(function(t,n){const i=Kt({props:t,name:"MuiAvatar"}),{alt:r,children:c,className:d,component:h="div",slots:a={},slotProps:f={},imgProps:y,sizes:o,src:w,srcSet:j,variant:F="circular",...s}=i;let x=null;const E={...i,component:h,variant:F},R=Tl({...y,...typeof f.img=="function"?f.img(E):f.img,src:w,srcSet:j}),G=w||j,C=G&&R!=="error";E.colorDefault=!C,delete E.ownerState;const B=Dl(E),[O,g]=xl("img",{className:B.img,elementType:Al,externalForwardedProps:{slots:a,slotProps:{img:{...y,...f.img}}},additionalProps:{alt:r,src:w,srcSet:j,sizes:o},ownerState:E});return C?x=e.jsx(O,{...g}):c||c===0?x=c:G&&r?x=r[0]:x=e.jsx(zl,{ownerState:E,className:B.fallback}),e.jsx(Ml,{as:h,className:Jt(B.root,d),ref:n,...s,ownerState:E,children:x})});function Ll(l){return qt("MuiToggleButton",l)}const Ye=Zt("MuiToggleButton",["root","disabled","selected","standard","primary","secondary","sizeSmall","sizeMedium","sizeLarge","fullWidth"]),Rl=z.createContext({}),Pl=z.createContext(void 0);function Wl(l,t){return t===void 0||l===void 0?!1:Array.isArray(t)?t.includes(l):l===t}const Gl=l=>{const{classes:t,fullWidth:n,selected:i,disabled:r,size:c,color:d}=l,h={root:["root",i&&"selected",r&&"disabled",n&&"fullWidth",`size${ii(c)}`,d]};return ei(h,Ll,t)},Hl=Le(cl,{name:"MuiToggleButton",slot:"Root",overridesResolver:(l,t)=>{const{ownerState:n}=l;return[t.root,t[`size${ii(n.size)}`]]}})(ti(({theme:l})=>({...l.typography.button,borderRadius:(l.vars||l).shape.borderRadius,padding:11,border:`1px solid ${(l.vars||l).palette.divider}`,color:(l.vars||l).palette.action.active,[`&.${Ye.disabled}`]:{color:(l.vars||l).palette.action.disabled,border:`1px solid ${(l.vars||l).palette.action.disabledBackground}`},"&:hover":{textDecoration:"none",backgroundColor:l.vars?`rgba(${l.vars.palette.text.primaryChannel} / ${l.vars.palette.action.hoverOpacity})`:he(l.palette.text.primary,l.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[{props:{color:"standard"},style:{[`&.${Ye.selected}`]:{color:(l.vars||l).palette.text.primary,backgroundColor:l.vars?`rgba(${l.vars.palette.text.primaryChannel} / ${l.vars.palette.action.selectedOpacity})`:he(l.palette.text.primary,l.palette.action.selectedOpacity),"&:hover":{backgroundColor:l.vars?`rgba(${l.vars.palette.text.primaryChannel} / calc(${l.vars.palette.action.selectedOpacity} + ${l.vars.palette.action.hoverOpacity}))`:he(l.palette.text.primary,l.palette.action.selectedOpacity+l.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:l.vars?`rgba(${l.vars.palette.text.primaryChannel} / ${l.vars.palette.action.selectedOpacity})`:he(l.palette.text.primary,l.palette.action.selectedOpacity)}}}}},...Object.entries(l.palette).filter(Ii()).map(([t])=>({props:{color:t},style:{[`&.${Ye.selected}`]:{color:(l.vars||l).palette[t].main,backgroundColor:l.vars?`rgba(${l.vars.palette[t].mainChannel} / ${l.vars.palette.action.selectedOpacity})`:he(l.palette[t].main,l.palette.action.selectedOpacity),"&:hover":{backgroundColor:l.vars?`rgba(${l.vars.palette[t].mainChannel} / calc(${l.vars.palette.action.selectedOpacity} + ${l.vars.palette.action.hoverOpacity}))`:he(l.palette[t].main,l.palette.action.selectedOpacity+l.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:l.vars?`rgba(${l.vars.palette[t].mainChannel} / ${l.vars.palette.action.selectedOpacity})`:he(l.palette[t].main,l.palette.action.selectedOpacity)}}}}})),{props:{fullWidth:!0},style:{width:"100%"}},{props:{size:"small"},style:{padding:7,fontSize:l.typography.pxToRem(13)}},{props:{size:"large"},style:{padding:15,fontSize:l.typography.pxToRem(15)}}]}))),Qe=z.forwardRef(function(t,n){const{value:i,...r}=z.useContext(Rl),c=z.useContext(Pl),d=Ti({...r,selected:Wl(t.value,i)},t),h=Kt({props:d,name:"MuiToggleButton"}),{children:a,className:f,color:y="standard",disabled:o=!1,disableFocusRipple:w=!1,fullWidth:j=!1,onChange:F,onClick:s,selected:x,size:E="medium",value:R,...G}=h,C={...h,color:y,disabled:o,disableFocusRipple:w,fullWidth:j,size:E},B=Gl(C),O=M=>{s&&(s(M,R),M.defaultPrevented)||F&&F(M,R)},g=c||"";return e.jsx(Hl,{className:Jt(r.className,B.root,f,g),disabled:o,focusRipple:!w,ref:n,onClick:O,onChange:F,value:R,ownerState:C,"aria-pressed":x,...G,children:a})}),Ul=W(e.jsx("path",{d:"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"})),Nl=W(e.jsx("path",{d:"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"})),Ol=W(e.jsx("path",{d:"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z"})),$l=W(e.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"})),Vl=W(e.jsx("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"})),Yl=W(e.jsx("path",{d:"M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),Ql=W(e.jsx("path",{d:"M14.69 2.21 4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02"})),pi=W(e.jsx("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"})),ue=W(e.jsx("path",{d:"m11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27z"})),_l=W(e.jsx("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"})),Xl=W(e.jsx("path",{d:"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z"})),ql=W(e.jsx("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),Zl=W(e.jsx("path",{d:"m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7z"})),Pe=W(e.jsx("path",{d:"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9m5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9M5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5m6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5"})),Kl=W(e.jsx("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"})),Jl=W(e.jsx("path",{d:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"})),er=W(e.jsx("path",{d:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3m-3 11H8v-5h8zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-1-9H6v4h12z"})),tr=W(e.jsx("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z"})),ir=W(e.jsx("path",{d:"M23 6H1v12h22zm-2 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),lr=W(e.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),rr=W(e.jsx("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8"})),nr=W(e.jsx("path",{d:"M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"})),or=W(e.jsx("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"})),ar=W(e.jsx("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"})),$t=[],Vt=[],Yt=[],Qt=[],_t=[],Xt=[{id:"fire-stations",name:"Fire Stations",visible:!1,opacity:1,zIndex:3,type:"feature",features:$t,metadata:{description:"Add your fire stations using the drawing tools or data import",source:"User Data",created:new Date,featureCount:$t.length}},{id:"hospitals",name:"Medical Facilities",visible:!1,opacity:1,zIndex:2,type:"feature",features:Vt,metadata:{description:"Add hospitals and medical facilities to your map",source:"User Data",created:new Date,featureCount:Vt.length}},{id:"hydrants",name:"Fire Hydrants",visible:!1,opacity:1,zIndex:1,type:"feature",features:Yt,metadata:{description:"Map fire hydrants with flow rates and inspection data",source:"User Data",created:new Date,featureCount:Yt.length}},{id:"recent-incidents",name:"Incidents",visible:!1,opacity:1,zIndex:4,type:"feature",features:Qt,metadata:{description:"Track emergency incidents and responses",source:"User Data",created:new Date,featureCount:Qt.length}},{id:"response-zones",name:"Response Zones",visible:!1,opacity:.6,zIndex:0,type:"feature",features:_t,metadata:{description:"Define coverage areas and response zones",source:"User Data",created:new Date,featureCount:_t.length}}],sr=()=>{const l=q(),t=Y(Re),[n,i]=z.useState(new Set),[r,c]=z.useState(null),[d,h]=z.useState(!1),[a,f]=z.useState(null),[y,o]=z.useState({name:"",type:"feature",opacity:1,visible:!0}),w=g=>{const M=t.find(S=>S.id===g);M&&l(Li({layerId:g,visible:!M.visible}))},j=(g,M)=>{l(Ri({layerId:g,opacity:M/100}))},F=g=>{const M=new Set(n);M.has(g)?M.delete(g):M.add(g),i(M)},s=(g,M)=>{g.preventDefault(),c({mouseX:g.clientX-2,mouseY:g.clientY-4,layerId:M})},x=()=>{c(null)},E=()=>{const g={name:y.name||"New Layer",visible:y.visible,opacity:y.opacity,zIndex:t.length,type:y.type,features:[],metadata:{description:"",source:"User Created",created:new Date,featureCount:0}};l(Wi(g)),h(!1),o({name:"",type:"feature",opacity:1,visible:!0})},R=g=>{const M=t.find(S=>S.id===g);M&&(o({name:M.name,type:M.type,opacity:M.opacity,visible:M.visible}),f(g)),x()},G=()=>{a&&(l(Gi({layerId:a,updates:{name:y.name,type:y.type,opacity:y.opacity,visible:y.visible}})),f(null),o({name:"",type:"feature",opacity:1,visible:!0}))},C=g=>{l(Pi(g)),x()},B=g=>{switch(g){case"base":return e.jsx(qe,{});case"overlay":return e.jsx(ue,{});case"reference":return e.jsx(qe,{});default:return e.jsx(ue,{})}},O=g=>{switch(g){case"base":return"primary";case"overlay":return"secondary";case"reference":return"info";default:return"default"}};return e.jsxs(m,{children:[e.jsxs(m,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(u,{variant:"h6",sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(ue,{}),"Layers"]}),e.jsx(K,{startIcon:e.jsx(hl,{}),onClick:()=>h(!0),size:"small",variant:"outlined",children:"Add"})]}),e.jsx(si,{dense:!0,children:t.map((g,M)=>e.jsxs(li.Fragment,{children:[e.jsxs(ci,{sx:{border:"1px solid",borderColor:"divider",borderRadius:1,mb:1,bgcolor:"background.paper"},children:[e.jsx(Ee,{sx:{minWidth:32},children:e.jsx(Yl,{sx:{cursor:"grab",color:"text.disabled"}})}),e.jsx(Ee,{sx:{minWidth:40},children:B(g.type)}),e.jsx(ke,{primary:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(u,{variant:"body2",sx:{fontWeight:500},children:g.name}),e.jsx(hi,{label:g.type,size:"small",color:O(g.type),sx:{height:20,fontSize:"0.7rem"}})]}),secondary:`${g.features.length} features`}),e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(J,{size:"small",onClick:()=>w(g.id),color:g.visible?"primary":"default",children:g.visible?e.jsx(or,{}):e.jsx(ar,{})}),e.jsx(J,{size:"small",onClick:()=>F(g.id),children:n.has(g.id)?e.jsx(el,{}):e.jsx(ie,{})}),e.jsx(J,{size:"small",onClick:S=>s(S,g.id),children:e.jsx(ql,{})})]})]}),e.jsx(yl,{in:n.has(g.id),timeout:"auto",children:e.jsxs(m,{sx:{pl:2,pr:2,pb:2},children:[e.jsxs(u,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Opacity: ",Math.round(g.opacity*100),"%"]}),e.jsx(Me,{value:g.opacity*100,onChange:(S,Q)=>j(g.id,Q),min:0,max:100,size:"small",sx:{mb:1}}),g.metadata.description&&e.jsx(u,{variant:"caption",color:"text.secondary",children:g.metadata.description})]})})]},g.id))}),t.length===0&&e.jsx(m,{sx:{textAlign:"center",py:4},children:e.jsx(u,{variant:"body2",color:"text.secondary",children:"No layers yet. Create your first layer to get started."})}),e.jsxs(fl,{open:r!==null,onClose:x,anchorReference:"anchorPosition",anchorPosition:r!==null?{top:r.mouseY,left:r.mouseX}:void 0,children:[e.jsxs(b,{onClick:()=>r&&R(r.layerId),children:[e.jsx(Ee,{children:e.jsx(De,{fontSize:"small"})}),e.jsx(ke,{children:"Edit Layer"})]}),e.jsxs(b,{onClick:()=>r&&C(r.layerId),children:[e.jsx(Ee,{children:e.jsx(Je,{fontSize:"small"})}),e.jsx(ke,{children:"Delete Layer"})]})]}),e.jsxs(Ae,{open:d,onClose:()=>h(!1),maxWidth:"sm",fullWidth:!0,children:[e.jsx(ze,{children:"Create New Layer"}),e.jsxs(Te,{children:[e.jsx(P,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:y.name,onChange:g=>o({...y,name:g.target.value}),sx:{mb:2}}),e.jsxs(H,{fullWidth:!0,sx:{mb:2},children:[e.jsx(U,{children:"Layer Type"}),e.jsxs(N,{value:y.type,label:"Layer Type",onChange:g=>o({...y,type:g.target.value}),children:[e.jsx(b,{value:"feature",children:"Feature Layer"}),e.jsx(b,{value:"overlay",children:"Overlay Layer"}),e.jsx(b,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(u,{variant:"body2",children:"Visible:"}),e.jsx(Z,{checked:y.visible,onChange:g=>o({...y,visible:g.target.checked})})]})]}),e.jsxs(Ie,{children:[e.jsx(K,{onClick:()=>h(!1),children:"Cancel"}),e.jsx(K,{onClick:E,variant:"contained",children:"Create"})]})]}),e.jsxs(Ae,{open:a!==null,onClose:()=>f(null),maxWidth:"sm",fullWidth:!0,children:[e.jsx(ze,{children:"Edit Layer"}),e.jsxs(Te,{children:[e.jsx(P,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:y.name,onChange:g=>o({...y,name:g.target.value}),sx:{mb:2}}),e.jsxs(H,{fullWidth:!0,sx:{mb:2},children:[e.jsx(U,{children:"Layer Type"}),e.jsxs(N,{value:y.type,label:"Layer Type",onChange:g=>o({...y,type:g.target.value}),children:[e.jsx(b,{value:"feature",children:"Feature Layer"}),e.jsx(b,{value:"overlay",children:"Overlay Layer"}),e.jsx(b,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(u,{variant:"body2",children:"Visible:"}),e.jsx(Z,{checked:y.visible,onChange:g=>o({...y,visible:g.target.checked})})]})]}),e.jsxs(Ie,{children:[e.jsx(K,{onClick:()=>f(null),children:"Cancel"}),e.jsx(K,{onClick:G,variant:"contained",children:"Update"})]})]})]})},cr=()=>{const l=q(),t=Y(Hi),n=Y(Re),[i,r]=z.useState(""),c=[{mode:"marker",icon:e.jsx(Jl,{}),label:"Marker"},{mode:"polyline",icon:e.jsx(jl,{}),label:"Line"},{mode:"polygon",icon:e.jsx(Nl,{}),label:"Polygon"},{mode:"circle",icon:e.jsx(Kl,{}),label:"Circle"},{mode:"rectangle",icon:e.jsx($l,{}),label:"Rectangle"}],d=o=>{const w=o===t.mode?null:o;console.log("[DrawingTools UI] Button clicked:",{clickedMode:o,currentMode:t.mode,newMode:w}),l(Ui(w))},h=(o,w)=>{console.log("[DrawingTools] Style change:",{property:o,value:w}),console.log("[DrawingTools] Current style before update:",t.options.style);const j={style:{...t.options.style,[o]:w}};console.log("[DrawingTools] New options to dispatch:",j),l(It(j))},a=(o,w)=>{l(It({[o]:w}))},f=(o,w)=>{l(ri({[o]:w}))},y=n.filter(o=>o.type==="feature");return e.jsxs(m,{children:[e.jsxs(u,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(De,{}),"Drawing Tools"]}),e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:1},children:"Drawing Mode"}),e.jsxs(v,{container:!0,spacing:1,children:[c.map(({mode:o,icon:w,label:j})=>e.jsx(v,{size:6,children:e.jsx(Be,{title:j,children:e.jsx(Qe,{value:o||"",selected:t.mode===o,onClick:()=>d(o),sx:{width:"100%",height:48},size:"small",children:w})})},o)),e.jsx(v,{size:6,children:e.jsx(Be,{title:"Edit Features",children:e.jsx(Qe,{value:"edit",selected:t.mode==="edit",onClick:()=>d("edit"),sx:{width:"100%",height:48},size:"small",children:e.jsx(De,{})})})}),e.jsx(v,{size:6,children:e.jsx(Be,{title:"Delete Features",children:e.jsx(Qe,{value:"delete",selected:t.mode==="delete",onClick:()=>d("delete"),sx:{width:"100%",height:48},size:"small",color:"error",children:e.jsx(Je,{})})})})]})]}),y.length>0&&e.jsx($,{sx:{p:2,mb:2},children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx(U,{children:"Target Layer"}),e.jsx(N,{value:i,label:"Target Layer",onChange:o=>r(o.target.value),children:y.map(o=>e.jsxs(b,{value:o.id,children:[o.name," (",o.features.length," features)"]},o.id))})]})}),t.mode&&t.mode!=="edit"&&t.mode!=="delete"&&e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Style Options"}),e.jsxs(m,{sx:{mb:2},children:[e.jsx(u,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Stroke Color"}),e.jsx(v,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(o=>e.jsx(v,{size:"auto",children:e.jsx(m,{sx:{width:32,height:32,backgroundColor:o,border:t.options.style.color===o?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>h("color",o)})},o))})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(m,{sx:{mb:2},children:[e.jsx(u,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Fill Color"}),e.jsx(v,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(o=>e.jsx(v,{size:"auto",children:e.jsx(m,{sx:{width:32,height:32,backgroundColor:o,border:t.options.style.fillColor===o?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>h("fillColor",o)})},o))})]}),e.jsxs(m,{sx:{mb:2},children:[e.jsxs(u,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Stroke Width: ",t.options.style.weight,"px"]}),e.jsx(Me,{value:t.options.style.weight||3,onChange:(o,w)=>h("weight",w),min:1,max:10,step:1,size:"small"})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(m,{sx:{mb:2},children:[e.jsxs(u,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Fill Opacity: ",Math.round((t.options.style.fillOpacity||.3)*100),"%"]}),e.jsx(Me,{value:(t.options.style.fillOpacity||.3)*100,onChange:(o,w)=>h("fillOpacity",w/100),min:0,max:100,step:5,size:"small"})]})]}),e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Drawing Options"}),e.jsx(V,{control:e.jsx(Z,{checked:t.options.snapToGrid||!1,onChange:o=>a("snapToGrid",o.target.checked),size:"small"}),label:"Snap to Grid",sx:{mb:1,display:"flex"}}),e.jsx(V,{control:e.jsx(Z,{checked:t.options.showMeasurements||!1,onChange:o=>a("showMeasurements",o.target.checked),size:"small"}),label:"Show Measurements",sx:{mb:1,display:"flex"}}),e.jsx(V,{control:e.jsx(Z,{checked:t.options.allowEdit||!1,onChange:o=>a("allowEdit",o.target.checked),size:"small"}),label:"Allow Editing",sx:{display:"flex"}})]}),e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Map Display"}),e.jsx(V,{control:e.jsx(Z,{checked:!1,onChange:o=>f("showGrid",o.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}}),e.jsx(V,{control:e.jsx(Z,{checked:!0,onChange:o=>f("showCoordinates",o.target.checked),size:"small"}),label:"Show Coordinates",sx:{display:"flex"}})]}),t.mode&&e.jsxs($,{sx:{p:2,bgcolor:"primary.light",color:"primary.contrastText"},children:[e.jsxs(u,{variant:"subtitle2",sx:{mb:1},children:["Active: ",t.mode.charAt(0).toUpperCase()+t.mode.slice(1)," Mode"]}),e.jsxs(u,{variant:"caption",children:[t.mode==="marker"&&"Click on the map to place markers",t.mode==="polyline"&&"Click points to draw a line",t.mode==="polygon"&&"Click points to draw a polygon",t.mode==="circle"&&"Click and drag to draw a circle",t.mode==="rectangle"&&"Click and drag to draw a rectangle",t.mode==="edit"&&"Click features to edit them",t.mode==="delete"&&"Click features to delete them"]})]}),y.length===0&&e.jsxs($,{sx:{p:2,bgcolor:"warning.light",color:"warning.contrastText"},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:1},children:"No Feature Layers"}),e.jsx(u,{variant:"caption",children:"Create a feature layer first to start drawing."})]})]})},A=(l,t,n,i,r="medium",c="#333333")=>{const d=encodeURIComponent(i);return{id:l,name:t,category:n,url:`data:image/svg+xml,${d}`,size:r,color:c,anchor:r==="small"?[12,12]:r==="large"?[20,40]:[16,32],popupAnchor:[0,r==="small"?-12:r==="large"?-40:-32]}},hr=[A("fire-engine","Fire Engine","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("ladder-truck","Ladder Truck","fire-apparatus",`<svg width="50" height="32" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("water-tanker","Water Tanker","fire-apparatus",`<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),A("brush-unit","Brush Unit","fire-apparatus",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#059669"),A("rescue-unit","Rescue Unit","fire-apparatus",`<svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("hazmat-unit","HazMat Unit","fire-apparatus",`<svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#F59E0B"),A("command-vehicle","Command Vehicle","fire-apparatus",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1F2937"),A("fire-boat","Fire Boat","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626")],dr=[A("als-ambulance","ALS Ambulance","ems-units",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("bls-ambulance","BLS Ambulance","ems-units",`<svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),A("air-ambulance","Air Ambulance","ems-units",`<svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("paramedic-unit","Paramedic Unit","ems-units",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1E40AF")],xr=[A("structure-fire","Structure Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#DC2626"),A("vehicle-fire","Vehicle Fire","incident-types",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#F59E0B"),A("medical-emergency","Medical Emergency","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#059669"),A("hazmat-incident","Hazmat Incident","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#F59E0B"),A("water-rescue","Water Rescue","incident-types",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#3B82F6"),A("wildland-fire","Wildland Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#22C55E")],fr=[A("fire-station","Fire Station","facilities",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),A("hospital","Hospital","facilities",`<svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),A("fire-hydrant","Fire Hydrant","facilities",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"small","#F59E0B"),A("helipad","Helipad","facilities",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF")],Ze={"fire-apparatus":hr,"ems-units":dr,"incident-types":xr,facilities:fr,prevention:[A("fire-extinguisher","Fire Extinguisher","prevention",`<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#DC2626"),A("smoke-detector","Smoke Detector","prevention",`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#6B7280"),A("sprinkler-system","Sprinkler System","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#DC2626"),A("exit-sign","Exit Sign","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#22C55E"),A("emergency-phone","Emergency Phone","prevention",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#DC2626"),A("fire-alarm-panel","Fire Alarm Panel","prevention",`<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#DC2626")],"energy-systems":[A("power-lines","Power Lines","energy-systems",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#1F2937"),A("gas-lines","Gas Lines","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#FBBF24"),A("solar-panels","Solar Panels","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#1E40AF"),A("transformer","Transformer","energy-systems",`<svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280"),A("electrical-panel","Electrical Panel","energy-systems",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#6B7280"),A("generator","Generator","energy-systems",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280")],custom:[]};Object.values(Ze).flat();const pr={"fire-apparatus":e.jsx(El,{}),"ems-units":e.jsx(Xl,{}),"incident-types":e.jsx(vl,{}),facilities:e.jsx(wl,{}),prevention:e.jsx(Cl,{}),"energy-systems":e.jsx(Ql,{}),custom:e.jsx(Pe,{})},gr=()=>{var s;const l=Y(Re),[t,n]=z.useState("fire-apparatus"),[i,r]=z.useState("medium"),[c,d]=z.useState("#DC2626"),[h,a]=z.useState(""),f=Object.keys(Ze),o=(Ze[t]||[]).filter(x=>x.name.toLowerCase().includes(h.toLowerCase())),w=l.filter(x=>x.type==="feature"),j=(x,E)=>{const R={...E,size:i,color:c};x.dataTransfer.setData("application/json",JSON.stringify(R)),x.dataTransfer.effectAllowed="copy";const G=x.currentTarget.cloneNode(!0);G.style.transform="scale(1.2)",G.style.opacity="0.8",document.body.appendChild(G),x.dataTransfer.setDragImage(G,16,16),setTimeout(()=>document.body.removeChild(G),0)},F=[{name:"Fire Red",value:"#DC2626"},{name:"EMS Blue",value:"#1E40AF"},{name:"Safety Green",value:"#059669"},{name:"Warning Orange",value:"#F59E0B"},{name:"Medical Cross",value:"#EF4444"},{name:"Industrial Gray",value:"#6B7280"},{name:"Hazmat Yellow",value:"#FCD34D"},{name:"Emergency Purple",value:"#7C3AED"}];return e.jsxs(m,{children:[e.jsxs(u,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(Pe,{}),"Professional Icons"]}),e.jsx(P,{fullWidth:!0,size:"small",placeholder:"Search fire & EMS icons...",value:h,onChange:x=>a(x.target.value),InputProps:{startAdornment:e.jsx(xi,{position:"start",children:e.jsx(ml,{})})},sx:{mb:2}}),e.jsx(et,{value:t,onChange:(x,E)=>n(E),variant:"scrollable",scrollButtons:"auto",sx:{mb:2,minHeight:"auto"},children:f.map(x=>e.jsx(ge,{value:x,icon:pr[x],label:x.replace("-"," "),sx:{minHeight:"auto",py:1,fontSize:"0.75rem",textTransform:"capitalize"}},x))}),e.jsxs($,{sx:{p:2,mb:2,bgcolor:"grey.50"},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2,fontWeight:"bold"},children:"Icon Settings"}),e.jsxs(v,{container:!0,spacing:2,children:[e.jsx(v,{size:6,children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx(U,{children:"Size"}),e.jsxs(N,{value:i,label:"Size",onChange:x=>r(x.target.value),children:[e.jsx(b,{value:"small",children:"Small (20px)"}),e.jsx(b,{value:"medium",children:"Medium (32px)"}),e.jsx(b,{value:"large",children:"Large (48px)"}),e.jsx(b,{value:"extra-large",children:"Extra Large (64px)"})]})]})}),e.jsx(v,{size:6,children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx(U,{children:"Color Theme"}),e.jsx(N,{value:c,label:"Color Theme",onChange:x=>d(x.target.value),children:F.map(x=>e.jsx(b,{value:x.value,children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(m,{sx:{width:16,height:16,backgroundColor:x.value,borderRadius:"50%",border:"1px solid #ccc"}}),x.name]})},x.value))})]})})]})]}),e.jsxs(m,{sx:{mb:2},children:[e.jsxs(m,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsxs(u,{variant:"subtitle2",sx:{fontWeight:"bold",textTransform:"uppercase"},children:[t.replace("-"," ")," (",o.length,")"]}),e.jsx(hi,{label:`${i} • ${(s=F.find(x=>x.value===c))==null?void 0:s.name}`,size:"small",color:"primary",variant:"outlined"})]}),o.length>0?e.jsx(v,{container:!0,spacing:1,children:o.map(x=>e.jsx(v,{size:4,children:e.jsx(Be,{title:`${x.name} - Drag to map`,children:e.jsxs($,{sx:{p:1,textAlign:"center",cursor:"grab",transition:"all 0.2s ease","&:hover":{bgcolor:"primary.light",transform:"scale(1.05)",boxShadow:2},"&:active":{cursor:"grabbing",transform:"scale(0.95)"}},draggable:!0,onDragStart:E=>j(E,x),children:[e.jsx(m,{component:"img",src:x.url,alt:x.name,sx:{width:i==="small"?20:i==="large"?40:32,height:i==="small"?20:i==="large"?40:32,mb:.5,filter:c!==x.color?`hue-rotate(${ur(x.color,c)}deg)`:"none"}}),e.jsx(u,{variant:"caption",sx:{display:"block",fontSize:"0.65rem",lineHeight:1.2,fontWeight:500},children:x.name})]})})},x.id))}):e.jsx(m,{sx:{textAlign:"center",py:4},children:e.jsx(u,{variant:"body2",color:"text.secondary",children:h?"No icons match your search":"No icons in this category"})})]}),w.length===0&&e.jsxs(ye,{severity:"info",sx:{mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:1},children:"Create a layer first"}),e.jsx(u,{variant:"caption",children:"Go to the Layers tab and create a feature layer to place icons on the map."})]}),e.jsxs($,{sx:{p:2,bgcolor:"info.light",color:"info.contrastText"},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:1,fontWeight:"bold"},children:"How to Use"}),e.jsxs(m,{component:"ul",sx:{pl:2,m:0,"& li":{mb:.5}},children:[e.jsx("li",{children:"Select icon size and color above"}),e.jsx("li",{children:"Drag any icon from the library"}),e.jsx("li",{children:"Drop it on the map to place a marker"}),e.jsx("li",{children:"Click the marker to edit its properties"})]})]})]})};function ur(l,t){const n={"#DC2626":0,"#EF4444":5,"#F59E0B":45,"#FCD34D":60,"#059669":120,"#1E40AF":240,"#7C3AED":270,"#6B7280":0},i=n[l]||0;return(n[t]||0)-i}const yr=()=>{const l=q(),t=()=>{l(ni())};return e.jsxs(m,{children:[e.jsxs(u,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(pe,{}),"Export"]}),e.jsxs($,{sx:{p:2},children:[e.jsx(u,{variant:"body2",color:"text.secondary",sx:{mb:2},children:"Generate professional maps with the new export system"}),e.jsx(K,{variant:"contained",onClick:t,startIcon:e.jsx(pe,{}),fullWidth:!0,children:"Open Export Options"})]})]})},mr=()=>{const l=q(),t=Y(Ke),n=r=>{l(Ni(r))},i=(r,c)=>{l(ri({[r]:c}))};return e.jsxs(m,{children:[e.jsxs(u,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(di,{}),"Settings"]}),e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Base Map"}),e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx(U,{children:"Base Map"}),e.jsx(N,{value:t.activeBaseMap,label:"Base Map",onChange:r=>n(r.target.value),children:t.baseMaps.map(r=>e.jsx(b,{value:r.id,children:r.name},r.id))})]})]}),e.jsxs($,{sx:{p:2,mb:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Display Options"}),e.jsx(V,{control:e.jsx(Z,{checked:t.showCoordinates,onChange:r=>i("showCoordinates",r.target.checked),size:"small"}),label:"Show Coordinates",sx:{mb:1,display:"flex"}}),e.jsx(V,{control:e.jsx(Z,{checked:t.showGrid,onChange:r=>i("showGrid",r.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}})]}),e.jsxs($,{sx:{p:2},children:[e.jsx(u,{variant:"subtitle2",sx:{mb:2},children:"Measurement Units"}),e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx(U,{children:"Units"}),e.jsxs(N,{value:t.measurementUnits,label:"Units",onChange:r=>i("measurementUnits",r.target.value),children:[e.jsx(b,{value:"metric",children:"Metric (m, km)"}),e.jsx(b,{value:"imperial",children:"Imperial (ft, mi)"})]})]})]})]})},wr=({mode:l})=>{const t=q(),n=Y(oi),i=[{id:"layers",label:"Layers",icon:e.jsx(ue,{}),component:sr},{id:"drawing",label:"Drawing",icon:e.jsx(De,{}),component:cr,disabled:l==="view"},{id:"icons",label:"Icons",icon:e.jsx(Pe,{}),component:gr,disabled:l==="view"},{id:"export",label:"Export",icon:e.jsx(pe,{}),component:yr},{id:"settings",label:"Settings",icon:e.jsx(di,{}),component:mr}],r=(h,a)=>{t(Oi(a))},d=(i.find(h=>h.id===n.activePanel)||i[0]).component;return e.jsxs(m,{sx:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx($,{elevation:0,sx:{borderBottom:1,borderColor:"divider"},children:e.jsx(et,{value:n.activePanel||"layers",onChange:r,variant:"scrollable",scrollButtons:"auto",orientation:"horizontal",sx:{minHeight:48,"& .MuiTab-root":{minWidth:60,minHeight:48}},children:i.map(h=>e.jsx(ge,{value:h.id,icon:h.icon,label:h.label,disabled:h.disabled,sx:{fontSize:"0.75rem","&.Mui-selected":{color:"primary.main"}}},h.id))})}),e.jsx(m,{sx:{flex:1,overflow:"auto",p:2},children:e.jsx(d,{})})]})},vr=()=>{const l=q(),t=()=>{l($i())};return e.jsxs(Ae,{open:!0,onClose:t,maxWidth:"md",fullWidth:!0,children:[e.jsx(ze,{sx:{textAlign:"center",pb:1},children:"Welcome to Fire Map Pro"}),e.jsxs(Te,{children:[e.jsx(u,{variant:"h6",sx:{mb:2,textAlign:"center",color:"primary.main"},children:"Professional Mapping for Fire & EMS Operations"}),e.jsxs(u,{variant:"body1",paragraph:!0,children:[e.jsx("strong",{children:"Ready to use immediately:"})," Your map is pre-loaded with fire stations, hospitals, hydrants, and recent incidents to provide instant situational awareness."]}),e.jsx(u,{variant:"body1",paragraph:!0,children:e.jsx("strong",{children:"Key Features:"})}),e.jsxs(m,{component:"ul",sx:{pl:2,mb:2},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Live Data Layers:"})," Fire stations, hospitals, hydrants, response zones"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Drawing Tools:"})," Add markers, areas, and annotations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Icon Library:"})," Professional fire & EMS symbols"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Layer Controls:"})," Toggle visibility and adjust transparency"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Export Options:"})," Generate professional maps and reports"]})]}),e.jsx(u,{variant:"body2",color:"text.secondary",sx:{textAlign:"center"},children:"Click layers in the sidebar to explore your operational data →"})]}),e.jsx(Ie,{sx:{justifyContent:"center",pb:3},children:e.jsx(K,{onClick:t,variant:"contained",size:"large",children:"Start Mapping"})})]})};class br{static async exportMap(t,n,i){console.error("[EMERGENCY DEBUG] ExportService.exportMap() STARTED"),console.error("[EMERGENCY DEBUG] Configuration received:",n);const{basic:r}=n;try{if(console.error("[EMERGENCY DEBUG] Starting export process..."),i==null||i(10,"Preparing export..."),!t)throw new Error("Map element not found");switch(i==null||i(20,"Capturing map data..."),console.error("[EMERGENCY DEBUG] Routing to format:",r.format),r.format){case"png":case"jpg":case"tiff":case"webp":console.error("[EMERGENCY DEBUG] Calling exportRasterImage"),await this.exportRasterImage(t,n,i),console.error("[EMERGENCY DEBUG] exportRasterImage completed");break;case"pdf":await this.exportPDF(t,n,i);break;case"svg":await this.exportSVG(t,n,i);break;case"eps":await this.exportEPS(t,n,i);break;case"geojson":case"kml":case"geopdf":await this.exportGISFormat(t,n,i);break;default:throw new Error(`Export format ${r.format} not supported`)}i==null||i(100,"Export completed successfully")}catch(c){throw console.error("Export failed:",c),c}}static async exportRasterImage(t,n,i){console.error("[EMERGENCY DEBUG] exportRasterImage() STARTED");const{basic:r,layout:c}=n;console.error("[EMERGENCY DEBUG] Basic config:",r),console.error("[EMERGENCY DEBUG] Layout config:",c),i==null||i(30,"Capturing map screenshot..."),console.error("[EMERGENCY DEBUG] About to capture map with html2canvas"),console.error("[EMERGENCY DEBUG] Map element:",t),console.error("[EMERGENCY DEBUG] Map element dimensions:",{width:t.offsetWidth,height:t.offsetHeight,innerHTML:t.innerHTML.substring(0,200)+"..."});const{default:d}=await Lt(async()=>{const{default:o}=await import("./html2canvas.esm-CBrSDip1.js");return{default:o}},[]),h=await d(t,{useCORS:!0,allowTaint:!0,scale:r.dpi/96,backgroundColor:"#ffffff"});console.error("[EMERGENCY DEBUG] html2canvas completed, canvas size:",{width:h.width,height:h.height}),console.error("[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout"),i==null||i(60,"Processing layout elements..."),console.log("[Export] Full export configuration:",{basic:n.basic,layout:{customLayout:c.customLayout,selectedTemplate:c.selectedTemplate,elementsCount:c.elements.length,elements:c.elements}});let a=h;if(c.customLayout&&(c.selectedTemplate||c.elements.length>0)){console.log("[Export] Applying custom layout with",c.elements.length,"elements"),console.error("[EMERGENCY DEBUG] About to call applyLayoutTemplate");try{a=await this.applyLayoutTemplate(h,n),console.error("[EMERGENCY DEBUG] applyLayoutTemplate completed successfully"),console.error("[EMERGENCY DEBUG] Returned final canvas dimensions:",a.width,"x",a.height),console.error("[EMERGENCY DEBUG] Layout template applied successfully")}catch(o){throw console.error("[EMERGENCY DEBUG] applyLayoutTemplate FAILED:",o),o}}else console.log("[Export] Using basic layout - no custom elements");i==null||i(80,"Generating final image...");const f=r.format==="jpg"?"jpeg":r.format,y=r.format==="jpg"?.9:void 0;console.error("[EMERGENCY DEBUG] Final canvas before conversion:",{canvasSize:{width:a.width,height:a.height},format:f,quality:y}),console.error("[EMERGENCY DEBUG] Ready to convert canvas to blob"),a.toBlob(o=>{console.error("[EMERGENCY DEBUG] toBlob callback executed, blob size:",o==null?void 0:o.size),o?(console.error("[EMERGENCY DEBUG] Downloading blob with filename:",`${r.title||"fire-map"}.${r.format}`),this.downloadBlob(o,`${r.title||"fire-map"}.${r.format}`)):console.error("[EMERGENCY DEBUG] toBlob failed - blob is null!")},`image/${f}`,y)}static async exportPDF(t,n,i){const{basic:r,advanced:c,layout:d}=n;i==null||i(30,"Capturing map for PDF...");const{default:h}=await Lt(async()=>{const{default:s}=await import("./html2canvas.esm-CBrSDip1.js");return{default:s}},[]),a=await h(t,{useCORS:!0,allowTaint:!0,scale:r.dpi/96});i==null||i(50,"Creating PDF document...");const{width:f,height:y}=this.getPaperDimensions(r.paperSize,r.orientation),o=new bl({orientation:r.orientation,unit:"mm",format:r.paperSize==="custom"?[c.customWidth,c.customHeight]:r.paperSize});i==null||i(70,"Adding elements to PDF...");const w=a.toDataURL("image/png"),j=f-20,F=a.height*j/a.width;o.addImage(w,"PNG",10,10,j,F),r.includeTitle&&r.title&&(o.setFontSize(16),o.text(r.title,f/2,F+25,{align:"center"})),r.subtitle&&(o.setFontSize(12),o.text(r.subtitle,f/2,F+35,{align:"center"})),d.customLayout&&d.elements.length>0&&await this.addLayoutElementsToPDF(o,d.elements,{width:f,height:y}),i==null||i(90,"Finalizing PDF..."),o.save(`${r.title||"fire-map"}.pdf`)}static async exportSVG(t,n,i){throw i==null||i(50,"Generating SVG..."),new Error("SVG export is not yet implemented. Please use PNG or PDF format.")}static async exportEPS(t,n,i){throw new Error("EPS export is not yet implemented. Please use PNG or PDF format.")}static async exportGISFormat(t,n,i){throw new Error("GIS format export is not yet implemented. Please use PNG or PDF format.")}static async applyLayoutTemplate(t,n){console.error("[EMERGENCY DEBUG] applyLayoutTemplate ENTRY");const{basic:i,layout:r}=n;console.error("[EMERGENCY DEBUG] Getting paper dimensions for:",i.paperSize,i.orientation);const{width:c,height:d}=this.getPaperDimensions(i.paperSize,i.orientation);console.error("[EMERGENCY DEBUG] Paper dimensions:",{width:c,height:d});const h=document.createElement("canvas"),a=h.getContext("2d",{willReadFrequently:!0}),f=c/25.4*i.dpi,y=d/25.4*i.dpi;switch(h.width=f,h.height=y,console.error("[EMERGENCY DEBUG] Layout canvas dimensions:",h.width,"x",h.height),console.error("[EMERGENCY DEBUG] Map canvas dimensions:",t.width,"x",t.height),console.error("[EMERGENCY DEBUG] Layout canvas setup complete"),a.fillStyle="#ffffff",a.fillRect(0,0,f,y),console.error("[EMERGENCY DEBUG] Layout canvas created:",{pixelSize:{width:f,height:y},paperSize:{width:c,height:d},dpi:i.dpi,mapCanvasSize:{width:t.width,height:t.height}}),console.log("[Export] Applying layout template:",r.selectedTemplate),r.selectedTemplate){case"standard":console.log("[Export] Using standard template with custom layout"),await this.applyCustomLayout(a,t,n,f,y);break;case"professional":console.log("[Export] Using professional template"),await this.applyProfessionalTemplate(a,t,n,f,y);break;case"presentation":console.log("[Export] Using presentation template"),await this.applyPresentationTemplate(a,t,n,f,y);break;case"tactical":console.log("[Export] Using tactical template"),await this.applyTacticalTemplate(a,t,n,f,y);break;default:console.log("[Export] Using custom layout with elements"),await this.applyCustomLayout(a,t,n,f,y)}return console.error("[EMERGENCY DEBUG] Layout canvas complete - returning to caller"),h}static async applyProfessionalTemplate(t,n,i,r,c){console.log("[Export] Professional template using custom layout logic"),await this.applyCustomLayout(t,n,i,r,c)}static async applyPresentationTemplate(t,n,i,r,c){console.log("[Export] Presentation template using custom layout logic"),await this.applyCustomLayout(t,n,i,r,c)}static async applyTacticalTemplate(t,n,i,r,c){console.log("[Export] Tactical template using custom layout logic"),await this.applyCustomLayout(t,n,i,r,c)}static async applyCustomLayout(t,n,i,r,c){var f,y,o,w,j,F,s,x,E,R,G,C,B,O,g,M,S,Q,me,tt,it,lt,rt,nt,ot,at,st,ct,ht,dt,xt,ft,pt,gt,ut,yt,mt,wt,vt,bt,jt;console.error("[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT"),console.error("[EMERGENCY DEBUG] Canvas size:",{width:r,height:c});const{layout:d,basic:h}=i;console.error("[EMERGENCY DEBUG] Configuration received:",{layout:d,basic:h}),console.log("[Export] Layout data:",{elementsCount:d.elements.length,elements:d.elements.map(p=>({type:p.type,visible:p.visible,id:p.id}))});const a=[...d.elements].sort((p,k)=>p.zIndex-k.zIndex);console.log("[Export] Processing",a.length,"layout elements:",a.map(p=>({type:p.type,visible:p.visible})));for(const p of a){if(console.log("[Export] Processing element:",{type:p.type,visible:p.visible,position:{x:p.x,y:p.y},size:{width:p.width,height:p.height},content:p.content}),!p.visible){console.log("[Export] Skipping invisible element:",p.type);continue}const k=p.x/100*r,T=p.y/100*c,D=p.width/100*r,L=p.height/100*c;switch(console.error("[CANVAS DEBUG] Element",p.type,"position:",{x:k,y:T,w:D,h:L},"Canvas:",{width:r,height:c}),console.log("[Export] Rendering element:",p.type,"at",{x:k,y:T,w:D,h:L}),p.type){case"map":console.error("[EMERGENCY DEBUG] Drawing map canvas:",{mapCanvasSize:{width:n.width,height:n.height},drawPosition:{x:k,y:T,w:D,h:L},layoutCanvasSize:{width:t.canvas.width,height:t.canvas.height},elementPosition:{x:p.x,y:p.y,width:p.width,height:p.height}}),console.error("[EMERGENCY DEBUG] Drawing map canvas to layout"),t.drawImage(n,k,T,D,L),console.error("[EMERGENCY DEBUG] Map canvas drawn to layout canvas");break;case"title":console.log("[Export] Title element debug:",{elementContent:p.content,textAlign:(f=p.content)==null?void 0:f.textAlign,elementType:p.type}),t.fillStyle=((y=p.content)==null?void 0:y.color)||"#333333";const Ct=((o=p.content)==null?void 0:o.fontSize)||Math.max(16,D*.05),gi=((w=p.content)==null?void 0:w.fontWeight)||"bold";t.font=`${gi} ${Ct}px ${((j=p.content)==null?void 0:j.fontFamily)||"Arial"}`,t.textAlign=((F=p.content)==null?void 0:F.textAlign)||"left",console.log("[Export] Title canvas textAlign set to:",t.textAlign);let we=k;t.textAlign==="center"?we=k+D/2:t.textAlign==="right"&&(we=k+D),console.log("[Export] Title position:",{originalX:k,adjustedX:we,width:D,alignment:t.textAlign}),t.fillText(((s=p.content)==null?void 0:s.text)||h.title||"Untitled Map",we,T+Ct);break;case"subtitle":console.log("[Export] Rendering subtitle:",{elementContent:p.content,basicSubtitle:h.subtitle,finalText:((x=p.content)==null?void 0:x.text)||h.subtitle||"Map Subtitle"}),t.fillStyle=((E=p.content)==null?void 0:E.color)||"#666666";const We=((R=p.content)==null?void 0:R.fontSize)||Math.max(12,D*.04),ui=((G=p.content)==null?void 0:G.fontWeight)||"normal";t.font=`${ui} ${We}px ${((C=p.content)==null?void 0:C.fontFamily)||"Arial"}`,t.textAlign=((B=p.content)==null?void 0:B.textAlign)||"left";const Et=((O=p.content)==null?void 0:O.text)||h.subtitle||"Map Subtitle";let ve=k;t.textAlign==="center"?ve=k+D/2:t.textAlign==="right"&&(ve=k+D),console.log("[Export] Drawing subtitle text:",Et,"at position:",{x:ve,y:T+We}),console.log("[Export] Subtitle canvas state:",{fillStyle:t.fillStyle,font:t.font,textAlign:t.textAlign,canvasSize:{width:t.canvas.width,height:t.canvas.height},elementBounds:{x:k,y:T,w:D,h:L}}),t.fillText(Et,ve,T+We);break;case"text":t.fillStyle=((g=p.content)==null?void 0:g.color)||"#333333";const Ge=((M=p.content)==null?void 0:M.fontSize)||Math.max(12,D*.03),yi=((S=p.content)==null?void 0:S.fontWeight)||"normal";t.font=`${yi} ${Ge}px ${((Q=p.content)==null?void 0:Q.fontFamily)||"Arial"}`,t.textAlign=((me=p.content)==null?void 0:me.textAlign)||"left";const mi=(((tt=p.content)==null?void 0:tt.text)||"").split(`
`),wi=Ge*1.2;mi.forEach((_,X)=>{t.fillText(_,k,T+Ge+X*wi)});break;case"legend":t.strokeStyle=((it=p.content)==null?void 0:it.borderColor)||"#cccccc",t.fillStyle=((lt=p.content)==null?void 0:lt.backgroundColor)||"#ffffff",t.fillRect(k,T,D,L),p.showLegendBorder!==!1&&t.strokeRect(k,T,D,L),t.fillStyle=((rt=p.content)==null?void 0:rt.color)||"#333333";const He=((nt=p.content)==null?void 0:nt.fontSize)||Math.max(12,D*.04),vi=((ot=p.content)==null?void 0:ot.fontWeight)||"bold";t.font=`${vi} ${He}px ${((at=p.content)==null?void 0:at.fontFamily)||"Arial"}`,t.textAlign=((st=p.content)==null?void 0:st.textAlign)||"left";const bi=p.legendTitle||((ct=p.content)==null?void 0:ct.text)||"Legend";t.fillText(bi,k+10,T+He+5);const Ft=p.legendStyle||"standard",Bt=T+He+20,ji=16,Ci=18;Ft==="detailed"?[{color:"#ff4444",label:"Fire Stations"},{color:"#4444ff",label:"Hydrants"},{color:"#44ff44",label:"EMS Units"},{color:"#ffaa44",label:"Incidents"}].forEach((X,xe)=>{const fe=Bt+xe*Ci;fe+ji<T+L-10&&(t.fillStyle=X.color,t.fillRect(k+10,fe,12,12),t.strokeStyle="#333",t.strokeRect(k+10,fe,12,12),t.fillStyle="#333333",t.font=`${Math.max(10,D*.025)}px Arial`,t.fillText(X.label,k+28,fe+10))}):Ft==="compact"&&(t.fillStyle="#333333",t.font=`${Math.max(9,D*.02)}px Arial`,t.fillText("Map elements and symbols",k+10,Bt));break;case"north-arrow":const Ue=p.arrowStyle||"classic",kt=p.rotation||0,de=((ht=p.content)==null?void 0:ht.color)||"#333333";console.log("[Export] Rendering north arrow:",{arrowStyle:Ue,rotation:kt,arrowColor:de,elementProperties:p,position:{x:k,y:T,w:D,h:L}}),t.strokeStyle=de,t.fillStyle=de,t.lineWidth=2;const Ne=k+D/2,Oe=T+L/2,I=Math.min(D,L)*.3;switch(t.save(),t.translate(Ne,Oe),t.rotate(kt*Math.PI/180),Ue){case"classic":t.beginPath(),t.moveTo(0,-I),t.lineTo(-I/3,I/3),t.lineTo(0,0),t.lineTo(I/3,I/3),t.closePath(),t.fill(),t.beginPath(),t.moveTo(0,0),t.lineTo(0,I),t.stroke();break;case"modern":t.beginPath(),t.moveTo(0,-I),t.lineTo(-I/4,I/4),t.lineTo(0,I/8),t.lineTo(I/4,I/4),t.closePath(),t.fill();break;case"simple":t.beginPath(),t.moveTo(0,-I),t.lineTo(-I/2,I/2),t.lineTo(I/2,I/2),t.closePath(),t.fill();break;case"compass":t.fillStyle="#cc0000",t.beginPath(),t.moveTo(0,-I),t.lineTo(-I/4,0),t.lineTo(I/4,0),t.closePath(),t.fill(),t.fillStyle="#ffffff",t.strokeStyle=de,t.beginPath(),t.moveTo(0,I),t.lineTo(-I/4,0),t.lineTo(I/4,0),t.closePath(),t.fill(),t.stroke(),t.fillStyle=de,t.beginPath(),t.moveTo(-I*.7,0),t.lineTo(0,-I/4),t.lineTo(0,I/4),t.closePath(),t.fill(),t.beginPath(),t.moveTo(I*.7,0),t.lineTo(0,-I/4),t.lineTo(0,I/4),t.closePath(),t.fill();break}t.restore(),console.log("[Export] North arrow rendered, adding label"),Ue!=="compass"&&(t.fillStyle=de,t.font=`bold ${Math.max(10,I*.6)}px Arial`,t.textAlign="center",t.fillText("N",Ne,Oe+I+15),console.log('[Export] North arrow "N" label drawn at:',{x:Ne,y:Oe+I+15}));break;case"scale-bar":const Ei=p.units||"feet",St=p.scaleStyle||"bar",be=p.divisions||4,Fi=((dt=i.mapView)==null?void 0:dt.center)||{latitude:40},Bi=((xt=i.mapView)==null?void 0:xt.zoom)||10,ki=this.calculateMetersPerPixel(Bi,Fi.latitude),Dt=this.getScaleBarInfo(ki,Ei,D*.8);t.strokeStyle=((ft=p.content)==null?void 0:ft.color)||"#333333",t.fillStyle=((pt=p.content)==null?void 0:pt.color)||"#333333",t.lineWidth=2;const te=T+L/2,ae=Dt.pixelLength,se=k+(D-ae)/2;if(St==="alternating"){const _=ae/be;for(let X=0;X<be;X++){const xe=se+X*_;t.fillStyle=X%2===0?"#333333":"#ffffff",t.fillRect(xe,te-3,_,6),t.strokeStyle="#333333",t.strokeRect(xe,te-3,_,6)}}else{St==="bar"&&(t.fillStyle="#ffffff",t.fillRect(se,te-3,ae,6),t.strokeRect(se,te-3,ae,6)),t.strokeStyle=((gt=p.content)==null?void 0:gt.color)||"#333333",t.beginPath(),t.moveTo(se,te),t.lineTo(se+ae,te),t.stroke(),t.beginPath();for(let _=0;_<=be;_++){const X=se+_*ae/be;t.moveTo(X,te-5),t.lineTo(X,te+5)}t.stroke()}t.fillStyle=((ut=p.content)==null?void 0:ut.color)||"#333333",t.font=`${Math.max(10,L*.3)}px Arial`,t.textAlign="center",t.fillText(Dt.label,se+ae/2,te+20);break;case"image":if((yt=p.content)!=null&&yt.imageSrc){const _=((mt=p.content)==null?void 0:mt.imageFit)||"cover";await this.drawImageFromSrc(t,p.content.imageSrc,k,T,D,L,_)}else t.strokeStyle="#cccccc",t.fillStyle="#f5f5f5",t.fillRect(k,T,D,L),t.strokeRect(k,T,D,L),t.fillStyle="#999999",t.font=`${Math.max(12,D*.05)}px Arial`,t.textAlign="center",t.fillText("Image",k+D/2,T+L/2);break;case"shape":const Mt=p.strokeColor||((wt=p.content)==null?void 0:wt.borderColor)||"#333333",ce=p.fillColor||((vt=p.content)==null?void 0:vt.backgroundColor)||"transparent",At=p.strokeWidth||((bt=p.content)==null?void 0:bt.borderWidth)||1,zt=p.shapeType||((jt=p.content)==null?void 0:jt.shapeType)||"rectangle";switch(console.log("[Export] Rendering shape:",{shapeType:zt,shapeStrokeColor:Mt,shapeFillColor:ce,shapeStrokeWidth:At,elementProperties:p,position:{x:k,y:T,w:D,h:L}}),t.strokeStyle=Mt,t.fillStyle=ce,t.lineWidth=At,zt){case"rectangle":ce!=="transparent"&&t.fillRect(k,T,D,L),t.strokeRect(k,T,D,L);break;case"circle":const _=Math.min(D,L)/2,X=k+D/2,xe=T+L/2;t.beginPath(),t.arc(X,xe,_,0,2*Math.PI),ce!=="transparent"&&t.fill(),t.stroke();break;case"ellipse":const fe=k+D/2,Si=T+L/2,Di=D/2,Mi=L/2;t.beginPath(),t.ellipse(fe,Si,Di,Mi,0,0,2*Math.PI),ce!=="transparent"&&t.fill(),t.stroke();break;case"triangle":const Ai=k+D/2,zi=T,Tt=T+L;t.beginPath(),t.moveTo(Ai,zi),t.lineTo(k,Tt),t.lineTo(k+D,Tt),t.closePath(),ce!=="transparent"&&t.fill(),t.stroke();break;case"line":t.beginPath(),t.moveTo(k,T+L/2),t.lineTo(k+D,T+L/2),t.stroke();break;default:ce!=="transparent"&&t.fillRect(k,T,D,L),t.strokeRect(k,T,D,L);break}break;default:console.warn("[Export] Unknown element type:",p.type);break}console.error("[EMERGENCY DEBUG] Element rendered successfully:",p.type),console.log("[Export] Finished rendering element:",p.type)}console.log("[Export] Completed rendering all",a.length,"elements")}static async addLayoutElementsToPDF(t,n,i){var r,c;for(const d of n)switch(d.type){case"text":t.text(((r=d.content)==null?void 0:r.text)||"",d.x,d.y);break;case"image":(c=d.content)!=null&&c.imageSrc&&t.addImage(d.content.imageSrc,"PNG",d.x,d.y,d.width,d.height);break}}static async drawImageFromSrc(t,n,i,r,c,d,h="cover"){try{let a;n instanceof File?a=URL.createObjectURL(n):a=n;const f=new Image;return f.crossOrigin="anonymous",new Promise(y=>{f.onload=()=>{let o=i,w=r,j=c,F=d;const s=f.width/f.height,x=c/d;switch(h){case"contain":s>x?(F=c/s,w=r+(d-F)/2):(j=d*s,o=i+(c-j)/2);break;case"cover":s>x?(j=d*s,o=i-(j-c)/2):(F=c/s,w=r-(F-d)/2);break;case"fill":break;case"scale-down":f.width>c||f.height>d?s>x?(F=c/s,w=r+(d-F)/2):(j=d*s,o=i+(c-j)/2):(j=f.width,F=f.height,o=i+(c-j)/2,w=r+(d-F)/2);break}h==="cover"?(t.save(),t.beginPath(),t.rect(i,r,c,d),t.clip(),t.drawImage(f,o,w,j,F),t.restore()):t.drawImage(f,o,w,j,F),n instanceof File&&URL.revokeObjectURL(a),y()},f.onerror=()=>{console.warn("[Export] Failed to load image:",a),t.strokeStyle="#ccc",t.fillStyle="#f5f5f5",t.fillRect(i,r,c,d),t.strokeRect(i,r,c,d),t.fillStyle="#999",t.font="12px Arial",t.textAlign="center",t.fillText("Failed to load",i+c/2,r+d/2-6),t.fillText("image",i+c/2,r+d/2+6),n instanceof File&&URL.revokeObjectURL(a),y()},f.src=a})}catch(a){console.error("[Export] Error drawing image:",a)}}static getPaperDimensions(t,n){let i,r;switch(t){case"letter":i=215.9,r=279.4;break;case"a4":i=210,r=297;break;case"legal":i=215.9,r=355.6;break;case"tabloid":i=279.4,r=431.8;break;default:i=215.9,r=279.4}return n==="landscape"&&([i,r]=[r,i]),{width:i,height:r}}static calculateMetersPerPixel(t,n){const d=40075017/(256*Math.pow(2,t)),h=n*Math.PI/180;return d*Math.cos(h)}static getScaleBarInfo(t,n,i){const r=t*i;let c,d,h;switch(n){case"feet":h=3.28084,d="ft",c=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break;case"miles":h=621371e-9,d="mi",c=[.1,.25,.5,1,2,5,10,25,50,100];break;case"kilometers":h=.001,d="km",c=[.1,.25,.5,1,2,5,10,25,50,100];break;case"meters":default:h=1,d="m",c=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break}const a=r*h;let f=c[0];for(const j of c)if(j<=a*.8)f=j;else break;const o=f/h/t;let w;if(f<1)w=`${f.toFixed(1)} ${d}`;else if(f>=1e3&&(n==="feet"||n==="meters")){const j=n==="feet"?"mi":"km",s=f/(n==="feet"?5280:1e3);w=`${s.toFixed(s<1?1:0)} ${j}`}else w=`${f} ${d}`;return{pixelLength:Math.round(o),label:w}}static downloadBlob(t,n){const i=URL.createObjectURL(t),r=document.createElement("a");r.href=i,r.download=n,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(i)}}const jr=({isActive:l,configuration:t,disabled:n=!1})=>{const i=q(),r=t.basic,c=Y(s=>s.fireMapPro.export.configuration.layout.elements),[d,h]=z.useState(null),a=s=>x=>{const E=x.target.type==="checkbox"?x.target.checked:x.target.value;i(Rt({[s]:E}))},f=s=>{var E;const x=(E=s.target.files)==null?void 0:E[0];if(x&&x.type.startsWith("image/")){const R=new FileReader;R.onload=G=>{var B;const C=(B=G.target)==null?void 0:B.result;h(C),i(Rt({logo:x}))},R.readAsDataURL(x)}},y=()=>{console.log("[BasicExportTab] Manual apply clicked!",{title:r.title,subtitle:r.subtitle}),console.log("[BasicExportTab] Current layout elements:",c);let s=c.find(E=>E.type==="title"),x=c.find(E=>E.type==="subtitle");if(r.title)if(s)console.log("[BasicExportTab] Updating existing title element"),i(Se({id:s.id,updates:{content:{...s.content,text:r.title}}}));else{console.log("[BasicExportTab] Creating new title element");const E={type:"title",x:10,y:5,width:80,height:8,zIndex:10,content:{text:r.title,fontSize:18,fontFamily:"Arial",fontWeight:"bold",color:"#333333",textAlign:"center"},visible:!0};i(Xe(E))}if(r.subtitle)if(x)console.log("[BasicExportTab] Updating existing subtitle element"),i(Se({id:x.id,updates:{content:{...x.content,text:r.subtitle}}}));else{console.log("[BasicExportTab] Creating new subtitle element");const E={type:"subtitle",x:10,y:15,width:80,height:6,zIndex:9,content:{text:r.subtitle,fontSize:14,fontFamily:"Arial",fontWeight:"normal",color:"#666666",textAlign:"center"},visible:!0};i(Xe(E))}},o=[{value:"png",label:"PNG Image",group:"Raster Formats"},{value:"jpg",label:"JPEG Image",group:"Raster Formats"},{value:"tiff",label:"TIFF Image",group:"Raster Formats"},{value:"webp",label:"WebP Image",group:"Raster Formats"},{value:"pdf",label:"PDF Document",group:"Vector Formats"},{value:"svg",label:"SVG Vector",group:"Vector Formats"},{value:"eps",label:"EPS Vector",group:"Vector Formats"},{value:"geojson",label:"GeoJSON",group:"GIS Formats"},{value:"kml",label:"KML",group:"GIS Formats"},{value:"geopdf",label:"GeoPDF",group:"GIS Formats"}],w=[{value:96,label:"Standard (96 DPI)"},{value:150,label:"Medium (150 DPI)"},{value:300,label:"High (300 DPI)"},{value:450,label:"Very High (450 DPI)"},{value:600,label:"Ultra High (600 DPI)"}],j=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"legal",label:'Legal (8.5" × 14")'},{value:"tabloid",label:'Tabloid (11" × 17")'},{value:"a4",label:"A4 (210mm × 297mm)"},{value:"a3",label:"A3 (297mm × 420mm)"},{value:"a2",label:"A2 (420mm × 594mm)"},{value:"a1",label:"A1 (594mm × 841mm)"},{value:"a0",label:"A0 (841mm × 1189mm)"},{value:"custom",label:"Custom Size"}],F=o.reduce((s,x)=>(s[x.group]||(s[x.group]=[]),s[x.group].push(x),s),{});return l?e.jsx(m,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(v,{container:!0,spacing:3,children:[e.jsx(v,{size:12,children:e.jsx(u,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Map Information"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(P,{fullWidth:!0,label:"Map Title",value:r.title,onChange:a("title"),disabled:n,placeholder:"My Fire Department Map",helperText:"Title that will appear on the exported map"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(P,{fullWidth:!0,label:"Subtitle (optional)",value:r.subtitle,onChange:a("subtitle"),disabled:n,placeholder:"Created by Fire Prevention Division",helperText:"Optional subtitle for additional context"})}),e.jsxs(v,{size:12,children:[e.jsx(K,{variant:"contained",color:"primary",onClick:y,disabled:n||!r.title&&!r.subtitle,sx:{mt:1},children:"Apply Title/Subtitle to Layout"}),e.jsx(u,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Click to add your title and subtitle to the Layout Designer"})]}),e.jsxs(v,{size:12,children:[e.jsx(u,{variant:"subtitle2",gutterBottom:!0,children:"Department Logo"}),e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsxs(K,{variant:"outlined",component:"label",startIcon:e.jsx(tl,{}),disabled:n,children:["Choose Logo",e.jsx("input",{type:"file",hidden:!0,accept:"image/*",onChange:f})]}),d&&e.jsx(Il,{src:d,variant:"rounded",sx:{width:60,height:60},children:e.jsx(pi,{})}),!d&&e.jsx(u,{variant:"body2",color:"text.secondary",children:"No logo selected"})]})]}),e.jsx(v,{size:12,children:e.jsx(oe,{sx:{my:1}})}),e.jsx(v,{size:12,children:e.jsx(u,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Export Settings"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Export Format"}),e.jsx(N,{value:r.format,label:"Export Format",onChange:a("format"),children:Object.entries(F).map(([s,x])=>[e.jsx(b,{disabled:!0,sx:{fontWeight:"bold",bgcolor:"action.hover"},children:s},s),...x.map(E=>e.jsx(b,{value:E.value,sx:{pl:3},children:E.label},E.value))])})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Resolution (DPI)"}),e.jsx(N,{value:String(r.dpi),label:"Resolution (DPI)",onChange:a("dpi"),children:w.map(s=>e.jsx(b,{value:s.value,children:s.label},s.value))})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Print Size"}),e.jsx(N,{value:r.paperSize,label:"Print Size",onChange:a("paperSize"),children:j.map(s=>e.jsx(b,{value:s.value,children:s.label},s.value))})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Orientation"}),e.jsxs(N,{value:r.orientation,label:"Orientation",onChange:a("orientation"),children:[e.jsx(b,{value:"portrait",children:"Portrait"}),e.jsx(b,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(v,{size:12,children:e.jsx(oe,{sx:{my:1}})}),e.jsxs(v,{size:12,children:[e.jsx(u,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Layout Elements"}),e.jsx(u,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"Select which elements to include in your exported map"})]}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:r.includeLegend,onChange:a("includeLegend"),disabled:n}),label:"Include Legend"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:r.includeScale,onChange:a("includeScale"),disabled:n}),label:"Include Scale Bar"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:r.includeNorth,onChange:a("includeNorth"),disabled:n}),label:"Include North Arrow"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:r.includeTitle,onChange:a("includeTitle"),disabled:n}),label:"Include Title Banner"})}),e.jsx(v,{size:12,children:e.jsx(ye,{severity:"info",sx:{mt:2},children:e.jsxs(u,{variant:"body2",children:[e.jsx("strong",{children:"Quick Start:"})," Enter a title, select your preferred format (PNG for images, PDF for documents), and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs."]})})})]})}):null},Cr=({isActive:l,configuration:t,disabled:n=!1})=>{const i=q(),r=Y(Re),c=t.advanced,d=o=>w=>{const j=w.target.type==="checkbox"?w.target.checked:w.target.value;i($e({[o]:j}))},h=o=>w=>{const j=parseFloat(w.target.value)||0;i($e({[o]:j}))},a=o=>{const w=c.selectedLayers,j=w.includes(o)?w.filter(F=>F!==o):[...w,o];i($e({selectedLayers:j}))},f=[{value:"srgb",label:"sRGB (Default)"},{value:"adobergb",label:"Adobe RGB"},{value:"cmyk-swop",label:"CMYK SWOP (U.S.)"},{value:"cmyk-fogra",label:"CMYK FOGRA39 (Europe)"},{value:"custom",label:"Custom Profile..."}],y=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"a4",label:"A4 (210mm × 297mm)"}];return l?e.jsx(m,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(v,{container:!0,spacing:3,children:[e.jsx(v,{size:{xs:12},children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Pe,{color:"primary"}),e.jsx(u,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Color Management"})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Color Mode"}),e.jsxs(N,{value:c.colorMode,label:"Color Mode",onChange:d("colorMode"),children:[e.jsx(b,{value:"rgb",children:"RGB (Screen)"}),e.jsx(b,{value:"cmyk",children:"CMYK (Print)"})]})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"ICC Color Profile"}),e.jsx(N,{value:c.colorProfile,label:"ICC Color Profile",onChange:d("colorProfile"),children:f.map(o=>e.jsx(b,{value:o.value,children:o.label},o.value))})]})}),e.jsx(v,{size:{xs:12},children:e.jsx(u,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Custom Print Size"})}),e.jsx(v,{size:{xs:12,md:4},children:e.jsx(P,{fullWidth:!0,label:"Width",type:"number",value:c.customWidth,onChange:h("customWidth"),disabled:n,inputProps:{min:1,max:100,step:.1}})}),e.jsx(v,{size:{xs:12,md:4},children:e.jsx(P,{fullWidth:!0,label:"Height",type:"number",value:c.customHeight,onChange:h("customHeight"),disabled:n,inputProps:{min:1,max:100,step:.1}})}),e.jsx(v,{size:{xs:12,md:4},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Units"}),e.jsxs(N,{value:c.printUnits,label:"Units",onChange:d("printUnits"),children:[e.jsx(b,{value:"in",children:"inches"}),e.jsx(b,{value:"cm",children:"centimeters"}),e.jsx(b,{value:"mm",children:"millimeters"})]})]})}),e.jsx(v,{size:{xs:12},children:e.jsx(oe,{sx:{my:2}})}),e.jsx(v,{size:{xs:12},children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(er,{color:"primary"}),e.jsx(u,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Professional Print Options"})]})}),e.jsx(v,{size:{xs:12},children:e.jsx($,{variant:"outlined",sx:{p:2},children:e.jsxs(v,{container:!0,spacing:2,children:[e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:c.addBleed,onChange:d("addBleed"),disabled:n}),label:"Add Bleed (0.125″)"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:c.showCropMarks,onChange:d("showCropMarks"),disabled:n}),label:"Show Crop Marks"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:c.includeColorBars,onChange:d("includeColorBars"),disabled:n}),label:"Include Color Calibration Bars"})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(V,{control:e.jsx(ee,{checked:c.addRegistrationMarks,onChange:d("addRegistrationMarks"),disabled:n}),label:"Add Registration Marks"})}),e.jsx(v,{size:{xs:12},children:e.jsx(V,{control:e.jsx(ee,{checked:c.embedICCProfile,onChange:d("embedICCProfile"),disabled:n}),label:"Embed ICC Profile"})})]})})}),e.jsx(v,{size:{xs:12},children:e.jsx(oe,{sx:{my:2}})}),e.jsx(v,{size:{xs:12},children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(nr,{color:"primary"}),e.jsx(u,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Large Format Printing"})]})}),e.jsx(v,{size:{xs:12},children:e.jsx(V,{control:e.jsx(ee,{checked:c.enableTiledPrinting,onChange:d("enableTiledPrinting"),disabled:n}),label:"Enable Tiled Printing"})}),c.enableTiledPrinting&&e.jsxs(e.Fragment,{children:[e.jsx(v,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:n,children:[e.jsx(U,{children:"Tile Size"}),e.jsx(N,{value:c.tileSize,label:"Tile Size",onChange:d("tileSize"),children:y.map(o=>e.jsx(b,{value:o.value,children:o.label},o.value))})]})}),e.jsx(v,{size:{xs:12,md:6},children:e.jsx(P,{fullWidth:!0,label:"Overlap",type:"number",value:c.tileOverlap,onChange:h("tileOverlap"),disabled:n,inputProps:{min:0,max:2,step:.25},InputProps:{endAdornment:e.jsx(xi,{position:"end",children:"inches"})}})})]}),e.jsx(v,{size:{xs:12},children:e.jsx(oe,{sx:{my:2}})}),e.jsx(v,{size:{xs:12},children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(ue,{color:"primary"}),e.jsx(u,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layer Controls"})]})}),e.jsx(v,{size:{xs:12},children:e.jsx(V,{control:e.jsx(ee,{checked:c.exportAllLayers,onChange:d("exportAllLayers"),disabled:n}),label:"Export All Visible Layers"})}),!c.exportAllLayers&&r.length>0&&e.jsxs(v,{size:{xs:12},children:[e.jsx(u,{variant:"subtitle2",gutterBottom:!0,children:"Select Layers to Export:"}),e.jsx($,{variant:"outlined",sx:{maxHeight:200,overflow:"auto"},children:e.jsx(si,{dense:!0,children:r.map(o=>e.jsxs(ci,{component:"button",disabled:n,children:[e.jsx(ke,{primary:o.name,secondary:`${o.features.length} features`}),e.jsx(pl,{children:e.jsx(Z,{checked:c.selectedLayers.includes(o.id),onChange:()=>a(o.id),disabled:n})})]},o.id))})})]}),e.jsx(v,{size:{xs:12},children:e.jsx(ye,{severity:"info",sx:{mt:2},children:e.jsxs(u,{variant:"body2",children:[e.jsx("strong",{children:"Professional Printing:"})," Use CMYK color mode and appropriate ICC profiles for commercial printing. Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages."]})})})]})}):null},Er=({configuration:l,disabled:t=!1})=>{const n=q(),i=Y(a=>a.fireMapPro.export.configuration.basic),r=[{type:"map",label:"Map Frame",icon:e.jsx(qe,{})},{type:"title",label:"Title",icon:e.jsx(lr,{})},{type:"subtitle",label:"Subtitle",icon:e.jsx(Nt,{})},{type:"legend",label:"Legend",icon:e.jsx(_l,{})},{type:"north-arrow",label:"North Arrow",icon:e.jsx(Zl,{})},{type:"scale-bar",label:"Scale Bar",icon:e.jsx(ir,{})},{type:"text",label:"Text Box",icon:e.jsx(Nt,{})},{type:"image",label:"Image",icon:e.jsx(pi,{})},{type:"shape",label:"Shape",icon:e.jsx(Ol,{})}],c=[{id:"standard",name:"Standard",description:"Basic layout with map and legend"},{id:"professional",name:"Professional",description:"Corporate layout with sidebar"},{id:"presentation",name:"Presentation",description:"Landscape format for slides"},{id:"tactical",name:"Tactical",description:"Emergency response layout"}],d=(a,f)=>{a.dataTransfer.setData("application/json",JSON.stringify({type:"layout-element",elementType:f})),a.dataTransfer.effectAllowed="copy"},h=a=>{t||(console.log("[LayoutToolbox] Template clicked:",a),console.log("[LayoutToolbox] Basic config:",i),n(Vi(a)))};return e.jsxs(m,{sx:{p:2},children:[e.jsx(u,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Elements"}),e.jsx(v,{container:!0,spacing:1,sx:{mb:3},children:r.map(a=>e.jsx(v,{size:{xs:6},children:e.jsxs($,{sx:{p:1,textAlign:"center",cursor:t?"default":"grab",border:1,borderColor:"divider",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:"action.hover",transform:"translateY(-2px)",boxShadow:1},"&:active":t?{}:{cursor:"grabbing",opacity:.7}},draggable:!t,onDragStart:f=>d(f,a.type),children:[e.jsx(m,{sx:{color:"primary.main",mb:.5},children:a.icon}),e.jsx(u,{variant:"caption",display:"block",children:a.label})]})},a.type))}),e.jsx(oe,{sx:{my:2}}),e.jsx(u,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Templates"}),e.jsx(m,{sx:{display:"flex",flexDirection:"column",gap:1},children:c.map(a=>e.jsxs($,{sx:{p:1.5,cursor:t?"default":"pointer",border:1,borderColor:l.layout.selectedTemplate===a.id?"primary.main":"divider",bgcolor:l.layout.selectedTemplate===a.id?"primary.50":"background.paper",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:l.layout.selectedTemplate===a.id?"primary.100":"action.hover",transform:"translateY(-1px)",boxShadow:1}},onClick:()=>h(a.id),children:[e.jsx(u,{variant:"subtitle2",sx:{fontWeight:600},children:a.name}),e.jsx(u,{variant:"caption",color:"text.secondary",children:a.description})]},a.id))}),e.jsx(m,{sx:{mt:3,p:1,bgcolor:"info.50",borderRadius:1},children:e.jsx(u,{variant:"caption",color:"info.main",children:"💡 Drag elements to the canvas or click a template to get started."})})]})},Fr=({width:l=800,height:t=600})=>{const n=q(),i=z.useRef(null),{layoutElements:r,selectedElementId:c,paperSize:d}=Y(C=>({layoutElements:C.fireMapPro.export.configuration.layout.elements,selectedElementId:C.fireMapPro.export.configuration.layout.selectedElementId,paperSize:C.fireMapPro.export.configuration.basic.paperSize})),h={letter:{width:8.5,height:11},legal:{width:8.5,height:14},tabloid:{width:11,height:17},a4:{width:8.27,height:11.69},a3:{width:11.69,height:16.54},custom:{width:8.5,height:11}},a=h[d]||h.letter,f=a.width/a.height,y=Math.min(t,l/f),o=y*f,w=(C,B)=>{B.stopPropagation(),n(Pt(C))},j=()=>{n(Pt(null))},F=(C,B,O)=>{const g=r.find(Q=>Q.id===C);if(!g)return;const M=Math.max(0,Math.min(100,g.x+B/o*100)),S=Math.max(0,Math.min(100,g.y+O/y*100));n(Se({id:C,updates:{x:M,y:S}}))},s=C=>{C.preventDefault(),C.dataTransfer.dropEffect="copy"},x=C=>{var B;C.preventDefault();try{const O=C.dataTransfer.getData("application/json");if(!O)return;const g=JSON.parse(O);if(g.type!=="layout-element")return;const M=(B=i.current)==null?void 0:B.getBoundingClientRect();if(!M)return;const S=(C.clientX-M.left)/M.width*100,Q=(C.clientY-M.top)/M.height*100,me={type:g.elementType,x:Math.max(0,Math.min(95,S-5)),y:Math.max(0,Math.min(95,Q-5)),width:20,height:15,zIndex:r.length+1,visible:!0,content:E(g.elementType)};n(Xe(me))}catch(O){console.error("Error handling drop:",O)}},E=C=>{switch(C){case"title":return{text:"Map Title",fontSize:18,textAlign:"center",color:"#333333",fontFamily:"Arial"};case"subtitle":return{text:"Map Subtitle",fontSize:14,textAlign:"center",color:"#666666",fontFamily:"Arial"};case"text":return{text:"Text Element",fontSize:12,textAlign:"left",color:"#333333",fontFamily:"Arial"};case"legend":return{text:"Legend",backgroundColor:"#ffffff",color:"#333333"};case"image":return{text:"Image Placeholder",backgroundColor:"#f5f5f5"};case"shape":return{backgroundColor:"transparent",borderColor:"#333333"};default:return{}}},R=C=>{switch(C){case"map":return"🗺️";case"title":return"📝";case"subtitle":return"📄";case"legend":return"📋";case"north-arrow":return"🧭";case"scale-bar":return"📏";case"text":return"💬";case"image":return"🖼️";case"shape":return"⬜";default:return"📦"}},G=C=>{switch(C){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(m,{sx:{display:"flex",flexDirection:"column",alignItems:"center",padding:2,height:"100%",backgroundColor:"#f5f5f5"},children:[e.jsxs($,{ref:i,onClick:j,onDragOver:s,onDrop:x,sx:{position:"relative",width:o,height:y,backgroundColor:"white",border:"2px solid #ddd",boxShadow:"0 4px 8px rgba(0,0,0,0.1)",overflow:"hidden",cursor:"default"},children:[e.jsxs(m,{sx:{position:"absolute",top:-25,left:0,fontSize:"12px",color:"#666",fontWeight:"bold"},children:[d.toUpperCase()," (",a.width,'" × ',a.height,'")']}),e.jsxs("svg",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.1},children:[e.jsx("defs",{children:e.jsx("pattern",{id:"grid",width:o/10,height:y/10,patternUnits:"userSpaceOnUse",children:e.jsx("path",{d:`M ${o/10} 0 L 0 0 0 ${y/10}`,fill:"none",stroke:"#666",strokeWidth:"1"})})}),e.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"})]}),r.map(C=>e.jsx(Br,{element:C,isSelected:C.id===c,canvasWidth:o,canvasHeight:y,onElementClick:w,onElementDrag:F,getElementIcon:R,getElementLabel:G},C.id)),r.length===0&&e.jsxs(m,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",color:"#999"},children:[e.jsx(m,{sx:{fontSize:"48px",marginBottom:1},children:"📄"}),e.jsx(m,{sx:{fontSize:"14px"},children:"Drag elements from the toolbox to create your layout"})]})]}),e.jsxs(m,{sx:{marginTop:1,fontSize:"12px",color:"#666",textAlign:"center"},children:["Canvas: ",Math.round(o),"×",Math.round(y),"px | Zoom: ",Math.round(o/400*100),"% | Elements: ",r.length]})]})},Br=({element:l,isSelected:t,canvasWidth:n,canvasHeight:i,onElementClick:r,onElementDrag:c,getElementIcon:d,getElementLabel:h})=>{var j,F,s,x,E,R,G,C;const a=z.useRef(null),f=z.useRef(!1),y=z.useRef({x:0,y:0}),o=B=>{B.preventDefault(),B.stopPropagation(),f.current=!0,y.current={x:B.clientX,y:B.clientY};const O=M=>{if(!f.current)return;const S=M.clientX-y.current.x,Q=M.clientY-y.current.y;c(l.id,S,Q),y.current={x:M.clientX,y:M.clientY}},g=()=>{f.current=!1,document.removeEventListener("mousemove",O),document.removeEventListener("mouseup",g)};document.addEventListener("mousemove",O),document.addEventListener("mouseup",g),r(l.id,B)};if(!l.visible)return null;const w={position:"absolute",left:`${l.x}%`,top:`${l.y}%`,width:`${l.width}%`,height:`${l.height}%`,zIndex:l.zIndex,border:t?"2px solid #1976d2":"1px solid #ddd",backgroundColor:l.type==="map"?"#e3f2fd":"rgba(255,255,255,0.9)",cursor:"move",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:"#666",userSelect:"none",boxSizing:"border-box"};return e.jsxs("div",{ref:a,style:w,onMouseDown:o,onClick:B=>r(l.id,B),children:[e.jsx(m,{sx:{textAlign:"center",overflow:"hidden",padding:.5},children:(l.type==="title"||l.type==="subtitle"||l.type==="text"||l.type==="legend")&&((j=l.content)!=null&&j.text)?e.jsx(m,{sx:{fontSize:`${Math.max(8,Math.min(16,(((F=l.content)==null?void 0:F.fontSize)||12)*.8))}px`,fontFamily:((s=l.content)==null?void 0:s.fontFamily)||"Arial",color:((x=l.content)==null?void 0:x.color)||"#333",textAlign:((E=l.content)==null?void 0:E.textAlign)||(l.type==="title"?"center":"left"),fontWeight:l.type==="title"?"bold":"normal",lineHeight:1.2,wordBreak:"break-word",overflow:"hidden",textOverflow:"ellipsis",backgroundColor:l.type==="legend"?((R=l.content)==null?void 0:R.backgroundColor)||"#ffffff":"transparent",border:l.type==="legend"?"1px solid #ddd":"none",borderRadius:l.type==="legend"?"2px":"0",padding:l.type==="legend"?"2px 4px":"0",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:((G=l.content)==null?void 0:G.textAlign)==="center"?"center":((C=l.content)==null?void 0:C.textAlign)==="right"?"flex-end":"flex-start"},children:l.content.text}):e.jsxs(e.Fragment,{children:[e.jsx(m,{sx:{fontSize:"16px",marginBottom:.5},children:d(l.type)}),e.jsx(m,{sx:{fontSize:"10px",lineHeight:1},children:h(l.type)})]})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",top:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"nw-resize"}}),e.jsx("div",{style:{position:"absolute",top:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"ne-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"sw-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"se-resize"}})]})]})},kr=()=>{var d,h,a,f,y,o,w,j,F;const l=q(),{selectedElement:t,elements:n}=Y(s=>{const x=s.fireMapPro.export.configuration.layout.selectedElementId,E=s.fireMapPro.export.configuration.layout.elements;return{selectedElement:x?E.find(R=>R.id===x):null,elements:E}});if(!t)return e.jsxs(m,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa"},children:[e.jsx(u,{variant:"h6",gutterBottom:!0,sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsxs(m,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",color:"#999",textAlign:"center"},children:[e.jsx(m,{sx:{fontSize:"32px",marginBottom:1},children:"🎛️"}),e.jsx(u,{variant:"body2",sx:{fontSize:"0.85rem"},children:"Select an element to edit its properties"})]})]});const i=(s,x)=>{l(Se({id:t.id,updates:{[s]:x}}))},r=()=>{l(Yi(t.id))},c=s=>{switch(s){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(m,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa",overflowY:"auto"},children:[e.jsxs(m,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1},children:[e.jsx(u,{variant:"h6",sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsx(K,{size:"small",color:"error",startIcon:e.jsx(Je,{}),onClick:r,sx:{minWidth:"auto",px:1},children:"Del"})]}),e.jsx(u,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:c(t.type)}),e.jsxs(le,{defaultExpanded:!0,sx:{mb:1},children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(u,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:"Position & Size"})}),e.jsxs(ne,{sx:{pt:1},children:[e.jsxs(m,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(P,{label:"X",type:"number",size:"small",value:Math.round(t.x*100)/100,onChange:s=>i("x",parseFloat(s.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(P,{label:"Y",type:"number",size:"small",value:Math.round(t.y*100)/100,onChange:s=>i("y",parseFloat(s.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(m,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(P,{label:"Width",type:"number",size:"small",value:Math.round(t.width*100)/100,onChange:s=>i("width",parseFloat(s.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(P,{label:"Height",type:"number",size:"small",value:Math.round(t.height*100)/100,onChange:s=>i("height",parseFloat(s.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(m,{sx:{marginBottom:1},children:[e.jsx(u,{gutterBottom:!0,children:"Layer Order"}),e.jsx(Me,{value:t.zIndex,onChange:(s,x)=>i("zIndex",x),min:1,max:n.length+5,step:1,marks:!0,valueLabelDisplay:"on"})]}),e.jsx(V,{control:e.jsx(Z,{checked:t.visible,onChange:s=>i("visible",s.target.checked)}),label:"Visible"})]})]}),(t.type==="title"||t.type==="subtitle"||t.type==="text"||t.type==="legend")&&e.jsxs(le,{sx:{mb:1},children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(u,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:t.type==="legend"?"Legend Content":"Text Content"})}),e.jsxs(ne,{sx:{pt:1},children:[e.jsx(P,{label:t.type==="legend"?"Legend Title":"Text",multiline:!0,rows:2,fullWidth:!0,size:"small",value:((d=t.content)==null?void 0:d.text)||"",onChange:s=>i("content",{...t.content,text:s.target.value}),sx:{marginBottom:1,"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsxs(m,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,marginBottom:1},children:[e.jsxs(H,{size:"small",children:[e.jsx(U,{sx:{fontSize:"0.85rem"},children:"Font"}),e.jsxs(N,{value:((h=t.content)==null?void 0:h.fontFamily)||"Arial",onChange:s=>i("content",{...t.content,fontFamily:s.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(b,{value:"Arial",sx:{fontSize:"0.85rem"},children:"Arial"}),e.jsx(b,{value:"Times New Roman",sx:{fontSize:"0.85rem"},children:"Times"}),e.jsx(b,{value:"Helvetica",sx:{fontSize:"0.85rem"},children:"Helvetica"}),e.jsx(b,{value:"Georgia",sx:{fontSize:"0.85rem"},children:"Georgia"})]})]}),e.jsx(P,{label:"Size",type:"number",size:"small",value:((a=t.content)==null?void 0:a.fontSize)||12,onChange:s=>i("content",{...t.content,fontSize:parseInt(s.target.value)||12}),inputProps:{min:6,max:72},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(m,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1},children:[e.jsxs(H,{size:"small",children:[e.jsx(U,{sx:{fontSize:"0.85rem"},children:"Align"}),e.jsxs(N,{value:((f=t.content)==null?void 0:f.textAlign)||"left",onChange:s=>i("content",{...t.content,textAlign:s.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(b,{value:"left",sx:{fontSize:"0.85rem"},children:"Left"}),e.jsx(b,{value:"center",sx:{fontSize:"0.85rem"},children:"Center"}),e.jsx(b,{value:"right",sx:{fontSize:"0.85rem"},children:"Right"})]})]}),e.jsx(P,{label:"Color",type:"color",size:"small",value:((y=t.content)==null?void 0:y.color)||"#000000",onChange:s=>i("content",{...t.content,color:s.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem",p:.5}}})]})]})]}),t.type==="map"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"Map Settings"})}),e.jsxs(ne,{children:[e.jsx(V,{control:e.jsx(Z,{checked:t.showBorder!==!1,onChange:s=>i("showBorder",s.target.checked)}),label:"Show Border",sx:{marginBottom:1}}),e.jsx(P,{label:"Border Width (px)",type:"number",size:"small",fullWidth:!0,value:t.borderWidth||1,onChange:s=>i("borderWidth",parseInt(s.target.value)||1),inputProps:{min:0,max:10},sx:{marginBottom:2}}),e.jsx(P,{label:"Border Color",type:"color",size:"small",fullWidth:!0,value:t.borderColor||"#000000",onChange:s=>i("borderColor",s.target.value)})]})]}),t.type==="legend"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"Legend Settings"})}),e.jsxs(ne,{children:[e.jsx(P,{label:"Title",fullWidth:!0,size:"small",value:t.legendTitle||"Legend",onChange:s=>i("legendTitle",s.target.value),sx:{marginBottom:2}}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{children:"Style"}),e.jsxs(N,{value:t.legendStyle||"standard",onChange:s=>i("legendStyle",s.target.value),children:[e.jsx(b,{value:"standard",children:"Standard"}),e.jsx(b,{value:"compact",children:"Compact"}),e.jsx(b,{value:"detailed",children:"Detailed"})]})]}),e.jsx(V,{control:e.jsx(Z,{checked:t.showLegendBorder!==!1,onChange:s=>i("showLegendBorder",s.target.checked)}),label:"Show Border"})]})]}),t.type==="north-arrow"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"North Arrow Settings"})}),e.jsxs(ne,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{children:"Style"}),e.jsxs(N,{value:t.arrowStyle||"classic",onChange:s=>i("arrowStyle",s.target.value),children:[e.jsx(b,{value:"classic",children:"Classic"}),e.jsx(b,{value:"modern",children:"Modern"}),e.jsx(b,{value:"simple",children:"Simple"}),e.jsx(b,{value:"compass",children:"Compass"})]})]}),e.jsx(P,{label:"Rotation (degrees)",type:"number",size:"small",fullWidth:!0,value:t.rotation||0,onChange:s=>i("rotation",parseInt(s.target.value)||0),inputProps:{min:0,max:360}})]})]}),t.type==="scale-bar"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"Scale Bar Settings"})}),e.jsxs(ne,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{children:"Units"}),e.jsxs(N,{value:t.units||"feet",onChange:s=>i("units",s.target.value),children:[e.jsx(b,{value:"feet",children:"Feet"}),e.jsx(b,{value:"meters",children:"Meters"}),e.jsx(b,{value:"miles",children:"Miles"}),e.jsx(b,{value:"kilometers",children:"Kilometers"})]})]}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{children:"Style"}),e.jsxs(N,{value:t.scaleStyle||"bar",onChange:s=>i("scaleStyle",s.target.value),children:[e.jsx(b,{value:"bar",children:"Bar"}),e.jsx(b,{value:"line",children:"Line"}),e.jsx(b,{value:"alternating",children:"Alternating"})]})]}),e.jsx(P,{label:"Number of Divisions",type:"number",size:"small",fullWidth:!0,value:t.divisions||4,onChange:s=>i("divisions",parseInt(s.target.value)||4),inputProps:{min:2,max:10}})]})]}),t.type==="image"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"Image Settings"})}),e.jsxs(ne,{children:[e.jsxs(m,{sx:{marginBottom:2},children:[e.jsx(u,{variant:"body2",sx:{mb:1,fontSize:"0.85rem",color:"#666"},children:"Upload Image File"}),e.jsx("input",{type:"file",accept:"image/*",onChange:s=>{var E;const x=(E=s.target.files)==null?void 0:E[0];x&&i("content",{...t.content,imageSrc:x})},style:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.85rem"}}),((o=t.content)==null?void 0:o.imageSrc)&&t.content.imageSrc instanceof File&&e.jsxs(u,{variant:"caption",sx:{mt:.5,display:"block",color:"#666"},children:["Selected: ",t.content.imageSrc.name]})]}),e.jsx(oe,{sx:{my:2}}),e.jsx(P,{label:"Image URL (alternative to file upload)",fullWidth:!0,size:"small",value:typeof((w=t.content)==null?void 0:w.imageSrc)=="string"?t.content.imageSrc:"",onChange:s=>i("content",{...t.content,imageSrc:s.target.value}),sx:{marginBottom:2,"& .MuiInputBase-input":{fontSize:"0.85rem"}},placeholder:"https://example.com/image.jpg"}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{sx:{fontSize:"0.85rem"},children:"Image Fit"}),e.jsxs(N,{value:((j=t.content)==null?void 0:j.imageFit)||"cover",onChange:s=>i("content",{...t.content,imageFit:s.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(b,{value:"cover",sx:{fontSize:"0.85rem"},children:"Cover"}),e.jsx(b,{value:"contain",sx:{fontSize:"0.85rem"},children:"Contain"}),e.jsx(b,{value:"fill",sx:{fontSize:"0.85rem"},children:"Fill"}),e.jsx(b,{value:"scale-down",sx:{fontSize:"0.85rem"},children:"Scale Down"})]})]}),e.jsx(P,{label:"Alt Text",fullWidth:!0,size:"small",value:((F=t.content)==null?void 0:F.altText)||"",onChange:s=>i("content",{...t.content,altText:s.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]})]}),t.type==="shape"&&e.jsxs(le,{children:[e.jsx(re,{expandIcon:e.jsx(ie,{}),children:e.jsx(u,{variant:"subtitle1",children:"Shape Settings"})}),e.jsxs(ne,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(U,{children:"Shape Type"}),e.jsxs(N,{value:t.shapeType||"rectangle",onChange:s=>i("shapeType",s.target.value),children:[e.jsx(b,{value:"rectangle",children:"Rectangle"}),e.jsx(b,{value:"circle",children:"Circle"}),e.jsx(b,{value:"ellipse",children:"Ellipse"}),e.jsx(b,{value:"triangle",children:"Triangle"}),e.jsx(b,{value:"line",children:"Line"})]})]}),e.jsxs(m,{sx:{display:"flex",gap:1,marginBottom:2},children:[e.jsx(P,{label:"Fill Color",type:"color",size:"small",value:t.fillColor||"#ffffff",onChange:s=>i("fillColor",s.target.value),sx:{flex:1}}),e.jsx(P,{label:"Stroke Color",type:"color",size:"small",value:t.strokeColor||"#000000",onChange:s=>i("strokeColor",s.target.value),sx:{flex:1}})]}),e.jsx(P,{label:"Stroke Width (px)",type:"number",size:"small",fullWidth:!0,value:t.strokeWidth||1,onChange:s=>i("strokeWidth",parseInt(s.target.value)||1),inputProps:{min:0,max:20}})]})]}),e.jsx(oe,{sx:{margin:"16px 0"}}),e.jsxs(m,{sx:{fontSize:"12px",color:"#666"},children:[e.jsxs(u,{variant:"caption",display:"block",children:["Element ID: ",t.id]}),e.jsxs(u,{variant:"caption",display:"block",children:["Type: ",t.type]}),e.jsxs(u,{variant:"caption",display:"block",children:["Position: ",Math.round(t.x),"%, ",Math.round(t.y),"%"]}),e.jsxs(u,{variant:"caption",display:"block",children:["Size: ",Math.round(t.width),"% × ",Math.round(t.height),"%"]})]})]})},Sr=({isActive:l,configuration:t,disabled:n=!1})=>{const i=q(),r=t.layout,c=d=>{const h=d.target.value;i(Qi({pageOrientation:h,canvasWidth:h==="landscape"?520:400,canvasHeight:h==="landscape"?400:520}))};return l?e.jsxs(m,{sx:{height:"60vh",display:"flex",flexDirection:"column"},children:[e.jsxs(m,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Vl,{color:"primary"}),e.jsx(u,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layout Designer"})]}),e.jsxs(v,{container:!0,spacing:2,alignItems:"center",children:[e.jsx(v,{size:{xs:12,md:4},children:e.jsxs(H,{fullWidth:!0,size:"small",disabled:n,children:[e.jsx(U,{children:"Page Orientation"}),e.jsxs(N,{value:r.pageOrientation,label:"Page Orientation",onChange:c,children:[e.jsx(b,{value:"portrait",children:"Portrait"}),e.jsx(b,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(v,{size:{xs:12,md:8},children:e.jsx(ye,{severity:"info",sx:{py:.5},children:e.jsx(u,{variant:"caption",children:"Drag elements from the toolbox to the canvas. Select templates for quick layouts."})})})]})]}),e.jsxs(m,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[e.jsx(m,{sx:{width:200,borderRight:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:2},children:e.jsx(Er,{configuration:t,disabled:n})}),e.jsx(m,{sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",bgcolor:"grey.100",p:2,overflow:"auto"},children:e.jsx(Fr,{})}),e.jsx(m,{sx:{width:280,borderLeft:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:1},children:e.jsx(kr,{})})]})]}):null},_e=({children:l,value:t,index:n,...i})=>e.jsx("div",{role:"tabpanel",hidden:t!==n,id:`export-tabpanel-${n}`,"aria-labelledby":`export-tab-${n}`,...i,children:t===n&&e.jsx(m,{sx:{p:0},children:l})}),Dr=()=>{const l=q(),t=ai(),n=fi(t.breakpoints.down("md")),i=Y(_i),r=Y(Ke),{open:c,activeTab:d,configuration:h,process:a}=i,f={basic:0,advanced:1,"layout-designer":2},y={0:"basic",1:"advanced",2:"layout-designer"},o=f[d],w=()=>{a.isExporting||l(Wt())},j=(s,x)=>{a.isExporting||l(Xi(y[x]))},F=async()=>{try{l(je({isExporting:!0,progress:0,currentStep:"Preparing export...",error:null}));const s=document.querySelector(".leaflet-container");if(!s)throw new Error("Map element not found");const x={...h,layout:{...h.layout,elements:i.configuration.layout.elements,selectedElementId:i.configuration.layout.selectedElementId,customLayout:i.configuration.layout.customLayout},mapView:{center:r.view.center,zoom:r.view.zoom}};await br.exportMap(s,x,(E,R)=>{l(je({isExporting:!0,progress:E,currentStep:R,error:null}))}),l(je({isExporting:!1,progress:100,currentStep:"Export completed",success:!0})),setTimeout(()=>{l(Wt())},1500)}catch(s){l(je({isExporting:!1,error:s instanceof Error?s.message:"Export failed",success:!1}))}};return e.jsxs(Ae,{open:c,onClose:w,maxWidth:"lg",fullWidth:!0,fullScreen:n,PaperProps:{sx:{minHeight:"80vh",maxHeight:"90vh",bgcolor:"background.default"}},children:[e.jsxs(ze,{sx:{bgcolor:"primary.main",color:"primary.contrastText",p:2,pb:0},children:[e.jsxs(m,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(pe,{}),e.jsx(u,{variant:"h6",component:"div",children:"Export Options"})]}),e.jsx(J,{edge:"end",color:"inherit",onClick:w,disabled:a.isExporting,"aria-label":"close",children:e.jsx(il,{})})]}),e.jsxs(et,{value:o,onChange:j,textColor:"inherit",indicatorColor:"secondary",variant:"fullWidth",sx:{"& .MuiTab-root":{color:"rgba(255, 255, 255, 0.7)","&.Mui-selected":{color:"white",fontWeight:600},"&:hover":{color:"white",backgroundColor:"rgba(255, 255, 255, 0.1)"}},"& .MuiTabs-indicator":{backgroundColor:"secondary.main"}},children:[e.jsx(ge,{label:"Basic",id:"export-tab-0","aria-controls":"export-tabpanel-0",disabled:a.isExporting}),e.jsx(ge,{label:"Advanced",id:"export-tab-1","aria-controls":"export-tabpanel-1",disabled:a.isExporting}),e.jsx(ge,{label:"Layout Designer",id:"export-tab-2","aria-controls":"export-tabpanel-2",disabled:a.isExporting})]})]}),e.jsxs(Te,{sx:{p:0,overflow:"hidden"},children:[e.jsx(_e,{value:o,index:0,children:e.jsx(jr,{isActive:d==="basic",configuration:h,disabled:a.isExporting})}),e.jsx(_e,{value:o,index:1,children:e.jsx(Cr,{isActive:d==="advanced",configuration:h,disabled:a.isExporting})}),e.jsx(_e,{value:o,index:2,children:e.jsx(Sr,{isActive:d==="layout-designer",configuration:h,disabled:a.isExporting})})]}),e.jsxs(Ie,{sx:{p:2,borderTop:1,borderColor:"divider"},children:[e.jsx(K,{onClick:w,disabled:a.isExporting,color:"inherit",children:"Cancel"}),e.jsx(K,{onClick:F,disabled:a.isExporting,variant:"contained",startIcon:a.isExporting?null:e.jsx(pe,{}),sx:{minWidth:120},children:a.isExporting?`${a.progress}%`:"Export Map"})]}),a.isExporting&&e.jsx(m,{sx:{position:"absolute",bottom:80,left:16,right:16,bgcolor:"info.main",color:"info.contrastText",p:1,borderRadius:1,display:"flex",alignItems:"center",gap:1},children:e.jsx(u,{variant:"body2",children:a.currentStep})})]})},Mr=()=>{const l=z.useRef(null),t=z.useRef(null),n=z.useRef(Math.random().toString(36)),i=z.useRef(0),[r,c]=z.useState([]),d=h=>{console.log(`[SimpleMapTest] ${h}`),c(a=>[...a,`${new Date().toISOString()}: ${h}`])};return z.useEffect(()=>{if(i.current++,d(`Component render #${i.current}`),!l.current){d("❌ No map container div");return}if(t.current){d(`⚠️ Map already exists (ID: ${n.current})`);return}n.current=Math.random().toString(36),d(`🗺️ Creating map with ID: ${n.current}`);try{const h=Ot.map(l.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0});Ot.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(h);const a=f=>{d(`✅ Click event works at ${f.latlng.lat.toFixed(4)}, ${f.latlng.lng.toFixed(4)}`)};return h.on("click",a),setTimeout(()=>{try{const f=h.getCenter(),y=h.latLngToContainerPoint(f),o=h.containerPointToLatLng(y);d(`✅ Coordinate conversion works: ${o.lat.toFixed(4)}, ${o.lng.toFixed(4)}`)}catch(f){d(`❌ Coordinate conversion failed: ${f instanceof Error?f.message:String(f)}`)}},1e3),t.current=h,d(`✅ Map created successfully (ID: ${n.current})`),()=>{d(`🧹 Cleanup called for map ID: ${n.current}`),t.current&&(t.current.remove(),t.current=null,d(`✅ Map cleaned up (ID: ${n.current})`))}}catch(h){d(`❌ Map creation failed: ${h instanceof Error?h.message:String(h)}`)}},[]),e.jsxs("div",{style:{width:"100vw",height:"100vh",position:"fixed",top:0,left:0,zIndex:9999,background:"white"},children:[e.jsxs("div",{style:{position:"absolute",top:10,left:10,zIndex:1e4,background:"white",padding:"10px",maxHeight:"300px",overflow:"auto",border:"1px solid #ccc"},children:[e.jsx("h3",{children:"Simple Map Test Results"}),e.jsx("div",{style:{fontSize:"12px",fontFamily:"monospace"},children:r.map((h,a)=>e.jsx("div",{children:h},a))}),e.jsx("button",{onClick:()=>window.location.reload(),children:"Reload Test"})]}),e.jsx("div",{ref:l,style:{width:"100%",height:"100%"}})]})},Fe=320,Vr=({initialMapState:l,mode:t="create",onSave:n,onExport:i})=>{const r=q(),c=ai(),d=fi(c.breakpoints.down("md"));z.useEffect(()=>{document.title="FireEMS Fire Map Pro"},[]);const h=Y(Ke),a=Y(oi),f=Y(qi),y=Y(Zi),o=z.useRef(null),[w,j]=li.useState(!1);z.useEffect(()=>{if(l)console.log("Loading initial map state:",l),r(Gt({...h,...l}));else{console.log("Loading default fire/EMS data:",Xt);const C={view:{center:{latitude:39.8283,longitude:-98.5795},zoom:6},layers:Xt,baseMaps:h.baseMaps,activeBaseMap:h.activeBaseMap,selectedFeatures:[],drawingMode:null,drawingOptions:h.drawingOptions,exportConfig:h.exportConfig,measurementUnits:h.measurementUnits,showCoordinates:h.showCoordinates,showGrid:h.showGrid};r(Gt(C))}},[]),z.useEffect(()=>{const C=()=>{try{const O=sessionStorage.getItem("fireEmsExportedData");if(O){const g=JSON.parse(O);if(console.log("Found exported data for Fire Map Pro:",g),g.toolId==="fire-map-pro"&&g.data&&g.data.length>0)if(console.log("🔧 FIRE MAP PRO - Processing exported data:",{toolId:g.toolId,dataLength:g.data.length,sampleDataItem:g.data[0]}),g.data[0]&&typeof g.data[0]=="object"&&g.data[0].hasOwnProperty("type")&&g.data[0].hasOwnProperty("coordinates")){console.log("✅ FIRE MAP PRO - Data is already transformed features, using directly");const S=g.data,Q={id:"imported-incidents",name:`Imported Incidents (${S.length})`,visible:!0,opacity:1,zIndex:1e3,type:"feature",features:S,style:{defaultStyle:{color:"#dc2626",fillColor:"#dc2626",fillOpacity:.7,weight:2,opacity:1}},metadata:{description:`Incident data imported from Data Formatter - ${S.length} incidents`,source:"Data Formatter",created:new Date,featureCount:S.length}};console.log("Importing pre-transformed incident data to Fire Map Pro:",{layerName:Q.name,featureCount:S.length}),r(Ut({layer:Q,features:S})),sessionStorage.removeItem("fireEmsExportedData")}else{console.log("🔧 FIRE MAP PRO - Data is raw incident data, transforming...");const S=ll.transformToFireMapPro(g.data);if(S.success&&S.data){if(console.log("Importing incident data to Fire Map Pro:",{layerName:S.data.layer.name,featureCount:S.data.features.length,errors:S.errors,warnings:S.warnings}),r(Ut(S.data)),S.errors.length>0||S.warnings.length>0){const Q=[`Successfully imported ${S.metadata.successfulRecords} of ${S.metadata.totalRecords} incidents.`,S.errors.length>0?`${S.errors.length} errors encountered.`:"",S.warnings.length>0?`${S.warnings.length} warnings.`:""].filter(Boolean).join(" ");r(Ce(Q))}sessionStorage.removeItem("fireEmsExportedData")}else console.error("Failed to transform incident data:",S.errors),r(Ce(`Failed to import incident data: ${S.errors.join(", ")}`))}}}catch(O){console.error("Error checking for imported data:",O),r(Ce("Error importing data from Data Formatter"))}};C();const B=setTimeout(C,1e3);return()=>clearTimeout(B)},[r]),z.useEffect(()=>{const C=B=>{if(!(B.target instanceof HTMLInputElement||B.target instanceof HTMLTextAreaElement)){if(B.ctrlKey||B.metaKey)switch(B.key){case"z":B.preventDefault(),B.shiftKey?y&&r(Ve()):f&&r(Ht());break;case"y":B.preventDefault(),y&&r(Ve());break;case"s":B.preventDefault(),F();break;case"e":B.preventDefault(),s();break}B.key==="Escape"&&h.drawingMode}};return document.addEventListener("keydown",C),()=>document.removeEventListener("keydown",C)},[f,y,h.drawingMode,r]);const F=()=>{n?n(h):(localStorage.setItem("fireMapPro_autosave",JSON.stringify(h)),console.log("Map saved to local storage"))},s=()=>{i?i(h.exportConfig):r(ni())},x=()=>{r(Ki())},E=()=>{var C;r(Ji()),a.fullscreen?document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen():(C=o.current)!=null&&C.requestFullscreen&&o.current.requestFullscreen()},R=()=>{r(Ce(null))},G={marginLeft:!d&&a.sidebarOpen?`${Fe}px`:0,width:!d&&a.sidebarOpen?`calc(100% - ${Fe}px)`:"100%",height:a.fullscreen?"100vh":"calc(100vh - 64px)",transition:c.transitions.create(["margin","width"],{easing:c.transitions.easing.sharp,duration:c.transitions.duration.leavingScreen})};return w?e.jsxs("div",{children:[e.jsx("button",{onClick:()=>j(!1),style:{position:"fixed",top:10,right:10,zIndex:10001,padding:"10px",background:"red",color:"white"},children:"Exit Test Mode"}),e.jsx(Mr,{})]}):e.jsx(rl,{children:e.jsxs(m,{ref:o,sx:{display:"flex",height:"100vh",overflow:"hidden",bgcolor:"background.default",position:a.fullscreen?"fixed":"relative",top:a.fullscreen?0:"auto",left:a.fullscreen?0:"auto",right:a.fullscreen?0:"auto",bottom:a.fullscreen?0:"auto",zIndex:a.fullscreen?1300:"auto"},role:"main","aria-label":"Fire Map Pro Application",children:[!a.fullscreen&&e.jsx(nl,{position:"fixed",sx:{zIndex:c.zIndex.drawer+1,bgcolor:"primary.main"},children:e.jsxs(gl,{children:[e.jsx(J,{color:"inherit","aria-label":"toggle sidebar",onClick:x,edge:"start",sx:{mr:2},children:e.jsx(ol,{})}),e.jsxs(u,{variant:"h6",noWrap:!0,component:"div",sx:{flexGrow:1},children:["Fire Map Pro ",t==="edit"?"- Editing":t==="view"?"- View Only":""]}),e.jsxs(m,{sx:{display:"flex",gap:1},children:[e.jsx(J,{color:"inherit",onClick:()=>r(Ht()),disabled:!f,title:"Undo (Ctrl+Z)",children:e.jsx(rr,{})}),e.jsx(J,{color:"inherit",onClick:()=>r(Ve()),disabled:!y,title:"Redo (Ctrl+Y)",children:e.jsx(tr,{})}),e.jsx(J,{color:"inherit",onClick:()=>j(!0),title:"Debug Test Mode",sx:{color:"orange"},children:e.jsx(Ul,{})}),t!=="view"&&e.jsx(J,{color:"inherit",onClick:F,title:"Save (Ctrl+S)",children:e.jsx(dl,{})}),e.jsx(J,{color:"inherit",onClick:s,title:"Export (Ctrl+E)",children:e.jsx(pe,{})}),e.jsx(J,{color:"inherit",onClick:E,title:"Toggle Fullscreen",children:a.fullscreen?e.jsx(Fl,{}):e.jsx(Bl,{})})]})]})}),e.jsx(al,{variant:d?"temporary":"persistent",anchor:"left",open:a.sidebarOpen,onClose:x,sx:{width:Fe,flexShrink:0,"& .MuiDrawer-paper":{width:Fe,boxSizing:"border-box",marginTop:a.fullscreen?0:"64px",height:a.fullscreen?"100vh":"calc(100vh - 64px)",borderRight:`1px solid ${c.palette.divider}`}},ModalProps:{keepMounted:!0,disablePortal:!1,hideBackdrop:!d,disableAutoFocus:!0,disableEnforceFocus:!0,disableRestoreFocus:!0},PaperProps:{"aria-hidden":!1,role:"complementary","aria-label":"Fire Map Pro Tools"},children:e.jsx(wr,{mode:t})}),e.jsxs(m,{component:"main",sx:{flexGrow:1,position:"relative",...G},children:[e.jsx($,{elevation:0,sx:{height:"100%",width:"100%",borderRadius:0,overflow:"hidden",position:"relative",minHeight:"500px",display:"flex",flexDirection:"column","& .leaflet-container":{background:"transparent !important",outline:"none"},"& .leaflet-tile-pane":{opacity:"1 !important",visibility:"visible !important"},"& .leaflet-tile":{opacity:"1 !important",visibility:"visible !important",display:"block !important",imageRendering:"auto",transform:"translateZ(0)",backfaceVisibility:"hidden"},"& .leaflet-layer":{opacity:"1 !important",visibility:"visible !important"}},children:e.jsx(sl,{})}),a.isLoading&&e.jsx(m,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,bgcolor:"rgba(255, 255, 255, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:e.jsx(u,{variant:"h6",children:"Loading..."})})]}),a.showWelcome&&e.jsx(vr,{}),e.jsx(Dr,{}),e.jsx(ul,{open:!!a.error,autoHideDuration:6e3,onClose:R,anchorOrigin:{vertical:"bottom",horizontal:"center"},children:e.jsx(ye,{onClose:R,severity:"error",sx:{width:"100%"},children:a.error})})]})})};export{Vr as default};
