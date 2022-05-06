import { Box, Button, List, ListItem, Typography } from '@mui/material'
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
  const [elementList, setElementList] = useState([])

  useEffect(
    () =>
      chrome.storage.sync.get(
        ['isRecording', 'elements'],
        ({ isRecording, elements }) => {
          setIsRecordingState(isRecording)
          elements && setElementList(elements)
        }
      ),
    []
  )

  const handleStartRecordClick = (e) => {
    setIsRecordingState(true)
    insertFuncToTab(startRecord)
  }
  const handleStopRecordClick = (e) => {
    setIsRecordingState(false)
    setElementList([])
    insertFuncToTab(stopRecord)
  }

  const startRecord = () => {
    function getClickedElements(e) {
      chrome.storage.sync.get('isRecording', ({ isRecording }) => {
        if (!isRecording) {
          this.removeEventListener('click', getClickedElements, false)
        } else {
          e = e || window.event
          var target = e.target || e.srcElement
          text = target.textContent || target.innerText
          chrome.storage.sync.get('elements', ({ elements }) => {
            if (elements instanceof Array) {
              elements.push(text)
            }
            const newElements = elements ? elements : [text]
            chrome.storage.sync.set({ elements: newElements })
          })
        }
      })
    }
    chrome.storage.sync.set({ isRecording: true })
    document.addEventListener('click', getClickedElements, false)
  }

  const stopRecord = () => {
    chrome.storage.sync.set({ isRecording: false, elements: null })
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

      <List>
        {elementList.map((text) => {
          return (
            <ListItem>
              <Typography variant="body1">{text}</Typography>
            </ListItem>
          )
        })}
      </List>
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
