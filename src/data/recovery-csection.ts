import { RecoveryGuide } from '../types';

export const csectionRecoveryGuide: RecoveryGuide = {
  type: 'csection',
  title: 'C-Section Delivery Recovery',
  overview:
    'A cesarean section is major abdominal surgery. Recovery typically takes 8-12 weeks, and full healing can take up to 6 months. Be gentle with yourself — you are healing from surgery while caring for a newborn.',
  milestones: [
    {
      id: 'c-week-0-1',
      weekRange: 'Days 1-7',
      title: 'Hospital & Immediate Recovery',
      description:
        'The first week focuses on managing surgical pain, beginning to move, and establishing feeding. Hospital stay is typically 2-4 days.',
      tips: [
        {
          id: 'c-tip-1',
          title: 'Pain Management',
          description:
            'Stay ahead of pain — take medications on schedule rather than waiting until pain is severe. You may have a combination of IV, oral, and anti-inflammatory medications.',
          phase: 'immediate',
          icon: 'medkit',
        },
        {
          id: 'c-tip-2',
          title: 'Early Movement',
          description:
            'Getting up and walking within 12-24 hours helps prevent blood clots and speeds recovery. It will be uncomfortable but gets easier each time. Hold a pillow against your incision for support.',
          phase: 'immediate',
          icon: 'walk',
          warning:
            'Do not skip prescribed blood clot prevention exercises. Deep vein thrombosis is a serious risk after surgery.',
        },
        {
          id: 'c-tip-3',
          title: 'Incision Care',
          description:
            'Keep the incision clean and dry. Wear loose-fitting clothing. Your medical team will show you how to care for the wound before discharge.',
          phase: 'immediate',
          icon: 'bandage',
        },
        {
          id: 'c-tip-4',
          title: 'Breastfeeding Positions',
          description:
            'The football hold or side-lying position keep baby\'s weight off your incision. Use plenty of pillows for support. Ask for lactation help in the hospital.',
          phase: 'immediate',
          icon: 'heart',
        },
        {
          id: 'c-tip-5',
          title: 'Gas & Bloating Relief',
          description:
            'Gas pain after abdominal surgery can be intense. Walk frequently, avoid straws, try gentle rocking, and take simethicone (Gas-X) as permitted.',
          phase: 'immediate',
          icon: 'body',
        },
        {
          id: 'c-tip-6',
          title: 'Pillow Technique',
          description:
            'Hold a pillow firmly over your incision when coughing, sneezing, laughing, or getting up. This "splinting" technique reduces pain and protects the healing incision.',
          phase: 'immediate',
          icon: 'bed',
        },
        {
          id: 'c-tip-7',
          title: 'Log Roll Technique',
          description:
            'To get out of bed: roll to your side, push up with your arms while swinging legs down. This avoids using abdominal muscles and reduces incision strain.',
          phase: 'immediate',
          icon: 'refresh',
        },
      ],
      whenToCallDoctor: [
        'Fever above 100.4°F (38°C)',
        'Incision opens, separates, or has increasing redness/swelling',
        'Pus or foul-smelling drainage from incision',
        'Heavy vaginal bleeding (soaking more than one pad per hour)',
        'Severe abdominal pain not relieved by medication',
        'Calf pain, redness, or swelling (blood clot warning)',
        'Chest pain or difficulty breathing',
        'Painful, frequent, or burning urination',
      ],
    },
    {
      id: 'c-week-2-3',
      weekRange: 'Weeks 2-3',
      title: 'Early Home Recovery',
      description:
        'Pain gradually decreases. Focus on gentle movement, proper nutrition, and allowing others to help with household tasks and caring for older children.',
      tips: [
        {
          id: 'c-tip-8',
          title: 'Lifting Restrictions',
          description:
            'Do not lift anything heavier than your baby (about 7-10 lbs). Avoid carrying the car seat — have someone else carry it or roll baby in a stroller.',
          phase: 'early',
          icon: 'alert',
          warning:
            'Lifting too much too soon can cause incision complications and slow healing.',
        },
        {
          id: 'c-tip-9',
          title: 'Driving Restriction',
          description:
            'Most providers recommend waiting 2-4 weeks before driving. You need to be off narcotic pain medication and able to brake suddenly without pain.',
          phase: 'early',
          icon: 'car',
        },
        {
          id: 'c-tip-10',
          title: 'Scar Care Beginning',
          description:
            'Once steri-strips or glue fall off naturally and the incision is fully closed, begin gentle scar massage. Use clean fingers to massage in circular motions around (not on) the scar.',
          phase: 'early',
          icon: 'hand-left',
        },
        {
          id: 'c-tip-11',
          title: 'Constipation Prevention',
          description:
            'Narcotics, reduced activity, and surgery itself cause constipation. Drink lots of water, eat high-fiber foods, take stool softeners, and try gentle walking.',
          phase: 'early',
          icon: 'leaf',
        },
        {
          id: 'c-tip-12',
          title: 'Accept Help Generously',
          description:
            'You need more help than you think. Accept or arrange help with cooking, cleaning, laundry, errands, and caring for older children. Your one job is to heal and care for your baby.',
          phase: 'early',
          icon: 'people',
        },
      ],
      whenToCallDoctor: [
        'Increasing incision pain after initial improvement',
        'New redness spreading from the incision',
        'Numbness that worsens or doesn\'t improve around incision',
        'Unable to have a bowel movement after several days despite treatment',
        'Persistent feelings of sadness, hopelessness, or detachment',
      ],
    },
    {
      id: 'c-week-4-6',
      weekRange: 'Weeks 4-6',
      title: 'Ongoing Recovery',
      description:
        'The incision should be well-healed externally. Internal healing continues. You may begin to feel significantly better but still need to respect your body\'s limits.',
      tips: [
        {
          id: 'c-tip-13',
          title: 'Postpartum Checkup',
          description:
            'Your provider will examine the incision, check internal healing, discuss contraception, screen for PPD, and provide guidance on activity restrictions.',
          phase: 'ongoing',
          icon: 'calendar',
        },
        {
          id: 'c-tip-14',
          title: 'Scar Massage',
          description:
            'After clearance, begin direct scar massage. Use vitamin E oil or silicone-based scar gel. Massage the scar itself in multiple directions for 5-10 minutes daily to prevent adhesions.',
          phase: 'ongoing',
          icon: 'hand-left',
        },
        {
          id: 'c-tip-15',
          title: 'Gradual Core Rehabilitation',
          description:
            'Begin gentle core activation exercises under guidance. Avoid crunches, planks, and sit-ups. Focus on deep breathing, gentle pelvic tilts, and transverse abdominal activation.',
          phase: 'ongoing',
          icon: 'fitness',
          warning:
            'Check for diastasis recti (abdominal separation) before doing core exercises. Your provider or a PT can assess this.',
        },
        {
          id: 'c-tip-16',
          title: 'Emotional Processing',
          description:
            'Some parents grieve an unplanned c-section or feel disconnected from their birth experience. These feelings are valid. Consider talking to a therapist who specializes in birth trauma.',
          phase: 'ongoing',
          icon: 'chatbubbles',
        },
      ],
      whenToCallDoctor: [
        'Scar tissue feels hard, raised, or increasingly painful',
        'Numbness around the incision that isn\'t improving',
        'Bulging near the incision (possible hernia)',
        'Ongoing difficulty with daily activities',
      ],
    },
    {
      id: 'c-week-7-plus',
      weekRange: 'Weeks 7-24+',
      title: 'Long-Term Recovery & Strengthening',
      description:
        'External healing is largely complete, but internal tissue remodeling continues for 6+ months. Focus on rebuilding strength and addressing any ongoing issues.',
      tips: [
        {
          id: 'c-tip-17',
          title: 'Return to Exercise',
          description:
            'After clearance, gradually return to exercise. Start with walking, swimming, or gentle yoga. Progress to strength training slowly. Many women benefit from a postpartum fitness program.',
          phase: 'longterm',
          icon: 'bicycle',
        },
        {
          id: 'c-tip-18',
          title: 'Pelvic Floor Physical Therapy',
          description:
            'C-section recovery affects the pelvic floor too. Consider seeing a pelvic floor PT for assessment and treatment, especially if experiencing incontinence or pelvic pain.',
          phase: 'longterm',
          icon: 'body',
        },
        {
          id: 'c-tip-19',
          title: 'Scar Desensitization',
          description:
            'If your scar is sensitive or numb, practice desensitization by touching it with different textures (soft cloth, fingers, brush). This retrains nerve pathways over time.',
          phase: 'longterm',
          icon: 'hand-left',
        },
        {
          id: 'c-tip-20',
          title: 'Future Pregnancy Planning',
          description:
            'If planning future pregnancies, most providers recommend waiting at least 18 months after a c-section to allow full uterine healing. Discuss VBAC options with your provider.',
          phase: 'longterm',
          icon: 'calendar',
        },
        {
          id: 'c-tip-21',
          title: 'Celebrate Your Strength',
          description:
            'You grew a human and recovered from major surgery while caring for a newborn. That is an incredible achievement. Be proud of how far you\'ve come.',
          phase: 'longterm',
          icon: 'star',
        },
      ],
      whenToCallDoctor: [
        'Chronic pain at the incision site',
        'Suspected incisional hernia (bulging near scar)',
        'Adhesion-related pain (pulling sensation with movement)',
        'Depression or anxiety at any point in the first year',
        'Difficulty with bladder or bowel function',
      ],
    },
  ],
  doList: [
    'Take pain medication on schedule — staying ahead of pain aids recovery',
    'Walk as soon as medically advised — it prevents blood clots',
    'Use the pillow splinting technique for coughing/laughing/sneezing',
    'Use the log roll technique to get in and out of bed',
    'Keep essentials (phone, water, snacks, diapers) within arm\'s reach',
    'Accept all offered help — and ask for more when needed',
    'Eat high-fiber, nutrient-rich foods to prevent constipation',
    'Take stool softeners as recommended',
    'Attend all follow-up appointments',
    'Begin scar massage once cleared by your provider',
    'Communicate openly about your emotional state',
  ],
  dontList: [
    'Lift anything heavier than your baby for at least 6 weeks',
    'Drive until cleared by your provider (typically 2-4 weeks)',
    'Do crunches, sit-ups, or planks until cleared and assessed for diastasis',
    'Soak in baths, pools, or hot tubs until the incision is fully healed',
    'Use tampons until cleared (typically 6 weeks)',
    'Ignore incision changes — redness, drainage, or opening',
    'Push through increasing pain — it\'s a sign to rest',
    'Skip medications to "tough it out"',
    'Compare your recovery timeline to vaginal delivery timelines',
    'Ignore emotional struggles — birth trauma and PPD are real and treatable',
    'Go up and down stairs more than necessary in the first 2 weeks',
  ],
};
