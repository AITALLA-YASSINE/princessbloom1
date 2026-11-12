const CONTACT_EMAIL = 'contact@krypttech.com';

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getChatbotReply(message) {
  const text = normalizeText(message);

  if (!text) {
    return 'Bonjour ! Je peux répondre à vos questions sur le produit, la livraison, le paiement ou vous orienter vers le contact.';
  }

  if (/(bonjour|salut|bonsoir|hello)/.test(text)) {
    return 'Bonjour ! Je suis l’assistant Princess Bloom. Posez-moi une question sur le produit, la livraison, le paiement ou le contact.';
  }

  if (/(prix|cout|coût|tarif|combien|89|90)/.test(text)) {
    return 'La ceinture Princess Bloom est au prix de 89,00 € au lieu de 119,00 €. Elle inclut la chaleur ciblée, plusieurs modes de vibration et un design discret.';
  }

  if (/(livraison|delai|délai|exped|transport|livrer)/.test(text)) {
    return 'La livraison standard est généralement de 3 à 5 jours ouvrés. Vous pouvez aussi choisir une livraison express lors du paiement.';
  }

  if (/(paiement|pay|carte|paypal|klarna|cb|mode de paiement)/.test(text)) {
    return 'Le paiement se fait généralement par carte bancaire, PayPal ou Klarna selon les options disponibles au moment du checkout.';
  }

  if (/(utilisation|comment|fonctionne|marche|mode|chaud|vibration|temp)/.test(text)) {
    return 'La ceinture se porte confortablement sous les vêtements, avec plusieurs niveaux de chaleur et de vibration. Les séances peuvent durer 15 ou 30 minutes selon votre confort.';
  }

  if (/(ceinture|produit|massante|chauffante|bien etre|confort)/.test(text)) {
    return 'La Princess Bloom est une ceinture chauffante et massante pensée pour un confort discret au quotidien, avec chaleur ciblée et vibrations douces.';
  }

  if (/(contact|relation|parler|service client|aide|question|besoin|demande)/.test(text)) {
    return `Bien sûr. Pour une question plus personnelle ou un besoin spécifique, vous pouvez nous écrire à ${CONTACT_EMAIL}.`;
  }

  if (/(retour|retract|reclamation|réclamation|sav)/.test(text)) {
    return `Pour un retour, une rétractation ou une demande de service client, écrivez-nous à ${CONTACT_EMAIL}.`;
  }

  return `Je peux vous aider sur la ceinture, la livraison, le paiement et les contacts. Pour une demande personnalisée, écrivez-nous à ${CONTACT_EMAIL}.`;
}

module.exports = {
  CONTACT_EMAIL,
  getChatbotReply,
};
