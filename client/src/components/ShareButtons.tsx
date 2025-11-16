import { Share2, Facebook, Instagram, MessageCircle, Mail, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ShareButtonsProps {
  productName: string;
  productDescription?: string;
  productEmoji?: string;
}

export default function ShareButtons({
  productName,
  productDescription,
  productEmoji = "🍰",
}: ShareButtonsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Obtener la URL base del sitio
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const shareText = `Mira este delicioso producto de Alma: ${productEmoji} ${productName}. ${productDescription || "Dulces artesanales naturales y orgánicos."} `;
  const encodedShareText = encodeURIComponent(shareText);
  const productUrl = `${baseUrl}/#productos`;

  const handleWhatsApp = () => {
    const message = `${shareText}${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "width=600,height=400");
    setShowMenu(false);
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodedShareText}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    setShowMenu(false);
  };

  const handleInstagram = () => {
    toast.info("Copia el enlace y comparte en Instagram desde tu perfil");
    navigator.clipboard.writeText(productUrl);
    setShowMenu(false);
  };

  const handleEmail = () => {
    const subject = `Descubre: ${productName}`;
    const body = `${shareText}\n\n${productUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setShowMenu(false);
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    setShowMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      toast.success("Enlace copiado al portapapeles");
      setShowMenu(false);
    }).catch(() => {
      toast.error("No se pudo copiar el enlace");
    });
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/30 w-full font-medium"
        title="Compartir en redes sociales"
      >
        <Share2 size={18} />
        <span className="text-sm">Compartir</span>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-2 z-50 w-56">
          <div className="space-y-1">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-950 transition-colors text-left"
            >
              <MessageCircle size={18} className="text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            <button
              onClick={handleFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-left"
            >
              <Facebook size={18} className="text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium">Facebook</span>
            </button>

            <button
              onClick={handleInstagram}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors text-left"
            >
              <Instagram size={18} className="text-pink-500 flex-shrink-0" />
              <span className="text-sm font-medium">Instagram</span>
            </button>

            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-left"
            >
              <Mail size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">Email</span>
            </button>

            <button
              onClick={handleTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-left"
            >
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
              </svg>
              <span className="text-sm font-medium">X (Twitter)</span>
            </button>

            <div className="border-t border-border my-1"></div>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
            >
              <Link2 size={18} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">Copiar enlace</span>
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
}
