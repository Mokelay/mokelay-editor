var te=Object.defineProperty;var oe=(u,s,d)=>s in u?te(u,s,{enumerable:!0,configurable:!0,writable:!0,value:d}):u[s]=d;var w=(u,s,d)=>oe(u,typeof s!="symbol"?s+"":s,d);import{A as re}from"./editorjs-CrGo22NX.js";import{i as E,u as ae,k as le,_ as se}from"./block-advanced-BuKEuWQ4.js";import{J as ne,f as ie,r as $,z as ce,F as S,A as L,B as pe,o as T,j as V,n as z,l as ue,x as de,t as ye,e as he}from"./vue-vendor-Dh3tbb7h.js";import{g as me,a as Z,n as A,c as H,_ as ve,m as fe}from"./block-form-Dj7VJMRZ.js";const K=new Map;class ge{static create(s){const d=K.get(s);if(d)return d;const r=Z(s);if(!r)throw new Error(`EditorToolFactory could not find a registered component for "${s}".`);class h{constructor({data:e,config:o}){w(this,"state");w(this,"wrapper",null);w(this,"contentRoot",null);w(this,"vueApp",null);w(this,"propertyDialog",null);const n={...o??{},...e??{}};if(typeof n.edit!="boolean")throw new Error(`EditorToolFactory requires config.edit to be explicitly set for "${s}".`);this.state=r.normalizeProps({...n})}static get toolbox(){return r.toolbox}render(){const e=document.createElement("div");e.className="mokelay-editor-tool",e.dataset.toolName=s,e.dataset.testid=`editor-tool-${s}`;const o=document.createElement("div");return o.className="mokelay-editor-tool__content",o.dataset.testid=`editor-tool-content-${s}`,e.appendChild(o),this.wrapper=e,this.contentRoot=o,this.createPropertyDialog(),this.mountVueApp(),e}destroy(){var e;this.unmountVueApp(),(e=this.propertyDialog)==null||e.remove(),this.propertyDialog=null,this.contentRoot=null,this.wrapper=null}save(){return r.serialize(this.state)}renderSettings(){var e;return(e=r.propertyPanel)!=null&&e.fields.length?{icon:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',title:E.t("editor.properties"),onActivate:()=>{this.openPropertyDialog()},closeOnActivate:!0}:[]}mountVueApp(){this.contentRoot&&(this.unmountVueApp(),this.vueApp=ne(r.component,{...this.state,onToolChange:e=>{Object.assign(this.state,e)},onChange:e=>{Object.assign(this.state,e)}}),this.vueApp.mount(this.contentRoot))}unmountVueApp(){var e;(e=this.vueApp)==null||e.unmount(),this.vueApp=null}createPropertyDialog(){var a;if(!this.wrapper||!((a=r.propertyPanel)!=null&&a.fields.length))return;const e=document.createElement("dialog");e.className="mokelay-editor-tool__property-dialog",e.dataset.testid="tool-property-dialog",e.dataset.toolName=s;const o=r.propertyPanel.title||E.t("editor.propertyDialogTitle"),n=r.propertyPanel.fields.map(i=>this.renderPropertyField(i)).join("");e.innerHTML=`
          <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-property-panel">
            <div class="mokelay-editor-tool__property-header">
              <h3 class="mokelay-editor-tool__property-title" data-testid="tool-property-title">${this.escapeHtml(o)}</h3>
              <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-property-close">${this.escapeHtml(E.t("editor.close"))}</button>
            </div>
            <div class="mokelay-editor-tool__property-body" data-testid="tool-property-body">
              ${n}
            </div>
          </form>
        `,this.wrapper.appendChild(e),this.propertyDialog=e,this.bindPropertyInputs()}openPropertyDialog(){this.propertyDialog&&(this.syncPropertyDialogValues(),this.propertyDialog.open||this.propertyDialog.showModal())}syncPropertyDialogValues(){this.propertyDialog&&this.propertyDialog.querySelectorAll("[data-property-key]").forEach(e=>{const o=e.dataset.propertyKey;if(!o)return;const n=this.getPropertyFieldValue(o);if(this.setPropertyInputValidity(e,""),e instanceof HTMLInputElement&&e.type==="checkbox"){e.checked=n===!0;return}e.value=this.stringifyPropertyInputValue(n,e.dataset.propertyValueType)})}updateProperty(e,o){this.state[e]=o,this.mountVueApp()}getPropertyFieldValue(e){return this.state[e]}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}renderPropertyField(e){if(e.type==="checkbox")return`
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
          `;if(e.type==="select"){const a=this.getPropertyFieldValue(e.key),i=(e.options??[]).map(p=>`
            <option value="${this.escapeHtml(p.value)}" ${a===p.value?"selected":""}>${this.escapeHtml(p.label)}</option>
          `).join("");return`
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
              <select
                class="mokelay-editor-tool__property-input"
                data-testid="tool-property-input-${e.key}"
                data-property-key="${e.key}"
                data-property-type="select"
              >
                ${i}
              </select>
            </label>
          `}if(e.type==="textarea"){const a=this.getPropertyFieldValue(e.key),i=e.valueType??"string",p=e.validationMessage??E.t("editor.invalidJson"),f=i==="json"?6:4,g=this.stringifyPropertyInputValue(a,i);return`
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
              <textarea
                class="mokelay-editor-tool__property-input mokelay-editor-tool__property-textarea"
                data-testid="tool-property-input-${e.key}"
                data-property-key="${e.key}"
                data-property-type="textarea"
                data-property-value-type="${this.escapeHtml(i)}"
                data-property-validation-message="${this.escapeHtml(p)}"
                rows="${f}"
                placeholder="${this.escapeHtml(e.placeholder??"")}"
              >${this.escapeHtml(g)}</textarea>
              <span
                class="mokelay-editor-tool__property-error"
                data-testid="tool-property-error-${e.key}"
                data-property-error-for="${e.key}"
                hidden
              ></span>
            </label>
          `}const o=this.getPropertyFieldValue(e.key),n=e.valueType??"string";return`
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">${this.escapeHtml(e.label)}</span>
            <input
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-${e.key}"
              data-property-key="${e.key}"
              data-property-type="text"
              data-property-value-type="${this.escapeHtml(n)}"
              data-property-validation-message="${this.escapeHtml(e.validationMessage??E.t("editor.invalidJson"))}"
              type="text"
              value="${this.escapeHtml(this.stringifyPropertyInputValue(o,n))}"
              placeholder="${this.escapeHtml(e.placeholder??"")}"
            />
          </label>
        `}bindPropertyInputs(){this.propertyDialog&&this.propertyDialog.querySelectorAll("[data-property-key]").forEach(e=>{const o=e instanceof HTMLSelectElement||e instanceof HTMLInputElement&&e.type==="checkbox"?"change":"input";e.addEventListener(o,()=>{const n=e.dataset.propertyKey;if(!n)return;const a=this.readPropertyInputValue(e);if(!a.valid){this.setPropertyInputValidity(e,a.message);return}this.setPropertyInputValidity(e,""),this.updateProperty(n,a.value)})})}readPropertyInputValue(e){if(e instanceof HTMLInputElement&&e.type==="checkbox")return{valid:!0,value:e.checked};if(e.dataset.propertyValueType==="json")try{return{valid:!0,value:JSON.parse(e.value)}}catch{return{valid:!1,message:e.dataset.propertyValidationMessage||E.t("editor.invalidJson")}}return{valid:!0,value:e.value}}stringifyPropertyInputValue(e,o){if(o==="json")try{return JSON.stringify(e,null,2)??""}catch{return""}return typeof e=="string"?e:""}setPropertyInputValidity(e,o){var i;o?e.setAttribute("aria-invalid","true"):e.removeAttribute("aria-invalid"),e.dataset.invalid=o?"true":"false",e.title=o;const n=e.dataset.propertyKey,a=n?(i=this.propertyDialog)==null?void 0:i.querySelector(`[data-property-error-for="${n}"]`):null;a&&(a.textContent=o,a.hidden=!o)}}const m=h;return K.set(s,m),m}}function ke(u={},s={}){const d=new Set(s.exclude??[]);return Object.fromEntries(Object.entries(me()).filter(([r])=>!d.has(r)).map(([r,h])=>{var m;return[r,{class:ge.create(r),config:h.normalizeProps({...((m=h.createInitialProps)==null?void 0:m.call(h))??{},...u})}]}))}const _e={key:1,class:"ce-editor-selector-tool__preview","data-testid":"preview-editor-selector-value"},be=ie({__name:"MEditorSelector",props:{edit:{type:Boolean,default:!1},value:{default:void 0},excludeToolNames:{},onChange:{},onToolChange:{}},setup(u){const s="MEditorSelector",d=new Set(["paragraph","table","columns"]),r=u,{t:h,localeValue:m}=ae(),C=$(null),e=$(null),o=$(A(r.value)),n=he(()=>o.value!==void 0);let a=null,i=!1,p=null,f=null,g=null,v=k(o.value);function k(t){return{blocks:t?[H(t)]:[]}}function b(t){return t?JSON.stringify(t):""}function M(){const t=new Set([s]);return(r.excludeToolNames??[]).forEach(l=>{t.add(l)}),t}function D(t){return!M().has(t)&&!d.has(t)&&!!Z(t)}function B(t){if(D(t.type))return A(t)}function I(t){const c=(Array.isArray(t.blocks)?t.blocks:[]).map(y=>B(y)).filter(y=>y!==void 0);return c[c.length-1]}function U(t,l){const c=Array.isArray(t.blocks)?t.blocks:[];return l?c.length!==1?!0:b(B(c[0]))!==b(l):c.some(y=>D(y.type))}function Y(t){var c,y;const l={edit:r.edit,value:t?H(t):void 0};(c=r.onToolChange)==null||c.call(r,l),(y=r.onChange)==null||y.call(r,l)}async function O(t){const l=a;if(l){i=!0,v=k(t);try{await l.blocks.render(v)}finally{await L(),i=!1}}}async function R(t){if(i)return;const l=I(t),c=b(o.value),y=b(l);o.value=l?H(l):void 0,v=k(o.value),c!==y&&Y(o.value),U(t,o.value)&&await O(o.value)}function F(){f!==null&&(window.clearTimeout(f),f=null)}function _(){!a||i||(F(),f=window.setTimeout(async()=>{if(f=null,!(!a||i))try{const t=await a.save();await R(t)}catch{}},0))}function G(){const t=e.value;t&&(j(),p=new MutationObserver(()=>{_()}),p.observe(t,{attributes:!0,characterData:!0,childList:!0,subtree:!0}),t.addEventListener("input",_),t.addEventListener("change",_),t.addEventListener("click",_))}function j(){const t=e.value;p==null||p.disconnect(),p=null,F(),t==null||t.removeEventListener("input",_),t==null||t.removeEventListener("change",_),t==null||t.removeEventListener("click",_)}function Q(t){return t.querySelector(".codex-editor > .ce-toolbar")}function W(t){return t.closest('[data-testid="editor-form-tool"]')??t.closest('[data-testid="editor-panel"]')??document}function X(){const t=C.value;t&&W(t).querySelectorAll(".ce-editor-selector-tool").forEach(l=>{if(l===t)return;const c=Q(l);c==null||c.classList.remove("ce-toolbar--opened")})}function ee(){C.value&&X()}function N(){g!==null&&(window.clearTimeout(g),g=null)}function J(){N(),g=window.setTimeout(()=>{g=null,ee()},0)}async function x(){if(!r.edit||!e.value||a)return;v=k(o.value);const t=ke({edit:!0},{exclude:M()});a=new re({holder:e.value,placeholder:h("editorSelector.placeholder"),tools:t,data:v,minHeight:0,i18n:{messages:le(m.value)},onChange:async()=>{if(!a)return;const l=await a.save();await R(l)}}),G()}async function P(){const t=a;if(t){a=null,j();try{const l=await t.save();o.value=I(l),v=k(o.value)}catch{v=k(o.value)}t.destroy()}}async function q(){await P(),await L(),await x()}return ce(async()=>{await x()}),S(()=>r.value,async t=>{const l=A(t);b(l)!==b(o.value)&&(o.value=l,v=k(l),a&&await O(l))},{deep:!0}),S(()=>r.edit,async t=>{if(t){await L(),await x();return}await P()}),S(m,async()=>{a&&await q()}),S(()=>r.excludeToolNames,async()=>{a&&await q()},{deep:!0}),pe(async()=>{N(),await P()}),(t,l)=>(T(),V("div",{ref_key:"rootRef",ref:C,class:z(["ce-editor-selector-tool",{"ce-editor-selector-tool--filled":n.value}]),"data-testid":"editor-selector-tool",onMouseenter:J,onMousemove:J},[u.edit?(T(),V("div",{key:0,class:z(["ce-editor-selector-tool__editor-shell",{"ce-editor-selector-tool__editor-shell--filled":n.value}]),"data-testid":"editor-selector-shell"},[ue("div",{ref_key:"holderRef",ref:e,class:"ce-editor-selector-tool__editor","data-testid":"editor-selector-surface"},null,512)],2)):(T(),V("div",_e,[o.value?(T(),de(ve,{key:0,block:o.value},null,8,["block"])):ye("",!0)]))],34))}}),we=se(be,[["__scopeId","data-v-865609b6"]]),Pe=Object.freeze(Object.defineProperty({__proto__:null,default:we,mEditorSelectorEditorTool:fe},Symbol.toStringTag,{value:"Module"}));export{Pe as M,ke as c};
