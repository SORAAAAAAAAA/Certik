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
  ListRenderItem,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import slides from '../data/carouselData';

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
  const scrollX = useRef(new Animated.Value(0)).current;

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
      <View style={styles.slideContent}>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>Certik</Text>
          </View>
        </View>

        {/* Slides */}
        <View style={styles.slidesContainer}>
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
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            ref={slidesRef}
          />
        </View>

        {/* Paginator */}
        <View style={styles.paginator}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#e5e7eb', '#6366f1', '#e5e7eb'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.replace('/signin')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoWrapper: {
    width: 200,
    height: 100,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 5,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },

  /* Slides */
  slidesContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center', // ✅ center vertically
    alignItems: 'center',     // ✅ center horizontally
  },
  slideContent: {
    maxWidth: 320,
    maxHeight: 400,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 100,
  },
  description: {
    fontSize: 30,
    fontWeight: '800',
    color: '#6366f1',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.6,
  },

  /* Paginator */
  paginator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  /* Button */
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    width: '100%',
  },
  button: {
    borderRadius: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
