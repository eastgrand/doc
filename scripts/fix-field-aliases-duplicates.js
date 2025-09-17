#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'utils', 'field-aliases.ts');

console.log('Reading field-aliases.ts...');
const content = fs.readFileSync(filePath, 'utf8');

// Extract the object literal content
const objectStart = content.indexOf('export const FIELD_ALIASES: Record<string, string> = {');
const objectStartBrace = content.indexOf('{', objectStart);
const objectEnd = content.lastIndexOf('};');

const beforeObject = content.substring(0, objectStartBrace + 1);
const afterObject = content.substring(objectEnd);
const objectContent = content.substring(objectStartBrace + 1, objectEnd);

// Parse the key-value pairs
const lines = objectContent.split('\n');
const keyValueMap = new Map();
let currentComment = '';

console.log('Deduplicating entries...');
for (const line of lines) {
  const trimmedLine = line.trim();
  
  // Skip empty lines
  if (!trimmedLine) continue;
  
  // Handle comments
  if (trimmedLine.startsWith('//')) {
    currentComment = trimmedLine;
    continue;
  }
  
  // Parse key-value pairs
  const match = trimmedLine.match(/^"([^"]+)":\s*"([^"]+)",?$/);
  if (match) {
    const [, key, value] = match;
    if (!keyValueMap.has(key)) {
      keyValueMap.set(key, { value, comment: currentComment });
      currentComment = ''; // Reset after use
    } else {
      console.log(`Skipping duplicate key: "${key}"`);
    }
  }
}

// Reconstruct the object content
let newObjectContent = '\n';
let lastComment = '';

for (const [key, { value, comment }] of keyValueMap.entries()) {
  // Add comment if it's different from the last one
  if (comment && comment !== lastComment) {
    newObjectContent += `  ${comment}\n`;
    lastComment = comment;
  }
  
  newObjectContent += `  "${key}": "${value}",\n`;
}

// Remove trailing comma and add closing
newObjectContent = newObjectContent.replace(/,\n$/, '\n');

const newContent = beforeObject + newObjectContent + afterObject;

console.log('Writing deduplicated file...');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Fixed field-aliases.ts - removed ${content.length - newContent.length} characters of duplicates`);