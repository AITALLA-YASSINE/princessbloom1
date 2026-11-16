ALTER TABLE paiements ADD COLUMN montant_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', montant_centimes / 100.0), '.', ',')) VIRTUAL;
ALTER TABLE articles_commandes ADD COLUMN prix_unitaire_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', prix_unitaire_centimes / 100.0), '.', ',')) VIRTUAL;
ALTER TABLE commandes ADD COLUMN sous_total_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', sous_total_centimes / 100.0), '.', ',')) VIRTUAL;
ALTER TABLE commandes ADD COLUMN frais_livraison_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', frais_livraison_centimes / 100.0), '.', ',')) VIRTUAL;
ALTER TABLE commandes ADD COLUMN reduction_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', reduction_centimes / 100.0), '.', ',')) VIRTUAL;
ALTER TABLE commandes ADD COLUMN total_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f', total_centimes / 100.0), '.', ',')) VIRTUAL;
UPDATE clients SET prenom = 'Yass', nom = 'Yasso', modifie_le = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE (prenom IS NULL OR trim(prenom) = '') AND nom = 'Yass Yasso';
