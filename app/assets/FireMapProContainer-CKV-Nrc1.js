import{j as e,g as ii,a as li,r as B,u as ri,s as lt,c as oi,b as ni,m as ai,a9 as Gi,d as si,h as we,e as Ui,l as O,aa as se,B as C,k as Z,ab as $e,ac as Ct,ad as Ni,ae as xe,af as Pe,ag as ci,ah as rt,R as jt,ai as ve,aj as Oi,ak as Hi,al as $i,am as Vi,an as Nt,ao as di,ap as hi,aq as Yi,ar as xi,as as Qi,at as _i,_ as Ot,au as Ht,av as wt,aw as Ze,ax as pt,ay as Xi,az as $t,aA as Zi,aB as qi,aC as Ki,aD as Vt,aE as Ji,aF as Ve,aG as el,aH as tl,aI as Yt,aJ as Qt,aK as ft,aL as _t,aM as il,aN as ll}from"./index-CKoWj7hq.js";import{E as rl,D as qe,T as _e,U as ol,a as Xt,C as nl,b as al}from"./dataTransformer-DmptQ0oe.js";import{L as G,l as gi,u as pi,F as sl,a as cl}from"./leaflet-BxRVlnE9.js";import{P as dl,C as hl,S as Ke,E as ke,A as xl,a as gl,M as pl,D as fl}from"./A11yProvider-CjiWYF0p.js";import{c as U,P as Q,T as b,u as fi}from"./Typography-uTeN5rPM.js";import{b as ul,C as Fe,L as ui,q as yi,r as Ye,s as Xe,k as le,t as yl,M as F,f as Je,g as et,h as tt,T as N,F as H,I as $,e as V,j as it,G as E,i as _,l as mi,m as Et,n as Re,A as Ge,p as wi,D as ge,v as ml,R as wl,w as vl}from"./Settings-QgWeglKc.js";import{c as bl,B as te}from"./Button-CPwSjRTz.js";import{A as Cl,D as Ft,S as J,a as jl}from"./Delete-nc689hCl.js";import{E as ae,c as El,S as Fl,F as kl,I as Dl,d as Bl,C as re,A as ce,a as de,b as he}from"./jspdf.es.min-Cnk5LS6h.js";import{M as vt}from"./Map-C_zkqKfl.js";import{T as Sl}from"./Timeline-CEY_wcTJ.js";import{S as Ml}from"./Security-DNpcrLwU.js";import{L as Ll}from"./LocalFireDepartment-DRA6AM7L.js";const Tl=U(e.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}));function Al(i){return ii("MuiAvatar",i)}li("MuiAvatar",["root","colorDefault","circular","rounded","square","img","fallback"]);const zl=i=>{const{classes:t,variant:l,colorDefault:o}=i;return ni({root:["root",l,o&&"colorDefault"],img:["img"],fallback:["fallback"]},Al,t)},Il=lt("div",{name:"MuiAvatar",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:l}=i;return[t.root,t[l.variant],l.colorDefault&&t.colorDefault]}})(ai(({theme:i})=>({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:40,height:40,fontFamily:i.typography.fontFamily,fontSize:i.typography.pxToRem(20),lineHeight:1,borderRadius:"50%",overflow:"hidden",userSelect:"none",variants:[{props:{variant:"rounded"},style:{borderRadius:(i.vars||i).shape.borderRadius}},{props:{variant:"square"},style:{borderRadius:0}},{props:{colorDefault:!0},style:{color:(i.vars||i).palette.background.default,...i.vars?{backgroundColor:i.vars.palette.Avatar.defaultBg}:{backgroundColor:i.palette.grey[400],...i.applyStyles("dark",{backgroundColor:i.palette.grey[600]})}}}]}))),Pl=lt("img",{name:"MuiAvatar",slot:"Img",overridesResolver:(i,t)=>t.img})({width:"100%",height:"100%",textAlign:"center",objectFit:"cover",color:"transparent",textIndent:1e4}),Rl=lt(Tl,{name:"MuiAvatar",slot:"Fallback",overridesResolver:(i,t)=>t.fallback})({width:"75%",height:"75%"});function Wl({crossOrigin:i,referrerPolicy:t,src:l,srcSet:o}){const[n,d]=B.useState(!1);return B.useEffect(()=>{if(!l&&!o)return;d(!1);let h=!0;const s=new Image;return s.onload=()=>{h&&d("loaded")},s.onerror=()=>{h&&d("error")},s.crossOrigin=i,s.referrerPolicy=t,s.src=l,o&&(s.srcset=o),()=>{h=!1}},[i,t,l,o]),n}const Gl=B.forwardRef(function(t,l){const o=ri({props:t,name:"MuiAvatar"}),{alt:n,children:d,className:h,component:s="div",slots:a={},slotProps:g={},imgProps:p,sizes:r,src:f,srcSet:x,variant:m="circular",...c}=o;let u=null;const y={...o,component:s,variant:m},k=Wl({...p,...typeof g.img=="function"?g.img(y):g.img,src:f,srcSet:x}),M=f||x,j=M&&k!=="error";y.colorDefault=!j,delete y.ownerState;const D=zl(y),[T,w]=ul("img",{className:D.img,elementType:Pl,externalForwardedProps:{slots:a,slotProps:{img:{...p,...g.img}}},additionalProps:{alt:n,src:f,srcSet:x,sizes:r},ownerState:y});return j?u=e.jsx(T,{...w}):d||d===0?u=d:M&&n?u=n[0]:u=e.jsx(Rl,{ownerState:y,className:D.fallback}),e.jsx(Il,{as:s,className:oi(D.root,h),ref:l,...c,ownerState:y,children:u})});function Ul(i){return ii("MuiToggleButton",i)}const ut=li("MuiToggleButton",["root","disabled","selected","standard","primary","secondary","sizeSmall","sizeMedium","sizeLarge","fullWidth"]),Nl=B.createContext({}),Ol=B.createContext(void 0);function Hl(i,t){return t===void 0||i===void 0?!1:Array.isArray(t)?t.includes(i):i===t}const $l=i=>{const{classes:t,fullWidth:l,selected:o,disabled:n,size:d,color:h}=i,s={root:["root",o&&"selected",n&&"disabled",l&&"fullWidth",`size${si(d)}`,h]};return ni(s,Ul,t)},Vl=lt(bl,{name:"MuiToggleButton",slot:"Root",overridesResolver:(i,t)=>{const{ownerState:l}=i;return[t.root,t[`size${si(l.size)}`]]}})(ai(({theme:i})=>({...i.typography.button,borderRadius:(i.vars||i).shape.borderRadius,padding:11,border:`1px solid ${(i.vars||i).palette.divider}`,color:(i.vars||i).palette.action.active,[`&.${ut.disabled}`]:{color:(i.vars||i).palette.action.disabled,border:`1px solid ${(i.vars||i).palette.action.disabledBackground}`},"&:hover":{textDecoration:"none",backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.hoverOpacity})`:we(i.palette.text.primary,i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[{props:{color:"standard"},style:{[`&.${ut.selected}`]:{color:(i.vars||i).palette.text.primary,backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:we(i.palette.text.primary,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:we(i.palette.text.primary,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette.text.primaryChannel} / ${i.vars.palette.action.selectedOpacity})`:we(i.palette.text.primary,i.palette.action.selectedOpacity)}}}}},...Object.entries(i.palette).filter(Ui()).map(([t])=>({props:{color:t},style:{[`&.${ut.selected}`]:{color:(i.vars||i).palette[t].main,backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:we(i.palette[t].main,i.palette.action.selectedOpacity),"&:hover":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / calc(${i.vars.palette.action.selectedOpacity} + ${i.vars.palette.action.hoverOpacity}))`:we(i.palette[t].main,i.palette.action.selectedOpacity+i.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:i.vars?`rgba(${i.vars.palette[t].mainChannel} / ${i.vars.palette.action.selectedOpacity})`:we(i.palette[t].main,i.palette.action.selectedOpacity)}}}}})),{props:{fullWidth:!0},style:{width:"100%"}},{props:{size:"small"},style:{padding:7,fontSize:i.typography.pxToRem(13)}},{props:{size:"large"},style:{padding:15,fontSize:i.typography.pxToRem(15)}}]}))),yt=B.forwardRef(function(t,l){const{value:o,...n}=B.useContext(Nl),d=B.useContext(Ol),h=Gi({...n,selected:Hl(t.value,o)},t),s=ri({props:h,name:"MuiToggleButton"}),{children:a,className:g,color:p="standard",disabled:r=!1,disableFocusRipple:f=!1,fullWidth:x=!1,onChange:m,onClick:c,selected:u,size:y="medium",value:k,...M}=s,j={...s,color:p,disabled:r,disableFocusRipple:f,fullWidth:x,size:y},D=$l(j),T=L=>{c&&(c(L,k),L.defaultPrevented)||m&&m(L,k)},w=d||"";return e.jsx(Vl,{className:oi(n.className,D.root,g,w),disabled:r,focusRipple:!f,ref:l,onClick:T,onChange:m,value:k,ownerState:j,"aria-pressed":u,...M,children:a})}),Yl=U(e.jsx("path",{d:"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"})),Ql=U(e.jsx("path",{d:"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"})),_l=U(e.jsx("path",{d:"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z"})),Xl=U(e.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"})),Zl=U(e.jsx("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"})),ql=U(e.jsx("path",{d:"M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),Kl=U(e.jsx("path",{d:"M14.69 2.21 4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02"})),vi=U(e.jsx("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"})),We=U(e.jsx("path",{d:"m11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27z"})),Jl=U(e.jsx("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"})),er=U(e.jsx("path",{d:"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z"})),tr=U(e.jsx("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),ir=U(e.jsx("path",{d:"m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7z"})),ot=U(e.jsx("path",{d:"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9m5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9M5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5m6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5"})),lr=U(e.jsx("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"})),rr=U(e.jsx("path",{d:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"})),or=U(e.jsx("path",{d:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3m-3 11H8v-5h8zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-1-9H6v4h12z"})),nr=U(e.jsx("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z"})),ar=U(e.jsx("path",{d:"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),sr=U(e.jsx("path",{d:"M23 6H1v12h22zm-2 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),cr=U(e.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),dr=U(e.jsx("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8"})),hr=U(e.jsx("path",{d:"M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"})),xr=U(e.jsx("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"})),gr=U(e.jsx("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"})),Zt=[],qt=[],Kt=[],Jt=[],ei=[],ti=[{id:"fire-stations",name:"Fire Stations",visible:!1,opacity:1,zIndex:3,type:"feature",features:Zt,metadata:{description:"Add your fire stations using the drawing tools or data import",source:"User Data",created:new Date,featureCount:Zt.length}},{id:"hospitals",name:"Medical Facilities",visible:!1,opacity:1,zIndex:2,type:"feature",features:qt,metadata:{description:"Add hospitals and medical facilities to your map",source:"User Data",created:new Date,featureCount:qt.length}},{id:"hydrants",name:"Fire Hydrants",visible:!1,opacity:1,zIndex:1,type:"feature",features:Kt,metadata:{description:"Map fire hydrants with flow rates and inspection data",source:"User Data",created:new Date,featureCount:Kt.length}},{id:"recent-incidents",name:"Incidents",visible:!1,opacity:1,zIndex:4,type:"feature",features:Jt,metadata:{description:"Track emergency incidents and responses",source:"User Data",created:new Date,featureCount:Jt.length}},{id:"response-zones",name:"Response Zones",visible:!1,opacity:.6,zIndex:0,type:"feature",features:ei,metadata:{description:"Define coverage areas and response zones",source:"User Data",created:new Date,featureCount:ei.length}}],pr=()=>{const i=O(se),t={totalFeatures:0,totalMarkers:0,totalLines:0,totalPolygons:0};return i.forEach(l=>{l.visible&&(t.totalFeatures+=l.features.length,l.features.forEach(o=>{switch(o.type){case"marker":t.totalMarkers++;break;case"polyline":t.totalLines++;break;case"polygon":t.totalPolygons++;break}}))}),t.totalFeatures===0?null:e.jsxs(Q,{elevation:2,sx:{position:"absolute",top:16,left:16,zIndex:1e3,p:2,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)",minWidth:200},children:[e.jsxs(b,{variant:"subtitle2",sx:{mb:1,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ar,{fontSize:"small"}),"Features"]}),e.jsx(C,{sx:{display:"flex",flexDirection:"column",gap:1},children:e.jsxs(C,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(Fe,{size:"small",label:`${t.totalFeatures} total`,color:"primary",variant:"outlined"}),t.totalMarkers>0&&e.jsx(Fe,{size:"small",label:`${t.totalMarkers} markers`,variant:"outlined"}),t.totalLines>0&&e.jsx(Fe,{size:"small",label:`${t.totalLines} lines`,variant:"outlined"}),t.totalPolygons>0&&e.jsx(Fe,{size:"small",label:`${t.totalPolygons} polygons`,variant:"outlined"})]})})]})},fr=({map:i})=>{const t=Z(),l=O(se),o=B.useRef(new Map),n=s=>{try{const g=s.style.icon;if(!g)return G.icon({iconUrl:'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23666666"/%3E%3C/svg%3E',iconSize:[24,24],iconAnchor:[12,24],popupAnchor:[0,-24]});const p={small:[20,20],medium:[30,30],large:[40,40],"extra-large":[50,50]},r=p[g.size]||p.medium;return g.url?G.icon({iconUrl:g.url,iconSize:r,iconAnchor:g.anchor?g.anchor:[r[0]/2,r[1]],popupAnchor:g.popupAnchor?g.popupAnchor:[0,-r[1]]}):(console.warn(`[LayerManager] Icon missing URL for feature ${s.id}`),null)}catch(a){return console.warn(`[LayerManager] Error creating icon for feature ${s.id}:`,a),null}},d=s=>{let a='<div class="fire-map-popup">';return a+=`<h3>${s.title}</h3>`,a+=`<p>${s.description}</p>`,s.properties&&Object.keys(s.properties).length>0&&(a+='<div class="feature-properties">',Object.entries(s.properties).forEach(([g,p])=>{const r=g.replace(/([A-Z])/g," $1").replace(/^./,f=>f.toUpperCase());a+=`<div><strong>${r}:</strong> ${p}</div>`}),a+="</div>"),a+="</div>",a},h=s=>{try{const a=s.style;switch(s.type){case"marker":{const[g,p]=s.coordinates;if(isNaN(p)||isNaN(g))return console.warn(`[LayerManager] Invalid coordinates for feature ${s.id}: [${g}, ${p}]`),null;const r=n(s);if(!r)return console.warn(`[LayerManager] Failed to create icon for feature ${s.id}`),null;const f=G.marker([p,g],{icon:r});try{f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t($e(s.id))})}catch(x){console.warn(`[LayerManager] Error binding popup/tooltip for feature ${s.id}:`,x)}return f}case"polygon":{const g=s.coordinates[0].map(([r,f])=>[f,r]),p=G.polygon(g,{color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return p.bindPopup(d(s)),p.bindTooltip(s.title,{sticky:!0}),p.on("click",()=>{console.log("Feature clicked:",s.id),t($e(s.id))}),p}case"polyline":{const g=s.coordinates.map(([r,f])=>[f,r]),p=G.polyline(g,{color:a.color||"#3388ff",weight:a.weight||3,opacity:a.opacity||1});return p.bindPopup(d(s)),p.bindTooltip(s.title,{sticky:!0}),p.on("click",()=>{console.log("Feature clicked:",s.id),t($e(s.id))}),p}case"circle":{const[g,p,r]=s.coordinates,f=G.circle([p,g],{radius:r,color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t($e(s.id))}),f}default:return console.warn(`[LayerManager] Unknown feature type: ${s.type}`),null}}catch(a){return console.error(`[LayerManager] Error creating feature layer for ${s.id}:`,a),null}};return B.useEffect(()=>{if(!i||!i.getContainer()){console.warn("[LayerManager] Map or container not ready, skipping layer update");return}const s=()=>{try{const a=i.getContainer();if(!a||!a.parentNode||!document.body.contains(a)){console.warn("[LayerManager] Map container not properly attached to DOM, skipping update");return}const g=i.getPanes();if(!g||!g.markerPane||!i._size||!i._pixelOrigin){console.warn("[LayerManager] Map panes or coordinate system not ready, skipping update");return}console.log("[LayerManager] Updating layers with",l.length,"layers"),[...l].sort((r,f)=>r.zIndex-f.zIndex).forEach(r=>{const f=o.current.get(r.id);if(f)try{i.removeLayer(f),o.current.delete(r.id)}catch(x){console.warn(`[LayerManager] Error removing existing layer ${r.id}:`,x)}if(r.visible&&r.features.length>0)try{const x=i.getContainer();if(!x||!x.parentNode||!document.body.contains(x)){console.warn(`[LayerManager] Map container not ready for layer ${r.id}`);return}const m=i.getPanes();if(!m||!m.markerPane){console.warn(`[LayerManager] Map panes not ready for layer ${r.id}`);return}const c=G.layerGroup();let u=0;r.features.forEach(y=>{try{const k=h(y);k&&(c.addLayer(k),u++)}catch(k){console.warn(`[LayerManager] Error creating feature ${y.id}:`,k)}}),r.opacity!==void 0&&r.opacity!==1&&c.eachLayer(y=>{try{y instanceof G.Marker?y.setOpacity(r.opacity):y instanceof G.Path&&y.setStyle({opacity:r.opacity})}catch(k){console.warn("[LayerManager] Error setting opacity:",k)}}),u>0&&i.getContainer()&&(c.addTo(i),o.current.set(r.id,c),console.log(`[LayerManager] Added layer "${r.name}" with ${u}/${r.features.length} features`))}catch(x){console.error(`[LayerManager] Error creating layer ${r.id}:`,x)}})}catch(a){console.error("[LayerManager] Critical error during layer update:",a)}};i._loaded&&i.getPanes()&&i._size?s():i.whenReady(s)},[i,l,t]),B.useEffect(()=>()=>{i&&(o.current.forEach((s,a)=>{i.removeLayer(s),console.log(`[LayerManager] Cleaned up layer: ${a}`)}),o.current.clear())},[i]),null},ur=({map:i})=>{const t=Z(),l=O(Ct),o=O(se),n=B.useRef(null),d=B.useRef([]),h=o.find(r=>r.type==="feature"),s=B.useCallback((r,f)=>{i&&(console.log("[PureLeafletDrawTools] Adding event handler:",r),i.on(r,f),d.current.push({event:r,handler:f}))},[i]),a=B.useCallback(()=>{i&&(console.log("[PureLeafletDrawTools] Clearing all event handlers"),d.current.forEach(({event:r,handler:f})=>{i.off(r,f)}),d.current=[],i.dragging.enable(),i.doubleClickZoom.enable(),i.boxZoom.enable(),i.getContainer().style.cursor="")},[i]),g=()=>`feature_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,p=(r,f)=>{var m,c,u,y,k;let x=[];switch(f){case"marker":const j=r.getLatLng();x=[j.lng,j.lat];break;case"circle":const D=r,T=D.getLatLng(),w=D.getRadius();x=[T.lng,T.lat,w];break;case"polygon":x=[r.getLatLngs()[0].map(ie=>[ie.lng,ie.lat])];break;case"polyline":x=r.getLatLngs().map(ie=>[ie.lng,ie.lat]);break;case"rectangle":const ee=r.getBounds();x=[[ee.getSouthWest().lng,ee.getSouthWest().lat],[ee.getNorthEast().lng,ee.getNorthEast().lat]];break}return{id:g(),type:f,title:`${f.charAt(0).toUpperCase()+f.slice(1)} Feature`,description:`Drawing created at ${new Date().toLocaleTimeString()}`,coordinates:x,style:{color:(m=l.options.style)==null?void 0:m.color,fillColor:(c=l.options.style)==null?void 0:c.fillColor,fillOpacity:(u=l.options.style)==null?void 0:u.fillOpacity,weight:(y=l.options.style)==null?void 0:y.weight,opacity:(k=l.options.style)==null?void 0:k.opacity},properties:{created:new Date().toISOString(),drawingMode:f},layerId:"user-drawings",created:new Date,modified:new Date}};return B.useEffect(()=>{if(!i)return;console.log("[PureLeafletDrawTools] Initializing simple drawing");const r=new G.FeatureGroup;return i.addLayer(r),n.current=r,console.log("[PureLeafletDrawTools] Feature group created and added to map:",r),console.log("[PureLeafletDrawTools] Feature group attached to map:",i.hasLayer(r)),console.log("[PureLeafletDrawTools] Map has feature group in layers:",i.hasLayer(r)),()=>{i&&n.current&&(console.log("[PureLeafletDrawTools] Removing feature group from map"),i.removeLayer(n.current)),n.current=null}},[i,t]),B.useEffect(()=>{if(!(!i||!i.getContainer())){if(console.log("[PureLeafletDrawTools] Drawing mode changed to:",l.mode),a(),l.mode==="edit")console.log("[PureLeafletDrawTools] Activating edit mode"),i.getContainer().style.cursor="pointer",s("click",f=>{const x=f.originalEvent.target;x&&x.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Edit click on feature:",x),alert("Edit functionality - feature clicked! (Can be enhanced to show edit dialog)"))});else if(l.mode==="delete")console.log("[PureLeafletDrawTools] Activating delete mode"),i.getContainer().style.cursor="crosshair",s("click",f=>{const x=f.originalEvent.target;x&&x.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Delete click on feature:",x),i.eachLayer(m=>{if(m.getElement&&m.getElement()===x){console.log("[PureLeafletDrawTools] Deleting layer:",m);const c=m._fireEmsFeatureId;c&&(console.log("[PureLeafletDrawTools] Found feature ID for deletion:",c),t(Ni(c)),console.log("[PureLeafletDrawTools] Feature deleted from Redux store")),i.removeLayer(m),console.log("[PureLeafletDrawTools] Layer removed from map")}}))});else if(l.mode){console.log("[PureLeafletDrawTools] Activating simple drawing mode:",l.mode);let r=!1,f=null,x=null;const m=y=>{var k,M,j,D,T,w,L,S,X,ee,ie,De,Be,Se,Me,Le,Te,Ae,ze,Ie;if(G.DomEvent.stopPropagation(y.originalEvent),G.DomEvent.preventDefault(y.originalEvent),console.log("[PureLeafletDrawTools] Drawing click detected:",l.mode,y.latlng),console.log("[PureLeafletDrawTools] Current drawing options:",l.options),console.log("[PureLeafletDrawTools] Current style options:",l.options.style),l.mode==="marker"){const Y=((k=l.options.style)==null?void 0:k.color)||"#3388ff";console.log("[PureLeafletDrawTools] Creating marker with color:",Y);const be=G.divIcon({className:"colored-marker",html:`<div style="
              background-color: ${Y};
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,iconSize:[25,25],iconAnchor:[12,24],popupAnchor:[1,-24]}),oe=G.marker(y.latlng,{draggable:!0,icon:be});if(oe.addTo(i),console.log("[PureLeafletDrawTools] Colored marker added DIRECTLY to map:",oe),n.current&&n.current.addLayer(oe),!h)return;const pe=p(oe,"marker"),{id:fe,created:nt,modified:at,...Ue}=pe;t(xe({layerId:h.id,feature:Ue})),oe._fireEmsFeatureId=pe.id,t(Pe(null))}else if(!r&&l.mode==="circle"){r=!0,f=y.latlng,console.log("[PureLeafletDrawTools] Starting circle drawing at:",y.latlng);const Y={radius:100,color:((M=l.options.style)==null?void 0:M.color)||"#3388ff",fillColor:((j=l.options.style)==null?void 0:j.fillColor)||"#3388ff",fillOpacity:((D=l.options.style)==null?void 0:D.fillOpacity)||.2,weight:((T=l.options.style)==null?void 0:T.weight)||3,opacity:((w=l.options.style)==null?void 0:w.opacity)||1};console.log("[PureLeafletDrawTools] Circle options:",Y),console.log("[PureLeafletDrawTools] Fill color value:",(L=l.options.style)==null?void 0:L.fillColor),x=G.circle(y.latlng,Y),x.addTo(i),console.log("[PureLeafletDrawTools] Circle started, added DIRECTLY to map:",x)}else if(r&&l.mode==="circle"){if(console.log("[PureLeafletDrawTools] Finishing circle drawing"),x){if(!h)return;const Y=p(x,"circle");console.log("[PureLeafletDrawTools] Circle feature created:",Y);const{id:be,created:oe,modified:pe,...fe}=Y;t(xe({layerId:h.id,feature:fe})),x._fireEmsFeatureId=Y.id,console.log("[PureLeafletDrawTools] Circle feature dispatched to Redux")}t(Pe(null))}else if(!r&&l.mode==="rectangle")r=!0,f=y.latlng,console.log("[PureLeafletDrawTools] Starting rectangle drawing"),x=G.rectangle([[y.latlng.lat,y.latlng.lng],[y.latlng.lat,y.latlng.lng]],{color:((S=l.options.style)==null?void 0:S.color)||"#3388ff",fillColor:((X=l.options.style)==null?void 0:X.fillColor)||"#3388ff",fillOpacity:((ee=l.options.style)==null?void 0:ee.fillOpacity)||.2,weight:((ie=l.options.style)==null?void 0:ie.weight)||3,opacity:((De=l.options.style)==null?void 0:De.opacity)||1}),x.addTo(i),console.log("[PureLeafletDrawTools] Rectangle started, added DIRECTLY to map:",x);else if(r&&l.mode==="rectangle"){if(console.log("[PureLeafletDrawTools] Finishing rectangle drawing"),x){if(!h)return;const Y=p(x,"rectangle");console.log("[PureLeafletDrawTools] Rectangle feature created:",Y);const{id:be,created:oe,modified:pe,...fe}=Y;t(xe({layerId:h.id,feature:fe})),x._fireEmsFeatureId=Y.id,console.log("[PureLeafletDrawTools] Rectangle feature dispatched to Redux")}t(Pe(null))}else if(!r&&(l.mode==="polygon"||l.mode==="polyline"))if(x){const Y=l.mode==="polygon"?x.getLatLngs()[0]:x.getLatLngs();Y.push(y.latlng),l.mode,x.setLatLngs(Y),console.log(`[PureLeafletDrawTools] Added point to ${l.mode}:`,y.latlng)}else{const Y=[y.latlng];l.mode==="polygon"?x=G.polygon(Y,{color:((Be=l.options.style)==null?void 0:Be.color)||"#3388ff",fillColor:((Se=l.options.style)==null?void 0:Se.fillColor)||"#3388ff",fillOpacity:((Me=l.options.style)==null?void 0:Me.fillOpacity)||.2,weight:((Le=l.options.style)==null?void 0:Le.weight)||3,opacity:((Te=l.options.style)==null?void 0:Te.opacity)||1}):x=G.polyline(Y,{color:((Ae=l.options.style)==null?void 0:Ae.color)||"#3388ff",weight:((ze=l.options.style)==null?void 0:ze.weight)||3,opacity:((Ie=l.options.style)==null?void 0:Ie.opacity)||1}),x.addTo(i),console.log(`[PureLeafletDrawTools] ${l.mode} started:`,x)}},c=y=>{if(!(!r||!x||!f))switch(G.DomEvent.stopPropagation(y.originalEvent),l.mode){case"circle":const k=f.distanceTo(y.latlng);x.setRadius(k);break;case"rectangle":const M=G.latLngBounds([f,y.latlng]);x.setBounds(M);break}};i.dragging.disable(),i.doubleClickZoom.disable(),i.boxZoom.disable(),console.log("[PureLeafletDrawTools] Map interactions disabled for drawing");const u=y=>{if((l.mode==="polygon"||l.mode==="polyline")&&(G.DomEvent.stopPropagation(y.originalEvent),G.DomEvent.preventDefault(y.originalEvent),x)){if(console.log(`[PureLeafletDrawTools] Finishing ${l.mode} with double-click`),!h)return;const k=p(x,l.mode);console.log(`[PureLeafletDrawTools] ${l.mode} feature created:`,k);const{id:M,created:j,modified:D,...T}=k;t(xe({layerId:h.id,feature:T})),x._fireEmsFeatureId=k.id,console.log(`[PureLeafletDrawTools] ${l.mode} feature dispatched to Redux`),t(Pe(null))}};s("click",m),s("mousemove",c),s("dblclick",u),i.getContainer().style.cursor="crosshair"}return()=>{a()}}},[l.mode,i,t,a,s]),B.useEffect(()=>()=>{a()},[a]),null},yr=({map:i,mapContainer:t})=>{const l=Z(),o=O(se),n=()=>`dropped_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;return B.useEffect(()=>{if(!i||!t||!i.getContainer()){console.warn("[DragDrop] Map or container not ready for drag/drop setup");return}const d=setTimeout(()=>{const h=i.getContainer();if(!h||!h.parentNode||!document.body.contains(h)){console.warn("[DragDrop] Map container not properly attached, skipping setup");return}if(!i.getPanes()){console.warn("[DragDrop] Map panes not ready, skipping setup");return}console.log("[DragDrop] Setting up drag and drop handlers");const a=p=>{p.preventDefault(),p.dataTransfer.dropEffect="copy"},g=p=>{var r;p.preventDefault();try{const f=p.dataTransfer.getData("application/json");if(!f){console.warn("[DragDrop] No icon data found in drop event");return}const x=JSON.parse(f);console.log("[DragDrop] Dropped icon:",x);let m;try{const y=i.getContainer();if(!y||!y.parentNode)throw new Error("Map container not available or not attached");const k=i.getPanes();if(!k||!i._loaded)throw new Error("Map not fully loaded");if(!i._size||!i._pixelOrigin||!k.mapPane)throw new Error("Map coordinate system not ready - missing _size, _pixelOrigin, or mapPane");const M=y.getBoundingClientRect(),j=p.clientX-M.left,D=p.clientY-M.top;if(j<0||D<0||j>M.width||D>M.height)throw new Error("Drop coordinates are outside map bounds");try{console.log("[DragDrop] Using legacy containerPointToLatLng method");const T=G.point(j,D);m=i.containerPointToLatLng(T),console.log("[DragDrop] Legacy coordinate conversion:",{x:j,y:D,point:{x:T.x,y:T.y},latlng:{lat:m.lat,lng:m.lng}})}catch(T){console.error("[DragDrop] Legacy conversion failed, falling back:",T),m=G.latLng(39.8283,-98.5795)}if(!m||isNaN(m.lat)||isNaN(m.lng))throw new Error("Invalid coordinates calculated");if(Math.abs(m.lat)>90||Math.abs(m.lng)>180)throw new Error("Coordinates outside valid geographic bounds")}catch(y){console.error("[DragDrop] Error calculating coordinates:",y);try{if(m=i.getCenter(),!m||isNaN(m.lat)||isNaN(m.lng))throw new Error("Map center is invalid")}catch(k){console.error("[DragDrop] Error getting map center:",k),m={lat:39.8283,lng:-98.5795}}}console.log("[DragDrop] Icon data received:",{id:x.id,name:x.name,url:x.url?x.url.substring(0,100)+"...":"NO URL",urlLength:x.url?x.url.length:0,category:x.category,size:x.size,color:x.color});let c=o.find(y=>y.type==="feature"&&y.visible);const u={id:n(),type:"marker",title:x.name||"Dropped Icon",description:`${x.name} placed at ${new Date().toLocaleTimeString()}`,coordinates:[m.lng,m.lat],layerId:(c==null?void 0:c.id)||"pending",style:{color:x.color||"#666666",icon:{id:x.id,name:x.name,category:x.category||"custom",url:x.url,size:x.size||"medium",color:x.color||"#666666",anchor:x.anchor||[16,32],popupAnchor:x.popupAnchor||[0,-32]}},properties:{droppedAt:new Date().toISOString(),iconSource:"library",originalIcon:x},created:new Date,modified:new Date};if(console.log("[DragDrop] Created feature with icon URL:",(r=u.style.icon)!=null&&r.url?"PRESENT":"MISSING"),c)console.log("[DragDrop] Adding feature to existing layer:",c.id,c.name),l(xe({layerId:c.id,feature:u}));else{console.log('[DragDrop] No suitable layer found. Creating "Dropped Icons" layer. Available layers:',o.map(k=>({id:k.id,name:k.name,type:k.type,visible:k.visible})));const y={name:"Dropped Icons",type:"feature",visible:!0,opacity:1,zIndex:o.length,features:[],style:{defaultStyle:{color:"#DC2626",fillColor:"#DC2626",fillOpacity:.3,weight:2,opacity:1}},metadata:{description:"Icons dropped from the icon library",source:"user-interaction",created:new Date,featureCount:0}};l(ci(y)),setTimeout(()=>{const k=o,M=k.find(j=>j.name==="Dropped Icons");if(M)console.log("[DragDrop] Adding feature to newly created layer:",M.id),u.layerId=M.id,l(xe({layerId:M.id,feature:u}));else{const j=k.find(D=>D.type==="feature");j?(console.log("[DragDrop] Using first available feature layer:",j.id),l(xe({layerId:j.id,feature:u}))):console.error("[DragDrop] Failed to create or find any feature layer")}},300)}console.log("[DragDrop] Successfully created feature from dropped icon:",u.id)}catch(f){console.error("[DragDrop] Error handling drop event:",f)}};return t.addEventListener("dragover",a),t.addEventListener("drop",g),console.log("[DragDrop] Successfully set up drag and drop handlers"),()=>{t.removeEventListener("dragover",a),t.removeEventListener("drop",g),console.log("[DragDrop] Cleaned up drag and drop handlers")}},100);return()=>{clearTimeout(d)}},[i,t,l,o]),null},mr=gi.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});gi.Marker.prototype.options.icon=mr;const wr=()=>{const i=Z(),t=O(rt),l=O(Ct),o=O(se),[n,d]=B.useState(!1),[h]=B.useState(null),[s,a]=B.useState(null),g=B.useRef(null),p=t.baseMaps.find(m=>m.id===t.activeBaseMap),r=B.useCallback((m,c)=>{g.current=m,a(c),d(!0),typeof window<"u"&&(window.fireMapProInstance=m,console.log("✓ Pure Leaflet map exposed as window.fireMapProInstance"))},[]);if(jt.useEffect(()=>{i(ve(null))},[t.activeBaseMap,i]),!p)return e.jsx(C,{sx:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",bgcolor:"grey.100"},children:e.jsx(b,{variant:"h6",color:"text.secondary",children:"No base map configured"})});const f=m=>{m.preventDefault();try{const c=JSON.parse(m.dataTransfer.getData("application/json")),y=m.currentTarget.getBoundingClientRect(),k=m.clientX-y.left,M=m.clientY-y.top;if(g.current&&c){const j=g.current.containerPointToLatLng([k,M]),D=o.find(T=>T.type==="feature");if(D){const T={type:"marker",title:c.name,description:`${c.name} - Click to edit`,coordinates:[j.lng,j.lat],style:{...c,icon:c},properties:{iconCategory:c.category,droppedFrom:"icon-library"},layerId:D.id};i(xe({layerId:D.id,feature:T})),console.log("Icon placed successfully:",c.name,"at",j)}else i(ve("Please create a feature layer first to place icons"))}}catch(c){console.error("Error handling icon drop:",c),i(ve("Error placing icon on map"))}},x=m=>{m.preventDefault(),m.dataTransfer.dropEffect="copy"};return e.jsxs(C,{sx:{height:"100%",width:"100%",position:"relative",minHeight:"500px","& .leaflet-container":{height:"100% !important",width:"100% !important",position:"relative !important"}},onDrop:f,onDragOver:x,children:[e.jsxs(dl,{onMapReady:r,children:[n&&g.current&&s&&e.jsx(fr,{map:g.current}),n&&g.current&&s&&e.jsx(ur,{map:g.current}),n&&g.current&&s&&e.jsx(yr,{map:g.current,mapContainer:s}),n&&g.current&&!1]}),t.showCoordinates&&e.jsx(hl,{mouseCoords:h}),l.options.showMeasurements&&e.jsx(pr,{}),!1,t.showGrid&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",backgroundImage:`
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,backgroundSize:"50px 50px",zIndex:1e3}}),!n&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",bgcolor:"rgba(255, 255, 255, 0.9)",zIndex:2e3},children:e.jsx(b,{variant:"h6",color:"text.secondary",children:"Loading map..."})})]})},vr=()=>{const i=Z(),t=O(se),[l,o]=B.useState(new Set),[n,d]=B.useState(null),[h,s]=B.useState(!1),[a,g]=B.useState(null),[p,r]=B.useState({name:"",type:"feature",opacity:1,visible:!0}),f=w=>{const L=t.find(S=>S.id===w);L&&i(Oi({layerId:w,visible:!L.visible}))},x=(w,L)=>{i(Hi({layerId:w,opacity:L/100}))},m=w=>{const L=new Set(l);L.has(w)?L.delete(w):L.add(w),o(L)},c=(w,L)=>{w.preventDefault(),d({mouseX:w.clientX-2,mouseY:w.clientY-4,layerId:L})},u=()=>{d(null)},y=()=>{const w={name:p.name||"New Layer",visible:p.visible,opacity:p.opacity,zIndex:t.length,type:p.type,features:[],metadata:{description:"",source:"User Created",created:new Date,featureCount:0}};i(ci(w)),s(!1),r({name:"",type:"feature",opacity:1,visible:!0})},k=w=>{const L=t.find(S=>S.id===w);L&&(r({name:L.name,type:L.type,opacity:L.opacity,visible:L.visible}),g(w)),u()},M=()=>{a&&(i(Vi({layerId:a,updates:{name:p.name,type:p.type,opacity:p.opacity,visible:p.visible}})),g(null),r({name:"",type:"feature",opacity:1,visible:!0}))},j=w=>{i($i(w)),u()},D=w=>{switch(w){case"base":return e.jsx(vt,{});case"overlay":return e.jsx(We,{});case"reference":return e.jsx(vt,{});default:return e.jsx(We,{})}},T=w=>{switch(w){case"base":return"primary";case"overlay":return"secondary";case"reference":return"info";default:return"default"}};return e.jsxs(C,{children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(b,{variant:"h6",sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(We,{}),"Layers"]}),e.jsx(te,{startIcon:e.jsx(Cl,{}),onClick:()=>s(!0),size:"small",variant:"outlined",children:"Add"})]}),e.jsx(ui,{dense:!0,children:t.map((w,L)=>e.jsxs(jt.Fragment,{children:[e.jsxs(yi,{sx:{border:"1px solid",borderColor:"divider",borderRadius:1,mb:1,bgcolor:"background.paper"},children:[e.jsx(Ye,{sx:{minWidth:32},children:e.jsx(ql,{sx:{cursor:"grab",color:"text.disabled"}})}),e.jsx(Ye,{sx:{minWidth:40},children:D(w.type)}),e.jsx(Xe,{primary:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(b,{variant:"body2",sx:{fontWeight:500},children:w.name}),e.jsx(Fe,{label:w.type,size:"small",color:T(w.type),sx:{height:20,fontSize:"0.7rem"}})]}),secondary:`${w.features.length} features`}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(le,{size:"small",onClick:()=>f(w.id),color:w.visible?"primary":"default",children:w.visible?e.jsx(xr,{}):e.jsx(gr,{})}),e.jsx(le,{size:"small",onClick:()=>m(w.id),children:l.has(w.id)?e.jsx(rl,{}):e.jsx(ae,{})}),e.jsx(le,{size:"small",onClick:S=>c(S,w.id),children:e.jsx(tr,{})})]})]}),e.jsx(El,{in:l.has(w.id),timeout:"auto",children:e.jsxs(C,{sx:{pl:2,pr:2,pb:2},children:[e.jsxs(b,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Opacity: ",Math.round(w.opacity*100),"%"]}),e.jsx(Ke,{value:w.opacity*100,onChange:(S,X)=>x(w.id,X),min:0,max:100,size:"small",sx:{mb:1}}),w.metadata.description&&e.jsx(b,{variant:"caption",color:"text.secondary",children:w.metadata.description})]})})]},w.id))}),t.length===0&&e.jsx(C,{sx:{textAlign:"center",py:4},children:e.jsx(b,{variant:"body2",color:"text.secondary",children:"No layers yet. Create your first layer to get started."})}),e.jsxs(yl,{open:n!==null,onClose:u,anchorReference:"anchorPosition",anchorPosition:n!==null?{top:n.mouseY,left:n.mouseX}:void 0,children:[e.jsxs(F,{onClick:()=>n&&k(n.layerId),children:[e.jsx(Ye,{children:e.jsx(qe,{fontSize:"small"})}),e.jsx(Xe,{children:"Edit Layer"})]}),e.jsxs(F,{onClick:()=>n&&j(n.layerId),children:[e.jsx(Ye,{children:e.jsx(Ft,{fontSize:"small"})}),e.jsx(Xe,{children:"Delete Layer"})]})]}),e.jsxs(Je,{open:h,onClose:()=>s(!1),maxWidth:"sm",fullWidth:!0,children:[e.jsx(et,{children:"Create New Layer"}),e.jsxs(tt,{children:[e.jsx(N,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:p.name,onChange:w=>r({...p,name:w.target.value}),sx:{mb:2}}),e.jsxs(H,{fullWidth:!0,sx:{mb:2},children:[e.jsx($,{children:"Layer Type"}),e.jsxs(V,{value:p.type,label:"Layer Type",onChange:w=>r({...p,type:w.target.value}),children:[e.jsx(F,{value:"feature",children:"Feature Layer"}),e.jsx(F,{value:"overlay",children:"Overlay Layer"}),e.jsx(F,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(b,{variant:"body2",children:"Visible:"}),e.jsx(J,{checked:p.visible,onChange:w=>r({...p,visible:w.target.checked})})]})]}),e.jsxs(it,{children:[e.jsx(te,{onClick:()=>s(!1),children:"Cancel"}),e.jsx(te,{onClick:y,variant:"contained",children:"Create"})]})]}),e.jsxs(Je,{open:a!==null,onClose:()=>g(null),maxWidth:"sm",fullWidth:!0,children:[e.jsx(et,{children:"Edit Layer"}),e.jsxs(tt,{children:[e.jsx(N,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:p.name,onChange:w=>r({...p,name:w.target.value}),sx:{mb:2}}),e.jsxs(H,{fullWidth:!0,sx:{mb:2},children:[e.jsx($,{children:"Layer Type"}),e.jsxs(V,{value:p.type,label:"Layer Type",onChange:w=>r({...p,type:w.target.value}),children:[e.jsx(F,{value:"feature",children:"Feature Layer"}),e.jsx(F,{value:"overlay",children:"Overlay Layer"}),e.jsx(F,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(b,{variant:"body2",children:"Visible:"}),e.jsx(J,{checked:p.visible,onChange:w=>r({...p,visible:w.target.checked})})]})]}),e.jsxs(it,{children:[e.jsx(te,{onClick:()=>g(null),children:"Cancel"}),e.jsx(te,{onClick:M,variant:"contained",children:"Update"})]})]})]})},br=()=>{const i=Z(),t=O(Ct),l=O(se),[o,n]=B.useState(""),d=[{mode:"marker",icon:e.jsx(rr,{}),label:"Marker"},{mode:"polyline",icon:e.jsx(Sl,{}),label:"Line"},{mode:"polygon",icon:e.jsx(Ql,{}),label:"Polygon"},{mode:"circle",icon:e.jsx(lr,{}),label:"Circle"},{mode:"rectangle",icon:e.jsx(Xl,{}),label:"Rectangle"}],h=r=>{const f=r===t.mode?null:r;console.log("[DrawingTools UI] Button clicked:",{clickedMode:r,currentMode:t.mode,newMode:f}),i(Pe(f))},s=(r,f)=>{console.log("[DrawingTools] Style change:",{property:r,value:f}),console.log("[DrawingTools] Current style before update:",t.options.style);const x={style:{...t.options.style,[r]:f}};console.log("[DrawingTools] New options to dispatch:",x),i(Nt(x))},a=(r,f)=>{i(Nt({[r]:f}))},g=(r,f)=>{i(di({[r]:f}))},p=l.filter(r=>r.type==="feature");return e.jsxs(C,{children:[e.jsxs(b,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(qe,{}),"Drawing Tools"]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:1},children:"Drawing Mode"}),e.jsxs(E,{container:!0,spacing:1,children:[d.map(({mode:r,icon:f,label:x})=>e.jsx(E,{size:6,children:e.jsx(_e,{title:x,children:e.jsx(yt,{value:r||"",selected:t.mode===r,onClick:()=>h(r),sx:{width:"100%",height:48},size:"small",children:f})})},r)),e.jsx(E,{size:6,children:e.jsx(_e,{title:"Edit Features",children:e.jsx(yt,{value:"edit",selected:t.mode==="edit",onClick:()=>h("edit"),sx:{width:"100%",height:48},size:"small",children:e.jsx(qe,{})})})}),e.jsx(E,{size:6,children:e.jsx(_e,{title:"Delete Features",children:e.jsx(yt,{value:"delete",selected:t.mode==="delete",onClick:()=>h("delete"),sx:{width:"100%",height:48},size:"small",color:"error",children:e.jsx(Ft,{})})})})]})]}),p.length>0&&e.jsx(Q,{sx:{p:2,mb:2},children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx($,{children:"Target Layer"}),e.jsx(V,{value:o,label:"Target Layer",onChange:r=>n(r.target.value),children:p.map(r=>e.jsxs(F,{value:r.id,children:[r.name," (",r.features.length," features)"]},r.id))})]})}),t.mode&&t.mode!=="edit"&&t.mode!=="delete"&&e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Style Options"}),e.jsxs(C,{sx:{mb:2},children:[e.jsx(b,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Stroke Color"}),e.jsx(E,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(r=>e.jsx(E,{size:"auto",children:e.jsx(C,{sx:{width:32,height:32,backgroundColor:r,border:t.options.style.color===r?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("color",r)})},r))})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(C,{sx:{mb:2},children:[e.jsx(b,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Fill Color"}),e.jsx(E,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(r=>e.jsx(E,{size:"auto",children:e.jsx(C,{sx:{width:32,height:32,backgroundColor:r,border:t.options.style.fillColor===r?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("fillColor",r)})},r))})]}),e.jsxs(C,{sx:{mb:2},children:[e.jsxs(b,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Stroke Width: ",t.options.style.weight,"px"]}),e.jsx(Ke,{value:t.options.style.weight||3,onChange:(r,f)=>s("weight",f),min:1,max:10,step:1,size:"small"})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(C,{sx:{mb:2},children:[e.jsxs(b,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Fill Opacity: ",Math.round((t.options.style.fillOpacity||.3)*100),"%"]}),e.jsx(Ke,{value:(t.options.style.fillOpacity||.3)*100,onChange:(r,f)=>s("fillOpacity",f/100),min:0,max:100,step:5,size:"small"})]})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Drawing Options"}),e.jsx(_,{control:e.jsx(J,{checked:t.options.snapToGrid||!1,onChange:r=>a("snapToGrid",r.target.checked),size:"small"}),label:"Snap to Grid",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.options.showMeasurements||!1,onChange:r=>a("showMeasurements",r.target.checked),size:"small"}),label:"Show Measurements",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.options.allowEdit||!1,onChange:r=>a("allowEdit",r.target.checked),size:"small"}),label:"Allow Editing",sx:{display:"flex"}})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Map Display"}),e.jsx(_,{control:e.jsx(J,{checked:!1,onChange:r=>g("showGrid",r.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:!0,onChange:r=>g("showCoordinates",r.target.checked),size:"small"}),label:"Show Coordinates",sx:{display:"flex"}})]}),t.mode&&e.jsxs(Q,{sx:{p:2,bgcolor:"primary.light",color:"primary.contrastText"},children:[e.jsxs(b,{variant:"subtitle2",sx:{mb:1},children:["Active: ",t.mode.charAt(0).toUpperCase()+t.mode.slice(1)," Mode"]}),e.jsxs(b,{variant:"caption",children:[t.mode==="marker"&&"Click on the map to place markers",t.mode==="polyline"&&"Click points to draw a line",t.mode==="polygon"&&"Click points to draw a polygon",t.mode==="circle"&&"Click and drag to draw a circle",t.mode==="rectangle"&&"Click and drag to draw a rectangle",t.mode==="edit"&&"Click features to edit them",t.mode==="delete"&&"Click features to delete them"]})]}),p.length===0&&e.jsxs(Q,{sx:{p:2,bgcolor:"warning.light",color:"warning.contrastText"},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:1},children:"No Feature Layers"}),e.jsx(b,{variant:"caption",children:"Create a feature layer first to start drawing."})]})]})},I=(i,t,l,o,n="medium",d="#333333")=>{const h=encodeURIComponent(o);return{id:i,name:t,category:l,url:`data:image/svg+xml,${h}`,size:n,color:d,anchor:n==="small"?[12,12]:n==="large"?[20,40]:[16,32],popupAnchor:[0,n==="small"?-12:n==="large"?-40:-32]}},Cr=[I("fire-engine","Fire Engine","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("ladder-truck","Ladder Truck","fire-apparatus",`<svg width="50" height="32" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("water-tanker","Water Tanker","fire-apparatus",`<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),I("brush-unit","Brush Unit","fire-apparatus",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#059669"),I("rescue-unit","Rescue Unit","fire-apparatus",`<svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("hazmat-unit","HazMat Unit","fire-apparatus",`<svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#F59E0B"),I("command-vehicle","Command Vehicle","fire-apparatus",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1F2937"),I("fire-boat","Fire Boat","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626")],jr=[I("als-ambulance","ALS Ambulance","ems-units",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("bls-ambulance","BLS Ambulance","ems-units",`<svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),I("air-ambulance","Air Ambulance","ems-units",`<svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("paramedic-unit","Paramedic Unit","ems-units",`<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1E40AF")],Er=[I("structure-fire","Structure Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#DC2626"),I("vehicle-fire","Vehicle Fire","incident-types",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#F59E0B"),I("medical-emergency","Medical Emergency","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#059669"),I("hazmat-incident","Hazmat Incident","incident-types",`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#F59E0B"),I("water-rescue","Water Rescue","incident-types",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#3B82F6"),I("wildland-fire","Wildland Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#22C55E")],Fr=[I("fire-station","Fire Station","facilities",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626"),I("hospital","Hospital","facilities",`<svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF"),I("fire-hydrant","Fire Hydrant","facilities",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"small","#F59E0B"),I("helipad","Helipad","facilities",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF")],bt={"fire-apparatus":Cr,"ems-units":jr,"incident-types":Er,facilities:Fr,prevention:[I("fire-extinguisher","Fire Extinguisher","prevention",`<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#DC2626"),I("smoke-detector","Smoke Detector","prevention",`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#6B7280"),I("sprinkler-system","Sprinkler System","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#DC2626"),I("exit-sign","Exit Sign","prevention",`<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#22C55E"),I("emergency-phone","Emergency Phone","prevention",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"small","#DC2626"),I("fire-alarm-panel","Fire Alarm Panel","prevention",`<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#DC2626")],"energy-systems":[I("power-lines","Power Lines","energy-systems",`<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#1F2937"),I("gas-lines","Gas Lines","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#FBBF24"),I("solar-panels","Solar Panels","energy-systems",`<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#1E40AF"),I("transformer","Transformer","energy-systems",`<svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280"),I("electrical-panel","Electrical Panel","energy-systems",`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"medium","#6B7280"),I("generator","Generator","energy-systems",`<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280")],custom:[]};Object.values(bt).flat();const kr={"fire-apparatus":e.jsx(Ll,{}),"ems-units":e.jsx(er,{}),"incident-types":e.jsx(Dl,{}),facilities:e.jsx(kl,{}),prevention:e.jsx(Ml,{}),"energy-systems":e.jsx(Kl,{}),custom:e.jsx(ot,{})},Dr=()=>{var c;const i=O(se),[t,l]=B.useState("fire-apparatus"),[o,n]=B.useState("medium"),[d,h]=B.useState("#DC2626"),[s,a]=B.useState(""),g=Object.keys(bt),r=(bt[t]||[]).filter(u=>u.name.toLowerCase().includes(s.toLowerCase())),f=i.filter(u=>u.type==="feature"),x=(u,y)=>{const k={...y,size:o,color:d};u.dataTransfer.setData("application/json",JSON.stringify(k)),u.dataTransfer.effectAllowed="copy";const M=u.currentTarget.cloneNode(!0);M.style.transform="scale(1.2)",M.style.opacity="0.8",document.body.appendChild(M),u.dataTransfer.setDragImage(M,16,16),setTimeout(()=>document.body.removeChild(M),0)},m=[{name:"Fire Red",value:"#DC2626"},{name:"EMS Blue",value:"#1E40AF"},{name:"Safety Green",value:"#059669"},{name:"Warning Orange",value:"#F59E0B"},{name:"Medical Cross",value:"#EF4444"},{name:"Industrial Gray",value:"#6B7280"},{name:"Hazmat Yellow",value:"#FCD34D"},{name:"Emergency Purple",value:"#7C3AED"}];return e.jsxs(C,{children:[e.jsxs(b,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ot,{}),"Professional Icons"]}),e.jsx(N,{fullWidth:!0,size:"small",placeholder:"Search fire & EMS icons...",value:s,onChange:u=>a(u.target.value),InputProps:{startAdornment:e.jsx(mi,{position:"start",children:e.jsx(Fl,{})})},sx:{mb:2}}),e.jsx(Et,{value:t,onChange:(u,y)=>l(y),variant:"scrollable",scrollButtons:"auto",sx:{mb:2,minHeight:"auto"},children:g.map(u=>e.jsx(Re,{value:u,icon:kr[u],label:u.replace("-"," "),sx:{minHeight:"auto",py:1,fontSize:"0.75rem",textTransform:"capitalize"}},u))}),e.jsxs(Q,{sx:{p:2,mb:2,bgcolor:"grey.50"},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2,fontWeight:"bold"},children:"Icon Settings"}),e.jsxs(E,{container:!0,spacing:2,children:[e.jsx(E,{size:6,children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx($,{children:"Size"}),e.jsxs(V,{value:o,label:"Size",onChange:u=>n(u.target.value),children:[e.jsx(F,{value:"small",children:"Small (20px)"}),e.jsx(F,{value:"medium",children:"Medium (32px)"}),e.jsx(F,{value:"large",children:"Large (48px)"}),e.jsx(F,{value:"extra-large",children:"Extra Large (64px)"})]})]})}),e.jsx(E,{size:6,children:e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx($,{children:"Color Theme"}),e.jsx(V,{value:d,label:"Color Theme",onChange:u=>h(u.target.value),children:m.map(u=>e.jsx(F,{value:u.value,children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(C,{sx:{width:16,height:16,backgroundColor:u.value,borderRadius:"50%",border:"1px solid #ccc"}}),u.name]})},u.value))})]})})]})]}),e.jsxs(C,{sx:{mb:2},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsxs(b,{variant:"subtitle2",sx:{fontWeight:"bold",textTransform:"uppercase"},children:[t.replace("-"," ")," (",r.length,")"]}),e.jsx(Fe,{label:`${o} • ${(c=m.find(u=>u.value===d))==null?void 0:c.name}`,size:"small",color:"primary",variant:"outlined"})]}),r.length>0?e.jsx(E,{container:!0,spacing:1,children:r.map(u=>e.jsx(E,{size:4,children:e.jsx(_e,{title:`${u.name} - Drag to map`,children:e.jsxs(Q,{sx:{p:1,textAlign:"center",cursor:"grab",transition:"all 0.2s ease","&:hover":{bgcolor:"primary.light",transform:"scale(1.05)",boxShadow:2},"&:active":{cursor:"grabbing",transform:"scale(0.95)"}},draggable:!0,onDragStart:y=>x(y,u),children:[e.jsx(C,{component:"img",src:u.url,alt:u.name,sx:{width:o==="small"?20:o==="large"?40:32,height:o==="small"?20:o==="large"?40:32,mb:.5,filter:d!==u.color?`hue-rotate(${Br(u.color,d)}deg)`:"none"}}),e.jsx(b,{variant:"caption",sx:{display:"block",fontSize:"0.65rem",lineHeight:1.2,fontWeight:500},children:u.name})]})})},u.id))}):e.jsx(C,{sx:{textAlign:"center",py:4},children:e.jsx(b,{variant:"body2",color:"text.secondary",children:s?"No icons match your search":"No icons in this category"})})]}),f.length===0&&e.jsxs(Ge,{severity:"info",sx:{mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:1},children:"Create a layer first"}),e.jsx(b,{variant:"caption",children:"Go to the Layers tab and create a feature layer to place icons on the map."})]}),e.jsxs(Q,{sx:{p:2,bgcolor:"info.light",color:"info.contrastText"},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:1,fontWeight:"bold"},children:"How to Use"}),e.jsxs(C,{component:"ul",sx:{pl:2,m:0,"& li":{mb:.5}},children:[e.jsx("li",{children:"Select icon size and color above"}),e.jsx("li",{children:"Drag any icon from the library"}),e.jsx("li",{children:"Drop it on the map to place a marker"}),e.jsx("li",{children:"Click the marker to edit its properties"})]})]})]})};function Br(i,t){const l={"#DC2626":0,"#EF4444":5,"#F59E0B":45,"#FCD34D":60,"#059669":120,"#1E40AF":240,"#7C3AED":270,"#6B7280":0},o=l[i]||0;return(l[t]||0)-o}const Sr=()=>{const i=Z(),t=()=>{i(hi())};return e.jsxs(C,{children:[e.jsxs(b,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ke,{}),"Export"]}),e.jsxs(Q,{sx:{p:2},children:[e.jsx(b,{variant:"body2",color:"text.secondary",sx:{mb:2},children:"Generate professional maps with the new export system"}),e.jsx(te,{variant:"contained",onClick:t,startIcon:e.jsx(ke,{}),fullWidth:!0,children:"Open Export Options"})]})]})},Mr=()=>{const i=Z(),t=O(rt),l=n=>{i(Yi(n))},o=(n,d)=>{i(di({[n]:d}))};return e.jsxs(C,{children:[e.jsxs(b,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(wi,{}),"Settings"]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Base Map"}),e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx($,{children:"Base Map"}),e.jsx(V,{value:t.activeBaseMap,label:"Base Map",onChange:n=>l(n.target.value),children:t.baseMaps.map(n=>e.jsx(F,{value:n.id,children:n.name},n.id))})]})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Display Options"}),e.jsx(_,{control:e.jsx(J,{checked:t.showCoordinates,onChange:n=>o("showCoordinates",n.target.checked),size:"small"}),label:"Show Coordinates",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.showGrid,onChange:n=>o("showGrid",n.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}})]}),e.jsxs(Q,{sx:{p:2},children:[e.jsx(b,{variant:"subtitle2",sx:{mb:2},children:"Measurement Units"}),e.jsxs(H,{fullWidth:!0,size:"small",children:[e.jsx($,{children:"Units"}),e.jsxs(V,{value:t.measurementUnits,label:"Units",onChange:n=>o("measurementUnits",n.target.value),children:[e.jsx(F,{value:"metric",children:"Metric (m, km)"}),e.jsx(F,{value:"imperial",children:"Imperial (ft, mi)"})]})]})]})]})},Lr=({mode:i})=>{const t=Z(),l=O(xi),o=[{id:"layers",label:"Layers",icon:e.jsx(We,{}),component:vr},{id:"drawing",label:"Drawing",icon:e.jsx(qe,{}),component:br,disabled:i==="view"},{id:"icons",label:"Icons",icon:e.jsx(ot,{}),component:Dr,disabled:i==="view"},{id:"export",label:"Export",icon:e.jsx(ke,{}),component:Sr},{id:"settings",label:"Settings",icon:e.jsx(wi,{}),component:Mr}],n=(s,a)=>{t(Qi(a))},h=(o.find(s=>s.id===l.activePanel)||o[0]).component;return e.jsxs(C,{sx:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx(Q,{elevation:0,sx:{borderBottom:1,borderColor:"divider"},children:e.jsx(Et,{value:l.activePanel||"layers",onChange:n,variant:"scrollable",scrollButtons:"auto",orientation:"horizontal",sx:{minHeight:48,"& .MuiTab-root":{minWidth:60,minHeight:48}},children:o.map(s=>e.jsx(Re,{value:s.id,icon:s.icon,label:s.label,disabled:s.disabled,sx:{fontSize:"0.75rem","&.Mui-selected":{color:"primary.main"}}},s.id))})}),e.jsx(C,{sx:{flex:1,overflow:"auto",p:2},children:e.jsx(h,{})})]})},Tr=()=>{const i=Z(),t=()=>{i(_i())};return e.jsxs(Je,{open:!0,onClose:t,maxWidth:"md",fullWidth:!0,children:[e.jsx(et,{sx:{textAlign:"center",pb:1},children:"Welcome to Fire Map Pro"}),e.jsxs(tt,{children:[e.jsx(b,{variant:"h6",sx:{mb:2,textAlign:"center",color:"primary.main"},children:"Professional Mapping for Fire & EMS Operations"}),e.jsxs(b,{variant:"body1",paragraph:!0,children:[e.jsx("strong",{children:"Ready to use immediately:"})," Your map is pre-loaded with fire stations, hospitals, hydrants, and recent incidents to provide instant situational awareness."]}),e.jsx(b,{variant:"body1",paragraph:!0,children:e.jsx("strong",{children:"Key Features:"})}),e.jsxs(C,{component:"ul",sx:{pl:2,mb:2},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Live Data Layers:"})," Fire stations, hospitals, hydrants, response zones"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Drawing Tools:"})," Add markers, areas, and annotations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Icon Library:"})," Professional fire & EMS symbols"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Layer Controls:"})," Toggle visibility and adjust transparency"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Export Options:"})," Generate professional maps and reports"]})]}),e.jsx(b,{variant:"body2",color:"text.secondary",sx:{textAlign:"center"},children:"Click layers in the sidebar to explore your operational data →"})]}),e.jsx(it,{sx:{justifyContent:"center",pb:3},children:e.jsx(te,{onClick:t,variant:"contained",size:"large",children:"Start Mapping"})})]})};class Ar{static async exportMap(t,l,o){console.error("[EMERGENCY DEBUG] ExportService.exportMap() STARTED"),console.error("[EMERGENCY DEBUG] Configuration received:",l);const{basic:n}=l;try{if(console.error("[EMERGENCY DEBUG] Starting export process..."),o==null||o(10,"Preparing export..."),!t)throw new Error("Map element not found");switch(o==null||o(20,"Capturing map data..."),console.error("[EMERGENCY DEBUG] Routing to format:",n.format),n.format){case"png":case"jpg":case"tiff":case"webp":console.error("[EMERGENCY DEBUG] Calling exportRasterImage"),await this.exportRasterImage(t,l,o),console.error("[EMERGENCY DEBUG] exportRasterImage completed");break;case"pdf":await this.exportPDF(t,l,o);break;case"svg":await this.exportSVG(t,l,o);break;case"eps":await this.exportEPS(t,l,o);break;case"geojson":case"kml":case"geopdf":await this.exportGISFormat(t,l,o);break;default:throw new Error(`Export format ${n.format} not supported`)}o==null||o(100,"Export completed successfully")}catch(d){throw console.error("Export failed:",d),d}}static async exportRasterImage(t,l,o){console.error("[EMERGENCY DEBUG] exportRasterImage() STARTED");const{basic:n,layout:d}=l;console.error("[EMERGENCY DEBUG] Basic config:",n),console.error("[EMERGENCY DEBUG] Layout config:",d),o==null||o(30,"Capturing map screenshot..."),console.error("[EMERGENCY DEBUG] About to capture map with html2canvas"),console.error("[EMERGENCY DEBUG] Map element:",t),console.error("[EMERGENCY DEBUG] Map element dimensions:",{width:t.offsetWidth,height:t.offsetHeight,innerHTML:t.innerHTML.substring(0,200)+"..."});const{default:h}=await Ot(async()=>{const{default:r}=await import("./html2canvas.esm-CBrSDip1.js");return{default:r}},[]),s=await h(t,{useCORS:!0,allowTaint:!0,scale:n.dpi/96,backgroundColor:"#ffffff"});console.error("[EMERGENCY DEBUG] html2canvas completed, canvas size:",{width:s.width,height:s.height}),console.error("[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout"),o==null||o(60,"Processing layout elements..."),console.log("[Export] Full export configuration:",{basic:l.basic,layout:{customLayout:d.customLayout,selectedTemplate:d.selectedTemplate,elementsCount:d.elements.length,elements:d.elements}});let a=s;if(d.customLayout&&(d.selectedTemplate||d.elements.length>0)){console.log("[Export] Applying custom layout with",d.elements.length,"elements"),console.error("[EMERGENCY DEBUG] About to call applyLayoutTemplate");try{a=await this.applyLayoutTemplate(s,l),console.error("[EMERGENCY DEBUG] applyLayoutTemplate completed successfully"),console.error("[EMERGENCY DEBUG] Returned final canvas dimensions:",a.width,"x",a.height),console.error("[EMERGENCY DEBUG] Layout template applied successfully")}catch(r){throw console.error("[EMERGENCY DEBUG] applyLayoutTemplate FAILED:",r),r}}else console.log("[Export] Using basic layout - no custom elements");o==null||o(80,"Generating final image...");const g=n.format==="jpg"?"jpeg":n.format,p=n.format==="jpg"?.9:void 0;console.error("[EMERGENCY DEBUG] Final canvas before conversion:",{canvasSize:{width:a.width,height:a.height},format:g,quality:p}),console.error("[EMERGENCY DEBUG] Ready to convert canvas to blob"),a.toBlob(r=>{console.error("[EMERGENCY DEBUG] toBlob callback executed, blob size:",r==null?void 0:r.size),r?(console.error("[EMERGENCY DEBUG] Downloading blob with filename:",`${n.title||"fire-map"}.${n.format}`),this.downloadBlob(r,`${n.title||"fire-map"}.${n.format}`)):console.error("[EMERGENCY DEBUG] toBlob failed - blob is null!")},`image/${g}`,p)}static async exportPDF(t,l,o){const{basic:n,advanced:d,layout:h}=l;o==null||o(30,"Capturing map for PDF...");const{default:s}=await Ot(async()=>{const{default:c}=await import("./html2canvas.esm-CBrSDip1.js");return{default:c}},[]),a=await s(t,{useCORS:!0,allowTaint:!0,scale:n.dpi/96});o==null||o(50,"Creating PDF document...");const{width:g,height:p}=this.getPaperDimensions(n.paperSize,n.orientation),r=new Bl({orientation:n.orientation,unit:"mm",format:n.paperSize==="custom"?[d.customWidth,d.customHeight]:n.paperSize});o==null||o(70,"Adding elements to PDF...");const f=a.toDataURL("image/png"),x=g-20,m=a.height*x/a.width;r.addImage(f,"PNG",10,10,x,m),n.includeTitle&&n.title&&(r.setFontSize(16),r.text(n.title,g/2,m+25,{align:"center"})),n.subtitle&&(r.setFontSize(12),r.text(n.subtitle,g/2,m+35,{align:"center"})),h.customLayout&&h.elements.length>0&&await this.addLayoutElementsToPDF(r,h.elements,{width:g,height:p}),o==null||o(90,"Finalizing PDF..."),r.save(`${n.title||"fire-map"}.pdf`)}static async exportSVG(t,l,o){throw o==null||o(50,"Generating SVG..."),new Error("SVG export is not yet implemented. Please use PNG or PDF format.")}static async exportEPS(t,l,o){throw new Error("EPS export is not yet implemented. Please use PNG or PDF format.")}static async exportGISFormat(t,l,o){throw new Error("GIS format export is not yet implemented. Please use PNG or PDF format.")}static async applyLayoutTemplate(t,l){console.error("[EMERGENCY DEBUG] applyLayoutTemplate ENTRY");const{basic:o,layout:n}=l;console.error("[EMERGENCY DEBUG] Getting paper dimensions for:",o.paperSize,o.orientation);const{width:d,height:h}=this.getPaperDimensions(o.paperSize,o.orientation);console.error("[EMERGENCY DEBUG] Paper dimensions:",{width:d,height:h});const s=document.createElement("canvas"),a=s.getContext("2d",{willReadFrequently:!0}),g=d/25.4*o.dpi,p=h/25.4*o.dpi;switch(s.width=g,s.height=p,console.error("[EMERGENCY DEBUG] Layout canvas dimensions:",s.width,"x",s.height),console.error("[EMERGENCY DEBUG] Map canvas dimensions:",t.width,"x",t.height),console.error("[EMERGENCY DEBUG] Layout canvas setup complete"),a.fillStyle="#ffffff",a.fillRect(0,0,g,p),console.error("[EMERGENCY DEBUG] Layout canvas created:",{pixelSize:{width:g,height:p},paperSize:{width:d,height:h},dpi:o.dpi,mapCanvasSize:{width:t.width,height:t.height}}),console.log("[Export] Applying layout template:",n.selectedTemplate),n.selectedTemplate){case"standard":console.log("[Export] Using standard template with custom layout"),await this.applyCustomLayout(a,t,l,g,p);break;case"professional":console.log("[Export] Using professional template"),await this.applyProfessionalTemplate(a,t,l,g,p);break;case"presentation":console.log("[Export] Using presentation template"),await this.applyPresentationTemplate(a,t,l,g,p);break;case"tactical":console.log("[Export] Using tactical template"),await this.applyTacticalTemplate(a,t,l,g,p);break;default:console.log("[Export] Using custom layout with elements"),await this.applyCustomLayout(a,t,l,g,p)}return console.error("[EMERGENCY DEBUG] Layout canvas complete - returning to caller"),s}static async applyProfessionalTemplate(t,l,o,n,d){console.log("[Export] Professional template using custom layout logic"),await this.applyCustomLayout(t,l,o,n,d)}static async applyPresentationTemplate(t,l,o,n,d){console.log("[Export] Presentation template using custom layout logic"),await this.applyCustomLayout(t,l,o,n,d)}static async applyTacticalTemplate(t,l,o,n,d){console.log("[Export] Tactical template using custom layout logic"),await this.applyCustomLayout(t,l,o,n,d)}static async applyCustomLayout(t,l,o,n,d){var g,p,r,f,x,m,c,u,y,k,M,j,D,T,w,L,S,X,ee,ie,De,Be,Se,Me,Le,Te,Ae,ze,Ie,Y,be,oe,pe,fe,nt,at,Ue,kt,Dt,Bt,St;console.error("[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT"),console.error("[EMERGENCY DEBUG] Canvas size:",{width:n,height:d});const{layout:h,basic:s}=o;console.error("[EMERGENCY DEBUG] Configuration received:",{layout:h,basic:s}),console.log("[Export] Layout data:",{elementsCount:h.elements.length,elements:h.elements.map(v=>({type:v.type,visible:v.visible,id:v.id}))});const a=[...h.elements].sort((v,A)=>v.zIndex-A.zIndex);console.log("[Export] Processing",a.length,"layout elements:",a.map(v=>({type:v.type,visible:v.visible})));for(const v of a){if(console.log("[Export] Processing element:",{type:v.type,visible:v.visible,position:{x:v.x,y:v.y},size:{width:v.width,height:v.height},content:v.content}),!v.visible){console.log("[Export] Skipping invisible element:",v.type);continue}const A=v.x/100*n,P=v.y/100*d,z=v.width/100*n,W=v.height/100*d;switch(console.error("[CANVAS DEBUG] Element",v.type,"position:",{x:A,y:P,w:z,h:W},"Canvas:",{width:n,height:d}),console.log("[Export] Rendering element:",v.type,"at",{x:A,y:P,w:z,h:W}),v.type){case"map":console.error("[EMERGENCY DEBUG] Drawing map canvas:",{mapCanvasSize:{width:l.width,height:l.height},drawPosition:{x:A,y:P,w:z,h:W},layoutCanvasSize:{width:t.canvas.width,height:t.canvas.height},elementPosition:{x:v.x,y:v.y,width:v.width,height:v.height}}),console.error("[EMERGENCY DEBUG] Drawing map canvas to layout"),t.drawImage(l,A,P,z,W),console.error("[EMERGENCY DEBUG] Map canvas drawn to layout canvas");break;case"title":console.log("[Export] Title element debug:",{elementContent:v.content,textAlign:(g=v.content)==null?void 0:g.textAlign,elementType:v.type}),t.fillStyle=((p=v.content)==null?void 0:p.color)||"#333333";const Mt=((r=v.content)==null?void 0:r.fontSize)||Math.max(16,z*.05),bi=((f=v.content)==null?void 0:f.fontWeight)||"bold";t.font=`${bi} ${Mt}px ${((x=v.content)==null?void 0:x.fontFamily)||"Arial"}`,t.textAlign=((m=v.content)==null?void 0:m.textAlign)||"left",console.log("[Export] Title canvas textAlign set to:",t.textAlign);let Ne=A;t.textAlign==="center"?Ne=A+z/2:t.textAlign==="right"&&(Ne=A+z),console.log("[Export] Title position:",{originalX:A,adjustedX:Ne,width:z,alignment:t.textAlign}),t.fillText(((c=v.content)==null?void 0:c.text)||s.title||"Untitled Map",Ne,P+Mt);break;case"subtitle":console.log("[Export] Rendering subtitle:",{elementContent:v.content,basicSubtitle:s.subtitle,finalText:((u=v.content)==null?void 0:u.text)||s.subtitle||"Map Subtitle"}),t.fillStyle=((y=v.content)==null?void 0:y.color)||"#666666";const st=((k=v.content)==null?void 0:k.fontSize)||Math.max(12,z*.04),Ci=((M=v.content)==null?void 0:M.fontWeight)||"normal";t.font=`${Ci} ${st}px ${((j=v.content)==null?void 0:j.fontFamily)||"Arial"}`,t.textAlign=((D=v.content)==null?void 0:D.textAlign)||"left";const Lt=((T=v.content)==null?void 0:T.text)||s.subtitle||"Map Subtitle";let Oe=A;t.textAlign==="center"?Oe=A+z/2:t.textAlign==="right"&&(Oe=A+z),console.log("[Export] Drawing subtitle text:",Lt,"at position:",{x:Oe,y:P+st}),console.log("[Export] Subtitle canvas state:",{fillStyle:t.fillStyle,font:t.font,textAlign:t.textAlign,canvasSize:{width:t.canvas.width,height:t.canvas.height},elementBounds:{x:A,y:P,w:z,h:W}}),t.fillText(Lt,Oe,P+st);break;case"text":t.fillStyle=((w=v.content)==null?void 0:w.color)||"#333333";const ct=((L=v.content)==null?void 0:L.fontSize)||Math.max(12,z*.03),ji=((S=v.content)==null?void 0:S.fontWeight)||"normal";t.font=`${ji} ${ct}px ${((X=v.content)==null?void 0:X.fontFamily)||"Arial"}`,t.textAlign=((ee=v.content)==null?void 0:ee.textAlign)||"left";const Ei=(((ie=v.content)==null?void 0:ie.text)||"").split(`
`),Fi=ct*1.2;Ei.forEach((q,K)=>{t.fillText(q,A,P+ct+K*Fi)});break;case"legend":t.strokeStyle=((De=v.content)==null?void 0:De.borderColor)||"#cccccc",t.fillStyle=((Be=v.content)==null?void 0:Be.backgroundColor)||"#ffffff",t.fillRect(A,P,z,W),v.showLegendBorder!==!1&&t.strokeRect(A,P,z,W),t.fillStyle=((Se=v.content)==null?void 0:Se.color)||"#333333";const dt=((Me=v.content)==null?void 0:Me.fontSize)||Math.max(12,z*.04),ki=((Le=v.content)==null?void 0:Le.fontWeight)||"bold";t.font=`${ki} ${dt}px ${((Te=v.content)==null?void 0:Te.fontFamily)||"Arial"}`,t.textAlign=((Ae=v.content)==null?void 0:Ae.textAlign)||"left";const Di=v.legendTitle||((ze=v.content)==null?void 0:ze.text)||"Legend";t.fillText(Di,A+10,P+dt+5);const Tt=v.legendStyle||"standard",At=P+dt+20,Bi=16,Si=18;Tt==="detailed"?[{color:"#ff4444",label:"Fire Stations"},{color:"#4444ff",label:"Hydrants"},{color:"#44ff44",label:"EMS Units"},{color:"#ffaa44",label:"Incidents"}].forEach((K,je)=>{const Ee=At+je*Si;Ee+Bi<P+W-10&&(t.fillStyle=K.color,t.fillRect(A+10,Ee,12,12),t.strokeStyle="#333",t.strokeRect(A+10,Ee,12,12),t.fillStyle="#333333",t.font=`${Math.max(10,z*.025)}px Arial`,t.fillText(K.label,A+28,Ee+10))}):Tt==="compact"&&(t.fillStyle="#333333",t.font=`${Math.max(9,z*.02)}px Arial`,t.fillText("Map elements and symbols",A+10,At));break;case"north-arrow":const ht=v.arrowStyle||"classic",zt=v.rotation||0,Ce=((Ie=v.content)==null?void 0:Ie.color)||"#333333";console.log("[Export] Rendering north arrow:",{arrowStyle:ht,rotation:zt,arrowColor:Ce,elementProperties:v,position:{x:A,y:P,w:z,h:W}}),t.strokeStyle=Ce,t.fillStyle=Ce,t.lineWidth=2;const xt=A+z/2,gt=P+W/2,R=Math.min(z,W)*.3;switch(t.save(),t.translate(xt,gt),t.rotate(zt*Math.PI/180),ht){case"classic":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/3,R/3),t.lineTo(0,0),t.lineTo(R/3,R/3),t.closePath(),t.fill(),t.beginPath(),t.moveTo(0,0),t.lineTo(0,R),t.stroke();break;case"modern":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,R/4),t.lineTo(0,R/8),t.lineTo(R/4,R/4),t.closePath(),t.fill();break;case"simple":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/2,R/2),t.lineTo(R/2,R/2),t.closePath(),t.fill();break;case"compass":t.fillStyle="#cc0000",t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.fillStyle="#ffffff",t.strokeStyle=Ce,t.beginPath(),t.moveTo(0,R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.stroke(),t.fillStyle=Ce,t.beginPath(),t.moveTo(-R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill(),t.beginPath(),t.moveTo(R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill();break}t.restore(),console.log("[Export] North arrow rendered, adding label"),ht!=="compass"&&(t.fillStyle=Ce,t.font=`bold ${Math.max(10,R*.6)}px Arial`,t.textAlign="center",t.fillText("N",xt,gt+R+15),console.log('[Export] North arrow "N" label drawn at:',{x:xt,y:gt+R+15}));break;case"scale-bar":const Mi=v.units||"feet",It=v.scaleStyle||"bar",He=v.divisions||4,Li=((Y=o.mapView)==null?void 0:Y.center)||{latitude:40},Ti=((be=o.mapView)==null?void 0:be.zoom)||10,Ai=this.calculateMetersPerPixel(Ti,Li.latitude),Pt=this.getScaleBarInfo(Ai,Mi,z*.8);t.strokeStyle=((oe=v.content)==null?void 0:oe.color)||"#333333",t.fillStyle=((pe=v.content)==null?void 0:pe.color)||"#333333",t.lineWidth=2;const ne=P+W/2,ue=Pt.pixelLength,ye=A+(z-ue)/2;if(It==="alternating"){const q=ue/He;for(let K=0;K<He;K++){const je=ye+K*q;t.fillStyle=K%2===0?"#333333":"#ffffff",t.fillRect(je,ne-3,q,6),t.strokeStyle="#333333",t.strokeRect(je,ne-3,q,6)}}else{It==="bar"&&(t.fillStyle="#ffffff",t.fillRect(ye,ne-3,ue,6),t.strokeRect(ye,ne-3,ue,6)),t.strokeStyle=((fe=v.content)==null?void 0:fe.color)||"#333333",t.beginPath(),t.moveTo(ye,ne),t.lineTo(ye+ue,ne),t.stroke(),t.beginPath();for(let q=0;q<=He;q++){const K=ye+q*ue/He;t.moveTo(K,ne-5),t.lineTo(K,ne+5)}t.stroke()}t.fillStyle=((nt=v.content)==null?void 0:nt.color)||"#333333",t.font=`${Math.max(10,W*.3)}px Arial`,t.textAlign="center",t.fillText(Pt.label,ye+ue/2,ne+20);break;case"image":if((at=v.content)!=null&&at.imageSrc){const q=((Ue=v.content)==null?void 0:Ue.imageFit)||"cover";await this.drawImageFromSrc(t,v.content.imageSrc,A,P,z,W,q)}else t.strokeStyle="#cccccc",t.fillStyle="#f5f5f5",t.fillRect(A,P,z,W),t.strokeRect(A,P,z,W),t.fillStyle="#999999",t.font=`${Math.max(12,z*.05)}px Arial`,t.textAlign="center",t.fillText("Image",A+z/2,P+W/2);break;case"shape":const Rt=v.strokeColor||((kt=v.content)==null?void 0:kt.borderColor)||"#333333",me=v.fillColor||((Dt=v.content)==null?void 0:Dt.backgroundColor)||"transparent",Wt=v.strokeWidth||((Bt=v.content)==null?void 0:Bt.borderWidth)||1,Gt=v.shapeType||((St=v.content)==null?void 0:St.shapeType)||"rectangle";switch(console.log("[Export] Rendering shape:",{shapeType:Gt,shapeStrokeColor:Rt,shapeFillColor:me,shapeStrokeWidth:Wt,elementProperties:v,position:{x:A,y:P,w:z,h:W}}),t.strokeStyle=Rt,t.fillStyle=me,t.lineWidth=Wt,Gt){case"rectangle":me!=="transparent"&&t.fillRect(A,P,z,W),t.strokeRect(A,P,z,W);break;case"circle":const q=Math.min(z,W)/2,K=A+z/2,je=P+W/2;t.beginPath(),t.arc(K,je,q,0,2*Math.PI),me!=="transparent"&&t.fill(),t.stroke();break;case"ellipse":const Ee=A+z/2,zi=P+W/2,Ii=z/2,Pi=W/2;t.beginPath(),t.ellipse(Ee,zi,Ii,Pi,0,0,2*Math.PI),me!=="transparent"&&t.fill(),t.stroke();break;case"triangle":const Ri=A+z/2,Wi=P,Ut=P+W;t.beginPath(),t.moveTo(Ri,Wi),t.lineTo(A,Ut),t.lineTo(A+z,Ut),t.closePath(),me!=="transparent"&&t.fill(),t.stroke();break;case"line":t.beginPath(),t.moveTo(A,P+W/2),t.lineTo(A+z,P+W/2),t.stroke();break;default:me!=="transparent"&&t.fillRect(A,P,z,W),t.strokeRect(A,P,z,W);break}break;default:console.warn("[Export] Unknown element type:",v.type);break}console.error("[EMERGENCY DEBUG] Element rendered successfully:",v.type),console.log("[Export] Finished rendering element:",v.type)}console.log("[Export] Completed rendering all",a.length,"elements")}static async addLayoutElementsToPDF(t,l,o){var n,d;for(const h of l)switch(h.type){case"text":t.text(((n=h.content)==null?void 0:n.text)||"",h.x,h.y);break;case"image":(d=h.content)!=null&&d.imageSrc&&t.addImage(h.content.imageSrc,"PNG",h.x,h.y,h.width,h.height);break}}static async drawImageFromSrc(t,l,o,n,d,h,s="cover"){try{let a;l instanceof File?a=URL.createObjectURL(l):a=l;const g=new Image;return g.crossOrigin="anonymous",new Promise(p=>{g.onload=()=>{let r=o,f=n,x=d,m=h;const c=g.width/g.height,u=d/h;switch(s){case"contain":c>u?(m=d/c,f=n+(h-m)/2):(x=h*c,r=o+(d-x)/2);break;case"cover":c>u?(x=h*c,r=o-(x-d)/2):(m=d/c,f=n-(m-h)/2);break;case"fill":break;case"scale-down":g.width>d||g.height>h?c>u?(m=d/c,f=n+(h-m)/2):(x=h*c,r=o+(d-x)/2):(x=g.width,m=g.height,r=o+(d-x)/2,f=n+(h-m)/2);break}s==="cover"?(t.save(),t.beginPath(),t.rect(o,n,d,h),t.clip(),t.drawImage(g,r,f,x,m),t.restore()):t.drawImage(g,r,f,x,m),l instanceof File&&URL.revokeObjectURL(a),p()},g.onerror=()=>{console.warn("[Export] Failed to load image:",a),t.strokeStyle="#ccc",t.fillStyle="#f5f5f5",t.fillRect(o,n,d,h),t.strokeRect(o,n,d,h),t.fillStyle="#999",t.font="12px Arial",t.textAlign="center",t.fillText("Failed to load",o+d/2,n+h/2-6),t.fillText("image",o+d/2,n+h/2+6),l instanceof File&&URL.revokeObjectURL(a),p()},g.src=a})}catch(a){console.error("[Export] Error drawing image:",a)}}static getPaperDimensions(t,l){let o,n;switch(t){case"letter":o=215.9,n=279.4;break;case"a4":o=210,n=297;break;case"legal":o=215.9,n=355.6;break;case"tabloid":o=279.4,n=431.8;break;default:o=215.9,n=279.4}return l==="landscape"&&([o,n]=[n,o]),{width:o,height:n}}static calculateMetersPerPixel(t,l){const h=40075017/(256*Math.pow(2,t)),s=l*Math.PI/180;return h*Math.cos(s)}static getScaleBarInfo(t,l,o){const n=t*o;let d,h,s;switch(l){case"feet":s=3.28084,h="ft",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break;case"miles":s=621371e-9,h="mi",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"kilometers":s=.001,h="km",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"meters":default:s=1,h="m",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break}const a=n*s;let g=d[0];for(const x of d)if(x<=a*.8)g=x;else break;const r=g/s/t;let f;if(g<1)f=`${g.toFixed(1)} ${h}`;else if(g>=1e3&&(l==="feet"||l==="meters")){const x=l==="feet"?"mi":"km",c=g/(l==="feet"?5280:1e3);f=`${c.toFixed(c<1?1:0)} ${x}`}else f=`${g} ${h}`;return{pixelLength:Math.round(r),label:f}}static downloadBlob(t,l){const o=URL.createObjectURL(t),n=document.createElement("a");n.href=o,n.download=l,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(o)}}const zr=({isActive:i,configuration:t,disabled:l=!1})=>{const o=Z(),n=t.basic,d=O(c=>c.fireMapPro.export.configuration.layout.elements),[h,s]=B.useState(null),a=c=>u=>{const y=u.target.type==="checkbox"?u.target.checked:u.target.value;o(Ht({[c]:y}))},g=c=>{var y;const u=(y=c.target.files)==null?void 0:y[0];if(u&&u.type.startsWith("image/")){const k=new FileReader;k.onload=M=>{var D;const j=(D=M.target)==null?void 0:D.result;s(j),o(Ht({logo:u}))},k.readAsDataURL(u)}},p=()=>{console.log("[BasicExportTab] Manual apply clicked!",{title:n.title,subtitle:n.subtitle}),console.log("[BasicExportTab] Current layout elements:",d);let c=d.find(y=>y.type==="title"),u=d.find(y=>y.type==="subtitle");if(n.title)if(c)console.log("[BasicExportTab] Updating existing title element"),o(Ze({id:c.id,updates:{content:{...c.content,text:n.title}}}));else{console.log("[BasicExportTab] Creating new title element");const y={type:"title",x:10,y:5,width:80,height:8,zIndex:10,content:{text:n.title,fontSize:18,fontFamily:"Arial",fontWeight:"bold",color:"#333333",textAlign:"center"},visible:!0};o(wt(y))}if(n.subtitle)if(u)console.log("[BasicExportTab] Updating existing subtitle element"),o(Ze({id:u.id,updates:{content:{...u.content,text:n.subtitle}}}));else{console.log("[BasicExportTab] Creating new subtitle element");const y={type:"subtitle",x:10,y:15,width:80,height:6,zIndex:9,content:{text:n.subtitle,fontSize:14,fontFamily:"Arial",fontWeight:"normal",color:"#666666",textAlign:"center"},visible:!0};o(wt(y))}},r=[{value:"png",label:"PNG Image",group:"Raster Formats"},{value:"jpg",label:"JPEG Image",group:"Raster Formats"},{value:"tiff",label:"TIFF Image",group:"Raster Formats"},{value:"webp",label:"WebP Image",group:"Raster Formats"},{value:"pdf",label:"PDF Document",group:"Vector Formats"},{value:"svg",label:"SVG Vector",group:"Vector Formats"},{value:"eps",label:"EPS Vector",group:"Vector Formats"},{value:"geojson",label:"GeoJSON",group:"GIS Formats"},{value:"kml",label:"KML",group:"GIS Formats"},{value:"geopdf",label:"GeoPDF",group:"GIS Formats"}],f=[{value:96,label:"Standard (96 DPI)"},{value:150,label:"Medium (150 DPI)"},{value:300,label:"High (300 DPI)"},{value:450,label:"Very High (450 DPI)"},{value:600,label:"Ultra High (600 DPI)"}],x=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"legal",label:'Legal (8.5" × 14")'},{value:"tabloid",label:'Tabloid (11" × 17")'},{value:"a4",label:"A4 (210mm × 297mm)"},{value:"a3",label:"A3 (297mm × 420mm)"},{value:"a2",label:"A2 (420mm × 594mm)"},{value:"a1",label:"A1 (594mm × 841mm)"},{value:"a0",label:"A0 (841mm × 1189mm)"},{value:"custom",label:"Custom Size"}],m=r.reduce((c,u)=>(c[u.group]||(c[u.group]=[]),c[u.group].push(u),c),{});return i?e.jsx(C,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(E,{container:!0,spacing:3,children:[e.jsx(E,{size:12,children:e.jsx(b,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Map Information"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(N,{fullWidth:!0,label:"Map Title",value:n.title,onChange:a("title"),disabled:l,placeholder:"My Fire Department Map",helperText:"Title that will appear on the exported map"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(N,{fullWidth:!0,label:"Subtitle (optional)",value:n.subtitle,onChange:a("subtitle"),disabled:l,placeholder:"Created by Fire Prevention Division",helperText:"Optional subtitle for additional context"})}),e.jsxs(E,{size:12,children:[e.jsx(te,{variant:"contained",color:"primary",onClick:p,disabled:l||!n.title&&!n.subtitle,sx:{mt:1},children:"Apply Title/Subtitle to Layout"}),e.jsx(b,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Click to add your title and subtitle to the Layout Designer"})]}),e.jsxs(E,{size:12,children:[e.jsx(b,{variant:"subtitle2",gutterBottom:!0,children:"Department Logo"}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsxs(te,{variant:"outlined",component:"label",startIcon:e.jsx(ol,{}),disabled:l,children:["Choose Logo",e.jsx("input",{type:"file",hidden:!0,accept:"image/*",onChange:g})]}),h&&e.jsx(Gl,{src:h,variant:"rounded",sx:{width:60,height:60},children:e.jsx(vi,{})}),!h&&e.jsx(b,{variant:"body2",color:"text.secondary",children:"No logo selected"})]})]}),e.jsx(E,{size:12,children:e.jsx(ge,{sx:{my:1}})}),e.jsx(E,{size:12,children:e.jsx(b,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Export Settings"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Export Format"}),e.jsx(V,{value:n.format,label:"Export Format",onChange:a("format"),children:Object.entries(m).map(([c,u])=>[e.jsx(F,{disabled:!0,sx:{fontWeight:"bold",bgcolor:"action.hover"},children:c},c),...u.map(y=>e.jsx(F,{value:y.value,sx:{pl:3},children:y.label},y.value))])})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Resolution (DPI)"}),e.jsx(V,{value:String(n.dpi),label:"Resolution (DPI)",onChange:a("dpi"),children:f.map(c=>e.jsx(F,{value:c.value,children:c.label},c.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Print Size"}),e.jsx(V,{value:n.paperSize,label:"Print Size",onChange:a("paperSize"),children:x.map(c=>e.jsx(F,{value:c.value,children:c.label},c.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Orientation"}),e.jsxs(V,{value:n.orientation,label:"Orientation",onChange:a("orientation"),children:[e.jsx(F,{value:"portrait",children:"Portrait"}),e.jsx(F,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(E,{size:12,children:e.jsx(ge,{sx:{my:1}})}),e.jsxs(E,{size:12,children:[e.jsx(b,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Layout Elements"}),e.jsx(b,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"Select which elements to include in your exported map"})]}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:n.includeLegend,onChange:a("includeLegend"),disabled:l}),label:"Include Legend"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:n.includeScale,onChange:a("includeScale"),disabled:l}),label:"Include Scale Bar"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:n.includeNorth,onChange:a("includeNorth"),disabled:l}),label:"Include North Arrow"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:n.includeTitle,onChange:a("includeTitle"),disabled:l}),label:"Include Title Banner"})}),e.jsx(E,{size:12,children:e.jsx(Ge,{severity:"info",sx:{mt:2},children:e.jsxs(b,{variant:"body2",children:[e.jsx("strong",{children:"Quick Start:"})," Enter a title, select your preferred format (PNG for images, PDF for documents), and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs."]})})})]})}):null},Ir=({isActive:i,configuration:t,disabled:l=!1})=>{const o=Z(),n=O(se),d=t.advanced,h=r=>f=>{const x=f.target.type==="checkbox"?f.target.checked:f.target.value;o(pt({[r]:x}))},s=r=>f=>{const x=parseFloat(f.target.value)||0;o(pt({[r]:x}))},a=r=>{const f=d.selectedLayers,x=f.includes(r)?f.filter(m=>m!==r):[...f,r];o(pt({selectedLayers:x}))},g=[{value:"srgb",label:"sRGB (Default)"},{value:"adobergb",label:"Adobe RGB"},{value:"cmyk-swop",label:"CMYK SWOP (U.S.)"},{value:"cmyk-fogra",label:"CMYK FOGRA39 (Europe)"},{value:"custom",label:"Custom Profile..."}],p=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"a4",label:"A4 (210mm × 297mm)"}];return i?e.jsx(C,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(E,{container:!0,spacing:3,children:[e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(ot,{color:"primary"}),e.jsx(b,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Color Management"})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Color Mode"}),e.jsxs(V,{value:d.colorMode,label:"Color Mode",onChange:h("colorMode"),children:[e.jsx(F,{value:"rgb",children:"RGB (Screen)"}),e.jsx(F,{value:"cmyk",children:"CMYK (Print)"})]})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"ICC Color Profile"}),e.jsx(V,{value:d.colorProfile,label:"ICC Color Profile",onChange:h("colorProfile"),children:g.map(r=>e.jsx(F,{value:r.value,children:r.label},r.value))})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(b,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Custom Print Size"})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsx(N,{fullWidth:!0,label:"Width",type:"number",value:d.customWidth,onChange:s("customWidth"),disabled:l,inputProps:{min:1,max:100,step:.1}})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsx(N,{fullWidth:!0,label:"Height",type:"number",value:d.customHeight,onChange:s("customHeight"),disabled:l,inputProps:{min:1,max:100,step:.1}})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Units"}),e.jsxs(V,{value:d.printUnits,label:"Units",onChange:h("printUnits"),children:[e.jsx(F,{value:"in",children:"inches"}),e.jsx(F,{value:"cm",children:"centimeters"}),e.jsx(F,{value:"mm",children:"millimeters"})]})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(or,{color:"primary"}),e.jsx(b,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Professional Print Options"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(Q,{variant:"outlined",sx:{p:2},children:e.jsxs(E,{container:!0,spacing:2,children:[e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.addBleed,onChange:h("addBleed"),disabled:l}),label:"Add Bleed (0.125″)"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.showCropMarks,onChange:h("showCropMarks"),disabled:l}),label:"Show Crop Marks"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.includeColorBars,onChange:h("includeColorBars"),disabled:l}),label:"Include Color Calibration Bars"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.addRegistrationMarks,onChange:h("addRegistrationMarks"),disabled:l}),label:"Add Registration Marks"})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.embedICCProfile,onChange:h("embedICCProfile"),disabled:l}),label:"Embed ICC Profile"})})]})})}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(hr,{color:"primary"}),e.jsx(b,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Large Format Printing"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.enableTiledPrinting,onChange:h("enableTiledPrinting"),disabled:l}),label:"Enable Tiled Printing"})}),d.enableTiledPrinting&&e.jsxs(e.Fragment,{children:[e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(H,{fullWidth:!0,disabled:l,children:[e.jsx($,{children:"Tile Size"}),e.jsx(V,{value:d.tileSize,label:"Tile Size",onChange:h("tileSize"),children:p.map(r=>e.jsx(F,{value:r.value,children:r.label},r.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(N,{fullWidth:!0,label:"Overlap",type:"number",value:d.tileOverlap,onChange:s("tileOverlap"),disabled:l,inputProps:{min:0,max:2,step:.25},InputProps:{endAdornment:e.jsx(mi,{position:"end",children:"inches"})}})})]}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(We,{color:"primary"}),e.jsx(b,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layer Controls"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.exportAllLayers,onChange:h("exportAllLayers"),disabled:l}),label:"Export All Visible Layers"})}),!d.exportAllLayers&&n.length>0&&e.jsxs(E,{size:{xs:12},children:[e.jsx(b,{variant:"subtitle2",gutterBottom:!0,children:"Select Layers to Export:"}),e.jsx(Q,{variant:"outlined",sx:{maxHeight:200,overflow:"auto"},children:e.jsx(ui,{dense:!0,children:n.map(r=>e.jsxs(yi,{component:"button",disabled:l,children:[e.jsx(Xe,{primary:r.name,secondary:`${r.features.length} features`}),e.jsx(ml,{children:e.jsx(J,{checked:d.selectedLayers.includes(r.id),onChange:()=>a(r.id),disabled:l})})]},r.id))})})]}),e.jsx(E,{size:{xs:12},children:e.jsx(Ge,{severity:"info",sx:{mt:2},children:e.jsxs(b,{variant:"body2",children:[e.jsx("strong",{children:"Professional Printing:"})," Use CMYK color mode and appropriate ICC profiles for commercial printing. Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages."]})})})]})}):null},Pr=({configuration:i,disabled:t=!1})=>{const l=Z(),o=O(a=>a.fireMapPro.export.configuration.basic),n=[{type:"map",label:"Map Frame",icon:e.jsx(vt,{})},{type:"title",label:"Title",icon:e.jsx(cr,{})},{type:"subtitle",label:"Subtitle",icon:e.jsx(Xt,{})},{type:"legend",label:"Legend",icon:e.jsx(Jl,{})},{type:"north-arrow",label:"North Arrow",icon:e.jsx(ir,{})},{type:"scale-bar",label:"Scale Bar",icon:e.jsx(sr,{})},{type:"text",label:"Text Box",icon:e.jsx(Xt,{})},{type:"image",label:"Image",icon:e.jsx(vi,{})},{type:"shape",label:"Shape",icon:e.jsx(_l,{})}],d=[{id:"standard",name:"Standard",description:"Basic layout with map and legend"},{id:"professional",name:"Professional",description:"Corporate layout with sidebar"},{id:"presentation",name:"Presentation",description:"Landscape format for slides"},{id:"tactical",name:"Tactical",description:"Emergency response layout"}],h=(a,g)=>{a.dataTransfer.setData("application/json",JSON.stringify({type:"layout-element",elementType:g})),a.dataTransfer.effectAllowed="copy"},s=a=>{t||(console.log("[LayoutToolbox] Template clicked:",a),console.log("[LayoutToolbox] Basic config:",o),l(Xi(a)))};return e.jsxs(C,{sx:{p:2},children:[e.jsx(b,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Elements"}),e.jsx(E,{container:!0,spacing:1,sx:{mb:3},children:n.map(a=>e.jsx(E,{size:{xs:6},children:e.jsxs(Q,{sx:{p:1,textAlign:"center",cursor:t?"default":"grab",border:1,borderColor:"divider",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:"action.hover",transform:"translateY(-2px)",boxShadow:1},"&:active":t?{}:{cursor:"grabbing",opacity:.7}},draggable:!t,onDragStart:g=>h(g,a.type),children:[e.jsx(C,{sx:{color:"primary.main",mb:.5},children:a.icon}),e.jsx(b,{variant:"caption",display:"block",children:a.label})]})},a.type))}),e.jsx(ge,{sx:{my:2}}),e.jsx(b,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Templates"}),e.jsx(C,{sx:{display:"flex",flexDirection:"column",gap:1},children:d.map(a=>e.jsxs(Q,{sx:{p:1.5,cursor:t?"default":"pointer",border:1,borderColor:i.layout.selectedTemplate===a.id?"primary.main":"divider",bgcolor:i.layout.selectedTemplate===a.id?"primary.50":"background.paper",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:i.layout.selectedTemplate===a.id?"primary.100":"action.hover",transform:"translateY(-1px)",boxShadow:1}},onClick:()=>s(a.id),children:[e.jsx(b,{variant:"subtitle2",sx:{fontWeight:600},children:a.name}),e.jsx(b,{variant:"caption",color:"text.secondary",children:a.description})]},a.id))}),e.jsx(C,{sx:{mt:3,p:1,bgcolor:"info.50",borderRadius:1},children:e.jsx(b,{variant:"caption",color:"info.main",children:"💡 Drag elements to the canvas or click a template to get started."})})]})},Rr=({width:i=800,height:t=600})=>{const l=Z(),o=B.useRef(null),{layoutElements:n,selectedElementId:d,paperSize:h}=O(j=>({layoutElements:j.fireMapPro.export.configuration.layout.elements,selectedElementId:j.fireMapPro.export.configuration.layout.selectedElementId,paperSize:j.fireMapPro.export.configuration.basic.paperSize})),s={letter:{width:8.5,height:11},legal:{width:8.5,height:14},tabloid:{width:11,height:17},a4:{width:8.27,height:11.69},a3:{width:11.69,height:16.54},custom:{width:8.5,height:11}},a=s[h]||s.letter,g=a.width/a.height,p=Math.min(t,i/g),r=p*g,f=(j,D)=>{D.stopPropagation(),l($t(j))},x=()=>{l($t(null))},m=(j,D,T)=>{const w=n.find(X=>X.id===j);if(!w)return;const L=Math.max(0,Math.min(100,w.x+D/r*100)),S=Math.max(0,Math.min(100,w.y+T/p*100));l(Ze({id:j,updates:{x:L,y:S}}))},c=j=>{j.preventDefault(),j.dataTransfer.dropEffect="copy"},u=j=>{var D;j.preventDefault();try{const T=j.dataTransfer.getData("application/json");if(!T)return;const w=JSON.parse(T);if(w.type!=="layout-element")return;const L=(D=o.current)==null?void 0:D.getBoundingClientRect();if(!L)return;const S=(j.clientX-L.left)/L.width*100,X=(j.clientY-L.top)/L.height*100,ee={type:w.elementType,x:Math.max(0,Math.min(95,S-5)),y:Math.max(0,Math.min(95,X-5)),width:20,height:15,zIndex:n.length+1,visible:!0,content:y(w.elementType)};l(wt(ee))}catch(T){console.error("Error handling drop:",T)}},y=j=>{switch(j){case"title":return{text:"Map Title",fontSize:18,textAlign:"center",color:"#333333",fontFamily:"Arial"};case"subtitle":return{text:"Map Subtitle",fontSize:14,textAlign:"center",color:"#666666",fontFamily:"Arial"};case"text":return{text:"Text Element",fontSize:12,textAlign:"left",color:"#333333",fontFamily:"Arial"};case"legend":return{text:"Legend",backgroundColor:"#ffffff",color:"#333333"};case"image":return{text:"Image Placeholder",backgroundColor:"#f5f5f5"};case"shape":return{backgroundColor:"transparent",borderColor:"#333333"};default:return{}}},k=j=>{switch(j){case"map":return"🗺️";case"title":return"📝";case"subtitle":return"📄";case"legend":return"📋";case"north-arrow":return"🧭";case"scale-bar":return"📏";case"text":return"💬";case"image":return"🖼️";case"shape":return"⬜";default:return"📦"}},M=j=>{switch(j){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(C,{sx:{display:"flex",flexDirection:"column",alignItems:"center",padding:2,height:"100%",backgroundColor:"#f5f5f5"},children:[e.jsxs(Q,{ref:o,onClick:x,onDragOver:c,onDrop:u,sx:{position:"relative",width:r,height:p,backgroundColor:"white",border:"2px solid #ddd",boxShadow:"0 4px 8px rgba(0,0,0,0.1)",overflow:"hidden",cursor:"default"},children:[e.jsxs(C,{sx:{position:"absolute",top:-25,left:0,fontSize:"12px",color:"#666",fontWeight:"bold"},children:[h.toUpperCase()," (",a.width,'" × ',a.height,'")']}),e.jsxs("svg",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.1},children:[e.jsx("defs",{children:e.jsx("pattern",{id:"grid",width:r/10,height:p/10,patternUnits:"userSpaceOnUse",children:e.jsx("path",{d:`M ${r/10} 0 L 0 0 0 ${p/10}`,fill:"none",stroke:"#666",strokeWidth:"1"})})}),e.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"})]}),n.map(j=>e.jsx(Wr,{element:j,isSelected:j.id===d,canvasWidth:r,canvasHeight:p,onElementClick:f,onElementDrag:m,getElementIcon:k,getElementLabel:M},j.id)),n.length===0&&e.jsxs(C,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",color:"#999"},children:[e.jsx(C,{sx:{fontSize:"48px",marginBottom:1},children:"📄"}),e.jsx(C,{sx:{fontSize:"14px"},children:"Drag elements from the toolbox to create your layout"})]})]}),e.jsxs(C,{sx:{marginTop:1,fontSize:"12px",color:"#666",textAlign:"center"},children:["Canvas: ",Math.round(r),"×",Math.round(p),"px | Zoom: ",Math.round(r/400*100),"% | Elements: ",n.length]})]})},Wr=({element:i,isSelected:t,canvasWidth:l,canvasHeight:o,onElementClick:n,onElementDrag:d,getElementIcon:h,getElementLabel:s})=>{var x,m,c,u,y,k,M,j;const a=B.useRef(null),g=B.useRef(!1),p=B.useRef({x:0,y:0}),r=D=>{D.preventDefault(),D.stopPropagation(),g.current=!0,p.current={x:D.clientX,y:D.clientY};const T=L=>{if(!g.current)return;const S=L.clientX-p.current.x,X=L.clientY-p.current.y;d(i.id,S,X),p.current={x:L.clientX,y:L.clientY}},w=()=>{g.current=!1,document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",w)};document.addEventListener("mousemove",T),document.addEventListener("mouseup",w),n(i.id,D)};if(!i.visible)return null;const f={position:"absolute",left:`${i.x}%`,top:`${i.y}%`,width:`${i.width}%`,height:`${i.height}%`,zIndex:i.zIndex,border:t?"2px solid #1976d2":"1px solid #ddd",backgroundColor:i.type==="map"?"#e3f2fd":"rgba(255,255,255,0.9)",cursor:"move",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:"#666",userSelect:"none",boxSizing:"border-box"};return e.jsxs("div",{ref:a,style:f,onMouseDown:r,onClick:D=>n(i.id,D),children:[e.jsx(C,{sx:{textAlign:"center",overflow:"hidden",padding:.5},children:(i.type==="title"||i.type==="subtitle"||i.type==="text"||i.type==="legend")&&((x=i.content)!=null&&x.text)?e.jsx(C,{sx:{fontSize:`${Math.max(8,Math.min(16,(((m=i.content)==null?void 0:m.fontSize)||12)*.8))}px`,fontFamily:((c=i.content)==null?void 0:c.fontFamily)||"Arial",color:((u=i.content)==null?void 0:u.color)||"#333",textAlign:((y=i.content)==null?void 0:y.textAlign)||(i.type==="title"?"center":"left"),fontWeight:i.type==="title"?"bold":"normal",lineHeight:1.2,wordBreak:"break-word",overflow:"hidden",textOverflow:"ellipsis",backgroundColor:i.type==="legend"?((k=i.content)==null?void 0:k.backgroundColor)||"#ffffff":"transparent",border:i.type==="legend"?"1px solid #ddd":"none",borderRadius:i.type==="legend"?"2px":"0",padding:i.type==="legend"?"2px 4px":"0",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:((M=i.content)==null?void 0:M.textAlign)==="center"?"center":((j=i.content)==null?void 0:j.textAlign)==="right"?"flex-end":"flex-start"},children:i.content.text}):e.jsxs(e.Fragment,{children:[e.jsx(C,{sx:{fontSize:"16px",marginBottom:.5},children:h(i.type)}),e.jsx(C,{sx:{fontSize:"10px",lineHeight:1},children:s(i.type)})]})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",top:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"nw-resize"}}),e.jsx("div",{style:{position:"absolute",top:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"ne-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"sw-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"se-resize"}})]})]})},Gr=()=>{var h,s,a,g,p,r,f,x,m;const i=Z(),{selectedElement:t,elements:l}=O(c=>{const u=c.fireMapPro.export.configuration.layout.selectedElementId,y=c.fireMapPro.export.configuration.layout.elements;return{selectedElement:u?y.find(k=>k.id===u):null,elements:y}});if(!t)return e.jsxs(C,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa"},children:[e.jsx(b,{variant:"h6",gutterBottom:!0,sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsxs(C,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",color:"#999",textAlign:"center"},children:[e.jsx(C,{sx:{fontSize:"32px",marginBottom:1},children:"🎛️"}),e.jsx(b,{variant:"body2",sx:{fontSize:"0.85rem"},children:"Select an element to edit its properties"})]})]});const o=(c,u)=>{i(Ze({id:t.id,updates:{[c]:u}}))},n=()=>{i(Zi(t.id))},d=c=>{switch(c){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(C,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa",overflowY:"auto"},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1},children:[e.jsx(b,{variant:"h6",sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsx(te,{size:"small",color:"error",startIcon:e.jsx(Ft,{}),onClick:n,sx:{minWidth:"auto",px:1},children:"Del"})]}),e.jsx(b,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:d(t.type)}),e.jsxs(ce,{defaultExpanded:!0,sx:{mb:1},children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(b,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:"Position & Size"})}),e.jsxs(he,{sx:{pt:1},children:[e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(N,{label:"X",type:"number",size:"small",value:Math.round(t.x*100)/100,onChange:c=>o("x",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(N,{label:"Y",type:"number",size:"small",value:Math.round(t.y*100)/100,onChange:c=>o("y",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(N,{label:"Width",type:"number",size:"small",value:Math.round(t.width*100)/100,onChange:c=>o("width",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(N,{label:"Height",type:"number",size:"small",value:Math.round(t.height*100)/100,onChange:c=>o("height",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{marginBottom:1},children:[e.jsx(b,{gutterBottom:!0,children:"Layer Order"}),e.jsx(Ke,{value:t.zIndex,onChange:(c,u)=>o("zIndex",u),min:1,max:l.length+5,step:1,marks:!0,valueLabelDisplay:"on"})]}),e.jsx(_,{control:e.jsx(J,{checked:t.visible,onChange:c=>o("visible",c.target.checked)}),label:"Visible"})]})]}),(t.type==="title"||t.type==="subtitle"||t.type==="text"||t.type==="legend")&&e.jsxs(ce,{sx:{mb:1},children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(b,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:t.type==="legend"?"Legend Content":"Text Content"})}),e.jsxs(he,{sx:{pt:1},children:[e.jsx(N,{label:t.type==="legend"?"Legend Title":"Text",multiline:!0,rows:2,fullWidth:!0,size:"small",value:((h=t.content)==null?void 0:h.text)||"",onChange:c=>o("content",{...t.content,text:c.target.value}),sx:{marginBottom:1,"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,marginBottom:1},children:[e.jsxs(H,{size:"small",children:[e.jsx($,{sx:{fontSize:"0.85rem"},children:"Font"}),e.jsxs(V,{value:((s=t.content)==null?void 0:s.fontFamily)||"Arial",onChange:c=>o("content",{...t.content,fontFamily:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"Arial",sx:{fontSize:"0.85rem"},children:"Arial"}),e.jsx(F,{value:"Times New Roman",sx:{fontSize:"0.85rem"},children:"Times"}),e.jsx(F,{value:"Helvetica",sx:{fontSize:"0.85rem"},children:"Helvetica"}),e.jsx(F,{value:"Georgia",sx:{fontSize:"0.85rem"},children:"Georgia"})]})]}),e.jsx(N,{label:"Size",type:"number",size:"small",value:((a=t.content)==null?void 0:a.fontSize)||12,onChange:c=>o("content",{...t.content,fontSize:parseInt(c.target.value)||12}),inputProps:{min:6,max:72},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1},children:[e.jsxs(H,{size:"small",children:[e.jsx($,{sx:{fontSize:"0.85rem"},children:"Align"}),e.jsxs(V,{value:((g=t.content)==null?void 0:g.textAlign)||"left",onChange:c=>o("content",{...t.content,textAlign:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"left",sx:{fontSize:"0.85rem"},children:"Left"}),e.jsx(F,{value:"center",sx:{fontSize:"0.85rem"},children:"Center"}),e.jsx(F,{value:"right",sx:{fontSize:"0.85rem"},children:"Right"})]})]}),e.jsx(N,{label:"Color",type:"color",size:"small",value:((p=t.content)==null?void 0:p.color)||"#000000",onChange:c=>o("content",{...t.content,color:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem",p:.5}}})]})]})]}),t.type==="map"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"Map Settings"})}),e.jsxs(he,{children:[e.jsx(_,{control:e.jsx(J,{checked:t.showBorder!==!1,onChange:c=>o("showBorder",c.target.checked)}),label:"Show Border",sx:{marginBottom:1}}),e.jsx(N,{label:"Border Width (px)",type:"number",size:"small",fullWidth:!0,value:t.borderWidth||1,onChange:c=>o("borderWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:10},sx:{marginBottom:2}}),e.jsx(N,{label:"Border Color",type:"color",size:"small",fullWidth:!0,value:t.borderColor||"#000000",onChange:c=>o("borderColor",c.target.value)})]})]}),t.type==="legend"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"Legend Settings"})}),e.jsxs(he,{children:[e.jsx(N,{label:"Title",fullWidth:!0,size:"small",value:t.legendTitle||"Legend",onChange:c=>o("legendTitle",c.target.value),sx:{marginBottom:2}}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{children:"Style"}),e.jsxs(V,{value:t.legendStyle||"standard",onChange:c=>o("legendStyle",c.target.value),children:[e.jsx(F,{value:"standard",children:"Standard"}),e.jsx(F,{value:"compact",children:"Compact"}),e.jsx(F,{value:"detailed",children:"Detailed"})]})]}),e.jsx(_,{control:e.jsx(J,{checked:t.showLegendBorder!==!1,onChange:c=>o("showLegendBorder",c.target.checked)}),label:"Show Border"})]})]}),t.type==="north-arrow"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"North Arrow Settings"})}),e.jsxs(he,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{children:"Style"}),e.jsxs(V,{value:t.arrowStyle||"classic",onChange:c=>o("arrowStyle",c.target.value),children:[e.jsx(F,{value:"classic",children:"Classic"}),e.jsx(F,{value:"modern",children:"Modern"}),e.jsx(F,{value:"simple",children:"Simple"}),e.jsx(F,{value:"compass",children:"Compass"})]})]}),e.jsx(N,{label:"Rotation (degrees)",type:"number",size:"small",fullWidth:!0,value:t.rotation||0,onChange:c=>o("rotation",parseInt(c.target.value)||0),inputProps:{min:0,max:360}})]})]}),t.type==="scale-bar"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"Scale Bar Settings"})}),e.jsxs(he,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{children:"Units"}),e.jsxs(V,{value:t.units||"feet",onChange:c=>o("units",c.target.value),children:[e.jsx(F,{value:"feet",children:"Feet"}),e.jsx(F,{value:"meters",children:"Meters"}),e.jsx(F,{value:"miles",children:"Miles"}),e.jsx(F,{value:"kilometers",children:"Kilometers"})]})]}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{children:"Style"}),e.jsxs(V,{value:t.scaleStyle||"bar",onChange:c=>o("scaleStyle",c.target.value),children:[e.jsx(F,{value:"bar",children:"Bar"}),e.jsx(F,{value:"line",children:"Line"}),e.jsx(F,{value:"alternating",children:"Alternating"})]})]}),e.jsx(N,{label:"Number of Divisions",type:"number",size:"small",fullWidth:!0,value:t.divisions||4,onChange:c=>o("divisions",parseInt(c.target.value)||4),inputProps:{min:2,max:10}})]})]}),t.type==="image"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"Image Settings"})}),e.jsxs(he,{children:[e.jsxs(C,{sx:{marginBottom:2},children:[e.jsx(b,{variant:"body2",sx:{mb:1,fontSize:"0.85rem",color:"#666"},children:"Upload Image File"}),e.jsx("input",{type:"file",accept:"image/*",onChange:c=>{var y;const u=(y=c.target.files)==null?void 0:y[0];u&&o("content",{...t.content,imageSrc:u})},style:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.85rem"}}),((r=t.content)==null?void 0:r.imageSrc)&&t.content.imageSrc instanceof File&&e.jsxs(b,{variant:"caption",sx:{mt:.5,display:"block",color:"#666"},children:["Selected: ",t.content.imageSrc.name]})]}),e.jsx(ge,{sx:{my:2}}),e.jsx(N,{label:"Image URL (alternative to file upload)",fullWidth:!0,size:"small",value:typeof((f=t.content)==null?void 0:f.imageSrc)=="string"?t.content.imageSrc:"",onChange:c=>o("content",{...t.content,imageSrc:c.target.value}),sx:{marginBottom:2,"& .MuiInputBase-input":{fontSize:"0.85rem"}},placeholder:"https://example.com/image.jpg"}),e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{sx:{fontSize:"0.85rem"},children:"Image Fit"}),e.jsxs(V,{value:((x=t.content)==null?void 0:x.imageFit)||"cover",onChange:c=>o("content",{...t.content,imageFit:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"cover",sx:{fontSize:"0.85rem"},children:"Cover"}),e.jsx(F,{value:"contain",sx:{fontSize:"0.85rem"},children:"Contain"}),e.jsx(F,{value:"fill",sx:{fontSize:"0.85rem"},children:"Fill"}),e.jsx(F,{value:"scale-down",sx:{fontSize:"0.85rem"},children:"Scale Down"})]})]}),e.jsx(N,{label:"Alt Text",fullWidth:!0,size:"small",value:((m=t.content)==null?void 0:m.altText)||"",onChange:c=>o("content",{...t.content,altText:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]})]}),t.type==="shape"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(b,{variant:"subtitle1",children:"Shape Settings"})}),e.jsxs(he,{children:[e.jsxs(H,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx($,{children:"Shape Type"}),e.jsxs(V,{value:t.shapeType||"rectangle",onChange:c=>o("shapeType",c.target.value),children:[e.jsx(F,{value:"rectangle",children:"Rectangle"}),e.jsx(F,{value:"circle",children:"Circle"}),e.jsx(F,{value:"ellipse",children:"Ellipse"}),e.jsx(F,{value:"triangle",children:"Triangle"}),e.jsx(F,{value:"line",children:"Line"})]})]}),e.jsxs(C,{sx:{display:"flex",gap:1,marginBottom:2},children:[e.jsx(N,{label:"Fill Color",type:"color",size:"small",value:t.fillColor||"#ffffff",onChange:c=>o("fillColor",c.target.value),sx:{flex:1}}),e.jsx(N,{label:"Stroke Color",type:"color",size:"small",value:t.strokeColor||"#000000",onChange:c=>o("strokeColor",c.target.value),sx:{flex:1}})]}),e.jsx(N,{label:"Stroke Width (px)",type:"number",size:"small",fullWidth:!0,value:t.strokeWidth||1,onChange:c=>o("strokeWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:20}})]})]}),e.jsx(ge,{sx:{margin:"16px 0"}}),e.jsxs(C,{sx:{fontSize:"12px",color:"#666"},children:[e.jsxs(b,{variant:"caption",display:"block",children:["Element ID: ",t.id]}),e.jsxs(b,{variant:"caption",display:"block",children:["Type: ",t.type]}),e.jsxs(b,{variant:"caption",display:"block",children:["Position: ",Math.round(t.x),"%, ",Math.round(t.y),"%"]}),e.jsxs(b,{variant:"caption",display:"block",children:["Size: ",Math.round(t.width),"% × ",Math.round(t.height),"%"]})]})]})},Ur=({isActive:i,configuration:t,disabled:l=!1})=>{const o=Z(),n=t.layout,d=h=>{const s=h.target.value;o(qi({pageOrientation:s,canvasWidth:s==="landscape"?520:400,canvasHeight:s==="landscape"?400:520}))};return i?e.jsxs(C,{sx:{height:"60vh",display:"flex",flexDirection:"column"},children:[e.jsxs(C,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Zl,{color:"primary"}),e.jsx(b,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layout Designer"})]}),e.jsxs(E,{container:!0,spacing:2,alignItems:"center",children:[e.jsx(E,{size:{xs:12,md:4},children:e.jsxs(H,{fullWidth:!0,size:"small",disabled:l,children:[e.jsx($,{children:"Page Orientation"}),e.jsxs(V,{value:n.pageOrientation,label:"Page Orientation",onChange:d,children:[e.jsx(F,{value:"portrait",children:"Portrait"}),e.jsx(F,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(E,{size:{xs:12,md:8},children:e.jsx(Ge,{severity:"info",sx:{py:.5},children:e.jsx(b,{variant:"caption",children:"Drag elements from the toolbox to the canvas. Select templates for quick layouts."})})})]})]}),e.jsxs(C,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[e.jsx(C,{sx:{width:200,borderRight:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:2},children:e.jsx(Pr,{configuration:t,disabled:l})}),e.jsx(C,{sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",bgcolor:"grey.100",p:2,overflow:"auto"},children:e.jsx(Rr,{})}),e.jsx(C,{sx:{width:280,borderLeft:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:1},children:e.jsx(Gr,{})})]})]}):null},mt=({children:i,value:t,index:l,...o})=>e.jsx("div",{role:"tabpanel",hidden:t!==l,id:`export-tabpanel-${l}`,"aria-labelledby":`export-tab-${l}`,...o,children:t===l&&e.jsx(C,{sx:{p:0},children:i})}),Nr=()=>{const i=Z(),t=fi(),l=pi(t.breakpoints.down("md")),o=O(Ki),n=O(rt),{open:d,activeTab:h,configuration:s,process:a}=o,g={basic:0,advanced:1,"layout-designer":2},p={0:"basic",1:"advanced",2:"layout-designer"},r=g[h],f=()=>{a.isExporting||i(Vt())},x=(c,u)=>{a.isExporting||i(Ji(p[u]))},m=async()=>{try{i(Ve({isExporting:!0,progress:0,currentStep:"Preparing export...",error:null}));const c=document.querySelector(".leaflet-container");if(!c)throw new Error("Map element not found");const u={...s,layout:{...s.layout,elements:o.configuration.layout.elements,selectedElementId:o.configuration.layout.selectedElementId,customLayout:o.configuration.layout.customLayout},mapView:{center:n.view.center,zoom:n.view.zoom}};await Ar.exportMap(c,u,(y,k)=>{i(Ve({isExporting:!0,progress:y,currentStep:k,error:null}))}),i(Ve({isExporting:!1,progress:100,currentStep:"Export completed",success:!0})),setTimeout(()=>{i(Vt())},1500)}catch(c){i(Ve({isExporting:!1,error:c instanceof Error?c.message:"Export failed",success:!1}))}};return e.jsxs(Je,{open:d,onClose:f,maxWidth:"lg",fullWidth:!0,fullScreen:l,PaperProps:{sx:{minHeight:"80vh",maxHeight:"90vh",bgcolor:"background.default"}},children:[e.jsxs(et,{sx:{bgcolor:"primary.main",color:"primary.contrastText",p:2,pb:0},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(ke,{}),e.jsx(b,{variant:"h6",component:"div",children:"Export Options"})]}),e.jsx(le,{edge:"end",color:"inherit",onClick:f,disabled:a.isExporting,"aria-label":"close",children:e.jsx(nl,{})})]}),e.jsxs(Et,{value:r,onChange:x,textColor:"inherit",indicatorColor:"secondary",variant:"fullWidth",sx:{"& .MuiTab-root":{color:"rgba(255, 255, 255, 0.7)","&.Mui-selected":{color:"white",fontWeight:600},"&:hover":{color:"white",backgroundColor:"rgba(255, 255, 255, 0.1)"}},"& .MuiTabs-indicator":{backgroundColor:"secondary.main"}},children:[e.jsx(Re,{label:"Basic",id:"export-tab-0","aria-controls":"export-tabpanel-0",disabled:a.isExporting}),e.jsx(Re,{label:"Advanced",id:"export-tab-1","aria-controls":"export-tabpanel-1",disabled:a.isExporting}),e.jsx(Re,{label:"Layout Designer",id:"export-tab-2","aria-controls":"export-tabpanel-2",disabled:a.isExporting})]})]}),e.jsxs(tt,{sx:{p:0,overflow:"hidden"},children:[e.jsx(mt,{value:r,index:0,children:e.jsx(zr,{isActive:h==="basic",configuration:s,disabled:a.isExporting})}),e.jsx(mt,{value:r,index:1,children:e.jsx(Ir,{isActive:h==="advanced",configuration:s,disabled:a.isExporting})}),e.jsx(mt,{value:r,index:2,children:e.jsx(Ur,{isActive:h==="layout-designer",configuration:s,disabled:a.isExporting})})]}),e.jsxs(it,{sx:{p:2,borderTop:1,borderColor:"divider"},children:[e.jsx(te,{onClick:f,disabled:a.isExporting,color:"inherit",children:"Cancel"}),e.jsx(te,{onClick:m,disabled:a.isExporting,variant:"contained",startIcon:a.isExporting?null:e.jsx(ke,{}),sx:{minWidth:120},children:a.isExporting?`${a.progress}%`:"Export Map"})]}),a.isExporting&&e.jsx(C,{sx:{position:"absolute",bottom:80,left:16,right:16,bgcolor:"info.main",color:"info.contrastText",p:1,borderRadius:1,display:"flex",alignItems:"center",gap:1},children:e.jsx(b,{variant:"body2",children:a.currentStep})})]})},Or=()=>{const i=B.useRef(null),t=B.useRef(null),l=B.useRef(Math.random().toString(36)),o=B.useRef(0),[n,d]=B.useState([]),h=s=>{console.log(`[SimpleMapTest] ${s}`),d(a=>[...a,`${new Date().toISOString()}: ${s}`])};return B.useEffect(()=>{if(o.current++,h(`Component render #${o.current}`),!i.current){h("❌ No map container div");return}if(t.current){h(`⚠️ Map already exists (ID: ${l.current})`);return}l.current=Math.random().toString(36),h(`🗺️ Creating map with ID: ${l.current}`);try{const s=G.map(i.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0});G.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(s);const a=g=>{h(`✅ Click event works at ${g.latlng.lat.toFixed(4)}, ${g.latlng.lng.toFixed(4)}`)};return s.on("click",a),setTimeout(()=>{try{const g=s.getCenter(),p=s.latLngToContainerPoint(g),r=s.containerPointToLatLng(p);h(`✅ Coordinate conversion works: ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`)}catch(g){h(`❌ Coordinate conversion failed: ${g instanceof Error?g.message:String(g)}`)}},1e3),t.current=s,h(`✅ Map created successfully (ID: ${l.current})`),()=>{h(`🧹 Cleanup called for map ID: ${l.current}`),t.current&&(t.current.remove(),t.current=null,h(`✅ Map cleaned up (ID: ${l.current})`))}}catch(s){h(`❌ Map creation failed: ${s instanceof Error?s.message:String(s)}`)}},[]),e.jsxs("div",{style:{width:"100vw",height:"100vh",position:"fixed",top:0,left:0,zIndex:9999,background:"white"},children:[e.jsxs("div",{style:{position:"absolute",top:10,left:10,zIndex:1e4,background:"white",padding:"10px",maxHeight:"300px",overflow:"auto",border:"1px solid #ccc"},children:[e.jsx("h3",{children:"Simple Map Test Results"}),e.jsx("div",{style:{fontSize:"12px",fontFamily:"monospace"},children:n.map((s,a)=>e.jsx("div",{children:s},a))}),e.jsx("button",{onClick:()=>window.location.reload(),children:"Reload Test"})]}),e.jsx("div",{ref:i,style:{width:"100%",height:"100%"}})]})},Qe=320,lo=({initialMapState:i,mode:t="create",onSave:l,onExport:o})=>{const n=Z(),d=fi(),h=pi(d.breakpoints.down("md"));B.useEffect(()=>{document.title="FireEMS Fire Map Pro"},[]);const s=O(rt),a=O(xi),g=O(el),p=O(tl),r=B.useRef(null),[f,x]=jt.useState(!1);B.useEffect(()=>{if(i)console.log("Loading initial map state:",i),n(Yt({...s,...i}));else{console.log("Loading default fire/EMS data:",ti);const j={view:{center:{latitude:39.8283,longitude:-98.5795},zoom:6},layers:ti,baseMaps:s.baseMaps,activeBaseMap:s.activeBaseMap,selectedFeatures:[],drawingMode:null,drawingOptions:s.drawingOptions,exportConfig:s.exportConfig,measurementUnits:s.measurementUnits,showCoordinates:s.showCoordinates,showGrid:s.showGrid};n(Yt(j))}},[]),B.useEffect(()=>{const j=()=>{try{const T=sessionStorage.getItem("fireEmsExportedData");if(T){const w=JSON.parse(T);if(console.log("Found exported data for Fire Map Pro:",w),w.toolId==="fire-map-pro"&&w.data&&w.data.length>0)if(console.log("🔧 FIRE MAP PRO - Processing exported data:",{toolId:w.toolId,dataLength:w.data.length,sampleDataItem:w.data[0]}),w.data[0]&&typeof w.data[0]=="object"&&w.data[0].hasOwnProperty("type")&&w.data[0].hasOwnProperty("coordinates")){console.log("✅ FIRE MAP PRO - Data is already transformed features, using directly");const S=w.data,X={id:"imported-incidents",name:`Imported Incidents (${S.length})`,visible:!0,opacity:1,zIndex:1e3,type:"feature",features:S,style:{defaultStyle:{color:"#dc2626",fillColor:"#dc2626",fillOpacity:.7,weight:2,opacity:1}},metadata:{description:`Incident data imported from Data Formatter - ${S.length} incidents`,source:"Data Formatter",created:new Date,featureCount:S.length}};console.log("Importing pre-transformed incident data to Fire Map Pro:",{layerName:X.name,featureCount:S.length}),n(_t({layer:X,features:S})),sessionStorage.removeItem("fireEmsExportedData")}else{console.log("🔧 FIRE MAP PRO - Data is raw incident data, transforming...");const S=al.transformToFireMapPro(w.data);if(S.success&&S.data){if(console.log("Importing incident data to Fire Map Pro:",{layerName:S.data.layer.name,featureCount:S.data.features.length,errors:S.errors,warnings:S.warnings}),n(_t(S.data)),S.errors.length>0||S.warnings.length>0){const X=[`Successfully imported ${S.metadata.successfulRecords} of ${S.metadata.totalRecords} incidents.`,S.errors.length>0?`${S.errors.length} errors encountered.`:"",S.warnings.length>0?`${S.warnings.length} warnings.`:""].filter(Boolean).join(" ");n(ve(X))}sessionStorage.removeItem("fireEmsExportedData")}else console.error("Failed to transform incident data:",S.errors),n(ve(`Failed to import incident data: ${S.errors.join(", ")}`))}}}catch(T){console.error("Error checking for imported data:",T),n(ve("Error importing data from Data Formatter"))}};j();const D=setTimeout(j,1e3);return()=>clearTimeout(D)},[n]),B.useEffect(()=>{const j=D=>{if(!(D.target instanceof HTMLInputElement||D.target instanceof HTMLTextAreaElement)){if(D.ctrlKey||D.metaKey)switch(D.key){case"z":D.preventDefault(),D.shiftKey?p&&n(ft()):g&&n(Qt());break;case"y":D.preventDefault(),p&&n(ft());break;case"s":D.preventDefault(),m();break;case"e":D.preventDefault(),c();break}D.key==="Escape"&&s.drawingMode}};return document.addEventListener("keydown",j),()=>document.removeEventListener("keydown",j)},[g,p,s.drawingMode,n]);const m=()=>{l?l(s):(localStorage.setItem("fireMapPro_autosave",JSON.stringify(s)),console.log("Map saved to local storage"))},c=()=>{o?o(s.exportConfig):n(hi())},u=()=>{n(il())},y=()=>{var j;n(ll()),a.fullscreen?document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen():(j=r.current)!=null&&j.requestFullscreen&&r.current.requestFullscreen()},k=()=>{n(ve(null))},M={marginLeft:!h&&a.sidebarOpen?`${Qe}px`:0,width:!h&&a.sidebarOpen?`calc(100% - ${Qe}px)`:"100%",height:a.fullscreen?"100vh":"calc(100vh - 64px)",transition:d.transitions.create(["margin","width"],{easing:d.transitions.easing.sharp,duration:d.transitions.duration.leavingScreen})};return f?e.jsxs("div",{children:[e.jsx("button",{onClick:()=>x(!1),style:{position:"fixed",top:10,right:10,zIndex:10001,padding:"10px",background:"red",color:"white"},children:"Exit Test Mode"}),e.jsx(Or,{})]}):e.jsx(xl,{children:e.jsxs(C,{ref:r,sx:{display:"flex",height:"100vh",overflow:"hidden",bgcolor:"background.default",position:a.fullscreen?"fixed":"relative",top:a.fullscreen?0:"auto",left:a.fullscreen?0:"auto",right:a.fullscreen?0:"auto",bottom:a.fullscreen?0:"auto",zIndex:a.fullscreen?1300:"auto"},role:"main","aria-label":"Fire Map Pro Application",children:[!a.fullscreen&&e.jsx(gl,{position:"fixed",sx:{zIndex:d.zIndex.drawer+1,bgcolor:"primary.main"},children:e.jsxs(wl,{children:[e.jsx(le,{color:"inherit","aria-label":"toggle sidebar",onClick:u,edge:"start",sx:{mr:2},children:e.jsx(pl,{})}),e.jsxs(b,{variant:"h6",noWrap:!0,component:"div",sx:{flexGrow:1},children:["Fire Map Pro ",t==="edit"?"- Editing":t==="view"?"- View Only":""]}),e.jsxs(C,{sx:{display:"flex",gap:1},children:[e.jsx(le,{color:"inherit",onClick:()=>n(Qt()),disabled:!g,title:"Undo (Ctrl+Z)",children:e.jsx(dr,{})}),e.jsx(le,{color:"inherit",onClick:()=>n(ft()),disabled:!p,title:"Redo (Ctrl+Y)",children:e.jsx(nr,{})}),e.jsx(le,{color:"inherit",onClick:()=>x(!0),title:"Debug Test Mode",sx:{color:"orange"},children:e.jsx(Yl,{})}),t!=="view"&&e.jsx(le,{color:"inherit",onClick:m,title:"Save (Ctrl+S)",children:e.jsx(jl,{})}),e.jsx(le,{color:"inherit",onClick:c,title:"Export (Ctrl+E)",children:e.jsx(ke,{})}),e.jsx(le,{color:"inherit",onClick:y,title:"Toggle Fullscreen",children:a.fullscreen?e.jsx(sl,{}):e.jsx(cl,{})})]})]})}),e.jsx(fl,{variant:h?"temporary":"persistent",anchor:"left",open:a.sidebarOpen,onClose:u,sx:{width:Qe,flexShrink:0,"& .MuiDrawer-paper":{width:Qe,boxSizing:"border-box",marginTop:a.fullscreen?0:"64px",height:a.fullscreen?"100vh":"calc(100vh - 64px)",borderRight:`1px solid ${d.palette.divider}`}},ModalProps:{keepMounted:!0,disablePortal:!1,hideBackdrop:!h,disableAutoFocus:!0,disableEnforceFocus:!0,disableRestoreFocus:!0},PaperProps:{"aria-hidden":!1,role:"complementary","aria-label":"Fire Map Pro Tools"},children:e.jsx(Lr,{mode:t})}),e.jsxs(C,{component:"main",sx:{flexGrow:1,position:"relative",...M},children:[e.jsx(Q,{elevation:0,sx:{height:"100%",width:"100%",borderRadius:0,overflow:"hidden",position:"relative",minHeight:"500px",display:"flex",flexDirection:"column","& .leaflet-container":{background:"transparent !important",outline:"none"},"& .leaflet-tile-pane":{opacity:"1 !important",visibility:"visible !important"},"& .leaflet-tile":{opacity:"1 !important",visibility:"visible !important",display:"block !important",imageRendering:"auto",transform:"translateZ(0)",backfaceVisibility:"hidden"},"& .leaflet-layer":{opacity:"1 !important",visibility:"visible !important"}},children:e.jsx(wr,{})}),a.isLoading&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,bgcolor:"rgba(255, 255, 255, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:e.jsx(b,{variant:"h6",children:"Loading..."})})]}),a.showWelcome&&e.jsx(Tr,{}),e.jsx(Nr,{}),e.jsx(vl,{open:!!a.error,autoHideDuration:6e3,onClose:k,anchorOrigin:{vertical:"bottom",horizontal:"center"},children:e.jsx(Ge,{onClose:k,severity:"error",sx:{width:"100%"},children:a.error})})]})})};export{lo as default};
