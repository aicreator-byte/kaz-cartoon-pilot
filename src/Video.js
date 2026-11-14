import {
  useVideoConfig,
  useCurrentFrame,
  Spring,
  Audio,
} from "remotion";

/* ========================================================================
   KARTUN ANAK-ANAK — gaya Tom and Jerry (tanpa suara bicara, pakai musik)
   Karakter: Kucing (oren) + Tikus (abu-abu), ekspresi berubah-ubah per adegan
   ======================================================================== */

const WARNA = {
  langit: "#87CEEB",
  rumput: "#7CFC00",
  pohonCoklat: "#8B4513",
  pohonHijau: "#228B22",
  kucing: "#FF8C00",
  kucingTua: "#D2691E",
  putih: "#FFFFFF",
  hitam: "#000000",
  abu: "#A9A9A9",
  abuTua: "#696969",
  merah: "#FF0000",
  biruTua: "#00008B",
  kuning: "#FFD700",
};

/* ---------- Helper: kotak dengan border tebal (gaya kartun) ---------- */
const Kotak = ({ x, y, w, h, bg, radius = 8, border = 4 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: bg,
      borderRadius: radius,
      border: `${border}px solid ${WARNA.hitam}`,
      boxSizing: "border-box",
    }}
  />
);

/* ---------- Mata kartun: besar, bersinar ---------- */
const Mata = ({ x, y, size = 22, kaget = false, menoleh = 0 }) => {
  const pupilX = interpolate({
    value: menoleh,
    inputRange: [-1, 0, 1],
    outputRange: [-size / 3, 0, size / 3],
  });
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {/* Kulit mata */}
      <Kotak x={0} y={0} w={size * 2} h={size * 2} bg={WARNA.putih} radius={50} border={3} />
      {/* Pupil */}
      <Kotak
        x={size / 2 + pupilX - 4}
        y={size / 2 - 4}
        w={8}
        h={8}
        bg={WARNA.hitam}
        radius={50}
        border={0}
      />
      {/* Kilauan mata */}
      <Kotak x={size / 2 - 2} y={size / 2 - 8} w={4} h={4} bg={WARNA.putih} radius={50} border={0} />
      {/* Kedip jika kaget */}
      {kaget && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size * 2,
            height: 4,
            background: WARNA.hitam,
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};

/* ---------- Mulut kartun ---------- */
const Mulut = ({ x, y, senang = false, sedih = false, kaget = false, terkecil = false }) => {
  if (kaget) {
    return (
      <Kotak x={x} y={y} w={14} h={14} bg={WARNA.hitam} radius={50} border={0} />
    );
  }
  if (senang) {
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 20,
          height: 10,
          borderBottom: `4px solid ${WARNA.hitam}`,
          borderRadius: "0 0 10px 10px",
        }}
      />
    );
  }
  if (sedih) {
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 20,
          height: 10,
          borderTop: `4px solid ${WARNA.hitam}`,
          borderRadius: "10px 10px 0 0",
        }}
      />
    );
  }
  return (
    <Kotak x={x} y={y} w={12} h={4} bg={WARNA.hitam} radius={2} border={0} />
  );
};

