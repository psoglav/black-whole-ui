import { WorkspaceConfig } from '@/types/workspace'

const state = {
  'input-deactivated': false,
  config: {
    card: {
      cursorGrabStyle: 1,
    },
    panels: {
      actions: {
        width: '5rem',
      },
      navigation: {
        width: '20rem',
      },
      profile: {
        sizable: true,
        width: '20rem',
        'min-width': '20rem',
      },
      dashboard: {
        'min-width': '22rem',
      },
    },
  } as WorkspaceConfig,
}

const mutations = {
  DEACTIVATE_INPUT(state) {
    state['input-deactivated'] = true
  },
  ACTIVATE_INPUT(state) {
    state['input-deactivated'] = false
  },
  SET_PROFILE_WIDTH(state, rem) {
    state.config.panels.profile.width = rem + 'rem'
  },
}

const getters = {
  workspaceConfig: state => state.config,
  'input-deactivated': state => state['input-deactivated'],
}

export default {
  state,
  getters,
  mutations,
}
