import heroHimalayanCloudline from '../assets/images/hero_himalayan_cloudline_1795151664011.jpg';
import stayMistPineChalet from '../assets/images/stay_mist_pine_chalet_1795151664568.jpg';
import stayCedarGlasshouse from '../assets/images/stay_cedar_glasshouse_1795151664009.jpg';
import stayAlpineForestVilla from '../assets/images/stay_alpine_forest_villa_1795151663879.jpg';
import stayZenithStoneCottage from '../assets/images/stay_zenith_stone_cottage_1795151663926.jpg';
import stayHighlandMeadow from '../assets/images/stay_highland_meadow_1795151663945.jpg';
import staySolitudeCliffCabin from '../assets/images/stay_solitude_cliff_cabin_1795151664228.jpg';

export interface GuestReview {
  id: string;
  guestName: string;
  guestInitials: string;
  guestRole: string;
  guestCity: string;
  stayDate: string;
  nightsStayed: number;
  rating: number;
  highlight: string;
  quote: string;
  verifiedStay: boolean;
}

export interface RatingBreakdown {
  views: number;
  cleanliness: number;
  comfort: number;
  hospitality: number;
}

export interface Stay {
  id: string;
  name: string;
  location: string;
  region: string;
  elevation: string;
  pricePerNight: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tags: string[];
  capacity: string;
  maxGuests: number;
  beds: string;
  description: string;
  amenities: string[];
  featured?: boolean;
  ratingBreakdown: RatingBreakdown;
  reviews: GuestReview[];
}

export const HERO_BACKDROP_IMAGE = heroHimalayanCloudline;

