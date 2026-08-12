

// 'use client';

// import { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import {
//   Car as CarIcon,
//   Users,
//   GitCommit,
//   Sparkles,
//   MapPin,
//   User,
//   Check,
//   Loader2,
//   Euro, // Using Euro icon as a generic price placeholder in the UI
// } from 'lucide-react';

// import { cars } from '@/lib/data';
// import type { Car } from '@/lib/types';
// import { PlaceHolderImages } from '@/lib/placeholder-images';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Slider } from '@/components/ui/slider';
// import { useToast } from '@/hooks/use-toast';

// // --- CUSTOM ML/PAYMENT IMPORTS & CONFIG ---
// // Define API URL for the Flask Backend
// const API_BASE_URL = 'http://localhost:5000/api';

// // Function to load the Razorpay script dynamically
// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };
// // --- END CUSTOM CONFIG ---

// export function BookingForm() {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [selectedCar, setSelectedCar] = useState<Car | null>(cars[0]);
//   const [driverOption, setDriverOption] = useState<'driver' | 'self'>('self');

//   // distance is the key input for our ML model
//   const [distance, setDistance] = useState([100]);

//   // Original Dynamic Pricing State (keeping for UI but replacing logic)
//   const [demandFactor, setDemandFactor] = useState([1]);
//   const [seasonalityFactor, setSeasonalityFactor] = useState([1]);
//   const [competitorPrice, setCompetitorPrice] = useState([
//     selectedCar ? selectedCar.pricePerKm * 100 * 1.1 : 55,
//   ]);
//   const [dynamicPrice, setDynamicPrice] = useState<{
//     adjustedPrice: number;
//     explanation: string;
//   } | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   // --- NEW STATE FOR ML PREDICTION AND PAYMENT ---
//   const [predictedCost, setPredictedCost] = useState<number | null>(null);
//   const [isPaying, setIsPaying] = useState(false);
//   const [paymentMessage, setPaymentMessage] = useState('');
//   const [isPredictionMode, setIsPredictionMode] = useState(true);
//   // --- END NEW STATE ---

//   const basePrice = useMemo(() => {
//     if (!selectedCar) return 0;
//     const driverCost = driverOption === 'driver' ? 50 : 0;
//     return selectedCar.pricePerKm * distance[0] + driverCost;
//   }, [selectedCar, distance, driverOption]);

//   const finalPrice = predictedCost ? predictedCost : basePrice;

//   // --- NEW ML PREDICTION FUNCTION (Replaces handleAnalyzePrice) ---
//   const handlePredictML = async () => {
//     setPaymentMessage('');
//     setIsAnalyzing(true); // Reuse isAnalyzing for the loading state

//     if (!selectedCar) {
//       toast({ variant: 'destructive', title: 'Please select a car first.' });
//       setIsAnalyzing(false);
//       return;
//     }

//     try {
//       // 1. Prepare data (Car Type is the car's type property, e.g., 'SUV')
//       const response = await fetch(`${API_BASE_URL}/predict_cost`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           Car_Type: selectedCar.type, // Use the vehicle type property
//           Total_Distance_km: distance[0],
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || `Server Error: ${response.status}`);
//       }

//       const data = await response.json();
//       const cost = parseFloat(data.predicted_cost);

//       setPredictedCost(cost);

//       // Simulate the AI explanation for the UI display
//       setDynamicPrice({
//         adjustedPrice: cost,
//         explanation: `ML Model calculated price based on ${selectedCar.type} and ${distance[0]} km.`,
//       });

//       setPaymentMessage(`success: Final Cost: ₹ ${cost.toFixed(2)}. Click Book Now to proceed to payment.`);
//       setIsPredictionMode(false); // Enable payment flow

//     } catch (err) {
//       console.error('ML Prediction failed:', err);
//       const errorMessage = (err as Error).message.includes("Failed to fetch")
//         ? 'Connection Error. Is the Python API server running?'
//         : `Prediction Failed: ${(err as Error).message}`;

//       toast({ variant: 'destructive', title: 'Prediction Failed', description: errorMessage });
//       setPredictedCost(null);

//     } finally {
//       setIsAnalyzing(false);
//     }
//   };
//   // --- END NEW ML PREDICTION FUNCTION ---


