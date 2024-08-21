'use client' // This is because page.js is a client component since 
             // we're using state variables.

import { useState } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I am the Rate My Professor support assistant.  How can I help you?"
    }
  ])

  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    setMessages((messages) => [ // needs to be an array if we're going to use ...
      // previous messages
      ...messages,
      // new message
      { role: "user", content: message},
      { role: "assistant", content: ""}
    ])

    // Reset the message.
    setMessage('')

    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, {role: "user", content: message}])
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }

        const text = decoder.decode(value || new Uint8Array(), {stream: true})

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)

          return [
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text}
          ]
        })

        return reader.read().then(processText)
      })
    })
  }


  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant" ? "primary.main" : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {/** Display the message. */}
                <Typography
                    component="div"
                    style={{ whiteSpace: 'pre-wrap' }}
                >
                    {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
