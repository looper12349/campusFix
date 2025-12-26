import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createIssue } from '../store/issuesSlice';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../theme';
import { Category } from '../types';
import { IssuesStackParamList } from '../navigation/StudentNavigator';

type NavigationProp = StackNavigationProp<IssuesStackParamList, 'CreateIssue'>;

const CreateIssueScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.issues);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [image, setImage] = useState<any>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
  }>({});

  const categories: Category[] = ['Electrical', 'Water', 'Internet', 'Infrastructure'];

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const issueData: any = {
        title: title.trim(),
        description: description.trim(),
        category: category!,
      };

      if (image) {
        // Create a file-like object for the image
        const imageFile = {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `image_${Date.now()}.jpg`,
        };
        issueData.image = imageFile;
      }

      const result = await dispatch(createIssue(issueData));

      if (createIssue.fulfilled.match(result)) {
        Alert.alert('Success', 'Issue created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.payload as string || 'Failed to create issue');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Issue Details</Text>

      <Input
        label="Title"
        placeholder="Brief description of the issue"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (errors.title) setErrors({ ...errors, title: undefined });
        }}
        error={errors.title}
      />

      <Input
        label="Description"
        placeholder="Provide detailed information about the issue"
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          if (errors.description) setErrors({ ...errors, description: undefined });
        }}
        error={errors.description}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryOptions}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryOption,
                category === cat && styles.categoryOptionActive,
              ]}
              onPress={() => {
                setCategory(cat);
                if (errors.category) setErrors({ ...errors, category: undefined });
              }}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  category === cat && styles.categoryOptionTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.label}>Image (Optional)</Text>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>Tap to add image</Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        title="Submit Issue"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  categoryContainer: {
    marginBottom: theme.spacing.sm,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  categoryOption: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  categoryOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
  },
  categoryOptionTextActive: {
    color: theme.colors.background,
    fontWeight: '600',
  },
  errorText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.error,
    marginTop: theme.spacing.xs / 2,
  },
  imageContainer: {
    marginBottom: theme.spacing.md,
  },
  imagePicker: {
    height: 150,
    borderRadius: theme.borderRadius.small,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  imagePickerIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  imagePickerText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.small,
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.card,
  },
  removeImageText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});

export default CreateIssueScreen;