//   // --- NEW RAZORPAY PAYMENT FUNCTION (Replaces the old handleBookNow) ---
//   const handlePayment = async () => {
//     if (!predictedCost) {
//       setPaymentMessage('error: Please calculate the price first.');
//       return;
//     }

//     setIsPaying(true);
//     setPaymentMessage('info: Creating secure payment order...');

//     const scriptLoaded = await loadRazorpayScript();
//     if (!scriptLoaded) {
//       setPaymentMessage('error: Razorpay SDK failed to load. Check network.');
//       setIsPaying(false);
//       return;
//     }

//     try {
//       // 1. Create Order ID via Python Backend
//       const orderResponse = await fetch(`${API_BASE_URL}/create_order`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount: predictedCost }), // Send the predicted cost
//       });

//       if (!orderResponse.ok) {
//         const errorData = await orderResponse.json();
//         throw new Error(errorData.error || 'Failed to create Razorpay Order.');
//       }

//       const orderData = await orderResponse.json();

//       // 2. Open Razorpay Checkout Popup
//       const options = {
//         key: orderData.key_id,
//         amount: orderData.amount, // Amount in Paisa
//         currency: orderData.currency,
//         name: "DriveTime Adventures",
//         description: `Booking for ${selectedCar?.name} (${distance[0]} km)`,
//         order_id: orderData.order_id,
//         handler: async (response: any) => {
//           // 3. Payment Verification
//           setPaymentMessage('info: Payment successful. Verifying signature...');

//           const verificationResponse = await fetch(`${API_BASE_URL}/verify_payment`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(response), // Send payment response for server-side verification
//           });

//           const verificationData = await verificationResponse.json();
//           if (verificationData.status === 'success') {
//             setPaymentMessage('success: Booking CONFIRMED! Payment verified successfully.');

//             // Redirect to confirmation page with final details
//             const params = new URLSearchParams({
//               carName: selectedCar!.name,
//               carType: selectedCar!.type,
//               distance: distance[0].toString(),
//               price: predictedCost.toFixed(2),
//             });
//             router.push(`/confirmation?${params.toString()}`);

//           } else {
//             setPaymentMessage(`error: Payment Verification FAILED: ${verificationData.error}.`);
//           }
//         },
//         prefill: {
//           name: "Guest User",
//           email: "guest@example.com",
//           contact: "9999999999"
//         },
//         theme: { color: "#3B82F6" }
//       };

//       // Open the payment modal
//       const paymentObject = new (window as any).Razorpay(options);
//       paymentObject.open();

//     } catch (err) {
//       console.error('Payment process failed:', err);
//       setPaymentMessage(`error: Payment setup failed: ${(err as Error).message}`);
//     } finally {
//       setIsPaying(false);
//     }
//   };
//   // --- END NEW RAZORPAY PAYMENT FUNCTION ---

//   // Temporarily replace the original handleAnalyzePrice with our ML prediction
//   const handleAnalyzePrice = handlePredictML;
//   const handleBookNow = handlePayment;


//   // JSX RENDERING STARTS HERE (All original code preserved)
//   const statusType = paymentMessage.split(':')[0];
//   const statusMessage = paymentMessage.split(':').slice(1).join(':').trim();


//   return (
//     <div className="space-y-8">
//       {/* --- ORIGINAL CARD 1: CHOOSE YOUR RIDE --- */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CarIcon className="text-primary" />
//             1. Choose Your Ride
//           </CardTitle>
//           <CardDescription>Select the perfect vehicle for your adventure.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <RadioGroup
//             value={selectedCar?.id}
//             onValueChange={(id) => {
//               setSelectedCar(cars.find((c) => c.id === id) || null);
//               setPredictedCost(null); // Reset prediction when car changes
//               setPaymentMessage(''); // Clear messages
//             }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
//           >
//             {cars.map((car) => {
//               const image = PlaceHolderImages.find((img) => img.id === car.imageId);
//               return (
//                 <Label
//                   key={car.id}
//                   htmlFor={car.id}
//                   className={cn(
//                     'block rounded-lg border-2 bg-card text-card-foreground shadow-sm cursor-pointer transition-all',
//                     selectedCar?.id === car.id
//                       ? 'border-primary ring-2 ring-primary'
//                       : 'border-border'
//                   )}
//                 >
//                   <RadioGroupItem value={car.id} id={car.id} className="sr-only" />
//                   {image && (
//                     <Image
//                       src={image.imageUrl}
//                       alt={image.description}
//                       data-ai-hint={image.imageHint}
//                       width={600}
//                       height={400}
//                       className="rounded-t-md aspect-video object-cover"
//                     />
//                   )}
//                   <div className="p-4">
//                     <h3 className="font-bold text-lg">{car.name}</h3>
//                     <p className="text-sm text-muted-foreground">{car.type}</p>
//                     <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
//                       <div className="flex items-center gap-2">
//                         <Users size={16} className="text-muted-foreground" />
//                         <span>{car.seats} Seats</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <GitCommit size={16} className="text-muted-foreground" />
//                         <span>{car.transmission}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </Label>
//               );
//             })}
//           </RadioGroup>
//         </CardContent>
//       </Card>

