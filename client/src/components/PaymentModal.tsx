import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

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
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      // Create order using server-side service
      const orderData = await courseService.createPaymentOrder(courseName, userEmail);

      // Prepare Razorpay options including server-generated order id
      const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || (window as any).VITE_RAZORPAY_KEY_ID || 'rzp_test_RWNpD510zwty8O';
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Drishti Institute',
        description: `Enrollment for ${courseName}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
            // Send to server verify endpoint so the server can validate signature and enroll the user
            const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            const verifyEndpointBase = (import.meta as any).env.VITE_PAYMENT_SERVER_URL || '';
            const verifyEndpoint = verifyEndpointBase
              ? `${verifyEndpointBase.replace(/\/$/, '')}/api/payment/verify`
              : '/api/payment/verify';

            const verifyResp = await fetch(verifyEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseName,
                userEmail
              })
            });

            if (!verifyResp.ok) {
              const text = await verifyResp.text();
              throw new Error(`Server verify failed: ${verifyResp.status} ${text}`);
            }

            const verifyJson = await verifyResp.json();
            if (verifyJson && verifyJson.success) {
              onPaymentSuccess(courseName);
              onClose();
            } else {
              throw new Error('Verification failed on server');
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

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Test Payment Info:</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <div><strong>Card:</strong> 4111 1111 1111 1111</div>
                    <div><strong>Expiry:</strong> Any future date</div>
                    <div><strong>CVV:</strong> Any 3 digits</div>
                    <div><strong>Name:</strong> Any name</div>
                  </div>
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
                  <div>Secure payment powered by Razorpay</div>
                  <div className="text-yellow-600 mt-1">Test Mode - No real money will be charged</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}