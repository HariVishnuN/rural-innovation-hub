"""
Rural Innovation Hub - Local Visual Assets Generator
Generates realistic, high-contrast SVG assets for:
1. Exact matching inventions (hardware machines, irrigation, terracotta cooler, briquette press, etc.)
2. Technical CAD blueprints with dimensional schematics
3. Authentic inventor & official portraits
Stored directly in frontend/public/images/ so they load 100% locally with zero broken links.
"""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_PUBLIC = os.path.join(BASE_DIR, "frontend", "public", "images")

INV_DIR = os.path.join(FRONTEND_PUBLIC, "inventions")
BP_DIR = os.path.join(FRONTEND_PUBLIC, "blueprints")
USER_DIR = os.path.join(FRONTEND_PUBLIC, "inventors")

os.makedirs(INV_DIR, exist_ok=True)
os.makedirs(BP_DIR, exist_ok=True)
os.makedirs(USER_DIR, exist_ok=True)


def write_svg(filepath, content):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Created: {filepath}")


# ==============================================================================
# 1. INVENTIONS SVG ASSETS (Exact Realistic Matching Hardware Visuals)
# ==============================================================================

# 1. Solar Drip Irrigation Kit
solar_drip_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="60%" stop-color="#F0FDF4"/>
      <stop offset="100%" stop-color="#DCFCE7"/>
    </linearGradient>
    <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>
    <linearGradient id="drumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <linearGradient id="pvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>

  <!-- Sky and Sun Background -->
  <rect width="800" height="340" fill="url(#skyGrad)"/>
  <circle cx="700" cy="80" r="50" fill="#FDE047" opacity="0.9"/>
  <circle cx="700" cy="80" r="70" fill="#FEF08A" opacity="0.4"/>

  <!-- Farm Ground Soil -->
  <rect y="340" width="800" height="160" fill="url(#groundGrad)"/>

  <!-- Crop Rows -->
  <g fill="#15803D">
    <!-- Row 1 Plants -->
    <path d="M 400 340 Q 390 310 380 290 Q 400 300 405 340 Z"/>
    <path d="M 405 340 Q 420 305 435 295 Q 415 310 410 340 Z"/>
    <ellipse cx="407" cy="290" rx="15" ry="10" fill="#22C55E"/>

    <!-- Row 2 Plants -->
    <path d="M 520 340 Q 510 310 500 290 Q 520 300 525 340 Z"/>
    <path d="M 525 340 Q 540 305 555 295 Q 535 310 530 340 Z"/>
    <ellipse cx="527" cy="290" rx="15" ry="10" fill="#22C55E"/>

    <!-- Row 3 Plants -->
    <path d="M 640 340 Q 630 310 620 290 Q 640 300 645 340 Z"/>
    <path d="M 645 340 Q 660 305 675 295 Q 655 310 650 340 Z"/>
    <ellipse cx="647" cy="290" rx="15" ry="10" fill="#22C55E"/>
  </g>

  <!-- Elevated Water Drum Stand (Tripod 1.2m) -->
  <g stroke="#334155" stroke-width="6" stroke-linecap="round">
    <line x1="120" y1="210" x2="80" y2="350"/>
    <line x1="220" y1="210" x2="260" y2="350"/>
    <line x1="170" y1="210" x2="170" y2="350"/>
    <!-- Cross Bracing -->
    <line x1="95" y1="280" x2="245" y2="280" stroke-width="4"/>
  </g>

  <!-- 200L Upcycled Food-Grade Blue Drum -->
  <rect x="110" y="90" width="120" height="130" rx="15" fill="url(#drumGrad)"/>
  <!-- Drum Ribs -->
  <line x1="110" y1="125" x2="230" y2="125" stroke="#0284C7" stroke-width="4"/>
  <line x1="110" y1="165" x2="230" y2="165" stroke="#0284C7" stroke-width="4"/>
  <rect x="150" y="80" width="40" height="12" rx="4" fill="#0369A1"/>

  <!-- 40W Solar PV Panel on Mast -->
  <g transform="translate(40, 60)">
    <line x1="30" y1="70" x2="30" y2="280" stroke="#475569" stroke-width="5"/>
    <polygon points="0,70 60,30 65,85 5,125" fill="url(#pvGrad)" stroke="#94A3B8" stroke-width="2"/>
    <!-- PV Grid lines -->
    <line x1="15" y1="60" x2="20" y2="115" stroke="#38BDF8" stroke-width="1"/>
    <line x1="30" y1="50" x2="35" y2="105" stroke="#38BDF8" stroke-width="1"/>
    <line x1="45" y1="40" x2="50" y2="95" stroke="#38BDF8" stroke-width="1"/>
  </g>

  <!-- 12V DC Booster Pump & 120-Mesh Filter Box -->
  <rect x="155" y="290" width="45" height="30" rx="4" fill="#1E293B"/>
  <circle cx="177" cy="305" r="8" fill="#14B8A6"/>
  <!-- Red disc filter -->
  <rect x="205" y="295" width="25" height="20" rx="3" fill="#DC2626"/>

  <!-- Black 16mm LDPE Drip Pipe Line with Droplets -->
  <path d="M 170 220 L 170 290 L 205 290 L 230 290 L 230 350 L 760 350" fill="none" stroke="#0F172A" stroke-width="6" stroke-linejoin="round"/>

  <!-- Micro Drippers & Emitting Water Drops -->
  <g fill="#0284C7">
    <!-- Emitter 1 -->
    <rect x="402" y="344" width="8" height="12" fill="#E11D48"/>
    <circle cx="406" cy="365" r="4"/>
    <circle cx="406" cy="378" r="3" opacity="0.7"/>

    <!-- Emitter 2 -->
    <rect x="522" y="344" width="8" height="12" fill="#E11D48"/>
    <circle cx="526" cy="365" r="4"/>
    <circle cx="526" cy="378" r="3" opacity="0.7"/>

    <!-- Emitter 3 -->
    <rect x="642" y="344" width="8" height="12" fill="#E11D48"/>
    <circle cx="646" cy="365" r="4"/>
    <circle cx="646" cy="378" r="3" opacity="0.7"/>
  </g>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Solar Micro-Drip Irrigation Kit</text>
  <text x="270" y="48" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">65% Water Saved</text>
