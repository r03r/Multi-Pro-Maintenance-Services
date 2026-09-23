import assert from 'node:assert/strict';
import { handleSuggestion, suggestService, createLimiter } from '../server/jev.js';
import api from '../api/suggest-service.js';

const env = { TYPESAFE_API_KEY: 'test-only-key', TYPESAFE_MODEL: 'jev-test' };
const request = (body = { description: 'Replace the kitchen cabinets' }, extra = {}) => new Request('https://example.test/api/suggest-service', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.test' }, body: JSON.stringify(body), ...extra,
});
const answer = (choice = 'kitchen', confidence = 0.94, probability = 0.95) => Response.json({ answers: { service: { type: 'choice', choice, confidence, probabilities: { [choice]: probability } } } });
let calls = 0;
const fetchImpl = async (url, options) => {
  calls++;
  assert.equal(url, 'https://api.typesafe.ai/v1/systemone');
  assert.equal(options.headers.Authorization, 'Bearer test-only-key');
  const payload = JSON.parse(options.body);
  assert.equal(payload.model, 'jev-test');
  assert.deepEqual(Object.keys(payload.state), ['project_description']);
  assert.equal(payload.questions.service.type, 'choice');
  assert.ok(payload.questions.service.criteria.unclear);
  return answer();
};
const deps = { env, fetchImpl, allow: () => true };
let response = await handleSuggestion(request({ description: 'Cambiar los gabinetes de mi cocina', name: 'Not sent', phone: 'Not sent' }), deps);
assert.equal(response.status, 200); assert.deepEqual(await response.json(), { service: 'kitchen' });
assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal(calls, 1);
for (const [choice, confidence, probability] of [['kitchen', .3, .95], ['kitchen', .9, .6], ['unclear', .99, .99]]) {
  assert.deepEqual(await suggestService('Ambiguous job', { apiKey: 'test', fetchImpl: async () => answer(choice, confidence, probability) }), { service: null });
}
for (const result of [answer('not-a-service'), answer('kitchen', 2), answer('kitchen', .9, -1), Response.json({ answers: {} }), new Response('error', { status: 429 })]) {
  response = await handleSuggestion(request(), { ...deps, fetchImpl: async () => result });
  assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'unavailable' });
}
response = await handleSuggestion(request(), { ...deps, fetchImpl: async () => { throw new Error('secret provider detail'); } });
assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('secret'));
response = await handleSuggestion(request(), { ...deps, env: {} }); assert.equal(response.status, 503);
response = await api.fetch(new Request('https://example.test/api/suggest-service')); assert.equal(response.status, 405);
for (const body of [{description:'tiny'}, {description:'x'.repeat(1001)}, {description:{}}, null]) {
  assert.equal((await handleSuggestion(request(body), deps)).status, 400);
}
assert.equal((await handleSuggestion(request({}, {body:'{'}), deps)).status, 400);
assert.equal((await handleSuggestion(request({}, {body:'x'.repeat(6001)}), deps)).status, 413);
assert.equal((await handleSuggestion(request({}, {headers:{Origin:'https://other.test','Content-Type':'application/json'}}), deps)).status, 403);
assert.equal((await handleSuggestion(request({}, {headers:{'Content-Type':'text/plain'}}), deps)).status, 415);
response = await handleSuggestion(request(), {...deps, allow:()=>false});assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'60');
const limiter = createLimiter();for(let i=0;i<10;i++)assert.ok(limiter('test',0));assert.equal(limiter('test',0),false);assert.ok(limiter('test',60_000));
// A real fetch timeout contract, with no external network call.
await assert.rejects(suggestService('Replace flooring', {apiKey:'test',timeoutMs:5,fetchImpl:(_,opts)=>new Promise((_,reject)=>{
 const timer=setTimeout(()=>reject(new Error('timeout did not abort')),100);
 opts.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(opts.signal.reason)});
})}), {name:'TimeoutError'});
console.log('PASS: Jev request contract, allowed suggestions, uncertainty, invalid responses, provider failure/timeout, no key, validation, body limit, origin, throttling, no secret/customer-field leakage. No live API calls.');
