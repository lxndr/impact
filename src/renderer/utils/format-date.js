import moment from 'moment';

/**
 * @param {string} str
 */
const formatDate = (str) => {
  if (!str) {
    return null;
  }

  const [year, month, day] = str.split('-');
  const date = moment([year, Number(month) - 1, day]);

  if (!date.isValid()) {
    return null;
  }

  if (day) {
    return date.format('D MMM YYYY');
  }

  if (month) {
    return date.format('MMM YYYY');
  }

  return year;
};

export default formatDate;
