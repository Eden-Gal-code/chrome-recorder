import { Box, Button, Typography } from '@mui/material'
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
          var target = e.target || e.srcElement
          // text = target.textContent || target.innerText
          chrome.storage.sync.get(['elements'], ({ elements }) => {
            console.log('before change', elements)
            chrome.storage.sync.set({ elements: [...elements, target] })
          })

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
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDirection="column"
      height={300}
      width={200}
    >
      <Typography variant="h5">Recorder</Typography>

      {!isRecordingState ? (
        <Button variant="outlined" onClick={handleStartRecordClick}>
          Record
        </Button>
      ) : (
        <Button variant="outlined" onClick={handleStopRecordClick}>
          Stop
        </Button>
      )}
    </Box>
  )
}

render(<Popup />, document.getElementById('react-target'))
