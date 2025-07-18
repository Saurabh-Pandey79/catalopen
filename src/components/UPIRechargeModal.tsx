import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import qrCode from "@/components/ui/upi-qr.jpeg"; // Adjust if your path differs

interface Props {
  open: boolean;
  onClose: () => void;
  upiId: string;
  amount: number;
}

export default function UPIRechargeModal({ open, onClose, upiId, amount }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recharge via UPI</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <p>
            Send <strong>₹{amount}</strong> to this UPI ID:
          </p>

          <div className="text-base font-mono bg-gray-100 px-4 py-2 rounded text-purple-700">
            {upiId}
          </div>

          <Button variant="secondary" onClick={copyToClipboard} className="w-full">
            {copied ? "Copied!" : "Copy UPI ID"}
          </Button>

          {/* QR Code Image */}
          <div>
            <img
              src={qrCode}
              alt="UPI QR Code"
              className="mx-auto w-48 h-48 rounded-md border shadow-sm"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Once ₹{amount} payment is done, your account will be able to save and share catalogs within the next <strong>12 hours</strong> and for the next <strong>30 days</strong>.
          </p>

          <p className="text-xs text-gray-500">
            Make sure to include your email or phone in the payment remarks.
          </p>

          <Button onClick={onClose} variant="outline" className="w-full mt-2">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
