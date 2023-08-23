<script setup lang="ts">
import type { BlockState } from '~/types'

const WIDTH = 12
const HEIGHT = 10

const state = ref(Array.from({ length: HEIGHT }, (_, x) => Array.from({ length: WIDTH }, (_, y): BlockState => ({ x, y, adjacentMines: 0, revealed: false, flagged: false, mine: false }))))

function generateMines(initial: BlockState) {
  for (const row of state.value) {
    for (const block of row) {
      if (Math.abs(block.x - initial.x) < 1)
        continue

      if (Math.abs(block.x - initial.x) < 1)
        continue

      block.mine = Math.random() < 0.1
    }
  }
  updateNumbers()
}
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500']
function updateNumbers() {
  state.value.forEach((row, x) => {
    row.forEach((block, y) => {
      if (block.mine)
        return

      getSiblings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines += 1
      })
    })
  })
}
function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 < 0 || x2 >= HEIGHT || y2 < 0 || y2 >= WIDTH)
      return undefined
    return state.value[x2][y2]
  }).filter(Boolean) as BlockState[]
}

function expandZero(block: BlockState) {
  if (block.adjacentMines)
    return
  getSiblings(block).forEach((s) => {
    if (!s.revealed) {
      s.revealed = true
      expandZero(s)
    }
  })
}
let mineGenerated = false
const dev = false
function onRightClick(block: BlockState) {
  if (block.revealed)
    return
  block.flagged = !block.flagged
}

function onClick(e: MouseEvent, block: BlockState) {
  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine)
    alert('BOOOM！')
  expandZero(block)
}

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray-500/20'
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}
watchEffect(checkGameState)
function checkGameState() {
  const blocks = state.value.flat()
  // console.log(blocks)
  // if (blocks.every(block => block.revealed || block.flagged)) {
  //   if (blocks.some(block => block.flagged && !block.mine))
  //     alert('You Cheat!')

  //   else
  //     alert('You win!')
  // }
  if (blocks.every((block) => {
    if ((!block.revealed || block.flagged) && block.mine)
      return true
    else if (block.revealed && !block.mine)
      return true
    else
      return false
  }))
    alert('You win!')
}

function refreshBoard() {

}
</script>

<template>
  Minesweeper
  <div p5 @contextmenu.prevent>
    <div v-for="row, x in state" :key="x" flex="~" items-center justify-center>
      <button
        v-for="block, y in row" :key="y" flex="~" h-10 w-10 items-center justify-center b-1 m="0.5"
        border="1 gray-300/10 " :class="getBlockClass(block)" @click="onClick($event, block)"
        @contextmenu.prevent="onRightClick(block)"
      >
        <template v-if="block.flagged && !block.revealed">
          <div i-mdi-flag text-cyan />
        </template>
        <template v-else-if="block.revealed || dev">
          <div v-if="block.mine" i-mdi-mine />
          <div v-else>
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>

  <div>
    <button h-8 w-20 b-1 rounded bg-gray @click="refreshBoard">
      generate
    </button>
  </div>
</template>
