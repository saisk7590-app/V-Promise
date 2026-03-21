import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import AdminScreen from "../screens/AdminScreen";
import SalesExecutiveScreen from "../screens/SalesExecutiveScreen";
import InspectionExecutiveScreen from "../screens/InspectionExecutiveScreen";
import ValuationManagerScreen from "../screens/ValuationManagerScreen";
import InventoryManagerScreen from "../screens/InventoryManagerScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Sales" component={SalesExecutiveScreen} />
        <Stack.Screen name="Inspection" component={InspectionExecutiveScreen} />
        <Stack.Screen name="Valuation" component={ValuationManagerScreen} />
        <Stack.Screen name="Inventory" component={InventoryManagerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