</svg>"""

# 2. Bicycle-Powered Multi-Crop Thresher
bicycle_thresher_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="workshopBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="drumSteel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>

  <!-- Workshop Floor & Background -->
  <rect width="800" height="500" fill="url(#workshopBg)"/>
  <rect y="380" width="800" height="120" fill="#CBD5E1"/>
  <line x1="0" y1="380" x2="800" y2="380" stroke="#94A3B8" stroke-width="3"/>

  <!-- Angle Iron Structural Base Frame -->
  <rect x="80" y="365" width="640" height="16" fill="#1E293B"/>
  <line x1="120" y1="381" x2="120" y2="400" stroke="#0F172A" stroke-width="8"/>
  <line x1="680" y1="381" x2="680" y2="400" stroke="#0F172A" stroke-width="8"/>

  <!-- Bicycle Roadster Frame (Classic Black Roadster) -->
  <g stroke="#0F172A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Rear Wheel Support & Hub -->
    <circle cx="200" cy="300" r="75" stroke="#64748B" stroke-width="4"/>
    <circle cx="200" cy="300" r="10" fill="#0F172A"/>

    <!-- Cycle Diamonds Frame -->
    <line x1="200" y1="300" x2="300" y2="300"/> <!-- Chainstay -->
    <line x1="200" y1="300" x2="280" y2="200"/> <!-- Seatstay -->
    <line x1="300" y1="300" x2="280" y2="200"/> <!-- Seattube -->
    <line x1="280" y1="200" x2="410" y2="200"/> <!-- Toptube -->
    <line x1="300" y1="300" x2="420" y2="230"/> <!-- Downtube -->
    <line x1="410" y1="200" x2="420" y2="230"/> <!-- Headtube -->

    <!-- Fork & Handlebar -->
    <line x1="410" y1="200" x2="405" y2="150"/>
    <path d="M 380 150 L 430 150 L 440 165"/> <!-- Handlebar curve -->

    <!-- Saddle Seat -->
    <path d="M 260 185 Q 280 180 300 185 L 290 195 Z" fill="#0F172A"/>

    <!-- Pedals & Chainwheel -->
    <circle cx="300" cy="300" r="22" stroke="#D97706" stroke-width="5" fill="#FEF3C7"/>
    <line x1="300" y1="300" x2="315" y2="330" stroke="#0F172A" stroke-width="6"/>
    <line x1="310" y1="330" x2="330" y2="330" stroke="#E11D48" stroke-width="8"/>
  </g>

  <!-- Step-Up Belt Drive to Threshing Jackshaft -->
  <line x1="200" y1="300" x2="540" y2="230" stroke="#D97706" stroke-width="5" stroke-dasharray="8,4"/>

  <!-- High-Speed Wire Loop Thresher Drum & Shroud -->
  <g transform="translate(500, 150)">
    <!-- Shroud Hood (18-Gauge Steel) -->
    <path d="M 0 120 A 70 70 0 1 1 120 120 L 130 160 L -10 160 Z" fill="url(#drumSteel)" stroke="#334155" stroke-width="4"/>

    <!-- Threshing Cylinder Axle & Bearings -->
    <circle cx="60" cy="80" r="50" fill="#1E293B"/>
    <!-- Wire Loops on Drum -->
    <g stroke="#F59E0B" stroke-width="3" fill="none">
      <path d="M 60 30 C 50 15, 70 15, 60 30"/>
      <path d="M 100 60 C 115 50, 115 70, 100 60"/>
      <path d="M 80 115 C 90 130, 70 130, 80 115"/>
      <path d="M 25 95 C 10 105, 10 85, 25 95"/>
      <path d="M 25 50 C 10 40, 20 25, 25 50"/>
    </g>
    <circle cx="60" cy="80" r="14" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>

    <!-- Feed Chute / Hopper Tray -->
    <polygon points="-20,20 20,40 10,70 -40,30" fill="#94A3B8" stroke="#475569" stroke-width="2"/>
    <!-- Wheat / Millet Stalk Feeding In -->
    <path d="M -80 0 Q -30 20 10 45" stroke="#EAB308" stroke-width="4" stroke-linecap="round"/>
    <path d="M -75 10 Q -25 25 15 48" stroke="#CA8A04" stroke-width="3"/>
  </g>

  <!-- Lower Winnower Fan & Grain Separation Chute -->
  <g transform="translate(510, 310)">
    <rect x="0" y="0" width="110" height="55" fill="#475569" rx="4"/>
    <!-- Fan Blades -->
    <line x1="55" y1="15" x2="55" y2="40" stroke="#94A3B8" stroke-width="6"/>
    <line x1="35" y1="28" x2="75" y2="28" stroke="#94A3B8" stroke-width="6"/>
    <!-- Air Flow / Chaff stream -->
    <path d="M 120 25 Q 160 15 200 30" stroke="#94A3B8" stroke-width="3" stroke-dasharray="5,5" fill="none"/>
    <text x="140" y="15" fill="#64748B" font-size="10" font-family="sans-serif">Chaff Blown Away</text>
  </g>

  <!-- Clean Grain Collection Basin (Paddy / Wheat) -->
  <polygon points="500,380 640,380 625,410 515,410" fill="#CA8A04" stroke="#854D0E" stroke-width="2"/>
  <ellipse cx="570" cy="385" rx="55" ry="8" fill="#FDE047"/>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="340" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Bicycle Multi-Crop Thresher</text>
  <text x="260" y="48" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">45 kg/hr Zero Diesel</text>
</svg>"""

