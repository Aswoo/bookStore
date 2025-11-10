import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

type SafeScreenProps = {
  children: ReactNode;
};

export default function SafeScreen({ children }: SafeScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return <View style={[styles.container, { paddingTop: insets.top }]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
