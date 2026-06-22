"""Genera el notebook de exploración y entrenamiento como .ipynb."""
import nbformat as nbf
from pathlib import Path

NB_PATH = Path(__file__).parent / "notebooks" / "01_eda_and_training.ipynb"

nb = nbf.v4.new_notebook()
nb.metadata = {
    "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
    "language_info": {"name": "python", "version": "3.11.0"},
}

cells = []

# ── Título ────────────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell(
    "# Telco Customer Churn — EDA y Entrenamiento\n\n"
    "Exploración del dataset, limpieza, análisis y entrenamiento del modelo de predicción de churn."
))

# ── 1. Imports ────────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 1. Imports"))
cells.append(nbf.v4.new_code_cell(
    "import pandas as pd\n"
    "import numpy as np\n"
    "import matplotlib.pyplot as plt\n"
    "import seaborn as sns\n"
    "import joblib\n"
    "import json\n"
    "from pathlib import Path\n"
    "from sklearn.model_selection import train_test_split\n"
    "from sklearn.pipeline import Pipeline\n"
    "from sklearn.compose import ColumnTransformer\n"
    "from sklearn.preprocessing import StandardScaler, OneHotEncoder\n"
    "from sklearn.ensemble import RandomForestClassifier\n"
    "from sklearn.metrics import (\n"
    "    accuracy_score, precision_score, recall_score,\n"
    "    f1_score, roc_auc_score, classification_report,\n"
    "    ConfusionMatrixDisplay, confusion_matrix,\n"
    ")\n\n"
    "sns.set_theme(style='whitegrid', palette='muted')\n"
    "%matplotlib inline\n\n"
    "ROOT = Path('..').resolve()\n"
    "DATA_PATH   = ROOT / 'data'   / 'WA_Fn-UseC_-Telco-Customer-Churn.csv'\n"
    "MODELS_PATH = ROOT / 'models'"
))

# ── 2. Carga de datos ─────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 2. Carga y primera inspección"))
cells.append(nbf.v4.new_code_cell(
    "df = pd.read_csv(DATA_PATH)\n"
    "print(f'Filas: {df.shape[0]}   Columnas: {df.shape[1]}')\n"
    "df.head()"
))
cells.append(nbf.v4.new_code_cell(
    "df.dtypes"
))
cells.append(nbf.v4.new_code_cell(
    "df.isnull().sum()"
))

# ── 3. Limpieza ───────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell(
    "## 3. Limpieza\n\n"
    "`TotalCharges` viene como `object` en vez de `float`. "
    "Los clientes con `tenure = 0` tienen un espacio en blanco en esa columna "
    "(nunca pagaron nada), que hay que convertir a `0`."
))
cells.append(nbf.v4.new_code_cell(
    "# Clientes con TotalCharges en blanco\n"
    "blank_mask = df['TotalCharges'].str.strip() == ''\n"
    "print(f'Registros con TotalCharges en blanco: {blank_mask.sum()}')\n"
    "df[blank_mask][['customerID', 'tenure', 'MonthlyCharges', 'TotalCharges']].head()"
))
cells.append(nbf.v4.new_code_cell(
    "df['TotalCharges'] = pd.to_numeric(df['TotalCharges'].str.strip(), errors='coerce')\n"
    "df['TotalCharges'] = df['TotalCharges'].fillna(0.0)\n"
    "df['TotalCharges'].dtype"
))
cells.append(nbf.v4.new_code_cell(
    "df = df.drop(columns=['customerID'])\n"
    "df['Churn'] = (df['Churn'] == 'Yes').astype(int)\n"
    "print('Churn únicos:', df['Churn'].unique())"
))

