// Server-side only: credentials are never returned to the browser.
function getD1Config(env = process.env) {
  const clean = value => String(value || '').trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
  const account = clean(env.CLOUDFLARE_ACCOUNT_ID);
  const database = clean(env.CLOUDFLARE_D1_DATABASE_ID);
  const token = clean(env.CLOUDFLARE_D1_API_TOKEN);
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-f0-9-]{36}$/i.test(database) || !token) {
    throw new Error('d1_configuration_missing_or_invalid');
  }
  return { account, database, token };
}

async function persistStripeOrder({ event, intent, totals, status }, options = {}) {
  const config = getD1Config(options.env);
  const send = options.fetch || fetch;
  const query = async (sql, params) => {
    const response = await send(`https://api.cloudflare.com/client/v4/accounts/${config.account}/d1/database/${config.database}/query`, {
      method: 'POST', cache: 'no-store',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }), signal: AbortSignal.timeout(15000),
    });
    // Do not log Cloudflare responses: they can contain customer data.
    if (!response.ok) throw new Error(`d1_http_${response.status}`);
    const body = await response.json();
    if (!body.success || !Array.isArray(body.result) || !body.result.length || body.result.some(r => !r.success)) {
      throw new Error('d1_query_failed');
    }
  };
  const now = new Date().toISOString();
  const email = intent.receipt_email?.trim().toLowerCase() || null;
  const orderId = intent.id;
  const live = intent.livemode ? 1 : 0;
  // Stable IDs and upserts make every step safe to replay after partial failure.
  // The event is recorded last, only when all order data has been saved.
  if (email) {
    const metadata = intent.metadata || {};
    const separated = Object.hasOwn(metadata, 'customer_last_name');
    await query(`INSERT INTO clients (id,email,prenom,nom,telephone) VALUES (?,?,?,?,?)
      ON CONFLICT(email) DO UPDATE SET
      prenom=CASE WHEN ? THEN excluded.prenom ELSE clients.prenom END,
      nom=CASE WHEN ? THEN excluded.nom ELSE COALESCE(clients.nom,excluded.nom) END,
      telephone=COALESCE(excluded.telephone,clients.telephone),modifie_le=?`,
    [`client_${orderId}`, email, separated ? metadata.customer_first_name || null : null,
      separated ? metadata.customer_last_name : intent.shipping?.name || null,
      intent.shipping?.phone || null, separated ? 1 : 0, separated ? 1 : 0, now]);
  }
  await query(`INSERT INTO commandes
    (id,client_id,paiement_stripe_id,statut_paiement,sous_total_centimes,frais_livraison_centimes,reduction_centimes,total_centimes,devise,code_promo,adresse_livraison_json,mode_reel,paye_le,session_stripe_id)
    VALUES (?,(SELECT id FROM clients WHERE email=?),?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(paiement_stripe_id) DO UPDATE SET
    client_id=COALESCE(excluded.client_id,commandes.client_id),
    session_stripe_id=COALESCE(excluded.session_stripe_id,commandes.session_stripe_id),
    adresse_livraison_json=CASE WHEN excluded.adresse_livraison_json='{}' THEN commandes.adresse_livraison_json ELSE excluded.adresse_livraison_json END,
    statut_paiement=CASE WHEN commandes.statut_paiement IN ('paid','refunded','partially_refunded') THEN commandes.statut_paiement ELSE excluded.statut_paiement END,
    paye_le=COALESCE(commandes.paye_le,excluded.paye_le),modifie_le=?`,
  [orderId,email,intent.id,status,totals.subtotal,totals.shipping,totals.discount,totals.total,intent.currency,intent.metadata?.promo_code || null,JSON.stringify(intent.shipping || {}),live,status === 'paid' ? now : null,intent.checkout_session_id || null,now]);
  for (const item of totals.items) {
    await query(`INSERT INTO articles_commandes (commande_id,produit_id,nom_produit,quantite,prix_unitaire_centimes)
      VALUES (?,?,?,?,?) ON CONFLICT(commande_id,produit_id) DO UPDATE SET
      nom_produit=excluded.nom_produit,quantite=excluded.quantite,prix_unitaire_centimes=excluded.prix_unitaire_centimes`,
    [orderId,item.id,item.name,item.quantity,item.price]);
  }
  await query(`INSERT INTO paiements (id,commande_id,paiement_stripe_id,statut,montant_centimes,devise,mode_reel)
    VALUES (?,?,?,?,?,?,?) ON CONFLICT(paiement_stripe_id) DO UPDATE SET
    statut=CASE WHEN paiements.statut IN ('paid','refunded','partially_refunded') THEN paiements.statut ELSE excluded.statut END,modifie_le=?`,
  [intent.id,orderId,intent.id,status,totals.total,intent.currency,live,now]);
  await query(`INSERT INTO evenements_stripe (evenement_id,type_evenement,paiement_stripe_id,date_evenement_stripe,mode_reel)
    VALUES (?,?,?,?,?) ON CONFLICT(evenement_id) DO NOTHING`,
  [event.id,event.type,intent.id,event.created,live]);
}

module.exports = { getD1Config, persistStripeOrder };
