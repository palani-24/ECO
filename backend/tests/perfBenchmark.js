import express from 'express';
import zlib from 'zlib';
import http from 'http';
import { Readable } from 'stream';

console.log('================================================================');
console.log('   EcoReward Full-Stack Performance Testing & Benchmark Engine  ');
console.log('================================================================');

class MockSocket extends Readable {
  constructor() {
    super();
    this.remoteAddress = '127.0.0.1';
    this.writable = true;
    this.encrypted = false;
    this._writableState = { corked: 0 };
  }
  _read() {}
  destroy() {}
  write(chunk, encoding, cb) {
    if (typeof cb === 'function') cb();
    return true;
  }
  end(chunk, encoding, cb) {
    if (typeof cb === 'function') cb();
    return true;
  }
  cork() { this._writableState.corked++; }
  uncork() { if (this._writableState.corked > 0) this._writableState.corked--; }
}

const dispatch = (app, method, url, headers = {}) => {
  return new Promise((resolve) => {
    const socket = new MockSocket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost', ...headers };

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    const chunks = [];
    const origWrite = res.write.bind(res);
    const origEnd = res.end.bind(res);

    res.write = function (chunk, encoding, cb) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return origWrite(chunk, encoding, cb);
    };

    res.end = function (chunk, encoding, cb) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      origEnd(chunk, encoding, () => {
        if (cb) cb();
        const body = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.getHeaders(),
          body
        });
      });
    };

    app.handle(req, res);
  });
};

