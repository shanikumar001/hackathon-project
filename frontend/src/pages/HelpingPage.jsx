import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ShoppingCart, Tractor, Phone, Mail } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen p-6 pt-[120px]">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-800 flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8" /> Help & Support
        </h1>
        <p className="text-gray-600 mt-2">
          Learn how to buy and sell crops easily on our agricultural marketplace.
        </p>
      </div>

      {/* Buyer & Farmer Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buyers Section */}
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2 mb-4">
              <ShoppingCart /> For Buyers
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Sign up or log in to your account.</li>
              <li>Browse available crops listed by farmers.</li>
              <li>Use filters to search by crop type, price, or location.</li>
              <li>Select the product and check details.</li>
              <li>Place order securely using available payment methods.</li>
              <li>Track your order from dashboard.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Farmers Section */}
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2 mb-4">
              <Tractor /> For Farmers
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Create your farmer account.</li>
              <li>Add crop details including quantity, price, and photos.</li>
              <li>Set availability and delivery options.</li>
              <li>Receive orders directly from buyers.</li>
              <li>Manage orders from your dashboard.</li>
              <li>Withdraw earnings securely.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold">How do I contact a farmer?</h3>
              <p className="text-gray-600">You can message farmers directly from the product page.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold">What payment methods are accepted?</h3>
              <p className="text-gray-600">We accept UPI, cards, and net banking.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold">How are deliveries managed?</h3>
              <p className="text-gray-600">Farmers can offer pickup or delivery options.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Section */}
<div className="mt-10">
  <h2 className="text-2xl font-semibold text-green-800 mb-4">
    Crop Pricing (Northeast India)
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Ginger</h3>
        <p className="text-gray-600">
          ₹30 – ₹60 per kg (seasonal fluctuation). In Mizoram, MSP procurement reached about ₹50/kg in 2025.
        </p>
      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Turmeric (Lakadong)</h3>
        <p className="text-gray-600">
          ₹120 – ₹200 per kg depending on quality and curcumin content.
        </p>
      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Large Cardamom</h3>
        <p className="text-gray-600">
          ₹900 – ₹1,400 per kg (varies by season and export demand).
        </p>
      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Bhoot Jolokia (King Chilli)</h3>
        <p className="text-gray-600">
          ₹250 – ₹600 per kg depending on freshness and market demand.
        </p>
      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Assam Tea (Leaf)</h3>
        <p className="text-gray-600">
          ₹180 – ₹350 per kg (varies by grade and auction rates).
        </p>
      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-green-700">Rice (Local Varieties)</h3>
        <p className="text-gray-600">
          ₹25 – ₹45 per kg depending on variety and district.
        </p>
      </CardContent>
    </Card>

  </div>

  <p className="text-sm text-gray-500 mt-4">
    *Prices are approximate and vary by season, quality, and mandi location.
  </p>
</div>

      {/* Contact Section */}
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">Need More Help?</h2>
        <div className="flex justify-center gap-6">
          <Button className="flex items-center gap-2">
            <Phone /> Call Support
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail /> Email Us
          </Button>
        </div>
      </div>
    </div>
  );
}