const formatHarga = (
    harga: number,
    options: { style?: "decimal" | "currency"; shorten?: boolean } = {}
  ) => {
    const { style = "currency", shorten = false } = options;
  
    if (shorten) {
      // Format singkat (3.5 JT, 350 RB, dll)
      if (harga >= 1_000_000_000) {
        // Format untuk miliar (M)
        const miliar = harga / 1_000_000_000;
        return `${miliar.toFixed(2).replace(/\.00$/, "")} M`; // Contoh: 3.5 M
      } else if (harga >= 1_000_000) {
        // Format untuk juta (JT)
        const juta = harga / 1_000_000;
        return `${juta.toFixed(2).replace(/\.00$/, "")} JT`; // Contoh: 3.5 JT
      } else if (harga >= 100_000) {
        // Format untuk ribuan (RB)
        const ribu = harga / 1_000;
        return `${ribu.toFixed(2).replace(/\.00$/, "")} RB`; // Contoh: 350 RB
      } else {
        // Format default untuk angka di bawah 100 ribu
        return new Intl.NumberFormat("id-ID", {
          style: style,
          currency: style === "currency" ? "IDR" : undefined,
          minimumFractionDigits: 0,
        }).format(harga);
      }
    } else {
      // Format normal (Rp 3.500.000)
      return new Intl.NumberFormat("id-ID", {
        style: style,
        currency: style === "currency" ? "IDR" : undefined,
        minimumFractionDigits: 0,
      }).format(harga);
    }
  };
  
  export default formatHarga;