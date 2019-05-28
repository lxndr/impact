const maxLetters = 3;

/**
 * @param {string} title
 * @returns {string}
 */
const createCollectionAbbreviation = (title) => {
  const words = title.toUpperCase().split(' ').filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const firstWord = words[0];

  if (words.length === 1) {
    return firstWord.slice(0, 3);
  }

  if (firstWord.length <= maxLetters) {
    return firstWord;
  }

  return words
    .slice(0, Math.max(maxLetters, words.length))
    .map(word => word[0])
    .join('');
};

export default createCollectionAbbreviation;