# 3. Solar-Vibratory Seed Grader
seed_grader_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="graderBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="woodTray" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B45309"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#graderBg)"/>
  <rect y="400" width="800" height="100" fill="#CBD5E1"/>

  <!-- Steel Base Stand Frame -->
  <g stroke="#1E293B" stroke-width="8" stroke-linecap="round">
    <line x1="200" y1="280" x2="170" y2="420"/>
    <line x1="560" y1="280" x2="590" y2="420"/>
    <line x1="180" y1="370" x2="580" y2="370" stroke-width="6"/>
  </g>

  <!-- 4 Heavy Duty Motorcycle Harmonic Springs -->
  <g stroke="#475569" stroke-width="5" fill="none">
    <!-- Left Front Spring -->
    <path d="M 210 280 Q 225 290 210 300 Q 195 310 210 320 Q 225 330 210 340 L 210 355"/>
    <!-- Right Front Spring -->
    <path d="M 550 280 Q 565 290 550 300 Q 535 310 550 320 Q 565 330 550 340 L 550 355"/>
  </g>

  <!-- 3-Tiered Inclined Sieve Box (Inclined at 7 Degrees) -->
  <g transform="rotate(7, 380, 240)">
    <!-- Wooden Box Enclosure -->
    <rect x="180" y="160" width="400" height="120" rx="6" fill="url(#woodTray)" stroke="#78350F" stroke-width="4"/>

    <!-- Tier 1: 4.0mm Stainless Steel Screen (Coarse trash & pods) -->
    <line x1="190" y1="190" x2="550" y2="190" stroke="#E2E8F0" stroke-width="4" stroke-dasharray="3,3"/>
    <text x="200" y="185" fill="#FEF3C7" font-size="10" font-family="sans-serif" font-weight="bold">Deck 1: 4.0mm Oversize Mesh</text>

    <!-- Tier 2: 2.5mm Stainless Steel Screen (Grade-A Prime Seeds) -->
    <line x1="190" y1="225" x2="550" y2="225" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="2,2"/>
    <text x="200" y="220" fill="#FEF3C7" font-size="10" font-family="sans-serif" font-weight="bold">Deck 2: 2.5mm Grade-A Seed Screen</text>

    <!-- Tier 3: 1.2mm Dust & Broken Hull Screen -->
    <line x1="190" y1="260" x2="550" y2="260" stroke="#94A3B8" stroke-width="2" stroke-dasharray="1,2"/>
    <text x="200" y="255" fill="#FEF3C7" font-size="10" font-family="sans-serif" font-weight="bold">Deck 3: 1.2mm Sift Bottom</text>

    <!-- Eccentric Weight Motor Bolted Underneath -->
    <rect x="330" y="280" width="70" height="35" rx="6" fill="#0F172A"/>
    <circle cx="365" cy="298" r="10" fill="#DC2626"/>
    <!-- Oscillation motion arrows -->
    <path d="M 320 310 Q 340 330 360 310" stroke="#38BDF8" stroke-width="3" fill="none"/>
  </g>

  <!-- Feed Hopper Above -->
  <polygon points="260,80 400,80 360,150 300,150" fill="#0284C7" stroke="#0369A1" stroke-width="3"/>
  <ellipse cx="330" cy="80" rx="70" ry="12" fill="#38BDF8"/>
  <!-- Pulses Pouring In -->
  <circle cx="330" cy="120" r="3" fill="#F59E0B"/>
  <circle cx="325" cy="135" r="4" fill="#D97706"/>
  <circle cx="335" cy="140" r="3" fill="#B45309"/>

  <!-- 20W Solar PV Module on Right -->
  <g transform="translate(620, 100)">
    <line x1="40" y1="60" x2="40" y2="280" stroke="#475569" stroke-width="5"/>
    <polygon points="10,60 80,40 75,130 5,150" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
    <!-- Wire to motor -->
    <path d="M 40 140 Q 500 280 370 300" stroke="#DC2626" stroke-width="2" fill="none" stroke-dasharray="6,3"/>
  </g>

  <!-- 3 Output Bins for Graded Seeds -->
  <g transform="translate(560, 360)">
    <!-- Bin 1: Large Pods -->
    <rect x="0" y="0" width="45" height="40" fill="#94A3B8" rx="3"/>
    <circle cx="22" cy="10" r="4" fill="#78350F"/>
    <!-- Bin 2: Grade-A Pure Seed -->
    <rect x="55" y="0" width="55" height="40" fill="#16A34A" rx="3"/>
    <circle cx="82" cy="10" r="4" fill="#FDE047"/>
    <text x="60" y="32" fill="#FFFFFF" font-size="8" font-family="sans-serif" font-weight="bold">Grade-A</text>
  </g>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Solar-Vibratory Seed Grader</text>
  <text x="245" y="48" fill="#22C55E" font-family="sans-serif" font-size="12" font-weight="bold">+25% Germination</text>
