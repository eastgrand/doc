#!/usr/bin/env python3

"""
Script to train a query classification model using TensorFlow
and Hugging Face's Transformers library.
"""

import os
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflowjs as tfjs
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification

# Configuration
TRAINING_DATA_PATH = "../data/query-classification-training.csv"
MODEL_OUTPUT_PATH = "../web_model"
BATCH_SIZE = 32
EPOCHS = 5
MAX_LENGTH = 128  # Max sequence length for tokenization
RANDOM_SEED = 42

# Set random seed for reproducibility
np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)

def main():
    print("Loading and preparing data...")
    
    # Load training data
    try:
        data = pd.read_csv(TRAINING_DATA_PATH)
        print(f"Loaded {len(data)} training examples")
    except Exception as e:
        print(f"Error loading training data: {e}")
        return
    
    # Encode labels (visualization types)
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(data["viz_type"])
    num_labels = len(label_encoder.classes_)
    
    # Save label mapping for later use in prediction
    label_mapping = {i: label for i, label in enumerate(label_encoder.classes_)}
    with open(os.path.join(MODEL_OUTPUT_PATH, "labels.txt"), "w") as f:
        for i, label in label_mapping.items():
            f.write(f"{i}\t{label}\n")
    
    # Split data into training and validation sets
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        data["query"].tolist(), 
        encoded_labels, 
        test_size=0.15,
        stratify=encoded_labels,
        random_state=RANDOM_SEED
    )
    
    print(f"Training set: {len(train_texts)} examples")
    print(f"Validation set: {len(val_texts)} examples")
    
    # Initialize tokenizer
    print("Initializing tokenizer...")
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    
    # Tokenize texts
    train_encodings = tokenizer(
        train_texts, 
        truncation=True, 
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="tf"
    )
    
    val_encodings = tokenizer(
        val_texts, 
        truncation=True, 
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="tf"
    )
    
    # Create TensorFlow datasets
    train_dataset = tf.data.Dataset.from_tensor_slices((
        dict(train_encodings),
        train_labels
    )).shuffle(1000).batch(BATCH_SIZE)
    
    val_dataset = tf.data.Dataset.from_tensor_slices((
        dict(val_encodings),
        val_labels
    )).batch(BATCH_SIZE)
    
    # Initialize model
    print(f"Initializing model with {num_labels} labels...")
    model = TFDistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased", 
        num_labels=num_labels
    )
    
    # Compile model
    optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)
    loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    metrics = [tf.keras.metrics.SparseCategoricalAccuracy('accuracy')]
    
    model.compile(
        optimizer=optimizer,
        loss=loss,
        metrics=metrics
    )
    
    # Train model
    print("Training model...")
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=EPOCHS
    )
    
    # Save model in TensorFlow.js format
    print(f"Saving model to {MODEL_OUTPUT_PATH}...")
    if not os.path.exists(MODEL_OUTPUT_PATH):
        os.makedirs(MODEL_OUTPUT_PATH)
    
    # Save model in TensorFlow format first
    tf_save_path = os.path.join(MODEL_OUTPUT_PATH, "tf_model")
    model.save_pretrained(tf_save_path)
    
    # Convert to TensorFlow.js format
    tfjs.converters.convert_tf_saved_model(
        tf_save_path,
        MODEL_OUTPUT_PATH
    )
    
    # Save tokenizer for use in JavaScript
    tokenizer.save_pretrained(os.path.join(MODEL_OUTPUT_PATH, "tokenizer"))
    
    print("Model training and saving complete!")
    
    # Report training metrics
    print("\nTraining metrics:")
    for epoch, acc in enumerate(history.history['accuracy']):
        val_acc = history.history['val_accuracy'][epoch]
        loss = history.history['loss'][epoch]
        val_loss = history.history['val_loss'][epoch]
        print(f"Epoch {epoch+1}: accuracy={acc:.4f}, val_accuracy={val_acc:.4f}, loss={loss:.4f}, val_loss={val_loss:.4f}")

if __name__ == "__main__":
    main() 