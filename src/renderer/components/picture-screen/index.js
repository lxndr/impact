import React, { useState, useEffect } from 'react';
import globby from 'globby';
import style from '../../style';

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const PictureScreen = () => {
  const [image, setImage] = useState('');

  useEffect(() => {
    let intervalId;

    globby(['/run/media/lxndr/BAK01']).then((files) => {
      const showNextImage = () => {
        const idx = getRandomInt(files.length);
        const image = files[idx];
        setImage(`file://${image}`);
      };

      showNextImage();
      intervalId = setInterval(showNextImage, 5000);
    });

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={style('picture-screen')}>
      <img alt="" src={image} />
    </div>
  );
};

export default PictureScreen;
