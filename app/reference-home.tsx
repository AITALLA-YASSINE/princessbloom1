"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, BatteryCharging, Check, Crown, Droplets, EyeOff, Flower2, Heart, HeartHandshake, LockKeyhole, Mail, Menu, MessageCircle, Minus, MoveHorizontal, Play, Plus, RotateCcw, ShoppingBag, SlidersHorizontal, ThermometerSun, Timer, Truck, Waves, X, ZoomIn } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { product } from "@/lib/site-data";
import { CHECKOUT_CATALOG, getCheckoutTotals } from "@/lib/checkout";
import "./home-premium.css";

// The project CSS loader processes modules as global CSS. Unique names keep
// every rule isolated to this home page without changing shared configuration.
const s = {
  advantageCards: "pbh-advantageCards",
  advantages: "pbh-advantages",
  buyRow: "pbh-buyRow",
  cardNumber: "pbh-cardNumber",
  cartCount: "pbh-cartCount",
  cartLink: "pbh-cartLink",
  checkList: "pbh-checkList",
  compareFeatured: "pbh-compareFeatured",
  compareGrid: "pbh-compareGrid",
  compareIndex: "pbh-compareIndex",
  compareNote: "pbh-compareNote",
  comparison: "pbh-comparison",
  consent: "pbh-consent",
  crown: "pbh-crown",
  desktopBreak: "pbh-desktopBreak",
  education: "pbh-education",
  educationCards: "pbh-educationCards",
  educationFoot: "pbh-educationFoot",
  eyebrow: "pbh-eyebrow",
  faqList: "pbh-faqList",
  faqSection: "pbh-faqSection",
  floatingProduct: "pbh-floatingProduct",
  footer: "pbh-footer",
  footerBottom: "pbh-footerBottom",
  footerBrand: "pbh-footerBrand",
  footerTop: "pbh-footerTop",
  galleryControls: "pbh-galleryControls",
  header: "pbh-header",
  headerInner: "pbh-headerInner",
  headingRow: "pbh-headingRow",
  heartRule: "pbh-heartRule",
  hero: "pbh-hero",
  heroBenefits: "pbh-heroBenefits",
  heroBottom: "pbh-heroBottom",
  heroCopy: "pbh-heroCopy",
  heroPicture: "pbh-heroPicture",
  heroScroll: "pbh-heroScroll",
  heroSecondary: "pbh-heroSecondary",
  heroShade: "pbh-heroShade",
  heroSignature: "pbh-heroSignature",
  heroWorld: "pbh-heroWorld",
  home: "pbh-home",
  lastCopy: "pbh-lastCopy",
  lastCta: "pbh-lastCta",
  lastPhoto: "pbh-lastPhoto",
  lifestyle: "pbh-lifestyle",
  lifestyleGrid: "pbh-lifestyleGrid",
  logo: "pbh-logo",
  mainPhoto: "pbh-mainPhoto",
  medallion: "pbh-medallion",
  menuButton: "pbh-menuButton",
  navigation: "pbh-navigation",
  neutralProof: "pbh-neutralProof",
  newsletter: "pbh-newsletter",
  newsletterField: "pbh-newsletterField",
  photoCaption: "pbh-photoCaption",
  photoLabel: "pbh-photoLabel",
  playIcon: "pbh-playIcon",
  priceLine: "pbh-priceLine",
  primary: "pbh-primary",
  productArrow: "pbh-productArrow",
  productDescription: "pbh-productDescription",
  productDetails: "pbh-productDetails",
  productGallery: "pbh-productGallery",
  productSection: "pbh-productSection",
  promo: "pbh-promo",
  quantity: "pbh-quantity",
  reassurance: "pbh-reassurance",
  reviewPlaceholder: "pbh-reviewPlaceholder",
  reviewsLayout: "pbh-reviewsLayout",
  reviewsSection: "pbh-reviewsSection",
  safetyNote: "pbh-safetyNote",
  secondary: "pbh-secondary",
  section: "pbh-section",
  sectionHeading: "pbh-sectionHeading",
  secureInfo: "pbh-secureInfo",
  shippingInfo: "pbh-shippingInfo",
  skipLink: "pbh-skipLink",
  stepGrid: "pbh-stepGrid",
  stepPhoto: "pbh-stepPhoto",
  steps: "pbh-steps",
  story: "pbh-story",
  storyPhoto: "pbh-storyPhoto",
  textLink: "pbh-textLink",
  thumbnails: "pbh-thumbnails",
  videoCaption: "pbh-videoCaption",
  videoCard: "pbh-videoCard",
  videoGrid: "pbh-videoGrid",
  videoPoster: "pbh-videoPoster",
  videoSection: "pbh-videoSection",
  videoStatus: "pbh-videoStatus",
  videoVeil: "pbh-videoVeil",
  zoomButton: "pbh-zoomButton",
  zoomDialog: "pbh-zoomDialog",
};

