/* eslint-disable @typescript-eslint/no-require-imports -- Node test files use the existing CommonJS runner. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { getCheckoutTotals, validateCheckoutCustomer } = require('../lib/checkout');
const customer = {email:'test@example.com',lastName:'Martin',address:'12 rue des Fleurs',postalCode:'75001',city:'Paris',country:'FR'};
test('checkout uses catalog prices instead of client prices and offers free shipping',()=>{
 const totals=getCheckoutTotals([{id:'princessbloom-ceinture',price:1,quantity:2},{id:'princessbloom-ceinture-pack',price:0,quantity:1}]);
 assert.equal(totals.total,32700); assert.equal(totals.shipping,0);
});
test('checkout applies only supported promotion codes with cent rounding',()=>{
 assert.equal(getCheckoutTotals([{id:'princessbloom-ceinture',quantity:1}],'princessbloom5').total,8455);
 assert.equal(getCheckoutTotals([{id:'princessbloom-ceinture-pack',quantity:1}],'PRINCESSBLOOM10').total,13410);
 assert.equal(getCheckoutTotals([{id:'princessbloom-ceinture',quantity:1}],'UNKNOWN').total,8900);
});
test('checkout rejects empty carts, unknown products and invalid quantities',()=>{
 for (const cart of [[],[{id:'unknown',quantity:1}],[{id:'princessbloom-ceinture',quantity:0}],[{id:'princessbloom-ceinture',quantity:-1}],[{id:'princessbloom-ceinture',quantity:1.5}],[{id:'princessbloom-ceinture',quantity:21}]]) assert.throws(()=>getCheckoutTotals(cart));
});
test('checkout requires delivery details and validates country, email and billing address',()=>{
 assert.doesNotThrow(()=>validateCheckoutCustomer(customer));
 for(const change of [{email:'invalid'},{postalCode:'123'},{country:'XX'},{lastName:''},{billingSame:'false'}]) assert.throws(()=>validateCheckoutCustomer({...customer,...change}));
});
