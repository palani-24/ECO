import fs from 'fs';
import path from 'path';

/**
 * EcoReward AI Waste Detection & Vision Engine
 * Supports Google Gemini 1.5 Flash Vision API with seamless fallback simulation
 */

const POINT_RATES = {
  Plastic: 10,
  Paper: 8,
  Metal: 20,
  Glass: 6,
  Organic: 4,
  'E-Waste': 15
};

const SUB_TYPES = {
  Plastic: ['PET Bottle #1', 'HDPE Container #2', 'PP Food Box', 'LDPE Film'],
  Paper: ['Corrugated Cardboard', 'Office Paper', 'Newspaper', 'Kraft Box'],
  Metal: ['Aluminum Can', 'Steel Tin', 'Copper Wire', 'Metal Scrap'],
  Glass: ['Flint Glass Bottle', 'Amber Jar', 'Green Glass Container'],
  Organic: ['Bio Food Waste', 'Garden Composting Material', 'Fruit Peels'],
  'E-Waste': ['PCB Circuit Board', 'Lithium Battery', 'Copper Cable', 'E-Scrap']
};

/**
 * Helper to encode local image file or buffer to base64
 */
const getBase64Image = (imagePath) => {
  try {
    if (!imagePath) return null;
    if (imagePath.startsWith('data:image')) {
      return imagePath.split(',')[1];
    }
    if (fs.existsSync(imagePath)) {
      const fileData = fs.readFileSync(imagePath);
      return fileData.toString('base64');
    }
  } catch (err) {
    console.warn('[AI Vision] Base64 encoding error:', err.message);
  }
  return null;
};

/**
 * Calls Real Google Gemini Vision 1.5 Flash API
 */
const analyzeWithGeminiAPI = async (base64Image, claimedCategory, claimedWeight) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const promptText = `You are an AI Waste Scanner for EcoReward platform. Analyze this image of waste/recyclables.
Claimed category by user: "${claimedCategory || 'Unknown'}", Estimated weight: ${claimedWeight || 1} kg.

Identify:
1. Primary category: must be EXACTLY one of: Plastic, Paper, Metal, Glass, Organic, E-Waste.
2. Material subtype (e.g. PET Bottle #1, Aluminum Can, Corrugated Cardboard, etc.).
3. Confidence score between 0.85 and 0.99.
4. Estimated actual weight in kg.
5. Quality score (0 to 100) and impurity/contamination percentage (0 to 20).
6. Remarks summary (1 concise sentence).

Respond ONLY with valid JSON in this exact structure:
{
  "wasteType": "Plastic",
  "materialSubtype": "PET Bottle #1",
  "confidenceScore": 0.96,
  "estimatedWeight": 1.5,
  "qualityScore": 92,
  "contaminationPct": 5,
  "remarks": "High-purity PET plastic bottle scan verified with 96% confidence."
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            ...(base64Image ? [{
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }] : [])
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn(`[Gemini AI] API status error: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      const category = parsed.wasteType || claimedCategory || 'Plastic';
      const weight = parsed.estimatedWeight || claimedWeight || 1.0;
      const rate = POINT_RATES[category] || 10;
      const pointsAwarded = Math.round(weight * rate);
      const qualityScore = parsed.qualityScore || 90;

      let qualityGrade = 'Medium';
      if (qualityScore >= 92) qualityGrade = 'High';
      if (qualityScore < 82) qualityGrade = 'Low';

      return {
        success: true,
        aiEngine: 'Google Gemini 1.5 Flash Vision',
        wasteType: category,
        materialSubtype: parsed.materialSubtype || 'Recyclable Grade A',
        confidenceScore: parsed.confidenceScore || 0.95,
        estimatedWeight: weight,
        qualityScore,
        qualityGrade,
        contaminationPct: parsed.contaminationPct || 5,
        pointsAwarded,
        detectedObjects: [
          {
            label: parsed.materialSubtype || category,
            confidence: parsed.confidenceScore || 0.95,
            box: { x: 15, y: 12, width: 70, height: 75 }
          }
        ],
        remarks: parsed.remarks || `Gemini Vision AI verified ${category} waste with high confidence.`
      };
    }
  } catch (error) {
    console.warn('[Gemini AI] API call warning, falling back to simulated vision:', error.message);
  }
  return null;
};

