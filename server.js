import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const data = req.body;

  console.log("=== NEW KO-FI SUBSCRIPTION JSON ===");
  console.log(JSON.stringify(data, null, 2));   // ← This prints the full JSON nicely

  // Optional: Also show only subscription events
  if (data.is_subscription_payment) {
    console.log("\n✅ This is a subscription event!");
    console.log("New member?", data.is_first_subscription_payment ? "YES" : "NO (recurring)");
    console.log("Name:", data.from_name);
    console.log("Tier:", data.tier_name);
    console.log("Amount:", data.amount, data.currency);
  }

  // IMPORTANT: Always reply with 200 OK
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}/webhook`);
});
