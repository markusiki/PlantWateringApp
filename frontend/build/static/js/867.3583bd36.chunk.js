/*! For license information please see 867.3583bd36.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkplant_watering_app_frontend=self.webpackChunkplant_watering_app_frontend||[]).push([[867],{867:(t,e,n)=>{n.r(e),n.d(e,{createSwipeBackGesture:()=>o});var r=n(384),a=n(406),i=n(288);const o=(t,e,n,o,s)=>{const c=t.ownerDocument.defaultView;let l=(0,a.i)(t);const d=t=>l?-t.deltaX:t.deltaX;return(0,i.G)({el:t,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:n=>(l=(0,a.i)(t),(t=>{const{startX:e}=t;return l?e>=c.innerWidth-50:e<=50})(n)&&e()),onStart:n,onMove:t=>{const e=d(t)/c.innerWidth;o(e)},onEnd:t=>{const e=d(t),n=c.innerWidth,a=e/n,i=(t=>l?-t.velocityX:t.velocityX)(t),o=i>=0&&(i>.2||e>n/2),p=(o?1-a:a)*n;let u=0;if(p>5){const t=p/Math.abs(i);u=Math.min(t,540)}s(o,a<=0?.01:(0,r.m)(0,a,.9999),u)}})}}}]);
//# sourceMappingURL=867.3583bd36.chunk.js.map