# ── 4. EDA ────────────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 4. Análisis exploratorio"))
cells.append(nbf.v4.new_code_cell(
    "churn_counts = df['Churn'].value_counts()\n"
    "churn_rate   = df['Churn'].mean()\n"
    "print(f'No Churn: {churn_counts[0]}  ({1 - churn_rate:.1%})')\n"
    "print(f'Churn:    {churn_counts[1]}  ({churn_rate:.1%})')\n\n"
    "fig, ax = plt.subplots(figsize=(5, 4))\n"
    "ax.bar(['No Churn', 'Churn'], churn_counts.values, color=['#4C72B0', '#DD8452'])\n"
    "ax.set_title('Distribución de Churn')\n"
    "ax.set_ylabel('Clientes')\n"
    "for i, v in enumerate(churn_counts.values):\n"
    "    ax.text(i, v + 30, str(v), ha='center', fontweight='bold')\n"
    "plt.tight_layout()\n"
    "plt.show()"
))
cells.append(nbf.v4.new_code_cell(
    "fig, axes = plt.subplots(1, 3, figsize=(15, 4))\n\n"
    "for ax, col in zip(axes, ['tenure', 'MonthlyCharges', 'TotalCharges']):\n"
    "    df.groupby('Churn')[col].plot(kind='kde', ax=ax, legend=True)\n"
    "    ax.set_title(f'{col} por Churn')\n"
    "    ax.legend(['No Churn', 'Churn'])\n\n"
    "plt.tight_layout()\n"
    "plt.show()"
))
cells.append(nbf.v4.new_code_cell(
    "fig, axes = plt.subplots(2, 3, figsize=(16, 9))\n"
    "cat_preview = ['Contract', 'InternetService', 'PaymentMethod',\n"
    "               'TechSupport', 'OnlineSecurity', 'PaperlessBilling']\n\n"
    "for ax, col in zip(axes.flat, cat_preview):\n"
    "    ct = df.groupby(col)['Churn'].mean().sort_values(ascending=False)\n"
    "    ct.plot(kind='bar', ax=ax, color='#4C72B0')\n"
    "    ax.set_title(f'Churn rate por {col}')\n"
    "    ax.set_ylabel('Churn rate')\n"
    "    ax.set_xticklabels(ax.get_xticklabels(), rotation=30, ha='right')\n\n"
    "plt.tight_layout()\n"
    "plt.show()"
))

# ── 5. Features ───────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 5. Preparación de features"))
cells.append(nbf.v4.new_code_cell(
    "X = df.drop(columns=['Churn'])\n"
    "y = df['Churn']\n\n"
    "cat_cols = X.select_dtypes(include='object').columns.tolist()\n"
    "num_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()\n\n"
    "print(f'Numéricas  ({len(num_cols)}): {num_cols}')\n"
    "print(f'Categóricas ({len(cat_cols)}): {cat_cols}')"
))

# ── 6. Split ──────────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 6. Train / Test split"))
cells.append(nbf.v4.new_code_cell(
    "X_train, X_test, y_train, y_test = train_test_split(\n"
    "    X, y, test_size=0.2, random_state=42, stratify=y\n"
    ")\n"
    "print(f'Train: {len(X_train)}  |  Test: {len(X_test)}')\n"
    "print(f'Churn rate train: {y_train.mean():.2%}  |  test: {y_test.mean():.2%}')"
))

# ── 7. Modelo ─────────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell(
    "## 7. Modelo\n\n"
    "Pipeline: `StandardScaler` + `OneHotEncoder` → `RandomForestClassifier`.\n\n"
    "`class_weight='balanced'` para compensar el desbalance de clases (~27% churn)."
))
cells.append(nbf.v4.new_code_cell(
    "preprocessor = ColumnTransformer([\n"
    "    ('num', StandardScaler(), num_cols),\n"
    "    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),\n"
    "])\n\n"
    "pipeline = Pipeline([\n"
    "    ('preprocessor', preprocessor),\n"
    "    ('classifier', RandomForestClassifier(\n"
    "        n_estimators=200,\n"
    "        class_weight='balanced',\n"
    "        random_state=42,\n"
    "        n_jobs=-1,\n"
    "    )),\n"
    "])\n\n"
    "pipeline.fit(X_train, y_train)\n"
    "print('Entrenamiento completado')"
))

