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
    sections: PropTypes.number,
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
      section: this.props.sections ? this._calculateSection(this.props.initialAngle) : null
    };
  }

  _updateState({ degX, degY, radius, section = null }) {
    radius = this.state.releaseRadius + radius - this.state.startingRadius;
    radius = min([max([radius, this.props.radiusMin]), this.props.radiusMax]);

    let angleY = degY + this.state.releaseAngle - this.state.startingAngle;

    if (angleY < 0) angleY += 360;
    if (angleY > 360) angleY %= 360;
    if (section) angleY = this._roundAngleToNearestSection(angleY);
    if (angleY === 360) angleY = 0;

    if (angleY !== this.state.angleY || radius !== this.state.radius) {
      let update = { angleY, radius };

      if (this.state.angleX !== degX) update.angleX = degX;
      if (section) update.section = section;

      this.setState(update, () => {
        this.props.onAngleYChange && this.props.onAngleYChange(this.state.angleY);
        update.angleX && this.props.onAngleXChange && this.props.onAngleXChange(this.state.angleX);
      });
    }
  }

  _roundAngleToNearestSection = angle => {
    const anglePerSection = 360 / this.props.sections;
    const excess = angle % anglePerSection;
    if (excess > anglePerSection / 2) {
      return angle + anglePerSection - excess;
    }
    return angle - excess;
  };

  _calculateAngles = gestureData => {
    const { pageX, pageY, moveX, moveY } = gestureData;
    const [x, y] = [pageX || moveX, pageY || moveY];
    const [dx, dy] = [x - this._offset.x, y - this._offset.y];
    // degX: measured from (1, 0) on the unit circle
    // degY: measured from (0, 0) on the unit circle
    return {
      degX: Math.atan2(dy, dx) * 180 / Math.PI + 90,
      degY: Math.atan2(dy, dx) * 180 / Math.PI + 180,
      radius: Math.sqrt(dy * dy + dx * dx) / this.radius // normalize r^2 = x^2 + y^2
    };
  };

  _calculateSection = angle => {
    return Math.floor(angle * this.props.sections / 360);
  };

  _trackGesture = gestureState => {
    let { degX, degY, radius } = this._calculateAngles(gestureState);
    const { sections } = this.props;

    if (degX < 0) degX += 360;

    if (Math.abs(this.state.angleY - degY) > this.props.precision) {
      if (sections) {
        let section = this._calculateSection(degY);

        if (section > sections) section = section % sections;
        if (section === 0) section = sections; // 1 <= section <= sections

        let deg = 360 * section / sections;
        degX = deg <= 90 ? 270 + deg : deg - 90;
        degY = deg;

        this._updateState({ degX, degY, radius, section });
      } else {
        this._updateState({ degX, degY, radius });
      }
    }
  };

  _measureOffset = () => {
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
    const { degY, radius } = this._calculateAngles(nativeEvent);
    this.setState({
      startingAngle: degY,
      startingRadius: radius
    });
    return true;
  };

  _handlePanMove = (_, gestureState) => {
    this._trackGesture(gestureState);
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
