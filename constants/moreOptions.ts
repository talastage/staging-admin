// options.ts

interface Option {
  title: string;
  value: string;
}

interface OptionsGroup {
  [key: string]: Option[];
}

const projectOptions: Option[] = [{ title: "Share", value: "share" }];

const walletOptions: Option[] = [{ title: "Edit", value: "edit" }];

const contributorOptions: Option[] = [
  { title: "Edit", value: "edit" },
  { title: "Delete", value: "delete" },
];

const investorOptions: Option[] = [
  { title: "Edit", value: "edit" },
  { title: "Delete", value: "delete" },
];

// Group all options
const optionsGroup: OptionsGroup = {
  project: projectOptions,
  wallet: walletOptions,
  contributor: contributorOptions,
  investor: investorOptions, // Added the investorOptions here
};

export default optionsGroup;
