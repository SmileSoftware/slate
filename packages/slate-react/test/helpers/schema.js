import { Schema } from '@macgreg/slate'

const schema = Schema.create({
  blocks: {
    image: {
      isVoid: true,
    },
  },
  inlines: {
    emoji: {
      isVoid: true,
    },
  },
})

export default schema
