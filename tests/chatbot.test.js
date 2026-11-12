const test = require('node:test');
const assert = require('node:assert/strict');

const { getChatbotReply } = require('../lib/chatbot.js');

test('chatbot answers common product questions', () => {
  assert.match(getChatbotReply('prix'), /89,00 €/i);
  assert.match(getChatbotReply('livraison'), /3 à 5 jours/i);
  assert.match(getChatbotReply('paiement'), /carte|PayPal|Klarna/i);
});

test('chatbot redirects to contact for personalized questions', () => {
  const reply = getChatbotReply('je veux parler avec toi');
  assert.match(reply, /contact@krypttech.com|contact/i);
});
