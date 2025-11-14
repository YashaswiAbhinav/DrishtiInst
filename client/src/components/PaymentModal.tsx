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
  paymentType?: string;
  subscriptionMonths?: number;
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
  paymentType = 'one-time',
  subscriptionMonths = 12,
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

      // Create order using server-side service with custom amount
      const orderData = await courseService.createPaymentOrder(courseName, userEmail, price);

      // Prepare Razorpay options including server-generated order id
      const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RWyjFVWqp4RTuh';
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
            const verifyEndpointBase = (import.meta as any).env.VITE_PAYMENT_SERVER_URL || 'https://payments.drishtinstitute.com';
            const verifyEndpoint = `${verifyEndpointBase.replace(/\/$/, '')}/api/payment/verify`;

            console.log('Calling verify endpoint:', verifyEndpoint);
            console.log('Verify payload:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature ? 'present' : 'missing',
              courseName,
              userEmail
            });
            
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
            
            console.log('Verify response status:', verifyResp.status);
            console.log('Verify response headers:', verifyResp.headers.get('content-type'));

            if (!verifyResp.ok) {
              const text = await verifyResp.text();
              console.log('Verify failed response text:', text.substring(0, 200));
              throw new Error(`Server verify failed: ${verifyResp.status} ${text.substring(0, 100)}`);
            }

            const verifyJson = await verifyResp.json();
            if (verifyJson && verifyJson.success) {
              // Save transaction to Firebase
              try {
                // Get real Firestore course document ID
                const realCourseId = await courseService.getCourseIdByName(courseName);
                
                await addDoc(collection(db, 'transactions'), {
                  amount: price,
                  courseID: realCourseId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  subscriptionMonths: subscriptionMonths,
                  timestamp: Date.now(),
                  userEmail: userEmail,
                  userName: auth.currentUser?.displayName || 'Unknown',
                  userId: auth.currentUser?.uid
                });
                console.log('Transaction saved to Firebase with real courseID:', realCourseId);
              } catch (error) {
                console.error('Failed to save transaction:', error);
              }
              
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
                    <Badge variant="secondary">
                      {paymentType === 'quarterly' ? '3 months' : 
                       paymentType === 'half-yearly' ? '6 months' : 
                       '12 months'} access
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete course access</li>
                    <li>• All video lectures</li>
                    <li>• Study materials</li>
                    <li>• Live Class Access</li>
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

                
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}