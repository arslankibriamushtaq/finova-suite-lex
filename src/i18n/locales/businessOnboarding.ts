import type { ModuleLocale } from "../types";

/**
 * Public business (SME / KYB) onboarding journey — the applicant-facing flow at
 * `/business/*`. Copy here is read by people outside the company, so it stays
 * plain: no internal vocabulary, no risk terminology, no step numbers that
 * would go stale when the passport step is skipped.
 */
const businessOnboarding: ModuleLocale = {
  namespace: "businessOnboarding",
  en: {
    // Shared
    "common.error.generic": "Something went wrong. Please try again.",
    "common.error.required": "This field is required",
    "common.sending": "Sending…",
    "common.verifying": "Verifying…",
    "common.saving": "Saving…",
    "common.loading": "Loading…",
    "common.cancel": "Cancel",
    "common.continue": "Continue",
    "common.back": "Back",
    "common.select": "Select",
    "common.yes": "Yes",
    "common.no": "No",
    "common.optional": "Optional",

    // Shell
    "shell.language": "Language",
    "shell.brandAlt": "Sullis",
    "shell.restoring": "Restoring your application…",
    "shell.footer":
      "Your details are encrypted in transit and used only to verify your business.",

    // Stepper
    "stepper.label": "Application progress",
    "stepper.progress": "Step {{current}} of {{total}}",
    "stepper.currentSuffix": "current step",
    "phase.contact": "Contact",
    "phase.security": "Security",
    "phase.business": "Business",
    "phase.documents": "Documents",
    "phase.identity": "Identity",

    // Step 1 — contact
    "start.title": "Register your business",
    "start.description":
      "We'll send a verification code to your mobile to get started. It takes about 10 minutes to finish.",
    "start.field.email": "Email address",
    "start.field.mobile": "Mobile number",
    "start.field.dialCode": "Country dialling code",
    "start.hint.email": "We'll send a separate confirmation code here.",
    "start.hint.mobile": "Use the number you can receive an SMS on right now.",
    "start.error.email": "Enter a valid email address",
    "start.error.mobile": "Enter a valid mobile number",
    "start.error.blockedTitle": "We can't continue with this application",
    "start.error.blocked":
      "This application can't be continued. Please contact support for help.",
    "start.error.alreadyRegistered":
      "You already have a business awaiting review. You can register another once that decision is made.",
    "start.submit": "Send verification code",
    "start.resumeNote":
      "Already started? Enter the same details and we'll pick up where you left off.",

    // Step 2 — mobile OTP
    "otp.title": "Enter the code we sent you",
    "otp.description": "We sent a 6-digit code by SMS to {{mobile}}.",
    "otp.field": "SMS verification code",
    "otp.submit": "Verify",
    "otp.resend": "Resend code",
    "otp.resendIn": "Resend in {{seconds}}s",
    "otp.resent": "A new code is on its way",
    "otp.wrongNumber": "Wrong email or number?",
    "otp.editTitle": "Change your contact details",
    "otp.editDescription":
      "Correct your details and we'll send a new code. This is only possible before the code is verified.",
    "otp.editMobileHint": "Include the country code, e.g. +966500000000",
    "otp.editSubmit": "Save and resend",
    "otp.contactUpdated": "Details updated — a new code is on its way",

    // Resume
    "resumePin.title": "Welcome back",
    "resumePin.description": "Enter your 6-digit PIN to continue your application.",
    "resumePin.noOtpNote":
      "You already have an application in progress, so no SMS was sent this time.",
    "resumePin.field": "Application PIN",
    "resumePin.submit": "Continue",
    "resumePin.startOver": "Use a different email or number",

    // Step 3 — emailed code
    "emailCode.title": "Confirm your email",
    "emailCode.description": "We sent a 6-digit code to {{email}}.",
    "emailCode.field": "Email verification code",
    "emailCode.submit": "Confirm email",
    "emailCode.spamHint": "Not there? Check your spam or promotions folder.",

    // Step 4 — app PIN
    "setPin.title": "Create your PIN",
    "setPin.description":
      "Choose a 6-digit PIN. You'll enter it to return to this application later.",
    "setPin.field.pin": "Choose a PIN",
    "setPin.field.confirm": "Confirm your PIN",
    "setPin.error.length": "Your PIN must be {{length}} digits",
    "setPin.error.mismatch": "Both PINs must match",
    "setPin.rememberNote":
      "Keep this PIN safe — it's the only way back into your application if you close this page.",
    "setPin.submit": "Save PIN and continue",

    // Step 5 — business details
    "details.title": "Business details",
    "details.description": "Tell us about the business you're registering.",
    "details.field.country": "Country of registration",
    "details.field.businessType": "Business type",
    "details.field.businessName": "Registered business name",
    "details.field.registrationNumber": "Registration number",
    "details.field.businessEmail": "Business email",
    "details.field.website": "Website",
    "details.field.description": "What does the business do?",
    "details.placeholder.country": "Select a country",
    "details.placeholder.businessType": "Select a business type",
    "details.placeholder.selectCountryFirst": "Choose a country first",
    "details.placeholder.businessName": "Al Noor Trading LLC",
    "details.placeholder.description": "Wholesale trading of building materials",
    "details.hint.registrationNumber":
      "As shown on your commercial registration. One number can be registered once.",
    "details.hint.businessEmail": "The business's own address, not your personal one.",
    "details.hint.description": "Optional — a sentence is enough.",
    "details.requiredDocsTitle": "You'll be asked to upload",
    "details.error.referenceData": "We couldn't load the country list. Please try again.",
    "details.error.businessTypes":
      "We couldn't load business types for this country. Please try again.",
    "details.error.registrationTaken":
      "This registration number is already registered.",

    // Step 6 — address
    "address.title": "Business address",
    "address.description": "Where is the business located?",
    "address.field.street": "Street address",
    "address.field.city": "City",
    "address.field.postalCode": "Postal code",
    "address.placeholder.street": "King Fahd Road, Al Olaya District, Building 12",
    "address.placeholder.city": "Riyadh",
    "address.hint.street": "Include the building and district.",

    // Step 7 — documents
    "documents.title": "Business documents",
    "documents.description":
      "Upload the documents for your business type. You can add more at any point before you finish.",
    "documents.checklistTitle": "Documents for your business type",
    "documents.picker.label": "Choose files or drag them here",
    "documents.picker.hint": "PDF, JPG or PNG · up to {{size}} MB each",
    "documents.kindLabel": "Document type",
    "documents.remove": "Remove {{name}}",
    "documents.upload": "Upload {{total}} file(s)",
    "documents.uploading": "Uploading…",
    "documents.pendingNudge":
      "{{done}} of {{total}} uploaded. You can continue now and add the rest later.",
    "documents.continueHint": "Upload at least one document to continue.",
    "documents.error.tooLarge": "Each file must be under {{size}} MB",

    // Document kinds
    "documentKind.BUSINESS_REGISTRATION_CERT": "Commercial registration certificate",
    "documentKind.BUSINESS_LICENSE": "Business licence",
    "documentKind.VAT_CERTIFICATE": "VAT certificate",
    "documentKind.OTHER_BUSINESS_DOC": "Other business document",

    // Step 8 — passport
    "passport.title": "Owner's passport",
    "passport.description":
      "Take a photo of the passport photo page. We'll read the details for you to check.",
    "passport.tip.flat": "Lay the passport flat on a dark surface",
    "passport.tip.glare": "Avoid glare and shadows",
    "passport.tip.edges": "Keep all four corners in the frame",
    "passport.picker.label": "Take a photo or choose a file",
    "passport.picker.hint": "JPG or PNG · up to {{size}} MB",
    "passport.previewAlt": "Selected passport photo",
    "passport.replace": "Choose a different photo",
    "passport.submit": "Upload passport",
    "passport.processing": "Reading passport…",
    "passport.processingTitle": "Reading your passport",
    "passport.processingBody":
      "This can take a few minutes. Please keep this page open.",
    "passport.exhausted.title": "We couldn't verify your passport",
    "passport.exhausted.body":
      "Too many attempts didn't work, so this application has been closed. You can start again with a clearer photo.",
    "passport.exhausted.restart": "Start again",

    // Step 8b — confirm passport data
    "passportReview.title": "Check the details we read",
    "passportReview.description":
      "Correct anything that doesn't match your passport exactly.",
    "passportReview.field.givenName": "Given name",
    "passportReview.field.surname": "Surname",
    "passportReview.field.passportNumber": "Passport number",
    "passportReview.field.nationality": "Nationality",
    "passportReview.field.dateOfBirth": "Date of birth",
    "passportReview.field.issueDate": "Date of issue",
    "passportReview.field.expiryDate": "Expiry date",
    "passportReview.field.countryOfOrigin": "Country of origin",
    "passportReview.field.homeAddress": "Home address",
    "passportReview.field.residentialCountry": "Country of residence",
    "passportReview.hint.homeAddress":
      "Where you live personally — not the business address.",
    "passportReview.ownerSectionTitle": "About you, the owner",
    "passportReview.fallbackNote":
      "Anything you leave blank stays as it was read from the passport.",
    "passportReview.submit": "Confirm details",

    // Step 9 — selfie
    "selfie.title": "Take a selfie",
    "selfie.description": "We'll match your selfie against your passport photo.",
    "selfie.descriptionReused":
      "We'll match your selfie against the passport you verified previously.",
    "selfie.tip.light": "Face a window or a bright light",
    "selfie.tip.face": "Look straight at the camera",
    "selfie.tip.accessories": "Remove glasses, hats and face coverings",
    "selfie.picker.label": "Take a selfie or choose a file",
    "selfie.picker.hint": "JPG or PNG · up to {{size}} MB",
    "selfie.previewAlt": "Selected selfie",
    "selfie.retake": "Take another",
    "selfie.submit": "Submit and finish",
    "selfie.processing": "Checking…",
    "selfie.processingTitle": "Checking your selfie",
    "selfie.processingBody":
      "This can take a few minutes. Please keep this page open.",
    "selfie.exhausted.title": "We couldn't match your selfie",
    "selfie.exhausted.body":
      "Too many attempts didn't work, so this application has been closed. You can start again in better light.",

    // Terminal — under review
    "underReview.title": "Your application is with our team",
    "underReview.description":
      "Everything is submitted. We'll email you as soon as a decision is made.",
    "underReview.timeline.submitted.title": "Application submitted",
    "underReview.timeline.submitted.body":
      "We have your business details, documents and identity checks.",
    "underReview.timeline.review.title": "Under review",
    "underReview.timeline.review.body":
      "Our compliance team is checking your documents.",
    "underReview.timeline.decision.title": "Decision",
    "underReview.timeline.decision.body":
      "You'll get an email with the outcome and what happens next.",
    "underReview.businessLabel": "Business",
    "underReview.pepTitle": "One optional step left",
    "underReview.pepBody":
      "Adding a source-of-wealth declaration now can speed up the review.",
    "underReview.pepCta": "Add declaration",

    // Step 10 — PEP / EDD
    "pep.title": "Source of wealth declaration",
    "pep.description":
      "Optional, but it helps our team review your application faster.",
    "pep.field.isPep": "Do you hold, or have you held, a public position?",
    "pep.hint.isPep":
      "For example a government role, a senior political position, or a judicial or military office — including close family members.",
    "pep.field.sourceOfWealth": "Main source of wealth",
    "pep.field.sourceOfFunds": "Source of funds",
    "pep.field.netWorth": "Estimated net worth",
    "pep.field.occupation": "Your occupation",
    "pep.placeholder.occupation": "Managing Director",
    "pep.positionSectionTitle": "About the position",
    "pep.field.position": "Position held",
    "pep.field.governmentBody": "Organisation",
    "pep.field.countryOfInfluence": "Country",
    "pep.field.positionStart": "From",
    "pep.field.positionEnd": "To",
    "pep.relatedPersonsTitle": "Related people",
    "pep.field.personName": "Full name",
    "pep.field.personRelationship": "Relationship",
    "pep.field.personPosition": "Their position",
    "pep.addPerson": "Add a person",
    "pep.removePerson": "Remove this person",
    "pep.field.notes": "Anything else we should know?",
    "pep.submit": "Submit declaration",
    "pep.skip": "Skip for now",
    "pep.saved": "Declaration saved",
    "pep.error.answerRequired": "Please answer the question above",
    "pep.wealth.BUSINESS_INCOME": "Business income",
    "pep.wealth.EMPLOYMENT_INCOME": "Employment income",
    "pep.wealth.INVESTMENTS": "Investments",
    "pep.wealth.INHERITANCE": "Inheritance",
    "pep.wealth.PROPERTY_SALE": "Sale of property",
    "pep.wealth.OTHER": "Other",
    "pep.funds.BUSINESS_REVENUE": "Business revenue",
    "pep.funds.SALARY": "Salary",
    "pep.funds.INVESTMENT_RETURNS": "Investment returns",
    "pep.funds.LOAN": "Loan",
    "pep.funds.SAVINGS": "Savings",
    "pep.funds.OTHER": "Other",
  },

  fr: {
    "common.error.generic": "Une erreur s'est produite. Veuillez réessayer.",
    "common.error.required": "Ce champ est obligatoire",
    "common.sending": "Envoi…",
    "common.verifying": "Vérification…",
    "common.saving": "Enregistrement…",
    "common.loading": "Chargement…",
    "common.cancel": "Annuler",
    "common.continue": "Continuer",
    "common.back": "Retour",
    "common.select": "Sélectionner",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.optional": "Facultatif",

    "shell.language": "Langue",
    "shell.brandAlt": "Sullis",
    "shell.restoring": "Restauration de votre demande…",
    "shell.footer":
      "Vos données sont chiffrées et utilisées uniquement pour vérifier votre entreprise.",

    "stepper.label": "Progression de la demande",
    "stepper.progress": "Étape {{current}} sur {{total}}",
    "stepper.currentSuffix": "étape en cours",
    "phase.contact": "Contact",
    "phase.security": "Sécurité",
    "phase.business": "Entreprise",
    "phase.documents": "Documents",
    "phase.identity": "Identité",

    "start.title": "Enregistrez votre entreprise",
    "start.description":
      "Nous enverrons un code de vérification sur votre mobile. Comptez environ 10 minutes.",
    "start.field.email": "Adresse e-mail",
    "start.field.mobile": "Numéro de mobile",
    "start.field.dialCode": "Indicatif du pays",
    "start.hint.email": "Nous y enverrons un second code de confirmation.",
    "start.hint.mobile": "Utilisez un numéro sur lequel vous pouvez recevoir un SMS maintenant.",
    "start.error.email": "Saisissez une adresse e-mail valide",
    "start.error.mobile": "Saisissez un numéro de mobile valide",
    "start.error.blockedTitle": "Nous ne pouvons pas poursuivre cette demande",
    "start.error.blocked":
      "Cette demande ne peut pas être poursuivie. Veuillez contacter le support.",
    "start.error.alreadyRegistered":
      "Une entreprise est déjà en cours d'examen. Vous pourrez en enregistrer une autre une fois la décision rendue.",
    "start.submit": "Envoyer le code",
    "start.resumeNote":
      "Déjà commencé ? Saisissez les mêmes informations et nous reprendrons où vous en étiez.",

    "otp.title": "Saisissez le code envoyé",
    "otp.description": "Nous avons envoyé un code à 6 chiffres par SMS au {{mobile}}.",
    "otp.field": "Code de vérification SMS",
    "otp.submit": "Vérifier",
    "otp.resend": "Renvoyer le code",
    "otp.resendIn": "Renvoyer dans {{seconds}} s",
    "otp.resent": "Un nouveau code est en route",
    "otp.wrongNumber": "E-mail ou numéro incorrect ?",
    "otp.editTitle": "Modifier vos coordonnées",
    "otp.editDescription":
      "Corrigez vos informations et nous enverrons un nouveau code. Possible uniquement avant la vérification.",
    "otp.editMobileHint": "Incluez l'indicatif, par ex. +966500000000",
    "otp.editSubmit": "Enregistrer et renvoyer",
    "otp.contactUpdated": "Informations mises à jour — un nouveau code arrive",

    "resumePin.title": "Content de vous revoir",
    "resumePin.description": "Saisissez votre code à 6 chiffres pour continuer.",
    "resumePin.noOtpNote":
      "Une demande est déjà en cours : aucun SMS n'a été envoyé cette fois.",
    "resumePin.field": "Code de la demande",
    "resumePin.submit": "Continuer",
    "resumePin.startOver": "Utiliser un autre e-mail ou numéro",

    "emailCode.title": "Confirmez votre e-mail",
    "emailCode.description": "Nous avons envoyé un code à 6 chiffres à {{email}}.",
    "emailCode.field": "Code de vérification e-mail",
    "emailCode.submit": "Confirmer l'e-mail",
    "emailCode.spamHint": "Rien reçu ? Vérifiez vos spams ou promotions.",

    "setPin.title": "Créez votre code",
    "setPin.description":
      "Choisissez un code à 6 chiffres. Il vous permettra de reprendre votre demande plus tard.",
    "setPin.field.pin": "Choisissez un code",
    "setPin.field.confirm": "Confirmez votre code",
    "setPin.error.length": "Votre code doit comporter {{length}} chiffres",
    "setPin.error.mismatch": "Les deux codes doivent être identiques",
    "setPin.rememberNote":
      "Conservez ce code : c'est le seul moyen de revenir à votre demande si vous fermez cette page.",
    "setPin.submit": "Enregistrer et continuer",

    "details.title": "Détails de l'entreprise",
    "details.description": "Parlez-nous de l'entreprise que vous enregistrez.",
    "details.field.country": "Pays d'immatriculation",
    "details.field.businessType": "Forme juridique",
    "details.field.businessName": "Raison sociale",
    "details.field.registrationNumber": "Numéro d'immatriculation",
    "details.field.businessEmail": "E-mail de l'entreprise",
    "details.field.website": "Site web",
    "details.field.description": "Quelle est l'activité de l'entreprise ?",
    "details.placeholder.country": "Choisissez un pays",
    "details.placeholder.businessType": "Choisissez une forme juridique",
    "details.placeholder.selectCountryFirst": "Choisissez d'abord un pays",
    "details.placeholder.businessName": "Al Noor Trading LLC",
    "details.placeholder.description": "Commerce de gros de matériaux de construction",
    "details.hint.registrationNumber":
      "Tel qu'il figure sur votre registre du commerce. Un numéro ne peut être enregistré qu'une fois.",
    "details.hint.businessEmail": "L'adresse de l'entreprise, pas la vôtre.",
    "details.hint.description": "Facultatif — une phrase suffit.",
    "details.requiredDocsTitle": "Documents qui vous seront demandés",
    "details.error.referenceData":
      "Impossible de charger la liste des pays. Veuillez réessayer.",
    "details.error.businessTypes":
      "Impossible de charger les formes juridiques pour ce pays. Veuillez réessayer.",
    "details.error.registrationTaken": "Ce numéro d'immatriculation est déjà enregistré.",

    "address.title": "Adresse de l'entreprise",
    "address.description": "Où l'entreprise est-elle située ?",
    "address.field.street": "Adresse",
    "address.field.city": "Ville",
    "address.field.postalCode": "Code postal",
    "address.placeholder.street": "King Fahd Road, quartier Al Olaya, bâtiment 12",
    "address.placeholder.city": "Riyad",
    "address.hint.street": "Précisez le bâtiment et le quartier.",

    "documents.title": "Documents de l'entreprise",
    "documents.description":
      "Téléversez les documents correspondant à votre forme juridique. Vous pouvez en ajouter d'autres avant de terminer.",
    "documents.checklistTitle": "Documents pour votre forme juridique",
    "documents.picker.label": "Choisissez des fichiers ou déposez-les ici",
    "documents.picker.hint": "PDF, JPG ou PNG · jusqu'à {{size}} Mo par fichier",
    "documents.kindLabel": "Type de document",
    "documents.remove": "Retirer {{name}}",
    "documents.upload": "Téléverser {{total}} fichier(s)",
    "documents.uploading": "Téléversement…",
    "documents.pendingNudge":
      "{{done}} sur {{total}} téléversés. Vous pouvez continuer et ajouter le reste plus tard.",
    "documents.continueHint": "Téléversez au moins un document pour continuer.",
    "documents.error.tooLarge": "Chaque fichier doit faire moins de {{size}} Mo",

    "documentKind.BUSINESS_REGISTRATION_CERT": "Certificat d'immatriculation",
    "documentKind.BUSINESS_LICENSE": "Licence commerciale",
    "documentKind.VAT_CERTIFICATE": "Certificat de TVA",
    "documentKind.OTHER_BUSINESS_DOC": "Autre document d'entreprise",

    "passport.title": "Passeport du propriétaire",
    "passport.description":
      "Photographiez la page photo du passeport. Nous en lirons les informations pour vérification.",
    "passport.tip.flat": "Posez le passeport à plat sur une surface sombre",
    "passport.tip.glare": "Évitez les reflets et les ombres",
    "passport.tip.edges": "Gardez les quatre coins dans le cadre",
    "passport.picker.label": "Prenez une photo ou choisissez un fichier",
    "passport.picker.hint": "JPG ou PNG · jusqu'à {{size}} Mo",
    "passport.previewAlt": "Photo de passeport sélectionnée",
    "passport.replace": "Choisir une autre photo",
    "passport.submit": "Téléverser le passeport",
    "passport.processing": "Lecture du passeport…",
    "passport.processingTitle": "Lecture de votre passeport",
    "passport.processingBody":
      "Cela peut prendre quelques minutes. Gardez cette page ouverte.",
    "passport.exhausted.title": "Nous n'avons pas pu vérifier votre passeport",
    "passport.exhausted.body":
      "Trop de tentatives ont échoué : cette demande a été clôturée. Vous pouvez recommencer avec une photo plus nette.",
    "passport.exhausted.restart": "Recommencer",

    "passportReview.title": "Vérifiez les informations lues",
    "passportReview.description":
      "Corrigez tout ce qui ne correspond pas exactement à votre passeport.",
    "passportReview.field.givenName": "Prénom",
    "passportReview.field.surname": "Nom",
    "passportReview.field.passportNumber": "Numéro de passeport",
    "passportReview.field.nationality": "Nationalité",
    "passportReview.field.dateOfBirth": "Date de naissance",
    "passportReview.field.issueDate": "Date de délivrance",
    "passportReview.field.expiryDate": "Date d'expiration",
    "passportReview.field.countryOfOrigin": "Pays d'origine",
    "passportReview.field.homeAddress": "Adresse personnelle",
    "passportReview.field.residentialCountry": "Pays de résidence",
    "passportReview.hint.homeAddress":
      "Votre domicile personnel — pas l'adresse de l'entreprise.",
    "passportReview.ownerSectionTitle": "À propos de vous, le propriétaire",
    "passportReview.fallbackNote":
      "Tout champ laissé vide conserve la valeur lue sur le passeport.",
    "passportReview.submit": "Confirmer",

    "selfie.title": "Prenez un selfie",
    "selfie.description":
      "Nous comparerons votre selfie à la photo de votre passeport.",
    "selfie.descriptionReused":
      "Nous comparerons votre selfie au passeport que vous avez déjà vérifié.",
    "selfie.tip.light": "Placez-vous face à une fenêtre ou une lumière vive",
    "selfie.tip.face": "Regardez droit vers l'appareil",
    "selfie.tip.accessories": "Retirez lunettes, chapeaux et masques",
    "selfie.picker.label": "Prenez un selfie ou choisissez un fichier",
    "selfie.picker.hint": "JPG ou PNG · jusqu'à {{size}} Mo",
    "selfie.previewAlt": "Selfie sélectionné",
    "selfie.retake": "Reprendre",
    "selfie.submit": "Envoyer et terminer",
    "selfie.processing": "Vérification…",
    "selfie.processingTitle": "Vérification de votre selfie",
    "selfie.processingBody":
      "Cela peut prendre quelques minutes. Gardez cette page ouverte.",
    "selfie.exhausted.title": "Nous n'avons pas pu vérifier votre selfie",
    "selfie.exhausted.body":
      "Trop de tentatives ont échoué : cette demande a été clôturée. Vous pouvez recommencer avec un meilleur éclairage.",

    "underReview.title": "Votre demande est en cours d'examen",
    "underReview.description":
      "Tout est envoyé. Nous vous écrirons dès qu'une décision sera prise.",
    "underReview.timeline.submitted.title": "Demande envoyée",
    "underReview.timeline.submitted.body":
      "Nous avons vos informations, vos documents et vos vérifications d'identité.",
    "underReview.timeline.review.title": "En cours d'examen",
    "underReview.timeline.review.body":
      "Notre équipe conformité vérifie vos documents.",
    "underReview.timeline.decision.title": "Décision",
    "underReview.timeline.decision.body":
      "Vous recevrez un e-mail avec le résultat et les prochaines étapes.",
    "underReview.businessLabel": "Entreprise",
    "underReview.pepTitle": "Une étape facultative",
    "underReview.pepBody":
      "Ajouter une déclaration d'origine des fonds peut accélérer l'examen.",
    "underReview.pepCta": "Ajouter la déclaration",

    "pep.title": "Déclaration d'origine du patrimoine",
    "pep.description":
      "Facultatif, mais cela aide notre équipe à traiter votre demande plus vite.",
    "pep.field.isPep": "Occupez-vous, ou avez-vous occupé, une fonction publique ?",
    "pep.hint.isPep":
      "Par exemple une fonction gouvernementale, politique, judiciaire ou militaire — y compris pour vos proches.",
    "pep.field.sourceOfWealth": "Origine principale du patrimoine",
    "pep.field.sourceOfFunds": "Origine des fonds",
    "pep.field.netWorth": "Patrimoine net estimé",
    "pep.field.occupation": "Votre profession",
    "pep.placeholder.occupation": "Directeur général",
    "pep.positionSectionTitle": "À propos de la fonction",
    "pep.field.position": "Fonction occupée",
    "pep.field.governmentBody": "Organisme",
    "pep.field.countryOfInfluence": "Pays",
    "pep.field.positionStart": "Du",
    "pep.field.positionEnd": "Au",
    "pep.relatedPersonsTitle": "Personnes liées",
    "pep.field.personName": "Nom complet",
    "pep.field.personRelationship": "Lien",
    "pep.field.personPosition": "Sa fonction",
    "pep.addPerson": "Ajouter une personne",
    "pep.removePerson": "Retirer cette personne",
    "pep.field.notes": "Autre chose à nous signaler ?",
    "pep.submit": "Envoyer la déclaration",
    "pep.skip": "Passer pour l'instant",
    "pep.saved": "Déclaration enregistrée",
    "pep.error.answerRequired": "Veuillez répondre à la question ci-dessus",
    "pep.wealth.BUSINESS_INCOME": "Revenus de l'entreprise",
    "pep.wealth.EMPLOYMENT_INCOME": "Revenus d'emploi",
    "pep.wealth.INVESTMENTS": "Investissements",
    "pep.wealth.INHERITANCE": "Héritage",
    "pep.wealth.PROPERTY_SALE": "Vente de biens",
    "pep.wealth.OTHER": "Autre",
    "pep.funds.BUSINESS_REVENUE": "Chiffre d'affaires",
    "pep.funds.SALARY": "Salaire",
    "pep.funds.INVESTMENT_RETURNS": "Rendements d'investissement",
    "pep.funds.LOAN": "Prêt",
    "pep.funds.SAVINGS": "Épargne",
    "pep.funds.OTHER": "Autre",
  },

  ar: {
    "common.error.generic": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    "common.error.required": "هذا الحقل مطلوب",
    "common.sending": "جارٍ الإرسال…",
    "common.verifying": "جارٍ التحقق…",
    "common.saving": "جارٍ الحفظ…",
    "common.loading": "جارٍ التحميل…",
    "common.cancel": "إلغاء",
    "common.continue": "متابعة",
    "common.back": "رجوع",
    "common.select": "اختر",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.optional": "اختياري",

    "shell.language": "اللغة",
    "shell.brandAlt": "سوليس",
    "shell.restoring": "جارٍ استعادة طلبك…",
    "shell.footer": "بياناتك مشفّرة وتُستخدم فقط للتحقق من منشأتك.",

    "stepper.label": "تقدّم الطلب",
    "stepper.progress": "الخطوة {{current}} من {{total}}",
    "stepper.currentSuffix": "الخطوة الحالية",
    "phase.contact": "التواصل",
    "phase.security": "الأمان",
    "phase.business": "المنشأة",
    "phase.documents": "المستندات",
    "phase.identity": "الهوية",

    "start.title": "سجّل منشأتك",
    "start.description":
      "سنرسل رمز تحقق إلى جوالك للبدء. تستغرق العملية نحو ١٠ دقائق.",
    "start.field.email": "البريد الإلكتروني",
    "start.field.mobile": "رقم الجوال",
    "start.field.dialCode": "مفتاح الدولة",
    "start.hint.email": "سنرسل رمز تأكيد منفصلاً إلى هذا البريد.",
    "start.hint.mobile": "استخدم رقماً يمكنك استقبال رسالة نصية عليه الآن.",
    "start.error.email": "أدخل بريداً إلكترونياً صحيحاً",
    "start.error.mobile": "أدخل رقم جوال صحيحاً",
    "start.error.blockedTitle": "لا يمكننا متابعة هذا الطلب",
    "start.error.blocked": "لا يمكن متابعة هذا الطلب. يرجى التواصل مع الدعم.",
    "start.error.alreadyRegistered":
      "لديك منشأة قيد المراجعة بالفعل. يمكنك تسجيل منشأة أخرى بعد صدور القرار.",
    "start.submit": "إرسال رمز التحقق",
    "start.resumeNote":
      "بدأت من قبل؟ أدخل البيانات نفسها وسنكمل من حيث توقفت.",

    "otp.title": "أدخل الرمز الذي أرسلناه",
    "otp.description": "أرسلنا رمزاً من ٦ أرقام عبر رسالة نصية إلى {{mobile}}.",
    "otp.field": "رمز التحقق عبر الرسائل النصية",
    "otp.submit": "تحقق",
    "otp.resend": "إعادة إرسال الرمز",
    "otp.resendIn": "إعادة الإرسال خلال {{seconds}} ثانية",
    "otp.resent": "تم إرسال رمز جديد",
    "otp.wrongNumber": "البريد أو الرقم غير صحيح؟",
    "otp.editTitle": "تغيير بيانات التواصل",
    "otp.editDescription":
      "صحّح بياناتك وسنرسل رمزاً جديداً. هذا ممكن فقط قبل التحقق من الرمز.",
    "otp.editMobileHint": "أضف مفتاح الدولة، مثال ‎+966500000000",
    "otp.editSubmit": "حفظ وإعادة الإرسال",
    "otp.contactUpdated": "تم تحديث البيانات — رمز جديد في الطريق",

    "resumePin.title": "أهلاً بعودتك",
    "resumePin.description": "أدخل رمزك المكوّن من ٦ أرقام لمتابعة طلبك.",
    "resumePin.noOtpNote": "لديك طلب قيد التنفيذ، لذا لم نرسل رسالة نصية هذه المرة.",
    "resumePin.field": "رمز الطلب",
    "resumePin.submit": "متابعة",
    "resumePin.startOver": "استخدام بريد أو رقم مختلف",

    "emailCode.title": "أكّد بريدك الإلكتروني",
    "emailCode.description": "أرسلنا رمزاً من ٦ أرقام إلى {{email}}.",
    "emailCode.field": "رمز التحقق عبر البريد",
    "emailCode.submit": "تأكيد البريد",
    "emailCode.spamHint": "لم تجده؟ تحقق من مجلد الرسائل غير المرغوب فيها.",

    "setPin.title": "أنشئ رمزك السري",
    "setPin.description":
      "اختر رمزاً من ٦ أرقام. ستستخدمه للعودة إلى طلبك لاحقاً.",
    "setPin.field.pin": "اختر رمزاً",
    "setPin.field.confirm": "أكّد الرمز",
    "setPin.error.length": "يجب أن يتكوّن الرمز من {{length}} أرقام",
    "setPin.error.mismatch": "يجب أن يتطابق الرمزان",
    "setPin.rememberNote":
      "احتفظ بهذا الرمز — فهو الطريقة الوحيدة للعودة إلى طلبك إذا أغلقت الصفحة.",
    "setPin.submit": "حفظ الرمز والمتابعة",

    "details.title": "بيانات المنشأة",
    "details.description": "أخبرنا عن المنشأة التي تسجّلها.",
    "details.field.country": "دولة التسجيل",
    "details.field.businessType": "نوع المنشأة",
    "details.field.businessName": "الاسم المسجّل للمنشأة",
    "details.field.registrationNumber": "رقم السجل",
    "details.field.businessEmail": "بريد المنشأة",
    "details.field.website": "الموقع الإلكتروني",
    "details.field.description": "ما نشاط المنشأة؟",
    "details.placeholder.country": "اختر دولة",
    "details.placeholder.businessType": "اختر نوع المنشأة",
    "details.placeholder.selectCountryFirst": "اختر الدولة أولاً",
    "details.placeholder.businessName": "شركة النور للتجارة",
    "details.placeholder.description": "تجارة الجملة في مواد البناء",
    "details.hint.registrationNumber":
      "كما هو في السجل التجاري. يمكن تسجيل الرقم مرة واحدة فقط.",
    "details.hint.businessEmail": "بريد المنشأة وليس بريدك الشخصي.",
    "details.hint.description": "اختياري — جملة واحدة تكفي.",
    "details.requiredDocsTitle": "المستندات المطلوبة منك",
    "details.error.referenceData": "تعذّر تحميل قائمة الدول. يرجى المحاولة مرة أخرى.",
    "details.error.businessTypes":
      "تعذّر تحميل أنواع المنشآت لهذه الدولة. يرجى المحاولة مرة أخرى.",
    "details.error.registrationTaken": "رقم السجل هذا مسجّل بالفعل.",

    "address.title": "عنوان المنشأة",
    "address.description": "أين يقع مقر المنشأة؟",
    "address.field.street": "العنوان",
    "address.field.city": "المدينة",
    "address.field.postalCode": "الرمز البريدي",
    "address.placeholder.street": "طريق الملك فهد، حي العليا، مبنى ١٢",
    "address.placeholder.city": "الرياض",
    "address.hint.street": "اذكر المبنى والحي.",

    "documents.title": "مستندات المنشأة",
    "documents.description":
      "ارفع المستندات المطلوبة لنوع منشأتك. يمكنك إضافة المزيد قبل الإنهاء.",
    "documents.checklistTitle": "المستندات المطلوبة لنوع منشأتك",
    "documents.picker.label": "اختر الملفات أو اسحبها هنا",
    "documents.picker.hint": "PDF أو JPG أو PNG · حتى {{size}} ميجابايت لكل ملف",
    "documents.kindLabel": "نوع المستند",
    "documents.remove": "إزالة {{name}}",
    "documents.upload": "رفع {{total}} ملف/ملفات",
    "documents.uploading": "جارٍ الرفع…",
    "documents.pendingNudge":
      "تم رفع {{done}} من {{total}}. يمكنك المتابعة الآن وإضافة البقية لاحقاً.",
    "documents.continueHint": "ارفع مستنداً واحداً على الأقل للمتابعة.",
    "documents.error.tooLarge": "يجب أن يكون حجم كل ملف أقل من {{size}} ميجابايت",

    "documentKind.BUSINESS_REGISTRATION_CERT": "شهادة السجل التجاري",
    "documentKind.BUSINESS_LICENSE": "الرخصة التجارية",
    "documentKind.VAT_CERTIFICATE": "شهادة ضريبة القيمة المضافة",
    "documentKind.OTHER_BUSINESS_DOC": "مستند آخر للمنشأة",

    "passport.title": "جواز سفر المالك",
    "passport.description":
      "التقط صورة لصفحة الصورة في جواز السفر. سنقرأ البيانات لتتحقق منها.",
    "passport.tip.flat": "ضع الجواز مستوياً على سطح داكن",
    "passport.tip.glare": "تجنّب الانعكاسات والظلال",
    "passport.tip.edges": "أبقِ الأركان الأربعة داخل الإطار",
    "passport.picker.label": "التقط صورة أو اختر ملفاً",
    "passport.picker.hint": "JPG أو PNG · حتى {{size}} ميجابايت",
    "passport.previewAlt": "صورة جواز السفر المختارة",
    "passport.replace": "اختيار صورة أخرى",
    "passport.submit": "رفع جواز السفر",
    "passport.processing": "جارٍ قراءة الجواز…",
    "passport.processingTitle": "جارٍ قراءة جواز سفرك",
    "passport.processingBody": "قد يستغرق ذلك بضع دقائق. أبقِ هذه الصفحة مفتوحة.",
    "passport.exhausted.title": "تعذّر التحقق من جواز سفرك",
    "passport.exhausted.body":
      "فشلت المحاولات عدة مرات، لذا أُغلق هذا الطلب. يمكنك البدء من جديد بصورة أوضح.",
    "passport.exhausted.restart": "البدء من جديد",

    "passportReview.title": "راجع البيانات التي قرأناها",
    "passportReview.description": "صحّح أي بيان لا يطابق جواز سفرك تماماً.",
    "passportReview.field.givenName": "الاسم الأول",
    "passportReview.field.surname": "اسم العائلة",
    "passportReview.field.passportNumber": "رقم الجواز",
    "passportReview.field.nationality": "الجنسية",
    "passportReview.field.dateOfBirth": "تاريخ الميلاد",
    "passportReview.field.issueDate": "تاريخ الإصدار",
    "passportReview.field.expiryDate": "تاريخ الانتهاء",
    "passportReview.field.countryOfOrigin": "بلد المنشأ",
    "passportReview.field.homeAddress": "عنوان السكن",
    "passportReview.field.residentialCountry": "بلد الإقامة",
    "passportReview.hint.homeAddress": "مكان سكنك الشخصي — وليس عنوان المنشأة.",
    "passportReview.ownerSectionTitle": "عنك، بصفتك المالك",
    "passportReview.fallbackNote":
      "أي حقل تتركه فارغاً سيبقى كما قُرئ من جواز السفر.",
    "passportReview.submit": "تأكيد البيانات",

    "selfie.title": "التقط صورة شخصية",
    "selfie.description": "سنطابق صورتك مع صورة جواز سفرك.",
    "selfie.descriptionReused":
      "سنطابق صورتك مع جواز السفر الذي تحققت منه سابقاً.",
    "selfie.tip.light": "اجلس مواجهاً لنافذة أو إضاءة قوية",
    "selfie.tip.face": "انظر مباشرة إلى الكاميرا",
    "selfie.tip.accessories": "أزل النظارات والقبعات وأغطية الوجه",
    "selfie.picker.label": "التقط صورة أو اختر ملفاً",
    "selfie.picker.hint": "JPG أو PNG · حتى {{size}} ميجابايت",
    "selfie.previewAlt": "الصورة الشخصية المختارة",
    "selfie.retake": "التقاط صورة أخرى",
    "selfie.submit": "إرسال وإنهاء",
    "selfie.processing": "جارٍ التحقق…",
    "selfie.processingTitle": "جارٍ التحقق من صورتك",
    "selfie.processingBody": "قد يستغرق ذلك بضع دقائق. أبقِ هذه الصفحة مفتوحة.",
    "selfie.exhausted.title": "تعذّر مطابقة صورتك",
    "selfie.exhausted.body":
      "فشلت المحاولات عدة مرات، لذا أُغلق هذا الطلب. يمكنك البدء من جديد بإضاءة أفضل.",

    "underReview.title": "طلبك لدى فريقنا",
    "underReview.description":
      "تم إرسال كل شيء. سنراسلك عبر البريد فور صدور القرار.",
    "underReview.timeline.submitted.title": "تم إرسال الطلب",
    "underReview.timeline.submitted.body":
      "استلمنا بيانات منشأتك ومستنداتك والتحقق من هويتك.",
    "underReview.timeline.review.title": "قيد المراجعة",
    "underReview.timeline.review.body": "يقوم فريق الالتزام بمراجعة مستنداتك.",
    "underReview.timeline.decision.title": "القرار",
    "underReview.timeline.decision.body":
      "ستصلك رسالة بالنتيجة والخطوات التالية.",
    "underReview.businessLabel": "المنشأة",
    "underReview.pepTitle": "خطوة اختيارية واحدة",
    "underReview.pepBody": "إضافة إقرار مصدر الثروة الآن قد يسرّع المراجعة.",
    "underReview.pepCta": "إضافة الإقرار",

    "pep.title": "إقرار مصدر الثروة",
    "pep.description": "اختياري، لكنه يساعد فريقنا على مراجعة طلبك أسرع.",
    "pep.field.isPep": "هل تشغل، أو سبق أن شغلت، منصباً عاماً؟",
    "pep.hint.isPep":
      "مثل منصب حكومي أو سياسي رفيع أو قضائي أو عسكري — بما في ذلك أفراد الأسرة المقربين.",
    "pep.field.sourceOfWealth": "المصدر الرئيسي للثروة",
    "pep.field.sourceOfFunds": "مصدر الأموال",
    "pep.field.netWorth": "صافي الثروة التقديري",
    "pep.field.occupation": "مهنتك",
    "pep.placeholder.occupation": "العضو المنتدب",
    "pep.positionSectionTitle": "عن المنصب",
    "pep.field.position": "المنصب",
    "pep.field.governmentBody": "الجهة",
    "pep.field.countryOfInfluence": "الدولة",
    "pep.field.positionStart": "من",
    "pep.field.positionEnd": "إلى",
    "pep.relatedPersonsTitle": "الأشخاص ذوو الصلة",
    "pep.field.personName": "الاسم الكامل",
    "pep.field.personRelationship": "صلة القرابة",
    "pep.field.personPosition": "منصبه",
    "pep.addPerson": "إضافة شخص",
    "pep.removePerson": "إزالة هذا الشخص",
    "pep.field.notes": "هل من شيء آخر ينبغي أن نعرفه؟",
    "pep.submit": "إرسال الإقرار",
    "pep.skip": "تخطٍ الآن",
    "pep.saved": "تم حفظ الإقرار",
    "pep.error.answerRequired": "يرجى الإجابة على السؤال أعلاه",
    "pep.wealth.BUSINESS_INCOME": "دخل الأعمال",
    "pep.wealth.EMPLOYMENT_INCOME": "دخل الوظيفة",
    "pep.wealth.INVESTMENTS": "استثمارات",
    "pep.wealth.INHERITANCE": "ميراث",
    "pep.wealth.PROPERTY_SALE": "بيع عقار",
    "pep.wealth.OTHER": "أخرى",
    "pep.funds.BUSINESS_REVENUE": "إيرادات الأعمال",
    "pep.funds.SALARY": "الراتب",
    "pep.funds.INVESTMENT_RETURNS": "عوائد الاستثمار",
    "pep.funds.LOAN": "قرض",
    "pep.funds.SAVINGS": "مدخرات",
    "pep.funds.OTHER": "أخرى",
  },
};

export default businessOnboarding;
