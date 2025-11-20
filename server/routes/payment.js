const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ==========================
// Purchase Schema
// ==========================
const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Number, required: true },
  templateTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  paymentIntentId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  purchaseDate: { type: Date, default: Date.now },
  metadata: { type: Object }
});

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

// ==========================
// JWT Authentication
// ==========================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ==========================
// CREATE PAYMENT INTENT
// ==========================
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, templateId, templateTitle } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    const userId = req.user.userId || req.user.id || req.user._id;

    // Prevent duplicate purchase
    const existingPurchase = await Purchase.findOne({
      userId,
      templateId,
      status: 'succeeded'
    });

    if (existingPurchase) {
      return res.status(400).json({
        error: 'You have already purchased this template',
        alreadyPurchased: true
      });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
        templateId: templateId.toString(),
        templateTitle: templateTitle || 'Premium Template'
      },
      description: `Purchase of ${templateTitle || 'Premium Template'}`,
      automatic_payment_methods: { enabled: true }
    });

    // Store purchase record
    const purchase = new Purchase({
      userId,
      templateId,
      templateTitle,
      amount,
      currency: 'usd',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      metadata: { clientSecret: paymentIntent.client_secret }
    });

    await purchase.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      purchaseId: purchase._id
    });

  } catch (error) {
    console.error('❌ Payment intent creation error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});


// ==========================
// CONFIRM PAYMENT (Updated)
// ==========================
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, templateId, simulateSuccess } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID required' });
    }

    const userId = req.user.userId || req.user.id || req.user._id;

    // Find purchase record
    const purchase = await Purchase.findOne({
      userId,
      paymentIntentId
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase record not found' });
    }

    // ------------------------------
    // SIMULATED SUCCESS (Test Mode)
    // ------------------------------
    if (simulateSuccess) {
      console.log(`✅ Test Mode: Simulating success for ${paymentIntentId}`);

      purchase.status = 'succeeded';
      await purchase.save();

      return res.json({
        success: true,
        message: 'Payment confirmed successfully (test mode)',
        purchase: {
          id: purchase._id,
          templateId: purchase.templateId,
          templateTitle: purchase.templateTitle,
          amount: purchase.amount,
          currency: purchase.currency,
          purchaseDate: purchase.purchaseDate
        }
      });
    }

    // ------------------------------
    // REAL STRIPE CHECK
    // ------------------------------
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      purchase.status = 'succeeded';
      await purchase.save();

      console.log(`✅ Stripe verified payment: ${paymentIntentId}`);

      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        purchase: {
          id: purchase._id,
          templateId: purchase.templateId,
          templateTitle: purchase.templateTitle,
          amount: purchase.amount,
          currency: purchase.currency,
          purchaseDate: purchase.purchaseDate
        }
      });
    }

    // Handle failed or cancelled
    if (paymentIntent.status === 'canceled' || paymentIntent.status === 'failed') {
      purchase.status = 'failed';
      await purchase.save();
    }

    return res.status(400).json({
      success: false,
      error: 'Payment not completed',
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
});


// ==========================
// GET USER PURCHASES
// ==========================
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const purchases = await Purchase.find({
      userId,
      status: 'succeeded'
    }).sort({ purchaseDate: -1 });

    const purchasedTemplateIds = purchases.map(p => p.templateId);

    res.json({
      success: true,
      purchases,
      purchasedTemplateIds,
      count: purchases.length
    });

  } catch (error) {
    console.error('❌ Fetch purchases error:', error);
    res.status(500).json({
      error: 'Failed to fetch purchases',
      message: error.message
    });
  }
});


// ==========================
// CHECK IF TEMPLATE IS PURCHASED
// ==========================
router.get('/check-purchase/:templateId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { templateId } = req.params;

    const purchase = await Purchase.findOne({
      userId,
      templateId: parseInt(templateId),
      status: 'succeeded'
    });

    res.json({
      isPurchased: !!purchase,
      purchase: purchase || null
    });

  } catch (error) {
    console.error('❌ Check purchase error:', error);
    res.status(500).json({
      error: 'Failed to check purchase status',
      message: error.message
    });
  }
});


// ==========================
// STRIPE WEBHOOK
// ==========================
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Webhook: Payment succeeded', paymentIntent.id);

        try {
          const purchase = await Purchase.findOne({
            paymentIntentId: paymentIntent.id
          });

          if (purchase) {
            purchase.status = 'succeeded';
            await purchase.save();
          }
        } catch (error) {
          console.error('❌ Error updating purchase:', error);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Webhook: Payment failed', failedPayment.id);

        try {
          const purchase = await Purchase.findOne({
            paymentIntentId: failedPayment.id
          });

          if (purchase) {
            purchase.status = 'failed';
            await purchase.save();
          }
        } catch (error) {
          console.error('❌ Error updating failed purchase:', error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

module.exports = router;
