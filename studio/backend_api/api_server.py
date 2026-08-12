import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import razorpay 

# --- 1. Environment Variable Loading (CRUCIAL FIX) ---
# Load Razorpay keys from the .env file in the current directory (backend_api)
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path) 

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

# --- 2. Flask App Initialization ---
app = Flask(__name__)
CORS(app) 

# --- 3. ML Model Loading ---
# Path correction: .. moves up from backend_api to studio, then into ml_service
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_service', 'cost_prediction_model.joblib')
loaded_pipeline = None

try:
    abs_model_path = os.path.abspath(MODEL_PATH)
    loaded_pipeline = joblib.load(abs_model_path)
    print("✅ Machine Learning Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading ML Model. Check if file exists at: {abs_model_path}")
    print(f"Full Error: {e}")

# --- 4. Razorpay Client Initialization ---
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        # Initialize client with loaded keys
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        print("✅ Razorpay client initialized and ready for secure transactions.")
        print(f"   Using Key ID: {RAZORPAY_KEY_ID}")
    except Exception as e:
        print(f"❌ Razorpay Client initialization failed: {e}")
else:
    print("⚠️ WARNING: Razorpay keys are missing (RAZORPAY_KEY_ID or SECRET not found in .env). Payment endpoints will FAIL.")

# --- 5. Helper Function for Data Preparation (Handles Missing Parameters) ---
def prepare_input_data(data):
    """Prepares the 8 required input features for the ML model, filling in 6 defaults."""
    car_type = data.get('Car_Type')
    distance_km = data.get('Total_Distance_km')

    if not car_type or not distance_km:
        raise ValueError("Missing required inputs: Car_Type and Total_Distance_km.")
    
    # Calculate inferred Season Index based on the current month
    current_month = datetime.now().month
    if current_month in [12, 1, 2]: season_index = 3 # Peak/Holiday
    elif current_month in [6, 7, 8]: season_index = 2    # Mid/Summer
    else: season_index = 1                               # Low/Shoulder

    input_data = {
        'Car_Type': [car_type],
        'Total_Distance_km': [distance_km],
        'Duration_Days': [3],          # Default
        'Num_Passengers': [4],         # Default
        'Package_Level': ['Basic'],    # Default
        'Start_Region': ['City'],      # Default
        'Season_Index': [season_index],
        'Car_Age_Years': [2]           # Default
    }
    
    # Ensure DataFrame is created with correct column order and types
    df = pd.DataFrame(input_data)
    for col in ['Total_Distance_km', 'Duration_Days', 'Num_Passengers', 'Season_Index', 'Car_Age_Years']:
        df[col] = pd.to_numeric(df[col])
    
    return df

# --- API Endpoints ---

@app.route('/', methods=['GET'])
def health_check():
    """Root health check endpoint."""
    return jsonify({
        'status': 'online',
        'message': 'DriveTime Adventures ML & Payment API is running live!'
    }), 200

@app.route('/api/predict_cost', methods=['POST'])
def predict_cost_endpoint():
    """Endpoint to receive user input and return a predicted cost."""
    if loaded_pipeline is None:
        return jsonify({'error': 'ML Model not loaded on server.'}), 500
        
    try:
        data = request.get_json()
        input_df = prepare_input_data(data)
        predicted_price = loaded_pipeline.predict(input_df)[0]
        return jsonify({'predicted_cost': round(float(predicted_price), 2)}), 200 

    except Exception as e:
        print(f"Prediction processing error: {e}")
        return jsonify({'error': f'An error occurred during prediction: {str(e)}'}), 500

@app.route('/api/create_order', methods=['POST'])
def create_razorpay_order():
    """Endpoint to create a new order on Razorpay servers."""
    if razorpay_client is None:
        return jsonify({'error': 'Razorpay keys missing or client not initialized. Cannot create order.'}), 500

    try:
        data = request.get_json()
        amount_in_dollars = data.get('amount')
        
        if not amount_in_dollars or amount_in_dollars <= 0:
            raise ValueError("Invalid amount provided.")

        # Razorpay expects amount in the smallest unit (Paisa).
        amount_in_paisa = int(amount_in_dollars * 100)
        
        razorpay_data = {
            'amount': amount_in_paisa,  
            'currency': 'INR',  # Use INR for Indian Rupee
            'receipt': f'receipt_{int(datetime.now().timestamp())}'
        }

        order = razorpay_client.order.create(data=razorpay_data)
        
        return jsonify({
            'order_id': order['id'],
            'currency': order['currency'],
            'amount': order['amount'], 
            'key_id': RAZORPAY_KEY_ID 
        }), 200

    except Exception as e:
        print(f"Razorpay order creation error: {e}")
        return jsonify({'error': f'Failed to create Razorpay order: {str(e)}'}), 500


@app.route('/api/verify_payment', methods=['POST'])
def verify_razorpay_payment():
    """Endpoint to verify the payment signature from Razorpay (Secure step)."""
    if razorpay_client is None:
        return jsonify({'error': 'Razorpay client not initialized. Cannot verify payment.'}), 500

    try:
        data = request.get_json()
        razorpay_client.utility.verify_payment_signature(data)
        
        # Payment is verified and successful
        return jsonify({'status': 'success', 'message': 'Payment successfully verified and booking confirmed!'}), 200

    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'Payment verification failed: {str(e)}'}), 400

if __name__ == '__main__':
    print("Starting Flask API Server...")
    app.run(debug=True, port=5000)