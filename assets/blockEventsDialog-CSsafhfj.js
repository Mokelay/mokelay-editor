const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MActionEditor-CVcmuSWp.js","./element-plus-DKiXtHQ5.js","./element-plus-CLuGgbGi.css","./index-DXo7QneV.js","./json-editor-K5rsuUd-.js","./json-editor-C9TzHYAF.css","./index-dBdIsPNN.css","./vue-flow-0-hba6ac.js","./vue-flow-DjrIs5xU.css","./editorToolDefinition-BzSiZ_bo.js","./MActionEditor-DBEK9oKL.css"])))=>i.map(i=>d[i]);
var h=Object.defineProperty;var y=(n,e,t)=>e in n?h(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var v=(n,e,t)=>y(n,typeof e!="symbol"?e+"":e,t);import{_ as E}from"./json-editor-K5rsuUd-.js";import{af as g}from"./element-plus-DKiXtHQ5.js";import{e as k,c as $,I as d,V as b}from"./index-DXo7QneV.js";const _=["event"];function c(n){return n.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function x(n){return typeof n=="string"?n:""}function A(n){return typeof n=="string"&&_.includes(n)}const s=(n,e)=>d.locale==="en"?e:n;function N(n,e){const t=n.execution??{},o=(i,a,l)=>`<select class="mk-form-control" data-policy-index="${e}" data-policy-field="${i}">${l.map(([r,m])=>`<option value="${r}" ${r===a?"selected":""}>${m}</option>`).join("")}</select>`;return`<details class="mokelay-editor-tool__event-policy" data-event-policy-index="${e}">
    <summary>${s("执行策略","Execution policy")}</summary>
    <div class="mk-form-grid mokelay-editor-tool__event-policy-fields">
      <label class="mk-form-field">${s("防抖（毫秒）","Debounce (ms)")}<input type="number" min="0" max="60000" class="mk-form-control" data-policy-index="${e}" data-policy-field="debounceMs" value="${t.debounceMs??0}"></label>
      <label class="mk-form-field">${s("并发策略","Concurrency")}${o("concurrency",t.concurrency??"parallel",[["parallel",s("并行","Parallel")],["serialLatest",s("串行，保留最新变更","Serial, keep latest")],["drop",s("执行期间忽略重复触发","Ignore duplicate triggers")]])}</label>
      <label class="mk-form-field mk-form-full">${s("请求重放","Request replay")}${o("retry",t.retry??"none",[["none",s("不自动重放","No automatic replay")],["resumeUnconfirmed",s("确认未收到响应的请求（仅幂等接口）","Resume unconfirmed requests (idempotent APIs only)")]])}</label>
      <div class="mk-form-full mokelay-editor-tool__event-lifecycle">
        ${["hidden","unmount"].map(i=>{var a;return`<label class="mk-form-check-row"><input class="mk-form-check" type="checkbox" data-policy-index="${e}" data-policy-field="${i}" ${(a=t.flushOn)!=null&&a.includes(i)?"checked":""}>${i==="hidden"?s("页面隐藏时尽力保存","Flush when hidden"):s("离开页面时尽力保存","Flush on unmount")}</label>`}).join("")}
      </div>
    </div>
  </details>`}function p(n){return s(`${n} 个动作`,`${n} ${n===1?"action":"actions"}`)}function S(n,e){return`
    <section class="mokelay-editor-tool__event-row" data-testid="tool-event-row-${e}">
      <div class="mokelay-editor-tool__event-header">
        <h4>${s("事件","Event")} <span>${String(e+1).padStart(2,"0")}</span></h4>
        <button type="button" class="mk-form-button mk-form-button--danger" data-testid="tool-event-remove-${e}" data-event-remove-index="${e}">${c(d.t("editor.events.remove"))}</button>
      </div>
      <label class="mk-form-field">
        <span>${c(d.t("editor.events.fields.event"))}</span>
        <input class="mk-form-control" data-testid="tool-event-input-${e}-event" data-event-index="${e}" data-event-field="event" type="text" value="${c(x(n.event))}">
      </label>
      <div class="mokelay-editor-tool__event-actions-grid">
        ${["actions","onError","onFinally"].map(t=>{var o;return`
        <div class="mk-form-field mokelay-editor-tool__event-action-field">
          <div class="mokelay-editor-tool__event-action-label">
            <span>${t==="actions"?c(d.t("editor.events.fields.actions")):t==="onError"?s("失败时","On error"):s("结束时","Finally")}</span>
            <span class="mk-form-help" data-event-count="${e}-${t}">${p(((o=n[t])==null?void 0:o.length)??0)}</span>
          </div>
          <div class="mokelay-editor-tool__event-actions" data-testid="tool-event-${t}-${e}" data-event-chain="${t}" data-event-actions-index="${e}"></div>
        </div>`}).join("")}
      </div>
      ${N(n,e)}
    </section>
  `}class L{constructor(e){v(this,"options");v(this,"dialog",null);v(this,"draftEvents",[]);v(this,"actionEditorApps",[]);v(this,"expandedPolicies",new Set);v(this,"renderVersion",0);this.options=e}mount(){const e=document.createElement("dialog");e.className="mk-form-dialog mk-form-dialog--wide mokelay-editor-tool__property-dialog mokelay-editor-tool__events-dialog",e.dataset.testid="tool-events-dialog",e.dataset.toolName=this.options.toolName,this.options.owner.appendChild(e),this.dialog=e}destroy(){var e;this.unmountActionEditors(),(e=this.dialog)==null||e.remove(),this.dialog=null}open(){this.dialog&&(this.expandedPolicies.clear(),this.draftEvents=k(this.options.getEvents()),this.render(),this.dialog.open||this.dialog.showModal())}saveDraftEvents(){this.options.setEvents($(this.draftEvents))}render(){if(!this.dialog)return;this.unmountActionEditors(),this.renderVersion+=1;const e=this.draftEvents.length?this.draftEvents.map((t,o)=>S(t,o)).join(""):`<p class="mokelay-editor-tool__events-empty" data-testid="tool-events-empty">${c(d.t("editor.events.empty"))}</p>`;this.dialog.innerHTML=`
      <form method="dialog" class="mk-form-dialog-panel" data-testid="tool-events-panel">
        <div class="mk-form-dialog-header">
          <h3 class="mokelay-editor-tool__property-title" data-testid="tool-events-title">${c(d.t("editor.events.title"))}</h3>
          <button type="submit" class="mk-form-button" data-testid="tool-events-close">${c(d.t("editor.close"))}</button>
        </div>
        <div class="mk-form-dialog-body mk-form-stack mk-form-scope mokelay-editor-tool__events-body" data-testid="tool-events-body">
          ${e}
        </div>
        <div class="mk-form-dialog-footer mokelay-editor-tool__events-footer">
          <button type="button" class="mk-form-button mk-form-button--primary" data-testid="tool-events-add">${c(d.t("editor.events.add"))}</button>
        </div>
      </form>
    `,this.dialog.querySelectorAll("[data-event-policy-index]").forEach(t=>{const o=this.draftEvents[Number(t.dataset.eventPolicyIndex)];t.open=this.expandedPolicies.has(o),t.addEventListener("toggle",()=>{t.open?this.expandedPolicies.add(o):this.expandedPolicies.delete(o)})}),this.bindEvents(),this.mountActionEditors()}bindEvents(){var e;this.dialog&&(this.dialog.querySelectorAll("[data-event-field]").forEach(t=>{t.addEventListener("input",()=>{const o=Number(t.dataset.eventIndex),i=t.dataset.eventField;!Number.isInteger(o)||!A(i)||(this.draftEvents[o][i]=t.value,this.saveDraftEvents())})}),this.dialog.querySelectorAll("[data-policy-field]").forEach(t=>{t.addEventListener("change",()=>{const o=Number(t.dataset.policyIndex),i=t.dataset.policyField,a=this.draftEvents[o];if(!a)return;const l={...a.execution};if(i==="debounceMs"&&(l.debounceMs=Number(t.value)),i==="concurrency"&&(l.concurrency=t.value),i==="retry"&&(l.retry=t.value),i==="hidden"||i==="unmount"){const r=new Set(l.flushOn);t.checked?r.add(i):r.delete(i),l.flushOn=[...r]}a.execution=l,this.saveDraftEvents()})}),this.dialog.querySelectorAll("[data-event-remove-index]").forEach(t=>{t.addEventListener("click",()=>{const o=Number(t.dataset.eventRemoveIndex);Number.isInteger(o)&&(this.expandedPolicies.delete(this.draftEvents[o]),this.draftEvents.splice(o,1),this.saveDraftEvents(),this.render())})}),(e=this.dialog.querySelector('[data-testid="tool-events-add"]'))==null||e.addEventListener("click",()=>{var t,o;this.draftEvents.push(b()),this.render(),(o=(t=this.dialog)==null?void 0:t.querySelector(`[data-testid="tool-event-input-${this.draftEvents.length-1}-event"]`))==null||o.focus()}))}async mountActionEditors(){if(!this.dialog)return;const e=this.renderVersion,{default:t}=await E(async()=>{const{default:o}=await import("./MActionEditor-CVcmuSWp.js");return{default:o}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]),import.meta.url);!this.dialog||e!==this.renderVersion||this.dialog.querySelectorAll("[data-event-actions-index]").forEach(o=>{var r;const i=Number(o.dataset.eventActionsIndex);if(!Number.isInteger(i))return;const a=o.dataset.eventChain,l=g(t,{edit:!0,pageEditor:this.options.pageEditor,modelValue:((r=this.draftEvents[i])==null?void 0:r[a])??[],"onUpdate:modelValue":m=>{var f;this.draftEvents[i][a]=m;const u=(f=this.dialog)==null?void 0:f.querySelector(`[data-event-count="${i}-${a}"]`);u&&(u.textContent=p(m.length)),this.saveDraftEvents()},onChange:m=>{var f;this.draftEvents[i][a]=m;const u=(f=this.dialog)==null?void 0:f.querySelector(`[data-event-count="${i}-${a}"]`);u&&(u.textContent=p(m.length)),this.saveDraftEvents()}});l.mount(o),this.actionEditorApps.push(l)})}unmountActionEditors(){this.actionEditorApps.forEach(e=>e.unmount()),this.actionEditorApps=[]}}export{L as BlockEventsDialogController};
