<template>
  <div class="app-shell">
    <section class="panel">
      <h2>Character Builder</h2>
      <div class="controls">
        <div class="section">
          <label for="character">Base Character</label>
          <select id="character" v-model="state.character">
            <option v-for="option in characters" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="section">
          <label for="variant">Variant</label>
          <select id="variant" v-model="state.variant">
            <option v-for="variant in variants" :key="variant" :value="variant">
              {{ variant }}
            </option>
          </select>
        </div>
        <div class="section">
          <label for="animation">Animation</label>
          <select id="animation" v-model="state.animation">
            <option v-for="animation in animationList" :key="animation" :value="animation">
              {{ animation }}
            </option>
          </select>
        </div>
        <div class="section">
          <label for="sprite-size">Sprite Size</label>
          <select id="sprite-size" v-model.number="state.spriteSize">
            <option v-for="size in spriteSizes" :key="size" :value="size">{{ size }}x{{ size }}</option>
          </select>
        </div>
        <div class="section toggle-row">
          <label for="real-size">Real Size</label>
          <label class="switch" for="real-size">
            <input id="real-size" type="checkbox" v-model="state.realSize" />
            <span aria-hidden="true" class="switch-track"></span>
            <span class="switch-label">{{ state.realSize ? "On" : "Scaled" }}</span>
          </label>
        </div>
        <div class="section">
          <label for="fps">FPS</label>
          <input id="fps" type="number" min="4" max="24" step="1" v-model.number="state.fps" />
        </div>
        <div class="section">
          <button type="button" @click="showExport = true">Export Sprite Sheet</button>
        </div>
      </div>
    </section>

    <section class="panel preview-panel">
      <h2>Live Preview</h2>
      <div class="preview-canvas-wrapper">
        <canvas ref="previewCanvas" class="preview-canvas" :style="previewCanvasStyle"></canvas>
      </div>
      <div class="preview-meta">
        <div>
          <strong>Character</strong><br />
          {{ state.character }} - {{ state.variant }}
        </div>
        <div>
          <strong>Animation</strong><br />
          {{ state.animation }} @ {{ state.fps }} FPS
        </div>
        <div>
          <strong>Frame Size</strong><br />
          {{ state.spriteSize }}x{{ state.spriteSize }}
        </div>
        <div>
          <strong>Display</strong><br />
          {{ state.realSize ? "Real size" : "Scaled up" }}
        </div>
      </div>
    </section>
  </div>

  <div v-if="showExport" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <h2>Export Sprite Sheet</h2>
      <p>Select which animations to include in the PNG sprite sheet.</p>
      <div class="checkbox-list">
        <label v-for="animation in animationList" :key="animation">
          <input type="checkbox" v-model="exportSelections" :value="animation" />
          {{ animation }} ({{ animations[animation].frames }} frames)
        </label>
      </div>
      <div class="footer-actions">
        <button type="button" class="secondary" @click="showExport = false">Cancel</button>
        <button type="button" @click="handleExport">Export PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

const characters = [
  "Vanguard",
  "Ranger",
  "Mystic",
  "Engineer",
  "Nomad",
];
const variants = ["Variant 01", "Variant 02", "Variant 03", "Variant 04", "Variant 05"];
const animationList = ["idle", "walk", "run", "attack"];
const spriteSizes = [16, 24, 32];

const animations = {
  idle: { frames: 8 },
  walk: { frames: 8 },
  run: { frames: 8 },
  attack: { frames: 6 },
};

