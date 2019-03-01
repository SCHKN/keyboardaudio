import React from "react";
import { Segment, Icon } from "semantic-ui-react";

const RazerSDKStatus = ({ sdk }) => {
  return (
    <div style={{ fontWeight: 600 }}>
      {sdk.loading ? (
        <Segment loading>Loading the SDK...</Segment>
      ) : sdk.error ? (
        <Segment inverted color="red" clearing>
          {sdk.error}
          <Icon name="heart" color="black" style={{ float: "right" }} />
        </Segment>
      ) : (
        <Segment inverted className="background-green">
          Your computer is equipped with the Razer SDK
        </Segment>
      )}
    </div>
  );
};

export default RazerSDKStatus;