</svg>"""

# 4. Hydraulic Agri-Waste Briquette Press
briquette_press_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="pressBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="channelSteel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#pressBg)"/>
  <rect y="400" width="800" height="100" fill="#94A3B8"/>

  <!-- Inverted Structural U-Frame (75x40mm ISMC Steel Channels) -->
  <g fill="url(#channelSteel)" stroke="#0F172A" stroke-width="3">
    <!-- Base Plate -->
    <rect x="220" y="380" width="360" height="25" rx="3"/>
    <!-- Left Column Beam -->
    <rect x="260" y="100" width="45" height="280" rx="3"/>
    <!-- Right Column Beam -->
    <rect x="495" y="100" width="45" height="280" rx="3"/>
    <!-- Upper Top Crossbeam -->
    <rect x="240" y="90" width="320" height="50" rx="4"/>
  </g>

  <!-- Heavy 8.8 High-Tensile Bolts on Structural Frame -->
  <g fill="#CBD5E1" stroke="#0F172A" stroke-width="1.5">
    <circle cx="282" cy="115" r="5"/>
    <circle cx="282" cy="130" r="5"/>
    <circle cx="517" cy="115" r="5"/>
    <circle cx="517" cy="130" r="5"/>
    <circle cx="282" cy="370" r="5"/>
    <circle cx="517" cy="370" r="5"/>
  </g>

  <!-- 5-Ton Red Commercial Hydraulic Bottle Jack -->
  <g transform="translate(365, 140)">
    <!-- Jack Body Cylinder -->
    <rect x="0" y="40" width="70" height="90" rx="8" fill="#DC2626" stroke="#991B1B" stroke-width="3"/>
    <rect x="15" y="10" width="40" height="30" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/> <!-- Ram -->
    <circle cx="35" cy="8" r="14" fill="#0F172A"/> <!-- Pressure Plate -->
    <text x="14" y="90" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">5 TON</text>

    <!-- Hydraulic Pumping Handle Lever -->
    <line x1="65" y1="90" x2="160" y2="40" stroke="#0F172A" stroke-width="8" stroke-linecap="round"/>
    <circle cx="160" cy="40" r="8" fill="#F59E0B"/>
  </g>

  <!-- Dual Retraction Coil Springs -->
  <g stroke="#0284C7" stroke-width="3" fill="none">
    <path d="M 330 140 Q 340 160 330 180 Q 320 200 330 220 L 330 240"/>
    <path d="M 470 140 Q 480 160 470 180 Q 460 200 470 220 L 470 240"/>
  </g>

  <!-- 4-Inch Heavy Steel Compression Cylinder Mould with Perforations -->
  <g transform="translate(350, 260)">
    <rect x="0" y="0" width="100" height="110" rx="6" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <!-- Perforation Drainage Holes for Moisture Escape -->
    <g fill="#0284C7">
      <circle cx="20" cy="30" r="3"/>
      <circle cx="50" cy="30" r="3"/>
      <circle cx="80" cy="30" r="3"/>
      <circle cx="35" cy="60" r="3"/>
      <circle cx="65" cy="60" r="3"/>
      <circle cx="20" cy="90" r="3"/>
      <circle cx="50" cy="90" r="3"/>
      <circle cx="80" cy="90" r="3"/>
    </g>
    <!-- Moisture Drops Escaping -->
    <circle cx="20" cy="100" r="2" fill="#38BDF8"/>
    <circle cx="50" cy="102" r="2" fill="#38BDF8"/>
  </g>

  <!-- Bottom Foot Ejection Lever -->
  <line x1="320" y1="375" x2="200" y2="395" stroke="#D97706" stroke-width="7" stroke-linecap="round"/>
  <rect x="180" y="390" width="30" height="12" fill="#0F172A" rx="2"/>

  <!-- Finished Compacted Smokeless Biomass Fuel Log -->
  <g transform="translate(600, 310)">
    <rect x="0" y="0" width="60" height="85" rx="6" fill="#78350F" stroke="#451A03" stroke-width="3"/>
    <line x1="0" y1="20" x2="60" y2="20" stroke="#92400E" stroke-width="2"/>
    <line x1="0" y1="45" x2="60" y2="45" stroke="#92400E" stroke-width="2"/>
    <line x1="0" y1="65" x2="60" y2="65" stroke="#92400E" stroke-width="2"/>
    <!-- Center Air Hole in Briquette -->
    <ellipse cx="30" cy="10" rx="10" ry="4" fill="#1C1917"/>
    <text x="-15" y="105" fill="#451A03" font-size="11" font-family="sans-serif" font-weight="bold">Finished Log</text>
  </g>

  <!-- Raw Biomass Straw Pile on Left -->
  <path d="M 120 400 Q 150 340 190 380 Q 210 330 240 400 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="2"/>
  <text x="130" y="420" fill="#78350F" font-size="11" font-family="sans-serif" font-weight="bold">Agri-Residue</text>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">5-Ton Hydraulic Briquette Press</text>
  <text x="250" y="48" fill="#F87171" font-family="sans-serif" font-size="12" font-weight="bold">Smokeless Fuel</text>
</svg>"""

# 5. Solar Concentrator Water Distiller
solar_distiller_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="distillSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="mirrorTrough" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="30%" stop-color="#F8FAFC"/>
      <stop offset="70%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>

  <rect width="800" height="360" fill="url(#distillSky)"/>
  <rect y="360" width="800" height="140" fill="#CBD5E1"/>

  <!-- Sun with Radiant Rays -->
  <circle cx="400" cy="50" r="40" fill="#FBBF24"/>
  <g stroke="#FDE047" stroke-width="3" opacity="0.8">
    <line x1="330" y1="80" x2="260" y2="180"/>
    <line x1="370" y1="95" x2="330" y2="200"/>
    <line x1="430" y1="95" x2="470" y2="200"/>
    <line x1="470" y1="80" x2="540" y2="180"/>
  </g>

  <!-- Wooden Rib Cradle Supports -->
  <polygon points="180,360 220,240 260,360" fill="#78350F"/>
  <polygon points="540,360 580,240 620,360" fill="#78350F"/>

  <!-- Parabolic Solar Trough Mirror (SS 430 Polished Sheet) -->
  <path d="M 180 200 Q 400 340 620 200 L 610 220 Q 400 355 190 220 Z" fill="url(#mirrorTrough)" stroke="#475569" stroke-width="3"/>

  <!-- Reflected Rays Converging on Focal Centerline -->
  <g stroke="#FEF08A" stroke-width="2.5" stroke-dasharray="4,4">
    <line x1="220" y1="240" x2="400" y2="190"/>
    <line x1="310" y1="290" x2="400" y2="190"/>
    <line x1="490" y1="290" x2="400" y2="190"/>
    <line x1="580" y1="240" x2="400" y2="190"/>
  </g>

  <!-- Black Absorber Tube (Focal Axis Boiler) -->
  <g stroke="#0F172A" stroke-width="12" stroke-linecap="round">
    <line x1="170" y1="190" x2="630" y2="190"/>
  </g>
  <line x1="170" y1="190" x2="630" y2="190" stroke="#E11D48" stroke-width="4" stroke-linecap="round"/>

  <!-- Steam Vapor Rising from Boiling Tube -->
  <path d="M 400 170 Q 410 150 400 135" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 420 170 Q 430 150 420 135" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.8"/>

  <!-- Copper Condenser Coil Submerged in Cold Water Tank -->
  <g transform="translate(630, 200)">
    <!-- Condenser Drum -->
    <rect x="20" y="30" width="90" height="110" rx="8" fill="#0284C7" stroke="#0369A1" stroke-width="3"/>
    <!-- Copper Cooling Spiral -->
    <path d="M 0 -10 L 40 40 Q 60 50 40 60 Q 20 70 40 80 Q 60 90 40 100 L 50 160" stroke="#EA580C" stroke-width="5" fill="none"/>
  </g>

  <!-- Pure Distilled Water Collection Glass Flask -->
  <g transform="translate(660, 370)">
    <polygon points="10,40 50,40 40,0 20,0" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
    <ellipse cx="30" cy="30" rx="15" ry="6" fill="#38BDF8"/>
    <text x="0" y="55" fill="#0369A1" font-size="10" font-family="sans-serif" font-weight="bold">Pure Distillate</text>
  </g>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Solar Concentrator Distiller</text>
  <text x="235" y="48" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">Fluoride-Free Pure</text>
