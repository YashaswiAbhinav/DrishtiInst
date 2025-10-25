import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './config';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  getCoursePricing() {
    return {
      'Class 9th': parseInt(process.env.CLASS_9_PRICE || '2999'),
      'Class 10th': parseInt(process.env.CLASS_10_PRICE || '3999'),
      'Class 11th': parseInt(process.env.CLASS_11_PRICE || '4999'),
      'Class 12th': parseInt(process.env.CLASS_12_PRICE || '5999'),
    };
  }
}

export const paymentService = new PaymentService();