//       <div className="grid md:grid-cols-2 gap-8">
//         {/* --- ORIGINAL CARD 2: PLAN YOUR TRIP (Input Area) --- */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <MapPin className="text-primary" />
//               2. Plan Your Trip
//             </CardTitle>
//             <CardDescription>Specify your travel details.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-2">
//               <Label>Driver Option</Label>
//               <RadioGroup
//                 value={driverOption}
//                 onValueChange={(value: 'driver' | 'self') => { setDriverOption(value); setPredictedCost(null); setPaymentMessage(''); }}
//                 className="flex gap-4"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="self" id="self" />
//                   <Label htmlFor="self" className="flex items-center gap-2">
//                     <User size={16} /> Self-Drive
//                   </Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="driver" id="driver" />
//                   <Label htmlFor="driver" className="flex items-center gap-2">
//                     <Check size={16} /> With Driver (+$50)
//                   </Label>
//                 </div>
//               </RadioGroup>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="distance">Travel Distance: {distance[0]} km</Label>
//               <Slider
//                 id="distance"
//                 min={10}
//                 max={1000}
//                 step={10}
//                 value={distance}
//                 onValueChange={(val) => { setDistance(val); setPredictedCost(null); setPaymentMessage(''); }}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* --- ORIGINAL CARD 3: DYNAMIC PRICING (Now Prediction Trigger) --- */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Sparkles className="text-accent" />
//               3. Total Cost Prediction
//             </CardTitle>
//             <CardDescription>Our ML model calculates the final required price.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Keeping the original sliders in the UI for visual structure, though they don't affect our ML model */}
//             <div className="space-y-2 opacity-50 cursor-not-allowed">
//               <Label>Demand Factor: {demandFactor[0].toFixed(1)}x</Label>
//               <Slider min={0.5} max={2} step={0.1} value={demandFactor} onValueChange={setDemandFactor} disabled={true} />
//             </div>
//             <div className="space-y-2 opacity-50 cursor-not-allowed">
//               <Label>Seasonality: {seasonalityFactor[0].toFixed(1)}x</Label>
//               <Slider min={0.5} max={2} step={0.1} value={seasonalityFactor} onValueChange={setSeasonalityFactor} disabled={true} />
//             </div>
//             <div className="space-y-2 opacity-50 cursor-not-allowed">
//               <Label>Competitor Price: ${competitorPrice[0]}</Label>
//               <Slider min={50} max={500} step={10} value={competitorPrice} onValueChange={setCompetitorPrice} disabled={true} />
//             </div>
//             {/* The button now calls our new ML Prediction function */}
//             <Button onClick={handleAnalyzePrice} disabled={isAnalyzing || !selectedCar || isPaying} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
//               {isAnalyzing ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" size={16} />
//                   Calculating Price...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles size={16} className="mr-2" />
//                   Predict Final Cost
//                 </>
//               )}
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- FINAL CARD: TOTAL PRICE AND BUTTON (MODIFIED FOR PAYMENT) --- */}
//       <Card className="sticky bottom-4 z-10 shadow-2xl bg-primary text-primary-foreground">
//         <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
//           <div className='w-full space-y-2'>
//             {/* Status Message Display */}
//             {paymentMessage && (
//               <div className={`p-2 rounded-lg text-xs font-medium ${statusType === 'error' ? 'bg-red-100 text-red-700' :
//                 statusType === 'success' ? 'bg-green-100 text-green-700' :
//                   'bg-blue-100 text-blue-700'
//                 }`}>
//                 {statusMessage}
//               </div>
//             )}

