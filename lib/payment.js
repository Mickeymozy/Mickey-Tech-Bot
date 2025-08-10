module.exports = {
  version: "1.0.0",
  brandName: "Mickey-Tech",
  repoName: "Mickey-MD Private Repo",
  currency: "TZS",
  price: 60000, // total price in TZS
  supportPhone: "+255700000000",
  payment: {
    url: "https://pay.mickey-tech.com/repo/mickey-md", // Stripe/Paylink/etc.
    mpesa: { number: "07XXXXXXXX", name: "Mickdady" },
    tigopesa: { number: "065XXXXXXX", name: "Mickdady" },
    bank: {
      accountName: "Mickey Tech Ltd",
      accountNumber: "123456789",
      bankName: "CRDB Bank",
      swift: "CORUTZTZ"
    },
    qrImageUrl: "https://files.catbox.moe/226ufq.png" // invoice/QR/brand image
  }
};
