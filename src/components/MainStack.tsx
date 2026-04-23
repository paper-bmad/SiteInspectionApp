import { BaseNavigationContainer } from '@react-navigation/core';
import { stackNavigatorFactory } from 'react-nativescript-navigation';

import { LoginScreen } from './LoginScreen';
import { ProjectsScreen } from './ProjectsScreen';
import { InspectionScreen } from './InspectionScreen';

const StackNavigator = stackNavigatorFactory();

export function MainStack() {
  return (
    <BaseNavigationContainer>
      <StackNavigator.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2e6ddf',
          },
          headerTintColor: '#ffffff',
        }}
      >
        <StackNavigator.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <StackNavigator.Screen
          name="Projects"
          component={ProjectsScreen}
          options={{ title: 'My Projects' }}
        />
        <StackNavigator.Screen
          name="Inspection"
          component={InspectionScreen}
          options={{ title: 'New Inspection' }}
        />
      </StackNavigator.Navigator>
    </BaseNavigationContainer>
  );
}