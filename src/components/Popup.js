import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

const insertFuncToTab = (func) =>
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func,
    })
  })

const Popup = () => {
  const [isRecordingState, setIsRecordingState] = useState(false)

  useEffect(
    () =>
      chrome.storage.sync.get(['isRecording'], ({ isRecording }) => {
        setIsRecordingState(isRecording)
      }),
    []
  )
  
  const handleStartRecordClick = (e) => {
    console.log(isRecordingState)
    setIsRecordingState(true)
    insertFuncToTab(startRecord)
  }
  const handleStopRecordClick = (e) => {
    setIsRecordingState(false)
    insertFuncToTab(stopRecord)
  }

  const startRecord = () => {
    function getClickedElements(e) {
      chrome.storage.sync.get(['isRecording'], ({ isRecording }) => {
        if (!isRecording) {
          this.removeEventListener('click', getClickedElements, false)
        } else {
          e = e || window.event
          var target = e.target || e.srcElement,
            text = target.textContent || target.innerText
          console.log(target)
        }
      })
    }
    chrome.storage.sync.set({ isRecording: true })
    document.addEventListener('click', getClickedElements, false)
  }

  const stopRecord = () => {
    chrome.storage.sync.set({ isRecording: false })
  }

  return (
    <div>
      <h1>Recorder</h1>
      {!isRecordingState ? (
        <button onClick={handleStartRecordClick}>Record</button>
      ) : (
        <button onClick={handleStopRecordClick}>Stop</button>
      )}
    </div>
  )
}

render(<Popup />, document.getElementById('react-target'))
