import React, { useState, useCallback, useRef, useEffect } from 'react'
import StepStepper from './components/StepStepper'
import InputForm from './components/InputForm'
import DataCollector from './agents/DataCollector'
import IndustryAnalyst from './agents/IndustryAnalyst'
import CompetitorIntel from './agents/CompetitorIntel'
import TrendAnalyst from './agents/TrendAnalyst'
import MemoryRetrieval from './agents/MemoryRetrieval'
import StrategyGenerator from './agents/StrategyGenerator'
import ScoringAgent from './agents/ScoringAgent'
import HumanReviewStrategy from './agents/HumanReviewStrategy'
import CreativeAgent from './agents/CreativeAgent'
import PlatformAdapter from './agents/PlatformAdapter'
import HumanReviewContent from './agents/HumanReviewContent'
import Scheduler from './agents/Scheduler'
import PerformanceTracker from './agents/PerformanceTracker'
import FeedbackLearning from './agents/FeedbackLearning'
import MemoryStorage from './agents/MemoryStorage'

import {
  runDataCollector,
  runIndustryAnalyst,
  runCompetitorIntel,
  runTrendAnalyst,
  runMemoryRetrieval,
  runStrategyGenerator,
  runScoringAgent,
  runCreativeAgent,
  runPlatformAdapter,
  runScheduler,
  runPerformanceTracker,
  runFeedbackLearning
} from './orchestrator'

import { saveMemory, loadMemory } from './memory'

