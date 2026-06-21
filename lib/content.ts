import type { Lesson, StudentProgress, Topic } from "@/lib/types";

export const topics: Topic[] = [
  {
    id: "1",
    slug: "lesson-one-conservation-natural-resources",
    title: "Lesson One: Conservation of Natural Resources",
    description: "Meaning and importance of conservation, with soil and water conservation methods.",
    level: 1,
    estimatedMinutes: 35,
    icon: "Leaf"
  },
  {
    id: "2",
    slug: "lesson-two-forest-wildlife-conservation",
    title: "Lesson Two: Forest and Wildlife Conservation",
    description: "Forest conservation, wildlife conservation, conservation symbols, and conservation slogans.",
    level: 1,
    estimatedMinutes: 35,
    icon: "Trees"
  },
  {
    id: "3",
    slug: "lesson-three-pests-diseases-control",
    title: "Lesson Three: Pests and Diseases",
    description: "Types of pests and plant diseases, control methods, and their benefits and drawbacks.",
    level: 2,
    estimatedMinutes: 45,
    icon: "Activity"
  },
  {
    id: "4",
    slug: "lesson-four-reproduction-birds-mammals",
    title: "Lesson Four: Reproductive System in Birds and Mammals",
    description: "Reproduction in birds and mammals, comparisons, and roles of reproductive organs.",
    level: 3,
    estimatedMinutes: 45,
    icon: "Flower2"
  },
  {
    id: "6",
    slug: "lesson-six-fertilization-development-care",
    title: "Lesson Six: Fertilization, Development, and Parental Care",
    description: "Drawing reproductive systems, fertilization, embryonic development, and parental care.",
    level: 3,
    estimatedMinutes: 50,
    icon: "Network"
  }
];

