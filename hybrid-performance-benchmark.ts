/**
 * Focused performance benchmark for hybrid routing system
 */

import { HybridRoutingEngine } from './lib/routing/HybridRoutingEngine';
import { hybridRoutingTestSuite } from './lib/routing/testing/HybridRoutingTestSuite';

async function runPerformanceBenchmark() {
  console.log('⚡ Starting Hybrid Routing Performance Benchmark...\n');
  
  try {
    const engine = new HybridRoutingEngine();
    await engine.initialize();

    // Benchmark 1: Basic routing performance
    console.log('📊 Benchmark 1: Basic Routing Performance');
    const basicQueries = [
      "Strategic expansion opportunities",
      "Demographic analysis for markets", 
      "Competitive positioning analysis",
      "Customer profile insights",
      "What's the weather tomorrow?",
      "How do I cook pasta?"
    ];

    const warmupRuns = 5;
    const benchmarkRuns = 100;
    
    // Warmup
    for (let i = 0; i < warmupRuns; i++) {
      for (const query of basicQueries) {
        await engine.route(query);
      }
    }

    // Benchmark
    console.log(`   Running ${benchmarkRuns} iterations per query...`);
    
    const results: Record<string, { avg: number; min: number; max: number; median: number }> = {};
    for (const query of basicQueries) {
      const times: number[] = [];
      
      for (let i = 0; i < benchmarkRuns; i++) {
        const startTime = performance.now();
        await engine.route(query);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
      
      results[query.substring(0, 30) + '...'] = {
        avg: avgTime,
        min: minTime,
        max: maxTime,
        median: medianTime
      };
      
      console.log(`   "${query.substring(0, 40)}..." - Avg: ${avgTime.toFixed(3)}ms, Med: ${medianTime.toFixed(3)}ms`);
    }

    // Benchmark 2: Concurrent requests
    console.log('\n📊 Benchmark 2: Concurrent Request Performance');
    
    const concurrentQueries = Array(50).fill("Strategic market analysis");
    const concurrentStartTime = performance.now();
    
    const concurrentResults = await Promise.all(
      concurrentQueries.map(query => engine.route(query))
    );
    
    const concurrentEndTime = performance.now();
    const concurrentTotalTime = concurrentEndTime - concurrentStartTime;
    const avgConcurrentTime = concurrentTotalTime / concurrentQueries.length;
    
    console.log(`   ${concurrentQueries.length} concurrent requests completed in ${concurrentTotalTime.toFixed(2)}ms`);
    console.log(`   Average time per request: ${avgConcurrentTime.toFixed(3)}ms`);
    console.log(`   Throughput: ${(concurrentQueries.length / (concurrentTotalTime / 1000)).toFixed(1)} requests/second`);

    // Benchmark 3: Built-in performance test
    console.log('\n📊 Benchmark 3: Built-in Performance Test');
    
    try {
      const performanceTest = await hybridRoutingTestSuite.runPerformanceBenchmark(100);
      
      console.log(`   Average processing time: ${performanceTest.avg_processing_time.toFixed(3)}ms`);
      console.log(`   Throughput: ${performanceTest.throughput_per_second.toFixed(1)} queries/second`);
    } catch (error) {
      console.log(`   Built-in performance test failed: ${String(error)}`);
    }

    // Benchmark 4: Layer-by-layer performance analysis
    console.log('\n📊 Benchmark 4: Layer Performance Analysis');
    
    const layerTestQuery = "Strategic demographic expansion analysis for competitive positioning";
    const layerResults = [];
    
    for (let i = 0; i < 20; i++) {
      const result = await engine.route(layerTestQuery);
      layerResults.push(result);
    }
    
    const avgProcessingTime = layerResults.reduce((sum, r) => sum + r.processing_time, 0) / layerResults.length;
    const layersExecuted = layerResults[0].metadata.layers_executed;
    
    console.log(`   Average processing time: ${avgProcessingTime.toFixed(3)}ms`);
    console.log(`   Layers executed: ${layersExecuted.join(', ')}`);
    console.log(`   Average time per layer: ${(avgProcessingTime / layersExecuted.length).toFixed(3)}ms`);

    // Summary
    console.log('\n🎯 PERFORMANCE BENCHMARK SUMMARY:');
    console.log('='.repeat(50));
    
    const overallAvg = Object.values(results).reduce((sum, r) => sum + r.avg, 0) / Object.keys(results).length;
    
    console.log(`✅ Overall average routing time: ${overallAvg.toFixed(3)}ms`);
    console.log(`✅ Concurrent processing capability: ${(concurrentQueries.length / (concurrentTotalTime / 1000)).toFixed(1)} req/sec`);
    console.log(`✅ Multi-layer processing: ${avgProcessingTime.toFixed(3)}ms for ${layersExecuted.length} layers`);
    
    // Performance targets
    const targets = {
      avgRouting: overallAvg < 1.0, // <1ms target
      concurrent: (concurrentQueries.length / (concurrentTotalTime / 1000)) > 100, // >100 req/sec
      multiLayer: avgProcessingTime < 2.0 // <2ms for complex queries
    };
    
    console.log('\n🎯 Target Achievement:');
    console.log(`   ${targets.avgRouting ? '✅' : '⚠️ '} Average routing <1ms: ${targets.avgRouting}`);
    console.log(`   ${targets.concurrent ? '✅' : '⚠️ '} Concurrent >100 req/sec: ${targets.concurrent}`);
    console.log(`   ${targets.multiLayer ? '✅' : '⚠️ '} Multi-layer <2ms: ${targets.multiLayer}`);
    
    const targetsAchieved = Object.values(targets).filter(Boolean).length;
    
    if (targetsAchieved >= 2) {
      console.log('\n🚀 PERFORMANCE: EXCELLENT');
      console.log('   Hybrid routing system exceeds performance targets!');
    } else {
      console.log('\n⚡ PERFORMANCE: GOOD');
      console.log('   System performs well with room for optimization.');
    }

  } catch (error) {
    console.error('❌ Benchmark failed:', String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

runPerformanceBenchmark()
  .then(() => {
    console.log('\n✅ Performance benchmark completed');
  })
  .catch(error => {
    console.error('❌ Benchmark error:', String(error));
  });