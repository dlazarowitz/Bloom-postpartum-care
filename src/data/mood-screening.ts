import { PPDScreeningQuestion } from '../types';

// Based on the Edinburgh Postnatal Depression Scale (EPDS)
// This is a screening tool only — NOT a diagnostic instrument.
// A high score indicates need for professional evaluation.
export const epdsQuestions: PPDScreeningQuestion[] = [
  {
    id: 'epds-1',
    question: 'I have been able to laugh and see the funny side of things.',
    options: [
      { label: 'As much as I always could', score: 0 },
      { label: 'Not quite so much now', score: 1 },
      { label: 'Definitely not so much now', score: 2 },
      { label: 'Not at all', score: 3 },
    ],
  },
  {
    id: 'epds-2',
    question: 'I have looked forward with enjoyment to things.',
    options: [
      { label: 'As much as I ever did', score: 0 },
      { label: 'Rather less than I used to', score: 1 },
      { label: 'Definitely less than I used to', score: 2 },
      { label: 'Hardly at all', score: 3 },
    ],
  },
  {
    id: 'epds-3',
    question: 'I have blamed myself unnecessarily when things went wrong.',
    options: [
      { label: 'No, never', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, some of the time', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 'epds-4',
    question: 'I have been anxious or worried for no good reason.',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, very often', score: 3 },
    ],
  },
  {
    id: 'epds-5',
    question: 'I have felt scared or panicky for no very good reason.',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'No, not much', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, quite a lot', score: 3 },
    ],
  },
  {
    id: 'epds-6',
    question: 'Things have been getting on top of me.',
    options: [
      { label: 'No, I have been coping as well as ever', score: 0 },
      { label: 'No, most of the time I have coped quite well', score: 1 },
      { label: 'Yes, sometimes I haven\'t been coping as well as usual', score: 2 },
      { label: 'Yes, most of the time I haven\'t been able to cope at all', score: 3 },
    ],
  },
  {
    id: 'epds-7',
    question: 'I have been so unhappy that I have had difficulty sleeping.',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 'epds-8',
    question: 'I have felt sad or miserable.',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 'epds-9',
    question: 'I have been so unhappy that I have been crying.',
    options: [
      { label: 'No, never', score: 0 },
      { label: 'Only occasionally', score: 1 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 'epds-10',
    question: 'The thought of harming myself has occurred to me.',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Sometimes', score: 2 },
      { label: 'Yes, quite often', score: 3 },
    ],
  },
];

export function getScreeningRecommendation(totalScore: number): string {
  if (totalScore <= 8) {
    return 'Your score suggests low likelihood of postpartum depression. Continue monitoring your mood and reach out to your provider if things change.';
  }
  if (totalScore <= 12) {
    return 'Your score suggests possible postpartum depression. We recommend discussing your feelings with your healthcare provider at your next visit, or sooner if you feel it would help.';
  }
  return 'Your score suggests a higher likelihood of postpartum depression. Please reach out to your healthcare provider soon to discuss how you are feeling. You are not alone, and effective help is available.';
}

export const emergencyResources = {
  crisis: {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Call or text 988 for immediate crisis support, 24/7.',
  },
  postpartum: {
    name: 'Postpartum Support International Helpline',
    phone: '1-800-944-4773',
    text: 'Text 503-894-9453',
    description: 'Call or text for postpartum depression and anxiety support. English & Spanish.',
  },
  crisis_text: {
    name: 'Crisis Text Line',
    text: 'Text HOME to 741741',
    description: 'Free, 24/7 crisis support via text message.',
  },
};
