import moment from 'moment';

const re = /(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/;

/**
 * @param {string} str
 */
const formatDate = (str) => {
  if (!str) {
    return null;
  }

  const match = str.match(re);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  if (day) {
    const date = moment([year, Number(month) - 1, day]);
    return date.format('D MMM YYYY');
  }

  if (month) {
    const date = moment([year, Number(month) - 1]);
    return date.format('MMM YYYY');
  }

  return year;
};

export default formatDate;
