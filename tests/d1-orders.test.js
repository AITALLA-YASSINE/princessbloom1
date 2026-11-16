const test = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { persistStripeOrder, getD1Config } = require('../lib/d1-orders');
const { processStripePaymentEvent } = require('../lib/stripe-webhook');
const { getCheckoutTotals } = require('../lib/checkout');
const env = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_D1_DATABASE_ID: '2af41e87-39c2-4241-8c08-9ec479e386ef', CLOUDFLARE_D1_API_TOKEN: 'private-test-token' };
function fixture() {
  const intent = { id:'pi_test123',livemode:false,status:'succeeded',amount:3999,amount_received:3999,currency:'eur',receipt_email:'CLIENT@example.com',shipping:{name:"Léa O'Connor",address:{line1:'1 rue des Roses'}},metadata:{store:'princess_bloom',items:JSON.stringify([{id:'princessbloom-ceinture',quantity:1}])} };
  return {intent,event:{id:'evt_test123',created:1790000000,type:'payment_intent.succeeded',livemode:false,data:{object:{id:intent.id}}},totals:getCheckoutTotals(JSON.parse(intent.metadata.items)),status:'paid'};
}
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(require.resolve('../d1-schema.sql'),'utf8'));
  const fetch = async (url, options) => {
    assert.match(url,/api.cloudflare.com/);
    assert.equal(options.headers.Authorization,`Bearer ${env.CLOUDFLARE_D1_API_TOKEN}`);
    const {sql,params} = JSON.parse(options.body);
    db.prepare(sql).run(...params);
    return {ok:true,json:async()=>({success:true,result:[{success:true}]})};
  };
  return {db,options:{env,fetch}};
}
test('D1 saves all French tables, replays safely and preserves paid status', async () => {
  const {db,options} = database(); const data=fixture();
  await persistStripeOrder(data,options); await persistStripeOrder(data,options);
  for (const table of ['clients','commandes','articles_commandes','paiements','evenements_stripe']) assert.equal(db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n,1);
  assert.equal(db.prepare('SELECT email FROM clients').get().email,'client@example.com');
  assert.equal(db.prepare('SELECT total_centimes FROM commandes').get().total_centimes,3999);
  await persistStripeOrder({...data,status:'failed',event:{...data.event,id:'evt_late'}},options);
  assert.equal(db.prepare('SELECT statut_paiement FROM commandes').get().statut_paiement,'paid');
  assert.equal(db.prepare('SELECT statut FROM paiements').get().statut,'paid');
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0); db.close();
});
test('D1 partial failure can be retried without duplicate orders or clients',async()=>{
  const {db,options}=database(); let calls=0;
  await assert.rejects(persistStripeOrder(fixture(),{...options,fetch:async(...args)=>{if(++calls===4) throw Error('network'); return options.fetch(...args);}}));
  assert.equal(db.prepare('SELECT count(*) AS n FROM evenements_stripe').get().n,0);
  await persistStripeOrder(fixture(),options);
  assert.equal(db.prepare('SELECT count(*) AS n FROM commandes').get().n,1); db.close();
});
test('configuration and Cloudflare failures propagate without exposing secrets',async()=>{
  assert.throws(()=>getD1Config({}),/d1_configuration/);
  await assert.rejects(persistStripeOrder(fixture(),{env,fetch:async()=>({ok:false,status:403})}),/d1_http_403/);
  await assert.rejects(persistStripeOrder(fixture(),{env,fetch:async()=>({ok:true,json:async()=>({success:false})})}),/d1_query_failed/);
});
test('exact first and last names stay separate, including compound names and old replays',async()=>{
  const {db,options}=database(); const data=fixture();
  data.intent.metadata.customer_first_name='Marie Claire';
  data.intent.metadata.customer_last_name='De La Tour';
  await persistStripeOrder(data,options);
  let client=db.prepare('SELECT prenom,nom FROM clients').get();
  assert.equal(client.prenom,'Marie Claire'); assert.equal(client.nom,'De La Tour');
  delete data.intent.metadata.customer_first_name; delete data.intent.metadata.customer_last_name;
  await persistStripeOrder(data,options);
  client=db.prepare('SELECT prenom,nom FROM clients').get();
  assert.equal(client.prenom,'Marie Claire'); assert.equal(client.nom,'De La Tour'); db.close();
});
test('generated euro columns format old and future amounts with two decimals automatically',async()=>{
  const {db,options}=database(); await persistStripeOrder(fixture(),options);
  db.exec(readFileSync(require.resolve('../d1-display-euros.sql'),'utf8'));
  assert.equal(db.prepare('SELECT montant_euros FROM paiements').get().montant_euros,'39,99');
  assert.equal(db.prepare('SELECT prix_unitaire_euros FROM articles_commandes').get().prix_unitaire_euros,'39,99');
  assert.equal(db.prepare('SELECT total_euros FROM commandes').get().total_euros,'39,99');
  db.exec('UPDATE paiements SET montant_centimes=14900');
  assert.equal(db.prepare('SELECT montant_euros FROM paiements').get().montant_euros,'149,00');
  db.exec('UPDATE paiements SET montant_centimes=5');
  assert.equal(db.prepare('SELECT montant_euros FROM paiements').get().montant_euros,'0,05'); db.close();
});
test('webhook retries database writes even after a Stripe paid marker exists',async()=>{
  const {intent,event}=fixture(); intent.metadata.princessbloom_payment_status='paid';
  const stripe={paymentIntents:{retrieve:async()=>intent}};
  await assert.rejects(processStripePaymentEvent(event,stripe,async()=>{throw Error('d1_unavailable');}),/d1_unavailable/);
  let saved=false;
  assert.equal((await processStripePaymentEvent(event,stripe,async()=>{saved=true;})).status,'paid');
  assert.ok(saved);
});