//             {isAnalyzing ? (
//               <div className="flex items-center gap-2 text-lg">
//                 <Loader2 className="animate-spin" />
//                 <span>Finding the best deal for you...</span>
//               </div>
//             ) : predictedCost !== null ? (
//               <div>
//                 <p className="text-sm font-bold text-amber-300">ML Predicted Price:</p>
//                 <p className="text-sm opacity-90">{dynamicPrice?.explanation}</p>
//               </div>
//             ) : (
//               <p className="text-lg font-semibold">Ready to book your adventure?</p>
//             )}
//           </div>

//           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
//             <div className="text-center md:text-right">
//               <p className="text-sm opacity-80">Total Price</p>
//               <p className="text-3xl font-bold">
//                 {/* Display ML predicted price if available, otherwise display base price */}
//                 ₹{predictedCost !== null ? predictedCost.toFixed(2) : basePrice.toFixed(2)}
//               </p>
//             </div>

//             {/* The action button now triggers Payment, not routing */}
//             <Button
//               onClick={handleBookNow}
//               size="lg"
//               disabled={predictedCost === null || isPaying}
//               className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
//             >
//               {isPaying ?
//                 <Loader2 className="animate-spin mr-2" /> :
//                 <Euro size={16} className="mr-2" />
//               }
//               {isPaying ? 'Processing...' : 'Book & Pay Now'}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Car as CarIcon,
  Users,
  GitCommit,
  Sparkles,
  MapPin,
  User,
  Check,
  Loader2,
  DollarSign, // CHANGED: Using DollarSign icon for currency
} from 'lucide-react';

import { cars } from '@/lib/data';
import type { Car } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// --- CUSTOM ML/PAYMENT IMPORTS & CONFIG ---
// Define API URL for the Flask Backend (supports production environment variable)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Function to load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
// --- END CUSTOM CONFIG ---

