import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "8801793348407"; // WhatsApp format: country code + number
  const message = "Hello! I'm interested in your services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl animate-fade-in group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 group-hover:animate-pulse" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </a>
  );
};

export default WhatsAppButton;
