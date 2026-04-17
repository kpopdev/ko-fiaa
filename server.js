import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const KO_FI_VERIFICATION_TOKEN = "bedba971-4f64-4d33-b3bb-a0af9b508e12"; // your token

// Store the latest subscription here
let latestSubscription = null;

app.get('/', (req, res) => {
  res.send(`
    <h1>✅ Ko-fi Webhook Running</h1>
    <p>Webhook URL: <strong>https://kofi-json.onrender.com/webhook</strong></p>
    <p>Get latest subscription: <a href="/latest">/latest</a></p>
  `);
});

// New endpoint for your Discord bot
app.get('/latest', (req, res) => {
  if (latestSubscription) {
    res.json(latestSubscription);   // ← Returns clean JSON
  } else {
    res.json({ message: "No subscription received yet" });
  }
});

app.post('/webhook', (req, res) => {
  let data = req.body;

  // Handle Ko-fi's form-urlencoded format
  if (data.data && typeof data.data === 'string') {
    try {
      data = JSON.parse(data.data);
    } catch (e) {}
  }

  if (KO_FI_VERIFICATION_TOKEN && data.verification_token !== KO_FI_VERIFICATION_TOKEN) {
    return res.status(403).send("Invalid token");
  }

  console.log("=== NEW KO-FI PAYLOAD RECEIVED ===");
  console.log(JSON.stringify(data, null, 2));

  // Save ONLY subscription events as "latest"
  if (data.is_subscription_payment === true) {
    latestSubscription = {
      timestamp: data.timestamp,
      type: data.type,
      from_name: data.from_name,
      amount: data.amount,
      currency: data.currency,
      tier_name: data.tier_name || "Default",
      is_first_subscription_payment: data.is_first_subscription_payment,
      message: data.message,
      email: data.email,
      discord_username: data.discord_username,
      full_payload: data   // keep everything if you need more fields
    };

    console.log("✅ Saved as latest subscription!");
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → https://kofi-json.onrender.com`);
  console.log(`   → Test latest data at: https://kofi-json.onrender.com/latest`);
});
