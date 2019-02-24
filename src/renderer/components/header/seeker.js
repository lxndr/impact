import React from 'react';

/**
 * @callback SeekCallback
 * @param {number} position
 * @returns {void}
 */

/**
 * @param {object} props
 * @param {number} props.duration
 * @param {number} props.position
 * @param {SeekCallback} props.onSeek
 */
const Seeker = ({ duration, position, onSeek }) => {
  /** @type {React.MouseEventHandler<HTMLDivElement>} */
  const handleClick = ({ currentTarget, clientX }) => {
    const width = currentTarget.clientWidth;
    const pos = clientX - currentTarget.offsetLeft;
    const f = pos / width;
    onSeek(duration * f);
  };

  /** @type {React.KeyboardEventHandler<HTMLDivElement>} */
  const handleKeyDown = ({ key, shiftKey }) => {
    const delta = shiftKey ? 5 : 1;

    switch (key) {
      case 'ArrowLeft':
        onSeek(position - delta);
        break;
      case 'ArrowRight':
        onSeek(position + delta);
        break;
      default:
        break;
    }
  };

  const right = 100 - ((position / duration) * 100);

  /** @type {React.CSSProperties} */
  const style = {
    position: 'absolute',
    top: 0,
    right: `${right}%`,
    bottom: 0,
    left: 0,
  };

  return (
    <div
      className="seeker"
      role="slider"
      aria-valuemax={duration}
      aria-valuemin={0}
      aria-valuenow={position}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="poser" style={style} />
    </div>
  );
};

export default Seeker;
