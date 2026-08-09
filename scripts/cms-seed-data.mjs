export const site = {
  name: "Salt Lash City",
  tagline: "Master Esthetician in Sandy, UT",
  owner: "Blake",
  email: "Blake@SaltLashCity.com",
  phone: "(801) 946-4595",
  phoneHref: "tel:+18019464595",
  address: {
    line1: "9295 S 1300 E",
    line2: "Sandy, UT 84094",
  },
  bookingUrl: "https://www.vagaro.com/saltlashcity",
  social: {
    facebook: "https://www.facebook.com/Salt-lash-city-903840756420638/",
    instagram: "https://www.instagram.com/saltlashcity/",
  },
  hours: [
    { day: "Monday", time: "10:00 AM â€“ 7:00 PM" },
    { day: "Tuesday", time: "10:00 AM â€“ 7:00 PM" },
    { day: "Wednesday", time: "10:00 AM â€“ 7:00 PM" },
    { day: "Thursday", time: "10:00 AM â€“ 7:00 PM" },
    { day: "Friday", time: "10:00 AM â€“ 7:00 PM" },
    { day: "Saturday", time: "9:00 AM â€“ 3:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};



export const servicePages = [
  {
    slug: "eyelash-extensions",
    title: "Eyelash Extensions",
    navLabel: "Eyelash Extensions",
    group: "eyelashes",
    shortDescription:
      "Darken, thicken, and lengthen your lashes with classic, hybrid, or volume extensions.",
    intro:
      "If youâ€™re looking for professional eyelash extensions near Sandy, UT, Salt Lash City is ready for you. Browse services below, reach out with questions, or book an appointment online.",
    sections: [
      {
        heading: "Classic Lashes",
        items: [
          {
            name: "Classic Eyelash Extensions (Fill)",
            price: "$65",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Classic Eyelash Extensions (Fill Plus)",
            price: "$75",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Classic Eyelash Extensions (Full Set)",
            price: "$160",
            note: "One synthetic mink lash to one natural lash with your choice of length, thickness, curl, and shape.",
          },
          {
            name: "Classic Eyelash Extensions (Welcome Fill)",
            price: "$60",
            note: "Must book this option if you are coming from another lash artist so thereâ€™s more time to work on your lashes.",
          },
        ],
      },
      {
        heading: "Hybrid Lashes",
        items: [
          {
            name: "Hybrid Eyelash Extensions (Fill)",
            price: "$75",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Hybrid Eyelash Extensions (Fill Plus)",
            price: "$85",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Hybrid Eyelash Extensions (Full Set)",
            price: "$220",
            note: "Half classic (1:1) and half volume (3â€“6 lashes per natural lash) with your choice of length, thickness, curl, and shape.",
          },
        ],
      },
      {
        heading: "Volume Lashes",
        items: [
          {
            name: "Volume Eyelash Extensions (Fill)",
            price: "$85",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Volume Eyelash Extensions (Fill Plus)",
            price: "$95",
            note: "Must have at least half of your extensions still attached.",
          },
          {
            name: "Volume Eyelash Extensions (Full Set)",
            price: "$220",
            note: "A fan of 3â€“6 thin synthetic mink lashes on one natural lash with your choice of length, thickness, curl, and shape.",
          },
        ],
      },
      {
        heading: "Additional Services",
        items: [
          { name: "Color Add-In / Take-Out", price: "$20" },
          { name: "Lash Removal", price: "$50" },
        ],
      },
    ],
    careTips: [
      "Keep dry for the first 24â€“48 hours.",
      "Avoid mascara or eyeliner on your extensions.",
      "Keep clean by rinsing with cool water; if you wear eye makeup, brush through with Johnsonâ€™s baby shampoo after the first 24â€“48 hours, dab dry, and air dry before brushing.",
      "Do not over-brush â€” morning, midday, and before bed is plenty.",
      "Do not pick at your lash extensions.",
    ],
    faqs: [
      {
        question: "What are lash extensions?",
        answer:
          "Synthetic mink hairs in a variety of lengths, thicknesses, and curls applied to your natural lashes to darken, thicken, or lengthen your look.",
      },
      {
        question: "How long do lash extensions last?",
        answer:
          "Depending on aftercare and your natural lash cycle, lashes typically last 2â€“4 weeks before needing a fill.",
      },
      {
        question: "Can you put mascara on lash extensions?",
        answer:
          "No. Mascara and liquid eyeliner often contain oil that breaks down the adhesive and causes premature shedding.",
      },
      {
        question: "Can you swim with lash extensions?",
        answer: "Yes â€” after 24 hours you can get your lashes wet as usual.",
      },
    ],
  },
  {
    slug: "eyelash-lifts",
    title: "Eyelash Lifts",
    navLabel: "Eyelash Lifts",
    group: "eyelashes",
    shortDescription: "A low-maintenance lash perm that lasts 6â€“8 weeks.",
    intro:
      "Professional eyelash lifts near Sandy, UT â€” perfect if you want fabulous lashes with low maintenance.",
    sections: [
      {
        items: [
          {
            name: "Lash Lift",
            price: "$70",
            note: "A lash perm that leaves your lashes curled for 6â€“8 weeks.",
          },
          {
            name: "Lash Lift with Tint",
            price: "$90",
            note: "A lash perm with dark dye for a lifted, natural-looking finish.",
          },
        ],
      },
    ],
  },
  {
    slug: "eyelash-tinting",
    title: "Eyelash Tinting",
    navLabel: "Eyelash Tinting",
    group: "eyelashes",
    shortDescription: "Darker, fuller-looking lashes for weeks â€” even without mascara.",
    intro:
      "Professional eyelash tinting near Sandy, UT. A special dye makes lashes look darker and fuller for weeks.",
    sections: [
      {
        items: [
          {
            name: "Eyelash Tinting",
            price: "$20",
            note: "Special dye that darkens and fills out your natural lashes for weeks.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "How long does lash tint last?",
        answer: "Generally about 3â€“5 weeks, depending on your lashes.",
      },
      {
        question: "Can you still wear mascara with lash tint?",
        answer: "Yes â€” unlike extensions, you can wear mascara after a tint.",
      },
      {
        question: "Does lash tinting damage eyelashes?",
        answer: "No, when performed by a professional.",
      },
    ],
  },
  {
    slug: "eyebrow-tinting",
    title: "Eyebrow Tinting",
    navLabel: "Eyebrow Tinting",
    group: "eyebrows",
    shortDescription: "Darken your natural brows for a polished, low-effort look.",
    intro:
      "Professional eyebrow tinting near Sandy, UT. A special dye darkens your natural brow hairs.",
    sections: [
      {
        items: [
          {
            name: "Eyebrow Tinting",
            price: "$15",
            note: "Darkens your natural eyebrow hairs with dye.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "How long does eyebrow tinting last?",
        answer: "On average, 3â€“5 weeks.",
      },
      {
        question: "What is eyebrow tinting?",
        answer: "Darkening of your natural eyebrow hairs with dye.",
      },
    ],
  },
  {
    slug: "waxing",
    title: "Waxing",
    navLabel: "Waxing",
    group: "body",
    shortDescription:
      "Sensitive, hard, and soft waxes for different body areas and skin types.",
    intro:
      "I offer a variety of sensitive, hard, and soft waxes for different body areas and skin types. Best to exfoliate a day before treatment and have hair about the length of a grain of rice (I will not trim). Youâ€™ll be cleansed before treatment; some swelling or redness afterward is possible.",
    sections: [
      {
        items: [
          { name: "Half Leg", price: "$35" },
          { name: "Full Leg", price: "$45" },
          { name: "Arms", price: "$35" },
          { name: "Under Arms", price: "$20" },
          { name: "Abdomen", price: "$30" },
          { name: "Back", price: "$40" },
          { name: "Bikini", price: "$30" },
          { name: "Brazilian", price: "$50" },
          { name: "Eyebrows", price: "$10" },
          { name: "Eyebrows with Tint", price: "$15" },
          { name: "Nose", price: "$5" },
          { name: "Upper Lip", price: "$5" },
        ],
      },
    ],
  },
  {
    slug: "facial",
    title: "Facials",
    navLabel: "Facial",
    group: "skin",
    shortDescription: "Relaxing professional facials to treat and refresh your skin.",
    intro:
      "Need a relaxing, professional facial in Sandy, UT? Salt Lash City has you covered.",
    sections: [
      {
        items: [
          { name: "60-Minute Facial", price: "$60" },
          { name: "60-Minute Jelly Facial", price: "$70" },
          { name: "30-Minute Facial", price: "$30" },
        ],
      },
    ],
    faqs: [
      {
        question: "What is a facial?",
        answer:
          "A combination of face cleansing and massage that can target different skin concerns.",
      },
      {
        question: "How often should you get a facial?",
        answer: "Every 4â€“8 weeks.",
      },
      {
        question: "Do facials help acne?",
        answer:
          "Yes â€” regular facials and good aftercare can help treat acne and other skin concerns.",
      },
    ],
  },
];


