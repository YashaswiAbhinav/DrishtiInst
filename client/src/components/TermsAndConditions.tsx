import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export default function TermsAndConditions({ onBack }: TermsAndConditionsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700">
                By accessing and using Drishti Institute's services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Course Access and Usage</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Course access is granted upon successful payment and email verification</li>
                <li>Content is for personal educational use only</li>
                <li>Sharing of course materials is strictly prohibited</li>
                <li>Course access is valid for the duration specified at purchase</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All payments are processed securely through Razorpay</li>
                <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
                <li>Payment must be completed to access course content</li>
                <li>We reserve the right to modify pricing with notice</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide accurate registration information</li>
                <li>Maintain confidentiality of account credentials</li>
                <li>Use the platform responsibly and lawfully</li>
                <li>Report any technical issues promptly</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Intellectual Property</h3>
              <p className="text-gray-700">
                All course content, including videos, materials, and assessments, are the intellectual property of Drishti Institute and are protected by copyright laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
              <p className="text-gray-700">
                Drishti Institute shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Contact Information</h3>
              <p className="text-gray-700">
                For questions about these Terms and Conditions, please contact us at support@drishtinstitute.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}