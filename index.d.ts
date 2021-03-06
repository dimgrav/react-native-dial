declare module 'react-native-snap-dial' {
    import * as React from 'react';
    import * as ReactNative from 'react-native';
  
    interface SnapDialProps {
      fixed?: boolean;
      elastic?: boolean;
      initialAngle: number;
      initialRadius: number;
      onAngleXChange?: Function;
      onAngleYChange?: Function;
      pointerEvents?: string | Array<string>;
      precision?: number;
      sections?: number;
      radiusMax?: number;
      radiusMin?: number;
      responderStyle?: ReactNative.ViewStyle | Array<ReactNative.ViewStyle>;
      containerStyle?: ReactNative.ViewStyle | Array<ReactNative.ViewStyle>;
    }
  
    export default class SnapDial extends React.Component<SnapDialProps, any> {
      public reset(): void;
      public render(): React.ReactNode;
    }
  }
  