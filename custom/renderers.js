
module.exports = function (mdContainer, mkdown) {
  mkdown.use(mdContainer, 'imagefig', {
    validate: function (params) {
      return params.trim().match(/^imagefig \[([\w/\\.-]+)\] \[(jpg|jpeg|gif|webp|png)\]$/)
    },
    render: (tokens, idx) => {
      var m = tokens[idx].info.trim().match(/^imagefig \[([\w/\\.-]+)\] \[(jpg|jpeg|gif|webp|png)\]$/)

      if (tokens[idx].nesting === 1) {
        // Opening tag
        return [
          `<figure class="alsfig">`,
          `<a class="nolink" href="https://assets.alswiki.org/${m[1]}_1600x1200.${m[2]}">`,
          `<img src="https://assets.alswiki.org/${m[1]}_320x240.${m[2]}" />`,
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
