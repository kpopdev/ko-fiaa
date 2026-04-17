import express from 'express';

const app = express();

// Important: Parse both JSON and form-urlencoded (for Ko-fi)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const KO_FI_VERIFICATION_TOKEN = "bedba971-4f64-4d33-b3bb-a0af9b508e12"; // ← You can paste your real token here

// Nice info page when visiting the root URL
app.get('/', (req, res) => {
  res.send(`
    <h1>✅ Ko-fi JSON Webhook is Running</h1>
    <p><strong>Your webhook URL:</strong> https://kofi-json.onrender.com/webhook</p>
    <p>Check the <strong>Render Logs</strong> tab to see incoming data.</p>
  `);
});

app.post('/webhook', (req, res) => {
  let data = req.body;

  // Handle Ko-fi's form-urlencoded format (data=JSON string)
  if (data.data && typeof data.data === 'string') {
    try {
      data = JSON.parse(data.data);
    } catch (e) {
      console.log("Failed to parse Ko-fi data field");
    }
  }

  // Security check (optional but good)
  if (KO_FI_VERIFICATION_TOKEN && data.verification_token !== KO_FI_VERIFICATION_TOKEN) {
    console.log("❌ Invalid verification token");
    return res.status(403).send("Invalid token");
  }

  console.log("=== NEW KO-FI PAYLOAD RECEIVED ===");
  console.log(JSON.stringify(data, null, 2));

  if (data.is_subscription_payment) {
    console.log("\n✅ SUBSCRIPTION EVENT");
    console.log("New member?", data.is_first_subscription_payment ? "YES 🆕" : "NO (recurring)");
    console.log("Name:", data.from_name);
    console.log("Tier:", data.tier_name || "None");
    console.log("Amount:", data.amount, data.currency);
  } else {
    console.log("\n📦 This is a regular Donation (not a subscription)");
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → https://kofi-json.onrender.com/webhook`);
});
