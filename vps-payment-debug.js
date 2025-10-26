// Replace your VPS controllers/payment.js with this DEBUG version:
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  console.log('CREATE ORDER - Request received:', req.body);
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
      console.log('Invalid course name:', courseName);
      return res.status(400).json({ error: 'Invalid course name' });
    }

    const receipt = `course_${courseName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt,
      notes: { courseName, userEmail }
    };

    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order.id);
    
    const response = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName,
      price: amount
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error);
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  console.log('VERIFY PAYMENT - Request received:', req.body);
  console.log('VERIFY PAYMENT - Headers:', req.headers);
  
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseName,
      userEmail
    } = req.body;

    console.log('Verifying payment with:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? 'present' : 'missing'
    });

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    console.log('Signature verification:', {
      expected: expectedSign,
      received: razorpay_signature,
      match: expectedSign === razorpay_signature
    });

    if (razorpay_signature === expectedSign) {
      const response = { 
        success: true, 
        message: 'payment verified and recorded',
        paymentId: razorpay_payment_id 
      };
      console.log('VERIFY SUCCESS - Sending response:', response);
      res.json(response);
    } else {
      const response = { 
        success: false, 
        error: 'Payment verification failed' 
      };
      console.log('VERIFY FAILED - Sending response:', response);
      res.status(400).json(response);
    }
  } catch (error) {
    console.error('VERIFY PAYMENT ERROR:', error);
    const response = { 
      success: false, 
      error: 'Error verifying payment',
      details: error.message 
    };
    console.log('VERIFY ERROR - Sending response:', response);
    res.status(500).json(response);
  }
};

exports.handleWebhook = async (req, res) => {
  console.log('WEBHOOK - Request received');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('WEBHOOK - Payment successful');
    res.json({ status: 'ok' });
  } else {
    console.log('WEBHOOK - Invalid signature');
    res.status(400).json({ error: 'Invalid signature' });
  }
};