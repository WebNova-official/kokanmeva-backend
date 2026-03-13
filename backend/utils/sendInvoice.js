const nodemailer = require("nodemailer");

async function sendInvoice(order) {

    if (!order.customer || !order.customer.email) {
        console.log("❌ No recipient email found");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Generate product rows
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding:10px;border-bottom:1px solid #eee;">
                ${item.name}
            </td>
            <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
                ${item.quantity}
            </td>
            <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
                ₹${item.sellPrice}
            </td>
        </tr>
    `).join("");

    const html = `
    <div style="background:#FDF6EC;padding:40px 20px;font-family:Arial, sans-serif;">
        <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">

            <!-- HEADER -->
            <div style="background:#2E7D32;padding:20px;text-align:center;color:white;">
                <h1 style="margin:0;">🥭 Kokan Meva</h1>
                <p style="margin:5px 0 0;font-size:14px;">स्वाद कोकणचा</p>
            </div>

            <!-- BODY -->
            <div style="padding:30px;">

                <h2 style="color:#2E7D32;margin-top:0;">
                    Thank you for your order!
                </h2>

                <p style="font-size:14px;">
                    Hi <strong>${order.customer.name}</strong>,
                    <br><br>
                    Your order has been successfully placed.
                </p>

                <p style="font-size:14px;">
                    <strong>Order ID:</strong> ${order._id}
                </p>

                <!-- PRODUCT TABLE -->
                <table width="100%" style="border-collapse:collapse;margin-top:20px;font-size:14px;">
                    <thead>
                        <tr style="background:#F4A300;color:white;">
                            <th style="padding:10px;text-align:left;">Product</th>
                            <th style="padding:10px;text-align:center;">Qty</th>
                            <th style="padding:10px;text-align:right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- BILLING SUMMARY -->
                <div style="margin-top:25px;border-top:1px solid #eee;padding-top:15px;font-size:14px;">

                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span>Subtotal</span>
                        <span>₹${order.subtotal}</span>
                    </div>

                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span>Delivery Charges</span>
                        <span style="color:${order.shipping === 0 ? '#2E7D32' : '#000'};">
                            ${order.shipping === 0 ? 'FREE (₹0)' : `₹${order.shipping}`}
                        </span>
                    </div>

                    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;color:#2E7D32;margin-top:10px;">
                        <span>Total Paid</span>
                        <span>₹${order.total}</span>
                    </div>

                </div>

                <p style="margin-top:30px;font-size:13px;color:#777;">
                    Fresh flavors from Konkan, delivered to your doorstep ❤️
                </p>

            </div>

            <!-- FOOTER -->
            <div style="background:#1B3022;color:#ccc;padding:20px;text-align:center;font-size:12px;">
                © ${new Date().getFullYear()} Kokan Meva <br>
                Lonavala, Maharashtra <br>
                Contact: 80879 40030
            </div>

        </div>
    </div>
    `;

    await transporter.sendMail({
        from: `"Kokan Meva" <${process.env.EMAIL_USER}>`,
        to: order.customer.email,
        subject: "🥭 Order Confirmation - Kokan Meva",
        html: html
    });

    console.log("✅ Branded invoice email sent");
}

module.exports = sendInvoice;