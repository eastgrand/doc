#!/usr/bin/env node

/**
 * Add Centroids to ZIP Boundaries File
 * 
 * This script calculates polygon centroids for all ZIP code boundaries
 * and adds them to the existing zip_boundaries.json file for use in
 * competitive analysis visualizations.
 */

const fs = require('fs');
const path = require('path');

// Calculate polygon centroid using geometric center method
function calculatePolygonCentroid(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    console.warn('Invalid coordinates for centroid calculation');
    return [0, 0];
  }
  
  // Handle GeoJSON polygon structure - coordinates[0] is the outer ring
  const ring = coordinates[0];
  if (!ring || ring.length === 0) {
    console.warn('Empty coordinate ring for centroid calculation');
    return [0, 0];
  }
  
  // Calculate geometric centroid using the shoelace formula for better accuracy
  let area = 0;
  let centroidX = 0;
  let centroidY = 0;
  
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    
    const a = xi * yj - xj * yi;
    area += a;
    centroidX += (xi + xj) * a;
    centroidY += (yi + yj) * a;
  }
  
  area *= 0.5;
  
  if (Math.abs(area) < 1e-10) {
    // Fallback to arithmetic mean if area is too small
    let x = 0, y = 0, validPoints = 0;
    
    for (const coord of ring) {
      if (Array.isArray(coord) && coord.length >= 2 && 
          typeof coord[0] === 'number' && typeof coord[1] === 'number') {
        x += coord[0];
        y += coord[1];
        validPoints++;
      }
    }
    
    return validPoints > 0 ? [x / validPoints, y / validPoints] : [0, 0];
  }
  
  centroidX /= (6 * area);
  centroidY /= (6 * area);
  
  return [centroidX, centroidY];
}

// Validate that centroid is within reasonable bounds for Canadian coordinates
function validateCentroid(centroid, featureId) {
  const [lng, lat] = centroid;
  
  // Canadian bounds: roughly -141 to -52 longitude, 42 to 83 latitude
  if (lng < -150 || lng > -40 || lat < 40 || lat > 85) {
    console.warn(`Centroid for ${featureId} seems outside Canadian bounds: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
    return false;
  }
  
  return true;
}

async function addCentroidsToZipBoundaries() {
  console.log('🗺️  Adding Centroids to ZIP Boundaries File');
  console.log('=' .repeat(60));
  
  const boundariesPath = path.join(__dirname, '..', 'public', 'data', 'boundaries', 'zip_boundaries.json');
  const backupPath = path.join(__dirname, '..', 'public', 'data', 'boundaries', 'zip_boundaries_backup.json');
  
  try {
    // Check if file exists
    if (!fs.existsSync(boundariesPath)) {
      console.error('❌ ZIP boundaries file not found:', boundariesPath);
      process.exit(1);
    }
    
    console.log('📄 Loading ZIP boundaries file...');
    const boundariesData = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));
    
    if (!boundariesData.features || !Array.isArray(boundariesData.features)) {
      console.error('❌ Invalid boundaries file structure');
      process.exit(1);
    }
    
    console.log(`📊 Processing ${boundariesData.features.length} ZIP code boundaries...`);
    
    // Create backup
    console.log('💾 Creating backup...');
    fs.writeFileSync(backupPath, JSON.stringify(boundariesData, null, 2));
    
    let processedCount = 0;
    let errorCount = 0;
    let validCentroids = 0;
    
    // Process each feature
    boundariesData.features.forEach((feature, index) => {
      try {
        if (!feature.geometry || feature.geometry.type !== 'Polygon') {
          console.warn(`⚠️  Feature ${index} is not a polygon, skipping`);
          errorCount++;
          return;
        }
        
        // Calculate centroid
        const centroid = calculatePolygonCentroid(feature.geometry.coordinates);
        
        // Validate centroid
        const featureId = feature.properties?.ID || feature.properties?.GEOID || index;
        const isValid = validateCentroid(centroid, featureId);
        
        if (isValid) {
          validCentroids++;
        }
        
        // Add centroid to properties
        if (!feature.properties) {
          feature.properties = {};
        }
        
        feature.properties.centroid = {
          type: 'Point',
          coordinates: [
            Math.round(centroid[0] * 1000000) / 1000000, // Round to 6 decimal places
            Math.round(centroid[1] * 1000000) / 1000000
          ]
        };
        
        processedCount++;
        
        // Progress indicator
        if (processedCount % 500 === 0) {
          console.log(`⏳ Processed ${processedCount}/${boundariesData.features.length} features...`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing feature ${index}:`, error.message);
        errorCount++;
      }
    });
    
    // Save updated file
    console.log('💾 Saving updated boundaries file...');
    fs.writeFileSync(boundariesPath, JSON.stringify(boundariesData, null, 2));
    
    // Generate summary
    const fileStats = fs.statSync(boundariesPath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CENTROID PROCESSING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total features: ${boundariesData.features.length}`);
    console.log(`✅ Successfully processed: ${processedCount}`);
    console.log(`⚠️  Errors: ${errorCount}`);
    console.log(`🎯 Valid centroids: ${validCentroids}`);
    console.log(`📁 File size: ${fileSizeMB} MB`);
    console.log(`💾 Backup created: ${backupPath}`);
    
    if (validCentroids > boundariesData.features.length * 0.95) {
      console.log('🎉 Centroid calculation successful! Ready for competitive analysis.');
    } else {
      console.log('⚠️  Some centroids may be invalid. Review the warnings above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to process ZIP boundaries:', error);
    process.exit(1);
  }
}

// Run the script
addCentroidsToZipBoundaries().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 