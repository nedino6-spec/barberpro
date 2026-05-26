"use client";

import { useState, useEffect } from "react";
import { Monitor, ShoppingCart, Scissors, Package, Trash2, CheckCircle2, CreditCard, Banknote, Landmark, AlertCircle, User } from "lucide-react";

export default function CaixaPage() {
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSrv, resProd, resCust] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/inventory"),
        fetch("/api/clientes")
      ]);
      if (resSrv.ok) setServices(await resSrv.json());
      if (resProd.ok) setProducts(await resProd.json());
      if (resCust.ok) setCustomers(await resCust.json());
    } catch (error) {
      console.error("Erro ao carregar catálogo", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any, type: "service" | "product") => {
    setCart((prev) => {
      const existing = prev.find(i => i.id === item.id && i.type === type);
      if (existing) {
        return prev.map(i => i.id === item.id && i.type === type ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...item, type, cartQuantity: 1 }];
    });
    setCheckoutSuccess(false);
  };

  const removeFromCart = (id: string, type: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.type === type)));
  };

  const updateCartQuantity = (id: string, type: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.type === type) {
        const newQtd = i.cartQuantity + delta;
        return newQtd > 0 ? { ...i, cartQuantity: newQtd } : i;
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Adicione itens ao carrinho primeiro!");
    setIsProcessing(true);

    try {
      const payload = {
        items: cart,
        paymentMethod,
        totalAmount: cartTotal,
        customerId: selectedCustomerId || null
      };

      const res = await fetch("/api/pdv/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCart([]);
        setCheckoutSuccess(true);
        fetchData(); // Atualiza os estoques na tela direita
        setTimeout(() => setCheckoutSuccess(false), 5000);
      } else {
        alert("Erro ao finalizar venda.");
      }
    } catch (e) {
      alert("Erro de conexão ao finalizar venda.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Monitor className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Frente de Caixa (PDV)</h1>
          <p className="text-muted-foreground text-sm">Realize vendas e feche comandas com rapidez.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Lado Esquerdo - Carrinho */}
        <div className="flex flex-col w-full lg:w-[400px] shrink-0 glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-white"><ShoppingCart className="w-5 h-5 text-blue-400" /> Comanda Aberta</h2>
            <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-md text-sm">{cart.length} itens</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-70">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p>O carrinho está vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-3 border border-white/10 rounded-xl bg-slate-900/50 shadow-sm group">
                  <div className="flex flex-col overflow-hidden text-white">
                    <span className="font-bold text-sm truncate">{item.name || item.productName}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {item.type === "service" ? <Scissors className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {item.type === "service" ? "Serviço" : "Produto"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10 text-white">
                      <button onClick={() => updateCartQuantity(item.id, item.type, -1)} className="px-2.5 py-1 text-slate-400 hover:text-white">-</button>
                      <span className="font-bold text-sm w-4 text-center">{item.cartQuantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.type, 1)} className="px-2.5 py-1 text-slate-400 hover:text-white">+</button>
                    </div>
                    
                    <div className="text-right w-[70px]">
                      <div className="font-bold text-emerald-400 text-sm">R$ {(item.price * item.cartQuantity).toFixed(2)}</div>
                    </div>

                    <button onClick={() => removeFromCart(item.id, item.type)} className="text-red-400 opacity-50 hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Section */}
          <div className="p-5 border-t border-white/10 bg-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Total:</span>
              <span className="text-3xl font-bold text-white glow-text">R$ {cartTotal.toFixed(2)}</span>
            </div>

            {checkoutSuccess && (
              <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg flex items-center gap-2 font-bold justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" /> Venda Concluída!
              </div>
            )}

            <div className="flex flex-col gap-2 mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <User className="w-3 h-3" /> Cliente (Para Pontos/Fiado)
              </label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-white text-sm font-medium"
              >
                <option value="">Selecione um cliente (Opcional)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-2">
              <button onClick={() => setPaymentMethod("PIX")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "PIX" ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
                <Landmark className="w-4 h-4" /> PIX
              </button>
              <button onClick={() => setPaymentMethod("CARTAO")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "CARTAO" ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
                <CreditCard className="w-4 h-4" /> Cartão
              </button>
              <button onClick={() => setPaymentMethod("DINHEIRO")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "DINHEIRO" ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
                <Banknote className="w-4 h-4" /> Dinheiro
              </button>
              <button onClick={() => setPaymentMethod("PENDENTE")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "PENDENTE" ? "bg-red-500 text-white border-red-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
                <AlertCircle className="w-4 h-4" /> Fiado
              </button>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none border-t border-emerald-400/30"
            >
              {isProcessing ? "Processando..." : "Finalizar Venda"}
            </button>
          </div>
        </div>

        {/* Lado Direito - Catálogo */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="font-bold text-lg text-white">Catálogo Rápido</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-slate-500">Carregando catálogo...</div>
            ) : (
              <div className="flex flex-col gap-8">
                
                {/* Serviços */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-400 mb-4 uppercase text-xs tracking-wider">
                    <Scissors className="w-4 h-4" /> Serviços
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {services.map(srv => (
                      <button key={srv.id} onClick={() => addToCart(srv, "service")} className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group active:scale-95">
                        <span className="font-bold text-sm text-white line-clamp-2 leading-tight mb-2 group-hover:text-blue-400 transition-colors">{srv.name}</span>
                        <span className="text-emerald-400 font-bold text-sm">R$ {srv.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Produtos (Estoque) */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-400 mb-4 uppercase text-xs tracking-wider">
                    <Package className="w-4 h-4" /> Produtos Físicos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {products.map(prod => {
                      const semEstoque = prod.quantity <= 0;
                      return (
                        <button key={prod.id} disabled={semEstoque} onClick={() => addToCart(prod, "product")} className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all active:scale-95 group ${semEstoque ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60' : 'border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10'}`}>
                          <span className={`font-bold text-sm line-clamp-2 leading-tight mb-2 transition-colors ${semEstoque ? 'text-red-400' : 'text-white group-hover:text-blue-400'}`}>{prod.productName}</span>
                          <span className="text-emerald-400 font-bold text-sm">R$ {prod.price.toFixed(2)}</span>
                          <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${semEstoque ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {semEstoque ? 'Esgotado' : `Estoque: ${prod.quantity}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
