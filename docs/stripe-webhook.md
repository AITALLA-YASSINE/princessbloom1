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

## Ce qui n’est pas encore branché

Cette première étape n’ajoute pas de base de commandes, de numéro de commande local, d’e-mail transactionnel ou de déclenchement d’expédition. Ces actions doivent être raccordées à un stockage durable et à un service d’envoi avant de parler d’un traitement automatique complet des commandes. Ne jamais expédier une commande sur la seule base d’une redirection du navigateur ou d’une notification non vérifiée.

Documentation officielle : https://docs.stripe.com/webhooks
