import defaultTheme from './themes/default/index.less';

const styles = {
  default: defaultTheme,
};

const currentTheme = 'default';

/**
 * @param {string} name
 */
const style = name => styles[currentTheme][name];

export default style;
