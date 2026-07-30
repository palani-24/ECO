/**
 * EcoReward AI Waste Detection & Vision Engine
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
 * Analyzes an uploaded waste image with AI vision simulation.
 */
export const analyzeWasteImage = async (imagePath, claimedCategory, claimedWeight) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const detectedCategory = claimedCategory || 'Plastic';
  const confidenceScore = parseFloat((0.89 + Math.random() * 0.09).toFixed(2));

  const weightVariance = (Math.random() * 0.16) - 0.08; 
  const rawWeight = parseFloat((claimedWeight * (1 + weightVariance)).toFixed(2)) || 1.0;
  const actualWeight = Math.min(500, Math.max(0.1, rawWeight));

  const qualityScore = Math.floor(80 + Math.random() * 18);
  let qualityGrade = 'Medium';
  if (qualityScore >= 92) qualityGrade = 'High';
  if (qualityScore < 82) qualityGrade = 'Low';

  const rate = POINT_RATES[detectedCategory] || 10;
  const pointsAwarded = Math.min(1000, Math.round(actualWeight * rate));

  const availableSubTypes = SUB_TYPES[detectedCategory] || [detectedCategory];
  const detectedMaterial = availableSubTypes[Math.floor(Math.random() * availableSubTypes.length)];
  const contaminationPct = Math.max(2, 100 - qualityScore);

  // Simulated bounding box annotations for interactive scanner overlay
  const detectedObjects = [
    {
      label: detectedMaterial,
      confidence: confidenceScore,
      box: { x: 18, y: 15, width: 64, height: 70 }
    }
  ];

  return {
    success: true,
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
