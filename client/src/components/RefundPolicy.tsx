import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface RefundPolicyProps {
  onBack: () => void;
}

export default function RefundPolicy({ onBack }: RefundPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cancellation and Refund Policy</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Refund Eligibility</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Refunds are available within 7 days of purchase</li>
                <li>Course content must not have been accessed for more than 20% of total duration</li>
                <li>Technical issues preventing course access are eligible for full refund</li>
                <li>Refund requests must be submitted through official channels</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Non-Refundable Situations</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Requests made after 7 days of purchase</li>
                <li>Courses where more than 20% content has been accessed</li>
                <li>Violation of terms and conditions</li>
                <li>Sharing of course materials with unauthorized users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Refund Process</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Step 1:</strong> Submit refund request to support@drishtinstitute.com</p>
                <p><strong>Step 2:</strong> Provide order details and reason for refund</p>
                <p><strong>Step 3:</strong> Our team will review within 2-3 business days</p>
                <p><strong>Step 4:</strong> Approved refunds processed within 5-7 business days</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Refund Methods</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Refunds will be processed to the original payment method</li>
                <li>Bank transfers may take 5-7 business days to reflect</li>
                <li>Credit card refunds typically appear within 3-5 business days</li>
                <li>Processing fees may be deducted as per payment gateway policies</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Cancellation Policy</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Users can cancel their enrollment within the refund period</li>
                <li>Course access will be revoked upon cancellation</li>
                <li>Downloaded materials must be deleted upon cancellation</li>
                <li>Partial refunds may apply based on usage</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Contact for Refunds</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@drishtinstitute.com<br />
                  <strong>Phone:</strong> +91 9876543210<br />
                  <strong>Business Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Dispute Resolution</h3>
              <p className="text-gray-700">
                Any disputes regarding refunds will be resolved through direct communication. 
                If unresolved, disputes will be subject to the jurisdiction of courts in India.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}