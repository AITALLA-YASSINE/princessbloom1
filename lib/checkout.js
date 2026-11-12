const CHECKOUT_CATALOG = {
  'princessbloom-ceinture': { name: 'Ceinture chauffante et massante Princess Bloom', price: 8900, oldPrice: 11900 },
  'princessbloom-ceinture-pack': { name: 'Pack Bien-être Complet Princess Bloom', price: 14900, oldPrice: 20900 },
};
const COUNTRIES = ['FR', 'BE', 'LU', 'DE', 'ES', 'IT', 'NL', 'PT', 'AT', 'IE'];
function getCheckoutTotals(cart, promoCode = '') {
  if (!Array.isArray(cart) || !cart.length || cart.length > 20) throw new Error('Votre panier est vide ou invalide.');
  let subtotal = 0, oldTotal = 0;
  const items = cart.map(item => {
    const entry = Object.hasOwn(CHECKOUT_CATALOG, item?.id) ? CHECKOUT_CATALOG[item.id] : null;
    if (!entry || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new Error('Un article de votre panier est invalide.');
    subtotal += entry.price * item.quantity;
    oldTotal += entry.oldPrice * item.quantity;
    return { id: item.id, ...entry, quantity: item.quantity };
  });
  const code = String(promoCode).trim().toUpperCase();
  const discount = Math.round(subtotal * (code === 'PRINCESSBLOOM10' ? .1 : code === 'PRINCESSBLOOM5' ? .05 : 0));
  return { items, subtotal, oldTotal, discount, shipping: 0, total: subtotal - discount };
}
function validateCheckoutCustomer(customer) {
  if (!customer || !['email','lastName','address','postalCode','city','country'].every(key => typeof customer[key] === 'string' && customer[key].trim() && customer[key].length < 255)) throw new Error('Complétez vos coordonnées et votre adresse de livraison.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error('Saisissez une adresse e-mail valide.');
  if (!COUNTRIES.includes(customer.country)) throw new Error('La livraison n’est pas disponible dans ce pays.');
  if (customer.country === 'FR' && !/^\d{5}$/.test(customer.postalCode)) throw new Error('Le code postal doit comporter 5 chiffres.');
  if (customer.billingSame === 'false' && !['billingName','billingAddress','billingPostalCode','billingCity','billingCountry'].every(key=> typeof customer[key] === 'string' && customer[key].trim())) throw new Error('Complétez votre adresse de facturation.');
}
module.exports = { CHECKOUT_CATALOG, COUNTRIES, getCheckoutTotals, validateCheckoutCustomer };