const catalogProduct = CHECKOUT_CATALOG[product.id as keyof typeof CHECKOUT_CATALOG];
const money = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
const promo = getCheckoutTotals([{ id: product.id, quantity: 1 }], "PRINCESSBLOOM5");
const showPromo = promo.discount === Math.round(promo.subtotal * .05);
const navigation = [["/", "Accueil"], ["/produit", "La ceinture"], ["/comment-ca-marche", "Comment ça fonctionne"], ["/histoire", "Notre histoire"], ["/avis", "Avis clients"], ["/faq", "FAQ"], ["/contact", "Contact"]];
const gallery = [
  { src: "/photos/product-hero-square.webp", alt: "Ceinture Princess Bloom rose sur satin, écran à gauche et logo sur le devant" },
  { src: "/photos/product-back.webp", alt: "Doublure douce, sangle rose réglable et attaches de la ceinture Princess Bloom" },
  { src: "/photos/lifestyle-worn-closeup.webp", alt: "Détail de la ceinture Princess Bloom portée autour du bas-ventre" },
  { src: "/photos/lifestyle-reading.webp", alt: "Ceinture Princess Bloom portée pendant un moment de lecture" },
];
const benefits = [
  { icon: ThermometerSun, title: "Chaleur personnalisable", detail: "Une chaleur à votre rythme.", technical: product.features.find(x => x.includes("température")) },
  { icon: Waves, title: "Massage par vibration", detail: "Choisissez la sensation qui vous convient.", technical: product.features.find(x => x.includes("vibration")) },
  { icon: MoveHorizontal, title: "Sangle ajustable", detail: "Un maintien adapté à votre confort.", technical: product.features.find(x => x.includes("ajustable")) },
  { icon: Timer, title: "Un moment pour vous", detail: "Une durée adaptée à votre pause.", technical: product.features.find(x => x.includes("Minuteur")) },
];
const faq = [
  ["Comment fonctionne la ceinture Princess Bloom ?", "Elle associe une chaleur réglable à des vibrations pour accompagner vos moments de confort. Elle s’utilise sans fil après recharge, conformément à la notice."],
  ["Comment régler la chaleur ?", "Les commandes permettent de choisir parmi 5 niveaux de température. Commencez au niveau le plus doux et suivez la notice pour les températures et les réglages exacts."],
  ["Comment activer le massage ?", "Utilisez les commandes de massage pour choisir l’un des 4 modes de vibration. Consultez la notice pour la séquence précise des boutons."],
  ["Combien de temps peut-on l’utiliser ?", "Le minuteur propose des séances de 15 ou 30 minutes. Choisissez selon votre confort et respectez les durées et les précautions de la notice."],
  ["La ceinture est-elle ajustable ?", "Oui, sa sangle est ajustable. Les limites exactes de tour de taille ne sont pas précisées dans les informations disponibles : contactez-nous avant de commander si vous souhaitez les vérifier."],
  ["Peut-on l’utiliser sous les vêtements ?", "Elle peut se porter sous des vêtements amples, à condition de ne pas comprimer le boîtier ni la sangle et de respecter les consignes du fabricant."],
  ["Comment entretenir la ceinture ?", "Éteignez et débranchez la ceinture avant de passer un chiffon légèrement humide. Ne plongez pas l’appareil dans l’eau. Consultez la notice avant tout autre nettoyage."],
  ["Quels sont les délais de livraison ?", "Le parcours d’achat affiche actuellement une livraison offerte, estimée à 5 à 10 jours ouvrés. Vérifiez les conditions et la destination lors de votre commande."],
  ["Comment suivre ma commande ?", "Rendez-vous sur la page Suivi de commande avec les informations de votre commande. Contactez le service client si nécessaire."],
  ["Comment effectuer un retour ?", "Consultez la page Retours pour les conditions applicables, puis contactez le service client avant le renvoi. Les modalités de retour et de remboursement y sont détaillées."],
  ["Quels sont les moyens de paiement ?", "Le paiement par carte et Klarna sont configurés dans la boutique. Les moyens effectivement disponibles s’affichent lors du paiement selon votre éligibilité et votre appareil."],
  ["Quelles précautions d’utilisation faut-il respecter ?", "Lisez la notice avant utilisation. Commencez avec une chaleur douce, n’utilisez pas l’appareil sur une peau irritée et arrêtez en cas d’inconfort. En cas de doute sur votre situation personnelle, demandez conseil à un professionnel de santé."],
];
const steps = [
  { src: "/photos/lifestyle-worn-closeup.webp", icon: MoveHorizontal, title: "Positionnez la ceinture", text: "Installez-la autour du bas-ventre et ajustez la sangle pour un maintien confortable." },
  { src: "/photos/product-hero-square.webp", icon: SlidersHorizontal, title: "Choisissez vos réglages", text: "Sélectionnez la chaleur, les vibrations et la durée selon vos préférences et la notice." },
  { src: "/photos/lifestyle-reading.webp", icon: Heart, title: "Accordez-vous une pause", text: "Profitez de votre moment de confort, en restant attentive aux sensations de votre corps." },
];

