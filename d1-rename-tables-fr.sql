ALTER TABLE customers RENAME TO clients;
ALTER TABLE orders RENAME TO commandes;
ALTER TABLE order_items RENAME TO articles_commandes;
ALTER TABLE payments RENAME TO paiements;
ALTER TABLE stripe_webhook_events RENAME TO evenements_stripe;

SELECT name FROM sqlite_master
WHERE type = 'table' AND name != 'sqlite_sequence'
ORDER BY name;