</svg>"""

# 6. Hand-Crank Seed Drill & Fertilizer Applicator
seed_drill_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="fieldSoil" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#A16207"/>
      <stop offset="100%" stop-color="#713F12"/>
    </linearGradient>
  </defs>

  <rect width="800" height="340" fill="#F0FDF4"/>
  <rect y="340" width="800" height="160" fill="url(#fieldSoil)"/>

  <!-- Furrow Groove Cut in Soil -->
  <path d="M 0 380 Q 300 375 800 380" stroke="#451A03" stroke-width="12" fill="none"/>

  <!-- 16-Inch Bicycle Front Drive Wheel with Cleats -->
  <g transform="translate(240, 310)">
    <circle cx="0" cy="0" r="85" stroke="#334155" stroke-width="7" fill="none"/>
    <circle cx="0" cy="0" r="12" fill="#0F172A"/>
    <!-- Spokes -->
    <line x1="-80" y1="0" x2="80" y2="0" stroke="#94A3B8" stroke-width="2"/>
    <line x1="0" y1="-80" x2="0" y2="80" stroke="#94A3B8" stroke-width="2"/>
    <line x1="-60" y1="-60" x2="60" y2="60" stroke="#94A3B8" stroke-width="2"/>
    <line x1="-60" y1="60" x2="60" y2="-60" stroke="#94A3B8" stroke-width="2"/>
    <!-- Traction Cleats Welded on Rim -->
    <rect x="-93" y="-5" width="10" height="10" fill="#E11D48"/>
    <rect x="83" y="-5" width="10" height="10" fill="#E11D48"/>
    <rect x="-5" y="-93" width="10" height="10" fill="#E11D48"/>
    <rect x="-5" y="83" width="10" height="10" fill="#E11D48"/>
  </g>

  <!-- Main Structural Chassis & Handlebars -->
  <g stroke="#0F172A" stroke-width="8" stroke-linecap="round">
    <!-- Wheel Hub to Handlebar Shaft -->
    <line x1="240" y1="310" x2="420" y2="220"/>
    <line x1="420" y1="220" x2="640" y2="100"/>
    <!-- Cross Handle Grip -->
    <line x1="620" y1="85" x2="660" y2="115" stroke="#E11D48" stroke-width="12"/>
    <!-- Lower Chisel Tine Strut -->
    <line x1="330" y1="260" x2="350" y2="390"/>
    <!-- Trailing Press Wheel Arm -->
    <line x1="330" y1="260" x2="480" y2="360"/>
  </g>

  <!-- Front Furrow Opener Arrowhead Chisel Tine (5cm Depth) -->
  <polygon points="340,380 365,380 355,410" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Twin Plastic Hoppers (Yellow = Seeds, Blue = DAP Fertilizer) -->
  <g transform="translate(350, 140)">
    <!-- Seed Hopper (Yellow) -->
    <polygon points="0,0 45,0 35,65 10,65" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
    <text x="8" y="30" fill="#854D0E" font-size="9" font-family="sans-serif" font-weight="bold">SEED</text>

    <!-- Fertilizer Hopper (Blue) -->
    <polygon points="50,0 95,0 85,65 60,65" fill="#0284C7" stroke="#0369A1" stroke-width="2"/>
    <text x="60" y="30" fill="#FFFFFF" font-size="9" font-family="sans-serif" font-weight="bold">DAP</text>

    <!-- Fluted Metering Roller (Nylon / Delrin) -->
    <rect x="15" y="65" width="65" height="18" fill="#E2E8F0" stroke="#0F172A" stroke-width="2" rx="3"/>
  </g>

  <!-- Drop Chute Delivering Seed + Fertilizer into Furrow -->
  <line x1="375" y1="220" x2="360" y2="380" stroke="#0284C7" stroke-width="4" stroke-dasharray="4,4"/>

  <!-- Trailing Soil Press Roller (Firms soil over seed) -->
  <circle cx="480" cy="360" r="30" fill="#475569" stroke="#0F172A" stroke-width="5"/>

  <!-- Metered Seeds Dropped at Uniform 5cm Depth in Trench -->
  <circle cx="360" cy="390" r="5" fill="#FACC15"/>
  <circle cx="430" cy="390" r="5" fill="#FACC15"/>
  <circle cx="500" cy="390" r="5" fill="#FACC15"/>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Hand-Crank Push Seed Drill</text>
  <text x="245" y="48" fill="#FACC15" font-family="sans-serif" font-size="12" font-weight="bold">Uniform 5cm Depth</text>
</svg>"""

