import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

export default function App() {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [launched, setLaunched] = useState(false);
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  /* ===== REMOVE LOADER ===== */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  /* ===== GLOBAL MOUSE PARALLAX (3D BACKGROUND + CARD) ===== */
  useEffect(() => {
    const move = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 50;
      const y = (window.innerHeight / 2 - e.clientY) / 50;

      if (cardRef.current) {
        cardRef.current.style.transform =
          `rotateY(${x}deg) rotateX(${y}deg)`;
      }

      if (bgRef.current) {
        bgRef.current.style.transform =
          `translateX(${x * 2}px) translateY(${y * 2}px)`;
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ===== PARTICLE BACKGROUND ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      v: Math.random() * 0.5 + 0.2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(245,199,122,0.6)";

      particles.forEach(p => {
        p.y -= p.v;
        if (p.y < 0) p.y = canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===== COUNTDOWN + CONFETTI ===== */
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let launch = new Date(now.getFullYear(), now.getMonth(), 25, 0, 0, 0);
      if (now > launch)
        launch = new Date(now.getFullYear(), now.getMonth() + 1, 25, 0, 0, 0);

      const diff = launch - now;

      if (diff <= 0 && !launched) {
        setLaunched(true);

        confetti({ particleCount: 350, spread: 160, origin: { y: 0.6 } });
      }

      setTime({
        d: Math.max(0, Math.floor(diff / 86400000)),
        h: Math.max(0, Math.floor(diff / 3600000) % 24),
        m: Math.max(0, Math.floor(diff / 60000) % 60),
        s: Math.max(0, Math.floor(diff / 1000) % 60),
      });
    };

    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [launched]);

  return (
    <>
      <style>{`
      :root{
        --bg:#050406;
        --gold:#f5c77a;
        --gold-soft:#e0b86b;
        --gold-glow:rgba(245,199,122,.55);
        --white:rgba(255,255,255,.95);
      }

      *{margin:0;padding:0;box-sizing:border-box}
      html,body,#root{
        height:100%;
        font-family:"Outfit",system-ui;
        background:var(--bg);
        overflow:hidden;
      }

      /* ===== 3D BACKGROUND ===== */
      .bg-3d{
        position:fixed;
        inset:-10%;
        z-index:0;
        background:
          radial-gradient(60% 40% at 20% 30%, rgba(245,199,122,.18), transparent 65%),
          radial-gradient(50% 35% at 80% 70%, rgba(224,184,107,.15), transparent 65%),
          linear-gradient(180deg,#070509,#020103);
        filter: blur(60px);
        transition: transform .15s ease-out;
      }

      .bg-canvas{
        position:fixed;
        inset:0;
        z-index:1;
      }

      .space{
        position:fixed;
        inset:0;
        z-index:2;
        animation: shimmer 18s ease-in-out infinite alternate;
      }

      @keyframes shimmer{
        from{filter:brightness(1)}
        to{filter:brightness(1.12)}
      }

      .ui{
        position:fixed;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        perspective:1400px;
        z-index:5;
      }

      .card{
        width:min(1100px,94%);
        padding:40px;
        border-radius:22px;
        display:flex;
        gap:36px;
        background:rgba(255,255,255,.04);
        border:1px solid rgba(245,199,122,.25);
        backdrop-filter:blur(18px);
        box-shadow:0 40px 120px rgba(0,0,0,.85);
        transition:transform .15s ease-out;
      }

      .left{flex:1}

      .badge{
        padding:7px 16px;
        border-radius:999px;
        font-size:12px;
        font-weight:700;
        background:rgba(245,199,122,.15);
        color:var(--gold);
        display:inline-block;
        margin-bottom:16px;
      }

      h1{
        font-size:clamp(32px,5vw,56px);
        font-weight:800;
        color:var(--white);
        margin-bottom:14px;
      }

      p{
        color:rgba(255,255,255,.82);
        margin-bottom:28px;
      }

      .countdown{
        display:flex;
        gap:14px;
        margin-bottom:30px;
      }

      .counter{
        min-width:96px;
        padding:16px 10px;
        text-align:center;
        font-size:26px;
        font-weight:900;
        color:#000;
        border-radius:14px;
        background:linear-gradient(180deg,var(--gold),var(--gold-soft));
        box-shadow:0 0 30px var(--gold-glow);
      }
  .image-card img{
        width:100%;height:100%;
        object-fit:contain;
        filter:brightness(1.15) contrast(1.05)
      }
      .counter span{
        display:block;
        font-size:12px;
        font-weight:700;
      }

      .btn{
        padding:15px 34px;
        border-radius:999px;
        border:none;
        font-weight:800;
        cursor:pointer;
        color:#000;
        background:linear-gradient(90deg,var(--gold),var(--gold-soft));
      }

      .right{
        width:380px;
        display:flex;
        align-items:center;
      }

      .image-card{
        width:100%;
        height:260px;
        border-radius:20px;
        overflow:hidden;
        box-shadow:0 30px 80px rgba(0,0,0,.7);
        animation:float 7s ease-in-out infinite;
      }

      @keyframes float{
        50%{transform:translateY(-12px)}
      }
      `}</style>

      {loading && (
        <div className="loader">
          <span></span><span></span><span></span><span></span>
        </div>
      )}

      {/* ===== 3D BACKGROUND LAYERS ===== */}
      <div ref={bgRef} className="bg-3d"></div>
      <canvas ref={canvasRef} className="bg-canvas"></canvas>
      <div className="space"></div>

      <div className="ui">
        <div className="card" ref={cardRef}>
          <div className="left">
            <span className="badge">REYES CITY RP</span>
            <h1>SERVER LAUNCHING SOON</h1>
            <p>Serious RP • Custom Systems • Immersive City</p>

            <div className="countdown">
              <div className="counter">{time.d}<span>DAYS</span></div>
              <div className="counter">{time.h}<span>HOURS</span></div>
              <div className="counter">{time.m}<span>MIN</span></div>
              <div className="counter">{time.s}<span>SEC</span></div>
            </div>

            <button
              className="btn"
              onClick={() => window.open("https://discord.gg/NYtkT79Z","_blank")}
            >
              Join Discord
            </button>
          </div>

          <div className="right">
            <div className="image-card">
              <img
                src="/logo_reyes_city.png"
                alt="Reyes City"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
