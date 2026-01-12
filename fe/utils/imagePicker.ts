/**
 * Image Picker Utility
 * Handles picking images from camera roll or taking photos for certificates
 */

import * as ImagePicker from 'expo-image-picker';
import { ImageSource } from '@/types/certificate';

export interface ImagePickerResult {
  success: boolean;
  imageSource?: ImageSource;
  error?: string;
}

/**
 * Request camera roll permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick an image from the device's media library
 */
export const pickImageFromLibrary = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Media library permission denied',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'Image selection cancelled',
      };
    }

    const asset = result.assets[0];
    const fileName = asset.uri.split('/').pop() || `certificate_${Date.now()}.jpg`;
    const fileType = asset.mimeType || 'image/jpeg';

    return {
      success: true,
      imageSource: {
        uri: asset.uri,
        type: fileType,
        name: fileName,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pick image',
    };
  }
};

/**
 * Take a photo using the device camera
 */
export const takePhoto = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Camera permission denied',
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'Photo capture cancelled',
      };
    }

    const asset = result.assets[0];
    const fileName = `certificate_photo_${Date.now()}.jpg`;
    const fileType = asset.mimeType || 'image/jpeg';

    return {
      success: true,
      imageSource: {
        uri: asset.uri,
        type: fileType,
        name: fileName,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to take photo',
    };
  }
};

/**
 * Pick a document (PDF, etc.) - useful for existing certificates
 */
export const pickDocument = async (): Promise<ImagePickerResult> => {
  try {
    // For documents, we'll use expo-document-picker which is already in dependencies
    const DocumentPicker = await import('expo-document-picker');
    
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'Document selection cancelled',
      };
    }

    const asset = result.assets[0];
    
    return {
      success: true,
      imageSource: {
        uri: asset.uri,
        type: asset.mimeType || 'application/octet-stream',
        name: asset.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pick document',
    };
  }
};