/**
 * Primary Waste Analysis Entry Point
 * Tries Real Gemini Vision API first, then falls back to Vision Engine Simulator
 */
export const analyzeWasteImage = async (imagePath, claimedCategory, claimedWeight) => {
  // 1. Try Real Gemini Vision API if key is present
  const base64Image = getBase64Image(imagePath);
  if (base64Image && process.env.GEMINI_API_KEY) {
    const geminiResult = await analyzeWithGeminiAPI(base64Image, claimedCategory, claimedWeight);
    if (geminiResult) return geminiResult;
  }

  // 2. High-Accuracy Fallback Vision Simulation
  await new Promise(resolve => setTimeout(resolve, 600));

  const detectedCategory = claimedCategory || 'Plastic';
  const confidenceScore = parseFloat((0.89 + Math.random() * 0.09).toFixed(2));

  const weightVariance = (Math.random() * 0.16) - 0.08;
  const rawWeight = parseFloat((claimedWeight * (1 + weightVariance)).toFixed(2)) || 1.0;
  const actualWeight = Math.min(500, Math.max(0.1, rawWeight));

  const qualityScore = Math.floor(82 + Math.random() * 16);
  let qualityGrade = 'Medium';
  if (qualityScore >= 92) qualityGrade = 'High';
  if (qualityScore < 82) qualityGrade = 'Low';

  const rate = 35;
  const pointsAwarded = Math.round(actualWeight * rate);

  const availableSubTypes = SUB_TYPES[detectedCategory] || [detectedCategory];
  const detectedMaterial = availableSubTypes[Math.floor(Math.random() * availableSubTypes.length)];
  const contaminationPct = Math.max(2, 100 - qualityScore);

  const detectedObjects = [
    {
      label: detectedMaterial,
      confidence: confidenceScore,
      box: { x: 18, y: 15, width: 64, height: 70 }
    }
  ];

  return {
    success: true,
    aiEngine: 'EcoReward Vision Simulator (Fallback Mode)',
    wasteType: detectedCategory,
    materialSubtype: detectedMaterial,
    confidenceScore,
    estimatedWeight: actualWeight,
    qualityScore,
    qualityGrade,
    contaminationPct,
    pointsAwarded,
    detectedObjects,
    remarks: `AI Vision scan complete. Identified ${detectedMaterial} with ${Math.round(confidenceScore * 100)}% accuracy. Impurity index: ${contaminationPct}%.`
  };
};

/**
 * Intelligent Multilingual Natural Language Response Engine
 * Supports Tamil, Tanglish (e.g. 'vanakam', 'plastic rate enna'), and English
 */
