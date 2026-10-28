import { planFiles } from './scripts/generators/plan-files.mjs'
import { writeFiles } from './scripts/generators/write-files.mjs'

/** @type {import('plop').NodePlopAPI} */
export default function (plop) {
  // Custom atomic action that delegates to plan-files and write-files
  plop.setActionType('atomicGenerate', (answers, config) => {
    const plan = planFiles({
      type: config.generatorType,
      name: answers.name,
      options: {
        feature: answers.featureName || answers.feature,
        core: answers.location === 'core',
      },
    })
    const result = writeFiles(plan)
    return `Generated ${result.createdFiles.length} file(s) with atomic rollback protection.`
  })

  // Feature generator
  plop.setGenerator('feature', {
    description: 'Create a new feature module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (kebab-case, e.g. "billing-portal"):',
        validate: (value) => {
          if (!value) return 'Feature name is required'
          if (!/^[a-z]+(-[a-z]+)*$/.test(value)) {
            return 'Feature name must be kebab-case (e.g., "my-feature")'
          }
          return true
        },
      },
    ],
    actions: [
      {
        type: 'atomicGenerate',
        generatorType: 'feature',
      },
    ],
  })

  // Page generator
  plop.setGenerator('page', {
    description: 'Create a new page in a feature module',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature name (e.g., "users"):',
        validate: (val) => (val ? true : 'Feature name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Page name (e.g. "Profile" or "Settings"):',
        validate: (val) => (val ? true : 'Page name is required'),
      },
    ],
    actions: [
      {
        type: 'atomicGenerate',
        generatorType: 'page',
      },
    ],
  })

  // Form generator
  plop.setGenerator('form', {
    description: 'Create a Zod-validated form with test and story',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature name (e.g. "billing"):',
        validate: (val) => (val ? true : 'Feature name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Form name (e.g. "Invoice" or "UserProfile"):',
        validate: (val) => (val ? true : 'Form name is required'),
      },
    ],
    actions: [
      {
        type: 'atomicGenerate',
        generatorType: 'form',
      },
    ],
  })

  // Component generator
  plop.setGenerator('component', {
    description: 'Create a new UI component',
    prompts: [
      {
        type: 'list',
        name: 'location',
        message: 'Where should this component be created?',
        choices: [
          { name: 'Core UI (shared across app)', value: 'core' },
          { name: 'Feature component', value: 'feature' },
        ],
      },
      {
        type: 'input',
        name: 'featureName',
        message: 'Feature name:',
        when: (answers) => answers.location === 'feature',
        validate: (value) => (value ? true : 'Feature name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase):',
        validate: (value) => {
          if (!value) return 'Component name is required'
          if (!/^[A-Z][a-zA-Z]*$/.test(value)) {
            return 'Component name must be PascalCase (e.g., "MyComponent")'
          }
          return true
        },
      },
    ],
    actions: [
      {
        type: 'atomicGenerate',
        generatorType: 'component',
      },
    ],
  })

  // Hook generator
  plop.setGenerator('hook', {
    description: 'Create a new custom hook',
    prompts: [
      {
        type: 'list',
        name: 'location',
        message: 'Where should this hook be created?',
        choices: [
          { name: 'Core hook (shared)', value: 'core' },
          { name: 'Feature hook', value: 'feature' },
        ],
      },
      {
        type: 'input',
        name: 'featureName',
        message: 'Feature name:',
        when: (answers) => answers.location === 'feature',
        validate: (value) => (value ? true : 'Feature name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (e.g., "useDebounce" or "Debounce"):',
        validate: (value) => (value ? true : 'Hook name is required'),
      },
    ],
    actions: [
      {
        type: 'atomicGenerate',
        generatorType: 'hook',
      },
    ],
  })
}
