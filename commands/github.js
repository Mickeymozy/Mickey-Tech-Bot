const settings = require("../settings");
const axios = require("axios");

// Helper to format TZS with commas
const formatAmount = (num) => {
  try { return Number(num).toLocaleString("en-TZ"); } catch { return String(num); }
};

// Generate INV id + dates
const generateInvoiceMeta = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const id = `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issued = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const dueDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const due = `${dueDate.getFullYear()}-${pad(dueDate.getMonth() + 1)}-${pad(dueDate.getDate())}`;

  return { id, issued, due };
};

async function aliveCommand(sock, chatId, message) {
  try {
    const { id, issued, due } = generateInvoiceMeta();
    const buyer =
      (message && message.pushName) ||
      (message && message.key && message.key.participant) ||
      "Client";

    const itemLine = `• Access: ${settings.repoName} (private GitHub repo)`;
    const includes = [
      "Lifetime updates",
      "1 license (single deployment/instance)",
      "Basic support (7 days after purchase)"
    ]
      .map((x) => `  - ${x}`)
      .join("\n");

    const currency = settings.currency || "TZS";
    const amount = formatAmount(settings.price || 0);

    const header = `*INVOICE — ${settings.brandName}*`;
    const meta = [
      `*Invoice ID:* ${id}`,
      `*Issued:* ${issued}`,
      `*Due:* ${due}`,
      `*Billed To:* ${buyer}`
    ].join("\n");

    const items = [
      `*Item:*`,
      itemLine,
      includes,
      ``,
      `*Subtotal:* ${currency} ${amount}`,
      `*Fees:* ${currency} 0`,
      `*Total Due:* ${currency} ${amount}`
    ].join("\n");

    const payMethods = [
      settings.payment?.url ? `• Pay Link: ${settings.payment.url}` : null,
      settings.payment?.mpesa?.number
        ? `• M-Pesa (TZ): ${settings.payment.mpesa.number} (${settings.payment.mpesa.name})`
        : null,
      settings.payment?.tigopesa?.number
        ? `• Tigo Pesa: ${settings.payment.tigopesa.number} (${settings.payment.tigopesa.name})`
        : null,
      settings.payment?.bank?.accountNumber
        ? `• Bank: ${settings.payment.bank.bankName}\n  - Name: ${settings.payment.bank.accountName}\n  - Acc: ${settings.payment.bank.accountNumber}\n  - SWIFT: ${settings.payment.bank.swift || "-"}`
        : null
    ]
      .filter(Boolean)
      .join("\n");

    const afterPay = [
      `*After Payment:*`,
      `1) Send proof (screenshot/transaction ID).`,
      `2) Include your GitHub username.`,
      `3) You’ll receive repo access within 1–6 hours.`
    ].join("\n");

    const footer = `*Support:* ${settings.supportPhone || "-"}  •  *Ref:* ${id}`;

    const caption =
      `${header}\n\n` +
      `${meta}\n\n` +
      `${items}\n\n` +
      `*Payment Methods:*\n${payMethods}\n\n` +
      `${afterPay}\n\n` +
      `${footer}`;

    // Prefer QR/brand invoice image if available, else fallback to a simple text
    const imageUrl =
      settings.payment?.qrImageUrl ||
      "https://files.catbox.moe/226ufq.png";

    let messagePayload;

    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      messagePayload = {
        image: imageBuffer,
        caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363422552152940@newsletter",
            newsletterName: settings.repoName || "Private Repo",
            serverMessageId: -1
          }
        }
      };
    } catch {
      // Fallback to text if image fetch fails
      messagePayload = {
        text: caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      };
    }

    await sock.sendMessage(chatId, messagePayload, { quoted: message });

    // Optional: send a follow-up with a "Pay Now" URL button if you have a pay link
    if (settings.payment?.url) {
      await sock.sendMessage(
        chatId,
        {
          text: "Quick actions:",
          footer: `${settings.brandName} • ${id}`,
          templateButtons: [
            {
              index: 1,
              urlButton: {
                displayText: "Pay Now",
                url: settings.payment.url
              }
            },
            ...(settings.supportPhone
              ? [
                  {
                    index: 2,
                    callButton: {
                      displayText: "Call Support",
                      phoneNumber: settings.supportPhone
                    }
                  }
                ]
              : []),
            {
              index: 3,
              quickReplyButton: {
                displayText: "I Paid ✅",
                id: `PAID_CONFIRM_${id}`
              }
            }
          ]
        },
        { quoted: message }
      );
    }
  } catch (error) {
    console.error("Error in invoice command:", error);
    await sock.sendMessage(
      chatId,
      { text: "Invoice is ready. If you don’t see details, message support." },
      { quoted: message }
    );
  }
}

module.exports = aliveCommand;
