const nodemailer = require("nodemailer");

async function sendAdminNotification(order) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${item.sellPrice}</td>
        </tr>
    `).join("");

    const html = `
    <div style="font-family:Arial, sans-serif;padding:20px;">
        <h2 style="color:#2E7D32;">🛒 New Order Received</h2>

        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${order.customer.name}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>City:</strong> ${order.customer.city}</p>
        <p><strong>Pincode:</strong> ${order.customer.pincode}</p>

        <h3 style="margin-top:20px;">Order Items:</h3>

        <table style="border-collapse:collapse;width:100%;margin-top:10px;">
            <thead>
                <tr style="background:#F4A300;color:white;">
                    <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div style="margin-top:20px;">
            <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
            <p><strong>Delivery:</strong> ₹${order.shipping}</p>
            <p style="font-size:18px;color:#2E7D32;">
                <strong>Total Paid: ₹${order.total}</strong>
            </p>
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: `"Kokan Meva" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,   // 👈 admin email from .env
        subject: `🛒 New Order - ₹${order.total}`,
        html: html
    });

    console.log("✅ Admin notification email sent");
}

module.exports = sendAdminNotification;