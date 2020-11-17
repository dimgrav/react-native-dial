import React from 'react';
import PropTypes from 'prop-types';

import { Dimensions, PanResponder, View, ViewPropTypes } from 'react-native';

import { max, min, throttle } from 'lodash';

import { styles } from './SnapDial.style';


export default class extends React.Component {
  static propTypes = {
    fixed: PropTypes.bool,
    elastic: PropTypes.bool,
    initialAngle: PropTypes.number,
    initialRadius: PropTypes.number,
    onAngleXChange: PropTypes.func,
    onAngleYChange: PropTypes.func,
    pointerEvents: PropTypes.oneOf(['box-none', 'none', 'box-only', 'auto']),
    precision: PropTypes.number,
    steps: PropTypes.number,
    radiusMax: PropTypes.number,
    radiusMin: PropTypes.number,
    responderStyle: ViewPropTypes.style,
    containerStyle: ViewPropTypes.style
  };

  static defaultProps = {
    initialRadius: 1,
    initialAngle: 0,
    precision: 0
  };

  constructor(props) {
    super(props);

    this._initState = this._initState.bind(this);
    this._updateState = throttle(this._updateState.bind(this), 16);

    this._offset = { x: 0, y: 0 };

    this.state = this._initState();

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: this._handlePanCapture,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => true,
      onPanResponderMove: this._handlePanMove,
      onPanResponderRelease: this._handlePanRelease
    });

    this.reset = this.reset.bind(this);
  }

  _initState() {
    return {
      startingAngle: this.props.initialAngle,
      startingRadius: this.props.initialRadius,
      releaseAngle: this.props.initialAngle,
      releaseRadius: this.props.initialRadius,
      angleX: this.props.initialAngle,
      angleY: this.props.initialAngle,
      radius: this.props.initialRadius,
      step: null
    };
  }

  _updateState({ degX, degY, radius, step = null }) {
    radius = this.state.releaseRadius + radius - this.state.startingRadius;
    radius = min(max(radius, this.props.radiusMin), this.props.radiusMax);

    const angleY = degY + this.state.releaseAngle - this.state.startingAngle;

    if (angleY !== this.state.angleY || radius !== this.state.radius) {
      let update = { angleY, radius };

      if (this.state.angleX !== degX) {
        update.angleX = degX;
      }

      if (step) {
        update.step = step;
      }

      this.setState(update, () => {
        this.props.onAngleYChange && this.props.onAngleYChange(angleY, radius);
        update.angleX && this.props.onAngleXChange && this.props.onAngleXChange(degX);
      });
    }
  }

  _calculateAngle = gestureState => {
    const { pageX, pageY, moveX, moveY } = gestureState;
    const [x, y] = [pageX || moveX, pageY || moveY];
    const [dx, dy] = [x - this._offset.x, y - this._offset.y];
    return {
      degX: Math.atan2(dy, dx) * 180 / Math.PI + 120,
      radius: Math.sqrt(dy * dy + dx * dx) / this.radius
    };
  };

  _updateAngle = gestureState => {
    const { degX, radius } = this._calculateAngle(gestureState);
    const degY = degX < 0 ? degX + 360 : degX
    if (Math.abs(this.state.angleY - degY) > this.props.precision) {
      if (this.props.steps) {
        const step = Math.floor(360 / degY);
        const degX = 360 * step / this.props.steps;
        const degY = degX - 90;
        this._updateState({ degX, degY, radius, step });
      } else {
        this._updateState({ degX, degY, radius });
      }
    }
  };

  _measureOffset = (/* nativeEvent */) => {
    // x-y offsets must be relative to the window
    // calling onLayout returns x-y relative to the parent
    // thanks to Jesús Darío (jsdario) for mentioning this!
    const { width: screenWidth } = Dimensions.get('window');
    this.self && this.self.measureInWindow((x, y, width, height) => {
      this._offset = {
        x: x % screenWidth + width / 2,
        y: y + height / 2,
      };
      this.radius = width / 2;
    });
  };

  _handlePanCapture = ({ nativeEvent }) => {
    this._measureOffset();
    const { degX, radius } = this._calculateAngle(nativeEvent);
    this.setState({
      startingAngle: degX,
      startingRadius: radius
    });
    return true;
  };

  _handlePanMove = (_, gestureState) => {
    // TODO: handle snapping behaviour
    this._updateAngle(gestureState);
  };

  _handlePanRelease = () => {
    const { angleY, releaseAngle, radius, releaseRadius } = this.state;
    if (angleY !== releaseAngle || radius !== releaseRadius) {
      this.setState({
        releaseAngle: this.state.angleY,
        releaseRadius: this.state.radius,
      });
    }
  };

  reset() {
    this._initState();
  }

  render() {
    const rotate = this.props.fixed ? '0deg' : `${this.state.angleY}deg`;
    const scale = this.props.elastic ? this.state.radius : 1;

    /**
     * `pointerEvents` are now ignored.
     * Should be handled based on the component's internal structure and be added (if there are any)
     * to the corresponding view(s).
     */
    const pevProp = this.props.pointerEvents != null ? { pointerEvents: this.props.pointerEvents } : {};

    return (
      <View
        onLayout={this._measureOffset}
        ref={node => this.self = node}
        style={[styles.coverResponder, this.props.responderStyle]}
        {...pevProp}
        {...this._panResponder.panHandlers}
      >
        {this.props.children
          ? <View {...pevProp} style={[this.props.containerStyle, { transform: [{ rotate }, { scale }] }]}>
            {this.props.children}
          </View>
          : <DefaultDial style={this.props.style} rotate={rotate} scale={scale} />
        }
      </View>
    );
  }
}

export const DefaultDial = ({ style = {}, rotate = '0rad', scale = 1 }) => (
  <View
    style={[
      styles.dial,
      style,
      { transform: [{ rotate }, { scale }] }
    ]}>
    <View style={styles.innerDialDecorator}>
      <View style={styles.pointer} />
    </View>
  </View>
);