export const lessons: Lesson[] = [
  {
    id: "lesson-one-conservation-natural-resources",
    topicSlug: "lesson-one-conservation-natural-resources",
    title: "Lesson One: Conservation of Natural Resources",
    objectives: [
      "State the meaning of conservation.",
      "Explain the importance of conserving natural resources.",
      "Identify soil conservation methods from the approved lesson note.",
      "Identify water conservation methods from the approved lesson note."
    ],
    introduction: "This lesson introduces conservation of natural resources using the approved SSII Biology lesson note as the foundation.",
    content: [
      "Conservation of natural resources refers to the careful use, management and protection of natural resources such as water, soil, forests, minerals, fossil fuels, wildlife, and biodiversity to ensure they are available for present and future generations.",
      "The note explains conservation through sustainable use, protection and preservation, efficient utilization, restoration and renewal, and balancing development with the environment.",
      "Importance of conservation includes sustainability for future generations, environmental protection, economic benefits, preservation of biodiversity, climate regulation, soil and water conservation, reduced dependency on non-renewable resources, and improved quality of life.",
      "Soil conservation methods in the note include afforestation and reforestation, contour ploughing, terracing, crop rotation, cover cropping or green manure, mulching, strip cropping, conservation tillage, gully control, and controlled grazing.",
      "Water conservation methods include rainwater harvesting, drip and sprinkler irrigation, greywater and industrial water recycling, protection of water sources, reducing water pollution, groundwater conservation, water-saving technologies at home, and public awareness."
    ],
    keyTerms: [
      { term: "Conservation", meaning: "Careful protection and use of natural resources." },
      { term: "Natural resources", meaning: "Useful materials and conditions supplied by nature." },
      { term: "Soil conservation", meaning: "Methods used to protect soil from erosion and loss of fertility." },
      { term: "Water conservation", meaning: "Methods used to prevent water waste and protect water sources." }
    ],
    diagramPrompt: "Approved-note diagram placeholder: soil and water conservation methods.",
    activity: "List three soil conservation methods and three water conservation methods from the uploaded lesson note, then explain one method in your own words.",
    remediation: "Review the meaning and importance of conservation, then compare soil conservation with water conservation.",
    summary: "Conservation protects natural resources. Soil and water conservation help preserve resources needed by people, plants, animals, and the environment.",
    questions: [
      {
        id: "l1-q1",
        topicSlug: "lesson-one-conservation-natural-resources",
        prompt: "What is conservation?",
        options: ["Careful protection and use of natural resources", "Complete destruction of resources", "Using resources without planning", "Ignoring soil and water"],
        correctAnswer: "Careful protection and use of natural resources",
        explanation: "The lesson note treats conservation as careful protection and use of natural resources.",
        difficulty: "easy"
      },
      {
        id: "l1-q2",
        topicSlug: "lesson-one-conservation-natural-resources",
        prompt: "Why is conservation important?",
        options: ["It protects resources for present and future use", "It increases resource waste", "It stops all farming", "It removes the need for water"],
        correctAnswer: "It protects resources for present and future use",
        explanation: "Conservation helps keep natural resources available and useful.",
        difficulty: "medium"
      },
      {
        id: "l1-q3",
        topicSlug: "lesson-one-conservation-natural-resources",
        prompt: "Which pair belongs to Lesson One?",
        options: ["Soil conservation and water conservation", "Forest conservation and wildlife conservation", "Pest control and disease control", "Fertilization and parental care"],
        correctAnswer: "Soil conservation and water conservation",
        explanation: "Lesson One covers soil and water conservation methods.",
        difficulty: "hard"
      }
    ]
  },
  {
    id: "lesson-two-forest-wildlife-conservation",
    topicSlug: "lesson-two-forest-wildlife-conservation",
    title: "Lesson Two: Forest and Wildlife Conservation",
    objectives: [
      "Describe forest conservation.",
      "Describe wildlife conservation.",
      "Identify conservation symbols from the approved lesson note.",
      "Explain conservation slogans from the approved lesson note."
    ],
    introduction: "This lesson continues conservation by focusing on forests, wildlife, symbols, and slogans in the uploaded course note.",
    content: [
      "Forest conservation methods in the note include afforestation, reforestation, controlled and regulated cutting, prevention of bush burning, prevention of overgrazing, social forestry, protected areas, forest legislation and policies, and public awareness with community participation.",
      "Wildlife conservation methods include protected areas such as national parks, wildlife sanctuaries and game reserves; legislation and enforcement; captive breeding and rehabilitation; habitat conservation and restoration; prevention of over-exploitation; wildlife corridors; pollution and climate-change control; and community participation and education.",
      "Conservation symbols in the note include the recycling symbol, tree symbol, panda symbol, earth or globe symbol, water drop symbol, and green leaf symbol.",
      "Conservation slogans in the note include Reduce, Reuse, Recycle; Plant a tree, plant a life; Save water, save life; Forests are the lungs of the Earth; Conserve energy, preserve future; Protect wildlife, protect nature; Go green, breathe clean; and Nature is priceless, conserve it."
    ],
    keyTerms: [
      { term: "Forest conservation", meaning: "Protection and responsible management of forests." },
      { term: "Wildlife conservation", meaning: "Protection of wild animals and their habitats." },
      { term: "Conservation symbol", meaning: "A sign or image used to represent conservation." },
      { term: "Conservation slogan", meaning: "A short statement that encourages conservation." }
    ],
    diagramPrompt: "Approved-note diagram placeholder: conservation symbols and forest/wildlife protection.",
    activity: "Choose two conservation symbols from the note and explain their meanings, then write one teacher-approved conservation slogan.",
    remediation: "Review the difference between forest conservation and wildlife conservation, then study the approved symbols and slogans again.",
    summary: "Forest and wildlife conservation protect living resources and their habitats. Symbols and slogans help people remember conservation responsibilities.",
    questions: [
      {
        id: "l2-q1",
        topicSlug: "lesson-two-forest-wildlife-conservation",
        prompt: "What does wildlife conservation protect?",
        options: ["Wild animals and their habitats", "Only classroom furniture", "Only laboratory chemicals", "Only rainfall"],
        correctAnswer: "Wild animals and their habitats",
        explanation: "Wildlife conservation is about protecting wild animals and where they live.",
        difficulty: "easy"
      },
      {
        id: "l2-q2",
        topicSlug: "lesson-two-forest-wildlife-conservation",
        prompt: "What is the purpose of conservation slogans?",
        options: ["To encourage people to conserve resources", "To replace all lesson notes", "To identify plant diseases", "To label mammal organs"],
        correctAnswer: "To encourage people to conserve resources",
        explanation: "Slogans are short statements that promote conservation.",
        difficulty: "medium"
      },
      {
        id: "l2-q3",
        topicSlug: "lesson-two-forest-wildlife-conservation",
        prompt: "Which topic is approved for Lesson Two?",
        options: ["Conservation symbols", "Soil conservation methods", "Pest control drawbacks", "Parental care"],
        correctAnswer: "Conservation symbols",
        explanation: "Lesson Two includes conservation symbols and slogans.",
        difficulty: "hard"
      }
    ]
  },
  {
    id: "lesson-three-pests-diseases-control",
    topicSlug: "lesson-three-pests-diseases-control",
    title: "Lesson Three: Pests and Diseases",
    objectives: [
      "Explain pests and diseases using the approved lesson note.",
      "Identify types of pests.",
      "Identify types of plant diseases.",
      "Describe pest and disease control methods.",
      "Compare benefits and drawbacks of control methods."
    ],
    introduction: "This lesson focuses on pests, plant diseases, and approved control methods from the SSII Biology lesson note.",
    content: [
      "Pests are organisms such as insects, weeds, fungi, rodents, bacteria, or other animals that harm humans, crops, livestock, property, or the environment because they cause damage, compete for resources, or transmit diseases.",
      "A disease is an abnormal condition in a living organism that disrupts normal structure or function. Plant diseases may be caused by fungi, bacteria, viruses, nematodes, mycoplasma or phytoplasma organisms, or abiotic environmental stress.",
      "Types of pests in the note include insect pests, mite pests, nematode pests, rodent pests, bird pests, mollusk pests, weed pests, and microbial pests.",
      "Pest and disease control methods include chemical control, biological control, cultural control, mechanical or physical control, resistant varieties, quarantine and legislation, and integrated pest or disease management.",
      "Benefits include increased crop yield, improved food quality, and reduced economic losses. Drawbacks include environmental pollution, resistance, harm to non-target species, cost, training needs, slow results, and labour intensity."
    ],
    keyTerms: [
      { term: "Pest", meaning: "An organism that causes damage to crops or useful materials." },
      { term: "Plant disease", meaning: "A condition that affects normal plant growth or function." },
      { term: "Pest control", meaning: "A method used to reduce or prevent pest damage." },
      { term: "Disease control", meaning: "A method used to reduce or prevent plant disease." }
    ],
    diagramPrompt: "Approved-note diagram placeholder: pest examples, disease examples, and control methods.",
    activity: "Choose two control methods from the note and state one benefit and one drawback of each.",
    remediation: "Review the difference between pests and plant diseases before comparing control methods.",
    summary: "Pests and plant diseases can reduce plant productivity. Control methods help, but each method must be judged by its benefits and drawbacks.",
    questions: [
      {
        id: "l3-q1",
        topicSlug: "lesson-three-pests-diseases-control",
        prompt: "What is a pest?",
        options: ["An organism that damages crops or useful materials", "A conservation slogan", "A reproductive organ", "A water storage tank"],
        correctAnswer: "An organism that damages crops or useful materials",
        explanation: "The lesson note treats pests as damaging organisms.",
        difficulty: "easy"
      },
      {
        id: "l3-q2",
        topicSlug: "lesson-three-pests-diseases-control",
        prompt: "Why should control methods be compared?",
        options: ["They have benefits and drawbacks", "They are all perfect", "They are unrelated to crops", "They only apply to birds"],
        correctAnswer: "They have benefits and drawbacks",
        explanation: "Lesson Three includes both benefits and drawbacks of control methods.",
        difficulty: "medium"
      },
      {
        id: "l3-q3",
        topicSlug: "lesson-three-pests-diseases-control",
        prompt: "Which content belongs to Lesson Three?",
        options: ["Pest control and disease control methods", "Forest slogans only", "Embryonic development only", "Water conservation only"],
        correctAnswer: "Pest control and disease control methods",
        explanation: "Lesson Three covers pest and disease control.",
        difficulty: "hard"
      }
    ]
  },
  {
    id: "lesson-four-reproduction-birds-mammals",
    topicSlug: "lesson-four-reproduction-birds-mammals",
    title: "Lesson Four: Reproductive System in Birds and Mammals",
    objectives: [
      "Describe reproduction in birds.",
      "Describe reproduction in mammals.",
      "Compare reproduction in birds and mammals.",
      "State the roles of male and female reproductive organs in birds and mammals."
    ],
    introduction: "This lesson covers reproductive systems in birds and mammals within the approved course scope.",
    content: [
      "Reproduction in birds is the biological process by which birds produce offspring through sexual reproduction, internal fertilization, egg formation, incubation, and hatching.",
      "Reproduction in mammals is the biological process by which new individuals are produced through sexual reproduction, internal fertilization, and development of the young inside the mother's body.",
      "Birds are oviparous and lay shelled eggs. Their embryos develop outside the mother's body inside eggs and are nourished by yolk. Mammals are mostly viviparous, their embryos develop inside the uterus, and young are fed with milk from mammary glands after birth.",
      "Male bird organs in the note include testes, vas deferens, cloaca, and phallus in some birds. Female bird organs include ovary, oviduct, infundibulum, magnum, isthmus, uterus or shell gland, vagina, and cloaca.",
      "Male mammal organs include testes, epididymis, vas deferens, seminal vesicles, prostate gland, Cowper's glands, urethra, and penis. Female mammal organs include ovaries, fallopian tubes, uterus, endometrium, cervix, vagina, and mammary glands."
    ],
    keyTerms: [
      { term: "Reproduction", meaning: "The process by which organisms produce offspring." },
      { term: "Male reproductive organ", meaning: "A structure involved in producing or transferring male reproductive cells." },
      { term: "Female reproductive organ", meaning: "A structure involved in producing female reproductive cells or supporting development." },
      { term: "Comparison", meaning: "Stating similarities and differences between two things." }
    ],
    diagramPrompt: "Approved-note diagram placeholder: male and female reproductive organs in birds and mammals.",
    activity: "Make a two-column comparison between reproduction in birds and mammals using mode of reproduction, embryo development, embryo nutrition, birth process, and parental care.",
    remediation: "Review the roles of male and female reproductive organs before attempting comparison questions.",
    summary: "Birds and mammals reproduce using reproductive systems with male and female organs. Their reproductive processes can be compared using similarities and differences.",
    questions: [
      {
        id: "l4-q1",
        topicSlug: "lesson-four-reproduction-birds-mammals",
        prompt: "What is reproduction?",
        options: ["The process of producing offspring", "The protection of forests", "The control of pests", "The saving of water"],
        correctAnswer: "The process of producing offspring",
        explanation: "Lesson Four discusses reproduction as producing offspring.",
        difficulty: "easy"
      },
      {
        id: "l4-q2",
        topicSlug: "lesson-four-reproduction-birds-mammals",
        prompt: "What should students compare in Lesson Four?",
        options: ["Reproduction in birds and mammals", "Soil and water conservation", "Slogans and symbols only", "Pests and plant diseases only"],
        correctAnswer: "Reproduction in birds and mammals",
        explanation: "Lesson Four includes comparison between reproduction in birds and mammals.",
        difficulty: "medium"
      },
      {
        id: "l4-q3",
        topicSlug: "lesson-four-reproduction-birds-mammals",
        prompt: "Which organs are part of the Lesson Four scope?",
        options: ["Male and female reproductive organs in birds and mammals", "Conservation slogans", "Water conservation methods", "Pest control methods"],
        correctAnswer: "Male and female reproductive organs in birds and mammals",
        explanation: "The approved scope includes the roles of male and female reproductive organs in birds and mammals.",
        difficulty: "hard"
      }
    ]
  },
  {
    id: "lesson-six-fertilization-development-care",
    topicSlug: "lesson-six-fertilization-development-care",
    title: "Lesson Six: Fertilization, Development, and Parental Care",
    objectives: [
      "Draw and label reproductive systems of birds and mammals using teacher-approved diagrams.",
      "Explain fertilization in birds and mammals.",
      "Describe embryonic development in birds and mammals.",
      "Describe parental care in birds and mammals.",
      "Identify stages of embryonic development from the approved lesson note."
    ],
    introduction: "This lesson continues reproduction in birds and mammals with labelled drawings, fertilization, development, and parental care.",
    content: [
      "Students draw and label reproductive systems of birds and mammals using teacher-approved diagrams from the lesson note.",
      "Fertilization is the fusion of a sperm cell and an egg or ovum to form a zygote. It unites gametes, restores chromosome number, and initiates development.",
      "In birds, fertilization is internal and occurs in the infundibulum of the oviduct. The zygote receives albumen, membranes, and a hard shell before the egg is laid, incubated, and hatched.",
      "In mammals, fertilization is internal and occurs in the fallopian tube. The zygote divides, moves to the uterus, implants in the uterine wall, and develops into an embryo.",
      "Embryonic development in birds occurs inside an egg outside the mother and uses nutrients from the yolk. Embryonic development in mammals occurs inside the uterus and is supported by the placenta and umbilical cord."
    ],
    keyTerms: [
      { term: "Fertilization", meaning: "The joining of reproductive cells to begin development of a new organism." },
      { term: "Embryonic development", meaning: "Growth and development of the young organism at early stages." },
      { term: "Parental care", meaning: "Care given by parents to help offspring survive." },
      { term: "Labelled drawing", meaning: "A diagram with correct names attached to parts." }
    ],
    diagramPrompt: "Approved-note diagram placeholder: labelled reproductive systems of birds and mammals.",
    activity: "Draw one approved reproductive system diagram and label the parts shown in the lesson note.",
    remediation: "Study the labelled diagrams again, then review fertilization and the stages of embryonic development.",
    summary: "Lesson Six covers labelled reproductive diagrams, fertilization, embryonic development, parental care, and stages of development in birds and mammals.",
    questions: [
      {
        id: "l6-q1",
        topicSlug: "lesson-six-fertilization-development-care",
        prompt: "What is a labelled drawing?",
        options: ["A diagram with correct names attached to parts", "A conservation slogan", "A list of pest drawbacks only", "An unmarked picture"],
        correctAnswer: "A diagram with correct names attached to parts",
        explanation: "Lesson Six requires drawing and labelling reproductive systems.",
        difficulty: "easy"
      },
      {
        id: "l6-q2",
        topicSlug: "lesson-six-fertilization-development-care",
        prompt: "Which process begins development of a new organism?",
        options: ["Fertilization", "Forest conservation", "Water storage", "Pest naming"],
        correctAnswer: "Fertilization",
        explanation: "Fertilization begins the development of a new organism.",
        difficulty: "medium"
      },
      {
        id: "l6-q3",
        topicSlug: "lesson-six-fertilization-development-care",
        prompt: "Which topic belongs to Lesson Six?",
        options: ["Parental care in birds and mammals", "Conservation symbols", "Soil conservation methods", "Types of pests"],
        correctAnswer: "Parental care in birds and mammals",
        explanation: "Lesson Six covers parental care in birds and mammals.",
        difficulty: "hard"
      }
    ]
  }
];

export const demoProgress: StudentProgress[] = [];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.topicSlug === slug);
}

export function getTopic(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}
