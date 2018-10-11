import store from './store';
import defaultTheme from './themes/default/index.less';

const styles = {
  default: defaultTheme,
};

const style = name => styles[store.config.theme][name];

export default style;
