import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaTimes, FaSearch, FaCheck, FaBuilding, FaPhoneAlt, FaTruck } from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';

// Official 38 Revenue Districts of Tamil Nadu with administrative local bodies and realistic wards
export const TAMIL_NADU_DISTRICTS = [
  {
    id: 'chennai',
    name: 'Chennai',
    tamilName: 'சென்னை',
    corporation: 'Greater Chennai Corporation',
    headquarters: 'Ripon Building, Chennai',
    zones: 15,
    wards: 200,
    lat: 13.0827,
    lng: 80.2707,
    helpline: '1913',
    regCode: 'TN-01 to TN-22',
    dailyWasteTons: 5200,
    segregationRate: 74,
    sampleWards: [
      { ward: 'Zone 5 - Royapuram (Ward 49)', zone: 'North', cleanlinessScore: 82, activeFleet: 14 },
      { ward: 'Zone 8 - Anna Nagar (Ward 104)', zone: 'Central', cleanlinessScore: 94, activeFleet: 18 },
      { ward: 'Zone 9 - T. Nagar / Mylapore (Ward 118)', zone: 'Central', cleanlinessScore: 91, activeFleet: 22 },
      { ward: 'Zone 13 - Adyar / Besant Nagar (Ward 175)', zone: 'South', cleanlinessScore: 95, activeFleet: 16 },
      { ward: 'Zone 14 - Perungudi / OMR (Ward 184)', zone: 'South', cleanlinessScore: 88, activeFleet: 15 },
      { ward: 'Zone 10 - Kodambakkam (Ward 132)', zone: 'Central', cleanlinessScore: 86, activeFleet: 14 }
    ],
    mrfCenters: ['Kodungaiyur Resource Park', 'Perungudi Eco Recovery Facility', 'Anna Nagar Decentralized MRF']
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tamilName: 'கோயம்புத்தூர்',
    corporation: 'Coimbatore City Municipal Corporation',
    headquarters: 'Victoria Town Hall, Coimbatore',
    zones: 5,
    wards: 100,
    lat: 11.0168,
    lng: 76.9558,
    helpline: '0422-2302323 / 1800-425-4123',
    regCode: 'TN-38 / TN-66 / TN-99',
    dailyWasteTons: 1150,
    segregationRate: 81,
    sampleWards: [
      { ward: 'Ward 1 - Gandhipuram Central', zone: 'North', cleanlinessScore: 92, activeFleet: 10 },
      { ward: 'Ward 2 - RS Puram West', zone: 'West', cleanlinessScore: 95, activeFleet: 8 },
      { ward: 'Ward 3 - Saibaba Colony', zone: 'North', cleanlinessScore: 89, activeFleet: 7 },
      { ward: 'Ward 4 - Peelamedu Tech Hub', zone: 'East', cleanlinessScore: 88, activeFleet: 9 },
      { ward: 'Ward 5 - Singanallur', zone: 'South', cleanlinessScore: 78, activeFleet: 6 },
      { ward: 'Ward 6 - Ukkadam Lakefront', zone: 'Central', cleanlinessScore: 75, activeFleet: 8 }
    ],
    mrfCenters: ['Vellalore Integrated Solid Waste Facility', 'Ukkadam Decentralized Composting', 'RS Puram Dry Waste Hub']
  },
  {
    id: 'madurai',
    name: 'Madurai',
    tamilName: 'மதுரை',
    corporation: 'Madurai City Municipal Corporation',
    headquarters: 'Arignar Anna Maligai, Madurai',
    zones: 5,
    wards: 100,
    lat: 9.9252,
    lng: 78.1198,
    helpline: '0452-2531631',
    regCode: 'TN-58 / TN-59 / TN-64',
    dailyWasteTons: 890,
    segregationRate: 72,
    sampleWards: [
      { ward: 'Ward 14 - Goripalayam', zone: 'North', cleanlinessScore: 84, activeFleet: 8 },
      { ward: 'Ward 22 - Simmakkal Heritage Zone', zone: 'Central', cleanlinessScore: 81, activeFleet: 10 },
      { ward: 'Ward 38 - Mattuthavani / K.K. Nagar', zone: 'East', cleanlinessScore: 90, activeFleet: 9 },
      { ward: 'Ward 45 - Teppakulam South', zone: 'South', cleanlinessScore: 86, activeFleet: 7 },
      { ward: 'Ward 51 - Sellur Riverbank', zone: 'North', cleanlinessScore: 76, activeFleet: 6 }
    ],
    mrfCenters: ['Vellakkal Waste Management Plant', 'Mattuthavani Biogas Facility', 'K.K. Nagar Sorting Center']
  },
  {
    id: 'tiruchirappalli',
    name: 'Tiruchirappalli (Trichy)',
    tamilName: 'திருச்சிராப்பள்ளி',
    corporation: 'Tiruchirappalli City Municipal Corporation',
    headquarters: 'Bharathidasan Salai, Cantonment, Trichy',
    zones: 5,
    wards: 65,
    lat: 10.7905,
    lng: 78.7047,
    helpline: '0431-2415396',
    regCode: 'TN-45 / TN-48',
    dailyWasteTons: 520,
    segregationRate: 85,
    sampleWards: [
      { ward: 'Ward 10 - Thillai Nagar', zone: 'West', cleanlinessScore: 96, activeFleet: 7 },
      { ward: 'Ward 18 - Srirangam Island Zone', zone: 'North', cleanlinessScore: 94, activeFleet: 8 },
      { ward: 'Ward 29 - Cantonment Central', zone: 'Central', cleanlinessScore: 90, activeFleet: 6 },
      { ward: 'Ward 42 - K.K. Nagar South', zone: 'South', cleanlinessScore: 87, activeFleet: 6 },
      { ward: 'Ward 55 - Ponmalai / Golden Rock', zone: 'East', cleanlinessScore: 82, activeFleet: 5 }
    ],
    mrfCenters: ['Ariyamangalam Bio-Mining Hub', 'Srirangam Micro Composting Center', 'K.K. Nagar Dry Waste Center']
  },
  {
    id: 'salem',
    name: 'Salem',
    tamilName: 'சேலம்',
    corporation: 'Salem City Municipal Corporation',
    headquarters: 'Salem Municipal Complex, Salem',
    zones: 4,
    wards: 60,
    lat: 11.6643,
    lng: 78.1460,
    helpline: '0427-2212844',
    regCode: 'TN-27 / TN-30 / TN-54',
    dailyWasteTons: 480,
    segregationRate: 77,
    sampleWards: [
      { ward: 'Ward 12 - Suramangalam Junction', zone: 'West', cleanlinessScore: 88, activeFleet: 7 },
      { ward: 'Ward 24 - Hasthampatti Green Zone', zone: 'North', cleanlinessScore: 92, activeFleet: 8 },
      { ward: 'Ward 36 - Ammapet Handloom Hub', zone: 'East', cleanlinessScore: 80, activeFleet: 6 },
      { ward: 'Ward 48 - Kondalampatti South', zone: 'South', cleanlinessScore: 79, activeFleet: 5 }
    ],
    mrfCenters: ['Chettichavadi Compost Facility', 'Suramangalam MRF Depot', 'Ammapet Sorting Center']
  },
  {
    id: 'tirunelveli',
    name: 'Tirunelveli',
    tamilName: 'திருநெல்வேலி',
    corporation: 'Tirunelveli City Municipal Corporation',
    headquarters: 'S.N. High Road, Tirunelveli',
    zones: 5,
    wards: 55,
    lat: 8.7139,
    lng: 77.7567,
    helpline: '0462-2329328',
    regCode: 'TN-72',
    dailyWasteTons: 340,
    segregationRate: 79,
    sampleWards: [
      { ward: 'Ward 8 - Palayamkottai Oxford Zone', zone: 'Palayamkottai', cleanlinessScore: 93, activeFleet: 6 },
      { ward: 'Ward 19 - Town Nellaiappar Temple Zone', zone: 'Town', cleanlinessScore: 86, activeFleet: 7 },
      { ward: 'Ward 31 - Melapalayam West', zone: 'Melapalayam', cleanlinessScore: 80, activeFleet: 5 },
      { ward: 'Ward 42 - Thatchanallur Industrial', zone: 'Thatchanallur', cleanlinessScore: 82, activeFleet: 5 }
    ],
    mrfCenters: ['Ramayanpatti Processing Plant', 'Palayamkottai MRF Hub', 'Melapalayam Organic Shed']
  },
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    tamilName: 'திருப்பூர்',
    corporation: 'Tiruppur City Municipal Corporation',
    headquarters: 'Mangalam Road, Tiruppur',
    zones: 4,
    wards: 60,
    lat: 11.1085,
    lng: 77.3411,
    helpline: '0421-2240153',
    regCode: 'TN-39 / TN-42',
    dailyWasteTons: 620,
    segregationRate: 75,
    sampleWards: [
      { ward: 'Ward 15 - Avinashi Road Knitwear Hub', zone: 'Zone 1', cleanlinessScore: 89, activeFleet: 8 },
      { ward: 'Ward 28 - Palladam Road Commercial', zone: 'Zone 2', cleanlinessScore: 82, activeFleet: 7 },
      { ward: 'Ward 39 - Kumaran Road Central', zone: 'Zone 3', cleanlinessScore: 87, activeFleet: 6 },
      { ward: 'Ward 50 - Nallur Industrial Suburb', zone: 'Zone 4', cleanlinessScore: 78, activeFleet: 6 }
    ],
    mrfCenters: ['Iduvai Solid Waste Resource Facility', 'Textile Sludge & Fabric Recovery MRF', 'Kumaran Road Depot']
  },
  {
    id: 'erode',
    name: 'Erode',
    tamilName: 'ஈரோடு',
    corporation: 'Erode City Municipal Corporation',
    headquarters: 'Meenatchisundaranar Road, Erode',
    zones: 4,
    wards: 60,
    lat: 11.3410,
    lng: 77.7172,
    helpline: '0424-2251617',
    regCode: 'TN-33 / TN-36 / TN-86',
    dailyWasteTons: 380,
    segregationRate: 83,
    sampleWards: [
      { ward: 'Ward 11 - Brough Road Commercial', zone: 'Central', cleanlinessScore: 91, activeFleet: 6 },
      { ward: 'Ward 24 - Perundurai Road Colony', zone: 'West', cleanlinessScore: 94, activeFleet: 7 },
      { ward: 'Ward 37 - Surampatti Industrial', zone: 'South', cleanlinessScore: 85, activeFleet: 5 },
      { ward: 'Ward 52 - Veerappanchatram Turmeric Hub', zone: 'North', cleanlinessScore: 83, activeFleet: 5 }
    ],
    mrfCenters: ['Vendipalayam Bio-Mining Unit', 'Surampatti Decentralized Compost Hub', 'Perundurai MRF']
  },
  {
    id: 'vellore',
    name: 'Vellore',
    tamilName: 'வேலூர்',
    corporation: 'Vellore City Municipal Corporation',
    headquarters: 'Infantry Road, Vellore',
    zones: 4,
    wards: 60,
    lat: 12.9165,
    lng: 79.1325,
    helpline: '0416-2220578',
    regCode: 'TN-23 / TN-73',
    dailyWasteTons: 360,
    segregationRate: 80,
    sampleWards: [
      { ward: 'Ward 14 - Fort Historic Zone', zone: 'Zone 1', cleanlinessScore: 89, activeFleet: 6 },
      { ward: 'Ward 27 - Katpadi Junction Zone', zone: 'Zone 2', cleanlinessScore: 92, activeFleet: 7 },
      { ward: 'Ward 40 - Sathuvachari IT & Admin', zone: 'Zone 3', cleanlinessScore: 93, activeFleet: 6 },
      { ward: 'Ward 53 - Bagayam Hospital Belt', zone: 'Zone 4', cleanlinessScore: 95, activeFleet: 5 }
    ],
    mrfCenters: ['Sathuvachari Resource Park', 'Saduperi Solid Waste Center', 'Katpadi Recycling Depot']
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    tamilName: 'தஞ்சாவூர்',
    corporation: 'Thanjavur City Municipal Corporation',
    headquarters: 'Kamarajar Road, Thanjavur',
    zones: 4,
    wards: 51,
    lat: 10.7870,
    lng: 79.1378,
    helpline: '04362-230021',
    regCode: 'TN-49 / TN-68',
    dailyWasteTons: 290,
    segregationRate: 84,
    sampleWards: [
      { ward: 'Ward 7 - Big Temple Heritage Perimeter', zone: 'Heritage', cleanlinessScore: 97, activeFleet: 6 },
      { ward: 'Ward 21 - Medical College Colony', zone: 'South', cleanlinessScore: 91, activeFleet: 5 },
      { ward: 'Ward 35 - Old Bus Stand Market', zone: 'Central', cleanlinessScore: 82, activeFleet: 6 },
      { ward: 'Ward 48 - Srinivasapuram', zone: 'North', cleanlinessScore: 88, activeFleet: 5 }
    ],
    mrfCenters: ['Jebamalaipuram Compost Yard', 'Medical College MRF Shed', 'Heritage Belt Cleanliness Hub']
  },
  {
    id: 'dindigul',
    name: 'Dindigul',
    tamilName: 'திண்டுக்கல்',
    corporation: 'Dindigul City Municipal Corporation',
    headquarters: 'Palani Road, Dindigul',
    zones: 4,
    wards: 48,
    lat: 10.3673,
    lng: 77.9803,
    helpline: '0451-2422001',
    regCode: 'TN-57',
    dailyWasteTons: 260,
    segregationRate: 78,
    sampleWards: [
      { ward: 'Ward 9 - Rock Fort Vicinity', zone: 'Zone 1', cleanlinessScore: 86, activeFleet: 5 },
      { ward: 'Ward 22 - Round Road Commercial', zone: 'Zone 2', cleanlinessScore: 88, activeFleet: 6 },
      { ward: 'Ward 34 - Palani Road Colony', zone: 'Zone 3', cleanlinessScore: 90, activeFleet: 5 },
      { ward: 'Ward 45 - Begambur Old Town', zone: 'Zone 4', cleanlinessScore: 77, activeFleet: 4 }
    ],
    mrfCenters: ['Murugabavanam Waste Processing Unit', 'Palani Bypass Sorting Shed', 'Round Road MRF']
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    tamilName: 'காஞ்சிபுரம்',
    corporation: 'Kanchipuram City Municipal Corporation',
    headquarters: 'Annai Indira Gandhi Salai, Kanchipuram',
    zones: 4,
    wards: 51,
    lat: 12.8342,
    lng: 79.7036,
    helpline: '044-27222543',
    regCode: 'TN-21',
    dailyWasteTons: 270,
    segregationRate: 82,
    sampleWards: [
      { ward: 'Ward 12 - Silk Handloom Weavers Colony', zone: 'Silk Zone', cleanlinessScore: 91, activeFleet: 5 },
      { ward: 'Ward 23 - Ekambareswarar Temple Outer', zone: 'Heritage', cleanlinessScore: 93, activeFleet: 6 },
      { ward: 'Ward 38 - Collectorate Campus & Orikkai', zone: 'Admin', cleanlinessScore: 90, activeFleet: 5 },
      { ward: 'Ward 49 - Railway Station Road', zone: 'Central', cleanlinessScore: 83, activeFleet: 4 }
    ],
    mrfCenters: ['Nathapettai Resource Park', 'Orikkai Micro Composting Depot', 'Heritage Silk Recyclers']
  },
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    tamilName: 'செங்கல்பட்டு',
    corporation: 'Tambaram Municipal Corporation & Chengalpattu',
    headquarters: 'GST Road, Tambaram / Chengalpattu',
    zones: 5,
    wards: 70,
    lat: 12.6939,
    lng: 79.9757,
    helpline: '044-22414444',
    regCode: 'TN-11 / TN-19',
    dailyWasteTons: 710,
    segregationRate: 81,
    sampleWards: [
      { ward: 'Ward 18 - Tambaram Sanatorium', zone: 'North', cleanlinessScore: 91, activeFleet: 8 },
      { ward: 'Ward 32 - Chromepet Commercial', zone: 'Central', cleanlinessScore: 87, activeFleet: 9 },
      { ward: 'Ward 46 - Mahindra World City Hub', zone: 'Industrial', cleanlinessScore: 96, activeFleet: 7 },
      { ward: 'Ward 61 - Chengalpattu Town Center', zone: 'South', cleanlinessScore: 84, activeFleet: 6 }
    ],
    mrfCenters: ['Kannadapalayam Processing Facility', 'Mahindra World City Zero-Waste Unit', 'Tambaram MRF']
  },
  {
    id: 'cuddalore',
    name: 'Cuddalore',
    tamilName: 'கடலூர்',
    corporation: 'Cuddalore City Municipal Corporation',
    headquarters: 'Bharathi Road, Cuddalore',
    zones: 4,
    wards: 45,
    lat: 11.7480,
    lng: 79.7714,
    helpline: '04142-230048',
    regCode: 'TN-31',
    dailyWasteTons: 240,
    segregationRate: 76,
    sampleWards: [
      { ward: 'Ward 10 - Silver Beach Coastal Zone', zone: 'Coastal', cleanlinessScore: 92, activeFleet: 5 },
      { ward: 'Ward 22 - Thirupapuliyur Temple Belt', zone: 'Central', cleanlinessScore: 85, activeFleet: 6 },
      { ward: 'Ward 33 - SIPCOT Industrial Outer', zone: 'Industrial', cleanlinessScore: 78, activeFleet: 4 }
    ],
    mrfCenters: ['Kappiyampuliyur Compost Hub', 'Silver Beach Coastal Waste Center', 'Thirupapuliyur Depot']
  },
  {
    id: 'karur',
    name: 'Karur',
    tamilName: 'கரூர்',
    corporation: 'Karur City Municipal Corporation',
    headquarters: 'Azad Road, Karur',
    zones: 4,
    wards: 48,
    lat: 10.9601,
    lng: 78.0766,
    helpline: '04324-260011',
    regCode: 'TN-47',
    dailyWasteTons: 220,
    segregationRate: 85,
    sampleWards: [
      { ward: 'Ward 11 - Amaravathi Riverbank Heritage', zone: 'Zone 1', cleanlinessScore: 90, activeFleet: 5 },
      { ward: 'Ward 25 - Textile Export Hub Thanthoni', zone: 'Zone 2', cleanlinessScore: 94, activeFleet: 6 },
      { ward: 'Ward 39 - Bus Stand Commercial Corridor', zone: 'Zone 3', cleanlinessScore: 84, activeFleet: 4 }
    ],
    mrfCenters: ['Thanthonimalai Resource Yard', 'Amaravathi Eco Composting Shed', 'Karur Textile Scrap Hub']
  },
  {
    id: 'virudhunagar',
    name: 'Virudhunagar',
    tamilName: 'விருதுநகர்',
    corporation: 'Sivakasi Municipal Corporation & Virudhunagar',
    headquarters: 'Sivakasi / Virudhunagar Municipal Building',
    zones: 4,
    wards: 48,
    lat: 9.5872,
    lng: 77.9579,
    helpline: '04562-244033',
    regCode: 'TN-67 / TN-84',
    dailyWasteTons: 310,
    segregationRate: 79,
    sampleWards: [
      { ward: 'Ward 14 - Sivakasi Printing & Packaging Cluster', zone: 'Industrial', cleanlinessScore: 89, activeFleet: 6 },
      { ward: 'Ward 26 - Virudhunagar Oil Mill Town', zone: 'Central', cleanlinessScore: 86, activeFleet: 5 },
      { ward: 'Ward 37 - Rajapalayam Cotton Belt Outer', zone: 'West', cleanlinessScore: 90, activeFleet: 5 }
    ],
    mrfCenters: ['Sivakasi Paper & Packaging MRF', 'Virudhunagar Municipal Processing Plant']
  },
  {
    id: 'thoothukudi',
    name: 'Thoothukudi (Tuticorin)',
    tamilName: 'தூத்துக்குடி',
    corporation: 'Thoothukudi City Municipal Corporation',
    headquarters: 'Palayamkottai Road, Thoothukudi',
    zones: 4,
    wards: 60,
    lat: 8.7642,
    lng: 78.1348,
    helpline: '0461-2326901',
    regCode: 'TN-69 / TN-92',
    dailyWasteTons: 370,
    segregationRate: 80,
    sampleWards: [
      { ward: 'Ward 12 - VO Chidambaranar Port Zone', zone: 'Port', cleanlinessScore: 93, activeFleet: 7 },
      { ward: 'Ward 24 - Pearl City Beach Promenade', zone: 'Coastal', cleanlinessScore: 95, activeFleet: 6 },
      { ward: 'Ward 38 - Old Colony Commercial', zone: 'Central', cleanlinessScore: 81, activeFleet: 6 }
    ],
    mrfCenters: ['Tharuvaikulam Resource Park', 'Port Area Marine Plastic Interceptor', 'Tuticorin Salt MRF']
  },
  {
    id: 'kanyakumari',
    name: 'Kanyakumari (Nagercoil)',
    tamilName: 'கன்னியாகுமரி',
    corporation: 'Nagercoil City Municipal Corporation',
    headquarters: 'Balamore Road, Nagercoil',
    zones: 4,
    wards: 52,
    lat: 8.1833,
    lng: 77.4119,
    helpline: '04652-230009',
    regCode: 'TN-74 / TN-75',
    dailyWasteTons: 280,
    segregationRate: 88,
    sampleWards: [
      { ward: 'Ward 9 - Cape Comorin Sunset Point', zone: 'Tourism', cleanlinessScore: 97, activeFleet: 7 },
      { ward: 'Ward 21 - Nagercoil Town Central', zone: 'Central', cleanlinessScore: 92, activeFleet: 6 },
      { ward: 'Ward 36 - Vadasery Market Belt', zone: 'North', cleanlinessScore: 85, activeFleet: 5 }
    ],
    mrfCenters: ['Valanagar Eco Waste Processing Unit', 'Kanyakumari Clean Shore Recovery Hub']
  },
  {
    id: 'krishnagiri',
    name: 'Krishnagiri (Hosur)',
    tamilName: 'கிருஷ்ணகிரி',
    corporation: 'Hosur City Municipal Corporation & Krishnagiri',
    headquarters: 'Bagalur Road, Hosur',
    zones: 4,
    wards: 45,
    lat: 12.5186,
    lng: 78.2137,
    helpline: '04344-244033',
    regCode: 'TN-24 / TN-70',
    dailyWasteTons: 410,
    segregationRate: 82,
    sampleWards: [
      { ward: 'Ward 11 - Electronic City Industrial Corridor', zone: 'SIPCOT', cleanlinessScore: 93, activeFleet: 8 },
      { ward: 'Ward 23 - Hosur Bus Stand Central', zone: 'Central', cleanlinessScore: 87, activeFleet: 7 },
      { ward: 'Ward 35 - Krishnagiri Fort Outer', zone: 'East', cleanlinessScore: 89, activeFleet: 5 }
    ],
    mrfCenters: ['Mookandapalli E-Waste & Plastic Center', 'Hosur Eco Recovery Depot']
  },
  {
    id: 'namakkal',
    name: 'Namakkal',
    tamilName: 'நாமக்கல்',
    corporation: 'Namakkal City Municipal Corporation',
    headquarters: 'Mohanur Road, Namakkal',
    zones: 4,
    wards: 39,
    lat: 11.2189,
    lng: 78.1674,
    helpline: '04286-231144',
    regCode: 'TN-28 / TN-88',
    dailyWasteTons: 190,
    segregationRate: 91,
    sampleWards: [
      { ward: 'Ward 6 - Anjaneyar Temple Outer Ring', zone: 'Heritage', cleanlinessScore: 98, activeFleet: 5 },
      { ward: 'Ward 18 - Poultry & Egg Logistics Belt', zone: 'Commercial', cleanlinessScore: 92, activeFleet: 5 },
      { ward: 'Ward 29 - Truck Body Building Zone', zone: 'Industrial', cleanlinessScore: 86, activeFleet: 4 }
    ],
    mrfCenters: ['Kosavampatti Zero-Waste Model Park', 'Namakkal Micro Composting Shed']
  },
  {
    id: 'pudukkottai',
    name: 'Pudukkottai',
    tamilName: 'புதுக்கோட்டை',
    corporation: 'Pudukkottai City Municipal Corporation',
    headquarters: 'Santhanathapuram, Pudukkottai',
    zones: 4,
    wards: 42,
    lat: 10.3797,
    lng: 78.8208,
    helpline: '04322-221650',
    regCode: 'TN-55',
    dailyWasteTons: 180,
    segregationRate: 80,
    sampleWards: [
      { ward: 'Ward 8 - Raja Palace Cultural Zone', zone: 'Heritage', cleanlinessScore: 92, activeFleet: 4 },
      { ward: 'Ward 21 - Old Bus Stand Market', zone: 'Central', cleanlinessScore: 84, activeFleet: 5 },
      { ward: 'Ward 35 - Machuvadi Residential', zone: 'East', cleanlinessScore: 88, activeFleet: 4 }
    ],
    mrfCenters: ['Kavanur Solid Waste Management Hub', 'Pudukkottai Compost Plant']
  },
  {
    id: 'nilgiris',
    name: 'The Nilgiris (Ooty)',
    tamilName: 'நீலகிரி',
    corporation: 'Udhagamandalam (Ooty) Municipality',
    headquarters: 'Commercial Road, Ooty',
    zones: 4,
    wards: 36,
    lat: 11.4102,
    lng: 76.6950,
    helpline: '0423-2442226',
    regCode: 'TN-43',
    dailyWasteTons: 110,
    segregationRate: 96,
    sampleWards: [
      { ward: 'Ward 5 - Ooty Lake & Botanical Garden', zone: 'Eco-Tourism', cleanlinessScore: 98, activeFleet: 5 },
      { ward: 'Ward 14 - Coonoor Tea Heritage', zone: 'Coonoor', cleanlinessScore: 96, activeFleet: 4 },
      { ward: 'Ward 26 - Charing Cross Central Market', zone: 'Central', cleanlinessScore: 91, activeFleet: 4 }
    ],
    mrfCenters: ['Kandal Hill-Eco Solid Waste Facility', 'Tea Board Plastic Ban Sorting Hub']
  },
  {
    id: 'dharmapuri',
    name: 'Dharmapuri',
    tamilName: 'தர்மபுரி',
    corporation: 'Dharmapuri Municipality',
    headquarters: 'Kandhasamy Vathiyar Street, Dharmapuri',
    zones: 3,
    wards: 33,
    lat: 12.1211,
    lng: 78.1582,
    helpline: '04342-260024',
    regCode: 'TN-29',
    dailyWasteTons: 140,
    segregationRate: 77,
    sampleWards: [
      { ward: 'Ward 7 - Hogenakkal Tourism Gateway', zone: 'West', cleanlinessScore: 90, activeFleet: 4 },
      { ward: 'Ward 18 - Four Roads Commercial', zone: 'Central', cleanlinessScore: 85, activeFleet: 5 },
      { ward: 'Ward 28 - Pennagaram Road', zone: 'North', cleanlinessScore: 83, activeFleet: 4 }
    ],
    mrfCenters: ['Adhiyamankottai Composting Hub', 'Dharmapuri MRF Depot']
  },
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram',
    tamilName: 'ராமநாதபுரம்',
    corporation: 'Ramanathapuram Municipality & Rameswaram',
    headquarters: 'Vandikkara Street, Ramanathapuram',
    zones: 3,
    wards: 33,
    lat: 9.3639,
    lng: 78.8395,
    helpline: '04567-220025',
    regCode: 'TN-65',
    dailyWasteTons: 160,
    segregationRate: 83,
    sampleWards: [
      { ward: 'Ward 4 - Rameswaram Temple Island', zone: 'Pilgrim Heritage', cleanlinessScore: 95, activeFleet: 6 },
      { ward: 'Ward 15 - Ramanathapuram Palace Belt', zone: 'Central', cleanlinessScore: 87, activeFleet: 5 },
      { ward: 'Ward 26 - Mandapam Coastal Marine', zone: 'Coastal', cleanlinessScore: 89, activeFleet: 4 }
    ],
    mrfCenters: ['Rameswaram Island Zero-Plastic MRF', 'Sakkarakottai Processing Facility']
  },
  {
    id: 'sivaganga',
    name: 'Sivaganga',
    tamilName: 'சிவகங்கை',
    corporation: 'Sivaganga & Karaikudi Municipality',
    headquarters: 'Koviloor Road, Karaikudi / Sivaganga',
    zones: 3,
    wards: 36,
    lat: 9.8433,
    lng: 78.4809,
    helpline: '04575-241246',
    regCode: 'TN-63',
    dailyWasteTons: 175,
    segregationRate: 81,
    sampleWards: [
      { ward: 'Ward 10 - Karaikudi Chettinad Heritage', zone: 'Chettinad', cleanlinessScore: 94, activeFleet: 5 },
      { ward: 'Ward 19 - Sivaganga Palace Square', zone: 'Central', cleanlinessScore: 88, activeFleet: 4 },
      { ward: 'Ward 29 - Alagappa University Outer', zone: 'Campus', cleanlinessScore: 92, activeFleet: 4 }
    ],
    mrfCenters: ['Karaikudi Chettinad MRF Hub', 'Sivaganga Compost Depot']
  },
  {
    id: 'theni',
    name: 'Theni',
    tamilName: 'தேனி',
    corporation: 'Theni Allinagaram Municipality',
    headquarters: 'Periyakulam Road, Theni',
    zones: 3,
    wards: 33,
    lat: 10.0104,
    lng: 77.4768,
    helpline: '04546-252345',
    regCode: 'TN-60',
    dailyWasteTons: 155,
    segregationRate: 84,
    sampleWards: [
      { ward: 'Ward 8 - Bodi Foothills Cardamom Hub', zone: 'West', cleanlinessScore: 91, activeFleet: 4 },
      { ward: 'Ward 17 - Allinagaram Commercial', zone: 'Central', cleanlinessScore: 88, activeFleet: 5 },
      { ward: 'Ward 27 - Vaigai Dam Highway Belt', zone: 'East', cleanlinessScore: 90, activeFleet: 4 }
    ],
    mrfCenters: ['Periyakulam Highway Compost Unit', 'Theni MRF Facility']
  },
  {
    id: 'tenkasi',
    name: 'Tenkasi',
    tamilName: 'தென்காசி',
    corporation: 'Tenkasi & Courtallam Municipality',
    headquarters: 'Amman Sannathi Street, Tenkasi',
    zones: 3,
    wards: 33,
    lat: 8.9594,
    lng: 77.3150,
    helpline: '04633-222340',
    regCode: 'TN-76',
    dailyWasteTons: 150,
    segregationRate: 86,
    sampleWards: [
      { ward: 'Ward 6 - Courtallam Falls Eco Zone', zone: 'Waterfalls Eco', cleanlinessScore: 96, activeFleet: 5 },
      { ward: 'Ward 16 - Kasi Viswanathar Temple Belt', zone: 'Heritage', cleanlinessScore: 90, activeFleet: 4 },
      { ward: 'Ward 25 - Tenkasi Junction Commercial', zone: 'Central', cleanlinessScore: 85, activeFleet: 4 }
    ],
    mrfCenters: ['Courtallam Eco-Tourism Waste Hub', 'Tenkasi Micro Composting Facility']
  },
  {
    id: 'tiruvannamalai',
    name: 'Tiruvannamalai',
    tamilName: 'திருவண்ணாமலை',
    corporation: 'Tiruvannamalai City Municipal Corporation',
    headquarters: 'Girivalam Path / Car Street, Tiruvannamalai',
    zones: 4,
    wards: 39,
    lat: 12.2253,
    lng: 79.0747,
    helpline: '04175-222234',
    regCode: 'TN-25 / TN-97',
    dailyWasteTons: 250,
    segregationRate: 89,
    sampleWards: [
      { ward: 'Ward 5 - 14-km Holy Girivalam Path', zone: 'Spiritual Heritage', cleanlinessScore: 98, activeFleet: 8 },
      { ward: 'Ward 14 - Annamalaiyar Temple Gopuram', zone: 'Central', cleanlinessScore: 94, activeFleet: 7 },
      { ward: 'Ward 27 - Vengikkal District Collectorate', zone: 'Admin', cleanlinessScore: 91, activeFleet: 5 }
    ],
    mrfCenters: ['Girivalam Zero-Waste Bio-Park', 'Vengikkal Solid Waste Processing Yard']
  },
  {
    id: 'ranipet',
    name: 'Ranipet',
    tamilName: 'ராணிப்பேட்டை',
    corporation: 'Ranipet & Walajapet Municipality',
    headquarters: 'MBTH Road, Ranipet',
    zones: 3,
    wards: 30,
    lat: 12.9272,
    lng: 79.3330,
    helpline: '04172-271255',
    regCode: 'TN-73',
    dailyWasteTons: 165,
    segregationRate: 78,
    sampleWards: [
      { ward: 'Ward 8 - SIPCOT Leather Cluster', zone: 'Industrial', cleanlinessScore: 84, activeFleet: 5 },
      { ward: 'Ward 16 - Walajapet Weavers Ward', zone: 'East', cleanlinessScore: 89, activeFleet: 4 },
      { ward: 'Ward 24 - BHEL Township Perimeter', zone: 'Township', cleanlinessScore: 95, activeFleet: 4 }
    ],
    mrfCenters: ['SIPCOT Industrial Waste Facility', 'Walajapet Sorting Shed']
  },
  {
    id: 'tirupathur',
    name: 'Tirupathur',
    tamilName: 'திருப்பத்தூர்',
    corporation: 'Tirupathur & Vaniyambadi Municipality',
    headquarters: 'Railway Station Road, Tirupathur',
    zones: 3,
    wards: 36,
    lat: 12.4965,
    lng: 78.5670,
    helpline: '04179-220033',
    regCode: 'TN-83',
    dailyWasteTons: 170,
    segregationRate: 77,
    sampleWards: [
      { ward: 'Ward 9 - Yelagiri Hills Gateway', zone: 'Tourism', cleanlinessScore: 92, activeFleet: 4 },
      { ward: 'Ward 18 - Vaniyambadi Leather Belt', zone: 'Industrial', cleanlinessScore: 81, activeFleet: 5 },
      { ward: 'Ward 29 - Ambur Footwear Cluster', zone: 'Footwear', cleanlinessScore: 84, activeFleet: 5 }
    ],
    mrfCenters: ['Ambur Leather & Rubber MRF', 'Tirupathur Composting Facility']
  },
  {
    id: 'tiruvallur',
    name: 'Tiruvallur',
    tamilName: 'திருவள்ளூர்',
    corporation: 'Avadi Municipal Corporation & Tiruvallur',
    headquarters: 'JN Road, Tiruvallur / Avadi',
    zones: 4,
    wards: 48,
    lat: 13.1433,
    lng: 79.9079,
    helpline: '044-27660234',
    regCode: 'TN-20',
    dailyWasteTons: 430,
    segregationRate: 80,
    sampleWards: [
      { ward: 'Ward 12 - Avadi Defence Estate', zone: 'Avadi', cleanlinessScore: 93, activeFleet: 7 },
      { ward: 'Ward 25 - Veeraraghava Temple Town', zone: 'Temple Town', cleanlinessScore: 91, activeFleet: 6 },
      { ward: 'Ward 38 - Sri City Expressway Corridor', zone: 'Industrial', cleanlinessScore: 88, activeFleet: 6 }
    ],
    mrfCenters: ['Avadi Paruthipattu Resource Park', 'Tiruvallur Municipal Composting Center']
  },
  {
    id: 'tiruvarur',
    name: 'Tiruvarur',
    tamilName: 'திருவாரூர்',
    corporation: 'Tiruvarur Municipality',
    headquarters: 'Panagal Road, Tiruvarur',
    zones: 3,
    wards: 30,
    lat: 10.7725,
    lng: 79.6366,
    helpline: '04366-222340',
    regCode: 'TN-50',
    dailyWasteTons: 130,
    segregationRate: 85,
    sampleWards: [
      { ward: 'Ward 6 - Thyagaraja Car Shed & Kamalalayam Lake', zone: 'Heritage Waterbody', cleanlinessScore: 95, activeFleet: 4 },
      { ward: 'Ward 15 - Old Bus Stand Market', zone: 'Commercial', cleanlinessScore: 86, activeFleet: 4 },
      { ward: 'Ward 25 - Medical College Campus Outer', zone: 'Campus', cleanlinessScore: 91, activeFleet: 4 }
    ],
    mrfCenters: ['Kamalalayam Lakefront Eco Depot', 'Tiruvarur Municipal Compost Shed']
  },
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    tamilName: 'நாகப்பட்டினம்',
    corporation: 'Nagapattinam & Velankanni Municipality',
    headquarters: 'Public Office Road, Nagapattinam',
    zones: 3,
    wards: 36,
    lat: 10.7672,
    lng: 79.8449,
    helpline: '04365-224422',
    regCode: 'TN-51',
    dailyWasteTons: 160,
    segregationRate: 82,
    sampleWards: [
      { ward: 'Ward 7 - Velankanni Basilica Pilgrim Shore', zone: 'Pilgrim Eco', cleanlinessScore: 96, activeFleet: 6 },
      { ward: 'Ward 16 - Nagapattinam Port & Fish Landing', zone: 'Port', cleanlinessScore: 83, activeFleet: 5 },
      { ward: 'Ward 28 - Nagore Dargah Heritage Perimeter', zone: 'Heritage', cleanlinessScore: 92, activeFleet: 5 }
    ],
    mrfCenters: ['Velankanni Clean Coast Facility', 'Nagapattinam Coastal Plastics MRF']
  },
  {
    id: 'mayiladuthurai',
    name: 'Mayiladuthurai',
    tamilName: 'மயிலாடுதுறை',
    corporation: 'Mayiladuthurai Municipality',
    headquarters: 'Kutchery Road, Mayiladuthurai',
    zones: 3,
    wards: 36,
    lat: 11.1075,
    lng: 79.6525,
    helpline: '04364-222355',
    regCode: 'TN-82',
    dailyWasteTons: 145,
    segregationRate: 83,
    sampleWards: [
      { ward: 'Ward 8 - Cauvery Thula Ghat Clean Zone', zone: 'River Heritage', cleanlinessScore: 94, activeFleet: 4 },
      { ward: 'Ward 18 - Mayuranathar Temple Outer', zone: 'Central', cleanlinessScore: 89, activeFleet: 5 },
      { ward: 'Ward 28 - Poompuhar Highway Belt', zone: 'East', cleanlinessScore: 86, activeFleet: 4 }
    ],
    mrfCenters: ['Cauvery Thula Ghat Composting Yard', 'Mayiladuthurai MRF Unit']
  },
  {
    id: 'ariyalur',
    name: 'Ariyalur',
    tamilName: 'அரியலூர்',
    corporation: 'Ariyalur Municipality',
    headquarters: 'Market Street, Ariyalur',
    zones: 2,
    wards: 18,
    lat: 11.1401,
    lng: 79.0786,
    helpline: '04329-222123',
    regCode: 'TN-61',
    dailyWasteTons: 95,
    segregationRate: 82,
    sampleWards: [
      { ward: 'Ward 4 - Cement Kiln Industrial Belt', zone: 'Industrial Kiln', cleanlinessScore: 90, activeFleet: 4 },
      { ward: 'Ward 10 - Ariyalur Bus Stand Central', zone: 'Central', cleanlinessScore: 87, activeFleet: 4 },
      { ward: 'Ward 16 - Gangaikonda Cholapuram Heritage Outer', zone: 'Heritage', cleanlinessScore: 96, activeFleet: 3 }
    ],
    mrfCenters: ['Cement Kiln Co-Processing RDF Depot', 'Ariyalur Municipal Compost Pit']
  },
  {
    id: 'perambalur',
    name: 'Perambalur',
    tamilName: 'பெரம்பலூர்',
    corporation: 'Perambalur Municipality',
    headquarters: 'Venkatesapuram, Perambalur',
    zones: 2,
    wards: 21,
    lat: 11.2333,
    lng: 78.8827,
    helpline: '04328-277150',
    regCode: 'TN-46',
    dailyWasteTons: 105,
    segregationRate: 80,
    sampleWards: [
      { ward: 'Ward 5 - NH-45 Highway Commercial Corridor', zone: 'Highway', cleanlinessScore: 88, activeFleet: 4 },
      { ward: 'Ward 12 - Old Bus Stand Market', zone: 'Central', cleanlinessScore: 85, activeFleet: 4 },
      { ward: 'Ward 19 - Collectorate Residential Complex', zone: 'Admin', cleanlinessScore: 92, activeFleet: 3 }
    ],
    mrfCenters: ['NH-45 Recovery Hub', 'Perambalur Bio-Waste Center']
  },
  {
    id: 'kallakurichi',
    name: 'Kallakurichi',
    tamilName: 'கள்ளக்குறிச்சி',
    corporation: 'Kallakurichi Municipality',
    headquarters: 'Salem Main Road, Kallakurichi',
    zones: 2,
    wards: 21,
    lat: 11.7381,
    lng: 78.9634,
    helpline: '04151-222340',
    regCode: 'TN-15',
    dailyWasteTons: 115,
    segregationRate: 79,
    sampleWards: [
      { ward: 'Ward 6 - Kalrayan Hills Foothills Zone', zone: 'West', cleanlinessScore: 91, activeFleet: 4 },
      { ward: 'Ward 12 - Salem Main Road Commercial', zone: 'Central', cleanlinessScore: 86, activeFleet: 4 },
      { ward: 'Ward 18 - Sugar Mill Industrial Corridor', zone: 'East', cleanlinessScore: 84, activeFleet: 3 }
    ],
    mrfCenters: ['Kallakurichi Agro-Waste Compost Depot', 'Central Sorting Yard']
  },
  {
    id: 'villupuram',
    name: 'Villupuram',
    tamilName: 'விழுப்புரம்',
    corporation: 'Villupuram Municipality',
    headquarters: 'East Pondy Road, Villupuram',
    zones: 4,
    wards: 42,
    lat: 11.9401,
    lng: 79.4861,
    helpline: '04146-222340',
    regCode: 'TN-32',
    dailyWasteTons: 210,
    segregationRate: 78,
    sampleWards: [
      { ward: 'Ward 9 - Railway Junction Station Road', zone: 'Junction', cleanlinessScore: 87, activeFleet: 5 },
      { ward: 'Ward 21 - East Pondy Road Commercial', zone: 'Central', cleanlinessScore: 84, activeFleet: 5 },
      { ward: 'Ward 33 - Old Town Market', zone: 'West', cleanlinessScore: 82, activeFleet: 4 }
    ],
    mrfCenters: ['Vazhudhareddy Waste Processing Facility', 'East Pondy Composting Depot']
  }
];

