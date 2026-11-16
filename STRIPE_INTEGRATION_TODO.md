# Intégration Stripe Checkout — suivi

## Values to Replace

Aucun prix fictif ni identifiant `price_...` à remplacer. Le catalogue externe existant est conservé, avec calcul des montants et remises côté serveur. Le mode reste `payment` pour les achats uniques.

## Configured Parameters

Fichier : [app/api/create-checkout-session/route.ts](app/api/create-checkout-session/route.ts).

| Paramètre | Valeur |
| --- | --- |
| ui_mode | form |
| billing_address_collection | auto |
| phone_number_collection.enabled | false |
| automatic_tax.enabled | false |
| submit_type | auto |
| integration_identifier | custom_embedded_web_0001 |
| mode | payment, conservé |
| line_items | Montant réel du panier, conservé |

`payment_method_collection` est omis : la règle spécifique du prompt Studio réserve son ajout au mode `subscription`.

Adaptations demandées pour préserver Cloudflare : métadonnées du panier et de la remise, collecte de l’adresse de livraison et livraison gratuite, champs distincts prénom/nom, URL de retour sur le site. Les méthodes ne sont plus limitées à card/klarna dans cette session : Stripe affiche les méthodes actives et éligibles du compte.

## Setup and next steps

- Variables inchangées : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`. Les clés Stripe doivent appartenir au même compte et au même environnement. Aucune clé secrète ne doit être publiée ni placée dans `NEXT_PUBLIC_*`.
- Remplacer toute clé secrète exposée auparavant dans une capture et mettre à jour Vercel, puis redéployer.
- Les SDK déjà installés prennent en charge `form`. API serveur : `2026-09-30.endive`. Stripe.js est chargé directement depuis `https://js.stripe.com/dahlia/stripe.js`, sans être hébergé ou inclus dans le bundle du site.
- Domaine à enregistrer dans Stripe pour les wallets intégrés : domaine exact de la page de paiement, notamment `princessbloom1.vercel.app` et tout domaine personnalisé utilisé. Vérifier le bon environnement test/réel.
- Apple Pay, Google Pay et PayPal dépendent de l’activation effective, de l’éligibilité du compte, du pays, de la devise, du navigateur et de l’appareil. Un bouton de l’aperçu Studio ne garantit pas sa présence chez chaque client.
- Le webhook existant `/api/stripe/webhook` et ses quatre événements PaymentIntent sont conservés. Pour les nouveaux paiements Checkout, il récupère la session liée afin d’obtenir email, adresse, prénom/nom et identifiant de session avant l’écriture dans D1. Si les informations ne sont pas encore disponibles au moment du succès, il répond en erreur pour que Stripe réessaie.
- Pas de nouvelle base, migration ou infrastructure à installer. Les tables françaises existantes restent utilisées. Les colonnes d’affichage en euros restent calculées depuis les centimes.

### Fichiers et parcours

- [components/stripe-checkout-form.tsx](components/stripe-checkout-form.tsx) : nouveau composant client officiel, monté dans [app/paiement/page.tsx](app/paiement/page.tsx).
- [app/api/create-checkout-session/route.ts](app/api/create-checkout-session/route.ts) : appel de session existant adapté ; renvoie `{client_secret, sessionId, amount}` en JSON.
- [lib/stripe-webhook.js](lib/stripe-webhook.js) : enrichissement depuis la session Stripe vérifiée.
- [lib/d1-orders.js](lib/d1-orders.js) : persistance des coordonnées et de l’identifiant de session, y compris après une notification processing antérieure.

Le panier est recalculé sur le serveur → session Checkout → formulaire hébergé dans une iframe Stripe sur `/paiement` → confirmation Stripe → page de confirmation du site et webhook signé → commandes Cloudflare. Une authentification bancaire ou un moyen de paiement externe peut nécessiter une redirection temporaire.

### Vérification avant les paiements réels

Vérifications réalisées : 28 tests automatisés réussis (dont données Checkout → D1 et reprise après notification processing), appel HTTP au serveur local avec une session Stripe de test réelle (`ui_mode=form`, 3 799 centimes avec PRINCESSBLOOM5), rejet des produits inconnus, même identifiant de session lors du rejeu de la requête. Session expirée après vérification, aucun débit. Le rendu et la saisie dans l’iframe ainsi que les wallets sur appareils réels restent à vérifier dans un navigateur ; aucun navigateur connecté n’est disponible dans cette session. La base Cloudflare de production n’est pas accessible avec les secrets locaux.

Le build signale une vulnérabilité connue de la version Next.js installée. Prévoir une mise à jour de sécurité distincte ; aucune montée de version n’a été faite dans cette intégration.

1. Tester avec les clés `pk_test_` / `sk_test_` et le webhook de test correspondant.
2. Carte de test : `4242 4242 4242 4242`, date future et CVC fictif à trois chiffres. Carte refusée : `4000 0000 0000 0002`. Authentification : `4000 0025 0000 3155`. Ne jamais utiliser une vraie carte pour ces tests.
3. Vérifier la saisie dans l’iframe, les erreurs, la confirmation et une remise. Les tests API ne remplacent pas ce contrôle dans un navigateur.
4. Dans Stripe, vérifier HTTP 200 du webhook après finalisation. Dans D1, vérifier `commandes`, `articles_commandes`, `clients` et `paiements`, notamment prénom/nom séparés, adresse de livraison et `session_stripe_id`. Le même événement rejoué ne doit pas dupliquer les données.
5. Vérifier Apple Pay et Google Pay sur des appareils compatibles. Vérifier PayPal sur le compte réellement activé.
6. En mode réel, utiliser ensemble les clés et le webhook réels, puis redéployer. Le nom d’une page ne détermine pas le mode de paiement.

Les e-mails transactionnels, l’expédition automatique et le suivi client ne sont pas ajoutés par cette intégration. La gestion automatique des remboursements nécessite une extension distincte du webhook.

Ressources : https://support.stripe.com et https://docs.stripe.com/mcp
