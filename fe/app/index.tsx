import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image,
  useWindowDimensions, 
  ImageSourcePropType,
  ViewToken,
  ListRenderItem
} from 'react-native';
import { useRouter } from 'expo-router';
import slides from '../data/carouselData';
import Button from '../components/ui/button';

// Interface for Slide Item
interface SlideItem {
  id: string;
  description: string;
  image?: ImageSourcePropType; 
}

// Onboarding Screen Component
export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Flatlist Ref
  const slidesRef = useRef<FlatList<SlideItem>>(null);

  // Viewable Items Changed Handler
  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Viewability Config
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Render Item for FlatList
  const renderItem: ListRenderItem<SlideItem> = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageContainer}>
         <Text style={{fontSize: 50}}>🖼️</Text>
      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>
    
      {/* Paginator Dots */}
      <View style={styles.paginator}>
        {slides.map((_, index) => {
          return (
            <View
              key={index.toString()}
              style={[
                styles.dot,
                { width: index === currentIndex ? 20 : 10, opacity: index === currentIndex ? 1 : 0.3 }
              ]}
            />
          );
        })}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button title='Get Started' onPress={() => router.replace('/signin')}></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
    overflow: 'hidden',
    padding: 20,
  },
  description: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: '#edaa18',
    textAlign: 'center',
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#edaa18',
    marginHorizontal: 8,
  },
  buttonContainer: {
    marginBottom: 50,
    paddingHorizontal: 20,
    width: '100%',
  },
});