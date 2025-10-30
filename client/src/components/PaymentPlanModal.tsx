import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Calendar } from 'lucide-react';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  monthlyPrice: number;
  userEmail: string;
  onPlanSelect: (paymentType: 'quarterly' | 'half-yearly' | 'one-time', amount: number, subscriptionMonths: number) => void;
}

export default function PaymentPlanModal({ 
  isOpen, 
  onClose, 
  courseName, 
  monthlyPrice, 
  userEmail, 
  onPlanSelect 
}: PaymentPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'quarterly' | 'half-yearly' | 'one-time' | null>(null);

  const isClass11 = courseName.includes('Class_11');
  const isClass12 = courseName.includes('Class_12');
  const baseAmount = monthlyPrice * 12;
  
  console.log('PaymentPlanModal - Course:', courseName, 'Monthly:', monthlyPrice, 'Base:', baseAmount, 'IsClass11:', isClass11, 'IsClass12:', isClass12);

  // Calculate prices based on course level
  const calculatePrices = () => {
    if (isClass11) {
      return {
        quarterly: Math.round(baseAmount / 4),
        halfYearly: Math.round((baseAmount * 0.9) / 2),
        oneTime: Math.round(baseAmount * 0.8)
      };
    } else if (isClass12) {
      return {
        quarterly: Math.round(baseAmount / 4),
        halfYearly: Math.round((baseAmount * 0.91667) / 2),
        oneTime: Math.round(baseAmount * 0.83333)
      };
    }
    return {
      quarterly: Math.round(baseAmount / 4),
      halfYearly: Math.round(baseAmount / 2),
      oneTime: baseAmount
    };
  };

  const prices = calculatePrices();
  const savings = {
    halfYearly: isClass11 ? 10 : 8.333,
    oneTime: isClass11 ? 20 : 16.667
  };

  const plans = [
    {
      id: 'quarterly' as const,
      name: 'Quarterly',
      duration: '3 Months',
      price: prices.quarterly,
      subscriptionMonths: 3,
      savings: 0,
      icon: Clock,
      popular: false
    },
    {
      id: 'half-yearly' as const,
      name: 'Half-Yearly',
      duration: '6 Months',
      price: prices.halfYearly,
      subscriptionMonths: 6,
      savings: savings.halfYearly,
      icon: Calendar,
      popular: true
    },
    {
      id: 'one-time' as const,
      name: 'One-Time',
      duration: '12 Months',
      price: prices.oneTime,
      subscriptionMonths: 12,
      savings: savings.oneTime,
      icon: CheckCircle,
      popular: false
    }
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    onPlanSelect(plan.id, plan.price, plan.subscriptionMonths);
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
            <Card className="w-full max-w-2xl">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute right-2 top-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center">
                  Choose Your Payment Plan
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  {courseName} - Select the plan that works best for you
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all relative ${
                            selectedPlan === plan.id 
                              ? 'ring-2 ring-primary border-primary' 
                              : 'hover:shadow-md'
                          } ${plan.popular ? 'border-primary/50' : ''}`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          {plan.popular && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              Most Popular
                            </Badge>
                          )}
                          <CardContent className="p-4 text-center">
                            <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{plan.duration}</p>
                            <div className="mb-2">
                              <span className="text-2xl font-bold text-primary">
                                ₹{plan.price.toLocaleString()}
                              </span>
                            </div>
                            {plan.savings > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Save {plan.savings}%
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What's included:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete course access for selected duration</li>
                    <li>• All video lectures and materials</li>
                    <li>• Live class access</li>
                    <li>• Expert support</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const plan = plans.find(p => p.id === selectedPlan);
                      if (plan) handlePlanSelect(plan);
                    }}
                    disabled={!selectedPlan}
                    className="flex-1"
                    size="lg"
                  >
                    Continue with {selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : 'Selected'} Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    size="lg"
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