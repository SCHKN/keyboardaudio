import React, { Component } from "react";
import { Label, Item, Segment } from "semantic-ui-react";
import { connect } from "react-redux";
import { fetchSDK } from "./../redux/sdk/sdkReducer";
import RazerSDKStatus from "./RazerSDKStatus";

class RazerSDKInfo extends Component {
  componentWillMount() {
    const { fetchSDK } = this.props;
    fetchSDK();
  }

  render() {
    const { sdk } = this.props;
    return (
      <Segment.Group>
        <Segment>
          <Item.Group>
            <Item>
              <Item.Image
                size="small"
                src="https://upload.wikimedia.org/wikipedia/commons/f/f4/Razer-logo.png"
              />
              <Item.Content>
                <Item.Header as="a">SDK Information</Item.Header>
                <Item.Extra>
                  <Label horizontal>Core</Label>
                  {sdk.core}
                </Item.Extra>
                <Item.Extra>
                  <Label horizontal>Device</Label>
                  {sdk.device}
                </Item.Extra>
                <Item.Extra>
                  <Label horizontal>Version</Label>
                  {sdk.version}
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <RazerSDKStatus sdk={sdk}/>
      </Segment.Group>
    );
  }
}

function mapStateToProps({ sdk }) {
  return { sdk };
}

export default connect(
  mapStateToProps,
  { fetchSDK }
)(RazerSDKInfo);