const palettes = {
  Vanguard: [
    { skin: "#f2d4c5", armor: "#64748b", accent: "#1d4ed8" },
    { skin: "#e7c2ad", armor: "#475569", accent: "#0f766e" },
    { skin: "#e9c8b9", armor: "#334155", accent: "#7c3aed" },
    { skin: "#f2d4c5", armor: "#1f2937", accent: "#dc2626" },
    { skin: "#e9bfa8", armor: "#475569", accent: "#f59e0b" },
  ],
  Ranger: [
    { skin: "#f5d1b4", armor: "#15803d", accent: "#166534" },
    { skin: "#eac0a3", armor: "#14532d", accent: "#84cc16" },
    { skin: "#f2c9b2", armor: "#166534", accent: "#0ea5e9" },
    { skin: "#e7b79a", armor: "#0f3d27", accent: "#f97316" },
    { skin: "#f1c2a3", armor: "#166534", accent: "#a3e635" },
  ],
  Mystic: [
    { skin: "#f3d9d0", armor: "#7e22ce", accent: "#d946ef" },
    { skin: "#ebc6bd", armor: "#6b21a8", accent: "#a21caf" },
    { skin: "#f0d1c7", armor: "#86198f", accent: "#4c1d95" },
    { skin: "#f0c9bd", armor: "#6d28d9", accent: "#f472b6" },
    { skin: "#e9bfb5", armor: "#5b21b6", accent: "#c026d3" },
  ],
  Engineer: [
    { skin: "#f2d0b8", armor: "#0f172a", accent: "#38bdf8" },
    { skin: "#e6bfa6", armor: "#1e293b", accent: "#22c55e" },
    { skin: "#f0c7b0", armor: "#111827", accent: "#f97316" },
    { skin: "#eac1aa", armor: "#1f2937", accent: "#facc15" },
    { skin: "#f2d0b8", armor: "#0f172a", accent: "#a855f7" },
  ],
  Nomad: [
    { skin: "#e7c2aa", armor: "#b45309", accent: "#78350f" },
    { skin: "#e1b69d", armor: "#92400e", accent: "#f97316" },
    { skin: "#e9c0a7", armor: "#a16207", accent: "#fde047" },
    { skin: "#e0b399", armor: "#7c2d12", accent: "#f59e0b" },
    { skin: "#e7c2aa", armor: "#92400e", accent: "#a16207" },
  ],
};

const state = reactive({
  character: characters[0],
  variant: variants[0],
  animation: animationList[0],
  spriteSize: spriteSizes[2],
  fps: 8,
  realSize: false,
});

const previewCanvas = ref(null);
const showExport = ref(false);
const exportSelections = ref([...animationList]);
const animationFrame = ref(0);

const sizeMap = {
  headRadius: 20,
  torsoWidth: 52,
  torsoHeight: 64,
  upperArm: 30,
  lowerArm: 24,
  hand: 10,
  upperLeg: 34,
  lowerLeg: 30,
  foot: 12,
  limbWidth: 12,
  legWidth: 14,
};

const characterColors = computed(() => {
  const palette = palettes[state.character][variants.indexOf(state.variant)];
  return {
    skin: palette.skin,
    armor: palette.armor,
    accent: palette.accent,
  };
});

const previewRenderSize = computed(() => (state.realSize ? state.spriteSize : previewDefaultSize));

const previewCanvasStyle = computed(() => {
  const pxSize = `${previewRenderSize.value}px`;
  return {
    width: pxSize,
    height: pxSize,
  };
});

const pose = reactive({
  bodyOffsetY: 0,
  headTilt: 0,
  rightUpperArm: 0,
  rightLowerArm: 0,
  rightHand: 0,
  leftUpperArm: 0,
  leftLowerArm: 0,
  leftHand: 0,
  rightUpperLeg: 0,
  rightLowerLeg: 0,
  rightFoot: 0,
  leftUpperLeg: 0,
  leftLowerLeg: 0,
  leftFoot: 0,
});

const previewDefaultSize = 260;
const viewBoxSize = 200;
const rootX = 100;
const rootY = 70;

const animationLoop = {
  frameId: null,
  startTime: performance.now(),
};

