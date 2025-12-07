import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyButton from '../../../components/ui/button';
import signOut from '../../../utils/supabase/util.logout';
import { useAuth } from '../../../context/authContext'; 

export default function Settings() {

  const { setSession, setUser } = useAuth();

  const handleButtonPress = () => {
    setSession(false);
    setUser(null);
    signOut();
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white'
      }}
    >
      <Text>Settings Screen</Text>
      <MyButton title="Log Out" onPress={handleButtonPress} />
    </SafeAreaView>
  );
}