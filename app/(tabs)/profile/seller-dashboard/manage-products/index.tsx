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
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabView } from "react-native-tab-view";
import ProductListScreen from "./ProductListScreen";
import ProductUploadScreen from "./ProductUploadScreen";

const ManageProductsScreen = () => {
  const layout = useWindowDimensions();
  const theme = Colors[useColorScheme() ?? "light"];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "upload", title: "Product Upload" },
    { key: "list", title: "Product List" },
  ]);

  const renderScene = SceneMap({
    upload: ProductUploadScreen,
    list: ProductListScreen,
  });

  const renderTabBar = (props: any) => (
    <View style={styles.tabBar}>
      {props.navigationState.routes.map((route: any, i: number) => {
        const isActive = index === i;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => setIndex(i)}
            style={[
              styles.tabItem,
              isActive && {
                borderBottomColor: theme.tint,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabTitle,
                { color: isActive ? theme.tint : theme.mutedText },
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "700",
    margin: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tabItem: {
    paddingVertical: 10,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ManageProductsScreen;
