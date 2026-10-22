export const product = {
  id: "princessbloom-ceinture",
  name: "Princess Bloom — Ceinture Chauffante & Massante Menstruelle",
  price: 89,
  oldPrice: 119,
  description:
    "Une ceinture chauffante et massante pensée pour vous accompagner dans votre quotidien avec douceur, chaleur ciblée et confort discret.",
  features: [
    "5 niveaux de température",
    "4 modes de vibration",
    "Minuteur 15/30 minutes",
    "Chaleur ciblée",
    "Sangle ajustable",
  ],
};

export const testimonials = [
  {
    name: "Sophie",
    title: "Au bureau, sans compromis",
    quote:
      "Je peux travailler sans avoir à m’arrêter. La chaleur est douce et le design est discret sous mes vêtements.",
    rating: 5,
  },
  {
    name: "Amélie",
    title: "Confort au quotidien",
    quote:
      "J’adore la simplicité d’utilisation. Le massage est relaxant et la ceinture reste très agréable à porter.",
    rating: 5,
  },
  {
    name: "Lina",
    title: "Idée cadeau parfaite",
    quote:
      "Elle est jolie, très pratique, et aide vraiment à retrouver du calme pendant les jours plus fatigants.",
    rating: 5,
  },
];

export const faqs = [
  {
    category: "Produit",
    items: [
      { question: "La ceinture est-elle compatible avec tous les vêtements ?", answer: "Oui. Elle se porte sous des vêtements amples et reste discrète, sans gêner les mouvements." },
      { question: "Peut-on utiliser la ceinture plusieurs fois par semaine ?", answer: "Oui, en respectant les recommandations d’utilisation et les consignes de sécurité de la notice." },
    ],
  },
  {
    category: "Utilisation",
    items: [
      { question: "Combien de temps dure une séance ?", answer: "La ceinture propose un minuteur de 15 ou 30 minutes, selon votre confort." },
      { question: "Comment régler la chaleur et les vibrations ?", answer: "Les boutons sont simples d’accès et permettent d’ajuster la température, le mode de massage et la durée." },
    ],
  },
  {
    category: "Sécurité",
    items: [
      { question: "Faut-il faire attention à la température ?", answer: "Il est conseillé de commencer au niveau le plus doux et d’éviter toute utilisation sur peau irritée." },
      { question: "Peut-on l’utiliser pendant les règles ?", answer: "Oui, elle est conçue pour accompagner les moments de tension et le confort au quotidien." },
    ],
  },
];

export const shippingMethods = [
  { id: "standard", label: "Livraison standard", price: 6.9, eta: "3 à 5 jours" },
  { id: "express", label: "Livraison express", price: 12.9, eta: "24 à 48h" },
  { id: "pickup", label: "Retrait en point relay", price: 0, eta: "2 à 4 jours" },
];
