import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TabView } from "react-native-tab-view";
import ProductListScreen from "./ProductListScreen";
import ProductUploadScreen from "./ProductUploadScreen";
const TAB_HEIGHT = 46;

const ManageProductsScreen = () => {
  const layout = useWindowDimensions();
  const theme = Colors[useColorScheme() ?? "light"];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "upload", title: "Product Upload" },
    { key: "list", title: "Product List" },
  ]);

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "upload":
        return (
          <ProductUploadScreen onProductUploadSuccess={() => setIndex(1)} />
        );
      case "list":
        return <ProductListScreen />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => {
    const inputRange = props.navigationState.routes.map((_: any, i: any) => i);
    return (
      <View
        style={[styles.tabBarContainer, { backgroundColor: theme.secondary }]}
      >
        {props.navigationState.routes.map((route: any, i: number) => {
          const isActive = index === i;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={route.title}
              onPress={() => setIndex(i)}
              activeOpacity={0.88}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: theme.tint,
                  shadowColor: theme.tint,
                  shadowOpacity: 0.17,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabTitle,
                  {
                    color: isActive ? "#fff" : theme.mutedText,
                  },
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Text style={[styles.header, { color: theme.text }]}>
        Manage Products
      </Text>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "700",
    margin: 16,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2fa",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 18,
    padding: 3,
    marginTop: 2,
    // iOS-style elevation:
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TAB_HEIGHT,
    borderRadius: 16,
    marginHorizontal: 2,
    marginVertical: 2,
    backgroundColor: "transparent",
    // Touchable highlight on Android
    overflow: "hidden",
  },
  tabTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.1,
    textTransform: "none",
  },
});

export default ManageProductsScreen;
