export interface Translations {
  title: string;
  description: string;
  logout: string;
  back: string;
  and: string;
  home: {
    title: string;
    userId: string;
    byUsing: string;
    userInformation: string;
    permissions: string;
    email: string;
    removeProfileImage: string;
    uploadNewProfileImage: string;
    uploadingNewProfileImage: string;
    editDisplayName: string;
    displayName: string;
    save: string;
  };
  sessions: {
    button: string;
    remove: string;
  };
  signin: {
    title: string;
    subtitle: string;
    google: string;
    divider: string;
    password: string;
    button: string;
    dontHaveAnAccount: string;
    byContinuing: string;
    termsOfService: string;
    privacyPolicy: string;
  };
  signup: {
    title: string;
    name: string;
    namePlaceholder: string;
    password: string;
    repeatPassword: string;
    button: string;
    alreadyHaveAnAccount: string;
  };
  authorize: {
    title: string;
    subtitle: string;
    button: string;
    cancelButton: string;
    appName: string;
    appUrl: string;
    verified: string;
    verifiedTooltip: string;
    notVerified: string;
    notVerifiedTooltip: string;
  };
  terms: {
    title: string;
    subtitle: string;
    description: string;
    acceptanceOfTerms: {
      title: string;
      element1: string;
    };
    usageOfService: {
      title: string;
      element1: string;
    };
    registrationAndAccounts: {
      title: string;
      element1: string;
    };
    integrationWithOtherServices: {
      title: string;
      element1: string;
    };
    terminationOfService: {
      title: string;
      element1: string;
    };
    changesToTerms: {
      title: string;
      element1: string;
    };
    limitationOfLiability: {
      title: string;
      element1: string;
      element2: string;
      list: {
        element1: string;
        element2: string;
      };
    };
  };
  privacy: {
    title: string;
    subtitle: string;
    description: string;
    informationWeCollect: {
      title: string;
      paragraph1: string;
      list: {
        element1: string;
        element2: string;
        element3: string;
      };
      paragraph2: string;
    };
    informationFromGoogle: {
      title: string;
      paragraph1: string;
      list: {
        element1: string;
        element2: string;
        element3: string;
      };
      paragraph2: string;
    };
    howWeUseYourInformation: {
      title: string;
      paragraph1: string;
      list: {
        element1: string;
        element2: string;
        element3: string;
        element4: string;
        element5: string;
      };
    };
    sharingOfYourInformation: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    dataSecurity: {
      title: string;
      paragraph1: string;
    };
    gdpr: {
      title: string;
      paragraph1: string;
      list: {
        element1: string;
        element2: string;
        element3: string;
        element4: string;
        element5: string;
        element6: string;
      };
      paragraph2: string;
    };
    dataRetentionAndDeletion: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    childrenPrivacy: {
      title: string;
      paragraph1: string;
    };
    changesToPolicy: {
      title: string;
      paragraph1: string;
    };
    contactUs: {
      title: string;
      paragraph1: string;
      list: {
        element1: string;
        element2: string;
      };
      paragraph2: string;
      paragraph3: string;
    };
  };
  admin: {
    title: string;
    authorizedApps: {
      title: string;
      name: string;
      displayName: string;
      url: string;
      websocketEndpoint: string;
      apiKey: string;
      remove: string;
      copyApiKey: string;
      addNewApp: string;
    };
    users: {
      title: string;
      userId: string;
      userName: string;
      displayName: string;
      profileImage: string;
      removeRole: string;
      email: string;
      roles: string;
      editUserRoles: string;
      isAutorizedAppInRole: string;
      addNewRole: string;
    };
  };
}
