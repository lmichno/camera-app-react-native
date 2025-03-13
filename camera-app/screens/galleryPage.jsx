import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

const GalleryPage = () => {
    const [hasPermissions, setHasPermissions] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [columns, setColumns] = useState(3);

    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setHasPermissions(status === 'granted');
                console.log('Permissions status:', status);
            })();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            if (hasPermissions) {
                (async () => {
                    const album = await MediaLibrary.getAlbumAsync('MyAppPhotos');
                    if (album) {
                        const { assets } = await MediaLibrary.getAssetsAsync({
                            album: album.id,
                            first: 100,
                            sortBy: ['creationTime'],
                            mediaType: ['photo'],
                        });
                        setPhotos(assets);

                        if (assets.length === 0) {
                            Alert.alert('No Photos', 'No photos found in the media library.');
                        }
                    } else {
                        Alert.alert('No Album', 'No album found with the name "MyAppPhotos".');
                    }
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

    const renderItem = ({ item }) => (
        <Image source={{ uri: item.uri }} style={[styles.photo, { width: columns === 1 ? 300 : 100, height: columns === 1 ? 300 : 100 }]} />
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 10, alignItems: 'center' }}>
                <TouchableOpacity style={styles.change} onPress={() => setColumns(columns === 3 ? 1 : 3)}>
                    <Image source={require('../assets/layout.png')} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
                <Text style={styles.text}>Zdjęć: {photos.length}</Text>
                <TouchableOpacity style={styles.change} onPress={() => setColumns(columns === 3 ? 1 : 3)}>
                    <Image source={require('../assets/bin.png')} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={photos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={columns}
                key={columns}
            />
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
        padding: 12,
        width: 120,
        height: 50,
        textAlign: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 5,
    },
    photo: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 5,
    },
    change: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 5,
        width: 120,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GalleryPage;