/**
 * Converts numbers to Indian Currency Words (Crores, Lakhs, Thousands, Hundreds, Rupees, Paise)
 * Standard Tally GST invoice format: "INR Twenty Four Thousand Eight Hundred Fifty Six Only"
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertTwoDigits(num: number): string {
  if (num < 20) {
    return ONES[num];
  }
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return TENS[ten] + (one > 0 ? ' ' + ONES[one] : '');
}

function convertThreeDigits(num: number): string {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let result = '';
  if (hundred > 0) {
    result += ONES[hundred] + ' Hundred';
    if (remainder > 0) {
      result += ' ';
    }
  }
  if (remainder > 0) {
    result += convertTwoDigits(remainder);
  }
  return result;
}

export function numberToWordsINR(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'INR Zero Only';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let words = '';

  // Indian numbering: Crores (> 1,00,00,000), Lakhs (> 1,00,000), Thousands (> 1,000), Hundreds (> 100)
  const crore = Math.floor(rupees / 10000000);
  const remainderAfterCrore = rupees % 10000000;

  const lakh = Math.floor(remainderAfterCrore / 100000);
  const remainderAfterLakh = remainderAfterCrore % 100000;

  const thousand = Math.floor(remainderAfterLakh / 1000);
  const remainderAfterThousand = remainderAfterLakh % 1000;

  const hundreds = remainderAfterThousand;

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }

  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }

  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }

  if (hundreds > 0) {
    words += convertThreeDigits(hundreds) + ' ';
  }

  words = words.trim();
  if (!words) {
    words = 'Zero';
  }

  let finalString = `INR ${words} Rupees`;

  if (paise > 0) {
    finalString += ` and ${convertTwoDigits(paise)} Paise`;
  }

  finalString += ' Only';

  if (isNegative) {
    finalString = 'Minus ' + finalString;
  }

  return finalString;
}

export function taxAmountToWordsINR(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'INR Zero Only';
  }
  return numberToWordsINR(amount);
}
