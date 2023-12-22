import uvicorn
import os
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sentence_transformers import SentenceTransformer
import h5py
import gcsfs

PROJECT_NAME = 'UMKM-Culinary-Recommendation'
CREDENTIALS = 'cloud_admin_sa_key.json'
MODEL_PATH = 'gs://umkm-culinary-recommendation.appspot.com/recommend_restaurant (1).h5'
FS = gcsfs.GCSFileSystem(project=PROJECT_NAME, token=CREDENTIALS)

# Load the model during Docker build or initialization
with FS.open(MODEL_PATH, 'rb') as model_file:
    model_gcs = h5py.File(model_file, 'r')
    cnn_model = tf.keras.models.load_model(model_gcs)

# Load the dataset during Docker build or initialization
data = pd.read_csv('gs://umkm-culinary-recommendation.appspot.com/augmented_new_data.csv')
restaurant_names = data['Restaurant_Name']
label_encoder = LabelEncoder()
label_encoder.fit(restaurant_names)

model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')


app = FastAPI()

# CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# This endpoint is for a test (or health check) to this server
@app.get("/")
def index():
    return "Hello world from Kulinerku ML endpoint!"

# If your model needs text input, use this endpoint!
class RequestText(BaseModel):
    text: str
    
@app.post("/predict")
def predict_text(req: RequestText):
    try:
        # # Load preloaded objects from the pickle file
        # with open('preloaded_objects.pkl', 'rb') as file:
        #     model, cnn_model, data, label_encoder = pickle.load(file)

        # In here you will get text sent by the user
        text = req.text
        print("Uploaded text:", text)
        input_text = [text]

        # Ensure all new reviews are strings
        new_reviews = [str(text) for text in input_text]

        # Convert new reviews to embeddings
        encoded_review = model.encode(new_reviews)

        # Get predictions
        predicted_probabilities = cnn_model.predict(encoded_review)

        # Convert probabilities to class labels
        predicted_labels_encoded = predicted_probabilities.argmax(axis=-1)
        predicted_labels = label_encoder.inverse_transform(predicted_labels_encoded)
        predicted_rows = data[data['Restaurant_Name'].isin(predicted_labels)]

        unique_predicted_rows = predicted_rows.drop_duplicates(subset='Restaurant_Name')
        unique_predicted_rows = unique_predicted_rows[['Restaurant_Name', 'Rating', 'Address' ,'Price', 'Jalan', 'Daerah', 'Kecamatan', 'Review']]
        print("Predicted:", type(unique_predicted_rows))
        rows_dict = unique_predicted_rows.to_dict()
        
        flattened_result = {}
        for key, value in rows_dict.items():
            flattened_result[key] = list(value.values())[0]
        print("Flattened Result:", flattened_result)

        return flattened_result
    except Exception as e:
        print(e)
        return "Internal Server Error"
    
if __name__ == "__main__":
    port = os.environ.get("PORT", 8080)
    print(f"Listening to http://0.0.0.0:{port}")
    uvicorn.run(app, host='0.0.0.0', port=port)