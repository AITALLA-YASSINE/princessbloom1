# Vérification du paiement — 16 novembre 2026

## Diagnostic du déploiement public

L’appel de préparation de paiement renvoyait une erreur HTTP 502 générique. Après déploiement du diagnostic sûr, le serveur renvoie HTTP 503 avec le code `stripe_secret_invalid`. La valeur de `STRIPE_SECRET_KEY` sur Vercel ne correspond pas au format attendu d’une clé secrète Stripe. Les clés de production ne sont pas accessibles dans cet environnement.

Action nécessaire dans Vercel : remplacer cette valeur par la clé secrète complète du compte Stripe, avec le même mode que la clé publique, puis redéployer. Aucune clé ne doit être copiée dans ce rapport ou dans Git.

## Correctifs livrés

- Nettoyage des espaces et guillemets extérieurs lors du chargement des clés.
- Validation des types de clés et de la cohérence test / production.
- Codes d’erreur sûrs pour distinguer la configuration, l’authentification et les erreurs de requête.
- Journalisation limitée aux métadonnées utiles : aucun message Stripe brut susceptible de contenir une clé.

## Vérifications réalisées

- Compilation Next.js de production : réussie.
- 11 tests automatisés : réussis.
- Test d’intégration avec le vrai serveur local et Stripe en mode test : prix serveur et code PRINCESSBLOOM5 vérifiés, montant de 37,99 €.
- Paiement simulé `pm_card_visa` : statut `succeeded`, aucun fonds réel déplacé.
- Page de confirmation : paiement test authentifié et confirmé ; identifiant invalide jamais présenté comme payé.
- Double envoi de la même requête : même intention de paiement, pas de doublon.
- Carte test refusée : refus détecté, aucune confirmation de commande payée.
- Carte 3D Secure de test : authentification exigée, aucune fausse confirmation avant authentification. L’authentification interactive n’a pas été effectuée.
- Ancien endpoint Checkout : session test au bon montant créée puis expirée.

Les contrôles d’intégration ont été réalisés via HTTP et le SDK Stripe, sans automatisation du navigateur. Aucun paiement réel n’a été exécuté. La production reste bloquée tant que la clé Vercel n’est pas corrigée et redéployée.
