// Story chapters for the seven labors (Haft Khan) of Rostam, one per level.
// DRAFT (Plan.md B2, D14): "challenge" and "symbolism" come from the README. The facts are
// short, widely cited points about Ferdowsi's Shahnameh. A reviewer who knows the
// Shahnameh must approve this text before launch. Where the README's chapter differs from
// the commonly cited sequence (labors 5 and 6, Plan.md P6), a fact says so.

export interface Chapter {
  number: number;
  title: string;
  challenge: string;
  symbolism: string;
  facts: string[];
}

export const CHAPTERS: readonly Chapter[] = [
  {
    number: 1,
    title: 'The Lion',
    challenge: 'Rostam fights and kills a ferocious lion.',
    symbolism: 'Courage and physical strength.',
    facts: [
      'Rostam sets out on the seven labors to rescue King Kay Kavus, who has been captured in Mazandaran, the land of the demons.',
      "In Ferdowsi's telling, it is Rostam's horse Rakhsh who kills the lion while Rostam sleeps.",
      'The Shahnameh ("Book of Kings") was written by the Persian poet Ferdowsi and completed around 1010 CE.',
    ],
  },
  {
    number: 2,
    title: 'The Desert',
    challenge: 'Rostam crosses a perilous desert.',
    symbolism: 'Endurance and resilience.',
    facts: [
      'Near death from thirst, Rostam prays for help, and a ram appears and leads him to a spring.',
      'The Shahnameh runs to about 50,000 couplets, making it one of the longest poems written by a single author.',
    ],
  },
  {
    number: 3,
    title: 'The Dragon',
    challenge: 'Rostam encounters and defeats a mighty dragon.',
    symbolism: 'Heroic prowess and determination.',
    facts: [
      'The dragon comes at night. Twice Rakhsh wakes Rostam but the dragon vanishes; the third time Rostam sees it, and with Rakhsh he slays it.',
      'Rakhsh is the most famous horse in Persian literature and stays at Rostam\'s side for his whole life.',
    ],
  },
  {
    number: 4,
    title: 'The Sorceress',
    challenge: 'Rostam meets a deceitful enchantress who tries to kill him, but he overcomes her tricks and kills her.',
    symbolism: 'Wisdom and vigilance against deceit.',
    facts: [
      'The witch appears as a beautiful young woman. When Rostam speaks the name of God, her true form is revealed.',
      'Ferdowsi worked on the Shahnameh for about thirty years.',
    ],
  },
  {
    number: 5,
    title: 'The Demon',
    challenge: 'Rostam battles with a powerful demon and emerges victorious.',
    symbolism: 'Strength and valor in the face of dark forces.',
    facts: [
      'Many retellings count the fifth labor as the capture of Olad, a local warrior who then guides Rostam to the demons.',
      'The demons of the Shahnameh are called divs.',
    ],
  },
  {
    number: 6,
    title: 'The Simurgh',
    challenge: 'Rostam fights against the White Demon, with the help of the magical Simurgh, a mythical bird.',
    symbolism: 'The alliance between man and mythical creatures, and the importance of allies.',
    facts: [
      'In most retellings, the sixth labor is the defeat of Arzhang, a chief of the demons.',
      "The Simurgh raised Rostam's father, Zal, and later helps Rostam in his battle with the hero Esfandiyar.",
    ],
  },
  {
    number: 7,
    title: 'The Rescue',
    challenge: 'Rostam finally defeats the White Demon and rescues King Kay Kavus and his men.',
    symbolism: 'The ultimate triumph of good over evil and the fulfillment of his quest.',
    facts: [
      "Rostam slays the White Demon in his cave, and drops of the demon's blood restore the sight of Kay Kavus and his men.",
      'The tragedy of Rostam and his son Sohrab is one of the best-known stories in the Shahnameh.',
    ],
  },
];
