# Connecter le bouton PayPal

Le bouton est préparé, mais reste masqué jusqu’à la configuration complète de l’application PayPal. Les paiements PayPal sont traités directement par PayPal, indépendamment du compte Stripe américain.

## Configuration sandbox pour tester

1. Ouvrir https://developer.paypal.com/dashboard/applications et se connecter avec le compte PayPal Business.
2. Choisir **Sandbox → Apps & Credentials → Create App**. Nom conseillé : `Princess Bloom`.
3. Dans l’application, récupérer **Client ID** et **Secret**. Ne pas les publier dans Git ni partager le Secret dans une capture ou un message.
4. Dans la même application, ajouter un webhook vers :
   `https://princessbloom1.vercel.app/api/paypal/webhook`
5. Cocher `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`, `PAYMENT.CAPTURE.DENIED`. Copier l’identifiant du webhook créé, pas une clé Stripe `whsec_`.
6. Ajouter ces variables dans l’environnement Vercel utilisé pour le test et redéployer :

| Variable | Valeur sandbox |
| --- | --- |
| PAYPAL_CLIENT_ID | Client ID de l’application sandbox |
| PAYPAL_CLIENT_SECRET | Secret de cette même application sandbox |
| PAYPAL_MODE | `sandbox` |
| PAYPAL_WEBHOOK_ID | Identifiant du webhook sandbox de cette application |

Les variables Cloudflare D1 déjà configurées sont réutilisées. Aucune variable PayPal `NEXT_PUBLIC_*` n’est nécessaire : le navigateur reçoit seulement le Client ID public depuis `/api/paypal/config`.

## Vérification

- Après le déploiement, `/api/paypal/config` doit répondre `enabled: true` et `mode: sandbox`, sans jamais renvoyer le Secret.
- Ouvrir `/paiement` avec un panier : le vrai bouton PayPal jaune, fourni par le SDK officiel PayPal, apparaît à côté des boutons Stripe compatibles.
- Utiliser un **compte acheteur personnel sandbox** depuis les comptes de test du Dashboard PayPal, différent du compte marchand sandbox. Ne pas utiliser un vrai paiement pour ce test.
- Vérifier le montant et la remise dans PayPal, puis approuver le paiement. L’adresse fournie dans PayPal sert à la livraison ; sa destination doit faire partie des pays déjà autorisés par la boutique.
- Vérifier la confirmation, le webhook et Cloudflare. Tester aussi une annulation sans débit et une reprise après erreur réseau.
- Si la confirmation d’un paiement est incertaine, le site bloque une nouvelle tentative Stripe et propose **Vérifier mon paiement PayPal** sur le même identifiant de commande, pour éviter de demander au client de payer une seconde fois.

## Stockage Cloudflare

Deux tables sont créées automatiquement et sans suppression de données au premier démarrage d’une commande PayPal :

- `commandes_paypal` : statut, identifiants commande/capture PayPal, montant en centimes et affichage automatique `total_euros`, remise, articles JSON avec prix/quantités, cliente et adresse de livraison.
- `evenements_paypal` : notifications vérifiées, avec identifiant unique pour éviter les doublons.

La table existante `clients` est réutilisée avec les prénom/nom distincts fournis par PayPal. Les coordonnées du destinataire de livraison sont conservées intégralement dans `adresse_livraison_json`. Les commandes Stripe restent dans leurs tables existantes : aucun faux identifiant Stripe n’est créé pour PayPal.

Le serveur recalcule les prix avec le catalogue, enregistre la commande avant tout débit, vérifie l’adresse et le montant autoritaire PayPal, puis capture avec un identifiant de requête stable. Le webhook vérifie la signature via l’API PayPal et récupère l’état courant directement auprès de PayPal. Une erreur de stockage peut ainsi être rejouée sans deuxième capture. Aucun numéro de carte ni Secret PayPal n’est conservé dans D1.

## Passage en réel

Créer/utiliser l’application **Live**, son webhook Live et leurs identifiants correspondants. Remplacer les quatre variables par les valeurs Live et mettre `PAYPAL_MODE=live`, puis redéployer. Ne pas mélanger les clés sandbox et Live. Le compte marchand PayPal Business doit être prêt à recevoir des paiements.

## État des vérifications

Tests automatisés avec API simulée et véritable schéma SQLite : création/rejeu, montant/remise, noms séparés, contrôle du pays et de la devise, refus des commandes inconnues, reprise après capture suivie d’une erreur de stockage, signatures et doublons des événements. Aucun appel authentifié au compte PayPal de l’utilisateur ni paiement sandbox complet n’est possible avant l’ajout des identifiants. Le rendu du bouton et l’approbation en navigateur restent à vérifier ensuite.

Shop Pay n’est pas ajouté. Les remboursements PayPal et les e-mails/expéditions automatiques ne sont pas automatisés par cette étape.

Références officielles : https://developer.paypal.com/docs/checkout/standard/integrate/ et https://developer.paypal.com/docs/api/orders/v2/
