import React, { Component } from "react";
import { Icon } from "semantic-ui-react";

export default class RazerSDKHeartbeat extends Component {
  render() {
    return (
      <Icon
        name="heart"
        color="red"
        style={{ float: "right" }}
        className="animated pulse infinite"
      />
    );
  }
}
