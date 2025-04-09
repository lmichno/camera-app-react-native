import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, useAnimatedValue, Alert } from 'react-native';
import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RadioGroup from '../modules/RadioGroup';

const CameraPage = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [cameraReady, setCameraReady] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [flashMode, setFlashMode] = useState(false);
    const [ratio, setRatio] = useState('16:9');
    const [pictureSize, setPictureSize] = useState('1920x1080');
    const [location, setLocation] = useState(null);
    const cameraRef = useRef(null);
    const rotateAnim = useAnimatedValue(0);
    const bottomSheetRef = useRef(null);

    useFocusEffect(
        React.useCallback(() => {
            if (!permission) {
                requestPermission();
            } else if (permission?.granted) {
                setCameraReady(true);
            }
            // Ustawienie domyślnych wartości dla RadioGroup
            setFacing('back');
            setZoom(0);
            setFlashMode(false);
            setRatio('16:9');
            setPictureSize('1920x1080');

            const getLocationPermission = async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const currentLocation = await Location.getCurrentPositionAsync({});
                    setLocation(currentLocation);
                }
            };
            getLocationPermission();
        }, [permission?.granted])
    );

    if (!permission) {
        return <View style={styles.container}><Text style={styles.text}>Permissions not present</Text></View>;
    }

    if (!permission.granted) {
        return <View style={styles.container}><Text style={styles.text}>Camera permission is required</Text></View>;
    }

    const handleSwitchCamera = () => {
        setFacing(facing === 'back' ? 'front' : 'back');
        Animated.timing(rotateAnim, {
            toValue: rotateAnim._value === 0 ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const savePhotoWithLocation = async (photoWithLocation) => {
        try {
            const storedPhotos = await AsyncStorage.getItem('photos');
            const photos = storedPhotos ? JSON.parse(storedPhotos) : [];
            photos.push(photoWithLocation);
            await AsyncStorage.setItem('photos', JSON.stringify(photos));
        } catch (error) {
            Alert.alert('Error', 'Failed to save photo with location.');
        }
    };

    const handleTakePhoto = async () => {
        if (cameraRef.current) {
            try {
                let photo = await cameraRef.current.takePictureAsync();

                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission required', 'Media library permission is required to save photos.');
                    return;
                }

                const asset = await MediaLibrary.createAssetAsync(photo.uri);
                const album = await MediaLibrary.getAlbumAsync('MyAppPhotos');

                if (album) {
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
                } else {
                    await MediaLibrary.createAlbumAsync('MyAppPhotos', asset, false);
                }

                if (location) {
                    const photoWithLocation = {
                        uri: photo.uri,
                        location: {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        },
                    };
                    await savePhotoWithLocation(photoWithLocation);
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while taking the photo.');
            }
        }
    }

    const handleGallery = () => {
        navigation.navigate('Gallery');
    }

    const handleMapNavigation = () => {
        navigation.navigate('Map');
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {cameraReady && (
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                        zoom={zoom}
                        enableTorch={flashMode}
                        // ratio={ratio}
                        pictureSize={pictureSize}
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.mapButton} onPress={handleMapNavigation}>
                                <Text style={styles.mapButtonText}>Map</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                                <TouchableOpacity onPress={handleGallery}>
                                    <Animated.View style={[styles.switchCameraButton]}>
                                        <Image source={require('../assets/image.png')} style={styles.switchCamera} />
                                    </Animated.View>
                                </TouchableOpacity>
                                <View style={{ width: 10 }}></View>
                                <TouchableOpacity onPress={handleTakePhoto}>
                                    <Animated.View style={[styles.takePhotoButton]}>
                                        <View style={styles.takePhoto}></View>
                                    </Animated.View>
                                </TouchableOpacity>
                                <View style={{ width: 10 }}></View>
                                <TouchableOpacity onPress={handleSwitchCamera}>
                                    <Animated.View style={[styles.switchCameraButton, { transform: [{ rotate }] }]}>
                                        <Image source={require('../assets/reload.png')} style={styles.switchCamera} />
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                )}
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={['5%', '50%', '90%']}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <RadioGroup
                        title="Camera Zoom"
                        options={[
                            { label: '0.5x', value: 0 },
                            { label: '1x', value: 0.5 },
                            { label: '2x', value: 1 }
                        ]}
                        selectedValue={zoom}
                        onChange={setZoom}
                        columns={3}
                    />
                    <RadioGroup
                        title="Flash Mode"
                        options={[
                            { label: 'Off', value: false },
                            { label: 'On', value: true }
                        ]}
                        selectedValue={flashMode}
                        onChange={setFlashMode}
                        columns={4}
                    />
                    {/* <RadioGroup
                        title="Camera Ratio"
                        options={[
                            { label: '16:9', value: '16:9' },
                            { label: '18:9', value: '18:9' },
                            { label: '4:3', value: '4:3' },
                            { label: '1:1', value: '1:1' },
                        ]}
                        selectedValue={ratio}
                        onChange={setRatio}
                        columns={4}
                    /> */}
                    <RadioGroup
                        title="Picture Size"
                        options={[
                            { label: '1920x1080', value: '1920x1080' },
                            { label: '1280x720', value: '1280x720' },
                            { label: '640x480', value: '640x480' },
                        ]}
                        selectedValue={pictureSize}
                        onChange={setPictureSize}
                        columns={3}
                    />
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 50
    },
    switchCameraButton: {
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 100,
        borderWidth: 2,
    },
    switchCamera: {
        width: 25,
        height: 25,
    },
    takePhotoButton: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 100,
        borderWidth: 2,
    },
    takePhoto: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 100,
        width: 90,
        height: 90,
    },
    mapButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 5,
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CameraPage;