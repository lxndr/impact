let gst = null;

try {
  gst = require('../../build/Debug/gst.node');
} catch (err) {
  gst = require('../../build/Release/gst.node');
}

export const Player = gst.Player;
