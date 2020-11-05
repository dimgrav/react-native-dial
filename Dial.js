import React from "react";
import PropTypes from "prop-types";

import {
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
  ViewPropTypes
} from "react-native";

import { throttle } from "lodash";


export class Dial extends React.Component {
  static propTypes = {
    elastic: PropTypes.bool,
    fixed: PropTypes.bool,
    incrementBy: PropTypes.number,
    initialAngle: PropTypes.number,
    initialRadius: PropTypes.number,
    onAngleXChange: PropTypes.func,
    onPress: PropTypes.func,
    onValueChange: PropTypes.func,
    pointerEvents: PropTypes.oneOf(["box-none", "none", "box-only", "auto"]),
    precision: PropTypes.number,
    radiusMax: PropTypes.number,
    radiusMin: PropTypes.number,
    responderStyle: ViewPropTypes.style,
    wrapperStyle: ViewPropTypes.style
  };

  static defaultProps = {
    initialRadius: 1,
    initialAngle: 0,
    precision: 0
  };

  constructor(props) {
    super(props);

    this.state = {
      startingAngle: this.props.initialAngle,
      startingRadius: this.props.initialRadius,
      releaseAngle: this.props.initialAngle,
      releaseRadius: this.props.initialRadius,
      angle: this.props.initialAngle,
      angleX: this.props.initialAngle,
      radius: this.props.initialRadius
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: e => {
        this.measureOffset();

        const { deg, radius } = this.calcAngle(e.nativeEvent);

        this.setState({
          startingAngle: deg,
          startingRadius: radius
        });

        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => true,
      onPanResponderMove: (_, gestureState) => {
        this.updateAngle(gestureState);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { angle, radius, releaseAngle, releaseRadius } = this.state;

        if (angle !== releaseAngle || radius !== releaseRadius) {
          // take the most up-to-date measurement on touch event ended
          this.updateAngle(gestureState);
          this.setState({
            releaseAngle: angle,
            releaseRadius: radius,
          });
        }
      },
    });

    this.offset = { x: 0, y: 0 };
    this.updateState = throttle(this.updateState.bind(this), 16);
  }

  updateState({ deg, degX, radius = this.state.radius }) {
    radius = this.state.releaseRadius + radius - this.state.startingRadius;

    if (radius < this.props.radiusMin) {
      radius = this.props.radiusMin;
    } else if (radius > this.props.radiusMax) {
      radius = this.props.radiusMax;
    }

    const angle = deg + this.state.releaseAngle - this.state.startingAngle;

    if (deg < 0) {
      deg += 360;
    }

    let update = {};
  
    if (angle !== this.state.angle || radius !== this.state.radius) {
      update.angle = angle;
      update.radius = radius;
      if (this.state.angleX !== degX) {
        update.angleX = degX;
      }
    }

    if (Object.keys(update).length > 0) {
      this.setState(update, () => {
        this.props.onValueChange && this.props.onValueChange(angle, radius);
        update.angleX && this.props.onAngleXChange && this.props.onAngleXChange(degX);
      });
    }
  }

  measureOffset = (/* nativeEvent */) => {
    /*
    * const {x, y, width, height} = nativeEvent.layout
    * onlayout values are different than measureInWindow
    * x and y are the distances to its previous element
    * but in measureInWindow they are relative to the window
    */
    const { width: screenWidth } = Dimensions.get("window");

    this.self && this.self.measureInWindow((x, y, width, height) => {
      this.offset = {
        x: x % screenWidth + width / 2,
        y: y + height / 2,
      };
      this.radius = width / 2;
    });
  };

  updateAngle = gestureState => {
    let { deg, radius } = this.calcAngle(gestureState);
    const degX = deg; // angle measured from (-1, 0) in the 4th quadrant of the unit circle

    if (deg < 0) {
      deg += 360;
    }

    if (Math.abs(this.state.angle - deg) > this.props.precision) {
      this.updateState({ deg, degX, radius });
    }
  };

  calcAngle = gestureState => {
    const { pageX, pageY, moveX, moveY } = gestureState;
    const [x, y] = [pageX || moveX, pageY || moveY];
    const [dx, dy] = [x - this.offset.x, y - this.offset.y];
    return {
      deg: Math.atan2(dy, dx) * 180 / Math.PI + 120,
      radius: Math.sqrt(dy * dy + dx * dx) / this.radius // pitagoras r^2 = x^2 + y^2 normalizado
    };
  };

  resetState = () => {
    this.setState({
      startingAngle: this.props.initialAngle,
      startingRadius: this.props.initialRadius,
      releaseAngle: this.props.initialAngle,
      releaseRadius: this.props.initialRadius,
      angle: this.props.initialAngle,
      angleX: this.props.initialAngle,
      radius: this.props.initialRadius
    });
  };

  // Lifecycle methods
  render() {
    const rotate = this.props.fixed ? "0deg" : `${this.state.angle}deg`;
    const scale = this.props.elastic ? this.state.radius : 1;

    /**
     * `pointerEvents` are now ignored.
     * Should be handled based on the component's internal structure and be added (if there are any)
     * to the corresponding view(s).
     */
    const pevProp = this.props.pointerEvents != null ? { pointerEvents: this.props.pointerEvents } : {};

    return (
      <View
        onLayout={this.measureOffset}
        ref={node => this.self = node}
        style={[styles.coverResponder, this.props.responderStyle]}
        {...pevProp}
        {...this._panResponder.panHandlers}
      >
        {this.props.children
          ? <View {...pevProp} style={[this.props.wrapperStyle, { transform: [{ rotate }, { scale }] }]}>
            {this.props.children}
          </View>
          : <DefaultDial style={this.props.style} rotate={rotate} scale={scale} />
        }
      </View>
    );
  }
}

export const DefaultDial = ({ style = {}, rotate = "0rad", scale = 1 }) => (
  <View
    style={[styles.dial, style, {
      transform: [
        { rotate }, { scale },
      ]
    }]} >
    <View style={styles.innerDialDecorator}>
      <View style={styles.pointer} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  coverResponder: {
    padding: 20, // needs a minimum
  },
  dial: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    elevation: 5,
    shadowColor: "#EEEEEE",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  innerDialDecorator: {
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  pointer: {
    top: 20,
    left: 20,
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#DDDFE2",
    borderRadius: 5,
  },
});