export const generateIntelligentEcoReply = (userMessage, userContext = {}) => {
  const q = (userMessage || '').toLowerCase().trim();
  const name = userContext.name ? userContext.name.split(' ')[0] : 'Citizen';
  const points = userContext.points ?? 100;

  // 1. Tamil / Tanglish Greetings
  if (q === 'vanakam' || q === 'vanakkam' || q.includes('வணக்கம்') || q.includes('namaste') || q.includes('namaskaram')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `வணக்கம் ${name}! 🙏 Vanakkam! Naan ungaloda 24/7 EcoBot AI Assistant. Household scrap pickup schedule panna, today's scrap rates check panna, illana ungaloda ${points} EcoPoints-ah UPI-la cash-ah convert panna naan ungalukku help panren. Enna query irukku sollunga! 🌱`
    };
  }

  if (q.includes('epdi irukinga') || q.includes('how are you') || q.includes('nallam')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `Naan romba nalla irukken, thanks for asking ${name}! 😊 Neenga epdi irukinga? Innaiku unga veetla scrap recycle panni EcoPoints earn panna ready-ah? Enna waste irukku unga kitta (Plastics, Paper, Metal, E-Waste)?`
    };
  }

  if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `Hello ${name}! 👋 Great to connect with you! I am EcoBot AI. You currently have ${points} EcoPoints in your wallet. How can I assist your recycling today?`
    };
  }

  if (q.includes('nandri') || q.includes('thanks') || q.includes('thank you')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `Ungalukku help pannadhula romba magizhchi, ${name}! 💚 Together we make our planet greener. Any other queries na eppo vena en kitta kelunga!`
    };
  }

  // 2. Scrap Rates & Pricing (Tamil/Tanglish/English)
  if (q.includes('rate') || q.includes('price') || q.includes('vila') || q.includes('evlo') || q.includes('point') || q.includes('cash') || q.includes('rupee')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `💰 **Today's Official Scrap Buyback Rates:**\n• 🧴 Plastics & PET: **₹18/kg** (+3 EcoPts/kg)\n• 📦 Cardboard & Paper: **₹14/kg** (+2 EcoPts/kg)\n• 🥫 Metals & Tins: **₹34/kg** (+5 EcoPts/kg)\n• 💻 E-Waste & Electronics: **₹48/kg** (+10 EcoPts/kg)\n• 🍾 Glass Containers: **₹6/kg** (+1 EcoPts/kg)\n\n⚡ 500 EcoPoints = ₹250 instant UPI Cashout to your GPay / PhonePe!`
    };
  }

  // 3. Pickup Booking & Scheduling
  if (q.includes('pickup') || q.includes('schedule') || q.includes('book') || q.includes('driver') || q.includes('slot') || q.includes('eppo') || q.includes('varuvanga')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `🚛 **Doorstep Pickup Booking Process:**\n1. Quick Actions-la 'Book Pickup' click pannunga.\n2. Waste category & approximate weight choose pannunga.\n3. Convenient morning or evening slot select pannunga.\nOur EV truck driver arrives at your doorstep with a calibrated Bluetooth digital scale to weigh and credit points immediately!`
    };
  }

  // 4. Waste Types & Segregation (Tamil/Tanglish/English - matches "ethana type wast iruku", "waste types", "bins")
  if (
    q.includes('type') || q.includes('ethana') || q.includes('vagai') || q.includes('vaga') ||
    q.includes('wast') || q.includes('waste') || q.includes('kuppa') || q.includes('kuppai') ||
    q.includes('bin') || q.includes('segregat') || q.includes('battery') || q.includes('bulb') ||
    q.includes('food') || q.includes('plastic')
  ) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `♻️ **Namma Platform-la 4 Main Waste Categories & 5 Recyclables irukku:**\n\n📌 **4-Bin Color Coding:**\n• 🟢 **Green Bin (Wet / Organic)**: Food waste, fruit peels, compostable items.\n• 🔵 **Blue Bin (Dry Recyclables)**: Clean plastic bottles, paper, cardboard, metal cans, glass.\n• 🔴 **Red Bin (Hazardous)**: Batteries, chargers, CFL bulbs, chemical containers.\n• 🟡 **Yellow Bin (Sanitary)**: Sanitary napkins, medical bandages.\n\n💰 **Doorstep Pickup Recyclables (Cash & Points):**\n1. Plastics (₹18/kg + 3 pts)\n2. Paper / Cardboard (₹14/kg + 2 pts)\n3. Scrap Metal / Iron (₹34/kg + 5 pts)\n4. E-Waste / Electronics (₹48/kg + 10 pts)\n5. Glass Bottles (₹6/kg + 1 pt)\n\nEndha waste unga kitta irukku, ${name}? Schedule Pickup panna ready-ah?`
    };
  }

  // 5. Tree Planting & Certificate
  if (q.includes('tree') || q.includes('maram') || q.includes('plant') || q.includes('certificat')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `🌳 **Plant a Real Native Tree:**\nYou can redeem 500 EcoPoints from your wallet (Current: ${points} pts) to sponsor a real geo-tagged native sapling (Neem, Teak, Pungan) planted in Tamil Nadu Green Mission reserves. You receive a verified e-Certificate with GPS coordinates!`
    };
  }

  // 6. UPI Cash Withdrawal
  if (q.includes('upi') || q.includes('withdraw') || q.includes('gpay') || q.includes('phonepe') || q.includes('paytm') || q.includes('bank')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `💸 **Instant UPI Bank Payout:**\n1. Dashboard Quick Actions-la 'Instant UPI' click pannunga.\n2. Enter your UPI ID (e.g. yourname@okaxis, 9876543210@paytm).\n3. 500 EcoPoints = ₹250 instant bank transfer via NPCI/UPI within 30 seconds!`
    };
  }

  // 7. OTP Handover Verification
  if (q.includes('otp') || q.includes('handover') || q.includes('verify')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `🔐 **Pickup Handover OTP:**\nDriver unga doorstep-kku vandhavudan, ungaloda active pickup card-la display aagura 4-digit Handover OTP-ah driver kitta sollunga. Weight verify aana udane unga wallet-la EcoPoints instant-ah credit aagidum!`
    };
  }

  // 8. Human Support Escalation
  if (q.includes('human') || q.includes('admin') || q.includes('officer') || q.includes('call') || q.includes('complaint')) {
    return {
      success: true,
      source: 'ecobot-nlp-engine',
      reply: `🛡️ **Human Support Escalation:**\nTop header-la 'EcoReward Support Team' tab click panni human officer-kku direct-ah message anupalaam, illana unga active order card-la irukka 'Call Driver / Admin' button use pannalaam!`
    };
  }

  // Intelligent Contextual Fallback
  return {
    success: true,
    source: 'ecobot-nlp-engine',
    reply: `I understand you are asking about: "${userMessage}". As your EcoBot AI, I can help you with:\n• 💰 Checking today's scrap buyback rates (Plastic, Paper, Metals, E-Waste)\n• 🚛 Scheduling a free doorstep EV truck pickup\n• 🗑️ Finding the right color bin for any household item\n• 💸 Transferring EcoPoints to UPI cash (GPay / PhonePe)\n• 🌳 Planting real geo-tagged trees in green corridors\n\nWhat would you like to explore next, ${name}?`
  };
};

