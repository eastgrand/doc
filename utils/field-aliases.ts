// Field aliases for enhanced query processing
export const FIELD_ALIASES: Record<string, string> = {
  "object id": "OBJECTID",
  "zip code": "DESCRIPTION",
  "id": "ID",
  "2024 total population (esri)": "TOTPOP_CY",
  "internal": "thematic_value",
  "shape__area": "Shape__Area",
  "shape__length": "Shape__Length",
  "creationdate": "CreationDate",
  "creator": "Creator",
  "editdate": "EditDate",
  "editor": "Editor",
  "2024 median disposable income (esri)": "MEDDI_CY",
  "2024 diversity index (esri)": "DIVINDX_CY",
  "2024 white population (esri)": "WHITE_CY",
  "2024 white population (esri) (%)": "WHITE_CY_P",
  "2024 black/african american population (esri)": "BLACK_CY",
  "2024 black/african american population (esri) (%)": "BLACK_CY_P",
  "2024 american indian/alaska native population (esri)": "AMERIND_CY",
  "2024 american indian/alaska native population (esri) (%)": "AMERIND_CY_P",
  "2024 asian population (esri)": "ASIAN_CY",
  "2024 asian population (esri) (%)": "ASIAN_CY_P",
  "2024 pacific islander population (esri)": "PACIFIC_CY",
  "2024 pacific islander population (esri) (%)": "PACIFIC_CY_P",
  "2024 other race population (esri)": "OTHRACE_CY",
  "2024 other race population (esri) (%)": "OTHRACE_CY_P",
  "2024 population of two or more races (esri)": "RACE2UP_CY",
  "2024 population of two or more races (esri) (%)": "RACE2UP_CY_P",
  "2024 hispanic white population (esri)": "HISPWHT_CY",
  "2024 hispanic white population (esri) (%)": "HISPWHT_CY_P",
  "2024 hispanic black/african american population (esri)": "HISPBLK_CY",
  "2024 hispanic black/african american population (esri) (%)": "HISPBLK_CY_P",
  "2024 hispanic american indian/alaska native population (esri)": "HISPAI_CY",
  "2024 hispanic american indian/alaska native population (esri) (%)": "HISPAI_CY_P",
  "2024 hispanic pacific islander population (esri)": "HISPPI_CY",
  "2024 hispanic pacific islander population (esri) (%)": "HISPPI_CY_P",
  "2024 hispanic other race population (esri)": "HISPOTH_CY",
  "2024 hispanic other race population (esri) (%)": "HISPOTH_CY_P",
  "2024 wealth index (esri)": "WLTHINDXCY",
  "2024 household population (esri)": "HHPOP_CY",
  "2024 household population (esri) (%)": "HHPOP_CY_P",
  "2024 family population (esri)": "FAMPOP_CY",
  "2024 family population (esri) (%)": "FAMPOP_CY_P",
  "2024 sports/rec/exercise equipment": "X9051_X",
  "2024 sports/rec/exercise equipment (avg)": "X9051_X_A",
  "2024 spent $300+ on sports clothing last 12 mo": "MP07109A_B",
  "2024 spent $300+ on sports clothing last 12 mo (%)": "MP07109A_B_P",
  "2024 spent $100+ on athletic/workout wear last 12 mo": "MP07111A_B",
  "2024 spent $100+ on athletic/workout wear last 12 mo (%)": "MP07111A_B_P",
  "spent 200+ on shoes": "PSIV7UMKVALM",
  "2024 bought athletic shoes last 12 mo": "MP30016A_B",
  "2024 bought athletic shoes last 12 mo (%)": "MP30016A_B_P",
  "2024 bought basketball shoes last 12 mo": "MP30018A_B",
  "2024 bought basketball shoes last 12 mo (%)": "MP30018A_B_P",
  "2024 bought cross-training shoes last 12 mo": "MP30019A_B",
  "2024 bought cross-training shoes last 12 mo (%)": "MP30019A_B_P",
  "2024 bought running or jogging shoes last 12 mo": "MP30021A_B",
  "2024 bought running or jogging shoes last 12 mo (%)": "MP30021A_B_P",
  "2024 bought adidas athletic shoes last 12 mo": "MP30029A_B",
  "2024 bought adidas athletic shoes last 12 mo (%)": "MP30029A_B_P",
  "2024 bought asics athletic shoes last 12 mo": "MP30030A_B",
  "2024 bought asics athletic shoes last 12 mo (%)": "MP30030A_B_P",
  "2024 bought converse athletic shoes last 12 mo": "MP30031A_B",
  "2024 bought converse athletic shoes last 12 mo (%)": "MP30031A_B_P",
  "2024 bought jordan athletic shoes last 12 mo": "MP30032A_B",
  "2024 bought jordan athletic shoes last 12 mo (%)": "MP30032A_B_P",
  "2024 bought new balance athletic shoes last 12 mo": "MP30033A_B",
  "2024 bought new balance athletic shoes last 12 mo (%)": "MP30033A_B_P",
  "2024 bought nike athletic shoes last 12 mo": "MP30034A_B",
  "2024 bought nike athletic shoes last 12 mo (%)": "MP30034A_B_P",
  "2024 bought puma athletic shoes last 12 mo": "MP30035A_B",
  "2024 bought puma athletic shoes last 12 mo (%)": "MP30035A_B_P",
  "2024 bought reebok athletic shoes last 12 mo": "MP30036A_B",
  "2024 bought reebok athletic shoes last 12 mo (%)": "MP30036A_B_P",
  "2024 bought skechers athletic shoes last 12 mo": "MP30037A_B",
  "2024 bought skechers athletic shoes last 12 mo (%)": "MP30037A_B_P",
  "2024 shopped at dick`s sporting goods store last 3 mo": "MP31035A_B",
  "2024 shopped at dick`s sporting goods store last 3 mo (%)": "MP31035A_B_P",
  "2024 shopped at foot locker store last 3 mo": "MP31042A_B",
  "2024 shopped at foot locker store last 3 mo (%)": "MP31042A_B_P",
  "2024 participated in jogging or running last 12 mo": "MP33020A_B",
  "2024 participated in jogging or running last 12 mo (%)": "MP33020A_B_P",
  "2024 participated in yoga last 12 mo": "MP33032A_B",
  "2024 participated in yoga last 12 mo (%)": "MP33032A_B_P",
  "2024 participated in weight lifting last 12 mo": "MP33031A_B",
  "2024 participated in weight lifting last 12 mo (%)": "MP33031A_B_P",
  "2024 mlb super fan (10-10 on 10 scale)": "MP33104A_B",
  "2024 mlb super fan (10-10 on 10 scale) (%)": "MP33104A_B_P",
  "2024 nascar super fan (10-10 on 10 scale)": "MP33105A_B",
  "2024 nascar super fan (10-10 on 10 scale) (%)": "MP33105A_B_P",
  "2024 nba super fan (10-10 on 10 scale)": "MP33106A_B",
  "2024 nba super fan (10-10 on 10 scale) (%)": "MP33106A_B_P",
  "2024 nfl super fan (10-10 on 10 scale)": "MP33107A_B",
  "2024 nfl super fan (10-10 on 10 scale) (%)": "MP33107A_B_P",
  "2024 nhl super fan (10-10 on 10 scale)": "MP33108A_B",
  "2024 nhl super fan (10-10 on 10 scale) (%)": "MP33108A_B_P",
  "2024 international soccer super fan (10-10 on 10 scale)": "MP33119A_B",
  "2024 international soccer super fan (10-10 on 10 scale) (%)": "MP33119A_B_P",
  "2024 mls soccer super fan (10-10 on 10 scale)": "MP33120A_B",
  "2024 mls soccer super fan (10-10 on 10 scale) (%)": "MP33120A_B_P",
  "2024 generation z population (born 1999 to 2016) (esri)": "GENZ_CY",
  "2024 generation z population (born 1999 to 2016) (esri) (%)": "GENZ_CY_P",
  "2024 generation alpha population (born 2017 or later) (esri)": "GENALPHACY",
  "2024 generation alpha population (born 2017 or later) (esri) (%)": "GENALPHACY_P",
  "2024 millennial population (born 1981 to 1998) (esri)": "MILLENN_CY",
  "2024 millennial population (born 1981 to 1998) (esri) (%)": "MILLENN_CY_P",
  
  // Add lowercase versions of brand field codes (with and without underscores)
  "mp30029a_b": "MP30029A_B", // adidas
  "mp30029_a_b": "MP30029A_B", // adidas (with underscores)
  "mp30030a_b": "MP30030A_B", // asics
  "mp30030_a_b": "MP30030A_B", // asics (with underscores)
  "mp30031a_b": "MP30031A_B", // converse
  "mp30031_a_b": "MP30031A_B", // converse (with underscores)
  "mp30032a_b": "MP30032A_B", // jordan
  "mp30032_a_b": "MP30032A_B", // jordan (with underscores)
  "mp30033a_b": "MP30033A_B", // new balance
  "mp30033_a_b": "MP30033A_B", // new balance (with underscores)
  "mp30034a_b": "MP30034A_B", // nike
  "mp30034_a_b": "MP30034A_B", // nike (with underscores)
  "mp30035a_b": "MP30035A_B", // puma
  "mp30035_a_b": "MP30035A_B", // puma (with underscores)
  "mp30036a_b": "MP30036A_B", // reebok
  "mp30036_a_b": "MP30036A_B", // reebok (with underscores)
  "mp30037a_b": "MP30037A_B", // skechers
  "mp30037_a_b": "MP30037A_B", // skechers (with underscores)
  
  // Add lowercase versions of brand field percentage codes (with and without underscores)
  "mp30029a_b_p": "MP30029A_B_P", // adidas %
  "mp30029_a_b_p": "MP30029A_B_P", // adidas % (with underscores)
  "mp30030a_b_p": "MP30030A_B_P", // asics %
  "mp30030_a_b_p": "MP30030A_B_P", // asics % (with underscores)
  "mp30031a_b_p": "MP30031A_B_P", // converse %
  "mp30031_a_b_p": "MP30031A_B_P", // converse % (with underscores)
  "mp30032a_b_p": "MP30032A_B_P", // jordan %
  "mp30032_a_b_p": "MP30032A_B_P", // jordan % (with underscores)
  "mp30033a_b_p": "MP30033A_B_P", // new balance %
  "mp30033_a_b_p": "MP30033A_B_P", // new balance % (with underscores)
  "mp30034a_b_p": "MP30034A_B_P", // nike %
  "mp30034_a_b_p": "MP30034A_B_P", // nike % (with underscores)
  "mp30035a_b_p": "MP30035A_B_P", // puma %
  "mp30035_a_b_p": "MP30035A_B_P", // puma % (with underscores)
  "mp30036a_b_p": "MP30036A_B_P", // reebok %
  "mp30036_a_b_p": "MP30036A_B_P", // reebok % (with underscores)
  "mp30037a_b_p": "MP30037A_B_P", // skechers %
  "mp30037_a_b_p": "MP30037A_B_P",  // skechers % (with underscores)
  
  // Add lowercase versions of demographic field codes
  "totpop_cy": "TOTPOP_CY", // total population
  "meddi_cy": "MEDDI_CY", // median disposable income
  "divindx_cy": "DIVINDX_CY", // diversity index
  "white_cy": "WHITE_CY", // white population
  "black_cy": "BLACK_CY", // black population
  "asian_cy": "ASIAN_CY", // asian population
  "hispwht_cy": "HISPWHT_CY", // hispanic white population
  "genz_cy": "GENZ_CY", // gen z population
  "millenn_cy": "MILLENN_CY", // millennial population
  
  // Add lowercase versions of demographic field percentage codes
  "white_cy_p": "WHITE_CY_P", // white population %
  "black_cy_p": "BLACK_CY_P", // black population %
  "asian_cy_p": "ASIAN_CY_P", // asian population %
  "hispwht_cy_p": "HISPWHT_CY_P", // hispanic white population %
  "genz_cy_p": "GENZ_CY_P", // gen z population %
  "millenn_cy_p": "MILLENN_CY_P", // millennial population %
  "genalphacy": "GENALPHACY", // gen alpha population
  "description": "DESCRIPTION", // description/zip code description field
  "Nike Athletic Shoes Purchases": "MP30034A_B",
  "Adidas Athletic Shoes Purchases": "MP30029A_B",
  "Asics Athletic Shoes Purchases": "MP30030A_B",
  "Converse Athletic Shoes Purchases": "MP30031A_B",
  "Jordan Athletic Shoes Purchases": "MP30032A_B",
  "New Balance Athletic Shoes Purchases": "MP30033A_B",
  "Puma Athletic Shoes Purchases": "MP30035A_B",
  "Reebok Athletic Shoes Purchases": "MP30036A_B",
  "Skechers Athletic Shoes Purchases": "MP30037A_B",
  "Nike Athletic Shoes Purchases (%)": "MP30034A_B_P",
  "Adidas Athletic Shoes Purchases (%)": "MP30029A_B_P",
  "Asics Athletic Shoes Purchases (%)": "MP30030A_B_P",
  "Converse Athletic Shoes Purchases (%)": "MP30031A_B_P",
  "Jordan Athletic Shoes Purchases (%)": "MP30032A_B_P",
  "New Balance Athletic Shoes Purchases (%)": "MP30033A_B_P",
  "Puma Athletic Shoes Purchases (%)": "MP30035A_B_P",
  "Reebok Athletic Shoes Purchases (%)": "MP30036A_B_P",
  "Skechers Athletic Shoes Purchases (%)": "MP30037A_B_P",

  // Natural language terms for common queries
  // Population terms
  "population": "TOTPOP_CY",
  "total population": "TOTPOP_CY", 
  "people": "TOTPOP_CY",
  "residents": "TOTPOP_CY",
  "demographic": "TOTPOP_CY",
  "demographics": "TOTPOP_CY",
  
  // Income terms
  "income": "MEDDI_CY",
  "median income": "MEDDI_CY",
  "disposable income": "MEDDI_CY", 
  "household income": "MEDDI_CY",
  "earnings": "MEDDI_CY",
  "wages": "MEDDI_CY",
  "salary": "MEDDI_CY",
  "wealth": "MEDDI_CY",
  
  // Age and generation terms
  "age": "Age",
  "young": "GENZ_CY_P",
  "younger": "GENZ_CY_P", 
  "gen z": "GENZ_CY_P",
  "generation z": "GENZ_CY_P",
  "millennials": "MILLENN_CY_P",
  "millennial": "MILLENN_CY_P",
  "gen alpha": "GENALPHACY_P",
  "generation alpha": "GENALPHACY_P",
  
  // Race and ethnicity terms  
  "white": "WHITE_CY_P",
  "caucasian": "WHITE_CY_P",
  "black": "BLACK_CY_P", 
  "african american": "BLACK_CY_P",
  "hispanic": "HISPWHT_CY_P",
  "latino": "HISPWHT_CY_P",
  "asian": "ASIAN_CY_P",
  "diversity": "DIVINDX_CY",
  "diverse": "DIVINDX_CY",
  "minority": "RACE2UP_CY_P",
  "minorities": "RACE2UP_CY_P",
  
  // Sports and activity terms
  "running": "MP30021A_B_P",
  "jogging": "MP30021A_B_P", 
  "runners": "MP30021A_B_P",
  "basketball": "MP30018A_B_P",
  "athletic shoes": "MP30016A_B_P",
  "sneakers": "MP30016A_B_P",
  "footwear": "MP30016A_B_P",
  "shoes": "MP30016A_B_P",
  "cross training": "MP30019A_B_P",
  "workout": "MP07111A_B_P",
  "exercise": "X9051_X",
  "fitness": "X9051_X",
  "sports": "X9051_X",
  "athletic": "MP30016A_B_P",
  
  // Shopping and retail terms
  "shopping": "MP31035A_B_P",
  "retail": "MP31035A_B_P", 
  "dicks sporting goods": "MP31035A_B_P",
  "foot locker": "MP31042A_B_P",
  "spending": "MP07109A_B_P",
  "purchases": "MP30016A_B_P",
  "buying": "MP30016A_B_P",
  "consumers": "MP30016A_B_P",
  
  // Brand variations and common misspellings
  "addidas": "MP30029A_B_P", // common misspelling
  "nike": "MP30034A_B_P",
  "adidas": "MP30029A_B_P", 
  "asics": "MP30030A_B_P",
  "converse": "MP30031A_B_P",
  "jordan": "MP30032A_B_P",
  "air jordan": "MP30032A_B_P",
  "new balance": "MP30033A_B_P",
  "newbalance": "MP30033A_B_P",
  "puma": "MP30035A_B_P",
  "reebok": "MP30036A_B_P",
  "skechers": "MP30037A_B_P",
  "sketchers": "MP30037A_B_P", // common misspelling
  
  // Geographic terms
  "area": "Shape__Area",
  "region": "DESCRIPTION",
  "location": "DESCRIPTION", 
  "zipcode": "DESCRIPTION",
  "postal code": "DESCRIPTION",
  "geographic": "Shape__Area",
  "geography": "Shape__Area",
  
  // Housing terms
  "housing": "thematic_value",
  "homes": "thematic_value",
  "households": "HHPOP_CY_P",
  "families": "FAMPOP_CY_P",
  "family": "FAMPOP_CY_P",
  "household": "HHPOP_CY_P"
};

export const fieldAliases = FIELD_ALIASES;
