import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../../theme/colors";

import UserListScreen from "../screens/UserListScreen";
import CreateUserScreen from "../screens/CreateUserScreen";
import BranchScreen from "../screens/BranchScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
const Tab = createBottomTabNavigator();

export default function AdminTabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary || "#0066FF",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Users"
        component={UserListScreen}
        options={{
          title: "Users",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-add" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Branches"
        component={BranchScreen}
        options={{
          title: "Branches",
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}