<script lang="ts" setup>
const ShinobiCanvasRef: Ref = ref();
const ShinobiState = ref("idle");
const ShinobiAnimation = ref([]);
const ShinobiAnimationState = [
  { name: "idle", frames: 6 },
  { name: "walk", frames: 8 },
  { name: "run", frames: 8 },
  { name: "jump", frames: 12 },
  { name: "attack1", frames: 5 },
  { name: "attack2", frames: 3 },
  { name: "attack3", frames: 4 },
  { name: "shield", frames: 4 },
  { name: "hurt", frames: 2 },
  { name: "dead", frames: 4 },
];

const shinobiInit = () => {
  const ShinobiCanvas = ShinobiCanvasRef.value;
  const ShinobiCtx = ShinobiCanvas.getContext("2d");
  const SHINOBI_WIDTH = (ShinobiCanvas.width = 128);
  const SHINOBI_HEIGHT = (ShinobiCanvas.height = 128);
  const shinobiImage = new Image();
  shinobiImage.src = "./roles/ShinobiSpritelist.png";
  const shinobiSpriteWidth = 128;
  const shinobiSpriteHeight = 128;
  let gameFrame = 0;
  const staggerFrames = 8;

  ShinobiAnimationState.forEach((state, index) => {
    let frames = { loc: [] };
    for (let j = 0; j < state.frames; j++) {
      let positionX = j * SHINOBI_WIDTH;
      let positionY = index * SHINOBI_HEIGHT;
      frames.loc.push({ x: positionX, y: positionY });
    }
    ShinobiAnimation.value[state.name] = frames;
  });

  const animate = () => {
    ShinobiCtx.clearRect(0, 0, SHINOBI_WIDTH, SHINOBI_HEIGHT);
    let position =
      Math.floor(gameFrame / staggerFrames) %
      ShinobiAnimation.value[ShinobiState.value].loc.length;
    let frameX = shinobiSpriteWidth * position;
    let frameY = ShinobiAnimation.value[ShinobiState.value].loc[position].y;

    ShinobiCtx.drawImage(
      shinobiImage,
      frameX,
      frameY,
      shinobiSpriteWidth,
      shinobiSpriteHeight,
      0,
      0,
      shinobiSpriteWidth,
      shinobiSpriteHeight
    );
    gameFrame++;
    requestAnimationFrame(animate);
  };

  animate();
};

onMounted(() => {
  shinobiInit();
});

defineExpose({
  ShinobiState,
});
</script>

<template>
  <div>
    <canvas ref="ShinobiCanvasRef"></canvas>
  </div>
</template>

<style scoped lang="scss"></style>
