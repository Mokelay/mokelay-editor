var ie=Object.defineProperty;var ce=(i,r,n)=>r in i?ie(i,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):i[r]=n;var h=(i,r,n)=>ce(i,typeof r!="symbol"?r+"":r,n);import{A as de}from"./editorjs-4Z3wwCIf.js";import{c as I,n as pe,i as u,p as U,r as ue,q as ye,s as ve,u as he,t as S,o as me,v as Y,_ as fe}from"./block-advanced-DHh4ZhXB.js";import{J as ge,f as ke,r as V,z as _e,F as T,A,B as Ee,o as x,j as H,n as G,l as be,x as we,t as $e,e as Ce}from"./vue-vendor-CrIlHK_p.js";import{g as Se,a as X,n as M,c as B,_ as Te,m as xe}from"./block-form-Bi-ok42G.js";const ee=["event","block","method"],Le='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h4v4H5V5Zm10 0h4v4h-4V5ZM5 15h4v4H5v-4Zm10.5-.5 3.5 3.5m0-3.5-3.5 3.5M9 7h6M7 9v6M17 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';function w(i){return i.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function De(i){return typeof i=="string"?i:""}function Pe(i,r){const n=ee.map(a=>`
    <label class="mokelay-editor-tool__event-field">
      <span class="mokelay-editor-tool__property-label">${w(u.t(`editor.events.fields.${a}`))}</span>
      <input
        class="mokelay-editor-tool__property-input"
        data-testid="tool-event-input-${r}-${a}"
        data-event-index="${r}"
        data-event-field="${a}"
        type="text"
        value="${w(De(i[a]))}"
      />
    </label>
  `).join("");return`
    <div class="mokelay-editor-tool__event-row" data-testid="tool-event-row-${r}">
      <div class="mokelay-editor-tool__event-fields">
        ${n}
      </div>
      <button
        type="button"
        class="mokelay-editor-tool__event-remove"
        data-testid="tool-event-remove-${r}"
        data-event-remove-index="${r}"
      >${w(u.t("editor.events.remove"))}</button>
    </div>
  `}class Ve{constructor(r){h(this,"options");h(this,"dialog",null);h(this,"draftEvents",[]);this.options=r}mount(){const r=document.createElement("dialog");r.className="mokelay-editor-tool__property-dialog mokelay-editor-tool__events-dialog",r.dataset.testid="tool-events-dialog",r.dataset.toolName=this.options.toolName,this.options.owner.appendChild(r),this.dialog=r}destroy(){var r;(r=this.dialog)==null||r.remove(),this.dialog=null}open(){this.dialog&&(this.draftEvents=I(this.options.getEvents()),this.render(),this.dialog.open||this.dialog.showModal())}saveDraftEvents(){this.options.setEvents(pe(this.draftEvents))}render(){if(!this.dialog)return;const r=this.draftEvents.length?this.draftEvents.map((n,a)=>Pe(n,a)).join(""):`<p class="mokelay-editor-tool__events-empty" data-testid="tool-events-empty">${w(u.t("editor.events.empty"))}</p>`;this.dialog.innerHTML=`
      <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-events-panel">
        <div class="mokelay-editor-tool__property-header">
          <h3 class="mokelay-editor-tool__property-title" data-testid="tool-events-title">${w(u.t("editor.events.title"))}</h3>
          <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-events-close">${w(u.t("editor.close"))}</button>
        </div>
        <div class="mokelay-editor-tool__property-body mokelay-editor-tool__events-body" data-testid="tool-events-body">
          ${r}
          <button type="button" class="mokelay-editor-tool__event-add" data-testid="tool-events-add">${w(u.t("editor.events.add"))}</button>
        </div>
      </form>
    `,this.bindEvents()}bindEvents(){var r;this.dialog&&(this.dialog.querySelectorAll("[data-event-field]").forEach(n=>{n.addEventListener("input",()=>{const a=Number(n.dataset.eventIndex),y=n.dataset.eventField;!Number.isInteger(a)||!y||!ee.includes(y)||(this.draftEvents[a]={...this.draftEvents[a]??U(),[y]:n.value},this.saveDraftEvents())})}),this.dialog.querySelectorAll("[data-event-remove-index]").forEach(n=>{n.addEventListener("click",()=>{const a=Number(n.dataset.eventRemoveIndex);Number.isInteger(a)&&(this.draftEvents.splice(a,1),this.saveDraftEvents(),this.render())})}),(r=this.dialog.querySelector('[data-testid="tool-events-add"]'))==null||r.addEventListener("click",()=>{this.draftEvents.push(U()),this.render()}))}}const Q=new Map;class Ae{static create(r){const n=Q.get(r);if(n)return n;const a=X(r);if(!a)throw new Error(`EditorToolFactory could not find a registered component for "${r}".`);class y{constructor({data:e,config:o,block:c}){h(this,"state");h(this,"wrapper",null);h(this,"contentRoot",null);h(this,"vueApp",null);h(this,"propertyDialog",null);h(this,"eventsDialog",null);h(this,"events",[]);h(this,"blockApi");this.blockApi=c;const s={...o??{},...ue(e)};if(this.events=ye(e),typeof s.edit!="boolean")throw new Error(`EditorToolFactory requires config.edit to be explicitly set for "${r}".`);this.state=a.normalizeProps({...s})}static get toolbox(){return a.toolbox}render(){const e=document.createElement("div");e.className="mokelay-editor-tool",e.dataset.toolName=r,e.dataset.testid=`editor-tool-${r}`;const o=document.createElement("div");return o.className="mokelay-editor-tool__content",o.dataset.testid=`editor-tool-content-${r}`,e.appendChild(o),this.wrapper=e,this.contentRoot=o,this.createPropertyDialog(),this.createEventsDialog(),this.mountVueApp(),e}destroy(){var e,o;this.unmountVueApp(),(e=this.propertyDialog)==null||e.remove(),(o=this.eventsDialog)==null||o.destroy(),this.eventsDialog=null,this.propertyDialog=null,this.contentRoot=null,this.wrapper=null}save(){return ve(a.serialize(this.state),this.events,!0)}renderSettings(){var o;const e=[];return(o=a.propertyPanel)!=null&&o.fields.length&&e.push({icon:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',title:u.t("editor.properties"),onActivate:()=>{this.openPropertyDialog()},closeOnActivate:!0}),e.push({icon:Le,title:u.t("editor.events.menu"),onActivate:()=>{this.openEventsDialog()},closeOnActivate:!0}),e}mountVueApp(){this.contentRoot&&(this.unmountVueApp(),this.vueApp=ge(a.component,{...this.state,onToolChange:e=>{Object.assign(this.state,e)},onChange:e=>{Object.assign(this.state,e)}}),this.vueApp.mount(this.contentRoot))}unmountVueApp(){var e;(e=this.vueApp)==null||e.unmount(),this.vueApp=null}createPropertyDialog(){var s;if(!this.wrapper||!((s=a.propertyPanel)!=null&&s.fields.length))return;const e=document.createElement("dialog");e.className="mokelay-editor-tool__property-dialog",e.dataset.testid="tool-property-dialog",e.dataset.toolName=r;const o=a.propertyPanel.title||u.t("editor.propertyDialogTitle"),c=a.propertyPanel.fields.map(d=>this.renderPropertyField(d)).join("");e.innerHTML=`
          <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-property-panel">
            <div class="mokelay-editor-tool__property-header">
              <h3 class="mokelay-editor-tool__property-title" data-testid="tool-property-title">${this.escapeHtml(o)}</h3>
              <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-property-close">${this.escapeHtml(u.t("editor.close"))}</button>
            </div>
            <div class="mokelay-editor-tool__property-body" data-testid="tool-property-body">
              ${c}
            </div>
          </form>
        `,this.wrapper.appendChild(e),this.propertyDialog=e,this.bindPropertyInputs()}createEventsDialog(){this.wrapper&&(this.eventsDialog=new Ve({owner:this.wrapper,toolName:r,getEvents:()=>I(this.events),setEvents:e=>{var o;this.events=I(e),(o=this.blockApi)==null||o.dispatchChange()}}),this.eventsDialog.mount())}openPropertyDialog(){this.propertyDialog&&(this.syncPropertyDialogValues(),this.propertyDialog.open||this.propertyDialog.showModal())}openEventsDialog(){var e;(e=this.eventsDialog)==null||e.open()}syncPropertyDialogValues(){this.propertyDialog&&this.propertyDialog.querySelectorAll("[data-property-key]").forEach(e=>{const o=e.dataset.propertyKey;if(!o)return;const c=this.getPropertyFieldValue(o);if(this.setPropertyInputValidity(e,""),e instanceof HTMLInputElement&&e.type==="checkbox"){e.checked=c===!0;return}e.value=this.stringifyPropertyInputValue(c,e.dataset.propertyValueType)})}updateProperty(e,o){this.state[e]=o,this.mountVueApp()}getPropertyFieldValue(e){return this.state[e]}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}renderPropertyField(e){if(e.type==="checkbox")return`
            <label class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--checkbox">
              <input
                class="mokelay-editor-tool__property-checkbox"
                data-testid="tool-property-input-${e.key}"
                data-property-key="${e.key}"
                data-property-type="checkbox"
                type="checkbox"
                ${this.getPropertyFieldValue(e.key)===!0?"checked":""}
              />
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
            </label>
          `;if(e.type==="select"){const s=this.getPropertyFieldValue(e.key),d=(e.options??[]).map(v=>`
            <option value="${this.escapeHtml(v.value)}" ${s===v.value?"selected":""}>${this.escapeHtml(v.label)}</option>
          `).join("");return`
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
              <select
                class="mokelay-editor-tool__property-input"
                data-testid="tool-property-input-${e.key}"
                data-property-key="${e.key}"
                data-property-type="select"
              >
                ${d}
              </select>
            </label>
          `}if(e.type==="textarea"){const s=this.getPropertyFieldValue(e.key),d=e.valueType??"string",v=e.validationMessage??u.t("editor.invalidJson"),k=d==="json"?6:4,_=this.stringifyPropertyInputValue(s,d);return`
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
              <textarea
                class="mokelay-editor-tool__property-input mokelay-editor-tool__property-textarea"
                data-testid="tool-property-input-${e.key}"
                data-property-key="${e.key}"
                data-property-type="textarea"
                data-property-value-type="${this.escapeHtml(d)}"
                data-property-validation-message="${this.escapeHtml(v)}"
                rows="${k}"
                placeholder="${this.escapeHtml(e.placeholder??"")}"
              >${this.escapeHtml(_)}</textarea>
              <span
                class="mokelay-editor-tool__property-error"
                data-testid="tool-property-error-${e.key}"
                data-property-error-for="${e.key}"
                hidden
              ></span>
            </label>
          `}const o=this.getPropertyFieldValue(e.key),c=e.valueType??"string";return`
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
            <input
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-${e.key}"
              data-property-key="${e.key}"
              data-property-type="text"
              data-property-value-type="${this.escapeHtml(c)}"
              data-property-validation-message="${this.escapeHtml(e.validationMessage??u.t("editor.invalidJson"))}"
              type="text"
              value="${this.escapeHtml(this.stringifyPropertyInputValue(o,c))}"
              placeholder="${this.escapeHtml(e.placeholder??"")}"
            />
          </label>
        `}bindPropertyInputs(){this.propertyDialog&&this.propertyDialog.querySelectorAll("[data-property-key]").forEach(e=>{const o=e instanceof HTMLSelectElement||e instanceof HTMLInputElement&&e.type==="checkbox"?"change":"input";e.addEventListener(o,()=>{const c=e.dataset.propertyKey;if(!c)return;const s=this.readPropertyInputValue(e);if(!s.valid){this.setPropertyInputValidity(e,s.message);return}this.setPropertyInputValidity(e,""),this.updateProperty(c,s.value)})})}readPropertyInputValue(e){if(e instanceof HTMLInputElement&&e.type==="checkbox")return{valid:!0,value:e.checked};if(e.dataset.propertyValueType==="json")try{return{valid:!0,value:JSON.parse(e.value)}}catch{return{valid:!1,message:e.dataset.propertyValidationMessage||u.t("editor.invalidJson")}}return{valid:!0,value:e.value}}stringifyPropertyInputValue(e,o){if(o==="json")try{return JSON.stringify(e,null,2)??""}catch{return""}return typeof e=="string"?e:""}setPropertyInputValidity(e,o){var d;o?e.setAttribute("aria-invalid","true"):e.removeAttribute("aria-invalid"),e.dataset.invalid=o?"true":"false",e.title=o;const c=e.dataset.propertyKey,s=c?(d=this.propertyDialog)==null?void 0:d.querySelector(`[data-property-error-for="${c}"]`):null;s&&(s.textContent=o,s.hidden=!o)}}const f=y;return Q.set(r,f),f}}function He(i={},r={}){const n=new Set(r.exclude??[]);return Object.fromEntries(Object.entries(Se()).filter(([a])=>!n.has(a)).map(([a,y])=>{var f;return[a,{class:Ae.create(a),config:y.normalizeProps({...((f=y.createInitialProps)==null?void 0:f.call(y))??{},...i})}]}))}const Me={key:1,class:"ce-editor-selector-tool__preview","data-testid":"preview-editor-selector-value"},Be=ke({__name:"MEditorSelector",props:{edit:{type:Boolean,default:!1},value:{default:void 0},excludeToolNames:{},onChange:{},onToolChange:{}},setup(i){const r="MEditorSelector",n=new Set(["paragraph","table","columns"]),a=i,{t:y,localeValue:f}=he(),C=V(null),e=V(null),o=V(M(a.value)),c=Ce(()=>o.value!==void 0);let s=null,d=!1,v=null,k=null,_=null,g=E(o.value);function E(t){return{blocks:t?[B(t)]:[]}}function $(t){return t?JSON.stringify(t):""}function O(){const t=new Set([r]);return(a.excludeToolNames??[]).forEach(l=>{t.add(l)}),t}function F(t){return!O().has(t)&&!n.has(t)&&!!X(t)}function N(t){if(F(t.type))return M(t)}function R(t){const l=S(t),m=(Array.isArray(l.blocks)?l.blocks:[]).map(P=>N(P)).filter(P=>P!==void 0);return m[m.length-1]}function te(t,l){const p=Array.isArray(t.blocks)?t.blocks:[];return l?p.length!==1?!0:$(N(p[0]))!==$(l):p.some(m=>F(m.type))}function oe(t){var p,m;const l={edit:a.edit,value:t?B(t):void 0};(p=a.onToolChange)==null||p.call(a,l),(m=a.onChange)==null||m.call(a,l)}async function j(t){const l=s;if(l){d=!0,g=E(t);try{await l.blocks.render(Y(g))}finally{await A(),d=!1}}}async function q(t){if(d)return;const l=R(t),p=$(o.value),m=$(l);o.value=l?B(l):void 0,g=E(o.value),p!==m&&oe(o.value),te(t,o.value)&&await j(o.value)}function z(){k!==null&&(window.clearTimeout(k),k=null)}function b(){!s||d||(z(),k=window.setTimeout(async()=>{if(k=null,!(!s||d))try{const t=S(await s.save());await q(t)}catch{}},0))}function re(){const t=e.value;t&&(J(),v=new MutationObserver(()=>{b()}),v.observe(t,{attributes:!0,characterData:!0,childList:!0,subtree:!0}),t.addEventListener("input",b),t.addEventListener("change",b),t.addEventListener("click",b))}function J(){const t=e.value;v==null||v.disconnect(),v=null,z(),t==null||t.removeEventListener("input",b),t==null||t.removeEventListener("change",b),t==null||t.removeEventListener("click",b)}function ae(t){return t.querySelector(".codex-editor > .ce-toolbar")}function se(t){return t.closest('[data-testid="editor-form-tool"]')??t.closest('[data-testid="editor-panel"]')??document}function le(){const t=C.value;t&&se(t).querySelectorAll(".ce-editor-selector-tool").forEach(l=>{if(l===t)return;const p=ae(l);p==null||p.classList.remove("ce-toolbar--opened")})}function ne(){C.value&&le()}function K(){_!==null&&(window.clearTimeout(_),_=null)}function Z(){K(),_=window.setTimeout(()=>{_=null,ne()},0)}async function L(){if(!a.edit||!e.value||s)return;g=E(o.value);const t=He({edit:!0},{exclude:O()});s=new de({holder:e.value,placeholder:y("editorSelector.placeholder"),tools:t,data:Y(g),minHeight:0,i18n:{messages:me(f.value)},onChange:async()=>{if(!s)return;const l=S(await s.save());await q(l)}}),re()}async function D(){const t=s;if(t){s=null,J();try{const l=S(await t.save());o.value=R(l),g=E(o.value)}catch{g=E(o.value)}t.destroy()}}async function W(){await D(),await A(),await L()}return _e(async()=>{await L()}),T(()=>a.value,async t=>{const l=M(t);$(l)!==$(o.value)&&(o.value=l,g=E(l),s&&await j(l))},{deep:!0}),T(()=>a.edit,async t=>{if(t){await A(),await L();return}await D()}),T(f,async()=>{s&&await W()}),T(()=>a.excludeToolNames,async()=>{s&&await W()},{deep:!0}),Ee(async()=>{K(),await D()}),(t,l)=>(x(),H("div",{ref_key:"rootRef",ref:C,class:G(["ce-editor-selector-tool",{"ce-editor-selector-tool--filled":c.value}]),"data-testid":"editor-selector-tool",onMouseenter:Z,onMousemove:Z},[i.edit?(x(),H("div",{key:0,class:G(["ce-editor-selector-tool__editor-shell",{"ce-editor-selector-tool__editor-shell--filled":c.value}]),"data-testid":"editor-selector-shell"},[be("div",{ref_key:"holderRef",ref:e,class:"ce-editor-selector-tool__editor","data-testid":"editor-selector-surface"},null,512)],2)):(x(),H("div",Me,[o.value?(x(),we(Te,{key:0,block:o.value},null,8,["block"])):$e("",!0)]))],34))}}),Ie=fe(Be,[["__scopeId","data-v-60881b0c"]]),qe=Object.freeze(Object.defineProperty({__proto__:null,default:Ie,mEditorSelectorEditorTool:xe},Symbol.toStringTag,{value:"Module"}));export{Ve as B,qe as M,Le as b,He as c};
