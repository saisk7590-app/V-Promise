import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/Auth/screens/LoginScreen";
import SalesExecutiveScreen from "../features/Sales/screens/SalesExecutiveScreen";
import InspectionExecutiveScreen from "../features/Inspection/screens/InspectionExecutiveScreen";
import ValuationManagerScreen from "../features/Valuation/screens/ValuationManagerScreen";
import InventoryManagerScreen from "../features/Inventory/screens/InventoryManagerScreen";

import AdminNavigator from "../features/Admin/navigation/AdminNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Sales" component={SalesExecutiveScreen} />
        <Stack.Screen name="Inspection" component={InspectionExecutiveScreen} />
        <Stack.Screen name="Valuation" component={ValuationManagerScreen} />
        <Stack.Screen name="Inventory" component={InventoryManagerScreen} />

        {/* Admin Flow */}
        <Stack.Screen name="Admin" component={AdminNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}