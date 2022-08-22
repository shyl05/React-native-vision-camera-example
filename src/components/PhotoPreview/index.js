/* eslint-disable prettier/prettier */
import React from 'react';

import * as S from './styles';

const PhotoPreview = ({photo}) => {
  return <S.Photo source={{uri: photo}} />;
};

export default PhotoPreview;
