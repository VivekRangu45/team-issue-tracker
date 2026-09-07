import os
import sys
import json
import joblib

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No description provided."}))
        sys.exit(1)
        
    description = sys.argv[1]
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    
    vec_path = os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl')
    cat_path = os.path.join(MODELS_DIR, 'category_model.pkl')
    pri_path = os.path.join(MODELS_DIR, 'priority_model.pkl')
    
    if not (os.path.exists(vec_path) and os.path.exists(cat_path) and os.path.exists(pri_path)):
        print(json.dumps({"error": "Models not found. Please train the models first."}))
        sys.exit(1)
        
    try:
        vectorizer = joblib.load(vec_path)
        cat_model = joblib.load(cat_path)
        pri_model = joblib.load(pri_path)
        
        # Transform input
        X = vectorizer.transform([description])
        
        # Predict Category
        cat_pred = cat_model.predict(X)[0]
        cat_prob = cat_model.predict_proba(X)[0]
        cat_conf = max(cat_prob)
        
        # Predict Priority
        pri_pred = pri_model.predict(X)[0]
        pri_prob = pri_model.predict_proba(X)[0]
        pri_conf = max(pri_prob)
        
        result = {
            "category": str(cat_pred),
            "priority": str(pri_pred),
            "category_confidence": round(float(cat_conf), 2),
            "priority_confidence": round(float(pri_conf), 2)
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