export const FEATURED_STAYS: Stay[] = [
  {
    id: '1',
    name: 'The Mist & Pine Timber Chalet',
    location: 'Manali, Himachal Pradesh',
    region: 'North Ridge',
    elevation: '2,050m',
    pricePerNight: 8500,
    rating: 4.96,
    reviewsCount: 142,
    image: stayMistPineChalet,
    tags: ['Panoramic View', 'Fireplace', 'Heated Floors'],
    capacity: '4 Guests',
    maxGuests: 4,
    beds: '2 King Beds',
    featured: true,
    description:
      'Constructed from salvaged deodar beams and hand-dressed Himachal slate, this twin-level ridge chalet frames uninterrupted views of drifting valley fog through double-height glazing.',
    amenities: [
      'Hydronic underfloor heating',
      'Cast-iron wood fireplace',
      'Starlink fiber workspace',
      'Private chef breakfast service',
    ],
    ratingBreakdown: {
      views: 5.0,
      cleanliness: 4.95,
      comfort: 4.96,
      hospitality: 4.98,
    },
    reviews: [
      {
        id: 'r1-1',
        guestName: 'Ananya Deshmukh',
        guestInitials: 'AD',
        guestRole: 'Principal Architect',
        guestCity: 'Bengaluru',
        stayDate: 'October 2026',
        nightsStayed: 4,
        rating: 5.0,
        highlight: 'Heated slate floors & dawn valley mist',
        quote:
          'We arrived exhausted after a 10-hour drive up the Beas valley, expecting typical chilly hill-station rooms. Instead, the radiant slate floors were already warm, cedar logs crackled in the hearth, and watching cloudbanks part at 6:15 AM from the upper timber gallery felt completely restorative.',
        verifiedStay: true,
      },
      {
        id: 'r1-2',
        guestName: 'Siddharth & Naina Kapoor',
        guestInitials: 'SK',
        guestRole: 'Product Lead & Ceramicist',
        guestCity: 'New Delhi',
        stayDate: 'September 2026',
        nightsStayed: 5,
        rating: 4.9,
        highlight: 'Zero-dropout Starlink & private deck dinners',
        quote:
          'I needed three uninterrupted days of engineering reviews before taking two days off, and every remote-work stay I tried previously dropped calls during rain. Here, Starlink held steady through an evening squall while the caretaker served warm siddu and ginger broth on the deck.',
        verifiedStay: true,
      },
      {
        id: 'r1-3',
        guestName: 'Vikramaditya Rao',
        guestInitials: 'VR',
        guestRole: 'Documentary Cinematographer',
        guestCity: 'Mumbai',
        stayDate: 'August 2026',
        nightsStayed: 3,
        rating: 5.0,
        highlight: 'Double-height glazing & ridge acoustic silence',
        quote:
          'Most mountain cabins trade privacy for highway proximity. Perched on North Ridge, the only sound at night is wind moving through old-growth pine. The floor-to-ceiling timber frames turn every morning coffee into an hour-long sky study.',
        verifiedStay: true,
      },
      {
        id: 'r1-4',
        guestName: 'Dr. Kavita Subramanian',
        guestInitials: 'KS',
        guestRole: 'Neurologist',
        guestCity: 'Chennai',
        stayDate: 'July 2026',
        nightsStayed: 6,
        rating: 5.0,
        highlight: 'Effortless altitude acclimation & bedding',
        quote:
          'Traveling with my parents meant thermal comfort and easy stone-path access mattered most. The host arranged gentle acclimatization tea on arrival, orthopedic wool mattresses, and heated bathrooms that made 4°C nights feel effortless.',
        verifiedStay: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Cedar Glasshouse & Cloud Deck',
    location: 'Shimla Heights, Himachal Pradesh',
    region: 'Pine Sanctuary',
    elevation: '2,200m',
    pricePerNight: 12200,
    rating: 4.98,
    reviewsCount: 89,
    image: stayCedarGlasshouse,
    tags: ['Glass Sunroom', 'Hot Tub', 'Stargazing'],
    capacity: '6 Guests',
    maxGuests: 6,
    beds: '3 Suites',
    featured: true,
    description:
      'A cantilevered cedar and low-iron glass pavilion suspended above dense Himalayan deodar canopy, featuring a heated outdoor cedar soak and wrap-around starlit deck.',
    amenities: [
      'Cantilevered cedar cloud deck',
      'Outdoor heated cedar soak',
      'Automated blackout skylights',
      'Curated Himachali wine cellar',
    ],
    ratingBreakdown: {
      views: 5.0,
      cleanliness: 4.99,
      comfort: 4.97,
      hospitality: 4.96,
    },
    reviews: [
      {
        id: 'r2-1',
        guestName: 'Meera & Kabir Sethi',
        guestInitials: 'MS',
        guestRole: 'Founding Partners, Atelier K',
        guestCity: 'Mumbai',
        stayDate: 'October 2026',
        nightsStayed: 3,
        rating: 5.0,
        highlight: 'Cantilevered deck soak under Orion',
        quote:
          'We booked this for our tenth anniversary hoping for quiet views above Shimla traffic. Stepping onto the cantilevered deck at twilight with the cedar tub steaming at 39°C while valley lights flickered below felt genuinely cinematic.',
        verifiedStay: true,
      },
      {
        id: 'r2-2',
        guestName: 'Rohan Kulkarni',
        guestInitials: 'RK',
        guestRole: 'Astrophotographer',
        guestCity: 'Pune',
        stayDate: 'September 2026',
        nightsStayed: 4,
        rating: 5.0,
        highlight: 'Low-glare outdoor lighting & Bortle-3 skies',
        quote:
          'Glass cabins often ruin night viewing with harsh interior reflections. CloudCrest thoughtfully installed shielded warm floor-level lights and blackout shades, letting us track the Milky Way core straight from the glass sunroom.',
        verifiedStay: true,
      },
      {
        id: 'r2-3',
        guestName: 'Tara & Devansh Malhotra',
        guestInitials: 'TM',
        guestRole: 'Venture Investor & Author',
        guestCity: 'Gurugram',
        stayDate: 'August 2026',
        nightsStayed: 5,
        rating: 4.9,
        highlight: 'Acoustic triple-glazing & artisan breakfast',
        quote:
          'Even with six of us sharing the three suites, the acoustic separation between wings kept mornings serene. Freshly baked sourdough, local apricot preserves, and French-press Kangra coffee arrived right at 8:00 AM every day.',
        verifiedStay: true,
      },
      {
        id: 'r2-4',
        guestName: 'Elena Vance',
        guestInitials: 'EV',
        guestRole: 'Hospitality Design Consultant',
        guestCity: 'London',
        stayDate: 'June 2026',
        nightsStayed: 3,
        rating: 5.0,
        highlight: 'Joinery details & effortless mountain warmth',
        quote:
          'As someone who audits boutique hotels globally, the craftsmanship here stands apart—flush steel mullions, zero draft around the glass corners, and attentive local staff who anticipate needs without hovering.',
        verifiedStay: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Alpine Whispers Forest Villa',
    location: 'Kullu Valley, Western Himalayas',
    region: 'Valley Rim',
    elevation: '1,890m',
    pricePerNight: 6900,
    rating: 4.91,
    reviewsCount: 204,
    image: stayAlpineForestVilla,
    tags: ['Private Stream', 'BBQ Pit', 'Pet Friendly'],
    capacity: '5 Guests',
    maxGuests: 5,
    beds: '2 Queen Beds',
    description:
      'Set beside a glacial-fed mountain stream ringed by towering deodars, this heritage stone-and-timber villa pairs riverside fire-pit evenings with direct trailhead access.',
    amenities: [
      'Private glacial stream frontage',
      'Stone terrace fire-pit & grill',
      'Fenced orchard for pets',
      'Guided cedar-forest trail maps',
    ],
    ratingBreakdown: {
      views: 4.92,
      cleanliness: 4.89,
      comfort: 4.91,
      hospitality: 4.94,
    },
    reviews: [
      {
        id: 'r3-1',
        guestName: 'Arjun & Rhea Bhatia',
        guestInitials: 'AB',
        guestRole: 'Veterinarian & UX Researcher',
        guestCity: 'Chandigarh',
        stayDate: 'October 2026',
        nightsStayed: 4,
        rating: 5.0,
        highlight: 'Stream-side mornings with our golden retriever',
        quote:
          'Finding genuinely pet-welcoming stays without cramped rooms is tough. Our dog spent four blissful mornings splashing in the shallow glacial stream edge while we grilled trout over pine embers on the stone terrace.',
        verifiedStay: true,
      },
      {
        id: 'r3-2',
        guestName: 'Nikhil Oberoi',
        guestInitials: 'NO',
        guestRole: 'Sound Designer',
        guestCity: 'Mumbai',
        stayDate: 'September 2026',
        nightsStayed: 7,
        rating: 4.9,
        highlight: 'Continuous white noise of the river & forest',
        quote:
          'I came to escape city sirens and finish an album mix. Sleeping with the bedroom casement cracked an inch to the sound of rushing mountain water gave me the deepest seven nights of rest I have had in three years.',
        verifiedStay: true,
      },
      {
        id: 'r3-3',
        guestName: 'Shruti & Aditya Nair',
        guestInitials: 'SN',
        guestRole: 'Industrial Designers',
        guestCity: 'Kochi',
        stayDate: 'July 2026',
        nightsStayed: 3,
        rating: 4.8,
        highlight: 'Riverside bonfire & orchard apples',
        quote:
          'The stone path down to the water is lined with wild ferns and mint. Caretaker Mohan lit the terrace hearth every evening at dusk and packed warm parathas for our morning hike up to the waterfall.',
        verifiedStay: true,
      },
    ],
  },
  {
    id: '4',
    name: 'Zenith Peak Stone Cottage',
    location: 'Mukteshwar, Uttarakhand',
    region: 'Kumaon Hills',
    elevation: '2,170m',
    pricePerNight: 9400,
    rating: 4.95,
    reviewsCount: 118,
    image: stayZenithStoneCottage,
    tags: ['Snow Peak Views', 'Wood Sauna', 'Chef on Call'],
    capacity: '8 Guests',
    maxGuests: 8,
    beds: '4 Bedrooms',
    description:
      'A dry-stone Kumaoni residence commanding a 180-degree amphitheater of Trishul and Nanda Devi peaks, complete with a cedar-lined sauna and private orchard kitchen.',
    amenities: [
      '180° Nanda Devi ridge view',
      'Private Finnish cedar sauna',
      'Full-time Kumaoni home chef',
      'Terraced botanical rose garden',
    ],
    ratingBreakdown: {
      views: 5.0,
      cleanliness: 4.94,
      comfort: 4.93,
      hospitality: 4.97,
    },
    reviews: [
      {
        id: 'r4-1',
        guestName: 'Pranav & Ira Joshi',
        guestInitials: 'PJ',
        guestRole: 'Restaurateurs',
        guestCity: 'New Delhi',
        stayDate: 'October 2026',
        nightsStayed: 4,
        rating: 5.0,
        highlight: 'Alpenglow on Trishul & Bhatt ki Churkani',
        quote:
          'Normally family reunions for eight turn into logistical chaos around meals. Here, Chef Harish prepared slow-cooked Kumaoni lentils and roasted root vegetables each evening while we watched alpenglow paint the snowline rose-gold from the carved timber balcony.',
        verifiedStay: true,
      },
      {
        id: 'r4-2',
        guestName: 'Dr. Sanjay Verma',
        guestInitials: 'SV',
        guestRole: 'Cardiac Surgeon',
        guestCity: 'Lucknow',
        stayDate: 'September 2026',
        nightsStayed: 3,
        rating: 5.0,
        highlight: 'Post-hike Finnish cedar sauna',
        quote:
          'After an afternoon climb along the Chauli Ki Jali ridge, stepping into a hot cedar sauna looking straight out toward distant glaciers was pure magic. Everything inside the dry-stone walls feels authentic and deeply grounding.',
        verifiedStay: true,
      },
      {
        id: 'r4-3',
        guestName: 'Maya Sengupta',
        guestInitials: 'MS',
        guestRole: 'Editorial Illustrator',
        guestCity: 'Kolkata',
        stayDate: 'August 2026',
        nightsStayed: 5,
        rating: 4.9,
        highlight: 'Morning light across the slate terrace',
        quote:
          'I filled an entire watercolor sketchbook from the upper veranda before 9 AM each day. Even during monsoon clouds, the mist clearing across the terraced gardens revealed sharper ridge views than any hotel in town.',
        verifiedStay: true,
      },
    ],
  },
  {
    id: '5',
    name: 'Highland Meadow Sanctuary',
    location: 'Dharamshala, Himachal Pradesh',
    region: 'Dhauladhar Base',
    elevation: '1,750m',
    pricePerNight: 7200,
    rating: 4.88,
    reviewsCount: 76,
    image: stayHighlandMeadow,
    tags: ['Meditation Garden', 'Organic Orchard', 'High-Speed Fiber'],
    capacity: '3 Guests',
    maxGuests: 3,
    beds: '1 King + 1 Sofa',
    description:
      'A serene cedar-and-glass solo or duo studio set inside an unspoiled alpine wildflower meadow facing the sheer granite wall of the Dhauladhar range.',
    amenities: [
      'Private wildflower meadow deck',
      'Meditation & breathwork pavilion',
      'Dedicated fiber work alcove',
      'Seasonal plum & peach orchard',
    ],
    ratingBreakdown: {
      views: 4.95,
      cleanliness: 4.88,
      comfort: 4.86,
      hospitality: 4.89,
    },
    reviews: [
      {
        id: 'r5-1',
        guestName: 'Ishaan Chatterjee',
        guestInitials: 'IC',
        guestRole: 'Staff Systems Engineer',
        guestCity: 'Hyderabad',
        stayDate: 'October 2026',
        nightsStayed: 6,
        rating: 5.0,
        highlight: 'Writing deep technical specs facing snow peaks',
        quote:
          'I booked a solo sabbatical week to clear a major architecture backlog. Replacing fluorescent office glare with sliding glass doors opening onto wildflowers and the Dhauladhar wall doubled my focus—I finished in four days and hiked the last two.',
        verifiedStay: true,
      },
      {
        id: 'r5-2',
        guestName: 'Zoya Merchant',
        guestInitials: 'ZM',
        guestRole: 'Yoga & Breathwork Instructor',
        guestCity: 'Mumbai',
        stayDate: 'September 2026',
        nightsStayed: 4,
        rating: 4.9,
        highlight: 'Morning stillness on the timber bench',
        quote:
          'Most retreats feel curated for Instagram rather than actual quiet. Here, the meadow grass moves in waves, tea arrives silently in stoneware cups, and the sheer scale of the mountains strips away mental noise.',
        verifiedStay: true,
      },
      {
        id: 'r5-3',
        guestName: 'Karan & Divya Gill',
        guestInitials: 'KG',
        guestRole: 'Documentary Editors',
        guestCity: 'Chandigarh',
        stayDate: 'July 2026',
        nightsStayed: 3,
        rating: 4.8,
        highlight: 'Monsoon mist rolling across wild poppies',
        quote:
          'Even in misty overcast weather, the warmth of the timber stove inside and bright wildflower meadow outside gave the cabin an unforgettable Nordic-meets-Himalayan calm.',
        verifiedStay: true,
      },
    ],
  },
  {
    id: '6',
    name: 'Solitude Ridge Cliff Cabin',
    location: 'Mussoorie, Uttarakhand',
    region: 'Cloud End',
    elevation: '2,005m',
    pricePerNight: 11000,
    rating: 4.97,
    reviewsCount: 165,
    image: staySolitudeCliffCabin,
    tags: ['Infinity Balcony', 'Fire Pit', 'Telescope Included'],
    capacity: '4 Guests',
    maxGuests: 4,
    beds: '2 King Beds',
    description:
      'Perched above the Cloud End escarpment where valley clouds settle below the cliff edge, offering a glass-balustrade infinity terrace, sunken stone fire pit, and 8-inch reflector telescope.',
    amenities: [
      'Infinity cliff-edge terrace',
      'Sunken stone fire pit',
      '8-inch Newtonian telescope',
      'Private sunset espresso bar',
    ],
    ratingBreakdown: {
      views: 5.0,
      cleanliness: 4.96,
      comfort: 4.97,
      hospitality: 4.96,
    },
    reviews: [
      {
        id: 'r6-1',
        guestName: 'Aarav & Natasha Khanna',
        guestInitials: 'AK',
        guestRole: 'Creative Director & Sommelier',
        guestCity: 'New Delhi',
        stayDate: 'October 2026',
        nightsStayed: 3,
        rating: 5.0,
        highlight: 'Sea of clouds below the infinity deck',
        quote:
          'We usually avoid Mussoorie on weekends because of Mall Road congestion. Taking the forest lane out to Cloud End changed everything—we sat wrapped in wool throws beside the stone fire pit watching a literal ocean of clouds drift beneath our feet.',
        verifiedStay: true,
      },
      {
        id: 'r6-2',
        guestName: 'Dr. Farhan Qureshi',
        guestInitials: 'FQ',
        guestRole: 'Planetary Scientist',
        guestCity: 'Ahmedabad',
        stayDate: 'September 2026',
        nightsStayed: 4,
        rating: 5.0,
        highlight: 'Collimated 8-inch telescope & clear zenith',
        quote:
          'Usually property telescopes are decorative toys. The Newtonian reflector here was properly collimated with crisp eyepieces—we resolved Saturn’s rings and Jupiter’s Galilean moons right from the cliff railing after midnight.',
        verifiedStay: true,
      },
      {
        id: 'r6-3',
        guestName: 'Priyanka & Neil Varma',
        guestInitials: 'PV',
        guestRole: 'Brand Strategists',
        guestCity: 'Bengaluru',
        stayDate: 'August 2026',
        nightsStayed: 3,
        rating: 4.9,
        highlight: 'Twilight lantern glow & effortless service',
        quote:
          'From the heated bathroom towel rails to the fresh pahadi honey served with warm crepes, every touchpoint felt deliberate. Zero crowds, total privacy, and views we are still thinking about weeks later.',
        verifiedStay: true,
      },
      {
        id: 'r6-4',
        guestName: 'Suhani Mathur',
        guestInitials: 'SM',
        guestRole: 'Fashion Stylist',
        guestCity: 'Jaipur',
        stayDate: 'June 2026',
        nightsStayed: 2,
        rating: 5.0,
        highlight: 'Sunrise espresso above the winterline',
        quote:
          'Waking up to pale gold light skimming across the cloud sea made 5:45 AM feel like the easiest alarm I have ever answered. Worth every rupee for a weekend reset.',
        verifiedStay: true,
      },
    ],
  },
];
