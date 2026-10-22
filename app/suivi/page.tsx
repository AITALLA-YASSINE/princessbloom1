export default function TrackingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Suivi de commande</p>
        <h1 className="mt-4 text-4xl text-[#493238]">Suivez votre commande</h1>

        <div className="mt-8 rounded-[1.5rem] bg-[#f5ece9] p-6">
          <p className="text-sm text-[#493238]/75">Numéro de commande : <span className="font-semibold">NOR-2026-0001</span></p>
          <div className="mt-6 space-y-4">
            {[
              { state: "Commande confirmée", done: true },
              { state: "Préparation en cours", done: true },
              { state: "Expédition", done: false },
              { state: "Livraison", done: false },
            ].map((step) => (
              <div key={step.state} className="flex items-center gap-4">
                <span className={`inline-flex h-3 w-3 rounded-full ${step.done ? "bg-[#b77b8c]" : "bg-[#d9c7cc]"}`} />
                <span className={`text-sm ${step.done ? "text-[#493238]" : "text-[#493238]/50"}`}>{step.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
