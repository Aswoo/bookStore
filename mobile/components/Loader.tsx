import { View, ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { ReactElement } from "react";
import COLORS from "../constants/colors";

type LoaderProps = {
  size?: ActivityIndicatorProps["size"];
};

export default function Loader({ size = "large" }: LoaderProps): ReactElement {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
}