/* ---------- Karakter: Kucing ---------- */
export const Kucing = ({ x = 0, y = 0, mood = "normal", scale = 1, arah = 1 }) => {

  const kaget = mood === "kaget";
  const marah = mood === "marah";
  const senang = mood === "senang";
  const sedih = mood === "sedih";
  const pusing = mood === "pusing";
  const tidur = mood === "tidur";

  const mataBesar = kaget || marah || pusing;
  const pupilX = marah ? -0.8 : senang ? 0.4 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale}) ${arah < 0 ? "scaleX(-1)" : ""}`,
        width: 140,
        height: 140,
        zIndex: 10,
      }}
    >
      {/* Ekor */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: arah < 0 ? -10 : 10,
          width: 30,
          height: 70,
          background: WARNA.kucing,
          borderRadius: "50%",
          border: `3px solid ${WARNA.hitam}`,
          transform: `rotate(${arah < 0 ? "30deg" : "-30deg"})`,
          transformOrigin: "top",
          zIndex: 1,
        }}
      />
      {/* Badan */}
      <Kotak x={20} y={40} w={100} h={60} bg={WARNA.kucing} radius={30} />
      {/* Kepala */}
      <Kotak x={15} y={10} w={110} h={70} bg={WARNA.kucing} radius={40} />
      {/* Telinga kiri */}
      <Kotak x={25} y={-5} w={25} h={40} bg={WARNA.kucing} radius="40% 0 0 40%" border={3} />
      {/* Telinga kanan */}
      <Kotak x={60} y={-5} w={25} h={40} bg={WARNA.kucing} radius="0 40% 40% 0" border={3} />
      {/* Dalam telinga */}
      <Kotak x={32} y={5} w={12} h={20} bg={WARNA.merah} radius={10} border={0} />
      <Kotak x={67} y={5} w={12} h={20} bg={WARNA.merah} radius={10} border={0} />

      {/* Mata */}
      <Mata x={35} y={25} size={mataBesar ? 26 : 20} kaget={kaget} menoleh={pupilX} />
      <Mata x={65} y={25} size={mataBesar ? 26 : 20} kaget={kaget} menoleh={pupilX} />

      {/* Hidung */}
      <Kotak x={48} y={42} w={14} h={12} bg={WARNA.merah} radius={50} border={0} />
      <Kotak x={53} y={46} w={2} h={2} bg={WARNA.hitam} radius={50} border={0} />

      {/* Mulut */}
      <Mulut x={42} y={54} senang={senang} sedih={sedih} kaget={kaget} />

      {/* Sidik jari kaki */}
      <Kotak x={30} y={88} w={14} h={10} bg={WARNA.kucingTua} radius={5} border={2} />
      <Kotak x={56} y={88} w={14} h={10} bg={WARNA.kucingTua} radius={5} border={2} />

      {/* Bintang di kepala jika pusing */}
      {pusing && (
        <div
          style={{
            position: "absolute",
            left: 55,
            top: -15,
            width: 20,
            height: 20,
            background: WARNA.kuning,
            borderRadius: "50%",
            border: `2px solid ${WARNA.hitam}`,
            animation: `putar 1s linear infinite`,
            zIndex: 20,
          }}
        >
          ★
        </div>
      )}
      {/* Zzz jika tidur */}
      {tidur && (
        <div
          style={{
            position: "absolute",
            left: 85,
            top: -5,
            fontSize: 24,
            zIndex: 20,
            animation: "naikTurun 1.5s ease-in-out infinite",
          }}
        >
          Z
        </div>
      )}
      <style>{`
        @keyframes putar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes naikTurun { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
};

