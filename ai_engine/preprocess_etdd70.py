import os
import glob
import pandas as pd
import numpy as np

DATA_DIR = r"d:\dyslexia\ai_engine\data\etdd70\extracted\data"
LABELS_PATH = r"d:\dyslexia\ai_engine\data\etdd70\dyslexia_class_label.csv"
OUTPUT_DIR = r"d:\dyslexia\ai_engine\data\etdd70\processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def preprocess_etdd70():
    print("Loading labels...")
    labels_df = pd.read_csv(LABELS_PATH)
    
    print("Parsing trial metrics...")
    metrics_files = glob.glob(os.path.join(DATA_DIR, "*_metrics.csv"))
    if not metrics_files:
        raise FileNotFoundError(f"No *_metrics.csv files found in {DATA_DIR}")
        
    trial_rows = []
    for f in metrics_files:
        df = pd.read_csv(f)
        # Extract whole-trial summary from row 0
        trial_info = df.iloc[0][[
            'sid', 'task', 'n_fix_trial', 'sum_fix_dur_trial', 'dwell_time_trial',
            'mean_fix_dur_trial', 'n_sacc_trial', 'sum_sacc_dur_trial',
            'mean_sacc_dur_trial', 'mean_sacc_ampl_trial', 'ratio_progress_regress_trial',
            'n_regress_trial', 'n_progress_trial'
        ]].to_dict()
        trial_rows.append(trial_info)

    trials_df = pd.DataFrame(trial_rows)
    merged_trials = pd.merge(trials_df, labels_df, left_on='sid', right_on='subject_id')
    merged_trials.sort_values(by=['subject_id', 'task'], inplace=True)
    
    trials_csv = os.path.join(OUTPUT_DIR, "etdd70_trials.csv")
    merged_trials.to_csv(trials_csv, index=False)
    print(f"Saved trial-level dataset to {trials_csv} ({len(merged_trials)} rows).")

    # Pivot to Subject-Level dataset (1 row per child across tasks)
    feature_cols = [
        'n_fix_trial', 'sum_fix_dur_trial', 'dwell_time_trial',
        'mean_fix_dur_trial', 'n_sacc_trial', 'sum_sacc_dur_trial',
        'mean_sacc_dur_trial', 'mean_sacc_ampl_trial', 'ratio_progress_regress_trial',
        'n_regress_trial', 'n_progress_trial'
    ]
    pivot_df = merged_trials.pivot(index='subject_id', columns='task', values=feature_cols)
    pivot_df.columns = [f"{task}_{col}" for col, task in pivot_df.columns]
    subject_df = pivot_df.join(labels_df.set_index('subject_id')[['class_id', 'label']]).reset_index()
    
    subject_csv = os.path.join(OUTPUT_DIR, "etdd70_subject_level.csv")
    subject_df.to_csv(subject_csv, index=False)
    print(f"Saved subject-level dataset to {subject_csv} ({len(subject_df)} rows).")

if __name__ == "__main__":
    preprocess_etdd70()
