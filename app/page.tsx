import type { Metadata } from "next";
import { ReferenceHome } from "./reference-home";

export const metadata: Metadata = {
  title: "Princess Bloom | Votre rituel de douceur",
  description: "Découvrez la Ceinture Menstruelle Chauffante pour les règles douloureuses Princess Bloom : chaleur personnalisable, vibrations et sangle ajustable pour vos moments de confort.",
};

export default function Home() { return <ReferenceHome />; }
