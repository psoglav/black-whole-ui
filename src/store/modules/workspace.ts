import { WorkspaceConfig } from '@/types/workspace'

const state = {
  config: {
    card: {
      cursorGrabStyle: 1
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

const getters = {
  workspaceConfig: state => state.config,
}

export default {
  state,
  getters,
}
