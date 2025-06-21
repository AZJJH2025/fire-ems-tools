import{j as e,g as Mi,a as Li,r as B,u as Ai,s as wt,c as Ti,b as zi,m as Ii,i as H,a6 as se,B as C,h as Z,a7 as Oe,a8 as bt,a9 as Pi,aa as xe,ab as Ie,ac as ei,ad as it,R as vt,ae as we,af as Ri,ag as Wi,ah as Gi,ai as Ui,aj as Gt,ak as ti,al as ii,am as Hi,an as li,ao as Ni,ap as Oi,_ as Ut,aq as Ht,ar as ut,as as Xe,at as xt,au as $i,av as Nt,aw as Vi,ax as Yi,ay as Qi,az as Ot,aA as _i,aB as $e,aC as Xi,aD as Zi,aE as $t,aF as Vt,aG as gt,aH as Yt,aI as qi,aJ as Ki}from"./index-jxEbgLXU.js";import{E as Ji,T as Qt,D as el}from"./dataTransformer-DW-YvEEX.js";import{L as G,l as ri}from"./leaflet-DPSni9xL.js";import{P as tl,C as il,T as ft}from"./PureLeafletMap-P7RZOTFo.js";import{c as V,P as Q,T as v,u as oi}from"./Typography-BvXFuseg.js";import{n as ll,C as Ee,L as ni,h as ai,i as Ve,j as Qe,f as le,M as rl,a as Ze,b as qe,c as Ke,T as U,F as N,I as O,S as $,e as Je,d as _,A as We,D as ge,k as ol,x as nl}from"./TextField-CffANNH5.js";import{L as Pe,S as al}from"./Place-COau0-oS.js";import{B as te}from"./Button-BX9jWi4A.js";import{A as sl,E as et,T as _e,U as cl}from"./Edit-B5NDpwxq.js";import{E as ae,C as dl,A as ce,a as de,b as he}from"./ExpandMore-P44ALGQg.js";import{S as tt,A as hl,a as xl}from"./A11yProvider-7GWlYoW8.js";import{M as F,I as si}from"./MenuItem-bmVALGNF.js";import{D as Ct}from"./Delete-w-3UOq8-.js";import{S as J,a as gl}from"./Save-BpgGPI4c.js";import{M as yt}from"./Map-B-QY3vRH.js";import{G as E,T as jt,a as Re,E as fl,S as pl}from"./jspdf.es.min-D6Iionvu.js";import{T as ul}from"./Timeline-DiU820qb.js";import{S as yl,C as re}from"./Search-BtzxOVpb.js";import{S as ml}from"./Security-Cn1yK1nl.js";import{I as wl,W as bl}from"./Warning-CRiwZiYQ.js";import{L as vl}from"./LocalFireDepartment-Cc2n6fDP.js";import{E as Fe,M as Cl,D as jl}from"./Menu-BvO9BDlV.js";import{S as ci}from"./Settings-DZBE-Za9.js";import{u as di,F as El,a as Fl}from"./FullscreenExit-P9nnPfPE.js";import{C as kl}from"./Close-Dp2fLXzs.js";import"./Popper-Dpf5ryMK.js";const Dl=V(e.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}));function Bl(n){return Mi("MuiAvatar",n)}Li("MuiAvatar",["root","colorDefault","circular","rounded","square","img","fallback"]);const Sl=n=>{const{classes:t,variant:l,colorDefault:r}=n;return zi({root:["root",l,r&&"colorDefault"],img:["img"],fallback:["fallback"]},Bl,t)},Ml=wt("div",{name:"MuiAvatar",slot:"Root",overridesResolver:(n,t)=>{const{ownerState:l}=n;return[t.root,t[l.variant],l.colorDefault&&t.colorDefault]}})(Ii(({theme:n})=>({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:40,height:40,fontFamily:n.typography.fontFamily,fontSize:n.typography.pxToRem(20),lineHeight:1,borderRadius:"50%",overflow:"hidden",userSelect:"none",variants:[{props:{variant:"rounded"},style:{borderRadius:(n.vars||n).shape.borderRadius}},{props:{variant:"square"},style:{borderRadius:0}},{props:{colorDefault:!0},style:{color:(n.vars||n).palette.background.default,...n.vars?{backgroundColor:n.vars.palette.Avatar.defaultBg}:{backgroundColor:n.palette.grey[400],...n.applyStyles("dark",{backgroundColor:n.palette.grey[600]})}}}]}))),Ll=wt("img",{name:"MuiAvatar",slot:"Img",overridesResolver:(n,t)=>t.img})({width:"100%",height:"100%",textAlign:"center",objectFit:"cover",color:"transparent",textIndent:1e4}),Al=wt(Dl,{name:"MuiAvatar",slot:"Fallback",overridesResolver:(n,t)=>t.fallback})({width:"75%",height:"75%"});function Tl({crossOrigin:n,referrerPolicy:t,src:l,srcSet:r}){const[o,d]=B.useState(!1);return B.useEffect(()=>{if(!l&&!r)return;d(!1);let h=!0;const s=new Image;return s.onload=()=>{h&&d("loaded")},s.onerror=()=>{h&&d("error")},s.crossOrigin=n,s.referrerPolicy=t,s.src=l,r&&(s.srcset=r),()=>{h=!1}},[n,t,l,r]),o}const zl=B.forwardRef(function(t,l){const r=Ai({props:t,name:"MuiAvatar"}),{alt:o,children:d,className:h,component:s="div",slots:a={},slotProps:g={},imgProps:f,sizes:i,src:p,srcSet:x,variant:b="circular",...c}=r;let u=null;const y={...r,component:s,variant:b},D=Tl({...f,...typeof g.img=="function"?g.img(y):g.img,src:p,srcSet:x}),M=p||x,j=M&&D!=="error";y.colorDefault=!j,delete y.ownerState;const k=Sl(y),[T,m]=ll("img",{className:k.img,elementType:Ll,externalForwardedProps:{slots:a,slotProps:{img:{...f,...g.img}}},additionalProps:{alt:o,src:p,srcSet:x,sizes:i},ownerState:y});return j?u=e.jsx(T,{...m}):d||d===0?u=d:M&&o?u=o[0]:u=e.jsx(Al,{ownerState:y,className:k.fallback}),e.jsx(Ml,{as:s,className:Ti(k.root,h),ref:l,...c,ownerState:y,children:u})}),Il=V(e.jsx("path",{d:"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20zm-6 8h-4v-2h4zm0-4h-4v-2h4z"})),Pl=V(e.jsx("path",{d:"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"})),Rl=V(e.jsx("path",{d:"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z"})),Wl=V(e.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"})),Gl=V(e.jsx("path",{d:"M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"})),Ul=V(e.jsx("path",{d:"M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),Hl=V(e.jsx("path",{d:"M14.69 2.21 4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02"})),hi=V(e.jsx("path",{d:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"})),Nl=V(e.jsx("path",{d:"M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"})),Ol=V(e.jsx("path",{d:"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z"})),$l=V(e.jsx("path",{d:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"})),Vl=V(e.jsx("path",{d:"m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7z"})),lt=V(e.jsx("path",{d:"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9m5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9M5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5m6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5"})),Yl=V(e.jsx("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"})),Ql=V(e.jsx("path",{d:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3m-3 11H8v-5h8zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-1-9H6v4h12z"})),_l=V(e.jsx("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z"})),Xl=V(e.jsx("path",{d:"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),Zl=V(e.jsx("path",{d:"M23 6H1v12h22zm-2 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"})),ql=V(e.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),Kl=V(e.jsx("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8"})),Jl=V(e.jsx("path",{d:"M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"})),er=V(e.jsx("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"})),tr=V(e.jsx("path",{d:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"})),_t=[],Xt=[],Zt=[],qt=[],Kt=[],Jt=[{id:"fire-stations",name:"Fire Stations",visible:!1,opacity:1,zIndex:3,type:"feature",features:_t,metadata:{description:"Add your fire stations using the drawing tools or data import",source:"User Data",created:new Date,featureCount:_t.length}},{id:"hospitals",name:"Medical Facilities",visible:!1,opacity:1,zIndex:2,type:"feature",features:Xt,metadata:{description:"Add hospitals and medical facilities to your map",source:"User Data",created:new Date,featureCount:Xt.length}},{id:"hydrants",name:"Fire Hydrants",visible:!1,opacity:1,zIndex:1,type:"feature",features:Zt,metadata:{description:"Map fire hydrants with flow rates and inspection data",source:"User Data",created:new Date,featureCount:Zt.length}},{id:"recent-incidents",name:"Incidents",visible:!1,opacity:1,zIndex:4,type:"feature",features:qt,metadata:{description:"Track emergency incidents and responses",source:"User Data",created:new Date,featureCount:qt.length}},{id:"response-zones",name:"Response Zones",visible:!1,opacity:.6,zIndex:0,type:"feature",features:Kt,metadata:{description:"Define coverage areas and response zones",source:"User Data",created:new Date,featureCount:Kt.length}}],ir=()=>{const n=H(se),t={totalFeatures:0,totalMarkers:0,totalLines:0,totalPolygons:0};return n.forEach(l=>{l.visible&&(t.totalFeatures+=l.features.length,l.features.forEach(r=>{switch(r.type){case"marker":t.totalMarkers++;break;case"polyline":t.totalLines++;break;case"polygon":t.totalPolygons++;break}}))}),t.totalFeatures===0?null:e.jsxs(Q,{elevation:2,sx:{position:"absolute",top:16,left:16,zIndex:1e3,p:2,bgcolor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(4px)",minWidth:200},children:[e.jsxs(v,{variant:"subtitle2",sx:{mb:1,display:"flex",alignItems:"center",gap:1},children:[e.jsx(Xl,{fontSize:"small"}),"Features"]}),e.jsx(C,{sx:{display:"flex",flexDirection:"column",gap:1},children:e.jsxs(C,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(Ee,{size:"small",label:`${t.totalFeatures} total`,color:"primary",variant:"outlined"}),t.totalMarkers>0&&e.jsx(Ee,{size:"small",label:`${t.totalMarkers} markers`,variant:"outlined"}),t.totalLines>0&&e.jsx(Ee,{size:"small",label:`${t.totalLines} lines`,variant:"outlined"}),t.totalPolygons>0&&e.jsx(Ee,{size:"small",label:`${t.totalPolygons} polygons`,variant:"outlined"})]})})]})},lr=({map:n})=>{const t=Z(),l=H(se),r=B.useRef(new Map),o=s=>{try{const g=s.style.icon;if(!g)return G.icon({iconUrl:'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23666666"/%3E%3C/svg%3E',iconSize:[24,24],iconAnchor:[12,24],popupAnchor:[0,-24]});const f={small:[20,20],medium:[30,30],large:[40,40],"extra-large":[50,50]},i=f[g.size]||f.medium;return g.url?G.icon({iconUrl:g.url,iconSize:i,iconAnchor:g.anchor?g.anchor:[i[0]/2,i[1]],popupAnchor:g.popupAnchor?g.popupAnchor:[0,-i[1]]}):(console.warn(`[LayerManager] Icon missing URL for feature ${s.id}`),null)}catch(a){return console.warn(`[LayerManager] Error creating icon for feature ${s.id}:`,a),null}},d=s=>{let a='<div class="fire-map-popup">';return a+=`<h3>${s.title}</h3>`,a+=`<p>${s.description}</p>`,s.properties&&Object.keys(s.properties).length>0&&(a+='<div class="feature-properties">',Object.entries(s.properties).forEach(([g,f])=>{const i=g.replace(/([A-Z])/g," $1").replace(/^./,p=>p.toUpperCase());a+=`<div><strong>${i}:</strong> ${f}</div>`}),a+="</div>"),a+="</div>",a},h=s=>{try{const a=s.style;switch(s.type){case"marker":{const[g,f]=s.coordinates;if(isNaN(f)||isNaN(g))return console.warn(`[LayerManager] Invalid coordinates for feature ${s.id}: [${g}, ${f}]`),null;const i=o(s);if(!i)return console.warn(`[LayerManager] Failed to create icon for feature ${s.id}`),null;const p=G.marker([f,g],{icon:i});try{p.bindPopup(d(s)),p.bindTooltip(s.title,{sticky:!0}),p.on("click",()=>{console.log("Feature clicked:",s.id),t(Oe(s.id))})}catch(x){console.warn(`[LayerManager] Error binding popup/tooltip for feature ${s.id}:`,x)}return p}case"polygon":{const g=s.coordinates[0].map(([i,p])=>[p,i]),f=G.polygon(g,{color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t(Oe(s.id))}),f}case"polyline":{const g=s.coordinates.map(([i,p])=>[p,i]),f=G.polyline(g,{color:a.color||"#3388ff",weight:a.weight||3,opacity:a.opacity||1});return f.bindPopup(d(s)),f.bindTooltip(s.title,{sticky:!0}),f.on("click",()=>{console.log("Feature clicked:",s.id),t(Oe(s.id))}),f}case"circle":{const[g,f,i]=s.coordinates,p=G.circle([f,g],{radius:i,color:a.color||"#3388ff",fillColor:a.fillColor||a.color||"#3388ff",fillOpacity:a.fillOpacity||.2,weight:a.weight||3,opacity:a.opacity||1});return p.bindPopup(d(s)),p.bindTooltip(s.title,{sticky:!0}),p.on("click",()=>{console.log("Feature clicked:",s.id),t(Oe(s.id))}),p}default:return console.warn(`[LayerManager] Unknown feature type: ${s.type}`),null}}catch(a){return console.error(`[LayerManager] Error creating feature layer for ${s.id}:`,a),null}};return B.useEffect(()=>{if(!n||!n.getContainer()){console.warn("[LayerManager] Map or container not ready, skipping layer update");return}const s=()=>{try{const a=n.getContainer();if(!a||!a.parentNode||!document.body.contains(a)){console.warn("[LayerManager] Map container not properly attached to DOM, skipping update");return}const g=n.getPanes();if(!g||!g.markerPane||!n._size||!n._pixelOrigin){console.warn("[LayerManager] Map panes or coordinate system not ready, skipping update");return}console.log("[LayerManager] Updating layers with",l.length,"layers"),[...l].sort((i,p)=>i.zIndex-p.zIndex).forEach(i=>{const p=r.current.get(i.id);if(p)try{n.removeLayer(p),r.current.delete(i.id)}catch(x){console.warn(`[LayerManager] Error removing existing layer ${i.id}:`,x)}if(i.visible&&i.features.length>0)try{const x=n.getContainer();if(!x||!x.parentNode||!document.body.contains(x)){console.warn(`[LayerManager] Map container not ready for layer ${i.id}`);return}const b=n.getPanes();if(!b||!b.markerPane){console.warn(`[LayerManager] Map panes not ready for layer ${i.id}`);return}const c=G.layerGroup();let u=0;i.features.forEach(y=>{try{const D=h(y);D&&(c.addLayer(D),u++)}catch(D){console.warn(`[LayerManager] Error creating feature ${y.id}:`,D)}}),i.opacity!==void 0&&i.opacity!==1&&c.eachLayer(y=>{try{y instanceof G.Marker?y.setOpacity(i.opacity):y instanceof G.Path&&y.setStyle({opacity:i.opacity})}catch(D){console.warn("[LayerManager] Error setting opacity:",D)}}),u>0&&n.getContainer()&&(c.addTo(n),r.current.set(i.id,c),console.log(`[LayerManager] Added layer "${i.name}" with ${u}/${i.features.length} features`))}catch(x){console.error(`[LayerManager] Error creating layer ${i.id}:`,x)}})}catch(a){console.error("[LayerManager] Critical error during layer update:",a)}};n._loaded&&n.getPanes()&&n._size?s():n.whenReady(s)},[n,l,t]),B.useEffect(()=>()=>{n&&(r.current.forEach((s,a)=>{n.removeLayer(s),console.log(`[LayerManager] Cleaned up layer: ${a}`)}),r.current.clear())},[n]),null},rr=({map:n})=>{const t=Z(),l=H(bt),r=H(se),o=B.useRef(null),d=B.useRef([]),h=r.find(i=>i.type==="feature"),s=B.useCallback((i,p)=>{n&&(console.log("[PureLeafletDrawTools] Adding event handler:",i),n.on(i,p),d.current.push({event:i,handler:p}))},[n]),a=B.useCallback(()=>{n&&(console.log("[PureLeafletDrawTools] Clearing all event handlers"),d.current.forEach(({event:i,handler:p})=>{n.off(i,p)}),d.current=[],n.dragging.enable(),n.doubleClickZoom.enable(),n.boxZoom.enable(),n.getContainer().style.cursor="")},[n]),g=()=>`feature_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,f=(i,p)=>{var b,c,u,y,D;let x=[];switch(p){case"marker":const j=i.getLatLng();x=[j.lng,j.lat];break;case"circle":const k=i,T=k.getLatLng(),m=k.getRadius();x=[T.lng,T.lat,m];break;case"polygon":x=[i.getLatLngs()[0].map(ie=>[ie.lng,ie.lat])];break;case"polyline":x=i.getLatLngs().map(ie=>[ie.lng,ie.lat]);break;case"rectangle":const ee=i.getBounds();x=[[ee.getSouthWest().lng,ee.getSouthWest().lat],[ee.getNorthEast().lng,ee.getNorthEast().lat]];break}return{id:g(),type:p,title:`${p.charAt(0).toUpperCase()+p.slice(1)} Feature`,description:`Drawing created at ${new Date().toLocaleTimeString()}`,coordinates:x,style:{color:(b=l.options.style)==null?void 0:b.color,fillColor:(c=l.options.style)==null?void 0:c.fillColor,fillOpacity:(u=l.options.style)==null?void 0:u.fillOpacity,weight:(y=l.options.style)==null?void 0:y.weight,opacity:(D=l.options.style)==null?void 0:D.opacity},properties:{created:new Date().toISOString(),drawingMode:p},layerId:"user-drawings",created:new Date,modified:new Date}};return B.useEffect(()=>{if(!n)return;console.log("[PureLeafletDrawTools] Initializing simple drawing");const i=new G.FeatureGroup;return n.addLayer(i),o.current=i,console.log("[PureLeafletDrawTools] Feature group created and added to map:",i),console.log("[PureLeafletDrawTools] Feature group attached to map:",n.hasLayer(i)),console.log("[PureLeafletDrawTools] Map has feature group in layers:",n.hasLayer(i)),()=>{n&&o.current&&(console.log("[PureLeafletDrawTools] Removing feature group from map"),n.removeLayer(o.current)),o.current=null}},[n,t]),B.useEffect(()=>{if(!(!n||!n.getContainer())){if(console.log("[PureLeafletDrawTools] Drawing mode changed to:",l.mode),a(),l.mode==="edit")console.log("[PureLeafletDrawTools] Activating edit mode"),n.getContainer().style.cursor="pointer",s("click",p=>{const x=p.originalEvent.target;x&&x.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Edit click on feature:",x),alert("Edit functionality - feature clicked! (Can be enhanced to show edit dialog)"))});else if(l.mode==="delete")console.log("[PureLeafletDrawTools] Activating delete mode"),n.getContainer().style.cursor="crosshair",s("click",p=>{const x=p.originalEvent.target;x&&x.classList.contains("leaflet-interactive")&&(console.log("[PureLeafletDrawTools] Delete click on feature:",x),n.eachLayer(b=>{if(b.getElement&&b.getElement()===x){console.log("[PureLeafletDrawTools] Deleting layer:",b);const c=b._fireEmsFeatureId;c&&(console.log("[PureLeafletDrawTools] Found feature ID for deletion:",c),t(Pi(c)),console.log("[PureLeafletDrawTools] Feature deleted from Redux store")),n.removeLayer(b),console.log("[PureLeafletDrawTools] Layer removed from map")}}))});else if(l.mode){console.log("[PureLeafletDrawTools] Activating simple drawing mode:",l.mode);let i=!1,p=null,x=null;const b=y=>{var D,M,j,k,T,m,z,S,X,ee,ie,ke,De,Be,Se,Me,Le,Ae,Te,ze;if(G.DomEvent.stopPropagation(y.originalEvent),G.DomEvent.preventDefault(y.originalEvent),console.log("[PureLeafletDrawTools] Drawing click detected:",l.mode,y.latlng),console.log("[PureLeafletDrawTools] Current drawing options:",l.options),console.log("[PureLeafletDrawTools] Current style options:",l.options.style),l.mode==="marker"){const Y=((D=l.options.style)==null?void 0:D.color)||"#3388ff";console.log("[PureLeafletDrawTools] Creating marker with color:",Y);const be=G.divIcon({className:"colored-marker",html:`<div style="
              background-color: ${Y};
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,iconSize:[25,25],iconAnchor:[12,24],popupAnchor:[1,-24]}),oe=G.marker(y.latlng,{draggable:!0,icon:be});if(oe.addTo(n),console.log("[PureLeafletDrawTools] Colored marker added DIRECTLY to map:",oe),o.current&&o.current.addLayer(oe),!h)return;const fe=f(oe,"marker"),{id:pe,created:rt,modified:ot,...Ge}=fe;t(xe({layerId:h.id,feature:Ge})),oe._fireEmsFeatureId=fe.id,t(Ie(null))}else if(!i&&l.mode==="circle"){i=!0,p=y.latlng,console.log("[PureLeafletDrawTools] Starting circle drawing at:",y.latlng);const Y={radius:100,color:((M=l.options.style)==null?void 0:M.color)||"#3388ff",fillColor:((j=l.options.style)==null?void 0:j.fillColor)||"#3388ff",fillOpacity:((k=l.options.style)==null?void 0:k.fillOpacity)||.2,weight:((T=l.options.style)==null?void 0:T.weight)||3,opacity:((m=l.options.style)==null?void 0:m.opacity)||1};console.log("[PureLeafletDrawTools] Circle options:",Y),console.log("[PureLeafletDrawTools] Fill color value:",(z=l.options.style)==null?void 0:z.fillColor),x=G.circle(y.latlng,Y),x.addTo(n),console.log("[PureLeafletDrawTools] Circle started, added DIRECTLY to map:",x)}else if(i&&l.mode==="circle"){if(console.log("[PureLeafletDrawTools] Finishing circle drawing"),x){if(!h)return;const Y=f(x,"circle");console.log("[PureLeafletDrawTools] Circle feature created:",Y);const{id:be,created:oe,modified:fe,...pe}=Y;t(xe({layerId:h.id,feature:pe})),x._fireEmsFeatureId=Y.id,console.log("[PureLeafletDrawTools] Circle feature dispatched to Redux")}t(Ie(null))}else if(!i&&l.mode==="rectangle")i=!0,p=y.latlng,console.log("[PureLeafletDrawTools] Starting rectangle drawing"),x=G.rectangle([[y.latlng.lat,y.latlng.lng],[y.latlng.lat,y.latlng.lng]],{color:((S=l.options.style)==null?void 0:S.color)||"#3388ff",fillColor:((X=l.options.style)==null?void 0:X.fillColor)||"#3388ff",fillOpacity:((ee=l.options.style)==null?void 0:ee.fillOpacity)||.2,weight:((ie=l.options.style)==null?void 0:ie.weight)||3,opacity:((ke=l.options.style)==null?void 0:ke.opacity)||1}),x.addTo(n),console.log("[PureLeafletDrawTools] Rectangle started, added DIRECTLY to map:",x);else if(i&&l.mode==="rectangle"){if(console.log("[PureLeafletDrawTools] Finishing rectangle drawing"),x){if(!h)return;const Y=f(x,"rectangle");console.log("[PureLeafletDrawTools] Rectangle feature created:",Y);const{id:be,created:oe,modified:fe,...pe}=Y;t(xe({layerId:h.id,feature:pe})),x._fireEmsFeatureId=Y.id,console.log("[PureLeafletDrawTools] Rectangle feature dispatched to Redux")}t(Ie(null))}else if(!i&&(l.mode==="polygon"||l.mode==="polyline"))if(x){const Y=l.mode==="polygon"?x.getLatLngs()[0]:x.getLatLngs();Y.push(y.latlng),l.mode,x.setLatLngs(Y),console.log(`[PureLeafletDrawTools] Added point to ${l.mode}:`,y.latlng)}else{const Y=[y.latlng];l.mode==="polygon"?x=G.polygon(Y,{color:((De=l.options.style)==null?void 0:De.color)||"#3388ff",fillColor:((Be=l.options.style)==null?void 0:Be.fillColor)||"#3388ff",fillOpacity:((Se=l.options.style)==null?void 0:Se.fillOpacity)||.2,weight:((Me=l.options.style)==null?void 0:Me.weight)||3,opacity:((Le=l.options.style)==null?void 0:Le.opacity)||1}):x=G.polyline(Y,{color:((Ae=l.options.style)==null?void 0:Ae.color)||"#3388ff",weight:((Te=l.options.style)==null?void 0:Te.weight)||3,opacity:((ze=l.options.style)==null?void 0:ze.opacity)||1}),x.addTo(n),console.log(`[PureLeafletDrawTools] ${l.mode} started:`,x)}},c=y=>{if(!(!i||!x||!p))switch(G.DomEvent.stopPropagation(y.originalEvent),l.mode){case"circle":const D=p.distanceTo(y.latlng);x.setRadius(D);break;case"rectangle":const M=G.latLngBounds([p,y.latlng]);x.setBounds(M);break}};n.dragging.disable(),n.doubleClickZoom.disable(),n.boxZoom.disable(),console.log("[PureLeafletDrawTools] Map interactions disabled for drawing");const u=y=>{if((l.mode==="polygon"||l.mode==="polyline")&&(G.DomEvent.stopPropagation(y.originalEvent),G.DomEvent.preventDefault(y.originalEvent),x)){if(console.log(`[PureLeafletDrawTools] Finishing ${l.mode} with double-click`),!h)return;const D=f(x,l.mode);console.log(`[PureLeafletDrawTools] ${l.mode} feature created:`,D);const{id:M,created:j,modified:k,...T}=D;t(xe({layerId:h.id,feature:T})),x._fireEmsFeatureId=D.id,console.log(`[PureLeafletDrawTools] ${l.mode} feature dispatched to Redux`),t(Ie(null))}};s("click",b),s("mousemove",c),s("dblclick",u),n.getContainer().style.cursor="crosshair"}return()=>{a()}}},[l.mode,n,t,a,s]),B.useEffect(()=>()=>{a()},[a]),null},or=({map:n,mapContainer:t})=>{const l=Z(),r=H(se),o=()=>`dropped_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;return B.useEffect(()=>{if(!n||!t||!n.getContainer()){console.warn("[DragDrop] Map or container not ready for drag/drop setup");return}const d=setTimeout(()=>{const h=n.getContainer();if(!h||!h.parentNode||!document.body.contains(h)){console.warn("[DragDrop] Map container not properly attached, skipping setup");return}if(!n.getPanes()){console.warn("[DragDrop] Map panes not ready, skipping setup");return}console.log("[DragDrop] Setting up drag and drop handlers");const a=f=>{f.preventDefault(),f.dataTransfer.dropEffect="copy"},g=f=>{var i;f.preventDefault();try{const p=f.dataTransfer.getData("application/json");if(!p){console.warn("[DragDrop] No icon data found in drop event");return}const x=JSON.parse(p);console.log("[DragDrop] Dropped icon:",x);let b;try{const y=n.getContainer();if(!y||!y.parentNode)throw new Error("Map container not available or not attached");const D=n.getPanes();if(!D||!n._loaded)throw new Error("Map not fully loaded");if(!n._size||!n._pixelOrigin||!D.mapPane)throw new Error("Map coordinate system not ready - missing _size, _pixelOrigin, or mapPane");const M=y.getBoundingClientRect(),j=f.clientX-M.left,k=f.clientY-M.top;if(j<0||k<0||j>M.width||k>M.height)throw new Error("Drop coordinates are outside map bounds");try{console.log("[DragDrop] Using legacy containerPointToLatLng method");const T=G.point(j,k);b=n.containerPointToLatLng(T),console.log("[DragDrop] Legacy coordinate conversion:",{x:j,y:k,point:{x:T.x,y:T.y},latlng:{lat:b.lat,lng:b.lng}})}catch(T){console.error("[DragDrop] Legacy conversion failed, falling back:",T),b=G.latLng(39.8283,-98.5795)}if(!b||isNaN(b.lat)||isNaN(b.lng))throw new Error("Invalid coordinates calculated");if(Math.abs(b.lat)>90||Math.abs(b.lng)>180)throw new Error("Coordinates outside valid geographic bounds")}catch(y){console.error("[DragDrop] Error calculating coordinates:",y);try{if(b=n.getCenter(),!b||isNaN(b.lat)||isNaN(b.lng))throw new Error("Map center is invalid")}catch(D){console.error("[DragDrop] Error getting map center:",D),b={lat:39.8283,lng:-98.5795}}}console.log("[DragDrop] Icon data received:",{id:x.id,name:x.name,url:x.url?x.url.substring(0,100)+"...":"NO URL",urlLength:x.url?x.url.length:0,category:x.category,size:x.size,color:x.color});let c=r.find(y=>y.type==="feature"&&y.visible);const u={id:o(),type:"marker",title:x.name||"Dropped Icon",description:`${x.name} placed at ${new Date().toLocaleTimeString()}`,coordinates:[b.lng,b.lat],layerId:(c==null?void 0:c.id)||"pending",style:{color:x.color||"#666666",icon:{id:x.id,name:x.name,category:x.category||"custom",url:x.url,size:x.size||"medium",color:x.color||"#666666",anchor:x.anchor||[16,32],popupAnchor:x.popupAnchor||[0,-32]}},properties:{droppedAt:new Date().toISOString(),iconSource:"library",originalIcon:x},created:new Date,modified:new Date};if(console.log("[DragDrop] Created feature with icon URL:",(i=u.style.icon)!=null&&i.url?"PRESENT":"MISSING"),c)console.log("[DragDrop] Adding feature to existing layer:",c.id,c.name),l(xe({layerId:c.id,feature:u}));else{console.log('[DragDrop] No suitable layer found. Creating "Dropped Icons" layer. Available layers:',r.map(D=>({id:D.id,name:D.name,type:D.type,visible:D.visible})));const y={name:"Dropped Icons",type:"feature",visible:!0,opacity:1,zIndex:r.length,features:[],style:{defaultStyle:{color:"#DC2626",fillColor:"#DC2626",fillOpacity:.3,weight:2,opacity:1}},metadata:{description:"Icons dropped from the icon library",source:"user-interaction",created:new Date,featureCount:0}};l(ei(y)),setTimeout(()=>{const D=r,M=D.find(j=>j.name==="Dropped Icons");if(M)console.log("[DragDrop] Adding feature to newly created layer:",M.id),u.layerId=M.id,l(xe({layerId:M.id,feature:u}));else{const j=D.find(k=>k.type==="feature");j?(console.log("[DragDrop] Using first available feature layer:",j.id),l(xe({layerId:j.id,feature:u}))):console.error("[DragDrop] Failed to create or find any feature layer")}},300)}console.log("[DragDrop] Successfully created feature from dropped icon:",u.id)}catch(p){console.error("[DragDrop] Error handling drop event:",p)}};return t.addEventListener("dragover",a),t.addEventListener("drop",g),console.log("[DragDrop] Successfully set up drag and drop handlers"),()=>{t.removeEventListener("dragover",a),t.removeEventListener("drop",g),console.log("[DragDrop] Cleaned up drag and drop handlers")}},100);return()=>{clearTimeout(d)}},[n,t,l,r]),null},nr=ri.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});ri.Marker.prototype.options.icon=nr;const ar=()=>{const n=Z(),t=H(it),l=H(bt),r=H(se),[o,d]=B.useState(!1),[h]=B.useState(null),[s,a]=B.useState(null),g=B.useRef(null),f=t.baseMaps.find(b=>b.id===t.activeBaseMap),i=B.useCallback((b,c)=>{g.current=b,a(c),d(!0),typeof window<"u"&&(window.fireMapProInstance=b,console.log("✓ Pure Leaflet map exposed as window.fireMapProInstance"))},[]);if(vt.useEffect(()=>{n(we(null))},[t.activeBaseMap,n]),!f)return e.jsx(C,{sx:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",bgcolor:"grey.100"},children:e.jsx(v,{variant:"h6",color:"text.secondary",children:"No base map configured"})});const p=b=>{b.preventDefault();try{const c=JSON.parse(b.dataTransfer.getData("application/json")),y=b.currentTarget.getBoundingClientRect(),D=b.clientX-y.left,M=b.clientY-y.top;if(g.current&&c){const j=g.current.containerPointToLatLng([D,M]),k=r.find(T=>T.type==="feature");if(k){const T={type:"marker",title:c.name,description:`${c.name} - Click to edit`,coordinates:[j.lng,j.lat],style:{...c,icon:c},properties:{iconCategory:c.category,droppedFrom:"icon-library"},layerId:k.id};n(xe({layerId:k.id,feature:T})),console.log("Icon placed successfully:",c.name,"at",j)}else n(we("Please create a feature layer first to place icons"))}}catch(c){console.error("Error handling icon drop:",c),n(we("Error placing icon on map"))}},x=b=>{b.preventDefault(),b.dataTransfer.dropEffect="copy"};return e.jsxs(C,{sx:{height:"100%",width:"100%",position:"relative",minHeight:"500px","& .leaflet-container":{height:"100% !important",width:"100% !important",position:"relative !important"}},onDrop:p,onDragOver:x,children:[e.jsxs(tl,{onMapReady:i,children:[o&&g.current&&s&&e.jsx(lr,{map:g.current}),o&&g.current&&s&&e.jsx(rr,{map:g.current}),o&&g.current&&s&&e.jsx(or,{map:g.current,mapContainer:s}),o&&g.current&&!1]}),t.showCoordinates&&e.jsx(il,{mouseCoords:h}),l.options.showMeasurements&&e.jsx(ir,{}),!1,t.showGrid&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",backgroundImage:`
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,backgroundSize:"50px 50px",zIndex:1e3}}),!o&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",bgcolor:"rgba(255, 255, 255, 0.9)",zIndex:2e3},children:e.jsx(v,{variant:"h6",color:"text.secondary",children:"Loading map..."})})]})},sr=()=>{const n=Z(),t=H(se),[l,r]=B.useState(new Set),[o,d]=B.useState(null),[h,s]=B.useState(!1),[a,g]=B.useState(null),[f,i]=B.useState({name:"",type:"feature",opacity:1,visible:!0}),p=m=>{const z=t.find(S=>S.id===m);z&&n(Ri({layerId:m,visible:!z.visible}))},x=(m,z)=>{n(Wi({layerId:m,opacity:z/100}))},b=m=>{const z=new Set(l);z.has(m)?z.delete(m):z.add(m),r(z)},c=(m,z)=>{m.preventDefault(),d({mouseX:m.clientX-2,mouseY:m.clientY-4,layerId:z})},u=()=>{d(null)},y=()=>{const m={name:f.name||"New Layer",visible:f.visible,opacity:f.opacity,zIndex:t.length,type:f.type,features:[],metadata:{description:"",source:"User Created",created:new Date,featureCount:0}};n(ei(m)),s(!1),i({name:"",type:"feature",opacity:1,visible:!0})},D=m=>{const z=t.find(S=>S.id===m);z&&(i({name:z.name,type:z.type,opacity:z.opacity,visible:z.visible}),g(m)),u()},M=()=>{a&&(n(Ui({layerId:a,updates:{name:f.name,type:f.type,opacity:f.opacity,visible:f.visible}})),g(null),i({name:"",type:"feature",opacity:1,visible:!0}))},j=m=>{n(Gi(m)),u()},k=m=>{switch(m){case"base":return e.jsx(yt,{});case"overlay":return e.jsx(Pe,{});case"reference":return e.jsx(yt,{});default:return e.jsx(Pe,{})}},T=m=>{switch(m){case"base":return"primary";case"overlay":return"secondary";case"reference":return"info";default:return"default"}};return e.jsxs(C,{children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(v,{variant:"h6",sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(Pe,{}),"Layers"]}),e.jsx(te,{startIcon:e.jsx(sl,{}),onClick:()=>s(!0),size:"small",variant:"outlined",children:"Add"})]}),e.jsx(ni,{dense:!0,children:t.map((m,z)=>e.jsxs(vt.Fragment,{children:[e.jsxs(ai,{sx:{border:"1px solid",borderColor:"divider",borderRadius:1,mb:1,bgcolor:"background.paper"},children:[e.jsx(Ve,{sx:{minWidth:32},children:e.jsx(Ul,{sx:{cursor:"grab",color:"text.disabled"}})}),e.jsx(Ve,{sx:{minWidth:40},children:k(m.type)}),e.jsx(Qe,{primary:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(v,{variant:"body2",sx:{fontWeight:500},children:m.name}),e.jsx(Ee,{label:m.type,size:"small",color:T(m.type),sx:{height:20,fontSize:"0.7rem"}})]}),secondary:`${m.features.length} features`}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(le,{size:"small",onClick:()=>p(m.id),color:m.visible?"primary":"default",children:m.visible?e.jsx(er,{}):e.jsx(tr,{})}),e.jsx(le,{size:"small",onClick:()=>b(m.id),children:l.has(m.id)?e.jsx(Ji,{}):e.jsx(ae,{})}),e.jsx(le,{size:"small",onClick:S=>c(S,m.id),children:e.jsx($l,{})})]})]}),e.jsx(dl,{in:l.has(m.id),timeout:"auto",children:e.jsxs(C,{sx:{pl:2,pr:2,pb:2},children:[e.jsxs(v,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Opacity: ",Math.round(m.opacity*100),"%"]}),e.jsx(tt,{value:m.opacity*100,onChange:(S,X)=>x(m.id,X),min:0,max:100,size:"small",sx:{mb:1}}),m.metadata.description&&e.jsx(v,{variant:"caption",color:"text.secondary",children:m.metadata.description})]})})]},m.id))}),t.length===0&&e.jsx(C,{sx:{textAlign:"center",py:4},children:e.jsx(v,{variant:"body2",color:"text.secondary",children:"No layers yet. Create your first layer to get started."})}),e.jsxs(rl,{open:o!==null,onClose:u,anchorReference:"anchorPosition",anchorPosition:o!==null?{top:o.mouseY,left:o.mouseX}:void 0,children:[e.jsxs(F,{onClick:()=>o&&D(o.layerId),children:[e.jsx(Ve,{children:e.jsx(et,{fontSize:"small"})}),e.jsx(Qe,{children:"Edit Layer"})]}),e.jsxs(F,{onClick:()=>o&&j(o.layerId),children:[e.jsx(Ve,{children:e.jsx(Ct,{fontSize:"small"})}),e.jsx(Qe,{children:"Delete Layer"})]})]}),e.jsxs(Ze,{open:h,onClose:()=>s(!1),maxWidth:"sm",fullWidth:!0,children:[e.jsx(qe,{children:"Create New Layer"}),e.jsxs(Ke,{children:[e.jsx(U,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:f.name,onChange:m=>i({...f,name:m.target.value}),sx:{mb:2}}),e.jsxs(N,{fullWidth:!0,sx:{mb:2},children:[e.jsx(O,{children:"Layer Type"}),e.jsxs($,{value:f.type,label:"Layer Type",onChange:m=>i({...f,type:m.target.value}),children:[e.jsx(F,{value:"feature",children:"Feature Layer"}),e.jsx(F,{value:"overlay",children:"Overlay Layer"}),e.jsx(F,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(v,{variant:"body2",children:"Visible:"}),e.jsx(J,{checked:f.visible,onChange:m=>i({...f,visible:m.target.checked})})]})]}),e.jsxs(Je,{children:[e.jsx(te,{onClick:()=>s(!1),children:"Cancel"}),e.jsx(te,{onClick:y,variant:"contained",children:"Create"})]})]}),e.jsxs(Ze,{open:a!==null,onClose:()=>g(null),maxWidth:"sm",fullWidth:!0,children:[e.jsx(qe,{children:"Edit Layer"}),e.jsxs(Ke,{children:[e.jsx(U,{autoFocus:!0,margin:"dense",label:"Layer Name",fullWidth:!0,variant:"outlined",value:f.name,onChange:m=>i({...f,name:m.target.value}),sx:{mb:2}}),e.jsxs(N,{fullWidth:!0,sx:{mb:2},children:[e.jsx(O,{children:"Layer Type"}),e.jsxs($,{value:f.type,label:"Layer Type",onChange:m=>i({...f,type:m.target.value}),children:[e.jsx(F,{value:"feature",children:"Feature Layer"}),e.jsx(F,{value:"overlay",children:"Overlay Layer"}),e.jsx(F,{value:"reference",children:"Reference Layer"})]})]}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(v,{variant:"body2",children:"Visible:"}),e.jsx(J,{checked:f.visible,onChange:m=>i({...f,visible:m.target.checked})})]})]}),e.jsxs(Je,{children:[e.jsx(te,{onClick:()=>g(null),children:"Cancel"}),e.jsx(te,{onClick:M,variant:"contained",children:"Update"})]})]})]})},cr=()=>{const n=Z(),t=H(bt),l=H(se),[r,o]=B.useState(""),d=[{mode:"marker",icon:e.jsx(al,{}),label:"Marker"},{mode:"polyline",icon:e.jsx(ul,{}),label:"Line"},{mode:"polygon",icon:e.jsx(Pl,{}),label:"Polygon"},{mode:"circle",icon:e.jsx(Yl,{}),label:"Circle"},{mode:"rectangle",icon:e.jsx(Wl,{}),label:"Rectangle"}],h=i=>{const p=i===t.mode?null:i;console.log("[DrawingTools UI] Button clicked:",{clickedMode:i,currentMode:t.mode,newMode:p}),n(Ie(p))},s=(i,p)=>{console.log("[DrawingTools] Style change:",{property:i,value:p}),console.log("[DrawingTools] Current style before update:",t.options.style);const x={style:{...t.options.style,[i]:p}};console.log("[DrawingTools] New options to dispatch:",x),n(Gt(x))},a=(i,p)=>{n(Gt({[i]:p}))},g=(i,p)=>{n(ti({[i]:p}))},f=l.filter(i=>i.type==="feature");return e.jsxs(C,{children:[e.jsxs(v,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(et,{}),"Drawing Tools"]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:1},children:"Drawing Mode"}),e.jsxs(E,{container:!0,spacing:1,children:[d.map(({mode:i,icon:p,label:x})=>e.jsx(E,{size:6,children:e.jsx(_e,{title:x,children:e.jsx(ft,{value:i||"",selected:t.mode===i,onClick:()=>h(i),sx:{width:"100%",height:48},size:"small",children:p})})},i)),e.jsx(E,{size:6,children:e.jsx(_e,{title:"Edit Features",children:e.jsx(ft,{value:"edit",selected:t.mode==="edit",onClick:()=>h("edit"),sx:{width:"100%",height:48},size:"small",children:e.jsx(et,{})})})}),e.jsx(E,{size:6,children:e.jsx(_e,{title:"Delete Features",children:e.jsx(ft,{value:"delete",selected:t.mode==="delete",onClick:()=>h("delete"),sx:{width:"100%",height:48},size:"small",color:"error",children:e.jsx(Ct,{})})})})]})]}),f.length>0&&e.jsx(Q,{sx:{p:2,mb:2},children:e.jsxs(N,{fullWidth:!0,size:"small",children:[e.jsx(O,{children:"Target Layer"}),e.jsx($,{value:r,label:"Target Layer",onChange:i=>o(i.target.value),children:f.map(i=>e.jsxs(F,{value:i.id,children:[i.name," (",i.features.length," features)"]},i.id))})]})}),t.mode&&t.mode!=="edit"&&t.mode!=="delete"&&e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Style Options"}),e.jsxs(C,{sx:{mb:2},children:[e.jsx(v,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Stroke Color"}),e.jsx(E,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(i=>e.jsx(E,{size:"auto",children:e.jsx(C,{sx:{width:32,height:32,backgroundColor:i,border:t.options.style.color===i?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("color",i)})},i))})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(C,{sx:{mb:2},children:[e.jsx(v,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:"Fill Color"}),e.jsx(E,{container:!0,spacing:1,children:["#3388ff","#ff6b35","#4caf50","#f44336","#9c27b0","#ff9800"].map(i=>e.jsx(E,{size:"auto",children:e.jsx(C,{sx:{width:32,height:32,backgroundColor:i,border:t.options.style.fillColor===i?"3px solid #000":"1px solid #ccc",borderRadius:1,cursor:"pointer"},onClick:()=>s("fillColor",i)})},i))})]}),e.jsxs(C,{sx:{mb:2},children:[e.jsxs(v,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Stroke Width: ",t.options.style.weight,"px"]}),e.jsx(tt,{value:t.options.style.weight||3,onChange:(i,p)=>s("weight",p),min:1,max:10,step:1,size:"small"})]}),(t.mode==="polygon"||t.mode==="circle"||t.mode==="rectangle")&&e.jsxs(C,{sx:{mb:2},children:[e.jsxs(v,{variant:"caption",color:"text.secondary",sx:{mb:1,display:"block"},children:["Fill Opacity: ",Math.round((t.options.style.fillOpacity||.3)*100),"%"]}),e.jsx(tt,{value:(t.options.style.fillOpacity||.3)*100,onChange:(i,p)=>s("fillOpacity",p/100),min:0,max:100,step:5,size:"small"})]})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Drawing Options"}),e.jsx(_,{control:e.jsx(J,{checked:t.options.snapToGrid||!1,onChange:i=>a("snapToGrid",i.target.checked),size:"small"}),label:"Snap to Grid",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.options.showMeasurements||!1,onChange:i=>a("showMeasurements",i.target.checked),size:"small"}),label:"Show Measurements",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.options.allowEdit||!1,onChange:i=>a("allowEdit",i.target.checked),size:"small"}),label:"Allow Editing",sx:{display:"flex"}})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Map Display"}),e.jsx(_,{control:e.jsx(J,{checked:!1,onChange:i=>g("showGrid",i.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:!0,onChange:i=>g("showCoordinates",i.target.checked),size:"small"}),label:"Show Coordinates",sx:{display:"flex"}})]}),t.mode&&e.jsxs(Q,{sx:{p:2,bgcolor:"primary.light",color:"primary.contrastText"},children:[e.jsxs(v,{variant:"subtitle2",sx:{mb:1},children:["Active: ",t.mode.charAt(0).toUpperCase()+t.mode.slice(1)," Mode"]}),e.jsxs(v,{variant:"caption",children:[t.mode==="marker"&&"Click on the map to place markers",t.mode==="polyline"&&"Click points to draw a line",t.mode==="polygon"&&"Click points to draw a polygon",t.mode==="circle"&&"Click and drag to draw a circle",t.mode==="rectangle"&&"Click and drag to draw a rectangle",t.mode==="edit"&&"Click features to edit them",t.mode==="delete"&&"Click features to delete them"]})]}),f.length===0&&e.jsxs(Q,{sx:{p:2,bgcolor:"warning.light",color:"warning.contrastText"},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:1},children:"No Feature Layers"}),e.jsx(v,{variant:"caption",children:"Create a feature layer first to start drawing."})]})]})},I=(n,t,l,r,o="medium",d="#333333")=>{const h=encodeURIComponent(r);return{id:n,name:t,category:l,url:`data:image/svg+xml,${h}`,size:o,color:d,anchor:o==="small"?[12,12]:o==="large"?[20,40]:[16,32],popupAnchor:[0,o==="small"?-12:o==="large"?-40:-32]}},dr=[I("fire-engine","Fire Engine","fire-apparatus",`<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#DC2626")],hr=[I("als-ambulance","ALS Ambulance","ems-units",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#1E40AF")],xr=[I("structure-fire","Structure Fire","incident-types",`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"medium","#22C55E")],gr=[I("fire-station","Fire Station","facilities",`<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"large","#1E40AF")],mt={"fire-apparatus":dr,"ems-units":hr,"incident-types":xr,facilities:gr,prevention:[I("fire-extinguisher","Fire Extinguisher","prevention",`<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`,"large","#6B7280")],custom:[]};Object.values(mt).flat();const fr={"fire-apparatus":e.jsx(vl,{}),"ems-units":e.jsx(Ol,{}),"incident-types":e.jsx(bl,{}),facilities:e.jsx(wl,{}),prevention:e.jsx(ml,{}),"energy-systems":e.jsx(Hl,{}),custom:e.jsx(lt,{})},pr=()=>{var c;const n=H(se),[t,l]=B.useState("fire-apparatus"),[r,o]=B.useState("medium"),[d,h]=B.useState("#DC2626"),[s,a]=B.useState(""),g=Object.keys(mt),i=(mt[t]||[]).filter(u=>u.name.toLowerCase().includes(s.toLowerCase())),p=n.filter(u=>u.type==="feature"),x=(u,y)=>{const D={...y,size:r,color:d};u.dataTransfer.setData("application/json",JSON.stringify(D)),u.dataTransfer.effectAllowed="copy";const M=u.currentTarget.cloneNode(!0);M.style.transform="scale(1.2)",M.style.opacity="0.8",document.body.appendChild(M),u.dataTransfer.setDragImage(M,16,16),setTimeout(()=>document.body.removeChild(M),0)},b=[{name:"Fire Red",value:"#DC2626"},{name:"EMS Blue",value:"#1E40AF"},{name:"Safety Green",value:"#059669"},{name:"Warning Orange",value:"#F59E0B"},{name:"Medical Cross",value:"#EF4444"},{name:"Industrial Gray",value:"#6B7280"},{name:"Hazmat Yellow",value:"#FCD34D"},{name:"Emergency Purple",value:"#7C3AED"}];return e.jsxs(C,{children:[e.jsxs(v,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(lt,{}),"Professional Icons"]}),e.jsx(U,{fullWidth:!0,size:"small",placeholder:"Search fire & EMS icons...",value:s,onChange:u=>a(u.target.value),InputProps:{startAdornment:e.jsx(si,{position:"start",children:e.jsx(yl,{})})},sx:{mb:2}}),e.jsx(jt,{value:t,onChange:(u,y)=>l(y),variant:"scrollable",scrollButtons:"auto",sx:{mb:2,minHeight:"auto"},children:g.map(u=>e.jsx(Re,{value:u,icon:fr[u],label:u.replace("-"," "),sx:{minHeight:"auto",py:1,fontSize:"0.75rem",textTransform:"capitalize"}},u))}),e.jsxs(Q,{sx:{p:2,mb:2,bgcolor:"grey.50"},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2,fontWeight:"bold"},children:"Icon Settings"}),e.jsxs(E,{container:!0,spacing:2,children:[e.jsx(E,{size:6,children:e.jsxs(N,{fullWidth:!0,size:"small",children:[e.jsx(O,{children:"Size"}),e.jsxs($,{value:r,label:"Size",onChange:u=>o(u.target.value),children:[e.jsx(F,{value:"small",children:"Small (20px)"}),e.jsx(F,{value:"medium",children:"Medium (32px)"}),e.jsx(F,{value:"large",children:"Large (48px)"}),e.jsx(F,{value:"extra-large",children:"Extra Large (64px)"})]})]})}),e.jsx(E,{size:6,children:e.jsxs(N,{fullWidth:!0,size:"small",children:[e.jsx(O,{children:"Color Theme"}),e.jsx($,{value:d,label:"Color Theme",onChange:u=>h(u.target.value),children:b.map(u=>e.jsx(F,{value:u.value,children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(C,{sx:{width:16,height:16,backgroundColor:u.value,borderRadius:"50%",border:"1px solid #ccc"}}),u.name]})},u.value))})]})})]})]}),e.jsxs(C,{sx:{mb:2},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsxs(v,{variant:"subtitle2",sx:{fontWeight:"bold",textTransform:"uppercase"},children:[t.replace("-"," ")," (",i.length,")"]}),e.jsx(Ee,{label:`${r} • ${(c=b.find(u=>u.value===d))==null?void 0:c.name}`,size:"small",color:"primary",variant:"outlined"})]}),i.length>0?e.jsx(E,{container:!0,spacing:1,children:i.map(u=>e.jsx(E,{size:4,children:e.jsx(_e,{title:`${u.name} - Drag to map`,children:e.jsxs(Q,{sx:{p:1,textAlign:"center",cursor:"grab",transition:"all 0.2s ease","&:hover":{bgcolor:"primary.light",transform:"scale(1.05)",boxShadow:2},"&:active":{cursor:"grabbing",transform:"scale(0.95)"}},draggable:!0,onDragStart:y=>x(y,u),children:[e.jsx(C,{component:"img",src:u.url,alt:u.name,sx:{width:r==="small"?20:r==="large"?40:32,height:r==="small"?20:r==="large"?40:32,mb:.5,filter:d!==u.color?`hue-rotate(${ur(u.color,d)}deg)`:"none"}}),e.jsx(v,{variant:"caption",sx:{display:"block",fontSize:"0.65rem",lineHeight:1.2,fontWeight:500},children:u.name})]})})},u.id))}):e.jsx(C,{sx:{textAlign:"center",py:4},children:e.jsx(v,{variant:"body2",color:"text.secondary",children:s?"No icons match your search":"No icons in this category"})})]}),p.length===0&&e.jsxs(We,{severity:"info",sx:{mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:1},children:"Create a layer first"}),e.jsx(v,{variant:"caption",children:"Go to the Layers tab and create a feature layer to place icons on the map."})]}),e.jsxs(Q,{sx:{p:2,bgcolor:"info.light",color:"info.contrastText"},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:1,fontWeight:"bold"},children:"How to Use"}),e.jsxs(C,{component:"ul",sx:{pl:2,m:0,"& li":{mb:.5}},children:[e.jsx("li",{children:"Select icon size and color above"}),e.jsx("li",{children:"Drag any icon from the library"}),e.jsx("li",{children:"Drop it on the map to place a marker"}),e.jsx("li",{children:"Click the marker to edit its properties"})]})]})]})};function ur(n,t){const l={"#DC2626":0,"#EF4444":5,"#F59E0B":45,"#FCD34D":60,"#059669":120,"#1E40AF":240,"#7C3AED":270,"#6B7280":0},r=l[n]||0;return(l[t]||0)-r}const yr=()=>{const n=Z(),t=()=>{n(ii())};return e.jsxs(C,{children:[e.jsxs(v,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(Fe,{}),"Export"]}),e.jsxs(Q,{sx:{p:2},children:[e.jsx(v,{variant:"body2",color:"text.secondary",sx:{mb:2},children:"Generate professional maps with the new export system"}),e.jsx(te,{variant:"contained",onClick:t,startIcon:e.jsx(Fe,{}),fullWidth:!0,children:"Open Export Options"})]})]})},mr=()=>{const n=Z(),t=H(it),l=o=>{n(Hi(o))},r=(o,d)=>{n(ti({[o]:d}))};return e.jsxs(C,{children:[e.jsxs(v,{variant:"h6",sx:{mb:2,display:"flex",alignItems:"center",gap:1},children:[e.jsx(ci,{}),"Settings"]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Base Map"}),e.jsxs(N,{fullWidth:!0,size:"small",children:[e.jsx(O,{children:"Base Map"}),e.jsx($,{value:t.activeBaseMap,label:"Base Map",onChange:o=>l(o.target.value),children:t.baseMaps.map(o=>e.jsx(F,{value:o.id,children:o.name},o.id))})]})]}),e.jsxs(Q,{sx:{p:2,mb:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Display Options"}),e.jsx(_,{control:e.jsx(J,{checked:t.showCoordinates,onChange:o=>r("showCoordinates",o.target.checked),size:"small"}),label:"Show Coordinates",sx:{mb:1,display:"flex"}}),e.jsx(_,{control:e.jsx(J,{checked:t.showGrid,onChange:o=>r("showGrid",o.target.checked),size:"small"}),label:"Show Grid",sx:{mb:1,display:"flex"}})]}),e.jsxs(Q,{sx:{p:2},children:[e.jsx(v,{variant:"subtitle2",sx:{mb:2},children:"Measurement Units"}),e.jsxs(N,{fullWidth:!0,size:"small",children:[e.jsx(O,{children:"Units"}),e.jsxs($,{value:t.measurementUnits,label:"Units",onChange:o=>r("measurementUnits",o.target.value),children:[e.jsx(F,{value:"metric",children:"Metric (m, km)"}),e.jsx(F,{value:"imperial",children:"Imperial (ft, mi)"})]})]})]})]})},wr=({mode:n})=>{const t=Z(),l=H(li),r=[{id:"layers",label:"Layers",icon:e.jsx(Pe,{}),component:sr},{id:"drawing",label:"Drawing",icon:e.jsx(et,{}),component:cr,disabled:n==="view"},{id:"icons",label:"Icons",icon:e.jsx(lt,{}),component:pr,disabled:n==="view"},{id:"export",label:"Export",icon:e.jsx(Fe,{}),component:yr},{id:"settings",label:"Settings",icon:e.jsx(ci,{}),component:mr}],o=(s,a)=>{t(Ni(a))},h=(r.find(s=>s.id===l.activePanel)||r[0]).component;return e.jsxs(C,{sx:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx(Q,{elevation:0,sx:{borderBottom:1,borderColor:"divider"},children:e.jsx(jt,{value:l.activePanel||"layers",onChange:o,variant:"scrollable",scrollButtons:"auto",orientation:"horizontal",sx:{minHeight:48,"& .MuiTab-root":{minWidth:60,minHeight:48}},children:r.map(s=>e.jsx(Re,{value:s.id,icon:s.icon,label:s.label,disabled:s.disabled,sx:{fontSize:"0.75rem","&.Mui-selected":{color:"primary.main"}}},s.id))})}),e.jsx(C,{sx:{flex:1,overflow:"auto",p:2},children:e.jsx(h,{})})]})},br=()=>{const n=Z(),t=()=>{n(Oi())};return e.jsxs(Ze,{open:!0,onClose:t,maxWidth:"md",fullWidth:!0,children:[e.jsx(qe,{sx:{textAlign:"center",pb:1},children:"Welcome to Fire Map Pro"}),e.jsxs(Ke,{children:[e.jsx(v,{variant:"h6",sx:{mb:2,textAlign:"center",color:"primary.main"},children:"Professional Mapping for Fire & EMS Operations"}),e.jsxs(v,{variant:"body1",paragraph:!0,children:[e.jsx("strong",{children:"Ready to use immediately:"})," Your map is pre-loaded with fire stations, hospitals, hydrants, and recent incidents to provide instant situational awareness."]}),e.jsx(v,{variant:"body1",paragraph:!0,children:e.jsx("strong",{children:"Key Features:"})}),e.jsxs(C,{component:"ul",sx:{pl:2,mb:2},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Live Data Layers:"})," Fire stations, hospitals, hydrants, response zones"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Drawing Tools:"})," Add markers, areas, and annotations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Icon Library:"})," Professional fire & EMS symbols"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Layer Controls:"})," Toggle visibility and adjust transparency"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Export Options:"})," Generate professional maps and reports"]})]}),e.jsx(v,{variant:"body2",color:"text.secondary",sx:{textAlign:"center"},children:"Click layers in the sidebar to explore your operational data →"})]}),e.jsx(Je,{sx:{justifyContent:"center",pb:3},children:e.jsx(te,{onClick:t,variant:"contained",size:"large",children:"Start Mapping"})})]})};class vr{static async exportMap(t,l,r){console.error("[EMERGENCY DEBUG] ExportService.exportMap() STARTED"),console.error("[EMERGENCY DEBUG] Configuration received:",l);const{basic:o}=l;try{if(console.error("[EMERGENCY DEBUG] Starting export process..."),r==null||r(10,"Preparing export..."),!t)throw new Error("Map element not found");switch(r==null||r(20,"Capturing map data..."),console.error("[EMERGENCY DEBUG] Routing to format:",o.format),o.format){case"png":case"jpg":case"tiff":case"webp":console.error("[EMERGENCY DEBUG] Calling exportRasterImage"),await this.exportRasterImage(t,l,r),console.error("[EMERGENCY DEBUG] exportRasterImage completed");break;case"pdf":await this.exportPDF(t,l,r);break;case"svg":await this.exportSVG(t,l,r);break;case"eps":await this.exportEPS(t,l,r);break;case"geojson":case"kml":case"geopdf":await this.exportGISFormat(t,l,r);break;default:throw new Error(`Export format ${o.format} not supported`)}r==null||r(100,"Export completed successfully")}catch(d){throw console.error("Export failed:",d),d}}static async exportRasterImage(t,l,r){console.error("[EMERGENCY DEBUG] exportRasterImage() STARTED");const{basic:o,layout:d}=l;console.error("[EMERGENCY DEBUG] Basic config:",o),console.error("[EMERGENCY DEBUG] Layout config:",d),r==null||r(30,"Capturing map screenshot..."),console.error("[EMERGENCY DEBUG] About to capture map with html2canvas"),console.error("[EMERGENCY DEBUG] Map element:",t),console.error("[EMERGENCY DEBUG] Map element dimensions:",{width:t.offsetWidth,height:t.offsetHeight,innerHTML:t.innerHTML.substring(0,200)+"..."});const{default:h}=await Ut(async()=>{const{default:i}=await import("./html2canvas.esm-CBrSDip1.js");return{default:i}},[]),s=await h(t,{useCORS:!0,allowTaint:!0,scale:o.dpi/96,backgroundColor:"#ffffff"});console.error("[EMERGENCY DEBUG] html2canvas completed, canvas size:",{width:s.width,height:s.height}),console.error("[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout"),r==null||r(60,"Processing layout elements..."),console.log("[Export] Full export configuration:",{basic:l.basic,layout:{customLayout:d.customLayout,selectedTemplate:d.selectedTemplate,elementsCount:d.elements.length,elements:d.elements}});let a=s;if(d.customLayout&&(d.selectedTemplate||d.elements.length>0)){console.log("[Export] Applying custom layout with",d.elements.length,"elements"),console.error("[EMERGENCY DEBUG] About to call applyLayoutTemplate");try{a=await this.applyLayoutTemplate(s,l),console.error("[EMERGENCY DEBUG] applyLayoutTemplate completed successfully"),console.error("[EMERGENCY DEBUG] Returned final canvas dimensions:",a.width,"x",a.height),console.error("[EMERGENCY DEBUG] Layout template applied successfully")}catch(i){throw console.error("[EMERGENCY DEBUG] applyLayoutTemplate FAILED:",i),i}}else console.log("[Export] Using basic layout - no custom elements");r==null||r(80,"Generating final image...");const g=o.format==="jpg"?"jpeg":o.format,f=o.format==="jpg"?.9:void 0;console.error("[EMERGENCY DEBUG] Final canvas before conversion:",{canvasSize:{width:a.width,height:a.height},format:g,quality:f}),console.error("[EMERGENCY DEBUG] Ready to convert canvas to blob"),a.toBlob(i=>{console.error("[EMERGENCY DEBUG] toBlob callback executed, blob size:",i==null?void 0:i.size),i?(console.error("[EMERGENCY DEBUG] Downloading blob with filename:",`${o.title||"fire-map"}.${o.format}`),this.downloadBlob(i,`${o.title||"fire-map"}.${o.format}`)):console.error("[EMERGENCY DEBUG] toBlob failed - blob is null!")},`image/${g}`,f)}static async exportPDF(t,l,r){const{basic:o,advanced:d,layout:h}=l;r==null||r(30,"Capturing map for PDF...");const{default:s}=await Ut(async()=>{const{default:c}=await import("./html2canvas.esm-CBrSDip1.js");return{default:c}},[]),a=await s(t,{useCORS:!0,allowTaint:!0,scale:o.dpi/96});r==null||r(50,"Creating PDF document...");const{width:g,height:f}=this.getPaperDimensions(o.paperSize,o.orientation),i=new fl({orientation:o.orientation,unit:"mm",format:o.paperSize==="custom"?[d.customWidth,d.customHeight]:o.paperSize});r==null||r(70,"Adding elements to PDF...");const p=a.toDataURL("image/png"),x=g-20,b=a.height*x/a.width;i.addImage(p,"PNG",10,10,x,b),o.includeTitle&&o.title&&(i.setFontSize(16),i.text(o.title,g/2,b+25,{align:"center"})),o.subtitle&&(i.setFontSize(12),i.text(o.subtitle,g/2,b+35,{align:"center"})),h.customLayout&&h.elements.length>0&&await this.addLayoutElementsToPDF(i,h.elements,{width:g,height:f}),r==null||r(90,"Finalizing PDF..."),i.save(`${o.title||"fire-map"}.pdf`)}static async exportSVG(t,l,r){throw r==null||r(50,"Generating SVG..."),new Error("SVG export is not yet implemented. Please use PNG or PDF format.")}static async exportEPS(t,l,r){throw new Error("EPS export is not yet implemented. Please use PNG or PDF format.")}static async exportGISFormat(t,l,r){throw new Error("GIS format export is not yet implemented. Please use PNG or PDF format.")}static async applyLayoutTemplate(t,l){console.error("[EMERGENCY DEBUG] applyLayoutTemplate ENTRY");const{basic:r,layout:o}=l;console.error("[EMERGENCY DEBUG] Getting paper dimensions for:",r.paperSize,r.orientation);const{width:d,height:h}=this.getPaperDimensions(r.paperSize,r.orientation);console.error("[EMERGENCY DEBUG] Paper dimensions:",{width:d,height:h});const s=document.createElement("canvas"),a=s.getContext("2d",{willReadFrequently:!0}),g=d/25.4*r.dpi,f=h/25.4*r.dpi;switch(s.width=g,s.height=f,console.error("[EMERGENCY DEBUG] Layout canvas dimensions:",s.width,"x",s.height),console.error("[EMERGENCY DEBUG] Map canvas dimensions:",t.width,"x",t.height),console.error("[EMERGENCY DEBUG] Layout canvas setup complete"),a.fillStyle="#ffffff",a.fillRect(0,0,g,f),console.error("[EMERGENCY DEBUG] Layout canvas created:",{pixelSize:{width:g,height:f},paperSize:{width:d,height:h},dpi:r.dpi,mapCanvasSize:{width:t.width,height:t.height}}),console.log("[Export] Applying layout template:",o.selectedTemplate),o.selectedTemplate){case"standard":console.log("[Export] Using standard template with custom layout"),await this.applyCustomLayout(a,t,l,g,f);break;case"professional":console.log("[Export] Using professional template"),await this.applyProfessionalTemplate(a,t,l,g,f);break;case"presentation":console.log("[Export] Using presentation template"),await this.applyPresentationTemplate(a,t,l,g,f);break;case"tactical":console.log("[Export] Using tactical template"),await this.applyTacticalTemplate(a,t,l,g,f);break;default:console.log("[Export] Using custom layout with elements"),await this.applyCustomLayout(a,t,l,g,f)}return console.error("[EMERGENCY DEBUG] Layout canvas complete - returning to caller"),s}static async applyProfessionalTemplate(t,l,r,o,d){console.log("[Export] Professional template using custom layout logic"),await this.applyCustomLayout(t,l,r,o,d)}static async applyPresentationTemplate(t,l,r,o,d){console.log("[Export] Presentation template using custom layout logic"),await this.applyCustomLayout(t,l,r,o,d)}static async applyTacticalTemplate(t,l,r,o,d){console.log("[Export] Tactical template using custom layout logic"),await this.applyCustomLayout(t,l,r,o,d)}static async applyCustomLayout(t,l,r,o,d){var g,f,i,p,x,b,c,u,y,D,M,j,k,T,m,z,S,X,ee,ie,ke,De,Be,Se,Me,Le,Ae,Te,ze,Y,be,oe,fe,pe,rt,ot,Ge,Et,Ft,kt,Dt;console.error("[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT"),console.error("[EMERGENCY DEBUG] Canvas size:",{width:o,height:d});const{layout:h,basic:s}=r;console.error("[EMERGENCY DEBUG] Configuration received:",{layout:h,basic:s}),console.log("[Export] Layout data:",{elementsCount:h.elements.length,elements:h.elements.map(w=>({type:w.type,visible:w.visible,id:w.id}))});const a=[...h.elements].sort((w,L)=>w.zIndex-L.zIndex);console.log("[Export] Processing",a.length,"layout elements:",a.map(w=>({type:w.type,visible:w.visible})));for(const w of a){if(console.log("[Export] Processing element:",{type:w.type,visible:w.visible,position:{x:w.x,y:w.y},size:{width:w.width,height:w.height},content:w.content}),!w.visible){console.log("[Export] Skipping invisible element:",w.type);continue}const L=w.x/100*o,P=w.y/100*d,A=w.width/100*o,W=w.height/100*d;switch(console.error("[CANVAS DEBUG] Element",w.type,"position:",{x:L,y:P,w:A,h:W},"Canvas:",{width:o,height:d}),console.log("[Export] Rendering element:",w.type,"at",{x:L,y:P,w:A,h:W}),w.type){case"map":console.error("[EMERGENCY DEBUG] Drawing map canvas:",{mapCanvasSize:{width:l.width,height:l.height},drawPosition:{x:L,y:P,w:A,h:W},layoutCanvasSize:{width:t.canvas.width,height:t.canvas.height},elementPosition:{x:w.x,y:w.y,width:w.width,height:w.height}}),console.error("[EMERGENCY DEBUG] Drawing map canvas to layout"),t.drawImage(l,L,P,A,W),console.error("[EMERGENCY DEBUG] Map canvas drawn to layout canvas");break;case"title":console.log("[Export] Title element debug:",{elementContent:w.content,textAlign:(g=w.content)==null?void 0:g.textAlign,elementType:w.type}),t.fillStyle=((f=w.content)==null?void 0:f.color)||"#333333";const Bt=((i=w.content)==null?void 0:i.fontSize)||Math.max(16,A*.05),xi=((p=w.content)==null?void 0:p.fontWeight)||"bold";t.font=`${xi} ${Bt}px ${((x=w.content)==null?void 0:x.fontFamily)||"Arial"}`,t.textAlign=((b=w.content)==null?void 0:b.textAlign)||"left",console.log("[Export] Title canvas textAlign set to:",t.textAlign);let Ue=L;t.textAlign==="center"?Ue=L+A/2:t.textAlign==="right"&&(Ue=L+A),console.log("[Export] Title position:",{originalX:L,adjustedX:Ue,width:A,alignment:t.textAlign}),t.fillText(((c=w.content)==null?void 0:c.text)||s.title||"Untitled Map",Ue,P+Bt);break;case"subtitle":console.log("[Export] Rendering subtitle:",{elementContent:w.content,basicSubtitle:s.subtitle,finalText:((u=w.content)==null?void 0:u.text)||s.subtitle||"Map Subtitle"}),t.fillStyle=((y=w.content)==null?void 0:y.color)||"#666666";const nt=((D=w.content)==null?void 0:D.fontSize)||Math.max(12,A*.04),gi=((M=w.content)==null?void 0:M.fontWeight)||"normal";t.font=`${gi} ${nt}px ${((j=w.content)==null?void 0:j.fontFamily)||"Arial"}`,t.textAlign=((k=w.content)==null?void 0:k.textAlign)||"left";const St=((T=w.content)==null?void 0:T.text)||s.subtitle||"Map Subtitle";let He=L;t.textAlign==="center"?He=L+A/2:t.textAlign==="right"&&(He=L+A),console.log("[Export] Drawing subtitle text:",St,"at position:",{x:He,y:P+nt}),console.log("[Export] Subtitle canvas state:",{fillStyle:t.fillStyle,font:t.font,textAlign:t.textAlign,canvasSize:{width:t.canvas.width,height:t.canvas.height},elementBounds:{x:L,y:P,w:A,h:W}}),t.fillText(St,He,P+nt);break;case"text":t.fillStyle=((m=w.content)==null?void 0:m.color)||"#333333";const at=((z=w.content)==null?void 0:z.fontSize)||Math.max(12,A*.03),fi=((S=w.content)==null?void 0:S.fontWeight)||"normal";t.font=`${fi} ${at}px ${((X=w.content)==null?void 0:X.fontFamily)||"Arial"}`,t.textAlign=((ee=w.content)==null?void 0:ee.textAlign)||"left";const pi=(((ie=w.content)==null?void 0:ie.text)||"").split(`
`),ui=at*1.2;pi.forEach((q,K)=>{t.fillText(q,L,P+at+K*ui)});break;case"legend":t.strokeStyle=((ke=w.content)==null?void 0:ke.borderColor)||"#cccccc",t.fillStyle=((De=w.content)==null?void 0:De.backgroundColor)||"#ffffff",t.fillRect(L,P,A,W),w.showLegendBorder!==!1&&t.strokeRect(L,P,A,W),t.fillStyle=((Be=w.content)==null?void 0:Be.color)||"#333333";const st=((Se=w.content)==null?void 0:Se.fontSize)||Math.max(12,A*.04),yi=((Me=w.content)==null?void 0:Me.fontWeight)||"bold";t.font=`${yi} ${st}px ${((Le=w.content)==null?void 0:Le.fontFamily)||"Arial"}`,t.textAlign=((Ae=w.content)==null?void 0:Ae.textAlign)||"left";const mi=w.legendTitle||((Te=w.content)==null?void 0:Te.text)||"Legend";t.fillText(mi,L+10,P+st+5);const Mt=w.legendStyle||"standard",Lt=P+st+20,wi=16,bi=18;Mt==="detailed"?[{color:"#ff4444",label:"Fire Stations"},{color:"#4444ff",label:"Hydrants"},{color:"#44ff44",label:"EMS Units"},{color:"#ffaa44",label:"Incidents"}].forEach((K,Ce)=>{const je=Lt+Ce*bi;je+wi<P+W-10&&(t.fillStyle=K.color,t.fillRect(L+10,je,12,12),t.strokeStyle="#333",t.strokeRect(L+10,je,12,12),t.fillStyle="#333333",t.font=`${Math.max(10,A*.025)}px Arial`,t.fillText(K.label,L+28,je+10))}):Mt==="compact"&&(t.fillStyle="#333333",t.font=`${Math.max(9,A*.02)}px Arial`,t.fillText("Map elements and symbols",L+10,Lt));break;case"north-arrow":const ct=w.arrowStyle||"classic",At=w.rotation||0,ve=((ze=w.content)==null?void 0:ze.color)||"#333333";console.log("[Export] Rendering north arrow:",{arrowStyle:ct,rotation:At,arrowColor:ve,elementProperties:w,position:{x:L,y:P,w:A,h:W}}),t.strokeStyle=ve,t.fillStyle=ve,t.lineWidth=2;const dt=L+A/2,ht=P+W/2,R=Math.min(A,W)*.3;switch(t.save(),t.translate(dt,ht),t.rotate(At*Math.PI/180),ct){case"classic":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/3,R/3),t.lineTo(0,0),t.lineTo(R/3,R/3),t.closePath(),t.fill(),t.beginPath(),t.moveTo(0,0),t.lineTo(0,R),t.stroke();break;case"modern":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,R/4),t.lineTo(0,R/8),t.lineTo(R/4,R/4),t.closePath(),t.fill();break;case"simple":t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/2,R/2),t.lineTo(R/2,R/2),t.closePath(),t.fill();break;case"compass":t.fillStyle="#cc0000",t.beginPath(),t.moveTo(0,-R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.fillStyle="#ffffff",t.strokeStyle=ve,t.beginPath(),t.moveTo(0,R),t.lineTo(-R/4,0),t.lineTo(R/4,0),t.closePath(),t.fill(),t.stroke(),t.fillStyle=ve,t.beginPath(),t.moveTo(-R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill(),t.beginPath(),t.moveTo(R*.7,0),t.lineTo(0,-R/4),t.lineTo(0,R/4),t.closePath(),t.fill();break}t.restore(),console.log("[Export] North arrow rendered, adding label"),ct!=="compass"&&(t.fillStyle=ve,t.font=`bold ${Math.max(10,R*.6)}px Arial`,t.textAlign="center",t.fillText("N",dt,ht+R+15),console.log('[Export] North arrow "N" label drawn at:',{x:dt,y:ht+R+15}));break;case"scale-bar":const vi=w.units||"feet",Tt=w.scaleStyle||"bar",Ne=w.divisions||4,Ci=((Y=r.mapView)==null?void 0:Y.center)||{latitude:40},ji=((be=r.mapView)==null?void 0:be.zoom)||10,Ei=this.calculateMetersPerPixel(ji,Ci.latitude),zt=this.getScaleBarInfo(Ei,vi,A*.8);t.strokeStyle=((oe=w.content)==null?void 0:oe.color)||"#333333",t.fillStyle=((fe=w.content)==null?void 0:fe.color)||"#333333",t.lineWidth=2;const ne=P+W/2,ue=zt.pixelLength,ye=L+(A-ue)/2;if(Tt==="alternating"){const q=ue/Ne;for(let K=0;K<Ne;K++){const Ce=ye+K*q;t.fillStyle=K%2===0?"#333333":"#ffffff",t.fillRect(Ce,ne-3,q,6),t.strokeStyle="#333333",t.strokeRect(Ce,ne-3,q,6)}}else{Tt==="bar"&&(t.fillStyle="#ffffff",t.fillRect(ye,ne-3,ue,6),t.strokeRect(ye,ne-3,ue,6)),t.strokeStyle=((pe=w.content)==null?void 0:pe.color)||"#333333",t.beginPath(),t.moveTo(ye,ne),t.lineTo(ye+ue,ne),t.stroke(),t.beginPath();for(let q=0;q<=Ne;q++){const K=ye+q*ue/Ne;t.moveTo(K,ne-5),t.lineTo(K,ne+5)}t.stroke()}t.fillStyle=((rt=w.content)==null?void 0:rt.color)||"#333333",t.font=`${Math.max(10,W*.3)}px Arial`,t.textAlign="center",t.fillText(zt.label,ye+ue/2,ne+20);break;case"image":if((ot=w.content)!=null&&ot.imageSrc){const q=((Ge=w.content)==null?void 0:Ge.imageFit)||"cover";await this.drawImageFromSrc(t,w.content.imageSrc,L,P,A,W,q)}else t.strokeStyle="#cccccc",t.fillStyle="#f5f5f5",t.fillRect(L,P,A,W),t.strokeRect(L,P,A,W),t.fillStyle="#999999",t.font=`${Math.max(12,A*.05)}px Arial`,t.textAlign="center",t.fillText("Image",L+A/2,P+W/2);break;case"shape":const It=w.strokeColor||((Et=w.content)==null?void 0:Et.borderColor)||"#333333",me=w.fillColor||((Ft=w.content)==null?void 0:Ft.backgroundColor)||"transparent",Pt=w.strokeWidth||((kt=w.content)==null?void 0:kt.borderWidth)||1,Rt=w.shapeType||((Dt=w.content)==null?void 0:Dt.shapeType)||"rectangle";switch(console.log("[Export] Rendering shape:",{shapeType:Rt,shapeStrokeColor:It,shapeFillColor:me,shapeStrokeWidth:Pt,elementProperties:w,position:{x:L,y:P,w:A,h:W}}),t.strokeStyle=It,t.fillStyle=me,t.lineWidth=Pt,Rt){case"rectangle":me!=="transparent"&&t.fillRect(L,P,A,W),t.strokeRect(L,P,A,W);break;case"circle":const q=Math.min(A,W)/2,K=L+A/2,Ce=P+W/2;t.beginPath(),t.arc(K,Ce,q,0,2*Math.PI),me!=="transparent"&&t.fill(),t.stroke();break;case"ellipse":const je=L+A/2,Fi=P+W/2,ki=A/2,Di=W/2;t.beginPath(),t.ellipse(je,Fi,ki,Di,0,0,2*Math.PI),me!=="transparent"&&t.fill(),t.stroke();break;case"triangle":const Bi=L+A/2,Si=P,Wt=P+W;t.beginPath(),t.moveTo(Bi,Si),t.lineTo(L,Wt),t.lineTo(L+A,Wt),t.closePath(),me!=="transparent"&&t.fill(),t.stroke();break;case"line":t.beginPath(),t.moveTo(L,P+W/2),t.lineTo(L+A,P+W/2),t.stroke();break;default:me!=="transparent"&&t.fillRect(L,P,A,W),t.strokeRect(L,P,A,W);break}break;default:console.warn("[Export] Unknown element type:",w.type);break}console.error("[EMERGENCY DEBUG] Element rendered successfully:",w.type),console.log("[Export] Finished rendering element:",w.type)}console.log("[Export] Completed rendering all",a.length,"elements")}static async addLayoutElementsToPDF(t,l,r){var o,d;for(const h of l)switch(h.type){case"text":t.text(((o=h.content)==null?void 0:o.text)||"",h.x,h.y);break;case"image":(d=h.content)!=null&&d.imageSrc&&t.addImage(h.content.imageSrc,"PNG",h.x,h.y,h.width,h.height);break}}static async drawImageFromSrc(t,l,r,o,d,h,s="cover"){try{let a;l instanceof File?a=URL.createObjectURL(l):a=l;const g=new Image;return g.crossOrigin="anonymous",new Promise(f=>{g.onload=()=>{let i=r,p=o,x=d,b=h;const c=g.width/g.height,u=d/h;switch(s){case"contain":c>u?(b=d/c,p=o+(h-b)/2):(x=h*c,i=r+(d-x)/2);break;case"cover":c>u?(x=h*c,i=r-(x-d)/2):(b=d/c,p=o-(b-h)/2);break;case"fill":break;case"scale-down":g.width>d||g.height>h?c>u?(b=d/c,p=o+(h-b)/2):(x=h*c,i=r+(d-x)/2):(x=g.width,b=g.height,i=r+(d-x)/2,p=o+(h-b)/2);break}s==="cover"?(t.save(),t.beginPath(),t.rect(r,o,d,h),t.clip(),t.drawImage(g,i,p,x,b),t.restore()):t.drawImage(g,i,p,x,b),l instanceof File&&URL.revokeObjectURL(a),f()},g.onerror=()=>{console.warn("[Export] Failed to load image:",a),t.strokeStyle="#ccc",t.fillStyle="#f5f5f5",t.fillRect(r,o,d,h),t.strokeRect(r,o,d,h),t.fillStyle="#999",t.font="12px Arial",t.textAlign="center",t.fillText("Failed to load",r+d/2,o+h/2-6),t.fillText("image",r+d/2,o+h/2+6),l instanceof File&&URL.revokeObjectURL(a),f()},g.src=a})}catch(a){console.error("[Export] Error drawing image:",a)}}static getPaperDimensions(t,l){let r,o;switch(t){case"letter":r=215.9,o=279.4;break;case"a4":r=210,o=297;break;case"legal":r=215.9,o=355.6;break;case"tabloid":r=279.4,o=431.8;break;default:r=215.9,o=279.4}return l==="landscape"&&([r,o]=[o,r]),{width:r,height:o}}static calculateMetersPerPixel(t,l){const h=40075017/(256*Math.pow(2,t)),s=l*Math.PI/180;return h*Math.cos(s)}static getScaleBarInfo(t,l,r){const o=t*r;let d,h,s;switch(l){case"feet":s=3.28084,h="ft",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break;case"miles":s=621371e-9,h="mi",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"kilometers":s=.001,h="km",d=[.1,.25,.5,1,2,5,10,25,50,100];break;case"meters":default:s=1,h="m",d=[1,2,5,10,25,50,100,250,500,1e3,2500,5e3];break}const a=o*s;let g=d[0];for(const x of d)if(x<=a*.8)g=x;else break;const i=g/s/t;let p;if(g<1)p=`${g.toFixed(1)} ${h}`;else if(g>=1e3&&(l==="feet"||l==="meters")){const x=l==="feet"?"mi":"km",c=g/(l==="feet"?5280:1e3);p=`${c.toFixed(c<1?1:0)} ${x}`}else p=`${g} ${h}`;return{pixelLength:Math.round(i),label:p}}static downloadBlob(t,l){const r=URL.createObjectURL(t),o=document.createElement("a");o.href=r,o.download=l,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(r)}}const Cr=({isActive:n,configuration:t,disabled:l=!1})=>{const r=Z(),o=t.basic,d=H(c=>c.fireMapPro.export.configuration.layout.elements),[h,s]=B.useState(null),a=c=>u=>{const y=u.target.type==="checkbox"?u.target.checked:u.target.value;r(Ht({[c]:y}))},g=c=>{var y;const u=(y=c.target.files)==null?void 0:y[0];if(u&&u.type.startsWith("image/")){const D=new FileReader;D.onload=M=>{var k;const j=(k=M.target)==null?void 0:k.result;s(j),r(Ht({logo:u}))},D.readAsDataURL(u)}},f=()=>{console.log("[BasicExportTab] Manual apply clicked!",{title:o.title,subtitle:o.subtitle}),console.log("[BasicExportTab] Current layout elements:",d);let c=d.find(y=>y.type==="title"),u=d.find(y=>y.type==="subtitle");if(o.title)if(c)console.log("[BasicExportTab] Updating existing title element"),r(Xe({id:c.id,updates:{content:{...c.content,text:o.title}}}));else{console.log("[BasicExportTab] Creating new title element");const y={type:"title",x:10,y:5,width:80,height:8,zIndex:10,content:{text:o.title,fontSize:18,fontFamily:"Arial",fontWeight:"bold",color:"#333333",textAlign:"center"},visible:!0};r(ut(y))}if(o.subtitle)if(u)console.log("[BasicExportTab] Updating existing subtitle element"),r(Xe({id:u.id,updates:{content:{...u.content,text:o.subtitle}}}));else{console.log("[BasicExportTab] Creating new subtitle element");const y={type:"subtitle",x:10,y:15,width:80,height:6,zIndex:9,content:{text:o.subtitle,fontSize:14,fontFamily:"Arial",fontWeight:"normal",color:"#666666",textAlign:"center"},visible:!0};r(ut(y))}},i=[{value:"png",label:"PNG Image",group:"Raster Formats"},{value:"jpg",label:"JPEG Image",group:"Raster Formats"},{value:"tiff",label:"TIFF Image",group:"Raster Formats"},{value:"webp",label:"WebP Image",group:"Raster Formats"},{value:"pdf",label:"PDF Document",group:"Vector Formats"},{value:"svg",label:"SVG Vector",group:"Vector Formats"},{value:"eps",label:"EPS Vector",group:"Vector Formats"},{value:"geojson",label:"GeoJSON",group:"GIS Formats"},{value:"kml",label:"KML",group:"GIS Formats"},{value:"geopdf",label:"GeoPDF",group:"GIS Formats"}],p=[{value:96,label:"Standard (96 DPI)"},{value:150,label:"Medium (150 DPI)"},{value:300,label:"High (300 DPI)"},{value:450,label:"Very High (450 DPI)"},{value:600,label:"Ultra High (600 DPI)"}],x=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"legal",label:'Legal (8.5" × 14")'},{value:"tabloid",label:'Tabloid (11" × 17")'},{value:"a4",label:"A4 (210mm × 297mm)"},{value:"a3",label:"A3 (297mm × 420mm)"},{value:"a2",label:"A2 (420mm × 594mm)"},{value:"a1",label:"A1 (594mm × 841mm)"},{value:"a0",label:"A0 (841mm × 1189mm)"},{value:"custom",label:"Custom Size"}],b=i.reduce((c,u)=>(c[u.group]||(c[u.group]=[]),c[u.group].push(u),c),{});return n?e.jsx(C,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(E,{container:!0,spacing:3,children:[e.jsx(E,{size:12,children:e.jsx(v,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Map Information"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(U,{fullWidth:!0,label:"Map Title",value:o.title,onChange:a("title"),disabled:l,placeholder:"My Fire Department Map",helperText:"Title that will appear on the exported map"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(U,{fullWidth:!0,label:"Subtitle (optional)",value:o.subtitle,onChange:a("subtitle"),disabled:l,placeholder:"Created by Fire Prevention Division",helperText:"Optional subtitle for additional context"})}),e.jsxs(E,{size:12,children:[e.jsx(te,{variant:"contained",color:"primary",onClick:f,disabled:l||!o.title&&!o.subtitle,sx:{mt:1},children:"Apply Title/Subtitle to Layout"}),e.jsx(v,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Click to add your title and subtitle to the Layout Designer"})]}),e.jsxs(E,{size:12,children:[e.jsx(v,{variant:"subtitle2",gutterBottom:!0,children:"Department Logo"}),e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsxs(te,{variant:"outlined",component:"label",startIcon:e.jsx(cl,{}),disabled:l,children:["Choose Logo",e.jsx("input",{type:"file",hidden:!0,accept:"image/*",onChange:g})]}),h&&e.jsx(zl,{src:h,variant:"rounded",sx:{width:60,height:60},children:e.jsx(hi,{})}),!h&&e.jsx(v,{variant:"body2",color:"text.secondary",children:"No logo selected"})]})]}),e.jsx(E,{size:12,children:e.jsx(ge,{sx:{my:1}})}),e.jsx(E,{size:12,children:e.jsx(v,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Export Settings"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Export Format"}),e.jsx($,{value:o.format,label:"Export Format",onChange:a("format"),children:Object.entries(b).map(([c,u])=>[e.jsx(F,{disabled:!0,sx:{fontWeight:"bold",bgcolor:"action.hover"},children:c},c),...u.map(y=>e.jsx(F,{value:y.value,sx:{pl:3},children:y.label},y.value))])})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Resolution (DPI)"}),e.jsx($,{value:String(o.dpi),label:"Resolution (DPI)",onChange:a("dpi"),children:p.map(c=>e.jsx(F,{value:c.value,children:c.label},c.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Print Size"}),e.jsx($,{value:o.paperSize,label:"Print Size",onChange:a("paperSize"),children:x.map(c=>e.jsx(F,{value:c.value,children:c.label},c.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Orientation"}),e.jsxs($,{value:o.orientation,label:"Orientation",onChange:a("orientation"),children:[e.jsx(F,{value:"portrait",children:"Portrait"}),e.jsx(F,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(E,{size:12,children:e.jsx(ge,{sx:{my:1}})}),e.jsxs(E,{size:12,children:[e.jsx(v,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Layout Elements"}),e.jsx(v,{variant:"body2",color:"text.secondary",gutterBottom:!0,children:"Select which elements to include in your exported map"})]}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:o.includeLegend,onChange:a("includeLegend"),disabled:l}),label:"Include Legend"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:o.includeScale,onChange:a("includeScale"),disabled:l}),label:"Include Scale Bar"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:o.includeNorth,onChange:a("includeNorth"),disabled:l}),label:"Include North Arrow"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:o.includeTitle,onChange:a("includeTitle"),disabled:l}),label:"Include Title Banner"})}),e.jsx(E,{size:12,children:e.jsx(We,{severity:"info",sx:{mt:2},children:e.jsxs(v,{variant:"body2",children:[e.jsx("strong",{children:"Quick Start:"})," Enter a title, select your preferred format (PNG for images, PDF for documents), and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs."]})})})]})}):null},jr=({isActive:n,configuration:t,disabled:l=!1})=>{const r=Z(),o=H(se),d=t.advanced,h=i=>p=>{const x=p.target.type==="checkbox"?p.target.checked:p.target.value;r(xt({[i]:x}))},s=i=>p=>{const x=parseFloat(p.target.value)||0;r(xt({[i]:x}))},a=i=>{const p=d.selectedLayers,x=p.includes(i)?p.filter(b=>b!==i):[...p,i];r(xt({selectedLayers:x}))},g=[{value:"srgb",label:"sRGB (Default)"},{value:"adobergb",label:"Adobe RGB"},{value:"cmyk-swop",label:"CMYK SWOP (U.S.)"},{value:"cmyk-fogra",label:"CMYK FOGRA39 (Europe)"},{value:"custom",label:"Custom Profile..."}],f=[{value:"letter",label:'Letter (8.5" × 11")'},{value:"a4",label:"A4 (210mm × 297mm)"}];return n?e.jsx(C,{sx:{p:3,height:"60vh",overflow:"auto"},children:e.jsxs(E,{container:!0,spacing:3,children:[e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(lt,{color:"primary"}),e.jsx(v,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Color Management"})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Color Mode"}),e.jsxs($,{value:d.colorMode,label:"Color Mode",onChange:h("colorMode"),children:[e.jsx(F,{value:"rgb",children:"RGB (Screen)"}),e.jsx(F,{value:"cmyk",children:"CMYK (Print)"})]})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"ICC Color Profile"}),e.jsx($,{value:d.colorProfile,label:"ICC Color Profile",onChange:h("colorProfile"),children:g.map(i=>e.jsx(F,{value:i.value,children:i.label},i.value))})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(v,{variant:"h6",gutterBottom:!0,sx:{color:"primary.main",fontWeight:600},children:"Custom Print Size"})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsx(U,{fullWidth:!0,label:"Width",type:"number",value:d.customWidth,onChange:s("customWidth"),disabled:l,inputProps:{min:1,max:100,step:.1}})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsx(U,{fullWidth:!0,label:"Height",type:"number",value:d.customHeight,onChange:s("customHeight"),disabled:l,inputProps:{min:1,max:100,step:.1}})}),e.jsx(E,{size:{xs:12,md:4},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Units"}),e.jsxs($,{value:d.printUnits,label:"Units",onChange:h("printUnits"),children:[e.jsx(F,{value:"in",children:"inches"}),e.jsx(F,{value:"cm",children:"centimeters"}),e.jsx(F,{value:"mm",children:"millimeters"})]})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Ql,{color:"primary"}),e.jsx(v,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Professional Print Options"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(Q,{variant:"outlined",sx:{p:2},children:e.jsxs(E,{container:!0,spacing:2,children:[e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.addBleed,onChange:h("addBleed"),disabled:l}),label:"Add Bleed (0.125″)"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.showCropMarks,onChange:h("showCropMarks"),disabled:l}),label:"Show Crop Marks"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.includeColorBars,onChange:h("includeColorBars"),disabled:l}),label:"Include Color Calibration Bars"})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(_,{control:e.jsx(re,{checked:d.addRegistrationMarks,onChange:h("addRegistrationMarks"),disabled:l}),label:"Add Registration Marks"})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.embedICCProfile,onChange:h("embedICCProfile"),disabled:l}),label:"Embed ICC Profile"})})]})})}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Jl,{color:"primary"}),e.jsx(v,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Large Format Printing"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.enableTiledPrinting,onChange:h("enableTiledPrinting"),disabled:l}),label:"Enable Tiled Printing"})}),d.enableTiledPrinting&&e.jsxs(e.Fragment,{children:[e.jsx(E,{size:{xs:12,md:6},children:e.jsxs(N,{fullWidth:!0,disabled:l,children:[e.jsx(O,{children:"Tile Size"}),e.jsx($,{value:d.tileSize,label:"Tile Size",onChange:h("tileSize"),children:f.map(i=>e.jsx(F,{value:i.value,children:i.label},i.value))})]})}),e.jsx(E,{size:{xs:12,md:6},children:e.jsx(U,{fullWidth:!0,label:"Overlap",type:"number",value:d.tileOverlap,onChange:s("tileOverlap"),disabled:l,inputProps:{min:0,max:2,step:.25},InputProps:{endAdornment:e.jsx(si,{position:"end",children:"inches"})}})})]}),e.jsx(E,{size:{xs:12},children:e.jsx(ge,{sx:{my:2}})}),e.jsx(E,{size:{xs:12},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Pe,{color:"primary"}),e.jsx(v,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layer Controls"})]})}),e.jsx(E,{size:{xs:12},children:e.jsx(_,{control:e.jsx(re,{checked:d.exportAllLayers,onChange:h("exportAllLayers"),disabled:l}),label:"Export All Visible Layers"})}),!d.exportAllLayers&&o.length>0&&e.jsxs(E,{size:{xs:12},children:[e.jsx(v,{variant:"subtitle2",gutterBottom:!0,children:"Select Layers to Export:"}),e.jsx(Q,{variant:"outlined",sx:{maxHeight:200,overflow:"auto"},children:e.jsx(ni,{dense:!0,children:o.map(i=>e.jsxs(ai,{component:"button",disabled:l,children:[e.jsx(Qe,{primary:i.name,secondary:`${i.features.length} features`}),e.jsx(ol,{children:e.jsx(J,{checked:d.selectedLayers.includes(i.id),onChange:()=>a(i.id),disabled:l})})]},i.id))})})]}),e.jsx(E,{size:{xs:12},children:e.jsx(We,{severity:"info",sx:{mt:2},children:e.jsxs(v,{variant:"body2",children:[e.jsx("strong",{children:"Professional Printing:"})," Use CMYK color mode and appropriate ICC profiles for commercial printing. Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages."]})})})]})}):null},Er=({configuration:n,disabled:t=!1})=>{const l=Z(),r=H(a=>a.fireMapPro.export.configuration.basic),o=[{type:"map",label:"Map Frame",icon:e.jsx(yt,{})},{type:"title",label:"Title",icon:e.jsx(ql,{})},{type:"subtitle",label:"Subtitle",icon:e.jsx(Qt,{})},{type:"legend",label:"Legend",icon:e.jsx(Nl,{})},{type:"north-arrow",label:"North Arrow",icon:e.jsx(Vl,{})},{type:"scale-bar",label:"Scale Bar",icon:e.jsx(Zl,{})},{type:"text",label:"Text Box",icon:e.jsx(Qt,{})},{type:"image",label:"Image",icon:e.jsx(hi,{})},{type:"shape",label:"Shape",icon:e.jsx(Rl,{})}],d=[{id:"standard",name:"Standard",description:"Basic layout with map and legend"},{id:"professional",name:"Professional",description:"Corporate layout with sidebar"},{id:"presentation",name:"Presentation",description:"Landscape format for slides"},{id:"tactical",name:"Tactical",description:"Emergency response layout"}],h=(a,g)=>{a.dataTransfer.setData("application/json",JSON.stringify({type:"layout-element",elementType:g})),a.dataTransfer.effectAllowed="copy"},s=a=>{t||(console.log("[LayoutToolbox] Template clicked:",a),console.log("[LayoutToolbox] Basic config:",r),l($i(a)))};return e.jsxs(C,{sx:{p:2},children:[e.jsx(v,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Elements"}),e.jsx(E,{container:!0,spacing:1,sx:{mb:3},children:o.map(a=>e.jsx(E,{size:{xs:6},children:e.jsxs(Q,{sx:{p:1,textAlign:"center",cursor:t?"default":"grab",border:1,borderColor:"divider",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:"action.hover",transform:"translateY(-2px)",boxShadow:1},"&:active":t?{}:{cursor:"grabbing",opacity:.7}},draggable:!t,onDragStart:g=>h(g,a.type),children:[e.jsx(C,{sx:{color:"primary.main",mb:.5},children:a.icon}),e.jsx(v,{variant:"caption",display:"block",children:a.label})]})},a.type))}),e.jsx(ge,{sx:{my:2}}),e.jsx(v,{variant:"subtitle1",gutterBottom:!0,sx:{fontWeight:600},children:"Templates"}),e.jsx(C,{sx:{display:"flex",flexDirection:"column",gap:1},children:d.map(a=>e.jsxs(Q,{sx:{p:1.5,cursor:t?"default":"pointer",border:1,borderColor:n.layout.selectedTemplate===a.id?"primary.main":"divider",bgcolor:n.layout.selectedTemplate===a.id?"primary.50":"background.paper",transition:"all 0.2s",opacity:t?.5:1,"&:hover":t?{}:{bgcolor:n.layout.selectedTemplate===a.id?"primary.100":"action.hover",transform:"translateY(-1px)",boxShadow:1}},onClick:()=>s(a.id),children:[e.jsx(v,{variant:"subtitle2",sx:{fontWeight:600},children:a.name}),e.jsx(v,{variant:"caption",color:"text.secondary",children:a.description})]},a.id))}),e.jsx(C,{sx:{mt:3,p:1,bgcolor:"info.50",borderRadius:1},children:e.jsx(v,{variant:"caption",color:"info.main",children:"💡 Drag elements to the canvas or click a template to get started."})})]})},Fr=({width:n=800,height:t=600})=>{const l=Z(),r=B.useRef(null),{layoutElements:o,selectedElementId:d,paperSize:h}=H(j=>({layoutElements:j.fireMapPro.export.configuration.layout.elements,selectedElementId:j.fireMapPro.export.configuration.layout.selectedElementId,paperSize:j.fireMapPro.export.configuration.basic.paperSize})),s={letter:{width:8.5,height:11},legal:{width:8.5,height:14},tabloid:{width:11,height:17},a4:{width:8.27,height:11.69},a3:{width:11.69,height:16.54},custom:{width:8.5,height:11}},a=s[h]||s.letter,g=a.width/a.height,f=Math.min(t,n/g),i=f*g,p=(j,k)=>{k.stopPropagation(),l(Nt(j))},x=()=>{l(Nt(null))},b=(j,k,T)=>{const m=o.find(X=>X.id===j);if(!m)return;const z=Math.max(0,Math.min(100,m.x+k/i*100)),S=Math.max(0,Math.min(100,m.y+T/f*100));l(Xe({id:j,updates:{x:z,y:S}}))},c=j=>{j.preventDefault(),j.dataTransfer.dropEffect="copy"},u=j=>{var k;j.preventDefault();try{const T=j.dataTransfer.getData("application/json");if(!T)return;const m=JSON.parse(T);if(m.type!=="layout-element")return;const z=(k=r.current)==null?void 0:k.getBoundingClientRect();if(!z)return;const S=(j.clientX-z.left)/z.width*100,X=(j.clientY-z.top)/z.height*100,ee={type:m.elementType,x:Math.max(0,Math.min(95,S-5)),y:Math.max(0,Math.min(95,X-5)),width:20,height:15,zIndex:o.length+1,visible:!0,content:y(m.elementType)};l(ut(ee))}catch(T){console.error("Error handling drop:",T)}},y=j=>{switch(j){case"title":return{text:"Map Title",fontSize:18,textAlign:"center",color:"#333333",fontFamily:"Arial"};case"subtitle":return{text:"Map Subtitle",fontSize:14,textAlign:"center",color:"#666666",fontFamily:"Arial"};case"text":return{text:"Text Element",fontSize:12,textAlign:"left",color:"#333333",fontFamily:"Arial"};case"legend":return{text:"Legend",backgroundColor:"#ffffff",color:"#333333"};case"image":return{text:"Image Placeholder",backgroundColor:"#f5f5f5"};case"shape":return{backgroundColor:"transparent",borderColor:"#333333"};default:return{}}},D=j=>{switch(j){case"map":return"🗺️";case"title":return"📝";case"subtitle":return"📄";case"legend":return"📋";case"north-arrow":return"🧭";case"scale-bar":return"📏";case"text":return"💬";case"image":return"🖼️";case"shape":return"⬜";default:return"📦"}},M=j=>{switch(j){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(C,{sx:{display:"flex",flexDirection:"column",alignItems:"center",padding:2,height:"100%",backgroundColor:"#f5f5f5"},children:[e.jsxs(Q,{ref:r,onClick:x,onDragOver:c,onDrop:u,sx:{position:"relative",width:i,height:f,backgroundColor:"white",border:"2px solid #ddd",boxShadow:"0 4px 8px rgba(0,0,0,0.1)",overflow:"hidden",cursor:"default"},children:[e.jsxs(C,{sx:{position:"absolute",top:-25,left:0,fontSize:"12px",color:"#666",fontWeight:"bold"},children:[h.toUpperCase()," (",a.width,'" × ',a.height,'")']}),e.jsxs("svg",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.1},children:[e.jsx("defs",{children:e.jsx("pattern",{id:"grid",width:i/10,height:f/10,patternUnits:"userSpaceOnUse",children:e.jsx("path",{d:`M ${i/10} 0 L 0 0 0 ${f/10}`,fill:"none",stroke:"#666",strokeWidth:"1"})})}),e.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"})]}),o.map(j=>e.jsx(kr,{element:j,isSelected:j.id===d,canvasWidth:i,canvasHeight:f,onElementClick:p,onElementDrag:b,getElementIcon:D,getElementLabel:M},j.id)),o.length===0&&e.jsxs(C,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",color:"#999"},children:[e.jsx(C,{sx:{fontSize:"48px",marginBottom:1},children:"📄"}),e.jsx(C,{sx:{fontSize:"14px"},children:"Drag elements from the toolbox to create your layout"})]})]}),e.jsxs(C,{sx:{marginTop:1,fontSize:"12px",color:"#666",textAlign:"center"},children:["Canvas: ",Math.round(i),"×",Math.round(f),"px | Zoom: ",Math.round(i/400*100),"% | Elements: ",o.length]})]})},kr=({element:n,isSelected:t,canvasWidth:l,canvasHeight:r,onElementClick:o,onElementDrag:d,getElementIcon:h,getElementLabel:s})=>{var x,b,c,u,y,D,M,j;const a=B.useRef(null),g=B.useRef(!1),f=B.useRef({x:0,y:0}),i=k=>{k.preventDefault(),k.stopPropagation(),g.current=!0,f.current={x:k.clientX,y:k.clientY};const T=z=>{if(!g.current)return;const S=z.clientX-f.current.x,X=z.clientY-f.current.y;d(n.id,S,X),f.current={x:z.clientX,y:z.clientY}},m=()=>{g.current=!1,document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",m)};document.addEventListener("mousemove",T),document.addEventListener("mouseup",m),o(n.id,k)};if(!n.visible)return null;const p={position:"absolute",left:`${n.x}%`,top:`${n.y}%`,width:`${n.width}%`,height:`${n.height}%`,zIndex:n.zIndex,border:t?"2px solid #1976d2":"1px solid #ddd",backgroundColor:n.type==="map"?"#e3f2fd":"rgba(255,255,255,0.9)",cursor:"move",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:"#666",userSelect:"none",boxSizing:"border-box"};return e.jsxs("div",{ref:a,style:p,onMouseDown:i,onClick:k=>o(n.id,k),children:[e.jsx(C,{sx:{textAlign:"center",overflow:"hidden",padding:.5},children:(n.type==="title"||n.type==="subtitle"||n.type==="text"||n.type==="legend")&&((x=n.content)!=null&&x.text)?e.jsx(C,{sx:{fontSize:`${Math.max(8,Math.min(16,(((b=n.content)==null?void 0:b.fontSize)||12)*.8))}px`,fontFamily:((c=n.content)==null?void 0:c.fontFamily)||"Arial",color:((u=n.content)==null?void 0:u.color)||"#333",textAlign:((y=n.content)==null?void 0:y.textAlign)||(n.type==="title"?"center":"left"),fontWeight:n.type==="title"?"bold":"normal",lineHeight:1.2,wordBreak:"break-word",overflow:"hidden",textOverflow:"ellipsis",backgroundColor:n.type==="legend"?((D=n.content)==null?void 0:D.backgroundColor)||"#ffffff":"transparent",border:n.type==="legend"?"1px solid #ddd":"none",borderRadius:n.type==="legend"?"2px":"0",padding:n.type==="legend"?"2px 4px":"0",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:((M=n.content)==null?void 0:M.textAlign)==="center"?"center":((j=n.content)==null?void 0:j.textAlign)==="right"?"flex-end":"flex-start"},children:n.content.text}):e.jsxs(e.Fragment,{children:[e.jsx(C,{sx:{fontSize:"16px",marginBottom:.5},children:h(n.type)}),e.jsx(C,{sx:{fontSize:"10px",lineHeight:1},children:s(n.type)})]})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",top:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"nw-resize"}}),e.jsx("div",{style:{position:"absolute",top:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"ne-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,left:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"sw-resize"}}),e.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:8,height:8,backgroundColor:"#1976d2",cursor:"se-resize"}})]})]})},Dr=()=>{var h,s,a,g,f,i,p,x,b;const n=Z(),{selectedElement:t,elements:l}=H(c=>{const u=c.fireMapPro.export.configuration.layout.selectedElementId,y=c.fireMapPro.export.configuration.layout.elements;return{selectedElement:u?y.find(D=>D.id===u):null,elements:y}});if(!t)return e.jsxs(C,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa"},children:[e.jsx(v,{variant:"h6",gutterBottom:!0,sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsxs(C,{sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",color:"#999",textAlign:"center"},children:[e.jsx(C,{sx:{fontSize:"32px",marginBottom:1},children:"🎛️"}),e.jsx(v,{variant:"body2",sx:{fontSize:"0.85rem"},children:"Select an element to edit its properties"})]})]});const r=(c,u)=>{n(Xe({id:t.id,updates:{[c]:u}}))},o=()=>{n(Vi(t.id))},d=c=>{switch(c){case"map":return"Map Frame";case"title":return"Title";case"subtitle":return"Subtitle";case"legend":return"Legend";case"north-arrow":return"North Arrow";case"scale-bar":return"Scale Bar";case"text":return"Text Box";case"image":return"Image";case"shape":return"Shape";default:return"Element"}};return e.jsxs(C,{sx:{padding:1,height:"100%",backgroundColor:"#fafafa",overflowY:"auto"},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1},children:[e.jsx(v,{variant:"h6",sx:{fontSize:"1rem",fontWeight:600},children:"Properties"}),e.jsx(te,{size:"small",color:"error",startIcon:e.jsx(Ct,{}),onClick:o,sx:{minWidth:"auto",px:1},children:"Del"})]}),e.jsx(v,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:d(t.type)}),e.jsxs(ce,{defaultExpanded:!0,sx:{mb:1},children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(v,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:"Position & Size"})}),e.jsxs(he,{sx:{pt:1},children:[e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(U,{label:"X",type:"number",size:"small",value:Math.round(t.x*100)/100,onChange:c=>r("x",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(U,{label:"Y",type:"number",size:"small",value:Math.round(t.y*100)/100,onChange:c=>r("y",parseFloat(c.target.value)||0),inputProps:{min:0,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1},children:[e.jsx(U,{label:"Width",type:"number",size:"small",value:Math.round(t.width*100)/100,onChange:c=>r("width",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsx(U,{label:"Height",type:"number",size:"small",value:Math.round(t.height*100)/100,onChange:c=>r("height",parseFloat(c.target.value)||1),inputProps:{min:1,max:100,step:.1},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{marginBottom:1},children:[e.jsx(v,{gutterBottom:!0,children:"Layer Order"}),e.jsx(tt,{value:t.zIndex,onChange:(c,u)=>r("zIndex",u),min:1,max:l.length+5,step:1,marks:!0,valueLabelDisplay:"on"})]}),e.jsx(_,{control:e.jsx(J,{checked:t.visible,onChange:c=>r("visible",c.target.checked)}),label:"Visible"})]})]}),(t.type==="title"||t.type==="subtitle"||t.type==="text"||t.type==="legend")&&e.jsxs(ce,{sx:{mb:1},children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),sx:{minHeight:40,"& .MuiAccordionSummary-content":{margin:"8px 0"}},children:e.jsx(v,{variant:"subtitle2",sx:{fontSize:"0.9rem",fontWeight:600},children:t.type==="legend"?"Legend Content":"Text Content"})}),e.jsxs(he,{sx:{pt:1},children:[e.jsx(U,{label:t.type==="legend"?"Legend Title":"Text",multiline:!0,rows:2,fullWidth:!0,size:"small",value:((h=t.content)==null?void 0:h.text)||"",onChange:c=>r("content",{...t.content,text:c.target.value}),sx:{marginBottom:1,"& .MuiInputBase-input":{fontSize:"0.85rem"}}}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1,marginBottom:1},children:[e.jsxs(N,{size:"small",children:[e.jsx(O,{sx:{fontSize:"0.85rem"},children:"Font"}),e.jsxs($,{value:((s=t.content)==null?void 0:s.fontFamily)||"Arial",onChange:c=>r("content",{...t.content,fontFamily:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"Arial",sx:{fontSize:"0.85rem"},children:"Arial"}),e.jsx(F,{value:"Times New Roman",sx:{fontSize:"0.85rem"},children:"Times"}),e.jsx(F,{value:"Helvetica",sx:{fontSize:"0.85rem"},children:"Helvetica"}),e.jsx(F,{value:"Georgia",sx:{fontSize:"0.85rem"},children:"Georgia"})]})]}),e.jsx(U,{label:"Size",type:"number",size:"small",value:((a=t.content)==null?void 0:a.fontSize)||12,onChange:c=>r("content",{...t.content,fontSize:parseInt(c.target.value)||12}),inputProps:{min:6,max:72},sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]}),e.jsxs(C,{sx:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:1},children:[e.jsxs(N,{size:"small",children:[e.jsx(O,{sx:{fontSize:"0.85rem"},children:"Align"}),e.jsxs($,{value:((g=t.content)==null?void 0:g.textAlign)||"left",onChange:c=>r("content",{...t.content,textAlign:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"left",sx:{fontSize:"0.85rem"},children:"Left"}),e.jsx(F,{value:"center",sx:{fontSize:"0.85rem"},children:"Center"}),e.jsx(F,{value:"right",sx:{fontSize:"0.85rem"},children:"Right"})]})]}),e.jsx(U,{label:"Color",type:"color",size:"small",value:((f=t.content)==null?void 0:f.color)||"#000000",onChange:c=>r("content",{...t.content,color:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem",p:.5}}})]})]})]}),t.type==="map"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"Map Settings"})}),e.jsxs(he,{children:[e.jsx(_,{control:e.jsx(J,{checked:t.showBorder!==!1,onChange:c=>r("showBorder",c.target.checked)}),label:"Show Border",sx:{marginBottom:1}}),e.jsx(U,{label:"Border Width (px)",type:"number",size:"small",fullWidth:!0,value:t.borderWidth||1,onChange:c=>r("borderWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:10},sx:{marginBottom:2}}),e.jsx(U,{label:"Border Color",type:"color",size:"small",fullWidth:!0,value:t.borderColor||"#000000",onChange:c=>r("borderColor",c.target.value)})]})]}),t.type==="legend"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"Legend Settings"})}),e.jsxs(he,{children:[e.jsx(U,{label:"Title",fullWidth:!0,size:"small",value:t.legendTitle||"Legend",onChange:c=>r("legendTitle",c.target.value),sx:{marginBottom:2}}),e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{children:"Style"}),e.jsxs($,{value:t.legendStyle||"standard",onChange:c=>r("legendStyle",c.target.value),children:[e.jsx(F,{value:"standard",children:"Standard"}),e.jsx(F,{value:"compact",children:"Compact"}),e.jsx(F,{value:"detailed",children:"Detailed"})]})]}),e.jsx(_,{control:e.jsx(J,{checked:t.showLegendBorder!==!1,onChange:c=>r("showLegendBorder",c.target.checked)}),label:"Show Border"})]})]}),t.type==="north-arrow"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"North Arrow Settings"})}),e.jsxs(he,{children:[e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{children:"Style"}),e.jsxs($,{value:t.arrowStyle||"classic",onChange:c=>r("arrowStyle",c.target.value),children:[e.jsx(F,{value:"classic",children:"Classic"}),e.jsx(F,{value:"modern",children:"Modern"}),e.jsx(F,{value:"simple",children:"Simple"}),e.jsx(F,{value:"compass",children:"Compass"})]})]}),e.jsx(U,{label:"Rotation (degrees)",type:"number",size:"small",fullWidth:!0,value:t.rotation||0,onChange:c=>r("rotation",parseInt(c.target.value)||0),inputProps:{min:0,max:360}})]})]}),t.type==="scale-bar"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"Scale Bar Settings"})}),e.jsxs(he,{children:[e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{children:"Units"}),e.jsxs($,{value:t.units||"feet",onChange:c=>r("units",c.target.value),children:[e.jsx(F,{value:"feet",children:"Feet"}),e.jsx(F,{value:"meters",children:"Meters"}),e.jsx(F,{value:"miles",children:"Miles"}),e.jsx(F,{value:"kilometers",children:"Kilometers"})]})]}),e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{children:"Style"}),e.jsxs($,{value:t.scaleStyle||"bar",onChange:c=>r("scaleStyle",c.target.value),children:[e.jsx(F,{value:"bar",children:"Bar"}),e.jsx(F,{value:"line",children:"Line"}),e.jsx(F,{value:"alternating",children:"Alternating"})]})]}),e.jsx(U,{label:"Number of Divisions",type:"number",size:"small",fullWidth:!0,value:t.divisions||4,onChange:c=>r("divisions",parseInt(c.target.value)||4),inputProps:{min:2,max:10}})]})]}),t.type==="image"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"Image Settings"})}),e.jsxs(he,{children:[e.jsxs(C,{sx:{marginBottom:2},children:[e.jsx(v,{variant:"body2",sx:{mb:1,fontSize:"0.85rem",color:"#666"},children:"Upload Image File"}),e.jsx("input",{type:"file",accept:"image/*",onChange:c=>{var y;const u=(y=c.target.files)==null?void 0:y[0];u&&r("content",{...t.content,imageSrc:u})},style:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"0.85rem"}}),((i=t.content)==null?void 0:i.imageSrc)&&t.content.imageSrc instanceof File&&e.jsxs(v,{variant:"caption",sx:{mt:.5,display:"block",color:"#666"},children:["Selected: ",t.content.imageSrc.name]})]}),e.jsx(ge,{sx:{my:2}}),e.jsx(U,{label:"Image URL (alternative to file upload)",fullWidth:!0,size:"small",value:typeof((p=t.content)==null?void 0:p.imageSrc)=="string"?t.content.imageSrc:"",onChange:c=>r("content",{...t.content,imageSrc:c.target.value}),sx:{marginBottom:2,"& .MuiInputBase-input":{fontSize:"0.85rem"}},placeholder:"https://example.com/image.jpg"}),e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{sx:{fontSize:"0.85rem"},children:"Image Fit"}),e.jsxs($,{value:((x=t.content)==null?void 0:x.imageFit)||"cover",onChange:c=>r("content",{...t.content,imageFit:c.target.value}),sx:{fontSize:"0.85rem"},children:[e.jsx(F,{value:"cover",sx:{fontSize:"0.85rem"},children:"Cover"}),e.jsx(F,{value:"contain",sx:{fontSize:"0.85rem"},children:"Contain"}),e.jsx(F,{value:"fill",sx:{fontSize:"0.85rem"},children:"Fill"}),e.jsx(F,{value:"scale-down",sx:{fontSize:"0.85rem"},children:"Scale Down"})]})]}),e.jsx(U,{label:"Alt Text",fullWidth:!0,size:"small",value:((b=t.content)==null?void 0:b.altText)||"",onChange:c=>r("content",{...t.content,altText:c.target.value}),sx:{"& .MuiInputBase-input":{fontSize:"0.85rem"}}})]})]}),t.type==="shape"&&e.jsxs(ce,{children:[e.jsx(de,{expandIcon:e.jsx(ae,{}),children:e.jsx(v,{variant:"subtitle1",children:"Shape Settings"})}),e.jsxs(he,{children:[e.jsxs(N,{size:"small",fullWidth:!0,sx:{marginBottom:2},children:[e.jsx(O,{children:"Shape Type"}),e.jsxs($,{value:t.shapeType||"rectangle",onChange:c=>r("shapeType",c.target.value),children:[e.jsx(F,{value:"rectangle",children:"Rectangle"}),e.jsx(F,{value:"circle",children:"Circle"}),e.jsx(F,{value:"ellipse",children:"Ellipse"}),e.jsx(F,{value:"triangle",children:"Triangle"}),e.jsx(F,{value:"line",children:"Line"})]})]}),e.jsxs(C,{sx:{display:"flex",gap:1,marginBottom:2},children:[e.jsx(U,{label:"Fill Color",type:"color",size:"small",value:t.fillColor||"#ffffff",onChange:c=>r("fillColor",c.target.value),sx:{flex:1}}),e.jsx(U,{label:"Stroke Color",type:"color",size:"small",value:t.strokeColor||"#000000",onChange:c=>r("strokeColor",c.target.value),sx:{flex:1}})]}),e.jsx(U,{label:"Stroke Width (px)",type:"number",size:"small",fullWidth:!0,value:t.strokeWidth||1,onChange:c=>r("strokeWidth",parseInt(c.target.value)||1),inputProps:{min:0,max:20}})]})]}),e.jsx(ge,{sx:{margin:"16px 0"}}),e.jsxs(C,{sx:{fontSize:"12px",color:"#666"},children:[e.jsxs(v,{variant:"caption",display:"block",children:["Element ID: ",t.id]}),e.jsxs(v,{variant:"caption",display:"block",children:["Type: ",t.type]}),e.jsxs(v,{variant:"caption",display:"block",children:["Position: ",Math.round(t.x),"%, ",Math.round(t.y),"%"]}),e.jsxs(v,{variant:"caption",display:"block",children:["Size: ",Math.round(t.width),"% × ",Math.round(t.height),"%"]})]})]})},Br=({isActive:n,configuration:t,disabled:l=!1})=>{const r=Z(),o=t.layout,d=h=>{const s=h.target.value;r(Yi({pageOrientation:s,canvasWidth:s==="landscape"?520:400,canvasHeight:s==="landscape"?400:520}))};return n?e.jsxs(C,{sx:{height:"60vh",display:"flex",flexDirection:"column"},children:[e.jsxs(C,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1,mb:2},children:[e.jsx(Gl,{color:"primary"}),e.jsx(v,{variant:"h6",sx:{color:"primary.main",fontWeight:600},children:"Layout Designer"})]}),e.jsxs(E,{container:!0,spacing:2,alignItems:"center",children:[e.jsx(E,{size:{xs:12,md:4},children:e.jsxs(N,{fullWidth:!0,size:"small",disabled:l,children:[e.jsx(O,{children:"Page Orientation"}),e.jsxs($,{value:o.pageOrientation,label:"Page Orientation",onChange:d,children:[e.jsx(F,{value:"portrait",children:"Portrait"}),e.jsx(F,{value:"landscape",children:"Landscape"})]})]})}),e.jsx(E,{size:{xs:12,md:8},children:e.jsx(We,{severity:"info",sx:{py:.5},children:e.jsx(v,{variant:"caption",children:"Drag elements from the toolbox to the canvas. Select templates for quick layouts."})})})]})]}),e.jsxs(C,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[e.jsx(C,{sx:{width:200,borderRight:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:2},children:e.jsx(Er,{configuration:t,disabled:l})}),e.jsx(C,{sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",bgcolor:"grey.100",p:2,overflow:"auto"},children:e.jsx(Fr,{})}),e.jsx(C,{sx:{width:280,borderLeft:1,borderColor:"divider",overflow:"auto",bgcolor:"background.paper",p:1},children:e.jsx(Dr,{})})]})]}):null},pt=({children:n,value:t,index:l,...r})=>e.jsx("div",{role:"tabpanel",hidden:t!==l,id:`export-tabpanel-${l}`,"aria-labelledby":`export-tab-${l}`,...r,children:t===l&&e.jsx(C,{sx:{p:0},children:n})}),Sr=()=>{const n=Z(),t=oi(),l=di(t.breakpoints.down("md")),r=H(Qi),o=H(it),{open:d,activeTab:h,configuration:s,process:a}=r,g={basic:0,advanced:1,"layout-designer":2},f={0:"basic",1:"advanced",2:"layout-designer"},i=g[h],p=()=>{a.isExporting||n(Ot())},x=(c,u)=>{a.isExporting||n(_i(f[u]))},b=async()=>{try{n($e({isExporting:!0,progress:0,currentStep:"Preparing export...",error:null}));const c=document.querySelector(".leaflet-container");if(!c)throw new Error("Map element not found");const u={...s,layout:{...s.layout,elements:r.configuration.layout.elements,selectedElementId:r.configuration.layout.selectedElementId,customLayout:r.configuration.layout.customLayout},mapView:{center:o.view.center,zoom:o.view.zoom}};await vr.exportMap(c,u,(y,D)=>{n($e({isExporting:!0,progress:y,currentStep:D,error:null}))}),n($e({isExporting:!1,progress:100,currentStep:"Export completed",success:!0})),setTimeout(()=>{n(Ot())},1500)}catch(c){n($e({isExporting:!1,error:c instanceof Error?c.message:"Export failed",success:!1}))}};return e.jsxs(Ze,{open:d,onClose:p,maxWidth:"lg",fullWidth:!0,fullScreen:l,PaperProps:{sx:{minHeight:"80vh",maxHeight:"90vh",bgcolor:"background.default"}},children:[e.jsxs(qe,{sx:{bgcolor:"primary.main",color:"primary.contrastText",p:2,pb:0},children:[e.jsxs(C,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(Fe,{}),e.jsx(v,{variant:"h6",component:"div",children:"Export Options"})]}),e.jsx(le,{edge:"end",color:"inherit",onClick:p,disabled:a.isExporting,"aria-label":"close",children:e.jsx(kl,{})})]}),e.jsxs(jt,{value:i,onChange:x,textColor:"inherit",indicatorColor:"secondary",variant:"fullWidth",sx:{"& .MuiTab-root":{color:"rgba(255, 255, 255, 0.7)","&.Mui-selected":{color:"white",fontWeight:600},"&:hover":{color:"white",backgroundColor:"rgba(255, 255, 255, 0.1)"}},"& .MuiTabs-indicator":{backgroundColor:"secondary.main"}},children:[e.jsx(Re,{label:"Basic",id:"export-tab-0","aria-controls":"export-tabpanel-0",disabled:a.isExporting}),e.jsx(Re,{label:"Advanced",id:"export-tab-1","aria-controls":"export-tabpanel-1",disabled:a.isExporting}),e.jsx(Re,{label:"Layout Designer",id:"export-tab-2","aria-controls":"export-tabpanel-2",disabled:a.isExporting})]})]}),e.jsxs(Ke,{sx:{p:0,overflow:"hidden"},children:[e.jsx(pt,{value:i,index:0,children:e.jsx(Cr,{isActive:h==="basic",configuration:s,disabled:a.isExporting})}),e.jsx(pt,{value:i,index:1,children:e.jsx(jr,{isActive:h==="advanced",configuration:s,disabled:a.isExporting})}),e.jsx(pt,{value:i,index:2,children:e.jsx(Br,{isActive:h==="layout-designer",configuration:s,disabled:a.isExporting})})]}),e.jsxs(Je,{sx:{p:2,borderTop:1,borderColor:"divider"},children:[e.jsx(te,{onClick:p,disabled:a.isExporting,color:"inherit",children:"Cancel"}),e.jsx(te,{onClick:b,disabled:a.isExporting,variant:"contained",startIcon:a.isExporting?null:e.jsx(Fe,{}),sx:{minWidth:120},children:a.isExporting?`${a.progress}%`:"Export Map"})]}),a.isExporting&&e.jsx(C,{sx:{position:"absolute",bottom:80,left:16,right:16,bgcolor:"info.main",color:"info.contrastText",p:1,borderRadius:1,display:"flex",alignItems:"center",gap:1},children:e.jsx(v,{variant:"body2",children:a.currentStep})})]})},Mr=()=>{const n=B.useRef(null),t=B.useRef(null),l=B.useRef(Math.random().toString(36)),r=B.useRef(0),[o,d]=B.useState([]),h=s=>{console.log(`[SimpleMapTest] ${s}`),d(a=>[...a,`${new Date().toISOString()}: ${s}`])};return B.useEffect(()=>{if(r.current++,h(`Component render #${r.current}`),!n.current){h("❌ No map container div");return}if(t.current){h(`⚠️ Map already exists (ID: ${l.current})`);return}l.current=Math.random().toString(36),h(`🗺️ Creating map with ID: ${l.current}`);try{const s=G.map(n.current,{center:[39.8283,-98.5795],zoom:6,zoomControl:!0});G.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(s);const a=g=>{h(`✅ Click event works at ${g.latlng.lat.toFixed(4)}, ${g.latlng.lng.toFixed(4)}`)};return s.on("click",a),setTimeout(()=>{try{const g=s.getCenter(),f=s.latLngToContainerPoint(g),i=s.containerPointToLatLng(f);h(`✅ Coordinate conversion works: ${i.lat.toFixed(4)}, ${i.lng.toFixed(4)}`)}catch(g){h(`❌ Coordinate conversion failed: ${g instanceof Error?g.message:String(g)}`)}},1e3),t.current=s,h(`✅ Map created successfully (ID: ${l.current})`),()=>{h(`🧹 Cleanup called for map ID: ${l.current}`),t.current&&(t.current.remove(),t.current=null,h(`✅ Map cleaned up (ID: ${l.current})`))}}catch(s){h(`❌ Map creation failed: ${s instanceof Error?s.message:String(s)}`)}},[]),e.jsxs("div",{style:{width:"100vw",height:"100vh",position:"fixed",top:0,left:0,zIndex:9999,background:"white"},children:[e.jsxs("div",{style:{position:"absolute",top:10,left:10,zIndex:1e4,background:"white",padding:"10px",maxHeight:"300px",overflow:"auto",border:"1px solid #ccc"},children:[e.jsx("h3",{children:"Simple Map Test Results"}),e.jsx("div",{style:{fontSize:"12px",fontFamily:"monospace"},children:o.map((s,a)=>e.jsx("div",{children:s},a))}),e.jsx("button",{onClick:()=>window.location.reload(),children:"Reload Test"})]}),e.jsx("div",{ref:n,style:{width:"100%",height:"100%"}})]})},Ye=320,ro=({initialMapState:n,mode:t="create",onSave:l,onExport:r})=>{const o=Z(),d=oi(),h=di(d.breakpoints.down("md"));B.useEffect(()=>{document.title="FireEMS Fire Map Pro"},[]);const s=H(it),a=H(li),g=H(Xi),f=H(Zi),i=B.useRef(null),[p,x]=vt.useState(!1);B.useEffect(()=>{if(n)console.log("Loading initial map state:",n),o($t({...s,...n}));else{console.log("Loading default fire/EMS data:",Jt);const j={view:{center:{latitude:39.8283,longitude:-98.5795},zoom:6},layers:Jt,baseMaps:s.baseMaps,activeBaseMap:s.activeBaseMap,selectedFeatures:[],drawingMode:null,drawingOptions:s.drawingOptions,exportConfig:s.exportConfig,measurementUnits:s.measurementUnits,showCoordinates:s.showCoordinates,showGrid:s.showGrid};o($t(j))}},[]),B.useEffect(()=>{const j=()=>{try{const T=sessionStorage.getItem("fireEmsExportedData");if(T){const m=JSON.parse(T);if(console.log("Found exported data for Fire Map Pro:",m),m.toolId==="fire-map-pro"&&m.data&&m.data.length>0)if(console.log("🔧 FIRE MAP PRO - Processing exported data:",{toolId:m.toolId,dataLength:m.data.length,sampleDataItem:m.data[0]}),m.data[0]&&typeof m.data[0]=="object"&&m.data[0].hasOwnProperty("type")&&m.data[0].hasOwnProperty("coordinates")){console.log("✅ FIRE MAP PRO - Data is already transformed features, using directly");const S=m.data,X={id:"imported-incidents",name:`Imported Incidents (${S.length})`,visible:!0,opacity:1,zIndex:1e3,type:"feature",features:S,style:{defaultStyle:{color:"#dc2626",fillColor:"#dc2626",fillOpacity:.7,weight:2,opacity:1}},metadata:{description:`Incident data imported from Data Formatter - ${S.length} incidents`,source:"Data Formatter",created:new Date,featureCount:S.length}};console.log("Importing pre-transformed incident data to Fire Map Pro:",{layerName:X.name,featureCount:S.length}),o(Yt({layer:X,features:S})),sessionStorage.removeItem("fireEmsExportedData")}else{console.log("🔧 FIRE MAP PRO - Data is raw incident data, transforming...");const S=el.transformToFireMapPro(m.data);if(S.success&&S.data){if(console.log("Importing incident data to Fire Map Pro:",{layerName:S.data.layer.name,featureCount:S.data.features.length,errors:S.errors,warnings:S.warnings}),o(Yt(S.data)),S.errors.length>0||S.warnings.length>0){const X=[`Successfully imported ${S.metadata.successfulRecords} of ${S.metadata.totalRecords} incidents.`,S.errors.length>0?`${S.errors.length} errors encountered.`:"",S.warnings.length>0?`${S.warnings.length} warnings.`:""].filter(Boolean).join(" ");o(we(X))}sessionStorage.removeItem("fireEmsExportedData")}else console.error("Failed to transform incident data:",S.errors),o(we(`Failed to import incident data: ${S.errors.join(", ")}`))}}}catch(T){console.error("Error checking for imported data:",T),o(we("Error importing data from Data Formatter"))}};j();const k=setTimeout(j,1e3);return()=>clearTimeout(k)},[o]),B.useEffect(()=>{const j=k=>{if(!(k.target instanceof HTMLInputElement||k.target instanceof HTMLTextAreaElement)){if(k.ctrlKey||k.metaKey)switch(k.key){case"z":k.preventDefault(),k.shiftKey?f&&o(gt()):g&&o(Vt());break;case"y":k.preventDefault(),f&&o(gt());break;case"s":k.preventDefault(),b();break;case"e":k.preventDefault(),c();break}k.key==="Escape"&&s.drawingMode}};return document.addEventListener("keydown",j),()=>document.removeEventListener("keydown",j)},[g,f,s.drawingMode,o]);const b=()=>{l?l(s):(localStorage.setItem("fireMapPro_autosave",JSON.stringify(s)),console.log("Map saved to local storage"))},c=()=>{r?r(s.exportConfig):o(ii())},u=()=>{o(qi())},y=()=>{var j;o(Ki()),a.fullscreen?document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen():(j=i.current)!=null&&j.requestFullscreen&&i.current.requestFullscreen()},D=()=>{o(we(null))},M={marginLeft:!h&&a.sidebarOpen?`${Ye}px`:0,width:!h&&a.sidebarOpen?`calc(100% - ${Ye}px)`:"100%",height:a.fullscreen?"100vh":"calc(100vh - 64px)",transition:d.transitions.create(["margin","width"],{easing:d.transitions.easing.sharp,duration:d.transitions.duration.leavingScreen})};return p?e.jsxs("div",{children:[e.jsx("button",{onClick:()=>x(!1),style:{position:"fixed",top:10,right:10,zIndex:10001,padding:"10px",background:"red",color:"white"},children:"Exit Test Mode"}),e.jsx(Mr,{})]}):e.jsx(hl,{children:e.jsxs(C,{ref:i,sx:{display:"flex",height:"100vh",overflow:"hidden",bgcolor:"background.default",position:a.fullscreen?"fixed":"relative",top:a.fullscreen?0:"auto",left:a.fullscreen?0:"auto",right:a.fullscreen?0:"auto",bottom:a.fullscreen?0:"auto",zIndex:a.fullscreen?1300:"auto"},role:"main","aria-label":"Fire Map Pro Application",children:[!a.fullscreen&&e.jsx(xl,{position:"fixed",sx:{zIndex:d.zIndex.drawer+1,bgcolor:"primary.main"},children:e.jsxs(nl,{children:[e.jsx(le,{color:"inherit","aria-label":"toggle sidebar",onClick:u,edge:"start",sx:{mr:2},children:e.jsx(Cl,{})}),e.jsxs(v,{variant:"h6",noWrap:!0,component:"div",sx:{flexGrow:1},children:["Fire Map Pro ",t==="edit"?"- Editing":t==="view"?"- View Only":""]}),e.jsxs(C,{sx:{display:"flex",gap:1},children:[e.jsx(le,{color:"inherit",onClick:()=>o(Vt()),disabled:!g,title:"Undo (Ctrl+Z)",children:e.jsx(Kl,{})}),e.jsx(le,{color:"inherit",onClick:()=>o(gt()),disabled:!f,title:"Redo (Ctrl+Y)",children:e.jsx(_l,{})}),e.jsx(le,{color:"inherit",onClick:()=>x(!0),title:"Debug Test Mode",sx:{color:"orange"},children:e.jsx(Il,{})}),t!=="view"&&e.jsx(le,{color:"inherit",onClick:b,title:"Save (Ctrl+S)",children:e.jsx(gl,{})}),e.jsx(le,{color:"inherit",onClick:c,title:"Export (Ctrl+E)",children:e.jsx(Fe,{})}),e.jsx(le,{color:"inherit",onClick:y,title:"Toggle Fullscreen",children:a.fullscreen?e.jsx(El,{}):e.jsx(Fl,{})})]})]})}),e.jsx(jl,{variant:h?"temporary":"persistent",anchor:"left",open:a.sidebarOpen,onClose:u,sx:{width:Ye,flexShrink:0,"& .MuiDrawer-paper":{width:Ye,boxSizing:"border-box",marginTop:a.fullscreen?0:"64px",height:a.fullscreen?"100vh":"calc(100vh - 64px)",borderRight:`1px solid ${d.palette.divider}`}},ModalProps:{keepMounted:!0,disablePortal:!1,hideBackdrop:!h,disableAutoFocus:!0,disableEnforceFocus:!0,disableRestoreFocus:!0},PaperProps:{"aria-hidden":!1,role:"complementary","aria-label":"Fire Map Pro Tools"},children:e.jsx(wr,{mode:t})}),e.jsxs(C,{component:"main",sx:{flexGrow:1,position:"relative",...M},children:[e.jsx(Q,{elevation:0,sx:{height:"100%",width:"100%",borderRadius:0,overflow:"hidden",position:"relative",minHeight:"500px",display:"flex",flexDirection:"column","& .leaflet-container":{background:"transparent !important",outline:"none"},"& .leaflet-tile-pane":{opacity:"1 !important",visibility:"visible !important"},"& .leaflet-tile":{opacity:"1 !important",visibility:"visible !important",display:"block !important",imageRendering:"auto",transform:"translateZ(0)",backfaceVisibility:"hidden"},"& .leaflet-layer":{opacity:"1 !important",visibility:"visible !important"}},children:e.jsx(ar,{})}),a.isLoading&&e.jsx(C,{sx:{position:"absolute",top:0,left:0,right:0,bottom:0,bgcolor:"rgba(255, 255, 255, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:e.jsx(v,{variant:"h6",children:"Loading..."})})]}),a.showWelcome&&e.jsx(br,{}),e.jsx(Sr,{}),e.jsx(pl,{open:!!a.error,autoHideDuration:6e3,onClose:D,anchorOrigin:{vertical:"bottom",horizontal:"center"},children:e.jsx(We,{onClose:D,severity:"error",sx:{width:"100%"},children:a.error})})]})})};export{ro as default};
