import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  coverResponder: {
    padding: 20 // requires a minimum
  },
  dial: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    elevation: 5,
    shadowColor: "#EEEEEE",
    shadowOffset: {
      width: 1,
      height: 2
    },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  innerDialDecorator: {
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    elevation: 3
  },
  pointer: {
    top: 20,
    left: 20,
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#DDDFE2",
    borderRadius: 5
  }
});
