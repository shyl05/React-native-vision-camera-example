/* eslint-disable prettier/prettier */
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {Alert} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera as CameraVision,
  useCameraDevices,
} from 'react-native-vision-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import PhotoPreview from '../PhotoPreview';

import * as S from './styles';
import ImageViewer from '../ImageViewer';
import {
  HandlerStateChangeEvent,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import CircleFocus from '../CircleFocus';

const ReanimatedCamera = Animated.createAnimatedComponent(CameraVision);
Animated.addWhitelistedNativeProps({
  zoom: true,
});

function Camera() {
  const camera = useRef(null);

  const [torchActive, setTorchActive] = useState(false);
  const [frontCamera, setFrontCamera] = useState(false);
  const [permissionResult, setPermissionResult] = useState('denied');
  const [photos, setPhotos] = useState([]);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [focusCoords, setFocusCoords] = useState({x: 0, y: 0});

  const availableDevices = useCameraDevices();

  // Check all cameras

  /* const currentDevice =
     frontCamera && availableDevices?.front
       ? availableDevices.front
      : availableDevices?.back; */

  const currentDevice = availableDevices.back;

  const zoom = useSharedValue(0);

  const takePhoto = useCallback(async () => {
    try {
      const result = await camera.current.takePhoto();
      console.log(result);
      if (result) {
        setPhotos(prevPhotos => [...prevPhotos, result]);
        console.log(result);
      }
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  },[]);

  const flipCamera = () => setFrontCamera(prevState => !prevState);
  const toggleTorch = () => setTorchActive(prevState => !prevState);
  const handleOpenImageViewer = () => {
    if (photos.length > 0) {
      setShowImageViewer(true);
    }
  };

  useEffect(() => {
    async function getPermission() {
      try {
        const cameraPermission = await CameraVision.requestCameraPermission();

        setPermissionResult(cameraPermission);
      } catch (error) {
        Alert.alert(
          'Allow Camera Permission',
        );
      }
    }

    getPermission();
  }, []);

  const animatedProps = useAnimatedProps(
    () => ({zoom: zoom.value}),
    [zoom],
  );

  const gestureTapToFocus = (event,) => {
    setFocusCoords({
      x: event.nativeEvent.x,
      y: event.nativeEvent.y,
    });

    camera.current?.focus({
      x: Math.floor(event.nativeEvent.x),
      y: Math.floor(event.nativeEvent.y),
    });
  };

  if (!currentDevice) {
    return null;
  }

  if (permissionResult === 'denied') {
    return null;
  }

  return (
    <S.Container>
      <TapGestureHandler onHandlerStateChange={gestureTapToFocus}>
        <ReanimatedCamera
          ref={camera}
          // style={StyleSheet.absoluteFill}
          style={{flex: 1}}
          device={currentDevice}
          isActive={true}
          photo={true}
          torch={torchActive ? 'on' : 'off'}
          enableZoomGesture
          animatedProps={animatedProps}
        />
      </TapGestureHandler>

      <S.Buttons>
        <S.Button onPress={handleOpenImageViewer}>
          {photos.length > 0 ? (
            <S.WrapperImage>
              <PhotoPreview
                photo={`file://${photos[photos.length - 1].path}`}
              />
            </S.WrapperImage>
          ) : (
            <MaterialIcons name="image-not-supported" size={24} color="black" />
          )}
        </S.Button>
        <S.Button onPress={takePhoto}>
          <MaterialIcons name="camera-alt" size={24} color="black" />
        </S.Button>
        <S.Button onPress={flipCamera}>
          {frontCamera ? (
            <MaterialIcons name="camera-rear" size={24} color="black" />
          ) : (
            <MaterialIcons name="camera-front" size={24} color="black" />
          )}
        </S.Button>
      </S.Buttons>

      <S.ButtonsFloatings>
        <S.ButtonFloating onPress={toggleTorch}>
          {torchActive ? (
            <MaterialIcons name="flash-on" size={24} color="black" />
          ) : (
            <MaterialIcons name="flash-off" size={24} color="black" />
          )}
        </S.ButtonFloating>
      </S.ButtonsFloatings>

      <CircleFocus x={focusCoords.x} y={focusCoords.y} />

      <ImageViewer
        images={photos.map(p => ({uri: `file://${p.path}`}))}
        isVisible={showImageViewer}
        handleClose={() => setShowImageViewer(false)}
        imageIndex={photos.length - 1}
      />
    </S.Container>
  );
}

export default Camera;
