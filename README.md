# react-native-snap-dials

**WORK IN PROGRESS**

Enhanced Knob-style dial components for React Native.

Based on [https://github.com/netbeast/react-native-dial](https://github.com/netbeast/react-native-dial).

## API

`SnapDial`:

| prop              | description                                                                          |
| :-------------    | :----------------------------------------------------------------------------------- |
| `fixed?`          | whether to apply `rotate` transformation                                             |
| `elastic?`        | whether to apply `scale` transformation                                              |
| `initialAngle`    | starting pointer angle                                                               |
| `initialRadius`   | starting gesture radius                                                              |
| `onAngleXChange?` | callback to handle angle measured from the negative X-axis value area (4th quadrant) |
| `onAngleYChange?` | callback to handle angle measured from the positive Y-axis value area (1st quadrant) |
| `pointerEvents?`  | whether to pass touch events                                                         |
| `precision`       | minimum allowed difference between angle changes for updating the current angles     |
| `steps?`          | number of equal-length arcs on the circle circumference to snap the pointer to       |
| `radiusMax?`      | maximum allowed gesture radius for handling touch events                             |
| `radiusMin?`      | minimum allowed gesture radius for handling touch events                             |
| `responderStyle?` | `PanResponder` style                                                                 |
| `containerStyle?` | `SnapDial` style                                                                     |

## License

MIT
