# 📘 ReadWise AI — Kaggle Parallel Training & Paper Deliverables Guide

This guide provides end-to-end instructions for training the complete multimodal deep learning architecture on Kaggle in parallel, with automatic checkpointing and paper-ready asset generation.

---

## 1. Overview of the 3 Parallel Notebooks

The architecture is split into three modular, independently executable notebooks located in [`d:\dyslexia\notebooks\`](file:///d:/dyslexia/notebooks/):

| Notebook | Focus Modality & Model | Key Outputs | Checkpoint File |
| :--- | :--- | :--- | :--- |
| **`01_cnn_lstm_gaze_training.ipynb`** | **Visual Eye-Tracking**: 1D-CNN + Bi-LSTM on raw fixation trajectories from ETDD70 | `best_cnn_lstm_gaze_model.pt`<br>`gaze_cnn_lstm_embeddings.csv` | `/kaggle/working/checkpoints/cnn_lstm_latest.pt` |
| **`02_speech_intelligence_wav2vec_training.ipynb`** | **Speech Intelligence**: Wav2Vec2 + Bi-LSTM with Attention on oral reading hesitation & fluency | `best_speech_fluency_model.pt`<br>`speech_intelligence_embeddings.csv` | `/kaggle/working/checkpoints/speech_checkpoint_latest.pt` |
| **`03_multimodal_fusion_xgboost_xai.ipynb`** | **Master Multimodal Fusion & XAI**: Intermediate feature fusion + XGBoost / Random Forest + SHAP & LIME | `figure_roc_curves.png` (300 DPI)<br>`figure_shap_global_summary.png`<br>`figure_lime_case_explanation.png`<br>`table1_conference_results.tex`<br>`multimodal_xgboost_screener.joblib` | `/kaggle/working/paper_results/cv_fold_checkpoint.csv` |

---

## 2. Dataset Preparation for Kaggle

You have **two options** to provide data to the notebooks:

### Option A (Automated — No manual upload needed)
All 3 notebooks have built-in automated fetch routines. If no dataset is mounted, they automatically download and extract the required files directly from Zenodo ([Record 13332134](https://zenodo.org/records/13332134)) into `/kaggle/working/data/`.

### Option B (Recommended for fast startup — 1-Time Kaggle Dataset Upload)
1. Go to [kaggle.com/datasets](https://www.kaggle.com/datasets) -> click **+ New Dataset**.
2. Title it: `etdd70-dyslexia-dataset`.
3. Upload the following files from your local machine:
   - `d:\dyslexia\ai_engine\data\etdd70\data.zip` (~127.5 MB)
   - `d:\dyslexia\ai_engine\data\etdd70\dyslexia_class_label.csv` (1.3 KB)
   - `d:\dyslexia\ai_engine\data\etdd70\processed\etdd70_trials.csv` (37 KB)
4. Click **Create**. Once created, you can attach this dataset to your Kaggle notebooks with one click (`+ Add Data` -> Select `etdd70-dyslexia-dataset`).

---

## 3. How to Launch and Run Parallel Training on Kaggle

### Step 1: Create 3 Separate Kaggle Notebooks
1. Go to [kaggle.com/code](https://www.kaggle.com/code) -> Click **+ New Notebook**.
2. In the top menu, click **File -> Upload Notebook**.
3. Upload [`01_cnn_lstm_gaze_training.ipynb`](file:///d:/dyslexia/notebooks/01_cnn_lstm_gaze_training.ipynb).
4. Repeat this in two separate browser tabs for:
   - [`02_speech_intelligence_wav2vec_training.ipynb`](file:///d:/dyslexia/notebooks/02_speech_intelligence_wav2vec_training.ipynb)
   - [`03_multimodal_fusion_xgboost_xai.ipynb`](file:///d:/dyslexia/notebooks/03_multimodal_fusion_xgboost_xai.ipynb)

### Step 2: Configure Accelerator Settings for Each Notebook
In the right-hand panel (**Notebook options**):
- **Accelerator**: Select **GPU T4 x2** (or GPU P100).
- **Internet**: Toggle **ON** (required to fetch Hugging Face models and packages).
- **Persistence**: Select **Variables and Files** (ensures your checkpoints and plots are preserved).

### Step 3: Run All Three in Parallel
Click **Run All** (`>>`) in each tab. Kaggle allows multiple GPU notebooks to run concurrently under your account quota.

---

## 4. How the Checkpoint & Resume System Works

If your connection drops, your browser closes, or Kaggle hits the 12-hour session limit, **your training progress is safe**:

1. **Automatic Snapshotting**:
   - Notebook 1 and 2 save full PyTorch model states, optimizer states, learning rate scheduler states, current fold index, and current epoch after every training epoch into `/kaggle/working/checkpoints/`.
   - Notebook 3 caches cross-validation fold metrics into `/kaggle/working/paper_results/cv_fold_checkpoint.csv`.
2. **Seamless Resume**:
   - When you re-open the notebook and click **Run All**, the script checks for existing checkpoint files.
   - If found, it outputs:
     ```text
     ==> Resuming from existing checkpoint at: /kaggle/working/checkpoints/cnn_lstm_latest.pt
     Resumed Fold 2 at Epoch 14
     ```
   - It skips completed folds and resumes training immediately without re-starting from zero.

---

## 5. Artifacts to Download for Your Conference Paper

Once Notebook 3 finishes execution, open the right-hand **Output** pane in Kaggle (`/kaggle/working/paper_results/`) and download the following generated files:

| File Name | Purpose in Conference Paper (`LITERATURE REVIEW 1_removed.pdf`) |
| :--- | :--- |
| `figure_roc_curves.png` | **Figure 3**: 300 DPI ROC Curves comparing CNN-LSTM, Speech Fluency, and XGBoost Fusion. |
| `figure_shap_global_summary.png` | **Figure 4**: Global feature attribution beeswarm plot validating explainability. |
| `figure_shap_bar_ranking.png` | **Figure 5**: Absolute feature impact rankings for discussion section. |
| `figure_lime_case_explanation.png` | **Figure 6**: Local explanation demonstrating transparent pediatric decision support. |
| `table1_conference_results.tex` | **Table I**: Complete LaTeX code for model comparison (AUC, Accuracy, Sensitivity, Specificity, F1). |
| `multimodal_xgboost_screener.joblib`| **Model Weights**: Deployed into the FastAPI backend for real-time mobile app scoring. |
