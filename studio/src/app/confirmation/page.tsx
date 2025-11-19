'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Car, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ConfirmationContent() {
  const searchParams = useSearchParams();

  const carName = searchParams.get('carName') || 'N/A';
  const carType = searchParams.get('carType') || 'N/A';
  const driverOption = searchParams.get('driverOption') || 'N/A';
  const distance = searchParams.get('distance') || '0';
  const price = searchParams.get('price') || '0.00';

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl text-center shadow-2xl">
        <CardHeader className="items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline">Booking Confirmed!</CardTitle>
          <p className="text-muted-foreground pt-2">
            Your adventure is about to begin. Here are your booking details.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-left">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">Booking Summary</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2"><Car size={16} /> Vehicle</span>
              <span className="font-bold">{carName} ({carType})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2"><User size={16} /> Driver</span>
              <span className="font-bold capitalize">{driverOption === 'driver' ? 'With Driver' : 'Self-Drive'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2"><MapPin size={16} /> Distance</span>
              <span className="font-bold">{distance} km</span>
            </div>
            <div className="flex items-center justify-between text-xl border-t pt-4 mt-2">
              <span className="text-muted-foreground">Total Price</span>
              <span className="font-bold text-primary">${parseFloat(price).toFixed(2)}</span>
            </div>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/">Book Another Trip</Link>
          </Button>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        A confirmation email has been sent to your inbox (Just kidding, this is a demo!).
      </p>
    </div>
  );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading confirmation...</div>}>
            <ConfirmationContent />
        </Suspense>
    )
}
