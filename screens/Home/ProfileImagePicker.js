import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileImagePicker = ({ size = 100, onImageChange }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadSavedImage();
    
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permission Required', 'Camera and media library permissions are needed to use this feature.');
        }
      }
    })();
  }, []);

  const loadSavedImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setImage(savedImage);
        // Also notify parent component if callback exists
        if (onImageChange) {
          onImageChange(savedImage);
        }
      }
    } catch (error) {
      console.error('Failed to load profile image', error);
    }
  };

  const saveImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setImage(imageUri);
      // Notify parent component if callback exists
      if (onImageChange) {
        onImageChange(imageUri);
      }
    } catch (error) {
      console.error('Failed to save profile image', error);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Select from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Compress and crop the image
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        await saveImage(manipResult.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Compress and crop the image
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        await saveImage(manipResult.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]} 
      onPress={showImageSourceOptions}
    >
      {image ? (
        <Image 
          source={{ uri: image }} 
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} 
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <TouchableOpacity 
  style={styles.cameraButton} 
  onPress={showImageSourceOptions}
  activeOpacity={0.7}
>
  <Camera size={24} color="#ffffff" strokeWidth={2} />
</TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 15, // Added to maintain spacing below the image
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  // Update the cameraButton style in the StyleSheet:
  cameraButton: {
    position: 'absolute',
    backgroundColor: 'rgba(24, 119, 242, 0.85)', // Semi-transparent blue
    width: 44, // Smaller, more professional size
    height: 44, // Smaller, more professional size
    borderRadius: 22, // Half of the width/height
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    bottom: 8,
    right: 8,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 5,
  }
});

export default ProfileImagePicker;