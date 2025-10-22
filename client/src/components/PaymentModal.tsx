import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { courseService } from '@/services/courseService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  price: number;
  userEmail: string;
  onPaymentSuccess: (courseName: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  courseName, 
  price, 
  userEmail, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order using direct service
      const orderData = await courseService.createPaymentOrder(courseName, userEmail);

      // Initialize Razorpay
      const options = {
        key: "rzp_test_your_key_here", // Replace with actual Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Drishti Institute',
        description: `Enrollment for ${courseName}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment using direct service
            const verifyResult = await courseService.verifyPayment(courseName, response.razorpay_payment_id);
            
            if (verifyResult.success) {
              onPaymentSuccess(courseName);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-md">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute right-2 top-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Course Enrollment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">{courseName}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold text-primary">₹{price.toLocaleString()}</span>
                    <Badge variant="secondary">One-time payment</Badge>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete course access</li>
                    <li>• All video lectures</li>
                    <li>• Study materials</li>
                    <li>• Lifetime access</li>
                    <li>• Expert support</li>
                  </ul>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Processing...' : `Pay ₹${price.toLocaleString()}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Secure payment powered by Razorpay
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}