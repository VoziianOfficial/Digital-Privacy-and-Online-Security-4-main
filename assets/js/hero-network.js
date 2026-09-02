(() => {
  "use strict";

  const HERO_CONFIGS = [
    {
      selector: ".home-hero",
      type: "home",
      major: 7,
      mobileMajor: 5,
      secondary: 15,
      mobileSecondary: 8,
      backPaths: 9,
      mobileBackPaths: 5,
      mainRoutes: 12,
      mobileMainRoutes: 7,
      tempRoutes: 3,
      drift: 1,
      pulseRate: 0.045,
      reflowEvery: 230
    },
    {
      selector: ".service-hero",
      type: "service",
      major: 6,
      mobileMajor: 4,
      secondary: 11,
      mobileSecondary: 6,
      backPaths: 7,
      mobileBackPaths: 4,
      mainRoutes: 9,
      mobileMainRoutes: 5,
      tempRoutes: 2,
      drift: 0.78,
      pulseRate: 0.052,
      reflowEvery: 290
    },
    {
      selector: ".legal-hero",
      type: "legal",
      major: 4,
      mobileMajor: 3,
      secondary: 6,
      mobileSecondary: 4,
      backPaths: 4,
      mobileBackPaths: 3,
      mainRoutes: 5,
      mobileMainRoutes: 3,
      tempRoutes: 1,
      drift: 0.42,
      pulseRate: 0.026,
      reflowEvery: 460
    }
  ];

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const touchQuery = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  );

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (from, to, amount) =>
    from + (to - from) * amount;

  const smoothstep = (value) =>
    value * value * (3 - 2 * value);

  const dpr = () =>
    Math.min(window.devicePixelRatio || 1, 2);

  const randomFactory = (seed) => {
    let value = seed >>> 0;

    return () => {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  class SecureDataField {
    constructor(hero, config, index) {
      this.hero = hero;
      this.config = config;
      this.random = randomFactory(
        14411 + index * 881 + config.type.length * 53
      );

      this.canvas = document.createElement("canvas");
      this.canvas.className = "secure-network-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      this.ctx = this.canvas.getContext("2d", {
        alpha: true
      });

      this.width = 1;
      this.height = 1;
      this.pixelRatio = dpr();
      this.frame = 0;
      this.visible = false;
      this.running = false;
      this.raf = 0;
      this.lastTime = 0;

      this.nodes = [];
      this.backPaths = [];
      this.routes = [];
      this.tempRoutes = [];
      this.pulses = [];

      this.pointer = {
        enabled:
          !touchQuery.matches &&
          !reducedMotionQuery.matches,
        active: false,
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        vx: 0,
        vy: 0,
        speed: 0,
        strength: 0
      };

      this.hero.prepend(this.canvas);

      this.resizeObserver =
        new ResizeObserver(() => this.resize());
      this.intersectionObserver =
        new IntersectionObserver(
          (entries) => {
            this.visible =
              Boolean(entries[0]?.isIntersecting);
            this.syncLoop();
          },
          {
            rootMargin: "160px 0px"
          }
        );

      this.addPointerEvents();
      this.resizeObserver.observe(this.hero);
      this.intersectionObserver.observe(this.hero);
      this.resize();
    }

    addPointerEvents() {
      if (!this.pointer.enabled) return;

      this.hero.addEventListener(
        "pointermove",
        (event) => {
          if (
            event.pointerType &&
            event.pointerType !== "mouse" &&
            event.pointerType !== "pen"
          ) {
            return;
          }

          const rect = this.hero.getBoundingClientRect();
          this.pointer.active = true;
          this.pointer.tx = event.clientX - rect.left;
          this.pointer.ty = event.clientY - rect.top;
        },
        {
          passive: true
        }
      );

      this.hero.addEventListener(
        "pointerleave",
        () => {
          this.pointer.active = false;
        },
        {
          passive: true
        }
      );
    }

    resize() {
      const rect = this.hero.getBoundingClientRect();

      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.pixelRatio = dpr();

      this.canvas.width =
        Math.round(this.width * this.pixelRatio);
      this.canvas.height =
        Math.round(this.height * this.pixelRatio);
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";

      this.ctx.setTransform(
        this.pixelRatio,
        0,
        0,
        this.pixelRatio,
        0,
        0
      );

      this.buildField();
      this.draw(0);
    }

    buildField() {
      const mobile = this.width < 760;
      const majorCount = mobile
        ? this.config.mobileMajor
        : this.config.major;
      const secondaryCount = mobile
        ? this.config.mobileSecondary
        : this.config.secondary;

      const majorNodes = this.makeMajorNodes(majorCount);

      this.nodes = [
        ...majorNodes,
        ...this.makeSecondaryNodes(secondaryCount, majorNodes)
      ];
      this.backPaths = this.makeBackPaths(
        mobile
          ? this.config.mobileBackPaths
          : this.config.backPaths
      );
      this.routes = this.makeRoutes(
        mobile
          ? this.config.mobileMainRoutes
          : this.config.mainRoutes,
        true
      );
      this.tempRoutes = [];
      this.pulses = [];
    }

    makeMajorNodes(count) {
      const maps = {
        home: [
          [0.1, 0.27],
          [0.27, 0.17],
          [0.54, 0.25],
          [0.82, 0.18],
          [0.18, 0.72],
          [0.48, 0.68],
          [0.76, 0.74]
        ],
        service: [
          [0.11, 0.33],
          [0.34, 0.22],
          [0.58, 0.36],
          [0.83, 0.27],
          [0.42, 0.72],
          [0.74, 0.68]
        ],
        legal: [
          [0.15, 0.34],
          [0.46, 0.2],
          [0.78, 0.42],
          [0.58, 0.72]
        ]
      };

      return maps[this.config.type]
        .slice(0, count)
        .map((point, index) => {
          const x =
            clamp(
              point[0] + (this.random() - 0.5) * 0.045,
              0.07,
              0.93
            ) * this.width;
          const y =
            clamp(
              point[1] + (this.random() - 0.5) * 0.06,
              0.12,
              0.86
            ) * this.height;

          return {
            major: true,
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            radius:
              this.config.type === "legal"
                ? 10 + this.random() * 3
                : 11 + this.random() * 5,
            shape:
              index % 4 === 0
                ? "double-ring"
                : index % 4 === 1
                  ? "rounded-square"
                  : index % 4 === 2
                    ? "diamond"
                    : "ring",
            phase: this.random() * Math.PI * 2,
            depth: lerp(0.72, 1, this.random()),
            active: 0
          };
        });
    }

    makeSecondaryNodes(count, majors) {
      const nodes = [];

      for (let i = 0; i < count; i += 1) {
        const anchor =
          majors[Math.floor(this.random() * majors.length)];
        const angle = this.random() * Math.PI * 2;
        const distance = lerp(
          58,
          this.config.type === "home" ? 155 : 118,
          this.random()
        );
        const x =
          anchor.baseX + Math.cos(angle) * distance;
        const y =
          anchor.baseY +
          Math.sin(angle) * distance * 0.62;
        const shapeRoll = this.random();

        nodes.push({
          major: false,
          x: clamp(x, this.width * 0.04, this.width * 0.96),
          y: clamp(y, this.height * 0.08, this.height * 0.9),
          baseX: clamp(x, this.width * 0.04, this.width * 0.96),
          baseY: clamp(y, this.height * 0.08, this.height * 0.9),
          vx: 0,
          vy: 0,
          radius: lerp(4, 9, this.random()),
          shape:
            shapeRoll > 0.82
              ? "ring"
              : shapeRoll > 0.5
                ? "hex"
                : "rounded-square",
          phase: this.random() * Math.PI * 2,
          depth: lerp(0.42, 0.82, this.random()),
          active: 0
        });
      }

      return nodes;
    }

    makeBackPaths(count) {
      const paths = [];

      for (let i = 0; i < count; i += 1) {
        const y = lerp(
          this.height * 0.16,
          this.height * 0.84,
          this.random()
        );
        const direction = i % 2 === 0 ? 1 : -1;
        const startX =
          direction > 0
            ? -this.width * lerp(0.08, 0.28, this.random())
            : this.width * lerp(1.08, 1.28, this.random());
        const endX =
          direction > 0
            ? this.width * lerp(0.92, 1.22, this.random())
            : -this.width * lerp(0.08, 0.22, this.random());
        const lift =
          lerp(
            this.height * 0.12,
            this.height * 0.32,
            this.random()
          ) * (this.random() > 0.5 ? 1 : -1);

        paths.push({
          start: [startX, y],
          cp1: [
            lerp(startX, endX, 0.28),
            y + lift
          ],
          cp2: [
            lerp(startX, endX, 0.68),
            y - lift * 0.7
          ],
          end: [endX, y + lift * 0.22],
          alpha: lerp(0.12, 0.2, this.random()),
          width: lerp(1.4, 2.1, this.random()),
          phase: this.random() * Math.PI * 2,
          speed: lerp(0.025, 0.055, this.random()),
          depth: lerp(0.18, 0.36, this.random())
        });
      }

      return paths;
    }

    makeRoutes(count, initial = false) {
      const majors = this.nodes
        .map((node, index) => ({ node, index }))
        .filter((entry) => entry.node.major);
      const pairs = [];

      for (let a = 0; a < majors.length; a += 1) {
        for (let b = a + 1; b < majors.length; b += 1) {
          const left = majors[a];
          const right = majors[b];
          const distance = Math.hypot(
            left.node.baseX - right.node.baseX,
            left.node.baseY - right.node.baseY
          );
          const serviceFlow =
            this.config.type === "service" &&
            right.node.baseX > left.node.baseX
              ? -90
              : 0;

          pairs.push({
            a: left.index,
            b: right.index,
            score: distance + serviceFlow + this.random() * 210
          });
        }
      }

      return pairs
        .sort((left, right) => left.score - right.score)
        .slice(0, count)
        .map((pair, index) =>
          this.createRoute(pair.a, pair.b, index, initial)
        );
    }

    createRoute(a, b, index, initial = false) {
      return {
        a,
        b,
        alpha: initial ? 1 : 0,
        targetAlpha: 1,
        fadeSpeed: lerp(0.012, 0.022, this.random()),
        width: lerp(1.4, 2.2, this.random()),
        baseOpacity: lerp(0.35, 0.55, this.random()),
        active: this.random() > 0.55,
        phase: this.random() * Math.PI * 2,
        bend: lerp(0.18, 0.38, this.random()) *
          (this.random() > 0.5 ? 1 : -1),
        depth: lerp(0.58, 1, this.random()),
        life: this.random() * 260,
        age: 0,
        temp: false,
        lane: index
      };
    }

    syncLoop() {
      const shouldRun =
        this.visible && !reducedMotionQuery.matches;

      if (shouldRun && !this.running) {
        this.running = true;
        this.lastTime = performance.now();
        this.raf = requestAnimationFrame(
          (time) => this.tick(time)
        );
      } else if (!shouldRun && this.running) {
        this.running = false;
        cancelAnimationFrame(this.raf);
        this.draw(0);
      }
    }

    tick(time) {
      if (!this.running) return;

      const dt = clamp(
        (time - this.lastTime) / 16.67,
        0.35,
        2
      );

      this.lastTime = time;
      this.frame += 1;
      this.update(dt, time * 0.001);
      this.draw(time * 0.001);

      this.raf = requestAnimationFrame(
        (nextTime) => this.tick(nextTime)
      );
    }

    update(dt, time) {
      this.updatePointer(dt);
      this.updateNodes(dt, time);
      this.updateRoutes(dt);
      this.updateTempRoutes(dt);
      this.updatePulses(dt);
    }

    updatePointer(dt) {
      const pointer = this.pointer;

      if (!pointer.enabled) return;

      const oldX = pointer.x;
      const oldY = pointer.y;

      pointer.x = lerp(pointer.x, pointer.tx, 0.105 * dt);
      pointer.y = lerp(pointer.y, pointer.ty, 0.105 * dt);
      pointer.vx = lerp(pointer.vx, pointer.x - oldX, 0.2);
      pointer.vy = lerp(pointer.vy, pointer.y - oldY, 0.2);
      pointer.speed = lerp(
        pointer.speed,
        Math.hypot(pointer.vx, pointer.vy),
        0.08 * dt
      );
      pointer.strength = lerp(
        pointer.strength,
        pointer.active ? 1 : 0,
        0.045 * dt
      );

      if (
        pointer.active &&
        pointer.strength > 0.32 &&
        this.frame % 34 === 0
      ) {
        this.spawnPointerRoutes();
      }
    }

    updateNodes(dt, time) {
      const pointer = this.pointer;
      const influenceRadius = this.width < 760 ? 0 : 290;

      this.nodes.forEach((node, index) => {
        const slow =
          node.major ? 0.08 : 0.16;
        const amplitude =
          (node.major ? 7 : 13) *
          this.config.drift *
          node.depth;
        let targetX =
          node.baseX +
          Math.cos(time * slow + node.phase) * amplitude;
        let targetY =
          node.baseY +
          Math.sin(time * slow * 0.82 + node.phase) *
            amplitude *
            0.72;
        let active = 0;

        if (
          pointer.enabled &&
          pointer.strength > 0.01
        ) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const influence =
            Math.max(0, 1 - distance / influenceRadius) *
            pointer.strength;

          if (influence > 0) {
            const elastic =
              node.major ? 30 : 22;
            const velocityBoost =
              clamp(pointer.speed / 20, 0, 1) * 14;

            targetX +=
              (dx / distance) *
              (elastic + velocityBoost) *
              influence *
              node.depth;
            targetY +=
              (dy / distance) *
              (elastic + velocityBoost) *
              influence *
              node.depth;
            active = influence;
          }
        }

        node.active = lerp(node.active, active, 0.08 * dt);
        node.vx += (targetX - node.x) * 0.011 * dt;
        node.vy += (targetY - node.y) * 0.011 * dt;
        node.vx *= Math.pow(node.major ? 0.9 : 0.88, dt);
        node.vy *= Math.pow(node.major ? 0.9 : 0.88, dt);
        node.x += node.vx * dt;
        node.y += node.vy * dt;

        if (index % 5 === 0 && !node.major) {
          node.x += Math.sin(time * 0.22 + node.phase) * 0.03;
        }
      });
    }

    updateRoutes(dt) {
      this.routes.forEach((route) => {
        route.alpha = lerp(
          route.alpha,
          route.targetAlpha,
          route.fadeSpeed * dt
        );
        route.age += dt;
        route.life += dt;
      });

      if (
        this.frame > 80 &&
        this.frame % this.config.reflowEvery === 0
      ) {
        const live = this.routes.filter(
          (route) => route.targetAlpha > 0
        );
        const route =
          live[Math.floor(this.random() * live.length)];

        if (route) {
          route.targetAlpha = 0;
          route.fadeSpeed = lerp(0.009, 0.015, this.random());
        }

        const newRoute = this.makeRoutes(1, false)[0];
        if (newRoute) {
          newRoute.alpha = 0;
          newRoute.fadeSpeed = lerp(0.011, 0.018, this.random());
          this.routes.push(newRoute);
        }
      }

      this.routes = this.routes.filter(
        (route) =>
          route.targetAlpha > 0 || route.alpha > 0.015
      );
    }

    updateTempRoutes(dt) {
      this.tempRoutes.forEach((route) => {
        route.alpha = lerp(
          route.alpha,
          route.targetAlpha,
          route.fadeSpeed * dt
        );
        route.age += dt;

        if (route.age > route.life) {
          route.targetAlpha = 0;
        }
      });

      this.tempRoutes = this.tempRoutes.filter(
        (route) =>
          route.targetAlpha > 0 || route.alpha > 0.012
      );
    }

    updatePulses(dt) {
      this.pulses = this.pulses
        .map((pulse) => ({
          ...pulse,
          t: pulse.t + pulse.speed * dt
        }))
        .filter((pulse) => pulse.t < 1.08);

      const pool = [
        ...this.routes,
        ...this.tempRoutes
      ].filter((route) => route.alpha > 0.2);

      if (
        pool.length &&
        this.pulses.length < 6 &&
        this.random() < this.config.pulseRate
      ) {
        const route =
          pool[Math.floor(this.random() * pool.length)];

        this.pulses.push({
          route,
          t: -0.06,
          speed:
            this.config.type === "legal"
              ? lerp(0.006, 0.011, this.random())
              : lerp(0.009, 0.019, this.random())
        });
      }
    }

    spawnPointerRoutes() {
      const pointer = this.pointer;
      const candidates = this.nodes
        .map((node, index) => ({
          node,
          index,
          distance: Math.hypot(
            node.x - pointer.x,
            node.y - pointer.y
          )
        }))
        .filter((entry) => entry.distance < 320)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6);

      if (candidates.length < 2) return;

      while (this.tempRoutes.length >= this.config.tempRoutes) {
        this.tempRoutes[0].targetAlpha = 0;
        break;
      }

      const a = candidates[0];
      const b =
        candidates[
          1 + Math.floor(this.random() * (candidates.length - 1))
        ];

      if (!a || !b || a.index === b.index) return;

      this.tempRoutes.push({
        a: a.index,
        b: b.index,
        alpha: 0,
        targetAlpha: lerp(0.46, 0.65, this.random()),
        fadeSpeed: lerp(0.018, 0.026, this.random()),
        width: lerp(1.5, 2.25, this.random()),
        baseOpacity: 1,
        active: true,
        phase: this.random() * Math.PI * 2,
        bend:
          lerp(0.24, 0.44, this.random()) *
          (this.random() > 0.5 ? 1 : -1),
        depth: 1,
        life: lerp(95, 160, this.random()),
        age: 0,
        temp: true,
        lane: 0
      });
    }

    routeCurve(route, time, layerShift = 0) {
      const a = this.nodes[route.a];
      const b = this.nodes[route.b];

      if (!a || !b) return null;

      const pointer = this.pointer;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const normalX = -dy / distance;
      const normalY = dx / distance;
      const midpointX = (a.x + b.x) / 2;
      const midpointY = (a.y + b.y) / 2;
      const baseBend =
        distance * route.bend +
        Math.sin(time * 0.18 + route.phase) * 18;
      let fieldX = 0;
      let fieldY = 0;

      if (
        pointer.enabled &&
        pointer.strength > 0.01
      ) {
        const pDistance = Math.max(
          1,
          Math.hypot(pointer.x - midpointX, pointer.y - midpointY)
        );
        const influence =
          Math.max(0, 1 - pDistance / 360) *
          pointer.strength;

        if (influence > 0) {
          const stretch =
            0.2 + clamp(pointer.speed / 28, 0, 0.8);
          fieldX =
            (pointer.x - midpointX) * influence * stretch;
          fieldY =
            (pointer.y - midpointY) * influence * stretch;
        }
      }

      return {
        start: [a.x, a.y],
        cp1: [
          lerp(a.x, b.x, 0.33) +
            normalX * baseBend * 0.72 +
            fieldX * 0.28 +
            layerShift,
          lerp(a.y, b.y, 0.33) +
            normalY * baseBend * 0.72 +
            fieldY * 0.28
        ],
        cp2: [
          lerp(a.x, b.x, 0.68) +
            normalX * baseBend +
            fieldX * 0.52 -
            layerShift,
          lerp(a.y, b.y, 0.68) +
            normalY * baseBend +
            fieldY * 0.52
        ],
        end: [b.x, b.y]
      };
    }

    draw(time) {
      const ctx = this.ctx;

      ctx.clearRect(0, 0, this.width, this.height);
      this.drawAtmosphere();
      this.drawBackLayer(time);
      this.drawMainNetwork(time);
      this.drawNodes(time);
      this.drawPulses(time);
      this.applyReadabilityMask();
    }

    drawAtmosphere() {
      const ctx = this.ctx;
      const mainGlow = ctx.createRadialGradient(
        this.width * 0.68,
        this.height * 0.38,
        0,
        this.width * 0.68,
        this.height * 0.38,
        Math.max(this.width, this.height) * 0.72
      );

      mainGlow.addColorStop(0, "rgba(82, 126, 151, 0.16)");
      mainGlow.addColorStop(0.46, "rgba(49, 74, 88, 0.08)");
      mainGlow.addColorStop(1, "rgba(2, 3, 4, 0)");

      ctx.fillStyle = mainGlow;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    drawBackLayer(time) {
      const ctx = this.ctx;
      const parallaxX =
        this.pointer.enabled
          ? (this.pointer.x - this.width / 2) *
            this.pointer.strength *
            0.012
          : 0;
      const parallaxY =
        this.pointer.enabled
          ? (this.pointer.y - this.height / 2) *
            this.pointer.strength *
            0.008
          : 0;

      this.backPaths.forEach((path) => {
        const wave =
          Math.sin(time * path.speed + path.phase) * 22;

        ctx.save();
        ctx.globalAlpha = path.alpha;
        ctx.strokeStyle = "rgba(132, 169, 184, 0.9)";
        ctx.lineWidth = path.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
          path.start[0] + parallaxX,
          path.start[1] + parallaxY
        );
        ctx.bezierCurveTo(
          path.cp1[0] + parallaxX,
          path.cp1[1] + wave + parallaxY,
          path.cp2[0] + parallaxX,
          path.cp2[1] - wave * 0.6 + parallaxY,
          path.end[0] + parallaxX,
          path.end[1] + parallaxY
        );
        ctx.stroke();
        ctx.restore();
      });
    }

    drawMainNetwork(time) {
      [...this.routes, ...this.tempRoutes].forEach((route) => {
        const curve = this.routeCurve(route, time);
        if (!curve) return;

        const opacity =
          route.alpha *
          route.baseOpacity *
          (route.active ? 1.14 : 1);

        this.strokeCurve(
          curve,
          opacity,
          route.width,
          route.active,
          route.temp
        );
      });
    }

    strokeCurve(curve, opacity, width, active, temp) {
      const ctx = this.ctx;

      ctx.save();
      ctx.globalAlpha = clamp(
        opacity,
        0,
        active || temp ? 0.65 : 0.55
      );
      ctx.strokeStyle =
        active || temp
          ? "rgba(198, 224, 228, 0.95)"
          : "rgba(150, 183, 195, 0.9)";
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(curve.start[0], curve.start[1]);
      ctx.bezierCurveTo(
        curve.cp1[0],
        curve.cp1[1],
        curve.cp2[0],
        curve.cp2[1],
        curve.end[0],
        curve.end[1]
      );
      ctx.stroke();

      if (active || temp) {
        ctx.globalAlpha = clamp(opacity * 0.23, 0, 0.18);
        ctx.strokeStyle = "rgba(143, 218, 226, 0.9)";
        ctx.lineWidth = width + 4.8;
        ctx.stroke();
      }

      ctx.restore();
    }

    drawNodes(time) {
      this.nodes.forEach((node) => {
        const ctx = this.ctx;
        const alpha =
          (node.major ? 0.48 : 0.32) +
          node.depth * 0.14 +
          node.active * 0.18;

        if (node.major || node.active > 0.04) {
          const halo = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * (node.major ? 5.8 : 3.8)
          );

          halo.addColorStop(
            0,
            `rgba(158, 211, 221, ${
              node.major ? 0.11 + node.active * 0.16 : node.active * 0.12
            })`
          );
          halo.addColorStop(1, "rgba(158, 211, 221, 0)");

          ctx.fillStyle = halo;
          ctx.fillRect(
            node.x - node.radius * 6,
            node.y - node.radius * 6,
            node.radius * 12,
            node.radius * 12
          );
        }

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(
          node.shape === "diamond"
            ? Math.PI / 4
            : Math.sin(time * 0.08 + node.phase) * 0.08
        );
        ctx.globalAlpha =
          alpha + Math.sin(time * 0.5 + node.phase) * 0.025;
        ctx.strokeStyle = "rgba(210, 226, 229, 0.9)";
        ctx.fillStyle = node.major
          ? "rgba(16, 24, 28, 0.72)"
          : "rgba(158, 188, 198, 0.18)";
        ctx.lineWidth = node.major ? 1.15 : 0.95;

        this.drawNodeShape(ctx, node);
        ctx.restore();
      });
    }

    drawNodeShape(ctx, node) {
      const r = node.radius;

      if (node.shape === "ring") {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      if (node.shape === "double-ring") {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha *= 0.58;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      if (node.shape === "hex") {
        ctx.beginPath();
        for (let i = 0; i < 6; i += 1) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * r * 0.62;
          const y = Math.sin(angle) * r * 0.62;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return;
      }

      const size = r * (node.major ? 0.95 : 0.78);
      const radius = node.major ? 3 : 2;
      const x = -size / 2;
      const y = -size / 2;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(
        x + size,
        y + size,
        x + size - radius,
        y + size
      );
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    drawPulses(time) {
      this.pulses.forEach((pulse) => {
        const curve = this.routeCurve(
          pulse.route,
          time,
          pulse.route.temp ? 8 : 0
        );
        if (!curve) return;

        const head = this.pointOnBezier(curve, pulse.t);
        const tail = this.pointOnBezier(curve, pulse.t - 0.075);
        const fade = Math.sin(clamp(pulse.t, 0, 1) * Math.PI);
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(
          tail.x,
          tail.y,
          head.x,
          head.y
        );

        gradient.addColorStop(0, "rgba(179, 224, 231, 0)");
        gradient.addColorStop(
          0.54,
          `rgba(184, 226, 232, ${0.68 * fade})`
        );
        gradient.addColorStop(
          1,
          `rgba(230, 247, 247, ${0.9 * fade})`
        );

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = pulse.route.temp ? 2.4 : 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    pointOnBezier(curve, value) {
      const t = clamp(value, 0, 1);
      const mt = 1 - t;
      const x =
        mt * mt * mt * curve.start[0] +
        3 * mt * mt * t * curve.cp1[0] +
        3 * mt * t * t * curve.cp2[0] +
        t * t * t * curve.end[0];
      const y =
        mt * mt * mt * curve.start[1] +
        3 * mt * mt * t * curve.cp1[1] +
        3 * mt * t * t * curve.cp2[1] +
        t * t * t * curve.end[1];

      return {
        x,
        y
      };
    }

    applyReadabilityMask() {
      const selectors = [
        ".home-hero__copy",
        ".home-hero__cta",
        ".home-hero__word-wrap",
        ".service-hero__intro",
        ".service-hero__copy",
        ".service-hero__actions",
        ".service-hero__word-wrap",
        ".legal-hero__main",
        ".legal-hero__meta",
        ".legal-hero__word"
      ];
      const heroRect = this.hero.getBoundingClientRect();
      const ctx = this.ctx;

      selectors
        .map((selector) => this.hero.querySelector(selector))
        .filter(Boolean)
        .forEach((element) => {
          const rect = element.getBoundingClientRect();
          const x = rect.left - heroRect.left - rect.width * 0.14;
          const y = rect.top - heroRect.top - rect.height * 0.2;
          const width = rect.width * 1.28;
          const height = rect.height * 1.4;
          const radius = Math.max(width, height) * 0.55;
          const gradient = ctx.createRadialGradient(
            x + width / 2,
            y + height / 2,
            0,
            x + width / 2,
            y + height / 2,
            radius
          );

          gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
          gradient.addColorStop(0.58, "rgba(0, 0, 0, 0.18)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = gradient;
          ctx.fillRect(
            x - radius * 0.22,
            y - radius * 0.22,
            width + radius * 0.44,
            height + radius * 0.44
          );
          ctx.restore();
        });
    }
  }

  const init = () => {
    if (
      !("ResizeObserver" in window) ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    HERO_CONFIGS.forEach((config, configIndex) => {
      document
        .querySelectorAll(config.selector)
        .forEach((hero, heroIndex) => {
          if (hero.dataset.secureNetworkReady) {
            return;
          }

          hero.dataset.secureNetworkReady = "true";
          new SecureDataField(
            hero,
            config,
            configIndex * 10 + heroIndex
          );
        });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
