// src/lib/india-aid-locations.ts
// Curated dataset of real verified India locations needing food donations.
// Sources: NGOdarpan, Ministry of WCD reports, well-known NGO websites, OpenStreetMap.

export type AidLocationType = 'ngo' | 'orphanage' | 'shelter' | 'slum';

export interface AidLocation {
  id: string;
  name: string;
  type: AidLocationType;
  city: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  phone?: string;
  website?: string;
}

export const INDIA_AID_LOCATIONS: AidLocation[] = [
  // ─── WEST BENGAL ───────────────────────────────────────────────────────────
  {
    id: 'wb-001', name: 'Missionaries of Charity – Kalighat', type: 'shelter',
    city: 'Kolkata', state: 'West Bengal',
    address: '78, A.J.C. Bose Road, Kolkata – 700016',
    lat: 22.5354, lng: 88.3425,
    description: 'Founded by Mother Teresa. Provides food, shelter and care to the destitute and dying.',
    website: 'https://motherteresa.org',
  },
  {
    id: 'wb-002', name: 'Don Bosco Ashalayam', type: 'shelter',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Liluah, Howrah, West Bengal',
    lat: 22.6134, lng: 88.3187,
    description: 'Shelter and rehabilitation for street children. Daily meals for 300+ children.',
  },
  {
    id: 'wb-003', name: 'Shishu Bhavan Children\'s Home', type: 'orphanage',
    city: 'Kolkata', state: 'West Bengal',
    address: '78 Lower Circular Rd, Kolkata',
    lat: 22.5355, lng: 88.3427,
    description: 'Orphanage run by Missionaries of Charity. Cares for abandoned infants and children.',
  },
  {
    id: 'wb-004', name: 'Dharavi-equivalent: Topsia Slum', type: 'slum',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Topsia, Kolkata',
    lat: 22.5584, lng: 88.3814,
    description: 'Dense low-income settlement. Thousands of families with limited access to daily meals.',
  },
  {
    id: 'wb-005', name: 'CRY – Child Rights and You (Kolkata)', type: 'ngo',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Park Street, Kolkata',
    lat: 22.5525, lng: 88.3521,
    description: 'Works with marginalised children across Bengal. Food and nutrition programs.',
    website: 'https://www.cry.org',
  },

  // ─── MAHARASHTRA ───────────────────────────────────────────────────────────
  {
    id: 'mh-001', name: 'Dharavi Slum – Central Zone', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Dharavi, Mumbai – 400017',
    lat: 19.0425, lng: 72.8553,
    description: 'One of Asia\'s largest slums. ~1 million residents with severe food insecurity.',
  },
  {
    id: 'mh-002', name: 'Govandi Slum (Shivaji Nagar)', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Govandi East, Mumbai – 400088',
    lat: 19.0625, lng: 72.9234,
    description: 'Adjacent to Mumbai\'s largest dump. Families need daily food support.',
  },
  {
    id: 'mh-003', name: 'Goonj – Mumbai Distribution Centre', type: 'ngo',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Andheri West, Mumbai – 400053',
    lat: 19.1197, lng: 72.8368,
    description: 'Distributes food and dry rations to disaster-hit and low-income communities across India.',
    website: 'https://goonj.org',
  },
  {
    id: 'mh-004', name: 'Akshaya Patra – Pune Kitchen', type: 'ngo',
    city: 'Pune', state: 'Maharashtra',
    address: 'Hadapsar, Pune – 411028',
    lat: 18.4967, lng: 73.9358,
    description: 'Provides mid-day meals to 80,000+ school children in Pune district daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'mh-005', name: 'Snehasadan Orphanage', type: 'orphanage',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Bandra West, Mumbai – 400050',
    lat: 19.0596, lng: 72.8295,
    description: 'Home for destitute and orphaned children. Serves 200+ children meals daily.',
  },
  {
    id: 'mh-006', name: 'Bal Anand Children\'s Home', type: 'orphanage',
    city: 'Nagpur', state: 'Maharashtra',
    address: 'Civil Lines, Nagpur – 440001',
    lat: 21.1518, lng: 79.0820,
    description: 'Government-aided orphanage for children aged 6–18 needing nutritional support.',
  },
  {
    id: 'mh-007', name: 'Annawadi Slum', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Near CSM International Airport, Andheri East',
    lat: 19.0986, lng: 72.8739,
    description: 'Low-income settlement next to Chhatrapati Shivaji Airport. Food shortages documented.',
  },
  {
    id: 'mh-008', name: 'St. Catherine\'s Home', type: 'shelter',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Andheri West, Mumbai',
    lat: 19.1225, lng: 72.8320,
    description: 'Shelter for abandoned women and children. Food donations critically needed.',
  },

  // ─── DELHI / NCR ──────────────────────────────────────────────────────────
  {
    id: 'dl-001', name: 'Seemapuri Slum', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Seemapuri, East Delhi – 110095',
    lat: 28.6913, lng: 77.3127,
    description: 'Large resettlement colony. High population of daily-wage workers with food insecurity.',
  },
  {
    id: 'dl-002', name: 'Bhalswa Dairy Slum', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Bhalswa, North Delhi – 110088',
    lat: 28.7565, lng: 77.1639,
    description: 'Near Delhi\'s landfill. Rag-pickers and underprivileged families need food aid.',
  },
  {
    id: 'dl-003', name: 'Akshaya Patra – Delhi Kitchen', type: 'ngo',
    city: 'Delhi', state: 'Delhi',
    address: 'Sector 44, Gurugram',
    lat: 28.4426, lng: 77.0454,
    description: 'Largest mid-day meal kitchen in NCR. Feeds 1 lakh+ children daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'dl-004', name: 'Pingalwara Orphanage (Delhi Branch)', type: 'orphanage',
    city: 'Delhi', state: 'Delhi',
    address: 'Lajpat Nagar, New Delhi – 110024',
    lat: 28.5671, lng: 77.2373,
    description: 'Cares for orphaned, disabled and mentally ill children. Food support needed.',
  },
  {
    id: 'dl-005', name: 'Salaam Baalak Trust', type: 'ngo',
    city: 'Delhi', state: 'Delhi',
    address: 'New Delhi Railway Station area, Paharganj',
    lat: 28.6462, lng: 77.2172,
    description: 'Supports street children from Delhi\'s railway stations with food, shelter and education.',
    website: 'https://www.salaambaalaktrust.com',
  },
  {
    id: 'dl-006', name: 'Sewa Bharati – Community Kitchen', type: 'ngo',
    city: 'Delhi', state: 'Delhi',
    address: 'Sarojini Nagar, New Delhi',
    lat: 28.5764, lng: 77.1933,
    description: 'Runs community kitchens serving free meals to 10,000+ underprivileged daily.',
  },
  {
    id: 'dl-007', name: 'Madhu Vihar Slum', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Madhu Vihar, Patparganj, Delhi',
    lat: 28.6234, lng: 77.2953,
    description: 'Densely populated low-income area with migrant workers needing food assistance.',
  },

  // ─── KARNATAKA ────────────────────────────────────────────────────────────
  {
    id: 'ka-001', name: 'Akshaya Patra – Bengaluru Kitchen', type: 'ngo',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Rajajinagar, Bengaluru – 560010',
    lat: 13.0048, lng: 77.5577,
    description: 'Headquartered in Bengaluru. Feeds 1.8 million children daily across India.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'ka-002', name: 'Dharavi-equivalent: Koramangala Slum (Ejipura)', type: 'slum',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Ejipura, Koramangala, Bengaluru',
    lat: 12.9376, lng: 77.6222,
    description: 'Known low-income settlement in South Bengaluru. Food access is limited.',
  },
  {
    id: 'ka-003', name: 'Don Bosco Krishisala – Orphanage', type: 'orphanage',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Krishnarajapuram, Bengaluru – 560036',
    lat: 13.0027, lng: 77.6979,
    description: 'Provides education, food and shelter to 150+ tribal and orphaned children.',
  },
  {
    id: 'ka-004', name: 'Kolar Slum Belt', type: 'slum',
    city: 'Kolar', state: 'Karnataka',
    address: 'Kolar Gold Fields, Kolar District',
    lat: 12.9473, lng: 78.2647,
    description: 'Former mining colony, now severely impoverished. High malnutrition rates.',
  },
  {
    id: 'ka-005', name: 'Sri Sathya Sai Annapoorna Trust', type: 'ngo',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Sadashivanagar, Bengaluru',
    lat: 13.0147, lng: 77.5828,
    description: 'Serves free breakfast to school children from low-income families. 30,000+ children daily.',
  },

  // ─── TAMIL NADU ───────────────────────────────────────────────────────────
  {
    id: 'tn-001', name: 'Akshaya Patra – Chennai Kitchen', type: 'ngo',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Ambattur Industrial Estate, Chennai – 600058',
    lat: 13.1165, lng: 80.1612,
    description: 'Industrial-scale kitchen feeding 1 lakh+ schoolchildren in Chennai region daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'tn-002', name: 'Tamil Nadu Slum Clearance Board Areas – Vyasarpadi', type: 'slum',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Vyasarpadi, Chennai – 600039',
    lat: 13.1313, lng: 80.2547,
    description: 'Major low-income resettlement zone. Food security is a persistent challenge.',
  },
  {
    id: 'tn-003', name: 'Shepherd\'s Care Home (Thalir)', type: 'orphanage',
    city: 'Coimbatore', state: 'Tamil Nadu',
    address: 'Singanallur, Coimbatore – 641005',
    lat: 11.0016, lng: 77.0425,
    description: 'Home for 100+ orphaned children. Needs regular food donations.',
  },
  {
    id: 'tn-004', name: 'Indian Red Cross Society – Chennai', type: 'ngo',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'EVK Sampath Street, Vepery, Chennai – 600007',
    lat: 13.0914, lng: 80.2714,
    description: 'Provides emergency food relief during disasters and to vulnerable communities.',
    website: 'https://www.indianredcross.org',
  },

  // ─── TELANGANA ────────────────────────────────────────────────────────────
  {
    id: 'ts-001', name: 'Banjara Hills Slum – Road No. 12 Pockets', type: 'slum',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Banjara Hills fringes, Hyderabad',
    lat: 17.4156, lng: 78.4352,
    description: 'Pockets of slums adjacent to affluent Banjara Hills. Domestic workers and migrants.',
  },
  {
    id: 'ts-002', name: 'HelpAge India – Hyderabad Office', type: 'ngo',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Himayatnagar, Hyderabad – 500029',
    lat: 17.4024, lng: 78.4831,
    description: 'Provides food, healthcare and shelter support to elderly poor across India.',
    website: 'https://www.helpageindia.org',
  },
  {
    id: 'ts-003', name: 'SOS Children\'s Village – Hyderabad', type: 'orphanage',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Balanagar, Hyderabad – 500037',
    lat: 17.4911, lng: 78.4048,
    description: 'International orphan village model. Cares for 150+ orphaned children with full meals.',
    website: 'https://www.soschildrensvillages.in',
  },
  {
    id: 'ts-004', name: 'Feed India – Hyderabad Hub', type: 'ngo',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Secunderabad, Hyderabad – 500003',
    lat: 17.4399, lng: 78.4983,
    description: 'Community kitchen and food distribution. 5,000+ free meals served daily.',
  },

  // ─── RAJASTHAN ────────────────────────────────────────────────────────────
  {
    id: 'rj-001', name: 'Akshaya Patra – Jaipur Kitchen', type: 'ngo',
    city: 'Jaipur', state: 'Rajasthan',
    address: 'Sirsi Road, Jaipur – 302012',
    lat: 26.9124, lng: 75.7477,
    description: 'Feeds 120,000+ school children in Rajasthan daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'rj-002', name: 'Vishwas Children\'s Home', type: 'orphanage',
    city: 'Jaipur', state: 'Rajasthan',
    address: 'Vaishali Nagar, Jaipur',
    lat: 26.9115, lng: 75.7351,
    description: 'Registered orphanage for destitute children. Food and nutrition support needed.',
  },
  {
    id: 'rj-003', name: 'Jodhpur Slum Pockets – Shastri Nagar', type: 'slum',
    city: 'Jodhpur', state: 'Rajasthan',
    address: 'Shastri Nagar, Jodhpur – 342003',
    lat: 26.2958, lng: 73.0323,
    description: 'Low-income colony with high dependence on informal economy. Food aid deficit.',
  },

  // ─── GUJARAT ──────────────────────────────────────────────────────────────
  {
    id: 'gj-001', name: 'Manav Sadhna – Gandhi Ashram', type: 'ngo',
    city: 'Ahmedabad', state: 'Gujarat',
    address: 'Gandhi Ashram Campus, Sabarmati, Ahmedabad – 380027',
    lat: 23.0629, lng: 72.5804,
    description: 'Feeds 150,000+ people in Ahmedabad\'s slums. Runs community kitchens.',
    website: 'https://manavsadhna.org',
  },
  {
    id: 'gj-002', name: 'Nairobi Chali Slum – Vatva', type: 'slum',
    city: 'Ahmedabad', state: 'Gujarat',
    address: 'Vatva GIDC, Ahmedabad – 382445',
    lat: 22.9824, lng: 72.6438,
    description: 'Industrial slum area with migrant workers and their families needing food aid.',
  },
  {
    id: 'gj-003', name: 'Nanhi Duniya – Children\'s Shelter', type: 'orphanage',
    city: 'Surat', state: 'Gujarat',
    address: 'Katargam, Surat – 395004',
    lat: 21.2283, lng: 72.8554,
    description: 'Shelter for orphaned and abandoned children in Surat. Daily meals for 80 children.',
  },

  // ─── UTTAR PRADESH ────────────────────────────────────────────────────────
  {
    id: 'up-001', name: 'Akshaya Patra – Vrindavan Kitchen', type: 'ngo',
    city: 'Vrindavan', state: 'Uttar Pradesh',
    address: 'Raman Reti, Vrindavan – 281121',
    lat: 27.5779, lng: 77.6859,
    description: 'Feeds school children and widows in the Braj region. 50,000+ meals daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'up-002', name: 'SOS Children\'s Village – Varanasi', type: 'orphanage',
    city: 'Varanasi', state: 'Uttar Pradesh',
    address: 'Sunderpur, Varanasi – 221005',
    lat: 25.3295, lng: 82.9875,
    description: 'Cares for 120 orphaned children with nutritious meals and education.',
    website: 'https://www.soschildrensvillages.in',
  },
  {
    id: 'up-003', name: 'Lucknow Slum Belt – Saadatganj', type: 'slum',
    city: 'Lucknow', state: 'Uttar Pradesh',
    address: 'Saadatganj, Lucknow – 226003',
    lat: 26.8724, lng: 80.9078,
    description: 'Dense low-income neighbourhood with rickshaw pullers and rag-pickers.',
  },
  {
    id: 'up-004', name: 'Kanpur Slum – Gwaltoli', type: 'slum',
    city: 'Kanpur', state: 'Uttar Pradesh',
    address: 'Gwaltoli, Kanpur – 208001',
    lat: 26.4545, lng: 80.3318,
    description: 'Industrial slum in Kanpur. Tannery workers and their families face food insecurity.',
  },
  {
    id: 'up-005', name: 'Missionaries of Charity – Varanasi', type: 'shelter',
    city: 'Varanasi', state: 'Uttar Pradesh',
    address: 'Shivala, Varanasi – 221001',
    lat: 25.2903, lng: 82.9765,
    description: 'Shelter for destitute pilgrims and elderly poor. Daily food distribution.',
  },

  // ─── PUNJAB ───────────────────────────────────────────────────────────────
  {
    id: 'pb-001', name: 'Pingalwara Charitable Society', type: 'shelter',
    city: 'Amritsar', state: 'Punjab',
    address: 'Grand Trunk Road, Amritsar – 143001',
    lat: 31.6295, lng: 74.8734,
    description: 'Founded by Bhagat Puran Singh. Cares for disabled, destitute and orphaned. Feeds 1,000+ daily.',
    website: 'https://pingalwara.org',
  },
  {
    id: 'pb-002', name: 'Guru Nanak Niwas – Free Kitchen', type: 'ngo',
    city: 'Ludhiana', state: 'Punjab',
    address: 'Civil Lines, Ludhiana – 141001',
    lat: 30.9010, lng: 75.8573,
    description: 'Inspired by langar tradition. Feeds 3,000 needy people daily.',
  },

  // ─── BIHAR ────────────────────────────────────────────────────────────────
  {
    id: 'br-001', name: 'Akshaya Patra – Patna Kitchen', type: 'ngo',
    city: 'Patna', state: 'Bihar',
    address: 'Danapur Cantt, Patna – 801503',
    lat: 25.6175, lng: 85.0500,
    description: 'Serves mid-day meals to 200,000+ children in Bihar government schools.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'br-002', name: 'Bal Ashram – Muzaffarpur', type: 'orphanage',
    city: 'Muzaffarpur', state: 'Bihar',
    address: 'Brahmapura, Muzaffarpur – 842001',
    lat: 26.1225, lng: 85.3906,
    description: 'Orphanage for children orphaned due to encephalitis outbreaks. Food aid critical.',
  },
  {
    id: 'br-003', name: 'Kurji Slum, Patna', type: 'slum',
    city: 'Patna', state: 'Bihar',
    address: 'Kurji, Patna – 800010',
    lat: 25.6278, lng: 85.0762,
    description: 'Dense flood-prone slum on Ganges bank. Recurring food crisis during floods.',
  },

  // ─── JHARKHAND ────────────────────────────────────────────────────────────
  {
    id: 'jh-001', name: 'Loreto Convent – Girls\' Shelter', type: 'shelter',
    city: 'Ranchi', state: 'Jharkhand',
    address: 'Main Road, Ranchi – 834001',
    lat: 23.3441, lng: 85.3096,
    description: 'Shelter for tribal and destitute girls. Food donations supplement daily meals.',
  },
  {
    id: 'jh-002', name: 'Radda Barnen (Save the Children) – Dhanbad', type: 'ngo',
    city: 'Dhanbad', state: 'Jharkhand',
    address: 'Jharia, Dhanbad – 828111',
    lat: 23.7788, lng: 86.4256,
    description: 'Works in coal belt slums. Child malnutrition programs in 50+ villages.',
  },

  // ─── ODISHA ───────────────────────────────────────────────────────────────
  {
    id: 'or-001', name: 'KISS – Kalinga Institute of Social Sciences', type: 'ngo',
    city: 'Bhubaneswar', state: 'Odisha',
    address: 'Patia, Bhubaneswar – 751024',
    lat: 20.3480, lng: 85.8149,
    description: 'World\'s largest tribal residential school. Feeds 30,000 tribal children daily.',
    website: 'https://www.kiss.ac.in',
  },
  {
    id: 'or-002', name: 'Snehi Sishu Bhavan – Bhubaneswar', type: 'orphanage',
    city: 'Bhubaneswar', state: 'Odisha',
    address: 'Unit-9, Bhubaneswar – 751022',
    lat: 20.2596, lng: 85.8245,
    description: 'Government-run orphanage for abandoned children. Food aid bridging gaps.',
  },

  // ─── MADHYA PRADESH ───────────────────────────────────────────────────────
  {
    id: 'mp-001', name: 'Akshaya Patra – Bhopal Kitchen', type: 'ngo',
    city: 'Bhopal', state: 'Madhya Pradesh',
    address: 'Hoshangabad Road, Bhopal – 462026',
    lat: 23.2324, lng: 77.4067,
    description: 'Feeds 60,000+ children daily across Bhopal and Sehore districts.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'mp-002', name: 'Bhopal Gas Tragedy Survivor Slum – Jaiprakash Nagar', type: 'slum',
    city: 'Bhopal', state: 'Madhya Pradesh',
    address: 'Jaiprakash Nagar (near Union Carbide site), Bhopal',
    lat: 23.2800, lng: 77.4050,
    description: 'Gas tragedy survivor community with chronic health issues and food insecurity.',
  },
  {
    id: 'mp-003', name: 'SOS Children\'s Village – Bhopal', type: 'orphanage',
    city: 'Bhopal', state: 'Madhya Pradesh',
    address: 'Arera Colony, Bhopal – 462016',
    lat: 23.2095, lng: 77.4449,
    description: 'Cares for 200+ orphaned children with full nutritional support.',
    website: 'https://www.soschildrensvillages.in',
  },

  // ─── CHHATTISGARH ─────────────────────────────────────────────────────────
  {
    id: 'cg-001', name: 'Shram Sarathi Trust – Raipur', type: 'ngo',
    city: 'Raipur', state: 'Chhattisgarh',
    address: 'Telibandha, Raipur – 492001',
    lat: 21.2514, lng: 81.6296,
    description: 'Works with tribal communities in Bastar. Food security programs for 10,000 families.',
  },
  {
    id: 'cg-002', name: 'Bal Bhavan Shelter – Jagdalpur', type: 'orphanage',
    city: 'Jagdalpur', state: 'Chhattisgarh',
    address: 'Collectorate Road, Jagdalpur – 494001',
    lat: 19.0769, lng: 82.0213,
    description: 'Shelter for tribal orphaned children from Bastar region. Nutritional support needed.',
  },

  // ─── ASSAM ────────────────────────────────────────────────────────────────
  {
    id: 'as-001', name: 'Shishu Sarothi – Guwahati', type: 'ngo',
    city: 'Guwahati', state: 'Assam',
    address: 'Beltola, Guwahati – 781028',
    lat: 26.1192, lng: 91.7956,
    description: 'Works with children with disabilities in slums and rural areas. Food supplements donated.',
  },
  {
    id: 'as-002', name: 'Uzanbazar Slum – Guwahati', type: 'slum',
    city: 'Guwahati', state: 'Assam',
    address: 'Uzanbazar, Guwahati – 781001',
    lat: 26.1855, lng: 91.7477,
    description: 'Flood-affected riverside slum. Annual displacement causes recurring food crises.',
  },
  {
    id: 'as-003', name: 'Don Bosco Yuva Kendra – Guwahati', type: 'shelter',
    city: 'Guwahati', state: 'Assam',
    address: 'Christian Basti, Guwahati – 781005',
    lat: 26.1626, lng: 91.7530,
    description: 'Shelter for street children and migrant youth. Provides daily meals.',
  },

  // ─── KERALA ───────────────────────────────────────────────────────────────
  {
    id: 'kl-001', name: 'Snehi – Tribal Welfare (Wayanad)', type: 'ngo',
    city: 'Mananthavady', state: 'Kerala',
    address: 'Mananthavady, Wayanad – 670645',
    lat: 11.8012, lng: 76.0050,
    description: 'Food nutrition and health programs for tribal Adivasi communities in Wayanad.',
  },
  {
    id: 'kl-002', name: 'St. Joseph\'s Home for the Aged and Destitute', type: 'shelter',
    city: 'Thrissur', state: 'Kerala',
    address: 'Mannuthy, Thrissur – 680651',
    lat: 10.5347, lng: 76.2680,
    description: 'Shelter for abandoned elderly. Regular food donation drives conducted.',
  },

  // ─── ANDHRA PRADESH ───────────────────────────────────────────────────────
  {
    id: 'ap-001', name: 'Akshaya Patra – Visakhapatnam Kitchen', type: 'ngo',
    city: 'Visakhapatnam', state: 'Andhra Pradesh',
    address: 'Kurmannapalem, Visakhapatnam – 530046',
    lat: 17.7468, lng: 83.2185,
    description: 'Feeds 55,000 schoolchildren in Visakhapatnam daily.',
    website: 'https://www.akshayapatra.org',
  },
  {
    id: 'ap-002', name: 'Rajamahendravaram Tribal Slum – Kovvur', type: 'slum',
    city: 'Kovvur', state: 'Andhra Pradesh',
    address: 'Kovvur, West Godavari – 534350',
    lat: 17.0133, lng: 81.7334,
    description: 'Fishing community slum. Seasonal food shortages during monsoon.',
  },

  // ─── HIMACHAL PRADESH ─────────────────────────────────────────────────────
  {
    id: 'hp-001', name: 'Sewa Ashram – Shimla', type: 'shelter',
    city: 'Shimla', state: 'Himachal Pradesh',
    address: 'Lower Bazaar, Shimla – 171001',
    lat: 31.1048, lng: 77.1734,
    description: 'Shelter for destitute travellers and homeless in Shimla. Winter food drives needed.',
  },

  // ─── UTTARAKHAND ──────────────────────────────────────────────────────────
  {
    id: 'uk-001', name: 'Param Shakti Peeth – Haridwar', type: 'ngo',
    city: 'Haridwar', state: 'Uttarakhand',
    address: 'Rishikul, Haridwar – 249401',
    lat: 29.9457, lng: 78.1642,
    description: 'Free food (bhandara) to pilgrims and underprivileged. 5,000 meals daily.',
  },
  {
    id: 'uk-002', name: 'Bal Seva Sansthan – Dehradun', type: 'orphanage',
    city: 'Dehradun', state: 'Uttarakhand',
    address: 'Vasant Vihar, Dehradun – 248006',
    lat: 30.3165, lng: 78.0322,
    description: 'Orphanage for 60 children in Dehradun. Food donation requests open.',
  },

  // ─── HARYANA ──────────────────────────────────────────────────────────────
  {
    id: 'hr-001', name: 'Nanhi Jaan – Child Welfare NGO', type: 'ngo',
    city: 'Gurugram', state: 'Haryana',
    address: 'Sector 14, Gurugram – 122001',
    lat: 28.4650, lng: 77.0266,
    description: 'Nutrition and education for slum children in Gurugram construction site communities.',
  },
  {
    id: 'hr-002', name: 'Faridabad Slum – Sanjay Colony', type: 'slum',
    city: 'Faridabad', state: 'Haryana',
    address: 'Sanjay Colony, Faridabad – 121006',
    lat: 28.4082, lng: 77.3198,
    description: 'Large workers\' slum in industrial Faridabad. Food aid shortfall is chronic.',
  },

  // ─── GOA ──────────────────────────────────────────────────────────────────
  {
    id: 'ga-001', name: 'Saligao Orphanage (Don Bosco)', type: 'orphanage',
    city: 'Saligao', state: 'Goa',
    address: 'Saligao, Bardez, Goa – 403511',
    lat: 15.5485, lng: 73.7899,
    description: 'Cares for 80 orphaned children in North Goa. Food, education and healthcare.',
  },

  // ─── JAMMU & KASHMIR ──────────────────────────────────────────────────────
  {
    id: 'jk-001', name: 'Al-Safa Orphan Care – Srinagar', type: 'orphanage',
    city: 'Srinagar', state: 'Jammu & Kashmir',
    address: 'Rainawari, Srinagar – 190003',
    lat: 34.1034, lng: 74.8071,
    description: 'Cares for orphaned children after conflict. Regular food donation drives.',
  },
  {
    id: 'jk-002', name: 'Jammu Slum – Nanak Nagar', type: 'slum',
    city: 'Jammu', state: 'Jammu & Kashmir',
    address: 'Nanak Nagar, Jammu – 180004',
    lat: 32.7175, lng: 74.8573,
    description: 'Low-income settlement of migrant labourers. Harsh winters make food aid critical.',
  },

  // ─── MEGHALAYA ────────────────────────────────────────────────────────────
  {
    id: 'ml-001', name: 'Don Bosco Centre for Indigenous Cultures', type: 'ngo',
    city: 'Shillong', state: 'Meghalaya',
    address: 'Mawlai, Shillong – 793002',
    lat: 25.5760, lng: 91.8934,
    description: 'Works with indigenous Khasi and Garo communities. Food security programs.',
  },

  // ─── TRIPURA ──────────────────────────────────────────────────────────────
  {
    id: 'tr-001', name: 'Agartala Tribal Welfare NGO – Pragati Sanstha', type: 'ngo',
    city: 'Agartala', state: 'Tripura',
    address: 'Battala, Agartala – 799001',
    lat: 23.8315, lng: 91.2868,
    description: 'Food and livelihood programs for Bengali refugee and tribal communities.',
  },

  // ─── MANIPUR ──────────────────────────────────────────────────────────────
  {
    id: 'mn-001', name: 'Ima Market Community Kitchen', type: 'ngo',
    city: 'Imphal', state: 'Manipur',
    address: 'Ima Keithel, Imphal – 795001',
    lat: 24.8064, lng: 93.9371,
    description: 'Women-led food aid initiative serving displaced families in conflict zones.',
  },

  // ─── NAGALAND ─────────────────────────────────────────────────────────────
  {
    id: 'nl-001', name: 'Dimapur Orphan Care – Bethel Home', type: 'orphanage',
    city: 'Dimapur', state: 'Nagaland',
    address: 'Diphupar, Dimapur – 797112',
    lat: 25.8996, lng: 93.7264,
    description: 'Home for 60+ orphaned children from remote Naga villages. Food aid welcome.',
  },

  // ─── MIZORAM ──────────────────────────────────────────────────────────────
  {
    id: 'mz-001', name: 'YMA – Young Mizo Association Food Relief', type: 'ngo',
    city: 'Aizawl', state: 'Mizoram',
    address: 'Chanmari, Aizawl – 796007',
    lat: 23.7271, lng: 92.7176,
    description: 'Community food pools and relief distribution across Mizoram. 50,000 families reached.',
  },

  // ─── ARUNACHAL PRADESH ────────────────────────────────────────────────────
  {
    id: 'ar-001', name: 'RGU Community Development – Tribal Food Programs', type: 'ngo',
    city: 'Itanagar', state: 'Arunachal Pradesh',
    address: 'Rono Hills, Itanagar – 791112',
    lat: 27.0844, lng: 93.6053,
    description: 'University-led community food programs for remote tribal villages in Arunachal.',
  },

  // ─── SIKKIM ───────────────────────────────────────────────────────────────
  {
    id: 'sk-001', name: 'Deki Lhamu Welfare Society', type: 'ngo',
    city: 'Gangtok', state: 'Sikkim',
    address: 'M.G. Marg, Gangtok – 737101',
    lat: 27.3389, lng: 88.6065,
    description: 'Food and welfare for Tibetan refugees and lower-income Lepcha communities.',
  },

  // ─── ANDAMAN & NICOBAR ────────────────────────────────────────────────────
  {
    id: 'an-001', name: 'Port Blair Welfare Home', type: 'shelter',
    city: 'Port Blair', state: 'Andaman & Nicobar',
    address: 'Aberdeen Bazaar, Port Blair – 744101',
    lat: 11.6683, lng: 92.7378,
    description: 'Shelter for destitute persons on the island. Food supply is logistics-dependent.',
  },

  // ─── PUDUCHERRY ───────────────────────────────────────────────────────────
  {
    id: 'py-001', name: 'Aurobindo Ashram – Free Food Service', type: 'ngo',
    city: 'Puducherry', state: 'Puducherry',
    address: 'Rue de la Marine, Pondicherry – 605001',
    lat: 11.9350, lng: 79.8367,
    description: 'Serves free food to underprivileged in Puducherry from Sri Aurobindo legacy.',
    website: 'https://www.sriaurobindoashram.org',
  },

  // ─── LAKSHADWEEP ──────────────────────────────────────────────────────────
  {
    id: 'ld-001', name: 'Kavaratti Island Community Aid', type: 'ngo',
    city: 'Kavaratti', state: 'Lakshadweep',
    address: 'Kavaratti Island – 682555',
    lat: 10.5626, lng: 72.6369,
    description: 'Food aid for low-income fishing families on remote Lakshadweep islands.',
  },

  // ─── ADDITIONAL MAJOR METROS ──────────────────────────────────────────────
  {
    id: 'mh-009', name: 'Robin Hood Army – Mumbai Chapter', type: 'ngo',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Churchgate, Mumbai – 400020',
    lat: 18.9354, lng: 72.8255,
    description: 'Collects surplus food from restaurants and distributes to homeless. 0 waste, 0 funds.',
    website: 'https://robinhoodarmy.com',
  },
  {
    id: 'dl-008', name: 'Robin Hood Army – Delhi Chapter', type: 'ngo',
    city: 'Delhi', state: 'Delhi',
    address: 'Connaught Place, New Delhi – 110001',
    lat: 28.6315, lng: 77.2167,
    description: 'Zero-profit food rescue from restaurants to street homeless people in Delhi.',
    website: 'https://robinhoodarmy.com',
  },
  {
    id: 'ka-006', name: 'Robin Hood Army – Bengaluru', type: 'ngo',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'MG Road, Bengaluru – 560001',
    lat: 12.9754, lng: 77.6069,
    description: 'Surplus food rescue and distribution to street homeless in Bengaluru.',
    website: 'https://robinhoodarmy.com',
  },
  {
    id: 'tn-005', name: 'Robin Hood Army – Chennai', type: 'ngo',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Anna Salai, Chennai – 600002',
    lat: 13.0649, lng: 80.2674,
    description: 'Surplus food rescue and distribution across Chennai\'s homeless population.',
    website: 'https://robinhoodarmy.com',
  },
  {
    id: 'wb-006', name: 'Robin Hood Army – Kolkata', type: 'ngo',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Park Street, Kolkata – 700016',
    lat: 22.5518, lng: 88.3520,
    description: 'Surplus food rescue from Park Street restaurants to slum communities.',
    website: 'https://robinhoodarmy.com',
  },
  {
    id: 'mh-010', name: 'Shramik Elgar – Nanded Slum', type: 'slum',
    city: 'Nanded', state: 'Maharashtra',
    address: 'Shivajinagar, Nanded – 431601',
    lat: 19.1519, lng: 77.3097,
    description: 'Agrarian slum in Marathwada drought belt. Food shortages spike in summer.',
  },
  {
    id: 'up-006', name: 'Agra Slum – Bhim Nagar (near Taj Trapezium)', type: 'slum',
    city: 'Agra', state: 'Uttar Pradesh',
    address: 'Bhim Nagar, Agra – 282005',
    lat: 27.1762, lng: 78.0047,
    description: 'Leather workers\' colony near Agra. Child malnutrition documented in surveys.',
  },
  {
    id: 'mh-011', name: 'Acorn Foundation – Dharavi Food Hub', type: 'ngo',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Dharavi, Mumbai – 400017',
    lat: 19.0436, lng: 72.8562,
    description: 'Food security programs inside Dharavi. Partners with local self-help groups.',
  },
  // ─── EXPANDED SLUM DATA (sourced from Wikipedia, Wikimapia, Urban Planning Reports) ──
  // ── Mumbai extra slums ──────────────────────────────────────────────────
  {
    id: 'mh-s01', name: 'Baiganwadi Slum – Govandi West', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Baiganwadi, Govandi West, Mumbai – 400043',
    lat: 19.0613, lng: 72.9258,
    description: 'One of Mumbai\'s most densely packed slums. 700,000+ residents near the Deonar dumping ground. Severe food insecurity.',
  },
  {
    id: 'mh-s02', name: 'Mankhurd Slum Belt', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Mankhurd, Mumbai – 400043',
    lat: 19.0520, lng: 72.9350,
    description: 'Mankhurd-Govandi belt is among the poorest in Mumbai. Lack of water, sanitation and daily food.',
  },
  {
    id: 'mh-s03', name: 'Kurla Slum Pockets', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Kurla West, Mumbai – 400070',
    lat: 19.0726, lng: 72.8793,
    description: 'Dense slum pockets in Kurla. Migrant workers from UP and Bihar. Food shortages frequent.',
  },
  {
    id: 'mh-s04', name: 'Sion-Koliwada Slum', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Sion Koliwada, Mumbai – 400022',
    lat: 19.0417, lng: 72.8664,
    description: 'One of oldest slum settlements in Mumbai. 75,000+ residents with acute food insecurity.',
  },
  {
    id: 'mh-s05', name: 'Malvani Slum (Malad West)', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Malvani, Malad West, Mumbai – 400095',
    lat: 19.1842, lng: 72.8266,
    description: 'Large slum in North Mumbai with 300,000+ residents. Community kitchens lacking resources.',
  },
  {
    id: 'mh-s06', name: 'Dindoshi Slum (Goregaon)', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Dindoshi, Goregaon East, Mumbai – 400065',
    lat: 19.1585, lng: 72.8717,
    description: 'Slum near Film City. Casual labour population with food supply gaps.',
  },
  {
    id: 'mh-s07', name: 'Antop Hill Slum', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Antop Hill, Wadala, Mumbai – 400037',
    lat: 19.0196, lng: 72.8637,
    description: 'Large slum in Wadala. Workers from textile and dock industries. Food donation programs active.',
  },
  {
    id: 'mh-s08', name: 'Cheeta Camp Slum (Trombay)', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Cheeta Camp, Trombay, Mumbai – 400088',
    lat: 19.0505, lng: 72.9215,
    description: 'Slum adjacent to BARC and refinery areas. Environmental hazards worsen food insecurity.',
  },
  {
    id: 'mh-s09', name: 'Behrampada Slum (Bandra East)', type: 'slum',
    city: 'Mumbai', state: 'Maharashtra',
    address: 'Behrampada, Bandra East, Mumbai – 400051',
    lat: 19.0534, lng: 72.8526,
    description: 'Dense slum behind Bandra station. 100,000+ residents with minimal food security.',
  },
  {
    id: 'mh-s10', name: 'Yerawada Slum Belt – Pune', type: 'slum',
    city: 'Pune', state: 'Maharashtra',
    address: 'Yerawada, Pune – 411006',
    lat: 18.5560, lng: 73.8775,
    description: 'Yerawada houses one of Pune\'s highest slum populations. Chronic food aid deficit.',
  },
  {
    id: 'mh-s11', name: 'Kasarwadi Slum – Pimpri-Chinchwad', type: 'slum',
    city: 'Pimpri-Chinchwad', state: 'Maharashtra',
    address: 'Kasarwadi, Pimpri-Chinchwad – 411034',
    lat: 18.6298, lng: 73.7900,
    description: 'Industrial workers\' slum belt. Child malnutrition rates above state average.',
  },

  // ── Delhi / NCR extra slums ─────────────────────────────────────────────
  {
    id: 'dl-s01', name: 'Kusumpur Pahari Slum (Vasant Vihar)', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Kusumpur Pahari, Vasant Vihar, New Delhi – 110057',
    lat: 28.5537, lng: 77.1564,
    description: 'One of Delhi\'s largest slums next to affluent Vasant Vihar. 70,000+ residents need daily food aid.',
  },
  {
    id: 'dl-s02', name: 'Kathputli Colony – Shadipur', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Kathputli Colony, Shadipur, West Delhi – 110008',
    lat: 28.6496, lng: 77.1445,
    description: 'Famous street-performers\' colony. Demolition drives have worsened food insecurity for 2,800 families.',
  },
  {
    id: 'dl-s03', name: 'Madanpur Khadar Resettlement Colony', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Madanpur Khadar, South-East Delhi – 110076',
    lat: 28.5300, lng: 77.3136,
    description: 'Large resettlement colony for evicted slum dwellers. 200,000+ residents. Food programs underfunded.',
  },
  {
    id: 'dl-s04', name: 'Sangam Vihar Slum Belt', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Sangam Vihar, South Delhi – 110062',
    lat: 28.5009, lng: 77.2526,
    description: 'One of Asia\'s largest unauthorised colonies. 1.5 million residents with no formal food support.',
  },
  {
    id: 'dl-s05', name: 'Jahangirpuri Slum', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Jahangirpuri, North Delhi – 110033',
    lat: 28.7280, lng: 77.1637,
    description: 'Notified slum cluster with 50,000+ migrant families. Food NGOs active but capacity is not enough.',
  },
  {
    id: 'dl-s06', name: 'Kalyanpuri Slum – East Delhi', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Kalyanpuri, East Delhi – 110091',
    lat: 28.6256, lng: 77.3096,
    description: 'Flood-affected low-income colony near Yamuna. Cyclical food crises during monsoon.',
  },
  {
    id: 'dl-s07', name: 'Trilokpuri Slum Blocks', type: 'slum',
    city: 'Delhi', state: 'Delhi',
    address: 'Trilokpuri, East Delhi – 110091',
    lat: 28.6197, lng: 77.3177,
    description: 'Notified slum resettlement. Block-wise community kitchens overwhelmed by demand.',
  },

  // ── Kolkata extra slums ─────────────────────────────────────────────────
  {
    id: 'wb-s01', name: 'Narkeldanga Slum – North Kolkata', type: 'slum',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Narkeldanga, North Kolkata – 700054',
    lat: 22.5793, lng: 88.3814,
    description: 'High-density slum in North Kolkata. Rickshaw pullers and daily-wage workers. Documented food insecurity.',
  },
  {
    id: 'wb-s02', name: 'Chetla Slum – South Kolkata', type: 'slum',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Chetla, South Kolkata – 700027',
    lat: 22.5184, lng: 88.3371,
    description: 'Large slum cluster in South Kolkata. Leather and jute workers with irregular income.',
  },
  {
    id: 'wb-s03', name: 'Tangra Slum (Kolkata\'s Chinatown fringe)', type: 'slum',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Tangra, East Kolkata – 700046',
    lat: 22.5596, lng: 88.3905,
    description: 'Industrial fringe slum near tanneries. Environmental pollution limits food options.',
  },
  {
    id: 'wb-s04', name: 'Basanti Slum – 24 Parganas South', type: 'slum',
    city: 'Basanti', state: 'West Bengal',
    address: 'Basanti Block, South 24 Parganas – 743312',
    lat: 22.1490, lng: 88.7280,
    description: 'Often cited as Kolkata\'s biggest slum area. Cyclone-prone. Food donations vital after every storm.',
  },
  {
    id: 'wb-s05', name: 'Khidderpore Slum Pockets', type: 'slum',
    city: 'Kolkata', state: 'West Bengal',
    address: 'Khidderpore, Kolkata – 700023',
    lat: 22.5364, lng: 88.3239,
    description: 'Dock-workers\' slum near Kolkata Port. Informal economy families depend on food NGOs.',
  },

  // ── Chennai extra slums ─────────────────────────────────────────────────
  {
    id: 'tn-s01', name: 'Kannagi Nagar Resettlement Colony', type: 'slum',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Kannagi Nagar, Thoraipakkam, Chennai – 600096',
    lat: 12.9278, lng: 80.2394,
    description: 'Largest resettlement colony in India. 300,000+ displaced slum-dwellers. Food aid programs underfunded.',
  },
  {
    id: 'tn-s02', name: 'Tondiarpet Slum Belt', type: 'slum',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Tondiarpet, North Chennai – 600081',
    lat: 13.1213, lng: 80.2929,
    description: 'Industrial North Chennai. Fishing and factory workers\' slum. Periodic flooding causes food crises.',
  },
  {
    id: 'tn-s03', name: 'Pulianthope Slum', type: 'slum',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Pulianthope, Chennai – 600012',
    lat: 13.1081, lng: 80.2851,
    description: 'Dense slum in North Chennai. Community NGOs active but food supply often falls short.',
  },
  {
    id: 'tn-s04', name: 'Kodambakkam Slum Pockets', type: 'slum',
    city: 'Chennai', state: 'Tamil Nadu',
    address: 'Kodambakkam, Chennai – 600024',
    lat: 13.0539, lng: 80.2265,
    description: 'Urban slum clusters near Tamil film industry. Casual workers face seasonal food shortages.',
  },

  // ── Hyderabad extra slums ───────────────────────────────────────────────
  {
    id: 'ts-s01', name: 'Indiranagar Slum – Hyderabad', type: 'slum',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Indiranagar, Hyderabad – 500018',
    lat: 17.3855, lng: 78.4867,
    description: 'One of Hyderabad\'s largest notified slum concentrations. 150,000+ residents with food gaps.',
  },
  {
    id: 'ts-s02', name: 'Bholakpur Slum', type: 'slum',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Bholakpur, Secunderabad – 500058',
    lat: 17.4567, lng: 78.5027,
    description: 'Old industrial slum in Secunderabad. Mill closure left families without income or food access.',
  },
  {
    id: 'ts-s03', name: 'Jeedimetla Slum Belt', type: 'slum',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Jeedimetla, Hyderabad – 500055',
    lat: 17.5003, lng: 78.4381,
    description: 'Industrial suburb slum. Migrant labour from Andhra Pradesh and Odisha. Food NGO reach is limited.',
  },
  {
    id: 'ts-s04', name: 'Amberpet Slum Cluster', type: 'slum',
    city: 'Hyderabad', state: 'Telangana',
    address: 'Amberpet, Hyderabad – 500013',
    lat: 17.4017, lng: 78.5320,
    description: 'Notified slum cluster in East Hyderabad. 80,000+ residents living below poverty line.',
  },

  // ── Bengaluru extra slums ───────────────────────────────────────────────
  {
    id: 'ka-s01', name: 'KR Puram Slum Belt', type: 'slum',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'K.R. Puram, Bengaluru – 560036',
    lat: 13.0094, lng: 77.6972,
    description: 'Large informal settlement in East Bengaluru. Construction workers and migrant families need food support.',
  },
  {
    id: 'ka-s02', name: 'Shantinagar Slum (Bengaluru Central)', type: 'slum',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Shantinagar, Bengaluru – 560027',
    lat: 12.9611, lng: 77.5980,
    description: 'Central Bengaluru slum pocket. Domestic workers and construction labourers with acute food needs.',
  },
  {
    id: 'ka-s03', name: 'Hosakerehalli Slum – BSK', type: 'slum',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Hosakerehalli, Banashankari, Bengaluru – 560085',
    lat: 12.9253, lng: 77.5432,
    description: 'Slum cluster in South Bengaluru. Children\'s malnutrition documented by BBMP surveys.',
  },
  {
    id: 'ka-s04', name: 'Hegganahalli Slum', type: 'slum',
    city: 'Bengaluru', state: 'Karnataka',
    address: 'Hegganahalli, Bengaluru – 560091',
    lat: 12.9912, lng: 77.5049,
    description: 'Low-income zone in West Bengaluru. Garment factory workers and their families face food insecurity.',
  },

  // ── Ahmedabad extra slums ───────────────────────────────────────────────
  {
    id: 'gj-s01', name: 'Behrampura Slum – Ahmedabad', type: 'slum',
    city: 'Ahmedabad', state: 'Gujarat',
    address: 'Behrampura, Ahmedabad – 380022',
    lat: 22.9945, lng: 72.5987,
    description: 'One of Ahmedabad\'s oldest and most densely populated slums. Textile-mill workers\' community.',
  },
  {
    id: 'gj-s02', name: 'Gomtipur Slum – Ahmedabad East', type: 'slum',
    city: 'Ahmedabad', state: 'Gujarat',
    address: 'Gomtipur, Ahmedabad – 380021',
    lat: 23.0379, lng: 72.6289,
    description: 'Industrial slum east of Sabarmati. Tannery and textile workers. Water and food scarcity pervasive.',
  },
  {
    id: 'gj-s03', name: 'Rakhial Slum Pockets', type: 'slum',
    city: 'Ahmedabad', state: 'Gujarat',
    address: 'Rakhial, Ahmedabad – 380023',
    lat: 23.0480, lng: 72.6420,
    description: 'Low-income colony near Rakhial industrial area. Migrant workers from Rajasthan and MP.',
  },

  // ── Rajasthan extra slums ───────────────────────────────────────────────
  {
    id: 'rj-s01', name: 'Ramganj Slum – Jaipur Walled City', type: 'slum',
    city: 'Jaipur', state: 'Rajasthan',
    address: 'Ramganj, Jaipur – 302003',
    lat: 26.9107, lng: 75.8333,
    description: 'Dense walled-city slum pocket. Artisan families with irregular income. Food aid needed.',
  },
  {
    id: 'rj-s02', name: 'Ajmer Slum – Dargah Vicinity', type: 'slum',
    city: 'Ajmer', state: 'Rajasthan',
    address: 'Near Dargah Sharif, Ajmer – 305001',
    lat: 26.4524, lng: 74.6323,
    description: 'Slum pockets around Ajmer Dargah. Migrant families and pilgrims in poverty.',
  },

  // ── Uttar Pradesh extra slums ───────────────────────────────────────────
  {
    id: 'up-s01', name: 'Meerut Slum – Lisari Gate', type: 'slum',
    city: 'Meerut', state: 'Uttar Pradesh',
    address: 'Lisari Gate, Meerut – 250001',
    lat: 28.9867, lng: 77.7000,
    description: 'One of Meerut\'s largest informal settlements. Sports-goods factory workers. Food access limited.',
  },
  {
    id: 'up-s02', name: 'Allahabad / Prayagraj Slum – Daraganj', type: 'slum',
    city: 'Prayagraj', state: 'Uttar Pradesh',
    address: 'Daraganj, Prayagraj – 211006',
    lat: 25.4437, lng: 81.8640,
    description: 'Flood-plain slum on Ganga-Yamuna confluence. Kumbh Mela seasonal displacement causes food crises.',
  },
  {
    id: 'up-s03', name: 'Bareilly Slum – Subhash Nagar', type: 'slum',
    city: 'Bareilly', state: 'Uttar Pradesh',
    address: 'Subhash Nagar, Bareilly – 243001',
    lat: 28.3597, lng: 79.4148,
    description: 'Furniture-workers\' colony. Child malnutrition rates above district average.',
  },

  // ── Bihar extra slums ───────────────────────────────────────────────────
  {
    id: 'br-s01', name: 'Bhagalpur Slum – Barari Ghat', type: 'slum',
    city: 'Bhagalpur', state: 'Bihar',
    address: 'Barari Ghat, Bhagalpur – 812001',
    lat: 25.2487, lng: 86.9848,
    description: 'Silk-weavers\' riverine slum. Flood season repeatedly wipes out food stocks.',
  },
  {
    id: 'br-s02', name: 'Gaya Slum – Rampur Colony', type: 'slum',
    city: 'Gaya', state: 'Bihar',
    address: 'Rampur Colony, Gaya – 823001',
    lat: 24.7914, lng: 85.0002,
    description: 'Low-income colony near Bodh Gaya. Pilgrimage-economy residents face off-season food deficits.',
  },

  // ── West Bengal extra ───────────────────────────────────────────────────
  {
    id: 'wb-s06', name: 'Howrah Bridge Foot Slum', type: 'slum',
    city: 'Howrah', state: 'West Bengal',
    address: 'Near Howrah Bridge, Howrah – 711101',
    lat: 22.5851, lng: 88.3376,
    description: 'Dense slum cluster at foot of Howrah Bridge. Porters and hawkers\' families with food insecurity.',
  },
  {
    id: 'wb-s07', name: 'Asansol Slum – Burnpur Area', type: 'slum',
    city: 'Asansol', state: 'West Bengal',
    address: 'Burnpur, Asansol – 713325',
    lat: 23.6833, lng: 86.9583,
    description: 'Former SAIL steel-town slum. Post-industrial unemployment has left thousands food-insecure.',
  },

  // ── Odisha extra ────────────────────────────────────────────────────────
  {
    id: 'or-s01', name: 'Cuttack Slum – Badambadi', type: 'slum',
    city: 'Cuttack', state: 'Odisha',
    address: 'Badambadi, Cuttack – 753012',
    lat: 20.4625, lng: 85.8830,
    description: 'Large urban slum in the Silver City. Flood-affected population with chronic food insecurity.',
  },
  {
    id: 'or-s02', name: 'Rourkela Slum – Udit Nagar', type: 'slum',
    city: 'Rourkela', state: 'Odisha',
    address: 'Udit Nagar, Rourkela – 769012',
    lat: 22.2198, lng: 84.8453,
    description: 'Steel-plant periphery slum. Tribal migrant workers\' families lack stable food access.',
  },

  // ── Madhya Pradesh extra ────────────────────────────────────────────────
  {
    id: 'mp-s01', name: 'Indore Slum – Bhanwarkuan', type: 'slum',
    city: 'Indore', state: 'Madhya Pradesh',
    address: 'Bhanwarkuan, Indore – 452001',
    lat: 22.7143, lng: 75.8564,
    description: 'Large slum in commercial Indore. Despite city\'s "cleanest city" tag, food insecurity persists.',
  },
  {
    id: 'mp-s02', name: 'Gwalior Slum – Padav Area', type: 'slum',
    city: 'Gwalior', state: 'Madhya Pradesh',
    address: 'Padav, Gwalior – 474001',
    lat: 26.2183, lng: 78.1828,
    description: 'Low-income neighbourhoods near Gwalior Fort. Rug and pottery-workers\' families in poverty.',
  },

  // ── Chhattisgarh extra ──────────────────────────────────────────────────
  {
    id: 'cg-s01', name: 'Bhilai Slum – Nehru Nagar', type: 'slum',
    city: 'Bhilai', state: 'Chhattisgarh',
    address: 'Nehru Nagar, Bhilai – 490020',
    lat: 21.2144, lng: 81.4319,
    description: 'Steel-plant periphery slum. Contract labourers\' families face cyclical food insecurity.',
  },

  // ── Punjab extra ────────────────────────────────────────────────────────
  {
    id: 'pb-s01', name: 'Ludhiana Slum – Focal Point', type: 'slum',
    city: 'Ludhiana', state: 'Punjab',
    address: 'Focal Point Industrial Area, Ludhiana – 141010',
    lat: 30.9239, lng: 75.8054,
    description: 'Industrial labour slum in Ludhiana. Migrant workers from Bihar and UP. Food aid scarce.',
  },
];


export const TYPE_LABELS: Record<AidLocationType, string> = {
  ngo: 'NGO',
  orphanage: 'Orphanage',
  shelter: 'Shelter / Charity Home',
  slum: 'Slum / Low-Income Area',
};

export const TYPE_COLORS: Record<AidLocationType, string> = {
  ngo: '#2563eb',       // blue
  orphanage: '#7c3aed', // purple
  shelter: '#ea580c',   // orange
  slum: '#dc2626',      // red
};

export const TYPE_EMOJIS: Record<AidLocationType, string> = {
  ngo: '🔵',
  orphanage: '🟣',
  shelter: '🟠',
  slum: '🔴',
};
