import { useCallback } from 'react'
import { activities, restaurants } from './config.js'
import { usePersistentState } from './hooks.js'
import AskScreen from './components/AskScreen.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import PickStep from './components/PickStep.jsx'
import SummaryScreen from './components/SummaryScreen.jsx'

export const STORAGE_KEY = 'date-invite.v2'

// The ask screen is deliberately outside this list, so no progress rail shows
// while she is being teased by a growing button.
const STEPS = ['welcome', 'activities', 'restaurants', 'summary']

const INITIAL = {
  step: 'ask',
  saidYes: false,
  noCount: 0,
  activityOrder: [], // names, in the order she ranked them
  restaurantOrder: [],
  note: '',
}

export default function App() {
  const [answers, setAnswers] = usePersistentState(STORAGE_KEY, INITIAL)

  const patch = useCallback(
    (changes) => setAnswers((current) => ({ ...current, ...changes })),
    [setAnswers],
  )

  const goTo = useCallback((step) => patch({ step }), [patch])

  const toggle = useCallback(
    (key, name) =>
      setAnswers((current) => {
        const order = current[key]
        return {
          ...current,
          [key]: order.includes(name)
            ? order.filter((entry) => entry !== name)
            : [...order, name],
        }
      }),
    [setAnswers],
  )

  const move = useCallback(
    (key, name, direction) =>
      setAnswers((current) => {
        const order = [...current[key]]
        const from = order.indexOf(name)
        const to = from + direction
        if (from === -1 || to < 0 || to >= order.length) return current
        order.splice(to, 0, order.splice(from, 1)[0])
        return { ...current, [key]: order }
      }),
    [setAnswers],
  )

  // She only meets the ask screen once. After the yes it never replays, even
  // on a refresh.
  if (!answers.saidYes) {
    return (
      <AskScreen
        presses={answers.noCount}
        onYes={() => patch({ saidYes: true, step: 'welcome' })}
        onNo={() => patch({ noCount: answers.noCount + 1 })}
      />
    )
  }

  const step = STEPS.includes(answers.step) ? answers.step : 'welcome'
  const currentIndex = STEPS.indexOf(step)

  if (step === 'welcome') {
    return (
      <WelcomeScreen
        steps={STEPS}
        currentIndex={currentIndex}
        onStart={() => goTo('activities')}
      />
    )
  }

  if (step === 'activities') {
    return (
      <PickStep
        steps={STEPS}
        currentIndex={currentIndex}
        title="What are we doing?"
        intro="Pick as many as you fancy. The first one you tap becomes number one, and you can reshuffle them after."
        items={activities}
        order={answers.activityOrder}
        onToggle={(name) => toggle('activityOrder', name)}
        onMove={(name, direction) => move('activityOrder', name, direction)}
        onBack={() => goTo('welcome')}
        onContinue={() => goTo('restaurants')}
      />
    )
  }

  if (step === 'restaurants') {
    return (
      <PickStep
        steps={STEPS}
        currentIndex={currentIndex}
        title="Where are we eating?"
        intro="Same again. Rank your favourites and I will work from the top down."
        items={restaurants}
        order={answers.restaurantOrder}
        onToggle={(name) => toggle('restaurantOrder', name)}
        onMove={(name, direction) => move('restaurantOrder', name, direction)}
        onBack={() => goTo('activities')}
        onContinue={() => goTo('summary')}
        continueLabel="See the plan"
      />
    )
  }

  return (
    <SummaryScreen
      steps={STEPS}
      currentIndex={currentIndex}
      answers={answers}
      onNoteChange={(note) => patch({ note })}
      onEdit={goTo}
      onBack={() => goTo('restaurants')}
      // Clears the picks only. Saying yes is not something she has to redo.
      onReset={() =>
        patch({
          activityOrder: [],
          restaurantOrder: [],
          note: '',
          step: 'activities',
        })
      }
    />
  )
}
