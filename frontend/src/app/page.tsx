
'use client';

import { useState, useEffect } from 'react';
import { BookingForm } from '@/components/booking-form';
import { Logo } from '@/components/icons';

export default function Home() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="py-4 px-4 sm:px-6 lg:px-8 bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              DriveTime Adventures
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <section className="text-center mb-10 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-3 text-primary">
              Your Journey, Your Way
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Select your perfect ride, choose your route, and let us handle the rest. Unforgettable adventures are just a click away.
            </p>
          </section>
          
          <BookingForm />
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t bg-card">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; {year} DriveTime Adventures. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
