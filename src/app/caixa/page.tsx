"use client";

import { useState, useEffect } from "react";
import { Monitor, ShoppingCart, Scissors, Package, Trash2, CheckCircle2, CreditCard, Banknote, Landmark } from "lucide-react";

export default function CaixaPage() {
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSrv, resProd] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/inventory")
      ]);
      setServices(await resSrv.json());
      setProducts(await resProd.json());
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
        totalAmount: cartTotal
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
        <div className="flex flex-col w-full lg:w-[400px] shrink-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border bg-bg-tertiary flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Comanda Aberta</h2>
            <span className="bg-primary/20 text-primary-dark font-bold px-2 py-0.5 rounded-md text-sm">{cart.length} itens</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p>O carrinho está vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-3 border border-border rounded-xl bg-background shadow-sm group">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm truncate">{item.name || item.productName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {item.type === "service" ? <Scissors className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {item.type === "service" ? "Serviço" : "Produto"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-bg-tertiary rounded-lg border border-border">
                      <button onClick={() => updateCartQuantity(item.id, item.type, -1)} className="px-2.5 py-1 text-muted-foreground hover:text-foreground">-</button>
                      <span className="font-bold text-sm w-4 text-center">{item.cartQuantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.type, 1)} className="px-2.5 py-1 text-muted-foreground hover:text-foreground">+</button>
                    </div>
                    
                    <div className="text-right w-[70px]">
                      <div className="font-bold text-success text-sm">R$ {(item.price * item.cartQuantity).toFixed(2)}</div>
                    </div>

                    <button onClick={() => removeFromCart(item.id, item.type)} className="text-danger opacity-50 hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Section */}
          <div className="p-5 border-t border-border bg-bg-tertiary flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total:</span>
              <span className="text-3xl font-bold text-foreground">R$ {cartTotal.toFixed(2)}</span>
            </div>

            {checkoutSuccess && (
              <div className="bg-success/20 text-success-dark px-4 py-2 rounded-lg flex items-center gap-2 font-bold justify-center border border-success/30">
                <CheckCircle2 className="w-5 h-5" /> Venda Concluída!
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <button onClick={() => setPaymentMethod("PIX")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "PIX" ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"}`}>
                <Landmark className="w-4 h-4" /> PIX
              </button>
              <button onClick={() => setPaymentMethod("CARTAO")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "CARTAO" ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"}`}>
                <CreditCard className="w-4 h-4" /> Cartão
              </button>
              <button onClick={() => setPaymentMethod("DINHEIRO")} className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${paymentMethod === "DINHEIRO" ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"}`}>
                <Banknote className="w-4 h-4" /> Dinheiro
              </button>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-4 bg-success text-white rounded-xl font-bold text-lg shadow-glow hover:bg-success/90 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {isProcessing ? "Processando..." : "Finalizar Venda"}
            </button>
          </div>
        </div>

        {/* Lado Direito - Catálogo */}
        <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-lg">Catálogo Rápido</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-muted-foreground">Carregando catálogo...</div>
            ) : (
              <div className="flex flex-col gap-8">
                
                {/* Serviços */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-muted-foreground mb-4 uppercase text-xs tracking-wider">
                    <Scissors className="w-4 h-4" /> Serviços
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {services.map(srv => (
                      <button key={srv.id} onClick={() => addToCart(srv, "service")} className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all group active:scale-95">
                        <span className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">{srv.name}</span>
                        <span className="text-success font-bold text-sm">R$ {srv.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Produtos (Estoque) */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-muted-foreground mb-4 uppercase text-xs tracking-wider">
                    <Package className="w-4 h-4" /> Produtos Físicos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {products.map(prod => {
                      const semEstoque = prod.quantity <= 0;
                      return (
                        <button key={prod.id} disabled={semEstoque} onClick={() => addToCart(prod, "product")} className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all active:scale-95 group ${semEstoque ? 'border-danger/30 bg-danger/5 cursor-not-allowed opacity-60' : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'}`}>
                          <span className={`font-bold text-sm line-clamp-2 leading-tight mb-2 transition-colors ${semEstoque ? 'text-danger' : 'text-foreground group-hover:text-primary'}`}>{prod.productName}</span>
                          <span className="text-success font-bold text-sm">R$ {prod.price.toFixed(2)}</span>
                          <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${semEstoque ? 'bg-danger text-white' : 'bg-bg-tertiary text-muted-foreground'}`}>
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
