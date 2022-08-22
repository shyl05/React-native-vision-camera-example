/* eslint-disable prettier/prettier */
import React from 'react';
import ImageView from 'react-native-image-viewing';

const ImageViewer = ({
  images,
  isVisible,
  handleClose,
  imageIndex,
}) => {
  return (
    <ImageView
      images={images}
      imageIndex={imageIndex}
      visible={isVisible}
      onRequestClose={handleClose}
    />
  );
};

export default ImageViewer;
