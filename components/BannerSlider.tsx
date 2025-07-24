// components/BannerSlider.tsx

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export type BannerItem = {
  id: string;
  image: string;
  title?: string;
  discountText?: string;
};

export default function BannerSlider({ banners }: { banners: BannerItem[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (screenWidth - 32)
    );
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((item) => (
          <View
            key={item.id}
            style={[styles.slide, { backgroundColor: theme.bannerBg }]}
          >
            <View>
              <Text style={[styles.bannerText, { color: theme.text }]}>
                {item.title}
              </Text>
              {item.discountText && (
                <View
                  style={[
                    styles.discountBadge,
                    { backgroundColor: theme.accent },
                  ]}
                >
                  <Text
                    style={[styles.discountText, { color: theme.background }]}
                  >
                    {item.discountText}
                  </Text>
                </View>
              )}
            </View>
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activeIndex ? theme.accent : theme.mutedText,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: Dimensions.get("window").width - 32,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  bannerImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: "auto",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 18,
    fontWeight: "700",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
