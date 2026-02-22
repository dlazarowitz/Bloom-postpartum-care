import { RecoveryGuide } from '../types';

export const vaginalRecoveryGuide: RecoveryGuide = {
  type: 'vaginal',
  title: 'Vaginal Delivery Recovery',
  overview:
    'Recovery from a vaginal delivery typically takes 6-8 weeks, though every body is different. Be patient with yourself and listen to your body throughout the process.',
  milestones: [
    {
      id: 'v-week-0-1',
      weekRange: 'Days 1-7',
      title: 'Immediate Recovery',
      description:
        'Your body begins healing immediately. Expect soreness, bleeding (lochia), and fatigue. This is the most intensive recovery period.',
      tips: [
        {
          id: 'v-tip-1',
          title: 'Perineal Care',
          description:
            'Use a peri bottle with warm water after using the bathroom. Pat dry gently — never wipe. Witch hazel pads (Tucks) can reduce swelling and discomfort.',
          phase: 'immediate',
          icon: 'water',
        },
        {
          id: 'v-tip-2',
          title: 'Ice Packs',
          description:
            'Apply ice packs wrapped in cloth to the perineal area for 10-20 minutes at a time during the first 24-48 hours to reduce swelling.',
          phase: 'immediate',
          icon: 'snow',
        },
        {
          id: 'v-tip-3',
          title: 'Sitz Baths',
          description:
            'After 24 hours, warm sitz baths for 15-20 minutes several times a day can promote healing and provide comfort. Add Epsom salts if desired.',
          phase: 'immediate',
          icon: 'thermometer',
        },
        {
          id: 'v-tip-4',
          title: 'Pain Management',
          description:
            'Take prescribed pain medication as directed. Ibuprofen helps with both pain and swelling. Always check with your provider about what is safe while breastfeeding.',
          phase: 'immediate',
          icon: 'medkit',
        },
        {
          id: 'v-tip-5',
          title: 'Rest & Bonding',
          description:
            'Sleep when baby sleeps. Limit visitors if needed. Focus on feeding and bonding. Accept help with household tasks.',
          phase: 'immediate',
          icon: 'moon',
        },
        {
          id: 'v-tip-6',
          title: 'Manage Lochia (Bleeding)',
          description:
            'Expect heavy, bright red bleeding for the first few days, gradually lightening over weeks. Use maternity pads — not tampons. Change pads frequently.',
          phase: 'immediate',
          icon: 'heart',
          warning:
            'Seek immediate care if you soak more than one pad per hour, pass clots larger than a golf ball, or have foul-smelling discharge.',
        },
        {
          id: 'v-tip-7',
          title: 'Stay Hydrated & Nourished',
          description:
            'Drink plenty of water (especially if breastfeeding). Eat nutrient-dense foods. Keep snacks and water within reach of your nursing/resting spot.',
          phase: 'immediate',
          icon: 'nutrition',
        },
      ],
      whenToCallDoctor: [
        'Soaking more than one pad per hour',
        'Fever above 100.4°F (38°C)',
        'Foul-smelling vaginal discharge',
        'Severe pain not relieved by medication',
        'Pain, redness, or swelling in legs',
        'Difficulty urinating or painful urination',
        'Feelings of harming yourself or your baby',
      ],
    },
    {
      id: 'v-week-2-3',
      weekRange: 'Weeks 2-3',
      title: 'Early Recovery',
      description:
        'Pain and bleeding should be decreasing. You may start feeling more like yourself, but continue to take it easy.',
      tips: [
        {
          id: 'v-tip-8',
          title: 'Gentle Movement',
          description:
            'Short walks around the house or neighborhood can boost mood and circulation. Start slowly and listen to your body.',
          phase: 'early',
          icon: 'walk',
        },
        {
          id: 'v-tip-9',
          title: 'Pelvic Floor Awareness',
          description:
            'Begin gentle Kegel exercises if comfortable. Squeeze and hold pelvic floor muscles for 5 seconds, then release. Start with 5-10 reps, 3 times daily.',
          phase: 'early',
          icon: 'fitness',
        },
        {
          id: 'v-tip-10',
          title: 'Emotional Check-In',
          description:
            'Baby blues (mood swings, crying, anxiety) are common in the first 2 weeks. If feelings intensify or persist beyond 2 weeks, talk to your provider about postpartum depression.',
          phase: 'early',
          icon: 'happy',
        },
        {
          id: 'v-tip-11',
          title: 'Stool Softeners',
          description:
            'Constipation is common postpartum. Continue stool softeners as recommended. Eat fiber-rich foods and stay hydrated.',
          phase: 'early',
          icon: 'leaf',
        },
      ],
      whenToCallDoctor: [
        'Bleeding increases or returns to bright red',
        'Signs of infection at any tear/episiotomy site',
        'Persistent feelings of sadness, hopelessness, or anxiety lasting more than 2 weeks',
        'Breast pain with redness, fever (possible mastitis)',
      ],
    },
    {
      id: 'v-week-4-6',
      weekRange: 'Weeks 4-6',
      title: 'Ongoing Recovery',
      description:
        'Most women have their postpartum checkup around 6 weeks. Bleeding should be minimal or stopped. Energy levels start improving.',
      tips: [
        {
          id: 'v-tip-12',
          title: 'Postpartum Checkup',
          description:
            'Schedule your 6-week postpartum visit. Your provider will check your healing, discuss contraception, screen for PPD, and clear you for exercise and intimacy.',
          phase: 'ongoing',
          icon: 'calendar',
        },
        {
          id: 'v-tip-13',
          title: 'Gradual Exercise Return',
          description:
            'After clearance from your provider, gradually increase activity. Walking, postpartum yoga, and swimming are good starting points. Avoid high-impact exercise until fully healed.',
          phase: 'ongoing',
          icon: 'bicycle',
        },
        {
          id: 'v-tip-14',
          title: 'Intimacy',
          description:
            'Many providers clear intimacy at 6 weeks, but there is no rush. Use lubricant as hormonal changes can cause dryness. Communicate openly with your partner.',
          phase: 'ongoing',
          icon: 'heart',
        },
        {
          id: 'v-tip-15',
          title: 'Nutrition Focus',
          description:
            'Continue eating well. Iron-rich foods help replenish blood loss. If breastfeeding, you need about 500 extra calories daily.',
          phase: 'ongoing',
          icon: 'restaurant',
        },
      ],
      whenToCallDoctor: [
        'New or worsening pain',
        'Return of heavy bleeding',
        'Pain during intimacy that does not improve',
        'Urinary incontinence that persists',
      ],
    },
    {
      id: 'v-week-7-plus',
      weekRange: 'Weeks 7-12+',
      title: 'Long-Term Recovery',
      description:
        'While the initial healing period is over, full recovery can take several months to a year. Continue prioritizing self-care.',
      tips: [
        {
          id: 'v-tip-16',
          title: 'Pelvic Floor Physical Therapy',
          description:
            'If experiencing incontinence, pelvic pain, or discomfort, ask for a referral to a pelvic floor physical therapist. This is beneficial for most postpartum women.',
          phase: 'longterm',
          icon: 'body',
        },
        {
          id: 'v-tip-17',
          title: 'Mental Health Monitoring',
          description:
            'Postpartum depression and anxiety can appear anytime in the first year. Stay connected with your support network and seek help early if needed.',
          phase: 'longterm',
          icon: 'people',
        },
        {
          id: 'v-tip-18',
          title: 'Hair & Skin Changes',
          description:
            'Postpartum hair loss typically peaks around 3-4 months. This is normal and temporary. Continue prenatal vitamins and eat a balanced diet.',
          phase: 'longterm',
          icon: 'brush',
        },
        {
          id: 'v-tip-19',
          title: 'Give Yourself Grace',
          description:
            'Recovery is not linear. Some days will be harder than others. Celebrate small victories and remember that taking care of yourself is taking care of your baby.',
          phase: 'longterm',
          icon: 'star',
        },
      ],
      whenToCallDoctor: [
        'Ongoing pelvic pain or pressure',
        'Persistent urinary or fecal incontinence',
        'Depression or anxiety symptoms at any point',
        'Pain during exercise or daily activities',
      ],
    },
  ],
  doList: [
    'Rest as much as possible — sleep when the baby sleeps',
    'Accept help from family, friends, and community',
    'Stay hydrated — keep water with you at all times',
    'Eat nutrient-dense meals and snacks',
    'Use your peri bottle after every bathroom visit',
    'Take prescribed medications on schedule',
    'Attend all postpartum appointments',
    'Talk about your feelings with someone you trust',
    'Do gentle Kegel exercises when comfortable',
    'Take short walks when ready',
  ],
  dontList: [
    'Use tampons until cleared by your provider (typically 6 weeks)',
    'Lift anything heavier than your baby for the first 2 weeks',
    'Push through pain — rest when your body tells you to',
    'Compare your recovery to others — every body is different',
    'Resume intense exercise before medical clearance',
    'Ignore signs of infection or excessive bleeding',
    'Neglect your own needs — you matter too',
    'Skip meals even when exhausted',
    'Be afraid to call your provider with concerns',
    'Put pressure on yourself to "bounce back" quickly',
  ],
};
