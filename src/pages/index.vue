<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(9, 9, 10)
const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS || +now) - play.state.value.startMS) / 1000))
useStorage('vueminesweeper-state', play.state)
const state = $computed(() => play.board)
const mineRest = $computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 6)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break
  }
}
watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  Minesweeper
  <div flex="~ gap-2" justify-center>
    <button btn @click="play.reset()">
      New Game
    </button>
    <button btn @click="newGame('easy')">
      Easy
    </button>
    <button btn @click="newGame('medium')">
      Medium
    </button>
    <button btn @click="newGame('hard')">
      Hard
    </button>
  </div>
  <div m-t-2 flex="~ gap-10" justify-center>
    <div flex="~ gap-1" items-center font-mono text-2xl>
      <div i-carbon-timer />
      {{ timerMS }}
    </div>
    <div flex="~ gap-1" items-center font-mono text-2xl>
      <div i-mdi-mine />
      {{ mineRest }}
    </div>
  </div>
  <div w-full overflow-auto p5 @contextmenu.prevent>
    <div
      v-for="row, x in state" :key="x" flex="~"
      ma w-max items-center justify-center
    >
      <MineBlock
        v-for="block, y in row"
        :key="y" :block="block"
        @click="play.onClick(block)"
        @contextmenu.prevent="play.onRightClick(block)"
        @dblclick="play.autoExpand(block)"
      />
    </div>
  </div>

  <div flex="~ gap-2 justify-center">
    <button btn @click="toggleDev()">
      {{ isDev ? 'DEV' : 'NORMAL' }}
    </button>

    <button hover:disabled focus:pointer-event-none cursor-default btn>
      {{ play.state.value.status }}
    </button>

    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>