export function BookingForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedCar, setSelectedCar] = useState<Car | null>(cars[0]);
  const [driverOption, setDriverOption] = useState<'driver' | 'self'>('self');

  // distance is the key input for our ML model
  const [distance, setDistance] = useState([100]);

  // Original Dynamic Pricing State (keeping for UI but replacing logic)
  const [demandFactor, setDemandFactor] = useState([1]);
  const [seasonalityFactor, setSeasonalityFactor] = useState([1]);
  const [competitorPrice, setCompetitorPrice] = useState([
    selectedCar ? selectedCar.pricePerKm * 100 * 1.1 : 55,
  ]);
  const [dynamicPrice, setDynamicPrice] = useState<{
    adjustedPrice: number;
    explanation: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- NEW STATE FOR ML PREDICTION AND PAYMENT ---
  const [predictedCost, setPredictedCost] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isPredictionMode, setIsPredictionMode] = useState(true);
  // --- END NEW STATE ---

  const basePrice = useMemo(() => {
    if (!selectedCar) return 0;
    const driverCost = driverOption === 'driver' ? 50 : 0;
    return selectedCar.pricePerKm * distance[0] + driverCost;
  }, [selectedCar, distance, driverOption]);

  const finalPrice = predictedCost ? predictedCost : basePrice;

  // --- NEW ML PREDICTION FUNCTION (Replaces handleAnalyzePrice) ---
  const handlePredictML = async () => {
    setPaymentMessage('');
    setIsAnalyzing(true); // Reuse isAnalyzing for the loading state

    if (!selectedCar) {
      toast({ variant: 'destructive', title: 'Please select a car first.' });
      setIsAnalyzing(false);
      return;
    }

    try {
      // 1. Prepare data (Car Type is the car's type property, e.g., 'SUV')
      const response = await fetch(`${API_BASE_URL}/predict_cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Car_Type: selectedCar.type, // Use the vehicle type property
          Total_Distance_km: distance[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      const cost = parseFloat(data.predicted_cost);

      setPredictedCost(cost);

      // Simulate the AI explanation for the UI display
      setDynamicPrice({
        adjustedPrice: cost,
        explanation: `ML Model calculated price based on ${selectedCar.type} and ${distance[0]} km.`,
      });

      setPaymentMessage(`success: Final Cost: $${cost.toFixed(2)}. Click Book Now to proceed to payment.`);
      setIsPredictionMode(false); // Enable payment flow

    } catch (err) {
      console.error('ML Prediction failed:', err);
      const errorMessage = (err as Error).message.includes("Failed to fetch")
        ? 'Connection Error. Is the Python API server running?'
        : `Prediction Failed: ${(err as Error).message}`;

      toast({ variant: 'destructive', title: 'Prediction Failed', description: errorMessage });
      setPredictedCost(null);

    } finally {
      setIsAnalyzing(false);
    }
  };
  // --- END NEW ML PREDICTION FUNCTION ---


  // --- NEW RAZORPAY PAYMENT FUNCTION (Replaces the old handleBookNow) ---
  const handlePayment = async () => {
    if (!predictedCost) {
      setPaymentMessage('error: Please calculate the price first.');
      return;
    }

    setIsPaying(true);
    setPaymentMessage('info: Creating secure payment order...');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentMessage('error: Razorpay SDK failed to load. Check network.');
      setIsPaying(false);
      return;
    }

    try {
      // 1. Create Order ID via Python Backend
      const orderResponse = await fetch(`${API_BASE_URL}/create_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: predictedCost }), // Send the predicted cost
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create Razorpay Order.');
      }

      const orderData = await orderResponse.json();

      // 2. Open Razorpay Checkout Popup
      const options = {
        key: orderData.key_id,
        amount: orderData.amount, // Amount in Paisa
        currency: orderData.currency, // INR
        name: "DriveTime Adventures",
        description: `Booking for ${selectedCar?.name} (${distance[0]} km)`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // 3. Payment Verification
          setPaymentMessage('info: Payment successful. Verifying signature...');

          const verificationResponse = await fetch(`${API_BASE_URL}/verify_payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response), // Send payment response for server-side verification
          });

          const verificationData = await verificationResponse.json();
          if (verificationData.status === 'success') {
            setPaymentMessage('success: Booking CONFIRMED! Payment verified successfully.');

            // Redirect to confirmation page with final details
            const params = new URLSearchParams({
              carName: selectedCar!.name,
              carType: selectedCar!.type,
              distance: distance[0].toString(),
              price: predictedCost!.toFixed(2), // Use predictedCost here
            });
            router.push(`/confirmation?${params.toString()}`);

          } else {
            setPaymentMessage(`error: Payment Verification FAILED: ${verificationData.error}.`);
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
          contact: "9999999999"
        },
        theme: { color: "#3B82F6" }
      };

      // Open the payment modal
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Payment process failed:', err);
      setPaymentMessage(`error: Payment setup failed: ${(err as Error).message}`);
    } finally {
      setIsPaying(false);
    }
  };
  // --- END NEW RAZORPAY PAYMENT FUNCTION ---

  // Temporarily replace the original handleAnalyzePrice with our ML prediction
  const handleAnalyzePrice = handlePredictML;
  const handleBookNow = handlePayment;


  // JSX RENDERING STARTS HERE (All original code preserved)
  const statusType = paymentMessage.split(':')[0];
  const statusMessage = paymentMessage.split(':').slice(1).join(':').trim();


  return (
    <div className="space-y-8">
      {/* --- ORIGINAL CARD 1: CHOOSE YOUR RIDE --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CarIcon className="text-primary" />
            1. Choose Your Ride
          </CardTitle>
          <CardDescription>Select the perfect vehicle for your adventure.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedCar?.id}
            onValueChange={(id) => {
              setSelectedCar(cars.find((c) => c.id === id) || null);
              setPredictedCost(null); // Reset prediction when car changes
              setPaymentMessage(''); // Clear messages
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cars.map((car) => {
              const image = PlaceHolderImages.find((img) => img.id === car.imageId);
              return (
                <Label
                  key={car.id}
                  htmlFor={car.id}
                  className={cn(
                    'block rounded-lg border-2 bg-card text-card-foreground shadow-sm cursor-pointer transition-all',
                    selectedCar?.id === car.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  )}
                >
                  <RadioGroupItem value={car.id} id={car.id} className="sr-only" />
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      data-ai-hint={image.imageHint}
                      width={600}
                      height={400}
                      className="rounded-t-md aspect-video object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{car.name}</h3>
                    <p className="text-sm text-muted-foreground">{car.type}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-muted-foreground" />
                        <span>{car.seats} Seats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit size={16} className="text-muted-foreground" />
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* --- ORIGINAL CARD 2: PLAN YOUR TRIP (Input Area) --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-primary" />
              2. Plan Your Trip
            </CardTitle>
            <CardDescription>Specify your travel details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Driver Option</Label>
              <RadioGroup
                value={driverOption}
                onValueChange={(value: 'driver' | 'self') => { setDriverOption(value); setPredictedCost(null); setPaymentMessage(''); }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self" className="flex items-center gap-2">
                    <User size={16} /> Self-Drive
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver" id="driver" />
                  <Label htmlFor="driver" className="flex items-center gap-2">
                    <Check size={16} /> With Driver (+$50)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Travel Distance: {distance[0]} km</Label>
              <Slider
                id="distance"
                min={10}
                max={1000}
                step={10}
                value={distance}
                onValueChange={(val) => { setDistance(val); setPredictedCost(null); setPaymentMessage(''); }}
              />
            </div>
          </CardContent>
        </Card>

        {/* --- ORIGINAL CARD 3: DYNAMIC PRICING (Now Prediction Trigger) --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              3. Total Cost Prediction
            </CardTitle>
            <CardDescription>Our ML model calculates the final required price.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Keeping the original sliders in the UI for visual structure, though they don't affect our ML model */}
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label>Demand Factor: {demandFactor[0].toFixed(1)}x</Label>
              <Slider min={0.5} max={2} step={0.1} value={demandFactor} onValueChange={setDemandFactor} disabled={true} />
            </div>
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label>Seasonality: {seasonalityFactor[0].toFixed(1)}x</Label>
              <Slider min={0.5} max={2} step={0.1} value={seasonalityFactor} onValueChange={setSeasonalityFactor} disabled={true} />
            </div>
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label>Competitor Price: ${competitorPrice[0]}</Label>
              <Slider min={50} max={500} step={10} value={competitorPrice} onValueChange={setCompetitorPrice} disabled={true} />
            </div>
            {/* The button now calls our new ML Prediction function */}
            <Button onClick={handleAnalyzePrice} disabled={isAnalyzing || !selectedCar || isPaying} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Calculating Price...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Predict Final Cost
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- FINAL CARD: TOTAL PRICE AND BUTTON (MODIFIED FOR PAYMENT) --- */}
      <Card className="sticky bottom-4 z-10 shadow-2xl bg-primary text-primary-foreground">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className='w-full space-y-2'>
            {/* Status Message Display */}
            {paymentMessage && (
              <div className={`p-2 rounded-lg text-xs font-medium ${statusType === 'error' ? 'bg-red-100 text-red-700' :
                statusType === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                {statusMessage}
              </div>
            )}

            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-lg">
                <Loader2 className="animate-spin" />
                <span>Finding the best deal for you...</span>
              </div>
            ) : predictedCost !== null ? (
              <div>
                <p className="text-sm font-bold text-amber-300">ML Predicted Price:</p>
                <p className="text-sm opacity-90">{dynamicPrice?.explanation}</p>
              </div>
            ) : (
              <p className="text-lg font-semibold">Ready to book your adventure?</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="text-center md:text-right">
              <p className="text-sm opacity-80">Total Price</p>
              <p className="text-3xl font-bold">
                {/* Display ML predicted price if available, otherwise display base price */}
                ${predictedCost !== null ? predictedCost.toFixed(2) : basePrice.toFixed(2)}
              </p>
            </div>

            {/* The action button now triggers Payment, not routing */}
            <Button
              onClick={handleBookNow}
              size="lg"
              disabled={predictedCost === null || isPaying}
              className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              {isPaying ?
                <Loader2 className="animate-spin mr-2" /> :
                <DollarSign size={16} className="mr-2" /> // CHANGED: Icon uses DollarSign
              }
              {isPaying ? 'Processing...' : 'Book & Pay Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}