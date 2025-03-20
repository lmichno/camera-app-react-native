import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

const GalleryPage = ({ navigation }) => {
    const [hasPermissions, setHasPermissions] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [columns, setColumns] = useState(3);
    const [deleteOn, setDeleteOn] = useState(false);
    const [selected, setSelected] = useState([]);

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

    const handleClick = async (item) => {
        if (deleteOn) {
            if (selected.includes(item)) {
                let newSelected = selected.filter(photo => photo !== item);
                setSelected(newSelected);
            } else {
                let newSelected = [...selected, item];
                setSelected(newSelected);
            }
        } else {
            navigation.navigate('Photo', { photo: item });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleClick(item)}>
            <View style={[styles.photoContainer, { width: columns === 1 ? 350 : 117, height: columns === 1 ? 300 : 117 }]}>
                <Image source={{ uri: item.uri }} style={styles.photo} />
                {selected.includes(item) && (
                    <View style={styles.overlay}>
                        <Image source={require('../assets/check.png')} style={styles.checkIcon} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 10, alignItems: 'center' }}>
                <TouchableOpacity style={styles.change} onPress={() => setColumns(columns === 3 ? 1 : 3)}>
                    <Image source={require('../assets/layout.png')} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
                <Text style={styles.text}>Zdjęć: {photos.length}</Text>
                <TouchableOpacity style={[styles.change, { backgroundColor: deleteOn ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)" }]} onPress={() => { setDeleteOn(!deleteOn), setSelected([]) }}>
                    <Image source={require('../assets/selection.png')} style={{ width: 30, height: 30, tintColor: deleteOn ? "rgb(230,230,230)" : "rgb(0,0,0)" }} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={photos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={columns}
                key={columns}
            />
            {deleteOn && selected.length > 0 && (
                <View>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: -170,
                            bottom: 20,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: 15,
                            borderRadius: 50,
                            elevation: 20

                        }}
                        onPress={async () => {
                            await MediaLibrary.deleteAssetsAsync(selected.map(photo => photo.id));
                            setPhotos(photos.filter(photo => !selected.includes(photo)));
                            setSelected([]);
                            setDeleteOn(false);
                        }}
                    >
                        <Image source={require('../assets/bin.png')} style={{ width: 30, height: 30, tintColor: 'white' }} />
                    </TouchableOpacity>
                </View>
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
        padding: 12,
        width: 120,
        height: 50,
        textAlign: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 5,
    },
    photoContainer: {
        margin: 5,
        borderRadius: 5,
        overflow: 'hidden',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIcon: {
        width: 30,
        height: 30,
        tintColor: 'white',
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