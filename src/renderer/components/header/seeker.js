import React from 'react';
import { backend, useBehaviorSubject } from '../../services';

/**
 * @callback SeekCallback
 * @param {number} position
 * @returns {void}
 */

/**
 * @param {object} props
 * @param {number} props.duration
 */
const Seeker = ({ duration }) => {
  const position = useBehaviorSubject(backend.playback.position$);

  /** @param {number} pos */
  const handleSeek = (pos) => {
    backend.playback.seek(pos);
  };

  /** @type {React.MouseEventHandler<HTMLDivElement>} */
  const handleClick = ({ currentTarget, clientX }) => {
    const width = currentTarget.clientWidth;
    const pos = clientX - currentTarget.offsetLeft;
    const f = pos / width;
    handleSeek(duration * f);
  };

  /** @type {React.KeyboardEventHandler<HTMLDivElement>} */
  const handleKeyDown = ({ key, shiftKey }) => {
    const delta = shiftKey ? 5 : 1;

    switch (key) {
      case 'ArrowLeft':
        handleSeek(position - delta);
        break;
      case 'ArrowRight':
        handleSeek(position + delta);
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