const DistrictContext = createContext(null);

export const DistrictProvider = ({ children }) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState(() => {
    try {
      return localStorage.getItem('ecoreward_district_id') || 'coimbatore';
    } catch {
      return 'coimbatore';
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === selectedDistrictId) || TAMIL_NADU_DISTRICTS[1]; // default Coimbatore

  const setDistrict = (districtId) => {
    const found = TAMIL_NADU_DISTRICTS.find(d => d.id === districtId);
    if (found) {
      setSelectedDistrictId(found.id);
      try {
        localStorage.setItem('ecoreward_district_id', found.id);
      } catch (err) {
        console.warn('Could not persist district to localStorage', err);
      }
      triggerHaptic(25);
    }
  };

  const filteredDistricts = TAMIL_NADU_DISTRICTS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.tamilName.includes(searchQuery) ||
    d.corporation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DistrictContext.Provider value={{
      currentDistrict,
      selectedDistrictId,
      setDistrict,
      districts: TAMIL_NADU_DISTRICTS,
      openDistrictModal: () => {
        triggerHaptic(20);
        setIsModalOpen(true);
      },
      closeDistrictModal: () => setIsModalOpen(false)
    }}>
      {children}

      {/* Global 38 Tamil Nadu Districts Selector Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-emerald-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-white/20">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                      Tamil Nadu Districts
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200 font-bold border border-emerald-400/30">
                        38 Districts
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      Select your municipal corporation or local jurisdiction
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl px-3.5 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <FaSearch className="text-slate-400 text-sm mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any of 38 TN Districts (e.g. Madurai, சென்னை, Salem)..."
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
              </div>

              {/* District List with Natural Smooth Scroll */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
                {filteredDistricts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs font-semibold">No district found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredDistricts.map((d) => {
                    const isSelected = d.id === currentDistrict.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setDistrict(d.id);
                          setIsModalOpen(false);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {d.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                {d.name}
                              </h4>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {d.tamilName}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {d.corporation}
                            </p>
                            <div className="flex items-center space-x-2 text-[9px] text-slate-400 pt-0.5">
                              <span>🏛️ {d.wards} Wards</span>
                              <span>•</span>
                              <span>🚚 {d.dailyWasteTons} T/day</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {d.segregationRate}% Segregated
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                            <FaCheck className="text-xs" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Active: <strong className="text-emerald-600 dark:text-emerald-400">{currentDistrict.name}</strong></span>
                <span className="text-[10px] text-slate-400">Helpline: {currentDistrict.helpline}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DistrictContext.Provider>
  );
};

export const useDistrict = () => {
  const context = useContext(DistrictContext);
  if (!context) {
    throw new Error('useDistrict must be used within a DistrictProvider');
  }
  return context;
};
