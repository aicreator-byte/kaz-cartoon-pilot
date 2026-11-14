import { registerRoot, Composition } from "remotion";
import { MainVideo } from "./Video.js";

registerRoot(() => (
  <Composition
    id="KartunPilot"
    component={MainVideo}
    durationInFrames={300}
    width={1280}
    height={720}
    fps={30}
  />
));
