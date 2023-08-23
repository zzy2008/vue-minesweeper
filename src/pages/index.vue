<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(12, 12)
const state = play.state
</script>

<template>
  Minesweeper

  <div p5 @contextmenu.prevent>
    <div v-for="row, x in state" :key="x" flex="~" items-center justify-center>
      <MineBlock
        v-for="block, y in row" :key="y"
        :block="block"
        @click="play.onClick(block)"
        @contextmenu.prevent="play.onRightClick(block)"
      />
    </div>
  </div>

  <div flex="~ gap-1 justify-center">
    <button btn @click="toggleDev()">
      {{ isDev ? 'DEV' : 'NORMAL' }}
    </button>
    <button btn @click="play.reset()">
      RESET
    </button>
  </div>
</template>