# ── 8. Evaluación ─────────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 8. Evaluación"))
cells.append(nbf.v4.new_code_cell(
    "y_pred = pipeline.predict(X_test)\n"
    "y_prob = pipeline.predict_proba(X_test)[:, 1]\n\n"
    "metrics = {\n"
    "    'accuracy':  accuracy_score(y_test, y_pred),\n"
    "    'precision': precision_score(y_test, y_pred),\n"
    "    'recall':    recall_score(y_test, y_pred),\n"
    "    'f1':        f1_score(y_test, y_pred),\n"
    "    'roc_auc':   roc_auc_score(y_test, y_prob),\n"
    "}\n\n"
    "for k, v in metrics.items():\n"
    "    print(f'{k:<12} {v:.4f}')"
))
cells.append(nbf.v4.new_code_cell(
    "print(classification_report(y_test, y_pred, target_names=['No Churn', 'Churn']))"
))
cells.append(nbf.v4.new_code_cell(
    "fig, ax = plt.subplots(figsize=(5, 4))\n"
    "ConfusionMatrixDisplay(\n"
    "    confusion_matrix(y_test, y_pred),\n"
    "    display_labels=['No Churn', 'Churn']\n"
    ").plot(ax=ax, colorbar=False, cmap='Blues')\n"
    "ax.set_title('Matriz de Confusión')\n"
    "plt.tight_layout()\n"
    "plt.show()"
))

# ── 9. Feature importance ─────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 9. Importancia de features"))
cells.append(nbf.v4.new_code_cell(
    "ohe_cols = pipeline.named_steps['preprocessor']\\\n"
    "    .named_transformers_['cat']\\\n"
    "    .get_feature_names_out(cat_cols).tolist()\n"
    "all_feature_names = num_cols + ohe_cols\n\n"
    "importances = pipeline.named_steps['classifier'].feature_importances_\n"
    "feat_imp = pd.Series(importances, index=all_feature_names).nlargest(15)\n\n"
    "fig, ax = plt.subplots(figsize=(8, 5))\n"
    "feat_imp.sort_values().plot(kind='barh', ax=ax, color='#4C72B0')\n"
    "ax.set_title('Top 15 features más importantes')\n"
    "ax.set_xlabel('Importancia')\n"
    "plt.tight_layout()\n"
    "plt.show()"
))

# ── 10. Guardar modelo ────────────────────────────────────────────────────────
cells.append(nbf.v4.new_markdown_cell("## 10. Guardar modelo"))
cells.append(nbf.v4.new_code_cell(
    "MODELS_PATH.mkdir(exist_ok=True)\n\n"
    "joblib.dump(pipeline, MODELS_PATH / 'churn_pipeline.pkl')\n\n"
    "metadata = {\n"
    "    'model_type': 'RandomForestClassifier',\n"
    "    'features': X.columns.tolist(),\n"
    "    'categorical_features': cat_cols,\n"
    "    'numerical_features': num_cols,\n"
    "    'metrics': {k: round(v, 4) for k, v in metrics.items()},\n"
    "    'target': 'Churn',\n"
    "    'classes': ['No Churn', 'Churn'],\n"
    "    'train_samples': len(X_train),\n"
    "    'test_samples': len(X_test),\n"
    "}\n\n"
    "with open(MODELS_PATH / 'model_metadata.json', 'w') as f:\n"
    "    json.dump(metadata, f, indent=2)\n\n"
    "print(f'Modelo guardado: {MODELS_PATH / \"churn_pipeline.pkl\"}')\n"
    "print(f'Metadata guardada: {MODELS_PATH / \"model_metadata.json\"}')"
))

nb.cells = cells

NB_PATH.parent.mkdir(exist_ok=True)
with open(NB_PATH, "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print(f"Notebook creado en: {NB_PATH}")