const computePose = (animation, t) => {
  const cycle = Math.sin(t * Math.PI * 2);
  const swing = Math.sin(t * Math.PI * 2);
  const swingFast = Math.sin(t * Math.PI * 4);
  const attackPhase = Math.min(1, Math.max(0, t * 1.2));
  const attackSwing = Math.sin(attackPhase * Math.PI);

  switch (animation) {
    case "walk":
      return {
        bodyOffsetY: Math.abs(swing) * -2,
        headTilt: swing * 2,
        rightUpperArm: swing * 30,
        rightLowerArm: swing * 10,
        rightHand: swing * 5,
        leftUpperArm: -swing * 30,
        leftLowerArm: -swing * 12,
        leftHand: -swing * 6,
        rightUpperLeg: -swing * 28,
        rightLowerLeg: Math.max(0, swing * 18),
        rightFoot: Math.max(0, swing * 5),
        leftUpperLeg: swing * 28,
        leftLowerLeg: Math.max(0, -swing * 18),
        leftFoot: Math.max(0, -swing * 5),
      };
    case "run":
      return {
        bodyOffsetY: Math.abs(swingFast) * -4,
        headTilt: swingFast * 3,
        rightUpperArm: swingFast * 45,
        rightLowerArm: swingFast * 20,
        rightHand: swingFast * 10,
        leftUpperArm: -swingFast * 45,
        leftLowerArm: -swingFast * 22,
        leftHand: -swingFast * 10,
        rightUpperLeg: -swingFast * 38,
        rightLowerLeg: Math.max(0, swingFast * 24),
        rightFoot: Math.max(0, swingFast * 10),
        leftUpperLeg: swingFast * 38,
        leftLowerLeg: Math.max(0, -swingFast * 24),
        leftFoot: Math.max(0, -swingFast * 10),
      };
    case "attack":
      return {
        bodyOffsetY: -2 * attackSwing,
        headTilt: -attackSwing * 4,
        rightUpperArm: -20 + attackSwing * 100,
        rightLowerArm: -10 + attackSwing * 50,
        rightHand: attackSwing * 20,
        leftUpperArm: 10 - attackSwing * 20,
        leftLowerArm: 8 - attackSwing * 10,
        leftHand: -attackSwing * 5,
        rightUpperLeg: -attackSwing * 10,
        rightLowerLeg: attackSwing * 5,
        rightFoot: attackSwing * 6,
        leftUpperLeg: attackSwing * 10,
        leftLowerLeg: -attackSwing * 5,
        leftFoot: -attackSwing * 6,
      };
    default:
      return {
        bodyOffsetY: cycle * -2,
        headTilt: cycle * 2,
        rightUpperArm: cycle * 6,
        rightLowerArm: cycle * 4,
        rightHand: cycle * 2,
        leftUpperArm: -cycle * 6,
        leftLowerArm: -cycle * 4,
        leftHand: -cycle * 2,
        rightUpperLeg: -cycle * 5,
        rightLowerLeg: cycle * 3,
        rightFoot: cycle * 2,
        leftUpperLeg: cycle * 5,
        leftLowerLeg: -cycle * 3,
        leftFoot: -cycle * 2,
      };
  }
};

