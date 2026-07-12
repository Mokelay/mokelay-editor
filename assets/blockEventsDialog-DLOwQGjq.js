const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MActionEditor-CX7zZ0pP.js","./vue-vendor-B9whQc6c.js","./vue-flow-B4VWRng6.js","./vue-flow-DjrIs5xU.css","./index-CTNw-lHR.js","./json-editor-B52tXTfP.js","./qrcode-BD_Spdmc.js","./element-plus-BJC8NeUU.js","./element-plus-CLuGgbGi.css","./json-editor-C9TzHYAF.css","./index-Br627GR1.css","./MActionEditor-Bb6a_ADW.css"])))=>i.map(i=>d[i]);
var p=Object.defineProperty;var m=(s,t,e)=>t in s?p(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var d=(s,t,e)=>m(s,typeof t!="symbol"?t+"":t,e);import{_ as u}from"./json-editor-B52tXTfP.js";import{ao as h}from"./vue-vendor-B9whQc6c.js";import{v as f,ap as E,y as a,aq as r}from"./index-CTNw-lHR.js";import"./qrcode-BD_Spdmc.js";import"./element-plus-BJC8NeUU.js";const c=["event"];function i(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function y(s){return typeof s=="string"?s:""}function _(s){return typeof s=="string"&&c.includes(s)}function g(s,t){const e=c.map(o=>`
    <label class="mokelay-editor-tool__event-field">
      <span class="mokelay-editor-tool__property-label">${i(a.t(`editor.events.fields.${o}`))}</span>
      <input
        class="mokelay-editor-tool__property-input"
        data-testid="tool-event-input-${t}-${o}"
        data-event-index="${t}"
        data-event-field="${o}"
        type="text"
        value="${i(y(s[o]))}"
      />
    </label>
  `).join("");return`
    <div class="mokelay-editor-tool__event-row" data-testid="tool-event-row-${t}">
      <div class="mokelay-editor-tool__event-fields">
        ${e}
        <div class="mokelay-editor-tool__event-field mokelay-editor-tool__event-action-field">
          <span class="mokelay-editor-tool__property-label">${i(a.t("editor.events.fields.actions"))}</span>
          <div
            class="mokelay-editor-tool__event-actions"
            data-testid="tool-event-actions-${t}"
            data-event-actions-index="${t}"
          ></div>
        </div>
      </div>
      <button
        type="button"
        class="mokelay-editor-tool__event-remove"
        data-testid="tool-event-remove-${t}"
        data-event-remove-index="${t}"
      >${i(a.t("editor.events.remove"))}</button>
    </div>
  `}class x{constructor(t){d(this,"options");d(this,"dialog",null);d(this,"draftEvents",[]);d(this,"actionEditorApps",[]);this.options=t}mount(){const t=document.createElement("dialog");t.className="mokelay-editor-tool__property-dialog mokelay-editor-tool__events-dialog",t.dataset.testid="tool-events-dialog",t.dataset.toolName=this.options.toolName,this.options.owner.appendChild(t),this.dialog=t}destroy(){var t;this.unmountActionEditors(),(t=this.dialog)==null||t.remove(),this.dialog=null}open(){this.dialog&&(this.draftEvents=f(this.options.getEvents()),this.render(),this.dialog.open||this.dialog.showModal())}saveDraftEvents(){this.options.setEvents(E(this.draftEvents))}render(){if(!this.dialog)return;this.unmountActionEditors();const t=this.draftEvents.length?this.draftEvents.map((e,o)=>g(e,o)).join(""):`<p class="mokelay-editor-tool__events-empty" data-testid="tool-events-empty">${i(a.t("editor.events.empty"))}</p>`;this.dialog.innerHTML=`
      <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-events-panel">
        <div class="mokelay-editor-tool__property-header">
          <h3 class="mokelay-editor-tool__property-title" data-testid="tool-events-title">${i(a.t("editor.events.title"))}</h3>
          <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-events-close">${i(a.t("editor.close"))}</button>
        </div>
        <div class="mokelay-editor-tool__property-body mokelay-editor-tool__events-body" data-testid="tool-events-body">
          ${t}
          <button type="button" class="mokelay-editor-tool__event-add" data-testid="tool-events-add">${i(a.t("editor.events.add"))}</button>
        </div>
      </form>
    `,this.bindEvents(),this.mountActionEditors()}bindEvents(){var t;this.dialog&&(this.dialog.querySelectorAll("[data-event-field]").forEach(e=>{e.addEventListener("input",()=>{const o=Number(e.dataset.eventIndex),n=e.dataset.eventField;!Number.isInteger(o)||!_(n)||(this.draftEvents[o]={...this.draftEvents[o]??r(),[n]:e.value},this.saveDraftEvents())})}),this.dialog.querySelectorAll("[data-event-remove-index]").forEach(e=>{e.addEventListener("click",()=>{const o=Number(e.dataset.eventRemoveIndex);Number.isInteger(o)&&(this.draftEvents.splice(o,1),this.saveDraftEvents(),this.render())})}),(t=this.dialog.querySelector('[data-testid="tool-events-add"]'))==null||t.addEventListener("click",()=>{this.draftEvents.push(r()),this.render()}))}async mountActionEditors(){if(!this.dialog)return;const{default:t}=await u(async()=>{const{default:e}=await import("./MActionEditor-CX7zZ0pP.js");return{default:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url);this.dialog&&this.dialog.querySelectorAll("[data-event-actions-index]").forEach(e=>{var v;const o=Number(e.dataset.eventActionsIndex);if(!Number.isInteger(o))return;const n=h(t,{modelValue:((v=this.draftEvents[o])==null?void 0:v.actions)??[],"onUpdate:modelValue":l=>{this.draftEvents[o]={...this.draftEvents[o]??r(),actions:l},this.saveDraftEvents()},onChange:l=>{this.draftEvents[o]={...this.draftEvents[o]??r(),actions:l},this.saveDraftEvents()}});n.mount(e),this.actionEditorApps.push(n)})}unmountActionEditors(){this.actionEditorApps.forEach(t=>t.unmount()),this.actionEditorApps=[]}}export{x as BlockEventsDialogController};
