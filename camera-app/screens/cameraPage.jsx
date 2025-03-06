import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, useAnimatedValue } from 'react-native';
import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

const CameraPage = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [cameraReady, setCameraReady] = useState(false);
    const cameraRef = useRef(null);
    const rotateAnim = useAnimatedValue(0);

    useFocusEffect(
        React.useCallback(() => {
            if (!permission) {
                requestPermission();
            } else if (permission?.granted) {
                setCameraReady(true);
            }
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

    const handleTakePhoto = async () => {
        if (cameraRef.current) {
            let photo = await cameraRef.current.takePictureAsync();
            await MediaLibrary.createAssetAsync(photo.uri);
            setPhoto(photo);
        }
    }

    const handleGallery = () => {
        navigation.navigate('Gallery');
    }

    return (
        <View style={styles.container}>
            {cameraReady && (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                >
                    <View style={styles.cameraOverlay}>
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
            )
            }
        </View >
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
});

export default CameraPage;