// Set src to a real video URL when the corresponding film becomes available.
function VideoSlot({ number, title, poster, src }: { number: number; title: string; poster: string; src?: string }) {
  return <article className={s.videoCard}>{src ? <video controls preload="metadata" poster={poster} aria-label={title}><source src={src} />Votre navigateur ne prend pas en charge la lecture vidéo.</video> : <div className={s.videoPoster}><Image src={poster} alt="" fill sizes="(max-width: 650px) 80vw, 32vw" /><div className={s.videoVeil} /><span className={s.playIcon} aria-hidden="true"><Play /></span><span className={s.videoStatus}>VIDÉO {number} — À INTÉGRER</span></div>}<div className={s.videoCaption}><span>0{number}</span><h3>{title}</h3></div></article>;
}

function TrustpilotSummary() {
  return <div className="pbh-trustpilotPreview" aria-label="4,9 sur 5, plus de 2 000 femmes soulagées">
    <div className="pbh-trustpilotIdentity" aria-hidden="true">
      <Image src="/brand/trustpilot-stars-5.svg" alt="" width={100} height={19} unoptimized />
      <Image src="/brand/trustpilot-logo-black.svg" alt="" width={85} height={21} unoptimized />
    </div>
    <span className="pbh-trustpilotRating"><strong>4,9 / 5</strong><span>+ de 2 000 femmes soulagées</span></span>
  </div>;
}

const beltFeatures = [
  { label: "Sans fil après recharge", icon: BatteryCharging },
  { label: "5 niveaux de température", icon: ThermometerSun },
  { label: "4 modes de vibration", icon: Waves },
  { label: "Sangle ajustable", icon: MoveHorizontal },
];

function ComparisonTable() {
  const classicFeatures = [
    { label: "Besoin de chauffer de l’eau", icon: Droplets },
    { label: "Chaleur qui refroidit progressivement", icon: ThermometerSun },
    { label: "Sans fonction de vibration", icon: Waves },
    { label: "À maintenir sur la zone souhaitée", icon: MoveHorizontal },
  ];
  return <div className="pbh-referenceComparison" aria-label="Comparaison des solutions classiques et de notre ceinture chauffante">
    {[{ title: "Solutions classiques", features: classicFeatures, positive: false }, { title: "Notre ceinture chauffante", features: beltFeatures, positive: true }].map(({ title, features, positive }) => <article key={title} className={positive ? "pbh-referencePositive" : "pbh-referenceNegative"}>
      <h3><span aria-hidden="true">{positive ? <Check /> : <X />}</span>{title}</h3>
      <ul>{features.map(({ label, icon: Icon }) => <li key={label}><span className="pbh-referenceFeatureIcon" aria-hidden="true"><Icon strokeWidth={1.5} /></span>{!positive && <X className="pbh-referenceCross" aria-hidden="true" />}<span>{label}</span></li>)}</ul>
    </article>)}
  </div>;
}

