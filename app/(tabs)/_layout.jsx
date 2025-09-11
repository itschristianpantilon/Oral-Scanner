import { View, Text, Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router'

import icons  from '../../constants/icons'
import { StatusBar } from 'expo-status-bar'

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="w-28 items-center justify-center gap-2 top-3">
      <Image 
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className="w-9 h-7"
      />

      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
   <>
    <Tabs 
    screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#36A2A4',
      tabBarInactiveTintColor: '#1E1E2D',
      tabBarStyle: {
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#FFF',
        height: 65
      }
    }}
    >
      <Tabs.Screen 
        name='home'
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.home}
              color={color}
              name="Home"
              focused={focused}
            />
          )
        }}
      />

        
      <Tabs.Screen 
        name='profile'
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          )
        }}
      />

    </Tabs>
   </>
  )
}

export default TabsLayout