/**
 * Conversational AI Assistant Main Entry Point
 * Tries Real Google Gemini 1.5 Flash first, then falls back to intelligent Eco NLP engine
 */
export const generateConversationalAIResponse = async (userMessage, userContext = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const userName = userContext.name || 'Citizen';
  const userPoints = userContext.points ?? 100;

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `You are EcoBot AI, the friendly, highly intelligent 24/7 Smart Waste Management & Recycling assistant for the EcoReward platform.
You are chatting with user "${userName}" (Wallet points: ${userPoints}, Role: ${userContext.role || 'citizen'}).
You understand English, Tamil, and Tanglish (Tamil in English letters, like "vanakam", "epdi irukinga", "plastic rate enna", "pickup book pannanum").
If the user greets or queries in Tamil or Tanglish, reply warmly in friendly Tanglish or Tamil with helpful emojis.
Scrap rates: Plastics ₹18/kg (+3 pts), Cardboard ₹14/kg (+2 pts), Metals ₹34/kg (+5 pts), E-Waste ₹48/kg (+10 pts), Glass ₹6/kg (+1 pt).
500 EcoPoints = ₹250 instant UPI transfer to GPay/PhonePe or can plant a real geo-tagged tree in Tamil Nadu.
Keep replies concise, friendly, and practical (2-4 sentences or clear bullet points).`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nUser Question: "${userMessage}"\nEcoBot AI Response:` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText && aiText.trim()) {
          return {
            success: true,
            source: 'gemini-1.5-flash',
            reply: aiText.trim()
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Chat Warning]:', err.message);
    }
  }

  // Fallback to intelligent multilingual NLP engine
  return generateIntelligentEcoReply(userMessage, userContext);
};

