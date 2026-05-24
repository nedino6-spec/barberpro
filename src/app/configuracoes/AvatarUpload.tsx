import { useState } from "react";
import { uploadImage } from "@/lib/supabase";

export default function AvatarUpload({ currentAvatarUrl, onUploadSuccess }: { currentAvatarUrl?: string, onUploadSuccess: (url: string) => void }) {
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarLoading(true);
    try {
      const url = await uploadImage(file, "avatars", `user_${Date.now()}_`);
      if (url) {
        onUploadSuccess(url);
        alert("Avatar atualizado com sucesso!");
      }
    } catch(err) {
      alert("Erro ao enviar avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 mb-8 bg-card border border-border p-6 rounded-2xl">
      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-primary">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          "✂️"
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs font-bold text-white">Alterar</span>
        </div>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} disabled={avatarLoading} />
      </div>
      <div>
        <h3 className="font-bold text-lg">Perfil</h3>
        <p className="text-muted-foreground text-sm">Clique na imagem para enviar uma foto (Supabase)</p>
        {avatarLoading && <p className="text-xs text-primary animate-pulse mt-1">Enviando foto...</p>}
      </div>
    </div>
  );
}