# 7. Pneumatic Biomass Straw Mulcher
straw_mulcher_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="mulchBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="heavySteel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#mulchBg)"/>
  <rect y="380" width="800" height="120" fill="#713F12"/>

  <!-- Paddy Stubble in Field (Before & After Mulch) -->
  <g stroke="#EAB308" stroke-width="4" stroke-linecap="round">
    <!-- Unmulched Standing Stubble on Left -->
    <line x1="80" y1="380" x2="80" y2="330"/>
    <line x1="95" y1="380" x2="95" y2="325"/>
    <line x1="120" y1="380" x2="120" y2="330"/>
    <line x1="145" y1="380" x2="145" y2="320"/>
    <line x1="180" y1="380" x2="180" y2="335"/>
  </g>

  <!-- 3mm Rolled Heavy Steel Semicircular Cowl Shroud -->
  <path d="M 240 370 A 120 120 0 0 1 480 370 L 490 380 L 230 380 Z" fill="url(#heavySteel)" stroke="#0F172A" stroke-width="5"/>

  <!-- High-Speed 35mm Solid Cold-Rolled Rotor Shaft -->
  <circle cx="360" cy="320" r="25" fill="#0F172A" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="360" cy="320" r="10" fill="#38BDF8"/>

  <!-- Hardened Truck Leaf-Spring Flail Chopper Blades -->
  <g stroke="#E2E8F0" stroke-width="7" stroke-linecap="round">
    <line x1="360" y1="320" x2="360" y2="220"/>
    <line x1="360" y1="320" x2="360" y2="420"/>
    <line x1="360" y1="320" x2="260" y2="320"/>
    <line x1="360" y1="320" x2="460" y2="320"/>
  </g>
  <!-- Reversible Flail Tips -->
  <rect x="350" y="210" width="20" height="15" fill="#DC2626" rx="2"/>
  <rect x="350" y="415" width="20" height="15" fill="#DC2626" rx="2"/>
  <rect x="250" y="310" width="15" height="20" fill="#DC2626" rx="2"/>
  <rect x="455" y="310" width="15" height="20" fill="#DC2626" rx="2"/>

  <!-- High-Speed Rotation Motion Blur -->
  <circle cx="360" cy="320" r="105" stroke="#F59E0B" stroke-width="2" stroke-dasharray="8,6" fill="none" opacity="0.6"/>

  <!-- Dual B-Section V-Groove Pulleys & Belt Drive -->
  <g transform="translate(500, 240)">
    <circle cx="40" cy="40" r="40" fill="#334155" stroke="#0F172A" stroke-width="4"/>
    <circle cx="40" cy="40" r="15" fill="#E2E8F0"/>
    <!-- V-Belts connected to PTO -->
    <path d="M 40 0 L 150 -50 L 150 130 L 40 80 Z" stroke="#0F172A" stroke-width="6" fill="none"/>
  </g>

  <!-- Curved Skid Runner Gliding Over Bunds -->
  <path d="M 220 375 L 490 375 Q 520 375 530 350" stroke="#0F172A" stroke-width="10" stroke-linecap="round" fill="none"/>

  <!-- Shredded Fine 2-Inch Compostable Mulch Ejected Behind -->
  <g fill="#CA8A04">
    <rect x="520" y="360" width="15" height="4" rx="2"/>
    <rect x="560" y="370" width="12" height="4" rx="2"/>
    <rect x="610" y="365" width="16" height="4" rx="2"/>
    <rect x="660" y="375" width="14" height="4" rx="2"/>
    <rect x="710" y="370" width="15" height="4" rx="2"/>
  </g>
  <text x="560" y="420" fill="#FEF08A" font-size="12" font-family="sans-serif" font-weight="bold">In-Situ Organic Mulch (No Burning)</text>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="310" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Biomass Rotary Straw Mulcher</text>
  <text x="250" y="48" fill="#FACC15" font-family="sans-serif" font-size="12" font-weight="bold">Stubble Burn Stop</text>
</svg>"""

# 8. Clay Pot Evaporative Cool Chamber
clay_pot_cooler_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="coolBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
    <linearGradient id="clayOuter" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C2410C"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <linearGradient id="clayInner" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9A3412"/>
      <stop offset="50%" stop-color="#C2410C"/>
      <stop offset="100%" stop-color="#7C2D12"/>
    </linearGradient>
    <linearGradient id="sandCavity" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#coolBg)"/>
  <rect y="400" width="800" height="100" fill="#94A3B8"/>

  <!-- Wooden Ring Base Stand -->
  <ellipse cx="400" cy="410" rx="140" ry="20" fill="#78350F" stroke="#451A03" stroke-width="4"/>

  <!-- Large Exterior Porous Terracotta Clay Pot (60cm Outer Shell) -->
  <g>
    <!-- Outer Pot Body -->
    <path d="M 250 170 Q 220 280 280 390 L 520 390 Q 580 280 550 170 Z" fill="url(#clayOuter)" stroke="#7C2D12" stroke-width="5"/>
    <ellipse cx="400" cy="170" rx="150" ry="25" fill="#EA580C" stroke="#7C2D12" stroke-width="4"/>
  </g>

  <!-- Wet Coarse River Sand Perimeter Cavity (10cm Gap) -->
  <path d="M 280 180 Q 260 270 310 380 L 490 380 Q 540 270 520 180 Z" fill="url(#sandCavity)" opacity="0.9"/>
  <!-- Water saturation dots in sand -->
  <g fill="#0284C7">
    <circle cx="290" cy="240" r="3"/>
    <circle cx="305" cy="300" r="3"/>
    <circle cx="495" cy="240" r="3"/>
    <circle cx="485" cy="310" r="3"/>
  </g>

  <!-- Smaller Inner Food Storage Pot (40cm Clay Pot) -->
  <path d="M 320 190 Q 305 270 340 370 L 460 370 Q 495 270 480 190 Z" fill="url(#clayInner)" stroke="#431407" stroke-width="4"/>
  <ellipse cx="400" cy="190" rx="80" ry="16" fill="#7C2D12"/>

  <!-- Fresh Produce Kept Crisp & Chilled Inside Inner Chamber -->
  <g transform="translate(370, 260)">
    <!-- Fresh Tomatoes -->
    <circle cx="15" cy="30" r="16" fill="#DC2626"/>
    <circle cx="45" cy="30" r="16" fill="#EF4444"/>
    <circle cx="30" cy="15" r="14" fill="#B91C1C"/>
    <!-- Fresh Green Chilies -->
    <path d="M 0 50 Q 20 60 40 45" stroke="#16A34A" stroke-width="5" fill="none"/>
    <path d="M 25 55 Q 45 65 65 50" stroke="#15803D" stroke-width="4" fill="none"/>
  </g>

  <!-- Damp Woven Jute Burlap Sack Covering Top -->
  <g transform="translate(240, 120)">
    <path d="M 10 40 Q 160 10 310 40 L 300 65 Q 160 45 20 65 Z" fill="#D97706" stroke="#92400E" stroke-width="3"/>
    <!-- Woven Jute Burlap texture lines -->
    <line x1="50" y1="35" x2="60" y2="60" stroke="#78350F" stroke-width="2"/>
    <line x1="100" y1="30" x2="110" y2="55" stroke="#78350F" stroke-width="2"/>
    <line x1="160" y1="28" x2="170" y2="53" stroke="#78350F" stroke-width="2"/>
    <line x1="220" y1="30" x2="230" y2="55" stroke="#78350F" stroke-width="2"/>
    <line x1="270" y1="35" x2="280" y2="60" stroke="#78350F" stroke-width="2"/>
  </g>

  <!-- Cooling Arrows / Evaporative Heat Dissipation -->
  <g stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M 200 240 Q 170 230 150 250"/>
    <path d="M 600 240 Q 630 230 650 250"/>
    <path d="M 210 320 Q 180 310 160 330"/>
    <path d="M 590 320 Q 620 310 640 330"/>
  </g>
  <text x="640" y="235" fill="#0284C7" font-size="11" font-family="sans-serif" font-weight="bold">12°C Cooler</text>
  <text x="640" y="250" fill="#0284C7" font-size="10" font-family="sans-serif">Evaporative Heat Loss</text>

  <!-- Title Badge Overlay -->
  <rect x="25" y="25" width="320" height="36" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="40" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Clay Pot Evaporative Refrigerator</text>
  <text x="260" y="48" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">0% Electricity</text>
</svg>"""

