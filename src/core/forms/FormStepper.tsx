import { useState, type ReactNode } from 'react'

import { CheckIcon } from 'lucide-react'

import { cn } from '@/core/ui/utils'

import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

export interface FormStep<TFieldValues extends FieldValues = FieldValues> {
  id: string
  title: string
  description?: string
  fields: readonly FieldPath<TFieldValues>[]
}

export interface UseFormStepperOptions<
  TFieldValues extends FieldValues = FieldValues,
> {
  steps: readonly FormStep<TFieldValues>[]
  form: UseFormReturn<TFieldValues>
  initialStepIndex?: number
  onStepChange?: (fromIndex: number, toIndex: number) => void
  onComplete?: (data: TFieldValues) => void | Promise<void>
}

export function useFormStepper<TFieldValues extends FieldValues = FieldValues>({
  steps,
  form,
  initialStepIndex = 0,
  onStepChange,
  onComplete,
}: UseFormStepperOptions<TFieldValues>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const totalSteps = steps.length
  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalSteps - 1

  const nextStep = async (): Promise<boolean> => {
    // Validate only the fields belonging to the current step
    const currentFields = currentStep.fields as FieldPath<TFieldValues>[]
    const isValid = await form.trigger(currentFields)

    if (!isValid) {
      return false
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex))

    if (isLastStep) {
      if (onComplete) {
        await form.handleSubmit(async (data) => {
          await onComplete(data)
        })()
      }
      return true
    }

    const nextIndex = currentStepIndex + 1
    onStepChange?.(currentStepIndex, nextIndex)
    setCurrentStepIndex(nextIndex)
    return true
  }

  const prevStep = () => {
    if (isFirstStep) return
    const prevIndex = currentStepIndex - 1
    onStepChange?.(currentStepIndex, prevIndex)
    setCurrentStepIndex(prevIndex)
  }

  const goToStep = async (targetIndex: number): Promise<boolean> => {
    if (
      targetIndex < 0 ||
      targetIndex >= totalSteps ||
      targetIndex === currentStepIndex
    ) {
      return false
    }

    // If attempting to jump forward, validate current step first
    if (targetIndex > currentStepIndex) {
      const currentFields = currentStep.fields as FieldPath<TFieldValues>[]
      const isValid = await form.trigger(currentFields)
      if (!isValid) return false
      setCompletedSteps((prev) => new Set(prev).add(currentStepIndex))
    }

    onStepChange?.(currentStepIndex, targetIndex)
    setCurrentStepIndex(targetIndex)
    return true
  }

  return {
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
  }
}

export interface FormStepperProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  steps: readonly FormStep<TFieldValues>[]
  currentStepIndex: number
  completedSteps?: Set<number>
  onStepClick?: (index: number) => void
  className?: string
  children?: ReactNode
}

export function FormStepper<TFieldValues extends FieldValues = FieldValues>({
  steps,
  currentStepIndex,
  completedSteps = new Set(),
  onStepClick,
  className,
  children,
}: FormStepperProps<TFieldValues>) {
  return (
    <div className={cn('space-y-6', className)}>
      <nav aria-label="Form progress">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex
            const isCompleted =
              completedSteps.has(index) || index < currentStepIndex
            const isClickable = Boolean(
              onStepClick && (isCompleted || isCurrent)
            )

            return (
              <li
                key={step.id}
                className={cn(
                  'flex items-center relative',
                  index !== steps.length - 1 ? 'w-full' : 'shrink-0'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={() => isClickable && onStepClick?.(index)}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onStepClick?.(index)
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2.5 group',
                    isClickable && 'cursor-pointer'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isCurrent &&
                        !isCompleted &&
                        'border-2 border-primary text-primary',
                      !isCurrent &&
                        !isCompleted &&
                        'border-2 border-border text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <span
                      className={cn(
                        'text-sm font-medium leading-none',
                        isCurrent && 'text-foreground font-semibold',
                        !isCurrent && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                    {step.description && (
                      <span className="text-xs text-muted-foreground mt-0.5 hidden sm:inline">
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {children}
    </div>
  )
}
