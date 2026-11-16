CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  prenom TEXT,
  nom TEXT,
  telephone TEXT,
  cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  modifie_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS commandes (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT REFERENCES clients(id),
  paiement_stripe_id TEXT NOT NULL UNIQUE,
  session_stripe_id TEXT UNIQUE,
  statut_paiement TEXT NOT NULL DEFAULT 'pending'
    CHECK (statut_paiement IN ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded')),
  statut_expedition TEXT NOT NULL DEFAULT 'unfulfilled'
    CHECK (statut_expedition IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'canceled', 'returned')),
  sous_total_centimes INTEGER NOT NULL CHECK (sous_total_centimes >= 0),
  frais_livraison_centimes INTEGER NOT NULL DEFAULT 0 CHECK (frais_livraison_centimes >= 0),
  reduction_centimes INTEGER NOT NULL DEFAULT 0 CHECK (reduction_centimes >= 0 AND reduction_centimes <= sous_total_centimes),
  total_centimes INTEGER NOT NULL CHECK (total_centimes >= 0),
  devise TEXT NOT NULL DEFAULT 'eur' CHECK (length(devise) = 3),
  code_promo TEXT,
  adresse_livraison_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(adresse_livraison_json)),
  mode_reel INTEGER NOT NULL CHECK (mode_reel IN (0, 1)),
  paye_le TEXT,
  cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  modifie_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (total_centimes = sous_total_centimes + frais_livraison_centimes - reduction_centimes)
);

CREATE TABLE IF NOT EXISTS articles_commandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commande_id TEXT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id TEXT NOT NULL,
  nom_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL CHECK (quantite BETWEEN 1 AND 20),
  prix_unitaire_centimes INTEGER NOT NULL CHECK (prix_unitaire_centimes >= 0),
  UNIQUE (commande_id, produit_id)
);

CREATE TABLE IF NOT EXISTS paiements (
  id TEXT PRIMARY KEY NOT NULL,
  commande_id TEXT NOT NULL REFERENCES commandes(id),
  prestataire TEXT NOT NULL DEFAULT 'stripe' CHECK (prestataire = 'stripe'),
  paiement_stripe_id TEXT NOT NULL UNIQUE,
  statut TEXT NOT NULL
    CHECK (statut IN ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded')),
  montant_centimes INTEGER NOT NULL CHECK (montant_centimes >= 0),
  devise TEXT NOT NULL DEFAULT 'eur' CHECK (length(devise) = 3),
  mode_reel INTEGER NOT NULL CHECK (mode_reel IN (0, 1)),
  cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  modifie_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS evenements_stripe (
  evenement_id TEXT PRIMARY KEY NOT NULL,
  type_evenement TEXT NOT NULL,
  paiement_stripe_id TEXT NOT NULL,
  date_evenement_stripe INTEGER NOT NULL,
  mode_reel INTEGER NOT NULL CHECK (mode_reel IN (0, 1)),
  traite_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON commandes(client_id);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON commandes(statut_paiement);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON commandes(cree_le);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON articles_commandes(commande_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON paiements(commande_id);
CREATE INDEX IF NOT EXISTS webhook_events_payment_id_idx ON evenements_stripe(paiement_stripe_id);

SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('clients', 'commandes', 'articles_commandes', 'paiements', 'evenements_stripe') ORDER BY name;
