module.exports = function (mdContainer, mkdown) {
  const imagefigRE = /^imagefig \[([\w/\\.-]+)\] \[(jpg|jpeg|gif|webp|png)\](?: \[([\x20-\x7E]+)\])?$/

  function generateAltFromPath(path) {
    if (!path) return ''

    // Get last part of the path
    const filename = path.split('/').pop()

    // Remove file extension if present
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

    // Replace separators with spaces
    const words = nameWithoutExt
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)

    // Title-case the words
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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
        const alt = generateAltFromPath(m[1])

        return [
          `<figure class="alsfig ${css}">`,
          `<span class="${containerbasecss} ${containercss}">`,
          `<a class="alsfigimganchor ${linkcss}" href="${link}">`,
          `<img class="${imagecss}" src="https://assets.alswiki.org/${m[1]}_${thumbSize}.${m[2]}" alt="${alt}" />`,
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

  const youtubeRE = /^youtube \[([^\]]+)\]?$/

  mkdown.use(mdContainer, 'youtube', {
    validate: function (params) {
      return params.trim().match(youtubeRE)
    },
    render: (tokens, idx) => {
      var m = tokens[idx].info.trim().match(youtubeRE)

      if (tokens[idx].nesting === 1) {
        // Opening tag

        const embedPath = m[1]

        return [
          `<iframe class="yt-iframe" width="560" height="315" src="https://www.youtube.com${embedPath}" `,
          `title="YouTube video player" frameborder="0" `,
          `allow="accelerometer; autoplay; clipboard-write; `,
          `encrypted-media; gyroscope; picture-in-picture; web-share" `,
          `referrerpolicy="strict-origin-when-cross-origin" `,
          `allowfullscreen>`
        ].join('')
      } else {
        // Closing tag
        return '</iframe>\n'
      }
    }
  })
}
