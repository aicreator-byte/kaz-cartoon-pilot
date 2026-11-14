import { registerRoot, Composition } from "remotion";
import { MainVideo } from "./Video.js";
import { CanvasFrogDemo } from "./experiment/CanvasFrogDemo.js";

registerRoot(() => (
  <>
    <Composition
      id="KartunPilot"
      component={MainVideo}
      durationInFrames={300}
      width={1280}
      height={720}
      fps={30}
    />
    <Composition
      id="CanvasFrogDemo"
      component={CanvasFrogDemo}
      durationInFrames={180}
      width={1280}
      height={720}
      fps={30}
    />
  </>
));
