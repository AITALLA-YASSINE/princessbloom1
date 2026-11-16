"use client";

import { useEffect, useId, useState } from "react";
import { House } from "lucide-react";
import "./address-autocomplete.css";

type Address = { label: string; address: string; postalCode: string; city: string };
type Props = {
  name: string; label: string; value: string; country: string;
  onChange: (value: string) => void;
  onSelect: (address: Address) => void;
};

export default function AddressAutocomplete({ name, label, value, country, onChange, onSelect }: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<{ query: string; addresses: Address[] }>({ query: "", addresses: [] });
  const [state, setState] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [selected, setSelected] = useState("");
  const query = value.trim();
  const enabled = country === "FR" && focused && query.length >= 3 && selected !== value;
  const addresses = enabled && result.query === query ? result.addresses : [];
  const open = addresses.length > 0;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setState("loading");
      try {
        const url = new URL("https://data.geopf.fr/geocodage/search");
        url.search = new URLSearchParams({ q: query, index: "address", limit: "5", autocomplete: "1" }).toString();
        const response = await fetch(url, { signal: controller.signal, referrerPolicy: "no-referrer" });
        if (!response.ok) throw new Error("address_unavailable");
        const body = await response.json();
        const suggestions: Address[] = (body.features || []).flatMap((feature: { properties?: Record<string, string> }) => {
          const p = feature.properties;
          return p?.name && p?.postcode && p?.city && p?.label ? [{ label: p.label, address: p.name, postalCode: p.postcode, city: p.city }] : [];
        });
        if (controller.signal.aborted) return;
        setResult({ query, addresses: suggestions }); setActive(-1); setState(suggestions.length ? "idle" : "empty");
      } catch {
        if (!controller.signal.aborted) { setResult({ query, addresses: [] }); setState("error"); }
      }
    }, 350);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, enabled]);

  function choose(address: Address) {
    setSelected(address.address); setFocused(false); setActive(-1); setState("idle"); onSelect(address);
  }

  return <div className="checkout-address-lookup" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  }}>
    <label className="checkout-field" htmlFor={id}><House /><span className="sr-only">{label}</span>
      <input id={id} name={name} value={value} placeholder={label} required maxLength={254}
        autoComplete={country === "FR" ? "off" : name === "address" ? "shipping address-line1" : "billing address-line1"}
        role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        onFocus={() => setFocused(true)} onChange={event => { setSelected(""); setActive(-1); setState("idle"); onChange(event.target.value); }}
        onKeyDown={event => {
          if (event.key === "Escape") { setFocused(false); return; }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (!open) return; event.preventDefault();
            setActive(current => event.key === "ArrowDown" ? (current + 1) % addresses.length : (current - 1 + addresses.length) % addresses.length);
          }
          if (event.key === "Enter" && open && active >= 0) { event.preventDefault(); choose(addresses[active]); }
        }} />
    </label>
    {open && <div className="checkout-address-results"><ul id={`${id}-list`} role="listbox" aria-label="Adresses proposées">
      {addresses.map((address, index) => <li id={`${id}-option-${index}`} key={`${address.label}-${index}`} role="option" aria-selected={active === index}
        className={active === index ? "is-active" : ""} onPointerDown={event => event.preventDefault()} onClick={() => choose(address)}>
        <strong>{address.address}</strong><span>{address.postalCode} {address.city}</span>
      </li>)}
    </ul><small>Adresses · IGN / Base Adresse Nationale</small></div>}
    {enabled && !open && state !== "idle" && <small className="checkout-address-status" role="status">
      {state === "loading" ? "Recherche d’adresses…" : state === "empty" ? "Aucune suggestion. Vous pouvez saisir votre adresse manuellement." : "Recherche indisponible. Vous pouvez saisir votre adresse manuellement."}
    </small>}
  </div>;
}
