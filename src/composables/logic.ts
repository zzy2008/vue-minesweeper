import type { BlockState } from '~/types'

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
export class GamePlay {
  mineGenerated = false
  state = ref<BlockState[][]>([])

  constructor(public width: number, public height: number) {
    this.reset()
  }

  reset() {
    this.mineGenerated = false
    this.state.value = Array.from({ length: this.height }, (_, x) =>
      Array.from({ length: this.width },
        (_, y): BlockState => ({
          x,
          y,
          adjacentMines: 0,
          revealed: false,
          flagged: false,
          mine: false,
        })))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    for (const row of state) {
      for (const block of row) {
        if (Math.abs(block.x - initial.x) < 1)
          continue

        if (Math.abs(block.x - initial.x) < 1)
          continue

        block.mine = Math.random() < 0.1
      }
    }
    this.updateNumbers()
  }

  updateNumbers() {
    this.state.value.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return

        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
      })
    })
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.height || y2 < 0 || y2 >= this.width)
        return undefined
      return this.state.value[x2][y2]
    }).filter(Boolean) as BlockState[]
  }

  expandZero(block: BlockState) {
    if (block.adjacentMines)
      return
    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed) {
          s.revealed = true
          this.expandZero(s)
        }
      })
  }

  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (!this.mineGenerated) {
      this.generateMines(this.state.value, block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine)
      alert('BOOOM！')
    this.expandZero(block)
  }

  checkGameState() {
    const blocks = this.state.value.flat()
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
}
