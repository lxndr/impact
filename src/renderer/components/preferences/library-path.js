import React from 'react';

const LibraryPath = ({ value, onChange }) => {
  const handleChange = ({ target: { value } }) => {
    const paths = value.split('\n').filter(Boolean);
    onChange(paths);
  };

  const joinedValue = `${value.join('\n')}\n`;

  return <textarea value={joinedValue} onChange={handleChange} />;
};

export default LibraryPath;
