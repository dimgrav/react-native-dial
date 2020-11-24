# react-native-snap-dial

**WORK IN PROGRESS**

Enhanced Knob-style dial component for React Native.

Based on [https://github.com/netbeast/react-native-dial](https://github.com/netbeast/react-native-dial).

## API

| prop              | description                                                                          |
| :-------------    | :----------------------------------------------------------------------------------- |
| `fixed?`          | whether to apply `rotate` transformation                                             |
| `elastic?`        | whether to apply `scale` transformation                                              |
| `initialAngle`    | starting pointer angle                                                               |
| `initialRadius`   | starting gesture radius                                                              |
| `onAngleXChange?` | callback to handle angle measured clockwise from the X-axis (2nd quadrant)           |
| `onAngleYChange?` | callback to handle angle measured clockwise from the Y-axis (1st quadrant)           |
| `pointerEvents?`  | whether to pass touch events                                                         |
| `precision`       | minimum allowed difference between angle changes for gesture tracking                |
| `sections?`       | number of equal-length arcs on the circle circumference to snap the pointer to       |
| `radiusMax?`      | maximum allowed gesture radius for handling touch events                             |
| `radiusMin?`      | minimum allowed gesture radius for handling touch events                             |
| `responderStyle?` | style for the `View` that `PanResponder.panHandlers` are passed to                   |
| `containerStyle?` | style for the `View` that wraps the dial component(s)                                |

## License

MIT
