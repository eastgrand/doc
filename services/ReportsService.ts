// Centralized reports service - single source of truth for all report dialogs
export interface Report {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categories: string[];
  type?: string;
}

// Custom reports that are always added to the list
const CUSTOM_REPORTS: Report[] = [
  {
    id: 'market-intelligence-report',
    title: 'AI-Powered Market Intelligence Report',
    description: 'Professional market analysis combining AI scoring, competitive positioning, demographics, and strategic recommendations',
    thumbnail: '',
    categories: ['Market Intelligence', 'AI Analysis'],
    type: 'endpoint-scoring'
  },
  {
    id: 'endpoint-scoring-combined',
    title: 'AI Endpoint Scoring Analysis',
    description: 'Technical scoring analysis with detailed metrics and endpoint performance data',
    thumbnail: '',
    categories: ['AI Analysis', 'Technical'],
    type: 'endpoint-scoring'
  },
  // {
  //   id: 'market-profile-custom',
  //   title: 'Market Profile Custom Report',
  //   description: 'Comprehensive market analysis with demographic profiles, consumer behavior, and business intelligence',
  //   thumbnail: '',
  //   categories: ['Market Analysis', 'Demographics'],
  //   type: 'custom'
  // }
];

// Reports and templates to exclude from display
const DO_NOT_DISPLAY_LIST: Set<string> = new Set([
  // Test/Demo reports
  'Accenture',
  'Apparel',
  'Apparel (Esri 2024)',
  'Blank test',
  'Custom',
  'Custom (Esri 2024)',
  'custom invesco',
  'custom invesco (Esri 2025)',
  'Energy',
  'Energy (Esri 2024)',
  'Nike',
  'Nike (Esri 2024)',
  'Nike Report',
  'Nike Competitive Market Report',
  'test',
  'Test',
  'TEST',
  'test123',
  'NIKE',
  'Test Report',
  'Test Template',
  'Demo Report',
  'Sample Report',
  'Duplicate',
  'DUPLICATE',
  'Draft',
  'DRAFT',
  'Market Analysis for Nike',
  
  // Canadian/Non-US reports
  'Canada Demographics',
  'Canadian Demographics',
  'Canada Population',
  'Canadian Market Analysis',
  'Toronto Market',
  'Vancouver Demographics', 
  'Montreal Profile',
  'Canadian Crime',
  'Statistics Canada',
  'Census Canada',
  'Canadian Business',
  'Eating Places in Canada',
  
  // Old/Legacy reports
  '2023 Community Portrait',
  'Community Profile 2023', 
  'Executive Summary 2023',
  'Community Health',
  'Health Profile',
  'Market Potential for Restaurant',
  'Business Summary',
  'Site Analysis',
  'Shopping Centers Summary',
  'Demographic and Income Comparison',
  'Locator'
]);

// Canadian terms to check in titles
const CANADIAN_TERMS = [
  'canada', 'canadian', 'bc ', 'ontario', 'quebec', 'alberta', 'manitoba', 
  'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'prince edward', 
  'yukon', 'northwest territories', 'nunavut', 'postal code', 'fsa'
];

interface ArcGISItem {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  properties?: {
    countries?: string;
  };
  thumbnail?: string;
  snippet?: string;
}

// Assign categories to reports based on content
const assignCategories = (item: ArcGISItem): string[] => {
  const assigned: Set<string> = new Set();
  const titleLower = item.title?.toLowerCase() || '';
  const descLower = item.description?.toLowerCase() || '';
  const tagsLower = (item.tags || []).map((t: string) => t.toLowerCase());
  const textCorpus = `${titleLower} ${descLower} ${tagsLower.join(' ')}`;

  if (textCorpus.includes('demographic') || textCorpus.includes('population') || textCorpus.includes('income')) {
    assigned.add('Demographics');
  }
  if (textCorpus.includes('market') || textCorpus.includes('business') || textCorpus.includes('prizm') || textCorpus.includes('eating') || textCorpus.includes('consumer')) {
    assigned.add('Market Analysis');
  }
  if (textCorpus.includes('community') || textCorpus.includes('neighborhood') || textCorpus.includes('profile') || textCorpus.includes('summary')) {
    assigned.add('Community Profiles');
  }
  if (textCorpus.includes('health') || textCorpus.includes('risk') || textCorpus.includes('emergency') || textCorpus.includes('poverty')) {
    assigned.add('Health & Risk');
  }
  if (textCorpus.includes('transportation') || textCorpus.includes('transit')) {
    assigned.add('Transportation');
  }
  if (textCorpus.includes('tabular')) {
    assigned.add('Tabular Reports');
  }

  return assigned.size > 0 ? Array.from(assigned) : ['Other'];
};

