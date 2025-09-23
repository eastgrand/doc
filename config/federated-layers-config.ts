/**
 * Federated Layer Configuration for Doors Documentary Project
 * Combines IL, IN, WI state layers into unified federated layers
 * Based on FederatedLayerService architecture
 */

import { FederatedLayerConfig, StateServiceConfig } from '@/lib/services/FederatedLayerService';

// Helper function to create state service configurations for the same layer across 3 states
function createStateServices(layerBaseUrl: string, layerIds: { IL: number; IN: number; WI: number }): StateServiceConfig[] {
  return [
    {
      url: `${layerBaseUrl}/${layerIds.IL}`,
      identifier: 'IL',
      layerId: layerIds.IL
    },
    {
      url: `${layerBaseUrl}/${layerIds.IN}`,
      identifier: 'IN', 
      layerId: layerIds.IN
    },
    {
      url: `${layerBaseUrl}/${layerIds.WI}`,
      identifier: 'WI',
      layerId: layerIds.WI
    }
  ];
}

// Base ArcGIS service URL for the doors documentary project
const BASE_SERVICE_URL = 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer';

/**
 * Federated Layer Configurations
 * Each configuration combines 3 state layers (IL, IN, WI) into one unified layer
 */
export const FEDERATED_LAYERS_CONFIG: FederatedLayerConfig[] = [
  
  // CLASSIC ROCK AUDIENCE GROUP
  {
    layerName: 'Classic Rock Listeners',
    services: createStateServices(BASE_SERVICE_URL, { 
      IL: 112, // IL Listened to Classic Rock Music 6 Mo
      IN: 111, // IN Listened to Classic Rock Music 6 Mo  
      WI: 110  // WI Listened to Classic Rock Music 6 Mo
    }),
    cacheTimeout: 300000, // 5 minutes
    parallelFetch: false // Sequential to prevent AbortErrors
  },
  
  {
    layerName: 'Classic Rock Radio Format Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 113, // IL Listen to Classic Rock Radio Format
      IN: 114, // IN Listen to Classic Rock Radio Format
      WI: 115  // WI Listen to Classic Rock Radio Format
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Rock Music Performance Attendance',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 107, // IL Attended Rock Music Performance 12 Mo
      IN: 108, // IN Attended Rock Music Performance 12 Mo
      WI: 109  // WI Attended Rock Music Performance 12 Mo
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Rock Radio Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 106, // IL Listen to Rock Radio Format
      IN: 105, // IN Listen to Rock Radio Format
      WI: 104  // WI Listen to Rock Radio Format
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // DOCUMENTARY & BIOGRAPHY INTEREST GROUP
  {
    layerName: 'Documentary Movie Viewers',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 73, // IL Rented Purchased News Documentary Movie
      IN: 72, // IN Rented Purchased News Documentary Movie
      WI: 71  // WI Rented Purchased News Documentary Movie
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Biography Genre Movie Theater',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 45, // IL Saw Biography Genre Movie at Theater
      IN: 46, // IN Saw Biography Genre Movie at Theater
      WI: 44  // WI Saw Biography Genre Movie at Theater
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Biography Book Purchases',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 41, // IL Purchased Biography 12 Mo
      IN: 42, // IN Purchased Biography 12 Mo
      WI: 43  // WI Purchased Biography 12 Mo
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Entertainment/Celebrity Info Seekers',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 62, // IL Used Internet for Entmt Celebrity Info
      IN: 63, // IN Used Internet for Entmt Celebrity Info
      WI: 64  // WI Used Internet for Entmt Celebrity Info
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // MOVIE THEATER ATTENDANCE (will be moved to Documentary group)
  {
    layerName: 'Movie Theater Attendance',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 17, // IL Attended Movie 6 Mo
      IN: 18, // IN Attended Movie 6 Mo
      WI: 19  // WI Attended Movie 6 Mo
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Biography Genre Movie Attendance',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 45, // IL Saw Biography Genre Movie at Theater
      IN: 46, // IN Saw Biography Genre Movie at Theater
      WI: 44  // WI Saw Biography Genre Movie at Theater
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  // THEATER/OPERA/CONCERT SPENDING (will be moved to Entertainment Spending group)
  {
    layerName: 'Theater/Opera/Concert Spending',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 67, // IL Spending on Tickets to Theatre Operas Concerts
      IN: 66, // IN Spending on Tickets to Theatre Operas Concerts
      WI: 65  // WI Spending on Tickets to Theatre Operas Concerts
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // DIGITAL MUSIC & STREAMING GROUP
  {
    layerName: 'Spotify Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 94, // IL Listened to Spotify Audio Svc 30 Days
      IN: 93, // IN Listened to Spotify Audio Svc 30 Days
      WI: 92  // WI Listened to Spotify Audio Svc 30 Days
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Apple Music Listeners', 
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 80, // IL Listened to Apple Music Audio Svc 30
      IN: 81, // IN Listened to Apple Music Audio Svc 30
      WI: 82  // WI Listened to Apple Music Audio Svc 30
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'iHeartRadio Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 83, // IL Listened to iHeartRadio Audio Svc 30
      IN: 84, // IN Listened to iHeartRadio Audio Svc 30
      WI: 85  // WI Listened to iHeartRadio Audio Svc 30
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Amazon Music Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 88, // IL Listened to Amazon Music Audio Svc 30
      IN: 87, // IN Listened to Amazon Music Audio Svc 30
      WI: 86  // WI Listened to Amazon Music Audio Svc 30
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Pandora Listeners',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 89, // IL Listened to Pandora Audio Svc 30 Days
      IN: 90, // IN Listened to Pandora Audio Svc 30 Days
      WI: 91  // WI Listened to Pandora Audio Svc 30 Days
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // MUSIC PURCHASING BEHAVIOR GROUP
  {
    layerName: 'Music Store Purchases',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 101, // IL Purchased Music at Music Store 6 Mo
      IN: 102, // IN Purchased Music at Music Store 6 Mo
      WI: 103  // WI Purchased Music at Music Store 6 Mo
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'iTunes Music Purchases',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 33, // IL Purchased Music Through iTunes
      IN: 34, // IN Purchased Music Through iTunes
      WI: 32  // WI Purchased Music Through iTunes
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Amazon Music Purchases',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 40, // IL Purchased Music Through Amazon Music
      IN: 39, // IN Purchased Music Through Amazon Music
      WI: 38  // WI Purchased Music Through Amazon Music
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // ENTERTAINMENT SPENDING GROUP
  {
    layerName: 'Entertainment & Recreation Spending',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 68, // IL Spending on Entertainment Rec (Avg)
      IN: 69, // IN Spending on Entertainment Rec (Avg)
      WI: 70  // WI Spending on Entertainment Rec (Avg)
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Movie Ticket Spending',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 23, // IL Spending on Tickets to Movies (Avg)
      IN: 24, // IN Spending on Tickets to Movies (Avg)
      WI: 25  // WI Spending on Tickets to Movies (Avg)
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Music/CD Spending',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 74, // IL Spending on Records CDs Audio Tapes (Avg)
      IN: 75, // IN Spending on Records CDs Audio Tapes (Avg)
      WI: 76  // WI Spending on Records CDs Audio Tapes (Avg)
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },

  // DEMOGRAPHICS & GENERATIONS GROUP
  {
    layerName: 'Baby Boomers',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 61, // IL Baby Boomer Pop
      IN: 60, // IN Baby Boomer Pop
      WI: 59  // WI Baby Boomer Pop
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Generation X',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 56, // IL Generation X Pop
      IN: 57, // IN Generation X Pop
      WI: 58  // WI Generation X Pop
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Millennials',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 55, // IL Millennial Pop
      IN: 54, // IN Millennial Pop
      WI: 53  // WI Millennial Pop
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Gen Z',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 50, // IL Generation Z Pop
      IN: 51, // IN Generation Z Pop
      WI: 52  // WI Generation Z Pop
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  },
  
  {
    layerName: 'Gen Alpha',
    services: createStateServices(BASE_SERVICE_URL, {
      IL: 47, // IL Generation Alpha Pop
      IN: 48, // IN Generation Alpha Pop
      WI: 49  // WI Generation Alpha Pop
    }),
    cacheTimeout: 300000,
    parallelFetch: true
  }
];

/**
 * Point location layers that don't need federation (ungrouped)
 */
export const POINT_LOCATION_LAYERS = [
  {
    id: 'radio_stations',
    name: 'Radio stations',
    url: `${BASE_SERVICE_URL}/116`, // radio stations - 3 states
    group: 'ungrouped'
  },
  {
    id: 'movie_theaters',
    name: 'Movie Theaters',
    url: `${BASE_SERVICE_URL}/118`, // Combined movie theaters (we'll use IL as representative)
    group: 'ungrouped'
  }
];

/**
 * Layer group definitions for organized display - Updated to match desired structure
 */
export const FEDERATED_LAYER_GROUPS = [
  {
    id: 'classic-rock-audience',
    name: 'Classic Rock Audience',
    description: 'Primary target demographic for doors documentary',
    priority: 1,
    layers: ['Classic Rock Listeners', 'Classic Rock Radio Format Listeners', 'Rock Music Performance Attendance', 'Rock Radio Listeners']
  },
  {
    id: 'documentary-interest',
    name: 'Documentary & Biography Interest',
    description: 'Audience interested in documentary and biography content',
    priority: 2,
    layers: ['Movie Theater Attendance', 'Documentary Movie Viewers', 'Biography Genre Movie Attendance', 'Biography Book Purchases', 'Entertainment/Celebrity Info Seekers']
  },
  {
    id: 'demographics',
    name: 'Demographics',
    description: 'Target demographic segments',
    priority: 3,
    layers: ['Baby Boomers', 'Generation X', 'Millennials', 'Gen Z', 'Gen Alpha']
  },
  {
    id: 'entertainment-spending',
    name: 'Entertainment Spending',
    description: 'Market analysis and spending patterns',
    priority: 4,
    layers: ['Entertainment & Recreation Spending', 'Movie Ticket Spending', 'Music/CD Spending', 'Theater/Opera/Concert Spending']
  },
  {
    id: 'digital-streaming',
    name: 'Digital Music & Streaming',
    description: 'Digital music consumption and promotional channels',
    priority: 5,
    layers: ['Spotify Listeners', 'Apple Music Listeners', 'iHeartRadio Listeners', 'Amazon Music Listeners', 'Pandora Listeners']
  },
  {
    id: 'music-purchasing',
    name: 'Music Purchasing Behavior',
    description: 'Music buying patterns and preferences',
    priority: 6,
    layers: ['Music Store Purchases', 'iTunes Music Purchases', 'Amazon Music Purchases']
  }
];