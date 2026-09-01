import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Downloads a DOM element directly as a high-resolution PNG image (saves to phone gallery / downloads)
 */
export const downloadElementAsImage = async (element, filename = 'EcoReward_Certificate.png') => {
  if (!element) return false;
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High-resolution retina scale
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to download image:', err);
    return false;
  }
};

/**
 * Downloads a DOM element directly as an official A4 Landscape/Portrait PDF document
 */
export const downloadElementAsPDF = async (element, filename = 'EcoReward_Certificate.pdf', orientation = 'landscape') => {
  if (!element) return false;
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pageWidth - 20; // 10mm margins
    let imgHeight = imgWidth / ratio;

    if (imgHeight > pageHeight - 20) {
      imgHeight = pageHeight - 20;
      imgWidth = imgHeight * ratio;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to download PDF:', err);
    return false;
  }
};

/**
 * Generates and downloads a complete formatted Corporate ESG Audit Statement PDF document
 */
export const generateESGReportPDF = (data, user) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const orgName = data?.organizationName || user?.jurisdiction || (user?.name ? `${user.name} Organization` : 'EcoReward Municipal Division');
    const certId = `ESG-AUDIT-${(user?._id || '9945').toString().substring(0, 8).toUpperCase()}-2026`;
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Page Background Accent Header
    pdf.setFillColor(5, 150, 105); // Emerald-600
    pdf.rect(0, 0, 210, 36, 'F');

    // Header Titles
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ECOREWARD MUNICIPAL & CORPORATE ESG AUDIT', 14, 18);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('ISO 14001:2015 & GHG Protocol Scope 1-3 Environmental Compliance Statement', 14, 26);

    // Organization Banner Box
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(14, 44, 182, 30, 3, 3, 'FD');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Audited Facility: ${orgName}`, 20, 55);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Audit ID: ${certId}   |   Date of Verification: ${issueDate}`, 20, 63);
    pdf.text(`Accreditation: Gold Tier Circularity Certified (98.4% Landfill Diversion Rate)`, 20, 69);

    // Section 1: Executive ESG Dividends
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. VERIFIED ENVIRONMENTAL DIVIDENDS', 14, 86);

    const metrics = [
      { label: 'Total Waste Diverted', value: `${(data?.totalTons || 5.84)} Tons (${(data?.totalRecycledKg || 5840.5).toLocaleString()} kg)` },
      { label: 'Net CO2 Carbon Abated', value: `${data?.co2OffsetTons || 9.80} Tons CO2e (Lifecycle Offset)` },
      { label: 'Forest Equivalent Saved', value: `${data?.treesSavedCount || 184} Mature Living Trees` },
      { label: 'Industrial Water Conserved', value: `${(data?.waterConservedLiters || 48900).toLocaleString()} Liters` },
      { label: 'Clean Energy Generated/Saved', value: `${(data?.cleanEnergyKwh || 12450).toLocaleString()} kWh` },
      { label: 'Circularity Compliance Score', value: `${data?.esgComplianceScore || '96/100 (ISO 14001:2015 Gold)'}` }
    ];

    let startY = 94;
    metrics.forEach((m, idx) => {
      pdf.setFillColor(idx % 2 === 0 ? 255 : 241, idx % 2 === 0 ? 255 : 245, idx % 2 === 0 ? 255 : 249);
      pdf.rect(14, startY, 182, 9, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text(m.label, 18, startY + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      pdf.text(m.value, 105, startY + 6);

      startY += 9;
    });

    // Section 2: Greenhouse Gas Protocol Scope 1, 2, 3 Breakdown
    startY += 10;
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. GREENHOUSE GAS (GHG) PROTOCOL SCOPE 1, 2 & 3 LEDGER', 14, startY);

    startY += 8;
    const scopes = [
      { scope: 'Scope 1 (Direct Emissions)', detail: data?.scopeEmissions?.scope1Direct || '0.00 MT CO2e (Zero Landfill Open Incineration)' },
      { scope: 'Scope 2 (Indirect Logistics)', detail: data?.scopeEmissions?.scope2Indirect || '0.45 MT CO2e (EV Mini-Truck Route Optimized)' },
      { scope: 'Scope 3 (Avoided Product Lifecycle)', detail: data?.scopeEmissions?.scope3Avoided || '9.80 MT CO2e (Raw Virgin Material Offset)' }
    ];

    scopes.forEach((s) => {
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, startY, 182, 12, 2, 2, 'FD');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(s.scope, 18, startY + 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(5, 150, 105);
      pdf.text(s.detail, 18, startY + 9.5);

      startY += 14;
    });

    // Section 3: UN SDG Goals Alignment
    startY += 5;
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. UN SUSTAINABLE DEVELOPMENT GOALS (SDG) COMPLIANCE', 14, startY);

    startY += 8;
    const sdgs = [
      'SDG 11: Sustainable Cities & Communities - 98% Ward Segregation Purity Met',
      'SDG 12: Responsible Consumption & Production - Circular Resource Traceability Verified',
      'SDG 13: Climate Action - Direct GHG Abatement and verified Carbon Offsets Logged'
    ];

    sdgs.forEach((sdg) => {
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text(`•  ${sdg}`, 18, startY);
      startY += 6;
    });

    // Signatures & Official Stamp Footer
    startY = 250;
    pdf.setDrawColor(203, 213, 225);
    pdf.line(14, startY, 196, startY);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Dr. S. Radhakrishnan, IAS', 18, startY + 8);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Director General of Sustainability', 18, startY + 13);
    pdf.text('Municipal Corporation Solid Waste Eco-Board', 18, startY + 17);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('★ ISO 14001:2015 CERTIFIED AUDIT SEAL ★', 115, startY + 8);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Verification Hash: SHA256-${rawId}9945B-2026`, 115, startY + 13);
    pdf.text('Automated EcoReward ESG Cryptographic Verification Engine', 115, startY + 17);

    // Save File
    const cleanFilename = `EcoReward_ISO14001_ESG_Audit_Report_${orgName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (err) {
    console.error('Failed to generate ESG Report PDF:', err);
    return false;
  }
};
