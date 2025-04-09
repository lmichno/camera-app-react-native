import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RadioGroup = ({ title, options, columns = 1, selectedValue, onChange }) => {
    const [internalValue, setInternalValue] = useState(selectedValue || options[0]?.value);

    const handlePress = (value) => {
        setInternalValue(value);
        if (onChange) {
            onChange(value);
        }
    };

    React.useEffect(() => {
        if (selectedValue !== undefined) {
            setInternalValue(selectedValue);
        }
    }, [selectedValue]);

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={[styles.radioGroup, { flexDirection: columns > 1 ? 'row' : 'column', flexWrap: 'wrap' }]}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.radioButton, { width: `${100 / columns}%` }]}
                        onPress={() => handlePress(option.value)}
                    >
                        <View style={styles.radioCircle}>
                            {internalValue === option.value && <View style={styles.radioSelected} />}
                        </View>
                        <Text style={styles.radioLabel}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    radioGroup: {
        flexDirection: 'column',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#000',
    },
    radioLabel: {
        fontSize: 14,
    },
});

export default RadioGroup;