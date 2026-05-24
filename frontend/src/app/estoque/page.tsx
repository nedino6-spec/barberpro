"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function EstoquePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form State
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.productName);
      setQuantity(product.quantity.toString());
      setMinQuantity(product.minQuantity.toString());
      setPrice(product.price.toString());
    } else {
      setEditingProduct(null);
      setProductName("");
      setQuantity("");
      setMinQuantity("");
      setPrice("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      productName,
      quantity,
      minQuantity,
      price
    };

    try {
      if (editingProduct) {
        await fetch(`/api/inventory/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      alert("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este produto do estoque?")) return;
    
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      alert("Erro ao excluir produto.");
    }
  };

  const filteredProducts = products.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusInfo = (qtd: number, min: number) => {
    if (qtd <= 0) return { label: "Esgotado", color: "text-error", bg: "bg-error/10", icon: XCircle };
    if (qtd <= min) return { label: "Baixo", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle };
    return { label: "Em Dia", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 };
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Estoque Inteligente
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle seus produtos, vendas e alertas de reposição.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-glow hover:bg-primary-hover transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm flex flex-col gap-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-tertiary p-3 rounded-xl border border-border">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar produto por nome..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 px-4 font-bold">Produto</th>
                <th className="pb-3 px-4 font-bold">Preço Venda</th>
                <th className="pb-3 px-4 font-bold text-center">Status</th>
                <th className="pb-3 px-4 font-bold text-center">Qtd Atual</th>
                <th className="pb-3 px-4 font-bold text-center">Mínimo</th>
                <th className="pb-3 px-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">Carregando estoque...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const status = getStatusInfo(product.quantity, product.minQuantity);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-bg-tertiary/50 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground">{product.productName}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-muted-foreground">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold text-lg ${product.quantity <= product.minQuantity ? 'text-error' : 'text-foreground'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-muted-foreground font-medium">
                        {product.minQuantity}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(product)} className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-error transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingProduct ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Produto</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Ex: Pomada Efeito Matte 150g" 
                  className="bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preço de Venda (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00" 
                  className="bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Qtd Atual</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="0" 
                    className="bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-warning uppercase tracking-wider">Alerta Mínimo</label>
                  <input 
                    type="number" 
                    value={minQuantity}
                    onChange={e => setMinQuantity(e.target.value)}
                    placeholder="0" 
                    className="bg-background border border-warning/50 rounded-xl px-4 py-2.5 outline-none focus:border-warning transition-colors" 
                    required 
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Avisa quando chegar nesta quantidade</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:bg-bg-tertiary transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-glow transition-all" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