const buildSVGMarkup = (poseValues, colors) => {
  const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="${state.spriteSize}" height="${state.spriteSize}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMax meet">`;
  const svgClose = "</svg>";

  const torsoX = rootX - sizeMap.torsoWidth / 2;
  const torsoY = rootY + 30;
  const headCenterY = rootY + 8;
  const shoulderY = torsoY + 12;
  const shoulderOffset = sizeMap.torsoWidth / 2 + 8;
  const hipY = torsoY + sizeMap.torsoHeight - 6;
  const hipOffset = 12;

  return `${svgOpen}
    <g transform="translate(0 ${poseValues.bodyOffsetY})">
      <g transform="translate(${rootX} ${headCenterY}) rotate(${poseValues.headTilt})">
        <circle cx="0" cy="0" r="${sizeMap.headRadius}" fill="${colors.skin}" />
        <circle cx="-6" cy="-4" r="3" fill="#1f2937" />
        <circle cx="6" cy="-4" r="3" fill="#1f2937" />
        <rect x="-8" y="6" width="16" height="4" rx="2" fill="#1f2937" />
      </g>
      <rect x="${torsoX}" y="${torsoY}" width="${sizeMap.torsoWidth}" height="${sizeMap.torsoHeight}" rx="10" fill="${colors.armor}" />
      <rect x="${torsoX + 10}" y="${torsoY + 16}" width="${sizeMap.torsoWidth - 20}" height="${sizeMap.torsoHeight - 32}" rx="8" fill="${colors.accent}" opacity="0.7" />
      ${buildArm(
        rootX + shoulderOffset,
        shoulderY,
        poseValues.rightUpperArm,
        poseValues.rightLowerArm,
        poseValues.rightHand,
        colors,
        "right"
      )}
      ${buildArm(
        rootX - shoulderOffset,
        shoulderY,
        poseValues.leftUpperArm,
        poseValues.leftLowerArm,
        poseValues.leftHand,
        colors,
        "left"
      )}
      ${buildLeg(
        rootX + hipOffset,
        hipY,
        poseValues.rightUpperLeg,
        poseValues.rightLowerLeg,
        poseValues.rightFoot,
        colors
      )}
      ${buildLeg(
        rootX - hipOffset,
        hipY,
        poseValues.leftUpperLeg,
        poseValues.leftLowerLeg,
        poseValues.leftFoot,
        colors
      )}
    </g>
  ${svgClose}`;
};

const buildArm = (x, y, upperAngle, lowerAngle, handAngle, colors, side) => {
  const direction = side === "right" ? 1 : -1;
  return `
    <g transform="translate(${x} ${y}) rotate(${upperAngle * direction})">
      <rect x="-${sizeMap.limbWidth / 2}" y="0" width="${sizeMap.limbWidth}" height="${sizeMap.upperArm}" rx="6" fill="${colors.armor}" />
      <g transform="translate(0 ${sizeMap.upperArm}) rotate(${lowerAngle * direction})">
        <rect x="-${sizeMap.limbWidth / 2}" y="0" width="${sizeMap.limbWidth}" height="${sizeMap.lowerArm}" rx="6" fill="${colors.armor}" />
        <g transform="translate(0 ${sizeMap.lowerArm}) rotate(${handAngle * direction})">
          <rect x="-${sizeMap.limbWidth / 2}" y="0" width="${sizeMap.limbWidth}" height="${sizeMap.hand}" rx="6" fill="${colors.skin}" />
        </g>
      </g>
    </g>
  `;
};

const buildLeg = (x, y, upperAngle, lowerAngle, footAngle, colors) => `
  <g transform="translate(${x} ${y}) rotate(${upperAngle})">
    <rect x="-${sizeMap.legWidth / 2}" y="0" width="${sizeMap.legWidth}" height="${sizeMap.upperLeg}" rx="6" fill="${colors.armor}" />
    <g transform="translate(0 ${sizeMap.upperLeg}) rotate(${lowerAngle})">
      <rect x="-${sizeMap.legWidth / 2}" y="0" width="${sizeMap.legWidth}" height="${sizeMap.lowerLeg}" rx="6" fill="${colors.armor}" />
      <g transform="translate(0 ${sizeMap.lowerLeg}) rotate(${footAngle})">
        <rect x="-${sizeMap.legWidth / 2}" y="0" width="${sizeMap.legWidth}" height="${sizeMap.foot}" rx="6" fill="${colors.accent}" />
      </g>
    </g>
  </g>
`;

const drawPreview = async () => {
  const canvas = previewCanvas.value;
  if (!canvas) return;

  const renderSize = previewRenderSize.value;
  canvas.width = renderSize;
  canvas.height = renderSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const svg = buildSVGMarkup(pose, characterColors.value);
  const img = await loadSvgImage(svg);
  ctx.clearRect(0, 0, renderSize, renderSize);
  ctx.drawImage(img, 0, 0, renderSize, renderSize);
};

const renderPreview = () => {
  drawPreview().catch((error) => console.error("Preview draw failed", error));
};

const loadSvgImage = (svg) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

const tick = (timestamp) => {
  const animation = animations[state.animation];
  const frameCount = animation.frames;
  const frameDurationMs = (frameCount / state.fps) * 1000;
  const elapsed = timestamp - animationLoop.startTime;
  const t = ((elapsed % frameDurationMs) / frameDurationMs) % 1;
  Object.assign(pose, computePose(state.animation, t));

  animationFrame.value = Math.floor(t * frameCount);
  renderPreview();
  animationLoop.frameId = requestAnimationFrame(tick);
};

const handleExport = async () => {
  if (!exportSelections.value.length) return;

  const selected = exportSelections.value;
  const frameSize = state.spriteSize;
  const framesPerRow = Math.max(
    ...selected.map((animation) => animations[animation].frames)
  );

  const canvas = document.createElement("canvas");
  canvas.width = framesPerRow * frameSize;
  canvas.height = selected.length * frameSize;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  for (let row = 0; row < selected.length; row += 1) {
    const animation = selected[row];
    const frameCount = animations[animation].frames;
    for (let frame = 0; frame < framesPerRow; frame += 1) {
      if (frame >= frameCount) continue;
      const t = frame / frameCount;
      const exportPose = computePose(animation, t);
      const svg = buildSVGMarkup(exportPose, characterColors.value);
      const image = await loadSvgImage(svg);
      ctx.drawImage(image, frame * frameSize, row * frameSize, frameSize, frameSize);
    }
  }

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `sprite-sheet-${state.character.toLowerCase()}-${state.variant
    .toLowerCase()
    .replace(/\s+/g, "-")}.png`;
  link.click();
  showExport.value = false;
};

onMounted(() => {
  animationLoop.startTime = performance.now();
  animationLoop.frameId = requestAnimationFrame(tick);
  renderPreview();
});

onUnmounted(() => {
  if (animationLoop.frameId) cancelAnimationFrame(animationLoop.frameId);
});

watch(
  () => [state.spriteSize, state.character, state.variant, state.animation, state.fps, state.realSize],
  () => {
    renderPreview();
  }
);
</script>
