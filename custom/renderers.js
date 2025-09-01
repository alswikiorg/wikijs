module.exports = function (mdContainer, mkdown) {
  const re = /^imagefig \[([\w/\\.-]+)\] \[(jpg|jpeg|gif|webp|png)\](?: \[([\x20-\x7E]+)\])?$/

  mkdown.use(mdContainer, 'imagefig', {
    validate: function (params) {
      return params.trim().match(re)
    },
    render: (tokens, idx) => {
      var m = tokens[idx].info.trim().match(re)

      if (tokens[idx].nesting === 1) {
        const optsList = (m[3] || '').split(', ')
        const opts = {}

        for (const line of optsList) {
          const parts = line.trim().split(/\s+/, 2)
          if (parts.length === 1) {
            opts[parts[0]] = true
          } else {
            const [key, value] = parts
            opts[key] = value
          }
        }

        const thumbSize = opts['lgthumb'] ? '640x480' : '320x240'

        const link = opts.link != null ? opts.link : `https://assets.alswiki.org/${m[1]}_1600x1200.${m[2]}`

        const css = (opts.css != null) ? opts.css : ''
        const linkcss = (opts.linkcss != null) ? opts.linkcss : ''
        const imagecss = (opts.imagecss != null) ? opts.imagecss : ''

        // Opening tag
        return [
          `<figure class="alsfig ${css}">`,
          `<a class="nolink ${linkcss}" href="${link}">`,
          `<img class="nolink ${imagecss}" src="https://assets.alswiki.org/${m[1]}_${thumbSize}.${m[2]}" />`,
          `</a>`,
          `<figcaption>`
        ].join('\n')
      } else {
        // Closing tag
        return '</figcaption></figure>\n'
      }
    }
  })
}