export default function App() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [processing, setProcessing] = useState(false)
  const [inputData, setInputData] = useState(null)

  // Step outputs
  const [stepOutputs, setStepOutputs] = useState({})
  const mainRef = useRef(null)

  const updateOutput = (step, data) => {
    setStepOutputs(prev => ({ ...prev, [step]: data }))
  }

  const completeStep = (step) => {
    setCompletedSteps(prev => prev.includes(step) ? prev : [...prev, step])
  }

  // Runs async agent processing (now real AI processing)
  const simulateAgent = async (fn, args, step) => {
    setProcessing(true)
    try {
      const result = await fn(args)
      updateOutput(step, result)
      completeStep(step)
      setProcessing(false)
      return result
    } catch (e) {
      console.error(e)
      alert(`AI Agent Failed at Step ${step}:\n${e.message}\n\nPlease check your VITE_GEMINI_API_KEY in .env.local.`)
      setProcessing(false)
      throw e
    }
  }

  const handleStart = useCallback(async (formData) => {
    setStarted(true)
    setInputData(formData)
    setCurrentStep(1)

    if (mainRef.current) mainRef.current.scrollTo(0, 0)

    // Load memory
    const pastMemory = loadMemory(formData.companyName)

    // Step 1: Data Collection
    const step1 = await simulateAgent(runDataCollector, formData, 1)
    setCurrentStep(2)

    // Step 2: Industry Analysis
    const step2 = await simulateAgent(runIndustryAnalyst, formData, 2)
    setCurrentStep(3)

    // Step 3: Competitor Intelligence
    const step3 = await simulateAgent(runCompetitorIntel, formData, 3)
    setCurrentStep(4)

    // Step 4: Trend Analysis
    const step4 = await simulateAgent(runTrendAnalyst, formData, 4)
    setCurrentStep(5)

    // Step 5: Memory Retrieval
    const step5 = await simulateAgent(runMemoryRetrieval, pastMemory, 5)
    setCurrentStep(6)

    // Step 6: Strategy Generation
    const step6 = await simulateAgent(runStrategyGenerator, {
      ...formData,
      competitorData: step3,
      trendData: step4
    }, 6)
    setCurrentStep(7)

    // Step 7: Scoring
    const step7 = await simulateAgent(runScoringAgent, step6.strategies, 7)
    setCurrentStep(8)

    // Step 8: Human Review — PAUSE here, wait for user action
    // The rest continues after human review actions
  }, [])

  // After strategy review approval
  const handleStrategyApproval = useCallback(async (approved) => {
    updateOutput(8, { approved_strategies: approved })
    completeStep(8)
    setCurrentStep(9)

    // Step 9: Creative Generation
    const step9 = await simulateAgent(
      (args) => runCreativeAgent(args.strategies, args.companyName),
      { strategies: approved, companyName: inputData.companyName },
      9
    )
    setCurrentStep(10)

    // Step 10: Platform Adaptation
    const step10 = await simulateAgent(runPlatformAdapter, step9.content, 10)
    setCurrentStep(11)

    // Step 11: Human Review Content — PAUSE
  }, [inputData])

  // After content review approval
  const handleContentApproval = useCallback(async (approved) => {
    updateOutput(11, { approved_content: approved })
    completeStep(11)
    setCurrentStep(12)

    // Step 12: Scheduling
    const step12 = await simulateAgent(runScheduler, inputData, 12)
    setCurrentStep(13)

    // Step 13: Performance Tracker — PAUSE for input
  }, [inputData])

  // After performance metrics submitted
  const handlePerformanceSubmit = useCallback(async (metrics) => {
    setProcessing(true)
    try {
      const result = await runPerformanceTracker(metrics)
      updateOutput(13, result)
      completeStep(13)
      setCurrentStep(14)

      // Step 14: Feedback Learning
      const feedback = await runFeedbackLearning(stepOutputs[7], result)
      updateOutput(14, feedback)
      completeStep(14)
      setCurrentStep(15)

      // Step 15: Memory Storage
      const fullPipeline = {
        step_1_data_collection: stepOutputs[1],
        step_2_industry_analysis: stepOutputs[2],
        step_3_competitor_intel: stepOutputs[3],
        step_4_trend_analysis: stepOutputs[4],
        step_5_memory_retrieval: stepOutputs[5],
        step_6_strategy_generation: stepOutputs[6],
        step_7_scoring: stepOutputs[7],
        step_8_strategy_review: stepOutputs[8],
        step_9_creative_content: stepOutputs[9],
        step_10_platform_adaptation: stepOutputs[10],
        step_11_content_review: stepOutputs[11],
        step_12_scheduling: stepOutputs[12],
        step_13_performance: result,
        step_14_feedback: feedback,
        step_15_memory_storage: { status: 'stored successfully' }
      }

      // Save to localStorage
      saveMemory(inputData.companyName, {
        strategies: stepOutputs[8]?.approved_strategies?.map(s => s.goal) || [],
        content_types: ['Carousel', 'Video', 'Thread'],
        posting_times: stepOutputs[12]?.schedule?.best_times || [],
        failures: feedback?.avoid || [],
        full_pipeline: fullPipeline
      })

      updateOutput(15, { status: 'stored successfully', full_pipeline: fullPipeline })
      completeStep(15)
      setProcessing(false)
    } catch (e) {
      console.error(e)
      alert("Error processing performance limits:\n" + e.message)
      setProcessing(false)
    }
  }, [inputData, stepOutputs])

  const handleStepClick = (step) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step)
    }
  }

  const renderCurrentStep = () => {
    if (processing) {
      return (
        <div className="processing-overlay animate-in">
          <div className="spinner spinner-large" />
          <p style={{ fontWeight: 600 }}>Agent Processing...</p>
          <p>Step {currentStep} — Running analysis</p>
        </div>
      )
    }

    switch (currentStep) {
      case 1: return <DataCollector data={stepOutputs[1]} />
      case 2: return <IndustryAnalyst data={stepOutputs[2]} />
      case 3: return <CompetitorIntel data={stepOutputs[3]} />
      case 4: return <TrendAnalyst data={stepOutputs[4]} />
      case 5: return <MemoryRetrieval data={stepOutputs[5]} />
      case 6: return <StrategyGenerator data={stepOutputs[6]} />
      case 7: return <ScoringAgent data={stepOutputs[7]} />
      case 8:
        return stepOutputs[8] ? (
          <div className="animate-in">
            <div className="step-header">
              <div className="step-tag">Step 8 · Completed</div>
              <h1>Strategy Review Complete</h1>
              <p>{stepOutputs[8].approved_strategies.length} strategies approved.</p>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ color: 'var(--success)', fontWeight: 700 }}>
                  {stepOutputs[8].approved_strategies.length} strategies approved and forwarded to Creative Agent.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <HumanReviewStrategy
            strategies={stepOutputs[6]?.strategies}
            scores={stepOutputs[7]?.strategy_scores}
            onApprove={handleStrategyApproval}
          />
        )
      case 9: return <CreativeAgent data={stepOutputs[9]} />
      case 10: return <PlatformAdapter data={stepOutputs[10]} />
      case 11:
        return stepOutputs[11] ? (
          <div className="animate-in">
            <div className="step-header">
              <div className="step-tag">Step 11 · Completed</div>
              <h1>Content Review Complete</h1>
              <p>{stepOutputs[11].approved_content.length} pieces approved.</p>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ color: 'var(--success)', fontWeight: 700 }}>
                  Content finalized and ready for scheduling.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <HumanReviewContent
            platformData={stepOutputs[10]}
            onApprove={handleContentApproval}
          />
        )
      case 12: return <Scheduler data={stepOutputs[12]} />
      case 13: return <PerformanceTracker data={stepOutputs[13]} onSubmit={handlePerformanceSubmit} />
      case 14: return <FeedbackLearning data={stepOutputs[14]} />
      case 15: return <MemoryStorage data={stepOutputs[15]} fullPipeline={stepOutputs[15]?.full_pipeline} />
      default: return null
    }
  }

  if (!started) {
    return (
      <div className="app-shell">
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">🧠</div>
              <div>
                <h1>Growth Intelligence</h1>
                <p>14-Agent AI System</p>
              </div>
            </div>
          </div>
          <StepStepper currentStep={0} completedSteps={[]} onStepClick={() => {}} />
        </div>
        <div className="main-content">
          <InputForm onSubmit={handleStart} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🧠</div>
            <div>
              <h1>Growth Intelligence</h1>
              <p>{inputData?.companyName || 'Pipeline Active'}</p>
            </div>
          </div>
        </div>
        <StepStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>
      <div className="main-content" ref={mainRef}>
        {renderCurrentStep()}
      </div>
    </div>
  )
}
