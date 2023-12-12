document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      {
        id: 1,
        name: "Robusta Brazil",
        img: "1.jpg",
        price: 50000,
      },
      {
        id: 2,
        name: "Arabica Blend",
        img: "2.jpg",
        price: 55000,
      },
      {
        id: 3,
        name: "Gayo Blend",
        img: "3.jpg",
        price: 50000,
      },
      {
        id: 4,
        name: "Aceh Gayo",
        img: "4.jpg",
        price: 35000,
      },
      {
        id: 5,
        name: "Sumatera Mandheling",
        img: "5.jpg",
        price: 40000,
      },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // check apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // Jika belum ada / cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang sudah ada, check apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          // Jika Barang berbeda
          if (item.id != newItem.id) {
            return item;
          } else {
            // Jika barang sudah ada, tambah quantity dan sub total
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item yang mau diremove berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      // jika item lebih dari satu
      if (cartItem.quantity > 1) {
        // telusuri satu satu
        this.items = this.items.map((item) => {
          // jika bukan barang yang diclick
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // Jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id != id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// Form Validation
const checkoutButton = document.querySelector("#checkout-button");
checkoutButton.disabled = true;
const form = document.querySelector("#checkoutForm");
form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ketika tombol checkout diklik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    // console.log(token);
    // window.snap.pay(token);
    window.snap.pay(token, {
      onSuccess: function (result) {
        alert("payment success!");
        console.log("success");
        console.log(result);
      },
      onPending: function (result) {
        alert("wating your payment!");
        console.log("pending");
        console.log(result);
      },
      onError: function (result) {
        alert("payment failed!");
        console.log("error");
        console.log(result);
      },
      onClose: function () {
        alert("you closed the popup without finishing the payment");
        console.log("customer closed the popup without finishing the payment");
      },
    });
  } catch (err) {
    console.log(err.message);
  }
  // minta transaction token melalui ajax/fetch
});

// format pesan Whatsapp
const formatMessage = (obj) => {
  return `Data Customer
  Nama: ${obj.name}
  Email: ${obj.email}
  no HP: ${obj.phone}
Data Pesanan
${JSON.parse(obj.items).map(
  (item) => `${item.name}(${item.quantity} x ${rupiah(item.total)}) \n`
)}
Terima kasih.`;
};

// Konversi Ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
