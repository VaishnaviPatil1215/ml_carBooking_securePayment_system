🚗 DriveTime Adventures: ML-Powered Car Booking & Payment System

This project demonstrates a full-stack architecture where a Next.js frontend communicates with a Python Flask API to provide real-time, data-driven cost predictions and handles secure payment via Razorpay.

The project was migrated from a Firebase Studio prototype to a professional, decoupled environment, showcasing end-to-end integration skills.

💻 Tech Stack & Architecture

Layer

Technology

Purpose

Frontend/UI

Next.js (React), TypeScript, Tailwind CSS

User interface and handling client-side Razorpay checkout.

Prediction Layer

Python 3.x, Scikit-learn, Joblib

Hosts a Random Forest Regression Model for cost calculation.

Backend/API

Flask, Flask-CORS, Python-dotenv

Serves REST endpoints for ML prediction, Razorpay order creation, and signature verification.

Payment Gateway

Razorpay SDK

Manages secure, compliant payment processing (Test Mode configured).

Tools

Git/GitHub, Virtual Environments (venv)

Version control and dependency isolation.

🛠️ Project Setup (Local Development)

This application requires two separate processes running concurrently: the Frontend (Next.js) and the Backend API (Python).

Prerequisites

Node.js & npm (for Next.js)

Python 3.x & pip (for Flask/ML)

Razorpay Test Keys (in the .env file)

1. Backend Setup (ML & Payment API - Port 5000)

Navigate to Backend:

cd backend


Activate Environment & Install:

.\venv\Scripts\activate # Windows PowerShell
pip install -r requirements.txt


Configure Keys: Ensure your Razorpay Test Keys are in the .env file within this directory (backend/.env).

RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_SECRET_HERE"


Start the Server:

python api_server.py


(Keep this terminal running during development.)

2. Frontend Setup (Next.js - Port 3000)

Open a New Terminal Tab and navigate to the Next.js root:

cd frontend


Start Frontend:

npm run dev


3. Testing the Full Flow

Open your browser to the Next.js address (http://localhost:9002/).

Click "Predict Final Cost" to trigger the ML API call.

Click "Book & Pay Now" to open the Razorpay popup.

Use the Test Card (5123 4567 8901 2346) and OTP (111111) to simulate a successful payment.