#!/usr/bin/env node

/**
 * Script to generate additional training data for ML query classification
 * by augmenting the existing examples with variations and synonyms.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Configuration
const INPUT_FILE = path.join(__dirname, '../data/query-classification-samples.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/query-classification-training.csv');
const AUGMENTATION_FACTOR = 5; // Generate 5x the original data

// Synonym maps for various terms
const synonyms = {
  show: ['display', 'visualize', 'present', 'reveal', 'exhibit', 'demonstrate', 'illustrate'],
  map: ['plot', 'chart', 'display', 'visualize', 'show'],
  income: ['earnings', 'salary', 'wages', 'revenue', 'pay', 'compensation'],
  distribution: ['spread', 'allocation', 'arrangement', 'dispersal', 'pattern'],
  correlation: ['relationship', 'connection', 'association', 'link', 'correspondence'],
  concentration: ['density', 'clustering', 'gathering', 'accumulation'],
  population: ['people', 'residents', 'inhabitants', 'citizens', 'demographic'],
  areas: ['regions', 'zones', 'locations', 'places', 'districts', 'neighborhoods'],
  crime: ['criminal activity', 'offenses', 'violations', 'illegal activity', 'lawbreaking'],
  education: ['learning', 'schooling', 'academic achievement', 'educational attainment'],
  trends: ['patterns', 'movements', 'changes', 'developments', 'progressions'],
  both: ['simultaneously', 'together', 'jointly', 'concurrently']
};

// Prefix variations
const prefixes = [
  'I want to', 
  'Can you', 
  'Please', 
  'I need to', 
  'Help me', 
  'I\'d like to',
  'Could you',
  ''  // Empty string for no prefix
];

// Suffix variations
const suffixes = [
  'please',
  'in my area',
  'on the map',
  'for my analysis',
  'for this project',
  ''  // Empty string for no suffix
];

// Function to replace a word with a synonym if available
function replaceSynonym(text) {
  // Split text into words
  const words = text.split(' ');
  
  // Randomly select a word to replace
  let replaceable = [];
  words.forEach((word, index) => {
    const lowerWord = word.toLowerCase();
    if (synonyms[lowerWord]) {
      replaceable.push(index);
    }
  });
  
  // If no replaceable words, return original text
  if (replaceable.length === 0) return text;
  
  // Pick a random replaceable word
  const replaceIndex = replaceable[Math.floor(Math.random() * replaceable.length)];
  const wordToReplace = words[replaceIndex].toLowerCase();
  
  // Replace with a random synonym
  const synonymList = synonyms[wordToReplace];
  const newWord = synonymList[Math.floor(Math.random() * synonymList.length)];
  
  // Preserve original capitalization
  if (words[replaceIndex][0] === words[replaceIndex][0].toUpperCase()) {
    words[replaceIndex] = newWord.charAt(0).toUpperCase() + newWord.slice(1);
  } else {
    words[replaceIndex] = newWord;
  }
  
  return words.join(' ');
}

// Function to add a random prefix
function addPrefix(text) {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return prefix ? `${prefix} ${text}` : text;
}

// Function to add a random suffix
function addSuffix(text) {
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return suffix ? `${text} ${suffix}` : text;
}

// Function to generate a variation of a query
function generateVariation(query) {
  let variation = query;
  
  // Apply each transformation with some probability
  if (Math.random() < 0.7) variation = replaceSynonym(variation);
  if (Math.random() < 0.3) variation = replaceSynonym(variation); // Sometimes replace twice
  if (Math.random() < 0.4) variation = addPrefix(variation);
  if (Math.random() < 0.3) variation = addSuffix(variation);
  
  return variation;
}

// Main function to process the input and generate augmented data
async function generateTrainingData() {
  const samples = [];
  
  // Read the input file
  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', (data) => samples.push(data))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`Read ${samples.length} base samples`);
  
  // Generate augmented data
  const augmentedData = [];
  
  // Add original samples
  samples.forEach(sample => {
    augmentedData.push({
      query: sample.query,
      viz_type: sample.viz_type
    });
    
    // Generate variations
    for (let i = 0; i < AUGMENTATION_FACTOR - 1; i++) {
      const variation = generateVariation(sample.query);
      augmentedData.push({
        query: variation,
        viz_type: sample.viz_type
      });
    }
  });
  
  console.log(`Generated ${augmentedData.length} training samples`);
  
  // Write to output file
  const csvWriter = createCsvWriter({
    path: OUTPUT_FILE,
    header: [
      { id: 'query', title: 'query' },
      { id: 'viz_type', title: 'viz_type' }
    ]
  });
  
  await csvWriter.writeRecords(augmentedData);
  console.log(`Data written to ${OUTPUT_FILE}`);
}

// Run the script
generateTrainingData().catch(err => {
  console.error('Error generating training data:', err);
  process.exit(1);
}); 