<script lang="ts" setup>
const SamuraiCanvasRef: Ref = ref();
const SamuraiState = ref("idle");
const SamuraiAnimation = ref([]);
const SamuraiAnimationState = [
  { name: "idle", frames: 6 },
  { name: "walk", frames: 8 },
  { name: "run", frames: 8 },
  { name: "jump", frames: 12 },
  { name: "attack1", frames: 6 },
  { name: "attack2", frames: 4 },
  { name: "attack3", frames: 3 },
  { name: "shield", frames: 2 },
  { name: "hurt", frames: 2 },
  { name: "dead", frames: 3 },
];

const samuraiInit = () => {
  const SamuraiCanvas = SamuraiCanvasRef.value;
  const SamuraiCtx = SamuraiCanvas.getContext("2d");
  const SAMURAI_WIDTH = (SamuraiCanvas.width = 128);
  const SAMURAI_HEIGHT = (SamuraiCanvas.height = 128);
  const samuraiImage = new Image();
  samuraiImage.src = "./roles/SamuraiSpritelist.png";
  const samuraiSpriteWidth = 128;
  const samuraiSpriteHeight = 128;
  let gameFrame = 0;
  const staggerFrames = 8;

  SamuraiAnimationState.forEach((state, index) => {
    let frames = { loc: [] };
    for (let j = 0; j < state.frames; j++) {
      let positionX = j * SAMURAI_WIDTH;
      let positionY = index * SAMURAI_HEIGHT;
      frames.loc.push({ x: positionX, y: positionY });
    }
    SamuraiAnimation.value[state.name] = frames;
  });

  const animate = () => {
    SamuraiCtx.clearRect(0, 0, SAMURAI_WIDTH, SAMURAI_HEIGHT);
    let position =
      Math.floor(gameFrame / staggerFrames) %
      SamuraiAnimation.value[SamuraiState.value].loc.length;
    let frameX = samuraiSpriteWidth * position;
    let frameY = SamuraiAnimation.value[SamuraiState.value].loc[position].y;

    SamuraiCtx.drawImage(
      samuraiImage,
      frameX,
      frameY,
      samuraiSpriteWidth,
      samuraiSpriteHeight,
      0,
      0,
      samuraiSpriteWidth,
      samuraiSpriteHeight
    );
    gameFrame++;
    requestAnimationFrame(animate);
  };

  animate();
};

onMounted(() => {
  samuraiInit();
});

defineExpose({
  SamuraiState,
});
</script>

<template>
  <div>
    <canvas ref="SamuraiCanvasRef"></canvas>
  </div>
</template>

<style scoped lang="scss"></style>
