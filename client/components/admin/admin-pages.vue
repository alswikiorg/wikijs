<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        .admin-header
          img.animated.fadeInUp(src='/_assets/svg/icon-file.svg', alt='Page', style='width: 80px;')
          .admin-header-title
            .headline.blue--text.text--darken-2.animated.fadeInLeft Pages
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p2s Manage pages
          v-spacer
          div(style="display: inline-flex; gap: 8px; align-items: center;")
            v-btn.animated.fadeInDown.wait-p1s(icon, color='grey', outlined, @click='refresh')
              v-icon.grey--text mdi-refresh
            //- v-btn.animated.fadeInDown.mx-3(color='primary', outlined, @click='recyclebin', disabled)
            //-   v-icon(left) mdi-delete-outline
            //-   span Recycle Bin
            v-btn.animated.fadeInDown(color='primary', depressed, large, to='pages/visualize')
              v-icon(left) mdi-graph
              span Visualize
        v-card.mt-3.animated.fadeInUp
          .pa-2.d-flex.align-center(:class='$vuetify.theme.dark ? `grey darken-3-d5` : `grey lighten-3`')
            v-text-field(
              solo
              flat
              v-model='search'
              prepend-inner-icon='mdi-file-search-outline'
              label='Search Pages...'
              hide-details
              dense
              style='max-width: 400px;'
              )
            v-spacer
            v-select.ml-2(
              solo
              flat
              hide-details
              dense
              label='Locale'
              :items='langs'
              v-model='selectedLang'
              style='max-width: 250px;'
            )
            v-select.ml-2(
              solo
              flat
              hide-details
              dense
              label='Publish State'
              :items='states'
              v-model='selectedState'
              style='max-width: 250px;'
            )
          v-divider
          v-data-table(
            :items='filteredPages'
            :headers='headers'
            :search='search'
            :page.sync='pagination'
            :items-per-page='20'
            :loading='loading'
            must-sort,
            sort-by='updatedAt',
            sort-desc,
            hide-default-footer
            @page-count="pageTotal = $event"
          )
            template(slot='item', slot-scope='props')
              tr.page(:class="{ active: props.selected }")
                td
                  span.icon-links(style="display: inline-flex; gap: 8px; align-items: center;")
                    a.row-link(:href="makePagePath(props.item)")
                      v-icon(color='grey') mdi-text
                    a.row-link(:href="`/e${makePagePath(props.item)}`")
                      v-icon(color='grey') mdi-pencil
                td.link-cell
                  router-link.row-link(:to="`/pages/${props.item.id}`") {{ props.item.id }}
                td
                  router-link.row-link(:to="`/pages/${props.item.id}`")
                    .body-2
                      strong {{ props.item.title }}
                    .caption {{ props.item.description }}
                td.admin-pages-path
                  router-link.row-link(:to="`/pages/${props.item.id}`")
                    v-chip(
                      label
                      small
                      :color="$vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-4'"
                    ) {{ props.item.locale }}
                    span.ml-2.grey--text(
                      :class="$vuetify.theme.dark ? 'text--lighten-1' : 'text--darken-2'"
                    ) / {{ props.item.path }}
                td {{ props.item.createdAt | moment('calendar') }}
                td {{ props.item.updatedAt | moment('calendar') }}
            template(slot='no-data')
              v-alert.ma-3(icon='mdi-alert', :value='true', outlined) No pages to display.
          .text-center.py-2.animated.fadeInDown(v-if='this.pageTotal > 1')
            v-pagination(v-model='pagination', :length='pageTotal')
</template>

<script>
import _ from 'lodash'
import pagesQuery from 'gql/admin/pages/pages-query-list.gql'

export default {
  data() {
    return {
      selectedPage: {},
      pagination: 1,
      pages: [],
      pageTotal: 0,
      headers: [
        { text: '', value: null, width: 90, sortable: false },
        { text: 'ID', value: 'id', width: 80, sortable: true },
        { text: 'Title', value: 'title' },
        { text: 'Path', value: 'path' },
        { text: 'Created', value: 'createdAt', width: 160 },
        { text: 'Last Updated', value: 'updatedAt', width: 160 }
      ],
      search: '',
      selectedLang: null,
      selectedState: null,
      states: [
        { text: 'All Publishing States', value: null },
        { text: 'Published', value: true },
        { text: 'Not Published', value: false }
      ],
      loading: false
    }
  },
  computed: {
    filteredPages () {
      return _.filter(this.pages, pg => {
        if (this.selectedLang !== null && this.selectedLang !== pg.locale) {
          return false
        }
        if (this.selectedState !== null && this.selectedState !== pg.isPublished) {
          return false
        }
        return true
      })
    },
    langs () {
      return _.concat({
        text: 'All Locales',
        value: null
      }, _.uniqBy(this.pages, 'locale').map(pg => ({
        text: pg.locale,
        value: pg.locale
      })))
    }
  },
  methods: {
    async refresh() {
      await this.$apollo.queries.pages.refetch()
      this.$store.commit('showNotification', {
        message: 'Page list has been refreshed.',
        style: 'success',
        icon: 'cached'
      })
    },
    newpage() {
      this.pageSelectorShown = true
    },
    makePagePath(item) {
      const cleanLocale = item.locale.replace(/^\/+/, '')
      const cleanPath = item.path.replace(/^\/+/, '')
      return `/${cleanLocale}/${cleanPath}`
    },
    recyclebin () { }
  },
  apollo: {
    pages: {
      query: pagesQuery,
      fetchPolicy: 'network-only',
      update: (data) => data.pages.list,
      watchLoading (isLoading) {
        this.loading = isLoading
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-pages-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>
tr.page {
  cursor: auto;
  height: 48px;
}

td.link-cell {
  padding: 0;
}

.row-link {
  text-decoration: none;
}

tr.is-clickable:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.admin-pages-path {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
}
</style>
