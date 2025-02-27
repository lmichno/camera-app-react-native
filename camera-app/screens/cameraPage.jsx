import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraPage = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('facing');
    const [cameraReady, setCameraReady] = useState(false);
    const cameraRef = useRef(null);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (permission?.granted) {
            setCameraReady(true);
        }
    }, [permission?.granted]);

    if (!permission) {
        return <View style={styles.container}><Text style={styles.text}>Permissions not present</Text></View>;
    }

    if (!permission.granted) {
        return <View style={styles.container}><Text style={styles.text}>Camera permission is required</Text></View>;
    }

    return (
        <View style={styles.container}>
            {cameraReady && (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    type={facing}
                >
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity onPress={() => setFacing(facing === 'back' ? 'facing' : 'back')}>
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Flip Camera</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
        </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    button: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CameraPage;