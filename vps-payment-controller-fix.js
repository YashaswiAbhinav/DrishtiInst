// Replace your VPS payment controller with this:
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { courseName, userEmail } = req.body;
    
    const pricing = {
      'Class 9th': 2999,
      'Class 10th': 3999,
      'Class 11th': 4999,
      'Class 12th': 5999,
    };
    
    const amount = pricing[courseName];
    if (!amount) {
      return res.status(400).json({ error: 'Invalid course name' });
    }

    const receipt = `course_${courseName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt,
      notes: { courseName, userEmail }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName,
      price: amount
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseName,
      userEmail
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.json({ 
        success: true, 
        message: 'payment verified and recorded',
        paymentId: razorpay_payment_id 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error verifying payment' 
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Payment successful');
    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
};