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

type GameStatus = 'play' | 'won' | 'lost'
interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS: number
  endMS?: number
}
export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  get blocks() {
    return this.state.value.board.flat() as BlockState[]
  }

  get gameState() {
    return toRef(this.state.value.status)
  }

  reset(
    height = this.height,
    width = this.width,
     mines = this.mines,
  ) {
    this.height = height
    this.width = width
    this.mines = mines
    this.state.value = {
      startMS: +Date.now(),
      board: Array.from({ length: this.height }, (_, x) =>
        Array.from({ length: this.width },
          (_, y): BlockState => ({
            x,
            y,
            adjacentMines: 0,
            revealed: false,
            flagged: false,
            mine: false,
          }))),
      mineGenerated: false,
      status: 'play',
    }
  }

  random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.random(0, this.height - 1)
      const y = this.random(0, this.width - 1)
      const block = state[x][y]
      if ((Math.abs(block.x - initial.x) < 1) && (Math.abs(block.x - initial.x) < 1))
        return false
      if (block === initial || block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from ({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })

    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((row) => {
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
      return this.state.value.board[x2][y2]
    }).filter(Boolean) as BlockState[]
  }

  expandZero(block: BlockState) {
    if (block.adjacentMines)
      return
    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed && !s.flagged) {
          s.revealed = true
          this.expandZero(s)
        }
      })
  }

  showAllMines() {
    if (this.state.value.status === 'lost') {
      this.board.forEach((row) => {
        row.forEach((block) => {
          if (block.mine)
            block.revealed = true
        })
      })
    }
  }

  onRightClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return
    if (block.flagged)
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.onGameOver('lost')
      return
    }
    this.expandZero(block)
  }

  checkGameState() {
    const blocks = this.board.flat()
    // const blocks = s.value.flat()
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
      this.onGameOver('won')

    // else
    //   this.gameState.value = 'lost'
    this.showAllMines()
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        if (i.flagged)
          return
        i.revealed = true
        this.expandZero(i)
        if (i.mine)
          this.onGameOver('lost')
      })
    }
  }

  onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +Date.now()
    if (this.state.value.status === 'lost') {
      this.showAllMines()
      setTimeout(() => {
        // alert('lost')
        // console.log('lost')
      }, 10)
    }
  }
}
