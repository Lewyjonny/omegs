import{c as s,j as e}from"./index-Df8heMMP.js";/**
 * @license lucide-react v1.56.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i={name:"circle-alert",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle"]};i.node;const m=s(i);/**
 * @license lucide-react v1.56.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};t.node;const x=s(t);/**
 * @license lucide-react v1.56.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o={name:"info",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]};o.node;const a=s(o),y={info:"bg-navy-50 text-navy-800 ring-navy-200",success:"bg-mint-50 text-mint-900 ring-mint-200",error:"bg-red-50 text-red-800 ring-red-200",demo:"bg-amber-50 text-amber-900 ring-amber-200"},g={info:a,success:x,error:m,demo:a};function k({tone:c="info",title:n,children:r,className:l=""}){const d=g[c];return e.jsxs("div",{role:c==="error"?"alert":"status",className:`flex gap-3 rounded-2xl p-4 text-sm ring-1 ring-inset ${y[c]} ${l}`,children:[e.jsx(d,{className:"mt-0.5 h-5 w-5 shrink-0","aria-hidden":!0}),e.jsxs("div",{className:"space-y-1",children:[n&&e.jsx("p",{className:"font-semibold",children:n}),r&&e.jsx("div",{className:"leading-relaxed",children:r})]})]})}export{k as A,x as C};