inventions = [
    ("solar-drip.svg", solar_drip_svg),
    ("bicycle-thresher.svg", bicycle_thresher_svg),
    ("seed-grader.svg", seed_grader_svg),
    ("briquette-press.svg", briquette_press_svg),
    ("solar-distiller.svg", solar_distiller_svg),
    ("seed-drill.svg", seed_drill_svg),
    ("straw-mulcher.svg", straw_mulcher_svg),
    ("clay-pot-cooler.svg", clay_pot_cooler_svg),
]

for filename, content in inventions:
    write_svg(os.path.join(INV_DIR, filename), content)


# ==============================================================================
# 2. BLUEPRINTS SVG ASSETS (Technical Engineering Schematics & CAD Dimensions)
# ==============================================================================

def generate_blueprint_svg(title, ref_code, dim1, dim2, spec1, spec2, spec3):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <!-- CAD Blueprint Background & Grid -->
  <rect width="800" height="500" fill="#0F172A"/>
  <defs>
    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" stroke-width="1"/>
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#334155" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#cadGrid)"/>

  <!-- Border & Corner Alignment Marks -->
  <rect x="20" y="20" width="760" height="460" fill="none" stroke="#0284C7" stroke-width="2"/>
  <rect x="25" y="25" width="750" height="450" fill="none" stroke="#0284C7" stroke-width="0.75" stroke-dasharray="8,4"/>

  <!-- Technical Schematic Lines in Cyan & White -->
  <g stroke="#38BDF8" stroke-width="2" fill="none">
    <!-- Center Isometric Chassis Outline -->
    <polygon points="220,160 580,160 520,340 160,340" stroke-width="2.5"/>
    <line x1="220" y1="160" x2="220" y2="280"/>
    <line x1="580" y1="160" x2="580" y2="280"/>
    <line x1="160" y1="340" x2="220" y2="280"/>
    <line x1="520" y1="340" x2="580" y2="280"/>

    <!-- Core Mechanism Circle / Rotor / Jack Assembly -->
    <circle cx="370" cy="250" r="65" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="370" cy="250" r="25" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4,2"/>
    <line x1="290" y1="250" x2="450" y2="250" stroke="#F59E0B" stroke-dasharray="4,2"/>
    <line x1="370" y1="170" x2="370" y2="330" stroke="#F59E0B" stroke-dasharray="4,2"/>
  </g>

  <!-- Dimension Annotation Lines & Arrows -->
  <g stroke="#F59E0B" stroke-width="1.5" fill="#F59E0B">
    <!-- Top Horizontal Dimension -->
    <line x1="220" y1="130" x2="580" y2="130"/>
    <polygon points="220,130 230,126 230,134"/>
    <polygon points="580,130 570,126 570,134"/>
    <text x="370" y="122" fill="#F59E0B" font-size="12" font-family="monospace" text-anchor="middle" font-weight="bold">{dim1}</text>

    <!-- Side Vertical Dimension -->
    <line x1="620" y1="160" x2="620" y2="340"/>
    <polygon points="620,160 616,170 624,170"/>
    <polygon points="620,340 616,330 624,330"/>
    <text x="635" y="255" fill="#F59E0B" font-size="12" font-family="monospace" font-weight="bold">{dim2}</text>
  </g>

  <!-- Engineering Title Block (Bottom Right) -->
  <g transform="translate(460, 370)">
    <rect x="0" y="0" width="310" height="100" fill="#0F172A" stroke="#0284C7" stroke-width="2"/>
    <line x1="0" y1="30" x2="310" y2="30" stroke="#0284C7" stroke-width="1"/>
    <line x1="0" y1="65" x2="310" y2="65" stroke="#0284C7" stroke-width="1"/>
    <text x="10" y="20" fill="#38BDF8" font-size="12" font-family="sans-serif" font-weight="bold">{title}</text>
    <text x="10" y="48" fill="#94A3B8" font-size="10" font-family="monospace">DWG NO: RIH-{ref_code} | SCALE: 1:10</text>
    <text x="10" y="85" fill="#22C55E" font-size="10" font-family="sans-serif">VERIFIED GRASSROOTS OPEN HARDWARE</text>
  </g>

  <!-- Engineering Specifications Callouts (Top Left) -->
  <g transform="translate(40, 50)" fill="#E2E8F0" font-family="monospace" font-size="11">
    <text x="0" y="0" fill="#38BDF8" font-weight="bold">// FABRICATION SPECIFICATIONS & TOLERANCES</text>
    <text x="0" y="22">• {spec1}</text>
    <text x="0" y="40">• {spec2}</text>
    <text x="0" y="58">• {spec3}</text>
  </g>
