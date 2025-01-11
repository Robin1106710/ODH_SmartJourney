import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import pickle

# Paths for training data
training_data_path = os.path.join("backend", "data", "description_training_data.csv")  # Ensure this file exists

# Verify the file existence
if not os.path.exists(training_data_path):
    print(f"File not found at: {training_data_path}")
    exit(1)
else:
    print(f"File found at: {training_data_path}")

def train_model():
    # Load the dataset
    print("Loading training dataset...")
    data = pd.read_csv(training_data_path)

    # Ensure the dataset has required columns
    if 'description' not in data.columns or 'category' not in data.columns:
        raise ValueError("Dataset must contain 'description' and 'category' columns.")

    # Preprocess data
    print("Preprocessing data...")
    X = data['description']
    y = data['category']

    # Convert text to numerical features using TF-IDF
    print("Vectorizing text data...")
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    X_tfidf = tfidf_vectorizer.fit_transform(X)

    # Split the data into training and testing sets
    print("Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X_tfidf, y, test_size=0.2, random_state=42)

    # Train a Logistic Regression classifier
    print("Training Logistic Regression model...")
    clf = LogisticRegression(max_iter=5000)  # Increase max_iter if convergence issues arise
    clf.fit(X_train, y_train)

    # Evaluate the model
    print("Evaluating the model...")
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Ensure the 'models' directory exists
    os.makedirs(os.path.join("backend", "models"), exist_ok=True)

    # Define paths for saving model and vectorizer
    model_path = os.path.join("backend", "models", "logistic_regression_model.pkl")
    vectorizer_path = os.path.join("backend", "models", "tfidf_vectorizer.pkl")

    # Save the trained model and TF-IDF vectorizer
    print("Saving model and vectorizer...")

    # Save model
    with open(model_path, 'wb') as model_file:
        pickle.dump(clf, model_file)

    # Save vectorizer
    with open(vectorizer_path, 'wb') as vectorizer_file:
        pickle.dump(tfidf_vectorizer, vectorizer_file)

    print("Model and vectorizer saved successfully!")

if __name__ == "__main__":
    train_model()
