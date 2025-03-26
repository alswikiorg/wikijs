const md = require('markdown-it')
const mdAttrs = require('markdown-it-attrs')
const mdDecorate = require('markdown-it-decorate')
const mdContainer = require('markdown-it-container')
const _ = require('lodash')
const underline = require('./underline')

const quoteStyles = {
  Chinese: '””‘’',
  English: '“”‘’',
  French: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
  German: '„“‚‘',
  Greek: '«»‘’',
  Japanese: '「」「」',
  Hungarian: '„”’’',
  Polish: '„”‚‘',
  Portuguese: '«»‘’',
  Russian: '«»„“',
  Spanish: '«»‘’',
  Swedish: '””’’'
}

module.exports = {
  async render() {
    const mkdown = md({
      html: this.config.allowHTML,
      breaks: this.config.linebreaks,
      linkify: this.config.linkify,
      typographer: this.config.typographer,
      quotes: _.get(quoteStyles, this.config.quotes, quoteStyles.English),
      highlight(str, lang) {
        if (lang === 'diagram') {
          return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`
        } else {
          return `<pre><code class="language-${lang}">${_.escape(str)}</code></pre>`
        }
      }
    })

    if (this.config.underline) {
      mkdown.use(underline)
    }

    mkdown.use(mdAttrs, {
      allowedAttributes: ['id', 'class', 'target']
    })
    mkdown.use(mdDecorate)

    mkdown.use(mdContainer, 'imagefig', {
      validate: function(params) {
        return params.trim().match(/^imagefig \[([\w/\\]+)\] \[(jpg|jpeg|gif|webp|png)\]$/)
      },
      render: (tokens, idx) => {
        var m = tokens[idx].info.trim().match(/^imagefig \[([\w/\\]+)\] \[(jpg|jpeg|gif|webp|png)\]$/)

        if (tokens[idx].nesting === 1) {
          // opening tag
          var text = [
            `<figure class="alsfig">`,
            `<a class="nolink" href="https://assets.alswiki.org/${m[1]}_1600x1200.${m[2]}">`,
            `<img src="https://assets.alswiki.org/${m[1]}_300x200.${m[2]}" />`,
            `</a>`,
            `<figcaption>`
          ].join('\n')
          return text
        } else {
          // closing tag
          return '</figcaption></figure>\n'
        }
      }
    })

    for (let child of this.children) {
      const renderer = require(`../${_.kebabCase(child.key)}/renderer.js`)
      await renderer.init(mkdown, child.config)
    }

    return mkdown.render(this.input)
  }
}