</svg>"""

blueprints = [
    ("solar-drip-blueprint.svg", generate_blueprint_svg(
        "Solar Drip Irrigation Layout", "DRIP-001", "1200mm Elevation", "16mm Lateral",
        "1.2m Tripod Elevation Head Pressure >= 0.12 bar",
        "120-Mesh Silt & Sand Disc Filtration Unit",
        "Pressure Compensating Emitters Spaced at 30cm Pitch"
    )),
    ("bicycle-thresher-blueprint.svg", generate_blueprint_svg(
        "Bicycle Multi-Crop Thresher CAD", "THRS-002", "850mm Base", "400 RPM",
        "1:5 Step-Up Jackshaft Pulley Gear Ratio",
        "18-Gauge Curved GI Safety Sheet Shroud Housing",
        "U-Shaped Galvanized Wire Loops at 2-Inch Intervals"
    )),
    ("seed-grader-blueprint.svg", generate_blueprint_svg(
        "Vibratory Seed Grader CAD", "GRAD-003", "1100mm Length", "7° Incline",
        "Tri-Tier Interchangeable Screens: 4mm / 2.5mm / 1.2mm",
        "Harmonic Vibration Dampening: 4x Motorcycle Valve Springs",
        "Off-Center 25W Brass Eccentric Counterweight Drive"
    )),
    ("briquette-press-blueprint.svg", generate_blueprint_svg(
        "Hydraulic Briquette Press CAD", "BRIQ-004", "75x40mm ISMC", "5-Ton Load",
        "Structural Channel Iron Tested to 10 Tons Compression",
        "4-Inch Seamless Steel Pipe with Drainage Perforations",
        "Foot Pedal Ejection Lever Mechanism with Return Springs"
    )),
    ("solar-distiller-blueprint.svg", generate_blueprint_svg(
        "Parabolic Concentrator Distiller CAD", "DIST-005", "1800mm Trough", "y=x²/4f",
        "Polished Mirror-Finish SS 430 Curvature Alignment",
        "1-Inch Central Blackened Copper Absorber Boiler Pipe",
        "Continuous Submerged Copper Cooling Condenser Coil"
    )),
    ("seed-drill-blueprint.svg", generate_blueprint_svg(
        "Hand-Crank Push Seed Drill CAD", "SEDR-006", "16-Inch Wheel", "5cm Depth",
        "Twin Corrosion-Resistant Poly Hoppers (Seed & DAP)",
        "Fluted Delrin / Nylon Metering Roller with Slide Gates",
        "Arrowhead Furrow Chisel Tine + Soil Packing Roller"
    )),
    ("straw-mulcher-blueprint.svg", generate_blueprint_svg(
        "Biomass Straw Mulcher CAD", "MULC-007", "35mm Rotor Shaft", "1800 RPM",
        "Reversible Tractor Leaf-Spring Flail Chopper Blades",
        "3mm Heavy Rolled Steel Protective Safety Cowl Shroud",
        "Curved Pipe Skid Runners for Paddy Bund Gliding"
    )),
    ("clay-pot-cooler-blueprint.svg", generate_blueprint_svg(
        "Clay Pot Cool Chamber CAD", "COOL-008", "Ø60cm Exterior", "ΔT = -12°C",
        "Double-Walled Unglazed Terracotta Porous Pots",
        "10cm Wet Coarse River Sand Perimeter Evaporative Cavity",
        "Moist Triple-Layer Jute Burlap Continuous Evaporative Cover"
    )),
]

for filename, content in blueprints:
    write_svg(os.path.join(BP_DIR, filename), content)


# ==============================================================================
# 3. AUTHENTIC INVENTOR & OFFICIAL PORTRAITS
# ==============================================================================

def generate_avatar_svg(name, role, bg_color, shirt_color, turban_color=None, glasses=False, bindi=False):
    turban_element = f'<path d="M 35 48 C 30 20, 110 20, 105 48 C 115 35, 105 15, 70 15 C 35 15, 25 35, 35 48 Z" fill="{turban_color}"/>' if turban_color else ''
    bindi_element = '<circle cx="70" cy="58" r="2.5" fill="#DC2626"/>' if bindi else ''
    glasses_element = """
    <rect x="52" y="55" width="15" height="12" rx="3" stroke="#0F172A" stroke-width="2" fill="none"/>
    <rect x="73" y="55" width="15" height="12" rx="3" stroke="#0F172A" stroke-width="2" fill="none"/>
    <line x1="67" y1="61" x2="73" y2="61" stroke="#0F172A" stroke-width="2"/>
    """ if glasses else ''

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100%" height="100%">
  <!-- Background Circle -->
  <circle cx="70" cy="70" r="68" fill="{bg_color}"/>

  <!-- Shoulders & Clothing -->
  <path d="M 20 135 C 20 95, 120 95, 120 135 Z" fill="{shirt_color}"/>

  <!-- Neck -->
  <rect x="60" y="75" width="20" height="20" fill="#D97706" rx="4"/>

  <!-- Face -->
  <ellipse cx="70" cy="65" rx="26" ry="30" fill="#F59E0B"/>

  <!-- Hair / Headgear -->
  {turban_element}
  {bindi_element}

  <!-- Eyes & Eyebrows -->
  <circle cx="59" cy="62" r="3" fill="#0F172A"/>
  <circle cx="81" cy="62" r="3" fill="#0F172A"/>
  <path d="M 54 56 Q 59 53 64 56" stroke="#0F172A" stroke-width="2" fill="none"/>
  <path d="M 76 56 Q 81 53 86 56" stroke="#0F172A" stroke-width="2" fill="none"/>

  <!-- Glasses if applicable -->
  {glasses_element}

  <!-- Friendly Smile & Mustache -->
  <path d="M 60 76 Q 70 84 80 76" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Border Ring -->
  <circle cx="70" cy="70" r="68" fill="none" stroke="#FFFFFF" stroke-width="4"/>
</svg>"""

portraits = [
    ("ramesh-patel.svg", generate_avatar_svg("Ramesh Patel", "INNOVATOR", "#CCFBF1", "#0D9488", turban_color="#EA580C")),
    ("kavita-devi.svg", generate_avatar_svg("Kavita Devi", "INNOVATOR", "#FCE7F3", "#DB2777", bindi=True)),
    ("suresh-kannan.svg", generate_avatar_svg("Suresh Kannan", "INNOVATOR", "#FEF3C7", "#D97706", turban_color="#B45309")),
    ("ananya-sengupta.svg", generate_avatar_svg("Ananya Sengupta", "INVESTOR", "#E0F2FE", "#0284C7", glasses=True)),
    ("rajesh-sharma.svg", generate_avatar_svg("Prof. Rajesh Sharma", "MENTOR", "#EDE9FE", "#6D28D9", glasses=True)),
    ("meera-nambiar.svg", generate_avatar_svg("Meera Nambiar", "ADMIN", "#FEE2E2", "#DC2626", bindi=True)),
    ("vikram-deshmukh.svg", generate_avatar_svg("Vikram Deshmukh (NABARD)", "INVESTOR", "#DCFCE7", "#15803D", glasses=True)),
    ("anita-roy.svg", generate_avatar_svg("Dr. Anita Roy", "INVESTOR", "#FEF9C3", "#CA8A04", glasses=True)),
]

for filename, content in portraits:
    write_svg(os.path.join(USER_DIR, filename), content)

print("All local SVG assets generated successfully!")