export function ReferenceHome() {
  const pathname = usePathname();
  const { itemCount, addToCart, cart, openCartDrawer } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const zoomRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const existingQuantity = cart.find(item => item.id === product.id)?.quantity ?? 0;
  const availableQuantity = Math.max(0, 20 - existingQuantity);
  const chosenQuantity = Math.min(quantity, availableQuantity);
  const price = catalogProduct.price / 100;
  const closeMenu = () => { setMenuOpen(false); menuRef.current?.focus(); };
  function addProduct() {
    if (chosenQuantity) addToCart({ id: product.id, name: catalogProduct.name, price, quantity: chosenQuantity, image: gallery[0].src });
  }

  return <main className={s.home} data-home-reference={pathname === "/" ? "active" : undefined}>
    <a href="#accueil-contenu" className={s.skipLink}>Aller au contenu</a>
    <div className={s.heroWorld}>
      {showPromo && <div className={s.promo}><div className="pbh-marqueeTrack pbh-promoTrack">{[0, 1].map(copy => <div className="pbh-marqueeGroup pbh-promoGroup" key={copy} aria-hidden={copy === 1 ? true : undefined}>{[0, 1, 2].map(item => <span className="pbh-promoItem" key={item} aria-hidden={item > 0 ? true : undefined}>CODE <strong>PRINCESSBLOOM5</strong><span> · </span>−5 % sur votre commande<Heart size={12} aria-hidden="true" /></span>)}</div>)}</div></div>}
      <header className={s.header} onKeyDown={event => { if (event.key === "Escape") closeMenu(); }}>
        <div className={s.headerInner}>
          <button ref={menuRef} type="button" className={s.menuButton} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="home-navigation">{menuOpen ? <X /> : <Menu />}</button>
          <Link href="/" className={s.logo} onClick={() => setMenuOpen(false)} aria-label="Princess Bloom, accueil"><Image src="/massseur/logovrai.png" alt="Princess Bloom" width={1928} height={815} sizes="(max-width: 650px) 142px, 192px" preload /></Link>
          <button type="button" className={s.cartLink} onClick={() => { setMenuOpen(false); openCartDrawer(); }} aria-haspopup="dialog" aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}><ShoppingBag /><span className={s.cartCount}>{itemCount}</span></button>
        </div>
        {menuOpen && <nav id="home-navigation" className={s.navigation} aria-label="Navigation principale">{navigation.map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}<ArrowRight size={15} /></Link>)}</nav>}
      </header>
      <section id="accueil-contenu" className={s.hero} aria-labelledby="home-title">
        <picture className={s.heroPicture}><source media="(max-width: 650px)" srcSet="/photos/home-hero-mobile-v3.webp" /><Image src="/photos/home-hero-desktop-v3.webp" alt="Femme détendue sur un canapé rose, portant la véritable ceinture Princess Bloom à sangle rose" fill sizes="100vw" preload /></picture>
        <div className={s.heroShade} />
        <div className={s.heroCopy}><Crown className={s.crown} aria-hidden="true" strokeWidth={1.1} /><h1 id="home-title">Calmer la <em>douleur</em><span>de vos règles</span></h1><div className={s.heartRule} aria-hidden="true"><span /><Heart /><span /></div><p>Découvrez la ceinture chauffante et massante pensée pour vous accompagner sans rien interrompre.</p><Link href="/produit" className={s.primary}>Découvrir ma ceinture <ArrowRight /></Link><TrustpilotSummary /><Link href="/comment-ca-marche" className={s.heroSecondary}>Comment ça fonctionne ? <ArrowRight size={15} /></Link></div>
        <a href="#rituel" className={s.heroScroll} aria-label="Découvrir le rituel Princess Bloom"><ArrowDown size={15} /><span>Un moment pour vous</span></a>
      </section>
      <div className={s.heroBottom}>
        <div className={s.heroBenefits}>{[{ icon: ThermometerSun, label: <>Chaleur<br />personnalisable</> }, { icon: Flower2, label: <>Massage<br />relaxant</> }, { icon: EyeOff, label: <>Discrétion<br />au quotidien</> }].map(({ icon: Icon, label }, i) => <div key={i}><span className={s.medallion}><Icon strokeWidth={1.25} /></span><p>{label}</p></div>)}</div>
        <div className={s.neutralProof}><HeartHandshake /><span>Pensée pour votre confort</span><i /><span>À votre rythme, chaque jour</span></div>
        <Link href="/produit" className={s.floatingProduct}><Image src={gallery[0].src} alt="Ceinture Princess Bloom rose" width={180} height={180} sizes="(max-width: 650px) 80px, 130px" /><div><h2>Ceinture chauffante<br />et massante</h2><p>Princess Bloom</p><strong>{money(price)}</strong></div><span className={s.productArrow}><span>Découvrir</span><ArrowRight /></span></Link>
        <p className={s.heroSignature}>Une <em>douceur</em><br />qui prend soin <em>de vous</em> ♡</p>
      </div>
    </div>

    <section className={s.reassurance} aria-label="Les engagements Princess Bloom"><div className="pbh-marqueeTrack pbh-reassuranceTrack">{[0, 1].map(copy => <div className="pbh-marqueeGroup pbh-reassuranceGroup" key={copy} aria-hidden={copy === 1 ? true : undefined} inert={copy === 1 ? true : undefined}><span><LockKeyhole />Paiement sécurisé</span><span><Truck />Livraison offerte à la commande</span><Link href="/suivi"><MoveHorizontal />Suivi de commande</Link><Link href="/retours"><RotateCcw />Conditions de retour</Link><Link href="/contact"><MessageCircle />À votre écoute</Link></div>)}</div></section>

    <section className={`${s.section} ${s.education}`} id="comprendre" aria-labelledby="education-title">
      <div className={s.sectionHeading}><span className={s.eyebrow}>Se comprendre. Prendre soin de soi.</span><h2 id="education-title">Vos règles ne devraient pas décider<br className={s.desktopBreak} /> du rythme de vos <em>journées.</em></h2><p>Comprendre son corps, c’est aussi apprendre à mieux prendre soin de soi.</p></div>
      <div className={s.educationCards}>
        <article><span className={s.cardNumber}>01</span><Heart strokeWidth={1.2} /><h3>Comprendre les crampes</h3><p>Pendant les règles, l’utérus se contracte pour évacuer sa muqueuse. Ces contractions peuvent provoquer des crampes.</p></article>
        <article><span className={s.cardNumber}>02</span><ThermometerSun strokeWidth={1.2} /><h3>Rechercher la chaleur</h3><p>Une chaleur douce sur le ventre peut aider à soulager l’inconfort. Choisissez une température agréable et adaptée.</p></article>
        <article><span className={s.cardNumber}>03</span><Waves strokeWidth={1.2} /><h3>S’accorder une pause</h3><p>Les vibrations de la ceinture sont proposées comme une sensation de massage et de détente. Le confort ressenti varie d’une personne à l’autre.</p></article>
      </div>
      <div className={s.educationFoot}><a href="https://www.ameli.fr/assure/sante/themes/regles-douloureuses/que-faire-quand-consulter" target="_blank" rel="noopener noreferrer">En savoir plus avec l’Assurance Maladie <ArrowRight size={15} /></a></div>
    </section>

    <section className={`${s.section} ${s.productSection}`} id="rituel" aria-labelledby="rituel-title">
      <div className={s.productGallery} onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setActivePhoto(i => (i + (event.key === "ArrowRight" ? 1 : -1) + gallery.length) % gallery.length); } }}>
        <div className={s.mainPhoto}><Image src={gallery[activePhoto].src} alt={gallery[activePhoto].alt} fill sizes="(max-width: 850px) 92vw, 45vw" /><span className={s.photoLabel}>L’essentiel de votre rituel</span><button type="button" className={s.zoomButton} onClick={() => zoomRef.current?.showModal()} aria-label="Agrandir la photo du produit"><ZoomIn /></button></div>
        <div className={s.galleryControls}><button type="button" aria-label="Photo précédente" onClick={() => setActivePhoto(i => (i - 1 + gallery.length) % gallery.length)}><ArrowLeft size={18} /></button><div className={s.thumbnails}>{gallery.map((photo, i) => <button key={photo.src} type="button" aria-label={`Afficher : ${photo.alt}`} aria-pressed={i === activePhoto} onClick={() => setActivePhoto(i)}><Image src={photo.src} alt="" width={90} height={90} sizes="70px" /></button>)}</div><button type="button" aria-label="Photo suivante" onClick={() => setActivePhoto(i => (i + 1) % gallery.length)}><ArrowRight size={18} /></button></div>
        <p className={s.photoCaption} aria-live="polite">{activePhoto + 1} / {gallery.length} · {gallery[activePhoto].alt}</p>
      </div>
      <div className={s.productDetails}><span className={s.eyebrow}>Votre confort, tout simplement</span><h2 id="rituel-title">Votre nouveau rituel<br />de <em>douceur.</em></h2><h3>{catalogProduct.name}</h3><p className={s.productDescription}>{product.description}</p><div className={s.priceLine}><strong>{money(price)}</strong><span>Coloris rose</span></div><ul className={s.checkList}>{product.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><div className={s.buyRow}><div className={s.quantity}><button type="button" onClick={() => setQuantity(Math.max(1, chosenQuantity - 1))} disabled={quantity <= 1} aria-label="Diminuer la quantité"><Minus size={16} /></button><output aria-label="Quantité">{chosenQuantity || 0}</output><button type="button" onClick={() => setQuantity(Math.min(availableQuantity, chosenQuantity + 1))} disabled={quantity >= availableQuantity} aria-label="Augmenter la quantité"><Plus size={16} /></button></div><button type="button" className={s.primary} onClick={addProduct} disabled={!chosenQuantity}><ShoppingBag size={19} />{chosenQuantity ? "Ajouter au panier" : "Quantité maximale au panier"}<ArrowRight size={18} /></button></div><p className={s.shippingInfo}><Truck size={18} />Livraison offerte · estimation de 5 à 10 jours ouvrés</p><p className={s.secureInfo}><LockKeyhole size={14} />Paiement sécurisé par la boutique</p><div className="pbh-paymentTrustpilot"><TrustpilotSummary /></div><Link href="/produit" className={s.textLink}>Tous les détails du produit <ArrowRight size={16} /></Link></div>
    </section>

    <section className={s.advantages} aria-labelledby="advantages-title"><div className={s.section}><div className={s.sectionHeading}><span className={s.eyebrow}>Les petits détails de votre rituel</span><h2 id="advantages-title">Pensée pour vous. Pour votre confort.<br />Pour votre <em>liberté.</em></h2></div><div className={s.advantageCards}>{benefits.map(({ icon: Icon, title, detail, technical }) => <article key={title}><Icon strokeWidth={1.2} /><h3>{title}</h3><p>{detail}</p>{technical && <span>{technical}</span>}</article>)}</div></div></section>

    <section className={`${s.section} ${s.lifestyle}`} aria-labelledby="lifestyle-title"><div className={s.headingRow}><div><span className={s.eyebrow}>La vie continue, tout en douceur</span><h2 id="lifestyle-title">Votre douceur vous<br />accompagne <em>partout.</em></h2></div><p>Un livre, une pause, une journée à vous.<br />Faites une place à votre confort.</p></div><div className={s.lifestyleGrid}>{[{ src: "/photos/lifestyle-reading.webp", alt: "Femme portant la ceinture Princess Bloom en lisant sur un canapé", label: "01 / À la maison", title: "Le temps de ralentir." }, { src: "/photos/home-campaign-cooking-v2.webp", alt: "Ceinture Princess Bloom portée pendant la préparation du petit déjeuner", label: "02 / Un moment de détente", title: "Une pause qui vous ressemble." }, { src: "/photos/lifestyle-desk-three-quarter.webp", alt: "Femme travaillant à son bureau avec sa ceinture Princess Bloom rose", label: "03 / Dans votre quotidien", title: "Votre rythme. Votre liberté." }].map(photo => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 650px) 92vw, 48vw" /><figcaption><span>{photo.label}</span><h3>{photo.title}</h3></figcaption></figure>)}</div></section>

    <section className={`${s.section} ${s.steps}`} aria-labelledby="steps-title"><div className={s.sectionHeading}><span className={s.eyebrow}>Un rituel tout simple</span><h2 id="steps-title">Votre moment de douceur<br />en <em>3 étapes.</em></h2></div><div className={s.stepGrid}>{steps.map(({ src, icon: Icon, title, text }, i) => <article key={title}><div className={s.stepPhoto}><Image src={src} alt={title} fill sizes="(max-width: 650px) 92vw, 30vw" /><span>0{i + 1}</span></div><h3><Icon size={19} />{title}</h3><p>{text}</p></article>)}</div><p className={s.safetyNote}>Commencez par une chaleur douce. Respectez la notice du fabricant et interrompez l’utilisation en cas d’inconfort. <Link href="/comment-ca-marche">Découvrir le fonctionnement <ArrowRight size={14} /></Link></p></section>

    <section className={s.videoSection} aria-labelledby="videos-title"><div className={s.section}><div className={s.sectionHeading}><span className={s.eyebrow}>À découvrir prochainement</span><h2 id="videos-title">Princess Bloom,<br />en <em>mouvement.</em></h2><p>Les présentations et démonstrations vidéo seront bientôt à retrouver ici.</p></div><div className={s.videoGrid}><VideoSlot number={1} title="Découvrez Princess Bloom" poster="/photos/product-hero-square.webp" /><VideoSlot number={2} title="Comment utiliser votre ceinture ?" poster="/photos/lifestyle-worn-closeup.webp" /><VideoSlot number={3} title="Un moment de douceur au quotidien" poster="/photos/lifestyle-reading.webp" /></div></div></section>

    <section className={`${s.section} ${s.comparison} pbh-referenceCompareSection`} aria-labelledby="comparison-title"><div className={s.sectionHeading}><h2 id="comparison-title">Pourquoi continuer<br />avec les <em>solutions classiques ?</em></h2><Heart className="pbh-referenceCompareHeart" aria-hidden="true" /></div><ComparisonTable /><p className={s.compareNote}>Comparaison avec une bouillotte classique à eau. Les caractéristiques des autres solutions de confort varient selon le modèle.</p></section>

    <section className={s.reviewsSection} aria-labelledby="reviews-title"><div className={s.section}><span className={s.eyebrow}>La confiance se construit avec vous</span><div className={s.reviewsLayout}><div><h2 id="reviews-title">Elles partagent leur expérience<br /><em>Princess Bloom.</em></h2><p>Votre expérience compte. Nous souhaitons lui donner une place juste, avec des avis authentiques et une source identifiable.</p><Link href="/contact" className={s.textLink}>Partager mon expérience <ArrowRight size={16} /></Link></div><div className={s.reviewPlaceholder}><MessageCircle strokeWidth={1.1} /><span>Avis clients</span><h3>Vos expériences,<br />bientôt ici.</h3><p>Un espace réservé aux futurs avis authentiques et à une éventuelle intégration officielle Trustpilot.</p><small>Aucune note ni aucun témoignage ne sont affichés en attendant.</small></div></div></div></section>

    <section className={`${s.section} ${s.story}`} aria-labelledby="story-title"><div className={s.storyPhoto}><Image src="/photos/home-campaign-product-v2.webp" alt="La véritable ceinture Princess Bloom sur un satin rose, entourée de roses délicates" fill sizes="(max-width: 850px) 92vw, 45vw" /></div><div><span className={s.eyebrow}>Notre histoire, votre douceur</span><h2 id="story-title">Princess Bloom,<br />une douceur pensée<br /><em>pour vous.</em></h2><p>Placer le confort féminin au centre. Faire une place aux pauses, même dans les journées bien remplies. C’est l’esprit Princess Bloom.</p><p>Nous privilégions un accessoire pratique, un design agréable et une expérience transparente. De la douceur, de la confiance et la liberté de prendre soin de soi, à son rythme.</p><Link href="/histoire" className={s.secondary}>Découvrir notre histoire <ArrowRight size={17} /></Link></div></section>

    <section className={`${s.section} ${s.faqSection}`} aria-labelledby="faq-title"><div><span className={s.eyebrow}>On prend le temps de vous répondre</span><h2 id="faq-title">Toutes vos questions,<br />nos <em>réponses.</em></h2><p>Un doute ? Notre équipe est à votre écoute.</p><Link href="/contact" className={s.textLink}>Nous contacter <ArrowRight size={16} /></Link></div><div className={s.faqList}>{faq.map(([question, answer], i) => <details key={question}><summary><span><small>{String(i + 1).padStart(2, "0")}</small>{question}</span><Plus size={18} /></summary><div><p>{answer}</p>{i === 8 && <Link href="/suivi">Suivre ma commande →</Link>}{i === 9 && <Link href="/retours">Consulter les conditions de retour →</Link>}</div></details>)}</div></section>

    <section className={s.lastCta} aria-labelledby="last-title"><div className={s.lastPhoto}><Image src="/photos/product-hero-square.webp" alt="Ceinture Princess Bloom rose sur satin avec des fleurs délicates" fill sizes="(max-width: 650px) 100vw, 50vw" /></div><div className={s.lastCopy}><Crown strokeWidth={1} /><span className={s.eyebrow}>Votre prochain moment pour vous</span><h2 id="last-title">Une douceur<br />qui prend soin<br /><em>de vous</em> ♡</h2><p>Accordez-vous un moment de confort, à votre rythme.</p><strong>{money(price)}</strong><Link href="/produit" className={s.primary}>Je découvre ma ceinture <ArrowRight /></Link><small><LockKeyhole size={13} />Paiement sécurisé<span>·</span>Livraison offerte</small></div></section>

    <section className={`${s.section} ${s.newsletter}`} aria-labelledby="newsletter-title"><div><Mail strokeWidth={1.15} /><span className={s.eyebrow}>Gardons le lien</span><h2 id="newsletter-title">Un peu de douceur<br />dans votre <em>boîte mail.</em></h2><p>Recevez nos conseils bien-être et les actualités Princess Bloom.</p></div><form aria-describedby="newsletter-status" onSubmit={event => event.preventDefault()}><label htmlFor="home-newsletter-email">Votre adresse e-mail</label><div className={s.newsletterField}><input id="home-newsletter-email" type="email" autoComplete="email" placeholder="vous@exemple.fr" disabled /><button type="submit" disabled>Prochainement <ArrowRight size={18} /></button></div><label className={s.consent}><input type="checkbox" disabled />Je souhaite recevoir les nouvelles de Princess Bloom. <Link href="/confidentialite">Confidentialité</Link></label><p id="newsletter-status">Les inscriptions ne sont pas encore ouvertes. Aucune adresse n’est enregistrée depuis ce formulaire.</p></form></section>

    <footer className={s.footer}><div className={s.footerTop}><div className={s.footerBrand}><Image src="/massseur/logovrai.png" alt="Princess Bloom" width={1928} height={815} sizes="180px" /><p>Votre douceur, votre liberté.</p><Heart strokeWidth={1.1} /></div><div><h2>Découvrir</h2>{navigation.slice(1, 4).map(([href, text]) => <Link key={href} href={href}>{text}</Link>)}<Link href="/avis">Avis clients</Link></div><div><h2>À votre écoute</h2>{[["/faq", "FAQ"], ["/contact", "Contact"], ["/suivi", "Suivi de commande"], ["/livraison", "Livraison"], ["/retours", "Retours"]].map(([href, text]) => <Link key={href} href={href}>{text}</Link>)}</div><div><h2>En confiance</h2>{[["/mentions-legales", "Mentions légales"], ["/conditions-generales", "Conditions générales"], ["/confidentialite", "Confidentialité"], ["/cookies", "Cookies"]].map(([href, text]) => <Link key={href} href={href}>{text}</Link>)}</div></div><div className={s.footerBottom}><span>© Princess Bloom</span><span><LockKeyhole size={13} />Un moment de confiance, de douceur et de liberté.</span><a href="#home-title">Retour en haut ↑</a></div></footer>

    <dialog ref={zoomRef} className={s.zoomDialog} aria-label="Photo agrandie du produit" onClick={event => { if (event.target === event.currentTarget) zoomRef.current?.close(); }}><div><button type="button" autoFocus onClick={() => zoomRef.current?.close()} aria-label="Fermer la photo agrandie"><X /></button><Image src={gallery[activePhoto].src} alt={gallery[activePhoto].alt} width={1536} height={1536} sizes="90vw" /></div></dialog>
  </main>;
}
