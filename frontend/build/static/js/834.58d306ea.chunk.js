/*! For license information please see 834.58d306ea.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkplant_watering_app_frontend=self.webpackChunkplant_watering_app_frontend||[]).push([[834],{834:(e,t,s)=>{s.r(t),s.d(t,{startFocusVisible:()=>r});const o="ion-focused",n=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp","Home","End"],r=e=>{let t=[],s=!0;const r=e?e.shadowRoot:document,a=e||document.body,i=e=>{t.forEach((e=>e.classList.remove(o))),e.forEach((e=>e.classList.add(o))),t=e},c=()=>{s=!1,i([])},d=e=>{s=n.includes(e.key),s||i([])},u=e=>{if(s&&void 0!==e.composedPath){const t=e.composedPath().filter((e=>!!e.classList&&e.classList.contains("ion-focusable")));i(t)}},v=()=>{r.activeElement===a&&i([])};r.addEventListener("keydown",d),r.addEventListener("focusin",u),r.addEventListener("focusout",v),r.addEventListener("touchstart",c,{passive:!0}),r.addEventListener("mousedown",c);return{destroy:()=>{r.removeEventListener("keydown",d),r.removeEventListener("focusin",u),r.removeEventListener("focusout",v),r.removeEventListener("touchstart",c),r.removeEventListener("mousedown",c)},setFocus:i}}}}]);
//# sourceMappingURL=834.58d306ea.chunk.js.map