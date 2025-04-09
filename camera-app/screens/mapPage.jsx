import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

const MapPage = ({ route }) => {
    const [photoLocations, setPhotoLocations] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const bottomSheetRef = React.useRef(null);

    useEffect(() => {
        const fetchPhotoLocations = async () => {
            try {
                const storedPhotos = await AsyncStorage.getItem('photos');
                const photos = storedPhotos ? JSON.parse(storedPhotos) : [];
                setPhotoLocations(photos);
            } catch (error) {
                Alert.alert('Error', 'Failed to load photo locations.');
            }
        };
        fetchPhotoLocations();
    }, []);

    const handleMarkerPress = (location) => {
        const nearbyPhotos = photoLocations.filter(photo => {
            const distance = Math.sqrt(
                Math.pow(photo.location.latitude - location.latitude, 2) +
                Math.pow(photo.location.longitude - location.longitude, 2)
            );
            return distance < 0.001; // Adjust this threshold for "nearby" photos
        });
        setSelectedPhotos(nearbyPhotos);
        bottomSheetRef.current?.expand();
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={{
                latitude: photoLocations[0]?.location.latitude || 37.78825,
                longitude: photoLocations[0]?.location.longitude || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}>
                {photoLocations.map((photo, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: photo.location.latitude,
                            longitude: photo.location.longitude,
                        }}
                        title={`Photo ${index + 1}`}
                        onPress={() => handleMarkerPress(photo.location)}
                    />
                ))}
            </MapView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['5%', '40%']}
            >
                <BottomSheetFlatList
                    data={selectedPhotos}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    contentContainerStyle={styles.bottomSheetContent}
                    renderItem={({ item }) => (
                        <View style={styles.photoContainer}>
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.photo}
                            />
                            <Text style={styles.photoLocation}>
                                {`Lat: ${item.location.latitude.toFixed(5)}, Lng: ${item.location.longitude.toFixed(5)}`}
                            </Text>
                        </View>
                    )}
                />
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    bottomSheetContent: {
        paddingHorizontal: 10,
    },
    photoContainer: {
        marginHorizontal: 10,
        alignItems: 'center',
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    photoLocation: {
        marginTop: 5,
        fontSize: 14,
        color: '#555',
    },
});

export default MapPage;