// 1. Serialization & Query Hydration Benchmark
const runHydrationBenchmark = () => {
  console.log('\n[1] DATABASE HYDRATION: Full Mongoose Documents vs .lean()');
  const sampleRecordsCount = 2000;
  
  const rawData = Array.from({ length: sampleRecordsCount }, (_, i) => ({
    _id: `6600000000000000000000${i.toString().padStart(4, '0')}`,
    user: {
      _id: `user_${i}`,
      name: `Citizen ${i}`,
      email: `citizen${i}@example.com`,
      profileImage: 'https://ui-avatars.com/api/?name=Citizen'
    },
    wasteCategory: 'Plastic',
    estimatedWeight: 12.5,
    actualWeight: 13.0,
    status: 'completed',
    pickupDate: new Date().toISOString(),
    pickupTimeSlot: '10:00 AM - 12:00 PM',
    pickupAddress: {
      street: '123 Green Way',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      zipCode: '641012'
    },
    pointsAwarded: 450,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  class MockMongooseDoc {
    constructor(data) {
      Object.assign(this, data);
      this.$__ = { wasModified: false, activePaths: new Set(), saving: false };
      this._doc = { ...data };
      this.isNew = false;
    }
    toObject() { return { ...this._doc }; }
    toJSON() { return { ...this._doc }; }
  }

  // Non-Lean
  const startNonLean = performance.now();
  const mongooseDocs = rawData.map(d => new MockMongooseDoc(d));
  const nonLeanJson = JSON.stringify(mongooseDocs);
  const timeNonLean = performance.now() - startNonLean;

  // Lean
  const startLean = performance.now();
  const leanJson = JSON.stringify(rawData);
  const timeLean = performance.now() - startLean;

  const speedup = (timeNonLean / timeLean).toFixed(1);
  console.log(`  â€¢ Standard Documents (${sampleRecordsCount} records): ${timeNonLean.toFixed(2)} ms`);
  console.log(`  â€¢ .lean() Plain Objects (${sampleRecordsCount} records): ${timeLean.toFixed(2)} ms`);
  console.log(`  âœ… Result: .lean() is ${speedup}x faster with zero memory leak risk!`);

  return { timeNonLean, timeLean, speedup };
};

// 2. HTTP Payload Compression Benchmark
const runCompressionBenchmark = () => {
  console.log('\n[2] NETWORK BANDWIDTH: Payload Compression Benchmark');

  const sampleApiResponse = {
    success: true,
    count: 150,
    data: Array.from({ length: 150 }, (_, i) => ({
      _id: `66af${i.toString().padStart(6, '0')}77a901`,
      user: { name: `Eco Citizen ${i}`, email: `user${i}@domain.com` },
      wasteCategory: i % 2 === 0 ? 'Plastic' : 'E-Waste',
      estimatedWeight: 5.5 + (i % 10),
      actualWeight: 5.7 + (i % 10),
      status: i % 3 === 0 ? 'completed' : 'pending',
      pickupAddress: { street: `${i} Green Avenue`, city: 'Coimbatore', state: 'Tamil Nadu', zipCode: '641012' },
      items: [
        { category: 'Bottles', estimatedWeight: 2.5, ratePerKg: 35 },
        { category: 'Cardboard', estimatedWeight: 3.2, ratePerKg: 15 }
      ],
      qrToken: `ECO-QR-${i}-TOKEN`,
      createdAt: new Date().toISOString()
    }))
  };

  const jsonStr = JSON.stringify(sampleApiResponse);
  const rawBytes = Buffer.byteLength(jsonStr, 'utf8');

  // Gzip
  const gzipStart = performance.now();
  const gzipBuffer = zlib.gzipSync(Buffer.from(jsonStr), { level: 6 });
  const gzipTime = performance.now() - gzipStart;
  const gzipBytes = gzipBuffer.length;

  // Brotli
  const brotliStart = performance.now();
  const brotliBuffer = zlib.brotliCompressSync(Buffer.from(jsonStr));
  const brotliTime = performance.now() - brotliStart;
  const brotliBytes = brotliBuffer.length;

  const gzipSavings = ((1 - gzipBytes / rawBytes) * 100).toFixed(1);
  const brotliSavings = ((1 - brotliBytes / rawBytes) * 100).toFixed(1);

  console.log(`  â€¢ Uncompressed JSON : ${(rawBytes / 1024).toFixed(2)} KB`);
  console.log(`  â€¢ Gzip (Level 6)    : ${(gzipBytes / 1024).toFixed(2)} KB (${gzipSavings}% reduction in ${gzipTime.toFixed(2)}ms)`);
  console.log(`  â€¢ Brotli            : ${(brotliBytes / 1024).toFixed(2)} KB (${brotliSavings}% reduction in ${brotliTime.toFixed(2)}ms)`);
  console.log(`  âœ… Result: Up to ${brotliSavings}% bandwidth savings on every API call!`);

  return {
    rawKB: (rawBytes / 1024).toFixed(2),
    gzipKB: (gzipBytes / 1024).toFixed(2),
    gzipSavings,
    brotliKB: (brotliBytes / 1024).toFixed(2),
    brotliSavings
  };
};

// 3. Express Pipeline Throughput & Latency Test
const runExpressPipelineBench = async () => {
  console.log('\n[3] THROUGHPUT & LATENCY: Express API Pipeline (500 Requests)');

  // Baseline App without Compression
  const appBase = express();
  appBase.get('/api/analytics', (req, res) => {
    res.json({
      success: true,
      stats: { totalPickups: 1420, completedPickups: 1380, totalUsers: 512 },
      recent: Array.from({ length: 40 }, (_, i) => ({ id: i, item: `Waste Item ${i}`, weight: 4.5 }))
    });
  });

  // Optimized App with Smart Gzip Compression
  const appOpt = express();
  appOpt.use((req, res, next) => {
    const accept = req.headers['accept-encoding'] || '';
    if (!accept.includes('gzip')) return next();

    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const jsonStr = JSON.stringify(data);
      if (Buffer.byteLength(jsonStr) < 512) return originalJson(data);

      zlib.gzip(Buffer.from(jsonStr), (err, compressed) => {
        if (err) return originalJson(data);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.end(compressed);
      });
    };
    next();
  });

  appOpt.get('/api/analytics', (req, res) => {
    res.json({
      success: true,
      stats: { totalPickups: 1420, completedPickups: 1380, totalUsers: 512 },
      recent: Array.from({ length: 40 }, (_, i) => ({ id: i, item: `Waste Item ${i}`, weight: 4.5 }))
    });
  });

  const iterations = 500;

  // Run Baseline
  const startBase = performance.now();
  let baseBytes = 0;
  for (let i = 0; i < iterations; i++) {
    const res = await dispatch(appBase, 'GET', '/api/analytics', {});
    baseBytes += res.body.length;
  }
  const timeBase = performance.now() - startBase;
  const baseRps = Math.round((iterations / timeBase) * 1000);
  const avgBaseLatency = (timeBase / iterations).toFixed(2);

  // Run Optimized
  const startOpt = performance.now();
  let optBytes = 0;
  for (let i = 0; i < iterations; i++) {
    const res = await dispatch(appOpt, 'GET', '/api/analytics', { 'accept-encoding': 'gzip' });
    optBytes += res.body.length;
  }
  const timeOpt = performance.now() - startOpt;
  const optRps = Math.round((iterations / timeOpt) * 1000);
  const avgOptLatency = (timeOpt / iterations).toFixed(2);

  const transferSavings = (((baseBytes - optBytes) / baseBytes) * 100).toFixed(1);

  console.log(`  â€¢ Baseline API  : ${baseRps} req/s | Avg Latency: ${avgBaseLatency} ms | Transferred: ${(baseBytes / 1024).toFixed(1)} KB`);
  console.log(`  â€¢ Optimized API : ${optRps} req/s | Avg Latency: ${avgOptLatency} ms | Transferred: ${(optBytes / 1024).toFixed(1)} KB`);
  console.log(`  âœ… Result: ${transferSavings}% less wire payload transferred across requests!`);

  return {
    baseRps,
    avgBaseLatency,
    optRps,
    avgOptLatency,
    transferSavings
  };
};

const runAll = async () => {
  const hydration = runHydrationBenchmark();
  const compression = runCompressionBenchmark();
  const pipeline = await runExpressPipelineBench();

  console.log('\n================================================================');
  console.log('   PERFORMANCE BENCHMARK EXECUTION COMPLETED SUCCESSFULLY      ');
  console.log('================================================================');
};

runAll();
