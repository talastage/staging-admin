// create-project-tips.ts
import type { Menu } from "~/types/navigationMenu/menu";
import {
  HomeIcon,
  SettingsIcon, // Using SettingsIcon as a fallback, replace as necessary
  WalletIcon,
  MessageCircleIcon,
  BellIcon,
  HelpIcon,
  FileTextIcon,
  PlusIcon,
  LogoutIcon,
} from "vue-tabler-icons";

const createProjectTipsMenu: Menu[] = [
  {
    title: "Home",
    icon: HomeIcon,
    to: "/",
  },
  {
    title: "Create",
    icon: PlusIcon,
    to: "/projects/create",
  },
  {
    title: "My Tips",
    icon: SettingsIcon, // Ideally, use an icon that represents "tips" or "guidance"
    to: "/projects/tips",
  },

  {
    title: "Wallets",
    icon: WalletIcon,
    to: "/wallets",
  },
  {
    title: "Receive Tips",
    icon: SettingsIcon, // Replace with an icon representing receiving or creation
    to: "/projects/create",
  },

  {
    title: "Messages",
    icon: MessageCircleIcon,
    to: "/messages",
  },
  {
    title: "Notifications",
    icon: BellIcon, // Confirm this icon exists in your set or replace it
    to: "/notifications",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    to: "/settings",
  },
  {
    title: "Help and Support",
    icon: HelpIcon,
    to: "/support",
  },
  {
    title: "Terms of Service",
    icon: FileTextIcon,
    to: "/terms",
  },
  {
    title: "Logout",
    icon: LogoutIcon,
    to: "/logout",
  },
];

export default createProjectTipsMenu;
