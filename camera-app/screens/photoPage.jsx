import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';


const PhotoPage = ({ route, navigation }) => {
    const [hasPermissions, setHasPermissions] = useState(null);
    const [photos, setPhotos] = useState([]);
    const photo = route.params.photo;


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

    let share = async () => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }
            await Sharing.shareAsync(photo.uri);
        } catch (error) {
            console.error('Error sharing photo:', error);
            Alert.alert('Error', 'An error occurred while sharing the photo.');
        }
    }

    let deletePhoto = async () => {
        try {
            await MediaLibrary.deleteAssetsAsync([photo]);
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting photo:', error);
            Alert.alert('Error', 'An error occurred while deleting the photo.');
        }
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: photo.uri }} resizeMode={'cover'} style={[styles.photo, { width: "100%", height: "100%" }]} />
            <Text style={styles.resolutionText}>
                Resolution: {photo.width} x {photo.height}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 350, position: 'absolute', bottom: 20 }}>
                <TouchableOpacity style={styles.change} onPress={() => share()}>
                    <Image source={require('../assets/share.png')} style={{ width: 30, height: 30, tintColor: 'rgb(230, 230, 230)' }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.change} onPress={() => deletePhoto()}>
                    <Image source={require('../assets/bin.png')} style={{ width: 30, height: 30, tintColor: 'rgb(230, 230, 230)' }} />
                </TouchableOpacity>
            </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 100,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resolutionText: {
        position: 'absolute',
        top: 20,
        left: 20,
        fontSize: 16,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 5,
        borderRadius: 5,
    },
});

export default PhotoPage;