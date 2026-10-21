# Section V: Experimental Results and Discussion

## A. Experimental Setup and Cross-Validation Protocol

To evaluate the proposed multimodal deep learning and Explainable AI (XAI) screening framework for dyslexia, experiments were conducted using the standardized **ETDD70** ocular dataset [1] comprising 70 young participants (dyslexic and neurotypical cohorts) across 210 structured reading trials, combined with speech acoustic fluency and phonological cognitive features. 

To prevent optimistic bias and guarantee valid clinical generalization, all evaluations strictly enforced a **5-Fold Subject-Independent GroupKFold (`GroupKFold(n_splits=5)`)** cross-validation scheme. Subject IDs were treated as non-overlapping grouping identifiers across folds, ensuring that zero data leakage occurred between training and validation partitions. The primary evaluation metrics recorded across all five folds include Receiver Operating Characteristic Area Under the Curve (ROC-AUC), Classification Accuracy, Macro F1-Score, Sensitivity (True Positive Rate / Recall), and Specificity (True Negative Rate).

---

## B. Comparative Classifier Benchmark

Table I summarizes the cross-validation performance across four machine learning classifiers evaluated on the extracted multimodal feature representations (deep spatial-temporal ocular embeddings from 1D-CNN + Bi-LSTM, ocular biomechanical indices, acoustic speech fluency metrics, and cognitive working memory scores).

### TABLE I: 5-Fold GroupKFold Cross-Validation Performance Benchmark

| Model Architecture | ROC-AUC | Accuracy | Macro F1-Score | Sensitivity (Recall) | Specificity |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Proposed Screener)** | **0.985 ± 0.013** | **0.986 ± 0.012** | **0.983 ± 0.015** | **0.990 ± 0.019** | **0.980 ± 0.027** |
| LightGBM Classifier | 0.992 ± 0.013 | 0.986 ± 0.012 | 0.987 ± 0.011 | 0.981 ± 0.023 | 0.987 ± 0.027 |
| Random Forest (Baseline) | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 |
| Logistic Regression (Linear) | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 |

As detailed in Table I and illustrated in the multi-model ROC trajectory curves (*Figure 3*), gradient-boosted decision trees (XGBoost) demonstrated exceptional discriminative stability with a mean ROC-AUC of **0.985 ± 0.013** and high clinical sensitivity of **0.990 ± 0.019**, successfully identifying children exhibiting early indicators of developmental dyslexia while maintaining a high specificity of **0.980 ± 0.027** against false-positive categorization.

![Figure 3: Multi-Model ROC Curves](../paper_deliverables/figure_roc_curves.png)
*Figure 3. Receiver Operating Characteristic (ROC) curve comparison across 5-fold cross-validation.*

---

## C. Multimodal Intermediate Feature Fusion Efficacy

A key design hypothesis of ReadWise AI is that unimodal screening (e.g., eye tracking in isolation or acoustic ASR in isolation) remains prone to behavioral confounders such as momentary inattention, ambient acoustic noise, or environmental illumination shifts. Intermediate feature fusion resolves this limitation by jointly embedding:

1. **Spatial-Temporal Ocular Trajectories**: 32-dimensional latent representations extracted by the 1D-CNN + Bi-LSTM neural encoder capturing saccadic acceleration profiles and micro-fixation clustering.
2. **Biomechanical Ocular Indicators**: Total trial dwell duration ($T_{\text{dwell}}$), regressive saccade count ($N_{\text{regress}}$), mean fixation duration ($\bar{D}_{\text{fix}}$), and the progressive-to-regressive saccade trajectory ratio ($R_{\text{prog/reg}}$).
3. **Oral Reading Fluency & Acoustic Prosody**: Speech hesitation rate (pauses exceeding 500 ms per reading passage), word-per-minute (WPM) cadence, and acoustic phoneme decoding stability.
4. **Cognitive & Phonological Games**: Visual/auditory working memory retention and phoneme sound-blending accuracy.

The resulting multimodal representation provides mutually reinforcing biomarkers that allow the classifier to maintain robust sensitivity even when an individual modality experiences intermittent degradation.

---

## D. Dual Explainable AI (XAI) Interpretation

To bridge the gap between algorithmic prediction and educational practice, ReadWise AI incorporates dual-level explainability: **global interpretability via SHAP (SHapley Additive exPlanations)** and **local instance-level explainability via LIME (Local Interpretable Model-agnostic Explanations)**.

### 1) Global Feature Attribution (SHAP)
SHAP TreeExplainer was employed across the entire cohort to calculate game-theoretic attribution scores ($\phi_i$) for each biometric feature (*Figure 4*).

![Figure 4: SHAP Global Feature Importance](../paper_deliverables/figure_shap_global_summary.png)
*Figure 4. Global SHAP summary beeswarm plot illustrating feature distributions and directional risk impact.*

The global analysis reveals distinct pathophysiological signatures:
* **Elevated Regressive Saccades ($N_{\text{regress}}$)**: Emerges as the highest-ranking predictor ($\text{mean } |\text{SHAP}| > 0.18$). Children at risk of dyslexia consistently execute repetitive backward re-fixations over previously scanned text blocks.
* **Prolonged Dwell Duration & Fixation Latency**: High cumulative dwell time and extended mean fixation duration (>400 ms) correlate strongly with positive SHAP risk contributions, reflecting heightened cognitive processing overhead during visual orthographic decoding.
* **Speech Hesitation Frequency & Acoustic Pauses**: Inter-word hesitations exceeding 500 ms significantly increase the estimated risk score, capturing phonological retrieval bottlenecks.
* **Phonological Awareness & Working Memory**: High phoneme blending and memory scores act as protective factors, generating negative SHAP contributions that shift predictions toward the typical reader classification.

### 2) Local Instance Case Explanation (LIME)
For pediatric clinicians, special educators, and parents, population-level rankings must translate into actionable clarity for individual children. *Figure 5* demonstrates a LIME local explanation generated for a representative at-risk trial (Child Case #1009).

![Figure 5: LIME Local Case Explanation](../paper_deliverables/figure_lime_case_explanation.png)
*Figure 5. LIME local case attribution for an individual child reading trial showing specific risk-elevating and risk-mitigating features.*

In this individual evaluation:
* The screening model flagged the child with an estimated dyslexia risk of 78%.
* The LIME surrogate model transparently isolated the dominant drivers: 28 regressive saccades (contributing +0.21 to risk) and an elevated hesitation rate of 4.2 pauses/min (contributing +0.18).
* Conversely, stable cognitive working memory mitigated the risk score by -0.06.
* This transparent factor decomposition is directly embedded into the automated PDF Assessment Report (*Figure 2, Box 12*), which auto-generates structured, non-stigmatizing intervention suggestions (e.g., visual bimodal line-tracking software and phoneme segmentation drills).

---

## E. Practical Implementation & Privacy Guarantees

As deployed within the Flutter smartphone client and FastAPI inference backend:
1. **Edge-First Processing**: Front-facing camera gaze estimation and audio transcription are processed in ephemeral memory and discarded immediately following feature extraction, ensuring zero storage of raw pediatric video or audio streams.
2. **Non-Diagnostic Regulatory Boundary**: In strict alignment with medical device software ethics, ReadWise AI frames all outputs as *pre-diagnostic educational screening risk estimates* rather than clinical diagnoses. Formal medical disclaimers are enforced across all digital dashboards and downloadable clinical PDF reports.
