import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

const GalleryPage = () => {
    const [hasPermissions, setHasPermissions] = useState(null);
    const [photos, setPhotos] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setHasPermissions(status === 'granted');
            })();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            if (hasPermissions) {
                (async () => {
                    const { assets } = await MediaLibrary.getAssetsAsync({
                        first: 100,
                        mediaType: ['photo'],
                    });
                    setPhotos(assets);
                    Alert.alert('Photos', JSON.stringify(assets, null, 2));
                })();
            }
        }, [hasPermissions])
    );

    if (hasPermissions === null) {
        return <View style={styles.container}><Text style={styles.text}>Checking permissions...</Text></View>;
    }

    if (!hasPermissions) {
        return <View style={styles.container}><Text style={styles.text}>Media library permission is required</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text>Gallery Page</Text>
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
});

export default GalleryPage;