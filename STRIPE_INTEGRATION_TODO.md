# Paiement Princess Bloom — état actuel

À la demande de l’utilisateur, le formulaire Princess Bloom d’origine a été rétabli sur `/paiement`. Les essais de présentation Shopify, de formulaire Checkout Studio et d’initialisation anticipée des boutons sont suspendus. Le diagnostic HTTPS temporaire a été désactivé et sa route supprimée.

- Formulaire actif : [app/paiement/page.tsx](app/paiement/page.tsx).
- Paiement Stripe existant : [app/api/create-payment-intent/route.ts](app/api/create-payment-intent/route.ts), avec prix calculés sur le serveur et coordonnées requises avant création du paiement.
- Le webhook Stripe signé et l’enregistrement des commandes dans les tables françaises Cloudflare D1 sont conservés. Prénom et nom restent séparés dans les métadonnées du paiement.
- L’autocomplétion des adresses et la correction du zoom automatique sur mobile sont conservées.
- Les composants des présentations alternatives restent dans le dépôt mais ne sont pas montés sur la page de paiement principale.
- Le raccordement PayPal préparé reste inactif sur ce formulaire. Son éventuelle configuration est documentée dans [docs/paypal-setup.md](docs/paypal-setup.md), pour une reprise ultérieure à la demande de l’utilisateur.
- Aucune donnée de commande ou de paiement existante n’a été supprimée. Les éventuelles lignes techniques de diagnostic restent dans D1 ; elles ne sont plus alimentées par le site.

Variables de l’intégration active : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`. Conserver des clés et webhook Stripe du même environnement test/réel.

La mise à jour de sécurité Next.js signalée par le build reste à prévoir séparément.

Les moyens de paiement du formulaire actif sont d�sormais dynamiques : aucune liste carte/Klarna ne les limite. Stripe s�lectionne les moyens activ�s dans le Dashboard et �ligibles selon la devise, le montant, le pays et l�appareil. Les exclusions Link, Klarna et Amazon Pay du composant express ont �t� retir�es. V�rifier les domaines de paiement et les activations dans le m�me environnement test/r�el avant de tester les portefeuilles.
