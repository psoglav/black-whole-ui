interface ActionsPanel {
  width: string
}

interface NavigationPanel {
  width: string
}

interface ProfilePanel {
  width: string
  'min-width': string
  sizable: boolean
}

interface DashboardPanel {
  'min-width': string
}

export interface WorkspaceConfig {
  card: {
    cursorGrabStyle: 1 | 2
  }

  panels: {
    actions: ActionsPanel
    navigation: NavigationPanel
    profile: ProfilePanel
    dashboard: DashboardPanel
  }
}