// Main function to fetch and filter reports
export const fetchReports = async (): Promise<Report[]> => {
  try {
    console.log('[ReportsService] Fetching reports from ArcGIS servers...');
    
    const reportApiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY_2;
    const token = reportApiKey || 'AAPTxy8BH1VEsoebNVZXo8HurEs9TD-3BH9IvorrjVWQR4uGhbHZOyV9S-QJcwJfNyPyN6IDTc6dX1pscXuVgb4-GEQ70Mrk6FUuIcuO2Si45rlSIepAJkP92iyuw5nBPxpTjI0ga_Aau9Cr6xaQ2DJnJfzaCkTor0cB9UU6pcNyFqxJlYt_26boxHYqnnu7vWlqt7SVFcWKmYq6kh8anIAmEi0hXY1ThVhKIupAS_Mure0.AT1_VqzOv0Y5';
    
    // ArcGIS endpoints to try
    const endpointsToTry = [
      {
        name: 'Report Template Search',
        url: `https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54 AND type:"Report Template"&f=pjson&token=${token}&num=100`
      },
      {
        name: 'Content API',
        url: `https://synapse54.maps.arcgis.com/sharing/rest/content/users/Synapse54/search?f=pjson&token=${token}&num=100`
      }
    ];

    const allItems: ArcGISItem[] = [];
    const successfulEndpoints: string[] = [];
    
    // Try each endpoint
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`[ReportsService] Trying ${endpoint.name}...`);
        const response = await fetch(endpoint.url);
        
        if (!response.ok) {
          console.warn(`[ReportsService] ${endpoint.name} returned ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Handle different response formats
        let items: ArcGISItem[] = [];
        if (data.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
        }
        
        if (items.length > 0) {
          console.log(`[ReportsService] ${endpoint.name} found ${items.length} items`);
          allItems.push(...items);
          successfulEndpoints.push(endpoint.name);
        }
      } catch (error) {
        console.error(`[ReportsService] Error with ${endpoint.name}:`, error);
      }
    }
    
    console.log(`[ReportsService] Total items from all endpoints: ${allItems.length}`);
    console.log(`[ReportsService] Successful endpoints: ${successfulEndpoints.join(', ')}`);
    
    // Remove duplicates based on item ID
    const uniqueItems = allItems.reduce((acc: ArcGISItem[], current: ArcGISItem) => {
      const existing = acc.find(item => item.id === current.id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    console.log(`[ReportsService] Unique items after deduplication: ${uniqueItems.length}`);
    
    // Filter for United States reports only
    const usOnlyItems = uniqueItems.filter((item: ArcGISItem) => {
      const countries = item.properties?.countries;
      const isUS = countries === 'US';
      
      if (!isUS) {
        console.log(`[ReportsService] Excluding non-US item: "${item.title}" (countries: ${countries})`);
      }
      
      return isUS;
    });
    
    console.log(`[ReportsService] US-only items: ${usOnlyItems.length}`);
    
    // Apply exclusion filtering
    const filteredItems = usOnlyItems.filter(item => {
      const trimmedTitle = item.title?.trim() || '';
      
      // Check exact matches in exclusion set
      if (DO_NOT_DISPLAY_LIST.has(trimmedTitle)) {
        console.log(`[ReportsService] Excluding by exact match: "${trimmedTitle}"`);
        return false;
      }
      
      // Check for "(Esri 2025)" substring
      if (trimmedTitle.includes('(Esri 2025)')) {
        console.log(`[ReportsService] Excluding Esri 2025 template: "${trimmedTitle}"`);
        return false;
      }
      
      // Check for Canadian-related terms in title
      const titleLower = trimmedTitle.toLowerCase();
      if (CANADIAN_TERMS.some(term => titleLower.includes(term))) {
        console.log(`[ReportsService] Excluding Canadian template: "${trimmedTitle}"`);
        return false;
      }
      
      return true;
    });
    
    console.log(`[ReportsService] Items after exclusion filtering: ${filteredItems.length}`);
    
    // Convert to Report format
    const formattedReports = filteredItems.map(item => {
      // Construct proper thumbnail URL
      let thumbnailUrl = '';
      if (item.thumbnail) {
        if (!item.thumbnail.startsWith('http')) {
          thumbnailUrl = `https://www.arcgis.com/sharing/rest/content/items/${item.id}/info/${item.thumbnail}?token=${token}`;
        } else {
          thumbnailUrl = item.thumbnail;
        }
      } else {
        thumbnailUrl = `https://www.arcgis.com/sharing/rest/content/items/${item.id}/info/thumbnail/thumbnail.png?token=${token}`;
      }
      
      return {
        id: item.id,
        title: item.title || 'Untitled Report',
        description: item.snippet || item.description || 'No description available',
        thumbnail: thumbnailUrl,
        categories: assignCategories(item)
      };
    });
    
    // Add custom reports at the beginning
    const finalReports = [...CUSTOM_REPORTS, ...formattedReports];
    
    console.log(`[ReportsService] Final report count (including custom): ${finalReports.length}`);
    console.log(`[ReportsService] Final report titles:`, finalReports.map(r => r.title));
    
    return finalReports;
    
  } catch (error) {
    console.error('[ReportsService] Error fetching reports:', error);
    // Return just custom reports if fetch fails
    return CUSTOM_REPORTS;
  }
};