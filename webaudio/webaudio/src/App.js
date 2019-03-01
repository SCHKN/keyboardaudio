import React, { Component } from "react";
import axios from "axios";
import { Container, Grid, Segment } from "semantic-ui-react";
import RazerSDKInfo from "./chroma/RazerSDKInfo";
import AudioAnalyser from "./AudioAnalyser";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionid: "",
      uri: "",
      audio: null
    };
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
  }

  async getMicrophone() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    this.setState({ audio });
  }

  stopMicrophone() {
    this.state.audio.getTracks().forEach(track => track.stop());
    this.setState({ audio: null });
  }

  toggleMicrophone() {
    if (this.state.audio) {
      this.stopMicrophone();
    } else {
      this.getMicrophone();
    }
  }

  getBlue() {
    axios
      .put(`${this.state.uri}/keyboard`, {
        effect: "CHROMA_CUSTOM_KEY",
        param: {
          color: [
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ],
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ],
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ],
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ],
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ],
            [
              255,
              255,
              255,
              255,
              255,
              65280,
              65280,
              65280,
              65280,
              65280,
              16711680,
              16711680,
              16711680,
              16711680,
              16711680,
              16776960,
              16776960,
              16776960,
              65535,
              65535,
              65535,
              65535
            ]
          ],
          key: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [
              0,
              0,
              0,
              16777216 | ~255,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ],
            [
              0,
              0,
              16777216 | ~255,
              16777216 | ~255,
              16777216 | ~255,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ],
            [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              16777216 | ~16776960,
              0,
              0,
              0,
              0,
              0
            ],
            [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              16777216 | ~16776960,
              16777216 | ~16776960,
              16777216 | ~16776960,
              0,
              0,
              0,
              0
            ]
          ]
        }
      })
      .then(response => {})
      .catch(function(error) {
        console.log(error);
      });
  }

  getRed() {
    console.log(`${this.state.uri}/keyboard`);
    axios
      .put(`${this.state.uri}/keyboard`, {
        effect: "CHROMA_CUSTOM",
        param: [
          [
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255
          ],
          [
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280,
            65280
          ],
          [
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680,
            16711680
          ],
          [
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535,
            65535
          ],
          [
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960,
            16776960
          ],
          [
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935,
            16711935
          ]
        ]
      })
      .then(response => {
        setTimeout(() => {
          this.getBlue();
          this.getRed();
        }, 50);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  componentWillMount() {
    // axios
    //   .post("http://localhost:54235/razer/chromasdk/", {
    //     title: "Razer Chroma SDK RESTful Test Application",
    //     description: "This is a REST interface test application",
    //     author: {
    //       name: "Chroma Developer",
    //       contact: "www.razerzone.com"
    //     },
    //     device_supported: [
    //       "keyboard",
    //       "mouse",
    //       "headset",
    //       "mousepad",
    //       "keypad",
    //       "chromalink"
    //     ],
    //     category: "application"
    //   })
    //   .then(response => {
    //     this.setState({
    //       sessionid: response.data.sessionid,
    //       uri: response.data.uri
    //     });
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //   });
  }

  // startSong() {
  //   let res;
  //   var requestUrl = "https://www.youtube.com/watch?v=BpHSm0KcW7o";
  //   stream(requestUrl).pipe(res);
  // }

  log(data) {
    console.log(data);
  }

  render() {
    return (
      <div className="App">
        {/* <div className="controls">
          <button onClick={this.toggleMicrophone}>
            {this.state.audio ? "Stop microphone" : "Get microphone input"}
          </button>
        </div>
        {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ""} */}
        <Container>
          {/* <Button onClick={() => this.startSong()}>Start Song</Button> */}
          <Grid className="main-grid">
            <Grid.Column width={6}>
              <RazerSDKInfo />
            </Grid.Column>
            <Grid.Column width={8} />
          </Grid>
        </Container>
      </div>
    );
  }
}

export default App;
