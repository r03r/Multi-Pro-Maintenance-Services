import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {t as TRANSLATIONS} from '../src/data/content.js';
// Exercise actual component scripts without browser dependencies. These mocks do not test layout.
const root = new URL('../', import.meta.url);
const extract=path=>fs.readFileSync(new URL(path, root),'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
let currentDocument;
class Element {
  constructor(id=''){this.id=id;this.children=[];this.listeners={};this.style={display:'',setProperty(k,v){this[k]=v}};this.dataset={};this.attributes={};this.value='';this.textContent='';this.innerHtml='';this.disabled=false;this.inert=false;this.className='';this.classes=new Set();this.classList={add:(...x)=>x.forEach(y=>this.classes.add(y)),remove:(...x)=>x.forEach(y=>this.classes.delete(y)),contains:x=>this.classes.has(x)||this.className.split(' ').includes(x),toggle:(x,b)=>{const yes=b??!this.classes.has(x);yes?this.classes.add(x):this.classes.delete(x);return yes}};}
  set innerHTML(s){this.innerHtml=s;this.children=[]} get innerHTML(){return this.innerHtml}
  appendChild(x){x.parent=this;this.children.push(x);return x}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
  focus(){currentDocument.activeElement=this}
  setAttribute(k,v){this.attributes[k]=v}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
  fire(name,event={}){for(const fn of this.listeners[name]||[])fn({target:this,preventDefault(){this.prevented=true},...event})}
  contains(el){return this===el||this.children.some(c=>c.contains(el))}
  querySelector(s){if(s==='.chip-label')return this.label;if(s==='.chat-close')return currentDocument.getElementById('chat-close');return this.querySelectorAll(s)[0]||null}
  querySelectorAll(s){if(s==='a, button, input, textarea'||s==='a, button, input'||s==='a, button')return this.focusables||[];return []}
  scrollTo(){} setCustomValidity(v){this.validity=v} reportValidity(){this.reported=true} getClientRects(){return [1]}
}
function environment(){
  const els=new Map(),docListeners={},timers=new Map(),mediaListeners=[];let clock=0,tid=0;
  const el=id=>{if(!els.has(id))els.set(id,new Element(id));return els.get(id)};
  const all=()=>[...els.values()].flatMap(function flatten(x){return [x,...x.children.flatMap(flatten)]});
  const doc={body:el('body'),documentElement:{lang:'en'},activeElement:el('initial-focus'),getElementById(id){return all().find(x=>x.id===id)||null},createElement(){return new Element()},querySelector(s){if(s==='[data-key="painting"]')return el('paint-button');return null},querySelectorAll(s){if(s==='.bubble-bot.latest-prompt')return all().filter(x=>x.className.includes('bubble-bot')&&x.className.includes('latest-prompt'));if(s==='.mobile-link')return [el('mobile-link')];if(s==='[data-key]')return [el('paint-button')];if(s==='[data-es][data-en]')return [el('translation')];return []},addEventListener(name,fn){(docListeners[name]??=[]).push(fn)},fire(name,e={}){for(const f of docListeners[name]||[])f({preventDefault(){this.prevented=true},...e})}};
  currentDocument=doc;
  for(const id of ['chat-overlay','chat-modal','chat-close','chat-messages','chat-progress-bar','chat-text-input','chat-service-chips','chat-city-chips','chat-budget-chips','chat-timeline-chips','chat-done-btns','chat-text-field','chat-wa-btn','fab-container','main-fab','contact-menu','fab-quote','dynamic-msg-link','dynamic-msg-label','dynamic-msg-icon','header','hamburger','mobile-menu','mobile-close','mobile-link','lang-es','lang-en','translation','paint-button','chat-project','chat-project-description','chat-project-analyze','chat-project-suggestion','chat-project-confirm','chat-project-status'])el(id);
  el('chat-overlay').focusables=[el('chat-close'),el('chat-text-field')];el('mobile-menu').focusables=[el('mobile-close'),el('mobile-link')];el('fab-container').appendChild(el('main-fab'));el('fab-container').appendChild(el('fab-quote'));el('translation').dataset={en:'English',es:'Español'};el('paint-button').dataset.key='painting';el('paint-button').label=new Element();el('paint-button').label.dataset={en:'Painting',es:'Pintura'};
  const context={document:doc,TRANSLATIONS,AbortController,Set,URL,Node:Element,localStorage:{getItem(){return 'en'},setItem(){}},navigator:{userAgent:'Linux',platform:'Linux'},setTimeout(fn,delay){timers.set(++tid,{at:clock+delay,fn});return tid},clearTimeout(id){timers.delete(id)},addEventListener(){},matchMedia(){return {addEventListener(n,fn){mediaListeners.push(fn)}}},IntersectionObserver:class {observe(){}},scrollY:0};context.window=context;vm.createContext(context);
  const tick=ms=>{const end=clock+ms;while(true){const first=[...timers.entries()].sort((a,b)=>a[1].at-b[1].at)[0];if(!first||first[1].at>end)break;clock=first[1].at;timers.delete(first[0]);first[1].fn()}clock=end};
  return {ctx:context,el,doc,tick,eval:s=>vm.runInContext(s,context),run:path=>vm.runInContext(path.includes('Chatbot')?extract(path):`(()=>{${extract(path)}})()`,context),media:()=>mediaListeners.forEach(f=>f({matches:true}))};
}
const x=environment();x.run('src/components/Chatbot.astro');x.run('src/components/FloatingActions.astro');x.run('src/pages/index.astro');x.doc.fire('DOMContentLoaded');
// Mobile navigation preserves expand/inert state, keyboard loop, and closes on link or wider viewport.
x.el('hamburger').fire('click');assert.equal(x.el('mobile-menu').inert,false);assert.equal(x.el('hamburger').attributes['aria-expanded'],'true');assert.equal(x.doc.activeElement,x.el('mobile-close'));
x.doc.fire('keydown',{key:'Tab',shiftKey:true});assert.equal(x.doc.activeElement,x.el('mobile-link'));x.doc.fire('keydown',{key:'Tab'});assert.equal(x.doc.activeElement,x.el('mobile-close'));
x.el('mobile-link').fire('click');assert.equal(x.el('mobile-menu').inert,true);assert.equal(x.doc.body.style.overflow,'');x.el('hamburger').fire('click');x.media();assert.equal(x.el('mobile-menu').inert,true);
x.el('lang-es').fire('click');assert.equal(x.doc.documentElement.lang,'es');assert.equal(x.el('translation').textContent,'Español');x.el('lang-en').fire('click');
// FAB quote launches chat and returns focus to visible trigger after close.
x.el('main-fab').fire('click');assert.equal(x.el('contact-menu').inert,false);assert.equal(x.el('main-fab').attributes['aria-expanded'],'true');x.el('fab-quote').focus();x.el('fab-quote').fire('click');assert.equal(x.el('contact-menu').inert,true);assert.equal(x.el('chat-overlay').inert,false);assert.equal(x.doc.activeElement,x.el('chat-close'));
x.tick(800);assert.equal(x.eval('chatStep'),'service');let before=x.el('chat-messages').children.length;x.ctx.chatPickService('painting');x.ctx.chatPickService('painting');assert.equal(x.el('chat-messages').children.filter(b=>b.className.includes('bubble-user')).length,1);x.tick(800);
const prompts=x.el('chat-messages').children.filter(b=>b.className.includes('bubble-bot')).map(b=>b.children[0]?.textContent);assert.equal(prompts.filter(s=>s===TRANSLATIONS.chat_q_service.en).length,1);assert.equal(prompts.at(-1),TRANSLATIONS.chat_q_address.en.replace('{service}','Painting'));
x.ctx.switchToManualCity();const payload='<img src=x onerror=alert(1)> $&';x.el('chat-text-field').value=payload;x.ctx.chatSendText();x.ctx.chatSendText();assert.equal(x.eval('chatStep'),'budget');x.tick(800);x.ctx.switchToManualCity();assert.equal(x.el('chat-text-input').style.display,'none');
const chip=value=>({querySelector(){return {dataset:{en:value,es:value}}}});x.ctx.chatPickBudget(chip('$1k'));x.ctx.chatPickBudget(chip('duplicate'));x.tick(800);x.ctx.chatPickTimeline(chip('Soon'));x.ctx.chatPickTimeline(chip('duplicate'));x.tick(800);
x.el('chat-text-field').value=payload;x.el('chat-text-field').fire('keydown',{key:'Enter'});x.el('chat-text-field').fire('keydown',{key:'Enter'});assert.equal(x.eval('chatStep'),'phone');x.tick(600);const last=x.el('chat-messages').children.at(-1).children[0];assert.equal(last.textContent,TRANSLATIONS.chat_q_phone.en.replace('{name}',()=>payload));assert.equal(last.innerHTML,'');
x.el('chat-text-field').value='abc';x.ctx.chatSendText();assert.equal(x.eval('chatStep'),'phone');assert.equal(x.el('chat-text-field').reported,true);x.el('chat-text-field').value='+1 (323) 970-7517';x.ctx.chatSendText();x.ctx.chatSendText();assert.equal(x.eval('chatStep'),'done');x.tick(1000);const wa=new URL(x.el('chat-wa-btn').href);assert.equal(wa.origin,'https://wa.me');assert.ok(wa.searchParams.get('text').includes(payload));assert.ok(!wa.searchParams.get('text').includes('duplicate'));
assert.equal(x.el('chat-messages').children.filter(b=>b.className.includes('bubble-user')).length,6);x.ctx.closeChat();assert.equal(x.doc.activeElement,x.el('main-fab'));assert.equal(x.el('chat-overlay').inert,true);
// Restart cancels prior timers and closing during delayed input does not steal focus.
x.ctx.openChat();x.ctx.chatRestart();x.ctx.chatRestart();x.tick(800);assert.equal(x.el('chat-messages').children.length,2);x.ctx.chatPickService('painting');x.tick(800);x.ctx.chatPickCity('LA');x.tick(800);x.ctx.chatPickBudget(chip('Budget'));x.tick(800);x.ctx.chatPickTimeline(chip('Now'));x.ctx.closeChat();const restored=x.doc.activeElement;x.tick(800);assert.equal(x.doc.activeElement,restored);
// Outside click and Escape close FAB.
x.el('main-fab').fire('click');x.doc.fire('click',{target:new Element('outside')});assert.equal(x.el('main-fab').attributes['aria-expanded'],'false');x.el('main-fab').fire('click');x.doc.fire('keydown',{key:'Escape'});assert.equal(x.el('contact-menu').inert,true);
console.log('PASS: menu/focus/keyboard/resize, translations, FAB open/close/outside/Escape/quote/focus return, full chat, rapid selections/Enter without duplicates, literal HTML and replacement characters, phone validation, encoded WhatsApp draft, restart cancels timers, close during transition does not steal focus.');

// Jev suggestions require confirmation; fallback and stale responses preserve the manual flow.
x.ctx.startChat();x.tick(800);
let apiCalls=0;
x.ctx.fetch=async (url,options)=>{apiCalls++;assert.equal(url,'/api/suggest-service');assert.deepEqual(JSON.parse(options.body),{description:'Paint all the living room walls'});return {ok:true,json:async()=>({service:'painting'})}};
x.el('chat-project-description').value='tiny';await x.ctx.chatAnalyzeProject();assert.equal(apiCalls,0);
x.el('chat-project-description').value='Paint all the living room walls';
await x.ctx.chatAnalyzeProject();assert.equal(x.eval('chatStep'),'service');assert.equal(x.el('chat-project-suggestion').style.display,'flex');
assert.equal(x.eval('chatData.service'),undefined);x.ctx.chatConfirmSuggestion();assert.equal(x.eval('chatData.service'),'Painting');
x.ctx.startChat();x.tick(800);x.el('chat-project-description').value='Paint all the living room walls';
x.ctx.fetch=async()=>({ok:true,json:async()=>({service:null})});await x.ctx.chatAnalyzeProject();assert.equal(x.eval('chatStep'),'service');assert.equal(x.el('chat-project-suggestion').style.display,'none');assert.equal(x.el('chat-service-chips').style.display,'flex');
x.ctx.fetch=async()=>{throw new Error('network')};await x.ctx.chatAnalyzeProject();assert.equal(x.el('chat-project-analyze').disabled,false);assert.equal(x.el('chat-project-status').textContent,TRANSLATIONS.chat_project_unavailable.en);
let resolveRequest;let pendingCalls=0;
x.ctx.fetch=()=>{pendingCalls++;return new Promise(resolve=>resolveRequest=resolve)};
const pending=x.ctx.chatAnalyzeProject();await x.ctx.chatAnalyzeProject();assert.equal(pendingCalls,1);x.ctx.chatPickService('painting');
resolveRequest({ok:true,json:async()=>({service:'painting'})});await pending;assert.equal(x.eval('chatStep'),'address');assert.equal(x.el('chat-project-suggestion').style.display,'none');
x.ctx.startChat();x.tick(800);x.el('chat-project-description').value='Paint all the living room walls';
const stale=x.ctx.chatAnalyzeProject();x.ctx.startChat();resolveRequest({ok:true,json:async()=>({service:'painting'})});await stale;assert.equal(x.eval('chatData.description'),undefined);assert.equal(x.el('chat-project-suggestion').style.display,'none');
x.tick(800);x.el('chat-project-description').value='Paint all the living room walls';x.ctx.fetch=async()=>({ok:true,json:async()=>({service:'painting'})});await x.ctx.chatAnalyzeProject();x.el('chat-project-description').fire('input');assert.equal(x.eval('suggestedService'),null);assert.equal(x.eval('chatData.description'),undefined);
console.log('PASS: Jev chat confirmation, invalid input, uncertainty, failure fallback, duplicate requests, manual choice during request, restart and edited descriptions invalidate stale results.');
