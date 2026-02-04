// js/destinations.js - Extended Destinations List

const destinations = [
    // INDIA
    {
        id: 1,
        name: "Taj Mahal",
        country: "India",
        city: "Agra",
        lat: 27.1751,
        lng: 78.0421,
        description: "An ivory-white marble mausoleum, one of the Seven Wonders of the World. Built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop",
        category: "Monument",
        zoom: 19
    },
    {
        id: 2,
        name: "India Gate",
        country: "India",
        city: "New Delhi",
        lat: 28.6129,
        lng: 77.2295,
        description: "War memorial located on Rajpath, honoring soldiers who died in World War I.",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
        category: "Monument",
        zoom: 18
    },
    {
        id: 3,
        name: "Gateway of India",
        country: "India",
        city: "Mumbai",
        lat: 18.9220,
        lng: 72.8347,
        description: "Iconic arch monument built during the 20th century in Mumbai.",
        image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800",
        category: "Monument",
        zoom: 19
    },
    {
        id: 4,
        name: "Golden Temple",
        country: "India",
        city: "Amritsar",
        lat: 31.6200,
        lng: 74.8765,
        description: "Holiest Gurdwara of Sikhism, covered in gold and surrounded by holy water.",
        image: "https://images.unsplash.com/photo-1598625073745-4d9e113620ff?w=800",
        category: "Religious",
        zoom: 19
    },
    
    // FRANCE
    {
        id: 5,
        name: "Eiffel Tower",
        country: "France",
        city: "Paris",
        lat: 48.8584,
        lng: 2.2945,
        description: "Wrought-iron lattice tower, global cultural icon of France. Built by Gustave Eiffel in 1889.",
        image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=400&fit=crop",
        category: "Monument",
        zoom: 19
    },
    {
        id: 6,
        name: "Louvre Museum",
        country: "France",
        city: "Paris",
        lat: 48.8606,
        lng: 2.3376,
        description: "World's largest art museum and historic monument, home to the Mona Lisa.",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
        category: "Museum",
        zoom: 19
    },
    
    // USA
    {
        id: 7,
        name: "Statue of Liberty",
        country: "USA",
        city: "New York",
        lat: 40.6892,
        lng: -74.0445,
        description: "Colossal neoclassical sculpture on Liberty Island, a gift from France.",
        image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=400&fit=crop",
        category: "Monument",
        zoom: 18
    },
    {
        id: 8,
        name: "Times Square",
        country: "USA",
        city: "New York",
        lat: 40.7580,
        lng: -73.9855,
        description: "Major commercial and entertainment hub in Midtown Manhattan.",
        image: "https://images.unsplash.com/photo-1560721434-6c9b39927aab?w=800",
        category: "Urban",
        zoom: 19
    },
    {
        id: 9,
        name: "Golden Gate Bridge",
        country: "USA",
        city: "San Francisco",
        lat: 37.8199,
        lng: -122.4783,
        description: "Iconic suspension bridge connecting San Francisco to Marin County.",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
        category: "Bridge",
        zoom: 17
    },
    
    // UAE
    {
        id: 10,
        name: "Burj Khalifa",
        country: "UAE",
        city: "Dubai",
        lat: 25.1972,
        lng: 55.2744,
        description: "World's tallest building at 828 meters, architectural marvel in Dubai.",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
        category: "Modern",
        zoom: 19
    },
    {
        id: 11,
        name: "Burj Al Arab",
        country: "UAE",
        city: "Dubai",
        lat: 25.1413,
        lng: 55.1853,
        description: "Luxury hotel on an artificial island, designed to resemble a ship's sail.",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800",
        category: "Modern",
        zoom: 19
    },
    
    // ITALY
    {
        id: 12,
        name: "Colosseum",
        country: "Italy",
        city: "Rome",
        lat: 41.8902,
        lng: 12.4922,
        description: "Ancient amphitheater, largest ever built, iconic symbol of Imperial Rome.",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=400&fit=crop",
        category: "Historical",
        zoom: 19
    },
    {
        id: 13,
        name: "Leaning Tower of Pisa",
        country: "Italy",
        city: "Pisa",
        lat: 43.7230,
        lng: 10.3966,
        description: "Freestanding bell tower famous for its unintended tilt.",
        image: "https://images.unsplash.com/photo-1583762186658-c5d6c3210d40?w=800",
        category: "Historical",
        zoom: 19
    },
    
    // CHINA
    {
        id: 14,
        name: "Great Wall of China",
        country: "China",
        city: "Beijing",
        lat: 40.4319,
        lng: 116.5704,
        description: "Ancient fortification stretching over 13,000 miles across northern China.",
        image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=400&fit=crop",
        category: "Historical",
        zoom: 17
    },
    {
        id: 15,
        name: "Forbidden City",
        country: "China",
        city: "Beijing",
        lat: 39.9163,
        lng: 116.3972,
        description: "Imperial palace complex, home to Chinese emperors for 500 years.",
        image: "https://images.unsplash.com/photo-1529655683879-75e02234b629?w=800",
        category: "Historical",
        zoom: 18
    },
    
    // EGYPT
    {
        id: 16,
        name: "Pyramids of Giza",
        country: "Egypt",
        city: "Cairo",
        lat: 29.9792,
        lng: 31.1342,
        description: "Ancient pyramids, last remaining wonder of the ancient world.",
        image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=400&fit=crop",
        category: "Historical",
        zoom: 17
    },
    {
        id: 17,
        name: "Sphinx",
        country: "Egypt",
        city: "Giza",
        lat: 29.9753,
        lng: 31.1376,
        description: "Limestone statue with lion's body and human head, guarding the pyramids.",
        image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
        category: "Historical",
        zoom: 18
    },
    
    // AUSTRALIA
    {
        id: 18,
        name: "Sydney Opera House",
        country: "Australia",
        city: "Sydney",
        lat: -33.8568,
        lng: 151.2153,
        description: "Multi-venue performing arts center with distinctive sail-like design.",
        image: "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800&h=400&fit=crop",
        category: "Modern",
        zoom: 19
    },
    {
        id: 19,
        name: "Sydney Harbour Bridge",
        country: "Australia",
        city: "Sydney",
        lat: -33.8523,
        lng: 151.2108,
        description: "Steel arch bridge, iconic landmark of Sydney Harbour.",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
        category: "Bridge",
        zoom: 18
    },
    
    // BRAZIL
    {
        id: 20,
        name: "Christ the Redeemer",
        country: "Brazil",
        city: "Rio de Janeiro",
        lat: -22.9519,
        lng: -43.2105,
        description: "Art Deco statue of Jesus Christ, one of the New Seven Wonders.",
        image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop",
        category: "Monument",
        zoom: 18
    },
    
    // UK
    {
        id: 21,
        name: "Big Ben",
        country: "UK",
        city: "London",
        lat: 51.5007,
        lng: -0.1246,
        description: "Iconic clock tower at the Palace of Westminster.",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
        category: "Monument",
        zoom: 19
    },
    {
        id: 22,
        name: "Tower Bridge",
        country: "UK",
        city: "London",
        lat: 51.5055,
        lng: -0.0754,
        description: "Victorian Gothic style bascule bridge over the River Thames.",
        image: "https://images.unsplash.com/photo-1543832923-44667a44c804?w=800",
        category: "Bridge",
        zoom: 19
    },
    
    // JAPAN
    {
        id: 23,
        name: "Tokyo Tower",
        country: "Japan",
        city: "Tokyo",
        lat: 35.6586,
        lng: 139.7454,
        description: "Communications and observation tower, inspired by Eiffel Tower.",
        image: "https://images.unsplash.com/photo-1549693578-d683be217e58?w=800",
        category: "Modern",
        zoom: 19
    },
    {
        id: 24,
        name: "Mount Fuji",
        country: "Japan",
        city: "Honshu",
        lat: 35.3606,
        lng: 138.7278,
        description: "Japan's highest mountain, active stratovolcano and sacred symbol.",
        image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800",
        category: "Nature",
        zoom: 13
    },
    
    // PERU
    {
        id: 25,
        name: "Machu Picchu",
        country: "Peru",
        city: "Cusco",
        lat: -13.1631,
        lng: -72.5450,
        description: "15th-century Inca citadel in the Andes Mountains.",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=400&fit=crop",
        category: "Historical",
        zoom: 16
    },
    
    // GREECE
    {
        id: 26,
        name: "Parthenon",
        country: "Greece",
        city: "Athens",
        lat: 37.9715,
        lng: 23.7266,
        description: "Ancient temple dedicated to goddess Athena on the Acropolis.",
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800",
        category: "Historical",
        zoom: 19
    },
    
    // RUSSIA
    {
        id: 27,
        name: "Red Square",
        country: "Russia",
        city: "Moscow",
        lat: 55.7539,
        lng: 37.6208,
        description: "Historic city square, center of Russian culture and politics.",
        image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800",
        category: "Historical",
        zoom: 18
    },
    
    // MEXICO
    {
        id: 28,
        name: "Chichen Itza",
        country: "Mexico",
        city: "Yucatan",
        lat: 20.6843,
        lng: -88.5678,
        description: "Ancient Mayan city with iconic pyramid El Castillo.",
        image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800",
        category: "Historical",
        zoom: 17
    },
    
    // CAMBODIA
    {
        id: 29,
        name: "Angkor Wat",
        country: "Cambodia",
        city: "Siem Reap",
        lat: 13.4125,
        lng: 103.8670,
        description: "Largest religious monument, originally Hindu then Buddhist temple.",
        image: "https://images.unsplash.com/photo-1563434508088-e3fb1d38fa49?w=800",
        category: "Religious",
        zoom: 17
    },
    
    // JORDAN
    {
        id: 30,
        name: "Petra",
        country: "Jordan",
        city: "Ma'an",
        lat: 30.3285,
        lng: 35.4444,
        description: "Archaeological city carved into rose-red cliffs, ancient Nabatean capital.",
        image: "https://images.unsplash.com/photo-1579606032821-4e6c8f5c8f79?w=800",
        category: "Historical",
        zoom: 16
    }
];