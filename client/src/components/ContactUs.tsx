import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

interface ContactUsProps {
  onBack: () => void;
}

export default function ContactUs({ onBack }: ContactUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Get in Touch</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">drishtiinstitute1920@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+919288071920</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">
                        Drishti Institute<br />
                        1𝐬𝐭 𝐛𝐫𝐚𝐧𝐜𝐡: 𝐍𝐚𝐲𝐚 𝐛𝐚𝐳𝐚𝐫 , 𝐁𝐢𝐭𝐞𝐬𝐡𝐰𝐚𝐫 𝐩𝐮𝐬𝐭𝐚𝐤𝐚𝐥𝐚𝐲 𝐠𝐚𝐥𝐢
2𝐧𝐝 𝐛𝐫𝐚𝐧𝐜𝐡: 𝐆𝐮𝐥𝐭𝐞𝐫𝐚 𝐛𝐚𝐳𝐚𝐫, 𝐍𝐞𝐚𝐫 𝐒𝐚𝐫𝐬𝐰𝐚𝐭𝐢 𝐩𝐮𝐬𝐭𝐚𝐤𝐚𝐥𝐚𝐲
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Support</h4>
                  <p className="text-sm text-gray-600">
                    For technical support, course inquiries, or payment issues, 
                    please email us at drishtiinstitute1920@gmail.com or call during business hours.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}