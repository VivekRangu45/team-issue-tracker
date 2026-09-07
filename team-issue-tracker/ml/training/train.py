import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import random

# Ensure directories exist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'issues.csv')

def generate_synthetic_data():
    print("Generating synthetic/demo training data for project demonstration...")
    # This dataset is synthetic. Model performance depends heavily on training data quality.
    # A real labeled issue dataset should be used for production.
    # This ML module demonstrates the NLP classification pipeline.
    
    categories = ['BUG', 'FEATURE', 'DOCUMENTATION', 'SECURITY', 'PERFORMANCE', 'UI', 'OTHER']
    priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    
    data = []
    
    templates = {
        'BUG': [
            "The {} feature crashes when I try to {}.",
            "Getting a 500 internal server error on the {} page.",
            "Users cannot {} because of an exception in the {} module.",
            "{} button does not respond when clicked.",
            "There is a bug in the {} calculation.",
        ],
        'FEATURE': [
            "Please add a new {} to the dashboard.",
            "It would be great if users could {}.",
            "We need a way to export {} to PDF.",
            "Implement integration with {} for better workflows.",
            "Add a {} button on the main screen.",
        ],
        'DOCUMENTATION': [
            "Update the README to include instructions for {}.",
            "The API documentation for {} is outdated.",
            "Add a tutorial on how to use the {} feature.",
            "Fix the typo in the {} section of the user guide.",
            "Create a troubleshooting guide for {}.",
        ],
        'SECURITY': [
            "Vulnerability found in the {} dependency.",
            "Users can bypass the {} authentication step.",
            "SQL injection is possible in the {} search field.",
            "Tokens are exposed in the {} logs.",
            "Ensure {} is properly sanitized before rendering.",
        ],
        'PERFORMANCE': [
            "The {} page takes over 10 seconds to load.",
            "High CPU usage observed when running {}.",
            "Optimize the database query for {} retrieval.",
            "Memory leak suspected in the {} background job.",
            "Images on the {} screen are too large and slow down the app.",
        ],
        'UI': [
            "The {} modal is misaligned on mobile devices.",
            "Change the color of the {} button to match the brand.",
            "Text is overlapping in the {} component.",
            "Improve the contrast of the {} text for accessibility.",
            "The {} animation is jittery.",
        ],
        'OTHER': [
            "General feedback regarding the {} workflow.",
            "Question about the {} implementation.",
            "Need assistance with {} configuration.",
            "Please review the {} deployment plan.",
            "Miscellaneous updates to the {} repo.",
        ]
    }
    
    fillers = ["login", "payment", "dashboard", "report", "profile", "settings", "export", "import", "search", "upload"]
    
    for _ in range(500):
        cat = random.choice(categories)
        template = random.choice(templates[cat])
        
        if cat == 'SECURITY':
            pri = random.choice(['HIGH', 'CRITICAL'])
        elif cat == 'BUG':
            pri = random.choice(['MEDIUM', 'HIGH', 'CRITICAL'])
        elif cat == 'PERFORMANCE':
            pri = random.choice(['MEDIUM', 'HIGH'])
        elif cat in ['DOCUMENTATION', 'UI', 'OTHER']:
            pri = random.choice(['LOW', 'MEDIUM'])
        else:
            pri = random.choice(['LOW', 'MEDIUM', 'HIGH'])
            
        if random.random() < 0.1:
            pri = random.choice(priorities)
            
        fill1 = random.choice(fillers)
        fill2 = random.choice(fillers)
        
        try:
            desc = template.format(fill1, fill2)
        except IndexError:
            desc = template.format(fill1)
            
        data.append({
            'description': desc,
            'category': cat,
            'priority': pri
        })
        
    df = pd.DataFrame(data)
    df.to_csv(CSV_PATH, index=False)
    print(f"Saved {len(df)} synthetic records to {CSV_PATH}")
    return df

def train_and_evaluate(df):
    print("Training ML Models...")
    
    X = df['description']
    y_cat = df['category']
    y_pri = df['priority']
    
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    X_vec = vectorizer.fit_transform(X)
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl'))
    
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y_cat, test_size=0.2, random_state=42)
    cat_model = LogisticRegression(random_state=42, max_iter=1000)
    cat_model.fit(X_train, y_train)
    
    y_pred = cat_model.predict(X_test)
    print("\n--- Category Model Evaluation ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
    
    joblib.dump(cat_model, os.path.join(MODELS_DIR, 'category_model.pkl'))
    
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_vec, y_pri, test_size=0.2, random_state=42)
    pri_model = LogisticRegression(random_state=42, max_iter=1000)
    pri_model.fit(X_train_p, y_train_p)
    
    y_pred_p = pri_model.predict(X_test_p)
    print("\n--- Priority Model Evaluation ---")
    print(f"Accuracy:  {accuracy_score(y_test_p, y_pred_p):.4f}")
    print(f"Precision: {precision_score(y_test_p, y_pred_p, average='weighted', zero_division=0):.4f}")
    print(f"Recall:    {recall_score(y_test_p, y_pred_p, average='weighted', zero_division=0):.4f}")
    print(f"F1-Score:  {f1_score(y_test_p, y_pred_p, average='weighted', zero_division=0):.4f}")
    
    joblib.dump(pri_model, os.path.join(MODELS_DIR, 'priority_model.pkl'))
    print("\nTraining complete. Models saved to ml/models/")

if __name__ == "__main__":
    df = generate_synthetic_data()
    train_and_evaluate(df)
