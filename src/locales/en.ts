import { Translations } from '@/locales/translation';

export const EN: Translations = {
  title: 'AuthApex',
  description: 'AuthApex application.',
  back: 'Back',
  logout: 'Logout',
  and: 'and',
  home: {
    title: 'Domů',
    userId: 'Id',
    byUsing: 'By using, you agree to our',
    removeProfileImage: 'Remove profile image',
    uploadNewProfileImage: 'Upload profile image',
    uploadingNewProfileImage: 'Uploading...',
    email: 'Email',
    userInformation: 'User information',
    permissions: 'Permissions',
    editDisplayName: 'Edit name',
    displayName: 'Display name',
    save: 'Save',
  },
  sessions: {
    button: 'Authorized applications',
    remove: 'Remove',
  },
  signin: {
    title: 'Welcome back',
    subtitle: 'Login with an account from a third party',
    google: 'Login with Google',
    divider: 'Or continue with',
    password: 'Password',
    button: 'Login',
    dontHaveAnAccount: "Don't have an account?",
    byContinuing: 'By continuing, you agree to our',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
  },
  signup: {
    title: 'Create new account',
    name: 'Name',
    namePlaceholder: 'Tomato',
    password: 'Password',
    repeatPassword: 'Confirm password',
    button: 'Register',
    alreadyHaveAnAccount: 'Already have an account?',
  },
  authorize: {
    title: 'Authorize application',
    subtitle: 'By authorizing this application, you allow it to access your account information.',
    button: 'Authorize',
    cancelButton: 'Cancel',
    appName: 'Application name',
    appUrl: 'Application URL',
    verified: 'Verified',
    verifiedTooltip: 'This application is verified.',
    notVerified: 'Not verified',
    notVerifiedTooltip: 'This application could not be verified, proceed with caution!',
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Effective Date: 22.2.2025',
    description:
      'These terms apply to all websites, applications, and services (collectively referred to as "Services") operated by AuthApex (“we”, “us”, or “our”).',
    acceptanceOfTerms: {
      title: 'Acceptance of Terms',
      element1:
        'By using our Services, you agree to these Terms of Service. If you do not agree with these terms, do not use our Services.',
    },
    usageOfService: {
      title: 'Usage of Service',
      element1:
        'We provide the Services for personal and non-commercial use. It is prohibited to use our Services for any illegal or unauthorized purposes.',
    },
    registrationAndAccounts: {
      title: 'Registration and Accounts',
      element1:
        'To use our Services, you must create an account with AuthApex. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur on your account. If you notice any unauthorized use of your account, please contact us immediately.',
    },
    integrationWithOtherServices: {
      title: 'Integration with Other Services',
      element1:
        'Using your AuthApex account, you can log into other applications such as mythranel.net or galleryeet.net. Your use of these third parties is at your own risk. AuthApex is not responsible for any third parties and their services.',
    },
    terminationOfService: {
      title: 'Termination of Service',
      element1:
        'We reserve the right to suspend or terminate your access to our Services at any time if you violate these terms or if we decide to cease providing the Service.',
    },
    changesToTerms: {
      title: 'Changes to Terms',
      element1:
        'We reserve the right to modify these Terms of Service at any time. All changes will be effective upon posting on our website. Your continued use of the Services after such changes indicates your agreement with them.',
    },
    limitationOfLiability: {
      title: 'Limitation of Liability',
      element1:
        'We provide our Services "as is". We do not guarantee that the Services will be error-free or uninterrupted. We are not responsible for any direct, indirect, incidental, special, or consequential damages arising from the use of our Services.',
      element2: 'If you have any questions regarding our Terms of Service, contact us at:',
      list: {
        element1: 'Bluesky: @authapex.net',
        element2: 'Email: gtomyasek@gmail.com',
      },
    },
  },
  privacy: {
    title: 'Privacy policy',
    subtitle: 'Effective date: 22.2.2025',
    description:
      'This Privacy Policy applies to all websites, applications, and services (collectively, "Services") operated by AuthApex ("we", "us", or "our"). We are committed to protecting the privacy of our users ("you" or "your"). This policy outlines how we collect, use, disclose, and safeguard your information when you visit our Services.',
    informationWeCollect: {
      title: 'Information We Collect',
      paragraph1:
        'Upon registration, either directly via email and password or through your Google account, we collect the following information:',
      list: {
        element1: 'Email Address: Used as part of your login credentials.',
        element2: 'Password: Encrypted and stored securely for authentication purposes (only if registering directly).',
        element3:
          'Profile picture: Optional for enhancing your profile visibility. Display Name: To personalize your user experience across our platforms.',
      },
      paragraph2:
        'Additionally, while using our services, certain technical data like IP address/browser details may be logged by Sentry for error tracking and improving application stability.',
    },
    informationFromGoogle: {
      title: 'Information from Google Accounts',
      paragraph1:
        "When you choose to create an account or log in using your Google account, we use Google's OAuth service for authentication. In doing so, we request access to specific data from your Google profile. Our access is strictly limited to the following information:",
      list: {
        element1: 'Email Address: Used as a unique identifier for your account and for login purposes.',
        element2: 'Display Name: Used to personalize your experience within our Services.',
        element3: 'Profile Picture: An optional piece of data used to customize your user profile.',
      },
      paragraph2:
        'We use this data solely to facilitate the account creation and logon process, and to personalize your user experience as described in the "How We Use Your Information" section. We do not access any other information from your Google account. The Google user data we access is not sold, rented, or shared with any third parties, except as required to provide our Services (e.g., with essential service providers bound by strict confidentiality agreements) or as required by law.',
    },
    howWeUseYourInformation: {
      title: 'How We Use Your Information',
      paragraph1: 'The collected information is used in various ways:',
      list: {
        element1: 'To facilitate account creation and logon process across our different platforms.',
        element2: 'Enhance user experience by allowing customization options like display names and profile pictures.',
        element3: 'Maintain security standards and protect against unauthorized access or usage.',
        element4:
          'For maintaining the performance of our Services including troubleshooting issues through error logs.',
        element5: 'To personalize user experience across all applications under our ecosystem.',
      },
    },
    sharingOfYourInformation: {
      title: 'Sharing of Your Information',
      paragraph1:
        'We do not sell or rent personal information to third parties. However, aggregated anonymized data might be shared for analytics purposes without revealing any personally identifiable information.',
      paragraph2:
        'In cases where it becomes necessary to share personal information with third-party service providers (e.g., Sentry), they are bound by confidentiality agreements prohibiting the misuse of such data beyond its intended purpose.',
    },
    dataSecurity: {
      title: 'Data Security',
      paragraph1:
        'We implement and maintain a variety of robust security measures to protect the safety of your personal information. Your data is stored on secure servers, and we use encryption (such as SSL/TLS) to protect data transmitted to and from our Services. Where you have registered directly with a password, it is stored in a hashed format. While we take reasonable steps to safeguard your data, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security, but we are committed to protecting your information to the best of our ability.',
    },
    gdpr: {
      title: 'Your Rights Under GDPR',
      paragraph1:
        'If you reside in the European Union (EU), European Economic Area (EEA), or United Kingdom (UK), General Data Protection Regulation grants rights concerning personal data:',
      list: {
        element1: 'Right to Access: Request copies of personal data we hold about you.',
        element2: 'Right to Rectification: Correct inaccurate personal data about yourself that we possess.',
        element3: 'Right to Erasure: Request deletion of your personal data under certain conditions.',
        element4: 'Right to Restrict Processing: Request restriction on how we process your personal data.',
        element5:
          'Right to Data Portability: Receive a copy of the data we have about you in a structured, machine-readable format and request the transfer of this data to another controller.',
        element6: 'Right to Object: Object at any time to processing of personal data concerning you.',
      },
      paragraph2:
        'To exercise these rights, please contact us using the information provided below. Note that some requests may require identity verification.',
    },
    dataRetentionAndDeletion: {
      title: 'Data Retention and Deletion',
      paragraph1:
        'We retain your personal information for as long as your account is active with us or as needed to provide you with our Services. We will securely delete your information when it is no longer required for these purposes.',
      paragraph2:
        'You may request the deletion of your account and associated personal data at any time. To initiate a data deletion request, please contact us directly via email at gtomyasek@gmail.com with the subject line "Data Deletion Request". We will process your request and confirm the deletion of your data from our active systems within a reasonable timeframe, subject to any legal or regulatory obligations to retain certain information.',
    },
    childrenPrivacy: {
      title: "Children's Privacy",
      paragraph1:
        'Our Services are not intended for individuals under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you become aware that a child has provided us with personal data without parental consent, please contact us so that we can take steps to remove such information and terminate the child’s account.',
    },
    changesToPolicy: {
      title: 'Changes To This Policy',
      paragraph1:
        'We reserve the right to make changes to this privacy policy at any time. When updated, we will revise the "Effective Date" at the top of this policy and post the new policy on our services. We encourage users to frequently check this page for any changes. Your continued use of our services following posting changes will constitute your acceptance of those changes.',
    },
    contactUs: {
      title: 'Contact Us',
      paragraph1:
        'If you have questions or concerns about our Privacy Policy or wish to exercise your rights as described above, please contact us through:',
      list: {
        element1: 'Bluesky: @authapex.net',
        element2: 'Email: gtomyasek@gmail.com',
      },
      paragraph2:
        'By providing clear channels for communication regarding privacy concerns and exercising GDPR rights, we aim at maintaining transparency and trust with our users while ensuring compliance with applicable laws and regulations.',
      paragraph3:
        'Remember that protecting your privacy starts with being mindful about what information you share online. Always think twice before sharing sensitive details on websites or applications.',
    },
  },
  admin: {
    title: 'Administration',
    authorizedApps: {
      title: 'Authorized apps',
      displayName: 'Display name',
      name: 'Name',
      websocketEndpoint: 'Websocket endpoint',
      url: 'Url',
      apiKey: 'Api key',
      addNewApp: 'Add new app',
      copyApiKey: 'Copy key',
      remove: 'Remove',
    },
    users: {
      title: 'Users',
      userId: 'Id',
      userName: 'Name',
      profileImage: 'Image',
      email: 'Email',
      displayName: 'Display name',
      removeRole: 'Remove role',
      roles: 'Roles',
      editUserRoles: 'Edit roles',
      addNewRole: 'Add new role',
    },
  },
};
