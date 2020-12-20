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
  actions: ActionsPanel
  navigation: NavigationPanel
  profile: ProfilePanel
  dashboard: DashboardPanel
}
