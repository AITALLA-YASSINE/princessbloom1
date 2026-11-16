# Connecter le webhook Stripe

## Adresse

`https://princessbloom1.vercel.app/api/stripe/webhook`

## Configuration dans Stripe

1. Ouvrir le compte de production, puis **Workbench → Webhooks → Ajouter une destination**.
2. Choisir les événements du compte lui-même (**Your account**).
3. Choisir le format **Snapshot**, adapté au traitement des événements PaymentIntent de cette intégration.
4. Choisir ces quatre événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
5. Choisir **Webhook endpoint**, puis coller l’adresse ci-dessus. Si une version API est demandée, choisir `2026-09-30.endive`, celle du SDK utilisé.
6. Copier la clé de signature complète commençant par `whsec_`.

## Configuration dans Vercel

Dans **Settings → Environment Variables**, ajouter `STRIPE_WEBHOOK_SECRET`, avec la clé `whsec_…` dans la valeur. Sélectionner **Production**, enregistrer puis redéployer.

Cette clé est différente de `STRIPE_SECRET_KEY`. Ne pas la mettre dans Git ou dans une variable `NEXT_PUBLIC_`. Pour un environnement de test, créer une destination de test et utiliser sa propre clé de signature avec des clés API de test.

## Ce que cette version réalise

- Vérification de la signature Stripe sur le corps brut, avec contrôle temporel.
- Vérification du mode test / production et récupération du paiement courant auprès de Stripe.
- Identification des paiements Princess Bloom et contrôle du montant selon le catalogue et la remise.
- Enregistrement durable du marqueur `princessbloom_payment_status=paid` dans les métadonnées Stripe, uniquement après réception du montant attendu.
- Enregistrement des états non payés séparément pour éviter qu’une notification ancienne ou concurrente efface un paiement confirmé.
- Traitement idempotent et réponse d’échec en cas de problème temporaire, afin que Stripe puisse réessayer.

Une notification sans signature est refusée avec HTTP 400. Une clé de webhook absente entraîne HTTP 503. Un événement signé sans rapport avec les paiements de la boutique est ignoré avec HTTP 200 ; les événements fictifs envoyés depuis le Dashboard peuvent donc être marqués `ignored`.

## Base de commandes Cloudflare D1

Ajouter dans Vercel (Production) : `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID` et `CLOUDFLARE_D1_API_TOKEN` (permission D1 Edit sur le compte concerné). Ne jamais utiliser de préfixe `NEXT_PUBLIC_` pour ces variables.

La base doit contenir le schéma français de `d1-schema.sql`, avec les tables et colonnes françaises. Après déploiement, chaque notification de paiement vérifiée enregistre le client (si un email est disponible), la commande, ses articles, le paiement et l’événement Stripe. Le total reste contrôlé côté serveur. Les numéros de carte, CVC et secrets Stripe ne sont jamais stockés.

Les écritures sont rejouables : une interruption peut laisser une commande partiellement enregistrée, puis Stripe réessaie et complète les données sans doublon. L’événement n’est enregistré qu’en dernier. Un paiement payé ou remboursé ne peut pas être rétrogradé par une ancienne notification. Une configuration D1 manquante ou une erreur Cloudflare provoque HTTP 500 pour permettre la nouvelle livraison Stripe.

Pour vérifier en production : renvoyer depuis Stripe une notification d’un paiement réel de la boutique déjà réussi, puis contrôler la réponse HTTP 200 et la présence du même identifiant `pi_…` dans `commandes` et `paiements`. Cela ne crée aucun nouveau débit. Un événement fictif sans articles Princess Bloom ne valide pas la connexion D1. Cette vérification en ligne nécessite l’accès au Dashboard Stripe ou aux secrets de l’environnement concerné.

Documentation D1 : https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/

## Ce qui n’est pas encore branché

Les e-mails transactionnels et le déclenchement d’expédition ne sont pas encore raccordés. L’identifiant interne de commande est celui du PaymentIntent Stripe. Ne jamais expédier une commande sur la seule base d’une redirection du navigateur ou d’une notification non vérifiée.

Documentation officielle : https://docs.stripe.com/webhooks