/* ---------- Karakter: Tikus ---------- */
export const Tikus = ({ x = 0, y = 0, mood = "normal", scale = 1, arah = 1 }) => {
  const senang = mood === "senang";
  const kaget = mood === "kaget";
  const malu = mood === "malu";
  const terkecil = mood === "terkecil";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale}) ${arah < 0 ? "scaleX(-1)" : ""}`,
        width: 90,
        height: 90,
        zIndex: 10,
      }}
    >
      {/* Ekor tikus */}
      <div
        style={{
          position: "absolute",
          bottom: 5,
          right: arah < 0 ? 5 : -15,
          width: 8,
          height: 60,
          background: WARNA.abu,
          borderRadius: "50%",
          border: `2px solid ${WARNA.hitam}`,
          transform: `rotate(${arah < 0 ? "-45deg" : "45deg"})`,
          transformOrigin: "top",
          zIndex: 1,
        }}
      />
      {/* Badan */}
      <Kotak x={20} y={30} w={50} h={35} bg={WARNA.abu} radius={25} />
      {/* Kepala */}
      <Kotak x={10} y={5} w={70} h={45} bg={WARNA.abu} radius={30} />
      {/* Telinga */}
      <Kotak x={15} y={-5} w={20} h={25} bg={WARNA.abu} radius="50%" border={2} />
      <Kotak x={55} y={-5} w={20} h={25} bg={WARNA.abu} radius="50%" border={2} />
      {/* Dalam telinga */}
      <Kotak x={21} y={2} w={10} h={12} bg={WARNA.merah} radius={50} border={0} />
      <Kotak x={61} y={2} w={10} h={12} bg={WARNA.merah} radius={50} border={0} />

      {/* Mata */}
      <Mata x={20} y={15} size={kaget ? 18 : 14} kaget={kaget} menoleh={senang ? 0.3 : 0} />
      <Mata x={50} y={15} size={kaget ? 18 : 14} kaget={kaget} menoleh={senang ? 0.3 : 0} />

      {/* Hidung */}
      <Kotak x={33} y={28} w={8} h={8} bg={WARNA.merah} radius={50} border={0} />

      {/* Kumis */}
      <div
        style={{
          position: "absolute",
          left: 25,
          top: 30,
          width: 20,
          height: 2,
          background: WARNA.hitam,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 25,
          top: 34,
          width: 22,
          height: 2,
          background: WARNA.hitam,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 30,
          width: 20,
          height: 2,
          background: WARNA.hitam,
          borderRadius: 1,
          transform: "scaleX(-1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 34,
          width: 22,
          height: 2,
          background: WARNA.hitam,
          borderRadius: 1,
          transform: "scaleX(-1)",
        }}
      />

      {/* Mulut */}
      <Mulut x={30} y={40} senang={senang} sedih={malu} kaget={kaget} />

      {/* Kaki */}
      <Kotak x={22} y={60} w={12} h={8} bg={WARNA.abuTua} radius={4} border={1} />
      <Kotak x={56} y={60} w={12} h={8} bg={WARNA.abuTua} radius={4} border={1} />
    </div>
  );
};

/* ---------- Objek latar: Pohon ---------- */
export const Pohon = ({ x = 0, y = 50 }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 1 }}>
    <Kotak x={45} y={60} w={20} h={60} bg={WARNA.pohonCoklat} radius={5} border={2} />
    <Kotak x={15} y={10} w={80} h={60} bg={WARNA.pohonHijau} radius={40} border={3} />
    <Kotak x={40} y={40} w={30} h={30} bg={WARNA.pohonHijau} radius={50} border={0} />
  </div>
);

/* ---------- Objek latar: Batu ---------- */
export const Batu = ({ x = 0, y = 70 }) => (
  <Kotak x={x} y={y} w={70} h={40} bg={WARNA.abuTua} radius={20} border={3} />
);

/* ---------- Caption kartun ---------- */
export const Caption = ({ teks, x, y, ukuran = 28 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontSize: ukuran,
      fontWeight: "900",
      color: WARNA.putih,
      textShadow: `3px 3px 0 ${WARNA.hitam}, -1px -1px 0 ${WARNA.hitam}, 1px -1px 0 ${WARNA.hitam}, -1px 1px 0 ${WARNA.hitam}, 1px 1px 0 ${WARNA.hitam}`,
      fontFamily: "Arial, sans-serif",
      zIndex: 30,
      whiteSpace: "nowrap",
    }}
  >
    {teks}
  </div>
);

/* ---------- Komponen utama ---------- */
export const MainVideo = () => {
  const { width = 1280, height = 720 } = useVideoConfig();
  const frame = useCurrentFrame() ?? 0;

  /* Fase adegan (setiap fase ~60 frame = 2 detik @30fps) */
  const fase = Math.min(4, Math.floor(frame / 60));

  /* Posisi karakter per fase (tidak pakai interpolate agar stabil di frame 0) */
  let kucingX, tikusX;
  if (fase === 0) { kucingX = width - 200; tikusX = 100; }
  else if (fase === 1) { kucingX = width / 2 - 100; tikusX = width / 2 - 60; }
  else if (fase === 2) { kucingX = width / 2 - 80; tikusX = width / 2 - 40; }
  else if (fase === 3) { kucingX = width / 2 - 60; tikusX = width / 2 - 20; }
  else { kucingX = width - 200; tikusX = 150; }

  const kucingY = height - 180;
  const tikusY = height - 140;

  /* Mood karakter per fase */
  const kucingMood = fase === 0 ? "tidur" : fase === 1 ? "marah" : fase === 2 ? "kaget" : fase === 3 ? "pusing" : "normal";
  const tikusMood = fase === 0 ? "normal" : fase === 1 ? "kaget" : fase === 2 ? "senang" : fase === 3 ? "senang" : "normal";

  const captionTeks =
    fase === 0 ? "Kucing tidur nyenyak di bawah pohon."
    : fase === 1 ? "Tikus melintasi... kucing terbangun dan marah!"
    : fase === 2 ? "Tikus sembunyi di belakang batu. Kucing bingung."
    : fase === 3 ? "Tikus mengejek. Kucing kena ketukan buah!"
    : "Tikus lari menang. Kucing pusing.";

  return (
    <div
      style={{
        width,
        height,
        background: WARNA.langit,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Audio src="src/music.wav" playFrom={0} />

      {/* Langit */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.6,
          background: `linear-gradient(to bottom, ${WARNA.langit}, #E0FFFF)`,
        }}
      />
      {/* Rumput */}
      <Kotak x={0} y={height * 0.6} w={width} h={height * 0.4} bg={WARNA.rumput} radius={0} border={0} />

      {/* Pohon kiri */}
      <Pohon x={50} y={height * 0.55} />
      {/* Pohon kanan */}
      <Pohon x={width - 150} y={height * 0.55} />

      {/* Batu (tempat sembunyi tikus) */}
      <Batu x={width / 2 - 40} y={height * 0.65} />

      {/* Karakter */}
      <Kucing x={kucingX} y={kucingY} mood={kucingMood} />
      <Tikus x={tikusX} y={tikusY} mood={tikusMood} />

      {/* Caption */}
      <Caption teks={captionTeks} x={width / 2 - 300} y={height * 0.1} ukuran={24} />

      {/* Efek benturan (buah jatuh ke kepala kucing di fase 3) */}
      {fase === 3 && frame > 200 && frame < 210 && (
        <Kotak
          x={kucingX + 55}
          y={kucingY - 10}
          w={20}
          h={20}
          bg={WARNA.kuning}
          radius={50}
          border={2}
        />
      )}
    </div>
  );
};

MainVideo.defaultProps = {
  id: "KartunPilot",
  durationInFrames: 300, // 10 detik @ 30fps
  width: 1280,
  height: 720,
  fps: 30,
};
