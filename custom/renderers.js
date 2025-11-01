module.exports = function (mdContainer, mkdown) {
  const imagefigRE = /^imagefig \[([\w/\\.-]+)\] \[(jpg|jpeg|gif|webp|png)\](?: \[([\x20-\x7E]+)\])?$/

  mkdown.use(mdContainer, 'imagefig', {
    validate: function (params) {
      return params.trim().match(imagefigRE)
    },
    render: (tokens, idx) => {
      var m = tokens[idx].info.trim().match(imagefigRE)

      if (tokens[idx].nesting === 1) {
        // Opening tag

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
        const containerbasecss = opts['lgthumb'] ? 'imgspanlg' : 'imgspan'
        const containercss = (opts.containercss != null) ? opts.containercss : ''

        return [
          `<figure class="alsfig ${css}">`,
          `<span class="${containerbasecss} ${containercss}">`,
          `<a class="alsfigimganchor nolink ${linkcss}" href="${link}">`,
          `<img class="nolink ${imagecss}" src="https://assets.alswiki.org/${m[1]}_${thumbSize}.${m[2]}" />`,
          `</a>`,
          `</span>`,
          `<figcaption>`
        ].join('')
      } else {
        // Closing tag
        return '</figcaption></figure>\n'
      }
    }
  })
}
