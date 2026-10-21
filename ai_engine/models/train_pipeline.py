import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupKFold, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report
import shap

logger = logging.getLogger(__name__)

DEFAULT_ETDD70_PATH = r"d:\dyslexia\ai_engine\data\etdd70\processed\etdd70_trials.csv"

FEATURE_COLUMNS = [
    'n_fix_trial',
    'sum_fix_dur_trial',
    'dwell_time_trial',
    'mean_fix_dur_trial',
    'n_sacc_trial',
    'sum_sacc_dur_trial',
    'mean_sacc_dur_trial',
    'mean_sacc_ampl_trial',
    'ratio_progress_regress_trial',
    'n_regress_trial',
    'n_progress_trial'
]

class ResearchPipeline:
    """
    Research Pipeline for ReadWise AI Dyslexia Risk Screening.
    
    Trained on the ETDD70 (Eye-Tracking Dyslexia Dataset, Zenodo record 13332134)
    comprising 70 children (35 dyslexic, 35 non-dyslexic) performing reading tasks.
    
    IMPORTANT CLINICAL AND ETHICAL NOTICE:
    - This model provides a screening risk estimate, NOT a clinical diagnosis.
    - Smartphone gaze estimates differ from laboratory eye-tracking; this
      model is designed for early-warning educational intervention and triage.
    - GroupKFold on subject_id is strictly applied to prevent subject-level data leakage.
    """

    def __init__(self, data_path=None):
        self.data_path = data_path or (DEFAULT_ETDD70_PATH if os.path.exists(DEFAULT_ETDD70_PATH) else None)
        self.best_model = None
        self.scaler = None
        self.explainer = None
        self.feature_names = FEATURE_COLUMNS

    def load_data(self):
        """
        Loads the ETDD70 dataset. If not found, falls back to documented synthetic demo data.
        """
        if self.data_path and os.path.exists(self.data_path):
            logger.info(f"Loading ETDD70 dataset from {self.data_path}")
            df = pd.read_csv(self.data_path)
            # Ensure label column name consistency
            if 'class_id' in df.columns and 'risk_label' not in df.columns:
                df['risk_label'] = df['class_id']
            return df
        
        logger.warning("ETDD70 data file not found. Generating SYNTHETIC DEMO DATA for pipeline validation only.")
        np.random.seed(42)
        n_samples = 500
        data = {
            'subject_id': np.repeat(np.arange(100), 5),
            'n_fix_trial': np.random.normal(180, 40, n_samples),
            'sum_fix_dur_trial': np.random.normal(90000, 20000, n_samples),
            'dwell_time_trial': np.random.normal(100000, 25000, n_samples),
            'mean_fix_dur_trial': np.random.normal(500, 80, n_samples),
            'n_sacc_trial': np.random.normal(180, 40, n_samples),
            'sum_sacc_dur_trial': np.random.normal(7000, 1500, n_samples),
            'mean_sacc_dur_trial': np.random.normal(38, 5, n_samples),
            'mean_sacc_ampl_trial': np.random.normal(85, 20, n_samples),
            'ratio_progress_regress_trial': np.random.normal(5.0, 1.8, n_samples),
            'n_regress_trial': np.random.normal(25, 10, n_samples),
            'n_progress_trial': np.random.normal(110, 20, n_samples),
        }
        df = pd.DataFrame(data)
        risk_prob = (
            (df['n_regress_trial'] * 0.3) +
            (df['dwell_time_trial'] / 1000 * 0.2) +
            (df['mean_fix_dur_trial'] * 0.3) -
            (df['ratio_progress_regress_trial'] * 10 * 0.2)
        )
        df['risk_label'] = (risk_prob > risk_prob.median()).astype(int)
        return df

    def evaluate_models(self, df):
        """
        Compares Logistic Regression, Random Forest, and XGBoost using GroupKFold
        to strictly prevent subject-level data leakage.
        """
        X = df[self.feature_names]
        y = df['risk_label']
        groups = df['subject_id']

        models = {
            "Logistic Regression": Pipeline([
                ('scaler', StandardScaler()),
                ('clf', LogisticRegression(max_iter=2000, random_state=42))
            ]),
            "Random Forest": RandomForestClassifier(
                n_estimators=100, max_depth=6, random_state=42
            ),
            "XGBoost": XGBClassifier(
                n_estimators=100, max_depth=4, eval_metric='logloss', random_state=42
            )
        }

        results = {name: {"roc_auc": [], "accuracy": []} for name in models.keys()}
        gkf = GroupKFold(n_splits=5)

        print("\n" + "="*70)
        print("Model Comparison via 5-Fold GroupKFold (Leakage Prevention)")
        print(f"Total Samples: {len(df)} | Unique Subjects: {df['subject_id'].nunique()}")
        print("="*70)

        for name, model in models.items():
            for train_idx, test_idx in gkf.split(X, y, groups=groups):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
                
                model.fit(X_train, y_train)
                y_prob = model.predict_proba(X_test)[:, 1]
                y_pred = model.predict(X_test)
                
                results[name]["roc_auc"].append(roc_auc_score(y_test, y_prob))
                results[name]["accuracy"].append(accuracy_score(y_test, y_pred))

        for name, metrics in results.items():
            auc_m, auc_s = np.mean(metrics["roc_auc"]), np.std(metrics["roc_auc"])
            acc_m, acc_s = np.mean(metrics["accuracy"]), np.std(metrics["accuracy"])
            print(f"{name:22s} | ROC-AUC: {auc_m:.3f} +/- {auc_s:.3f} | Accuracy: {acc_m:.3f} +/- {acc_s:.3f}")
        print("="*70 + "\n")

        # Train final production Random Forest model on full dataset
        print("Fitting final Random Forest screening model and initializing SHAP explainer...")
        self.best_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        self.best_model.fit(X, y)
        self.explainer = shap.TreeExplainer(self.best_model)
        
        # Save model
        save_dir = r"d:\dyslexia\ai_engine\models\saved_models"
        os.makedirs(save_dir, exist_ok=True)
        model_path = os.path.join(save_dir, "etdd70_rf_screener.joblib")
        joblib.dump({"model": self.best_model, "features": self.feature_names}, model_path)
        print(f"Saved trained screening model to: {model_path}")

    def explain_prediction(self, sample_features: pd.DataFrame):
        """
        Uses SHAP to explain a specific model prediction.
        """
        if not self.explainer or not self.best_model:
            raise ValueError("Model must be trained before explaining predictions.")
        
        shap_values = self.explainer.shap_values(sample_features)
        # Extract SHAP values for class 1 (dyslexia risk)
        if isinstance(shap_values, list):
            class_1_shap = shap_values[1][0]
        elif hasattr(shap_values, 'ndim') and shap_values.ndim == 3:
            class_1_shap = shap_values[0, :, 1]
        else:
            class_1_shap = shap_values[0]
        
        explanation = {}
        for idx, col in enumerate(sample_features.columns):
            explanation[col] = float(class_1_shap[idx])
            
        return explanation

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    pipeline = ResearchPipeline()
    df_data = pipeline.load_data()
    pipeline.evaluate_models(df_data)
    
    # Test SHAP explanation on a sample dyslexic risk child reading trial
    sample = df_data[FEATURE_COLUMNS].iloc[[4]] # Row index 4 is subject 1009 (dyslexic)
    print("\nSHAP Feature Attribution (Subject 1009 - Dyslexic Trial):")
    explanation = pipeline.explain_prediction(sample)
    for feat, val in sorted(explanation.items(), key=lambda x: abs(x[1]), reverse=True):
        direction = "+" if val > 0 else "-"
        print(f"  {feat:30s}: {direction}{abs(val):.4f} risk contribution")
