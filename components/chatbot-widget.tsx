"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { getChatbotReply } from "@/lib/chatbot";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const quickQuestions = [
  "Prix",
  "Livraison",
  "Paiement",
  "Contact",
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Bonjour ! Je suis l’assistant Princess Bloom. Posez-moi une question sur le produit, la livraison, le paiement ou le contact.",
    },
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    const botReply: Message = {
      id: Date.now() + 1,
      sender: "bot",
      text: getChatbotReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, botReply]);
    setInput("");
  };

  const askQuickQuestion = (question: string) => {
    setInput(question);
    setOpen(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[min(92vw,360px)] overflow-hidden rounded-[1.75rem] border border-[#493238]/10 bg-white shadow-[0_25px_60px_rgba(73,50,56,0.18)]">
          <div className="flex items-center justify-between bg-[#493238] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3dfe2] text-[#493238]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Princess Bloom</p>
                <p className="text-[10px] text-white/70">Assistant en ligne</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Fermer le chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 bg-[#fffaf8] p-4">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => askQuickQuestion(question)}
                  className="rounded-full border border-[#493238]/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[#493238] transition hover:border-[#b77b8c]/40 hover:text-[#b77b8c]"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                      message.sender === "user"
                        ? "bg-[#b77b8c] text-white"
                        : "bg-white text-[#493238] shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#493238]/10 bg-white p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Posez votre question..."
              className="w-full rounded-full border border-[#493238]/10 bg-[#f9f0ec] px-4 py-2.5 text-sm text-[#493238] outline-none placeholder:text-[#493238]/45 focus:border-[#b77b8c]"
            />
            <button
              type="submit"
              aria-label="Envoyer le message"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#b77b8c] text-white shadow-[0_10px_20px_rgba(183,123,140,0.35)] transition hover:bg-[#a8647c]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#493238] text-white shadow-[0_20px_40px_rgba(73,50,56,0.25)] transition hover:scale-[1.02]"
        aria-label="Ouvrir le chatbot"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
