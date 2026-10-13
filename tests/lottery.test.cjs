const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const elements = new Map();
const element = () => ({ value: '', checked: true, style: {}, append() {}, replaceChildren() {}, setAttribute() {} });
const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
let stored;
let confirmation = true;
const context = {
  document: { getElementById: get, createElement: element, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: (_, value) => { stored = value; } },
  crypto: require('node:crypto').webcrypto,
  structuredClone,
  setTimeout: fn => { fn(); return 1; },
  clearTimeout() {},
  confirm: () => confirmation,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), context);
const run = code => vm.runInContext(code, context);

(async () => {
  get('roster').value = 'ALICE@example.com | Alice\nbob@example.com | Bob';
  get('raffle').value = 'alice@example.com | Alice';
  get('survey').value = 'alice@example.com | Alice\nalice@example.com | Alice';
  get('surveyWeight').value = 3;
  get('saveRoster').onclick();
  assert.equal(run('allPeople().length'), 2);
  assert.equal(run('allPeople()[0].weight'), 3);
  assert.equal(run('parseEntries(state.entries,{surveyWeight:3,mode:"sum"})[0].weight'), 5);

  context.csv = '\uFEFFEmail,Name\r\na@example.com,"Chen, Alice"\r\n';
  assert.equal(run('importedList(csv,true)'), 'a@example.com | Chen, Alice');
  context.csv = 'Email,Name\n,Alice';
  assert.throws(() => run('importedList(csv,true)'));

  run('globalThis.originalIndex=randomIndex;globalThis.ticket=0;randomIndex=()=>ticket');
  for (let ticket = 0; ticket < 4; ticket++) {
    context.ticket = ticket;
    assert.equal(run('sample(allPeople(),1)[0].name'), ticket < 3 ? 'Alice' : 'Bob');
  }
  run('randomIndex=originalIndex');

  get('prize').value = 'First prize';
  get('count').value = 2;
  await get('draw').onclick();
  assert.equal(JSON.parse(stored).rounds.length, 0);
  get('count').value = 1;
  await get('draw').onclick();
  await get('draw').onclick();
  assert.equal(JSON.parse(stored).rounds.length, 1);
  get('prize').value = 'Second prizes';
  await get('draw').onclick();
  const records = JSON.parse(stored).rounds;
  assert.equal(new Set(records.flatMap(r => r.winners.map(w => w.email))).size, 2);
  assert.equal(records[0].candidates.length, 2);
  assert.equal(records[0].settings.surveyWeight, 3);

  confirmation = false;
  get('resetDraw').onclick();
  assert.equal(run('state.rounds.length'), 2);
  confirmation = true;
  get('resetDraw').onclick();
  assert.equal(run('state.rounds.length'), 0);
  assert.equal(run('pool().length'), 2);
  run("state.entries.survey='invalid';sync()");
  await get('draw').onclick();
  assert.equal(run('state.rounds.length'), 0);
  assert.match(get('notice').textContent, /^Invalid saved pool/);
  get('reset').onclick();
  assert.equal(run('state.roster.length'), 0);
  assert.equal(run('state.settings.surveyWeight'), 1);
  console.log('PASS: CSV import, email deduplication, weighted boundaries, tier inventory, winner exclusion, snapshots, reset and invalid-pool blocking');
})().catch(error => { console.error(error); process.exitCode = 1; });
